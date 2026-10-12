package com.furkanisikay.namazakisi.saat.tile

import androidx.concurrent.futures.CallbackToFutureAdapter
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.DimensionBuilders.sp
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk
import com.furkanisikay.namazakisi.saat.cekirdek.ZamanCizelgesi
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import com.google.common.util.concurrent.ListenableFuture

/**
 * "Sıradaki vakit" tile'ı (issue #269).
 *
 * Kalan süre tile'da CANLI SAYILMAZ (zaman çizelgesi girdileri statik metindir;
 * dinamik ifade eski Wear OS 3 renderer'ında desteklenmez) — bu yüzden tile vakit
 * adı + saatini gösterir, canlı geri sayım komplikasyondadır. Her vakit sınırında
 * zaman çizelgesi kendiliğinden bir sonraki girdiye geçer (uyandırma yok).
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
        if (yuk == null) {
            cizelge.addTimelineEntry(
                TimelineBuilders.TimelineEntry.Builder()
                    .setLayout(LayoutElementBuilders.Layout.fromLayoutElement(
                        duzen("Namaz Akışı", "Telefonunuzda uygulamayı açın", null)
                    ))
                    .build()
            )
        } else {
            for (a in ZamanCizelgesi.araliklar(yuk, simdi)) {
                cizelge.addTimelineEntry(
                    TimelineBuilders.TimelineEntry.Builder()
                        .setValidity(
                            TimelineBuilders.TimeInterval.Builder()
                                .setStartMillis(a.baslangic)
                                .setEndMillis(a.bitis)
                                .build()
                        )
                        .setLayout(LayoutElementBuilders.Layout.fromLayoutElement(
                            duzen(a.siradaki.ad, VakitHesabi.saat(a.siradaki.ms), yuk.konumAdi)
                        ))
                        .build()
                )
            }
        }
        return TileBuilders.Tile.Builder()
            .setResourcesVersion(KAYNAK_SURUMU)
            .setTileTimeline(cizelge.build())
            // Yenilemeyi telefon verisi tetikler (Senkron.yuzeyleriTazele); periyodik uyandırma yok.
            .setFreshnessIntervalMillis(0)
            .build()
    }

    private fun duzen(baslik: String, alt: String, konum: String?): LayoutElementBuilders.LayoutElement {
        val sutun = LayoutElementBuilders.Column.Builder()
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .addContent(metin("Sıradaki vakit", 13f, IKINCIL, false))
            .addContent(metin(baslik, 30f, BIRINCIL, true))
            .addContent(metin(alt, 18f, METIN, false))
        if (konum != null) {
            sutun.addContent(LayoutElementBuilders.Spacer.Builder().setHeight(dp(6f)).build())
            sutun.addContent(metin(konum, 12f, IKINCIL, false))
        }
        return LayoutElementBuilders.Box.Builder()
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
                    .build()
            )
            .addContent(sutun.build())
            .build()
    }

    private fun metin(yazi: String, boyut: Float, renk: Int, kalin: Boolean): LayoutElementBuilders.Text =
        LayoutElementBuilders.Text.Builder()
            .setText(yazi)
            .setMaxLines(1)
            .setFontStyle(
                LayoutElementBuilders.FontStyle.Builder()
                    .setSize(sp(boyut))
                    .setColor(argb(renk))
                    .setWeight(
                        if (kalin) LayoutElementBuilders.FONT_WEIGHT_BOLD else LayoutElementBuilders.FONT_WEIGHT_NORMAL
                    )
                    .build()
            )
            .build()

    companion object {
        private const val KAYNAK_SURUMU = "1"
        // Telefon temasının birincil yeşili (#4CAF50) — saat siyah zemininde.
        private const val BIRINCIL = 0xFF4CAF50.toInt()
        private const val METIN = 0xFFFFFFFF.toInt()
        private const val IKINCIL = 0xFFBDBDBD.toInt()
    }
}
