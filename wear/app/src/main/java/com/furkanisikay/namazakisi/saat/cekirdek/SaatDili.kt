package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Saf çekirdeklerin ürettiği metinler — dil başına BİR nesne (W5, çok dil). SAF.
 *
 * Saat CİHAZIN dilini izler: arayüz `res/values-xx/strings.xml`'den çözülür, çekirdek ise
 * dili PARAMETRE alır (`dil`, varsayılan "tr" — mevcut testler ve fikstürler değişmez).
 * Çağıran dili `R.string.dil_kodu`'ndan okur (Compose `stringResource`, tile/komplikasyon/
 * bildirim `getString`): böylece kaynak sisteminin seçtiği dil (desteklenmeyen cihaz dili →
 * Türkçe) ile çekirdek metni AYNI olur.
 *
 * İngilizce karşılıklar telefonun JS sözlüğünden (`src/core/dil/sozluk/en`) ve
 * `docs/ajan/coklu-dil.md` terim sözlüğünden alınır; serbest çeviri yok. Ad sabit
 * haritadan gelir; `uppercase()`/`lowercase()` ya da ek üretimi YOK (Türkçe İ tuzağı).
 * Yeni dil = yeni `values-xx` dizini + burada yeni nesne + [saatDili] / [SAAT_DILLERI] eşlemesi.
 * Düzen: dil başına bir nesne, sıra tr, en, id, de, fr, bs, ru, ms; çevrilmemiş dilin nesnesi
 * İngilizcenin birebir kopyasıdır ve `// ÇEVİRİ: <kod>` satırıyla başlar (çeviri ajanları
 * yalnız kendi bloklarına dokunur). Nöbetçi: `SaatDiliTest`.
 */
interface SaatDili {
    val kod: String

    /** Vaktin görünen adı ("Öğle" / "Dhuhr"); bilinmeyen kod aynen döner. */
    fun vakitAdi(vakit: String): String

    // --- Süre ---
    val birimSa: String
    val birimDk: String
    val birimSn: String

    /** Kısa süre: bir dakikanın altı ("1 dk'dan az"). */
    val birDakikadanAzKisa: String
    fun saatSesli(n: Long): String
    fun dakikaSesli(n: Long): String
    val birDakikadanAzSesli: String

    /** Uzun biçimdeki parçaların arası ("1 saat 58 dakika"). */
    fun sesliBirlesik(saat: String, dakika: String): String = "$saat $dakika"

    // --- Kalan süre komplikasyonu (KalanSure) ---
    fun cikisaUzun(ad: String): String
    fun cikisaAciklama(ad: String): String
    fun giriseKisa(vakit: String): String
    fun giriseUzun(vakit: String): String
    fun giriseAciklama(ad: String): String

    // --- Vakit sınırı / sıradaki namaz komplikasyonları (VakitSiniri) ---
    val cikisBasligi: String
    val girisBasligi: String
    fun cikisUzun(ad: String, saat: String): String
    fun cikisAciklama(ad: String, saat: String): String
    fun girisUzun(ad: String, saat: String): String
    fun girisAciklama(ad: String, saat: String): String
    fun siradakiUzun(ad: String, saat: String): String
    fun siradakiAciklama(ad: String, saat: String): String

    // --- Ana ekran (AnaEkranKarari) ---
    fun altYazi(mod: KalanSure.Mod): String
    fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String
    val kilindiEki: String
    fun sonDakikaEki(dk: Int): String
    fun bugunEki(kilinan: Int, toplam: Int): String
    fun acilAdSatiri(ad: String, dk: Int): String
    fun dugmeAciklamasi(ad: String): String
    fun onaySorusuSatirlari(ad: String): Pair<String, String>
    val vakitDegisti: String
    val kabulDuasi: String

    // --- Kıble (KibleKarari) ---
    val kibleHizali: String
    val kibleArkada: String
    fun kibleTarafta(adim: Int, sag: Boolean): String
    val donusArkada: String
    fun donus(adim: Int, sag: Boolean): String

    // --- Telefon komutları (TelefonKomutu) ---
    fun namazModuAcikBitis(saat: String): String
    val namazModuAcik: String
    val namazModuKapandi: String
    val namazModuTelefondaAcin: String
    val telefonaUlasilamadi: String
    val namazModuAcilamadi: String
    val camiKaydedildi: String
    val camiBirDahaSorulmaz: String
    val camiSayilmaz: String
    val soruGecersiz: String
    val islemYapilamadi: String

