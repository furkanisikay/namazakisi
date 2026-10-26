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
 * Metinlerdeki rakamlar BATI rakamıdır (Arapçada da); cihaz yerel ayarının rakamına çizim
 * kenarında çevrilir (`Rakam.kt`) — burada Doğu Arap rakamı YAZMA.
 * Düzen: dil başına bir nesne, sıra tr, en, id, de, fr, bs, ru, ms, ar, ur; çevrilmemiş dilin nesnesi
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

    // --- Tesbihat okunuşları (ÇEVİRİ DEĞİL): zikir adları, tehlil ve hadis künyesi o dilin
    // Müslüman topluluğunun yaygın yazımıyla (sahip kararı 2026-10-25). `Tesbihat.Faz.ad(dil)`.
    val zikirSubhanallah: String
    val zikirElhamdulillah: String
    val zikirAllahuEkber: String
    val zikirTehlil: String
    val tehlilMetni: String
    val tesbihatKaynagi: String
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
    "ar" -> SaatDiliAr
    "ur" -> SaatDiliUr
    else -> SaatDiliTr
}

/** Tablosu olan diller, düzen sırasıyla (tr, en, id, de, fr, bs, ru, ms, ar, ur). */
val SAAT_DILLERI: List<SaatDili> = listOf(
    SaatDiliTr, SaatDiliEn, SaatDiliId, SaatDiliDe, SaatDiliFr, SaatDiliBs, SaatDiliRu, SaatDiliMs,
    SaatDiliAr, SaatDiliUr,
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
    override val zikirSubhanallah = "Sübhânallah"
    override val zikirElhamdulillah = "Elhamdülillâh"
    override val zikirAllahuEkber = "Allâhü ekber"
    override val zikirTehlil = "Lâ ilâhe illallâh"
    override val tehlilMetni = Tesbihat.TEHLIL_METNI
    override val tesbihatKaynagi = Tesbihat.KAYNAK
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
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// id — Endonezce (beta): vakit adları Kemenag yazımı (JS `sozluk/id/vakit.ts`), birimler
// `sure.kisa` (j/mnt/dtk), Endonezcede çoğul eki yok (CLDR yalnız "other").
object SaatDiliId : SaatDili {
    override val kod = "id"

    private val ADLAR = mapOf(
        "imsak" to "Subuh", "gunes" to "Terbit", "ogle" to "Dzuhur",
        "ikindi" to "Ashar", "aksam" to "Maghrib", "yatsi" to "Isya",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "j"
    override val birimDk = "mnt"
    override val birimSn = "dtk"
    override val birDakikadanAzKisa = "<1 mnt"
    override fun saatSesli(n: Long) = "$n jam"
    override fun dakikaSesli(n: Long) = "$n menit"
    override val birDakikadanAzSesli = "kurang dari 1 menit"

    override fun cikisaUzun(ad: String) = "$ad berakhir dalam"
    override fun cikisaAciklama(ad: String) = "Sisa waktu hingga $ad berakhir"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} dalam"
    override fun giriseAciklama(ad: String) = "Sisa waktu hingga $ad"

    override val cikisBasligi = "Akhir"
    override val girisBasligi = "Masuk"
    override fun cikisUzun(ad: String, saat: String) = "$ad berakhir $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad berakhir pukul $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad masuk $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad masuk pukul $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Berikutnya: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Salat berikutnya $ad, masuk pukul $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "hingga berakhir" else "hingga masuk"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "berakhir" else "masuk"
        return "$ad $fiil dalam $sure"
    }

    override val kilindiEki = ", ditunaikan"
    override fun sonDakikaEki(dk: Int) = ", $dk menit terakhir"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Hari ini $kilinan/$toplam ditunaikan"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · $dk mnt terakhir"
    override fun dugmeAciklamasi(ad: String) = "Tandai $ad sudah ditunaikan"
    override fun onaySorusuSatirlari(ad: String) = "Apakah Anda sudah" to "salat $ad?"
    override val vakitDegisti = "Waktu salat berganti; tidak ditandai."
    override val kabulDuasi = "Semoga Allah menerimanya"

    override val kibleHizali = "Anda menghadap kiblat"
    override val kibleArkada = "Kiblat ada di belakang Anda"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Kiblat $adim° di sebelah ${if (sag) "kanan" else "kiri"} Anda"
    override val donusArkada = "Di belakang Anda"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Kanan" else "Kiri"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Mode salat aktif · berakhir $saat"
    override val namazModuAcik = "Mode salat aktif"
    override val namazModuKapandi = "Mode salat dinonaktifkan"
    override val namazModuTelefondaAcin = "Aktifkan Mode salat sekali di ponsel Anda"
    override val telefonaUlasilamadi = "Ponsel Anda tidak dapat dijangkau"
    override val namazModuAcilamadi = "Mode salat tidak dapat diaktifkan. Coba dari ponsel Anda"
    override val camiKaydedildi = "Tercatat bahwa Anda di masjid"
    override val camiBirDahaSorulmaz = "Tidak akan ditanyakan lagi untuk waktu salat ini"
    override val camiSayilmaz = "Tempat ini tidak akan dianggap masjid lagi"
    override val soruGecersiz = "Pertanyaan ini sudah tidak berlaku"
    override val islemYapilamadi = "Tidak dapat diselesaikan. Coba dari ponsel Anda"

    override val hoparlorYokBilgi = "Jam tangan Anda tidak memiliki pengeras suara; pengumuman suara hanya diberitahukan dengan getaran."
    override val motorYokBilgi = "Mesin pembaca teks tidak ditemukan di jam tangan Anda; pengumuman suara hanya diberitahukan dengan getaran."
    override val sesYokBilgi = "Jam tangan Anda tidak memiliki suara bahasa Turki; pengumuman suara hanya diberitahukan dengan getaran."
    override val otomatikYerAciklamasi =
        "Saat ponsel ada di dekat Anda, ponsel yang membacakan; jam tangan hanya berbicara saat ponsel jauh. Hanya pengingat dengan pembacaan suara aktif yang dibacakan."
    override val saatYerAciklamasi = "Jam tangan Anda yang membacakan. Hanya pengingat dengan pembacaan suara aktif yang dibacakan."
    override val hoparlorYok = "Jam tangan Anda tidak memiliki pengeras suara"
    override val sesCalisti = "Suara berfungsi"
    override val motorYok = "Tidak ada mesin pembaca teks"
    override val sesYok = "Tidak ada suara bahasa Turki"
    override val sesCalinamadi = "Suara tidak dapat diputar"

    override fun vaktiCikiyor(ad: String) = "Waktu $ad akan berakhir"
    override val tesbihatTamamlandi = "Tasbih selesai"
    override val toplam = "Total"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la syarika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli syai'in qadir"
    override val tesbihatKaynagi = "HR. Muslim, Masajid 146"
}

