package com.furkanisikay.namazakisi.tv.ui

import android.provider.Settings
import android.view.WindowManager
import androidx.activity.compose.LocalActivity
import androidx.compose.animation.Crossfade
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Border
import androidx.tv.material3.ClickableSurfaceDefaults
import androidx.tv.material3.Surface
import androidx.tv.material3.Text
import com.furkanisikay.namazakisi.tv.R
import com.furkanisikay.namazakisi.tv.cekirdek.Bicim
import com.furkanisikay.namazakisi.tv.cekirdek.EvDurumu
import com.furkanisikay.namazakisi.tv.cekirdek.UyeHali
import com.furkanisikay.namazakisi.tv.cekirdek.GunlukVakitler
import com.furkanisikay.namazakisi.tv.cekirdek.Il
import com.furkanisikay.namazakisi.tv.cekirdek.Kaydirma
import com.furkanisikay.namazakisi.tv.cekirdek.Kerahat
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

/** "Animasyonları kaldır" açık mı (animatör ölçeği 0)? Wear `hareketAzaltilmis` ikizi. */
@Composable
fun hareketAzaltilmis(): Boolean {
    val baglam = LocalContext.current
    return remember {
        Settings.Global.getFloat(baglam.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f
    }
}

/** Vaktin simgesi (saatle aynı çizimler; tek renk, Compose boyar). */
fun vakitSimgesi(vakit: Vakit): Int = when (vakit) {
    Vakit.IMSAK -> R.drawable.ic_vakit_imsak
    Vakit.GUNES -> R.drawable.ic_vakit_gunes
    Vakit.OGLE -> R.drawable.ic_vakit_ogle
    Vakit.IKINDI -> R.drawable.ic_vakit_ikindi
    Vakit.AKSAM -> R.drawable.ic_vakit_aksam
    Vakit.YATSI -> R.drawable.ic_vakit_yatsi
}

/** Kerahatin simgesi = güneşin o anki hâli (doğuş / tepe / batış). */
private fun kerahatSimgesi(tur: Kerahat.Tur): Int = when (tur) {
    Kerahat.Tur.SURUK -> R.drawable.ic_vakit_gunes
    Kerahat.Tur.ISTIVA -> R.drawable.ic_vakit_ogle
    Kerahat.Tur.GURUB -> R.drawable.ic_vakit_aksam
}

private val RAKAM = TextStyle(fontFeatureSettings = "tnum")

/**
 * Pano ekranı (10-foot): solda saat + "sıradaki vakte kalan" (birimli, iri), sağda günün
 * altı vakti simgeleriyle. Metin en az: kerahat ve cuma tek satırlık simgeli çip.
 *
 * Hareket YALNIZ OLAYLA: vakit değişince aktif satırın zemini 600 ms'de yeni satıra geçer,
 * sıradaki vaktin adı/simgesi 400 ms crossfade. Saat ve süre her saniye değişir ama
 * animasyon değildir. "Animasyonları kaldır" açıksa geçişler anında son kareye atlar.
 *
 * [ekraniAcikTut] yalnız etkinlikte (Activity) true verilir: `FLAG_KEEP_SCREEN_ON` YALNIZ
 * bu ekran görünürken pencerede durur. Ekran koruyucuda (DreamService) sistem ekranı zaten
 * açık tutar.
 */
@Composable
fun PanoEkrani(
    il: Il,
    ekraniAcikTut: Boolean,
    uyeler: List<UyeHali> = emptyList(),
    onAyarlar: (() -> Unit)?,
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
    val azalt = hareketAzaltilmis()

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
            horizontalArrangement = Arrangement.spacedBy(48.dp),
        ) {
            SolSutun(il, durum, simdi, bolge, azalt, onAyarlar, uyeler, onbellek, Modifier.weight(1.1f))
            VakitListesi(durum, simdi, bolge, azalt, Modifier.weight(1f))
        }
    }
}

