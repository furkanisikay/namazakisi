package com.furkanisikay.namazakisi.alarm

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.furkanisikay.namazakisi.cekirdek.TeslimSahipligi
import expo.modules.countdownnotification.AnonsZamanlayici

/**
 * JS ↔ gerçek alarm köprüsü (issue #74). JS adı: `NativeModules.MuhafizAlarm`
 * (`src/domain/services/MuhafizAlarmKoprusu.ts`). Hiçbir yöntem reddetmez: hata da bir
 * sonuçtur (false/0) — planlama hiçbir koşulda bu köprü yüzünden durmamalı.
 */
class MuhafizAlarmModulu(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MuhafizAlarm"

    /** Alarmı kurar; kurulamazsa false (JS aynı tetiği normal bildirim olarak kurar). */
    @ReactMethod
    fun planla(kimlik: String, tetikMs: Double, yuk: String, promise: Promise) {
        promise.resolve(
            try {
                MuhafizAlarmZamanlayici.planla(reactApplicationContext, kimlik, tetikMs.toLong(), yuk)
            } catch (_: Exception) {
                false
            }
        )
    }

    @ReactMethod
    fun iptalEt(kimlik: String, promise: Promise) {
        try {
            MuhafizAlarmZamanlayici.iptal(reactApplicationContext, kimlik)
        } catch (_: Exception) {
            // Kayıtlı değilse sorun değil.
        }
        promise.resolve(null)
    }

    /** Öneki taşıyan TÜM BEKLEYEN alarmlar (yeniden planlama öncesi temizlik; çalanı susturmaz). */
    @ReactMethod
    fun onekliIptalEt(onek: String, promise: Promise) {
        promise.resolve(
            try {
                MuhafizAlarmZamanlayici.onekliIptalEt(reactApplicationContext, onek)
            } catch (_: Exception) {
                0
            }
        )
    }

    /**
     * Uygulama içi "Kıldım": vaktin bekleyen alarmları + ÇALAN alarm bildirimi (ses, tam
     * ekran, susturma alarmı). [onekliIptalEt] çalanı GÖRMEZ (tetiklenen alarm kayıttan
     * düşmüştür) — planlama turu o yüzden onu kullanır, "Kıldım" bunu.
     */
    @ReactMethod
    fun vakitAlarmlariniSustur(onek: String, promise: Promise) {
        promise.resolve(
            try {
                MuhafizAlarmTemizligi.onekliSustur(reactApplicationContext, onek)
            } catch (_: Exception) {
                0
            }
        )
    }

    /**
     * Bir teslim SAHİPLİĞİNİN (ortak hatırlatma yüzeyleri, plan §4.1) bekleyen sesli anons
     * ve/veya gerçek alarm kayıtlarını iptal eder: `muhafiz_plan` (muhafız açık — yalnız plan
     * kimlikleri), `muhafiz_tumu` (muhafız kapalı — erteleme dahil, YATIŞ HARİÇ), `yatis`.
     * Önek yetmez: yatış/muhasebe kimlikleri `muhafiz_` uzayındadır; önekle silmek her
     * muhafız turunda onları da silerdi. Kural `cekirdek/TeslimSahipligi` (JVM testi). Çalan
     * alarma dokunmaz (planlama iptali). Silinen kayıt sayısını döndürür.
     */
    @ReactMethod
    fun sahipliIptalEt(sahip: String, anons: Boolean, alarm: Boolean, promise: Promise) {
        val ctx = reactApplicationContext
        val esles: (String) -> Boolean = { TeslimSahipligi.eslesir(sahip, it) }
        var sayi = 0
        if (alarm) {
            try {
                sayi += MuhafizAlarmZamanlayici.eslesenleriIptalEt(ctx, esles).size
            } catch (_: Exception) {
                // Bir sonraki turda yeniden denenir.
            }
        }
        if (anons) {
            try {
                sayi += AnonsZamanlayici.eslesenleriIptalEt(ctx, esles).size
            } catch (_: Exception) {
                // Bir sonraki turda yeniden denenir.
            }
        }
        promise.resolve(sayi)
    }

    @ReactMethod
    fun bekleyenSayisi(promise: Promise) {
        promise.resolve(
            try {
                MuhafizAlarmZamanlayici.bekleyenSayisi(reactApplicationContext)
            } catch (_: Exception) {
                0
            }
        )
    }

    /** Listede olmayan hash'li alarm kanallarını siler (taban kanal kalır). */
    @ReactMethod
    fun kanallariTemizle(korunacak: ReadableArray, promise: Promise) {
        try {
            val liste = (0 until korunacak.size()).mapNotNull { korunacak.getString(it) }
            MuhafizAlarmBildirimi.kanallariTemizle(reactApplicationContext, liste)
        } catch (_: Exception) {
            // Çöp toplama başarısızsa bir sonraki turda yeniden denenir.
        }
        promise.resolve(null)
    }

    /** Tam ekran alarm izni (Android 14+); 13 ve öncesinde daima true. */
    @ReactMethod
    fun tamEkranIzniVarMi(promise: Promise) {
        promise.resolve(MuhafizAlarmBildirimi.tamEkranIzniVarMi(reactApplicationContext))
    }

    /** Tam alarm (exact alarm) kurulabilir mi? (12/12L'de kullanıcı kapatabilir.) */
    @ReactMethod
    fun tamAlarmIzniVarMi(promise: Promise) {
        promise.resolve(MuhafizAlarmZamanlayici.kurulabilirMi(reactApplicationContext))
    }

    /**
     * Tam ekran izni ayarını açar (Android 14+ `ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT`),
     * olmazsa uygulamanın bildirim ayarlarına düşer. `resolveActivity` KULLANILMAZ
     * (Android 11+ paket görünürlüğü null döndürür — AGENTS.md pil rehberi dersi).
     */
    @ReactMethod
    fun tamEkranAyariniAc(promise: Promise) {
        val ctx = reactApplicationContext
        val paket = Uri.parse("package:${ctx.packageName}")
        val adaylar = mutableListOf<Intent>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            adaylar.add(Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, paket))
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            adaylar.add(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, ctx.packageName))
        }
        adaylar.add(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, paket))
        for (aday in adaylar) {
            try {
                ctx.startActivity(aday.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                promise.resolve(true)
                return
            } catch (_: Exception) {
                // Sıradaki adayı dene.
            }
        }
        promise.resolve(false)
    }
}
