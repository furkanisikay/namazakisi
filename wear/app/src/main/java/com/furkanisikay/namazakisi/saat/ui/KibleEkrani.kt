package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.semantics
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TimeText
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin

/** Kıble ekranının durumları — her biri tek bir net mesaj ya da pusula. */
sealed interface KibleGorunumu {
    data object Bekleniyor : KibleGorunumu
    /** Telefondan hiç veri gelmedi. */
    data object YukYok : KibleGorunumu
    /** Telefon konum göndermedi (konum kapalı ya da eski telefon sürümü). */
    data object KonumYok : KibleGorunumu
    /** Saatte pusula sensörü yok: açı yine yazılır (kuzeye göre derece yalan değildir). */
    data class SensorYok(val kibleAcisi: Double, val konumAdi: String) : KibleGorunumu
    data class Olculuyor(val kibleAcisi: Double, val konumAdi: String) : KibleGorunumu
    data class Pusula(
        val kibleAcisi: Double,
        val konumAdi: String,
        /** Saatin baktığı gerçek yön (çizim için sarılmamış). */
        val yonCizim: Double,
        /** Kıblenin saate göre açısı (çizim için sarılmamış). */
        val hedefCizim: Double,
        val hizali: Boolean,
        /** TalkBack — 10°'lik adımlarla değişir. */
        val erisim: String,
        val egimIpucu: Boolean,
        val kalibrasyon: Boolean,
    ) : KibleGorunumu
}

/**
 * Ekran metinleri SÖZLEŞMEDİR: kare hattı (`scripts/saat-kare-hatti.sh`, `08-kible`)
 * içerik açıklamasından "sensörü bulunmuyor" ile sensörsüz emülatörü ayırt eder.
 */
const val KIBLE_SENSOR_YOK_METNI =
    "Bu saatte pusula sensörü bulunmuyor. Kıble yönünü telefonunuzdan görebilirsiniz."

/**
 * Kıble pusulası: kenarda dönen halka (kuzey işaretli), üstte saatin baktığı yönü
 * gösteren sabit çentik ve halkada Kâbe işareti. İşaret çentiğe gelince (hizada)
 * ikisi de eylem yeşili olur ve ortada "Kıble yönündesiniz" yazar. Kibar "siz".
 */
@Composable
fun KibleEkrani(
    g: KibleGorunumu,
    /** Titreşimle yönlendirme (saat W3, fikir 6) açık mı? */
    yonlendirme: Boolean = false,
    onYonlendirme: (() -> Unit)? = null,
    /** "Telefonda açın" (saat W3, fikir 4) — ayrıntılı kıble/harita telefonda. */
    onTelefondaAc: (() -> Unit)? = null,
) {
    SaatTemasi {
        AppScaffold(timeText = { TimeText() }) {
            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                when (g) {
                    KibleGorunumu.Bekleniyor -> Mesaj("Yön ölçülüyor…")
                    KibleGorunumu.YukYok -> Mesaj("Kıble için telefonunuzda Namaz Akışı'nı açın.")
                    KibleGorunumu.KonumYok -> Mesaj(
                        "Kıble için telefonunuzda konumu açın. Namaz Akışı güncel değilse güncelleyin.",
                    )
                    is KibleGorunumu.SensorYok -> Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Mesaj(
                            KIBLE_SENSOR_YOK_METNI,
                            alt = "Kıble ${derece(g.kibleAcisi)}° (kuzeyden) · ${g.konumAdi}",
                        )
                        if (onTelefondaAc != null) {
                            CompactButton(
                                onClick = onTelefondaAc,
                                colors = ButtonDefaults.filledTonalButtonColors(),
                                modifier = Modifier.padding(top = 6.dp).semantics { contentDescription = "Kıbleyi telefonunuzda açın" },
                                label = { Text("Telefonda açın") },
                            )
                        }
                    }
                    is KibleGorunumu.Olculuyor -> {
                        Halka(yonCizim = 0.0, hedefCizim = null, hizali = false)
                        Mesaj("Yön ölçülüyor…", alt = "Kıble ${derece(g.kibleAcisi)}° · ${g.konumAdi}")
                    }
                    is KibleGorunumu.Pusula -> PusulaIcerigi(g)
                }
                // Titreşimle yönlendirme anahtarı — yalnız pusula çalışırken (sensör varken).
                if (onYonlendirme != null && (g is KibleGorunumu.Pusula || g is KibleGorunumu.Olculuyor)) {
                    CompactButton(
                        onClick = onYonlendirme,
                        colors = ButtonDefaults.filledTonalButtonColors(),
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 4.dp)
                            .semantics {
                                contentDescription = if (yonlendirme) {
                                    "Titreşimle yönlendirme açık. Kapatmak için dokunun"
                                } else {
                                    "Titreşimle yönlendirme kapalı. Açmak için dokunun"
                                }
                            },
                        label = { Text(if (yonlendirme) "Titreşim açık" else "Titreşim kapalı") },
                    )
                }
            }
        }
    }
}

