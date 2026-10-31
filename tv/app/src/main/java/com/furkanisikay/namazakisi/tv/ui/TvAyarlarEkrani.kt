package com.furkanisikay.namazakisi.tv.ui

import com.furkanisikay.namazakisi.tv.R
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.platform.LocalContext
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.BasicText
import androidx.compose.foundation.text.TextAutoSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Text
import com.furkanisikay.namazakisi.tv.veri.UyeDeposu

/**
 * TV ayarları: telefon ekleme, konum ve eşleşik telefonlar. Bir telefonu kaldırmak onun
 * anahtarını TV'den siler; telefon bir sonraki gönderiminde reddedilir ve "yeniden eşleştirin"
 * der. Kumandadan "Kıldım" YOKTUR (başkası adına ibadet beyanı olur — tasarım §2).
 */
@Composable
fun TvAyarlarEkrani(
    uyeler: List<UyeDeposu.UyeOzeti>,
    konumAdi: String?,
    onTelefonEkle: () -> Unit,
    onKodla: () -> Unit,
    onIlSec: () -> Unit,
    onKaldir: (String) -> Unit,
    onGeri: () -> Unit,
) {
    BackHandler(onBack = onGeri)
    var kaldirilacak by remember { mutableStateOf<UyeDeposu.UyeOzeti?>(null) }
    val ilkOdak = remember { FocusRequester() }
    LaunchedEffect(Unit) {
        try {
            ilkOdak.requestFocus()
        } catch (_: IllegalStateException) {
        }
    }
    val simdi = System.currentTimeMillis()

    Box(Modifier.fillMaxSize().background(Renkler.arkaplan)) {
        // 10-foot: iki dengeli sütun; sol eylemler, sağ bağlı telefonlar + ne gönderdikleri.
        // Dikey pay 32 dp (TV taşma güvenli alanı ~%5 = 27 dp); sağ sütun daha geniş: uzun dilde
        // (Amharca, Yoruba) başlık ve bilgi kartı satır kırdıkça kart ekranın altından kesiliyordu.
        Row(Modifier.fillMaxSize().padding(horizontal = 56.dp, vertical = 32.dp), horizontalArrangement = Arrangement.spacedBy(40.dp)) {
            Column(Modifier.weight(1f)) {
                // Başlık bloğu esner, düğmeler önce ölçülür (tam boy): uzun dilde üç düğme iki-üç
                // satıra çıkınca sonuncusu ekranın altından kesiliyordu (Tamilce, Malayalamca).
                YaziyiSigdir(Modifier.weight(1f, fill = false)) {
                    Column {
                        // Tek sözcüklük başlık TEK satır, sığmazsa küçülür: dar sütunda sözcüğün
                        // ortasından kırılıyordu ("அமைப்புக / ள்", "ക്രമീകരണ / ങ്ങൾ").
                        BasicText(
                            stringResource(R.string.ayarlar),
                            style = TextStyle(fontSize = 48.sp, fontWeight = FontWeight.SemiBold),
                            color = { Renkler.metin },
                            maxLines = 1,
                            autoSize = TextAutoSize.StepBased(minFontSize = 26.sp, maxFontSize = 48.sp, stepSize = 2.sp),
                        )
                        Spacer(Modifier.height(8.dp))
                        // Konum iki satıra kadar ("Kadıköy, İstanbul" Tamilce önekle kesiliyordu).
                        Text(
                            if (konumAdi != null) stringResource(R.string.ayar_konum, konumAdi) else stringResource(R.string.ayar_konum_yok),
                            color = Renkler.metinIkincil, fontSize = 26.sp, lineHeight = 34.sp,
                            maxLines = 2, overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
                Spacer(Modifier.height(32.dp))
                Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                    EslemeDugmesi(
                        stringResource(R.string.ayar_telefon_ekleyin),
                        onTelefonEkle,
                        Modifier.focusRequester(ilkOdak).fillMaxWidth(),
                        birincil = true,
                    )
                    EslemeDugmesi(stringResource(R.string.ayar_konumu_kodla), onKodla, Modifier.fillMaxWidth())
                    EslemeDugmesi(stringResource(R.string.ili_kendim_secin), onIlSec, Modifier.fillMaxWidth())
                }
            }
            Column(Modifier.weight(1.4f)) {
                Text(
                    stringResource(R.string.ayar_bagli_telefonlar),
                    color = Renkler.metin, fontSize = 32.sp, fontWeight = FontWeight.SemiBold,
                    maxLines = 2, overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(14.dp))
                if (uyeler.isEmpty()) {
                    Text(
                        stringResource(R.string.ayar_telefon_yok, stringResource(R.string.ayar_telefon_ekleyin)),
                        color = Renkler.metinIkincil, fontSize = 26.sp, lineHeight = 36.sp,
                    )
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        items(uyeler, key = { it.uye }) { u ->
                            // Ad TAM genişlikte (düğmenin yanında "Ahmet'i…" diye kesiliyordu); durum + "Kaldırın"
                            // ikinci satırda — kart alçak kalır, altındaki bilgi kartı sığar.
                            Column(Modifier.fillMaxWidth().background(Renkler.kart, RoundedCornerShape(28.dp)).padding(horizontal = 28.dp, vertical = 20.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(Modifier.size(56.dp).background(Renkler.birincil.copy(alpha = 0.16f), CircleShape), contentAlignment = Alignment.Center) {
                                        TelefonSimgesi(Renkler.birincil, Modifier.size(32.dp))
                                    }
                                    Spacer(Modifier.width(20.dp))
                                    Text(u.ad, color = Renkler.metin, fontSize = 30.sp, fontWeight = FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                }
                                Spacer(Modifier.height(8.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        sonHaberMetni(u.sonHaberMs, simdi).yerelRakam(),
                                        color = Renkler.metinIkincil, fontSize = 24.sp, maxLines = 1, overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.weight(1f).padding(start = 76.dp, end = 12.dp),
                                    )
                                    EslemeDugmesi(stringResource(R.string.kaldirin), { kaldirilacak = u })
                                }
                            }
                        }
                    }
                }
                // İkincil bilgi: kalan yüksekliğe TAMAMI sığarsa çizilir, sığmazsa hiç çizilmez
                // (yarım kesik madde bozuk görünüyordu). Önce başlık ve telefonlar ölçülür.
                SigarsaCiz(Modifier.weight(1f, fill = false)) {
                    Column(Modifier.padding(top = 12.dp)) { GonderilenlerKarti() }
                }
            }
        }

        kaldirilacak?.let { u ->
            KaldirOnayi(u.ad, onEvet = {
                onKaldir(u.uye)
                kaldirilacak = null
            }, onHayir = { kaldirilacak = null })
        }
    }
}

/**
 * Telefonlar bu TV'ye ne gönderir: üç kısa madde (güven: veri evden çıkmaz).
 *
 * Ölçü uzun dile göre (2026-10-30 kare ölçümü, 1080p = 2 px/dp): 22 sp'de ~10,5 dp/harf ve
 * 388 dp metin genişliğinde Somalice/Svahili maddeler (38–45 harf) ikişer satır oluyor, kart
 * üyeler ekranında kalan ~222 dp'ye sığmıyordu (ff/ha ~15 dp, so/sw ~60 dp eksik) ve
 * [SigarsaCiz] onu hiç çizmiyordu. 20 sp (~9,6 dp/harf) + 22 dp yan boşlukla metin ~403 dp
 * (≈42 harf): so/ff tek satır, sw/ha birer madde iki satır; 5 satırlık kart ≈ 217 dp.
 */
@Composable
private fun GonderilenlerKarti() {
    Column(
        Modifier.fillMaxWidth().border(1.dp, Renkler.sinir, RoundedCornerShape(28.dp)).padding(horizontal = 22.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Text(stringResource(R.string.ayar_ne_gonderir), color = Renkler.metin, fontSize = 22.sp, fontWeight = FontWeight.SemiBold)
        Madde(stringResource(R.string.ayar_madde_konum))
        Madde(stringResource(R.string.ayar_madde_namazlar))
        Madde(stringResource(R.string.ayar_madde_sifreli))
    }
}

@Composable
private fun Madde(metin: String) {
    Row(verticalAlignment = Alignment.Top) {
        Box(Modifier.padding(top = 8.dp).size(10.dp).background(Renkler.birincil, CircleShape))
        Spacer(Modifier.width(14.dp))
        Text(metin, color = Renkler.metinIkincil, fontSize = 20.sp, lineHeight = 26.sp)
    }
}

/**
 * İçeriği ancak verilen yüksekliğe TAMAMI sığarsa yerleştirir; sığmazsa yer kaplamaz.
 * Ekranın sonundaki ikincil bilgi için (yarım kesik metin yerine hiç yok).
 */
@Composable
private fun SigarsaCiz(modifier: Modifier = Modifier, icerik: @Composable () -> Unit) {
    Layout(icerik, modifier) { olculenler, kisit ->
        val yerlesimler = olculenler.map { it.measure(kisit.copy(minHeight = 0, maxHeight = Constraints.Infinity)) }
        val boy = yerlesimler.sumOf { it.height }
        if (boy > kisit.maxHeight) {
            layout(0, 0) {}
        } else {
            layout(yerlesimler.maxOfOrNull { it.width } ?: 0, boy) {
                var y = 0
                yerlesimler.forEach { it.place(0, y); y += it.height }
            }
        }
    }
}

/** "12 dk önce" (JS `cihaz.zaman` ile aynı karşılıklar); çoğul `plurals` kaynağından. */
@Composable
private fun sonHaberMetni(son: Long, simdi: Long): String {
    if (son <= 0) return stringResource(R.string.son_haber_yok)
    val k = LocalContext.current.resources
    val dk = (simdi - son) / 60_000
    return when {
        dk < 1 -> stringResource(R.string.son_haber_az_once)
        dk < 60 -> dk.toInt().let { k.getQuantityString(R.plurals.son_haber_dk, it, it) }
        dk < 24 * 60 -> (dk / 60).toInt().let { k.getQuantityString(R.plurals.son_haber_saat, it, it) }
        else -> (dk / (24 * 60)).toInt().let { k.getQuantityString(R.plurals.son_haber_gun, it, it) }
    }
}

@Composable
private fun KaldirOnayi(ad: String, onEvet: () -> Unit, onHayir: () -> Unit) {
    BackHandler(onBack = onHayir)
    val odak = remember { FocusRequester() }
    LaunchedEffect(Unit) {
        try {
            odak.requestFocus()
        } catch (_: IllegalStateException) {
        }
    }
    PencereKarti {
        YaziyiSigdir(Modifier.weight(1f, fill = false), enKucukOlcek = 0.6f) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    stringResource(R.string.kaldir_soru, ad),
                    color = Renkler.metin, fontSize = 40.sp, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    stringResource(R.string.kaldir_aciklama),
                    color = Renkler.metinIkincil, fontSize = 26.sp, lineHeight = 36.sp,
                )
            }
        }
        Spacer(Modifier.height(36.dp))
        PencereDugmeleri {
            EslemeDugmesi(stringResource(R.string.vazgecin), onHayir, Modifier.focusRequester(odak), buyuk = true)
            EslemeDugmesi(stringResource(R.string.kaldirin), onEvet, buyuk = true)
        }
    }
}