/**
 * Almanca (beta, JS `sozluk/de`): vakit adları Fajr, Sonnenaufgang, Dhuhr, Asr, Maghrib, Isha;
 * süre birimleri `sure.kisa` (Std./Min./Sek.); hitap "Sie", "bitte" yok. "Sonnenaufgang" kısa
 * başlığa (~7 karakter) sığmaz → yalnız [giriseKisa]'da "Sonne" (Türkçe "Güneş"in karşılığı).
 */
object SaatDiliDe : SaatDili {
    override val kod = "de"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sonnenaufgang", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "Std."
    override val birimDk = "Min."
    override val birimSn = "Sek."
    override val birDakikadanAzKisa = "<1 Min."
    override fun saatSesli(n: Long) = if (n == 1L) "1 Stunde" else "$n Stunden"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 Minute" else "$n Minuten"
    override val birDakikadanAzSesli = "weniger als 1 Minute"

    override fun cikisaUzun(ad: String) = "$ad endet in"
    override fun cikisaAciklama(ad: String) = "Verbleibende Zeit bis zum Ende von $ad"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "Sonne" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} in"
    override fun giriseAciklama(ad: String) = "Verbleibende Zeit bis $ad"

    override val cikisBasligi = "Ende"
    override val girisBasligi = "Beginn"
    override fun cikisUzun(ad: String, saat: String) = "$ad endet $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad endet um $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad beginnt $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad beginnt um $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Nächstes: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Nächstes Gebet $ad, beginnt um $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "bis zum Ende" else "bis zum Beginn"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "endet" else "beginnt"
        return "$ad $fiil in $sure"
    }

    override val kilindiEki = ", gebetet"
    override fun sonDakikaEki(dk: Int) = ", letzte $dk Minuten"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Heute $kilinan/$toplam gebetet"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · letzte $dk Min."
    override fun dugmeAciklamasi(ad: String) = "$ad als gebetet markieren"
    override fun onaySorusuSatirlari(ad: String) = "Haben Sie" to "$ad gebetet?"
    override val vakitDegisti = "Die Gebetszeit hat sich geändert; nicht markiert."
    override val kabulDuasi = "Möge Allah es annehmen"

    override val kibleHizali = "Sie sind zur Qibla ausgerichtet"
    override val kibleArkada = "Die Qibla ist hinter Ihnen"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Die Qibla ist $adim° ${if (sag) "rechts" else "links"} von Ihnen"
    override val donusArkada = "Hinter Ihnen"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Rechts" else "Links"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Gebetsmodus an · bis $saat"
    override val namazModuAcik = "Gebetsmodus an"
    override val namazModuKapandi = "Gebetsmodus ausgeschaltet"
    override val namazModuTelefondaAcin = "Schalten Sie den Gebetsmodus einmal auf Ihrem Telefon ein"
    override val telefonaUlasilamadi = "Ihr Telefon ist nicht erreichbar"
    override val namazModuAcilamadi = "Der Gebetsmodus konnte nicht eingeschaltet werden. Versuchen Sie es über Ihr Telefon"
    override val camiKaydedildi = "Gespeichert: Sie sind in der Moschee"
    override val camiBirDahaSorulmaz = "Für diese Gebetszeit werden Sie nicht mehr gefragt"
    override val camiSayilmaz = "Dieser Ort gilt nicht mehr als Moschee"
    override val soruGecersiz = "Diese Frage ist nicht mehr aktuell"
    override val islemYapilamadi = "Das hat nicht geklappt. Versuchen Sie es über Ihr Telefon"

    override val hoparlorYokBilgi = "Ihre Uhr hat keinen Lautsprecher; vorgelesene Erinnerungen werden nur durch Vibration angezeigt."
    override val motorYokBilgi = "Auf Ihrer Uhr wurde keine Sprachausgabe gefunden; vorgelesene Erinnerungen werden nur durch Vibration angezeigt."
    override val sesYokBilgi = "Ihre Uhr hat keine türkische Stimme; vorgelesene Erinnerungen werden nur durch Vibration angezeigt."
    override val otomatikYerAciklamasi =
        "Ist Ihr Telefon bei Ihnen, liest das Telefon vor; Ihre Uhr spricht nur, wenn das Telefon entfernt ist. Nur Erinnerungen mit eingeschaltetem Vorlesen werden vorgelesen."
    override val saatYerAciklamasi = "Ihre Uhr liest vor. Nur Erinnerungen mit eingeschaltetem Vorlesen werden vorgelesen."
    override val hoparlorYok = "Ihre Uhr hat keinen Lautsprecher"
    override val sesCalisti = "Der Ton hat funktioniert"
    override val motorYok = "Keine Sprachausgabe"
    override val sesYok = "Keine türkische Stimme"
    override val sesCalinamadi = "Der Ton konnte nicht abgespielt werden"

    override fun vaktiCikiyor(ad: String) = "$ad endet gleich"
    override val tesbihatTamamlandi = "Tasbih abgeschlossen"
    override val toplam = "Gesamt"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir"
    override val tesbihatKaynagi = "Muslim, Masadschid 146"
}

