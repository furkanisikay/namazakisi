package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.TransformingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberTransformingLazyColumnState
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TimeText
import androidx.wear.compose.material3.lazy.rememberTransformationSpec
import androidx.wear.compose.material3.lazy.transformedHeight
import com.furkanisikay.namazakisi.saat.cekirdek.AnaEkranKarari
import com.furkanisikay.namazakisi.saat.cekirdek.KalanSure
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk

/**
 * Ana ekran (yeniden tasarım W1): ilk öğe TAM EKRAN vakit yayı + sayaç; aşağı kaydırınca
 * günün vakitleri, en altta konum adı ve tesbihat girişi.
 *
 * Ekran metinleri arayüz dilidir: kibar "siz" (AGENTS.md). Dokunma hedefleri ≥48 dp
 * (CompactButton görünürde 32 dp, dokunma payıyla 48 dp). Taç: `TransformingLazyColumn`'ın
 * varsayılan `rotaryScrollableBehavior`'ı.
 *
 * @param saniyeGoster etkileşimli + ön planda ve ekran görüntüsü kipinde DEĞİLKEN true
 */
@Composable
fun AnaEkran(
    yuk: Yuk?,
    bekleyen: Set<String>,
    guncellemeGerekli: Boolean,
    bildirimIzni: Boolean,
    simdi: Long,
    bugun: String,
    saniyeGoster: Boolean,
    onKildim: (tarih: String, vakit: String) -> Unit,
    onTesbihat: () -> Unit,
) {
    val liste = rememberTransformingLazyColumnState()
    val donusum = rememberTransformationSpec()
    var onay by remember { mutableStateOf<VakitHesabi.Satir?>(null) }
    val ekran = LocalConfiguration.current
    val yanBosluk = (ekran.screenWidthDp * 0.08f).dp

    val gorunum = yuk?.let { AnaEkranKarari.kur(it, simdi, bugun, bekleyen) }
    val satirlar = yuk?.let { VakitHesabi.satirlar(it, simdi, bugun, bekleyen) } ?: emptyList()
    val sayilan = gorunum?.sayilan

    SaatTemasi {
        AppScaffold(timeText = { TimeText() }) {
            ScreenScaffold(scrollState = liste, contentPadding = PaddingValues(bottom = 36.dp)) { icBosluk ->
                TransformingLazyColumn(
                    state = liste,
                    contentPadding = icBosluk,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    // Tam ekran ilk öğe: kenar dönüşümü UYGULANMAZ (sayaç kaydırılırken küçülmesin).
                    item(key = "sayac") {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.fillMaxWidth().height(ekran.screenHeightDp.dp),
                        ) {
                            when {
                                gorunum != null -> VakitSayaci(
                                    g = gorunum,
                                    saniyeGoster = saniyeGoster,
                                    onKildim = { onay = gorunum.satir },
                                    modifier = Modifier.fillMaxWidth().height(ekran.screenHeightDp.dp),
                                )
                                yuk == null && guncellemeGerekli -> BilgiMetni(GUNCELLEME_METNI, Modifier.padding(horizontal = 16.dp))
                                yuk == null -> BilgiMetni(
                                    "Vakitleri görmek için telefonunuzda Namaz Akışı'nı açın.",
                                    Modifier.padding(horizontal = 16.dp),
                                )
                                // Yük tükendi (telefon günlerce veri göndermedi).
                                else -> BilgiMetni(
                                    "Vakit bilgisi eskidi. Yenilemek için telefonunuzda Namaz Akışı'nı açın.",
                                    Modifier.padding(horizontal = 16.dp),
                                )
                            }
                        }
                    }
                    if (yuk != null && guncellemeGerekli) {
                        item(key = "guncelleme") { BilgiMetni(GUNCELLEME_METNI) }
                    }
                    if (yuk != null && !bildirimIzni) {
                        item(key = "izin") {
                            BilgiMetni("Telefonunuz yanınızda değilken de hatırlatma almak için saatin ayarlarından Namaz Akışı bildirimlerine izin verin.")
                        }
                    }
                    items(satirlar, key = { "${it.tarih}_${it.vakit}" }) { satir ->
                        val aktif = sayilan?.mod == KalanSure.Mod.CIKIS &&
                            sayilan.tarih == satir.tarih && sayilan.vakit == satir.vakit
                        VakitSatiri(
                            satir = satir,
                            aktif = aktif,
                            kalanMetni = if (aktif) VakitHesabi.kalanMetni(sayilan.kalanMs(simdi)) else null,
                            onSec = { onay = satir },
                            modifier = Modifier
                                .padding(horizontal = yanBosluk)
                                .transformedHeight(this, donusum)
                                .graphicsLayer { with(donusum) { applyContainerTransformation(scrollProgress) } },
                        )
                    }
                    if (yuk != null) {
                        item(key = "konum") { BilgiMetni(yuk.konumAdi, Modifier.padding(top = 6.dp)) }
                    }
                    // Tesbihat telefon verisine bağlı değildir: yük yokken de açılır.
                    item(key = "tesbihat") {
                        CompactButton(
                            onClick = onTesbihat,
                            colors = ButtonDefaults.filledTonalButtonColors(),
                            modifier = Modifier.semantics { contentDescription = "Tesbihat sayacını açın" },
                            label = { Text("Tesbihat") },
                        )
                    }
                }
            }

            val secili = onay
            if (secili != null && yuk != null) {
                val anaVakit = sayilan?.mod == KalanSure.Mod.CIKIS &&
                    sayilan.tarih == secili.tarih && sayilan.vakit == secili.vakit
                KildimOnayi(
                    ad = secili.ad,
                    vakitRengi = SaatPaleti.vakitRengi(secili.vakit),
                    kalanOran = if (anaVakit) gorunum.kalanOran else 0f,
                    kerahat = VakitHesabi.kerahatMi(yuk, simdi),
                    onOnayla = {
                        // Karar dokunuş anında YENİDEN doğrulanır: arada telefon işaretlediyse
                        // ya da vakit değiştiyse yazılmaz.
                        val anlik = System.currentTimeMillis()
                        val hala = VakitHesabi.satirlar(yuk, anlik, bugun, bekleyen)
                            .any { it.tarih == secili.tarih && it.vakit == secili.vakit && it.isaretlenebilir }
                        if (hala) onKildim(secili.tarih, secili.vakit)
                    },
                    onKapat = { onay = null },
                )
            }
        }
    }
}

/**
 * Telefon saatin tanımadığı DAHA YENİ bir şema gönderdi → güncellenmesi gereken SAAT
 * uygulamasıdır (eski metin telefonu işaret ediyordu).
 */
private const val GUNCELLEME_METNI = "Saatinizdeki Namaz Akışı'nı güncelleyin."
