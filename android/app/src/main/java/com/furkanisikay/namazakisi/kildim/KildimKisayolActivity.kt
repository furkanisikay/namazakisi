package com.furkanisikay.namazakisi.kildim

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.os.Bundle
import android.widget.Toast
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.dildeBaglam
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Eylem
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Karar
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.KaynakSinifi
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari

/**
 * "Şu anki vakti kıldım" kısayolu (issue #276) — arayüzü olmayan geçiş etkinliği.
 * Uygulamayı AÇMADAN işaretler, kısa bir mesaj gösterip kapanır. Samsung Rutinler ve
 * otomasyon uygulamaları kısayolu "uygulama eylemi" olarak çağırır.
 *
 * DIŞA AÇIK olduğu için (`exported`) başlatan çözülür ([KildimBaslatani]) ve GÜVEN
 * LİSTESİNE bakılır (issue #299, `KildimGuvenKurallari`): ana ekran ve izinli uygulama
 * doğrudan işaretler, engelli uygulama yok sayılır; ilk kez gelen uygulamaya tek
 * seferlik soru sorulur — [Her zaman izin ver] [Yalnız bu sefer] [Engelle]. Böylece bir
 * kez onaylanan otomasyon bir daha manuele düşmez, başka bir uygulama da kullanıcı
 * adına sessizce "kıldım" yazamaz.
 *
 * Etkinlik görünür olduğu an uygulama ön plandadır → headless görev arka plan
 * kısıtına takılmadan başlar. Intent-filter'ı YOKTUR: `namazakisi://kildim`
 * MainActivity'nin genel filtresine de uyduğu için ikinci bir filtre seçim
 * penceresi açardı; kısayol bu etkinliği açık bileşen adıyla çağırır.
 */
class KildimKisayolActivity : Activity() {
    private var onay: AlertDialog? = null

    /** Soru ve mesajlar UYGULAMANIN arayüz dilinde (cihaz dili farklı olabilir). */
    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(newBase.dildeBaglam())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val baslatan = KildimBaslatani.coz(this, intent)
        val eylem = baslatan.eylem(this)
        if (eylem is Eylem.YokSay) {
            // Engellenmiş uygulama: hiçbir şey yazılmaz, otomasyon her seferinde mesajla
            // rahatsız etmesin diye sessizce kapanılır.
            finish()
            return
        }
        when (val d = KildimIslemleri.simdikiVaktiDegerlendir(this)) {
            // İşaretlenecek bir şey yok: yalnız bilgi verilir, soru gerekmez.
            is KildimIslemleri.Degerlendirme.Kesin -> bitir(d.sonuc)
            is KildimIslemleri.Degerlendirme.Aday -> when (eylem) {
                is Eylem.Sor -> soruGoster(d, baslatan, eylem)
                else -> isaretle(d)
            }
        }
    }

    override fun onDestroy() {
        onay?.setOnDismissListener(null)
        onay?.dismiss()
        onay = null
        super.onDestroy()
    }

    private fun isaretle(aday: KildimIslemleri.Degerlendirme.Aday) =
        bitir(KildimIslemleri.adayiKuyrugaAl(this, aday, KildimKuyruguKurallari.KAYNAK_KISAYOL))

    private fun soruGoster(aday: KildimIslemleri.Degerlendirme.Aday, baslatan: KildimBaslatani, sor: Eylem.Sor) {
        var islendi = false
        val paket = baslatan.paket
        val insa = AlertDialog.Builder(this, R.style.KildimOnayTemasi)
            .setOnDismissListener { if (!islendi && !isFinishing) finish() }
        if (paket == null) {
            // Kimliği olmayan başlatan: karar saklanamaz → yalnız bu seferlik onay.
            insa.setTitle(getString(R.string.kildim_onay_baslik, aday.vakitAdi))
                .setMessage(R.string.kildim_onay_mesaj)
                .setPositiveButton(R.string.kildim_onay_evet) { _, _ -> islendi = true; isaretle(aday) }
                .setNegativeButton(R.string.kildim_onay_vazgec) { _, _ -> islendi = true; finish() }
        } else {
            val tarayici = baslatan.sinif == KaynakSinifi.TARAYICI
            insa.setTitle(getString(R.string.kildim_guven_baslik, baslatan.ad))
                .setMessage(
                    getString(if (tarayici) R.string.kildim_guven_tarayici_mesaj else R.string.kildim_guven_mesaj, aday.vakitAdi)
                )
            if (sor.herZamanSunulur) {
                insa.setPositiveButton(R.string.kildim_guven_her_zaman) { _, _ ->
                    islendi = true
                    KildimGuvenDeposu.kaydet(this, paket, Karar.IZIN, baslatan.ad)
                    isaretle(aday)
                }
                insa.setNeutralButton(R.string.kildim_guven_bu_sefer) { _, _ -> islendi = true; isaretle(aday) }
            } else {
                insa.setPositiveButton(R.string.kildim_guven_bu_sefer) { _, _ -> islendi = true; isaretle(aday) }
            }
            if (sor.engelSunulur) {
                insa.setNegativeButton(R.string.kildim_guven_engelle) { _, _ ->
                    islendi = true
                    KildimGuvenDeposu.kaydet(this, paket, Karar.ENGEL, baslatan.ad)
                    Toast.makeText(applicationContext, getString(R.string.kildim_guven_engellendi, baslatan.ad), Toast.LENGTH_SHORT).show()
                    finish()
                }
            }
        }
        // Geri tuşu / dışarı dokunma = Vazgeç: karar SAKLANMAZ, bir dahaki istekte yine sorulur.
        onay = insa.show()
    }

    private fun bitir(sonuc: KildimIslemleri.Sonuc) {
        Toast.makeText(applicationContext, KildimIslemleri.sonucMetni(this, sonuc), Toast.LENGTH_SHORT).show()
        finish()
    }
}
