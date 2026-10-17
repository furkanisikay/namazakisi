package com.furkanisikay.namazakisi.saat.komplikasyon

import android.os.Build
import androidx.wear.watchface.complications.data.ColorRamp
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.GoalProgressComplicationData
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.data.WeightedElementsComplicationData
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.GunDurumu
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.komplikasyon.KomplikasyonOrtak.duz
import com.furkanisikay.namazakisi.saat.veri.YukDeposu

/**
 * Aktif günün durumundan beslenen komplikasyonlar (issue #281): günlük ilerleme ve
 * gün dağılımı. Kaynak `GunDurumu`dur — "Bugün" tile'ı ile AYNI sayıyı gösterirler.
 *
 * Zaman çizelgesi vakit sınırlarında değişir (vakit girer, imsakta gün döner);
 * kılınmışlık değişince `Senkron.yuzeyleriTazele` çizelgeyi yeniden kurdurur.
 * `UPDATE_PERIOD_SECONDS=0`: periyodik uyandırma yok.
 *
 * Wear OS 4 (API 33) öncesinde GOAL_PROGRESS / WEIGHTED_ELEMENTS türleri yoktur →
 * her veri kaynağının bir "Yedek" ikizi vardır, manifestte `@bool/api33_alti` ile
 * yalnız eski sistemde etkinleşir ve yalnız eski türleri bildirir.
 */
abstract class GunDurumuKomplikasyonu : GuvenliKomplikasyonServisi() {

    protected abstract fun veri(tur: ComplicationType, ozet: GunDurumu.Ozet): ComplicationData?

    override fun araliklar(tur: ComplicationType): List<Triple<Long, Long, ComplicationData?>> {
        val depo = YukDeposu(this)
        val yuk = depo.yuk() ?: return emptyList()
        return GunDurumu.cizelge(yuk, System.currentTimeMillis(), depo.bekleyenler(), { VakitHesabi.tarih(it) })
            .map { a -> Triple(a.baslangic, a.bitis, veri(tur, a.ozet)) }
    }

    /**
     * Veri yokken / çizelge tükenince: sönük dilimler + "—". "0/5" YAZILMAZ — kullanıcı
     * "hiç kılmamışım" diye okurdu; durum bilinmiyor demektir.
     */
    override fun varsayilan(tur: ComplicationType): ComplicationData? = veri(tur, BOS)

    /** Önizleme: öğleden sonra, üç vakit kılınmış, ikindi bekliyor. */
    override fun onizleme(type: ComplicationType): ComplicationData? = veri(type, ORNEK)

    protected fun aciklama(ozet: GunDurumu.Ozet): String {
        if (ozet === BOS) return "Vakit bilgisi bekleniyor; telefonda Namaz Akışı'nı açın"
        val kalan = ozet.satirlar.filter { GunDurumu.halBul(it) == GunDurumu.Hal.KALAN }.joinToString(", ") { it.ad }
        val temel = "Bugün ${GunDurumu.FARZ_SAYISI} vakitten ${ozet.kilinanSayisi} kılındı"
        return if (kalan.isEmpty()) temel else "$temel; kılınmamış: $kalan"
    }

    protected fun oran(ozet: GunDurumu.Ozet) =
        if (ozet === BOS) "—" else "${ozet.kilinanSayisi}/${GunDurumu.FARZ_SAYISI}"

    protected fun noktalar(ozet: GunDurumu.Ozet) = if (ozet === BOS) "—" else GunDurumu.noktalar(ozet)

    companion object {
        const val YESIL = 0xFF4CAF50.toInt()
        const val AMBER = 0xFFFFC107.toInt()
        const val SONUK = 0xFF424242.toInt()

        private val ORNEK = GunDurumu.Ozet(
            "",
            listOf("imsak", "ogle", "ikindi", "aksam", "yatsi").mapIndexed { i, v ->
                VakitHesabi.Satir(
                    tarih = "", vakit = v, ad = VakitHesabi.ADLAR.getValue(v), ms = 0L,
                    girdi = i <= 2, kilindi = i <= 1, esitleniyor = false, isaretlenebilir = i == 2,
                )
            },
        )

        private val BOS = GunDurumu.Ozet(
            "",
            listOf("imsak", "ogle", "ikindi", "aksam", "yatsi").map { v ->
                VakitHesabi.Satir(
                    tarih = "", vakit = v, ad = VakitHesabi.ADLAR.getValue(v), ms = 0L,
                    girdi = false, kilindi = false, esitleniyor = false, isaretlenebilir = false,
                )
            },
        )
    }
}

