/**
 * "Kıldım" güven listesi — native köprü sarmalayıcısı (issue #299).
 *
 * Kararlar native SharedPreferences'tadır (`kildim/KildimGuvenDeposu.kt`); kısayol
 * etkinliği uygulamayı açmadan okur. Bu servis Ayarlar sayfası ve `namazakisi://kildim`
 * derin bağlantısı içindir. Yalnız Android: iOS'ta başlatan uygulama bilinemez
 * (`BILINMEYEN_BASLATAN` → her seferinde tek seferlik onay) ve liste boştur.
 *
 * Hiçbir yöntem fırlatmaz: köprü yoksa/hata verirse güvenli varsayılan döner.
 */
import { NativeModules, Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import {
    BILINMEYEN_BASLATAN,
    baglantiKarariniCoz,
    guvenListesiniCoz,
    type KildimBaglantiKarari,
    type KildimGuvenKaydi,
    type KildimGuvenKarari,
} from '../../core/kildim/kildimGuven';

interface KildimGuvenModulu {
    listeAl(): Promise<string>;
    kararDegistir(paket: string, karar: KildimGuvenKarari): Promise<boolean>;
    kaldir(paket: string): Promise<void>;
    derinBaglantiKarari(): Promise<string>;
    soruyuYanitla(paket: string, karar: KildimGuvenKarari): Promise<boolean>;
}

const modul = (): KildimGuvenModulu | null => {
    if (Platform.OS !== 'android') return null;
    return (NativeModules.KildimGuven as KildimGuvenModulu | undefined) ?? null;
};

export const KildimGuvenServisi = {
    /** Güven listesi yönetilebilir mi (Ayarlar satırı yalnız o zaman görünür)? */
    kullanilabilirMi(): boolean {
        return modul() != null;
    },

    async listeAl(): Promise<KildimGuvenKaydi[]> {
        const m = modul();
        if (!m) return [];
        try {
            return guvenListesiniCoz(await m.listeAl());
        } catch (e) {
            Logger.warn('KildimGuven', 'Guven listesi okunamadi', e);
            return [];
        }
    },

    async kararDegistir(paket: string, karar: KildimGuvenKarari): Promise<boolean> {
        const m = modul();
        if (!m) return false;
        try {
            return (await m.kararDegistir(paket, karar)) === true;
        } catch (e) {
            Logger.warn('KildimGuven', 'Karar degistirilemedi', e);
            return false;
        }
    },

    async kaldir(paket: string): Promise<boolean> {
        const m = modul();
        if (!m) return false;
        try {
            await m.kaldir(paket);
            return true;
        } catch (e) {
            Logger.warn('KildimGuven', 'Kayit kaldirilamadi', e);
            return false;
        }
    },

    /**
     * Son `namazakisi://kildim` bağlantısının başlatanı ve ne yapılacağı. Native kaydı
     * TÜKETİR (aynı kimlik ikinci bir bağlantıya verilmez). Köprü yoksa kimliksiz soru.
     */
    async derinBaglantiKarari(): Promise<KildimBaglantiKarari> {
        const m = modul();
        if (!m) return BILINMEYEN_BASLATAN;
        try {
            return baglantiKarariniCoz(await m.derinBaglantiKarari());
        } catch (e) {
            Logger.warn('KildimGuven', 'Baglanti karari alinamadi', e);
            return BILINMEYEN_BASLATAN;
        }
    },

    /**
     * Soru penceresindeki kalıcı karar. Native yalnız SON sorulan başlatan için ve
     * kurallar izin veriyorsa yazar (tarayıcıya/kimliksize kalıcı izin yok).
     */
    async soruyuYanitla(paket: string, karar: KildimGuvenKarari): Promise<boolean> {
        const m = modul();
        if (!m) return false;
        try {
            return (await m.soruyuYanitla(paket, karar)) === true;
        } catch (e) {
            Logger.warn('KildimGuven', 'Soru yaniti yazilamadi', e);
            return false;
        }
    },
};
