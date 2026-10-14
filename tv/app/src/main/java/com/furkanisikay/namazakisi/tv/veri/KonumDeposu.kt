package com.furkanisikay.namazakisi.tv.veri

import android.content.Context
import com.furkanisikay.namazakisi.tv.cekirdek.Il
import com.furkanisikay.namazakisi.tv.cekirdek.IlListesi

/**
 * Seçilen il (plaka) — TV'de TEK kalıcı ayar. SharedPreferences; yedeklemeye girmez
 * (`allowBackup=false`, telefonla aynı duruş). İl listesi `assets/iller.json`'dan
 * bir kez okunur.
 */
class KonumDeposu(context: Context) {
    private val baglam = context.applicationContext
    private val tercihler = baglam.getSharedPreferences(DOSYA, Context.MODE_PRIVATE)

    val iller: List<Il> by lazy {
        baglam.assets.open("iller.json").bufferedReader(Charsets.UTF_8).use { IlListesi.coz(it.readText()) }
    }

    fun seciliPlaka(): String? = tercihler.getString(ANAHTAR_PLAKA, null)

    fun seciliIl(): Il? = IlListesi.bul(iller, seciliPlaka())

    fun kaydet(plaka: String) {
        tercihler.edit().putString(ANAHTAR_PLAKA, plaka).apply()
    }

    private companion object {
        const val DOSYA = "namazakisi_tv"
        const val ANAHTAR_PLAKA = "il_plaka"
    }
}
