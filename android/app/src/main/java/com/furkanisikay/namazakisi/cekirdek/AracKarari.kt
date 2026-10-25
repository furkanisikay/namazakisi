package com.furkanisikay.namazakisi.cekirdek

import java.net.URLEncoder
import java.util.Locale
import kotlin.math.roundToLong

/**
 * Android Auto ekranının (Car App Library, POI kategorisi) kararları — SAF.
 *
 * Araç ekranı iki şey gösterir: başlıkta içinde bulunulan vaktin çıkışına kalan süre
 * (ya da sıradaki vaktin girişi) ve altında yakındaki camiler; bir camiye dokunmak
 * aracın navigasyon uygulamasında yol tarifini açar.
 *
 * "Kıldım" araçta BİLİNÇLİ OLARAK YOK: Google'ın araç kalite yönergesi `PC-1`
 * ("The app must not include features outside the app types intended for cars")
 * namaz kaydı tutmayı POI işlevi saymaz; reddedilen araç incelemesi Play'de telefon
 * güncellemelerini de durdurur (docs/ajan/arac-destegi.md). Vakit bilgisi `PF-1`
 * ("meaningful functionality relevant to driving") kapsamındadır: sürücü namaz için
 * nerede ve ne zaman duracağını seçer.
 *
 * Vakit seçimi widget/kutu/asistan ile ORTAKTIR ([VakitCizelgesi.durumHesapla]);
 * kalan dakika [AsistanKarari.kalanDakika] ile aynı kuralla (yukarı yuvarlanır).
 * Metinler arayüz kaydındadır (kibar "siz"). Bu dosya Android'e dokunmaz.
 */
object AracKarari {

    /** Uygulama adı: vakit verisi yoksa başlık. */
    const val VARSAYILAN_BASLIK = "Namaz Akışı"

    /**
     * Konum yokken gösterilen ileti. Kalite yönergesi `VI-1`: telefona bakmayı
     * yalnız güvenli olduğunda önermek gerekir.
     */
    const val KONUM_YOK_METNI =
        "Yakındaki camileri gösterebilmek için konum bilgisi gerekiyor. Aracınız güvenle durduğunda telefonunuzda Namaz Akışı'nı açıp konum iznini verin."

    /** Cami verisi paketlenmemişse ya da yakında kayıt yoksa. */
    const val CAMI_YOK_METNI = "Yakınınızda kayıtlı cami bulunamadı."

    /** [KONUM_YOK_METNI]'nin arayüz dilindeki hâli. */
    fun konumYokMetni(dil: String = MetinDili.TR): String = MetinDili.metinler(dil).aracKonumYok

    /** [CAMI_YOK_METNI]'nin arayüz dilindeki hâli. */
    fun camiYokMetni(dil: String = MetinDili.TR): String = MetinDili.metinler(dil).aracCamiYok

    /** Host sınırı bilinmiyorsa liste en fazla bu kadar cami gösterir. */
    const val VARSAYILAN_CAMI_SAYISI = 6

    /** Hostun verdiği sınır ne olursa olsun üst tavan (POI listesi kısa kalmalı). */
    const val AZAMI_CAMI_SAYISI = 10

    /**
     * Başlık. İçinde bulunulan vakit henüz kılınmadıysa çıkışına kalan süre
     * ("Öğle · 42 dk kaldı"); kılındıysa ya da vakit arasındaysa sıradaki vaktin
     * girişi ("Sıradaki İkindi · 15:42"). Saate hal eki EKLENMEZ.
     */
    fun baslik(
        durum: VakitDurumu,
        kildim: KildimDurumu,
        simdiMs: Long,
        saat: (Long) -> String,
        dil: String = MetinDili.TR,
    ): String {
        val aktif = durum.aktif
        val bitis = durum.bitisMs
        if (aktif != null && bitis != null && kildim == KildimDurumu.KILINABILIR) {
            val dk = AsistanKarari.kalanDakika(bitis, simdiMs)
            val ad = VakitKodlari.gorunenAd(aktif.kod, dil)
            return MetinDili.bicim(MetinDili.metinler(dil).aracKalan, "ad" to ad, "dk" to "$dk")
        }
        val s = durum.sonraki ?: return VARSAYILAN_BASLIK
        val ad = VakitKodlari.gorunenAd(s.kod, dil)
        return MetinDili.bicim(MetinDili.metinler(dil).aracSiradaki, "ad" to ad, "saat" to saat(s.ms))
    }

