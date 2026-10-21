package com.furkanisikay.namazakisi.tv.cekirdek

import java.time.DayOfWeek

/**
 * Evin ortak ekranının, eşleşik üyelerden gelen durumla ne GÖSTERECEĞİ — SAF. Tasarım §4.6.
 *
 * TV ikinci motor DEĞİLDİR: hatırlatma kurmaz, ses çıkarmaz, kumandadan "Kıldım" almaz. Yalnız
 * sessiz bir bant, Ramazan sayacı ve cuma kartı gösterir.
 */
data class UyeHali(
    val uye: String,
    val durum: DurumGoruntusu?,
    /** Bu üyeden en son GEÇERLİ şifreli mesajın geldiği an (0 = hiç). */
    val sonHaberMs: Long,
    /** Kimlikli olaylardan gelen kılınanlar (gün → vakit); anlık görüntüyle BİRLEŞİM alınır. */
    val olayKilinan: Map<String, Set<String>> = emptyMap(),
)

object EvDurumu {
    /** Bant yalnız vaktin son 30 dakikasında. */
    const val BANT_ESIGI_MS = 30L * 60_000
    /** Üyeden son 12 saatte haber yoksa onun durumu sayılmaz (bayat veriyle "kılmadı" denmez). */
    const val TAZELIK_MS = 12L * 60 * 60_000

    /**
     * Sessiz bant metni ya da `null`. Beş şart (§4.6), en az BİR üye için birlikte:
     * 1. üye "TV'de durumum sayılsın"ı açmış, 2. TV hatırlatmasını açmış, 3. son 12 saatte haber,
     * 4. özel günde değil, 5. içinde bulunulan farzı kılmamış — ve vaktin son 30 dakikası.
     * Metin kişi ya da sayı İMA ETMEZ ("kimin kılmadığı" açık edilmez): yalnız kalan süre.
     */
    fun bant(pano: PanoDurumu, uyeler: List<UyeHali>, simdiMs: Long): String? {
        if (pano.aktif == Vakit.GUNES) return null
        if (pano.kalanMs <= 0 || pano.kalanMs > BANT_ESIGI_MS) return null
        val gun = pano.tarih.toString()
        val vakit = pano.aktif.kod
        val biriBekliyor = uyeler.any { u ->
            val d = u.durum ?: return@any false
            d.durumumSayilsin && d.tvHatirlat && !d.ozelGun &&
                u.sonHaberMs > 0 && simdiMs - u.sonHaberMs in 0..TAZELIK_MS &&
                vakit !in (d.kilinan[gun].orEmpty() + u.olayKilinan[gun].orEmpty())
        }
        if (!biriBekliyor) return null
        val dk = ((pano.kalanMs + 59_999) / 60_000).coerceAtLeast(1)
        return "${pano.gorunenAd(pano.aktif)} vakti daralıyor · $dk dk"
    }

    /** Herhangi bir üye Ramazan dediyse (son 12 saatte) TV iftar/sahur sayacını gösterir. */
    fun ramazan(uyeler: List<UyeHali>, simdiMs: Long): Boolean =
        uyeler.any { it.durum?.ramazan == true && simdiMs - it.sonHaberMs in 0..TAZELIK_MS }

    data class Sayac(val baslik: String, val hedefMs: Long)

    /**
     * Ramazan sayacı (takvim gününe göre): imsaktan önce "Sahura kalan" (bugünün imsakı),
     * imsak–akşam "İftara kalan" (bugünün akşamı), akşamdan sonra "Sahura kalan" (yarının imsakı).
     */
    fun ramazanSayaci(bugun: GunlukVakitler, yarinImsakMs: Long, simdiMs: Long): Sayac = when {
        simdiMs < bugun.imsak -> Sayac("Sahura kalan", bugun.imsak)
        simdiMs < bugun.aksam -> Sayac("İftara kalan", bugun.aksam)
        else -> Sayac("Sahura kalan", yarinImsakMs)
    }

    /**
     * Cuma kartı: cuma günü, öğle girmeden ve en az bir üye cuma hatırlatmasını açmış, çıkış
     * süresini biliyorsa. En ERKEN çıkış (en büyük süre) gösterilir.
     */
    fun cumaCikisMs(pano: PanoDurumu, uyeler: List<UyeHali>, simdiMs: Long): Long? {
        if (pano.tarih.dayOfWeek != DayOfWeek.FRIDAY) return null
        val ogle = pano.vakitler.ogle
        if (simdiMs >= ogle) return null
        val dk = uyeler.mapNotNull { u ->
            u.durum?.takeIf { it.cumaAktif && simdiMs - u.sonHaberMs in 0..TAZELIK_MS }?.cumaCikisDk
        }.maxOrNull() ?: return null
        return ogle - dk * 60_000L
    }
}
