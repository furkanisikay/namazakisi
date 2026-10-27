package com.furkanisikay.namazakisi.kildim

import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import com.furkanisikay.namazakisi.arayuzDili
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.cekirdek.KutuDurumu
import com.furkanisikay.namazakisi.cekirdek.KutuGorunumKarari
import com.furkanisikay.namazakisi.cekirdek.saatMetni
import com.furkanisikay.namazakisi.rakamSifiri
import com.furkanisikay.namazakisi.rakamla
import com.furkanisikay.namazakisi.widget.WidgetVeriDeposu

/**
 * Hızlı ayarlar kutusu: "Şu anki vakti kıldım" (issue #276).
 *
 * - İçinde bulunulan vakti gösterir; dokununca KİLDİM (ortak kuyruk → JS, bildirimdeki
 *   "Kıldım" ile aynı gövde). Kılındıysa AKTİF. Yalnız işaretler; geri alma uygulamada.
 * - Güneş→öğle arası: sıradaki vakit + girişi gösterilir, kutu KULLANILAMAZ (dokunulmaz).
 * - Uzun basış: sistem `QS_TILE_PREFERENCES` filtresi olan etkinliği açar (MainActivity).
 *
 * Kutu "dinleme" modundadır (ACTIVE_TILE değil): panel açılınca `onStartListening`
 * gelir; veri değişince `WidgetGuncelleyici` `requestListeningState` ile tazeler.
 * Görünüm kararları SAF `KutuGorunumKarari`'ndadır (JVM testli).
 */
class KildimKutusuServisi : TileService() {

    override fun onStartListening() {
        super.onStartListening()
        ciz()
    }

    override fun onClick() {
        super.onClick()
        // Bound kutu servisi ön plan sayılır → headless görev başlatılabilir.
        KildimIslemleri.simdikiVaktiKuyrugaAl(this, KildimKuyruguKurallari.KAYNAK_KUTU)
        ciz()
    }

    private fun ciz() {
        val kutu = qsTile ?: return
        val a = WidgetVeriDeposu.anlik(this)
        // Metin UYGULAMANIN arayüz dilinde (dil değişince `ArayuzDiliIzleyici` kutuyu tazeler).
        val g = KutuGorunumKarari.hesapla(a.durum, a.kildim, { saatMetni(it) }, arayuzDili())
        // Görünen metin seçilen rakamla ("Giriş 12:58" → Arapçada ١٢:٥٨); açıklama aynen.
        val sifir = rakamSifiri()
        kutu.label = g.etiket.rakamla(sifir)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) kutu.subtitle = g.altEtiket.rakamla(sifir)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) kutu.stateDescription = g.altEtiket
        kutu.contentDescription = g.aciklama
        kutu.state = when (g.durum) {
            KutuDurumu.AKTIF -> Tile.STATE_ACTIVE
            KutuDurumu.PASIF -> Tile.STATE_INACTIVE
            KutuDurumu.KULLANILAMAZ -> Tile.STATE_UNAVAILABLE
        }
        kutu.updateTile()
    }
}
