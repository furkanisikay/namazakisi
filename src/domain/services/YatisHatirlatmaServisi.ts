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
import { ANDROID_YATIS_PAYI, IOS_ALARMKIT_YATIS_PAYI } from '../../core/bildirim/butceSabitleri';
import { VAKIT_ADLARI } from '../../core/utils/muhafizMetinYardimcisi';
import { bildirimKategorileriniGarantile } from './bildirimKategorileri';
import type { MuhafizTeslimcisi } from './MuhafizTeslimcisi';
import { sahipliYanKanallariIptalEt } from './MuhafizAlarmKoprusu';
import { NATIVE_SAHIP } from '../../core/muhafiz/teslimSahipligi';
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

/**
 * YATIŞ TESLİMCİSİ — muhafızla AYNI teslim katmanı, AYRI örnek (plan §3.2, §4.1). Kanal
 * uzayı, titreşim, sesli anons (Android TTS alarmı / iOS anons klibi), gerçek alarm ve ses
 * seçimi AYNI koddan gelir. SAHİPLİK `{ tur: 'yatis' }`: yatış/muhasebe kimlikleri
 * muhafızın `muhafiz_` uzayındadır (native "Kıldım" o önekle hepsini kapsar) → önek
 * yetmez; önceki turun anons/alarmları native `sahipliIptalEt('yatis')` ile silinir, muhafız
 * turu da yatışınkileri plan kimliği seçicisiyle KORUR.
 * - Android: kanal hazırlığı KİMLİK (çöp toplama muhafızın işi; `ekHatirlatmaKaynaklari`
 *   korur), pay `ANDROID_YATIS_PAYI` (asıl kesme üreticide).
 * - iOS: bütçe ölçümü "yatış dışı" bekleyenleri sayar, anons sesi matrissiz hazırlanır,
 *   AlarmKit payı `IOS_ALARMKIT_YATIS_PAYI`.
 *
 * Seçim ENJEKTE EDİLEBİLİR (jest varsayılan platformu iOS'tur — AGENTS.md).
 */
let _teslimci: MuhafizTeslimcisi | null = null;

export function yatisTeslimcisiniAl(): MuhafizTeslimcisi {
    if (_teslimci) return _teslimci;
    if (Platform.OS === 'ios') {
        const { IosMuhafizTeslimcisi } =
            require('./IosMuhafizTeslimcisi') as typeof import('./IosMuhafizTeslimcisi');
        _teslimci = new IosMuhafizTeslimcisi({
            sahiplik: { tur: 'yatis' },
            matrissizAnons: true,
            alarmDestegi: true,
            alarmKitPayi: IOS_ALARMKIT_YATIS_PAYI,
        });
    } else {
        const { AndroidMuhafizTeslimcisi } =
            require('./AndroidMuhafizTeslimcisi') as typeof import('./AndroidMuhafizTeslimcisi');
        _teslimci = new AndroidMuhafizTeslimcisi({
            alarmButcesi: ANDROID_YATIS_PAYI,
            kanalHazirligi: async (m) => m,
            sahiplik: { tur: 'yatis' },
            // Gerçek alarm STANDART yetenek; alarm KANALLARINI muhafız toplar.
            alarmDestegi: true,
            alarmKanalTemizligi: false,
        });
    }
    return _teslimci;
}

