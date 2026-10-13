package com.furkanisikay.namazakisi.kildim

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.cekirdek.KisayolKaynagi

/**
 * "Şu anki vakti kıldım" kısayolu (issue #276) — arayüzü olmayan geçiş etkinliği.
 * Uygulamayı AÇMADAN işaretler, kısa bir mesaj gösterip kapanır. Samsung Rutinler ve
 * otomasyon uygulamaları kısayolu "uygulama eylemi" olarak çağırır.
 *
 * DIŞA AÇIK olduğu için (`exported`) başlatan doğrulanır (`KisayolKaynagi`): ana
 * ekrandan gelen dokunuş doğrudan işaretlenir; otomasyon, Rutinler ya da bilinmeyen
 * bir uygulama başlattıysa küçük bir onay sorulur — başka bir uygulama kullanıcı
 * adına sessizce "kıldım" yazamaz.
 *
 * Etkinlik görünür olduğu an uygulama ön plandadır → headless görev arka plan
 * kısıtına takılmadan başlar. Intent-filter'ı YOKTUR: `namazakisi://kildim`
 * MainActivity'nin genel filtresine de uyduğu için ikinci bir filtre seçim
 * penceresi açardı; kısayol bu etkinliği açık bileşen adıyla çağırır.
 */
class KildimKisayolActivity : Activity() {
    private var onay: AlertDialog? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        when (val d = KildimIslemleri.simdikiVaktiDegerlendir(this)) {
            // İşaretlenecek bir şey yok: yalnız bilgi verilir, onay gerekmez.
            is KildimIslemleri.Degerlendirme.Kesin -> bitir(d.sonuc)
            is KildimIslemleri.Degerlendirme.Aday ->
                if (anaEkrandanMi()) bitir(KildimIslemleri.adayiKuyrugaAl(this, d, KildimKuyruguKurallari.KAYNAK_KISAYOL))
                else onayGoster(d)
        }
    }

    override fun onDestroy() {
        onay?.setOnDismissListener(null)
        onay?.dismiss()
        onay = null
        super.onDestroy()
    }

    /** Başlatan paket bir ana ekran uygulaması mı (uydurulabilen referrer eki yoksa)? */
    private fun anaEkrandanMi(): Boolean {
        val ekVar = try {
            intent.hasExtra(Intent.EXTRA_REFERRER) || intent.hasExtra(Intent.EXTRA_REFERRER_NAME)
        } catch (_: Exception) {
            true // Okunamayan ek (bozuk Parcel) → güvenme.
        }
        val paket = if (ekVar) null else KisayolKaynagi.paketAdiCoz(referrer?.toString())
        return KisayolKaynagi.onaysizMi(paket, ekVar, paket != null && anaEkranUygulamasiMi(paket), packageName)
    }

    /**
     * Başlatan uygulama paket görünürlüğünde zaten görünür (bizi başlattı) →
     * `<queries>` gerekmez. Okunamazsa ana ekran SAYILMAZ (onay sorulur).
     */
    private fun anaEkranUygulamasiMi(paket: String): Boolean = try {
        val sorgu = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME).setPackage(paket)
        val sonuc = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            packageManager.queryIntentActivities(sorgu, PackageManager.ResolveInfoFlags.of(0))
        } else {
            @Suppress("DEPRECATION")
            packageManager.queryIntentActivities(sorgu, 0)
        }
        sonuc.isNotEmpty()
    } catch (_: Exception) {
        false
    }

    private fun onayGoster(aday: KildimIslemleri.Degerlendirme.Aday) {
        var islendi = false
        onay = AlertDialog.Builder(this, R.style.KildimOnayTemasi)
            .setTitle(getString(R.string.kildim_onay_baslik, aday.vakitAdi))
            .setMessage(R.string.kildim_onay_mesaj)
            .setPositiveButton(R.string.kildim_onay_evet) { _, _ ->
                islendi = true
                bitir(KildimIslemleri.adayiKuyrugaAl(this, aday, KildimKuyruguKurallari.KAYNAK_KISAYOL))
            }
            .setNegativeButton(R.string.kildim_onay_vazgec) { _, _ -> islendi = true; finish() }
            .setOnDismissListener { if (!islendi && !isFinishing) finish() }
            .show()
    }

    private fun bitir(sonuc: KildimIslemleri.Sonuc) {
        Toast.makeText(applicationContext, KildimIslemleri.sonucMetni(sonuc), Toast.LENGTH_SHORT).show()
        finish()
    }
}
