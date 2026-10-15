package expo.modules.camigeofence.cekirdek

/**
 * Camideyim GÜVEN PUANI (Faz 2) — "camide" kararından sonra modun otomatik mi
 * açılacağını, sorulacağını mı, yoksa hiçbir şey yapılmayacağını mı belirler.
 *
 * JS ikizi `src/core/cami/guvenPuani.ts` (kuralların açıklaması orada); ikisi ortak
 * `guven-puani-tablosu.json` senaryolarıyla sınanır (GuvenPuaniTest ↔ guvenPuani.test.ts).
 * Puan/eşik/tavan değişirse İKİ tarafı + fikstürü birlikte değiştirin.
 */
data class GuvenSonucu(
    val zaman: String,
    val yer: String,
    val hareket: String,
    val puan: Int,
    val karar: String,
    val tavan: String?,
)

data class AcilisSonucu(val karar: CamiKarari, val guven: GuvenSonucu?, val eylem: String)

object GuvenPuani {
    const val OTOMATIK = "otomatik"
    const val SOR = "sor"
    const val HICBIR = "hicbir"

    private val ZAMAN_PUANI = mapOf("cuma" to 45, "ezanYakin" to 40, "kapiIci" to 20, "serbest" to 0)
    private val YER_PUANI = mapOf("poligonIci" to 40, "kullaniciAlani" to 30, "noktaMerkez" to 30, "noktaKenar" to 10, "tampon" to 5)
    private val SIRA = mapOf(HICBIR to 0, SOR to 1, OTOMATIK to 2)

    fun zamanSinifi(simdiMs: Long, pencere: KapiPenceresi?): String {
        if (pencere == null) return "serbest"
        if (pencere.cuma) return "cuma"
        val giris = pencere.bas + CamiSabitleri.KAPI_ONCE_DK * CamiSabitleri.DAKIKA_MS
        val fark = simdiMs - giris
        return if (fark >= -CamiSabitleri.GUVEN_EZAN_ONCE_DK * CamiSabitleri.DAKIKA_MS &&
            fark <= CamiSabitleri.GUVEN_EZAN_SONRA_DK * CamiSabitleri.DAKIKA_MS
        ) "ezanYakin" else "kapiIci"
    }

    fun yerSinifi(yer: IzlenenYer, lat: Double, lng: Double): String {
        val ozel = yer.ozelAlanM
        if ((ozel != null && ozel > 0) || yer.kaynak == "kendi") return "kullaniciAlani"
        val pol = yer.poligon
        if (pol != null && pol.size >= 3) return if (Geometri.noktaPoligondaMi(lat, lng, pol)) "poligonIci" else "tampon"
        return if (Geometri.mesafeM(lat, lng, yer.lat, yer.lng) <= Geometri.alanYaricapiM(null, yer.yaricapM) / 2) "noktaMerkez" else "noktaKenar"
    }

    fun hareketSinifi(hizMps: Double?): String {
        if (hizMps == null || hizMps.isNaN() || hizMps.isInfinite() || hizMps < 0) return "bilinmiyor"
        if (hizMps > CamiSabitleri.HIZ_HAREKETLI_MPS) return "hareketli"
        if (hizMps <= CamiSabitleri.HIZ_DURGUN_MPS) return "durgun"
        return "yavas"
    }

    fun puanla(zaman: String, yer: String, hareket: String, dogrulukM: Double, beklemeDk: Int): GuvenSonucu {
        var puan = (ZAMAN_PUANI[zaman] ?: 0) + (YER_PUANI[yer] ?: 0)
        if (dogrulukM <= 10) puan += 10 else if (dogrulukM <= 20) puan += 5
        if (hareket == "durgun") puan += 5
        if (beklemeDk >= 10) puan += 10 else if (beklemeDk >= 5) puan += 5

        var karar = when {
            puan >= CamiSabitleri.GUVEN_OTOMATIK_ESIK -> OTOMATIK
            puan >= CamiSabitleri.GUVEN_SOR_ESIK -> SOR
            else -> HICBIR
        }
        var tavan: String? = null
        fun uygula(ust: String, neden: String) {
            if ((SIRA[karar] ?: 0) > (SIRA[ust] ?: 0)) {
                karar = ust
                if (tavan == null) tavan = neden
            }
        }
        val kenar = yer == "tampon" || yer == "noktaKenar"
        if (hareket == "hareketli" && kenar) uygula(HICBIR, "gecipGidiyor")
        if (hareket == "hareketli") uygula(SOR, "hareketli")
        if (kenar) uygula(SOR, "kenar")
        if (zaman == "serbest") uygula(SOR, "vakitDisi")
        return GuvenSonucu(zaman, yer, hareket, puan, karar, tavan)
    }

    fun hesapla(simdiMs: Long, pencere: KapiPenceresi?, yer: IzlenenYer, konum: OlculenKonum, hizMps: Double?, beklemeDk: Int): GuvenSonucu =
        puanla(zamanSinifi(simdiMs, pencere), yerSinifi(yer, konum.lat, konum.lng), hareketSinifi(hizMps), konum.dogrulukM, beklemeDk)

    /** "akilli" | "otomatik" | "sorarak" — kullanıcının açılış biçimi son sözü söyler. */
    fun bicimiUygula(karar: String, bicim: String): String = when (bicim) {
        "otomatik" -> if (karar == HICBIR) HICBIR else OTOMATIK
        "sorarak" -> if (karar == HICBIR) HICBIR else SOR
        else -> karar
    }

    /** Tam boru hattı: karar → güven → açılış biçimi (JS `acilisKarariVer`). */
    fun acilisKarari(
        simdiMs: Long,
        vakitKapisiAcik: Boolean,
        pencereler: List<KapiPenceresi>,
        konum: OlculenKonum?,
        hizMps: Double?,
        adaylar: List<IzlenenYer>,
        haric: Set<String>,
        beklemeDk: Int,
        acilisBicimi: String,
    ): AcilisSonucu {
        val karar = CamiKarar.karar(simdiMs, vakitKapisiAcik, pencereler, konum, adaylar, haric)
        if (karar.sonuc != "camide" || konum == null) return AcilisSonucu(karar, null, HICBIR)
        val yer = adaylar.firstOrNull { it.id == karar.yerId } ?: return AcilisSonucu(karar, null, HICBIR)
        val guven = hesapla(simdiMs, CamiKarar.kapiPenceresiniBul(simdiMs, pencereler), yer, konum, hizMps, beklemeDk)
        return AcilisSonucu(karar, guven, bicimiUygula(guven.karar, acilisBicimi))
    }
}
