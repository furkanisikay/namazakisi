package com.furkanisikay.namazakisi.cekirdek

import java.util.Calendar
import java.util.TimeZone

/**
 * Widget ve hızlı ayarlar kutusunun SAF görünüm kararları (issue #275/#276).
 * Android'e dokunmaz; `RemoteViews`/`Tile` çizimi bu kararları uygular.
 */

/** Boyuta göre düzen: 1×1 halka → 2×2 düğme + sıradaki → 4×2 günün beş vakti. */
enum class WidgetDuzeni { KUCUK, ORTA, GENIS }

object WidgetDuzenSecici {
    const val ORTA_MIN_GENISLIK_DP = 110f
    const val GENIS_MIN_GENISLIK_DP = 230f
    const val ORTA_MIN_YUKSEKLIK_DP = 100f

    /**
     * API < 31 yolu (`onAppWidgetOptionsChanged`): dikeyde gerçek genişlik
     * `OPTION_APPWIDGET_MIN_WIDTH`, gerçek yükseklik `MAX_HEIGHT`'tır.
     * API 31+ aynı eşikleri `RemoteViews(Map<SizeF, RemoteViews>)` anahtarı yapar —
     * iki yol ayrışmasın diye eşikler burada tek yerde.
     */
    fun sec(genislikDp: Float, yukseklikDp: Float): WidgetDuzeni = when {
        yukseklikDp < ORTA_MIN_YUKSEKLIK_DP -> WidgetDuzeni.KUCUK
        genislikDp >= GENIS_MIN_GENISLIK_DP -> WidgetDuzeni.GENIS
        genislikDp >= ORTA_MIN_GENISLIK_DP -> WidgetDuzeni.ORTA
        else -> WidgetDuzeni.KUCUK
    }
}

/**
 * [PALET] yalnız günün ayeti widget'ında seçilir (yapılandırma ekranı yalnız orada gösterir):
 * uygulama palet renginin açık tonu (`DuvarKagidiKurallari.acikTon`). Namaz widget'ları bu
 * değeri görürse açık palete düşer.
 */
enum class WidgetZemini(val kod: String) {
    MATERIAL("material"), ACIK("acik"), KOYU("koyu"), SEFFAF("seffaf"), PALET("palet");

    companion object {
        fun coz(kod: String?): WidgetZemini = values().firstOrNull { it.kod == kod } ?: MATERIAL
    }
}

/** Büyük satırda ne yazılsın: kalan süre (sayaç) mı, bitiş saati mi? İkincisi DAİMA küçük satırda. */
enum class SureGosterimi(val kod: String) {
    KALAN("kalan"), BITIS("bitis");

    companion object {
        fun coz(kod: String?): SureGosterimi = values().firstOrNull { it.kod == kod } ?: KALAN
    }
}

/**
 * Widget örneğinin özelleştirmesi (yapılandırma ekranı yazar).
 * @param opaklik Zeminin opaklığı, yüzde (20–100). Şeffaf zeminde yok sayılır.
 */
data class WidgetAyari(
    val zemin: WidgetZemini = WidgetZemini.MATERIAL,
    val opaklik: Int = VARSAYILAN_OPAKLIK,
    val gosterim: SureGosterimi = SureGosterimi.KALAN,
    val sonrakiGoster: Boolean = true,
) {
    /** Sabit biçim "zemin|opaklik|gosterim|sonraki" — SharedPreferences'ta saklanır. */
    fun kodla(): String = "${zemin.kod}|$opaklik|${gosterim.kod}|${if (sonrakiGoster) 1 else 0}"

    /** `ImageView.setImageAlpha` değeri (0–255). */
    fun zeminAlfasi(): Int = if (zemin == WidgetZemini.SEFFAF) 0 else (opaklik * 255 + 50) / 100

    companion object {
        const val VARSAYILAN_OPAKLIK = 100
        const val MIN_OPAKLIK = 20

        /** Bozuk/eksik kayıt varsayılana düşer — widget asla çizilemez hâle gelmez. */
        fun coz(ham: String?): WidgetAyari {
            if (ham.isNullOrBlank()) return WidgetAyari()
            val p = ham.split('|')
            val opaklik = p.getOrNull(1)?.toIntOrNull()?.coerceIn(MIN_OPAKLIK, 100) ?: VARSAYILAN_OPAKLIK
            return WidgetAyari(
                zemin = WidgetZemini.coz(p.getOrNull(0)),
                opaklik = opaklik,
                gosterim = SureGosterimi.coz(p.getOrNull(2)),
                sonrakiGoster = p.getOrNull(3) != "0",
            )
        }
    }
}