    /** Listede gösterilecek cami sayısı (host sınırı `ConstraintManager`'dan gelir). */
    fun camiSayisi(hostSiniri: Int?): Int =
        (hostSiniri?.takeIf { it > 0 } ?: VARSAYILAN_CAMI_SAYISI).coerceAtMost(AZAMI_CAMI_SAYISI)

    /** Mesafe birimi — Car App `Distance` birimlerine eşlenir. */
    enum class Birim { METRE, KM_ONDALIK, KM }

    data class Mesafe(val deger: Double, val birim: Birim)

    /**
     * Gösterilecek mesafe: 1 km altı 10 m'ye yuvarlanmış metre, 10 km altı tek ondalıklı
     * km, üstü tam km. Host birim metnini kendisi yazar (DistanceSpan).
     */
    fun mesafe(metre: Double): Mesafe = when {
        metre.isNaN() || metre < 0 -> Mesafe(0.0, Birim.METRE)
        metre < 1_000 -> Mesafe(((metre / 10).roundToLong() * 10).toDouble().coerceAtLeast(10.0), Birim.METRE)
        metre < 10_000 -> Mesafe((metre / 100).roundToLong() / 10.0, Birim.KM_ONDALIK)
        else -> Mesafe((metre / 1_000).roundToLong().toDouble(), Birim.KM)
    }

    /**
     * Navigasyon niyetinin adresi (`CarContext.ACTION_NAVIGATE` ile gönderilir).
     * Biçim `geo:<lat>,<lng>?q=<lat>,<lng>(<ad>)`: koordinat sorgusu adres aramasına
     * düşmez, etiket hedefe ad verir. Ad içindeki parantezler etiketi böleceği için
     * atılır; boşluk `%20` olur (URLEncoder `+` yazar, geo şeması onu boşluk saymaz).
     */
    fun navigasyonAdresi(lat: Double, lng: Double, ad: String): String {
        val k = String.format(Locale.ROOT, "%.6f,%.6f", lat, lng)
        val temiz = ad.replace("(", " ").replace(")", " ").trim().replace(Regex("\\s+"), " ")
        if (temiz.isEmpty()) return "geo:$k?q=$k"
        val etiket = URLEncoder.encode(temiz, "UTF-8").replace("+", "%20")
        return "geo:$k?q=$k($etiket)"
    }

    /** Konum adayı: cihazın son bilinen konumu ya da Camideyim'in son yenileme merkezi. */
    data class KonumAdayi(val lat: Double, val lng: Double, val zamanMs: Long)

    /**
     * En taze GEÇERLİ konum. `(0,0)` "henüz yapılandırılmadı" nöbetçisidir (Gine
     * Körfezi'ne göre cami aramak anlamsız); NaN/aralık dışı değerler elenir.
     */
    fun konumSec(adaylar: List<KonumAdayi>): KonumAdayi? = adaylar
        .filter { gecerliMi(it.lat, it.lng) }
        .maxByOrNull { it.zamanMs }

    fun gecerliMi(lat: Double, lng: Double): Boolean =
        !lat.isNaN() && !lng.isNaN() && lat in -90.0..90.0 && lng in -180.0..180.0 && !(lat == 0.0 && lng == 0.0)

    /** Başlığın bir sonraki tazelenme anı: bir sonraki dakika başı (+ küçük pay). */
    fun sonrakiTazelemeMs(simdiMs: Long): Long = simdiMs - (simdiMs % 60_000) + 60_000 + 500
}