    // --- Saat sesli okuması (AnonsKarari) ---
    val hoparlorYokBilgi: String
    val motorYokBilgi: String
    val sesYokBilgi: String
    val otomatikYerAciklamasi: String
    val saatYerAciklamasi: String
    val hoparlorYok: String
    val sesCalisti: String
    val motorYok: String
    val sesYok: String
    val sesCalinamadi: String

    // --- Canlı sayaç / tesbihat ---
    fun vaktiCikiyor(ad: String): String
    val tesbihatTamamlandi: String
    val toplam: String
}

/**
 * Dil kodundan tablo; desteklenmeyen kod Türkçeye düşer (kaynak sisteminin varsayılanı gibi).
 * Endonezce kaynak dizini `values-in`'dir ama `dil_kodu` orada da "id" yazar; eski "in" kodu
 * yine de Endonezceye eşlenir.
 */
fun saatDili(dil: String): SaatDili = when (dil) {
    "en" -> SaatDiliEn
    "id", "in" -> SaatDiliId
    "de" -> SaatDiliDe
    "fr" -> SaatDiliFr
    "bs" -> SaatDiliBs
    "ru" -> SaatDiliRu
    "ms" -> SaatDiliMs
    else -> SaatDiliTr
}

/** Tablosu olan diller, düzen sırasıyla (tr, en, id, de, fr, bs, ru, ms). */
val SAAT_DILLERI: List<SaatDili> = listOf(
    SaatDiliTr, SaatDiliEn, SaatDiliId, SaatDiliDe, SaatDiliFr, SaatDiliBs, SaatDiliRu, SaatDiliMs,
)

object SaatDiliTr : SaatDili {
    override val kod = "tr"

    private val ADLAR = mapOf(
        "imsak" to "Sabah", "gunes" to "Güneş", "ogle" to "Öğle",
        "ikindi" to "İkindi", "aksam" to "Akşam", "yatsi" to "Yatsı",
    )

    /** Yönelme hâli ("…-e kalan") — sabit harita, ek üretilmez. */
    private val YONELME = mapOf(
        "imsak" to "Sabaha", "gunes" to "Güneşe", "ogle" to "Öğleye",
        "ikindi" to "İkindiye", "aksam" to "Akşama", "yatsi" to "Yatsıya",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "sa"
    override val birimDk = "dk"
    override val birimSn = "sn"
    override val birDakikadanAzKisa = "1 dk'dan az"
    override fun saatSesli(n: Long) = "$n saat"
    override fun dakikaSesli(n: Long) = "$n dakika"
    override val birDakikadanAzSesli = "1 dakikadan az"

    override fun cikisaUzun(ad: String) = "$ad çıkışına"
    override fun cikisaAciklama(ad: String) = "$ad vaktinin çıkmasına kalan süre"

    /** "İkindiye"/"Yatsıya" 6 karakteri aşar → kısa başlıkta yalnız ad. */
    override fun giriseKisa(vakit: String): String {
        val yon = giriseUzun(vakit)
        return if (yon.length <= 6) yon else vakitAdi(vakit)
    }

    override fun giriseUzun(vakit: String) = YONELME[vakit] ?: vakitAdi(vakit)
    override fun giriseAciklama(ad: String) = "$ad vaktine kalan süre"

    override val cikisBasligi = "Çıkış"
    override val girisBasligi = "Giriş"
    override fun cikisUzun(ad: String, saat: String) = "$ad çıkışı $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad vaktinin çıkış saati $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad girişi $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad vaktinin giriş saati $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Sıradaki: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Sıradaki namaz $ad, giriş $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "vaktin çıkmasına" else "vaktin girmesine"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "çıkmasına" else "girmesine"
        return "$ad vaktinin $fiil $sure"
    }

    override val kilindiEki = ", kılındı"
    override fun sonDakikaEki(dk: Int) = ", son $dk dakika"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Bugün $kilinan/$toplam kılındı"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · son $dk dk"
    override fun dugmeAciklamasi(ad: String) = "$ad vaktini kıldım olarak işaretleyin"

