package com.furkanisikay.namazakisi.tv.ui

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
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
        Row(Modifier.fillMaxSize().padding(horizontal = 56.dp, vertical = 44.dp), horizontalArrangement = Arrangement.spacedBy(56.dp)) {
            Column(Modifier.weight(1f)) {
                Text("Ayarlar", color = Renkler.metin, fontSize = 48.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                Text(
                    if (konumAdi != null) "Konum: $konumAdi" else "Konum seçilmedi",
                    color = Renkler.metinIkincil, fontSize = 26.sp, maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(40.dp))
                Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                    EslemeDugmesi("Telefon ekleyin", onTelefonEkle, Modifier.focusRequester(ilkOdak).fillMaxWidth(), birincil = true)
                    EslemeDugmesi("Konumu kodla girin", onKodla, Modifier.fillMaxWidth())
                    EslemeDugmesi("İli kendim seçeyim", onIlSec, Modifier.fillMaxWidth())
                }
            }
            Column(Modifier.weight(1.25f)) {
                Text("Bu TV'ye bağlı telefonlar", color = Renkler.metin, fontSize = 32.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(20.dp))
                if (uyeler.isEmpty()) {
                    Text(
                        "Henüz telefon eklenmedi. Soldaki “Telefon ekleyin” ile ekranda çıkan kodu okutun.",
                        color = Renkler.metinIkincil, fontSize = 26.sp, lineHeight = 36.sp,
                    )
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        items(uyeler, key = { it.uye }) { u ->
                            Row(
                                Modifier.fillMaxWidth().background(Renkler.kart, RoundedCornerShape(28.dp)).padding(horizontal = 28.dp, vertical = 22.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Box(Modifier.size(64.dp).background(Renkler.birincil.copy(alpha = 0.16f), CircleShape), contentAlignment = Alignment.Center) {
                                    TelefonSimgesi(Renkler.birincil, Modifier.size(36.dp))
                                }
                                Spacer(Modifier.width(22.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(u.ad, color = Renkler.metin, fontSize = 30.sp, fontWeight = FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text(sonHaberMetni(u.sonHaberMs, simdi), color = Renkler.metinIkincil, fontSize = 24.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                }
                                Spacer(Modifier.width(16.dp))
                                EslemeDugmesi("Kaldırın", { kaldirilacak = u })
                            }
                        }
                    }
                }
                Spacer(Modifier.height(28.dp))
                GonderilenlerKarti()
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

/** Telefonlar bu TV'ye ne gönderir: üç kısa madde (güven: veri evden çıkmaz). */
@Composable
private fun GonderilenlerKarti() {
    Column(
        Modifier.fillMaxWidth().border(1.dp, Renkler.sinir, RoundedCornerShape(28.dp)).padding(horizontal = 28.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("Telefonlar bu TV'ye ne gönderir?", color = Renkler.metin, fontSize = 26.sp, fontWeight = FontWeight.SemiBold)
        Madde("Konum: vakitler ona göre hesaplanır")
        Madde("İsteyen kişinin kıldığı namazlar: vakit daralınca sessiz bir bant çıkar")
        Madde("Bilgiler şifreli ve yalnız evinizin ağında gider")
    }
}

@Composable
private fun Madde(metin: String) {
    Row(verticalAlignment = Alignment.Top) {
        Box(Modifier.padding(top = 12.dp).size(10.dp).background(Renkler.birincil, CircleShape))
        Spacer(Modifier.width(16.dp))
        Text(metin, color = Renkler.metinIkincil, fontSize = 24.sp, lineHeight = 32.sp)
    }
}

private fun sonHaberMetni(son: Long, simdi: Long): String {
    if (son <= 0) return "Henüz bilgi gelmedi"
    val dk = (simdi - son) / 60_000
    return when {
        dk < 1 -> "Az önce güncellendi"
        dk < 60 -> "$dk dk önce güncellendi"
        dk < 24 * 60 -> "${dk / 60} saat önce güncellendi"
        else -> "${dk / (24 * 60)} gün önce güncellendi"
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
    Box(Modifier.fillMaxSize().background(Renkler.arkaplan.copy(alpha = 0.96f)), contentAlignment = Alignment.Center) {
        Column(Modifier.width(760.dp).background(Renkler.kart, RoundedCornerShape(36.dp)).padding(horizontal = 56.dp, vertical = 48.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("$ad kaldırılsın mı?", color = Renkler.metin, fontSize = 40.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(12.dp))
            Text(
                "Bu telefon artık TV'ye bilgi gönderemez. Yeniden eklemek için kare kodu tekrar okutmanız gerekir.",
                color = Renkler.metinIkincil, fontSize = 26.sp, lineHeight = 36.sp,
            )
            Spacer(Modifier.height(40.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(28.dp)) {
                EslemeDugmesi("Vazgeçin", onHayir, Modifier.focusRequester(odak), buyuk = true)
                EslemeDugmesi("Kaldırın", onEvet, buyuk = true)
            }
        }
    }
}
