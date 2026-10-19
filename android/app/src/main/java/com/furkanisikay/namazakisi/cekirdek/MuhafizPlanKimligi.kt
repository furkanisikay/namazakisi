package com.furkanisikay.namazakisi.cekirdek

/**
 * Muhafız PLAN kimliği — SAF kurallar (JVM testi: MuhafizPlanKimligiTest).
 *
 * İKİZ: `src/core/muhafiz/planKimligi.ts`. İkisi de
 * `src/test/resources/muhafiz-plan-kimligi-ornekleri.json` örneğini kabul eder.
 *
 * `muhafiz_` uzayı tek sahipli değildir (yatış/muhasebe #290 de oradadır): plan
 * sahipliği önekle değil bu desenle sorulur — saat köprü etiketi, teslim sahipliği,
 * otomasyon "vakit çıkıyor" olayı.
 *
 * ERTELE YOK (sahip kararı 2026-10-19): eski "Ertele" (#289) özelliği kaldırıldı.
 * `eskiErtelemeKimligiMi` / `eskiErteleEylemiMi` yalnız GÜNCELLEME ÖNCESİ kurulmuş
 * artıkları tanır: `_ertele` kopyaları planlama turunda silinir, eski bildirimdeki
 * "Ertele" basışı yalnız bildirimi kapatır.
 */
object MuhafizPlanKimligi {
    private val PLAN_DESENI = Regex("""^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_seviye_\d+_dk_(-?\d+)$""")
    private val ESKI_ERTELEME_DESENI = Regex("""^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_ertele$""")
    private val ESKI_ERTELE_EYLEMLERI = setOf("ertele_10", "ertele_20")

    /** Muhafız PLANININ (seviye/dakika) kimliği mi? */
    fun planKimligiMi(kimlik: String): Boolean = PLAN_DESENI.matches(kimlik)

    /** Plan kimliğindeki kalanDk (tetik = çıkış − kalanDk); plan değilse null. */
    fun kimliktenKalanDk(kimlik: String): Long? =
        PLAN_DESENI.matchEntire(kimlik)?.groupValues?.get(1)?.toLongOrNull()

    /** Kaldırılan Ertele'nin artığı (`muhafiz_<tarih>_vakit_<vakit>_ertele`) mı? */
    fun eskiErtelemeKimligiMi(kimlik: String): Boolean = ESKI_ERTELEME_DESENI.matches(kimlik)

    /** Güncelleme öncesi gösterilmiş bildirimdeki "Ertele" düğmesinin eylemi mi? */
    fun eskiErteleEylemiMi(eylem: String?): Boolean = eylem != null && eylem in ESKI_ERTELE_EYLEMLERI
}
