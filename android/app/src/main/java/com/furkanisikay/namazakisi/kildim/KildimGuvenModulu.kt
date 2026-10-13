package com.furkanisikay.namazakisi.kildim

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Eylem
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Karar
import org.json.JSONArray
import org.json.JSONObject

/**
 * JS ↔ "Kıldım" güven listesi köprüsü (issue #299). JS adı: `NativeModules.KildimGuven`
 * (`src/domain/services/KildimGuvenServisi.ts`). Değerler JSON metni olarak döner
 * (kuyruk modülüyle aynı desen; JS tarafı savunmalı çözer).
 */
class KildimGuvenModulu(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = MODULE_NAME

    /** `[{paket, karar: "izin"|"engel", ad, zamanMs}]` — Ayarlar listesi sırasıyla. */
    @ReactMethod
    fun listeAl(promise: Promise) {
        val dizi = JSONArray()
        KildimGuvenKurallari.sirali(KildimGuvenDeposu.tumu(reactApplicationContext)).forEach {
            dizi.put(JSONObject().put("paket", it.paket).put("karar", it.karar.kod).put("ad", it.ad).put("zamanMs", it.zamanMs))
        }
        promise.resolve(dizi.toString())
    }

    /** Ayarlar'dan izin ↔ engel. Kayıtlı olmayan pakete yazılmaz (liste yalnız soru ile büyür). */
    @ReactMethod
    fun kararDegistir(paket: String, karar: String, promise: Promise) {
        val k = Karar.koddan(karar)
        promise.resolve(k != null && KildimGuvenDeposu.kararDegistir(reactApplicationContext, paket, k))
    }

    @ReactMethod
    fun kaldir(paket: String, promise: Promise) {
        KildimGuvenDeposu.kaldir(reactApplicationContext, paket)
        promise.resolve(null)
    }

    /**
     * Son `namazakisi://kildim` bağlantısının başlatanı + güven listesine göre ne yapılacağı.
     * `{eylem: "dogrudan"|"yokSay"|"sor", paket, ad, herZaman, engel}`. Kaydı TÜKETİR.
     */
    @ReactMethod
    fun derinBaglantiKarari(promise: Promise) {
        val baslatan = KildimDerinBaglantiKaydi.al()
        val o = JSONObject().put("paket", baslatan.paket ?: JSONObject.NULL).put("ad", baslatan.ad)
        when (val e = baslatan.eylem(reactApplicationContext)) {
            Eylem.Dogrudan -> o.put("eylem", "dogrudan").put("herZaman", false).put("engel", false)
            Eylem.YokSay -> o.put("eylem", "yokSay").put("herZaman", false).put("engel", false)
            is Eylem.Sor -> o.put("eylem", "sor").put("herZaman", e.herZamanSunulur).put("engel", e.engelSunulur)
        }
        // Soru yanıtı kaydedilirken sınıf yeniden gerekecek → kısa süre saklanır.
        sonSoru = if (baslatan.paket != null) baslatan else null
        promise.resolve(o.toString())
    }

    /**
     * Soru penceresindeki kalıcı karar ("Her zaman izin ver" / "Engelle"). Yalnız son
     * sorulan başlatan için ve kurallar izin veriyorsa yazılır — JS rastgele bir pakete
     * "izin" yazdıramaz (tarayıcıya ve kimliği bilinmeyene kalıcı izin YOK).
     */
    @ReactMethod
    fun soruyuYanitla(paket: String, karar: String, promise: Promise) {
        val baslatan = sonSoru
        val k = Karar.koddan(karar)
        val yazildi = if (
            baslatan != null && k != null && baslatan.paket == paket &&
            KildimGuvenKurallari.kaydedilebilirMi(baslatan.sinif, k)
        ) {
            KildimGuvenDeposu.kaydet(reactApplicationContext, paket, k, baslatan.ad)
            true
        } else {
            false
        }
        sonSoru = null
        promise.resolve(yazildi)
    }

    companion object {
        const val MODULE_NAME = "KildimGuven"

        @Volatile
        private var sonSoru: KildimBaslatani? = null
    }
}