@Composable
private fun PusulaIcerigi(g: KibleGorunumu.Pusula) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .fillMaxSize()
            // Tek düğüm; açıklama yalnız 10°'lik adımda değişir (liveRegion YOK).
            .clearAndSetSemantics {
                contentDescription = "${g.erisim}. Kıble ${derece(g.kibleAcisi)} derece, ${g.konumAdi}"
            },
    ) {
        Halka(yonCizim = g.yonCizim, hedefCizim = g.hedefCizim, hizali = g.hizali)
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 40.dp),
        ) {
            if (g.hizali) {
                Text(
                    "Kıble yönündesiniz",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = renk(SaatPaleti.EYLEM),
                    textAlign = TextAlign.Center,
                )
            } else {
                Text(
                    "${derece(g.kibleAcisi)}°",
                    style = MaterialTheme.typography.displaySmall,
                    color = renk(SaatPaleti.METIN),
                )
            }
            Text(
                "Kıble · ${g.konumAdi}",
                style = MaterialTheme.typography.labelSmall,
                color = renk(SaatPaleti.METIN2),
                textAlign = TextAlign.Center,
                maxLines = 2,
            )
            // Uyarılar tek satırda, öncelik sırasıyla: kalibrasyon yönü bozar, eğim azaltır.
            val ipucu = when {
                g.kalibrasyon -> "Kalibrasyon için bileğinizle havada 8 çizin"
                g.egimIpucu -> "Saatinizi yere paralel tutun"
                else -> null
            }
            if (ipucu != null) {
                Text(
                    ipucu,
                    style = MaterialTheme.typography.labelSmall,
                    color = renk(SaatPaleti.KERAHAT),
                    textAlign = TextAlign.Center,
                    maxLines = 2,
                )
            }
        }
    }
}

@Composable
private fun Mesaj(metin: String, alt: String? = null) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 28.dp),
    ) {
        Text(metin, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
        if (alt != null) {
            Text(
                alt,
                style = MaterialTheme.typography.labelSmall,
                color = renk(SaatPaleti.METIN2),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 6.dp),
            )
        }
    }
}

/**
 * Halka: kuzey işareti `-yon` kadar döner (dünya sabit, saat döner); Kâbe işareti
 * `hedef` açısında; üstteki sabit çentik saatin baktığı yöndür. Dekoratif — anlam
 * `PusulaIcerigi`'nin tek erişim düğümünde.
 */
@Composable
private fun Halka(yonCizim: Double, hedefCizim: Double?, hizali: Boolean) {
    val iz = renk(SaatPaleti.IZ)
    val ikincil = renk(SaatPaleti.METIN2)
    val metin = renk(SaatPaleti.METIN)
    val eylem = renk(SaatPaleti.EYLEM)
    Canvas(Modifier.fillMaxSize().padding(6.dp)) {
        val r = min(size.width, size.height) / 2f
        val merkez = center
        val kalinlik = 6.dp.toPx()
        drawCircle(iz, radius = r - kalinlik / 2f, style = Stroke(kalinlik))
        // Dünya sabit işaretler: 30°'de bir çentik, kuzeyde belirgin üçgen.
        rotate(-yonCizim.toFloat(), merkez) {
            for (i in 0 until 12) {
                val aci = Math.toRadians(i * 30.0)
                val uzun = i % 3 == 0
                val ic = r - kalinlik - (if (uzun) 10.dp.toPx() else 5.dp.toPx())
                drawLine(
                    ikincil,
                    nokta(merkez, ic, aci),
                    nokta(merkez, r - kalinlik, aci),
                    strokeWidth = (if (uzun) 2.dp else 1.dp).toPx(),
                    cap = StrokeCap.Round,
                )
            }
            ucgen(merkez, r - kalinlik - 12.dp.toPx(), 0.0, 7.dp.toPx(), metin)
        }
        // Saatin baktığı yön: üstte sabit çentik.
        drawLine(
            if (hizali) eylem else metin,
            Offset(merkez.x, merkez.y - r),
            Offset(merkez.x, merkez.y - r + kalinlik + 8.dp.toPx()),
            strokeWidth = 3.dp.toPx(),
            cap = StrokeCap.Round,
        )
        if (hedefCizim != null) {
            // Kâbe işareti: halkanın üzerinde dolu kare + içe bakan ok.
            val aci = Math.toRadians(hedefCizim)
            val renk = if (hizali) eylem else renk(SaatPaleti.KERAHAT)
            val yer = nokta(merkez, r - kalinlik / 2f, aci)
            val yari = 7.dp.toPx()
            rotate(hedefCizim.toFloat(), yer) {
                drawRect(renk, topLeft = Offset(yer.x - yari, yer.y - yari), size = Size(yari * 2, yari * 2))
            }
            ucgen(merkez, r - kalinlik - 14.dp.toPx(), hedefCizim, 8.dp.toPx(), renk)
        }
    }
}

/** Merkezden `yaricap` uzaklıkta, kuzeyden saat yönünde `aci` (radyan) noktası. */
private fun nokta(merkez: Offset, yaricap: Float, aci: Double): Offset =
    Offset(merkez.x + yaricap * sin(aci).toFloat(), merkez.y - yaricap * cos(aci).toFloat())

/** Dışa bakan üçgen: tepe `yaricap`'ta, `aciDerece` yönünde. */
private fun DrawScope.ucgen(merkez: Offset, yaricap: Float, aciDerece: Double, boy: Float, renk: Color) {
    val a = Math.toRadians(aciDerece)
    val tepe = nokta(merkez, yaricap, a)
    val tabanMerkez = nokta(merkez, yaricap - boy * 1.4f, a)
    val dik = Offset(cos(a).toFloat(), sin(a).toFloat())
    val yol = Path().apply {
        moveTo(tepe.x, tepe.y)
        lineTo(tabanMerkez.x + dik.x * boy, tabanMerkez.y + dik.y * boy)
        lineTo(tabanMerkez.x - dik.x * boy, tabanMerkez.y - dik.y * boy)
        close()
    }
    drawPath(yol, renk)
}

private fun derece(aci: Double): Int = aci.roundToInt() % 360
