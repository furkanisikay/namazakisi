package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Komplikasyon zaman çizelgesinin KURALLARI — SAF (android.* import etmez).
 *
 * Yaşanmış çökme (v0.37.0, Galaxy Watch): çizelgenin varsayılanı "veri yok"
 * (NO_DATA), girdileri SHORT_TEXT/RANGED_VALUE… idi. Kütüphane
 * (`ComplicationDataTimeline.validate`, watchface-complications-data-source 1.3.0)
 * her NO_DATA dışı girdinin türünü VARSAYILANIN türüyle karşılaştırır →
 * `IllegalArgumentException`. İstisna `SuspendingTimelineComplicationDataSourceService`
 * içinde işleyicisiz bir coroutine'de fırladığı için süreç ölüyordu; kadrana
 * komplikasyon eklenince uygulama her açılışta (yüzey tazeleme isteği) çöktü.
 *
 * Kural: varsayılan GERÇEK veridir ve tüm girdiler onunla AYNI türdedir; türü
 * farklı ya da boş girdi atılır (o aralıkta varsayılan görünür). Aralık `bas < bitis`
 * olmalıdır (`TimeInterval` aksi halde fırlatır).
 */
object KomplikasyonCizelgesi {
    data class Girdi<T>(val baslangic: Long, val bitis: Long, val veri: T)

    data class Plan<T : Any>(val varsayilan: T?, val girdiler: List<Girdi<T>>)

    fun <T : Any, K> kur(varsayilan: T?, ham: List<Triple<Long, Long, T?>>, tur: (T) -> K): Plan<T> {
        if (varsayilan == null) return Plan(null, emptyList())
        val beklenen = tur(varsayilan)
        val girdiler = ham.mapNotNull { (bas, bitis, veri) ->
            if (veri == null || bas >= bitis || tur(veri) != beklenen) null else Girdi(bas, bitis, veri)
        }
        return Plan(varsayilan, girdiler)
    }

    /**
     * Teslim denemeleri: tüm çizelge → ilk [KISA_CIZELGE] girdi → yalnız varsayılan (0).
     * Binder sınırı (TransactionTooLargeException) ya da beklenmedik bir doğrulama
     * hatası uygulamayı öldürmesin, yüzey daha kısa bir ufukla da olsa dolsun.
     */
    fun denemeBoyutlari(girdiSayisi: Int): List<Int> =
        listOf(girdiSayisi, minOf(girdiSayisi, KISA_CIZELGE), 0).distinct()

    const val KISA_CIZELGE = 24
}

/**
 * "Vaktin çıkışına kalan süre" komplikasyonunun ETİKETLERİ — SAF.
 *
 * Geri sayım her zaman aralığın sonuna (sıradaki vaktin girişi = şu anki vaktin
 * çıkışı) kurulur; değişen yalnız neyin sayıldığıdır:
 *  - Farz vakti sürüyorsa (sabah, öğle, ikindi, akşam, yatsı) → o vaktin ÇIKIŞI:
 *    başlık vaktin adı ("Öğle"), uzun metin "Öğle · 1 sa 12 dk kaldı".
 *  - Güneş doğduktan öğleye kadar farz vakti YOK → öğlenin GİRİŞİ: "Öğleye".
 *  - Önceki vakit bilinmiyorsa (yükün ilk anı) → sıradakinin girişi.
 *
 * Adlar SABİT haritadan gelir (`toUpperCase`/ek üretimi yok — Türkçe İ tuzağı).
 * Kısa başlıklar en fazla 6 karakterdir (SHORT_TEXT başlığı ~7 karakter taşır).
 */
object KalanSure {
    enum class Mod { CIKIS, GIRIS }

    data class Gosterim(
        val mod: Mod,
        /** SHORT_TEXT / RANGED_VALUE başlığı (≤ 6 karakter) */
        val kisaBaslik: String,
        /** LONG_TEXT şablonu — `^1` sistemin çizdiği süredir */
        val uzunSablon: String,
        /** Ekran okuyucu açıklaması (süre hariç) */
        val aciklama: String,
    )

    private val KISA = mapOf(
        "imsak" to "Sabah", "gunes" to "Güneş", "ogle" to "Öğle",
        "ikindi" to "İkindi", "aksam" to "Akşam", "yatsi" to "Yatsı",
    )

    /** Yönelme hâli ("…-e kalan") — sabit harita, ek üretilmez. */
    private val YONELME = mapOf(
        "imsak" to "Sabaha", "gunes" to "Güneşe", "ogle" to "Öğleye",
        "ikindi" to "İkindiye", "aksam" to "Akşama", "yatsi" to "Yatsıya",
    )

    fun kisaAd(vakit: String): String = KISA[vakit] ?: vakit

    /**
     * @param simdikiVakit aralığın başındaki vakit (yoksa null)
     * @param siradakiVakit aralığın sonundaki vakit
     * @param bitisSaati sıradaki vaktin saati ("15:42")
     */
    /**
     * Sayılan anın TEK kuralı: farz vakti sürüyorsa ÇIKIŞ, değilse (güneş→öğle ya da
     * önceki vakit bilinmiyor) GİRİŞ. `VakitHesabi.sayilanAn` de bunu okur.
     */
    fun mod(simdikiVakit: String?): Mod =
        if (simdikiVakit != null && simdikiVakit != "gunes") Mod.CIKIS else Mod.GIRIS

    fun gosterim(simdikiVakit: String?, siradakiVakit: String, bitisSaati: String): Gosterim {
        return if (mod(simdikiVakit) == Mod.CIKIS) {
            val ad = kisaAd(simdikiVakit!!)
            Gosterim(
                Mod.CIKIS, ad, "$ad · ^1 kaldı",
                "$ad vaktinin çıkmasına kalan süre; ${kisaAd(siradakiVakit)} $bitisSaati",
            )
        } else {
            val yonelme = YONELME[siradakiVakit] ?: kisaAd(siradakiVakit)
            // "İkindiye"/"Yatsıya" 6 karakteri aşar → kısa başlıkta yalnız ad.
            val kisa = if (yonelme.length <= 6) yonelme else kisaAd(siradakiVakit)
            Gosterim(
                Mod.GIRIS, kisa, "$yonelme ^1",
                "${kisaAd(siradakiVakit)} vaktine kalan süre, giriş $bitisSaati",
            )
        }
    }
}