@Composable
private fun SolSutun(
    il: Il,
    durum: PanoDurumu,
    simdi: Long,
    bolge: ZoneId,
    azalt: Boolean,
    onAyarlar: (() -> Unit)?,
    uyeler: List<UyeHali>,
    onbellek: VakitOnbellegi,
    modifier: Modifier,
) {
    // Ev ekranı katmanı (tasarım §4.6): yalnız eşleşik üyelerden gelen durumla; boşta hesap ucuz.
    val bant = EvDurumu.bant(durum, uyeler, simdi)
    val cumaCikis = EvDurumu.cumaCikisMs(durum, uyeler, simdi)
    val ramazanSayaci = if (EvDurumu.ramazan(uyeler, simdi)) {
        val bugun = java.time.Instant.ofEpochMilli(simdi).atZone(bolge).toLocalDate()
        EvDurumu.ramazanSayaci(onbellek.al(bugun), onbellek.al(bugun.plusDays(1)).imsak, simdi)
    } else {
        null
    }
    Column(modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceBetween) {
        Column {
            Text(il.ad, color = Renkler.metin, fontSize = 32.sp, fontWeight = FontWeight.SemiBold)
            Text(Bicim.tarih(durum.tarih), color = Renkler.metinIkincil, fontSize = 24.sp)
            if (bant != null) {
                Spacer(Modifier.height(16.dp))
                SessizBant(bant)
            }
        }

        Row(verticalAlignment = Alignment.Bottom) {
            Text(
                Bicim.saat(simdi, bolge),
                style = RAKAM,
                color = Renkler.metin,
                fontSize = 120.sp,
                fontWeight = FontWeight.Light,
                lineHeight = 120.sp,
            )
            Text(
                Bicim.saniye(simdi, bolge),
                style = RAKAM,
                color = Renkler.metinIkincil,
                fontSize = 40.sp,
                modifier = Modifier.padding(start = 8.dp, bottom = 18.dp),
            )
        }

        if (ramazanSayaci != null) RamazanBlogu(ramazanSayaci, durum, simdi) else KalanBlogu(durum, simdi, azalt)

        BilgiCipleri(durum, bolge, cumaCikis, simdi)

        if (onAyarlar != null) AyarlarDugmesi(onAyarlar)
    }
}

/**
 * "Sıradaki vakte kalan": simge + ad, iri birimli süre, şu anki vaktin dolan çubuğu.
 * Süre birimlidir ("18 dk 25 sn"): birimsiz "18:25" duvar saatinin yanında saat sanılıyordu.
 */
@Composable
private fun KalanBlogu(durum: PanoDurumu, simdi: Long, azalt: Boolean) {
    val ad = durum.gorunenAd(durum.siradaki)
    Column(
        Modifier.clearAndSetSemantics {
            contentDescription = "$ad vaktine ${Bicim.kalanSesli(durum.kalanMs)} kaldı"
        },
    ) {
        Crossfade(targetState = durum.siradaki, animationSpec = tween(if (azalt) 0 else 400), label = "siradaki") { v ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Simge(vakitSimgesi(v), Renkler.birincil, 30.dp)
                Spacer(Modifier.width(12.dp))
                Text("${durum.gorunenAd(v)} vaktine", color = Renkler.metinIkincil, fontSize = 28.sp)
            }
        }
        Row(verticalAlignment = Alignment.Bottom) {
            Bicim.kalanParcalari(durum.kalanMs).forEachIndexed { i, p ->
                if (i > 0) Spacer(Modifier.width(18.dp))
                Text(
                    p.sayi,
                    style = RAKAM,
                    color = Renkler.metin,
                    fontSize = 76.sp,
                    fontWeight = FontWeight.SemiBold,
                    lineHeight = 80.sp,
                )
                Text(
                    p.birim,
                    color = Renkler.metinIkincil,
                    fontSize = 32.sp,
                    modifier = Modifier.padding(start = 6.dp, bottom = 12.dp),
                )
            }
        }
        Spacer(Modifier.height(10.dp))
        // Şu anki vaktin ne kadarı geçti: dakikada bir piksel ilerler, animasyon değildir.
        val oran = Bicim.ilerleme(durum.vakitler.saat(durum.aktif), durum.siradakiMs, simdi)
        Box(
            Modifier
                .width(420.dp)
                .height(8.dp)
                .background(Renkler.sinir, CircleShape),
        ) {
            Box(
                Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(oran)
                    .background(Renkler.birincil, CircleShape),
            )
        }
    }
}

