package com.furkanisikay.namazakisi.saat.tile

import androidx.concurrent.futures.CallbackToFutureAdapter
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk
import com.furkanisikay.namazakisi.saat.cekirdek.ZamanCizelgesi
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import com.google.common.util.concurrent.ListenableFuture

/**
 * "Sıradaki vakit" tile'ı (issue #269; yeniden tasarım W1): "sıradaki NAMAZ ne zaman giriyor?"
 * Güneş namaz değildir: sabah vaktinde sıradaki Öğle'dir (`ZamanCizelgesi` `yalnizNamaz`).
 * (ana ekran "ne zaman çıkıyor?" sorusunu cevaplar; ikisi aynı sayıyı tekrarlamaz).
 *
 * Giriş saati en büyük öğe, üstünde vaktin adı kendi tonunda, altında "ne kadar sonra";
 * altta sıradaki iki vakit. Konum kalktı (ana ekranda ve telefonda var).
 *
 * Saniye YOK (karar 5). Dakikalık "ne kadar sonra" çizicide dinamik (şema 1.2,
 * `TileOrtak`); eski çizici statik yedeği ("Sıradaki vakit") gösterir. Her vakit
 * sınırında zaman çizelgesi kendiliğinden bir sonraki girdiye geçer (uyandırma yok).
 */
class VakitTileServisi : TileService() {

    override fun onTileRequest(requestParams: RequestBuilders.TileRequest): ListenableFuture<TileBuilders.Tile> =
        CallbackToFutureAdapter.getFuture { tamamlayici ->
            tamamlayici.set(tileOlustur(YukDeposu(this).yuk(), System.currentTimeMillis()))
            "VakitTile"
        }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest,
    ): ListenableFuture<ResourceBuilders.Resources> =
        CallbackToFutureAdapter.getFuture { tamamlayici ->
            tamamlayici.set(ResourceBuilders.Resources.Builder().setVersion(KAYNAK_SURUMU).build())
            "VakitTileKaynak"
        }

    private fun tileOlustur(yuk: Yuk?, simdi: Long): TileBuilders.Tile {
        val cizelge = TimelineBuilders.Timeline.Builder()
        // GEÇERLİLİK SÜRESİZ YEDEK GİRDİ: yük yoksa ya da zaman çizelgesindeki tüm
        // girdiler geçmişte kaldıysa tile boş kalmaz. Yük varken girdiler ancak tavan
        // (≈4 gün) boyunca tazelik gelmezse biter → uygulamaya yönlendirir.
        cizelge.addTimelineEntry(
            TimelineBuilders.TimelineEntry.Builder()
                .setLayout(LayoutElementBuilders.Layout.fromLayoutElement(bosDuzen(yuk != null)))
                .build()
        )
        if (yuk != null) {
            // Güneş namaz değildir: sıradaki ve alttaki iki satır yalnız NAMAZ vakitleri.
            val tum = VakitHesabi.tumVakitler(yuk).filter { VakitHesabi.namazMi(it.vakit) }
            for (a in ZamanCizelgesi.araliklar(yuk, simdi, maksGirdi = ZamanCizelgesi.TILE_MAKS_GIRDI, yalnizNamaz = true)) {
                val sonrakiler = tum.drop(tum.indexOf(a.siradaki) + 1).take(SONRAKI_SAYISI)
                cizelge.addTimelineEntry(
                    TimelineBuilders.TimelineEntry.Builder()
                        .setValidity(
                            TimelineBuilders.TimeInterval.Builder()
                                .setStartMillis(a.baslangic)
                                .setEndMillis(a.bitis)
                                .build()
                        )
                        .setLayout(LayoutElementBuilders.Layout.fromLayoutElement(duzen(a.siradaki, sonrakiler)))
                        .build()
                )
            }
        }
        return TileBuilders.Tile.Builder()
            .setResourcesVersion(KAYNAK_SURUMU)
            .setTileTimeline(cizelge.build())
            // Asıl yenilemeyi telefon verisi tetikler (Senkron.yuzeyleriTazele); tazelik
            // girdi tavanının ufkunu diskteki yükle kaydırır (telefon susarken de dolu kalır).
            .setFreshnessIntervalMillis(ZamanCizelgesi.TILE_TAZELIK_MS)
            .build()
    }

    private fun bosDuzen(yukVar: Boolean): LayoutElementBuilders.LayoutElement =
        kutu(
            LayoutElementBuilders.Column.Builder()
                .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                .addContent(TileOrtak.metin("Namaz Akışı", 18f, SaatPaleti.METIN, true))
                .addContent(
                    TileOrtak.metin(
                        if (yukVar) "Vakitler için dokunun" else "Telefonunuzda uygulamayı açın",
                        13f,
                        SaatPaleti.METIN2,
                    )
                )
                .build(),
            "Namaz Akışı'nı açın",
        )

    private fun duzen(siradaki: VakitHesabi.VakitAni, sonrakiler: List<VakitHesabi.VakitAni>): LayoutElementBuilders.LayoutElement {
        val saat = VakitHesabi.saat(siradaki.ms)
        val sutun = LayoutElementBuilders.Column.Builder()
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .addContent(TileOrtak.metin(siradaki.ad, 16f, SaatPaleti.vakitRengi(siradaki.vakit), true))
            .addContent(TileOrtak.metin(saat, 40f, SaatPaleti.METIN, true))
            .addContent(
                TileOrtak.dinamikMetin(TileOrtak.kalanMetni(siradaki.ms, " sonra", "Sıradaki vakit"), 13f, SaatPaleti.METIN2)
            )
        if (sonrakiler.isNotEmpty()) {
            sutun.addContent(LayoutElementBuilders.Spacer.Builder().setHeight(dp(8f)).build())
            for (v in sonrakiler) sutun.addContent(sonrakiSatiri(v))
        }
        return kutu(sutun.build(), "Sıradaki vakit ${siradaki.ad}, giriş $saat. Uygulamayı açın")
    }

    /** "İkindi   15:56": ad solda ikincil, saat sağda birincil. */
    private fun sonrakiSatiri(v: VakitHesabi.VakitAni): LayoutElementBuilders.LayoutElement =
        LayoutElementBuilders.Row.Builder()
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .addContent(TileOrtak.metin(v.ad, 12f, SaatPaleti.METIN2))
            .addContent(LayoutElementBuilders.Spacer.Builder().setWidth(dp(10f)).build())
            .addContent(TileOrtak.metin(VakitHesabi.saat(v.ms), 12f, SaatPaleti.METIN))
            .build()

    private fun kutu(icerik: LayoutElementBuilders.LayoutElement, aciklama: String): LayoutElementBuilders.LayoutElement =
        LayoutElementBuilders.Box.Builder()
            .setWidth(expand())
            .setHeight(expand())
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setClickable(
                        ModifiersBuilders.Clickable.Builder()
                            .setId("uygulamayi_ac")
                            .setOnClick(
                                ActionBuilders.LaunchAction.Builder()
                                    .setAndroidActivity(
                                        ActionBuilders.AndroidActivity.Builder()
                                            .setPackageName(packageName)
                                            .setClassName(AnaAktivite::class.java.name)
                                            .build()
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .setSemantics(ModifiersBuilders.Semantics.Builder().setContentDescription(aciklama).build())
                    .build()
            )
            .addContent(icerik)
            .build()

    companion object {
        private const val KAYNAK_SURUMU = "1"
        private const val SONRAKI_SAYISI = 2
    }
}
