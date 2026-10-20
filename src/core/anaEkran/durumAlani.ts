/**
 * Ana ekranın TEK durum alanı — hangi uyarı görünür? SAF.
 *
 * Eskiden vakit kartının üstüne beş bant yığılabiliyordu (sade görünüme dönüş,
 * toparlanma, muhafız, kerahat, seferîlik); kullanıcının ilk gördüğü şey asıl iş
 * (şu anki vakit + Kıldım) değil uyarılardı. Artık aynı anda yalnız EN ÖNEMLİ olan
 * görünür, diğerleri "+N daha" işaretinin arkasında bekler.
 *
 * Öncelik (sahip onaylı plan): kerahat > muhafız > toparlanma > seferîlik. `kurulum`
 * (bildirim / tam zamanlı hatırlatma izni sonradan kapatılmış — proaktif onarım) muhafızın
 * hemen ardındadır: o an kerahat/muhafız zamana bağlıdır, izin onarımı birkaç dakika bekleyebilir;
 * ama toparlanma ve yolculuk bilgisinden önemlidir (izin yoksa HİÇBİR hatırlatma gelmez). Muhafız ile
 * kerahat birlikteyse TEK kartta birleşir (`durumlariBirlestir`), muhafız önde.
 * Sade görünüme dönüş bir UYARI değil kalıcı gezinme bağlantısıdır → alana girmez
 * (başlığın altında küçük bağlantı; "+N daha" arkasında kaybolmasın).
 */

export type DurumAnahtari = 'kerahat' | 'muhafiz' | 'kurulum' | 'toparlanma' | 'seferilik';

export const DURUM_ONCELIGI: readonly DurumAnahtari[] = ['kerahat', 'muhafiz', 'kurulum', 'toparlanma', 'seferilik'];

export interface DurumSecimi {
    /** Görünen tek uyarı (yoksa `null` → alan hiç çizilmez). */
    birincil: DurumAnahtari | null;
    /** "+N daha" arkasındakiler, öncelik sırasıyla. */
    gizlenenler: DurumAnahtari[];
}

/**
 * Muhafız ve kerahat birlikte etkinse TEK kartta birleşir: muhafız uyarısı (vakit
 * çıkıyor) önde, kerahat onun altında kısa not. Ayrı tutulsaydı kerahat önceliği
 * gurub vaktinde ikindinin çıkmak üzere olduğu uyarısını "+1 daha" arkasına
 * gizlerdi — tam da en çok görünmesi gereken anda.
 */
export function durumlariBirlestir(etkinler: readonly DurumAnahtari[]): {
    etkinler: DurumAnahtari[];
    muhafizKerahatNotu: boolean;
} {
    const ikisi = etkinler.includes('muhafiz') && etkinler.includes('kerahat');
    return {
        etkinler: ikisi ? etkinler.filter((a) => a !== 'kerahat') : [...etkinler],
        muhafizKerahatNotu: ikisi,
    };
}

/** Etkin uyarıları önceliğe göre dizer; sıra girdiden bağımsızdır, tekrarlar atılır. */
export function durumSec(etkinler: readonly DurumAnahtari[]): DurumSecimi {
    const sirali = DURUM_ONCELIGI.filter((a) => etkinler.includes(a));
    return { birincil: sirali[0] ?? null, gizlenenler: sirali.slice(1) };
}
