package com.furkanisikay.namazakisi.otomasyon

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.arayuzDili
import com.furkanisikay.namazakisi.dildeBaglam
import com.furkanisikay.namazakisi.cekirdek.EklentiAyari
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Karar
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.KaynakSinifi
import com.furkanisikay.namazakisi.cekirdek.KosulKipi
import com.furkanisikay.namazakisi.cekirdek.OtomasyonKurallari
import com.furkanisikay.namazakisi.cekirdek.OtomasyonKurallari.DuzenlemeEylemi
import com.furkanisikay.namazakisi.cekirdek.OtomasyonOlayi
import com.furkanisikay.namazakisi.cekirdek.OtomasyonProtokolu
import com.furkanisikay.namazakisi.cekirdek.VakitKodlari
import com.furkanisikay.namazakisi.kildim.KildimBaslatani
import com.furkanisikay.namazakisi.kildim.KildimGuvenDeposu
import com.furkanisikay.namazakisi.widget.WidgetGuncelleyici

/**
 * Locale/Tasker eklenti DÜZENLEME etkinlikleri (issue #278) — ortak akış.
 *
 * Host (Tasker, MacroDroid, Automate…) bu etkinliği `startActivityForResult` ile açar →
 * `callingPackage` sistemce doldurulur ve uydurulamaz. Akış:
 *  1. Çağıran güven listesine sorulur (`KildimGuvenKurallari`, issue #299): izinliyse
 *     doğrudan, ilk kez geliyorsa tek seferlik soru ([İzin ver] [Engelle] [Vazgeç]),
 *     engelliyse açıklama. Kimliği bilinmeyen çağırana ve tarayıcıya belirteç VERİLMEZ.
 *     "Yalnız bu sefer" seçeneği YOKTUR: kaydedilen eylem her tetiklendiğinde çalışır,
 *     yani verilen yetki zaten kalıcıdır.
 *  2. Seçim (yalnız koşul/olayda): olay türü + vakit.
 *  3. Sonuç: `EXTRA_BUNDLE` (o pakete ait gizli belirteçle) + `EXTRA_STRING_BLURB` +
 *     Tasker'ın ilgili değişken listesi.
 *
 * Arayüz uygulamayı açmaz: saydam etkinlik + sistem pencereleri (kısayol etkinliğiyle aynı
 * tema). Metinler kibar "siz" (arayüz yönetimi), kaynaklar UYGULAMANIN arayüz dilinde
 * (`attachBaseContext` → `dildeBaglam`; cihaz dili farklı olabilir).
 */
abstract class OtomasyonDuzenleActivity : Activity() {
    private var pencere: AlertDialog? = null
    private var bitti = false

    protected abstract val kosulMu: Boolean

