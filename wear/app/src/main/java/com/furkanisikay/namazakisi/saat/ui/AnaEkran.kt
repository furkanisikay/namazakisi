package com.furkanisikay.namazakisi.saat.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.ui.res.painterResource
import com.furkanisikay.namazakisi.saat.R
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.TransformingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberTransformingLazyColumnState
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.Icon
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TimeText
import androidx.wear.compose.material3.lazy.rememberTransformationSpec
import androidx.wear.compose.material3.lazy.transformedHeight
import androidx.compose.runtime.LaunchedEffect
import com.furkanisikay.namazakisi.saat.cekirdek.AnaEkranKarari
import com.furkanisikay.namazakisi.saat.cekirdek.BilekJesti
import com.furkanisikay.namazakisi.saat.telefon.TelefondaAc
import com.furkanisikay.namazakisi.saat.cekirdek.TelefonKomutu
import com.furkanisikay.namazakisi.saat.cekirdek.KalanSure
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk

/**
 * Ana ekran (yeniden tasarım W1): ilk öğe TAM EKRAN vakit yayı + sayaç; aşağı kaydırınca
 * günün vakitleri, en altta konum adı, tesbihat ve kıble girişleri.
 *
 * Ekran metinleri arayüz dilidir: kibar "siz" (AGENTS.md). Dokunma hedefleri ≥48 dp
 * (CompactButton görünürde 32 dp, dokunma payıyla 48 dp). Taç: `TransformingLazyColumn`'ın
 * varsayılan `rotaryScrollableBehavior`'ı.
 *
 * @param saniyeGoster etkileşimli + ön planda ve ekran görüntüsü kipinde DEĞİLKEN true
 */