/** Günlük ilerleme — Wear OS 4+: GOAL_PROGRESS (kılınan / 5) + RANGED_VALUE + SHORT_TEXT. */
open class GunlukIlerlemeKomplikasyonServisi : GunDurumuKomplikasyonu() {
    override fun veri(tur: ComplicationType, ozet: GunDurumu.Ozet): ComplicationData? {
        val aciklama = duz(aciklama(ozet))
        val metin = duz(oran(ozet))
        val dokunus = KomplikasyonOrtak.uygulamayiAc(this)
        val ikon = KomplikasyonOrtak.monokrom(this, R.drawable.ic_vakit)
        val kilinan = ozet.kilinanSayisi.toFloat()
        val hedef = GunDurumu.FARZ_SAYISI.toFloat()
        // Tür sabiti de API 33'tür: karşılaştırma bile sürüm kapısının İÇİNDE olmalı.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && tur == ComplicationType.GOAL_PROGRESS) {
            return GoalProgressComplicationData.Builder(kilinan, hedef, aciklama)
                .setText(metin)
                .setTitle(duz("Namaz"))
                .setMonochromaticImage(ikon)
                .setColorRamp(ColorRamp(intArrayOf(YESIL, YESIL), false))
                .setTapAction(dokunus)
                .build()
        }
        return when (tur) {
            ComplicationType.RANGED_VALUE ->
                RangedValueComplicationData.Builder(kilinan, 0f, hedef, aciklama)
                    .setText(metin)
                    .setTitle(duz("Namaz"))
                    .setMonochromaticImage(ikon)
                    .setTapAction(dokunus)
                    .build()
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(metin, aciklama)
                    .setTitle(duz("Namaz"))
                    .setMonochromaticImage(ikon)
                    .setTapAction(dokunus)
                    .build()
            else -> null
        }
    }
}

/** Wear OS 4 öncesi ikiz: manifestte yalnız RANGED_VALUE + SHORT_TEXT bildirir. */
class GunlukIlerlemeYedekKomplikasyonServisi : GunlukIlerlemeKomplikasyonServisi()

/**
 * Gün dağılımı — Wear OS 4+: WEIGHTED_ELEMENTS (beş eşit dilim; kılındı yeşil,
 * vakti girmiş kılınmamış amber, henüz girmemiş sönük) + SHORT_TEXT (● ◐ ○).
 */
open class GunDagilimiKomplikasyonServisi : GunDurumuKomplikasyonu() {
    override fun veri(tur: ComplicationType, ozet: GunDurumu.Ozet): ComplicationData? {
        val aciklama = duz(aciklama(ozet))
        val dokunus = KomplikasyonOrtak.uygulamayiAc(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && tur == ComplicationType.WEIGHTED_ELEMENTS) {
            val dilimler = ozet.haller.map {
                WeightedElementsComplicationData.Element(
                    1f,
                    when (it) {
                        GunDurumu.Hal.KILINDI -> YESIL
                        GunDurumu.Hal.KALAN -> AMBER
                        GunDurumu.Hal.GIRMEDI -> SONUK
                    },
                )
            }
            return WeightedElementsComplicationData.Builder(dilimler, aciklama)
                .setText(duz(oran(ozet)))
                .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, R.drawable.ic_vakit))
                .setTapAction(dokunus)
                .build()
        }
        return when (tur) {
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(duz(noktalar(ozet)), aciklama)
                    .setTitle(duz(oran(ozet)))
                    .setTapAction(dokunus)
                    .build()
            else -> null
        }
    }
}

/** Wear OS 4 öncesi ikiz: manifestte yalnız SHORT_TEXT bildirir. */
class GunDagilimiYedekKomplikasyonServisi : GunDagilimiKomplikasyonServisi()
