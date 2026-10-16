package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject

/**
 * Muhafızın GERÇEK ALARMI (issue #74) — SAF kurallar (JVM testi: MuhafizAlarmKurallariTest).
 *
 * Plan JS'tedir: hangi adımın hangi anda alarm çalacağı `motorAdaptoru.alarmAniMi`
 * (adımın İLK tetiği) ile seçilir ve `AndroidMuhafizTeslimcisi` yükü üretir
 * (`core/muhafiz/alarmYuku.ts`). Burada yalnız native'in çalma ANINDA verdiği kararlar
 * ve yük sözleşmesi durur. Yük sözleşmesi İKİ TARAFTA kilitlidir: JS ve Kotlin aynı
 * örneği kabul eder (`src/test/resources/muhafiz-alarm-ornekleri.json`).
 */
object MuhafizAlarmKurallari {
    /** Alarm en fazla bu kadar çalar, sonra NORMAL bildirime düşer. JS `ALARM_CALMA_SURESI_DK`. */
    const val CALMA_SURESI_MS = 2 * 60_000L

    /**
     * Alarm bundan daha geç tetiklendiyse (cihaz kapalıydı, saat ileri alındı) ÇALMAZ,
     * normal bildirim olarak görünür: 25 dk gecikmiş tam ekran alarm yanlış bilgi verir.
     */
    const val GEC_KALMA_TOLERANSI_MS = 10 * 60_000L

    /**
     * Alarm bildiriminin numarası; ETİKET = muhafız kimliği. Çalan/düşmüş alarm bildirimi
     * `(etiket, numara)` çiftiyle bulunur ("Kıldım" iptali — H1).
     */
    const val BILDIRIM_NUMARASI = 74_074

    /** Yük biçim sürümü — JS `ALARM_YUK_SURUMU`. */
    const val YUK_SURUMU = 1

    /**
     * Alarm kanalı öneki. `muhafiz_` İLE BAŞLAMAZ (bilinçli): muhafız kanal çöp toplayıcısı
     * (`MuhafizKanallari.copleriTopla`) `muhafiz_*` olup listede olmayan her kanalı siler →
     * alarm kanalı o uzayda olsaydı her planlama turunda silinirdi. JS `ALARM_KANAL_TABANI`.
     */
    const val KANAL_TABANI = "namaz_alarm"

    enum class Karar {
        /** Tam ekran / heads-up alarm, `USAGE_ALARM` sesiyle döngüde. */
        CAL,
        /** Geç kalınmış alarm: normal (sesli) muhafız bildirimi. */
        BILDIRIM,
        /** Camideyken (#297): ses çıkarmayan bildirim — namazdaki kişiyi alarm bölmez. */
        SESSIZ_BILDIRIM,
        /** Vakit çıkmış: hiçbir şey gösterilmez. */
        ATLA,
    }

    /**
     * Alarm tetiklendiği AN ne yapılacak?
     *
     * @param kuyruktaKilindi o vakit ortak "Kıldım" kuyruğunda bekliyor mu (saat, widget,
     *   kutu, kısayol, otomasyon — JS henüz uyanıp kaydı işlememiş olabilir; Samsung uyku
     *   kısıtında dakikalar sürer). Bekliyorsa alarm ÇALMAZ: kişi namazı kıldığını zaten
     *   söylemiştir ([kuyruktaKilindiMi]).
     */
    fun tetikKarari(
        tetikMs: Long,
        simdiMs: Long,
        cikisMs: Long,
        camiSessizBitisMs: Long,
        kuyruktaKilindi: Boolean = false,
    ): Karar = when {
        cikisMs in 1..simdiMs -> Karar.ATLA
        kuyruktaKilindi -> Karar.ATLA
        camiSessizBitisMs > simdiMs -> Karar.SESSIZ_BILDIRIM
        simdiMs - tetikMs > GEC_KALMA_TOLERANSI_MS -> Karar.BILDIRIM
        else -> Karar.CAL
    }

    /**
     * Vakit "Kıldım" kuyruğunda bekliyor mu? Kuyruk kimliği `<tarih>_<vakit>`
     * ([kildimKimligi]) ve kuyruk KAYIT kodunu taşır (`imsak`, widget'ın `sabah`'ı DEĞİL —
     * kuyruk `sabah`'ı reddeder); muhafız kimliği de aynı kodu ve aynı NAMAZ gününü taşır
     * (gece yarısını aşan yatsı = dün) → doğrudan eşleşir.
     */
    fun kuyruktaKilindiMi(tarih: String, vakit: String, bekleyenler: Set<String>): Boolean =
        tarih.isNotEmpty() && vakit.isNotEmpty() && kildimKimligi(tarih, vakit) in bekleyenler

    /**
     * Gösterilen bildirim bu eşleşmenin ALARM bildirimi mi? (H1 — uygulama içi / saatten
     * "Kıldım" çalan alarmı da susturmalı: tetiklenen alarm kayıt defterinden düştüğü için
     * yalnız bekleyenleri silen iptal onu GÖRMEZ.) Numara şart: aynı etiketli expo
     * bildirimleri (numara 0) expo'nun kendi kapatma yolundan geçer.
     */
    fun alarmBildirimiMi(etiket: String?, numara: Int, esles: (String) -> Boolean): Boolean =
        numara == BILDIRIM_NUMARASI && !etiket.isNullOrEmpty() && esles(etiket)

    /** Önek eşleştiricisi — boş önek HİÇBİR şeyle eşleşmez ("hepsini sil" kazası olmasın). */
    fun onekEslestirici(onek: String): (String) -> Boolean =
        { kimlik -> onek.isNotEmpty() && kimlik.startsWith(onek) }

