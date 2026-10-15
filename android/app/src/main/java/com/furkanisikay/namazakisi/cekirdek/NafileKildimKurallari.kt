package com.furkanisikay.namazakisi.cekirdek

/**
 * Nafile bildirimindeki "Kıldım" — NATIVE ilk adımın SAF kuralları (issue #273,
 * #299 deseni; JVM testi: NafileKildimKurallariTest).
 *
 * Muhafız Kıldım'ının (`BildirimKildimKurallari`) İKİZİDİR ama AYRI kalır: nafile
 * gönüllü ibadettir, kaydı/puanı/serisi YOKTUR. Bu yüzden öğe farz kuyruğuna
 * (`KildimKuyrugu`, JS'te `kildimAksiyonunuIsle` → FARZ kaydı yazar) ASLA girmez;
 * kendi küçük kuyruğuna düşer ve JS yalnız `NAFILE_KILINAN` susturma hafızasını yazar
 * (`NafileHatirlatmaServisi.kildimIsle`).
 *
 * SÖZLEŞME İKİZLERİ (JS):
 *  - kimlik `nafile_<gün>_<tür>_<kalanDk>` (`core/nafile/nafilePlani.ts`); anons
 *    alarmı bildirimle AYNI kimliği taşır,
 *  - önek `nafileKimlikOneki` = `nafile_<gün>_<tür>_` (sondaki `_` şart),
 *  - türler `NafileTuru` (`core/nafile/nafileTipleri.ts`).
 */
object NafileKildimKurallari {
    const val NAFILE_ONEKI = "nafile_"
    const val MAKS_DENEME = 5

    /** Kuyruk üst sınırı: bozuk bir döngü SharedPreferences'ı şişirmesin (7 gece × 3 tür yeter). */
    const val MAKS_OGE = 32

    val TURLER = setOf("kusluk", "evvabin", "teheccud")
    private val TARIH_DESENI = Regex("""^\d{4}-\d{2}-\d{2}$""")
    private val KIMLIK_DESENI =
        Regex("""^nafile_(\d{4}-\d{2}-\d{2})_(kusluk|evvabin|teheccud)_[^_]+$""")

    /** Bildirimin ait olduğu nafile (gün = nafilenin namaz günü; teheccüdde gece başladığı gün). */
    data class Nafile(val tarih: String, val tur: String)

    data class Oge(val id: String, val tarih: String, val tur: String, val deneme: Int)

    /** Yanıt native olarak işlenecek bir nafile "Kıldım"ı mı? Değilse `null`. */
    fun kildimYaniti(eylem: String?, kimlik: String?): Nafile? {
        if (eylem != BildirimKildimKurallari.KILDIM_EYLEMI || kimlik == null) return null
        return nafileCoz(kimlik)
    }

    fun nafileCoz(kimlik: String): Nafile? {
        val m = KIMLIK_DESENI.matchEntire(kimlik) ?: return null
        return Nafile(m.groupValues[1], m.groupValues[2])
    }

    /** JS `nafileKimlikOneki` ile birebir. */
    fun onek(n: Nafile): String = "${NAFILE_ONEKI}${n.tarih}_${n.tur}_"

    /** Kimlik bu günün bu nafilesine mi ait? Önek `_` ile bittiği için komşu tür süzülmez. */
    fun buNafileyeAitMi(kimlik: String, n: Nafile): Boolean = kimlik.startsWith(onek(n))

    fun iptalEdilecekler(kimlikler: Collection<String>, n: Nafile): List<String> =
        kimlikler.filter { buNafileyeAitMi(it, n) }.distinct()

    fun gecerliMi(tarih: String?, tur: String?): Boolean =
        tarih != null && tur != null && TARIH_DESENI.matches(tarih) && tur in TURLER

    fun kimlik(n: Nafile): String = "${n.tarih}_${n.tur}"

    /**
     * Öğe ekler. Geçersizse `null`; aynı gün + tür zaten varsa liste AYNEN döner
     * (iki ayrı hatırlatmadan basılan iki "Kıldım" tek işlem). Sınır aşılırsa en ESKİ
     * öğe düşer (en yeni basış kaybolmamalı).
     */
    fun ekle(liste: List<Oge>, tarih: String?, tur: String?): List<Oge>? {
        if (!gecerliMi(tarih, tur)) return null
        val id = kimlik(Nafile(tarih!!, tur!!))
        if (liste.any { it.id == id }) return liste
        return (liste + Oge(id, tarih, tur, 0)).takeLast(MAKS_OGE)
    }

    fun tamamlandi(liste: List<Oge>, id: String): List<Oge> = liste.filter { it.id != id }

    fun basarisiz(liste: List<Oge>, id: String): List<Oge> =
        liste.mapNotNull { o ->
            if (o.id != id) o
            else {
                val deneme = o.deneme + 1
                if (deneme >= MAKS_DENEME) null else o.copy(deneme = deneme)
            }
        }
}
