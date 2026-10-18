package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Saat hoparlöründen sesli anons (saat W3, fikir 9) — SAF karar.
 *
 * ÇİFT KONUŞMA OLMAZ: telefon konuşuyorsa saat konuşmaz. Kullanıcı seçimi (telefondaki
 * Saat ayarları, yükte `anonsYeri`):
 *  - `otomatik` (varsayılan): telefon konuşur; saat yalnız YAKINDA bağlı bir telefon
 *    yokken konuşur (bulut üzerinden bağlı uzak telefon "yakında" sayılmaz — o odada
 *    kimse onu duymaz).
 *  - `saat`: daima saat (telefon TTS planlamaz — üreticideki kapı).
 *  - `telefon` ya da alan yok (eski telefon): saat hiç konuşmaz.
 * Hoparlör yoksa konuşulmaz; bildirim zaten titreşir.
 */
object AnonsKarari {
    fun saatKonusurMu(anonsYeri: String?, metin: String?, yakindaTelefon: Boolean, hoparlor: Boolean): Boolean {
        if (metin.isNullOrBlank() || !hoparlor) return false
        return when (anonsYeri) {
            AnonsYerleri.SAAT -> true
            AnonsYerleri.OTOMATIK -> !yakindaTelefon
            else -> false
        }
    }

    /** "Yakında telefon var mı?" sorusu gerekli mi? (Bluetooth sorgusu boşuna yapılmasın.) */
    fun telefonSorulmaliMi(anonsYeri: String?, metin: String?): Boolean =
        anonsYeri == AnonsYerleri.OTOMATIK && !metin.isNullOrBlank()
}