// fr
/**
 * Fransızca (JS `sozluk/fr`): vakit adları özel addır (Fajr, Lever du soleil, Dhuhr, Asr,
 * Maghrib, Isha); adın önüne "de" yazılmaz (elizyon), ad özne ya da iki noktadan sonra durur.
 * Çoğul: 0 ve 1 tekildir. Kısa başlıkta "Lever du soleil" sığmaz → "Lever".
 */
object SaatDiliFr : SaatDili {
    override val kod = "fr"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Lever du soleil", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 0L || n == 1L) "$n heure" else "$n heures"
    override fun dakikaSesli(n: Long) = if (n == 0L || n == 1L) "$n minute" else "$n minutes"
    override val birDakikadanAzSesli = "moins d’une minute"

    override fun cikisaUzun(ad: String) = "$ad se termine dans"
    override fun cikisaAciklama(ad: String) = "Temps restant pour $ad"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "Lever" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} dans"
    override fun giriseAciklama(ad: String) = "Temps restant avant $ad"

    override val cikisBasligi = "Fin"
    override val girisBasligi = "Début"
    override fun cikisUzun(ad: String, saat: String) = "$ad finit à $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad se termine à $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad commence à $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad commence à $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Prochaine : $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Prochaine prière : $ad, à $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "avant la fin" else "avant le début"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "se termine" else "commence"
        return "$ad $fiil dans $sure"
    }

    override val kilindiEki = ", accompli"
    override fun sonDakikaEki(dk: Int) = ", dernières $dk minutes"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Aujourd’hui $kilinan/$toplam accomplies"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · $dk min restantes"
    override fun dugmeAciklamasi(ad: String) = "Marquer $ad comme accompli"
    override fun onaySorusuSatirlari(ad: String) = "Avez-vous prié" to "$ad ?"
    override val vakitDegisti = "L’heure de prière a changé, rien n’a été marqué."
    override val kabulDuasi = "Qu’Allah l’accepte"

    override val kibleHizali = "Vous êtes face à la Qibla"
    override val kibleArkada = "La Qibla est derrière vous"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "La Qibla est à $adim° sur votre ${if (sag) "droite" else "gauche"}"
    override val donusArkada = "Derrière vous"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "À droite" else "À gauche"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Mode prière activé · fin $saat"
    override val namazModuAcik = "Mode prière activé"
    override val namazModuKapandi = "Mode prière désactivé"
    override val namazModuTelefondaAcin = "Activez une fois le mode prière sur votre téléphone"
    override val telefonaUlasilamadi = "Impossible de joindre votre téléphone"
    override val namazModuAcilamadi = "Impossible d’activer le mode prière. Essayez depuis votre téléphone"
    override val camiKaydedildi = "Votre présence à la mosquée est enregistrée"
    override val camiBirDahaSorulmaz = "La question ne sera plus posée pour cette prière"
    override val camiSayilmaz = "Ce lieu ne sera plus considéré comme une mosquée"
    override val soruGecersiz = "Cette question n’est plus valable"
    override val islemYapilamadi = "Action impossible. Essayez depuis votre téléphone"

    override val hoparlorYokBilgi = "Votre montre n’a pas de haut-parleur ; les annonces vocales se limitent à une vibration."
    override val motorYokBilgi = "Aucun moteur de synthèse vocale n’a été trouvé sur votre montre ; les annonces vocales se limitent à une vibration."
    override val sesYokBilgi = "Votre montre n’a pas de voix turque ; les annonces vocales se limitent à une vibration."
    override val otomatikYerAciklamasi =
        "Quand votre téléphone est près de vous, c’est lui qui lit à voix haute ; votre montre ne parle que lorsque votre téléphone est loin. Seuls les rappels dont la lecture à voix haute est activée sont lus."
    override val saatYerAciklamasi = "C’est votre montre qui lit à voix haute. Seuls les rappels dont la lecture à voix haute est activée sont lus."
    override val hoparlorYok = "Votre montre n’a pas de haut-parleur"
    override val sesCalisti = "Le son a fonctionné"
    override val motorYok = "Aucun moteur de synthèse vocale"
    override val sesYok = "Pas de voix turque"
    override val sesCalinamadi = "Impossible de lire le son"

    override fun vaktiCikiyor(ad: String) = "$ad se termine"
    override val tesbihatTamamlandi = "Tasbih terminé"
    override val toplam = "Total"
    override val zikirSubhanallah = "Soubhanallah"
    override val zikirElhamdulillah = "Alhamdoulillah"
    override val zikirAllahuEkber = "Allahou akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahou wahdahou la charika lah, lahoul-moulkou wa lahoul-hamdou wa houwa 'ala koulli chay'in qadir"
    override val tesbihatKaynagi = "Mouslim, Masajid 146"
}

// bs
object SaatDiliBs : SaatDili {
    override val kod = "bs"

    private val ADLAR = mapOf(
        "imsak" to "Sabah", "gunes" to "Izlazak sunca", "ogle" to "Podne",
        "ikindi" to "Ikindija", "aksam" to "Akšam", "yatsi" to "Jacija",
    )

