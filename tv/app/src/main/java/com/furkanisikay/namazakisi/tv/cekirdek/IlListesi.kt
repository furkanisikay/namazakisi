package com.furkanisikay.namazakisi.tv.cekirdek

import org.json.JSONArray

/** Telefonun manuel konum listesindeki bir il (`TURKIYE_ILLERI_OFFLINE`). */
/** `hesap`: telefondan gelen konumla birlikte gelen hesap yöntemi (null = Türkiye yolu). */
data class Il(val plaka: String, val ad: String, val lat: Double, val lng: Double, val hesap: TvHesap? = null)

/**
 * `assets/iller.json` çözücüsü. Dosya TEK KAYNAKTAN üretilir
 * (`scripts/tv/tv-verisi-uret.js` ← `TurkiyeKonumServisi.ts`); jest testi eşitliği kilitler.
 * TV'de konum donanımı yoktur → il elle seçilir. İlçe verisi repoda çevrimdışı YOK
 * (telefon ilçeleri turkiyeapi.dev'den çeker); pano il merkeziyle hesaplar.
 */
object IlListesi {
    fun coz(json: String): List<Il> {
        val dizi = JSONArray(json)
        return (0 until dizi.length()).map { i ->
            val o = dizi.getJSONObject(i)
            Il(
                plaka = o.getString("plaka"),
                ad = o.getString("ad"),
                lat = o.getDouble("lat"),
                lng = o.getDouble("lng"),
            )
        }
    }

    fun bul(iller: List<Il>, plaka: String?): Il? =
        if (plaka == null) null else iller.firstOrNull { it.plaka == plaka }
}