@Composable
fun AnaEkran(
    yuk: Yuk?,
    bekleyen: Set<String>,
    guncellemeGerekli: Boolean,
    bildirimIzni: Boolean,
    simdi: Long,
    bugun: String,
    saniyeGoster: Boolean,
    jest: BilekJesti.Istek,
    onKildim: (tarih: String, vakit: String) -> Unit,
    onTesbihat: () -> Unit,
    onKible: () -> Unit,
    /** "Telefonda açın" (saat W3, fikir 4): `TelefondaAc` bağlantısı. */
    onTelefondaAc: (String) -> Unit = {},
    /** Telefondan gelen Camideyim / Namaz modu gösterimi (saat W3); bitişler süzülmüş. */
    cami: TelefonKomutu.CamiDurumu? = null,
    /** Namaz modu aç/kapat (saat W3, fikir 1) — telefona RPC. */
    onNamazModu: () -> Unit = {},
    /** Camideyim cevabı (saat W3, fikir 5): "evet" | "hayir" | "camiDegil". */
    onCamiCevap: (cevap: String, yerId: String) -> Unit = { _, _ -> },
    /** Telefona istek sürüyor (düğmeler kilitli, çift dokunuş olmasın). */
    istekSuruyor: Boolean = false,
    /**
     * Saat sesli anonsu (saat W3, fikir 9): konuşamıyorsa nedeni (hoparlör / motor / Türkçe
     * ses yok) — kibar bilgi satırı; null = sorun yok ya da saat bu ayarla konuşmaz.
     */
    sesBilgisi: String? = null,
    /** "Sesi deneyin" düğmesinin açıklaması (ör. otomatik ayarda telefon yanındayken susar). */
    sesAciklamasi: String? = null,
    /** Saat bu ayarla konuşabiliyorsa deneme (null = düğme yok). */
    onSesDene: (() -> Unit)? = null,
) {
    val liste = rememberTransformingLazyColumnState()
    val donusum = rememberTransformationSpec()
    var onay by remember { mutableStateOf<VakitHesabi.Satir?>(null) }
    val ekran = LocalConfiguration.current
    val yanBosluk = (ekran.screenWidthDp * 0.08f).dp

    val gorunum = yuk?.let { AnaEkranKarari.kur(it, simdi, bugun, bekleyen) }
    val satirlar = yuk?.let { VakitHesabi.satirlar(it, simdi, bugun, bekleyen) } ?: emptyList()
    val sayilan = gorunum?.sayilan

    // Bilek jesti (saat W3): merkezdeki öğeden bir adım; ilk kompozisyonda (sira 0) yok.
    LaunchedEffect(jest.sira) {
        if (jest.sira == 0) return@LaunchedEffect
        liste.animateScrollToItem(BilekJesti.hedef(liste.anchorItemIndex, liste.layoutInfo.totalItemsCount, jest.yon))
    }

    SaatTemasi {
        AppScaffold(timeText = { TimeText() }) {
            // Onay katmanı açıkken alttaki ekran erişilebilirlik ağacından çıkar: katman
            // görsel olarak modal, TalkBack için de modal olmalı.
            val katmanAcik = onay != null && yuk != null
            ScreenScaffold(
                scrollState = liste,
                contentPadding = PaddingValues(bottom = 36.dp),
                modifier = if (katmanAcik) Modifier.clearAndSetSemantics { } else Modifier,
            ) { icBosluk ->
                TransformingLazyColumn(
                    state = liste,
                    contentPadding = icBosluk,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    // Tam ekran ilk öğe: kenar dönüşümü UYGULANMAZ (sayaç kaydırılırken küçülmesin).
                    item(key = "sayac") {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.fillMaxWidth().height(ekran.screenHeightDp.dp),
                        ) {
                            when {
                                gorunum != null -> VakitSayaci(
                                    g = gorunum,
                                    saniyeGoster = saniyeGoster,
                                    onKildim = { onay = gorunum.satir },
                                    ortuluMu = onay != null,
                                    modifier = Modifier.fillMaxWidth().height(ekran.screenHeightDp.dp),
                                )
                                yuk == null && guncellemeGerekli -> BilgiMetni(GUNCELLEME_METNI, Modifier.padding(horizontal = 16.dp))
                                yuk == null -> BilgiMetni(
                                    "Vakitleri görmek için telefonunuzda Namaz Akışı'nı açın.",
                                    Modifier.padding(horizontal = 16.dp),
                                )
                                // Yük tükendi (telefon günlerce veri göndermedi).
                                else -> BilgiMetni(
                                    "Vakit bilgisi eskidi. Yenilemek için telefonunuzda Namaz Akışı'nı açın.",
                                    Modifier.padding(horizontal = 16.dp),
                                )
                            }
                        }
                    }
                    // Camideyim (saat W3, fikir 5): soru ve camide hâli telefonun kararıdır.
                    cami?.soru?.let { soru ->
                        item(key = "cami_soru") {
                            CamiSatiri(
                                baslik = "Camide misiniz?",
                                alt = soru.ad,
                                dugmeler = listOf(
                                    Triple("Evet", "Evet, camideyim. Namaz modunu açar") { onCamiCevap("evet", soru.yerId) },
                                    Triple("Hayır", "Hayır, camide değilim") { onCamiCevap("hayir", soru.yerId) },
                                ),
                                kilitli = istekSuruyor,
                            )
                        }
                    }
                    cami?.camide?.let { yer ->
                        item(key = "cami_camide") {
                            CamiSatiri(
                                baslik = "Camidesiniz",
                                alt = yer.ad,
                                dugmeler = listOf(
                                    Triple("Burası cami değil", "Burası cami değil. Bu yer bir daha cami sayılmaz") {
                                        onCamiCevap("camiDegil", yer.yerId)
                                    },
                                ),
                                kilitli = istekSuruyor,
                            )
                        }
                    }
                    // Namaz modu bilekten (saat W3, fikir 1). Durum telefondan gelir; telefon yoksa
                    // düğme yine çizilir, basınca "Telefonunuza ulaşılamadı" denir.
                    item(key = "namaz_modu") {
                        val bitis = cami?.modBitisMs
                        NamazModuSatiri(
                            acikBitis = bitis?.let { VakitHesabi.saat(it) },
                            kilitli = istekSuruyor,
                            onDokun = onNamazModu,
                        )
                    }
                    if (yuk != null && guncellemeGerekli) {
                        item(key = "guncelleme") { BilgiMetni(GUNCELLEME_METNI) }
                    }
                    if (sesBilgisi != null) {
                        item(key = "ses_bilgisi") { BilgiMetni(sesBilgisi) }
                    }
                    if (yuk != null && !bildirimIzni) {
                        item(key = "izin") {
                            BilgiMetni("Telefonunuz yanınızda değilken de hatırlatma almak için saatin ayarlarından Namaz Akışı bildirimlerine izin verin.")
                        }
                    }
                    items(satirlar, key = { "${it.tarih}_${it.vakit}" }) { satir ->
                        val aktif = sayilan?.mod == KalanSure.Mod.CIKIS &&
                            sayilan.tarih == satir.tarih && sayilan.vakit == satir.vakit
                        VakitSatiri(
                            satir = satir,
                            aktif = aktif,
                            kalanMetni = if (aktif) VakitHesabi.kalanMetni(sayilan.kalanMs(simdi)) else null,
                            onSec = { onay = satir },
                            modifier = Modifier
                                .padding(horizontal = yanBosluk)
                                .transformedHeight(this, donusum)
                                .graphicsLayer { with(donusum) { applyContainerTransformation(scrollProgress) } },
                        )
                    }
                    if (yuk != null) {
                        item(key = "konum") { BilgiMetni(yuk.konumAdi, Modifier.padding(top = 6.dp)) }
                    }
                    // Tesbihat telefon verisine bağlı değildir: yük yokken de açılır.
                    item(key = "tesbihat") {
                        CompactButton(
                            onClick = onTesbihat,
                            colors = ButtonDefaults.filledTonalButtonColors(),
                            modifier = Modifier.semantics { contentDescription = "Tesbihat sayacını açın" },
                            icon = { DugmeIkonu(R.drawable.ic_tesbihat) },
                            label = { Text("Tesbihat") },
                        )
                    }
                    // Kıble (saat W2): yük/konum yoksa ekran kendisi yönlendirir.
                    item(key = "kible") {
                        CompactButton(
                            onClick = onKible,
                            colors = ButtonDefaults.filledTonalButtonColors(),
                            modifier = Modifier.semantics { contentDescription = "Kıble pusulasını açın" },
                            icon = { DugmeIkonu(R.drawable.ic_kible) },
                            label = { Text("Kıble") },
                        )
                    }
                    // Sesli okuma denemesi: vakit beklemeden "saat konuşuyor mu?" sorusunu cevaplar.
                    if (onSesDene != null) {
                        item(key = "ses_dene") {
                            CompactButton(
                                onClick = onSesDene,
                                colors = ButtonDefaults.filledTonalButtonColors(),
                                modifier = Modifier.semantics { contentDescription = "Saatin sesli okumasını deneyin" },
                                label = { Text("Sesi deneyin") },
                            )
                        }
                        if (sesAciklamasi != null) {
                            item(key = "ses_aciklama") { BilgiMetni(sesAciklamasi) }
                        }
                    }
                    // Saate sığmayan ekranlar telefonda açılır (yalnız gezinme bağlantıları).
                    item(key = "telefonda") { BilgiMetni("Telefonda açın", Modifier.padding(top = 8.dp)) }
                    for ((anahtar, etiket, baglanti) in TELEFON_EKRANLARI) {
                        item(key = anahtar) {
                            CompactButton(
                                onClick = { onTelefondaAc(baglanti) },
                                colors = ButtonDefaults.filledTonalButtonColors(),
                                modifier = Modifier.semantics { contentDescription = "$etiket ekranını telefonunuzda açın" },
                                label = { Text(etiket) },
                            )
                        }
                    }
                }
            }

            val secili = onay
            if (secili != null && yuk != null) {
                val anaVakit = sayilan?.mod == KalanSure.Mod.CIKIS &&
                    sayilan.tarih == secili.tarih && sayilan.vakit == secili.vakit
                KildimOnayi(
                    ad = secili.ad,
                    vakitRengi = SaatPaleti.vakitRengi(secili.vakit),
                    kalanOran = if (anaVakit) gorunum.kalanOran else 0f,
                    kerahat = VakitHesabi.kerahatMi(yuk, simdi),
                    onOnayla = {
                        // Karar dokunuş anında YENİDEN doğrulanır: arada telefon işaretlediyse
                        // ya da vakit değiştiyse yazılmaz ve katman başarı göstermez.
                        val hala = AnaEkranKarari.onayGecerliMi(
                            yuk, System.currentTimeMillis(), bugun, bekleyen, secili.tarih, secili.vakit,
                        )
                        if (hala) onKildim(secili.tarih, secili.vakit)
                        hala
                    },
                    onKapat = { onay = null },
                )
            }
        }
    }
}

/**
 * Telefon saatin tanımadığı DAHA YENİ bir şema gönderdi → güncellenmesi gereken SAAT
 * uygulamasıdır (eski metin telefonu işaret ediyordu).
 */
/** Liste düğmelerinin simgesi: tile'daki kısayollarla aynı tek renkli çizim (dekoratif). */
@Composable
private fun DugmeIkonu(kaynak: Int) {
    Icon(painterResource(kaynak), contentDescription = null, modifier = Modifier.size(18.dp))
}

private const val GUNCELLEME_METNI = "Saatinizdeki Namaz Akışı'nı güncelleyin."

private val TELEFON_EKRANLARI = listOf(
    Triple("tel_kaza", "Kaza Defteri", TelefondaAc.KAZA),
    Triple("tel_cami", "Camideyim", TelefondaAc.CAMIDEYIM),
    Triple("tel_ayar", "Ayarlar", TelefondaAc.AYARLAR),
)
