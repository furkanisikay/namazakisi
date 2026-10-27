package expo.modules.countdownnotification.cekirdek

/*
 * Rakam sistemi — sayaç bildirimi ve Live Update / Now Bar metinlerinde kullanıcının
 * uygulamada SEÇTİĞİ rakamlar. SAF (Android import ETMEZ).
 *
 * İKİZ: uygulama modülündeki `com.furkanisikay.namazakisi.cekirdek.Rakam` (kural ve gerekçe
 * orada). Modül uygulama sınıflarını göremediği için kopya; biri değişirse ikisini birlikte
 * değiştir. Değeri JS yazar (`ArayuzDili.TERCIH_RAKAM_SISTEMI`, ÇÖZÜLMÜŞ: "arab" ya da yok);
 * yalnız arayüz dili Arapçayken uygulanır, diğer dillerde çıktı BİREBİR aynı.
 */
object Rakam {
    const val ARAB = "arab"
    const val LATN = "latn"

    /** Doğu Arap (Arapça-Hint) sıfırı, U+0660. */
    const val DOGU_SIFIR = '٠'

    fun arapcaMi(dil: String?): Boolean =
        dil?.trim()?.substringBefore('-')?.substringBefore('_') == "ar"

    fun sistem(dil: String?, kayitli: String?): String =
        if (arapcaMi(dil) && kayitli?.trim() == ARAB) ARAB else LATN

    fun sifir(sistem: String): Char = if (sistem == ARAB) DOGU_SIFIR else '0'

    fun sifir(dil: String?, kayitli: String?): Char = sifir(sistem(dil, kayitli))

    /** Arapçada `-u-nu-<sistem>` uzantılı etiket; diğer dillerde etiket AYNEN. */
    fun yerelEtiketi(dil: String, kayitli: String?): String =
        if (arapcaMi(dil)) "ar-u-nu-${sistem(dil, kayitli)}" else dil
}

/** ASCII 0-9 → [sifir]dan başlayan rakamlar; '0'da ya da rakamsız metinde AYNI nesne döner. */
fun rakamlariYerellestir(metin: String, sifir: Char): String {
    if (sifir == '0' || metin.none { it in '0'..'9' }) return metin
    val fark = sifir - '0'
    val sb = StringBuilder(metin.length)
    for (c in metin) sb.append(if (c in '0'..'9') c + fark else c)
    return sb.toString()
}