    /** Vakit adına hal eki ÜRETİLMEZ (Türkçe ek uyumu tuzağı): "Öğle namazını". */
    override fun onaySorusuSatirlari(ad: String) = "$ad namazını" to "kıldınız mı?"
    override val vakitDegisti = "Vakit değişti, işaretlenmedi."
    override val kabulDuasi = "Allah kabul etsin"

    override val kibleHizali = "Kıble yönündesiniz"
    override val kibleArkada = "Kıble arkanızda"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Kıble $adim derece ${if (sag) "sağınızda" else "solunuzda"}"
    override val donusArkada = "Arkanızda"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Sağa" else "Sola"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Namaz modu açık · bitiş $saat"
    override val namazModuAcik = "Namaz modu açık"
    override val namazModuKapandi = "Namaz modu kapandı"
    override val namazModuTelefondaAcin = "Telefonunuzda Namaz modunu bir kez açın"
    override val telefonaUlasilamadi = "Telefonunuza ulaşılamadı"
    override val namazModuAcilamadi = "Namaz modu açılamadı. Telefonunuzdan deneyin"
    override val camiKaydedildi = "Camide olduğunuz kaydedildi"
    override val camiBirDahaSorulmaz = "Bu vakitte bir daha sorulmaz"
    override val camiSayilmaz = "Bu yer bir daha cami sayılmaz"
    override val soruGecersiz = "Bu soru artık geçerli değil"
    override val islemYapilamadi = "İşlem yapılamadı. Telefonunuzdan deneyin"

    override val hoparlorYokBilgi = "Saatinizde hoparlör yok; sesli anonslar yalnız titreşimle bildirilir."
    override val motorYokBilgi = "Saatinizde metin okuma motoru bulunamadı; sesli anonslar yalnız titreşimle bildirilir."
    override val sesYokBilgi = "Saatinizde Türkçe ses yok; sesli anonslar yalnız titreşimle bildirilir."
    override val otomatikYerAciklamasi =
        "Telefonunuz yanınızdayken sesli okumayı telefonunuz yapar; saatiniz yalnız telefon uzaktayken konuşur. Yalnız sesli anonsu açık hatırlatmalar okunur."
    override val saatYerAciklamasi = "Sesli okumayı saatiniz yapar. Yalnız sesli anonsu açık hatırlatmalar okunur."
    override val hoparlorYok = "Saatinizde hoparlör yok"
    override val sesCalisti = "Ses çalıştı"
    override val motorYok = "Metin okuma motoru yok"
    override val sesYok = "Türkçe ses yok"
    override val sesCalinamadi = "Ses çalınamadı"

    override fun vaktiCikiyor(ad: String) = "$ad vakti çıkıyor"
    override val tesbihatTamamlandi = "Tesbihat tamamlandı"
    override val toplam = "Toplam"
}

/**
 * İngilizce (JS `sozluk/en`): vakit adları özel addır (Fajr, Sunrise, Dhuhr, Asr, Maghrib,
 * Isha); süre birimleri `sure.kisa` (h/min/s); yön `kible.yon`. Kısa başlıklar en fazla 7
 * karakterdir ("Maghrib", "Sunrise" — SHORT_TEXT başlığı ~7 karakter taşır).
 */
object SaatDiliEn : SaatDili {
    override val kod = "en"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sunrise", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 hour" else "$n hours"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minute" else "$n minutes"
    override val birDakikadanAzSesli = "less than 1 minute"

