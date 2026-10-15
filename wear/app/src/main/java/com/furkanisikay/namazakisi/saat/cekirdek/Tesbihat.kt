package com.furkanisikay.namazakisi.saat.cekirdek

import kotlin.math.abs
import kotlin.math.sign

/**
 * Namaz sonrası tesbihat sayacı (issue #293) — SAF durum makinesi, JVM testli.
 *
 * Sıra (Müslim, Mesâcid 146): Sübhânallah ×33 → Elhamdülillâh ×33 → Allâhü ekber ×33
 * → yüzü tamamlayan bir kez "Lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehü'l-mülkü
 * ve lehü'l-hamdü ve hüve alâ külli şey'in kadîr". Toplam 100.
 *
 * Durumun tamamı TEK sayıdır (`toplam`, 0..100): faz ve faz içi sayı ondan türer.
 * Böylece kalıcılık tek bir tamsayıdır ve "geri al" yalnız bir eksiltmedir —
 * ayrı bir geçmiş yığını tutulmaz, süreç ölse de geri alma çalışır.
 */
object Tesbihat {
    const val FAZ_HEDEFI = 33
    const val TOPLAM = 100

    /**
     * Son dokunuştan bu kadar süre sonra açılan oturum ESKİMİŞTİR → sıfırdan başlar.
     * Tesbihat namazın hemen ardından çekilir; dünkü yarım oturumu bugünkü namazın
     * ardından "57/100" diye göstermek yanıltıcıdır. Bir sonraki vakte (en kısa
     * akşam→yatsı ~1,5 sa) yetişmeyecek kadar kısa, ara vermeye yetecek kadar uzun.
     */
    const val ESKIME_MS = 90L * 60 * 1000

    const val TEHLIL_METNI =
        "Lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehü'l-mülkü ve lehü'l-hamdü ve hüve alâ külli şey'in kadîr"

    const val KAYNAK = "Müslim, Mesâcid 146"

    /** @param baslangic bu fazdan önce sayılmış toplam */
    enum class Faz(val ad: String, val hedef: Int, val baslangic: Int) {
        SUBHANALLAH("Sübhânallah", FAZ_HEDEFI, 0),
        ELHAMDULILLAH("Elhamdülillâh", FAZ_HEDEFI, FAZ_HEDEFI),
        ALLAHU_EKBER("Allâhü ekber", FAZ_HEDEFI, 2 * FAZ_HEDEFI),
        TEHLIL("Lâ ilâhe illallâh", 1, 3 * FAZ_HEDEFI),
    }

    data class Durum(val toplam: Int = 0) {
        init {
            require(toplam in 0..TOPLAM) { "toplam 0..$TOPLAM olmalı: $toplam" }
        }

        val tamamMi: Boolean get() = toplam >= TOPLAM

        /** Tamamlanınca son faz (tehlil) gösterilir. */
        val faz: Faz get() = Faz.entries.last { toplam >= it.baslangic }

        /** Fazın içindeki sayı (0..hedef). */
        val fazSayisi: Int get() = toplam - faz.baslangic

        /** Faz halkası için 0..1. */
        val fazIlerlemesi: Float get() = fazSayisi.toFloat() / faz.hedef
    }

    /** Dokunuşun ürettiği his: titreşim deseni buna göre seçilir. */
    enum class Olay {
        /** Hiçbir şey değişmedi (tamamken sayma, sıfırda geri alma). */
        YOK,
        TIK,
        /** Bir 33'lük faz bitti, sıradaki başladı. */
        FAZ_TAMAM,
        /** 100'e ulaşıldı. */
        BITTI,
        GERI_ALINDI,
    }

    data class Sonuc(val durum: Durum, val olay: Olay)

    fun say(d: Durum): Sonuc {
        if (d.tamamMi) return Sonuc(d, Olay.YOK)
        val yeni = Durum(d.toplam + 1)
        val olay = when {
            yeni.tamamMi -> Olay.BITTI
            yeni.faz != d.faz -> Olay.FAZ_TAMAM
            else -> Olay.TIK
        }
        return Sonuc(yeni, olay)
    }

    /** Son dokunuşu geri alır (yanlış dokunuş vesvesesine karşı); faz sınırını da geri geçer. */
    fun geriAl(d: Durum): Sonuc =
        if (d.toplam == 0) Sonuc(d, Olay.YOK) else Sonuc(Durum(d.toplam - 1), Olay.GERI_ALINDI)