    /** Tam ekran alarmdaki "Kıldım" nasıl işlenir? (M4 — #295 kilit ekranı kararının ikizi.) */
    enum class KildimYolu {
        /** Kilit yok: hemen işaretle. */
        DOGRUDAN,
        /** Kilitli: önce kilit açtırılır (API 26+ `requestDismissKeyguard`), başarıda işaretlenir. */
        KILIDI_AC,
        /** Kilitli ve kilit açtırılamıyor (API < 26): düğme GİZLENİR — kayıt kilit ekranından yazılmaz. */
        GIZLE,
    }

    /**
     * Kilit ekranına bakan herkes, cepte yanlış bir dokunuş ibadet kaydı yazmamalı
     * (`KilitEkraniKarari`). "Kapat" ve "Ertele" kayıt değildir → kilitliyken de çalışır.
     */
    fun kildimYolu(kilitli: Boolean, kilitAcmaDestegi: Boolean): KildimYolu = when {
        !kilitli -> KildimYolu.DOGRUDAN
        kilitAcmaDestegi -> KildimYolu.KILIDI_AC
        else -> KildimYolu.GIZLE
    }

    /** "10 dk ertele" düğmesi gösterilsin mi? Bildirim ertelemesiyle AYNI kural. */
    fun ertelemeDugmesiVarMi(simdiMs: Long, sinirMs: Long): Boolean =
        sinirMs > 0L && ErtelemeKurallari.secenekler(simdiMs, sinirMs).isNotEmpty()

    /** Çalma süresi doldu mu? (Tam ekran etkinliği kendini kapatır.) */
    fun calmaBittiMi(baslangicMs: Long, simdiMs: Long): Boolean = simdiMs - baslangicMs >= CALMA_SURESI_MS

    /** Yeniden başlatma/güncellemede kurulacak kimlikler — geçmişler atılır, sıra tetiğe göre. */
    fun yenidenKurulacaklar(kayitlar: Map<String, Long>, simdiMs: Long): List<String> =
        kayitlar.filter { it.value > simdiMs }.entries.sortedBy { it.value }.map { it.key }

    fun alarmKanaliMi(id: String): Boolean = id == KANAL_TABANI || id.startsWith("${KANAL_TABANI}_")

    data class Yuk(
        val kimlik: String,
        /**
         * NAFİLE alarmı mı? (`nafile_<gün>_<tür>_<k>` kimliği — issue #74 nafilede de
         * standart yetenek.) `null` = muhafız. "Kıldım" bu alana göre YOL SEÇER: nafile
         * FARZ kuyruğuna ASLA yazmaz, ertelenmez, otomasyon "vakit çıkıyor" olayı doğurmaz.
         */
        val nafileTuru: String? = null,
        val tetikMs: Long,
        val baslik: String,
        val metin: String,
        val vakit: String,
        val vakitAdi: String,
        val tarih: String,
        val cikisMs: Long,
        val erteleSinirMs: Long,
        val seviye: Int,
        val alarmKanalId: String,
        val alarmKanalAdi: String,
        /** Kullanıcının seçtiği `content://` ses; yoksa sistemin varsayılan ALARM sesi. */
        val sesUri: String?,
        /** Normal muhafız kanalı — ertelenen kopya ve "normal bildirime düşüş" buradan. */
        val kanalId: String,
        /** Muhafız bildiriminin `data` nesnesi (ertelenen kopyanın gövdesi). */
        val veri: JSONObject,
    )

    /** JS yükünü çözer; sözleşme dışı (eski/bozuk) yükte `null` → alarm ÇALMAZ. */
    fun yukCoz(ham: String?): Yuk? {
        if (ham.isNullOrBlank()) return null
        return try {
            val o = JSONObject(ham)
            if (o.optInt("surum", 0) != YUK_SURUMU) return null
            val kimlik = o.optString("kimlik", "")
            // Kimlik YOLU belirler: muhafız vakti ya da nafile; ikisi de değilse çalmaz
            // (Kıldım/iptal öneki bulamazdı).
            val vakit = BildirimKildimKurallari.vakitCoz(kimlik)
            val nafile = if (vakit == null) NafileKildimKurallari.nafileCoz(kimlik) ?: return null else null
            val alarmKanalId = o.optString("alarmKanalId", "")
            if (!alarmKanaliMi(alarmKanalId)) return null
            val tetikMs = o.optLong("tetikMs", 0L)
            if (tetikMs <= 0L) return null
            val sesUri = if (o.isNull("sesUri")) null else o.optString("sesUri", "").ifBlank { null }
            Yuk(
                kimlik = kimlik,
                nafileTuru = nafile?.tur,
                tetikMs = tetikMs,
                baslik = o.optString("baslik", ""),
                metin = o.optString("metin", ""),
                // Nafilede vakit (farz kayıt kodu) YOKTUR: boş — farz kuyruğu boşu reddeder.
                vakit = vakit?.vakit ?: "",
                vakitAdi = o.optString("vakitAdi", ""),
                tarih = vakit?.tarih ?: nafile!!.tarih,
                cikisMs = o.optLong("cikisMs", 0L),
                // Nafile ertelenmez (fıkhi sınır muhafızın vaktine kuruludur).
                erteleSinirMs = if (nafile != null) 0L else o.optLong("erteleSinirMs", 0L),
                seviye = o.optInt("seviye", 1),
                alarmKanalId = alarmKanalId,
                alarmKanalAdi = o.optString("alarmKanalAdi", "").ifBlank { "Namaz alarmı" },
                sesUri = sesUri?.takeIf { it.startsWith("content://") },
                kanalId = o.optString("kanalId", "").ifBlank { "muhafiz" },
                veri = o.optJSONObject("veri") ?: JSONObject(),
            )
        } catch (_: Exception) {
            null
        }
    }
}
