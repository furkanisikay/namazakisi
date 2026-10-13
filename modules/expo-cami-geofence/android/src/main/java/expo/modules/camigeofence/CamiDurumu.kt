package expo.modules.camigeofence

import android.content.Context
import expo.modules.camigeofence.cekirdek.CamiKarar
import expo.modules.camigeofence.cekirdek.CamiKarari
import expo.modules.camigeofence.cekirdek.IzlenenYer

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

    fun giris(ctx: Context, yer: IzlenenYer, karar: CamiKarari) {
        val ayarlar = CamiDepo.ayarlar(ctx)
        val simdi = System.currentTimeMillis()
        val cuma = karar.cuma == true
        val tur = "cami:${karar.tarih ?: "?"}_${karar.vakit ?: "serbest"}"
        val modSonucu = if (ayarlar.namazModu) NamazModu.ac(ctx, KAYNAK, tur) else "kapali"
        val c = CamiDepo.Camide(
            yerId = yer.id,
            ad = yer.ad,
            vakit = karar.vakit,
            tarih = karar.tarih,
            cuma = cuma,
            girisMs = simdi,
            bitisMs = CamiKarar.camideBitisMs(simdi, cuma),
            modAcildi = modSonucu == "acildi",
        )
        CamiDepo.camideYaz(ctx, c, ayarlar.sessiz)
        PlanliAlarm.kur(ctx, c.bitisMs, ustSureIntent(ctx))
        CamiGunluk.ekle(ctx, "camide", mapOf("yer" to yer.ad, "vakit" to karar.vakit, "mod" to modSonucu))
        CamiBildirimleri.camidesiniz(ctx, c, ayarlar.sessiz)
        CamiOlaylari.yay("camide")
    }

    /** @param sebep "cikis" | "sure" | "haric" | "kapatildi" */
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

    /** Yeniden başlatma: üst süre geçtiyse kapat, değilse alarmı geri kur. */
    fun yenidenKur(ctx: Context) {
        val c = CamiDepo.camide(ctx) ?: return
        if (c.bitisMs <= System.currentTimeMillis()) bitir(ctx, "sure") else PlanliAlarm.kur(ctx, c.bitisMs, ustSureIntent(ctx))
    }
}