    override fun cikisaUzun(ad: String) = "$ad ends in"
    override fun cikisaAciklama(ad: String) = "Time left until $ad ends"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} in"
    override fun giriseAciklama(ad: String) = "Time left until $ad"

    override val cikisBasligi = "Ends"
    override val girisBasligi = "Begins"
    override fun cikisUzun(ad: String, saat: String) = "$ad ends $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad ends at $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad begins $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad begins at $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Next: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Next prayer $ad, begins at $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "until it ends" else "until it begins"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ends" else "begins"
        return "$ad $fiil in $sure"
    }

    override val kilindiEki = ", prayed"
    override fun sonDakikaEki(dk: Int) = ", last $dk minutes"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Today $kilinan/$toplam prayed"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · last $dk min"
    override fun dugmeAciklamasi(ad: String) = "Mark $ad as prayed"
    override fun onaySorusuSatirlari(ad: String) = "Have you prayed" to "$ad?"
    override val vakitDegisti = "The prayer time changed; not marked."
    override val kabulDuasi = "May Allah accept it"

    override val kibleHizali = "You are facing the Qibla"
    override val kibleArkada = "The Qibla is behind you"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "The Qibla is $adim° to your ${if (sag) "right" else "left"}"
    override val donusArkada = "Behind you"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Right" else "Left"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Prayer mode on · ends $saat"
    override val namazModuAcik = "Prayer mode on"
    override val namazModuKapandi = "Prayer mode turned off"
    override val namazModuTelefondaAcin = "Turn on Prayer mode once on your phone"
    override val telefonaUlasilamadi = "Your phone can't be reached"
    override val namazModuAcilamadi = "Prayer mode couldn't be turned on. Try from your phone"
    override val camiKaydedildi = "Saved that you're at the mosque"
    override val camiBirDahaSorulmaz = "You won't be asked again for this prayer time"
    override val camiSayilmaz = "This place won't count as a mosque again"
    override val soruGecersiz = "This question is no longer valid"
    override val islemYapilamadi = "Couldn't complete this. Try from your phone"

    override val hoparlorYokBilgi = "Your watch has no speaker; spoken announcements only vibrate."
    override val motorYokBilgi = "No text-to-speech engine was found on your watch; spoken announcements only vibrate."
    override val sesYokBilgi = "Your watch has no Turkish voice; spoken announcements only vibrate."
    override val otomatikYerAciklamasi =
        "When your phone is with you, your phone reads aloud; your watch only speaks when your phone is away. Only reminders with read aloud turned on are read."
    override val saatYerAciklamasi = "Your watch reads aloud. Only reminders with read aloud turned on are read."
    override val hoparlorYok = "Your watch has no speaker"
    override val sesCalisti = "The sound worked"
    override val motorYok = "No text-to-speech engine"
    override val sesYok = "No Turkish voice"
    override val sesCalinamadi = "The sound couldn't play"

    override fun vaktiCikiyor(ad: String) = "$ad is ending"
    override val tesbihatTamamlandi = "Tasbih completed"
    override val toplam = "Total"
}

// ÇEVİRİ: id
object SaatDiliId : SaatDili {
    override val kod = "id"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sunrise", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 hour" else "$n hours"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minute" else "$n minutes"
    override val birDakikadanAzSesli = "less than 1 minute"

    override fun cikisaUzun(ad: String) = "$ad ends in"
    override fun cikisaAciklama(ad: String) = "Time left until $ad ends"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} in"
    override fun giriseAciklama(ad: String) = "Time left until $ad"

    override val cikisBasligi = "Ends"
    override val girisBasligi = "Begins"
    override fun cikisUzun(ad: String, saat: String) = "$ad ends $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad ends at $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad begins $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad begins at $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Next: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Next prayer $ad, begins at $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "until it ends" else "until it begins"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ends" else "begins"
        return "$ad $fiil in $sure"
    }

    override val kilindiEki = ", prayed"
    override fun sonDakikaEki(dk: Int) = ", last $dk minutes"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Today $kilinan/$toplam prayed"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · last $dk min"
    override fun dugmeAciklamasi(ad: String) = "Mark $ad as prayed"
    override fun onaySorusuSatirlari(ad: String) = "Have you prayed" to "$ad?"
    override val vakitDegisti = "The prayer time changed; not marked."
    override val kabulDuasi = "May Allah accept it"

    override val kibleHizali = "You are facing the Qibla"
    override val kibleArkada = "The Qibla is behind you"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "The Qibla is $adim° to your ${if (sag) "right" else "left"}"
    override val donusArkada = "Behind you"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Right" else "Left"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Prayer mode on · ends $saat"
    override val namazModuAcik = "Prayer mode on"
    override val namazModuKapandi = "Prayer mode turned off"
    override val namazModuTelefondaAcin = "Turn on Prayer mode once on your phone"
    override val telefonaUlasilamadi = "Your phone can't be reached"
    override val namazModuAcilamadi = "Prayer mode couldn't be turned on. Try from your phone"
    override val camiKaydedildi = "Saved that you're at the mosque"
    override val camiBirDahaSorulmaz = "You won't be asked again for this prayer time"
    override val camiSayilmaz = "This place won't count as a mosque again"
    override val soruGecersiz = "This question is no longer valid"
    override val islemYapilamadi = "Couldn't complete this. Try from your phone"

    override val hoparlorYokBilgi = "Your watch has no speaker; spoken announcements only vibrate."
    override val motorYokBilgi = "No text-to-speech engine was found on your watch; spoken announcements only vibrate."
    override val sesYokBilgi = "Your watch has no Turkish voice; spoken announcements only vibrate."
    override val otomatikYerAciklamasi =
        "When your phone is with you, your phone reads aloud; your watch only speaks when your phone is away. Only reminders with read aloud turned on are read."
    override val saatYerAciklamasi = "Your watch reads aloud. Only reminders with read aloud turned on are read."
    override val hoparlorYok = "Your watch has no speaker"
    override val sesCalisti = "The sound worked"
    override val motorYok = "No text-to-speech engine"
    override val sesYok = "No Turkish voice"
    override val sesCalinamadi = "The sound couldn't play"

    override fun vaktiCikiyor(ad: String) = "$ad is ending"
    override val tesbihatTamamlandi = "Tasbih completed"
    override val toplam = "Total"
}

