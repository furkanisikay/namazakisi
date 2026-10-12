/**
 * Wear OS senkronu — telefon tarafı (issue #269).
 *
 * İKİ YÖN:
 * 1. Telefon → saat: `gonder()` 8 günlük vakitleri + dün/bugün kılınmışlığı
 *    Wearable Data Layer'a (`/namazakisi/durum`) yazar. Native modül
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
import { wearYukuOlustur } from '../../core/wear/wearYuku';
import type { VakitAdi } from '../../core/types';
import {
    kayitDegistiDinleyicisiniAyarla,
    localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';

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
    private surenIsleme: Promise<void> | null = null;

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
    }

    public async gonder(): Promise<void> {
        const m = modul();
        if (!m) return;
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
                wearYukuOlustur({ koordinat: konum.koordinat, bugunIso: bugun, konumAdi: konum.ad, kilinanlar })
            );
            if (json === this.sonGonderilen) return;
            await m.durumGonder(json);
            this.sonGonderilen = json;
        } catch (e) {
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
    }
}
