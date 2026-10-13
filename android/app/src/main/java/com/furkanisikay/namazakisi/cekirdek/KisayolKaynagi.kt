package com.furkanisikay.namazakisi.cekirdek

/**
 * "Şu anki vakti kıldım" kısayolunun (issue #276) KAYNAK doğrulaması — SAF
 * (JVM testi: KisayolKaynagiTest).
 *
 * `KildimKisayolActivity` dışa açıktır (`exported`): ana ekran ve Samsung Rutinler
 * onu açık bileşen adıyla çağırabilsin diye. Bu, cihazdaki HERHANGİ bir uygulamanın
 * da onu çağırıp kullanıcı adına sessizce "kıldım" yazabileceği demektir. Kural:
 *  - Başlatan paket bir ANA EKRAN uygulamasıysa (kullanıcı kısayola kendi dokundu)
 *    doğrudan işaretlenir.
 *  - Aksi her durumda (otomasyon, Rutinler, bilinmeyen başlatan, uydurulmuş
 *    referrer eki) kullanıcıya küçük bir onay sorulur.
 *
 * `Activity.getReferrer()` önce intent'teki `EXTRA_REFERRER`/`EXTRA_REFERRER_NAME`
 * ekine bakar — bunu ÇAĞIRAN yazar, yani uydurulabilir. Ek varsa başlatana
 * güvenilmez; yoksa dönen değer sistemin kaydettiği gerçek başlatan pakettir.
 */
object KisayolKaynagi {

    /** `android-app://<paket>[/...]` → paket adı; başka biçim → null. */
    fun paketAdiCoz(referrer: String?): String? {
        if (referrer == null) return null
        val onek = "android-app://"
        if (!referrer.startsWith(onek)) return null
        val paket = referrer.substring(onek.length).substringBefore('/')
        return paket.takeIf { it.isNotEmpty() && PAKET_DESENI.matches(it) }
    }

    /**
     * Onay sormadan işaretlenebilir mi?
     * @param anaEkranUygulamasiMi başlatan paket `ACTION_MAIN` + `CATEGORY_HOME` çözüyor mu
     */
    fun onaysizMi(baslatanPaket: String?, referrerEkiVar: Boolean, anaEkranUygulamasiMi: Boolean, kendiPaketi: String): Boolean {
        if (referrerEkiVar || baslatanPaket == null) return false
        return baslatanPaket == kendiPaketi || anaEkranUygulamasiMi
    }

    private val PAKET_DESENI = Regex("""^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$""")
}