    /** CLDR (bs): one = …1 (…11 hariç); few = …2–4 (…12–14 hariç); kalanı other (JS `cogul.ts`). */
    private fun cogul(n: Long, one: String, few: String, other: String): String {
        val s10 = n % 10
        val s100 = n % 100
        val kalip = when {
            s10 == 1L && s100 != 11L -> one
            s10 in 2L..4L && s100 !in 12L..14L -> few
            else -> other
        }
        return "$n $kalip"
    }

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = cogul(n, "sat", "sata", "sati")
    override fun dakikaSesli(n: Long) = cogul(n, "minuta", "minute", "minuta")
    override val birDakikadanAzSesli = "manje od 1 minute"

    override fun cikisaUzun(ad: String) = "$ad ističe za"
    override fun cikisaAciklama(ad: String) = "Preostalo vrijeme do isteka vakta: $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} za"
    override fun giriseAciklama(ad: String) = "Preostalo vrijeme do vakta: $ad"

    override val cikisBasligi = "Ističe"
    override val girisBasligi = "Nastupa"
    override fun cikisUzun(ad: String, saat: String) = "$ad ističe $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad: vakat ističe u $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad nastupa $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad: vakat nastupa u $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Sljedeći: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Sljedeći namaz: $ad, nastupa u $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "do isteka vakta" else "do nastupa vakta"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ističe" else "nastupa"
        return "$ad: vakat $fiil za $sure"
    }

    override val kilindiEki = ", klanjano"
    override fun sonDakikaEki(dk: Int) = ", još $dk min"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Danas klanjano $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · još $dk min"
    override fun dugmeAciklamasi(ad: String) = "Označite namaz ($ad) kao klanjan"

    /** Ada hâl eki üretilmez (çekimsiz ad): ad ilk satırda, soru ikinci satırda. */
    override fun onaySorusuSatirlari(ad: String) = "$ad:" to "jeste li klanjali?"
    override val vakitDegisti = "Vakat se promijenio; nije označeno."
    override val kabulDuasi = "Allah kabul ejlesun"

    override val kibleHizali = "Okrenuti ste prema kibli"
    override val kibleArkada = "Kibla je iza Vas"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Kibla je $adim° ${if (sag) "desno" else "lijevo"} od Vas"
    override val donusArkada = "Iza Vas"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Desno" else "Lijevo"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Režim namaza uključen · do $saat"
    override val namazModuAcik = "Režim namaza uključen"
    override val namazModuKapandi = "Režim namaza je isključen"
    override val namazModuTelefondaAcin = "Jednom uključite Režim namaza na telefonu"
    override val telefonaUlasilamadi = "Vaš telefon nije dostupan"
    override val namazModuAcilamadi = "Režim namaza nije uključen. Pokušajte s telefona"
    override val camiKaydedildi = "Zabilježeno je da ste u džamiji"
    override val camiBirDahaSorulmaz = "U ovom vaktu više nećete biti upitani"
    override val camiSayilmaz = "Ovo mjesto se više neće računati kao džamija"
    override val soruGecersiz = "Ovo pitanje više ne važi"
    override val islemYapilamadi = "Radnja nije izvršena. Pokušajte s telefona"

    override val hoparlorYokBilgi = "Vaš sat nema zvučnik; obavještenja za čitanje naglas samo vibriraju."
    override val motorYokBilgi = "Na Vašem satu nije pronađen sistem za čitanje teksta; obavještenja za čitanje naglas samo vibriraju."
    override val sesYokBilgi = "Na Vašem satu nema turskog glasa; obavještenja za čitanje naglas samo vibriraju."
    override val otomatikYerAciklamasi =
        "Kada je telefon kod Vas, čita telefon; sat govori samo kada je telefon daleko. Čitaju se samo podsjetnici s uključenim čitanjem naglas."
    override val saatYerAciklamasi = "Čitanje naglas obavlja Vaš sat. Čitaju se samo podsjetnici s uključenim čitanjem naglas."
    override val hoparlorYok = "Vaš sat nema zvučnik"
    override val sesCalisti = "Zvuk radi"
    override val motorYok = "Nema sistema za čitanje teksta"
    override val sesYok = "Nema turskog glasa"
    override val sesCalinamadi = "Zvuk se nije mogao pustiti"

    override fun vaktiCikiyor(ad: String) = "$ad: vakat ističe"
    override val tesbihatTamamlandi = "Tesbih je završen"
    override val toplam = "Ukupno"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Elhamdulillah"
    override val zikirAllahuEkber = "Allahu ekber"
    override val zikirTehlil = "La ilahe illallah"
    override val tehlilMetni = "La ilahe illallahu vahdehu la šerike leh, lehul-mulku ve lehul-hamdu ve huve ala kulli šej'in kadir"
    override val tesbihatKaynagi = "Muslim, Mesadžid 146"
}

// ru
object SaatDiliRu : SaatDili {
    override val kod = "ru"

    private val ADLAR = mapOf(
        "imsak" to "Фаджр", "gunes" to "Восход", "ogle" to "Зухр",
        "ikindi" to "Аср", "aksam" to "Магриб", "yatsi" to "Иша",
    )

    /** CLDR ru: one (1, 21…), few (2–4, 22–24…), many (geri kalan tamsayılar). */
    private fun cogul(n: Long, one: String, few: String, many: String): String {
        val s10 = n % 10L
        val s100 = n % 100L
        return when {
            s10 == 1L && s100 != 11L -> one
            s10 in 2L..4L && s100 !in 12L..14L -> few
            else -> many
        }
    }

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ч"
    override val birimDk = "мин"
    override val birimSn = "с"
    override val birDakikadanAzKisa = "<1 мин"
    override fun saatSesli(n: Long) = cogul(n, "$n час", "$n часа", "$n часов")
    override fun dakikaSesli(n: Long) = cogul(n, "$n минута", "$n минуты", "$n минут")
    override val birDakikadanAzSesli = "меньше минуты"