    /** Çağıran onaylandıktan sonra: seçim (gerekirse) ve [kaydet]. */
    protected abstract fun secimeBasla(paket: String, onceki: EklentiAyari?)

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(newBase.dildeBaglam())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setResult(RESULT_CANCELED)
        val baslatan = KildimBaslatani.paketten(this, callingPackage)
        val paket = baslatan.paket
        val onceki = try {
            OtomasyonKurallari.paketOku(
                intent.getBundleExtra(OtomasyonProtokolu.EK_PAKET)?.let { b ->
                    b.keySet().associateWith { @Suppress("DEPRECATION") b.get(it) }
                }
            )?.takeIf { it.paket == paket }
        } catch (_: Exception) {
            null
        }
        val eylem = OtomasyonKurallari.duzenlemeEylemi(baslatan.sinif, KildimGuvenDeposu.karar(this, paket))
        when {
            paket == null || eylem == DuzenlemeEylemi.REDDET -> bilgi(
                getString(R.string.otomasyon_bilgi_baslik),
                getString(
                    if (baslatan.sinif == KaynakSinifi.TARAYICI) R.string.otomasyon_bilgi_tarayici
                    else R.string.otomasyon_bilgi_eklenti
                ),
            )
            eylem == DuzenlemeEylemi.ENGELLI -> bilgi(
                getString(R.string.otomasyon_engelli_baslik, baslatan.ad),
                getString(R.string.otomasyon_engelli_mesaj),
            )
            eylem == DuzenlemeEylemi.SOR -> izinSor(paket, baslatan.ad, onceki)
            else -> secimeBasla(paket, onceki)
        }
    }

    override fun onDestroy() {
        pencere?.setOnDismissListener(null)
        pencere?.dismiss()
        pencere = null
        super.onDestroy()
    }

    private fun izinSor(paket: String, ad: String, onceki: EklentiAyari?) {
        val mesaj = getString(if (kosulMu) R.string.otomasyon_izin_kosul else R.string.otomasyon_izin_kildim, ad)
        goster(
            AlertDialog.Builder(this, R.style.KildimOnayTemasi)
                .setTitle(getString(R.string.otomasyon_izin_baslik, ad))
                .setMessage(mesaj)
                .setPositiveButton(R.string.otomasyon_izin_ver) { _, _ ->
                    KildimGuvenDeposu.kaydet(this, paket, Karar.IZIN, ad)
                    secimeBasla(paket, onceki)
                }
                .setNegativeButton(R.string.otomasyon_engelle) { _, _ ->
                    KildimGuvenDeposu.kaydet(this, paket, Karar.ENGEL, ad)
                    kapat()
                }
                .setNeutralButton(R.string.otomasyon_vazgec) { _, _ -> kapat() },
        )
    }

    private fun bilgi(baslik: String, mesaj: String) {
        goster(
            AlertDialog.Builder(this, R.style.KildimOnayTemasi)
                .setTitle(baslik)
                .setMessage(mesaj)
                .setPositiveButton(R.string.otomasyon_tamam) { _, _ -> kapat() },
        )
    }

    /** Pencere geri tuşu/dışarı dokunuşla kapanırsa etkinlik de kapanır (sonuç: iptal). */
    protected fun goster(b: AlertDialog.Builder) {
        pencere?.setOnDismissListener(null)
        pencere?.dismiss()
        val p = b.create()
        p.setOnDismissListener { if (!isFinishing) kapat() }
        pencere = p
        p.show()
    }

    protected fun kaydet(ayar: EklentiAyari, olay: OtomasyonOlayi?) {
        if (bitti) return
        val paket = Bundle()
        OtomasyonKurallari.paketeYaz(ayar).forEach { (k, v) -> paket.putString(k, v) }
        val sonuc = Intent()
            .putExtra(OtomasyonProtokolu.EK_PAKET, paket)
            .putExtra(OtomasyonProtokolu.EK_OZET, OtomasyonKurallari.ozet(ayar, arayuzDili()))
        if (olay != null) {
            sonuc.putExtra(OtomasyonProtokolu.TASKER_ILGILI_DEGISKENLER, OtomasyonKurallari.ilgiliDegiskenler(olay, arayuzDili()))
        }
        setResult(RESULT_OK, sonuc)
        if (ayar is EklentiAyari.Kosul) {
            OtomasyonDeposu.kosulPaketiEkle(this, ayar.paket)
            // Widget yoksa da vakit sınırı alarmı artık kurulsun (bayrak: koşul paketi var).
            WidgetGuncelleyici.tumunuGuncelle(this)
        }
        kapat()
    }

    protected fun kapat() {
        if (bitti) return
        bitti = true
        pencere?.setOnDismissListener(null)
        finish()
    }
}

/** EDIT_SETTING — "Şu anki vakti kılındı olarak işaretle" (seçim yok). */
class OtomasyonEylemActivity : OtomasyonDuzenleActivity() {
    override val kosulMu = false

    override fun secimeBasla(paket: String, onceki: EklentiAyari?) {
        kaydet(EklentiAyari.Kildim(paket, OtomasyonDeposu.belirtecAl(this, paket)), null)
    }
}

