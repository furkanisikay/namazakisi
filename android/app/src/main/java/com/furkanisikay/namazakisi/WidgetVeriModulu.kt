package com.furkanisikay.namazakisi

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.furkanisikay.namazakisi.cekirdek.CihazDurumKurallari
import com.furkanisikay.namazakisi.duvar.DuvarKagidiUygulayici
import com.furkanisikay.namazakisi.widget.GununAyetiDeposu
import com.furkanisikay.namazakisi.widget.GununAyetiGuncelleyici
import com.furkanisikay.namazakisi.widget.WidgetGuncelleyici
import com.furkanisikay.namazakisi.widget.WidgetVeriDeposu

/**
 * Widget veri köprüsü — JS'in hesapladığı vakitleri ve kılınmışlığı
 * SharedPreferences'a yazar, widget'ları + hızlı ayarlar kutusunu HEMEN tazeler
 * (issue #275: uygulamadaki işaretleme ≤ 1 sn'de widget'a yansır).
 * JS tarafı: `src/domain/services/WidgetServisi.ts`.
 */
class WidgetVeriModulu(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "WidgetVeriModulu"
        const val MODULE_NAME = "WidgetVeri"
        const val PREFS_NAME = WidgetVeriDeposu.PREFS_NAME
        const val KEY_DATA = WidgetVeriDeposu.KEY_DATA
    }

    override fun getName(): String = MODULE_NAME

    /** Vakit çizelgesi (dün + 8 gün, `src/core/widget/widgetYuku.ts`). */
    @ReactMethod
    fun vakitlerKaydet(dataJson: String) {
        yazVeTazele(WidgetVeriDeposu.KEY_DATA, dataJson)
    }

    /** tarih → kılınan widget kodları. */
    @ReactMethod
    fun kilinanlarKaydet(json: String) {
        yazVeTazele(WidgetVeriDeposu.KEY_KILINAN, json)
    }

    /**
     * Ana ekrana (ya da kilit ekranına/kapak ekranına) en az bir uygulama widget'ı
     * eklenmiş mi? "Nasıl eklenir" anlatımı yalnız eklememiş kişiye gösterilsin.
     * İzin gerekmez. Okunamazsa `null`.
     */
    @ReactMethod
    fun widgetEkliMi(promise: Promise) {
        try {
            val context = reactApplicationContext
            val yonetici = AppWidgetManager.getInstance(context)
            val sayilar = WidgetGuncelleyici.SAGLAYICILAR.map { sinif ->
                yonetici.getAppWidgetIds(ComponentName(context, sinif)).size
            }
            promise.resolve(CihazDurumKurallari.widgetEkliMi(sayilar))
        } catch (e: Throwable) {
            Log.w(TAG, "Widget sayisi okunamadi", e)
            promise.resolve(null)
        }
    }

    /**
     * Günün ayeti planı (#380/#381, yük şeması v1 — `docs/ajan/gunun-ayeti.md`). JS yazar
     * (`GununAyetiServisi.yaz`): açılış, konum değişimi, arka plan turu, dil ve duvar kâğıdı
     * ayarı değişimi. Çözülemeyen yük YAZILMAZ (eski geçerli yük kalır). Yazınca ayet
     * widget'ları çizilir, sınır alarmı yeniden kurulur ve duvar kâğıdı açıksa imzası
     * değiştiyse arka planda uygulanır (aynı içerik yeniden yazılmaz).
     */
    @ReactMethod
    fun gununAyetiKaydet(json: String) {
        try {
            val context = reactApplicationContext
            if (!GununAyetiDeposu.yaz(context, json)) {
                Log.w(TAG, "Gunun ayeti yuku cozulemedi; yazilmadi")
                return
            }
            GununAyetiGuncelleyici.tumunuGuncelle(context)
            DuvarKagidiUygulayici.arkaPlandaGerekirseUygula(context)
        } catch (e: Throwable) {
            Log.e(TAG, "Gunun ayeti kaydedilemedi", e)
        }
    }

    /** Ana ekranda en az bir "Günün ayeti" widget'ı var mı? Okunamazsa `null`. */
    @ReactMethod
    fun gununAyetiWidgetEkliMi(promise: Promise) {
        try {
            promise.resolve(GununAyetiGuncelleyici.widgetSayisi(reactApplicationContext) > 0)
        } catch (e: Throwable) {
            Log.w(TAG, "Ayet widget sayisi okunamadi", e)
            promise.resolve(null)
        }
    }

    /**
     * "Günün ayeti" widget'ını ana ekrana eklemek için başlatıcının onay penceresini açar
     * (`requestPinAppWidget`, API 26+). Başlatıcı desteklemiyorsa ya da istek reddedilirse
     * `false`: ekran elle ekleme tarifini gösterir.
     */
    @ReactMethod
    fun gununAyetiWidgetiniSabitle(promise: Promise) {
        try {
            if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.O) {
                promise.resolve(false)
                return
            }
            val yonetici = AppWidgetManager.getInstance(reactApplicationContext)
            if (!yonetici.isRequestPinAppWidgetSupported) {
                promise.resolve(false)
                return
            }
            val saglayici = ComponentName(reactApplicationContext, com.furkanisikay.namazakisi.widget.GununAyetiWidget::class.java)
            promise.resolve(yonetici.requestPinAppWidget(saglayici, null, null))
        } catch (e: Throwable) {
            Log.w(TAG, "Ayet widget'i sabitlenemedi", e)
            promise.resolve(false)
        }
    }

    /** Başlatıcı widget sabitlemeyi destekliyor mu (düğmeyi göstermek için)? */
    @ReactMethod
    fun widgetSabitlemeDestekleniyorMu(promise: Promise) {
        try {
            promise.resolve(
                android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O &&
                    AppWidgetManager.getInstance(reactApplicationContext).isRequestPinAppWidgetSupported
            )
        } catch (e: Throwable) {
            Log.w(TAG, "Widget sabitleme destegi okunamadi", e)
            promise.resolve(false)
        }
    }

    private fun yazVeTazele(anahtar: String, deger: String) {
        try {
            val context = reactApplicationContext
            context.getSharedPreferences(WidgetVeriDeposu.PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(anahtar, deger)
                .commit()
            WidgetGuncelleyici.tumunuGuncelle(context)
        } catch (e: Throwable) {
            Log.e(TAG, "Widget verisi kaydedilemedi veya widget guncellenemedi", e)
        }
    }
}
