package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class BilekJestiTest {
    @Test
    fun tusYonuVeSinirlar() {
        assertEquals(1, BilekJesti.yon(BilekJesti.TUS_SONRAKI))
        assertEquals(-1, BilekJesti.yon(BilekJesti.TUS_ONCEKI))
        assertNull(BilekJesti.yon(4)) // KEYCODE_BACK jest değildir
        assertEquals(3, BilekJesti.hedef(2, 8, 1))
        assertEquals(1, BilekJesti.hedef(2, 8, -1))
        assertEquals(0, BilekJesti.hedef(0, 8, -1))
        assertEquals(7, BilekJesti.hedef(7, 8, 1))
        assertEquals(0, BilekJesti.hedef(0, 0, 1))
    }
}
