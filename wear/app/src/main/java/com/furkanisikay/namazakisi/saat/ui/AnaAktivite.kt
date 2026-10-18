package com.furkanisikay.namazakisi.saat.ui

import android.Manifest
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.wear.ambient.AmbientLifecycleObserver
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.furkanisikay.namazakisi.saat.BuildConfig
import android.view.KeyEvent
import com.furkanisikay.namazakisi.saat.cekirdek.AnaEkranKarari
import com.furkanisikay.namazakisi.saat.cekirdek.BilekJesti
import com.furkanisikay.namazakisi.saat.telefon.TelefondaAc
import com.furkanisikay.namazakisi.saat.telefon.CamiDurumDeposu
import com.furkanisikay.namazakisi.saat.telefon.TelefonIstemcisi
import com.furkanisikay.namazakisi.saat.cekirdek.TelefonKomutu
import com.furkanisikay.namazakisi.saat.cekirdek.AnonsYerleri
import com.furkanisikay.namazakisi.saat.hatirlatma.SaatAnonsu
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.hatirlatma.Hatirlatici
import com.furkanisikay.namazakisi.saat.hatirlatma.MuhafizBildirimci
import com.furkanisikay.namazakisi.saat.veri.Senkron
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate

/**
 * Saat uygulamasının ana ekranı: vakit yayı + sayaç + "Kıldım" + günün vakitleri.
 *
 * Zaman (`simdi`) üç kaynaktan ilerler, hepsi açıkça duruma bağlı:
 *  - Etkileşimli + ön planda (RESUMED): saniye sınırına hizalı döngü.
 *  - Ambient: `onUpdateAmbient` (≈ dakikada bir) — döngü KOŞMAZ.
 *  - Duraklatılmış: hiçbir döngü koşmaz (ekran görünmüyor).
 * Ekranı açık tutmaz (`FLAG_KEEP_SCREEN_ON` YOK); ambient tesbihattaki desenle.
 */
class AnaAktivite : ComponentActivity() {
    /** Bildirim izni (Wear OS 4+'ta kurulumda kapalı gelir) — yoksa ekranda kibar uyarı. */
    private var bildirimIzni by mutableStateOf(true)
    private var onPlanda by mutableStateOf(false)
    private var ambient by mutableStateOf<AmbientDurumu?>(null)
    private var simdi by mutableLongStateOf(System.currentTimeMillis())
    /** Bilek jesti isteği (saat W3, fikir 7) — `sira` 0 iken hiçbir şey yapılmaz. */
    private var jest by mutableStateOf(BilekJesti.Istek(0, 0))

    /**
     * Ekran görüntüsü hattı (`scripts/saat-kare-hatti.sh`) `uiautomator dump` ile dolaşır;
     * dump ekran ~1 sn boşta kalmazsa BOŞ döner → saniyelik sayaç hattı kırardı. YALNIZ
     * debug derlemede bu ekstra saniye döngüsünü dondurur (dakikalık tazeleme sürer).
     */
    private val ekranGoruntusuKipi: Boolean
        get() = BuildConfig.DEBUG && intent?.getBooleanExtra(EKRAN_GORUNTUSU, false) == true

    private val ambientGeriCagrisi = object : AmbientLifecycleObserver.AmbientLifecycleCallback {
        override fun onEnterAmbient(ambientDetails: AmbientLifecycleObserver.AmbientDetails) {
            simdi = System.currentTimeMillis()
            ambient = AmbientDurumu(
                burnInKorumasi = ambientDetails.burnInProtectionRequired,
                dusukBit = ambientDetails.deviceHasLowBitAmbient,
                adim = 0,
            )
        }

        // ≈ dakikada bir: sayaç dakikası + burn-in kaydırması ilerler.
        override fun onUpdateAmbient() {
            simdi = System.currentTimeMillis()
            ambient = ambient?.let { it.copy(adim = it.adim + 1) }
        }

        override fun onExitAmbient() {
            ambient = null
            simdi = System.currentTimeMillis()
        }
    }

    private fun izniYenile() {
        bildirimIzni = MuhafizBildirimci.bildirimIzniVar(this)
        // İzin değişince köprü dışlaması da değişir (izin yoksa telefonun bildirimi kalmalı).
        Hatirlatici.tazele(this)
    }

    override fun onResume() {
        super.onResume()
        onPlanda = true
        simdi = System.currentTimeMillis()
        izniYenile()
    }

