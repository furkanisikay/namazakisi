package com.furkanisikay.namazakisi.tv.ui

import android.content.Context
import android.provider.Settings
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Border
import androidx.tv.material3.ClickableSurfaceDefaults
import androidx.tv.material3.Surface
import androidx.tv.material3.Text
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/**
 * Eşleştirme ekranlarının ortak parçaları: QR çizimi (ve katlanma sahnesi), konum iğnesi,
 * tek seferlik başarı halkası, TV düğmesi.
 *
 * Hareket ilkesi (motion-choreography): boşta SIFIR hareket — QR beklerken durgundur.
 * Her sahne bir olayla başlar (telefon bağlandı / kod doğru / kod yanlış) ve ≤ 3 sn'de
 * biter. "Animasyonları kaldır" (animator ölçeği 0) açıksa sahneler son karesine atlar.
 */

/** Sistem animator süresi ölçeği 0 değilse true. */
fun animasyonAcik(baglam: Context): Boolean = try {
    Settings.Global.getFloat(baglam.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) > 0f
} catch (e: Exception) {
    true
}

/** QR modül matrisi (sessiz bölge YOK; kartın beyaz dolgusu o işi görür). */
class QrMatrisi(val boyut: Int, private val bitler: BooleanArray) {
    fun koyu(x: Int, y: Int) = bitler[y * boyut + x]

    companion object {
        fun olustur(metin: String): QrMatrisi {
            val m = QRCodeWriter().encode(
                metin, BarcodeFormat.QR_CODE, 0, 0,
                mapOf(EncodeHintType.MARGIN to 0, EncodeHintType.ERROR_CORRECTION to ErrorCorrectionLevel.M),
            )
            val n = m.width
            return QrMatrisi(n, BooleanArray(n * n) { m.get(it % n, it / n) })
        }
    }
}

/**
 * QR'ı çizer. [katlanma] 0 → okunabilir QR; 1 → bütün modüller merkeze toplanmış.
 * Dıştaki modüller önce yola çıkar (katlanma dıştan içe), yolda koyu renkten yeşile döner:
 * okunan kod, gelen konuma dönüşür.
 */
fun DrawScope.qrCiz(qr: QrMatrisi, katlanma: Float, koyu: Color, hedefRenk: Color) {
    val hucre = size.minDimension / qr.boyut
    val ust = (size.height - hucre * qr.boyut) / 2
    val sol = (size.width - hucre * qr.boyut) / 2
    val merkez = Offset(size.width / 2, size.height / 2)
    val enUzak = hypot(qr.boyut / 2f, qr.boyut / 2f)
    for (y in 0 until qr.boyut) for (x in 0 until qr.boyut) {
        if (!qr.koyu(x, y)) continue
        val ox = sol + x * hucre
        val oy = ust + y * hucre
        if (katlanma <= 0f) {
            drawRect(koyu, Offset(ox, oy), Size(hucre + 0.5f, hucre + 0.5f))
            continue
        }
        val d = hypot(x - qr.boyut / 2f, y - qr.boyut / 2f) / enUzak
        val yerel = ((katlanma - (1f - d) * 0.4f) / 0.6f).coerceIn(0f, 1f)
        val e = yerel * yerel
        if (e >= 1f) continue
        val boy = hucre * (1f - e)
        val cx = ox + hucre / 2 + (merkez.x - ox - hucre / 2) * e
        val cy = oy + hucre / 2 + (merkez.y - oy - hucre / 2) * e
        drawRoundRect(
            lerp(koyu, hedefRenk, yerel),
            Offset(cx - boy / 2, cy - boy / 2),
            Size(boy, boy),
            CornerRadius(boy * 0.5f * yerel),
        )
    }
}

/**
 * Konum iğnesi (damla), merkezde. [olcek] yay ile 0 → 1 gelir. [halka] 0 → 1 iğnenin
 * çevresinde bir kez çizilen halka ve dışa saçılan 12 parçacık (tek seferlik vurgu).
 */
