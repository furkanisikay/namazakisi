package com.furkanisikay.namazakisi.saat.ui

import android.content.SharedPreferences
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.furkanisikay.namazakisi.saat.veri.Senkron
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate

/** Saat uygulamasının tek ekranı: bugünün vakitleri + sıradaki vakit + "Kıldım". */
class AnaAktivite : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val depo = YukDeposu(this)
        setContent {
            var surum by remember { mutableIntStateOf(0) }
            var simdi by remember { mutableLongStateOf(System.currentTimeMillis()) }
            val kapsam = rememberCoroutineScope()

            // Depo değişince (telefondan yük / saatte işaret) yeniden çiz.
            DisposableEffect(Unit) {
                val dinleyici = SharedPreferences.OnSharedPreferenceChangeListener { _, _ -> surum++ }
                depo.dinle(dinleyici)
                onDispose { depo.birak(dinleyici) }
            }
            // Geri sayım dakikalık; saniyelik çizim saatte pil israfıdır.
            LaunchedEffect(Unit) {
                Senkron.sonYukuCek(this@AnaAktivite)
                while (true) {
                    simdi = System.currentTimeMillis()
                    delay(30_000L)
                }
            }

            // `surum` değişince depo yeniden okunur (her saniye değil — yalnız veri değişince).
            val yuk = remember(surum) { depo.yuk() }
            val bekleyen = remember(surum) { depo.bekleyenler() }
            val guncellemeGerekli = remember(surum) { depo.guncellemeGerekli }
            AnaEkran(
                yuk = yuk,
                bekleyen = bekleyen,
                guncellemeGerekli = guncellemeGerekli,
                simdi = simdi,
                bugun = LocalDate.now().toString(),
                onKildim = { tarih, vakit ->
                    kapsam.launch { Senkron.kildimGonder(this@AnaAktivite, tarih, vakit) }
                },
            )
        }
    }
}
