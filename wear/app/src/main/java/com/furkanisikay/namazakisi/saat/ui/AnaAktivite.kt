package com.furkanisikay.namazakisi.saat.ui

import android.Manifest
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.furkanisikay.namazakisi.saat.hatirlatma.Hatirlatici
import com.furkanisikay.namazakisi.saat.hatirlatma.MuhafizBildirimci
import com.furkanisikay.namazakisi.saat.veri.Senkron
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate

/** Saat uygulamasının tek ekranı: bugünün vakitleri + sıradaki vakit + "Kıldım". */
class AnaAktivite : ComponentActivity() {
    /** Bildirim izni (Wear OS 4+'ta kurulumda kapalı gelir) — yoksa ekranda kibar uyarı. */
    private var bildirimIzni by mutableStateOf(true)

    private fun izniYenile() {
        bildirimIzni = MuhafizBildirimci.bildirimIzniVar(this)
        // İzin değişince köprü dışlaması da değişir (izin yoksa telefonun bildirimi kalmalı).
        Hatirlatici.tazele(this)
    }

    override fun onResume() {
        super.onResume()
        izniYenile()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val depo = YukDeposu(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            // Sonuç `onResume`'da okunur (izin penceresi aktiviteyi duraklatır). ActivityResult
            // API'si kullanılmadı: bağımlılık ağacındaki eski fragment sürümü lint hatası verir.
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), IZIN_ISTEGI)
        }
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
                bildirimIzni = bildirimIzni,
                simdi = simdi,
                bugun = LocalDate.now().toString(),
                onKildim = { tarih, vakit ->
                    kapsam.launch { Senkron.kildimGonder(this@AnaAktivite, tarih, vakit) }
                },
            )
        }
    }

    private companion object {
        const val IZIN_ISTEGI = 280
    }
}
