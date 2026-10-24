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

    /** Birimli süre parçası: iri rakam + küçük birim. [saniye] parçası yalnız etkileşimli modda çizilir. */
    data class Parca(val sayi: String, val birim: String, val saniye: Boolean = false)

    /**
     * Sayaç BİRİMLİDİR: "1 sa 16 dk", saatin altında "16 dk 42 sn". Eski birimsiz "1:16"
     * hem 1 saat 16 dakika hem 1 dakika 16 saniye okunabiliyordu (ve tile/liste "1 sa 16 dk"
     * yazıyordu — iki yüzey aynı şeyi iki biçimde söylüyordu).
     */
    data class Sayac(val parcalar: List<Parca>) {
        /** Ambient / ekran görüntüsü kipinde saniye parçası düşer. */
        fun gorunur(saniyeGoster: Boolean): List<Parca> = if (saniyeGoster) parcalar else parcalar.filterNot { it.saniye }

        /** Rakam karakteri sayısı (yazı boyu seçimi: 4 hane dar ekrana sığsın). */
        fun haneSayisi(saniyeGoster: Boolean): Int = gorunur(saniyeGoster).filterNot { it.saniye }.sumOf { it.sayi.length }
    }

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

    fun sayac(kalanMs: Long, dil: String = "tr"): Sayac {
        val d = saatDili(dil)
        val toplamSn = (kalanMs.coerceAtLeast(0L)) / SN
        val sa = toplamSn / 3600
        val dk = (toplamSn % 3600) / 60
        val sn = toplamSn % 60
        val saniye = Parca(sn.toString().padStart(2, '0'), d.birimSn, saniye = true)
        return if (sa > 0) {
            Sayac(listOf(Parca("$sa", d.birimSa), Parca("$dk", d.birimDk)))
        } else {
            Sayac(listOf(Parca("$dk", d.birimDk), saniye))
        }
    }

    fun altYazi(mod: KalanSure.Mod, dil: String = "tr"): String = saatDili(dil).altYazi(mod)

    /** "Öğle vaktinin çıkmasına 1 saat 58 dakika" — ekran görüntüsü hattı bu kalıbı arar. */
    fun sayacAciklamasi(s: VakitHesabi.SayilanAn, simdi: Long, dil: String = "tr"): String =
        saatDili(dil).sayacAciklamasi(s.ad(dil), s.mod, VakitHesabi.kalanSesliMetni(s.kalanMs(simdi), dil))

    /** Ana ekran "Kıldım" düğmesinin açıklaması (hat sözleşmesi: "… kıldım olarak işaretleyin"). */
    fun dugmeAciklamasi(ad: String, dil: String = "tr"): String = saatDili(dil).dugmeAciklamasi(ad)

    fun kur(yuk: Yuk, simdi: Long, bugun: String, bekleyen: Set<String>, dil: String = "tr"): Gorunum? {
        val d = saatDili(dil)
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
            append(sayacAciklamasi(s, simdi, dil))
            if (kilindi) append(d.kilindiEki)
            if (acil) append(d.sonDakikaEki(SaatPaleti.ACIL_ESIK_DK))
            if (ozet != null) append(d.bugunEki(kilinan, GunDurumu.FARZ_SAYISI))
        }

        return Gorunum(
            sayilan = s,
            adSatiri = if (acil) d.acilAdSatiri(s.ad(dil), SaatPaleti.ACIL_ESIK_DK) else s.ad(dil),
            renk = renk,
            acil = acil,
            altYazi = altYazi(s.mod, dil),
            sayac = sayac(s.kalanMs(simdi), dil),
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
    fun onaySorusu(ad: String, dil: String = "tr"): String =
        onaySorusuSatirlari(ad, dil).let { (ilk, ikinci) -> "$ilk $ikinci" }

    /** Onay sorusunun ekrandaki iki satırı (yuvarlak ekranda tek satır kenarda kırpılıyordu). */
    fun onaySorusuSatirlari(ad: String, dil: String = "tr"): Pair<String, String> = saatDili(dil).onaySorusuSatirlari(ad)

    /**
     * Onay dokunuşu anındaki YENİDEN doğrulama: katman açıkken vakit değiştiyse (ör. 05:14:50
     * yatsı onayı açıldı, 05:15'te imsak girdi) ya da telefon arada işaretlediyse yazılmaz.
     * Sonuç `false` ise onay katmanı başarı GÖSTERMEZ, [VAKIT_DEGISTI] yazar.
     */
    fun onayGecerliMi(yuk: Yuk, simdi: Long, bugun: String, bekleyen: Set<String>, tarih: String, vakit: String): Boolean =
        VakitHesabi.satirlar(yuk, simdi, bugun, bekleyen)
            .any { it.tarih == tarih && it.vakit == vakit && it.isaretlenebilir }

    /** Onay reddedildiğinde katmanın kısa süre gösterdiği metin (arayüz dili: kibar "siz"). */
    const val VAKIT_DEGISTI = "Vakit değişti, işaretlenmedi."

    fun vakitDegisti(dil: String = "tr"): String = saatDili(dil).vakitDegisti

    /**
     * Onaydan sonra gösterilen dua (sahip isteği: "Kılındı" yerine "Allah kabul etsin").
     * Telefon `core/samimiyet/kabulDuasi.ts > KABUL_DUASI` ile aynı sabit kalıp; saatte
     * dönüşüm yok (tek kalıp, kısa ekran).
     */
    const val KABUL_DUASI = "Allah kabul etsin"

    /** [KABUL_DUASI]nın [dil]deki sabit kalıbı (İngilizce JS `samimiyet.kabulDuasi`). */
    fun kabulDuasi(dil: String = "tr"): String = saatDili(dil).kabulDuasi
}