    /** Bilek bükme → vakit listesinde sonraki/önceki öğe (ambient'te liste yok). */
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        val yon = BilekJesti.yon(keyCode)
        if (yon == null || ambient != null) return super.onKeyDown(keyCode, event)
        jest = BilekJesti.Istek(yon, jest.sira + 1)
        return true
    }

    override fun onPause() {
        super.onPause()
        onPlanda = false
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val depo = YukDeposu(this)
        val camiDepo = CamiDurumDeposu(this)
        lifecycle.addObserver(AmbientLifecycleObserver(this, ambientGeriCagrisi))
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            // Sonuç `onResume`'da okunur (izin penceresi aktiviteyi duraklatır). ActivityResult
            // API'si kullanılmadı: bağımlılık ağacındaki eski fragment sürümü lint hatası verir.
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), IZIN_ISTEGI)
        }
        setContent {
            var surum by remember { mutableIntStateOf(0) }
            val kapsam = rememberCoroutineScope()

            // Depo değişince (telefondan yük / saatte işaret) yeniden çiz.
            DisposableEffect(Unit) {
                val dinleyici = SharedPreferences.OnSharedPreferenceChangeListener { _, _ -> surum++ }
                depo.dinle(dinleyici)
                onDispose { depo.birak(dinleyici) }
            }
            LaunchedEffect(Unit) { Senkron.sonYukuCek(this@AnaAktivite) }
            // Saniye döngüsü YALNIZ etkileşimli + ön planda; ambient'e girince ya da
            // duraklayınca anahtar değişir, döngü iptal olur (boşta sıfır iş).
            val saniyeli = ambient == null && onPlanda
            val dondur = ekranGoruntusuKipi
            LaunchedEffect(saniyeli, dondur) {
                if (!saniyeli) return@LaunchedEffect
                while (true) {
                    val an = System.currentTimeMillis()
                    simdi = an
                    delay(if (dondur) DONDURULMUS_ARALIK_MS else SANIYE_MS - an % SANIYE_MS)
                }
            }

            // Camideyim / Namaz modu gösterimi (saat W3): telefon yazınca ve yarım dakikada bir
            // (bitişler geçince gösterim kalksın) yeniden okunur.
            var camiSurum by remember { mutableIntStateOf(0) }
            DisposableEffect(Unit) {
                val dinleyici = SharedPreferences.OnSharedPreferenceChangeListener { _, _ -> camiSurum++ }
                camiDepo.dinle(dinleyici)
                onDispose { camiDepo.birak(dinleyici) }
            }
            val cami = remember(camiSurum, simdi / 30_000) { camiDepo.durum(simdi) }
            var istekSuruyor by remember { mutableStateOf(false) }

            // `surum` değişince depo yeniden okunur (her saniye değil — yalnız veri değişince).
            val yuk = remember(surum) { depo.yuk() }
            val bekleyen = remember(surum) { depo.bekleyenler() }
            val guncellemeGerekli = remember(surum) { depo.guncellemeGerekli }
            val bugun = LocalDate.now().toString()
            val ambientDurumu = ambient
            if (ambientDurumu != null) {
                // Etkileşimli ağaç ambient'te tümden çıkar; dönüşte yeniden kurulur.
                AnaAmbientEkrani(
                    g = yuk?.let { AnaEkranKarari.kur(it, simdi, bugun, bekleyen) },
                    bilgi = "Vakitleri görmek için telefonunuzda Namaz Akışı'nı açın.",
                    ambient = ambientDurumu,
                )
            } else {
                AnaEkran(
                    yuk = yuk,
                    bekleyen = bekleyen,
                    guncellemeGerekli = guncellemeGerekli,
                    bildirimIzni = bildirimIzni,
                    simdi = simdi,
                    bugun = bugun,
                    saniyeGoster = !dondur,
                    jest = jest,
                    onKildim = { tarih, vakit ->
                        kapsam.launch { Senkron.kildimGonder(this@AnaAktivite, tarih, vakit) }
                    },
                    onTesbihat = { startActivity(Intent(this@AnaAktivite, TesbihatAktivite::class.java)) },
                    onKible = { startActivity(Intent(this@AnaAktivite, KibleAktivite::class.java)) },
                    onTelefondaAc = { TelefondaAc.ac(this@AnaAktivite, it) },
                    cami = cami,
                    turkceSesYok = remember(surum) {
                        val yer = yuk?.anonsYeri
                        (yer == AnonsYerleri.OTOMATIK || yer == AnonsYerleri.SAAT) && SaatAnonsu.turkceYok(this@AnaAktivite)
                    },
                    istekSuruyor = istekSuruyor,
                    onNamazModu = {
                        if (!istekSuruyor) {
                            istekSuruyor = true
                            val acik = cami?.modBitisMs != null
                            val govde = if (acik) TelefonKomutu.namazModuKapat() else TelefonKomutu.namazModuAc(yuk, System.currentTimeMillis())
                            kapsam.launch {
                                val s = TelefonIstemcisi.gonder(this@AnaAktivite, TelefonKomutu.NAMAZ_MODU_YOLU, govde)
                                istekSuruyor = false
                                TelefondaAc.onay(
                                    this@AnaAktivite,
                                    s.sonuc == "acildi" || s.sonuc == "kapandi",
                                    TelefonKomutu.modMetni(s.sonuc, s.bitisMs?.let { VakitHesabi.saat(it) }),
                                )
                            }
                        }
                    },
                    onCamiCevap = { cevap, yerId ->
                        if (!istekSuruyor) {
                            istekSuruyor = true
                            kapsam.launch {
                                val s = TelefonIstemcisi.gonder(
                                    this@AnaAktivite,
                                    TelefonKomutu.CAMI_CEVAP_YOLU,
                                    TelefonKomutu.camiCevap(cevap, yerId),
                                )
                                istekSuruyor = false
                                TelefondaAc.onay(this@AnaAktivite, s.sonuc == "tamam", TelefonKomutu.camiMetni(cevap, s.sonuc))
                            }
                        }
                    },
                )
            }
        }
    }

    companion object {
        private const val IZIN_ISTEGI = 280
        private const val SANIYE_MS = 1_000L
        private const val DONDURULMUS_ARALIK_MS = 30_000L

        /** Yalnız debug derlemede okunur (bkz. `ekranGoruntusuKipi`); hat `--ez` ile verir. */
        const val EKRAN_GORUNTUSU = "ekran_goruntusu"
    }
}
