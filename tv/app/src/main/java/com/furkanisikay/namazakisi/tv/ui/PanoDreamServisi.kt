package com.furkanisikay.namazakisi.tv.ui

import android.service.dreams.DreamService
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import androidx.tv.material3.Text
import com.furkanisikay.namazakisi.tv.veri.KonumDeposu

/**
 * Ekran koruyucu (Daydream) — panonun etkileşimsiz hâli. İsteğe bağlıdır; kullanıcı
 * sistem ayarlarından seçer. Google TV'nin ÜÇÜNCÜ TARAF ekran koruyucuyu listeleyip
 * listelemediği cihazda DOĞRULANMADI (bazı Google TV sürümleri yalnız Ambient Mode
 * gösterir); klasik Android TV'de "Ekran koruyucu" listesinde görünür.
 *
 * DreamService bir LifecycleOwner DEĞİLDİR; ComposeView pencereye bağlanırken
 * ViewTree yaşam döngüsü + kayıtlı durum sahibi ister (yoksa çöker) → servis ikisini
 * de kendisi sağlar.
 */
class PanoDreamServisi : DreamService(), LifecycleOwner, SavedStateRegistryOwner {
    private val yasamDongusu = LifecycleRegistry(this)
    private val durumDenetcisi = SavedStateRegistryController.create(this)

    override val lifecycle: Lifecycle get() = yasamDongusu
    override val savedStateRegistry: SavedStateRegistry get() = durumDenetcisi.savedStateRegistry

    override fun onCreate() {
        super.onCreate()
        durumDenetcisi.performRestore(null)
        yasamDongusu.currentState = Lifecycle.State.CREATED
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        isInteractive = false
        isFullscreen = true
        isScreenBright = true

        val il = KonumDeposu(this).seciliIl()
        val gorunum = ComposeView(this).apply {
            setViewTreeLifecycleOwner(this@PanoDreamServisi)
            setViewTreeSavedStateRegistryOwner(this@PanoDreamServisi)
            setContent {
                PanoTemasi {
                    if (il != null) {
                        PanoEkrani(il = il, ekraniAcikTut = false, onKonumDegistir = null)
                    } else {
                        Box(
                            Modifier.fillMaxSize().background(Renkler.arkaplan).padding(48.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                "Vakit panosunu görmek için Namaz Akışı uygulamasını açıp ilinizi seçin.",
                                color = Renkler.metin,
                                fontSize = 28.sp,
                                textAlign = TextAlign.Center,
                            )
                        }
                    }
                }
            }
        }
        setContentView(gorunum)
    }

    override fun onDreamingStarted() {
        super.onDreamingStarted()
        yasamDongusu.currentState = Lifecycle.State.RESUMED
    }

    override fun onDreamingStopped() {
        yasamDongusu.currentState = Lifecycle.State.CREATED
        super.onDreamingStopped()
    }

    override fun onDestroy() {
        yasamDongusu.currentState = Lifecycle.State.DESTROYED
        super.onDestroy()
    }
}
