package com.furkanisikay.namazakisi.otomasyon

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.furkanisikay.namazakisi.arayuzDili
import com.furkanisikay.namazakisi.cekirdek.EklentiAyari
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.cekirdek.KosulKipi
import com.furkanisikay.namazakisi.cekirdek.OtomasyonKurallari
import com.furkanisikay.namazakisi.cekirdek.OtomasyonProtokolu
import com.furkanisikay.namazakisi.cekirdek.SorguSonucu
import com.furkanisikay.namazakisi.kildim.KildimGuvenDeposu
import com.furkanisikay.namazakisi.kildim.KildimIslemleri
import com.furkanisikay.namazakisi.widget.WidgetVeriDeposu

/**
 * Dışa açık eklenti alıcılarının ORTAK doğrulaması (issue #278).
 *
 * Yalnız protokol eylemi kabul edilir; paket `OtomasyonKurallari.paketOku` ile
 * (yalnız String değerler, sınırlı boyut) çözülür; belirteç o pakete verilenle aynı ve
 * paket güven listesinde "izin" olmalı. Android 14+'da gönderen kimliğini paylaştıysa
 * (`getSentFromPackage`) paketteki adla aynı olmalı. Başarısız her durum SESSİZDİR.
 */
internal object EklentiDogrulama {
    private const val TAG = "OtomasyonEklentisi"

    fun yetkiliAyar(alici: BroadcastReceiver, ctx: Context, intent: Intent, eylem: String): EklentiAyari? {
        if (intent.action != eylem) return null
        val ayar = try {
            OtomasyonKurallari.paketOku(paketiHaritayaCevir(intent.getBundleExtra(OtomasyonProtokolu.EK_PAKET)))
        } catch (e: Exception) {
            // Bilinmeyen Parcelable (BadParcelableException) dahil: bozuk girdi = yok say.
            Log.w(TAG, "Eklenti paketi okunamadi", e)
            null
        } ?: return null
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            val gonderen = try { alici.sentFromPackage } catch (_: Exception) { null }
            if (gonderen != null && gonderen != ayar.paket) return null
        }
        val yetkili = OtomasyonKurallari.yetkiliMi(
            ayar,
            OtomasyonDeposu.belirtec(ctx, ayar.paket),
            KildimGuvenDeposu.karar(ctx, ayar.paket),
        )
        return if (yetkili) ayar else null
    }

    private fun paketiHaritayaCevir(b: Bundle?): Map<String, Any?>? {
        if (b == null) return null
        val m = HashMap<String, Any?>()
        for (k in b.keySet()) {
            if (!k.startsWith("com.furkanisikay.namazakisi.otomasyon.")) continue
            @Suppress("DEPRECATION")
            m[k] = b.get(k)
        }
        return m
    }
}

/**
 * Locale/Tasker AYARI — "Şu anki vakti kılındı olarak işaretle" (FIRE_SETTING).
 * Vakit kararı widget/kısayol ile AYNI ortak kuraldır (`KildimIslemleri` →
 * `KildimDurumKarari`/`VakitCizelgesi`); kuyruğa kaynak `otomasyon` ile yazılır, JS
 * bildirimdeki "Kıldım" ile aynı gövdeden işler. Sonuç kısa bir mesajla bildirilir
 * (otomasyon arka planda çalıştığında da işaretlendiğini görün).
 */
class OtomasyonEylemAlici : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val ayar = EklentiDogrulama.yetkiliAyar(this, context, intent, OtomasyonProtokolu.AYAR_CALISTIR) ?: return
        if (ayar !is EklentiAyari.Kildim) return
        try {
            val sonuc = KildimIslemleri.simdikiVaktiKuyrugaAl(context, KildimKuyruguKurallari.KAYNAK_OTOMASYON)
            Toast.makeText(context.applicationContext, KildimIslemleri.sonucMetni(context, sonuc), Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Log.w("OtomasyonEylemAlici", "Kildim islenemedi", e)
        }
    }
}

/**
 * Locale/Tasker KOŞULU / OLAYI sorgusu (QUERY_CONDITION, sıralı yayın). Yetkisiz ya da
 * bozuk sorgu BİLİNMİYOR döner (bilgi sızdırmaz). Sağlanan sorguda Tasker değişkenleri
 * sonuç ek'lerine yazılır; diğer host'lar bilinmeyen eki yok sayar.
 */
class OtomasyonKosulAlici : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val sonuc = try {
            degerlendir(context, intent)
        } catch (e: Exception) {
            Log.w("OtomasyonKosulAlici", "Sorgu degerlendirilemedi", e)
            SorguSonucu(OtomasyonProtokolu.SONUC_BILINMIYOR)
        }
        if (!isOrderedBroadcast) return
        resultCode = sonuc.kod
        if (sonuc.kod == OtomasyonProtokolu.SONUC_SAGLANDI && sonuc.degiskenler.isNotEmpty()) {
            val d = Bundle()
            sonuc.degiskenler.forEach { (k, v) -> d.putString(k, v) }
            getResultExtras(true).putBundle(OtomasyonProtokolu.TASKER_DEGISKENLER, d)
        }
    }

    private fun degerlendir(ctx: Context, intent: Intent): SorguSonucu {
        val ayar = EklentiDogrulama.yetkiliAyar(this, ctx, intent, OtomasyonProtokolu.KOSUL_SORGULA)
            as? EklentiAyari.Kosul ?: return SorguSonucu(OtomasyonProtokolu.SONUC_BILINMIYOR)
        val simdi = System.currentTimeMillis()
        // `%vakit` arayüz dilinde (görünen ad); `%vakitkodu` dilden bağımsız kimlik.
        val dil = ctx.arayuzDili()
        return when (ayar.kip) {
            KosulKipi.OLAY -> {
                val gecis = try { intent.getBundleExtra(OtomasyonProtokolu.TASKER_GECIS_VERISI) } catch (_: Exception) { null }
                val mesaj = gecis?.getInt(OtomasyonProtokolu.TASKER_MESAJ_KIMLIGI, 0) ?: 0
                val olay = if (mesaj != 0) OtomasyonDeposu.olayBul(ctx, mesaj) else null
                OtomasyonKurallari.olayiDegerlendir(ayar, olay, simdi, dil)
            }
            KosulKipi.DURUM -> {
                val a = WidgetVeriDeposu.anlik(ctx, simdi)
                OtomasyonKurallari.durumuDegerlendir(
                    ayar, a.durum, a.vakitler.isNotEmpty(), OtomasyonDeposu.sonCikiyor(ctx), OtomasyonDeposu.camide(ctx), simdi, dil,
                )
            }
        }
    }
}

/**
 * Camideyim modülünün PAKET-KAPSAMLI açık yayını (`setPackage`; dışa kapalı alıcı).
 * Modüller birbirini import etmez → sayaç modülü → `SayacKildimAlici` deseni.
 */
class OtomasyonCamiAlici : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != OtomasyonOlaylari.CAMI_DURUMU_EYLEMI) return
        OtomasyonOlaylari.camiDurumu(context, intent)
    }
}