    override fun cikisaUzun(ad: String) = "$ad закончится через"
    override fun cikisaAciklama(ad: String) = "Осталось до конца времени намаза $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} через"
    override fun giriseAciklama(ad: String) = "Осталось до времени намаза $ad"

    override val cikisBasligi = "Конец"
    override val girisBasligi = "Начало"
    override fun cikisUzun(ad: String, saat: String) = "$ad: конец $saat"
    override fun cikisAciklama(ad: String, saat: String) = "Время намаза $ad заканчивается в $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad: начало $saat"
    override fun girisAciklama(ad: String, saat: String) = "Время намаза $ad начинается в $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Следующий: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Следующий намаз — $ad, начало в $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "до конца времени" else "до начала времени"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val sinir = if (mod == KalanSure.Mod.CIKIS) "конца" else "начала"
        return "До $sinir времени намаза $ad — $sure"
    }

    override val kilindiEki = ", совершён"
    override fun sonDakikaEki(dk: Int) =
        cogul(dk.toLong(), ", последняя $dk минута", ", последние $dk минуты", ", последние $dk минут")
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Сегодня совершено $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · последние $dk мин"
    override fun dugmeAciklamasi(ad: String) = "Отметить намаз $ad как совершённый"
    override fun onaySorusuSatirlari(ad: String) = "Вы совершили" to "намаз $ad?"
    override val vakitDegisti = "Время намаза сменилось; отметка не сделана."
    override val kabulDuasi = "Да примет Аллах"

    override val kibleHizali = "Вы повёрнуты к кибле"
    override val kibleArkada = "Кибла позади вас"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Кибла на $adim° ${if (sag) "справа" else "слева"} от вас"
    override val donusArkada = "Позади вас"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Направо" else "Налево"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Режим намаза включён · до $saat"
    override val namazModuAcik = "Режим намаза включён"
    override val namazModuKapandi = "Режим намаза выключен"
    override val namazModuTelefondaAcin = "Один раз включите режим намаза на телефоне"
    override val telefonaUlasilamadi = "Не удаётся связаться с телефоном"
    override val namazModuAcilamadi = "Не удалось включить режим намаза. Попробуйте с телефона"
    override val camiKaydedildi = "Сохранено, что вы в мечети"
    override val camiBirDahaSorulmaz = "Для этого времени намаза вопрос больше не появится"
    override val camiSayilmaz = "Это место больше не будет считаться мечетью"
    override val soruGecersiz = "Этот вопрос больше не актуален"
    override val islemYapilamadi = "Не удалось выполнить. Попробуйте с телефона"

    override val hoparlorYokBilgi = "На часах нет динамика; вместо озвучивания будет только вибрация."
    override val motorYokBilgi = "На часах не найден синтезатор речи; вместо озвучивания будет только вибрация."
    override val sesYokBilgi = "На часах нет русского голоса; вместо озвучивания будет только вибрация."
    override val otomatikYerAciklamasi =
        "Когда телефон рядом, озвучивает он; часы говорят, только когда телефон далеко. Озвучиваются только напоминания с включённым озвучиванием."
    override val saatYerAciklamasi = "Озвучивают часы. Озвучиваются только напоминания с включённым озвучиванием."
    override val hoparlorYok = "На часах нет динамика"
    override val sesCalisti = "Звук работает"
    override val motorYok = "Нет синтезатора речи"
    override val sesYok = "Нет русского голоса"
    override val sesCalinamadi = "Не удалось воспроизвести звук"

    override fun vaktiCikiyor(ad: String) = "Время намаза $ad заканчивается"
    override val tesbihatTamamlandi = "Тасбих завершён"
    override val toplam = "Всего"
    override val zikirSubhanallah = "Субханаллах"
    override val zikirElhamdulillah = "Альхамдулиллях"
    override val zikirAllahuEkber = "Аллаху акбар"
    override val zikirTehlil = "Ля иляха илляллах"
    override val tehlilMetni = "Ля иляха илляллаху вахдаху ля шарика лях, ляхуль-мульку ва ляхуль-хамду ва хуа 'аля кулли шай'ин кадир"
    override val tesbihatKaynagi = "Муслим, Масаджид 146"
}

// ms
/**
 * Malayca (JS `sozluk/ms`): vakit adları JAKIM yazımıyla (Subuh, Syuruk, Zohor, Asar, Maghrib,
 * Isyak); birimler `sure.kisa` (j/min/s); çoğul biçim yok; kısa başlıklar en fazla 7 karakter.
 */
object SaatDiliMs : SaatDili {
    override val kod = "ms"

    private val ADLAR = mapOf(
        "imsak" to "Subuh", "gunes" to "Syuruk", "ogle" to "Zohor",
        "ikindi" to "Asar", "aksam" to "Maghrib", "yatsi" to "Isyak",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "j"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = "$n jam"
    override fun dakikaSesli(n: Long) = "$n minit"
    override val birDakikadanAzSesli = "kurang daripada 1 minit"

    override fun cikisaUzun(ad: String) = "$ad tamat dalam"
    override fun cikisaAciklama(ad: String) = "Baki masa sehingga waktu $ad tamat"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} dalam"
    override fun giriseAciklama(ad: String) = "Baki masa sehingga masuk waktu $ad"

