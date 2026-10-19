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
 * SAHİP KARARI: bu komplikasyon YALNIZ kalan süreyi taşır. Çıkış saati ("çıkış 15:42")
 * ve sıradaki vakit burada YAZILMAZ — kadran yuvası dardır, en önemli ifade olan süre
 * sığmıyordu. O bilgiler AYRI kaynaklardadır (`VakitSiniri`: "Vakit çıkış saati",
 * "Sıradaki namaz").
 *
 * Geri sayım her zaman aralığın sonuna (sıradaki vaktin girişi = şu anki vaktin
 * çıkışı) kurulur; değişen yalnız neyin sayıldığıdır:
 *  - Farz vakti sürüyorsa (sabah, öğle, ikindi, akşam, yatsı) → o vaktin ÇIKIŞI:
 *    kısa başlık vaktin adı ("Öğle"), uzun başlık "Öğle çıkışına".
 *  - Güneş doğduktan öğleye kadar farz vakti YOK → öğlenin GİRİŞİ: "Öğleye".
 *  - Önceki vakit bilinmiyorsa (yükün ilk anı) → sıradakinin girişi.
 *
 * Metin (sistemin çizdiği süre) iki türde de YALNIZ süredir; başlık en fazla
 * "<vakit> çıkışına" kadar kısa bir yönlendirmedir. Adlar SABİT haritadan gelir
 * (`toUpperCase`/ek üretimi yok — Türkçe İ tuzağı). Kısa başlıklar en fazla 6
 * karakterdir (SHORT_TEXT başlığı ~7 karakter taşır).
 */
object KalanSure {
    enum class Mod { CIKIS, GIRIS }

    data class Gosterim(
        val mod: Mod,
        /** SHORT_TEXT başlığı (≤ 6 karakter): vaktin adı */
        val kisaBaslik: String,
        /**
         * LONG_TEXT başlığı: çıkışa sayarken "Öğle çıkışına", girişe sayarken "Öğleye".
         * Saat YOK. Metin satırı yalnız süredir → kadran ikisini yan yana çizerse
         * "Öğle çıkışına 1 sa 12 dk", yalnız metni çizerse "1 sa 12 dk" okunur.
         */
        val uzunBaslik: String,
        /** Ekran okuyucu açıklaması (süre hariç, saat yok) */
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

    fun yonelme(vakit: String): String = YONELME[vakit] ?: kisaAd(vakit)

    /**
     * Sayılan anın TEK kuralı: farz vakti sürüyorsa ÇIKIŞ, değilse (güneş→öğle ya da
     * önceki vakit bilinmiyor) GİRİŞ. `VakitHesabi.sayilanAn` de bunu okur.
     */
    fun mod(simdikiVakit: String?): Mod =
        if (simdikiVakit != null && simdikiVakit != "gunes") Mod.CIKIS else Mod.GIRIS

    /**
     * @param simdikiVakit aralığın başındaki vakit (yoksa null)
     * @param siradakiVakit aralığın sonundaki vakit
     */
    fun gosterim(simdikiVakit: String?, siradakiVakit: String): Gosterim {
        return if (mod(simdikiVakit) == Mod.CIKIS) {
            val ad = kisaAd(simdikiVakit!!)
            Gosterim(Mod.CIKIS, ad, "$ad çıkışına", "$ad vaktinin çıkmasına kalan süre")
        } else {
            val yon = yonelme(siradakiVakit)
            // "İkindiye"/"Yatsıya" 6 karakteri aşar → kısa başlıkta yalnız ad.
            val kisa = if (yon.length <= 6) yon else kisaAd(siradakiVakit)
            Gosterim(Mod.GIRIS, kisa, yon, "${kisaAd(siradakiVakit)} vaktine kalan süre")
        }
    }
}

/**
 * "Vakit çıkış saati" ve "Sıradaki namaz" komplikasyonlarının ETİKETLERİ — SAF.
 *
 * Kalan süre komplikasyonundan AYRILAN bilgiler buradadır (sahip kararı: her yuva tek
 * bilgi taşır). İkisi de saat dizesini metin olarak verir; geri sayım YOK.
 */
object VakitSiniri {
    data class Etiket(
        /** SHORT_TEXT başlığı (≤ 6 karakter) */
        val kisaBaslik: String,
        /** SHORT_TEXT metni: yalnız saat ("15:42") */
        val kisaMetin: String,
        /** LONG_TEXT metni: "Öğle çıkışı 15:42" */
        val uzunMetin: String,
        val aciklama: String,
    )

    /**
     * Sayılan sınırın saati: farz sürüyorsa o vaktin ÇIKIŞI ("Çıkış" / "Öğle çıkışı 15:42"),
     * güneş→öğle arasında öğlenin GİRİŞİ ("Giriş" / "Öğle girişi 13:05"). Kural
     * `KalanSure.mod` ile AYNI — iki yuva aynı anı anlatır.
     */
    fun cikisSaati(simdikiVakit: String?, siradakiVakit: String, saat: String): Etiket =
        if (KalanSure.mod(simdikiVakit) == KalanSure.Mod.CIKIS) {
            val ad = KalanSure.kisaAd(simdikiVakit!!)
            Etiket("Çıkış", saat, "$ad çıkışı $saat", "$ad vaktinin çıkış saati $saat")
        } else {
            val ad = KalanSure.kisaAd(siradakiVakit)
            Etiket("Giriş", saat, "$ad girişi $saat", "$ad vaktinin giriş saati $saat")
        }

    /**
     * Sıradaki NAMAZ: "İkindi" / "15:42". Güneş namaz değildir; çağıran aralıkları
     * `ZamanCizelgesi.araliklar(yalnizNamaz = true)` ile kurar (sabahta sıradaki öğledir).
     */
    fun siradaki(vakit: String, saat: String): Etiket {
        val ad = KalanSure.kisaAd(vakit)
        return Etiket(ad, saat, "Sıradaki: $ad $saat", "Sıradaki namaz $ad, giriş $saat")
    }
}
