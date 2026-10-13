package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * `MuhafizAlarmKurallari` — gerçek alarm (issue #74). Yük sözleşmesi JS
 * `core/muhafiz/alarmYuku.ts` ile AYNI örnek dosyadan doğrulanır
 * (`src/test/resources/muhafiz-alarm-ornekleri.json`).
 */
class MuhafizAlarmKurallariTest {

    private val ornek: JSONObject = JSONObject(
        requireNotNull(javaClass.classLoader?.getResource("muhafiz-alarm-ornekleri.json")) { "ornek dosya yok" }.readText()
    )

    @Test
    fun jsYukunuCozer() {
        val yuk = MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("yuk").toString())
        assertNotNull(yuk)
        yuk!!
        assertEquals("muhafiz_2026-10-13_vakit_imsak_seviye_1_dk_88", yuk.kimlik)
        assertEquals("imsak", yuk.vakit)
        assertEquals("2026-10-13", yuk.tarih)
        assertEquals("Sabah", yuk.vakitAdi)
        assertEquals(1791000000000L, yuk.tetikMs)
        assertEquals(1791005280000L, yuk.cikisMs)
        assertEquals(1791005100000L, yuk.erteleSinirMs)
        assertEquals("namaz_alarm_8e1cdbd8", yuk.alarmKanalId)
        assertEquals("content://media/external/audio/media/12", yuk.sesUri)
        assertEquals("muhafiz_1234abcd", yuk.kanalId)
        assertEquals("muhafiz", yuk.veri.getString("tip"))
    }

    @Test
    fun sozlesmeDisiYukReddedilir() {
        val dogru = ornek.getJSONObject("yuk")
        assertNull(MuhafizAlarmKurallari.yukCoz(null))
        assertNull(MuhafizAlarmKurallari.yukCoz("{bozuk"))
        assertNull(MuhafizAlarmKurallari.yukCoz(JSONObject(dogru.toString()).put("surum", 2).toString()))
        // Muhafız kimliği değilse (Kıldım/iptal öneki bulamazdı) çalmaz.
        assertNull(MuhafizAlarmKurallari.yukCoz(JSONObject(dogru.toString()).put("kimlik", "nafile_x").toString()))
        // Alarm kanal uzayı dışındaki kanal (ör. muhafız GC'sinin sildiği) reddedilir.
        assertNull(MuhafizAlarmKurallari.yukCoz(JSONObject(dogru.toString()).put("alarmKanalId", "muhafiz_alarm").toString()))
    }

    @Test
    fun yalnizContentSesiKabulEdilir() {
        val yuk = JSONObject(ornek.getJSONObject("yuk").toString()).put("sesUri", "file:///sdcard/x.mp3")
        assertNull(MuhafizAlarmKurallari.yukCoz(yuk.toString())!!.sesUri)
        val bos = JSONObject(ornek.getJSONObject("yuk").toString()).put("sesUri", JSONObject.NULL)
        assertNull(MuhafizAlarmKurallari.yukCoz(bos.toString())!!.sesUri)
    }

    @Test
    fun kanalKimlikleriAlarmUzayinda() {
        val d = ornek.getJSONArray("kanallar")
        for (i in 0 until d.length()) {
            assertTrue(MuhafizAlarmKurallari.alarmKanaliMi(d.getJSONObject(i).getString("beklenen")))
        }
        // Muhafız kanal uzayı (GC'nin sildiği `muhafiz_*`) ALARM UZAYI DEĞİL.
        assertFalse(MuhafizAlarmKurallari.alarmKanaliMi("muhafiz"))
        assertFalse(MuhafizAlarmKurallari.alarmKanaliMi("muhafiz_alarm"))
        assertFalse(MuhafizAlarmKurallari.KANAL_TABANI.startsWith("muhafiz_"))
    }

    @Test
    fun tetikKarariOrnekleri() {
        val d = ornek.getJSONArray("kararlar")
        assertTrue(d.length() >= 6)
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            assertEquals(
                o.getString("ad"),
                o.getString("beklenen"),
                MuhafizAlarmKurallari.tetikKarari(
                    o.getLong("tetikMs"),
                    o.getLong("simdiMs"),
                    o.getLong("cikisMs"),
                    o.getLong("camiSessizBitisMs"),
                ).name,
            )
        }
    }

    @Test
    fun ertelemeDugmesiBildirimErtelemesiyleAyni() {
        val d = ornek.getJSONArray("erteleme")
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            assertEquals(
                o.getString("ad"),
                o.getBoolean("beklenen"),
                MuhafizAlarmKurallari.ertelemeDugmesiVarMi(o.getLong("simdiMs"), o.getLong("sinirMs")),
            )
        }
    }

    @Test
    fun calmaSuresiIkiDakika() {
        assertFalse(MuhafizAlarmKurallari.calmaBittiMi(0L, 119_999L))
        assertTrue(MuhafizAlarmKurallari.calmaBittiMi(0L, 120_000L))
    }

    @Test
    fun yenidenKurulumGecmisleriAtarSiralar() {
        val sonuc = MuhafizAlarmKurallari.yenidenKurulacaklar(mapOf("c" to 300L, "a" to 100L, "b" to 200L, "eski" to 50L), 100L)
        assertEquals(listOf("b", "c"), sonuc)
    }
}
