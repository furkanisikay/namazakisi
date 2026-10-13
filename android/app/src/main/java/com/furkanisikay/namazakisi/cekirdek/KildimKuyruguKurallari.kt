package com.furkanisikay.namazakisi.cekirdek

/**
 * "Kıldım" kuyruğunun SAF kuralları (issue #269 → #275/#276 genelleştirmesi).
 *
 * Kuyruğa dört kaynak yazar: Wear OS saati, ana ekran widget'ı, hızlı ayarlar
 * kutusu ve "Şu anki vakti kıldım" kısayolu. JS hepsini AYNI gövdeden işler
 * (`BildirimServisi.kildimAksiyonunuIsle`). Kalıcılık (SharedPreferences + JSON)
 * `kildim/KildimKuyrugu` içindedir; burada yalnız liste kuralları vardır.
 *
 * - Kimlik "<tarih>_<vakit>": aynı vakit farklı kaynaklardan gelse de TEK öğe
 *   kalır (saatten ve widget'tan aynı anda basılması çift işlem üretmez).
 * - Zehirli öğe: [MAKS_DENEME] başarısız denemede düşer, kuyruğu kilitlemez.
 */
data class KuyrukOgesi(
    val id: String,
    val tarih: String,
    val vakit: String,
    val kaynak: String,
    val deneme: Int,
)

object KildimKuyruguKurallari {
    const val MAKS_DENEME = 5

    const val KAYNAK_WEAR = "wear"
    const val KAYNAK_WIDGET = "widget"
    const val KAYNAK_KUTU = "qs"
    const val KAYNAK_KISAYOL = "kisayol"
    val KAYNAKLAR = setOf(KAYNAK_WEAR, KAYNAK_WIDGET, KAYNAK_KUTU, KAYNAK_KISAYOL)

    private val GECERLI_VAKITLER = setOf("imsak", "ogle", "ikindi", "aksam", "yatsi")
    private val TARIH_DESENI = Regex("""^\d{4}-\d{2}-\d{2}$""")

    fun gecerliMi(tarih: String?, vakit: String?): Boolean =
        tarih != null && vakit != null && TARIH_DESENI.matches(tarih) && vakit in GECERLI_VAKITLER

    /**
     * Öğe ekler. Geçersizse `null`; aynı kimlik zaten varsa liste AYNEN döner
     * (ilk kaynak korunur, deneme sayacı sıfırlanmaz). Bilinmeyen kaynak
     * `wear`'a düşmez, reddedilir: kaynağı uydurmak tanıyı yanıltırdı.
     */
    fun ekle(liste: List<KuyrukOgesi>, tarih: String?, vakit: String?, kaynak: String): List<KuyrukOgesi>? {
        if (!gecerliMi(tarih, vakit) || kaynak !in KAYNAKLAR) return null
        val id = kildimKimligi(tarih!!, vakit!!)
        if (liste.any { it.id == id }) return liste
        return liste + KuyrukOgesi(id, tarih, vakit, kaynak, 0)
    }

    fun tamamlandi(liste: List<KuyrukOgesi>, id: String): List<KuyrukOgesi> = liste.filter { it.id != id }

    fun basarisiz(liste: List<KuyrukOgesi>, id: String): List<KuyrukOgesi> =
        liste.mapNotNull { o ->
            if (o.id != id) o
            else {
                val deneme = o.deneme + 1
                if (deneme >= MAKS_DENEME) null else o.copy(deneme = deneme)
            }
        }

    fun bekleyenKimlikler(liste: List<KuyrukOgesi>): Set<String> = liste.map { it.id }.toSet()
}
