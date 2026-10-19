package com.furkanisikay.namazakisi.cekirdek

/**
 * TESLİM SAHİPLİĞİ — hangi kimliğin hangi teslimci örneğine ait olduğu (SAF; JVM testi
 * TeslimSahipligiTest). JS ikizi `src/core/muhafiz/teslimSahipligi.ts`; ikisi de
 * `src/test/resources/teslim-sahipligi-ornekleri.json` örneğini kabul eder.
 *
 * Ortak hatırlatma yüzeyleri AYNI native kayıt defterlerini (sesli anons alarmları,
 * gerçek alarmlar) paylaşır. Muhafız yeniden planlamadan önce önceki turunu ÖNEKLE
 * silseydi `muhafiz_` uzayındaki yatış/muhasebe (#290) anons ve alarmlarını da her 15 dk
 * turunda silerdi → muhafız PLAN kimliğiyle, kapalıyken de "yatış hariç" temizler.
 */
object TeslimSahipligi {
    /**
     * Muhafız açık: plan kimlikleri (yatış korunur) + kaldırılan Ertele'nin (#289)
     * güncelleme öncesi `_ertele` artıkları — bir sonraki planlama turunda silinsinler.
     */
    const val MUHAFIZ_PLAN = "muhafiz_plan"

    /** Muhafız kapalı: muhafız sahipli her şey — yatış HARİÇ. */
    const val MUHAFIZ_TUMU = "muhafiz_tumu"

    /** Yatış hatırlatması + gün sonu muhasebesi. */
    const val YATIS = "yatis"

    private const val MUHAFIZ_ONEKI = "muhafiz_"
    private const val MUHASEBE_ONEKI = "muhasebe_"
    private val YATIS_DESENI = Regex("""^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_(yatis|muhasebe)(_\d+)?$""")

    /** JS `yatisSahipliMi` (= `yatisKimligiMi`). */
    fun yatisKimligiMi(kimlik: String): Boolean =
        YATIS_DESENI.matches(kimlik) || kimlik.startsWith(MUHASEBE_ONEKI)

    /** Bu kimlik bu sahipliğe mi ait? Bilinmeyen sahip HİÇBİR şeyle eşleşmez (toplu silme kazası olmasın). */
    fun eslesir(sahip: String, kimlik: String): Boolean = when (sahip) {
        MUHAFIZ_PLAN -> MuhafizPlanKimligi.planKimligiMi(kimlik) || MuhafizPlanKimligi.eskiErtelemeKimligiMi(kimlik)
        MUHAFIZ_TUMU -> kimlik.startsWith(MUHAFIZ_ONEKI) && !yatisKimligiMi(kimlik)
        YATIS -> yatisKimligiMi(kimlik)
        else -> false
    }
}
