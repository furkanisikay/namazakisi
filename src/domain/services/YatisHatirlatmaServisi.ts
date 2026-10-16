/**
 * Yatış saatine göre yatsı hatırlatması + gün sonu muhasebesi (issue #290).
 *
 * Plan SAF üreticiden gelir (`core/yatis/yatisPlani.ts`); bildirim defteri
 * (issue #298) aynı listeyi sayar. Pencere sonludur (Android 7 / iOS 3 namaz
 * günü) → TAZELENMEK ZORUNDA. Çağıranlar:
 *   - `yatisHatirlatmaSlice` ayar thunk'ı
 *   - `App.tsx` açılış zinciri
 *   - `KonumDegisikligiServisi.konumDegistiUygula` (vakitler şehirle kayar; özel
 *     gün değişimi de `OzelGunDegisikligiServisi` üzerinden buradan geçer)
 *   - `ArkaplanGorevServisi` 15 dk görevi (muhafız erken dönüşlerinden ÖNCE)
 *   - yedekten geri yükleme (`yedeklemeSlice`)
 *   - KILINMIŞLIK değişince (`baslat` → `LocalNamazServisi` adlı yuva `yatis`):
 *     içerik "Bugün 4/5 · öğle işaretlenmemiş" kayıttan üretilir, kayıt
 *     değişince bayatlar. Yuva `index.ts`'te de kurulur (headless "Kıldım").
 *
 * STORE'A BAĞLI DEĞİLDİR (arka planda Redux yok). Koordinat verilmezse ham
 * konum kaydından okunur.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BILDIRIM_SABITLERI, DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { bugunuAl, dunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import type { VakitAdi } from '../../core/types';
import { defteriOku } from '../../data/local/LocalKazaServisi';
import { otomatikDurumu } from '../../core/kaza/kazaDefteriHesabi';
import {
    YATIS_PLAN_GUN_SAYISI,
    yatisKimligiMi,
    yatisPlaniOlustur,
    type OtomatikKazaBilgisi,
    type YatisAyarlari,
    type YatisPlanKaydi,
} from '../../core/yatis/yatisPlani';
import { bildirimKategorileriniGarantile } from './bildirimKategorileri';
import { LocalYatisHatirlatmaServisi } from '../../data/local/LocalYatisHatirlatmaServisi';
import {
    kayitDegistiDinleyicisiEkle,
    kilinanVakitleriAl,
    localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface YatisKoordinat {
    lat: number;
    lng: number;
}

const DINLEYICI_ADI = 'yatis';

const NAMAZDAN_VAKTE: Partial<Record<string, VakitAdi>> = {
    [NamazAdi.Sabah]: 'imsak',
    [NamazAdi.Ogle]: 'ogle',
    [NamazAdi.Ikindi]: 'ikindi',
    [NamazAdi.Aksam]: 'aksam',
    [NamazAdi.Yatsi]: 'yatsi',
};

const koordinatGecerli = (k: YatisKoordinat | null | undefined): k is YatisKoordinat =>
    !!k && Number.isFinite(k.lat) && Number.isFinite(k.lng) && !(k.lat === 0 && k.lng === 0);

/** Platforma göre plan ufku. */
export const yatisPlanGunSayisi = (): number =>
    Platform.OS === 'ios' ? YATIS_PLAN_GUN_SAYISI.ios : YATIS_PLAN_GUN_SAYISI.android;

export class YatisHatirlatmaServisi {
    private static instance: YatisHatirlatmaServisi;
    /** Süren planlama — turlar SIRAYA dizilir (cuma servisiyle aynı gerekçe). */
    private surenPlanlama: Promise<void> | null = null;

    public static getInstance(): YatisHatirlatmaServisi {
        if (!YatisHatirlatmaServisi.instance) {
            YatisHatirlatmaServisi.instance = new YatisHatirlatmaServisi();
        }
        return YatisHatirlatmaServisi.instance;
    }

    /**
     * Kılınmışlık değişince yeniden planla (idempotent — adlı yuva). Her JS
     * bağlamında (headless dahil) çağrılmalı: bildirimden "Kıldım" uygulama
     * kapalıyken işlenince muhasebenin içeriği de tazelenmeli.
     */
    public baslat(): void {
        kayitDegistiDinleyicisiEkle(DINLEYICI_ADI, () => {
            this.hatirlatmalariGuncelle().catch(() => undefined);
        });
    }

    /**
     * Planı yeniler. ASLA fırlatmaz.
     * @param koordinat Verilmezse ham konum kaydından okunur.
     * @param ayarlar Verilmezse diskten okunur.
     */
    public async hatirlatmalariGuncelle(
        koordinat?: YatisKoordinat | null,
        ayarlar?: YatisAyarlari,
        simdi: Date = new Date()
    ): Promise<void> {
        const onceki = this.surenPlanlama ?? Promise.resolve();
        const bu = onceki
            .catch(() => { /* onceki turun hatasi bu turu dusurmez */ })
            .then(() => this.planlamayiCalistir(koordinat, ayarlar, simdi));
        this.surenPlanlama = bu;
        try {
            await bu;
        } catch (e) {
            Logger.error('YatisHatirlatma', 'Planlama basarisiz', e);
        } finally {
            if (this.surenPlanlama === bu) this.surenPlanlama = null;
        }
    }

