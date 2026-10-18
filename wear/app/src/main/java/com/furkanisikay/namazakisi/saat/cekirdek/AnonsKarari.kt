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
 *
 * CAMİDEYKEN / NAMAZ MODU AÇIKKEN saat KONUŞMAZ (inceleme bulgusu 4) — telefondaki
 * `AnonsReceiver`'ın camide susma kapısının ikizi; bilgi telefonun gönderdiği Camideyim
 * durumundan (`CamiDurumDeposu`) gelir. Seçimden ÖNCE gelen ilk kapıdır (`saat` seçili olsa da).
 */
object AnonsKarari {
    /** Saatin gördüğü durum camide ya da Namaz modu açık diyor mu? (süresi geçmiş alan sayılmaz) */
    fun sessizMi(durum: TelefonKomutu.CamiDurumu?, simdi: Long): Boolean =
        durum?.gecerli(simdi)?.let { it.camide != null || it.modBitisMs != null } ?: false

    fun saatKonusurMu(
        anonsYeri: String?,
        metin: String?,
        yakindaTelefon: Boolean,
        hoparlor: Boolean,
        sessiz: Boolean = false,
    ): Boolean {
        if (sessiz || metin.isNullOrBlank() || !hoparlor) return false
        return when (anonsYeri) {
            AnonsYerleri.SAAT -> true
            AnonsYerleri.OTOMATIK -> !yakindaTelefon
            else -> false
        }
    }

    /** "Yakında telefon var mı?" sorusu gerekli mi? (Bluetooth sorgusu boşuna yapılmasın.) */
    fun telefonSorulmaliMi(anonsYeri: String?, metin: String?, sessiz: Boolean = false): Boolean =
        !sessiz && anonsYeri == AnonsYerleri.OTOMATIK && !metin.isNullOrBlank()
}
