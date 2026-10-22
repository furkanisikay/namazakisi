package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

/** NÖBETÇİ: bildirim "Kıldım" teşekkürü — vakit önde, dua sabit, yasaklı ifade yok. */
class KildimOnayMetniTest {
    @Test
    fun baslikVaktiOneAlirVeDuayiTasir() {
        assertEquals("Sabah · Allah kabul etsin", KildimOnayMetni.baslik("imsak"))
        assertEquals("İkindi · Allah kabul etsin", KildimOnayMetni.baslik("ikindi"))
        assertEquals("Yatsı namazınız kılındı olarak işaretlendi.", KildimOnayMetni.govde("yatsi"))
        assertEquals("Namaz · Allah kabul etsin", KildimOnayMetni.baslik("bilinmeyen"))
    }

    @Test
    fun yasakliIfadeYok() {
        listOf("imsak", "ogle", "ikindi", "aksam", "yatsi").forEach { v ->
            val m = (KildimOnayMetni.baslik(v) + " " + KildimOnayMetni.govde(v)).lowercase()
            listOf("secde", "terk", "küfür", "tebrik", "!").forEach { assertFalse(m, m.contains(it)) }
        }
    }
}
