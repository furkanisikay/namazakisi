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

    /**
     * Ekranın sorusu: "içinde bulunduğum vakit ne zaman çıkıyor?" — ana ekran yayı ve
     * sayacı, "Bugün" tile'ı, vakit listesi şeridi ve komplikasyonlar YALNIZ bunu okur.
     *
     * Mod kuralı TEK yerde (`KalanSure.mod`): farz vakti sürüyorsa o vaktin ÇIKIŞINA,
     * güneş→öğle arasında (farz yok) öğlenin GİRİŞİNE sayılır; önceki vakit bilinmiyorsa
     * (yükün ilk anı) sıradakinin girişine.
     */
    data class SayilanAn(
        val mod: KalanSure.Mod,
        /** Sayılan vakit: çıkışta şu anki vakit, girişte gelecek vakit. */
        val vakit: String,
        /** Sayılan vaktin günü — gece yarısından sonra süren yatsı DÜNE aittir. */
        val tarih: String,
        /** Aralığın başı; yükün ilk anında bilinmez (null). */
        val baslangic: Long?,
        /** Sayılan an (çıkışta sıradakinin girişi = bu vaktin çıkışı). */
        val hedef: Long,
        val siradaki: VakitAni,
    ) {
        val ad: String get() = ADLAR[vakit] ?: vakit

        fun kalanMs(simdi: Long): Long = (hedef - simdi).coerceAtLeast(0L)

        /** Kalan kısım [0,1]; başlangıç bilinmiyorsa 1 (yay dolu). */
        fun kalanOran(simdi: Long): Float {
            val bas = baslangic ?: return 1f
            val uzunluk = (hedef - bas).toFloat()
            if (uzunluk <= 0f) return 0f
            return ((hedef - simdi) / uzunluk).coerceIn(0f, 1f)
        }

        /** Vaktin son `SaatPaleti.ACIL_ESIK_DK` dakikası (yalnız çıkışa sayarken). */
        fun acilMi(simdi: Long): Boolean =
            mod == KalanSure.Mod.CIKIS && hedef - simdi <= SaatPaleti.ACIL_ESIK_DK * DK
    }

    fun sayilanAn(onceki: VakitAni?, siradaki: VakitAni): SayilanAn =
        when (KalanSure.mod(onceki?.vakit)) {
            KalanSure.Mod.CIKIS -> SayilanAn(KalanSure.Mod.CIKIS, onceki!!.vakit, onceki.tarih, onceki.ms, siradaki.ms, siradaki)
            KalanSure.Mod.GIRIS -> SayilanAn(KalanSure.Mod.GIRIS, siradaki.vakit, siradaki.tarih, onceki?.ms, siradaki.ms, siradaki)
        }

    /** Yük bittiyse (sıradaki vakit yok) null → "telefonunuzda açın" durumu. */
    fun sayilanAn(yuk: Yuk, simdi: Long): SayilanAn? {
        val siradaki = siradaki(yuk, simdi) ?: return null
        return sayilanAn(simdiki(yuk, simdi), siradaki)
    }

    /**
     * İkindinin son `gurubDk` dakikası (gurub kerahati) — yalnız ikindinin ÇIKIŞINA
     * sayarken; `kerahatMi` ile aynı kaynak (akşam − gurub). Kerahat UYARIDIR, engel değil.
     */
    fun kerahatBandi(yuk: Yuk, s: SayilanAn): Pair<Long, Long>? {
        if (s.mod != KalanSure.Mod.CIKIS || s.vakit != "ikindi" || yuk.kerahat.gurubDk <= 0) return null
        return (s.hedef - yuk.kerahat.gurubDk * DK) to s.hedef
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

    /** Anın yerel takvim günü (`YYYY-MM-DD`) — zaman çizelgesindeki her girdinin "bugün"ü. */
    fun tarih(ms: Long, bolge: ZoneId = ZoneId.systemDefault()): String =
        Instant.ofEpochMilli(ms).atZone(bolge).toLocalDate().toString()

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

    /** Ekran okuyucu için uzun biçim: "1 saat 58 dakika" / "58 dakika" / "1 dakikadan az". */
    fun kalanSesliMetni(ms: Long): String {
        val dk = ms / DK
        if (dk < 1) return "1 dakikadan az"
        val sa = dk / 60
        val kalanDk = dk % 60
        return when {
            sa == 0L -> "$kalanDk dakika"
            kalanDk == 0L -> "$sa saat"
            else -> "$sa saat $kalanDk dakika"
        }
    }

    private const val DK = 60_000L

    /** Bekleyen kimlik ("<tarih>_<vakit>") */
    fun kimlik(tarih: String, vakit: String) = "${tarih}_$vakit"
}
