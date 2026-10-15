package com.furkanisikay.namazakisi.cekirdek

/**
 * "Şu anki vakti kıldım" kısayolunun (issue #276) KAYNAK doğrulaması — SAF
 * (JVM testi: KisayolKaynagiTest).
 *
 * `KildimKisayolActivity` dışa açıktır (`exported`): ana ekran ve Samsung Rutinler
 * onu açık bileşen adıyla çağırabilsin diye. Bu, cihazdaki HERHANGİ bir uygulamanın
 * da onu çağırıp kullanıcı adına sessizce "kıldım" yazabileceği demektir. Başlatanın
 * kimliği burada çözülür; ne yapılacağına (doğrudan / güven listesi / soru) ise
 * `KildimGuvenKurallari` karar verir (issue #299).
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

    private val PAKET_DESENI = Regex("""^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$""")
}
