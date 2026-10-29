package expo.modules.countdownnotification.cekirdek

/*
 * Rakam sistemi — sayaç bildirimi ve Live Update / Now Bar metinlerinde kullanıcının
 * uygulamada SEÇTİĞİ rakamlar. SAF (Android import ETMEZ).
 *
 * İKİZ: uygulama modülündeki `com.furkanisikay.namazakisi.cekirdek.Rakam` (kural ve gerekçe
 * orada). Modül uygulama sınıflarını göremediği için kopya; biri değişirse ikisini birlikte
 * değiştir. Değeri JS yazar (`ArayuzDili.TERCIH_RAKAM_SISTEMI`, ÇÖZÜLMÜŞ: "arab", "arabext", "beng"
 * ya da yok); yalnız arayüz dilinin kendi yerel sistemiyle eşleşirse uygulanır (Arapçada ve Soranîde
 * "arab", Farsça ve Peştucada "arabext", Bengalcede "beng"), diğer dillerde çıktı BİREBİR aynı.
 */
object Rakam {
    const val ARAB = "arab"
    const val ARABEXT = "arabext"
    const val BENG = "beng"
    const val LATN = "latn"

    /** Doğu Arap (Arapça-Hint) sıfırı, U+0660. */
    const val DOGU_SIFIR = '٠'

    /** Fars (genişletilmiş Arapça-Hint) sıfırı, U+06F0 — Farsça ve Peştuca. */
    const val ARABEXT_SIFIR = '۰'

    /** Bengalce sıfır, U+09E6. */
    const val BENG_SIFIR = '০'

    /** Dil kökü → yerel rakam sistemi (TEK eşleme; listede olmayan dil Batı rakamı yazar). */
    private val YEREL = mapOf("ar" to ARAB, "bn" to BENG, "fa" to ARABEXT, "ps" to ARABEXT, "ckb" to ARAB)

    private val SIFIRLAR = mapOf(ARAB to DOGU_SIFIR, ARABEXT to ARABEXT_SIFIR, BENG to BENG_SIFIR)

    private fun kok(dil: String?): String = dil?.trim()?.substringBefore('-')?.substringBefore('_').orEmpty()

    fun yerelSistem(dil: String?): String? = YEREL[kok(dil)]

    fun yerelRakamli(dil: String?): Boolean = yerelSistem(dil) != null

    /** Kayıt dilin KENDİ yerel sistemiyse o; aksi halde [LATN]. */
    fun sistem(dil: String?, kayitli: String?): String {
        val yerel = yerelSistem(dil) ?: return LATN
        return if (kayitli?.trim() == yerel) yerel else LATN
    }

    fun sifir(sistem: String): Char = SIFIRLAR[sistem] ?: '0'

    fun sifir(dil: String?, kayitli: String?): Char = sifir(sistem(dil, kayitli))

    /** Yerel rakamlı dilde `-u-nu-<sistem>` uzantılı etiket; diğer dillerde etiket AYNEN. */
    fun yerelEtiketi(dil: String, kayitli: String?): String =
        if (yerelRakamli(dil)) "${kok(dil)}-u-nu-${sistem(dil, kayitli)}" else dil
}

/** ASCII 0-9 → [sifir]dan başlayan rakamlar; '0'da ya da rakamsız metinde AYNI nesne döner. */
fun rakamlariYerellestir(metin: String, sifir: Char): String {
    if (sifir == '0' || metin.none { it in '0'..'9' }) return metin
    val fark = sifir - '0'
    val sb = StringBuilder(metin.length)
    for (c in metin) sb.append(if (c in '0'..'9') c + fark else c)
    return sb.toString()
}
