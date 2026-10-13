/**
 * Ortak "Kıldım" kuyruğu — JS tarafı (issue #269 → #275/#276).
 *
 * Uygulama DIŞINDAN gelen işaretlemeler (Wear OS saati, ana ekran widget'ı, hızlı
 * ayarlar kutusu, "Şu anki vakti kıldım" kısayolu, öne çıkarılmış sayaç ve — issue
 * #299'dan beri — muhafız bildirimindeki "Kıldım") native `KildimKuyrugu`'na
 * (SharedPreferences, kalıcı) düşer. `bekleyenleriIsle()` kuyruğu boşaltır ve her
 * öğeyi bildirimdeki "Kıldım" ile AYNI gövdeden işler
 * (`BildirimServisi.kuyruktanKildimIsle` → `kildimAksiyonunuIsle`).
 *
 * Kuyruğu boşaltan ÜÇ yol vardır, doğruluk hiçbirine tek başına bağlı değildir:
 * headless görev (`index.ts > KildimKuyrugu`), uygulama ön plana gelince
 * (`App.tsx` AppState + canlı olay) ve 15 dk'lık arka plan görevi.
 *
 * Ayrıca `namazakisi://kildim` derin bağlantısını (iOS dahil) işler:
 * `simdikiVaktiKildim()` — vakit kararı widget/kutu ile AYNI sözleşmeden
 * (`aktifVakitBul` ↔ Kotlin `VakitCizelgesi`).
 *
 * Store'a BAĞIMLI DEĞİLDİR (arka planda Redux yok).
 */
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../../core/utils/Logger';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { koordinatGecerliMi } from '../../core/nafile/gunVakitleri';
import {
    aktifVakitBul,
    widgetKoduNamazAdina,
    widgetKoduVakitAdina,
    widgetVerisiOlustur,
} from '../../core/widget/widgetYuku';
import { localNamazlariGetir } from '../../data/local/LocalNamazServisi';

/** Native taraf uygulama AÇIKKEN kuyruğa öğe düşünce bu olayı yayar (`KildimKuyrugu.OLAY_ADI`). */
export const KILDIM_KUYRUGU_OLAYI = 'KildimKuyruguGeldi';

/** Headless görev adı — `KildimGorevServisi.kt` ile AYNI olmalı. */
export const KILDIM_KUYRUGU_GOREVI = 'KildimKuyrugu';

interface KildimKuyruguModulu {
    bekleyenleriAl(): Promise<string>;
    tamamlandi(id: string): Promise<void>;
    basarisiz(id: string): Promise<void>;
}

interface KuyrukOgesi {
    id: string;
    tarih: string;
    vakit: string;
    kaynak?: string;
}

export type SimdikiVakitSonucu =
    | { tur: 'isaretlendi'; vakitAdi: string }
    | { tur: 'zatenKilindi'; vakitAdi: string }
    | { tur: 'vakitYok'; siradakiAdi: string | null; girisMs: number | null }
    | { tur: 'konumYok' }
    /** Onay beklerken vakit değişti: yanlış vakit işaretlenmez. */
    | { tur: 'vakitDegisti' };

/** İşaretlenebilecek vakit — onay alınmadan HİÇBİR ŞEY yazılmaz. */
export interface KildimAdayi {
    tur: 'aday';
    /** Görünen ad (`NamazAdi`, ör. "Öğle"). */
    vakitAdi: string;
    /** Kayıt/kuyruk vakit kodu (`imsak`, `ogle`…). */
    kayitVakti: string;
    /** Namaz günü (ISO). */
    tarih: string;
}

export type SimdikiVakitDegerlendirmesi =
    | Exclude<SimdikiVakitSonucu, { tur: 'isaretlendi' } | { tur: 'vakitDegisti' }>
    | KildimAdayi;

const modul = (): KildimKuyruguModulu | null => {
    if (Platform.OS !== 'android') return null;
    return (NativeModules.KildimKuyrugu as KildimKuyruguModulu | undefined) ?? null;
};

export class KildimKuyruguServisi {
    private static instance: KildimKuyruguServisi;
    private surenIsleme: Promise<void> | null = null;

    private constructor() { }

    public static getInstance(): KildimKuyruguServisi {
        if (!KildimKuyruguServisi.instance) {
            KildimKuyruguServisi.instance = new KildimKuyruguServisi();
        }
        return KildimKuyruguServisi.instance;
    }

