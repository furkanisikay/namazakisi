package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Ham dizeye göre süreç düzeyi çözüm önbelleği (denetim D-19).
 *
 * Saat yükü 30–90 KB JSON'dur ve eskiden her `YukDeposu.yuk()` çağrısında baştan
 * ayrıştırılıyordu: bir alarm tikinde ~5, her yük gelişinde ~12 tam ayrıştırma. Yük
 * değişmediği sürece SharedPreferences aynı `String` örneğini döndürür; anahtar o dize
 * olduğu için önbellek kendiliğinden doğru kalır (yeni yük = yeni dize = yeniden çözüm).
 * Ayrı geçersiz kılma çağrısı YOK — unutulabilecek bir adım bırakmamak için.
 *
 * Tek girdi tutar (son yük); `@Volatile` tek nesne yazımı iş parçacıkları arasında
 * yırtılmaz. Yarışta iki iş parçacığı aynı dizeyi iki kez çözebilir — zararsız.
 */
class HamCozumOnbellegi<T : Any>(private val coz: (String) -> T?) {
    private class Girdi<T>(val ham: String, val deger: T?)

    @Volatile
    private var son: Girdi<T>? = null

    /** `ham` daha önce çözüldüyse önceki sonucu, değilse çözüp saklar. */
    fun al(ham: String?): T? {
        if (ham == null) return null
        val s = son
        // `==` önce referansa bakar; aynı içerikli farklı örnekte karakter karşılaştırması
        // (bellek taraması) yine de JSON ayrıştırmasından çok ucuzdur.
        if (s != null && s.ham == ham) return s.deger
        val deger = coz(ham)
        son = Girdi(ham, deger)
        return deger
    }

    /** Çağıran dizeyi ZATEN çözdüyse (ör. kaydederken) sonucu ikinci kez çözmeden koyar. */
    fun koy(ham: String, deger: T?) {
        son = Girdi(ham, deger)
    }
}

/** `YukDeposu.kaydet` kararları — Android'den bağımsız, JVM testli. */
object YukKayitKarari {
    /**
     * Telefon AYNI yükü yeniden gönderdi (her açılışta `sonYukuCek`, DataItem tekrarları).
     *
     * @property bekleyen ayıklanmış iyimser "Kıldım" kümesi
     * @property yaz `false` ise diske HİÇBİR ŞEY yazılmaz ve yüzeyler tazelenmez
     */
    data class AyniYuk(val bekleyen: Set<String>, val yaz: Boolean)

    /**
     * Yük dizesi değişmedi ama iki küçük alan değişmiş olabilir: (a) son kayıttan beri
     * eklenen bekleyen "Kıldım" bu yükle ayıklanabilir; (b) arada daha yeni şema gelip
     * `guncellemeGerekli` yanmış olabilir — eski yük yeniden geldiyse bayrak sönmeli.
     */
    fun ayniYuk(yuk: Yuk, bekleyen: Set<String>, guncellemeGerekli: Boolean): AyniYuk {
        val ayiklanmis = VakitHesabi.bekleyeniAyikla(yuk, bekleyen)
        return AyniYuk(ayiklanmis, ayiklanmis != bekleyen || guncellemeGerekli)
    }

    /**
     * `son_gosterilen_ms` ayrı prefs dosyasına taşındı (her alarmda 90 KB'lık yük
     * dosyası yeniden yazılmasın). Yeni dosyada yoksa eski dosyadaki değer geçerlidir —
     * güncelleme anında "aynı uyarı iki kez çalmasın" hafızası kaybolmaz.
     */
    fun sonGosterilen(yeni: Long?, eski: Long?): Long = yeni ?: eski ?: 0L
}
