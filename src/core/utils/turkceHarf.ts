/**
 * Türkçe BÜYÜK HARF — `toUpperCase()` / `toLocaleUpperCase('tr-TR')` KULLANILMAZ.
 *
 * `'bildirim'.toUpperCase()` → `'BILDIRIM'` (noktalı İ kaybolur); `toLocaleUpperCase`
 * Hermes'te Intl/ICU varlığına bağlıdır (AGENTS.md "Türkçe büyük harf" tuzağı). Önce
 * Türkçeye özgü iki harf sabit haritayla çevrilir (`i → İ`, `ı → I`), geri kalan ASCII
 * ve Türkçe harfler (ç, ğ, ö, ş, ü) dil-bağımsız `toUpperCase` ile doğru büyür.
 */
export function turkceBuyukHarf(metin: string): string {
    if (!metin) return metin;
    let sonuc = '';
    for (const harf of metin) {
        if (harf === 'i') sonuc += 'İ'; // dil-haric: Türkçe harf eşlemesi
        else if (harf === 'ı') sonuc += 'I'; // dil-haric: Türkçe harf eşlemesi
        else sonuc += harf.toUpperCase();
    }
    return sonuc;
}

/** Türkçe küçük harf (`'İ' → 'i'`, `'I' → 'ı'`); `toLowerCase` tuzağının ikizi. */
export function turkceKucukHarf(metin: string): string {
    if (!metin) return metin;
    let sonuc = '';
    for (const harf of metin) {
        if (harf === 'İ') sonuc += 'i'; // dil-haric: Türkçe harf eşlemesi
        else if (harf === 'I') sonuc += 'ı'; // dil-haric: Türkçe harf eşlemesi
        else sonuc += harf.toLowerCase();
    }
    return sonuc;
}

/**
 * Etkin dilin kuralıyla BÜYÜK HARF (bölüm başlıkları). Türkçede `turkceBuyukHarf`
 * (`i → İ`); diğer dillerde `i → I` — Türkçe eşlemesi İngilizce metni "REMİNDERS" yapardı.
 * Dil-bağımsız tek karakter `toUpperCase` (yerel ayara/ICU'ya bağlı DEĞİL) kullanılır;
 * yalnız Türkçenin noktalı/noktasız i'si özel ele alınır.
 */
export function dilBuyukHarf(metin: string, dil: string): string {
    if (dil === 'tr') return turkceBuyukHarf(metin);
    if (!metin) return metin;
    let sonuc = '';
    for (const harf of metin) sonuc += harf.toUpperCase();
    return sonuc;
}