// ÇEVİRİ: de
object SaatDiliDe : SaatDili {
    override val kod = "de"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sunrise", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 hour" else "$n hours"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minute" else "$n minutes"
    override val birDakikadanAzSesli = "less than 1 minute"

    override fun cikisaUzun(ad: String) = "$ad ends in"
    override fun cikisaAciklama(ad: String) = "Time left until $ad ends"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} in"
    override fun giriseAciklama(ad: String) = "Time left until $ad"

    override val cikisBasligi = "Ends"
    override val girisBasligi = "Begins"
    override fun cikisUzun(ad: String, saat: String) = "$ad ends $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad ends at $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad begins $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad begins at $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Next: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Next prayer $ad, begins at $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "until it ends" else "until it begins"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ends" else "begins"
        return "$ad $fiil in $sure"
    }

    override val kilindiEki = ", prayed"
    override fun sonDakikaEki(dk: Int) = ", last $dk minutes"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Today $kilinan/$toplam prayed"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · last $dk min"
    override fun dugmeAciklamasi(ad: String) = "Mark $ad as prayed"
    override fun onaySorusuSatirlari(ad: String) = "Have you prayed" to "$ad?"
    override val vakitDegisti = "The prayer time changed; not marked."
    override val kabulDuasi = "May Allah accept it"

    override val kibleHizali = "You are facing the Qibla"
    override val kibleArkada = "The Qibla is behind you"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "The Qibla is $adim° to your ${if (sag) "right" else "left"}"
    override val donusArkada = "Behind you"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Right" else "Left"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Prayer mode on · ends $saat"
    override val namazModuAcik = "Prayer mode on"
    override val namazModuKapandi = "Prayer mode turned off"
    override val namazModuTelefondaAcin = "Turn on Prayer mode once on your phone"
    override val telefonaUlasilamadi = "Your phone can't be reached"
    override val namazModuAcilamadi = "Prayer mode couldn't be turned on. Try from your phone"
    override val camiKaydedildi = "Saved that you're at the mosque"
    override val camiBirDahaSorulmaz = "You won't be asked again for this prayer time"
    override val camiSayilmaz = "This place won't count as a mosque again"
    override val soruGecersiz = "This question is no longer valid"
    override val islemYapilamadi = "Couldn't complete this. Try from your phone"

    override val hoparlorYokBilgi = "Your watch has no speaker; spoken announcements only vibrate."
    override val motorYokBilgi = "No text-to-speech engine was found on your watch; spoken announcements only vibrate."
    override val sesYokBilgi = "Your watch has no Turkish voice; spoken announcements only vibrate."
    override val otomatikYerAciklamasi =
        "When your phone is with you, your phone reads aloud; your watch only speaks when your phone is away. Only reminders with read aloud turned on are read."
    override val saatYerAciklamasi = "Your watch reads aloud. Only reminders with read aloud turned on are read."
    override val hoparlorYok = "Your watch has no speaker"
    override val sesCalisti = "The sound worked"
    override val motorYok = "No text-to-speech engine"
    override val sesYok = "No Turkish voice"
    override val sesCalinamadi = "The sound couldn't play"

    override fun vaktiCikiyor(ad: String) = "$ad is ending"
    override val tesbihatTamamlandi = "Tasbih completed"
    override val toplam = "Total"
}

// ÇEVİRİ: fr
object SaatDiliFr : SaatDili {
    override val kod = "fr"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sunrise", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 hour" else "$n hours"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minute" else "$n minutes"
    override val birDakikadanAzSesli = "less than 1 minute"

