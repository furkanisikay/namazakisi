package com.furkanisikay.namazakisi.saat.tile

import android.content.Intent
import androidx.concurrent.futures.CallbackToFutureAdapter
import androidx.core.content.edit
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.DimensionBuilders
import androidx.wear.protolayout.DimensionBuilders.degrees
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.furkanisikay.namazakisi.saat.cekirdek.AnaEkranKarari
import com.furkanisikay.namazakisi.saat.cekirdek.BugunTileKarari
import com.furkanisikay.namazakisi.saat.cekirdek.GunDurumu
import com.furkanisikay.namazakisi.saat.cekirdek.KalanSure
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk
import com.furkanisikay.namazakisi.saat.hatirlatma.KildimAlicisi
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite
import com.furkanisikay.namazakisi.saat.ui.TesbihatAktivite
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import com.google.common.util.concurrent.ListenableFuture

/**
 * "Bugün" tile'ı (issue #281; yeniden tasarım W1): aktif günün beş vakti + iki
 * dokunuşla "Kıldım".
 *
 * Halkanın tamamına beş dilimli yay (kılınan eylem yeşili, şu anki vakit kendi tonunda
 * ve KALAN kısmı kadar dolu, vakti geçmiş kılınmamış vaktin tonunda, gelecek koyu);
 * ortada şu anki vakit (`VakitHesabi.sayilanAn` — ana ekranla aynı kural), dakikalık
 * kalan süre ve tek "Kıldım". Kalan süre ve dilim doluluğu çizicide dinamik (bkz.
 * `TileOrtak`); renkler `SaatPaleti`'nden. Renk tek başına durumu taşımaz: düğme metni
 * ("✓ Kılındı") ve ekran okuyucu açıklaması aynı bilgiyi verir.
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
        if (yuk != null) {
            val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
            val sonIslenen = prefs.getString(SON_ISLENEN, null)
            val satirlar = VakitHesabi.satirlar(yuk, simdi, VakitHesabi.tarih(simdi), depo.bekleyenler())
                .associateBy { VakitHesabi.kimlik(it.tarih, it.vakit) }
            val isaretlenebilir = { k: String -> satirlar[k]?.isaretlenebilir == true }
            val karar = BugunTileKarari.karar(tiklanan, sonIslenen, simdi, isaretlenebilir)
            prefs.edit {
                if (!tiklanan.isNullOrEmpty()) putString(SON_ISLENEN, tiklanan)
                when (karar) {
                    is BugunTileKarari.Karar.OnayBekle -> {
                        putString(ONAY_KIMLIK, karar.kimlik)
                        putLong(ONAY_SECIM, karar.secimMs)
                    }
                    is BugunTileKarari.Karar.Isaretle -> remove(ONAY_KIMLIK)
                    BugunTileKarari.Karar.Yok -> Unit
                }
            }
            when (karar) {
                is BugunTileKarari.Karar.OnayBekle -> onay = karar
                is BugunTileKarari.Karar.Isaretle -> kildim(depo, karar.kimlik)
                BugunTileKarari.Karar.Yok -> onay = BugunTileKarari.etkinOnay(
                    prefs.getString(ONAY_KIMLIK, null), prefs.getLong(ONAY_SECIM, 0L), simdi, isaretlenebilir,
                )
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
                    .addContent(TileOrtak.metin("Bugün", 16f, SaatPaleti.METIN, true))
                    .addContent(bosluk(6f))
                    .addContent(TileOrtak.metin("Telefonunuzda", 13f, SaatPaleti.METIN2))
                    .addContent(TileOrtak.metin("uygulamayı açın", 13f, SaatPaleti.METIN2))
                    .build()
            )
            .build()

    /**
     * Halkanın tamamına beş dilim (kılınan yeşil, şu anki vakit tonunda ve KALAN kısmı
     * kadar dolu, gelecek koyu); ortada şu anki vakit + dakikalık kalan + tek "Kıldım".
     *
     * @param an bu girdinin başladığı an (sayılan an ve statik yedekler ona göre)
     * @param uretim kimlik nonce'u: her çizimde değişir (tekrar koruması, bkz. `BugunTileKarari`)
     */
    private fun duzen(
        yuk: Yuk,
        ozet: GunDurumu.Ozet,
        an: Long,
        uretim: Long,
        onay: BugunTileKarari.Karar.OnayBekle?,
    ): LayoutElementBuilders.LayoutElement {
        val sayilan = VakitHesabi.sayilanAn(yuk, an)
        val aktif = sayilan?.takeIf { it.mod == KalanSure.Mod.CIKIS }?.let { s ->
            ozet.satirlar.indexOfFirst { it.tarih == s.tarih && it.vakit == s.vakit }.takeIf { it >= 0 }
        }
        val aktifSatir = aktif?.let { ozet.satirlar[it] }
        val kalanVar = ozet.haller.contains(GunDurumu.Hal.KALAN)

        val sutun = LayoutElementBuilders.Column.Builder()
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .addContent(
                LayoutElementBuilders.Box.Builder()
                    .setModifiers(tiklanabilir(UYGULAMAYI_AC, uygulamayiAc(), "Bugün ${ozet.kilinanSayisi} vakit kılındı. Uygulamayı açın"))
                    .addContent(TileOrtak.metin("Bugün ${ozet.kilinanSayisi}/${GunDurumu.FARZ_SAYISI}", 12f, SaatPaleti.METIN2))
                    .build()
            )
        if (sayilan != null) {
            val girisMi = sayilan.mod == KalanSure.Mod.GIRIS
            sutun.addContent(TileOrtak.metin(sayilan.ad, 20f, SaatPaleti.vakitRengi(sayilan.vakit), true))
            sutun.addContent(
                TileOrtak.dinamikMetin(
                    TileOrtak.kalanMetni(
                        sayilan.hedef,
                        "",
                        "${if (girisMi) "giriş" else "çıkış"} ${VakitHesabi.saat(sayilan.hedef)}",
                    ),
                    15f, SaatPaleti.METIN, true,
                )
            )
            sutun.addContent(TileOrtak.metin(AnaEkranKarari.altYazi(sayilan.mod), 11f, SaatPaleti.METIN2))
        }
        sutun.addContent(bosluk(6f))
        val dugme = aktifSatir?.let { s ->
            kildimDugmesi(s, uretim, onay?.takeIf { it.kimlik == VakitHesabi.kimlik(s.tarih, s.vakit) })
        }
        if (dugme != null) {
            sutun.addContent(dugme)
            sutun.addContent(bosluk(4f))
        }
        sutun.addContent(
            // Yapılacak iş yokken ipucu satırı tesbihat kısayoluna döner (issue #293).
            if (BugunTileKarari.tesbihatKisayoluGoster(onay != null, kalanVar)) {
                tesbihatKisayolu()
            } else {
                TileOrtak.metin(
                    ipucu(yuk, ozet, an, onay, aktif), 11f,
                    if (onay != null) SaatPaleti.KERAHAT else SaatPaleti.METIN2,
                )
            }
        )
        val kutu = LayoutElementBuilders.Box.Builder()
            .setWidth(expand()).setHeight(expand())
            .addContent(dilimler(ozet, aktif))
        if (aktif != null) kutu.addContent(aktifDolgu(sayilan, aktif, an))
        return kutu.addContent(sutun.build()).build()
    }

    private fun ipucu(
        yuk: Yuk,
        ozet: GunDurumu.Ozet,
        an: Long,
        onay: BugunTileKarari.Karar.OnayBekle?,
        aktif: Int?,
    ): String = when {
        onay != null && VakitHesabi.kerahatMi(yuk, an) -> "Kerahat vakti · onay için tekrar"
        onay != null -> "Onaylamak için tekrar dokunun"
        ozet.kilinanSayisi == GunDurumu.FARZ_SAYISI -> "Bugünün namazları tamam"
        else -> ozet.satirlar.withIndex()
            .firstOrNull { (i, s) -> i != aktif && GunDurumu.halBul(s) == GunDurumu.Hal.KALAN }
            ?.let { "${it.value.ad} kılınmadı" }
            ?: ozet.satirlar.firstOrNull { !it.girdi }?.let { "Sıradaki ${it.ad} · ${VakitHesabi.saat(it.ms)}" }
            ?: ""
    }

    /** "Kıldım" (iki dokunuş) / "Tekrar dokunun" / "✓ Kılındı". Yalnız şu anki vakit. */
    private fun kildimDugmesi(
        s: VakitHesabi.Satir,
        uretim: Long,
        onay: BugunTileKarari.Karar.OnayBekle?,
    ): LayoutElementBuilders.LayoutElement? {
        val hal = GunDurumu.halBul(s)
        val kimlik = VakitHesabi.kimlik(s.tarih, s.vakit)
        val g = when {
            onay != null -> Gorunum(SaatPaleti.KERAHAT, SaatPaleti.ZEMIN, "Tekrar dokunun", "Onaylamak için tekrar dokunun")
            hal == GunDurumu.Hal.KILINDI -> Gorunum(
                SaatPaleti.YUZEY2, SaatPaleti.EYLEM, "✓ Kılındı",
                if (s.esitleniyor) "${s.ad} kılındı, eşitleniyor" else "${s.ad} kılındı",
            )
            s.isaretlenebilir -> Gorunum(SaatPaleti.EYLEM, SaatPaleti.EYLEM_USTU, "Kıldım", AnaEkranKarari.dugmeAciklamasi(s.ad))
            else -> return null
        }
        val belirtec = ModifiersBuilders.Modifiers.Builder()
            .setBackground(
                ModifiersBuilders.Background.Builder()
                    .setColor(TileOrtak.renk(g.zemin))
                    .setCorner(ModifiersBuilders.Corner.Builder().setRadius(dp(DUGME_YUKSEKLIK_DP / 2)).build())
                    .build()
            )
            .setPadding(ModifiersBuilders.Padding.Builder().setStart(dp(16f)).setEnd(dp(16f)).build())
            .setSemantics(
                ModifiersBuilders.Semantics.Builder()
                    .setContentDescription(g.aciklama)
                    .setRole(ModifiersBuilders.SEMANTICS_ROLE_BUTTON)
                    .build()
            )
        // Yalnız işaretlenebilir vakit tıklanabilir; yükleme eylemi tile'ı yeniden ister.
        if (onay != null || (hal != GunDurumu.Hal.KILINDI && s.isaretlenebilir)) {
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
            .setHeight(dp(DUGME_YUKSEKLIK_DP))
            .setModifiers(belirtec.build())
            .addContent(TileOrtak.metin(g.etiket, 14f, g.yazi, true))
            .build()
    }

    private data class Gorunum(val zemin: Long, val yazi: Long, val etiket: String, val aciklama: String)

    private fun dilimRengi(s: VakitHesabi.Satir, hal: GunDurumu.Hal, aktifMi: Boolean): Long = when {
        hal == GunDurumu.Hal.KILINDI -> SaatPaleti.EYLEM
        // Şu anki dilimin zemini iz; kalan kısmı üstteki dinamik yayla dolar.
        aktifMi -> SaatPaleti.IZ
        // Vakti geçmiş, kılınmamış: vaktin tonunda (gelecekten ayrışır).
        hal == GunDurumu.Hal.KALAN -> SaatPaleti.vakitRengi(s.vakit)
        else -> SaatPaleti.IZ
    }

    /** İmza öğesi: halkanın tamamına beş dilim — günün özeti tek bakışta. */
    private fun dilimler(ozet: GunDurumu.Ozet, aktif: Int?): LayoutElementBuilders.LayoutElement {
        val yay = yayKurucu()
        ozet.satirlar.forEachIndexed { i, s ->
            if (i > 0) yay.addContent(LayoutElementBuilders.ArcSpacer.Builder().setLength(degrees(DILIM_ARASI)).build())
            yay.addContent(
                LayoutElementBuilders.ArcLine.Builder()
                    .setLength(degrees(DILIM))
                    .setThickness(dp(YAY_KALINLIK_DP))
                    .setColor(TileOrtak.renk(dilimRengi(s, GunDurumu.halBul(s), i == aktif)))
                    .build()
            )
        }
        return yayKutusu(yay.build())
    }

    /**
     * Şu anki dilimin KALAN kısmı (ana ekran yayı gibi saat yönünde boşalır): dilimin
     * sonuna yaslı, uzunluğu çizicide dinamik. Eski çizici statik değeri (girdinin
     * başındaki oran) çizer.
     */
    private fun aktifDolgu(sayilan: VakitHesabi.SayilanAn, aktif: Int, an: Long): LayoutElementBuilders.LayoutElement {
        val toplam = sayilan.hedef - (sayilan.baslangic ?: an)
        val uzunluk = DimensionBuilders.DegreesProp.Builder(DILIM * sayilan.kalanOran(an))
            .setDynamicValue(TileOrtak.kalanDerece(sayilan.hedef, toplam, DILIM))
            .build()
        val yay = yayKurucu()
        if (aktif > 0) {
            yay.addContent(LayoutElementBuilders.ArcSpacer.Builder().setLength(degrees(aktif * (DILIM + DILIM_ARASI))).build())
        }
        yay.addContent(
            LayoutElementBuilders.ArcLine.Builder()
                .setLength(uzunluk)
                .setLayoutConstraintsForDynamicLength(
                    DimensionBuilders.AngularLayoutConstraint.Builder(DILIM)
                        .setAngularAlignment(LayoutElementBuilders.ANGULAR_ALIGNMENT_END)
                        .build()
                )
                .setThickness(dp(YAY_KALINLIK_DP))
                .setColor(TileOrtak.renk(SaatPaleti.vakitRengi(sayilan.vakit)))
                .build()
        )
        return yayKutusu(yay.build())
    }

    private fun yayKurucu() = LayoutElementBuilders.Arc.Builder()
        .setAnchorAngle(degrees(DILIM_ARASI / 2))
        .setAnchorType(LayoutElementBuilders.ARC_ANCHOR_START)

    private fun yayKutusu(yay: LayoutElementBuilders.Arc): LayoutElementBuilders.LayoutElement =
        LayoutElementBuilders.Box.Builder()
            .setWidth(expand()).setHeight(expand())
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setPadding(ModifiersBuilders.Padding.Builder().setAll(dp(4f)).build())
                    .build()
            )
            .addContent(yay)
            .build()

    private fun tiklanabilir(id: String, eylem: ActionBuilders.Action, aciklama: String) =
        ModifiersBuilders.Modifiers.Builder()
            .setClickable(ModifiersBuilders.Clickable.Builder().setId(id).setOnClick(eylem).build())
            .setSemantics(ModifiersBuilders.Semantics.Builder().setContentDescription(aciklama).build())
            .build()

    /** Küçük hap düğme: ipucu satırının yerini alır, yükseklik neredeyse aynı kalır. */
    private fun tesbihatKisayolu(): LayoutElementBuilders.LayoutElement =
        LayoutElementBuilders.Box.Builder()
            .setHeight(dp(KISAYOL_YUKSEKLIK_DP))
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setClickable(
                        ModifiersBuilders.Clickable.Builder()
                            .setId(TESBIHAT_AC)
                            .setOnClick(
                                ActionBuilders.LaunchAction.Builder()
                                    .setAndroidActivity(
                                        ActionBuilders.AndroidActivity.Builder()
                                            .setPackageName(packageName)
                                            .setClassName(TesbihatAktivite::class.java.name)
                                            .build()
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .setSemantics(
                        ModifiersBuilders.Semantics.Builder()
                            .setContentDescription("Tesbihat sayacını açın")
                            .setRole(ModifiersBuilders.SEMANTICS_ROLE_BUTTON)
                            .build()
                    )
                    .setBackground(
                        ModifiersBuilders.Background.Builder()
                            .setColor(TileOrtak.renk(SaatPaleti.YUZEY2))
                            .setCorner(ModifiersBuilders.Corner.Builder().setRadius(dp(KISAYOL_YUKSEKLIK_DP / 2)).build())
                            .build()
                    )
                    .setPadding(
                        ModifiersBuilders.Padding.Builder().setStart(dp(10f)).setEnd(dp(10f)).build()
                    )
                    .build()
            )
            .addContent(TileOrtak.metin("Tesbihat", 11f, SaatPaleti.METIN))
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

    companion object {
        private const val KAYNAK_SURUMU = "1"
        private const val PREFS = "saat_bugun_tile"
        private const val SON_ISLENEN = "son_islenen_tik"
        private const val ONAY_KIMLIK = "onay_kimlik"
        private const val ONAY_SECIM = "onay_secim_ms"
        private const val UYGULAMAYI_AC = "uygulamayi_ac"
        private const val TESBIHAT_AC = "tesbihat_ac"

        /**
         * Kısayol hapı ipucu satırından (11 sp ≈ 15 dp) yalnız birkaç dp yüksek: küçük
         * yuvarlak ekranda düzen kenara itilmesin. Dokunma hedefi 48 dp'nin altındadır —
         * tile'ın birincil eylemi değil, uygulamada da aynı giriş var.
         */
        private const val KISAYOL_YUKSEKLIK_DP = 22f

        /** "Kıldım" hapı: tile'ın birincil eylemi. */
        private const val DUGME_YUKSEKLIK_DP = 40f

        /**
         * Girdi tavanı: her girdi tam bir düzen taşır (yük 31 gün ≈ 186 sınır).
         * 60 girdi ≈ 10 gün; tazelikte (6 sa) çizelge diskteki yükten yeniden kurulduğu
         * için ufuk kayar — telefon günlerce susa bile tile yükün sonuna kadar dolu kalır.
         */
        private const val MAKS_GIRDI = 60
        private const val TAZELIK_MS = 6L * 60 * 60 * 1000

        // Halka: beş dilim + beş ara (son dilimle ilki arasında da boşluk) = 360°.
        private const val DILIM_ARASI = 4f
        private const val DILIM = (360f - GunDurumu.FARZ_SAYISI * DILIM_ARASI) / GunDurumu.FARZ_SAYISI
        private const val YAY_KALINLIK_DP = 5f
    }
}
