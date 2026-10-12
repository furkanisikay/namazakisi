package com.furkanisikay.namazakisi.saat.cekirdek

import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/**
 * Saatin SAF hesap çekirdeği (issue #269) — Android'e bağımlı değil, JVM birim
 * testinde koşar. Zaman (`simdi`) ve bugünün tarihi (`bugun`) ENJEKTE edilir.
 *
 * Kurallar telefonla AYNI:
 * - Aktif gün: şu an < bugünün imsakı ise DÜN (yatsı sürüyor) — `aktifGunuHesapla`.
 * - Kerahat: güneş + şuruk, öğle − istiva, akşam − gurub (dakikalar yükten gelir;
 *   `KazaHesaplayiciServisi.mekruhVakitKontrolEt` ile aynı kaynak). UYAR, ENGELLEME.
 */
object VakitHesabi {

    /** Görünen adlar — sabit harita (Türkçe büyük/küçük harf dönüşümü yapılmaz). */
    val ADLAR = mapOf(
        "imsak" to "Sabah", "gunes" to "Güneş", "ogle" to "Öğle",
        "ikindi" to "İkindi", "aksam" to "Akşam", "yatsi" to "Yatsı",
    )

    data class VakitAni(val tarih: String, val vakit: String, val ms: Long) {
        val ad: String get() = ADLAR[vakit] ?: vakit
    }

    data class Satir(
        val tarih: String,
        val vakit: String,
        val ad: String,
        val ms: Long,
        /** Vakit girdi mi? (girmeyen vakit işaretlenemez) */
        val girdi: Boolean,
        val kilindi: Boolean,
        /** Saatte işaretlendi, telefondan onay bekleniyor */
        val esitleniyor: Boolean,
        /** İşaretlenebilir mi? (güneş hiçbir zaman) */
        val isaretlenebilir: Boolean,
    )

    fun tumVakitler(yuk: Yuk): List<VakitAni> =
        yuk.gunler.flatMap { g -> VAKITLER.map { VakitAni(g.tarih, it, g.vakitler.getValue(it)) } }
            .sortedBy { it.ms }

    fun siradaki(yuk: Yuk, simdi: Long): VakitAni? = tumVakitler(yuk).firstOrNull { it.ms > simdi }

    fun simdiki(yuk: Yuk, simdi: Long): VakitAni? = tumVakitler(yuk).lastOrNull { it.ms <= simdi }

    /** Şu anki vakit penceresinin ilerlemesi [0,1]; bilinmiyorsa null. */
    fun ilerleme(yuk: Yuk, simdi: Long): Float? {
        val bas = simdiki(yuk, simdi) ?: return null
        val son = siradaki(yuk, simdi) ?: return null
        val uzunluk = (son.ms - bas.ms).toFloat()
        if (uzunluk <= 0f) return null
        return ((simdi - bas.ms) / uzunluk).coerceIn(0f, 1f)
    }

    fun aktifGun(yuk: Yuk, simdi: Long, bugun: String): String {
        val idx = yuk.gunler.indexOfFirst { it.tarih == bugun }
        if (idx < 0) return bugun
        val imsak = yuk.gunler[idx].vakitler.getValue("imsak")
        return if (simdi < imsak && idx > 0) yuk.gunler[idx - 1].tarih else bugun
    }

    fun kerahatMi(yuk: Yuk, simdi: Long): Boolean {
        val dk = 60_000L
        return yuk.gunler.any { g ->
            val gunes = g.vakitler.getValue("gunes")
            val ogle = g.vakitler.getValue("ogle")
            val aksam = g.vakitler.getValue("aksam")
            (simdi in gunes..gunes + yuk.kerahat.surukDk * dk) ||
                (simdi in ogle - yuk.kerahat.istivaDk * dk..ogle) ||
                (simdi in aksam - yuk.kerahat.gurubDk * dk..aksam)
        }
    }

    /**
     * Aktif günün altı satırı. `bekleyen` = saatte işaretlenip telefonda henüz
     * onaylanmamış "<tarih>_<vakit>" kimlikleri (iyimser gösterim).
     */
    fun satirlar(yuk: Yuk, simdi: Long, bugun: String, bekleyen: Set<String>): List<Satir> {
        val tarih = aktifGun(yuk, simdi, bugun)
        val gun = yuk.gunler.firstOrNull { it.tarih == tarih } ?: return emptyList()
        return VAKITLER.map { v ->
            val ms = gun.vakitler.getValue(v)
            val kilindiTelefonda = v in gun.kilinan
            val bekliyor = !kilindiTelefonda && "${tarih}_$v" in bekleyen
            Satir(
                tarih = tarih,
                vakit = v,
                ad = ADLAR[v] ?: v,
                ms = ms,
                girdi = ms <= simdi,
                kilindi = kilindiTelefonda || bekliyor,
                esitleniyor = bekliyor,
                isaretlenebilir = v != "gunes" && ms <= simdi && !kilindiTelefonda && !bekliyor,
            )
        }
    }

    /** Telefon onaylayınca ya da gün geçince bekleyen kimlikleri ayıkla. */
    fun bekleyeniAyikla(yuk: Yuk, bekleyen: Set<String>): Set<String> =
        bekleyen.filter { id ->
            val tarih = id.substringBefore('_')
            val vakit = id.substringAfter('_')
            val gun = yuk.gunler.firstOrNull { it.tarih == tarih }
            gun != null && vakit !in gun.kilinan && yuk.gunler.indexOf(gun) <= 1
        }.toSet()

    fun saat(ms: Long, bolge: ZoneId = ZoneId.systemDefault()): String =
        DateTimeFormatter.ofPattern("HH:mm").withZone(bolge).format(Instant.ofEpochMilli(ms))

    /** "1 sa 12 dk" / "12 dk" / "1 dk'dan az" */
    fun kalanMetni(ms: Long): String {
        val dk = ms / 60_000L
        if (dk < 1) return "1 dk'dan az"
        val sa = dk / 60
        val kalanDk = dk % 60
        return when {
            sa == 0L -> "$kalanDk dk"
            kalanDk == 0L -> "$sa sa"
            else -> "$sa sa $kalanDk dk"
        }
    }

    /** Bekleyen kimlik ("<tarih>_<vakit>") */
    fun kimlik(tarih: String, vakit: String) = "${tarih}_$vakit"
}
