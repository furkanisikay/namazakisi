package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Saatte SESSİZ UYANDIRMA (saat W3, fikir 2) — SAF, JVM testli.
 *
 * Telefonun hazır uyandırma listesi (`Yuk.uyandirma`) saatin TEK ALARM ZİNCİRİNE ÖNCELİKLİ
 * ayrı bir kayıt türü olarak girer: aynı kimlikli muhafız kaydı (sabahın gerçek alarm
 * tetiği) BASTIRILIR — bilekte uyandırma onun yerine geçer, ikisi birden çalmaz.
 * Zincir aynı anda tek alarm tutar; uyandırmanın sıradaki anı (ertelenmiş hâli dahil)
 * zincirin "ek sınırı" olarak kurulur, tetikte ikisi ayrı ayrı değerlendirilir.
 *
 * Saat-yerel durum: kapatılan kimlikler, ertelemeler (kimlik → yeni an) ve son çalınan an
 * (aynı tetik iki kez çalmasın). Telefona "kapandı" mesajı gider, telefon YEDEĞİNİ iptal eder.
 */
object UyandirmaZinciri {
    const val ERTELEME_MS = 10 * 60_000L

    /** Titreşim en fazla bu kadar sürer (sonra telefon yedeği esas olur). */
    const val CALMA_SURESI_MS = 2 * 60_000L

    data class Durum(
        val kapatilan: Set<String> = emptySet(),
        val ertelenen: Map<String, Long> = emptyMap(),
        /** kimlik → çalındığı (etkin) an */
        val calinan: Map<String, Long> = emptyMap(),
    )

    data class Aday(val kayit: UyandirmaKaydi, val ms: Long)

    /** Muhafız planında bastırılacak kimlikler (uyandırma onların yerine geçer). */
    fun bastirilanlar(yuk: Yuk?): Set<String> = yuk?.uyandirma?.mapTo(HashSet()) { it.id } ?: emptySet()

    /** Kapatılmamış, kılınmamış (sabah farzı) ve anlamını yitirmemiş uyandırmalar, etkin anlarıyla. */
    fun adaylar(yuk: Yuk?, bekleyen: Set<String>, d: Durum): List<Aday> {
        if (yuk == null) return emptyList()
        return yuk.uyandirma
            .filter { it.id !in d.kapatilan }
            .filter { it.nafile || !AlarmZinciri.kilinmisMi(yuk, bekleyen, it.tarih, "imsak") }
            .map { Aday(it, d.ertelenen[it.id] ?: it.ms) }
            .filter { it.ms < it.kayit.sonMs }
    }

    /** Zincire kurulacak sıradaki uyandırma (`simdi`den sonra). */
    fun siradaki(yuk: Yuk?, bekleyen: Set<String>, d: Durum, simdi: Long): Aday? =
        adaylar(yuk, bekleyen, d).filter { it.ms > simdi }.minByOrNull { it.ms }

    /**
     * Şimdi çalacak uyandırma: zamanı gelmiş, tolerans içinde (Doze kaydırması), bu an için
     * daha önce çalınmamış. Saat şarjdaysa ÇALMAZ (komodinde boşa titremesin; telefonun
     * yedeği esas olur — fikir 3 ile aynı ilke).
     */
    fun calacak(yuk: Yuk?, bekleyen: Set<String>, d: Durum, simdi: Long, sarjda: Boolean = false): Aday? {
        if (sarjda) return null
        return adaylar(yuk, bekleyen, d)
            .filter { it.ms <= simdi && simdi - it.ms <= AlarmZinciri.GECIKME_TOLERANSI_MS && d.calinan[it.kayit.id] != it.ms }
            .maxByOrNull { it.ms }
    }

    /** "10 dk ertele" hedefi; uyandırmanın anlamı (vakit/pencere sonu) bitmeden 1 dk önce yoksa null. */
    fun erteleHedefi(kayit: UyandirmaKaydi, simdi: Long): Long? =
        (simdi + ERTELEME_MS).takeIf { it < kayit.sonMs - 60_000L }
}
