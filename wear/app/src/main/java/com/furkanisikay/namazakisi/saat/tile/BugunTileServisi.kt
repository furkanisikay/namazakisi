package com.furkanisikay.namazakisi.saat.tile

import android.content.Intent
import androidx.concurrent.futures.CallbackToFutureAdapter
import androidx.core.content.edit
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.degrees
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.DimensionBuilders.sp
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.furkanisikay.namazakisi.saat.cekirdek.BugunTileKarari
import com.furkanisikay.namazakisi.saat.cekirdek.GunDurumu
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk
import com.furkanisikay.namazakisi.saat.hatirlatma.KildimAlicisi
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import com.google.common.util.concurrent.ListenableFuture

/**
 * "Bugün" tile'ı (issue #281): aktif günün beş vakti + iki dokunuşla "Kıldım".
 *
 * Tasarım (telefona benzemek zorunda değil): siyah zemin, kenarda beş dilimli yay
 * (günün tek bakışta özeti), ortada 3 + 2 dizilmiş 48 dp'lik vakit daireleri.
 * Kılınan dolu yeşil + ✓; vakti girmiş kılınmamış yeşil çerçeveli (dokunulabilir);
 * henüz girmemiş sönük + saati. Renk tek başına durumu taşımaz: ✓/saat ikinci satırı
 * ve ekran okuyucu açıklaması da aynı bilgiyi verir.
 *
 * Dokunuş `LoadAction`'dır; karar `BugunTileKarari`'nda (saf, testli). İlk dokunuş
 * 8 sn geçerli bir "Tekrar" girdisi üretir — zaman çizelgesinde en KISA geçerlilikli
 * girdi kazandığı için normal girdilerin üstüne biner ve süre bitince tile kendiliğinden
 * normal görünüme döner (uyandırma yok). Yalnız işaretleme vardır, geri alma telefonda.
 *
 * "Kıldım" uygulamadaki/bildirimdeki ile AYNI yoldan geçer: iyimser bekleyen kimlik
 * hemen yazılır (tile anında ✓ gösterir), gerisi `KildimAlicisi` → `Senkron.kildimGonder`
 * (yerel zincir iptali + bildirimi kaldırma + kalıcı Data Layer kuyruğu).
 */
class BugunTileServisi : TileService() {