fun DrawScope.igneCiz(olcek: Float, halka: Float, renk: Color, halkaRengi: Color) {
    val m = Offset(size.width / 2, size.height / 2)
    val r = size.minDimension * 0.16f * olcek
    if (halka > 0f) {
        val hr = size.minDimension * 0.36f
        drawArc(
            halkaRengi, -90f, 360f * min(1f, halka * 1.4f), false,
            topLeft = Offset(m.x - hr, m.y - hr), size = Size(hr * 2, hr * 2),
            style = Stroke(width = size.minDimension * 0.025f, cap = StrokeCap.Round),
        )
        val p = ((halka - 0.3f) / 0.7f).coerceIn(0f, 1f)
        if (p in 0.001f..0.999f) {
            for (i in 0 until 12) {
                val aci = (i / 12f) * 2 * PI.toFloat() + 0.26f
                val uzaklik = hr * (1.05f + 0.35f * p)
                drawCircle(
                    halkaRengi.copy(alpha = 1f - p),
                    radius = size.minDimension * 0.012f * (1f - p * 0.5f),
                    center = Offset(m.x + cos(aci) * uzaklik, m.y + sin(aci) * uzaklik),
                )
            }
        }
    }
    if (r <= 0.5f) return
    // Damla: üstte daire, altta sivri uç; uç tam merkezin biraz altında (iğne "yere basar").
    val bas = Offset(m.x, m.y - r * 0.55f)
    val yol = Path().apply {
        moveTo(m.x, m.y + r * 1.25f)
        lineTo(bas.x - r * 0.86f, bas.y + r * 0.5f)
        arcTo(Rect(bas, r), 150f, 240f, false)
        lineTo(m.x, m.y + r * 1.25f)
        close()
    }
    drawPath(yol, renk)
    drawCircle(Color.White, radius = r * 0.38f, center = bas)
}

/** TV düğmesi: odakta dolar ve büyür (D-pad'de nerede olduğunuz tek bakışta görünür). */
@Composable
fun EslemeDugmesi(
    metin: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    birincil: Boolean = false,
    ikon: (@Composable () -> Unit)? = null,
    buyuk: Boolean = false,
) {
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = ClickableSurfaceDefaults.shape(RoundedCornerShape(if (buyuk) 32.dp else 24.dp)),
        colors = ClickableSurfaceDefaults.colors(
            containerColor = if (birincil) Renkler.birincilKoyu else Renkler.kart,
            contentColor = Renkler.metin,
            focusedContainerColor = Renkler.metin,
            focusedContentColor = Renkler.arkaplan,
        ),
        border = ClickableSurfaceDefaults.border(
            border = Border(BorderStroke(1.dp, Renkler.sinir)),
            // Odak halkası dışa taşar: kanepeden (3 m) hangi düğmede olduğunuz görünsün.
            // inset VERİLMEZ: negatif inset, belirip büyüyen (onay penceresi) yüzeyin ilk karesinde
            // SurfaceBorderNode'u "Width and height must be ≥ 0" ile çökertti (kare hattında görüldü).
            focusedBorder = Border(BorderStroke(3.dp, Renkler.birincil)),
        ),
        scale = ClickableSurfaceDefaults.scale(focusedScale = 1.06f),
    ) {
        Row(
            Modifier.padding(horizontal = if (buyuk) 40.dp else 28.dp, vertical = if (buyuk) 18.dp else 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (ikon != null) {
                ikon()
                androidx.compose.foundation.layout.Spacer(Modifier.padding(start = 10.dp))
            }
            Text(metin, fontSize = if (buyuk) 30.sp else 24.sp, fontWeight = FontWeight.Medium)
        }
    }
}

/** Telefon simgesi (çizgi): adım listesinde "telefonunuzda" anlamını taşır. */
@Composable
fun TelefonSimgesi(renk: Color, modifier: Modifier = Modifier) {
    Canvas(modifier) {
        val w = size.width * 0.56f
        val h = size.height * 0.92f
        val sol = (size.width - w) / 2
        val ust = (size.height - h) / 2
        val k = size.minDimension * 0.07f
        drawRoundRect(renk, Offset(sol, ust), Size(w, h), CornerRadius(w * 0.18f), style = Stroke(k))
        drawLine(renk, Offset(size.width / 2 - w * 0.15f, ust + h - k * 2.2f), Offset(size.width / 2 + w * 0.15f, ust + h - k * 2.2f), k, StrokeCap.Round)
    }
}

/** Basit 1 → 0 yay (hata titremesi için): sönümlü sinüs. */
fun titreme(t: Float): Float = (sin(t * 6 * PI.toFloat()) * (1f - t) * max(0f, 1f - t))

@Composable
fun rememberQr(metin: String?): QrMatrisi? = remember(metin) { metin?.let { QrMatrisi.olustur(it) } }
