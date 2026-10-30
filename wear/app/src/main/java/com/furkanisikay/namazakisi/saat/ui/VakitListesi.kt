package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi

/**
 * Günün vakitleri listesinin satırı. Göz yukarıdan aşağı saatleri tarar: saat solda
 * sabit genişlikte, ad ortada, durum sağda. Dokunulabilirlik biçimden okunur ("dokunarak
 * işaretleyin" talimatı yok); kılınabilir satıra dokunmak ana ekrandaki AYNI onayı açar.
 *
 * @param kalanMetni yalnız şu anki vakitte ("1 sa 58 dk kaldı")
 */
@Composable
fun VakitSatiri(
    satir: VakitHesabi.Satir,
    aktif: Boolean,
    kalanMetni: String?,
    onSec: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val vakitRengi = renk(SaatPaleti.vakitRengi(satir.vakit))
    val saat = VakitHesabi.saat(satir.ms)
    val ad = VakitHesabi.ad(satir.vakit, stringResource(R.string.dil_kodu))
    val durum = when {
        satir.esitleniyor -> stringResource(R.string.durum_esitleniyor)
        satir.kilindi -> stringResource(R.string.durum_kilindi)
        !satir.girdi -> stringResource(R.string.durum_girmedi)
        aktif && kalanMetni != null -> stringResource(R.string.durum_simdiki_kalan, kalanMetni)
        aktif -> stringResource(R.string.durum_simdiki)
        else -> stringResource(R.string.durum_kilinmadi)
    }
    val isaretleyin = stringResource(R.string.isaretleyin)
    val esitleniyor = stringResource(R.string.esitleniyor)
    val zemin = when {
        aktif -> renk(SaatPaleti.YUZEY2)
        else -> renk(SaatPaleti.YUZEY)
    }
    val yazi = if (!satir.girdi && !satir.kilindi) renk(SaatPaleti.METIN2) else renk(SaatPaleti.METIN)
    val sekil = RoundedCornerShape(24.dp)
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 52.dp)
            .clip(sekil)
            .background(zemin, sekil)
            .then(
                // Şu anki vakit: solda vakit tonunda şerit.
                if (aktif) Modifier.drawBehind {
                    drawRect(vakitRengi, Offset.Zero, Size(4.dp.toPx(), size.height))
                } else Modifier
            )
            .clickable(
                enabled = satir.isaretlenebilir,
                role = Role.Button,
                onClickLabel = isaretleyin,
                onClick = onSec,
            )
            .semantics(mergeDescendants = true) { contentDescription = "$ad, $saat, $durum" }
            .padding(start = 14.dp, end = 12.dp, top = 6.dp, bottom = 6.dp),
    ) {
        Text(
            yerelRakam(saat),
            style = RAKAM,
            fontSize = MaterialTheme.typography.titleSmall.fontSize,
            fontWeight = FontWeight.SemiBold,
            color = yazi,
            maxLines = 1,
            modifier = Modifier.width(46.dp).clearAndSetSemantics { },
        )
        Column(Modifier.weight(1f).clearAndSetSemantics { }) {
            // Ad KESİLMEZ, sütuna sığana dek küçülür: kare saatte "La'asar" "La'asa"ya, "Adhuhuri"
            // "Adhuh"a üç noktasız kesiliyordu (Hausa, Svahili; 2026-10-30).
            val adStili = MaterialTheme.typography.titleSmall
            SigdirilanMetin(
                ad,
                enFazla = adStili.fontSize,
                renk = yazi,
                modifier = Modifier.fillMaxWidth(),
                agirlik = adStili.fontWeight ?: FontWeight.Medium,
                ortala = false,
                stil = adStili,
            )
            val alt = when {
                satir.esitleniyor -> esitleniyor
                // "kaldı" eki kare ekranda "2 sa 41 dk"yı "2 sa 41"e kesiyordu; süre tek başına okunur.
                aktif && kalanMetni != null -> kalanMetni
                else -> null
            }
            if (alt != null) {
                // Kare saatte büyük yazı ölçeğinde "2 sa 2 dk" "2 sa"ya kesiliyordu: satır
                // kendini sütuna sığdırır (kesilmez, küçülür).
                SigdirilanMetin(
                    alt,
                    enFazla = MaterialTheme.typography.labelSmall.fontSize,
                    renk = if (aktif) vakitRengi else renk(SaatPaleti.METIN2),
                    modifier = Modifier.fillMaxWidth(),
                    agirlik = FontWeight.Normal,
                    ortala = false,
                    stil = MaterialTheme.typography.labelSmall,
                )
            }
        }
        DurumDairesi(satir.kilindi, if (aktif) vakitRengi else renk(SaatPaleti.IZ))
    }
}

/** Kılındı = dolu yeşil + ✓ (renk tek başına anlam taşımaz), değilse halka. */
@Composable
private fun DurumDairesi(kilindi: Boolean, halka: Color) {
    if (kilindi) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(22.dp).background(renk(SaatPaleti.EYLEM), CircleShape).clearAndSetSemantics { },
        ) {
            Text("✓", color = renk(SaatPaleti.EYLEM_USTU), style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
        }
    } else {
        Box(
            Modifier.size(22.dp).drawBehind {
                drawCircle(halka, radius = size.minDimension / 2 - 1.dp.toPx(), style = Stroke(2.dp.toPx()))
            }
        )
    }
}

/** Liste dibi ve bilgi satırları: ortalanmış ikincil metin. */
@Composable
fun BilgiMetni(metin: String, modifier: Modifier = Modifier) {
    Text(
        yerelRakam(metin),
        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
        style = MaterialTheme.typography.bodyMedium,
        color = renk(SaatPaleti.METIN2),
        modifier = modifier.fillMaxWidth().padding(horizontal = 12.dp),
    )
}
