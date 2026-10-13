package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** NÖBETÇİ: dışa açık kısayol etkinliği başka uygulamalarca sessizce "kıldım" yazdıramaz. */
class KisayolKaynagiTest {
    private val k = KisayolKaynagi
    private val biz = "com.furkanisikay.namazakisi"

    @Test
    fun referrerPaketiCozulur() {
        assertEquals("com.sec.android.app.launcher", k.paketAdiCoz("android-app://com.sec.android.app.launcher"))
        assertEquals("com.google.android.apps.nexuslauncher", k.paketAdiCoz("android-app://com.google.android.apps.nexuslauncher/"))
        assertNull(k.paketAdiCoz(null))
        assertNull(k.paketAdiCoz("https://ornek.com"))
        assertNull(k.paketAdiCoz("android-app://"))
        assertNull(k.paketAdiCoz("android-app://gecersiz paket"))
    }

    @Test
    fun anaEkrandanDokunusOnaysizIsaretlenir() {
        assertTrue(k.onaysizMi("com.sec.android.app.launcher", referrerEkiVar = false, anaEkranUygulamasiMi = true, kendiPaketi = biz))
    }

    @Test
    fun otomasyonVeBilinmeyenBaslatanOnaySorar() {
        // Samsung Rutinler / Tasker / adb: ana ekran değil.
        assertFalse(k.onaysizMi("com.samsung.android.app.routines", false, false, biz))
        assertFalse(k.onaysizMi(null, false, false, biz))
    }

    @Test
    fun uydurulmusReferrerEkineGuvenilmez() {
        // Çağıran EXTRA_REFERRER ile kendini ana ekran gibi gösterebilir.
        assertFalse(k.onaysizMi("com.sec.android.app.launcher", referrerEkiVar = true, anaEkranUygulamasiMi = true, kendiPaketi = biz))
    }

    @Test
    fun kendiUygulamamizdanBaslatmaOnaysiz() {
        assertTrue(k.onaysizMi(biz, false, false, biz))
    }
}
