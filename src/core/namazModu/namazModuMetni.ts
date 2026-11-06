/**
 * Namaz modunun telefonda NEREYE eklendiğini söyleyen metin — sürüme göre (SAF).
 *
 * Native üç yol kullanır (`NamazModu.kt`): API 35+ mod, API 29–34 Rahatsız Etmeyin
 * kuralı, API 24–28 kural YOK — Rahatsız Etmeyin doğrudan açılıp kapanır
 * (`destek === 'filtre'`). Menü ADLARI üreticiye göre değişir (Samsung "Modlar ve
 * Rutinler", AOSP "Modlar"/"Zamanlamalar"…): metin hiçbirini kesin yazmaz.
 */
import { metin } from '../dil/aktifDil';

export interface NamazModuMetni {
    /** Sayfanın giriş satırı. */
    giris: string;
    /** Ana anahtarın açıklaması. */
    anahtar: string;
}

export function namazModuMetni(api: number | null, destek: 'kural' | 'filtre' | null | undefined): NamazModuMetni {
    const m = metin().cami.namazModu;
    if (destek === 'filtre' || (api !== null && api < 29)) {
        return { giris: m.filtreGiris, anahtar: m.filtreAnahtar };
    }
    // API 29+ ya da sürüm bilinmiyor: kural telefonun Rahatsız Etmeyin / mod ayarlarına
    // eklenir. Menü adları üreticiye göre değişir ("Modlar", "Zamanlamalar", "Modlar ve
    // Rutinler"…) → hiçbiri kesin yazılmaz; ekrandaki düğme ayarı zaten tek dokunuşla açar.
    return { giris: m.kuralGiris, anahtar: m.kuralAnahtar };
}
