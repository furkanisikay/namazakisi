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
                wearYukuOlustur({ koordinat: konum.koordinat, bugunIso: bugun, konumAdi: konum.ad, kilinanlar })
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
        this.gonderimZinciri = Promise.resolve();
    }
}