    override val cikisBasligi = "Tamat"
    override val girisBasligi = "Masuk"
    override fun cikisUzun(ad: String, saat: String) = "$ad tamat $saat"
    override fun cikisAciklama(ad: String, saat: String) = "Waktu $ad tamat pada $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad masuk $saat"
    override fun girisAciklama(ad: String, saat: String) = "Waktu $ad masuk pada $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Seterusnya: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Solat seterusnya $ad, masuk pada $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "hingga waktu tamat" else "hingga masuk waktu"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "tamat" else "masuk"
        return "Waktu $ad $fiil dalam $sure"
    }

    override val kilindiEki = ", ditunaikan"
    override fun sonDakikaEki(dk: Int) = ", $dk minit terakhir"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Hari ini $kilinan/$toplam ditunaikan"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · $dk min terakhir"
    override fun dugmeAciklamasi(ad: String) = "Tandakan solat $ad sebagai ditunaikan"
    override fun onaySorusuSatirlari(ad: String) = "Sudahkah anda" to "solat $ad?"
    override val vakitDegisti = "Waktu solat berubah; tidak ditandakan."
    override val kabulDuasi = "Semoga Allah menerimanya"

    override val kibleHizali = "Anda menghadap kiblat"
    override val kibleArkada = "Kiblat di belakang anda"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Kiblat $adim° di sebelah ${if (sag) "kanan" else "kiri"} anda"
    override val donusArkada = "Di belakang anda"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Kanan" else "Kiri"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Mod Solat hidup · tamat $saat"
    override val namazModuAcik = "Mod Solat hidup"
    override val namazModuKapandi = "Mod Solat dimatikan"
    override val namazModuTelefondaAcin = "Hidupkan mod Solat sekali di telefon anda"
    override val telefonaUlasilamadi = "Telefon anda tidak dapat dihubungi"
    override val namazModuAcilamadi = "Mod Solat tidak dapat dihidupkan. Cuba dari telefon anda"
    override val camiKaydedildi = "Direkodkan bahawa anda berada di masjid"
    override val camiBirDahaSorulmaz = "Anda tidak akan ditanya lagi bagi waktu solat ini"
    override val camiSayilmaz = "Tempat ini tidak akan dikira sebagai masjid lagi"
    override val soruGecersiz = "Soalan ini tidak lagi berkenaan"
    override val islemYapilamadi = "Tidak dapat dilakukan. Cuba dari telefon anda"

    override val hoparlorYokBilgi = "Jam tangan anda tiada pembesar suara; bacaan suara hanya dimaklumkan dengan getaran."
    override val motorYokBilgi = "Tiada enjin teks ke pertuturan ditemui di jam tangan anda; bacaan suara hanya dimaklumkan dengan getaran."
    override val sesYokBilgi = "Jam tangan anda tiada suara dalam bahasa aplikasi; bacaan suara hanya dimaklumkan dengan getaran."
    override val otomatikYerAciklamasi =
        "Apabila telefon ada bersama anda, telefon yang membaca; jam tangan anda hanya bersuara apabila telefon jauh. Hanya peringatan yang bacaan suaranya dihidupkan akan dibaca."
    override val saatYerAciklamasi = "Jam tangan anda yang membaca. Hanya peringatan yang bacaan suaranya dihidupkan akan dibaca."
    override val hoparlorYok = "Jam tangan anda tiada pembesar suara"
    override val sesCalisti = "Bunyi berfungsi"
    override val motorYok = "Tiada enjin teks ke pertuturan"
    override val sesYok = "Tiada suara dalam bahasa aplikasi"
    override val sesCalinamadi = "Bunyi tidak dapat dimainkan"

    override fun vaktiCikiyor(ad: String) = "Waktu $ad hampir tamat"
    override val tesbihatTamamlandi = "Tasbih selesai"
    override val toplam = "Jumlah"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahuakbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la syarika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli syai'in qadir"
    override val tesbihatKaynagi = "Riwayat Muslim, Masajid 146"
}


// ar — Arapça (beta): JS `sozluk/ar` (vakit, sure, kible, samimiyet); yönetim metni mastar/isim
// kalıbı (cinsiyetsiz), "Kılındı" = تمّت. Birimler `sure.kisa` (س/د/ث); rakam Batı (0-9).
object SaatDiliAr : SaatDili {
    override val kod = "ar"

    private val ADLAR = mapOf(
        "imsak" to "الفجر", "gunes" to "الشروق", "ogle" to "الظهر",
        "ikindi" to "العصر", "aksam" to "المغرب", "yatsi" to "العشاء",
    )

    /**
     * CLDR ar (JS `cogul.ts > arapca`): zero = 0, one = 1, two = 2, few = …03–…10,
     * many = …11–…99, kalanı other (100, 101, 102…). Çeviride her kategori kendi kalıbını alır.
     */
    fun cogulKategorisi(n: Long): String {
        val s100 = n % 100L
        return when {
            n == 0L -> "zero"
            n == 1L -> "one"
            n == 2L -> "two"
            s100 in 3L..10L -> "few"
            s100 in 11L..99L -> "many"
            else -> "other"
        }
    }

    private fun cogul(n: Long, zero: String, one: String, two: String, few: String, many: String, other: String) =
        when (cogulKategorisi(n)) {
            "zero" -> zero
            "one" -> one
            "two" -> two
            "few" -> few
            "many" -> many
            else -> other
        }

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "س"
    override val birimDk = "د"
    override val birimSn = "ث"
    override val birDakikadanAzKisa = "أقل من 1 د"
    override fun saatSesli(n: Long) = cogul(n, "$n ساعة", "ساعة واحدة", "ساعتان", "$n ساعات", "$n ساعة", "$n ساعة")
    override fun dakikaSesli(n: Long) = cogul(n, "$n دقيقة", "دقيقة واحدة", "دقيقتان", "$n دقائق", "$n دقيقة", "$n دقيقة")
    override val birDakikadanAzSesli = "أقل من دقيقة"
    override fun sesliBirlesik(saat: String, dakika: String) = "$saat و$dakika"

