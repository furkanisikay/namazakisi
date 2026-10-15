/**
 * Takvim çakışması uyarısı (issue #291) — cuma/yatış/camiye-git desenleri.
 *
 * Plan SAF üreticiden gelir (`core/bildirim/takvimCakismaPlani.ts`); bildirim
 * defteri (issue #298) aynı listeyi sayar. Pencere sonludur (Android 7 / iOS 3
 * gün) ve takvim dışarıdan değişir → TAZELENMEK ZORUNDA. Çağıranlar:
 *   - `takvimCakismaSlice` ayar thunk'ı
 *   - `App.tsx` açılış zinciri
 *   - `KonumDegisikligiServisi.konumDegistiUygula` (vakitler şehirle kayar; özel
 *     gün değişimi de `OzelGunDegisikligiServisi` üzerinden buradan geçer)
 *   - `ArkaplanGorevServisi` 15 dk görevi (muhafız erken dönüşlerinden ÖNCE) —
 *     takvime sonradan eklenen toplantıyı yakalayan asıl yol budur
 *   - yedekten geri yükleme (`yedeklemeSlice`)
 *   - KILINMIŞLIK: `baslat` → `LocalNamazServisi` adlı yuva `takvimCakisma`;
 *     kılınan vaktin uyarısı TAKVİM OKUMADAN iptal edilir (kimlik tarih+vakitten).
 *
 * STORE'A BAĞLI DEĞİLDİR (arka planda Redux yok). Koordinat verilmezse ham
 * konum kaydından okunur. İzin burada İSTENMEZ: yoksa kurulu plan TEMİZLENİR
 * (kullanıcı izni geri aldıysa takvimden türeyen bildirim de kalmamalı).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BILDIRIM_SABITLERI, DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { bugunuAl, dunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import type { VakitAdi } from '../../core/types';
import {
    CAKISMA_VAKITLERI,
    TAKVIM_CAKISMA_PLAN_GUN_SAYISI,
    takvimCakismaKimligi,
    takvimCakismaKimligiMi,
    takvimCakismaMetniOlustur,
    takvimCakismaPlaniOlustur,
    type TakvimCakismaPlanKaydi,
} from '../../core/bildirim/takvimCakismaPlani';
import type { TakvimCakismaAyarlari } from '../../core/takvimCakisma/takvimCakismaAyarlari';
import { LocalTakvimCakismaServisi } from '../../data/local/LocalTakvimCakismaServisi';
import {
    kayitDegistiDinleyicisiEkle,
    kilinanVakitleriAl,
    localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { cakismaEtkinlikleriniOku, okumaAraligi } from './TakvimEtkinlikOkuyucu';

export interface TakvimCakismaKoordinat {
    lat: number;
    lng: number;
}

const DINLEYICI_ADI = 'takvimCakisma';

const NAMAZDAN_VAKTE: Partial<Record<string, VakitAdi>> = {
    [NamazAdi.Sabah]: 'imsak',
    [NamazAdi.Ogle]: 'ogle',
    [NamazAdi.Ikindi]: 'ikindi',
    [NamazAdi.Aksam]: 'aksam',
    [NamazAdi.Yatsi]: 'yatsi',
};

const koordinatGecerli = (k: TakvimCakismaKoordinat | null | undefined): k is TakvimCakismaKoordinat =>
    !!k && Number.isFinite(k.lat) && Number.isFinite(k.lng) && !(k.lat === 0 && k.lng === 0);

/** Platforma göre plan ufku. */
export const takvimCakismaPlanGunSayisi = (): number =>
    Platform.OS === 'ios' ? TAKVIM_CAKISMA_PLAN_GUN_SAYISI.ios : TAKVIM_CAKISMA_PLAN_GUN_SAYISI.android;

/**
 * Dün ve bugünün kılınmış vakitleri: namaz kaydı ∪ muhafız kılınmışlığı
 * (yatış hatırlatmasıyla aynı birleşim). Daha ilerisi henüz kılınmış olamaz.
 */
export async function yakinKilinanlariOku(): Promise<Record<string, VakitAdi[]>> {
    const bugun = bugunuAl();
    const dun = dunuAl();
    const sonuc: Record<string, VakitAdi[]> = {};
    try {
        const yanit = await localTarihAraligindakiNamazlariGetir(dun, gunEkle(bugun, 1));
        for (const gun of yanit.veri ?? []) {
            sonuc[gun.tarih] = gun.namazlar
                .filter((n) => n.tamamlandi)
                .map((n) => NAMAZDAN_VAKTE[n.namazAdi])
                .filter((v): v is VakitAdi => !!v);
        }
    } catch (e) {
        Logger.warn('TakvimCakisma', 'Namaz kayitlari okunamadi', e);
    }
    for (const tarih of [dun, bugun]) {
        const muhafiz = await kilinanVakitleriAl(tarih).catch(() => [] as VakitAdi[]);
        sonuc[tarih] = [...new Set([...(sonuc[tarih] ?? []), ...muhafiz])];
    }
    return sonuc;
}

export class TakvimCakismaServisi {
    private static instance: TakvimCakismaServisi;
    /** Süren planlama — turlar SIRAYA dizilir (cuma servisiyle aynı gerekçe). */
    private surenPlanlama: Promise<void> | null = null;

    public static getInstance(): TakvimCakismaServisi {
        if (!TakvimCakismaServisi.instance) {
            TakvimCakismaServisi.instance = new TakvimCakismaServisi();
        }
        return TakvimCakismaServisi.instance;
    }

