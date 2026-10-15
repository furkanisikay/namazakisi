package com.furkanisikay.namazakisi.alarm

import android.content.Context
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.BildirimKildimKurallari
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari

/**
 * Bir vakit kılındığında o vaktin GERÇEK ALARMLARINI (issue #74) susturmanın TEK yolu.
 *
 * İki ayrı şey kapatılmalı ve ikisi de kendi defterinde durur:
 *  1. BEKLEYEN alarmlar → [MuhafizAlarmZamanlayici] kayıt defteri (`setAlarmClock` iptali).
 *  2. ÇALAN (ya da sessize düşmüş) alarm bildirimi → `NotificationManager`'daki
 *     `(etiket = kimlik, numara = 74074)` bildirimi + 2 dk'lık susturma alarmı. Tetiklenen
 *     alarm kayıt defterinden düştüğü için (1) onu GÖRMEZ: yalnız (1) yapılsaydı ekranda
 *     "Kılındı" yazarken telefon insistent sesle çalmaya ve tam ekran açık kalmaya devam
 *     ederdi (Fable H1). Tam ekran etkinliği bildirimin varlığını saniyede bir yokladığı
 *     için bildirim kalkınca kendini kapatır — ayrı yayın kanalı gerekmez.
 *
 * Çağıranlar: uygulama içi "Kıldım" (JS köprüsü, önekle), ortak "Kıldım" kuyruğuna her
 * ekleme (`KildimKuyrugu.ekle` — saat, widget, kutu, kısayol, otomasyon, bildirim).
 * Planlama turu (`hazirla`) BUNU ÇAĞIRMAZ: o yalnız bekleyenleri siler, çalan bir alarmı
 * yeniden planlama yüzünden susturmak yanlış olurdu.
 */
object MuhafizAlarmTemizligi {
    private const val TAG = "MuhafizAlarm"

    /** Vaktin (tarih + vakit) bütün alarmları. @return iptal edilen bekleyen alarm sayısı. */
    fun vaktiSustur(context: Context, vakit: BildirimKildimKurallari.Vakit): Int =
        sustur(context) { BildirimKildimKurallari.buVakteAitMi(it, vakit) }

    /** Öneki taşıyan bütün alarmlar (JS `vakitYanKanallariniIptalEt` öneki). Boş önek → 0. */
    fun onekliSustur(context: Context, onek: String): Int =
        if (onek.isEmpty()) 0 else sustur(context, MuhafizAlarmKurallari.onekEslestirici(onek))

    private fun sustur(context: Context, esles: (String) -> Boolean): Int {
        val bekleyen = try {
            MuhafizAlarmZamanlayici.eslesenleriIptalEt(context, esles).size
        } catch (e: Exception) {
            Log.w(TAG, "Bekleyen alarmlar iptal edilemedi", e)
            0
        }
        try {
            MuhafizAlarmBildirimi.gosterilenKimlikler(context, esles).forEach { kimlik ->
                MuhafizAlarmBildirimi.kaldir(context, kimlik)
                MuhafizAlarmAlici.susturmayiIptalEt(context, kimlik)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Calan alarm kapatilamadi", e)
        }
        return bekleyen
    }
}
