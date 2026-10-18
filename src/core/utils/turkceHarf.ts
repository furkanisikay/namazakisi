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
        if (harf === 'i') sonuc += 'İ';
        else if (harf === 'ı') sonuc += 'I';
        else sonuc += harf.toUpperCase();
    }
    return sonuc;
}

/** Türkçe küçük harf (`'İ' → 'i'`, `'I' → 'ı'`); `toLowerCase` tuzağının ikizi. */
export function turkceKucukHarf(metin: string): string {
    if (!metin) return metin;
    let sonuc = '';
    for (const harf of metin) {
        if (harf === 'İ') sonuc += 'i';
        else if (harf === 'I') sonuc += 'ı';
        else sonuc += harf.toLowerCase();
    }
    return sonuc;
}
