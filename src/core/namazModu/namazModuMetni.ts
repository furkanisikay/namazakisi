/**
 * Namaz modunun telefonda NEREYE eklendiğini söyleyen metin — sürüme göre (SAF).
 *
 * Native üç yol kullanır (`NamazModu.kt`): API 35+ telefonun "Modlar" listesi,
 * API 29–34 Rahatsız Etmeyin kuralı (Zamanlamalar), API 24–28 kural YOK — Rahatsız
 * Etmeyin doğrudan açılıp kapanır (`destek === 'filtre'`). Eskiden her telefona
 * "Modlar listesine eklenir" deniyordu; Android 14 ve öncesinde öyle bir liste yok.
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
    if (api !== null && api < 35) {
        return {
            giris: 'Telefonunuzun Rahatsız Etmeyin zamanlamalarıyla çalışır. Hatırlatmalarınız iptal edilmez; modda nasıl görüneceklerini telefonunuzun ayarlarında siz seçersiniz.',
            anahtar: 'Rahatsız Etmeyin → Zamanlamalar\'a "Namaz" eklenir; ne yapacağını orada siz seçersiniz',
        };
    }
    // API 35+ ya da sürüm bilinmiyor (bugünkü metin).
    return {
        giris: 'Telefonunuzun kendi Modlar özelliğiyle çalışır. Hatırlatmalarınız iptal edilmez; modda nasıl görüneceklerini telefonunuzun ayarlarında siz seçersiniz.',
        anahtar: 'Ayarlar → Modlar listesine "Namaz" eklenir; ne yapacağını orada siz seçersiniz',
    };
}