    override fun cikisaUzun(ad: String) = "$ad ends in"
    override fun cikisaAciklama(ad: String) = "Time left until $ad ends"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} in"
    override fun giriseAciklama(ad: String) = "Time left until $ad"

    override val cikisBasligi = "Ends"
    override val girisBasligi = "Begins"
    override fun cikisUzun(ad: String, saat: String) = "$ad ends $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad ends at $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad begins $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad begins at $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Next: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Next prayer $ad, begins at $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "until it ends" else "until it begins"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ends" else "begins"
        return "$ad $fiil in $sure"
    }

    override val kilindiEki = ", prayed"
    override fun sonDakikaEki(dk: Int) = ", last $dk minutes"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Today $kilinan/$toplam prayed"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · last $dk min"
    override fun dugmeAciklamasi(ad: String) = "Mark $ad as prayed"
    override fun onaySorusuSatirlari(ad: String) = "Have you prayed" to "$ad?"
    override val vakitDegisti = "The prayer time changed; not marked."
    override val kabulDuasi = "May Allah accept it"

    override val kibleHizali = "You are facing the Qibla"
    override val kibleArkada = "The Qibla is behind you"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "The Qibla is $adim° to your ${if (sag) "right" else "left"}"
    override val donusArkada = "Behind you"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Right" else "Left"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Prayer mode on · ends $saat"
    override val namazModuAcik = "Prayer mode on"
    override val namazModuKapandi = "Prayer mode turned off"
    override val namazModuTelefondaAcin = "Turn on Prayer mode once on your phone"
    override val telefonaUlasilamadi = "Your phone can't be reached"
    override val namazModuAcilamadi = "Prayer mode couldn't be turned on. Try from your phone"
    override val camiKaydedildi = "Saved that you're at the mosque"
    override val camiBirDahaSorulmaz = "You won't be asked again for this prayer time"
    override val camiSayilmaz = "This place won't count as a mosque again"
    override val soruGecersiz = "This question is no longer valid"
    override val islemYapilamadi = "Couldn't complete this. Try from your phone"

    override val hoparlorYokBilgi = "Your watch has no speaker; spoken announcements only vibrate."
    override val motorYokBilgi = "No text-to-speech engine was found on your watch; spoken announcements only vibrate."
    override val sesYokBilgi = "Your watch has no Turkish voice; spoken announcements only vibrate."
    override val otomatikYerAciklamasi =
        "When your phone is with you, your phone reads aloud; your watch only speaks when your phone is away. Only reminders with read aloud turned on are read."
    override val saatYerAciklamasi = "Your watch reads aloud. Only reminders with read aloud turned on are read."
    override val hoparlorYok = "Your watch has no speaker"
    override val sesCalisti = "The sound worked"
    override val motorYok = "No text-to-speech engine"
    override val sesYok = "No Turkish voice"
    override val sesCalinamadi = "The sound couldn't play"

    override fun vaktiCikiyor(ad: String) = "$ad is ending"
    override val tesbihatTamamlandi = "Tasbih completed"
    override val toplam = "Total"
}

// ÇEVİRİ: bs
object SaatDiliBs : SaatDili {
    override val kod = "bs"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sunrise", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 hour" else "$n hours"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minute" else "$n minutes"
    override val birDakikadanAzSesli = "less than 1 minute"

