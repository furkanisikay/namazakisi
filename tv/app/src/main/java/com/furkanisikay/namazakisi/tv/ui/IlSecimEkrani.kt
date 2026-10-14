package com.furkanisikay.namazakisi.tv.ui

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
    val izgara = rememberLazyGridState(initialFirstVisibleItemIndex = baslangic)
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
        Text("Bulunduğunuz ili seçin", color = Renkler.metin, fontSize = 34.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(6.dp))
        Text(
            "Vakitler il merkezine göre, telefon uygulamasıyla aynı yöntemle hesaplanır. " +
                "Seçiminizi daha sonra panodaki “Konumu değiştirin” düğmesiyle değiştirebilirsiniz.",
            color = Renkler.metinIkincil,
            fontSize = 18.sp,
        )
        Spacer(Modifier.height(20.dp))
        LazyVerticalGrid(
            columns = GridCells.Fixed(5),
            state = izgara,
            contentPadding = PaddingValues(8.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.fillMaxSize(),
        ) {
            itemsIndexed(iller, key = { _, il -> il.plaka }) { i, il ->
                val secili = il.plaka == seciliPlaka
                Surface(
                    onClick = { onSec(il) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .then(if (i == baslangic) Modifier.focusRequester(odak) else Modifier)
                        .semantics { contentDescription = if (secili) "${il.ad}, seçili" else il.ad },
                    shape = ClickableSurfaceDefaults.shape(RoundedCornerShape(12.dp)),
                    colors = ClickableSurfaceDefaults.colors(
                        containerColor = if (secili) Renkler.birincilKoyu else Renkler.kart,
                        contentColor = Renkler.metin,
                        focusedContainerColor = Renkler.metin,
                        focusedContentColor = Renkler.arkaplan,
                    ),
                    border = ClickableSurfaceDefaults.border(
                        focusedBorder = Border(BorderStroke(2.dp, Renkler.birincil)),
                    ),
                    scale = ClickableSurfaceDefaults.scale(focusedScale = 1.06f),
                ) {
                    Text(
                        "${il.plaka}  ${il.ad}",
                        fontSize = 20.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                    )
                }
            }
        }
    }
}