    private async planlamayiCalistir(
        verilenKoordinat: YatisKoordinat | null | undefined,
        verilenAyarlar: YatisAyarlari | undefined,
        simdi: Date
    ): Promise<void> {
        const ayarlar = verilenAyarlar ?? (await LocalYatisHatirlatmaServisi.getAyarlar());
        if (!ayarlar.aktif) {
            await this.mevcutlariTemizle();
            return;
        }
        const koordinat = verilenKoordinat === undefined ? await this.koordinatOku() : verilenKoordinat;
        // Konum geçici olarak okunamazsa KURULU planı koru (cuma deseni):
        // silip yerine hiçbir şey koymamak, bayat plandan kötüdür.
        if (!koordinatGecerli(koordinat)) {
            Logger.warn('YatisHatirlatma', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        const gunSayisi = yatisPlanGunSayisi();
        const [kilinanlar, ozelGundeMi, otomatikKaza] = await Promise.all([
            this.kilinanlariOku(gunSayisi),
            ozelGunSuzgeciniOku(),
            this.otomatikKazaOku(),
        ]);
        const plan = yatisPlaniOlustur({
            koordinat,
            ayarlar,
            simdi,
            gunSayisi,
            kilinanlar: (gun) => kilinanlar[gun] ?? [],
            gunAtlanirMi: ozelGundeMi,
            otomatikKaza,
        });

        await this.mevcutlariTemizle();
        for (const kayit of plan) {
            await this.planla(kayit);
        }
    }

    /**
     * Kaza Defteri 2.0: otomatik ekleme açık mı? (Muhasebe metnine ileriye dönük
     * satır.) Defter okunamazsa satır EKLENMEZ — "eklenecek" sözü verilmez.
     */
    private async otomatikKazaOku(): Promise<OtomatikKazaBilgisi | null> {
        try {
            const { hareketler } = await defteriOku();
            const durum = otomatikDurumu(hareketler);
            return durum.aktif && durum.baslangic
                ? { baslangic: durum.baslangic, kayitsizSor: durum.kayitsiz === 'sor' }
                : null;
        } catch {
            return null;
        }
    }

    /**
     * Namaz günü → kılınmış vakitler. Kayıt (namaz_gun_*) ∪ muhafız kılınmışlığı
     * (Wear deseni). Pencere: dün (gece yarısı sonrası) .. son plan günü.
     */
    private async kilinanlariOku(gunSayisi: number): Promise<Record<string, VakitAdi[]>> {
        const sonuc: Record<string, VakitAdi[]> = {};
        const bugun = bugunuAl();
        const dun = dunuAl();
        try {
            const yanit = await localTarihAraligindakiNamazlariGetir(dun, gunEkle(bugun, gunSayisi + 1));
            for (const gun of yanit.veri ?? []) {
                sonuc[gun.tarih] = gun.namazlar
                    .filter((n) => n.tamamlandi)
                    .map((n) => NAMAZDAN_VAKTE[n.namazAdi])
                    .filter((v): v is VakitAdi => !!v);
            }
        } catch (e) {
            Logger.warn('YatisHatirlatma', 'Namaz kayitlari okunamadi', e);
        }
        for (const tarih of [dun, bugun]) {
            const muhafiz = await kilinanVakitleriAl(tarih).catch(() => [] as VakitAdi[]);
            sonuc[tarih] = [...new Set([...(sonuc[tarih] ?? []), ...muhafiz])];
        }
        return sonuc;
    }

    private async planla(kayit: YatisPlanKaydi): Promise<void> {
        // Muhasebe "Kıldım / Kazaya ekle" düğmeleri kategoriye bağlı; muhafız
        // kapalıyken kategori kaydını başka kimse garanti etmez.
        await bildirimKategorileriniGarantile();
        try {
            await Notifications.scheduleNotificationAsync({
                identifier: kayit.kimlik,
                content: {
                    title: kayit.baslik,
                    body: kayit.govde,
                    sound: true,
                    categoryIdentifier: kayit.kategori,
                    data: kayit.data,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: kayit.zaman,
                    // Yatsı hatırlatması muhafızın taban kanalından (yüksek önem,
                    // heads-up); muhasebe sakin vakit kanalından. Yeni kanal AÇILMAZ.
                    channelId:
                        kayit.tur === 'yatsi'
                            ? BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ
                            : BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                },
            });
        } catch (e) {
            // Tek günün planlaması patlarsa KALANLAR yine kurulmalı.
            Logger.error('YatisHatirlatma', `Bildirim planlanamadi: ${kayit.kimlik}`, e);
        }
    }

    private async mevcutlariTemizle(): Promise<void> {
        try {
            const tumu = await Notifications.getAllScheduledNotificationsAsync();
            for (const b of tumu) {
                if (yatisKimligiMi(b.identifier)) {
                    await Notifications.cancelScheduledNotificationAsync(b.identifier);
                }
            }
        } catch (e) {
            Logger.error('YatisHatirlatma', 'Temizlik hatasi', e);
        }
    }

    private async koordinatOku(): Promise<YatisKoordinat | null> {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
            if (!ham) return null;
            const k = JSON.parse(ham) as { koordinatlar?: YatisKoordinat };
            return koordinatGecerli(k?.koordinatlar) ? k.koordinatlar : null;
        } catch {
            return null;
        }
    }

    /** Yalnız testler için. */
    public __testIcinSifirla(): void {
        this.surenPlanlama = null;
    }
}
