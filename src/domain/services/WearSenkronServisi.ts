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
 * Store'a BAĞIMLI DEĞİLDİR (arka planda Redux yok): konum ham AsyncStorage'dan,
 * kılınmışlık `LocalNamazServisi`'nden okunur. Android dışında / modül yoksa no-op.
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
import { bekleyenErtelemeleriOku, ertelemeDinleyicisiEkle } from './muhafizErtelemeDurumu';

interface WearSenkronModulu {
    durumGonder(json: string): Promise<void>;
}

const NAMAZ_VAKIT: Partial<Record<string, VakitAdi>> = {
    [NamazAdi.Sabah]: 'imsak',
    [NamazAdi.Ogle]: 'ogle',
    [NamazAdi.Ikindi]: 'ikindi',
    [NamazAdi.Aksam]: 'aksam',
    [NamazAdi.Yatsi]: 'yatsi',
};

const modul = (): WearSenkronModulu | null => {
    if (Platform.OS !== 'android') return null;
    return (NativeModules.WearSenkron as WearSenkronModulu | undefined) ?? null;
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
        if (!modul()) return;
        kayitDegistiDinleyicisiniAyarla(() => {
            this.gonder().catch(() => { /* gonder kendi hatasını loglar */ });
        });
        // Muhafız planı değişince (ayar ekranı, kılınma, konum) saatin planı da tazelenir.
        muhafizPlaniDinleyicisiniAyarla((durum) => {
            this.sonMuhafiz = durum;
            this.gonder().catch(() => { /* gonder kendi hatasını loglar */ });
        });
        // Now Bar seçimi / canlı sayaç planı değişince (issue #282) saatin canlı sayacı da.
        canliSaatDinleyicisiniAyarla(() => {
            this.gonder().catch(() => { /* gonder kendi hatasını loglar */ });
        });
        // Muhafız "Ertele" (issue #289): ertelenen aralık bilekte de sussun.
        ertelemeDinleyicisiEkle('wear', () => {
            this.gonder().catch(() => { /* gonder kendi hatasını loglar */ });
        });
    }

    public gonder(): Promise<void> {
        const tur = this.gonderimZinciri.then(() => this.gonderTuru());
        this.gonderimZinciri = tur.catch(() => undefined);
        return tur;
    }

    private async gonderTuru(): Promise<void> {
        const m = modul();
        if (!m || this.kullanilamaz) return;
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

            const json = JSON.stringify(
                wearYukuOlustur({
                    koordinat: konum.koordinat,
                    bugunIso: bugun,
                    konumAdi: konum.ad,
                    kilinanlar,
                    muhafiz: await this.muhafizGirdisiniHazirla(bugun, dun, kilinanlar),
                    canli: await this.canliPayiniOku(),
                })
            );
            if (json === this.sonGonderilen) return;
            await m.durumGonder(json);
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
        // Ertele (issue #289): kaynak bekleyen bildirimlerdeki kopya — telefonun arka
        // planı ve ön planıyla AYNI. Okunamazsa boş (plan süzülmeden gider).
        const ertelemeler = durum.aktif ? await bekleyenErtelemeleriOku() : {};
        return { aktif: durum.aktif, matris: durum.matris, simdiMs: Date.now(), kilinanlar, ozelGundeMi, ertelemeler };
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
