package com.furkanisikay.namazakisi.otomasyon

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.CamideDurumu
import com.furkanisikay.namazakisi.cekirdek.OtomasyonKurallari
import com.furkanisikay.namazakisi.cekirdek.OtomasyonOlayKaydi
import com.furkanisikay.namazakisi.cekirdek.OtomasyonOlayi
import com.furkanisikay.namazakisi.cekirdek.OtomasyonProtokolu
import com.furkanisikay.namazakisi.cekirdek.VakitKodlari
import com.furkanisikay.namazakisi.cekirdek.kildimKimligi
import com.furkanisikay.namazakisi.widget.WidgetVeriDeposu

/**
 * Otomasyon olaylarının üretildiği üç an (issue #278) — HİÇBİRİ YENİ ALARM KURMAZ:
 *
 *  - VAKİT GİRDİ: widget'ın vakit sınırı alarmı (`WidgetGuncelleyici.sinirAlarminiKur`,
 *    günde ≤6). Widget yoksa alarm yalnız bir koşul paketi varken kurulur. Alarm
 *    `RTC`'dir (uyandırmaz): ekran kapalıyken olay cihaz uyanınca gelir; 30 dk'dan eski
 *    giriş olay sayılmaz (`OtomasyonKurallari.GIRDI_TAZELIK_MS`).
 *  - VAKİT ÇIKIYOR: muhafızın o vakit için çıkışa ≤45 dk kala İLK plan bildirimi
 *    gösterilirken (`KopruEtiketliBildirimServisi`). Muhafız kapalıysa ya da namaz zaten
 *    kılındıysa olay olmaz (bildirim de yoktur) — en düşük maliyetli yol, ayrı alarm yok.
 *  - CAMİDESİNİZ: Camideyim modülünün paket-kapsamlı yayını (`OtomasyonCamiAlici`).
 *
 * Her olayda koşul kullanan her pakete İKİ REQUEST_QUERY gider (yalnız `setPackage`):
 * durum koşulu etkinliği için (Locale/MacroDroid/Automate yeniden sorgulasın) ve olay
 * etkinliği için Tasker'ın geçiş verisiyle (mesaj kimliği). Koşul paketi yoksa hiçbir
 * şey yapılmaz.
 */
object OtomasyonOlaylari {
    private const val TAG = "OtomasyonOlaylari"

    /** Camideyim modülü (`CamiOtomasyonYayini`) ile AYNI olmalı — modüller birbirini import etmez. */
    const val CAMI_DURUMU_EYLEMI = "com.furkanisikay.namazakisi.CAMI_DURUMU"

    fun vakitSiniri(ctx: Context) {
        try {
            if (!OtomasyonDeposu.kosulKullaniliyor(ctx)) return
            val a = WidgetVeriDeposu.anlik(ctx)
            val aktif = OtomasyonKurallari.girdiOlayi(a.durum, a.simdiMs, OtomasyonDeposu.sonGirdi(ctx)) ?: return
            OtomasyonDeposu.sonGirdiYaz(ctx, kildimKimligi(aktif.tarih, aktif.kod))
            yay(ctx, OtomasyonDeposu.olayEkle(ctx, OtomasyonOlayi.VAKIT_GIRDI, aktif.kod, aktif.tarih))
        } catch (e: Exception) {
            Log.w(TAG, "Vakit girdi olayi yayilamadi", e)
        }
    }

    fun muhafizUyarisi(ctx: Context, kimlik: String) {
        try {
            if (!OtomasyonDeposu.kosulKullaniliyor(ctx)) return
            val o = OtomasyonKurallari.cikiyorOlayi(kimlik, OtomasyonDeposu.sonCikiyor(ctx)) ?: return
            OtomasyonDeposu.sonCikiyorYaz(ctx, kildimKimligi(o.tarih, o.vakit))
            yay(ctx, OtomasyonDeposu.olayEkle(ctx, OtomasyonOlayi.VAKIT_CIKIYOR, o.vakit, o.tarih, kalanDk = o.kalanDk))
        } catch (e: Exception) {
            Log.w(TAG, "Vakit cikiyor olayi yayilamadi", e)
        }
    }

    /** Durum KAYDEDİLİR (koşul paketi olmasa da): eklenti sonradan kurulursa doğru cevap versin. */
    fun camiDurumu(ctx: Context, intent: Intent) {
        try {
            val camide = intent.getBooleanExtra("camide", false)
            val bitis = intent.getLongExtra("bitisMs", 0L)
            if (!camide || bitis <= System.currentTimeMillis()) {
                OtomasyonDeposu.camideYaz(ctx, null)
                if (OtomasyonDeposu.kosulKullaniliyor(ctx)) yay(ctx, null)
                return
            }
            val ad = (intent.getStringExtra("ad") ?: "").take(120).ifBlank { "Cami" }
            val vakit = intent.getStringExtra("vakit")?.takeIf { VakitKodlari.widgetKodu(it) != null }
            val tarih = intent.getStringExtra("tarih")?.takeIf { TARIH.matches(it) }
            OtomasyonDeposu.camideYaz(ctx, CamideDurumu(ad, vakit, tarih, bitis))
            if (!OtomasyonDeposu.kosulKullaniliyor(ctx)) return
            yay(ctx, OtomasyonDeposu.olayEkle(ctx, OtomasyonOlayi.CAMIDE, vakit?.let { VakitKodlari.widgetKodu(it) }, tarih, camiAdi = ad))
        } catch (e: Exception) {
            Log.w(TAG, "Camide olayi yayilamadi", e)
        }
    }

    /** Yeni koşul kaydedildiğinde host'un hemen sorgulaması için (olaysız). */
    fun durumDegisti(ctx: Context) {
        try {
            yay(ctx, null)
        } catch (e: Exception) {
            Log.w(TAG, "Sorgu istenemedi", e)
        }
    }

    private val TARIH = Regex("""^\d{4}-\d{2}-\d{2}$""")

    private fun yay(ctx: Context, olay: OtomasyonOlayKaydi?) {
        for (paket in OtomasyonDeposu.kosulPaketleri(ctx)) {
            gonder(ctx, paket, OtomasyonKosulActivity::class.java.name, null)
            if (olay != null) {
                val gecis = Bundle().apply { putInt(OtomasyonProtokolu.TASKER_MESAJ_KIMLIGI, olay.mesajId) }
                gonder(ctx, paket, OtomasyonOlayActivity::class.java.name, gecis)
            }
        }
    }

    private fun gonder(ctx: Context, paket: String, etkinlik: String, gecis: Bundle?) {
        try {
            val i = Intent(OtomasyonProtokolu.SORGU_ISTE)
                .setPackage(paket)
                .putExtra(OtomasyonProtokolu.EK_ETKINLIK, etkinlik)
            if (gecis != null) i.putExtra(OtomasyonProtokolu.TASKER_GECIS_VERISI, gecis)
            ctx.sendBroadcast(i)
        } catch (e: Exception) {
            Log.i(TAG, "REQUEST_QUERY gonderilemedi: $paket", e)
        }
    }
}
