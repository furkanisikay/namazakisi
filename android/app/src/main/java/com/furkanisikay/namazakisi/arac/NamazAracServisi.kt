package com.furkanisikay.namazakisi.arac

import android.content.Intent
import android.content.pm.ApplicationInfo
import androidx.car.app.CarAppService
import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.car.app.validation.HostValidator

/**
 * Android Auto girişi (Car App Library, kategori `androidx.car.app.category.POI`).
 *
 * Ekran yalnız GÖSTERİR: vakit (widget yükü) + yakındaki camiler (paketli OSM verisi);
 * camiye dokunmak navigasyon uygulamasını açar. Araçta kayıt yazan bir eylem YOKTUR
 * (bkz. `cekirdek/AracKarari` ve docs/ajan/arac-destegi.md).
 *
 * Servis `exported="true"` ve izinsizdir (kütüphane sözleşmesi); hangi hostun
 * bağlanacağını [createHostValidator] belirler: debug derlemede her host (Desktop Head
 * Unit testi için), release'te yalnız kütüphanenin onaylı host listesi (Android Auto,
 * Android Automotive OS ana bilgisayarları).
 */
class NamazAracServisi : CarAppService() {

    override fun createHostValidator(): HostValidator =
        if ((applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            HostValidator.ALLOW_ALL_HOSTS_VALIDATOR
        } else {
            HostValidator.Builder(applicationContext)
                .addAllowedHosts(androidx.car.app.R.array.hosts_allowlist_sample)
                .build()
        }

    override fun onCreateSession(): Session = object : Session() {
        override fun onCreateScreen(intent: Intent): Screen = YakinCamilerEkrani(carContext)
    }
}