    override fun cikisaUzun(ad: String) = "ينتهي $ad بعد"
    override fun cikisaAciklama(ad: String) = "الوقت المتبقي على خروج وقت $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} بعد"
    override fun giriseAciklama(ad: String) = "الوقت المتبقي على دخول وقت $ad"

    override val cikisBasligi = "النهاية"
    override val girisBasligi = "الدخول"
    override fun cikisUzun(ad: String, saat: String) = "نهاية $ad $saat"
    override fun cikisAciklama(ad: String, saat: String) = "يخرج وقت $ad الساعة $saat"
    override fun girisUzun(ad: String, saat: String) = "دخول $ad $saat"
    override fun girisAciklama(ad: String, saat: String) = "يدخل وقت $ad الساعة $saat"
    override fun siradakiUzun(ad: String, saat: String) = "التالية: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "الصلاة التالية $ad، تدخل الساعة $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "حتى خروج الوقت" else "حتى دخول الوقت"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val sinir = if (mod == KalanSure.Mod.CIKIS) "خروج" else "دخول"
        return "المتبقي على $sinir وقت $ad: $sure"
    }

    override val kilindiEki = "، تمّت"
    override fun sonDakikaEki(dk: Int) =
        cogul(dk.toLong(), "، آخر $dk دقيقة", "، آخر دقيقة", "، آخر دقيقتين", "، آخر $dk دقائق", "، آخر $dk دقيقة", "، آخر $dk دقيقة")
    override fun bugunEki(kilinan: Int, toplam: Int) = ". اليوم تمّت $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · آخر $dk د"
    override fun dugmeAciklamasi(ad: String) = "وضع علامة «تمّت» على صلاة $ad"
    override fun onaySorusuSatirlari(ad: String) = "هل أُدّيت" to "صلاة $ad؟"
    override val vakitDegisti = "تغيّر الوقت؛ لم تُوضع العلامة."
    override val kabulDuasi = "تقبّل الله"

    override val kibleHizali = "أنت باتجاه القبلة"
    override val kibleArkada = "القبلة خلفك"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "القبلة $adim° إلى ${if (sag) "يمينك" else "يسارك"}"
    override val donusArkada = "خلفك"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "يمينًا" else "يسارًا"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "وضع الصلاة مفعّل · ينتهي $saat"
    override val namazModuAcik = "وضع الصلاة مفعّل"
    override val namazModuKapandi = "أُوقف وضع الصلاة"
    override val namazModuTelefondaAcin = "يلزم تفعيل وضع الصلاة على هاتفك مرة واحدة"
    override val telefonaUlasilamadi = "يتعذّر الوصول إلى هاتفك"
    override val namazModuAcilamadi = "تعذّر تفعيل وضع الصلاة. المحاولة من هاتفك"
    override val camiKaydedildi = "حُفظ وجودك في المسجد"
    override val camiBirDahaSorulmaz = "لن يُطرح السؤال مجددًا في هذا الوقت"
    override val camiSayilmaz = "لن يُعدّ هذا المكان مسجدًا بعد الآن"
    override val soruGecersiz = "لم يعد هذا السؤال قائمًا"
    override val islemYapilamadi = "تعذّر التنفيذ. المحاولة من هاتفك"

    override val hoparlorYokBilgi = "لا يوجد مكبّر صوت في ساعتك؛ يُكتفى بالاهتزاز بدل القراءة الصوتية."
    override val motorYokBilgi = "لم يُعثر على محرك لقراءة النصوص في ساعتك؛ يُكتفى بالاهتزاز بدل القراءة الصوتية."
    override val sesYokBilgi = "لا يوجد صوت عربي في ساعتك؛ يُكتفى بالاهتزاز بدل القراءة الصوتية."
    override val otomatikYerAciklamasi =
        "حين يكون هاتفك قريبًا يقرأ الهاتف، ولا تتكلم ساعتك إلا حين يكون الهاتف بعيدًا. تُقرأ التذكيرات المفعّل فيها الإعلان الصوتي فقط."
    override val saatYerAciklamasi = "تقرأ ساعتك. تُقرأ التذكيرات المفعّل فيها الإعلان الصوتي فقط."
    override val hoparlorYok = "لا يوجد مكبّر صوت في ساعتك"
    override val sesCalisti = "عمل الصوت"
    override val motorYok = "لا يوجد محرك لقراءة النصوص"
    override val sesYok = "لا يوجد صوت عربي"
    override val sesCalinamadi = "تعذّر تشغيل الصوت"

    override fun vaktiCikiyor(ad: String) = "وقت $ad يوشك أن يخرج"
    override val tesbihatTamamlandi = "اكتمل التسبيح"
    override val toplam = "المجموع"
    override val zikirSubhanallah = "سبحان الله"
    override val zikirElhamdulillah = "الحمد لله"
    override val zikirAllahuEkber = "الله أكبر"
    override val zikirTehlil = "لا إله إلا الله"
    override val tehlilMetni = "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير"
    override val tesbihatKaynagi = "صحيح مسلم، المساجد 146"
}


// ur
// CLDR ur: one/other (JS `sozluk/ur/sure.ts`). Urducada süre birimi kısaltılmaz. SHORT_TEXT başlığı
// ~7 karakter taşır → [giriseKisa]'da "طلوعِ آفتاب" yerine "طلوع".
object SaatDiliUr : SaatDili {
    override val kod = "ur"

