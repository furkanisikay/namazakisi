package com.furkanisikay.namazakisi.cekirdek

/**
 * Bildirimdeki "Kıldım"a basılınca kısa süre görünen SESSİZ teşekkür — SAF (android.* yok).
 *
 * Sahip isteği: "Kılındı / Tamamlandı" yerine "Allah kabul etsin". Bildirim kaybolup
 * hiçbir şey olmamış gibi kalsaydı kullanıcı dokunuşun işe yarayıp yaramadığını bilemezdi
 * (Samsung'da JS gecikir, uygulama açılmaz). Metin JS `core/samimiyet/kabulDuasi.ts`
 * `KABUL_DUASI` ile AYNI sabit kalıptır (dönüşüm yalnız uygulama içinde; native yüzeyler
 * tek kalıp kullanır). Başlık önden okunur: vakit adı öne (bileklik ilk ~16 karakteri gösterir).
 */
object KildimOnayMetni {
    const val KABUL_DUASI = "Allah kabul etsin"

    /** [KABUL_DUASI]'nın arayüz dilindeki hâli — JS `samimiyet.kabulDuasi` ("May Allah accept it"). */
    fun kabulDuasi(dil: String = MetinDili.TR): String = MetinDili.metinler(dil).kabulDuasi

    /** Bildirimin ekranda kalma süresi (sonra kendiliğinden kalkar). */
    const val GORUNME_MS = 5_000L

    /** Kayıt kodu (`imsak`, `ogle`…) → görünen ad. Sabit harita (toUpperCase tuzağı yok). */
    fun gorunenAd(kayitVakti: String, dil: String = MetinDili.TR): String = when (kayitVakti) {
        "imsak", "sabah" -> VakitKodlari.gorunenAd(VakitKodlari.SABAH, dil)
        "ogle", "ikindi", "aksam", "yatsi" -> VakitKodlari.gorunenAd(kayitVakti, dil)
        else -> MetinDili.metinler(dil).namaz
    }

    fun baslik(kayitVakti: String, dil: String = MetinDili.TR): String =
        "${gorunenAd(kayitVakti, dil)} · ${kabulDuasi(dil)}"

    fun govde(kayitVakti: String, dil: String = MetinDili.TR): String =
        MetinDili.bicim(MetinDili.metinler(dil).onayGovde, "ad" to gorunenAd(kayitVakti, dil))
}
