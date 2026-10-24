package com.furkanisikay.namazakisi.widget

import androidx.appcompat.app.AppCompatActivity
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.RadioGroup
import android.widget.SeekBar
import android.widget.Switch
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.dildeBaglam
import com.furkanisikay.namazakisi.cekirdek.AyetIcerigi
import com.furkanisikay.namazakisi.cekirdek.SureGosterimi
import com.furkanisikay.namazakisi.cekirdek.WidgetAyari
import com.furkanisikay.namazakisi.cekirdek.WidgetZemini

/**
 * Widget özelleştirme ekranı (issue #275): zemin (duvar kağıdı renkleri / açık / koyu /
 * şeffaf), zemin opaklığı, büyük satır (kalan süre ↔ bitiş saati), sıradaki vakit.
 *
 * Günün ayeti widget'ı (#380) da AYNI ekranı ve aynı zemin/opaklık kaydını (`WidgetAyari`)
 * kullanır: orada vakit seçenekleri gizlenir, "uygulama rengi (açık ton)" zemini ve kare
 * boyuttaki içerik (meal / hat) görünür.
 *
 * `widgetFeatures="reconfigurable|configuration_optional"`: API 31+'da yerleştirmede
 * açılmaz (varsayılanlar zaten kullanılabilir), uzun basıp "Widget'ı düzenle" ile açılır;
 * daha eski sürümlerde yerleştirmede açılır — Vazgeç widget'ı eklemez (RESULT_CANCELED).
 * Kayıt, widget'ı hemen yeniden çizer.
 */
class WidgetYapilandirmaActivity : AppCompatActivity() {

    private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID

    /** Yerleşimin `@string`'leri UYGULAMANIN arayüz dilinde çözülsün (cihaz dili farklı olabilir). */
    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(newBase.dildeBaglam())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        appWidgetId = intent?.extras?.getInt(
            AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID,
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID
        // Varsayılan sonuç VAZGEÇ: geri tuşu widget eklemez.
        setResult(RESULT_CANCELED, sonucNiyeti())
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }
        setContentView(R.layout.activity_widget_yapilandirma)

        val ayetWidgeti = try {
            AppWidgetManager.getInstance(this).getAppWidgetInfo(appWidgetId)?.provider?.className ==
                GununAyetiWidget::class.java.name
        } catch (_: Exception) {
            false
        }

        val mevcut = WidgetVeriDeposu.ayar(this, appWidgetId)
        val zemin = findViewById<RadioGroup>(R.id.ayar_zemin)
        val opaklik = findViewById<SeekBar>(R.id.ayar_opaklik)
        val opaklikBaslik = findViewById<View>(R.id.ayar_opaklik_baslik)
        val gosterim = findViewById<RadioGroup>(R.id.ayar_gosterim)
        val sonraki = findViewById<Switch>(R.id.ayar_sonraki)
        val ayetIcerik = findViewById<RadioGroup>(R.id.ayar_ayet_icerik)

        if (ayetWidgeti) {
            // Vakit seçenekleri bu widget'ta anlamsız; ayete özgü seçenekler görünür.
            for (id in intArrayOf(R.id.ayar_gosterim_baslik, R.id.ayar_gosterim, R.id.ayar_gosterim_not, R.id.ayar_sonraki)) {
                findViewById<View>(id).visibility = View.GONE
            }
            findViewById<View>(R.id.ayar_zemin_palet).visibility = View.VISIBLE
            findViewById<View>(R.id.ayar_ayet_icerik_baslik).visibility = View.VISIBLE
            ayetIcerik.visibility = View.VISIBLE
            ayetIcerik.check(
                if (GununAyetiDeposu.icerik(this, appWidgetId) == AyetIcerigi.HAT) R.id.ayar_ayet_icerik_hat
                else R.id.ayar_ayet_icerik_meal
            )
        }

        // Palet yalnız ayet widget'ında seçilebilir; namaz widget'ında görünmez, varsayılana düşer.
        val gosterilenZemin = if (!ayetWidgeti && mevcut.zemin == WidgetZemini.PALET) WidgetZemini.MATERIAL else mevcut.zemin
        zemin.check(ZEMIN_IDLERI.getValue(gosterilenZemin))
        // SeekBar.min API 26+; minSdk 24 → 0..80 aralığı + MIN_OPAKLIK kaydırması.
        opaklik.progress = mevcut.opaklik - WidgetAyari.MIN_OPAKLIK
        gosterim.check(if (mevcut.gosterim == SureGosterimi.KALAN) R.id.ayar_gosterim_kalan else R.id.ayar_gosterim_bitis)
        sonraki.isChecked = mevcut.sonrakiGoster

        val opaklikGorunurlugu = {
            val gorunur = zemin.checkedRadioButtonId != R.id.ayar_zemin_seffaf
            opaklik.visibility = if (gorunur) View.VISIBLE else View.GONE
            opaklikBaslik.visibility = opaklik.visibility
        }
        opaklikGorunurlugu()
        zemin.setOnCheckedChangeListener { _, _ -> opaklikGorunurlugu() }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            // Material You yok: bu seçenek sistemin açık/koyu temasını izler.
            findViewById<android.widget.RadioButton>(R.id.ayar_zemin_material).setText(R.string.widget_ayar_zemin_sistem)
        }

        findViewById<Button>(R.id.ayar_vazgec).setOnClickListener { finish() }
        findViewById<Button>(R.id.ayar_kaydet).setOnClickListener {
            val secilenZemin = ZEMIN_IDLERI.entries.firstOrNull { it.value == zemin.checkedRadioButtonId }?.key
                ?: WidgetZemini.MATERIAL
            WidgetVeriDeposu.ayarYaz(
                this, appWidgetId,
                WidgetAyari(
                    zemin = secilenZemin,
                    opaklik = opaklik.progress + WidgetAyari.MIN_OPAKLIK,
                    // Ayet widget'ında gizli alanlar mevcut değerleriyle korunur.
                    gosterim = if (gosterim.checkedRadioButtonId == R.id.ayar_gosterim_bitis) SureGosterimi.BITIS else SureGosterimi.KALAN,
                    sonrakiGoster = sonraki.isChecked,
                ),
            )
            if (ayetWidgeti) {
                GununAyetiDeposu.icerikYaz(
                    this, appWidgetId,
                    if (ayetIcerik.checkedRadioButtonId == R.id.ayar_ayet_icerik_hat) AyetIcerigi.HAT else AyetIcerigi.MEAL,
                )
                GununAyetiGuncelleyici.tumunuGuncelle(this)
            } else {
                WidgetGuncelleyici.tumunuGuncelle(this)
            }
            setResult(RESULT_OK, sonucNiyeti())
            finish()
        }
    }

    private fun sonucNiyeti(): Intent = Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)

    companion object {
        private val ZEMIN_IDLERI = mapOf(
            WidgetZemini.MATERIAL to R.id.ayar_zemin_material,
            WidgetZemini.ACIK to R.id.ayar_zemin_acik,
            WidgetZemini.KOYU to R.id.ayar_zemin_koyu,
            WidgetZemini.SEFFAF to R.id.ayar_zemin_seffaf,
            WidgetZemini.PALET to R.id.ayar_zemin_palet,
        )
    }
}