/** Kerahat ve cuma: simge + iki-üç kelime. Amber yalnız simgede; metin daima tema metni. */
@Composable
private fun BilgiCipleri(durum: PanoDurumu, bolge: ZoneId, cumaCikis: Long?, simdi: Long) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        val kerahat = durum.kerahat
        if (kerahat != null) {
            // Saate hal eki EKLENMEZ ("18:23'e" okunuşa göre değişir).
            BilgiCipi(
                simge = kerahatSimgesi(kerahat.tur),
                simgeRengi = Renkler.uyari,
                baslik = "Kerahat vakti",
                ek = "bitiş ${Bicim.saat(kerahat.bitis, bolge)}",
                aciklama = "Kerahat vakti, ${kerahat.tur.ad}, bitiş ${Bicim.saat(kerahat.bitis, bolge)}. ${kerahat.tur.aciklama}",
            )
        }
        if (cumaCikis != null) {
            // Cuma kartı: telefonun yürüme + hazırlık süresinden; saate hal eki EKLENMEZ.
            val gecti = simdi >= cumaCikis
            BilgiCipi(
                simge = R.drawable.ic_cami,
                simgeRengi = Renkler.birincil,
                baslik = "Cumaya ${Bicim.kalanKisa(durum.vakitler.ogle - simdi)}",
                ek = if (gecti) "çıkış vakti geldi" else "çıkış ${Bicim.saat(cumaCikis, bolge)}",
                aciklama = if (gecti) "Cuma için çıkış vakti geldi" else "Cuma için çıkış ${Bicim.saat(cumaCikis, bolge)}",
            )
        } else if (durum.cuma) {
            BilgiCipi(
                simge = R.drawable.ic_cami,
                simgeRengi = Renkler.birincil,
                baslik = "Bugün cuma",
                ek = "öğle ${Bicim.saat(durum.vakitler.ogle, bolge)}",
                aciklama = "Bugün cuma. Cuma namazı öğle vaktinde, ${Bicim.saat(durum.vakitler.ogle, bolge)}",
            )
        }
    }
}

@Composable
private fun BilgiCipi(simge: Int, simgeRengi: Color, baslik: String, ek: String, aciklama: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .background(Renkler.kart, RoundedCornerShape(28.dp))
            .padding(start = 10.dp, end = 22.dp, top = 8.dp, bottom = 8.dp)
            .clearAndSetSemantics { contentDescription = aciklama },
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(40.dp).background(simgeRengi.copy(alpha = 0.18f), CircleShape),
        ) { Simge(simge, simgeRengi, 24.dp) }
        Spacer(Modifier.width(14.dp))
        Text(baslik, color = Renkler.metin, fontSize = 24.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.width(12.dp))
        Text(ek, style = RAKAM, color = Renkler.metinIkincil, fontSize = 24.sp)
    }
}

/**
 * Panodaki TEK odaklanabilir öğe (ekran görüntüsü hattı D-pad ↓ ile bunu bulur).
 * Odakta: beyaz zemin + yeşil halka + hafif büyüme — uzaktan renk körü kullanıcı da görür.
 */
@Composable
private fun AyarlarDugmesi(onAyarlar: () -> Unit) {
    Surface(
        onClick = onAyarlar,
        shape = ClickableSurfaceDefaults.shape(RoundedCornerShape(28.dp)),
        colors = ClickableSurfaceDefaults.colors(
            containerColor = Renkler.kart,
            contentColor = Renkler.metin,
            focusedContainerColor = Renkler.metin,
            focusedContentColor = Renkler.arkaplan,
        ),
        border = ClickableSurfaceDefaults.border(
            focusedBorder = Border(BorderStroke(3.dp, Renkler.birincil), inset = (-4).dp),
        ),
        scale = ClickableSurfaceDefaults.scale(focusedScale = 1.06f),
        modifier = Modifier.semantics { contentDescription = "Ayarlar: telefon ekleme, konum, bağlı telefonlar" },
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(start = 18.dp, end = 24.dp, top = 10.dp, bottom = 10.dp),
        ) {
            // Simge içerik rengini izler (odakta koyu, değilken beyaz).
            Image(
                painterResource(R.drawable.ic_konum),
                contentDescription = null,
                colorFilter = ColorFilter.tint(androidx.tv.material3.LocalContentColor.current),
                modifier = Modifier.size(24.dp),
            )
            Spacer(Modifier.width(10.dp))
            Text("Ayarlar", fontSize = 22.sp)
        }
    }
}