    /**
     * Kuyruğu boşaltır. Eşzamanlı çağrılar aynı turu paylaşır (headless + ön plan
     * olayı aynı anda gelebilir → çift işleme yok).
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
            Logger.warn('KildimKuyrugu', 'Kildim kuyrugu okunamadi', e);
            return;
        }
        if (ogeler.length === 0) return;

        // Tembel yükleme: BildirimServisi native köprü grafiğini çeker (konumSlice deseni).
        const { BildirimServisi } = require('./BildirimServisi') as typeof import('./BildirimServisi');
        for (const oge of ogeler) {
            try {
                await BildirimServisi.getInstance().kuyruktanKildimIsle(oge.vakit, oge.tarih);
                await m.tamamlandi(oge.id);
                Logger.info('KildimKuyrugu', `Isaretlendi: ${oge.id} (${oge.kaynak ?? 'wear'})`);
            } catch (e) {
                // Öğe kuyrukta KALIR; native deneme sayacı zehirli öğeyi (5 deneme) düşürür.
                Logger.warn('KildimKuyrugu', `Kildim islenemedi: ${oge.id}`, e);
                await m.basarisiz(oge.id).catch(() => undefined);
            }
        }
        // Headless bağlamda kılınmışlık dinleyicileri kurulmamış olabilir (App.tsx
        // açılmadı) → widget ve saat burada AÇIKÇA tazelenir.
        const { WidgetServisi } = require('./WidgetServisi') as typeof import('./WidgetServisi');
        const { WearSenkronServisi } = require('./WearSenkronServisi') as typeof import('./WearSenkronServisi');
        await Promise.allSettled([
            WidgetServisi.getInstance().kilinanlariYaz(),
            WearSenkronServisi.getInstance().gonder(),
        ]);
    }

    /**
     * İçinde bulunulan vakti kılındı olarak işaretler. Yalnız İŞARETLER (geri alma
     * uygulamada); güneş→öğle arasında hiçbir şey yapmaz. Onay gerektiren yollar
     * (`namazakisi://kildim` — dışarıdan gelebilir) bunu DEĞİL
     * `simdikiVaktiDegerlendir` + `adayiIsaretle` çiftini kullanır.
     */
    public async simdikiVaktiKildim(simdiMs: number = Date.now()): Promise<SimdikiVakitSonucu> {
        const d = await this.simdikiVaktiDegerlendir(simdiMs);
        return d.tur === 'aday' ? this.adayiIsaretle(d, simdiMs) : d;
    }

    /**
     * Onay alındıktan sonra adayı işaretler — önce YENİDEN değerlendirir: onay
     * penceresi açıkken vakit değişmiş ya da namaz başka yoldan işaretlenmiş olabilir.
     */
    public async adayiIsaretle(aday: KildimAdayi, simdiMs: number = Date.now()): Promise<SimdikiVakitSonucu> {
        const simdi = await this.simdikiVaktiDegerlendir(simdiMs);
        if (simdi.tur !== 'aday') return simdi;
        if (simdi.tarih !== aday.tarih || simdi.kayitVakti !== aday.kayitVakti) return { tur: 'vakitDegisti' };
        const { BildirimServisi } = require('./BildirimServisi') as typeof import('./BildirimServisi');
        await BildirimServisi.getInstance().kuyruktanKildimIsle(simdi.kayitVakti, simdi.tarih);
        return { tur: 'isaretlendi', vakitAdi: simdi.vakitAdi };
    }

    /** Şu anki vakit işaretlenebilir mi? HİÇBİR ŞEY yazmaz (onay penceresi için). */
    public async simdikiVaktiDegerlendir(simdiMs: number = Date.now()): Promise<SimdikiVakitDegerlendirmesi> {
        const koordinat = await this.koordinatOku();
        if (!koordinat) return { tur: 'konumYok' };
        const veri = widgetVerisiOlustur(koordinat, bugunuAl());
        const durum = aktifVakitBul(veri.vakitler, simdiMs);
        const aktif = durum.aktif;
        const vakitAdi = aktif ? widgetKoduVakitAdina(aktif.vakit) : null;
        const namazAdi = aktif ? widgetKoduNamazAdina(aktif.vakit) : null;
        if (!aktif || !vakitAdi || !namazAdi) {
            const s = durum.sonraki;
            return {
                tur: 'vakitYok',
                siradakiAdi: s ? widgetKoduNamazAdina(s.vakit) : null,
                girisMs: s?.ms ?? null,
            };
        }
        const gun = await localNamazlariGetir(aktif.tarih);
        if (gun.basarili && gun.veri?.namazlar.some((n) => n.namazAdi === namazAdi && n.tamamlandi)) {
            return { tur: 'zatenKilindi', vakitAdi: namazAdi };
        }
        return { tur: 'aday', vakitAdi: namazAdi, kayitVakti: vakitAdi, tarih: aktif.tarih };
    }

    private async koordinatOku(): Promise<{ lat: number; lng: number } | null> {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
            if (!ham) return null;
            const k = JSON.parse(ham) as { koordinatlar?: { lat: number; lng: number } };
            return koordinatGecerliMi(k.koordinatlar) ? k.koordinatlar : null;
        } catch {
            return null;
        }
    }

    /** Yalnız testler için. */
    public __testIcinSifirla(): void {
        this.surenIsleme = null;
    }
}