/** Aktif vaktin kıldım durumu — öncelik: kılındı > bekliyor > kılınabilir. */
enum class KildimDurumu { KILINABILIR, BEKLIYOR, KILINDI, YOK }

object KildimDurumKarari {
    /**
     * @param kilinanlar tarih → kılınan widget kodları (JS yazar).
     * @param bekleyenKimlikler kuyruktaki "<tarih>_<vakitAdi>" kimlikleri (iyimser durum).
     */
    fun hesapla(
        durum: VakitDurumu,
        kilinanlar: Map<String, Set<String>>,
        bekleyenKimlikler: Set<String>,
    ): KildimDurumu {
        val aktif = durum.aktif ?: return KildimDurumu.YOK
        if (durum.bitisMs == null) return KildimDurumu.YOK
        if (kilinanlar[aktif.tarih]?.contains(aktif.kod) == true) return KildimDurumu.KILINDI
        val vakitAdi = VakitKodlari.kuyrukVakti(aktif.kod) ?: return KildimDurumu.YOK
        if (kildimKimligi(aktif.tarih, vakitAdi) in bekleyenKimlikler) return KildimDurumu.BEKLIYOR
        return KildimDurumu.KILINABILIR
    }

    /**
     * Dokunuş anı doğrulaması: widget eski bir vakti gösteriyor olabilir (sınır
     * alarmı ekran kapalıyken bekler). Yalnız ŞU ANKİ aktif vakit işaretlenir;
     * aksi halde eski çizim yanlış vakti kaydettirirdi.
     */
    fun dokunusGecerliMi(durum: VakitDurumu, tarih: String, widgetKodu: String): Boolean {
        val aktif = durum.aktif ?: return false
        return durum.bitisMs != null && aktif.tarih == tarih && aktif.kod == widgetKodu
    }
}

/** "HH:mm" — saat dilimi enjekte edilir (testte deterministik). */
fun saatMetni(ms: Long, saatDilimi: TimeZone = TimeZone.getDefault()): String {
    val c = Calendar.getInstance(saatDilimi).apply { timeInMillis = ms }
    return "%02d:%02d".format(c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE))
}

enum class KutuDurumu { AKTIF, PASIF, KULLANILAMAZ }

/**
 * Hızlı ayarlar kutusunun görünümü.
 * Cümle içinde saate hal eki EKLENMEZ ("15:42'de" okunuşa göre değişir — AGENTS.md
 * zaman şeridi kuralı) → "Çıkış 15:42" / "Giriş 12:58" (İngilizce "Ends 15:42" / "Starts 12:58").
 */
data class KutuGorunumu(
    val etiket: String,
    val altEtiket: String,
    val durum: KutuDurumu,
    val tiklanabilir: Boolean,
    val aciklama: String,
)

object KutuGorunumKarari {
    fun hesapla(
        durum: VakitDurumu,
        kildim: KildimDurumu,
        saat: (Long) -> String,
        dil: String = MetinDili.TR,
    ): KutuGorunumu {
        val m = MetinDili.metinler(dil)
        val aktif = durum.aktif
        val bitis = durum.bitisMs
        if (aktif != null && bitis != null) {
            val ad = VakitKodlari.gorunenAd(aktif.kod, dil)
            return when (kildim) {
                KildimDurumu.KILINDI -> KutuGorunumu(
                    ad, m.kutuKilindi, KutuDurumu.AKTIF, false,
                    MetinDili.bicim(m.kutuKilindiErisim, "ad" to ad),
                )
                KildimDurumu.BEKLIYOR -> KutuGorunumu(
                    ad, m.kutuIsaretleniyor, KutuDurumu.AKTIF, false,
                    MetinDili.bicim(m.kutuIsaretleniyorErisim, "ad" to ad),
                )
                else -> KutuGorunumu(
                    ad, MetinDili.bicim(m.kutuCikis, "saat" to saat(bitis)), KutuDurumu.PASIF, true,
                    MetinDili.bicim(m.kutuKilinmadiErisim, "ad" to ad),
                )
            }
        }
        val sonraki = durum.sonraki
            ?: return KutuGorunumu(
                m.namazVakti,
                m.uygulamayiAcin,
                KutuDurumu.KULLANILAMAZ, false,
                m.vakitBilgisiYok,
            )
        val ad = VakitKodlari.gorunenAd(sonraki.kod, dil)
        return KutuGorunumu(
            ad, MetinDili.bicim(m.kutuGiris, "saat" to saat(sonraki.ms)), KutuDurumu.KULLANILAMAZ, false,
            MetinDili.bicim(m.kutuVakitYokErisim, "ad" to ad, "saat" to saat(sonraki.ms)),
        )
    }
}