@Composable
private fun VakitListesi(durum: PanoDurumu, simdi: Long, bolge: ZoneId, azalt: Boolean, modifier: Modifier) {
    Column(
        modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically),
    ) {
        for (vakit in Vakit.entries) {
            val aktif = vakit == durum.aktif
            val siradaki = vakit == durum.siradaki && durum.siradakiMs == durum.vakitler.saat(vakit)
            // Geçmiş vakit sönük: günün nereye geldiği tek bakışta okunur.
            val gecti = !aktif && durum.vakitler.saat(vakit) < simdi
            val zemin by animateColorAsState(
                if (aktif) Renkler.birincilKoyu else Renkler.kart,
                tween(if (azalt) 0 else 600),
                label = "satirZemini",
            )
            val metinRengi = if (gecti) Renkler.metinIkincil else Renkler.metin
            val sekil = RoundedCornerShape(18.dp)
            Row(
                Modifier
                    .fillMaxWidth()
                    .height(72.dp)
                    .background(zemin, sekil)
                    .then(if (siradaki) Modifier.border(2.dp, Renkler.birincil, sekil) else Modifier)
                    .padding(horizontal = 24.dp)
                    .clearAndSetSemantics {
                        contentDescription = buildString {
                            append(durum.gorunenAd(vakit)).append(' ')
                            append(Bicim.saat(durum.vakitler.saat(vakit), bolge))
                            if (aktif) append(", şu anki vakit")
                            if (siradaki) append(", sıradaki vakit")
                        }
                    },
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Simge(
                    vakitSimgesi(vakit),
                    when {
                        aktif -> Renkler.metin
                        siradaki -> Renkler.birincil
                        else -> metinRengi
                    },
                    32.dp,
                )
                Spacer(Modifier.width(20.dp))
                Text(
                    durum.gorunenAd(vakit),
                    color = metinRengi,
                    fontSize = 32.sp,
                    fontWeight = if (aktif) FontWeight.Bold else FontWeight.Normal,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                // "şimdi" çipi BİLİNÇLİ YOK: dar sütunda "Akşam"ı "Akşa…"ya kesiyordu (kare
                // turunda görüldü); dolu yeşil zemin + soldaki geri sayım anlamı zaten taşıyor.
                Text(
                    Bicim.saat(durum.vakitler.saat(vakit), bolge),
                    style = RAKAM,
                    color = metinRengi,
                    fontSize = 36.sp,
                    fontWeight = if (aktif) FontWeight.Bold else FontWeight.Medium,
                )
            }
        }
    }
}

@Composable
private fun Simge(kaynak: Int, renk: Color, boyut: Dp) {
    Image(
        painterResource(kaynak),
        contentDescription = null,
        colorFilter = ColorFilter.tint(renk),
        modifier = Modifier.size(boyut),
    )
}

/**
 * Ramazan: büyük sayaç iftar/sahur olur (birimli, panonun sayacıyla aynı biçim); olağan
 * "vaktine kalan" altta tek satır kalır.
 */
@Composable
private fun RamazanBlogu(sayac: EvDurumu.Sayac, durum: PanoDurumu, simdi: Long) {
    val kalan = (sayac.hedefMs - simdi).coerceAtLeast(0)
    val simge = if (sayac.baslik.startsWith("İftar")) R.drawable.ic_vakit_aksam else R.drawable.ic_vakit_imsak
    Column(Modifier.clearAndSetSemantics { contentDescription = "${sayac.baslik} ${Bicim.kalanSesli(kalan)}" }) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Simge(simge, Renkler.birincil, 30.dp)
            Spacer(Modifier.width(12.dp))
            Text(sayac.baslik, color = Renkler.metinIkincil, fontSize = 28.sp)
        }
        Row(verticalAlignment = Alignment.Bottom) {
            Bicim.kalanParcalari(kalan).forEachIndexed { i, p ->
                if (i > 0) Spacer(Modifier.width(18.dp))
                Text(p.sayi, style = RAKAM, color = Renkler.metin, fontSize = 76.sp, fontWeight = FontWeight.SemiBold, lineHeight = 80.sp)
                Text(p.birim, color = Renkler.metinIkincil, fontSize = 32.sp, modifier = Modifier.padding(start = 6.dp, bottom = 12.dp))
            }
        }
        Spacer(Modifier.height(6.dp))
        Text(
            "${durum.gorunenAd(durum.siradaki)} vaktine ${Bicim.kalanKisa(durum.kalanMs)}",
            style = RAKAM,
            color = Renkler.metinIkincil,
            fontSize = 24.sp,
        )
    }
}

/**
 * Sessiz vakit bandı (tasarım §4.6): ses YOK, kişi/sayı ima etmez, yalnız kalan süre. Sakin:
 * dikkat rengi yalnız noktada ve ince kenarda; metin tema metni.
 */
@Composable
private fun SessizBant(metin: String) {
    Row(
        Modifier
            .background(Renkler.kart, RoundedCornerShape(28.dp))
            .border(1.5.dp, Renkler.uyari.copy(alpha = 0.6f), RoundedCornerShape(28.dp))
            .padding(horizontal = 22.dp, vertical = 12.dp)
            .semantics { liveRegion = LiveRegionMode.Polite },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(12.dp).background(Renkler.uyari, CircleShape))
        Spacer(Modifier.width(14.dp))
        Text(metin, color = Renkler.metin, fontSize = 26.sp, fontWeight = FontWeight.Medium)
    }
}
