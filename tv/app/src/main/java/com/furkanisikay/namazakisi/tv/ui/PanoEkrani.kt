package com.furkanisikay.namazakisi.tv.ui

import android.view.WindowManager
import androidx.activity.compose.LocalActivity
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
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.ClickableSurfaceDefaults
import androidx.tv.material3.Surface
import androidx.tv.material3.Text
import com.furkanisikay.namazakisi.tv.cekirdek.Bicim
import com.furkanisikay.namazakisi.tv.cekirdek.GunlukVakitler
import com.furkanisikay.namazakisi.tv.cekirdek.Il
import com.furkanisikay.namazakisi.tv.cekirdek.Kaydirma
import com.furkanisikay.namazakisi.tv.cekirdek.PanoDurumu
import com.furkanisikay.namazakisi.tv.cekirdek.PanoHesabi
import com.furkanisikay.namazakisi.tv.cekirdek.Vakit
import com.furkanisikay.namazakisi.tv.cekirdek.VakitHesabi
import kotlinx.coroutines.delay
import java.time.LocalDate
import java.time.ZoneId

/** Saniye sınırına hizalı saat (her saniye bir kez yeniden çizim). */
@Composable
fun simdiyiIzle(): State<Long> = produceState(System.currentTimeMillis()) {
    while (true) {
        val simdi = System.currentTimeMillis()
        value = simdi
        delay(1000L - simdi % 1000L)
    }
}

/** Gün bazında vakit önbelleği: saniyelik çizim adhan hesabını her seferinde yapmasın. */
private class VakitOnbellegi(private val il: Il) {
    private val harita = HashMap<LocalDate, GunlukVakitler>()

    fun al(tarih: LocalDate): GunlukVakitler {
        harita[tarih]?.let { return it }
        if (harita.size > 3) harita.clear()
        return VakitHesabi.hesapla(il.lat, il.lng, tarih).also { harita[tarih] = it }
    }
}

/**
 * Pano ekranı. [ekraniAcikTut] yalnız etkinlikte (Activity) true verilir:
 * `FLAG_KEEP_SCREEN_ON` YALNIZ bu ekran görünürken pencerede durur (il seçiminde
 * ve uygulamadan çıkınca kalkar). Ekran koruyucuda (DreamService) sistem ekranı zaten
 * açık tutar; orada etkinlik yoktur.
 */
@Composable
fun PanoEkrani(
    il: Il,
    ekraniAcikTut: Boolean,
    onKonumDegistir: (() -> Unit)?,
) {
    if (ekraniAcikTut) {
        val pencere = LocalActivity.current?.window
        DisposableEffect(pencere) {
            pencere?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            onDispose { pencere?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) }
        }
    }

    val simdi by simdiyiIzle()
    val bolge = remember { ZoneId.systemDefault() }
    val onbellek = remember(il) { VakitOnbellegi(il) }
    val durum = PanoHesabi.hesapla(simdi, bolge, onbellek::al)
    val (dx, dy) = Kaydirma.ofset(simdi)

    Box(
        Modifier
            .fillMaxSize()
            .background(Renkler.arkaplan)
            // TV taşma (overscan) güvenli alanı: yatayda ~%5, dikeyde ~%5.
            .padding(horizontal = 48.dp, vertical = 27.dp),
    ) {
        Row(
            Modifier
                .fillMaxSize()
                .offset(dx.dp, dy.dp),
            horizontalArrangement = Arrangement.spacedBy(40.dp),
        ) {
            SolSutun(il, durum, simdi, bolge, onKonumDegistir, Modifier.weight(1.1f))
            VakitListesi(durum, bolge, Modifier.weight(1f))
        }
    }
}