    /**
     * Kılınmışlık değişince o vaktin uyarısını iptal et (idempotent — adlı yuva).
     * Takvim OKUNMAZ: kimlik tarih + vakitten kurulur, iş ucuzdur.
     */
    public baslat(): void {
        kayitDegistiDinleyicisiEkle(DINLEYICI_ADI, () => {
            this.kilinanlarinUyarilariniIptalEt().catch(() => undefined);
        });
    }

    /**
     * Planı yeniler. ASLA fırlatmaz.
     * @param koordinat Verilmezse ham konum kaydından okunur.
     */
    public async hatirlatmalariGuncelle(
        koordinat?: TakvimCakismaKoordinat | null,
        simdi: Date = new Date()
    ): Promise<void> {
        const onceki = this.surenPlanlama ?? Promise.resolve();
        const bu = onceki
            .catch(() => { /* onceki turun hatasi bu turu dusurmez */ })
            .then(() => this.planlamayiCalistir(koordinat, simdi));
        this.surenPlanlama = bu;
        try {
            await bu;
        } catch (e) {
            Logger.error('TakvimCakisma', 'Planlama basarisiz', e);
        } finally {
            if (this.surenPlanlama === bu) this.surenPlanlama = null;
        }
    }

    private async planlamayiCalistir(
        verilenKoordinat: TakvimCakismaKoordinat | null | undefined,
        simdi: Date
    ): Promise<void> {
        const ayarlar = await LocalTakvimCakismaServisi.getAyarlar();
        if (!ayarlar.aktif) {
            await this.mevcutlariTemizle();
            return;
        }
        const koordinat = verilenKoordinat === undefined ? await this.koordinatOku() : verilenKoordinat;
        // Konum geçici olarak okunamazsa KURULU planı koru (cuma deseni).
        if (!koordinatGecerli(koordinat)) {
            Logger.warn('TakvimCakisma', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        const gunSayisi = takvimCakismaPlanGunSayisi();
        const { baslangic, bitis } = okumaAraligi(simdi, gunSayisi);
        const okuma = await cakismaEtkinlikleriniOku(baslangic, bitis);
        if (okuma.durum === 'izinYok') {
            // İzin geri alındı: takvimden türemiş eski uyarılar da gitmeli.
            Logger.warn('TakvimCakisma', 'Takvim izni yok, plan temizlendi');
            await this.mevcutlariTemizle();
            return;
        }
        if (okuma.durum === 'hata') {
            Logger.warn('TakvimCakisma', 'Takvim okunamadi, mevcut plan korunuyor');
            return;
        }

        const [kilinanlar, ozelGundeMi] = await Promise.all([yakinKilinanlariOku(), ozelGunSuzgeciniOku()]);
        const plan = takvimCakismaPlaniOlustur({
            koordinat,
            ayarlar,
            simdi,
            gunSayisi,
            etkinlikler: okuma.etkinlikler,
            kilinanlar: (gun) => kilinanlar[gun] ?? [],
            gunAtlanirMi: ozelGundeMi,
        });

        await this.mevcutlariTemizle();
        for (const kayit of plan) {
            await this.planla(kayit, ayarlar);
        }
    }

    private async planla(kayit: TakvimCakismaPlanKaydi, ayarlar: TakvimCakismaAyarlari): Promise<void> {
        const { baslik, govde } = takvimCakismaMetniOlustur(kayit, ayarlar);
        try {
            await Notifications.scheduleNotificationAsync({
                identifier: kayit.id,
                content: {
                    title: baslik,
                    body: govde,
                    sound: true,
                    // Etkinlik adı veriye YAZILMAZ (yalnız ayar açıksa metinde görünür).
                    data: { tip: 'takvim_cakisma', vakit: kayit.vakit, tarih: kayit.tarih },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: kayit.zaman,
                    // Yeni kanal AÇILMAZ — vakit bildirimi kanalı.
                    channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                },
            });
        } catch (e) {
            // Tek uyarı patlarsa KALANLAR yine kurulmalı.
            Logger.error('TakvimCakisma', `Bildirim planlanamadi: ${kayit.id}`, e);
        }
    }

    /** Dün/bugün kılınmış vakitlerin bekleyen ve gösterilen uyarılarını kaldırır. */
    public async kilinanlarinUyarilariniIptalEt(): Promise<void> {
        const kilinanlar = await yakinKilinanlariOku();
        for (const [tarih, vakitler] of Object.entries(kilinanlar)) {
            for (const vakit of CAKISMA_VAKITLERI) {
                if (!vakitler.includes(vakit)) continue;
                const kimlik = takvimCakismaKimligi(tarih, vakit);
                try {
                    await Notifications.cancelScheduledNotificationAsync(kimlik);
                } catch {
                    // Bekleyen yoksa sorun değil.
                }
                try {
                    await Notifications.dismissNotificationAsync(kimlik);
                } catch {
                    // Gösterilmemişse sorun değil.
                }
            }
        }
    }

    private async mevcutlariTemizle(): Promise<void> {
        try {
            const tumu = await Notifications.getAllScheduledNotificationsAsync();
            for (const b of tumu) {
                if (takvimCakismaKimligiMi(b.identifier)) {
                    await Notifications.cancelScheduledNotificationAsync(b.identifier);
                }
            }
        } catch (e) {
            Logger.error('TakvimCakisma', 'Temizlik hatasi', e);
        }
    }

    private async koordinatOku(): Promise<TakvimCakismaKoordinat | null> {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
            if (!ham) return null;
            const k = JSON.parse(ham) as { koordinatlar?: TakvimCakismaKoordinat };
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
