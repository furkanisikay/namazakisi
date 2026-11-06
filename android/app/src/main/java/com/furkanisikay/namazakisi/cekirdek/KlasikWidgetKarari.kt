package com.furkanisikay.namazakisi.cekirdek

/**
 * Klasik (yeşil) widget'ların görünüm kararı — SAF (Android import ETMEZ).
 *
 * Widget 1.0'ın (0.21) görünümü, Widget 2.0 (issue #275) ile değiştirilince kaybolmuştu;
 * sahip isteğiyle AYRI sağlayıcılar olarak geri geldi (`NamazKlasikWidget`,
 * `NamazKlasikGenisWidget`). Görünüm eskisidir, veri modeli Widget 2.0'ındır:
 *
 *  - "Sıradaki" GÜNEŞ DAHİL bir sonraki vakit girişidir (eski widget "güneşe:" de
 *    yazıyordu). Bu yüzden `VakitDurumu.sonraki` KULLANILMAZ (o güneşi atlar).
 *  - Liste günü saat diliminden değil NAMAZ GÜNÜ `tarih`'ten gelir
 *    (`VakitCizelgesi.gosterilecekGun`): eski `DAY_OF_YEAR` karşılaştırması gece
 *    yarısından sonra yatsı sürerken yanlış günü gösterirdi.
 *  - Vurgulanan satır `ms <= şimdi` olan SON giriştir (güneş dahil) — eski davranış.
 */
object KlasikWidgetKarari {

    /** Sıra eski widget'la aynı: güneş dahil altı satır. */
    val SIRA = listOf(
        VakitKodlari.SABAH, VakitKodlari.GUNES, VakitKodlari.OGLE,
        VakitKodlari.IKINDI, VakitKodlari.AKSAM, VakitKodlari.YATSI,
    )

    /**
     * Geniş widget satır adı. Eski görünümde sabah satırı "İmsak" yazar (İngilizcede
     * JS `vakit.imsakVakti` gibi "Fajr").
     */
    fun satirAdi(kod: String, dil: String = MetinDili.TR, adlar: VakitAdlari? = VakitAdlari.etkin): String =
        if (kod == VakitKodlari.SABAH) adlar?.imsakVakti ?: MetinDili.metinler(dil).imsakSatiri
        else VakitKodlari.gorunenAd(kod, dil, adlar)

    /**
     * Yönelme hâli (sabit harita; `toLowerCase` İ'yi bozar). Küçük widget küçük harfli
     * ve iki noktalı ("öğleye:"), geniş widget büyük harfle ("Öğleye") yazar; altında
     * geri sayım akar. Türkçe dışında hal eki yok: iki boyutta da dilin kalıbı
     * (`CekirdekMetinleri.yonelme`, İngilizce "Dhuhr in"; geri sayım cümleyi tamamlar).
     * Kullanıcı vakit adı takımı seçtiyse ([adlar]) Türkçede de çekim TÜRETİLMEZ: ad
     * çekimsiz kalıba girer ("Öğle:").
     */
    fun yonelmeHali(
        kod: String,
        buyukHarf: Boolean,
        dil: String = MetinDili.TR,
        adlar: VakitAdlari? = VakitAdlari.etkin,
    ): String {
        if (MetinDili.coz(dil) != MetinDili.TR || adlar?.widgetAdi(kod) != null) {
            if (kod !in SIRA) return kod
            return MetinDili.bicim(MetinDili.metinler(dil).yonelme, "ad" to VakitKodlari.gorunenAd(kod, dil, adlar))
        }
        val (kucuk, buyuk) = when (kod) {
            VakitKodlari.SABAH -> "sabaha" to "Sabaha"
            VakitKodlari.GUNES -> "güneşe" to "Güneşe"
            VakitKodlari.OGLE -> "öğleye" to "Öğleye"
            VakitKodlari.IKINDI -> "ikindiye" to "İkindiye"
            VakitKodlari.AKSAM -> "akşama" to "Akşama"
            VakitKodlari.YATSI -> "yatsıya" to "Yatsıya"
            else -> kod to kod
        }
        return if (buyukHarf) buyuk else "$kucuk:"
    }

    /** Bir sonraki vakit girişi (güneş dahil); veri tükendiyse `null`. */
    fun sonrakiGiris(vakitler: List<VakitAni>, simdiMs: Long): VakitAni? =
        vakitler.filter { it.ms > simdiMs }.minByOrNull { it.ms }

    /** Liste satırı: [aktif] = şu an içinde bulunulan giriş (güneş dahil). */
    data class Satir(val kod: String, val ms: Long?, val aktif: Boolean)

    /**
     * Geniş widget'ın altı satırı. Gün: aktif kılınabilir vaktin, yoksa sıradakinin
     * namaz günü. Güneş→öğle arasında aktif satır "Güneş" olur (eski davranış).
     */
    fun satirlar(vakitler: List<VakitAni>, simdiMs: Long): List<Satir> {
        val gun = VakitCizelgesi.gosterilecekGun(VakitCizelgesi.durumHesapla(vakitler, simdiMs))
        val gunun = if (gun == null) emptyList() else vakitler.filter { it.tarih == gun }
        val aktif = gunun.filter { it.ms <= simdiMs }.maxByOrNull { it.ms }
        return SIRA.map { kod ->
            val giris = gunun.firstOrNull { it.kod == kod }
            Satir(kod, giris?.ms, aktif != null && giris != null && aktif.kod == kod && aktif.ms == giris.ms)
        }
    }
}
