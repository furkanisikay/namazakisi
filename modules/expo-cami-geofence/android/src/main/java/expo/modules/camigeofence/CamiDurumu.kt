package expo.modules.camigeofence

import android.content.Context
import expo.modules.camigeofence.cekirdek.CamiKarar
import expo.modules.camigeofence.cekirdek.CamiKarari
import expo.modules.camigeofence.cekirdek.CamiSabitleri
import expo.modules.camigeofence.cekirdek.IzlemeKarari
import expo.modules.camigeofence.cekirdek.IzlenenYer
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * "Camidesiniz" hâlinin giriş/çıkışı.
 *
 * Giriş: hâl diske yazılır (muhafız sessizlik bayrağıyla birlikte — sesli anons
 * `AnonsReceiver`'da konuşmaz), üst süre alarmı kurulur (90 dk, cuma 150),
 * ayar açıksa Namaz modu açılır ve sessiz bir "Camidesiniz" bildirimi çıkar.
 * Çıkış (EXIT / üst süre / "cami değil"): mod kapanır, ayar açıksa
 * "kıldınız mı?" sorulur. Her iki yönde JS (yaşıyorsa) haberdar edilir; muhafızı
 * yeniden planlar (camideyken acil kanal kullanılmaz).
 */
object CamiDurumu {
    const val ACTION_UST_SURE = "expo.modules.camigeofence.UST_SURE"
    private const val ISTEK_KODU = 7321
    private const val KAYNAK = "cami"

    private fun ustSureIntent(ctx: Context) =
        PlanliAlarm.pendingIntent(ctx, CamiGeofenceAlicisi::class.java, ACTION_UST_SURE, ISTEK_KODU)

    @Synchronized
    fun giris(ctx: Context, yer: IzlenenYer, karar: CamiKarari) {
        val ayarlar = CamiDepo.ayarlar(ctx)
        val simdi = System.currentTimeMillis()
        val cuma = karar.cuma == true
        val bitisMs = CamiKarar.camideBitisMs(simdi, cuma)
        val tur = tur(karar.tarih, karar.vakit, yer.id, simdi)
        // Bekleyen "Camide misiniz?" sorusu artık cevaplanmış sayılır.
        soruyuKapat(ctx)
        // Mod kaynağı üst süreyle AYNI anda geçersizleşir (alarm silinse bile).
        val modSonucu = if (ayarlar.namazModu) NamazModu.ac(ctx, KAYNAK, tur, bitisMs) else "kapali"
        val c = CamiDepo.Camide(
            yerId = yer.id,
            ad = yer.ad,
            vakit = karar.vakit,
            tarih = karar.tarih,
            cuma = cuma,
            girisMs = simdi,
            bitisMs = bitisMs,
            modAcildi = modSonucu == "acildi",
        )
        CamiDepo.camideYaz(ctx, c, ayarlar.sessiz)
        PlanliAlarm.kur(ctx, c.bitisMs, ustSureIntent(ctx))
        CamiGunluk.ekle(ctx, "camide", mapOf("yer" to yer.ad, "vakit" to karar.vakit, "mod" to modSonucu))
        CamiBildirimleri.camidesiniz(ctx, c, ayarlar.sessiz)
        CamiOlaylari.yay("camide")
    }

    /** @param sebep "cikis" | "sure" | "haric" | "kapatildi" */
    @Synchronized
    fun bitir(ctx: Context, sebep: String) {
        val c = CamiDepo.camide(ctx) ?: return
        val ayarlar = CamiDepo.ayarlar(ctx)
        CamiDepo.camideYaz(ctx, null, false)
        PlanliAlarm.iptal(ctx, ustSureIntent(ctx))
        NamazModu.kapat(ctx, KAYNAK)
        CamiBildirimleri.kapat(ctx, CamiBildirimleri.ID_CAMIDE)
        CamiGunluk.ekle(ctx, sebep, mapOf("yer" to c.ad, "dk" to ((System.currentTimeMillis() - c.girisMs) / 60_000)))
        // "Cami değil" yanlış algılamadır → soru sorulmaz.
        if (sebep != "haric" && ayarlar.kildimSor && c.vakit != null && c.tarih != null) {
            CamiBildirimleri.kildinizMi(ctx, c.vakit, c.tarih, c.cuma)
        }
        CamiOlaylari.yay("cikis")
    }

    /**
     * Tutarlılık denetimi: üst süre geçtiyse camide hâlini bitir, değilse alarmı
     * geri kur; ardından süresi geçmiş Namaz modu kaynaklarını düşür.
     *
     * Yalnız BOOT/MY_PACKAGE_REPLACED'da çağrılsaydı force-stop ya da OEM uyku
     * kısıtı üst süre alarmını sildiğinde "cami" kaynağı ve Rahatsız Etmeyin
     * KALICI açık kalırdı (kullanıcı arama kaçırır). Bu yüzden modül oluşturulurken,
     * `durumAl` / `izlemeyiTazele` başında ve 15 dk'lık görevde de çağrılır.
     * İdempotent ve ucuzdur (SharedPreferences + tek alarm).
     */
    @Synchronized
    fun yenidenKur(ctx: Context) {
        val c = CamiDepo.camide(ctx)
        if (c != null) {
            if (c.bitisMs <= System.currentTimeMillis()) bitir(ctx, "sure") else PlanliAlarm.kur(ctx, c.bitisMs, ustSureIntent(ctx))
        }
        NamazModu.suresiGecenleriTemizle(ctx)
    }

    /** Namaz modu / "Hayır" hafızası tur kimliği (vakit kapısı kapalıyken takvim günü + yer). */
    fun tur(tarih: String?, vakit: String?, yerId: String, simdiMs: Long): String =
        IzlemeKarari.camiTuru(tarih, vakit, takvimGunu(simdiMs), yerId)

    /**
     * Güven puanı SOR dedi (Faz 2): mod AÇILMAZ, muhafız sessizleşmez; yalnız sessiz
     * bir "Camide misiniz?" bildirimi çıkar. Cevap `CamiEylemAlicisi`'nde işlenir.
     * Soru en geç [CamiSabitleri.SORU_AZAMI_DK] (ya da vakit penceresinin sonu) sonra düşer.
     */
    @Synchronized
    fun sor(ctx: Context, yer: IzlenenYer, karar: CamiKarari, pencereSonMs: Long?) {
        val simdi = System.currentTimeMillis()
        val ust = simdi + CamiSabitleri.SORU_AZAMI_DK * CamiSabitleri.DAKIKA_MS
        val bitis = if (pencereSonMs != null && pencereSonMs > simdi) minOf(ust, pencereSonMs) else ust
        val soru = CamiDepo.Soru(yer, karar.vakit, karar.tarih, karar.cuma == true, tur(karar.tarih, karar.vakit, yer.id, simdi), simdi, bitis)
        CamiDepo.soruYaz(ctx, soru)
        CamiGunluk.ekle(ctx, "soruldu", mapOf("yer" to yer.ad, "vakit" to karar.vakit))
        CamiBildirimleri.camideMisiniz(ctx, soru, CamiDepo.ayarlar(ctx).namazModu)
        CamiOlaylari.yay("soru")
    }

    /** "Namaz modunu aç": bekleyen soruyu kabul eder. @return soru hâlâ geçerli miydi */
    @Synchronized
    fun soruyuKabulEt(ctx: Context): Boolean {
        val s = CamiDepo.soru(ctx)
        if (s == null) {
            CamiBildirimleri.kapat(ctx, CamiBildirimleri.ID_CAMI_SORU)
            return false
        }
        CamiGunluk.ekle(ctx, "soruKabul", mapOf("yer" to s.yer.ad))
        giris(ctx, s.yer, CamiKarari("camide", s.yer.id, s.vakit, s.tarih, s.cuma))
        return true
    }

    /** "Hayır": bu turda bu yer için bir daha sorulmaz (ve açılmaz). */
    @Synchronized
    fun soruyuReddet(ctx: Context) {
        val s = CamiDepo.soru(ctx)
        if (s != null) {
            CamiDepo.reddedilenEkle(ctx, s.tur, s.yer.id)
            CamiGunluk.ekle(ctx, "soruRet", mapOf("yer" to s.yer.ad))
        }
        soruyuKapat(ctx)
        CamiOlaylari.yay("soru")
    }

    /** Soruyu sessizce kaldırır (cevaplandı, yerden çıkıldı, "cami değil"). */
    fun soruyuKapat(ctx: Context) {
        CamiDepo.soruYaz(ctx, null)
        CamiBildirimleri.kapat(ctx, CamiBildirimleri.ID_CAMI_SORU)
    }

    /** Cihaz saat dilimindeki takvim günü (`yyyy-MM-dd`) — vakit kapısı kapalıyken tur kimliği için. */
    private fun takvimGunu(ms: Long): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(ms))
}
