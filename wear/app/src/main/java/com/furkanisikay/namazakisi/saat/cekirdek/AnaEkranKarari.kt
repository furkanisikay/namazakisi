package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Ana ekranın (vakit yayı + sayaç + "Kıldım") görünüm kararı — SAF, JVM testli.
 *
 * Compose katmanı yalnız bunu çizer; "hangi vakit, ne kadar kaldı, hangi renk,
 * düğme ne yapar, ekran okuyucu ne der" soruları burada cevaplanır. Sayılan an
 * `VakitHesabi.sayilanAn`'dan (tek kural), gün noktaları `GunDurumu.ozet`'ten gelir
 * (ikinci sayım YOK).
 */
object AnaEkranKarari {

    /** Sayaç: iri "S:DD" + küçük ":ss" (saniye yalnız etkileşimli modda çizilir). */
    data class Sayac(val ana: String, val saniye: String)

    enum class Dugme {
        /** Vakit sürüyor, kılınmadı → "Kıldım" (iki dokunuşlu onay) */
        ISARETLE,

        /** Kılındı (telefonda ya da saatte işaretlendi) */
        KILINDI,

        /** Saatte işaretlendi, telefon onayı bekleniyor */
        ESITLENIYOR,

        /** İşaretlenecek vakit yok (güneş→öğle, yük sınırı) */
        YOK,
    }

    data class Gorunum(
        val sayilan: VakitHesabi.SayilanAn,
        /** Vakit adı; son dakikalarda "Öğle · son 15 dk" (renk tek başına anlam taşımaz) */
        val adSatiri: String,
        /** Ad, yay ve saniyenin rengi (ARGB): kılındı → eylem yeşili, acil → acil, değilse vakit tonu */
        val renk: Long,
        val acil: Boolean,
        val altYazi: String,
        val sayac: Sayac,
        /** Yayın parlak (kalan) kısmı [0,1] */
        val kalanOran: Float,
        /** Kerahat bandının yay üzerindeki konumu [bas, 1] (vakit girişi = 0, çıkış = 1) */
        val kerahatBandi: ClosedFloatingPointRange<Float>?,
        val dugme: Dugme,
        /** Düğmenin işaretleyeceği satır (yalnız ISARETLE) */
        val satir: VakitHesabi.Satir?,
        /** Beş farz vaktinin durumu; aktif günün özeti yoksa boş */
        val noktalar: List<GunDurumu.Hal>,
        /** `noktalar` içinde şu anki vaktin sırası (yalnız çıkışa sayarken) */
        val aktifNokta: Int?,
        val kilinanSayisi: Int,
        /** Tek düğüm ekran okuyucu metni — DAKİKA çözünürlüklü (her saniye okunmasın) */
        val aciklama: String,
    )

    private const val SN = 1_000L

    fun sayac(kalanMs: Long): Sayac {
        val toplamSn = (kalanMs.coerceAtLeast(0L)) / SN
        val sa = toplamSn / 3600
        val dk = (toplamSn % 3600) / 60
        val sn = toplamSn % 60
        return Sayac("$sa:${dk.toString().padStart(2, '0')}", ":${sn.toString().padStart(2, '0')}")
    }

    fun altYazi(mod: KalanSure.Mod): String =
        if (mod == KalanSure.Mod.CIKIS) "vaktin çıkmasına" else "vaktin girmesine"

    /** "Öğle vaktinin çıkmasına 1 saat 58 dakika" — ekran görüntüsü hattı bu kalıbı arar. */
    fun sayacAciklamasi(s: VakitHesabi.SayilanAn, simdi: Long): String {
        val fiil = if (s.mod == KalanSure.Mod.CIKIS) "çıkmasına" else "girmesine"
        return "${s.ad} vaktinin $fiil ${VakitHesabi.kalanSesliMetni(s.kalanMs(simdi))}"
    }

    /** Ana ekran "Kıldım" düğmesinin açıklaması (hat sözleşmesi: "… kıldım olarak işaretleyin"). */
    fun dugmeAciklamasi(ad: String): String = "$ad vaktini kıldım olarak işaretleyin"

    fun kur(yuk: Yuk, simdi: Long, bugun: String, bekleyen: Set<String>): Gorunum? {
        val s = VakitHesabi.sayilanAn(yuk, simdi) ?: return null
        val satirlar = VakitHesabi.satirlar(yuk, simdi, bugun, bekleyen)
        val satir = if (s.mod == KalanSure.Mod.CIKIS) {
            satirlar.firstOrNull { it.tarih == s.tarih && it.vakit == s.vakit }
        } else {
            null
        }
        val dugme = when {
            satir == null -> Dugme.YOK
            satir.esitleniyor -> Dugme.ESITLENIYOR
            satir.kilindi -> Dugme.KILINDI
            satir.isaretlenebilir -> Dugme.ISARETLE
            else -> Dugme.YOK
        }
        val kilindi = dugme == Dugme.KILINDI || dugme == Dugme.ESITLENIYOR
        // Kılınmış vaktin son dakikası acil DEĞİLDİR (yapılacak bir şey kalmadı).
        val acil = !kilindi && s.acilMi(simdi)
        val renk = when {
            kilindi -> SaatPaleti.EYLEM
            acil -> SaatPaleti.ACIL
            else -> SaatPaleti.vakitRengi(s.vakit)
        }
        val ozet = GunDurumu.ozet(yuk, simdi, bugun, bekleyen)
        val noktalar = ozet?.haller ?: emptyList()
        val aktifNokta = ozet?.satirlar
            ?.indexOfFirst { s.mod == KalanSure.Mod.CIKIS && it.tarih == s.tarih && it.vakit == s.vakit }
            ?.takeIf { it >= 0 }
        val kilinan = ozet?.kilinanSayisi ?: 0

        val bant = VakitHesabi.kerahatBandi(yuk, s)?.let { (bas, son) ->
            val giris = s.baslangic ?: return@let null
            val uzunluk = (s.hedef - giris).toFloat()
            if (uzunluk <= 0f) return@let null
            ((bas - giris) / uzunluk).coerceIn(0f, 1f)..((son - giris) / uzunluk).coerceIn(0f, 1f)
        }

        val aciklama = buildString {
            append(sayacAciklamasi(s, simdi))
            if (kilindi) append(", kılındı")
            if (acil) append(", son ${SaatPaleti.ACIL_ESIK_DK} dakika")
            if (ozet != null) append(". Bugün $kilinan/${GunDurumu.FARZ_SAYISI} kılındı")
        }

        return Gorunum(
            sayilan = s,
            adSatiri = if (acil) "${s.ad} · son ${SaatPaleti.ACIL_ESIK_DK} dk" else s.ad,
            renk = renk,
            acil = acil,
            altYazi = altYazi(s.mod),
            sayac = sayac(s.kalanMs(simdi)),
            kalanOran = s.kalanOran(simdi),
            kerahatBandi = bant,
            dugme = dugme,
            satir = satir.takeIf { dugme == Dugme.ISARETLE },
            noktalar = noktalar,
            aktifNokta = aktifNokta,
            kilinanSayisi = kilinan,
            aciklama = aciklama,
        )
    }

    /**
     * Onay sorusu. Vakit adına hal eki ÜRETİLMEZ (Türkçe ek uyumu tuzağı): "Öğle namazını".
     */
    fun onaySorusu(ad: String): String = "$ad namazını kıldınız mı?"
}
