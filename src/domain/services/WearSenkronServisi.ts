/**
 * Wear OS senkronu — telefon tarafı (issue #269).
 *
 * İKİ YÖN:
 * 1. Telefon → saat: `gonder()` 31 günlük vakitleri + dün/bugün kılınmışlığı +
 *    2 günlük HAZIR muhafız planını (issue #280; saat telefon yokken de
 *    hatırlatsın) Wearable Data Layer'a (`/namazakisi/durum`) yazar. Native modül
 *    `WearSenkron` (`android/app/.../wear/WearSenkronModulu.kt`).
 * 2. Saat → telefon: saat "Kıldım" deyince native `WearDinleyiciServisi` öğeyi
 *    SharedPreferences KUYRUĞUNA alır. `bekleyenleriIsle()` kuyruğu boşaltır ve
 *    her öğeyi bildirimdeki "Kıldım" ile AYNI yoldan işler
 *    (`BildirimServisi.saattenKildimIsle`).
 *
 * Kuyruğu boşaltan ÜÇ yol vardır ve doğruluk hiçbirine tek başına bağlı değildir:
 * headless görev (`index.ts > WearKildim`), uygulama ön plana gelince
 * (`App.tsx` AppState + canlı olay) ve 15 dk'lık arka plan görevi.
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
import { wearYukuOlustur, type WearYukGirdisi } from '../../core/wear/wearYuku';
import type { VakitAdi } from '../../core/types';
import {
    kayitDegistiDinleyicisiniAyarla,
    kilinanVakitleriAl,
    localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';
import { muhafizMatrisiniCoz } from '../../core/muhafiz/motorAdaptoru';
import { muhafizPlaniDinleyicisiniAyarla, type MuhafizPlaniDurumu } from './muhafizPlaniGozlemcisi';

/** Native taraf uygulama AÇIKKEN kuyruğa öğe düşünce bu olayı yayar. */
export const WEAR_KILDIM_OLAYI = 'WearKildimGeldi';

/** Headless görev adı — `WearKildimGorevServisi.kt` ile AYNI olmalı. */
export const WEAR_KILDIM_GOREVI = 'WearKildim';

interface WearSenkronModulu {
    durumGonder(json: string): Promise<void>;
    bekleyenleriAl(): Promise<string>;
    tamamlandi(id: string): Promise<void>;
    basarisiz(id: string): Promise<void>;
}

interface KuyrukOgesi {
    id: string;
    tarih: string;
    vakit: string;
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
    private surenIsleme: Promise<void> | null = null;
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
     * Saatten gelen "Kıldım" kuyruğunu boşaltır. Eşzamanlı çağrılar aynı turu
     * paylaşır (headless + ön plan olayı aynı anda gelebilir → çift işleme yok).
     */
    public bekleyenleriIsle(): Promise<void> {
        if (!modul()) return Promise.resolve();
        if (!this.surenIsleme) {
            this.surenIsleme = this.isle().finally(() => {
                this.surenIsleme = null;
            });
        }
        return this.surenIsleme;
    }

    private async isle(): Promise<void> {
        const m = modul();
        if (!m) return;
        let ogeler: KuyrukOgesi[] = [];
        try {
            const ham = JSON.parse(await m.bekleyenleriAl());
            ogeler = Array.isArray(ham) ? ham : [];
        } catch (e) {
            Logger.warn('WearSenkron', 'Saat kuyrugu okunamadi', e);
            return;
        }
        if (ogeler.length === 0) return;

        // Tembel yükleme: BildirimServisi native köprü grafiğini çeker; bu servisi
        // tüketen her test onu mock'lamak zorunda kalmasın (konumSlice deseni).
        const { BildirimServisi } = require('./BildirimServisi') as typeof import('./BildirimServisi');
        for (const oge of ogeler) {
            try {
                await BildirimServisi.getInstance().saattenKildimIsle(oge.vakit, oge.tarih);
                await m.tamamlandi(oge.id);
            } catch (e) {
                // Öğe kuyrukta KALIR; native deneme sayacı zehirli öğeyi (5 deneme) düşürür.
                Logger.warn('WearSenkron', `Saat kildim islenemedi: ${oge.id}`, e);
                await m.basarisiz(oge.id).catch(() => undefined);
            }
        }
        await this.gonder();
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
        return { aktif: durum.aktif, matris: durum.matris, simdiMs: Date.now(), kilinanlar };
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
        this.surenIsleme = null;
        this.kullanilamaz = false;
        this.sonMuhafiz = null;
        this.gonderimZinciri = Promise.resolve();
    }
}
