package com.furkanisikay.namazakisi.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.SystemClock
import android.service.quicksettings.TileService
import android.util.Log
import android.util.SizeF
import android.view.View
import android.widget.RemoteViews
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.arayuzDili
import com.furkanisikay.namazakisi.cekirdek.KildimDurumu
import com.furkanisikay.namazakisi.cekirdek.KilitEkraniKarari
import com.furkanisikay.namazakisi.cekirdek.KlasikWidgetKarari
import com.furkanisikay.namazakisi.cekirdek.SinirAlarmi
import com.furkanisikay.namazakisi.cekirdek.SureGosterimi
import com.furkanisikay.namazakisi.cekirdek.VakitCizelgesi
import com.furkanisikay.namazakisi.cekirdek.VakitKodlari
import com.furkanisikay.namazakisi.cekirdek.WidgetAyari
import com.furkanisikay.namazakisi.cekirdek.WidgetDuzenSecici
import com.furkanisikay.namazakisi.cekirdek.WidgetDuzeni
import com.furkanisikay.namazakisi.cekirdek.WidgetZemini
import com.furkanisikay.namazakisi.cekirdek.kildimIstekKodu
import com.furkanisikay.namazakisi.cekirdek.saatMetni
import com.furkanisikay.namazakisi.dildeBaglam
import com.furkanisikay.namazakisi.kildim.KildimKutusuServisi
import com.furkanisikay.namazakisi.otomasyon.OtomasyonDeposu

/**
 * Widget 2.0 çizicisi ve zamanlayıcısı (issue #275) — TEK kapı.
 *
 * ESKİMEYEN SÜRE: kalan süre `Chronometer` countDown ile SİSTEM tarafından çizilir;
 * widget dakikada bir güncellenmez. Tek alarm bir sonraki VAKİT SINIRINDA kurulur
 * (`RTC` uyandırmaz; tam alarm izni varsa `setExact`, yoksa `setWindow` — API 31+'da
 * pencere ≥10 dk'ya genişler, `SinirAlarmi`): ekran kapalıyken bekler, cihaz
 * uyanınca teslim edilir. Gecikme olsa bile sayaç negatife düşer ("−0:03") ve bitiş saati her
 * boyutta yazılıdır → widget asla "süre var" demez. Günde ≤ 12 alarm
 * (`VakitCizelgesi.alarmZinciri` JVM testi; gerçekte 6).
 *
 * Tazeleme tetikleri: vakit sınırı alarmı, saat/saat dilimi/tarih değişimi, açılış
 * ve paket güncellemesi (`NamazWidgetAlarmAlici`), JS'ten vakit ya da kılınmışlık
 * yazımı (`WidgetVeriModulu`), widget/kutu dokunuşu, arayüz dili değişimi
 * (`ArayuzDiliIzleyici`).
 *
 * METİN KODDA verilir (`setTextViewText`/`setContentDescription`), düzen XML'inde DEĞİL:
 * XML'deki `@string` başlatıcının sürecinde ve CİHAZ dilinde çözülür, uygulama dili farklıysa
 * widget yanlış dilde kalırdı. Kaynak metinleri `dildeBaglam()`'dan, saf kararların metinleri
 * `dil` parametresiyle (`arayuzDili()`) gelir.
 */
object WidgetGuncelleyici {
    private const val TAG = "WidgetGuncelleyici"
    const val SINIR_EYLEMI = "com.furkanisikay.namazakisi.widget.VAKIT_SINIRI"

    /**
     * Yalnız tam alarm izni YOKKEN kullanılan pencere. API 31+'da sistem bunu en az
     * 10 dakikaya genişletir (5 sn kalmaz); izin varsa `setExact` kullanılır (`SinirAlarmi`).
     */
    private const val PENCERE_MS = 5_000L

    /**
     * Tüm widget sağlayıcıları — TEK liste (çizim turu ve `onDisabled` sayımı buradan).
     * Yeni sağlayıcı yalnız buraya eklenir.
     */
    val SAGLAYICILAR = listOf(
        NamazWidget::class.java,
        NamazGenisBoyutWidget::class.java,
        NamazKapakWidget::class.java,
        NamazKlasikWidget::class.java,
        NamazKlasikGenisWidget::class.java,
    )

