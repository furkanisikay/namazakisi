/**
 * Namaz modunun telefonda NEREYE eklendiğini söyleyen metin — sürüme göre (SAF).
 *
 * Native üç yol kullanır (`NamazModu.kt`): API 35+ mod, API 29–34 Rahatsız Etmeyin
 * kuralı, API 24–28 kural YOK — Rahatsız Etmeyin doğrudan açılıp kapanır
 * (`destek === 'filtre'`). Menü ADLARI üreticiye göre değişir (Samsung "Modlar ve
 * Rutinler", AOSP "Modlar"/"Zamanlamalar"…): metin hiçbirini kesin yazmaz.
 */
export interface NamazModuMetni {
    /** Sayfanın giriş satırı. */
    giris: string;
    /** Ana anahtarın açıklaması. */
    anahtar: string;
}

export function namazModuMetni(api: number | null, destek: 'kural' | 'filtre' | null | undefined): NamazModuMetni {
    if (destek === 'filtre' || (api !== null && api < 29)) {
        return {
            giris: 'Namaz vaktinde telefonunuzun Rahatsız Etmeyin modunu açıp kapatır. Hatırlatmalarınız iptal edilmez.',
            anahtar: 'Namaz vaktinde telefonunuzun Rahatsız Etmeyin modu açılır',
        };
    }
    // API 29+ ya da sürüm bilinmiyor: kural telefonun Rahatsız Etmeyin / mod ayarlarına
    // eklenir. Menü adları üreticiye göre değişir ("Modlar", "Zamanlamalar", "Modlar ve
    // Rutinler"…) → hiçbiri kesin yazılmaz; ekrandaki düğme ayarı zaten tek dokunuşla açar.
    return {
        giris: 'Telefonunuzun Rahatsız Etmeyin özelliğiyle çalışır. Hatırlatmalarınız iptal edilmez; modda nasıl görüneceklerini telefonunuzun ayarlarında siz seçersiniz.',
        anahtar: 'Telefonunuzun Rahatsız Etmeyin/mod ayarlarına "Namaz" eklenir; ne yapacağını orada siz seçersiniz',
    };
}
