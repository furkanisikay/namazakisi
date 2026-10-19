/**
 * Wear OS senkronu — telefon tarafı (issue #269).
 *
 * İKİ YÖN:
 * 1. Telefon → saat: `gonder()` 31 günlük vakitleri + dün/bugün kılınmışlığı +
 *    2 günlük HAZIR muhafız planını (issue #280; saat telefon yokken de
 *    hatırlatsın) Wearable Data Layer'a (`/namazakisi/durum`) yazar. Native modül
 *    `WearSenkron` (`android/app/.../wear/WearSenkronModulu.kt`).
 * 2. Saat → telefon: saat "Kıldım" deyince native `WearDinleyiciServisi` öğeyi
 *    ORTAK "Kıldım" kuyruğuna alır (widget/hızlı ayarlar/kısayolla aynı — issue
 *    #275/#276); kuyruğu `KildimKuyruguServisi` boşaltır.
 *
 * APPLE WATCH (issue #285): iOS'ta AYNI yük, WatchConnectivity köprüsüne
 * (`modules/expo-siri-kisayollari` → `SaatKoprusu`, `updateApplicationContext`) gider —
 * böylece konum yayması, açılış, "Kıldım" sonrası tazeleme ve arka plan görevi iki saat
 * için de TEK yoldan geçer. Fark yalnız içerik payıdır: Apple Watch'a muhafız planı ve
 * Now Bar payı GÖNDERİLMEZ (iPhone bildirimleri saate zaten yansır; saat ikinci bildirim
 * kurarsa çift bildirim olur). Saatten gelen "Kıldım" Siri/widget ile ortak kuyruğa düşer.
 *
 * Store'a BAĞIMLI DEĞİLDİR (arka planda Redux yok): konum ham AsyncStorage'dan,
 * kılınmışlık `LocalNamazServisi`'nden okunur. Saat köprüsü yoksa no-op.
 */
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../../core/utils/Logger';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { koordinatGecerliMi } from '../../core/nafile/gunVakitleri';
import { konumMetniHesapla, type KonumMetniGirdisi } from '../../core/ayarlar/konumMetni';
import { canliGecerliMi, wearYukuOlustur, type WearCanli, type WearYukGirdisi } from '../../core/wear/wearYuku';
import type { VakitAdi } from '../../core/types';
import {
    kayitDegistiDinleyicisiniAyarla,
    kilinanVakitleriAl,
    localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';
import { muhafizMatrisiniCoz } from '../../core/muhafiz/motorAdaptoru';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { muhafizPlaniDinleyicisiniAyarla, type MuhafizPlaniDurumu } from './muhafizPlaniGozlemcisi';
import { canliSaatDinleyicisiniAyarla } from './canliSaatGozlemcisi';
import { saatKoprusu } from '../../../modules/expo-siri-kisayollari/src';
import { LocalSaatAyarlariServisi } from '../../data/local/LocalSaatAyarlariServisi';
import { LocalNafileServisi } from '../../data/local/LocalNafileServisi';
import { saatUyandiriyorMu, type SaatTeslimBaglami } from '../../core/saat/saatAyarlari';
import { wearUyandirmaListesiOlustur, type WearUyandirmaKaydi } from '../../core/wear/wearUyandirma';

interface WearSenkronModulu {
    durumGonder(json: string): Promise<void>;
    /** Camideyim / Namaz modu durumunu saate yeniden yaz (saat W3; yalnız Wear OS, eski ikilide yok). */
    camiDurumunuTazele?(): Promise<void>;
}

const NAMAZ_VAKIT: Partial<Record<string, VakitAdi>> = {
    [NamazAdi.Sabah]: 'imsak',
    [NamazAdi.Ogle]: 'ogle',
    [NamazAdi.Ikindi]: 'ikindi',
    [NamazAdi.Aksam]: 'aksam',
    [NamazAdi.Yatsi]: 'yatsi',
};

/** `wear` = Wear OS (Data Layer), `appleWatch` = Apple Watch (WatchConnectivity). */
type SaatTuru = 'wear' | 'appleWatch';

interface SaatHedefi {
    modul: WearSenkronModulu;
    tur: SaatTuru;
}

const hedef = (): SaatHedefi | null => {
    if (Platform.OS === 'ios') {
        const kopru = saatKoprusu();
        return kopru ? { modul: kopru, tur: 'appleWatch' } : null;
    }
    if (Platform.OS !== 'android') return null;
    const m = (NativeModules.WearSenkron as WearSenkronModulu | undefined) ?? null;
    return m ? { modul: m, tur: 'wear' } : null;
};

export class WearSenkronServisi {
    private static instance: WearSenkronServisi;
    /** Son gönderilen yük — içerik aynıysa Data Layer'a yazılmaz. */
    private sonGonderilen: string | null = null;
    /**
     * Cihazda Wear API yok (native `WEAR_YOK`): süreç boyunca bir daha denenmez.
     * Aksi halde GMS'siz cihazda her işaretleme tanı loguna uyarı yazar ve 500
     * satırlık tamponu gerçek hatalardan boşaltırdı.
     */
    private kullanilamaz = false;
    /** Gönderimler SIRALI: hızlı aç/kapa'da eski yük yenisinin üstüne yazılmasın. */
    private gonderimZinciri: Promise<void> = Promise.resolve();
    /**
     * Telefonun EN SON planladığı muhafız durumu (doğrulanmış matris). Varsa
     * diskten okumaya yeğlenir: ekrandaki değişiklik diske yazılmadan önce de
     * planlanmış olabilir, saat telefonla aynı matrisi görmeli.
     */
    private sonMuhafiz: MuhafizPlaniDurumu | null = null;

    private constructor() { }

    public static getInstance(): WearSenkronServisi {
        if (!WearSenkronServisi.instance) {
            WearSenkronServisi.instance = new WearSenkronServisi();
        }
        return WearSenkronServisi.instance;
    }

    /** Kılınmışlık her değiştiğinde saati tazele (uygulama açılışında bir kez çağrılır). */
    public baslat(): void {
        const h = hedef();
        if (!h) return;
        kayitDegistiDinleyicisiniAyarla(() => {
            this.gonder().catch(() => { /* gonder kendi hatasını loglar */ });
        });
        // Apple Watch'a plan ve Now Bar payı gitmez → o gözlemciler yalnız Wear OS'ta.
        if (h.tur !== 'wear') return;
        // Muhafız planı değişince (ayar ekranı, kılınma, konum) saatin planı da tazelenir.
        muhafizPlaniDinleyicisiniAyarla((durum) => {
            this.sonMuhafiz = durum;
            this.gonder().catch(() => { /* gonder kendi hatasını loglar */ });
        });
        // Now Bar seçimi / canlı sayaç planı değişince (issue #282) saatin canlı sayacı da.
        canliSaatDinleyicisiniAyarla(() => {
            this.gonder().catch(() => { /* gonder kendi hatasını loglar */ });
        });
    }

    public gonder(): Promise<void> {
        const tur = this.gonderimZinciri.then(() => this.gonderTuru());
        this.gonderimZinciri = tur.catch(() => undefined);
        return tur;
    }

    private async gonderTuru(): Promise<void> {
        const h = hedef();
        if (!h || this.kullanilamaz) return;
        const wear = h.tur === 'wear';
        try {
            const konum = await this.konumuOku();
            if (!konum) return;

            const bugun = bugunuAl();
            const dun = gunEkle(bugun, -1);
            const kilinanlar: Record<string, VakitAdi[]> = {};
            const kayit = await localTarihAraligindakiNamazlariGetir(dun, bugun);
            if (kayit.basarili && kayit.veri) {
                for (const gun of kayit.veri) {
                    kilinanlar[gun.tarih] = gun.namazlar
                        .filter((n) => n.tamamlandi)
                        .map((n) => NAMAZ_VAKIT[n.namazAdi])
                        .filter((v): v is VakitAdi => !!v);
                }
            }

            // Saat iş bölümü (saat W3): uyandırma listesi ve anons yeri (yalnız Wear OS).
            const saat = wear ? await LocalSaatAyarlariServisi.teslimBaglaminiOku() : null;
            const muhafiz = wear ? await this.muhafizGirdisiniHazirla(bugun, dun, kilinanlar) : undefined;
            const uyandirma =
                saat && saatUyandiriyorMu(saat)
                    ? await this.uyandirmaListesiniHazirla(konum.koordinat, bugun, muhafiz, saat.uyandirmaDurumlari)
                    : undefined;
            const json = JSON.stringify(
                wearYukuOlustur({
                    koordinat: konum.koordinat,
                    bugunIso: bugun,
                    konumAdi: konum.ad,
                    kilinanlar,
                    // Apple Watch: hatırlatmayı iPhone bildirimi verir (saate yansır) → plan yok.
                    muhafiz,
                    canli: wear ? await this.canliPayiniOku() : undefined,
                    // Kıble yalnız Wear OS saatte; Apple Watch'a konum gitmez (kullanılmayan veri).
                    kibleKonumu: wear,
                    uyandirma,
                    anonsYeri: saat?.anonsYeri,
                })
            );
            // Camideyim/Namaz modu durumu AYRI küçük DataItem'dır (native yazar, içerik
            // aynıysa yazmaz) — ana yükün tekilleştirmesinden ÖNCE: durum yük değişmeden de değişir.
            if (wear) await h.modul.camiDurumunuTazele?.().catch(() => undefined);
            if (json === this.sonGonderilen) return;
            await h.modul.durumGonder(json);
            this.sonGonderilen = json;
        } catch (e) {
            if ((e as { code?: string } | null)?.code === 'WEAR_YOK') {
                this.kullanilamaz = true;
                Logger.info('WearSenkron', 'Bu cihazda Wear OS baglantisi yok; saat senkronu kapali');
                return;
            }
            Logger.warn('WearSenkron', 'Saate durum gonderilemedi', e);
        }
    }

    /**
     * Saatten gelen "Kıldım"lar artık ORTAK kuyruktadır (widget, hızlı ayarlar,
     * kısayol ile birlikte — issue #275/#276); boşaltan tek yer
     * `KildimKuyruguServisi`. Bu metot geriye uyumluluk için oraya devreder.
     */
    public bekleyenleriIsle(): Promise<void> {
        const { KildimKuyruguServisi } = require('./KildimKuyruguServisi') as typeof import('./KildimKuyruguServisi');
        return KildimKuyruguServisi.getInstance().bekleyenleriIsle();
    }

    /**
     * Plan girdisi: muhafız açık mı + matris + kılınmışlık. Kılınmışlık iki
     * kaynağın BİRLEŞİMİdir — telefondaki muhafız `kilinanVakitleriAl`'ı (tek
     * doğru kaynak, AGENTS.md) okur; namaz kaydı ise saatin ✓ gösterimidir.
     * Muhafız ayarı okunamazsa `undefined` → plan boş gider (vakitler yine gider).
     */
    private async muhafizGirdisiniHazirla(
        bugun: string,
        dun: string,
        kayitKilinanlari: Record<string, VakitAdi[]>
    ): Promise<WearYukGirdisi['muhafiz']> {
        const durum = this.sonMuhafiz ?? (await this.muhafizDurumunuOku());
        if (!durum) return undefined;
        const kilinanlar: Record<string, VakitAdi[]> = {};
        for (const tarih of [dun, bugun]) {
            const muhafizKilinan = await kilinanVakitleriAl(tarih).catch(() => [] as VakitAdi[]);
            kilinanlar[tarih] = [...new Set([...(kayitKilinanlari[tarih] ?? []), ...muhafizKilinan])];
        }
        // Özel gün (issue #272): telefon o günün muhafızını planlamaz → saat de planlamaz.
        const ozelGundeMi = await ozelGunSuzgeciniOku();
        return { aktif: durum.aktif, matris: durum.matris, simdiMs: Date.now(), kilinanlar, ozelGundeMi };
    }

    /**
     * Saatin sessiz uyandırma listesi (saat W3, fikir 2) — telefonun kendi üreticilerinden
     * (muhafız imsak alarmı + teheccüd uyandırması), özgün zamanlarla. Okunamazsa boş liste
     * DEĞİL `undefined` (alan gitmez → saat çalmaz, telefon zaten çalar).
     */
    private async uyandirmaListesiniHazirla(
        koordinat: { lat: number; lng: number },
        bugun: string,
        muhafiz: WearYukGirdisi['muhafiz'],
        uyandirmaDurumlari: SaatTeslimBaglami['uyandirmaDurumlari']
    ): Promise<WearUyandirmaKaydi[] | undefined> {
        try {
            const [nafileAyarlari, nafileKilinan] = await Promise.all([
                LocalNafileServisi.getAyarlar(),
                LocalNafileServisi.getKilinanlar(),
            ]);
            return wearUyandirmaListesiOlustur({
                koordinat,
                bugunIso: bugun,
                simdiMs: Date.now(),
                uyandirmaDurumlari,
                muhafiz,
                nafile: {
                    ayarlar: nafileAyarlari,
                    kilindiMi: (iso, tur) => (nafileKilinan[iso] ?? []).includes(tur),
                    ozelGundeMi: muhafiz?.ozelGundeMi,
                },
            });
        } catch (e) {
            Logger.warn('WearSenkron', 'Uyandirma listesi hazirlanamadi', e);
            return undefined;
        }
    }

    /**
     * Ham AsyncStorage'dan muhafız durumu — arka planda Redux yoktur. Matris
     * `muhafizMatrisiniCoz`'dan geçer (göçler + `yogunluk`; AGENTS.md: ham okuyan
     * tüketici yoğunluğu geçmezse slice ile ayrışır).
     */
    private async muhafizDurumunuOku(): Promise<MuhafizPlaniDurumu | null> {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
            if (!ham) return null;
            const a = JSON.parse(ham) as Record<string, unknown> | null;
            if (!a || typeof a !== 'object') return null;
            const esikler = (a.esikler ?? {}) as Partial<Record<'seviye1' | 'seviye2' | 'seviye3' | 'seviye4', number>>;
            const sikliklar = (a.sikliklar ?? {}) as Partial<Record<'seviye1' | 'seviye2' | 'seviye3' | 'seviye4', number>>;
            return {
                aktif: a.aktif === true,
                matris: muhafizMatrisiniCoz({
                    matris: a.matris as Parameters<typeof muhafizMatrisiniCoz>[0]['matris'],
                    yogunluk: a.yogunluk,
                    // `ArkaplanGorevServisi` ile AYNI tarihsel taban.
                    esikler: {
                        seviye1: esikler.seviye1 || 45,
                        seviye2: esikler.seviye2 || 25,
                        seviye3: esikler.seviye3 || 10,
                        seviye4: esikler.seviye4 || 3,
                    },
                    sikliklar: {
                        seviye1: sikliklar.seviye1 || 15,
                        seviye2: sikliklar.seviye2 || 10,
                        seviye3: sikliklar.seviye3 || 5,
                        seviye4: sikliklar.seviye4 || 1,
                    },
                }),
            };
        } catch (e) {
            Logger.warn('WearSenkron', 'Muhafiz ayarlari okunamadi; saat plani bos gidecek', e);
            return null;
        }
    }

    /**
     * Now Bar seçimi (issue #282): `CanliSayacPlanlayici`'nın yazdığı saat payı.
     * Yoksa/bozuksa alan HİÇ gönderilmez → saat eski davranışında kalır.
     */
    private async canliPayiniOku(): Promise<WearCanli | undefined> {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.CANLI_SAAT_VERISI);
            if (!ham) return undefined;
            const veri = JSON.parse(ham) as unknown;
            return canliGecerliMi(veri) ? (veri as WearCanli) : undefined;
        } catch {
            return undefined;
        }
    }

    private async konumuOku(): Promise<{ koordinat: { lat: number; lng: number }; ad: string } | null> {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
        if (!ham) return null;
        const k = JSON.parse(ham) as Partial<KonumMetniGirdisi> & { koordinatlar?: { lat: number; lng: number } };
        if (!koordinatGecerliMi(k.koordinatlar)) return null;
        return {
            koordinat: k.koordinatlar,
            ad: konumMetniHesapla({
                konumModu: k.konumModu === 'manuel' ? 'manuel' : 'oto',
                gpsAdres: k.gpsAdres ?? null,
                seciliIlceAdi: k.seciliIlceAdi ?? '',
                seciliIlAdi: k.seciliIlAdi ?? '',
            }),
        };
    }

    /** Yalnız testler için: modül düzeyi durumu sıfırlar. */
    public __testIcinSifirla(): void {
        this.sonGonderilen = null;
        this.kullanilamaz = false;
        this.sonMuhafiz = null;
        this.gonderimZinciri = Promise.resolve();
    }
}
