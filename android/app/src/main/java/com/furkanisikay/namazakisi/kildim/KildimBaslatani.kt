package com.furkanisikay.namazakisi.kildim

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.KaynakSinifi
import com.furkanisikay.namazakisi.cekirdek.KisayolKaynagi

/**
 * Dışarıdan gelen "Kıldım" isteğini BAŞLATAN uygulama (issue #299).
 * [ad] kullanıcıya gösterilen uygulama adıdır (çözülemezse paket adı).
 */
data class KildimBaslatani(val paket: String?, val sinif: KaynakSinifi, val ad: String) {

    /** Güven listesine göre ne yapılacağı. */
    fun eylem(context: Context): KildimGuvenKurallari.Eylem =
        KildimGuvenKurallari.eylem(sinif, KildimGuvenDeposu.karar(context, paket))

    companion object {
        val BILINMIYOR = KildimBaslatani(null, KaynakSinifi.BILINMIYOR, "")

        /**
         * Etkinliği başlatan paketi çözer. `Activity.getReferrer()` yalnız o an işlenen
         * intent için geçerlidir: onCreate'te açılış intent'i, `onNewIntent` İÇİNDE yeni
         * intent (sistem dönüşte eskisine geri yazar) → çağıran bunu o anlarda yapmalı.
         *
         * `EXTRA_REFERRER`/`EXTRA_REFERRER_NAME` eki varsa `getReferrer()` onu döndürür —
         * eki ÇAĞIRAN yazar, uydurulabilir → başlatan BİLİNMİYOR sayılır.
         */
        fun coz(activity: Activity, intent: Intent?): KildimBaslatani {
            val ekVar = try {
                intent != null && (intent.hasExtra(Intent.EXTRA_REFERRER) || intent.hasExtra(Intent.EXTRA_REFERRER_NAME))
            } catch (_: Exception) {
                true // Okunamayan ek (bozuk Parcel) → güvenme.
            }
            val paket = if (ekVar) null else try {
                KisayolKaynagi.paketAdiCoz(activity.referrer?.toString())
            } catch (_: Exception) {
                null
            }
            val pm = activity.packageManager
            val sinif = KildimGuvenKurallari.siniflandir(
                paket = paket,
                referrerEkiVar = ekVar,
                kendiPaketi = activity.packageName,
                anaEkranMi = paket != null && cozuluyorMu(pm, Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME), paket),
                tarayiciMi = paket != null && cozuluyorMu(
                    pm,
                    Intent(Intent.ACTION_VIEW, Uri.parse("https://www.example.com/")).addCategory(Intent.CATEGORY_BROWSABLE),
                    paket,
                ),
            )
            return KildimBaslatani(paket, sinif, paket?.let { uygulamaAdi(pm, it) } ?: "")
        }

        /**
         * Başlatan uygulama paket görünürlüğünde zaten görünür (bizi başlattı) →
         * `<queries>` gerekmez. Okunamazsa `false` (ana ekran/tarayıcı SAYILMAZ).
         */
        private fun cozuluyorMu(pm: PackageManager, sorgu: Intent, paket: String): Boolean = try {
            sorgu.setPackage(paket)
            val sonuc = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.queryIntentActivities(sorgu, PackageManager.ResolveInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                pm.queryIntentActivities(sorgu, 0)
            }
            sonuc.isNotEmpty()
        } catch (_: Exception) {
            false
        }

        private fun uygulamaAdi(pm: PackageManager, paket: String): String = try {
            val bilgi = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.getApplicationInfo(paket, PackageManager.ApplicationInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                pm.getApplicationInfo(paket, 0)
            }
            pm.getApplicationLabel(bilgi).toString().ifBlank { paket }
        } catch (_: Exception) {
            paket
        }
    }
}

/**
 * `namazakisi://kildim` derin bağlantısının başlatanı (issue #299). Bağlantı MainActivity'ye
 * gelir ve JS'te işlenir (iOS ile ortak yol, tema uyumlu soru penceresi); ama JS başlatanı
 * GÖREMEZ. MainActivity bağlantıyı gördüğü an (`getReferrer()` yalnız o an geçerli)
 * başlatanı buraya yazar, JS `KildimGuvenModulu.derinBaglantiKarari` ile TEK KEZ alır.
 * Kayıt bellek-içidir ve kısa ömürlüdür: süreç ölürse JS de yeniden başlar ve bağlantı
 * zaten yeni bir onCreate ile yeniden yakalanır.
 */
object KildimDerinBaglantiKaydi {
    private class Kayit(val baslatan: KildimBaslatani, val zamanMs: Long)

    @Volatile
    private var son: Kayit? = null

    fun yakala(activity: Activity, intent: Intent?) {
        try {
            if (intent?.action != Intent.ACTION_VIEW) return
            if (!KildimGuvenKurallari.kildimBaglantisiMi(intent.dataString)) return
            son = Kayit(KildimBaslatani.coz(activity, intent), System.currentTimeMillis())
        } catch (_: Exception) {
            son = null // Kimlik çözülemezse JS "bilinmiyor" görür → yalnız tek seferlik soru.
        }
    }

    /** Kaydı TÜKETİR: aynı kimlik ikinci bir bağlantıya verilmez. */
    @Synchronized
    fun al(): KildimBaslatani {
        val k = son
        son = null
        if (k == null || !KildimGuvenKurallari.kayitTazeMi(k.zamanMs, System.currentTimeMillis())) {
            return KildimBaslatani.BILINMIYOR
        }
        return k.baslatan
    }
}
