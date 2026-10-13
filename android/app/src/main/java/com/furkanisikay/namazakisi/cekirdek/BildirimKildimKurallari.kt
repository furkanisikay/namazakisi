package com.furkanisikay.namazakisi.cekirdek

/**
 * Bildirimdeki "Kıldım" eyleminin NATIVE ilk adımı (issue #299) — SAF kurallar
 * (JVM testi: BildirimKildimKurallariTest).
 *
 * `wear/KopruEtiketliBildirimServisi` eylemi JS'i beklemeden yakalar: öğeyi kuyruğa
 * yazar, o vaktin bekleyen muhafız tetiklerini ve TTS anons alarmlarını iptal eder.
 * Burada yalnız "bu yanıt bizim mi, hangi vakit, neler iptal edilecek" soruları
 * cevaplanır.
 *
 * SÖZLEŞME İKİZLERİ (JS):
 *  - eylem kimliği `BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM` (`UygulamaSabitleri.ts`),
 *  - bildirim/anons kimliği `muhafizBildirimIdOlustur` (`core/muhafiz/anonsKimligi.ts`):
 *    `muhafiz_<tarih>_vakit_<vakit>_seviye_<n>_dk_<k>`; anons alarmı bildirimle AYNI
 *    kimliği taşır, bu yüzden aynı önek ikisini de kapsar.
 */
object BildirimKildimKurallari {
    const val KILDIM_EYLEMI = "kildim_action"
    const val MUHAFIZ_ONEKI = "muhafiz_"

    private val KIMLIK_DESENI =
        Regex("""^muhafiz_(\d{4}-\d{2}-\d{2})_vakit_(imsak|ogle|ikindi|aksam|yatsi)(?:_.*)?$""")

    /** Bildirim kimliğinin ait olduğu vakit. */
    data class Vakit(val tarih: String, val vakit: String)

    /**
     * Yanıt native olarak işlenecek bir "Kıldım" mı? Değilse `null` (expo'nun
     * olağan yolu sürer). Tarih ve vakit KİMLİKTEN okunur — `data` JSON'una
     * bakılmaz: kimlik, JS'in iptal öneki ile aynı kaynaktan üretilir ve gece
     * yarısını aşan yatsıda vaktin GERÇEK gününü (dün) taşır.
     */
    fun kildimYaniti(eylem: String?, kimlik: String?): Vakit? {
        if (eylem != KILDIM_EYLEMI || kimlik == null) return null
        return vakitCoz(kimlik)
    }

    fun vakitCoz(kimlik: String): Vakit? {
        val m = KIMLIK_DESENI.matchEntire(kimlik) ?: return null
        return Vakit(m.groupValues[1], m.groupValues[2])
    }

    /** `muhafiz_<tarih>_vakit_<vakit>` — JS `vakitBildirimleriniIptalEt` öneki. */
    fun vaktinOneki(v: Vakit): String = "${MUHAFIZ_ONEKI}${v.tarih}_vakit_${v.vakit}"

    /**
     * Kimlik bu vakte mi ait? Önekten sonra ya hiçbir şey ya da `_` gelmeli —
     * yalın `startsWith` ileride önek paylaşan bir vakit adı eklenirse (ör. `ogle`
     * ↔ `oglen`) komşu vaktin uyarılarını da susturabilirdi.
     */
    fun buVakteAitMi(kimlik: String, v: Vakit): Boolean {
        val onek = vaktinOneki(v)
        return kimlik == onek || kimlik.startsWith("${onek}_")
    }

    /** Verilen kimliklerden yalnız bu vakte ait olanlar (sıra korunur, tekrar yok). */
    fun iptalEdilecekler(kimlikler: Collection<String>, v: Vakit): List<String> =
        kimlikler.filter { buVakteAitMi(it, v) }.distinct()
}
