package com.furkanisikay.namazakisi.cekirdek

/**
 * Widget, hızlı ayarlar kutusu ve kısayolun ORTAK vakit kararı (issue #275/#276) — SAF.
 *
 * Bu dosya Android'e hiç dokunmaz (JVM testleri `android/app/src/test` içinde koşar).
 * Vakitler TELEFONDA, JS'te hesaplanır (`src/core/widget/widgetYuku.ts`, tek hesap
 * kaynağı `CalculationMethod.Turkey()`) ve widget verisi olarak yazılır; burada
 * yalnız "şu an hangi vakit, ne zaman çıkıyor, sıradaki ne" sorusu cevaplanır.
 *
 * SÖZLEŞME İKİZİ: JS `aktifVakitBul` ile aynı kurallar; iki taraf da
 * `android/app/src/test/resources/widget-ornek.json` örneklerini doğrular.
 */
object VakitKodlari {
    const val SABAH = "sabah"
    const val GUNES = "gunes"
    const val OGLE = "ogle"
    const val IKINDI = "ikindi"
    const val AKSAM = "aksam"
    const val YATSI = "yatsi"

    /** Kılınabilir beş vakit (güneş bir vakit girişi değil, sabahın sonudur). */
    val KILINABILIR = listOf(SABAH, OGLE, IKINDI, AKSAM, YATSI)

    /**
     * Widget kodu → kuyruğun/JS'in `VakitAdi`'sı. Widget verisi tarihsel olarak
     * `sabah` der, kayıt katmanı `imsak` bekler (`BildirimServisi.vakitAdiToNamazAdi`).
     */
    fun kuyrukVakti(kod: String): String? = when (kod) {
        SABAH -> "imsak"
        OGLE, IKINDI, AKSAM, YATSI -> kod
        else -> null
    }

    /** Kuyruk `VakitAdi`'sı → widget kodu (ters yön). */
    fun widgetKodu(vakitAdi: String): String? = when (vakitAdi) {
        "imsak" -> SABAH
        OGLE, IKINDI, AKSAM, YATSI -> vakitAdi
        else -> null
    }

    /**
     * Görünen ad. `toUpperCase` gibi dönüşümler YAPILMAZ (AGENTS.md: 'İkindi'.toUpperCase()
     * noktalı İ'yi bozar) — sabit harita. İngilizce karşılıklar JS sözlüğü `vakit.adlar` ile
     * AYNI (terim sözlüğü: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha).
     */
    fun gorunenAd(kod: String, dil: String = MetinDili.TR): String = when (kod) {
        SABAH -> MetinDili.sec(dil, "Sabah", "Fajr")
        GUNES -> MetinDili.sec(dil, "Güneş", "Sunrise")
        OGLE -> MetinDili.sec(dil, "Öğle", "Dhuhr")
        IKINDI -> MetinDili.sec(dil, "İkindi", "Asr")
        AKSAM -> MetinDili.sec(dil, "Akşam", "Maghrib")
        YATSI -> MetinDili.sec(dil, "Yatsı", "Isha")
        else -> kod
    }
}

/**
 * Bir vaktin GİRİŞ anı.
 * @param tarih Vaktin ait olduğu NAMAZ günü ('YYYY-MM-DD') — JS yazar. Yatsının
 *   gece yarısından sonraki kısmı hâlâ bir önceki güne aittir; gün sınırını
 *   burada saat diliminden türetmek bu yüzden YANLIŞ olurdu.
 */
data class VakitAni(val kod: String, val ms: Long, val tarih: String)

/**
 * @param aktif İçinde bulunulan KILINABİLİR vakit. `null`: güneş→öğle arası, veri
 *   yok ya da veri tükenmiş (vaktin bitişi bilinmiyor → "süre var" denmez).
 * @param bitisMs Aktif vaktin çıkışı (bir sonraki girişin anı).
 * @param sonraki Sıradaki kılınabilir vakit (güneş atlanır).
 */