    override fun cikisaUzun(ad: String) = "$ad ends in"
    override fun cikisaAciklama(ad: String) = "Time left until $ad ends"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} in"
    override fun giriseAciklama(ad: String) = "Time left until $ad"

    override val cikisBasligi = "Ends"
    override val girisBasligi = "Begins"
    override fun cikisUzun(ad: String, saat: String) = "$ad ends $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad ends at $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad begins $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad begins at $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Next: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Next prayer $ad, begins at $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "until it ends" else "until it begins"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ends" else "begins"
        return "$ad $fiil in $sure"
    }

    override val kilindiEki = ", prayed"
    override fun sonDakikaEki(dk: Int) = ", last $dk minutes"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Today $kilinan/$toplam prayed"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · last $dk min"
    override fun dugmeAciklamasi(ad: String) = "Mark $ad as prayed"
    override fun onaySorusuSatirlari(ad: String) = "Have you prayed" to "$ad?"
    override val vakitDegisti = "The prayer time changed; not marked."
    override val kabulDuasi = "May Allah accept it"

    override val kibleHizali = "You are facing the Qibla"
    override val kibleArkada = "The Qibla is behind you"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "The Qibla is $adim° to your ${if (sag) "right" else "left"}"
    override val donusArkada = "Behind you"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Right" else "Left"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Prayer mode on · ends $saat"
    override val namazModuAcik = "Prayer mode on"
    override val namazModuKapandi = "Prayer mode turned off"
    override val namazModuTelefondaAcin = "Turn on Prayer mode once on your phone"
    override val telefonaUlasilamadi = "Your phone can't be reached"
    override val namazModuAcilamadi = "Prayer mode couldn't be turned on. Try from your phone"
    override val camiKaydedildi = "Saved that you're at the mosque"
    override val camiBirDahaSorulmaz = "You won't be asked again for this prayer time"
    override val camiSayilmaz = "This place won't count as a mosque again"
    override val soruGecersiz = "This question is no longer valid"
    override val islemYapilamadi = "Couldn't complete this. Try from your phone"

    override val hoparlorYokBilgi = "Your watch has no speaker; spoken announcements only vibrate."
    override val motorYokBilgi = "No text-to-speech engine was found on your watch; spoken announcements only vibrate."
    override val sesYokBilgi = "Your watch has no Turkish voice; spoken announcements only vibrate."
    override val otomatikYerAciklamasi =
        "When your phone is with you, your phone reads aloud; your watch only speaks when your phone is away. Only reminders with read aloud turned on are read."
    override val saatYerAciklamasi = "Your watch reads aloud. Only reminders with read aloud turned on are read."
    override val hoparlorYok = "Your watch has no speaker"
    override val sesCalisti = "The sound worked"
    override val motorYok = "No text-to-speech engine"
    override val sesYok = "No Turkish voice"
    override val sesCalinamadi = "The sound couldn't play"

    override fun vaktiCikiyor(ad: String) = "$ad is ending"
    override val tesbihatTamamlandi = "Tasbih completed"
    override val toplam = "Total"
}

// ÇEVİRİ: ru
object SaatDiliRu : SaatDili {
    override val kod = "ru"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sunrise", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 hour" else "$n hours"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minute" else "$n minutes"
    override val birDakikadanAzSesli = "less than 1 minute"

    override fun cikisaUzun(ad: String) = "$ad ends in"
    override fun cikisaAciklama(ad: String) = "Time left until $ad ends"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} in"
    override fun giriseAciklama(ad: String) = "Time left until $ad"

    override val cikisBasligi = "Ends"
    override val girisBasligi = "Begins"
    override fun cikisUzun(ad: String, saat: String) = "$ad ends $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad ends at $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad begins $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad begins at $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Next: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Next prayer $ad, begins at $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "until it ends" else "until it begins"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ends" else "begins"
        return "$ad $fiil in $sure"
    }

    override val kilindiEki = ", prayed"
    override fun sonDakikaEki(dk: Int) = ", last $dk minutes"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Today $kilinan/$toplam prayed"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · last $dk min"
    override fun dugmeAciklamasi(ad: String) = "Mark $ad as prayed"
    override fun onaySorusuSatirlari(ad: String) = "Have you prayed" to "$ad?"
    override val vakitDegisti = "The prayer time changed; not marked."
    override val kabulDuasi = "May Allah accept it"

    override val kibleHizali = "You are facing the Qibla"
    override val kibleArkada = "The Qibla is behind you"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "The Qibla is $adim° to your ${if (sag) "right" else "left"}"
    override val donusArkada = "Behind you"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Right" else "Left"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Prayer mode on · ends $saat"
    override val namazModuAcik = "Prayer mode on"
    override val namazModuKapandi = "Prayer mode turned off"
    override val namazModuTelefondaAcin = "Turn on Prayer mode once on your phone"
    override val telefonaUlasilamadi = "Your phone can't be reached"
    override val namazModuAcilamadi = "Prayer mode couldn't be turned on. Try from your phone"
    override val camiKaydedildi = "Saved that you're at the mosque"
    override val camiBirDahaSorulmaz = "You won't be asked again for this prayer time"
    override val camiSayilmaz = "This place won't count as a mosque again"
    override val soruGecersiz = "This question is no longer valid"
    override val islemYapilamadi = "Couldn't complete this. Try from your phone"

    override val hoparlorYokBilgi = "Your watch has no speaker; spoken announcements only vibrate."
    override val motorYokBilgi = "No text-to-speech engine was found on your watch; spoken announcements only vibrate."
    override val sesYokBilgi = "Your watch has no Turkish voice; spoken announcements only vibrate."
    override val otomatikYerAciklamasi =
        "When your phone is with you, your phone reads aloud; your watch only speaks when your phone is away. Only reminders with read aloud turned on are read."
    override val saatYerAciklamasi = "Your watch reads aloud. Only reminders with read aloud turned on are read."
    override val hoparlorYok = "Your watch has no speaker"
    override val sesCalisti = "The sound worked"
    override val motorYok = "No text-to-speech engine"
    override val sesYok = "No Turkish voice"
    override val sesCalinamadi = "The sound couldn't play"

    override fun vaktiCikiyor(ad: String) = "$ad is ending"
    override val tesbihatTamamlandi = "Tasbih completed"
    override val toplam = "Total"
}