    private data class Palet(val zemin: Int, val metin: Int, val ikincil: Int, val vurgu: Int, val vurguUstu: Int)

    private val PALETLER = mapOf(
        WidgetZemini.MATERIAL to Palet(
            R.color.widget_my_zemin, R.color.widget_my_metin, R.color.widget_my_ikincil,
            R.color.widget_my_vurgu, R.color.widget_my_vurgu_ustu,
        ),
        WidgetZemini.ACIK to Palet(
            R.color.widget_acik_zemin, R.color.widget_acik_metin, R.color.widget_acik_ikincil,
            R.color.widget_acik_vurgu, R.color.widget_acik_vurgu_ustu,
        ),
        WidgetZemini.KOYU to Palet(
            R.color.widget_koyu_zemin, R.color.widget_koyu_metin, R.color.widget_koyu_ikincil,
            R.color.widget_koyu_vurgu, R.color.widget_koyu_vurgu_ustu,
        ),
        // Şeffaf: zemin görünmez, duvar kağıdı üstünde açık metin okunur.
        WidgetZemini.SEFFAF to Palet(
            R.color.widget_koyu_zemin, R.color.widget_koyu_metin, R.color.widget_koyu_ikincil,
            R.color.widget_koyu_vurgu, R.color.widget_koyu_vurgu_ustu,
        ),
    )

    private val SATIRLAR = mapOf(
        VakitKodlari.SABAH to intArrayOf(R.id.widget_satir_sabah, R.id.widget_satir_sabah_ad, R.id.widget_satir_sabah_saat, R.id.widget_satir_sabah_isaret),
        VakitKodlari.OGLE to intArrayOf(R.id.widget_satir_ogle, R.id.widget_satir_ogle_ad, R.id.widget_satir_ogle_saat, R.id.widget_satir_ogle_isaret),
        VakitKodlari.IKINDI to intArrayOf(R.id.widget_satir_ikindi, R.id.widget_satir_ikindi_ad, R.id.widget_satir_ikindi_saat, R.id.widget_satir_ikindi_isaret),
        VakitKodlari.AKSAM to intArrayOf(R.id.widget_satir_aksam, R.id.widget_satir_aksam_ad, R.id.widget_satir_aksam_saat, R.id.widget_satir_aksam_isaret),
        VakitKodlari.YATSI to intArrayOf(R.id.widget_satir_yatsi, R.id.widget_satir_yatsi_ad, R.id.widget_satir_yatsi_saat, R.id.widget_satir_yatsi_isaret),
    )

    /** Tüm widget örneklerini çizer, sınır alarmını kurar ve hızlı ayarlar kutusunu tazeler. */
    fun tumunuGuncelle(context: Context) {
        val uygulama = context.applicationContext
        try {
            val yonetici = AppWidgetManager.getInstance(uygulama)
            val anlik = WidgetVeriDeposu.anlik(uygulama)
            var widgetVar = false
            for (sinif in SAGLAYICILAR) {
                for (id in yonetici.getAppWidgetIds(ComponentName(uygulama, sinif))) {
                    widgetVar = true
                    guncelle(uygulama, yonetici, id, anlik)
                }
            }
            // Otomasyon eklentisi (issue #278) "vakit girdi" olayını AYNI alarmdan alır:
            // widget yoksa da bir koşul paketi varken alarm kurulur (yeni alarm YOK).
            if (widgetVar || OtomasyonDeposu.kosulKullaniliyor(uygulama)) {
                sinirAlarminiKur(uygulama, anlik)
            } else {
                sinirAlarminiIptalEt(uygulama)
            }
        } catch (e: Throwable) {
            Log.e(TAG, "Widgetlar guncellenemedi", e)
        }
        kutuyuTazele(uygulama)
    }