    override fun onTileRequest(requestParams: RequestBuilders.TileRequest): ListenableFuture<TileBuilders.Tile> =
        CallbackToFutureAdapter.getFuture { tamamlayici ->
            tamamlayici.set(isle(requestParams.currentState.lastClickableId))
            "BugunTile"
        }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest,
    ): ListenableFuture<ResourceBuilders.Resources> =
        CallbackToFutureAdapter.getFuture { tamamlayici ->
            tamamlayici.set(ResourceBuilders.Resources.Builder().setVersion(KAYNAK_SURUMU).build())
            "BugunTileKaynak"
        }

    private fun isle(tiklanan: String?): TileBuilders.Tile {
        val depo = YukDeposu(this)
        val yuk = depo.yuk()
        val simdi = System.currentTimeMillis()
        var onay: BugunTileKarari.Karar.OnayBekle? = null
        if (yuk != null && !tiklanan.isNullOrEmpty()) {
            val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
            val sonIslenen = prefs.getString(SON_ISLENEN, null)
            val satirlar = VakitHesabi.satirlar(yuk, simdi, VakitHesabi.tarih(simdi), depo.bekleyenler())
                .associateBy { VakitHesabi.kimlik(it.tarih, it.vakit) }
            val karar = BugunTileKarari.karar(tiklanan, sonIslenen, simdi) { satirlar[it]?.isaretlenebilir == true }
            if (tiklanan != sonIslenen) prefs.edit { putString(SON_ISLENEN, tiklanan) }
            when (karar) {
                is BugunTileKarari.Karar.OnayBekle -> onay = karar
                is BugunTileKarari.Karar.Isaretle -> kildim(depo, karar.kimlik)
                BugunTileKarari.Karar.Yok -> Unit
            }
        }
        return tileOlustur(yuk, depo.bekleyenler(), simdi, onay)
    }

    private fun kildim(depo: YukDeposu, kimlik: String) {
        // İyimser işaret senkron: bu istekle dönen tile zaten ✓ göstersin.
        depo.bekleyenEkle(kimlik)
        sendBroadcast(
            Intent(this, KildimAlicisi::class.java)
                .putExtra(KildimAlicisi.TARIH, kimlik.substringBefore('_'))
                .putExtra(KildimAlicisi.VAKIT, kimlik.substringAfter('_'))
        )
    }

    private fun tileOlustur(
        yuk: Yuk?,
        bekleyen: Set<String>,
        simdi: Long,
        onay: BugunTileKarari.Karar.OnayBekle?,
    ): TileBuilders.Tile {
        val cizelge = TimelineBuilders.Timeline.Builder()
        // Geçerliliksiz yedek girdi: yük yoksa ya da çizelge tükendiyse tile boş kalmaz.
        cizelge.addTimelineEntry(girdi(bosDuzen(), null, null))
        if (yuk != null) {
            for (a in GunDurumu.cizelge(yuk, simdi, bekleyen, { VakitHesabi.tarih(it) }, MAKS_GIRDI)) {
                cizelge.addTimelineEntry(girdi(duzen(yuk, a.ozet, a.baslangic, simdi, null), a.baslangic, a.bitis))
            }
            if (onay != null) {
                GunDurumu.ozet(yuk, simdi, VakitHesabi.tarih(simdi), bekleyen)?.let { ozet ->
                    cizelge.addTimelineEntry(girdi(duzen(yuk, ozet, simdi, simdi, onay), simdi, onay.bitisMs))
                }
            }
        }
        return TileBuilders.Tile.Builder()
            .setResourcesVersion(KAYNAK_SURUMU)
            .setTileTimeline(cizelge.build())
            .setFreshnessIntervalMillis(TAZELIK_MS)
            .build()
    }

    private fun girdi(duzen: LayoutElementBuilders.LayoutElement, bas: Long?, bitis: Long?): TimelineBuilders.TimelineEntry {
        val b = TimelineBuilders.TimelineEntry.Builder().setLayout(LayoutElementBuilders.Layout.fromLayoutElement(duzen))
        if (bas != null && bitis != null) {
            b.setValidity(TimelineBuilders.TimeInterval.Builder().setStartMillis(bas).setEndMillis(bitis).build())
        }
        return b.build()
    }

    // --- Düzen ------------------------------------------------------------------

    private fun bosDuzen(): LayoutElementBuilders.LayoutElement =
        LayoutElementBuilders.Box.Builder()
            .setWidth(expand()).setHeight(expand())
            .setModifiers(tiklanabilir(UYGULAMAYI_AC, uygulamayiAc(), "Namaz Akışı'nı açın"))
            .addContent(
                LayoutElementBuilders.Column.Builder()
                    .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                    .addContent(metin("Bugün", 16f, BEYAZ, true))
                    .addContent(bosluk(6f))
                    .addContent(metin("Telefonunuzda", 13f, GRI, false))
                    .addContent(metin("uygulamayı açın", 13f, GRI, false))
                    .build()
            )
            .build()

    /**
     * @param an bu girdinin başladığı an (vakit girdi mi, saat metinleri ona göre)
     * @param uretim kimlik nonce'u: her çizimde değişir (tekrar koruması, bkz. `BugunTileKarari`)
     */
    private fun duzen(
        yuk: Yuk,
        ozet: GunDurumu.Ozet,
        an: Long,
        uretim: Long,
        onay: BugunTileKarari.Karar.OnayBekle?,
    ): LayoutElementBuilders.LayoutElement {
        val daireler = ozet.satirlar.map { s ->
            val kimlik = VakitHesabi.kimlik(s.tarih, s.vakit)
            daire(s, GunDurumu.halBul(s), uretim, onay?.takeIf { it.kimlik == kimlik })
        }
        val ipucu = when {
            onay != null && VakitHesabi.kerahatMi(yuk, an) -> "Kerahat vakti · onay için tekrar"
            onay != null -> "Onaylamak için tekrar dokunun"
            ozet.kilinanSayisi == GunDurumu.FARZ_SAYISI -> "Bugünün namazları tamam"
            ozet.haller.contains(GunDurumu.Hal.KALAN) -> "Kıldığınıza dokunun"
            else -> ozet.satirlar.firstOrNull { !it.girdi }?.let { "Sıradaki ${it.ad} · ${VakitHesabi.saat(it.ms)}" } ?: ""
        }
        val sutun = LayoutElementBuilders.Column.Builder()
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .addContent(
                LayoutElementBuilders.Box.Builder()
                    .setModifiers(tiklanabilir(UYGULAMAYI_AC, uygulamayiAc(), "Bugün ${ozet.kilinanSayisi} vakit kılındı. Uygulamayı açın"))
                    .addContent(metin("Bugün  ${ozet.kilinanSayisi}/${GunDurumu.FARZ_SAYISI}", 15f, BEYAZ, true))
                    .build()
            )
            .addContent(bosluk(6f))
            .addContent(satir(daireler.take(3)))
            .addContent(bosluk(6f))
            .addContent(satir(daireler.drop(3)))
            .addContent(bosluk(6f))
            .addContent(metin(ipucu, 11f, if (onay != null) AMBER else GRI, false))
            .build()
        return LayoutElementBuilders.Box.Builder()
            .setWidth(expand()).setHeight(expand())
            .addContent(yay(ozet))
            .addContent(sutun)
            .build()
    }

    /** İmza öğesi: kenarda beş dilimli yay — günün özeti tek bakışta. */
    private fun yay(ozet: GunDurumu.Ozet): LayoutElementBuilders.LayoutElement {
        val yay = LayoutElementBuilders.Arc.Builder()
            .setAnchorAngle(degrees(0f))
            .setAnchorType(LayoutElementBuilders.ARC_ANCHOR_CENTER)
        ozet.haller.forEachIndexed { i, hal ->
            if (i > 0) yay.addContent(LayoutElementBuilders.ArcSpacer.Builder().setLength(degrees(4f)).build())
            yay.addContent(
                LayoutElementBuilders.ArcLine.Builder()
                    .setLength(degrees(22f))
                    .setThickness(dp(4f))
                    .setColor(argb(halRengi(hal)))
                    .build()
            )
        }
        return LayoutElementBuilders.Box.Builder()
            .setWidth(expand()).setHeight(expand())
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setPadding(ModifiersBuilders.Padding.Builder().setAll(dp(4f)).build())
                    .build()
            )
            .addContent(yay.build())
            .build()
    }

    private fun satir(ogeler: List<LayoutElementBuilders.LayoutElement>): LayoutElementBuilders.LayoutElement {
        val r = LayoutElementBuilders.Row.Builder().setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
        ogeler.forEachIndexed { i, o ->
            if (i > 0) r.addContent(LayoutElementBuilders.Spacer.Builder().setWidth(dp(6f)).build())
            r.addContent(o)
        }
        return r.build()
    }

    private fun daire(
        s: VakitHesabi.Satir,
        hal: GunDurumu.Hal,
        uretim: Long,
        onay: BugunTileKarari.Karar.OnayBekle?,
    ): LayoutElementBuilders.LayoutElement {
        val kimlik = VakitHesabi.kimlik(s.tarih, s.vakit)
        val saat = VakitHesabi.saat(s.ms)
        val (zemin, cerceve, yazi, alt) = when {
            onay != null -> Gorunum(AMBER, null, SIYAH, "Tekrar")
            hal == GunDurumu.Hal.KILINDI -> Gorunum(YESIL_KOYU, null, BEYAZ, "✓")
            hal == GunDurumu.Hal.KALAN -> Gorunum(KOYU, YESIL, BEYAZ, saat)
            else -> Gorunum(SONUK, null, GRI, saat)
        }
        val durum = when {
            onay != null -> "onaylamak için tekrar dokunun"
            hal == GunDurumu.Hal.KILINDI -> if (s.esitleniyor) "kılındı, eşitleniyor" else "kılındı"
            hal == GunDurumu.Hal.KALAN -> "kılmadınız, işaretlemek için dokunun"
            else -> "vakti henüz girmedi"
        }
        val arkaplan = ModifiersBuilders.Background.Builder()
            .setColor(argb(zemin))
            .setCorner(ModifiersBuilders.Corner.Builder().setRadius(dp(DAIRE_DP / 2)).build())
            .build()
        val belirtec = ModifiersBuilders.Modifiers.Builder()
            .setBackground(arkaplan)
            .setSemantics(
                ModifiersBuilders.Semantics.Builder()
                    .setContentDescription("${s.ad}, $saat, $durum")
                    .setRole(ModifiersBuilders.SEMANTICS_ROLE_BUTTON)
                    .build()
            )
        if (cerceve != null) {
            belirtec.setBorder(ModifiersBuilders.Border.Builder().setWidth(dp(2f)).setColor(argb(cerceve)).build())
        }
        // Yalnız işaretlenebilir vakit tıklanabilir; yükleme eylemi tile'ı yeniden ister.
        val tiklanabilirMi = onay != null || hal == GunDurumu.Hal.KALAN
        if (tiklanabilirMi && s.isaretlenebilir) {
            val id = if (onay != null) BugunTileKarari.onayKimligi(kimlik, onay.secimMs)
            else BugunTileKarari.secKimligi(kimlik, uretim)
            belirtec.setClickable(
                ModifiersBuilders.Clickable.Builder()
                    .setId(id)
                    .setOnClick(ActionBuilders.LoadAction.Builder().build())
                    .build()
            )
        }
        return LayoutElementBuilders.Box.Builder()
            .setWidth(dp(DAIRE_DP)).setHeight(dp(DAIRE_DP))
            .setModifiers(belirtec.build())
            .addContent(
                LayoutElementBuilders.Column.Builder()
                    .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                    .addContent(metin(s.ad, 11f, yazi, true))
                    .addContent(metin(alt, 10f, yazi, false))
                    .build()
            )
            .build()
    }

    private data class Gorunum(val zemin: Int, val cerceve: Int?, val yazi: Int, val alt: String)

    private fun halRengi(hal: GunDurumu.Hal) = when (hal) {
        GunDurumu.Hal.KILINDI -> YESIL
        GunDurumu.Hal.KALAN -> AMBER
        GunDurumu.Hal.GIRMEDI -> SONUK_YAY
    }

    private fun tiklanabilir(id: String, eylem: ActionBuilders.Action, aciklama: String) =
        ModifiersBuilders.Modifiers.Builder()
            .setClickable(ModifiersBuilders.Clickable.Builder().setId(id).setOnClick(eylem).build())
            .setSemantics(ModifiersBuilders.Semantics.Builder().setContentDescription(aciklama).build())
            .build()

    private fun uygulamayiAc(): ActionBuilders.Action =
        ActionBuilders.LaunchAction.Builder()
            .setAndroidActivity(
                ActionBuilders.AndroidActivity.Builder()
                    .setPackageName(packageName)
                    .setClassName(AnaAktivite::class.java.name)
                    .build()
            )
            .build()

    private fun bosluk(yukseklik: Float) = LayoutElementBuilders.Spacer.Builder().setHeight(dp(yukseklik)).build()

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
        private const val PREFS = "saat_bugun_tile"
        private const val SON_ISLENEN = "son_islenen_tik"
        private const val UYGULAMAYI_AC = "uygulamayi_ac"

        /**
         * Girdi tavanı: her girdi tam bir düzen taşır (yük 31 gün ≈ 186 sınır).
         * 60 girdi ≈ 10 gün; tazelikte (6 sa) çizelge diskteki yükten yeniden kurulduğu
         * için ufuk kayar — telefon günlerce susa bile tile yükün sonuna kadar dolu kalır.
         */
        private const val MAKS_GIRDI = 60
        private const val TAZELIK_MS = 6L * 60 * 60 * 1000
        private const val DAIRE_DP = 48f

        // Saat siyah zemini için sabit palet (telefon temasının birincil yeşili #4CAF50).
        private const val YESIL = 0xFF4CAF50.toInt()
        private const val YESIL_KOYU = 0xFF2E7D32.toInt()
        private const val AMBER = 0xFFFFC107.toInt()
        private const val KOYU = 0xFF1C1C1C.toInt()
        private const val SONUK = 0xFF262626.toInt()
        private const val SONUK_YAY = 0xFF424242.toInt()
        private const val BEYAZ = 0xFFFFFFFF.toInt()
        private const val SIYAH = 0xFF000000.toInt()
        private const val GRI = 0xFFBDBDBD.toInt()
    }
}
