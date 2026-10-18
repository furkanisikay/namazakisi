/**
 * Google yetki köprüsünün sonuç tipi ve doğrulaması — SAF (import YOK), jest'te
 * expo-modules-core yüklemeden test edilebilsin diye ayrı dosyada.
 */

/** Native `yetkiAl` sonucu (ayrımlı birlik; native asla fırlatmaz). */
export type GoogleYetkiSonucu =
    | { durum: 'izin'; belirtec: string; kapsamlar: string[] }
    /** Onay gerekiyor ama ekran açılamadı (etkileşimsiz kip / Activity yok). */
    | { durum: 'cozumGerekli' }
    /** Kullanıcı onay ekranından vazgeçti. */
    | { durum: 'iptal' }
    /** Zaten açık bir onay ekranı var (yeniden-giriş reddi). */
    | { durum: 'mesgul' }
    | { durum: 'agYok' }
    | { durum: 'hata'; kod?: number; mesaj?: string };

/** Native ham sonucu doğrular; tanınmayan şekil `hata` olur. */
export function yetkiSonucunuCoz(ham: unknown): GoogleYetkiSonucu {
    if (!ham || typeof ham !== 'object') return { durum: 'hata', mesaj: 'gecersiz sonuc' };
    const s = ham as { durum?: unknown; belirtec?: unknown; kapsamlar?: unknown; kod?: unknown; mesaj?: unknown };
    switch (s.durum) {
        case 'izin':
            if (typeof s.belirtec !== 'string' || s.belirtec.length === 0) {
                return { durum: 'hata', mesaj: 'belirtec yok' };
            }
            return {
                durum: 'izin',
                belirtec: s.belirtec,
                kapsamlar: Array.isArray(s.kapsamlar)
                    ? s.kapsamlar.filter((k): k is string => typeof k === 'string')
                    : [],
            };
        case 'cozumGerekli':
        case 'iptal':
        case 'mesgul':
        case 'agYok':
            return { durum: s.durum };
        default:
            return {
                durum: 'hata',
                ...(typeof s.kod === 'number' ? { kod: s.kod } : {}),
                ...(typeof s.mesaj === 'string' ? { mesaj: s.mesaj } : {}),
            };
    }
}
