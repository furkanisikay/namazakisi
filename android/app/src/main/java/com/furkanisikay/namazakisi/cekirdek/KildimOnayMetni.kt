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

    /** Bildirimin ekranda kalma süresi (sonra kendiliğinden kalkar). */
    const val GORUNME_MS = 5_000L

    /** Kayıt kodu (`imsak`, `ogle`…) → görünen ad. Sabit harita (toUpperCase tuzağı yok). */
    fun gorunenAd(kayitVakti: String): String = when (kayitVakti) {
        "imsak", "sabah" -> "Sabah"
        "ogle" -> "Öğle"
        "ikindi" -> "İkindi"
        "aksam" -> "Akşam"
        "yatsi" -> "Yatsı"
        else -> "Namaz"
    }

    fun baslik(kayitVakti: String): String = "${gorunenAd(kayitVakti)} · $KABUL_DUASI"

    fun govde(kayitVakti: String): String = "${gorunenAd(kayitVakti)} namazınız kılındı olarak işaretlendi."
}