// ÇEVİRİ: ms
object SaatDiliMs : SaatDili {
    override val kod = "ms"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sunrise", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 hour" else "$n hours"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minute" else "$n minutes"
    override val birDakikadanAzSesli = "less than 1 minute"

    override fun cikisaUzun(ad: String) = "$ad ends in"
    override fun cikisaAciklama(ad: String) = "Time left until $ad ends"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} in"
    override fun giriseAciklama(ad: String) = "Time left until $ad"

    override val cikisBasligi = "Ends"
    override val girisBasligi = "Begins"
    override fun cikisUzun(ad: String, saat: String) = "$ad ends $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad ends at $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad begins $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad begins at $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Next: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Next prayer $ad, begins at $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "until it ends" else "until it begins"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ends" else "begins"
        return "$ad $fiil in $sure"
    }

    override val kilindiEki = ", prayed"
    override fun sonDakikaEki(dk: Int) = ", last $dk minutes"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Today $kilinan/$toplam prayed"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · last $dk min"
    override fun dugmeAciklamasi(ad: String) = "Mark $ad as prayed"
    override fun onaySorusuSatirlari(ad: String) = "Have you prayed" to "$ad?"
    override val vakitDegisti = "The prayer time changed; not marked."
    override val kabulDuasi = "May Allah accept it"

    override val kibleHizali = "You are facing the Qibla"
    override val kibleArkada = "The Qibla is behind you"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "The Qibla is $adim° to your ${if (sag) "right" else "left"}"
    override val donusArkada = "Behind you"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Right" else "Left"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Prayer mode on · ends $saat"
    override val namazModuAcik = "Prayer mode on"
    override val namazModuKapandi = "Prayer mode turned off"
    override val namazModuTelefondaAcin = "Turn on Prayer mode once on your phone"
    override val telefonaUlasilamadi = "Your phone can't be reached"
    override val namazModuAcilamadi = "Prayer mode couldn't be turned on. Try from your phone"
    override val camiKaydedildi = "Saved that you're at the mosque"
    override val camiBirDahaSorulmaz = "You won't be asked again for this prayer time"
    override val camiSayilmaz = "This place won't count as a mosque again"
    override val soruGecersiz = "This question is no longer valid"
    override val islemYapilamadi = "Couldn't complete this. Try from your phone"

    override val hoparlorYokBilgi = "Your watch has no speaker; spoken announcements only vibrate."
    override val motorYokBilgi = "No text-to-speech engine was found on your watch; spoken announcements only vibrate."
    override val sesYokBilgi = "Your watch has no Turkish voice; spoken announcements only vibrate."
    override val otomatikYerAciklamasi =
        "When your phone is with you, your phone reads aloud; your watch only speaks when your phone is away. Only reminders with read aloud turned on are read."
    override val saatYerAciklamasi = "Your watch reads aloud. Only reminders with read aloud turned on are read."
    override val hoparlorYok = "Your watch has no speaker"
    override val sesCalisti = "The sound worked"
    override val motorYok = "No text-to-speech engine"
    override val sesYok = "No Turkish voice"
    override val sesCalinamadi = "The sound couldn't play"

    override fun vaktiCikiyor(ad: String) = "$ad is ending"
    override val tesbihatTamamlandi = "Tasbih completed"
    override val toplam = "Total"
}
