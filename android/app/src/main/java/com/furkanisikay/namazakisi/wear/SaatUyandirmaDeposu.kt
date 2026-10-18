package com.furkanisikay.namazakisi.wear

import android.content.Context
import com.furkanisikay.namazakisi.cekirdek.SaatKomutKurallari

/**
 * Saatte uyandırmaya verilen CEVAPLAR (saat W3) — kimlik → kapatıldı / ertelendi.
 *
 * Neden telefon tarafında da kalıcı: saat "kapattım/erteledim" dediğinde telefon yedeğini
 * native olarak iptal eder ya da yeni ana taşır; ama JS planlama turu (15 dk görevi,
 * açılış, konum yayması) aynı kimliği plandan YENİDEN üretir. Bu depo okunmasaydı tur
 * kapatılan yedeği tekrar kurar, ertelenen yedeği eski anına geri çekerdi. JS onu
 * `WearSenkron.saatUyandirmaDurumlari()` ile okur (`LocalSaatAyarlariServisi.teslimBaglaminiOku`).
 * Kurallar SAF `SaatKomutKurallari.depoyaYaz/depoyuSuz`'da (JVM testi); ömrü dolan kayıt düşer.
 */
object SaatUyandirmaDeposu {
    private const val PREFS = "namazakisi_saat_uyandirma"
    private const val ANAHTAR = "durumlar"
    private val KILIT = Any()

    fun yaz(context: Context, istek: SaatKomutKurallari.UyandirmaIstegi) = synchronized(KILIT) {
        val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val yeni = SaatKomutKurallari.depoyaYaz(prefs.getString(ANAHTAR, null), istek, System.currentTimeMillis())
        prefs.edit().putString(ANAHTAR, yeni).commit()
    }

    /** JS'e giden JSON (ömrü dolmamış kayıtlar). Asla fırlatmaz. */
    fun oku(context: Context): String = synchronized(KILIT) {
        try {
            val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            SaatKomutKurallari.depoyuSuz(prefs.getString(ANAHTAR, null), System.currentTimeMillis()).toString()
        } catch (_: Exception) {
            "{}"
        }
    }
}
