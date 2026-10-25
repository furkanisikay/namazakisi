package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject

/**
 * Kullanıcının seçtiği VAKİT ADI TAKIMI (ör. Almancada "Fajr" yerine "Morgengebet") — dil
 * tablosunun ([CekirdekMetinleri]) vakit adlarını İSTEĞE BAĞLI geçersiz kılar. SAF.
 *
 * JS etkin takımı `vakitAdlariniAyarla(json | null)` köprüsüyle yazar (Android
 * `namazakisi_dil` / `vakit_adlari`, `ArayuzDili.vakitAdlariniOku`). Biçim:
 * `{"adlar":{imsak,gunes,ogle,ikindi,aksam,yatsi},"buyuk":{…},"kucuk":{…},"cuma":"…",
 * "imsakVakti":"…","gunesDogusu":"…"}` (anahtarlar `VakitAdi` kodları). Yoksa, boşsa ya da
 * bozuksa [coz] `null` döner ve tablo kullanılır; hiçbir zaman fırlatmaz. Eksik ya da boş
 * TEK alan yalnız o alanda tabloya düşer.
 *
 * Çekimli biçimler (Türkçe yönelme hâli "öğleye") takımdan türetilemez: takım varken klasik
 * widget çekimsiz kalıba (`CekirdekMetinleri.yonelme`) düşer.
 *
 * Sözleşme: [etkin] yalnız `ArayuzDili.oku` (`Context.arayuzDili()`) koşunca tazelenir. Takımı
 * okuyan yollar (widget, hızlı ayar kutusu, "Kıldım" onay bildirimi, kısayol/`KildimIslemleri`,
 * asistan, araç ekranı, otomasyon düzenleyicisi) `dil`'i AYNI çağrı yolunda `arayuzDili()` ile
 * alır; `dil`'i alanda saklayan yeni bir yüzey takımı göremez. `res/values*` kaynaklarındaki
 * çekimli adlar (cami bildirimi "Öğle namazını") ve widget önizleme düzenleri takımı OKUMAZ.
 */
data class VakitAdlari(
    val adlar: Map<String, String>,
    val buyuk: Map<String, String>,
    val kucuk: Map<String, String>,
    val cuma: String?,
    val imsakVakti: String?,
    val gunesDogusu: String?,
) {
    /** Widget kodu (`sabah`, `gunes`, `ogle`…) için görünen ad; takımda yoksa `null`. */
    fun widgetAdi(kod: String): String? = adlar[if (kod == VakitKodlari.SABAH) "imsak" else kod]

    companion object {
        val VAKITLER = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")

        /**
         * Android katmanının en son okuduğu takım (`ArayuzDili.oku` her okumada tazeler).
         * Süreç başına tek değer; saf testler bunu kullanmaz, takımı açıkça verir.
         */
        @Volatile
        var etkin: VakitAdlari? = null
            private set

        @Volatile
        private var sonHam: String? = null

        /** Ham JSON'u (değiştiyse) çözüp [etkin]'e yazar; `null`/bozuk → `null`. */
        fun etkinYap(ham: String?) {
            if (ham == sonHam) return
            etkin = coz(ham)
            sonHam = ham
        }

        /** JSON → takım; yok, boş, bozuk ya da hiç kullanılabilir ad yoksa `null`. Fırlatmaz. */
        fun coz(json: String?): VakitAdlari? {
            if (json.isNullOrBlank()) return null
            return try {
                val o = JSONObject(json)
                val sonuc = VakitAdlari(
                    adlar = harita(o.optJSONObject("adlar")),
                    buyuk = harita(o.optJSONObject("buyuk")),
                    kucuk = harita(o.optJSONObject("kucuk")),
                    cuma = metin(o, "cuma"),
                    imsakVakti = metin(o, "imsakVakti"),
                    gunesDogusu = metin(o, "gunesDogusu"),
                )
                val bos = sonuc.adlar.isEmpty() && sonuc.buyuk.isEmpty() && sonuc.kucuk.isEmpty() &&
                    sonuc.cuma == null && sonuc.imsakVakti == null && sonuc.gunesDogusu == null
                if (bos) null else sonuc
            } catch (_: Exception) {
                null
            }
        }

        private fun harita(o: JSONObject?): Map<String, String> {
            if (o == null) return emptyMap()
            val sonuc = LinkedHashMap<String, String>()
            for (v in VAKITLER) metin(o, v)?.let { sonuc[v] = it }
            return sonuc
        }

        /** Yalnız boş olmayan DİZE kabul edilir (sayı/nesne/null yok sayılır). */
        private fun metin(o: JSONObject, ad: String): String? {
            val d = o.opt(ad) as? String ?: return null
            return d.trim().ifEmpty { null }
        }
    }
}