/** Test / özel senaryo: teslimciyi ayarla (`null` → platformdan yeniden türet). */
export function yatisTeslimcisiniAyarla(teslimci: MuhafizTeslimcisi | null): void {
    _teslimci = teslimci;
}

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
        const okunan = verilenAyarlar ?? (await LocalYatisHatirlatmaServisi.getAyarlar());
        // Özel sesler DOĞRULANIR (Android; cuma ile aynı gerekçe — id paritesi).
        const ayarlar = await this.sesleriDogrula(okunan);
        const teslimci = yatisTeslimcisiniAl();
        if (!ayarlar.aktif) {
            await this.mevcutlariTemizle(teslimci);
            // Bekleyen GERÇEK ALARMLAR expo listesinde yoktur: teslimcinin hazırlığı önceki
            // turunkileri YATIŞ sahipliğiyle siler (muhafızınkilere dokunmaz).
            try {
                await teslimci.hazirla();
            } finally {
                await teslimci.tamamla?.();
            }
            return;
        }
        const koordinat = verilenKoordinat === undefined ? await this.koordinatOku() : verilenKoordinat;
        // Konum geçici olarak okunamazsa KURULU planı koru (cuma deseni):
        // silip yerine hiçbir şey koymamak, bayat plandan kötüdür.
        if (!koordinatGecerli(koordinat)) {
            Logger.warn('YatisHatirlatma', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        // Muhasebe "Kıldım / Kazaya ekle" düğmeleri kategoriye bağlı; muhafız kapalıyken
        // kategori kaydını başka kimse garanti etmez (plan §4.5 — teslimciye geçince KORUNUR).
        await bildirimKategorileriniGarantile();

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
            ...(Platform.OS === 'android' ? { alarmButcesi: ANDROID_YATIS_PAYI } : {}),
        });

        // Kanallar planlamadan ÖNCE (Android 8+ var olmayan kanala gideni göstermez).
        await this.kanallariHazirla(ayarlar);
        await this.mevcutlariTemizle(teslimci);
        try {
            await teslimci.hazirla();
            // KRONOLOJİK sıra: iOS bütçesi sayaçla keser, ters sıra yakın uyarıları atardı.
            for (const kayit of plan) {
                await this.planla(teslimci, kayit);
            }
        } finally {
            await teslimci.tamamla?.();
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

    /** Tek bildirimi teslimciye verir. Biri patlarsa KALANLAR yine kurulur. */
    private async planla(teslimci: MuhafizTeslimcisi, kayit: YatisPlanKaydi): Promise<void> {
        const vakit = kayit.data.vakit ?? 'yatsi';
        try {
            await teslimci.uyariPlanla({
                id: kayit.kimlik,
                baslik: kayit.baslik,
                mesaj: kayit.govde,
                zaman: kayit.zaman,
                // `anonsMetni` ÇÖZÜLMÜŞ cümledir (yer tutucu içermez).
                uyari: kayit.uyari,
                vakit,
                muhafizVakti: vakit,
                tarih: kayit.gun,
                yon: 'cikisaDogru',
                // Pencere sonu = namaz gününün sonu: gerçek alarm geç tetiklenirse çalmaz.
                cikis: kayit.cikis,
                ozel: {
                    // Yatış/muhasebe yükü — "Kıldım"/"Kazaya ekle" bunu okur (tarihsel biçim).
                    veri: kayit.data,
                    // Kategori yüzeyin KENDİSİNDEN (Kıldım / Kazaya ekle / İnceleyin).
                    kategori: kayit.kategori,
                    // Göçten gelen (varsayılan ses, titreşimsiz) adım bugünkü kanalda kalır:
                    // yatsı muhafızın taban kanalı (heads-up), muhasebe sakin vakit kanalı.
                    varsayilanKanalId:
                        kayit.tur === 'yatsi'
                            ? BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ
                            : BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                    varsayilanSistemSesi: true,
                    alarmAdi: kayit.tur === 'muhasebeCoklu' ? 'Gün sonu' : VAKIT_ADLARI[vakit],
                    // Yatsı / tek eksik: VAKİT alarmı ("Kıldım" o farzı işaretler — native kimlikten
                    // çözer); çoklu muhasebe vakte bağlı değildir → BİLGİ (yalnız "Kapat").
                    alarmTuru: kayit.tur === 'muhasebeCoklu' ? 'bilgi' : 'vakit',
                },
            });
        } catch (e) {
            // Tek günün planlaması patlarsa KALANLAR yine kurulmalı.
            Logger.error('YatisHatirlatma', `Bildirim planlanamadi: ${kayit.kimlik}`, e);
        }
    }

    /** `MuhafizKanalServisi.adimSesleriniDogrula` — tembel (köprü grafiği testlere sızmasın). */
    private async sesleriDogrula(ayarlar: YatisAyarlari): Promise<YatisAyarlari> {
        if (Platform.OS !== 'android') return ayarlar;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            return await MuhafizKanalServisi.adimSesleriniDogrula(ayarlar);
        } catch (e) {
            Logger.error('YatisHatirlatma', 'Sesler dogrulanamadi', e);
            return ayarlar;
        }
    }

    /** Ortak muhafız kanal uzayındaki kanalları oluşturur (çöp toplamaz). */
    private async kanallariHazirla(ayarlar: YatisAyarlari): Promise<void> {
        if (Platform.OS !== 'android') return;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            await MuhafizKanalServisi.ekKanallariHazirla([{ yon: 'cikisaDogru', seviyeler: ayarlar.adimlar }]);
        } catch (e) {
            Logger.error('YatisHatirlatma', 'Kanallar hazirlanamadi', e);
        }
    }

    /**
     * Bekleyen yatış bildirimleri (yalnız `yatisKimligiMi`) + Android sesli anons alarmları
     * (yatış SAHİPLİĞİYLE — muhafızın `muhafiz_` uzayındaki plan anonslarına dokunmaz).
     */
    private async mevcutlariTemizle(teslimci: MuhafizTeslimcisi): Promise<void> {
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
        await this.anonslariIptalEt(teslimci);
    }

    /**
     * Önceki turun sesli anons alarmları — yatış SAHİPLİĞİYLE ve BEKLENEREK (Android): ateşle-
     * unut iptal ayrı köprü kuyruğunda yeni kurulan anonslarla yarışıp onları silebilirdi.
     * Köprü yoksa (eski ikili / test) teslimcinin yoluna düşülür; o yol yatışta önek
     * kullanmaz (önek muhafızın anonslarını da silerdi).
     */
    private async anonslariIptalEt(teslimci: MuhafizTeslimcisi): Promise<void> {
        if (Platform.OS !== 'android') return;
        try {
            if (await sahipliYanKanallariIptalEt(NATIVE_SAHIP.YATIS, { anons: true, alarm: false })) return;
            teslimci.tumYanKanallariIptalEt();
        } catch (e) {
            Logger.error('YatisHatirlatma', 'Anons temizligi hatasi', e);
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
