package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/** NÖBETÇİ: başlatan paketin kimliği yalnız sistemin referrer biçiminden çözülür (karar: KildimGuvenKurallariTest). */
class KisayolKaynagiTest {
    private val k = KisayolKaynagi

    @Test
    fun referrerPaketiCozulur() {
        assertEquals("com.sec.android.app.launcher", k.paketAdiCoz("android-app://com.sec.android.app.launcher"))
        assertEquals("com.google.android.apps.nexuslauncher", k.paketAdiCoz("android-app://com.google.android.apps.nexuslauncher/"))
        assertNull(k.paketAdiCoz(null))
        assertNull(k.paketAdiCoz("https://ornek.com"))
        assertNull(k.paketAdiCoz("android-app://"))
        assertNull(k.paketAdiCoz("android-app://gecersiz paket"))
    }
}
