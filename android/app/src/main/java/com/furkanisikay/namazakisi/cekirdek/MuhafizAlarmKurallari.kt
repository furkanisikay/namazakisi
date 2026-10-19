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
     * (`KilitEkraniKarari`). "Kapat" kayıt değildir → kilitliyken de çalışır.
     */
    fun kildimYolu(kilitli: Boolean, kilitAcmaDestegi: Boolean): KildimYolu = when {
        !kilitli -> KildimYolu.DOGRUDAN
        kilitAcmaDestegi -> KildimYolu.KILIDI_AC
        else -> KildimYolu.GIZLE
    }

    /** Çalma süresi doldu mu? (Tam ekran etkinliği kendini kapatır.) */
    fun calmaBittiMi(baslangicMs: Long, simdiMs: Long): Boolean = simdiMs - baslangicMs >= CALMA_SURESI_MS

    /** Yeniden başlatma/güncellemede kurulacak kimlikler — geçmişler atılır, sıra tetiğe göre. */
    fun yenidenKurulacaklar(kayitlar: Map<String, Long>, simdiMs: Long): List<String> =
        kayitlar.filter { it.value > simdiMs }.entries.sortedBy { it.value }.map { it.key }

    fun alarmKanaliMi(id: String): Boolean = id == KANAL_TABANI || id.startsWith("${KANAL_TABANI}_")

    /** Yükün türü — JS `AlarmTuru`. Alan yoksa kimlikten çözülür (geriye uyum). */
    const val TUR_VAKIT = "vakit"
    const val TUR_NAFILE = "nafile"
    const val TUR_BILGI = "bilgi"

    /**
     * Alarmda "Kıldım" düğmesi olur mu? BİLGİ alarmı (cuma, camiye gitme, takvim) hatırlatmadır:
     * cuma/camiye gitme vakit GİRMEDEN çalar, takvim uyarısı da düğmeyle FARZ yazmaz
     * (kılınmışlığa bağlıdır ama yalnız susar — [kuyrukDenetlenirMi]).
     */
    fun kildimDugmesiVarMi(yuk: Yuk): Boolean = !yuk.bilgi

    /**
     * Tetik anında "vakit Kıldım kuyruğunda bekliyor mu?" denetlenir mi? Muhafız (farz)
     * alarmı daima; bilgi alarmı YALNIZ kılınmışlığa bağlıysa (takvim çakışması — vaktin
     * İÇİNDE çalar). Cuma / camiye gitme vakit girmeden çalar: denetim anlamsızdır.
     * Nafile kendi kuyruğundan denetlenir (alıcıda ayrı dal).
     */
    fun kuyrukDenetlenirMi(yuk: Yuk): Boolean = !yuk.bilgi || yuk.kilinmisligaBagli

    /** Otomasyon "vakit çıkıyor" olayı (#278) doğar mı? Yalnız FARZ vakit alarmında. */
    fun otomasyonOlayiDogarMi(yuk: Yuk): Boolean = yuk.nafileTuru == null && !yuk.bilgi

    data class Yuk(
        val kimlik: String,
        /**
         * NAFİLE alarmı mı? (`nafile_<gün>_<tür>_<k>` kimliği — issue #74 nafilede de
         * standart yetenek.) `null` = muhafız. "Kıldım" bu alana göre YOL SEÇER: nafile
         * FARZ kuyruğuna ASLA yazmaz, otomasyon "vakit çıkıyor" olayı doğurmaz.
         */
        val nafileTuru: String? = null,
        /**
         * BİLGİ alarmı mı? (`tur: "bilgi"` — cuma, camiye gitme, takvim çakışması; ortak
         * hatırlatma yüzeyleri plan §4.2.) Yalnız "Kapat": Kıldım YOK, otomasyon
         * olayı doğmaz. `cikisMs` pencerenin SONUDUR (öğle girişi / vakit girişi / etkinlik
         * başı) → geç tetik / "vakit çıktı" kuralı [tetikKarari] değişmeden uygulanır.
         */
        val bilgi: Boolean = false,
        /**
         * Bilgi alarmı vaktin KILINMIŞLIĞINA bağlı mı? (JS `kilinmisligaBagli: true` —
         * takvim çakışması.) Bağlıysa `vakit` + `tarih` yükten okunur: vakit ortak "Kıldım"
         * kuyruğunda bekliyorsa alarm ÇALMAZ ([kuyrukDenetlenirMi]). Alan yoksa `false`.
         */
        val kilinmisligaBagli: Boolean = false,
        val tetikMs: Long,
        val baslik: String,
        val metin: String,
        val vakit: String,
        val vakitAdi: String,
        val tarih: String,
        val cikisMs: Long,
        val seviye: Int,
        val alarmKanalId: String,
        val alarmKanalAdi: String,
        /** Kullanıcının seçtiği `content://` ses; yoksa sistemin varsayılan ALARM sesi. */
        val sesUri: String?,
        /** Normal muhafız kanalı — "normal bildirime düşüş" buradan. */
        val kanalId: String,
        /** Muhafız bildiriminin `data` nesnesi (normal bildirime düşüşün gövdesi). */
        val veri: JSONObject,
    )

    /** JS yükünü çözer; sözleşme dışı (eski/bozuk) yükte `null` → alarm ÇALMAZ. */
    fun yukCoz(ham: String?): Yuk? {
        if (ham.isNullOrBlank()) return null
        return try {
            val o = JSONObject(ham)
            if (o.optInt("surum", 0) != YUK_SURUMU) return null
            val kimlik = o.optString("kimlik", "")
            if (kimlik.isEmpty()) return null
            // TÜR YOLU belirler. Alan YOKSA (güncelleme öncesi kurulmuş alarm) kimlikten:
            // muhafız vakti → vakit, nafile → nafile; ikisi de değilse ÇALMAZ (Kıldım/iptal
            // öneki bulamazdı). Bilgi alarmı daima `tur: "bilgi"` taşır (JS yazar).
            // `YUK_SURUMU` bu yüzden ARTMADI: artsaydı güncelleme öncesi kurulmuş alarmlar
            // (bugünün yatsısı dahil) tetik anında ve yeniden kurucuda sessizce ölürdü.
            val tur = if (o.isNull("tur")) "" else o.optString("tur", "")
            val vakit = if (tur == "" || tur == TUR_VAKIT) BildirimKildimKurallari.vakitCoz(kimlik) else null
            val nafile = if (vakit == null && (tur == "" || tur == TUR_NAFILE)) NafileKildimKurallari.nafileCoz(kimlik) else null
            val bilgi = when (tur) {
                TUR_VAKIT -> if (vakit == null) return null else false
                TUR_NAFILE -> if (nafile == null) return null else false
                TUR_BILGI -> true
                "" -> if (vakit == null && nafile == null) return null else false
                else -> return null
            }
            // Kılınmışlığa bağlı bilgi alarmı (takvim) vakti/tarihi YÜKTEN taşır; ikisi de
            // kuyruk biçiminde değilse bağ yok sayılır (yanlış vakti "kılınmış" saymasın).
            val bagliVakit = if (bilgi && o.optBoolean("kilinmisligaBagli", false)) {
                val v = o.optString("vakit", "")
                v.takeIf { KildimKuyruguKurallari.gecerliMi(o.optString("tarih", ""), it) }
            } else {
                null
            }
            val alarmKanalId = o.optString("alarmKanalId", "")
            if (!alarmKanaliMi(alarmKanalId)) return null
            val tetikMs = o.optLong("tetikMs", 0L)
            if (tetikMs <= 0L) return null
            val sesUri = if (o.isNull("sesUri")) null else o.optString("sesUri", "").ifBlank { null }
            Yuk(
                kimlik = kimlik,
                nafileTuru = nafile?.tur,
                bilgi = bilgi,
                kilinmisligaBagli = bagliVakit != null,
                tetikMs = tetikMs,
                baslik = o.optString("baslik", ""),
                metin = o.optString("metin", ""),
                // Nafilede vakit (farz kayıt kodu) YOKTUR: boş — farz kuyruğu boşu reddeder.
                vakit = vakit?.vakit ?: bagliVakit ?: "",
                vakitAdi = o.optString("vakitAdi", ""),
                tarih = vakit?.tarih ?: nafile?.tarih ?: o.optString("tarih", ""),
                cikisMs = o.optLong("cikisMs", 0L),
                // ERTELE YOK (sahip kararı 2026-10-19): güncelleme öncesi yükteki
                // `erteleSinirMs` alanı OKUNMAZ (yok sayılır).
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
