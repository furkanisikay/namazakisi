package com.furkanisikay.namazakisi.tv.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
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
        Row(Modifier.fillMaxSize().padding(horizontal = 56.dp, vertical = 40.dp), horizontalArrangement = Arrangement.spacedBy(48.dp)) {
            // Sol sütun dar tutulur: sağdaki üye kartında ad + "güncellendi" satırı tek satıra sığsın
            // (420 dp iken 1080p'de ikisi de ikiye bölünüyordu — kare hattında görüldü).
            Column(Modifier.width(360.dp)) {
                Text("Ayarlar", color = Renkler.metin, fontSize = 38.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                Text(
                    if (konumAdi != null) "Konum: $konumAdi" else "Konum seçilmedi",
                    color = Renkler.metinIkincil, fontSize = 20.sp,
                )
                Spacer(Modifier.height(32.dp))
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    EslemeDugmesi("Telefon ekleyin", onTelefonEkle, Modifier.focusRequester(ilkOdak).fillMaxWidth(), birincil = true)
                    EslemeDugmesi("Konumu kodla girin", onKodla, Modifier.fillMaxWidth())
                    EslemeDugmesi("İli kendim seçeyim", onIlSec, Modifier.fillMaxWidth())
                }
            }
            Column(Modifier.weight(1f)) {
                Text("Bu TV'ye bağlı telefonlar", color = Renkler.metin, fontSize = 26.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(16.dp))
                if (uyeler.isEmpty()) {
                    Text(
                        "Henüz telefon eklenmedi. Telefon eklediğinizde vakitler onun konumuna göre hesaplanır; " +
                            "isteyen kişi kıldığı namazları da gösterebilir.",
                        color = Renkler.metinIkincil, fontSize = 20.sp, lineHeight = 28.sp,
                    )
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        items(uyeler, key = { it.uye }) { u ->
                            Row(
                                Modifier.fillMaxWidth().background(Renkler.kart, RoundedCornerShape(18.dp)).padding(horizontal = 24.dp, vertical = 16.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Box(Modifier.size(48.dp).background(Renkler.birincil.copy(alpha = 0.16f), CircleShape), contentAlignment = Alignment.Center) {
                                    TelefonSimgesi(Renkler.birincil, Modifier.size(28.dp))
                                }
                                Spacer(Modifier.width(18.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(u.ad, color = Renkler.metin, fontSize = 22.sp, fontWeight = FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text(sonHaberMetni(u.sonHaberMs, simdi), color = Renkler.metinIkincil, fontSize = 17.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                }
                                EslemeDugmesi("Kaldırın", { kaldirilacak = u })
                            }
                        }
                    }
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
    Box(Modifier.fillMaxSize().background(Renkler.arkaplan.copy(alpha = 0.86f)), contentAlignment = Alignment.Center) {
        Column(Modifier.width(600.dp).background(Renkler.kart, RoundedCornerShape(28.dp)).padding(40.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("$ad kaldırılsın mı?", color = Renkler.metin, fontSize = 30.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(12.dp))
            Text(
                "Bu telefon artık TV'ye bilgi gönderemez. Yeniden eklemek için kare kodu tekrar okutmanız gerekir.",
                color = Renkler.metinIkincil, fontSize = 18.sp, lineHeight = 26.sp,
            )
            Spacer(Modifier.height(28.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                EslemeDugmesi("Vazgeçin", onHayir, Modifier.focusRequester(odak))
                EslemeDugmesi("Kaldırın", onEvet)
            }
        }
    }
}
