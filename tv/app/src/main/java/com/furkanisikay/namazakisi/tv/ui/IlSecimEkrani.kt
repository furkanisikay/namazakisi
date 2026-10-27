package com.furkanisikay.namazakisi.tv.ui

import androidx.compose.ui.res.stringResource
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Border
import androidx.tv.material3.ClickableSurfaceDefaults
import androidx.tv.material3.Surface
import androidx.tv.material3.Text
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.painterResource
import com.furkanisikay.namazakisi.tv.R
import com.furkanisikay.namazakisi.tv.cekirdek.Il

/**
 * İl seçimi — D-pad ile 81 il ızgarası. TV'de konum donanımı yoktur; vakitler seçilen
 * ilin merkezine göre hesaplanır. Açılışta odak mevcut seçimde (yoksa ilk ilde) durur.
 *
 * @param onGeri yalnız daha önce bir il seçilmişse verilir: geri tuşu panoya döner.
 *   İlk kurulumda null → geri tuşu sistemin varsayılanı (uygulamadan çıkış).
 */
@Composable
fun IlSecimEkrani(
    iller: List<Il>,
    seciliPlaka: String?,
    onSec: (Il) -> Unit,
    onGeri: (() -> Unit)?,
) {
    if (onGeri != null) BackHandler(onBack = onGeri)

    val baslangic = iller.indexOfFirst { it.plaka == seciliPlaka }.coerceAtLeast(0)
    // Izgara seçili ilin bir ÜST satırından başlar: ilk görünen satır tam çizilir (orta
    // satırdan başlayınca üstteki satır başlığın altında yarım kalıyordu).
    val izgara = rememberLazyGridState(
        initialFirstVisibleItemIndex = (baslangic - baslangic % SUTUN - SUTUN).coerceAtLeast(0),
    )
    val odak = remember { FocusRequester() }
    LaunchedEffect(Unit) {
        try {
            odak.requestFocus()
        } catch (e: IllegalStateException) {
            // Öğe henüz yerleşmediyse odak sistemin ilk odaklanabilir öğesine düşer.
        }
    }

    Column(
        Modifier
            .fillMaxSize()
            .background(Renkler.arkaplan)
            .padding(horizontal = 48.dp, vertical = 27.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Image(
                painterResource(R.drawable.ic_konum),
                contentDescription = null,
                colorFilter = ColorFilter.tint(Renkler.birincil),
                modifier = Modifier.size(36.dp),
            )
            Spacer(Modifier.width(14.dp))
            Text(stringResource(R.string.il_secin), color = Renkler.metin, fontSize = 36.sp, fontWeight = FontWeight.SemiBold)
        }
        Spacer(Modifier.height(6.dp))
        // Tek kısa satır: ayrıntı (aynı hesap yöntemi, sonradan değiştirme) panoda zaten görünür.
        Text(stringResource(R.string.il_merkezine_gore), color = Renkler.metinIkincil, fontSize = 24.sp)
        Spacer(Modifier.height(16.dp))
        // 3 sütun: en uzun il adı ("Afyonkarahisar", "Kahramanmaraş") 10-foot boyda kesilmeden sığar.
        LazyVerticalGrid(
            columns = GridCells.Fixed(SUTUN),
            state = izgara,
            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.fillMaxSize(),
        ) {
            itemsIndexed(iller, key = { _, il -> il.plaka }) { i, il ->
                val secili = il.plaka == seciliPlaka
                val seciliAciklama = stringResource(R.string.il_secili, il.ad)
                Surface(
                    onClick = { onSec(il) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .then(if (i == baslangic) Modifier.focusRequester(odak) else Modifier)
                        .semantics { contentDescription = if (secili) seciliAciklama else il.ad },
                    shape = ClickableSurfaceDefaults.shape(RoundedCornerShape(12.dp)),
                    colors = ClickableSurfaceDefaults.colors(
                        containerColor = if (secili) Renkler.birincilKoyu else Renkler.kart,
                        contentColor = Renkler.metin,
                        focusedContainerColor = Renkler.metin,
                        focusedContentColor = Renkler.arkaplan,
                    ),
                    border = ClickableSurfaceDefaults.border(
                        focusedBorder = Border(BorderStroke(3.dp, Renkler.birincil), inset = (-4).dp),
                    ),
                    scale = ClickableSurfaceDefaults.scale(focusedScale = 1.05f),
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 14.dp),
                    ) {
                        // Plaka ikincil ve sabit genişlikte: adlar tek hizada başlar.
                        Text(
                            il.plaka,
                            fontSize = 20.sp,
                            modifier = Modifier.width(36.dp).alpha(0.7f),
                        )
                        Text(
                            il.ad,
                            fontSize = 26.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        if (secili) {
                            Spacer(Modifier.weight(1f))
                            Text("✓", fontSize = 24.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

/** Izgara sütun sayısı: en uzun il adı 10-foot boyda kesilmeden sığar. */
private const val SUTUN = 3
