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

    /**
     * Saatte son konuşma denemesinin sonucu (`SaatAnonsu` diske yazar). Sahada "saat hiç
     * konuşmadı" şikâyetinin nedeni ayırt edilebilsin: motor yok, Türkçe ses yok, başka hata.
     */
    enum class SesDurumu(val kod: String) {
        BILINMIYOR("bilinmiyor"),
        KONUSTU("konustu"),
        /** `TextToSpeech` başlatılamadı: saatte konuşma motoru yok ya da görünmüyor. */
        MOTOR_YOK("motor_yok"),
        TURKCE_YOK("turkce_yok"),
        HATA("hata"),
        ;

        companion object {
            fun coz(kod: String?): SesDurumu = entries.firstOrNull { it.kod == kod } ?: BILINMIYOR
        }
    }

    /** Saat bu ayarla HİÇ konuşabilir mi? (deneme düğmesi ve bilgi satırları yalnız o zaman) */
    fun saatKonusabilir(anonsYeri: String?): Boolean =
        anonsYeri == AnonsYerleri.OTOMATIK || anonsYeri == AnonsYerleri.SAAT

    /**
     * Ana ekrandaki bilgi satırı (kibar "siz"). Saat bu ayarla konuşmayacaksa null; konuşacak
     * ama konuşamıyorsa nedeni söylenir — bildirim yine titreşir.
     */
    fun bilgiMetni(anonsYeri: String?, hoparlor: Boolean, durum: SesDurumu, dil: String = "tr"): String? {
        if (!saatKonusabilir(anonsYeri)) return null
        val d = saatDili(dil)
        return when {
            !hoparlor -> d.hoparlorYokBilgi
            durum == SesDurumu.MOTOR_YOK -> d.motorYokBilgi
            durum == SesDurumu.TURKCE_YOK -> d.sesYokBilgi
            else -> null
        }
    }

    /**
     * "Sesi deneyin" düğmesinin altındaki açıklama: varsayılan `otomatik` ayarda saat,
     * telefon YANINDAYKEN bilerek konuşmaz (çift konuşma yok) — "saatim konuşmuyor"
     * izleniminin en olası nedeni budur, ekran bunu açıkça söyler.
     */
    fun yerAciklamasi(anonsYeri: String?, dil: String = "tr"): String? = when (anonsYeri) {
        AnonsYerleri.OTOMATIK -> saatDili(dil).otomatikYerAciklamasi
        AnonsYerleri.SAAT -> saatDili(dil).saatYerAciklamasi
        else -> null
    }

    /** Deneme sonucunun kısa onay metni. */
    fun denemeSonucu(durum: SesDurumu, hoparlor: Boolean, dil: String = "tr"): String {
        val d = saatDili(dil)
        return when {
            !hoparlor -> d.hoparlorYok
            durum == SesDurumu.KONUSTU -> d.sesCalisti
            durum == SesDurumu.MOTOR_YOK -> d.motorYok
            durum == SesDurumu.TURKCE_YOK -> d.sesYok
            else -> d.sesCalinamadi
        }
    }

    /**
     * Deneme cümlesi (arayüz denemesi — kibar "siz"). TÜRKÇE KALIR: `SaatAnonsu` motoru
     * `tr-TR` sesiyle kurar (anons metni telefondan, telefonun uygulama dilinde gelir; yük
     * dili taşımaz). Saat sesi dile bağlanınca bu da dile bağlanır.
     */
    const val DENEME_METNI = "Namaz Akışı sesli okuması saatinizde çalışıyor."
}