/**
 * Koşul ve olay etkinliklerinin ortak seçimi: önce olay türü, sonra (vakitli türlerde)
 * vakit. Önceki ayar varsa seçili gelir.
 */
abstract class OtomasyonKosulSecimActivity : OtomasyonDuzenleActivity() {
    override val kosulMu = true
    protected abstract val kip: KosulKipi
    protected abstract val turEtiketleri: List<String>

    private val turler = listOf(OtomasyonOlayi.VAKIT_GIRDI, OtomasyonOlayi.VAKIT_CIKIYOR, OtomasyonOlayi.CAMIDE)

    override fun secimeBasla(paket: String, onceki: EklentiAyari?) {
        val o = onceki as? EklentiAyari.Kosul
        var secili = o?.let { turler.indexOf(it.olay) }?.takeIf { it >= 0 } ?: 0
        goster(
            AlertDialog.Builder(this, R.style.KildimOnayTemasi)
                .setTitle(R.string.otomasyon_tur_baslik)
                .setSingleChoiceItems(turEtiketleri.toTypedArray(), secili) { _, i -> secili = i }
                .setPositiveButton(R.string.otomasyon_ileri) { _, _ ->
                    val tur = turler[secili]
                    if (tur == OtomasyonOlayi.CAMIDE) bitir(paket, tur, null) else vakitSec(paket, tur, o?.vakit)
                }
                .setNegativeButton(R.string.otomasyon_vazgec) { _, _ -> kapat() },
        )
    }

    private fun vakitSec(paket: String, tur: OtomasyonOlayi, onceki: String?) {
        val kodlar = listOf<String?>(null) + VakitKodlari.KILINABILIR
        val dil = arayuzDili()
        val etiketler = kodlar.map { it?.let { k -> VakitKodlari.gorunenAd(k, dil) } ?: getString(R.string.otomasyon_herhangi_vakit) }
        var secili = kodlar.indexOf(onceki).takeIf { it >= 0 } ?: 0
        goster(
            AlertDialog.Builder(this, R.style.KildimOnayTemasi)
                .setTitle(R.string.otomasyon_vakit_baslik)
                .setSingleChoiceItems(etiketler.toTypedArray(), secili) { _, i -> secili = i }
                .setPositiveButton(R.string.otomasyon_kaydet) { _, _ -> bitir(paket, tur, kodlar[secili]) }
                .setNegativeButton(R.string.otomasyon_vazgec) { _, _ -> kapat() },
        )
    }

    private fun bitir(paket: String, tur: OtomasyonOlayi, vakit: String?) {
        kaydet(EklentiAyari.Kosul(paket, OtomasyonDeposu.belirtecAl(this, paket), kip, tur, vakit), tur)
    }
}

/** EDIT_CONDITION — Locale/MacroDroid/Automate koşulu, Tasker "Durum" (sürekli doğru/yanlış). */
class OtomasyonKosulActivity : OtomasyonKosulSecimActivity() {
    override val kip = KosulKipi.DURUM
    // Getter: kaynaklar ancak `attachBaseContext`'ten sonra (yapım anında değil) çözülebilir.
    override val turEtiketleri: List<String>
        get() = listOf(
            getString(R.string.otomasyon_kosul_icinde),
            getString(R.string.otomasyon_kosul_cikiyor, OtomasyonKurallari.CIKIYOR_ESIK_DK),
            getString(R.string.otomasyon_kosul_camide),
        )
}

/** Tasker ACTION_EDIT_EVENT — "Olay" (tek an). */
class OtomasyonOlayActivity : OtomasyonKosulSecimActivity() {
    override val kip = KosulKipi.OLAY
    override val turEtiketleri: List<String>
        get() = listOf(
            getString(R.string.otomasyon_olay_girdi),
            getString(R.string.otomasyon_olay_cikiyor, OtomasyonKurallari.CIKIYOR_ESIK_DK),
            getString(R.string.otomasyon_olay_camide),
        )
}