data class VakitDurumu(
    val aktif: VakitAni?,
    val bitisMs: Long?,
    val sonraki: VakitAni?,
)

object VakitCizelgesi {

    /**
     * Widget sınır alarmı üst sınırı (kabul ölçütü). Gerçek değer gün başına 6'dır
     * (her vakit girişi bir sınır); gün değişimi için AYRI alarm kurulmaz çünkü
     * gösterilen namaz günü imsak sınırında değişir, gece yarısında değil.
     */
    const val GUNLUK_ALARM_UST_SINIRI = 12

    fun durumHesapla(vakitler: List<VakitAni>, simdiMs: Long): VakitDurumu {
        val sirali = vakitler.sortedBy { it.ms }
        val sonIndeks = sirali.indexOfLast { it.ms <= simdiMs }
        val sonrakiKilinabilir = sirali
            .drop(sonIndeks + 1)
            .firstOrNull { it.kod in VakitKodlari.KILINABILIR }
        if (sonIndeks < 0) return VakitDurumu(null, null, sonrakiKilinabilir)
        val son = sirali[sonIndeks]
        val sonrakiGiris = sirali.getOrNull(sonIndeks + 1)
        if (son.kod !in VakitKodlari.KILINABILIR || sonrakiGiris == null) {
            return VakitDurumu(null, null, sonrakiKilinabilir)
        }
        return VakitDurumu(son, sonrakiGiris.ms, sonrakiKilinabilir)
    }

    /** Bir sonraki vakit sınırı: widget'ın kuracağı TEK alarmın anı. */
    fun sonrakiSinirMs(vakitler: List<VakitAni>, simdiMs: Long): Long? =
        vakitler.asSequence().map { it.ms }.filter { it > simdiMs }.minOrNull()

    /**
     * Widget'ın `[baslangicMs, bitisMs)` aralığında kuracağı alarmların zinciri:
     * her alarm tetiklenince bir sonraki sınırı kurar (aynı PendingIntent → önceki
     * alarm EZİLİR, birikmez). Saat/saat dilimi değişimleri ve uygulamadan gelen
     * tazelemeler de aynı tek alarmı yeniden kurar; sayıyı artırmazlar.
     */
    fun alarmZinciri(vakitler: List<VakitAni>, baslangicMs: Long, bitisMs: Long): List<Long> {
        val sonuc = mutableListOf<Long>()
        var t = baslangicMs
        while (true) {
            val sinir = sonrakiSinirMs(vakitler, t) ?: break
            if (sinir >= bitisMs) break
            sonuc.add(sinir)
            t = sinir
        }
        return sonuc
    }

    /** Gösterilen namaz gününün beş vakti (geniş düzen listesi). */
    fun gunVakitleri(vakitler: List<VakitAni>, tarih: String): List<VakitAni> =
        vakitler
            .filter { it.tarih == tarih && it.kod in VakitKodlari.KILINABILIR }
            .sortedBy { it.ms }

    /** Gösterilecek namaz günü: aktif vaktin günü; yoksa sıradaki vaktin günü. */
    fun gosterilecekGun(durum: VakitDurumu): String? = durum.aktif?.tarih ?: durum.sonraki?.tarih
}

/** Kuyruk kimliği — `KildimKuyrugu` ile AYNI biçim ("<tarih>_<vakitAdi>"). */
fun kildimKimligi(tarih: String, vakitAdi: String): String = "${tarih}_$vakitAdi"

/**
 * Widget "Kıldım" `PendingIntent.getBroadcast` istek kodu (Fable kararı):
 * `"<tarih>_<vakit>".hashCode()`. Aynı vakit için her widget örneği aynı
 * PendingIntent'i paylaşır; vakit değişince kod da değişir ve eski dokunuş
 * yeni vakti işaretleyemez. JS ikizi: `kildimIstekKodu` (Java String.hashCode).
 */
fun kildimIstekKodu(tarih: String, vakitAdi: String): Int = kildimKimligi(tarih, vakitAdi).hashCode()