    fun guncelle(
        context: Context,
        yonetici: AppWidgetManager,
        appWidgetId: Int,
        anlik: WidgetVeriDeposu.Anlik = WidgetVeriDeposu.anlik(context),
    ) {
        try {
            yonetici.updateAppWidget(appWidgetId, gorunum(context, yonetici, appWidgetId, anlik))
        } catch (e: Throwable) {
            Log.e(TAG, "Widget cizilemedi: id=$appWidgetId", e)
        }
    }

    /**
     * API 31+: boyut haritası — başlatıcı yeniden boyutlandırmada uygulamayı
     * uyandırmadan doğru düzeni seçer. Öncesi: seçenekteki boyuttan tek düzen
     * (`onAppWidgetOptionsChanged` yeniden çağırır). Eşikler tek yerde: `WidgetDuzenSecici`.
     */
    private fun gorunum(
        context: Context,
        yonetici: AppWidgetManager,
        id: Int,
        anlik: WidgetVeriDeposu.Anlik,
    ): RemoteViews {
        val saglayici = yonetici.getAppWidgetInfo(id)?.provider?.className
        val dm = DilMetni(context.dildeBaglam(), context.arayuzDili())
        // Klasik (yeşil) widget'lar: sabit tek düzen, boyut haritası ve ayar YOK.
        if (saglayici == NamazKlasikWidget::class.java.name) return klasikCiz(context, genis = false, anlik, dm)
        if (saglayici == NamazKlasikGenisWidget::class.java.name) return klasikCiz(context, genis = true, anlik, dm)
        val ayar = WidgetVeriDeposu.ayar(context, id)
        val secenek = yonetici.getAppWidgetOptions(id)
        // Kilit ekranı / hub (issue #295): communal ana bilgisayarı KEYGUARD kategorisiyle
        // bağlar; orada widget salt okunur (yayın niyeti kilit açılmadan işlerdi).
        // Samsung Flex Window (issue #283) sağlayıcısı kategoriden bağımsız salt okunur.
        val kapakEkrani = saglayici == NamazKapakWidget::class.java.name
        val kilitEkrani = KilitEkraniKarari.saltOkunurMu(
            secenek.getInt(AppWidgetManager.OPTION_APPWIDGET_HOST_CATEGORY, 0),
            kapakEkraniSaglayicisi = kapakEkrani,
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return RemoteViews(
                mapOf(
                    SizeF(40f, 40f) to ciz(context, WidgetDuzeni.KUCUK, ayar, anlik, kilitEkrani, kapakEkrani, dm),
                    SizeF(WidgetDuzenSecici.ORTA_MIN_GENISLIK_DP, WidgetDuzenSecici.ORTA_MIN_YUKSEKLIK_DP) to
                        ciz(context, WidgetDuzeni.ORTA, ayar, anlik, kilitEkrani, kapakEkrani, dm),
                    SizeF(WidgetDuzenSecici.GENIS_MIN_GENISLIK_DP, WidgetDuzenSecici.ORTA_MIN_YUKSEKLIK_DP) to
                        ciz(context, WidgetDuzeni.GENIS, ayar, anlik, kilitEkrani, kapakEkrani, dm),
                )
            )
        }
        val genislik = secenek.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0).toFloat()
        val yukseklik = secenek.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0).toFloat()
        val duzen = if (genislik > 0f && yukseklik > 0f) {
            WidgetDuzenSecici.sec(genislik, yukseklik)
        } else if (saglayici == NamazGenisBoyutWidget::class.java.name || saglayici == NamazKapakWidget::class.java.name) {
            WidgetDuzeni.GENIS
        } else {
            WidgetDuzeni.KUCUK
        }
        return ciz(context, duzen, ayar, anlik, kilitEkrani, kapakEkrani, dm)
    }

    /**
     * Bir çizim turunun dili: [m] arayüz dilindeki kaynak bağlamı (YALNIZ metin çözmek için;
     * renk/niyet asıl bağlamla), [dil] saf kararlara verilen kod.
     */
    private class DilMetni(val m: Context, val dil: String) {
        fun s(id: Int, vararg args: Any): String = m.getString(id, *args)
    }

    private fun ciz(
        context: Context,
        duzen: WidgetDuzeni,
        ayar: WidgetAyari,
        a: WidgetVeriDeposu.Anlik,
        kilitEkrani: Boolean,
        kapakEkrani: Boolean,
        dm: DilMetni,
    ): RemoteViews {
        val v = RemoteViews(
            context.packageName,
            when (duzen) {
                WidgetDuzeni.KUCUK -> R.layout.widget_kucuk
                WidgetDuzeni.ORTA -> R.layout.widget_orta
                WidgetDuzeni.GENIS -> R.layout.widget_genis
            },
        )
        val p = PALETLER.getValue(ayar.zemin)
        gorselRengi(context, v, R.id.widget_zemin, p.zemin)
        v.setInt(R.id.widget_zemin, "setImageAlpha", ayar.zeminAlfasi())
        val uygulamaAc = uygulamayiAcan(context)
        if (uygulamaAc != null) v.setOnClickPendingIntent(R.id.widget_kok, uygulamaAc)

        val durum = a.durum
        val aktif = durum.aktif
        val bitis = durum.bitisMs
        val sonraki = durum.sonraki
        // Hedef: aktif vaktin ÇIKIŞI; güneş→öğle arasında sıradaki vaktin GİRİŞİ.
        val (ad, hedefMs, sinirEtiketi) = when {
            aktif != null && bitis != null -> Triple(VakitKodlari.gorunenAd(aktif.kod, dm.dil), bitis, R.string.widget_cikis)
            sonraki != null -> Triple(VakitKodlari.gorunenAd(sonraki.kod, dm.dil), sonraki.ms, R.string.widget_giris)
            else -> Triple(dm.s(R.string.widget_namaz_vakti), null, null)
        }
        val kildimNiyeti = if (KilitEkraniKarari.kildimNiyetiVerilsinMi(a.kildim, kilitEkrani) && aktif != null) {
            kildimNiyeti(context, aktif.tarih, aktif.kod)
        } else null

        v.setTextViewText(R.id.widget_vakit_adi, ad)
        metinRengi(context, v, R.id.widget_vakit_adi, p.metin)
        val bitisMetni = if (hedefMs != null && sinirEtiketi != null) dm.s(sinirEtiketi, saatMetni(hedefMs))
        else dm.s(R.string.widget_uygulamayi_acin)

        if (duzen == WidgetDuzeni.KUCUK) {
            v.setTextViewText(R.id.widget_bitis, bitisMetni)
            metinRengi(context, v, R.id.widget_bitis, p.ikincil)
            gorselRengi(context, v, R.id.widget_kildim, if (a.kildim == KildimDurumu.YOK) p.ikincil else p.vurgu)
            isaretiCiz(context, v, R.id.widget_kildim_ikon, a.kildim, p)
            v.setOnClickPendingIntent(R.id.widget_kildim, kildimNiyeti ?: uygulamaAc)
            v.setContentDescription(R.id.widget_kildim, KilitEkraniKarari.erisimMetni(ad, a.kildim, kilitEkrani, kapakEkrani, dm.dil))
            return v
        }

        // --- 2×2 / 4×2 ortak blok ---
        val sayacVar = hedefMs != null
        val buyukKalan = sayacVar && ayar.gosterim == SureGosterimi.KALAN
        if (sayacVar) {
            val taban = SystemClock.elapsedRealtime() + (hedefMs!! - a.simdiMs)
            val sayacId = if (buyukKalan) R.id.widget_kalan else R.id.widget_kalan_kucuk
            v.setChronometer(sayacId, taban, null, true)
            v.setChronometerCountDown(sayacId, true)
        }
        v.setViewVisibility(R.id.widget_kalan, if (buyukKalan) View.VISIBLE else View.GONE)
        v.setViewVisibility(R.id.widget_buyuk_saat, if (buyukKalan) View.GONE else View.VISIBLE)
        v.setViewVisibility(R.id.widget_kalan_kucuk, if (sayacVar && !buyukKalan) View.VISIBLE else View.GONE)
        v.setViewVisibility(R.id.widget_bitis, if (buyukKalan || !sayacVar) View.VISIBLE else View.GONE)
        v.setTextViewText(R.id.widget_bitis, bitisMetni)
        v.setTextViewText(R.id.widget_buyuk_saat, if (sayacVar) bitisMetni else "--:--")
        metinRengi(context, v, R.id.widget_kalan, p.metin)
        metinRengi(context, v, R.id.widget_buyuk_saat, p.metin)
        metinRengi(context, v, R.id.widget_kalan_kucuk, p.ikincil)
        metinRengi(context, v, R.id.widget_bitis, p.ikincil)

        // Flex Window ipucu "sıradaki" satırının yerine geçer (kapak ekranında dokunuş
        // uygulamayı açamayabilir — `KilitEkraniKarari.kapakIpucu`).
        val sonrakiMetni = KilitEkraniKarari.kapakIpucu(kapakEkrani, a.kildim, dm.dil) ?: when {
            !ayar.sonrakiGoster || sonraki == null -> null
            aktif != null -> dm.s(R.string.widget_siradaki, VakitKodlari.gorunenAd(sonraki.kod, dm.dil), saatMetni(sonraki.ms))
            else -> dm.s(R.string.widget_kilinacak_vakit_yok)
        }
        v.setViewVisibility(R.id.widget_sonraki, if (sonrakiMetni == null) View.GONE else View.VISIBLE)
        v.setTextViewText(R.id.widget_sonraki, sonrakiMetni ?: "")
        metinRengi(context, v, R.id.widget_sonraki, p.ikincil)

        dugmeyiCiz(context, v, a.kildim, sayacVar, kilitEkrani, p, dm)
        v.setOnClickPendingIntent(R.id.widget_kildim, kildimNiyeti ?: uygulamaAc)
        v.setContentDescription(R.id.widget_kildim, KilitEkraniKarari.erisimMetni(ad, a.kildim, kilitEkrani, kapakEkrani, dm.dil))

        if (duzen == WidgetDuzeni.GENIS) listeyiCiz(context, v, a, p, dm)
        return v
    }

    // --- Klasik (yeşil) widget'lar -------------------------------------------------------

    private val KLASIK_SATIRLAR = mapOf(
        VakitKodlari.SABAH to Triple(R.id.klasik_satir_sabah, R.id.klasik_sabah_ad, R.id.klasik_sabah_saat),
        VakitKodlari.GUNES to Triple(R.id.klasik_satir_gunes, R.id.klasik_gunes_ad, R.id.klasik_gunes_saat),
        VakitKodlari.OGLE to Triple(R.id.klasik_satir_ogle, R.id.klasik_ogle_ad, R.id.klasik_ogle_saat),
        VakitKodlari.IKINDI to Triple(R.id.klasik_satir_ikindi, R.id.klasik_ikindi_ad, R.id.klasik_ikindi_saat),
        VakitKodlari.AKSAM to Triple(R.id.klasik_satir_aksam, R.id.klasik_aksam_ad, R.id.klasik_aksam_saat),
        VakitKodlari.YATSI to Triple(R.id.klasik_satir_yatsi, R.id.klasik_yatsi_ad, R.id.klasik_yatsi_saat),
    )

    /**
     * Widget 1.0 görünümü. Kalan süre "sıradaki vakit girişine" (güneş dahil) sayar ve
     * eskisi gibi dakikalık alarmla değil `Chronometer` ile akar; sınır alarmı her
     * girişte (güneş dahil) zaten uyandığı için hedef doğru anda yenilenir. Kararlar
     * `KlasikWidgetKarari`'nda (JVM testli). Dokunuş = uygulamayı aç (Kıldım yok).
     */
    private fun klasikCiz(context: Context, genis: Boolean, a: WidgetVeriDeposu.Anlik, dm: DilMetni): RemoteViews {
        val v = RemoteViews(context.packageName, if (genis) R.layout.widget_klasik_genis else R.layout.widget_klasik)
        val kok = if (genis) R.id.klasik_genis_kok else R.id.klasik_kok
        val adId = if (genis) R.id.klasik_genis_vakit_adi else R.id.klasik_vakit_adi
        val metinId = if (genis) R.id.klasik_genis_kalan_metin else R.id.klasik_kalan_metin
        val sayacId = if (genis) R.id.klasik_genis_kalan else R.id.klasik_kalan
        uygulamayiAcan(context)?.let { v.setOnClickPendingIntent(kok, it) }

        val sonraki = KlasikWidgetKarari.sonrakiGiris(a.vakitler, a.simdiMs)
        if (sonraki == null) {
            v.setTextViewText(adId, if (genis) "--" else dm.s(R.string.widget_klasik_uygulamayi_acin))
            v.setTextViewText(metinId, "--:--")
            v.setViewVisibility(metinId, View.VISIBLE)
            v.setViewVisibility(sayacId, View.GONE)
            v.setContentDescription(kok, dm.s(R.string.widget_klasik_erisim_veri_yok))
        } else {
            v.setTextViewText(adId, KlasikWidgetKarari.yonelmeHali(sonraki.kod, buyukHarf = genis, dil = dm.dil))
            v.setChronometer(sayacId, SystemClock.elapsedRealtime() + (sonraki.ms - a.simdiMs), null, true)
            v.setChronometerCountDown(sayacId, true)
            v.setViewVisibility(sayacId, View.VISIBLE)
            v.setViewVisibility(metinId, View.GONE)
            v.setContentDescription(
                kok,
                dm.s(R.string.widget_klasik_erisim_siradaki, VakitKodlari.gorunenAd(sonraki.kod, dm.dil), saatMetni(sonraki.ms)),
            )
        }
        if (!genis) return v

        for (satir in KlasikWidgetKarari.satirlar(a.vakitler, a.simdiMs)) {
            val (satirId, satirAdId, saatId) = KLASIK_SATIRLAR[satir.kod] ?: continue
            v.setTextViewText(satirAdId, KlasikWidgetKarari.satirAdi(satir.kod, dm.dil))
            v.setTextViewText(saatId, satir.ms?.let { saatMetni(it) } ?: "--:--")
            v.setInt(satirId, "setBackgroundResource", if (satir.aktif) R.drawable.widget_klasik_satir_aktif else 0)
            val renk = if (satir.aktif) R.color.widget_klasik_metin else R.color.widget_klasik_metin_soluk
            metinRengi(context, v, satirAdId, renk)
            metinRengi(context, v, saatId, renk)
        }
        return v
    }

    private fun dugmeyiCiz(
        context: Context,
        v: RemoteViews,
        kildim: KildimDurumu,
        veriVar: Boolean,
        kilitEkrani: Boolean,
        p: Palet,
        dm: DilMetni,
    ) {
        if (!KilitEkraniKarari.dugmeGorunurMu(kildim, veriVar, kilitEkrani)) {
            v.setViewVisibility(R.id.widget_kildim_dugme, View.GONE)
            return
        }
        v.setViewVisibility(R.id.widget_kildim_dugme, View.VISIBLE)
        val etkin = kildim == KildimDurumu.KILINABILIR
        gorselRengi(context, v, R.id.widget_kildim, p.vurgu)
        // Etkin değilken soluk zemin: "basılabilir" sanılmasın.
        v.setInt(R.id.widget_kildim, "setImageAlpha", if (etkin) 255 else 56)
        v.setTextViewText(
            R.id.widget_kildim_metin,
            dm.s(
                when (kildim) {
                    KildimDurumu.KILINABILIR -> R.string.widget_dugme_kildim
                    KildimDurumu.BEKLIYOR -> R.string.widget_dugme_isaretleniyor
                    KildimDurumu.KILINDI -> R.string.widget_dugme_kilindi
                    KildimDurumu.YOK -> R.string.widget_dugme_vakit_girmedi
                }
            ),
        )
        metinRengi(context, v, R.id.widget_kildim_metin, if (etkin) p.vurguUstu else p.metin)
        when (kildim) {
            KildimDurumu.KILINABILIR -> {
                v.setViewVisibility(R.id.widget_kildim_ikon, View.VISIBLE)
                v.setImageViewResource(R.id.widget_kildim_ikon, R.drawable.ic_widget_kildim)
                gorselRengi(context, v, R.id.widget_kildim_ikon, p.vurguUstu)
            }
            else -> isaretiCiz(context, v, R.id.widget_kildim_ikon, kildim, p)
        }
    }

    private fun isaretiCiz(context: Context, v: RemoteViews, id: Int, kildim: KildimDurumu, p: Palet) {
        when (kildim) {
            KildimDurumu.KILINDI -> {
                v.setViewVisibility(id, View.VISIBLE)
                v.setImageViewResource(id, R.drawable.ic_widget_kildim)
                gorselRengi(context, v, id, p.vurgu)
            }
            KildimDurumu.BEKLIYOR -> {
                v.setViewVisibility(id, View.VISIBLE)
                v.setImageViewResource(id, R.drawable.ic_widget_bekliyor)
                gorselRengi(context, v, id, p.ikincil)
            }
            else -> v.setViewVisibility(id, View.GONE)
        }
    }

    private fun listeyiCiz(context: Context, v: RemoteViews, a: WidgetVeriDeposu.Anlik, p: Palet, dm: DilMetni) {
        val gun = VakitCizelgesi.gosterilecekGun(a.durum)
        val vakitler = if (gun == null) emptyList() else VakitCizelgesi.gunVakitleri(a.vakitler, gun)
        val kilinan = if (gun == null) emptySet() else a.kilinanlar[gun].orEmpty()
        val aktif = a.durum.aktif
        for ((kod, idler) in SATIRLAR) {
            val (satir, adId, saatId, isaretId) = idler.toList()
            val giris = vakitler.firstOrNull { it.kod == kod }
            val buSatirAktif = aktif != null && aktif.kod == kod && aktif.tarih == gun
            v.setTextViewText(adId, VakitKodlari.gorunenAd(kod, dm.dil))
            v.setTextViewText(saatId, if (giris != null) saatMetni(giris.ms) else "--:--")
            metinRengi(context, v, adId, if (buSatirAktif) p.metin else p.ikincil)
            metinRengi(context, v, saatId, if (buSatirAktif) p.metin else p.ikincil)
            v.setInt(satir, "setBackgroundResource", if (buSatirAktif) R.drawable.widget_satir_aktif else 0)
            val satirDurumu = when {
                kod in kilinan -> KildimDurumu.KILINDI
                buSatirAktif && a.kildim == KildimDurumu.BEKLIYOR -> KildimDurumu.BEKLIYOR
                else -> KildimDurumu.YOK
            }
            if (satirDurumu == KildimDurumu.YOK) {
                v.setViewVisibility(isaretId, View.INVISIBLE)
            } else {
                isaretiCiz(context, v, isaretId, satirDurumu, p)
            }
        }
    }

    // --- Niyetler (PendingIntent) ------------------------------------------------------

    private fun uygulamayiAcan(context: Context): PendingIntent? {
        val baslat = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
        return PendingIntent.getActivity(
            context, 0, baslat, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    /** Fable kararı: requestCode = `"<tarih>_<vakit>".hashCode()` — vakit değişince eski dokunuş geçersizleşir. */
    private fun kildimNiyeti(context: Context, tarih: String, widgetKodu: String): PendingIntent? {
        val vakitAdi = VakitKodlari.kuyrukVakti(widgetKodu) ?: return null
        val niyet = Intent(context, WidgetKildimAlici::class.java)
            .setAction(WidgetKildimAlici.EYLEM)
            .putExtra(WidgetKildimAlici.EK_TARIH, tarih)
            .putExtra(WidgetKildimAlici.EK_VAKIT, widgetKodu)
        return PendingIntent.getBroadcast(
            context, kildimIstekKodu(tarih, vakitAdi), niyet,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    // --- Renk -------------------------------------------------------------------------

    /**
     * API 31+: renk KAYNAK olarak verilir ve başlatıcının yapılandırmasında çözülür →
     * Material You / gece modu değişince widget'ı yeniden çizmeye gerek kalmaz.
     */
    private fun metinRengi(context: Context, v: RemoteViews, id: Int, renk: Int) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            v.setColorStateList(id, "setTextColor", renk)
        } else {
            v.setTextColor(id, context.getColor(renk))
        }
    }

    private fun gorselRengi(context: Context, v: RemoteViews, id: Int, renk: Int) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            v.setColorStateList(id, "setImageTintList", renk)
        } else {
            v.setInt(id, "setColorFilter", context.getColor(renk))
        }
    }

    // --- Sınır alarmı -------------------------------------------------------------------

    private fun sinirNiyeti(context: Context): PendingIntent = PendingIntent.getBroadcast(
        context, 0,
        Intent(context, NamazWidgetAlarmAlici::class.java).setAction(SINIR_EYLEMI),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    /**
     * Bir sonraki vakit sınırına TEK alarm. Aynı PendingIntent → önceki alarm ezilir;
     * tazeleme ne kadar sık olursa olsun bekleyen alarm sayısı 1 kalır.
     */
    private fun sinirAlarminiKur(context: Context, a: WidgetVeriDeposu.Anlik) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        eskiDakikaAlarminiIptalEt(context, alarm)
        val sinir = VakitCizelgesi.sonrakiSinirMs(a.vakitler, a.simdiMs)
        if (sinir == null) {
            alarm.cancel(sinirNiyeti(context))
            return
        }
        try {
            // API 31+'da setWindow penceresi en az 10 dk'ya genişler → izin varsa tam
            // alarm (RTC: yine UYANDIRMAZ, ekran açılınca hemen teslim edilir).
            val tamIzin = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarm.canScheduleExactAlarms()
            when (SinirAlarmi.yontem(Build.VERSION.SDK_INT, tamIzin)) {
                SinirAlarmi.Yontem.TAM -> alarm.setExact(AlarmManager.RTC, sinir, sinirNiyeti(context))
                SinirAlarmi.Yontem.PENCERE -> alarm.setWindow(AlarmManager.RTC, sinir, PENCERE_MS, sinirNiyeti(context))
            }
        } catch (e: SecurityException) {
            // İzin okunduktan sonra geri alınmış olabilir: yaklaşık yola düş.
            Log.w(TAG, "Tam alarm izni yok, pencereli kuruluyor", e)
            try { alarm.setWindow(AlarmManager.RTC, sinir, PENCERE_MS, sinirNiyeti(context)) } catch (_: Exception) { }
        } catch (e: Exception) {
            Log.w(TAG, "Widget sinir alarmi kurulamadi", e)
        }
    }

    fun sinirAlarminiIptalEt(context: Context) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarm.cancel(sinirNiyeti(context))
        eskiDakikaAlarminiIptalEt(context, alarm)
    }

    /**
     * Widget 1.0'ın dakikalık alarmı (eylemsiz niyet) güncellemeden sonra bir kez daha
     * tetiklenebilir; açıkça iptal edilir ki dakika döngüsü geri gelmesin.
     */
    private fun eskiDakikaAlarminiIptalEt(context: Context, alarm: AlarmManager) {
        val eski = PendingIntent.getBroadcast(
            context, 0, Intent(context, NamazWidgetAlarmAlici::class.java),
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE,
        ) ?: return
        alarm.cancel(eski)
        eski.cancel()
    }

    private fun kutuyuTazele(context: Context) {
        try {
            TileService.requestListeningState(context, ComponentName(context, KildimKutusuServisi::class.java))
        } catch (e: Throwable) {
            Log.i(TAG, "Hizli ayarlar kutusu tazelenemedi", e)
        }
    }
}
