/**
 * Cihaz rolü (tek beyin) okuma/yazma + planlayıcıların TEK kapısı.
 *
 * Store'suzdur: arka plan görevi (Redux yok) ve konum yayması da aynı kapıdan geçer.
 * Okuma ASLA fırlatmaz; okunamazsa hatırlatma KURULUR (güvenli taraf — sessizce
 * hatırlatma kesmek, ikinci cihazda bir kez fazla çalmaktan kötüdür).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { cihazRoluCoz, hatirlatmaKurulurMu, type CihazRoluAyari } from '../../core/cihaz/cihazRolu';

export async function cihazRoluOku(): Promise<CihazRoluAyari> {
    try {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.CIHAZ_ROLU);
        return ham ? cihazRoluCoz(JSON.parse(ham)) : {};
    } catch {
        return {};
    }
}

export async function cihazRoluYaz(ayar: CihazRoluAyari): Promise<void> {
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.CIHAZ_ROLU, JSON.stringify(cihazRoluCoz(ayar)));
}

async function evEkraniAcikMi(): Promise<boolean> {
    try {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.EV_EKRANI_AYARI);
        return ham ? JSON.parse(ham)?.acik === true : false;
    } catch {
        return false;
    }
}

/**
 * Hatırlatmalar bu cihazda kurulur mu? Her planlayıcı planlamanın BAŞINDA sorar;
 * `false` ise o özellik kapalıymış gibi davranır (önceki planı da temizler).
 */
export async function hatirlatmaKurulabilirMi(): Promise<boolean> {
    try {
        const [rol, ev] = await Promise.all([cihazRoluOku(), evEkraniAcikMi()]);
        return hatirlatmaKurulurMu(rol, ev);
    } catch {
        return true;
    }
}
