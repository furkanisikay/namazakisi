package com.furkanisikay.namazakisi.cekirdek

/**
 * Kilit ekranı saat alanını ÖLÇMENİN saf kısmı (JVM testi: DuvarTasarimiTest > ölçüm).
 *
 * Kullanıcının seçtiği kilit ekranı görüntüsü, son uygulanan kilit görselinin küçük kopyasıyla
 * (`filesDir/duvar/son-kilit.png`) aynı boyuta ([OLCUM_GENISLIGI] × [olcumYuksekligi]) küçültülür;
 * burada parlaklıklar karşılaştırılır: kilit ekranı duvar kâğıdını karartır/soldurur, bu yüzden
 * görüntü ≈ a·referans + b en küçük kareler ile eşlenir, en büyük artıkların [AYKIRI_ORANI]'nı
 * (saat, bildirim) dışarıda bırakıp bir kez yeniden eşlenir. Artığı [DEGISIM_ESIGI]'ni aşan piksel
 * "üstte çizilmiş" sayılır; satır başına oranı döner. KARAR (hangi satırlar saat) JS'tedir
 * (`duvarTasarimi.ts` > `saatAlaniBul`); burada eşik/bölge kuralı YAZILMAZ.
 */
object DuvarOlcumu {
    /** Karşılaştırma genişliği (px); yükseklik referansın oranından. */
    const val OLCUM_GENISLIGI = 108

    /** Kaydedilen referans kopyanın genişliği (px). */
    const val REFERANS_GENISLIGI = 270

    /** Görüntü ile referansın en-boy oranı bundan fazla (göreli) farklıysa ölçülmez. */
    const val ORAN_TOLERANSI = 0.03

    /** Eşlemeden sonra bu kadar (0–1 parlaklık) sapan piksel değişmiş sayılır. */
    const val DEGISIM_ESIGI = 0.10

    /** İkinci eşlemede dışarıda bırakılan en büyük artık oranı. */
    const val AYKIRI_ORANI = 0.2

    /** ARGB → 0–1 parlaklık (sRGB kodlu kanallar 0,2126/0,7152/0,0722 ağırlıklı; alfa yok sayılır). */
    fun parlaklik(argb: Int): Double =
        (0.2126 * ((argb shr 16) and 255) + 0.7152 * ((argb shr 8) and 255) + 0.0722 * (argb and 255)) / 255.0

    fun parlaklikDizisi(pikseller: IntArray): DoubleArray = DoubleArray(pikseller.size) { parlaklik(pikseller[it]) }

    /** [genislik]×[yukseklik] görselin ölçüm yüksekliği: `round(108 · h / w)`, en az 1. */
    fun olcumYuksekligi(genislik: Int, yukseklik: Int): Int =
        maxOf(1, Math.round(OLCUM_GENISLIGI.toDouble() * yukseklik / genislik).toInt())

    /** Kaydedilen referansın yüksekliği: `round(270 · h / w)`, en az 1. */
    fun referansYuksekligi(genislik: Int, yukseklik: Int): Int =
        maxOf(1, Math.round(REFERANS_GENISLIGI.toDouble() * yukseklik / genislik).toInt())

    /** İki görselin en-boy oranı (h/w) en çok [ORAN_TOLERANSI] kadar farklı mı? */
    fun oranUyar(g1: Int, y1: Int, g2: Int, y2: Int): Boolean {
        if (g1 <= 0 || y1 <= 0 || g2 <= 0 || y2 <= 0) return false
        val a1 = y1.toDouble() / g1
        val a2 = y2.toDouble() / g2
        return Math.abs(a1 - a2) / a2 <= ORAN_TOLERANSI
    }

    /**
     * `ekran ≈ a·referans + b`, yalnız [dahil] pikselleri (null = hepsi). Referans düzse
     * (`n·Σr² − (Σr)² ≤ 1e-12·n²` ya da n < 2) a = 0, b = dahil piksellerde ekranın ortalaması.
     */
    private fun eslestir(ekran: DoubleArray, referans: DoubleArray, dahil: BooleanArray?): Pair<Double, Double> {
        var n = 0.0
        var sr = 0.0
        var se = 0.0
        var srr = 0.0
        var sre = 0.0
        for (i in ekran.indices) {
            if (dahil != null && !dahil[i]) continue
            val r = referans[i]
            val e = ekran[i]
            n += 1
            sr += r
            se += e
            srr += r * r
            sre += r * e
        }
        if (n == 0.0) return 0.0 to 0.0
        val varyans = n * srr - sr * sr
        if (n < 2 || varyans <= 1e-12 * n * n) return 0.0 to se / n
        val a = (n * sre - sr * se) / varyans
        return a to (se - a * sr) / n
    }

    /**
     * Satır başına değişmiş piksel oranı (dizi uzunluğu = satır sayısı). [ekran] ve [referans] aynı
     * boyutta, satır satır 0–1 parlaklık; [genislik] bir satırdaki piksel sayısı.
     */
    fun satirProfili(ekran: DoubleArray, referans: DoubleArray, genislik: Int): DoubleArray {
        require(genislik > 0 && ekran.size == referans.size && ekran.isNotEmpty() && ekran.size % genislik == 0) { "boyut" }
        val n = ekran.size
        val (a1, b1) = eslestir(ekran, referans, null)
        val artik = DoubleArray(n) { Math.abs(ekran[it] - (a1 * referans[it] + b1)) }
        // En büyük artıkların %20'si (saat, bildirim, simgeler) dışarıda: |artık|'a göre artan sırala
        // (eşitlikte küçük indeks önce; `sortedBy` kararlı), ilk n − floor(0,2·n) piksel kalır.
        // iOS ikiziyle AYNI kural (eşik değeriyle süzmek eşitlikte fazla piksel bırakırdı).
        val kalan = n - Math.floor(n * AYKIRI_ORANI).toInt()
        val dahil = BooleanArray(n)
        (0 until n).sortedBy { artik[it] }.take(kalan).forEach { dahil[it] = true }
        val (a, b) = eslestir(ekran, referans, dahil)
        val satirlar = n / genislik
        return DoubleArray(satirlar) { s ->
            var degisen = 0
            for (x in 0 until genislik) {
                val i = s * genislik + x
                if (Math.abs(ekran[i] - (a * referans[i] + b)) > DEGISIM_ESIGI) degisen++
            }
            degisen.toDouble() / genislik
        }
    }
}
