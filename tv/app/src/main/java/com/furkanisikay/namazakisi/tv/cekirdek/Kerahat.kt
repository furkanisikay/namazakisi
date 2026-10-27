package com.furkanisikay.namazakisi.tv.cekirdek

/**
 * Kerahat (mekruh) vakitleri — telefonun kaza ekranıyla AYNI pratik tanım
 * (`KazaHesaplayiciServisi.mekruhVakitKontrolEt`):
 *  - şuruk: güneş doğuşu → +[SURUK_DK]
 *  - istiva: öğle girişi −[ISTIVA_DK] → öğle girişi
 *  - gurub: akşam girişi −[GURUB_DK] → akşam girişi (`gurubKerahatiBaslangiciMs`)
 * Sınırlar İKİ UÇTA DA dahildir (JS `now >= başlangıç && now <= bitiş`).
 *
 * İkiz sabitler: `KAZA_SABITLERI.MEKRUH_TOLERANS_DK` / `ISTIVA_TOLERANS_DK`. Değişirse
 * `scripts/tv/tv-verisi-uret.js` yeniden koşulur; fikstür iki tarafı da kırar.
 */
object Kerahat {
    const val SURUK_DK = 20
    const val ISTIVA_DK = 5
    const val GURUB_DK = 20

    private const val DK = 60_000L

    enum class Tur(val kod: String, val ad: String, val aciklama: String) {
        SURUK("suruk", "Güneş doğuşu", "Güneş iyice yükselene kadar namaz kılınması mekruhtur."),
        ISTIVA("istiva", "İstiva", "Güneş tam tepedeyken namaz kılınması mekruhtur."),
        GURUB("gurub", "Güneş batışı", "Güneş batarken namaz kılınması mekruhtur."),
        ;

        /** [dil]deki ad ve açıklama (`TvDili`); [ad]/[aciklama] Türkçedir. */
        fun ad(dil: String): String = tvDili(dil).kerahatAdi(this)

        fun aciklama(dil: String): String = tvDili(dil).kerahatAciklamasi(this)
    }

    data class Pencere(val tur: Tur, val baslangic: Long, val bitis: Long) {
        fun icindeMi(simdiMs: Long): Boolean = simdiMs in baslangic..bitis
    }

    fun pencereler(v: GunlukVakitler): List<Pencere> = listOf(
        Pencere(Tur.SURUK, v.gunes, v.gunes + SURUK_DK * DK),
        Pencere(Tur.ISTIVA, v.ogle - ISTIVA_DK * DK, v.ogle),
        Pencere(Tur.GURUB, v.aksam - GURUB_DK * DK, v.aksam),
    )

    fun aktif(v: GunlukVakitler, simdiMs: Long): Pencere? =
        pencereler(v).firstOrNull { it.icindeMi(simdiMs) }

    /** Bugün içinde henüz başlamamış ilk kerahat penceresi. */
    fun siradaki(v: GunlukVakitler, simdiMs: Long): Pencere? =
        pencereler(v).firstOrNull { it.baslangic > simdiMs }
}