    private val ADLAR = mapOf(
        "imsak" to "فجر", "gunes" to "طلوعِ آفتاب", "ogle" to "ظہر",
        "ikindi" to "عصر", "aksam" to "مغرب", "yatsi" to "عشاء",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "گھنٹے"
    override val birimDk = "منٹ"
    override val birimSn = "سیکنڈ"
    override val birDakikadanAzKisa = "1 منٹ سے کم"
    override fun saatSesli(n: Long) = if (n == 1L) "1 گھنٹہ" else "$n گھنٹے"
    override fun dakikaSesli(n: Long) = "$n منٹ"
    override val birDakikadanAzSesli = "1 منٹ سے کم"

    override fun cikisaUzun(ad: String) = "$ad ختم ہونے میں"
    override fun cikisaAciklama(ad: String) = "$ad کا وقت ختم ہونے میں باقی وقت"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "طلوع" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} تک"
    override fun giriseAciklama(ad: String) = "$ad تک باقی وقت"

    override val cikisBasligi = "اختتام"
    override val girisBasligi = "آغاز"
    override fun cikisUzun(ad: String, saat: String) = "$ad اختتام $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad کا وقت $saat پر ختم ہوتا ہے"
    override fun girisUzun(ad: String, saat: String) = "$ad آغاز $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad کا وقت $saat پر شروع ہوتا ہے"
    override fun siradakiUzun(ad: String, saat: String) = "اگلی: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "اگلی نماز $ad، آغاز $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "ختم ہونے میں" else "شروع ہونے میں"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ختم ہونے" else "شروع ہونے"
        return "$ad کا وقت $fiil میں $sure"
    }

    override val kilindiEki = "، ادا شدہ"
    override fun sonDakikaEki(dk: Int) = "، آخری $dk منٹ"
    override fun bugunEki(kilinan: Int, toplam: Int) = "۔ آج $kilinan/$toplam ادا شدہ"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · آخری $dk منٹ"
    override fun dugmeAciklamasi(ad: String) = "$ad پر ادا شدہ کا نشان لگائیں"
    override fun onaySorusuSatirlari(ad: String) = "کیا آپ نے $ad کی نماز" to "پڑھ لی؟"
    override val vakitDegisti = "نماز کا وقت بدل گیا؛ نشان نہیں لگا۔"
    override val kabulDuasi = "اللہ قبول فرمائے"

    override val kibleHizali = "آپ قبلہ رخ ہیں"
    override val kibleArkada = "قبلہ آپ کے پیچھے ہے"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "قبلہ آپ کے ${if (sag) "دائیں" else "بائیں"} جانب $adim° پر ہے"
    override val donusArkada = "پیچھے"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "دائیں" else "بائیں"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "نماز موڈ آن · اختتام $saat"
    override val namazModuAcik = "نماز موڈ آن"
    override val namazModuKapandi = "نماز موڈ بند ہو گیا"
    override val namazModuTelefondaAcin = "اپنے فون پر نماز موڈ ایک بار آن کریں"
    override val telefonaUlasilamadi = "آپ کے فون سے رابطہ نہیں ہو سکا"
    override val namazModuAcilamadi = "نماز موڈ آن نہیں ہو سکا۔ اپنے فون سے کوشش کریں"
    override val camiKaydedildi = "آپ کے مسجد میں ہونے کا اندراج ہو گیا"
    override val camiBirDahaSorulmaz = "اس نماز کے وقت میں دوبارہ نہیں پوچھا جائے گا"
    override val camiSayilmaz = "یہ جگہ آئندہ مسجد شمار نہیں ہوگی"
    override val soruGecersiz = "یہ سوال اب لاگو نہیں"
    override val islemYapilamadi = "یہ کام نہیں ہو سکا۔ اپنے فون سے کوشش کریں"

    override val hoparlorYokBilgi = "آپ کی گھڑی میں اسپیکر نہیں؛ بلند خوانی کی جگہ صرف وائبریشن ہوگی۔"
    override val motorYokBilgi = "آپ کی گھڑی میں متن پڑھنے کا انجن نہیں ملا؛ بلند خوانی کی جگہ صرف وائبریشن ہوگی۔"
    override val sesYokBilgi = "آپ کی گھڑی میں اردو آواز نہیں؛ بلند خوانی کی جگہ صرف وائبریشن ہوگی۔"
    override val otomatikYerAciklamasi =
        "فون پاس ہو تو بلند خوانی فون کرتا ہے؛ گھڑی صرف فون دور ہونے پر بولتی ہے۔ صرف وہ یاد دہانیاں پڑھی جاتی ہیں جن میں بلند خوانی آن ہو۔"
    override val saatYerAciklamasi = "بلند خوانی آپ کی گھڑی کرتی ہے۔ صرف وہ یاد دہانیاں پڑھی جاتی ہیں جن میں بلند خوانی آن ہو۔"
    override val hoparlorYok = "گھڑی میں اسپیکر نہیں"
    override val sesCalisti = "آواز چل گئی"
    override val motorYok = "متن پڑھنے کا انجن نہیں"
    override val sesYok = "اردو آواز نہیں"
    override val sesCalinamadi = "آواز نہیں چل سکی"

    override fun vaktiCikiyor(ad: String) = "$ad کا وقت ختم ہو رہا ہے"
    override val tesbihatTamamlandi = "تسبیح مکمل ہو گئی"
    override val toplam = "کل تعداد"
    override val zikirSubhanallah = "سبحان اللہ"
    override val zikirElhamdulillah = "الحمد للہ"
    override val zikirAllahuEkber = "اللہ اکبر"
    override val zikirTehlil = "لا الہ الا اللہ"
    override val tehlilMetni = "لا الہ الا اللہ وحدہ لا شریک لہ، لہ الملک ولہ الحمد وہو علیٰ کل شیء قدیر"
    override val tesbihatKaynagi = "صحیح مسلم، کتاب المساجد 146"
}