    fun sifirla(): Durum = Durum(0)

    /**
     * Diskten okunan oturum hâlâ sürüyor mu? Bozuk sayı sıfıra düşer. Saat geri
     * alındıysa (`simdi < sonDokunusMs`) süre ölçülemez → oturum KORUNUR (sayım
     * kaybettirmek, eski oturumu göstermekten pahalıdır).
     */
    fun yukle(toplam: Int, sonDokunusMs: Long, simdi: Long): Durum {
        if (toplam !in 1..TOPLAM) return Durum(0)
        if (simdi >= sonDokunusMs && simdi - sonDokunusMs > ESKIME_MS) return Durum(0)
        return Durum(toplam)
    }

    /** Kadrandaki sürekli etkinlik yalnız YARIM oturumda anlamlıdır. */
    fun suruyorMu(d: Durum): Boolean = d.toplam in 1 until TOPLAM

    /** Kısa durum metni (Ongoing durumu, ekran okuyucu): "Elhamdülillâh · 12/33". */
    fun kisaMetin(d: Durum): String = "${d.faz.ad} · ${d.fazSayisi}/${d.faz.hedef}"
}

/**
 * Taç/çerçeve (rotary) dönüşünü sayıma çevirir — SAF, JVM testli.
 *
 * - Bir sayım için aynı YÖNDE `esikPiksel` kadar dönüş birikmeli; yön değişince birikim
 *   sıfırlanır (titreyen el ileri-geri küçük hareketlerle sayım üretmesin).
 * - Bir olay en fazla BİR sayım üretir ve sayımdan sonra birikim atılır: tek bir hızlı
 *   savuruş (büyük piksel değeri) birden çok sayıma dönüşmez.
 * - İki sayım arası en az `enAzAralikMs`: aynı çentiğin art arda gelen iki olayı çift
 *   saymasın. Bu aralıkta eşiği aşan dönüş YUTULUR (sayım yerine hiçbir şey): kullanıcı
 *   her sayımı titreşimle hisseder, eksik sayım fark edilir; fazlası edilmez.
 * - İki yön de sayar (çerçeveyi hangi yöne çevireceğini kullanıcı seçer).
 */
class TacBiriktirici(
    private val esikPiksel: Float,
    private val enAzAralikMs: Long = EN_AZ_ARALIK_MS,
) {
    private var birikim = 0f
    private var sonSayimMs: Long? = null

    /** @return bu olay bir sayım üretti mi */
    fun olay(piksel: Float, zamanMs: Long): Boolean {
        if (piksel == 0f || piksel.isNaN()) return false
        if (birikim != 0f && sign(piksel) != sign(birikim)) birikim = 0f
        birikim += piksel
        if (abs(birikim) < esikPiksel) return false
        birikim = 0f
        val son = sonSayimMs
        if (son != null && zamanMs >= son && zamanMs - son < enAzAralikMs) return false
        sonSayimMs = zamanMs
        return true
    }

    companion object {
        const val EN_AZ_ARALIK_MS = 120L
    }
}

/**
 * Tesbihat titreşim desenleri (issue #293). Muhafız kanal desenlerinden
 * (`MuhafizBildirimci.DESEN_*`) BİLEREK AYRI: onlar kanal özelliğidir, bunlar
 * ekran içi dokunuş hissidir. Desen = [bekle, titre, bekle, titre, ...] ms.
 */
object TesbihatHaptik {
    /** Her sayım: kısa tık (cihaz destekliyorsa sistemin hazır EFFECT_TICK'i). */
    const val TIK_MS = 20L

    /** Geri alma: iki çok kısa vuruş — sayımdan ayırt edilsin. */
    val GERI_AL_DESENI = longArrayOf(0, 15, 60, 15)

    /** Her 33'te: belirgin çift vuruş. */
    val FAZ_DESENI = longArrayOf(0, 180, 90, 180)

    /** 100'de: uzun bitiş — üç vuruş, sonuncusu uzun. */
    val BITIS_DESENI = longArrayOf(0, 200, 100, 200, 100, 500)

    /** Desendeki toplam titreşim süresi (tek indisler). */
    fun titresimSuresi(desen: LongArray): Long = desen.filterIndexed { i, _ -> i % 2 == 1 }.sum()
}