@Composable
private fun SolSutun(
    il: Il,
    durum: PanoDurumu,
    simdi: Long,
    bolge: ZoneId,
    onKonumDegistir: (() -> Unit)?,
    modifier: Modifier,
) {
    Column(modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceBetween) {
        Column {
            Text(il.ad, color = Renkler.metin, fontSize = 30.sp, fontWeight = FontWeight.SemiBold)
            Text(Bicim.tarih(durum.tarih), color = Renkler.metinIkincil, fontSize = 20.sp)
        }

        Row(verticalAlignment = Alignment.Bottom) {
            Text(
                Bicim.saat(simdi, bolge),
                color = Renkler.metin,
                fontSize = 128.sp,
                fontWeight = FontWeight.Light,
                lineHeight = 128.sp,
            )
            Text(
                Bicim.saniye(simdi, bolge),
                color = Renkler.metinIkincil,
                fontSize = 40.sp,
                modifier = Modifier.padding(start = 8.dp, bottom = 20.dp),
            )
        }

        Column {
            Text(
                "${durum.gorunenAd(durum.siradaki)} vaktine kalan",
                color = Renkler.metinIkincil,
                fontSize = 22.sp,
            )
            Text(
                Bicim.geriSayim(durum.kalanMs),
                color = Renkler.metin,
                fontSize = 64.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.semantics {
                    contentDescription = "${durum.gorunenAd(durum.siradaki)} vaktine kalan süre"
                },
            )
        }

        BilgiSeridi(durum, bolge)

        if (onKonumDegistir != null) {
            Surface(
                onClick = onKonumDegistir,
                shape = ClickableSurfaceDefaults.shape(RoundedCornerShape(12.dp)),
                colors = ClickableSurfaceDefaults.colors(
                    containerColor = Renkler.kart,
                    contentColor = Renkler.metin,
                    focusedContainerColor = Renkler.birincilKoyu,
                    focusedContentColor = Renkler.metin,
                ),
                scale = ClickableSurfaceDefaults.scale(focusedScale = 1.05f),
            ) {
                Text(
                    "Konumu değiştirin",
                    fontSize = 18.sp,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
                )
            }
        }
    }
}

/** Kerahat (şu an / sıradaki) ve cuma bilgisi. Amber yalnız noktada; metin tema metni. */
@Composable
private fun BilgiSeridi(durum: PanoDurumu, bolge: ZoneId) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        val kerahat = durum.kerahat
        if (kerahat != null) {
            BilgiSatiri(
                renk = Renkler.uyari,
                // Saate hal eki EKLENMEZ ("07:42'e" okunuşa göre değişir — AGENTS.md şerit dersi).
                metin = "Kerahat vakti: ${kerahat.tur.ad}, bitiş ${Bicim.saat(kerahat.bitis, bolge)}. " +
                    kerahat.tur.aciklama,
            )
        } else {
            durum.siradakiKerahat?.let {
                BilgiSatiri(
                    renk = Renkler.sinir,
                    metin = "Sıradaki kerahat: ${it.tur.ad} ${Bicim.saat(it.baslangic, bolge)}–${Bicim.saat(it.bitis, bolge)}",
                )
            }
        }
        if (durum.cuma) {
            BilgiSatiri(
                renk = Renkler.birincil,
                metin = "Bugün cuma. Cuma namazı öğle vaktinde kılınır (giriş ${Bicim.saat(durum.vakitler.ogle, bolge)}).",
            )
        }
    }
}

@Composable
private fun BilgiSatiri(renk: androidx.compose.ui.graphics.Color, metin: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(12.dp).background(renk, CircleShape))
        Spacer(Modifier.width(12.dp))
        Text(metin, color = Renkler.metin, fontSize = 18.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
private fun VakitListesi(durum: PanoDurumu, bolge: ZoneId, modifier: Modifier) {
    Column(
        modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically),
    ) {
        for (vakit in Vakit.entries) {
            val aktif = vakit == durum.aktif
            val siradaki = vakit == durum.siradaki && durum.siradakiMs == durum.vakitler.saat(vakit)
            val sekil = RoundedCornerShape(16.dp)
            Row(
                Modifier
                    .fillMaxWidth()
                    .height(68.dp)
                    .background(if (aktif) Renkler.birincilKoyu else Renkler.kart, sekil)
                    .then(if (siradaki) Modifier.border(2.dp, Renkler.birincil, sekil) else Modifier)
                    .padding(horizontal = 24.dp)
                    .semantics {
                        contentDescription = buildString {
                            append(durum.gorunenAd(vakit)).append(' ')
                            append(Bicim.saat(durum.vakitler.saat(vakit), bolge))
                            if (aktif) append(", şu anki vakit")
                            if (siradaki) append(", sıradaki vakit")
                        }
                    },
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    durum.gorunenAd(vakit),
                    color = Renkler.metin,
                    fontSize = 30.sp,
                    fontWeight = if (aktif) FontWeight.Bold else FontWeight.Normal,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    Bicim.saat(durum.vakitler.saat(vakit), bolge),
                    color = Renkler.metin,
                    fontSize = 34.sp,
                    fontWeight = if (aktif) FontWeight.Bold else FontWeight.Medium,
                )
            }
        }
    }
}
