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
 * Düzen: dil başına bir nesne, sıra tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg
 * (Özbekçe Latin, Kazakça Kiril yazılır: `docs/ajan/coklu-dil.md > Alfabe`); çevrilmemiş dilin nesnesi
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
    "es" -> SaatDiliEs
    "nl" -> SaatDiliNl
    "sq" -> SaatDiliSq
    "hi" -> SaatDiliHi
    "bn" -> SaatDiliBn
    "fa" -> SaatDiliFa
    "ps" -> SaatDiliPs
    "ckb" -> SaatDiliCkb
    "ug" -> SaatDiliUg
    "az" -> SaatDiliAz
    "uz" -> SaatDiliUz
    "kk" -> SaatDiliKk
    "ky" -> SaatDiliKy
    "tg" -> SaatDiliTg
    else -> SaatDiliTr
}

/** Tablosu olan diller, düzen sırasıyla (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg). */
val SAAT_DILLERI: List<SaatDili> = listOf(
    SaatDiliTr, SaatDiliEn, SaatDiliId, SaatDiliDe, SaatDiliFr, SaatDiliBs, SaatDiliRu, SaatDiliMs,
    SaatDiliAr, SaatDiliUr, SaatDiliEs, SaatDiliNl, SaatDiliSq, SaatDiliHi, SaatDiliBn,
    SaatDiliFa, SaatDiliPs, SaatDiliCkb, SaatDiliUg,
    SaatDiliAz, SaatDiliUz, SaatDiliKk, SaatDiliKy, SaatDiliTg,
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

// es
// CLDR es: one = 1, many = 1.000.000 katları, other (JS `cogul.ts > ispanyolca`); süre için many = other.
/**
 * İspanyolca (JS `sozluk/es`): hitap "usted"; vakit adları özel addır (Fajr, Salida del sol, Dhuhr,
 * Asr, Maghrib, Isha). Kısa başlıkta "Salida del sol" sığmaz → "Salida". "Kılındı" = "Rezado".
 */
object SaatDiliEs : SaatDili {
    override val kod = "es"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Salida del sol", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 hora" else "$n horas"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minuto" else "$n minutos"
    override val birDakikadanAzSesli = "menos de 1 minuto"

    override fun cikisaUzun(ad: String) = "$ad termina en"
    override fun cikisaAciklama(ad: String) = "Tiempo restante hasta que termine $ad"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "Salida" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} en"
    override fun giriseAciklama(ad: String) = "Tiempo restante hasta $ad"

    override val cikisBasligi = "Fin"
    override val girisBasligi = "Inicio"
    override fun cikisUzun(ad: String, saat: String) = "$ad termina $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad termina a las $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad comienza $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad comienza a las $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Siguiente: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Siguiente rezo: $ad, a las $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "hasta que termine" else "hasta que comience"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "termina" else "comienza"
        return "$ad $fiil en $sure"
    }

    override val kilindiEki = ", rezado"
    override fun sonDakikaEki(dk: Int) = ", últimos $dk minutos"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Hoy $kilinan/$toplam rezados"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · $dk min restantes"
    override fun dugmeAciklamasi(ad: String) = "Marcar $ad como rezado"
    override fun onaySorusuSatirlari(ad: String) = "¿Ya rezó" to "$ad?"
    override val vakitDegisti = "La hora del rezo cambió; no se marcó."
    override val kabulDuasi = "Que Allah lo acepte"

    override val kibleHizali = "Está frente a la alquibla"
    override val kibleArkada = "La alquibla está detrás de usted"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "La alquibla está $adim° a su ${if (sag) "derecha" else "izquierda"}"
    override val donusArkada = "Detrás de usted"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Derecha" else "Izquierda"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Modo rezo activado · termina $saat"
    override val namazModuAcik = "Modo rezo activado"
    override val namazModuKapandi = "Modo rezo desactivado"
    override val namazModuTelefondaAcin = "Active una vez el modo rezo en su teléfono"
    override val telefonaUlasilamadi = "No se puede conectar con su teléfono"
    override val namazModuAcilamadi = "No se pudo activar el modo rezo. Inténtelo desde su teléfono"
    override val camiKaydedildi = "Se guardó que está en la mezquita"
    override val camiBirDahaSorulmaz = "No se le volverá a preguntar en esta hora de rezo"
    override val camiSayilmaz = "Este lugar ya no contará como mezquita"
    override val soruGecersiz = "Esta pregunta ya no es válida"
    override val islemYapilamadi = "No se pudo completar. Inténtelo desde su teléfono"

    override val hoparlorYokBilgi = "Su reloj no tiene altavoz; los avisos hablados solo vibran."
    override val motorYokBilgi = "No se encontró ningún motor de lectura en su reloj; los avisos hablados solo vibran."
    override val sesYokBilgi = "Su reloj no tiene voz en español; los avisos hablados solo vibran."
    override val otomatikYerAciklamasi =
        "Cuando su teléfono está cerca, la lectura la hace el teléfono; su reloj solo habla cuando el teléfono está lejos. Solo se leen los recordatorios con la lectura en voz alta activada."
    override val saatYerAciklamasi = "La lectura en voz alta la hace su reloj. Solo se leen los recordatorios con la lectura en voz alta activada."
    override val hoparlorYok = "Su reloj no tiene altavoz"
    override val sesCalisti = "El sonido funcionó"
    override val motorYok = "Sin motor de lectura"
    override val sesYok = "Sin voz en español"
    override val sesCalinamadi = "No se pudo reproducir el sonido"

    override fun vaktiCikiyor(ad: String) = "$ad está terminando"
    override val tesbihatTamamlandi = "Tasbih completado"
    override val toplam = "Total"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay’in qadir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// nl — Felemenkçe (beta): JS `sozluk/nl` (vakit, sure, kible, samimiyet); hitap "u", "Kılındı" = "Gebeden".
// CLDR nl: one/other — İngilizceyle aynı çoğul düzeni. SHORT_TEXT başlığı ~7 karakter → güneş "Zon".
object SaatDiliNl : SaatDili {
    override val kod = "nl"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Zonsopkomst", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "u"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = "$n uur"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minuut" else "$n minuten"
    override val birDakikadanAzSesli = "minder dan 1 minuut"

    override fun cikisaUzun(ad: String) = "$ad eindigt over"
    override fun cikisaAciklama(ad: String) = "Resterende tijd tot $ad eindigt"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "Zon" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} over"
    override fun giriseAciklama(ad: String) = "Resterende tijd tot $ad"

    override val cikisBasligi = "Einde"
    override val girisBasligi = "Begin"
    override fun cikisUzun(ad: String, saat: String) = "$ad eindigt $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad eindigt om $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad begint $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad begint om $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Hierna: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Volgend gebed $ad, begint om $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "tot het einde" else "tot het begin"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "eindigt" else "begint"
        return "$ad $fiil over $sure"
    }

    override val kilindiEki = ", gebeden"
    override fun sonDakikaEki(dk: Int) = ", laatste $dk minuten"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Vandaag $kilinan/$toplam gebeden"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · laatste $dk min"
    override fun dugmeAciklamasi(ad: String) = "$ad als gebeden markeren"
    override fun onaySorusuSatirlari(ad: String) = "Hebt u" to "$ad gebeden?"
    override val vakitDegisti = "De gebedstijd is veranderd; niet gemarkeerd."
    override val kabulDuasi = "Moge Allah het accepteren"

    override val kibleHizali = "U staat in de richting van de qibla"
    override val kibleArkada = "De qibla is achter u"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "De qibla is $adim° ${if (sag) "rechts" else "links"} van u"
    override val donusArkada = "Achter u"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Rechts" else "Links"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Gebedsmodus aan · tot $saat"
    override val namazModuAcik = "Gebedsmodus aan"
    override val namazModuKapandi = "Gebedsmodus uitgezet"
    override val namazModuTelefondaAcin = "Zet de gebedsmodus één keer aan op uw telefoon"
    override val telefonaUlasilamadi = "Uw telefoon is niet bereikbaar"
    override val namazModuAcilamadi = "De gebedsmodus kon niet worden aangezet. Probeer het via uw telefoon"
    override val camiKaydedildi = "Opgeslagen: u bent in de moskee"
    override val camiBirDahaSorulmaz = "Voor deze gebedstijd wordt het u niet meer gevraagd"
    override val camiSayilmaz = "Deze plek telt niet meer als moskee"
    override val soruGecersiz = "Deze vraag geldt niet meer"
    override val islemYapilamadi = "Dat is niet gelukt. Probeer het via uw telefoon"

    override val hoparlorYokBilgi = "Uw horloge heeft geen luidspreker; voorgelezen herinneringen trillen alleen."
    override val motorYokBilgi = "Er is geen voorleesfunctie op uw horloge gevonden; voorgelezen herinneringen trillen alleen."
    override val sesYokBilgi = "Uw horloge heeft geen Nederlandse stem; voorgelezen herinneringen trillen alleen."
    override val otomatikYerAciklamasi =
        "Als uw telefoon bij u is, leest de telefoon voor; uw horloge spreekt alleen als de telefoon ver weg is. Alleen herinneringen waarbij voorlezen aanstaat, worden voorgelezen."
    override val saatYerAciklamasi = "Uw horloge leest voor. Alleen herinneringen waarbij voorlezen aanstaat, worden voorgelezen."
    override val hoparlorYok = "Uw horloge heeft geen luidspreker"
    override val sesCalisti = "Het geluid werkte"
    override val motorYok = "Geen voorleesfunctie"
    override val sesYok = "Geen Nederlandse stem"
    override val sesCalinamadi = "Het geluid kon niet worden afgespeeld"

    override fun vaktiCikiyor(ad: String) = "$ad loopt bijna af"
    override val tesbihatTamamlandi = "Tasbih voltooid"
    override val toplam = "Totaal"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// sq — Arnavutça (beta): JS `sozluk/sq` (vakit adları BIK/KMSH, "E fala" / "U fal", hitap "ju").
// CLDR sq: one/other. Birimler `sure.kisa` (orë/min/sek). Kısa başlıkta "Lindja e Diellit" → "Lindja".
object SaatDiliSq : SaatDili {
    override val kod = "sq"

    private val ADLAR = mapOf(
        "imsak" to "Sabahu", "gunes" to "Lindja e Diellit", "ogle" to "Dreka",
        "ikindi" to "Ikindia", "aksam" to "Akshami", "yatsi" to "Jacia",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "orë"
    override val birimDk = "min"
    override val birimSn = "sek"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = "$n orë"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minutë" else "$n minuta"
    override val birDakikadanAzSesli = "më pak se 1 minutë"

    override fun cikisaUzun(ad: String) = "$ad del pas"
    override fun cikisaAciklama(ad: String) = "Koha e mbetur derisa të dalë: $ad"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "Lindja" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} hyn pas"
    override fun giriseAciklama(ad: String) = "Koha e mbetur deri te: $ad"

    override val cikisBasligi = "Del"
    override val girisBasligi = "Hyn"
    override fun cikisUzun(ad: String, saat: String) = "$ad del $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad: koha del në $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad hyn $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad: koha hyn në $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Në vijim: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Namazi i radhës: $ad, hyn në $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "derisa të dalë koha" else "derisa të hyjë koha"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "del" else "hyn"
        return "$ad: koha $fiil pas $sure"
    }

    override val kilindiEki = ", u fal"
    override fun sonDakikaEki(dk: Int) = ", $dk minutat e fundit"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Sot u falën $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · edhe $dk min"
    override fun dugmeAciklamasi(ad: String) = "$ad: shënojeni si të falur"

    /** Ada hâl eki üretilmez (çekimsiz ad): ad ilk satırda, soru ikinci satırda. */
    override fun onaySorusuSatirlari(ad: String) = "$ad:" to "e falët?"
    override val vakitDegisti = "Vakti ndryshoi; nuk u shënua."
    override val kabulDuasi = "Allahu e pranoftë"

    override val kibleHizali = "Jeni drejt kibles"
    override val kibleArkada = "Kibla është pas jush"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Kibla është $adim° në të ${if (sag) "djathtën" else "majtën"} tuaj"
    override val donusArkada = "Pas jush"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Djathtas" else "Majtas"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Modaliteti i namazit aktiv · deri $saat"
    override val namazModuAcik = "Modaliteti i namazit aktiv"
    override val namazModuKapandi = "Modaliteti i namazit u çaktivizua"
    override val namazModuTelefondaAcin = "Aktivizoni një herë Modalitetin e namazit në telefon"
    override val telefonaUlasilamadi = "Telefoni juaj nuk arrihet"
    override val namazModuAcilamadi = "Modaliteti i namazit nuk u aktivizua. Provoni nga telefoni"
    override val camiKaydedildi = "U regjistrua që jeni në xhami"
    override val camiBirDahaSorulmaz = "Për këtë vakt nuk do t’ju pyesim më"
    override val camiSayilmaz = "Ky vend nuk do të llogaritet më si xhami"
    override val soruGecersiz = "Kjo pyetje nuk vlen më"
    override val islemYapilamadi = "Veprimi nuk u krye. Provoni nga telefoni"

    override val hoparlorYokBilgi = "Ora juaj nuk ka altoparlant; leximet me zë vetëm dridhen."
    override val motorYokBilgi = "Në orën tuaj nuk u gjet motor leximi teksti; leximet me zë vetëm dridhen."
    override val sesYokBilgi = "Ora juaj nuk ka zë në shqip; leximet me zë vetëm dridhen."
    override val otomatikYerAciklamasi =
        "Kur telefoni është pranë jush, lexon telefoni; ora flet vetëm kur telefoni është larg. Lexohen vetëm kujtesat me lexim me zë të aktivizuar."
    override val saatYerAciklamasi = "Leximin me zë e bën ora juaj. Lexohen vetëm kujtesat me lexim me zë të aktivizuar."
    override val hoparlorYok = "Ora juaj nuk ka altoparlant"
    override val sesCalisti = "Zëri funksionoi"
    override val motorYok = "Nuk ka motor leximi teksti"
    override val sesYok = "Nuk ka zë në shqip"
    override val sesCalinamadi = "Zëri nuk u luajt"

    override fun vaktiCikiyor(ad: String) = "$ad: koha po del"
    override val tesbihatTamamlandi = "Tesbihati përfundoi"
    override val toplam = "Gjithsej"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Elhamdulilah"
    override val zikirAllahuEkber = "Allahu ekber"
    override val zikirTehlil = "La ilahe il-lallah"
    override val tehlilMetni = "La ilahe il-lallahu vahdehu la sherike leh, lehul-mulku ve lehul-hamdu ve huve ala kul-li shej'in kadir"
    override val tesbihatKaynagi = "Muslim, Mesaxhid 146"
}

// hi — Hintçe (beta): JS `sozluk/hi` (vakit, sure, kible, samimiyet); "Kılındı" = "पढ़ ली गई".
// CLDR hi: one = 0 ve 1, other (JS `cogul.ts > sifirBir`). Hintçede süre birimi kısaltılmaz (JS `sure.kisa`).
object SaatDiliHi : SaatDili {
    override val kod = "hi"

    private val ADLAR = mapOf(
        "imsak" to "फ़ज्र", "gunes" to "सूर्योदय", "ogle" to "ज़ुहर",
        "ikindi" to "अस्र", "aksam" to "मग़रिब", "yatsi" to "इशा",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "घंटे"
    override val birimDk = "मिनट"
    override val birimSn = "सेकंड"
    override val birDakikadanAzKisa = "1 मिनट से कम"
    override fun saatSesli(n: Long) = if (n == 0L || n == 1L) "$n घंटा" else "$n घंटे"
    override fun dakikaSesli(n: Long) = "$n मिनट"
    override val birDakikadanAzSesli = "1 मिनट से कम"

    override fun cikisaUzun(ad: String) = "$ad ख़त्म होने में"
    override fun cikisaAciklama(ad: String) = "$ad का वक़्त ख़त्म होने में बाक़ी समय"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} तक"
    override fun giriseAciklama(ad: String) = "$ad तक बाक़ी समय"

    override val cikisBasligi = "ख़त्म"
    override val girisBasligi = "शुरू"
    override fun cikisUzun(ad: String, saat: String) = "$ad ख़त्म $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad का वक़्त $saat पर ख़त्म होता है"
    override fun girisUzun(ad: String, saat: String) = "$ad शुरू $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad का वक़्त $saat पर शुरू होता है"
    override fun siradakiUzun(ad: String, saat: String) = "अगली: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "अगली नमाज़ $ad, शुरू $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "ख़त्म होने में" else "शुरू होने में"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ख़त्म होने" else "शुरू होने"
        return "$ad का वक़्त $fiil में $sure"
    }

    override val kilindiEki = ", पढ़ ली गई"
    override fun sonDakikaEki(dk: Int) = ", आख़िरी $dk मिनट"
    override fun bugunEki(kilinan: Int, toplam: Int) = "। आज $kilinan/$toplam पढ़ी गईं"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · आख़िरी $dk मिनट"
    override fun dugmeAciklamasi(ad: String) = "$ad पर \"पढ़ ली गई\" का निशान लगाएं"
    override fun onaySorusuSatirlari(ad: String) = "क्या आपने $ad की नमाज़" to "पढ़ ली?"
    override val vakitDegisti = "नमाज़ का वक़्त बदल गया; निशान नहीं लगा।"
    override val kabulDuasi = "अल्लाह क़बूल करे"

    override val kibleHizali = "आप क़िबला रुख़ हैं"
    override val kibleArkada = "क़िबला आपके पीछे है"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "क़िबला आपकी ${if (sag) "दाईं" else "बाईं"} तरफ़ $adim° पर है"
    override val donusArkada = "पीछे"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "दाएं" else "बाएं"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "नमाज़ मोड चालू · ख़त्म $saat"
    override val namazModuAcik = "नमाज़ मोड चालू"
    override val namazModuKapandi = "नमाज़ मोड बंद हो गया"
    override val namazModuTelefondaAcin = "अपने फ़ोन पर नमाज़ मोड एक बार चालू करें"
    override val telefonaUlasilamadi = "आपके फ़ोन से संपर्क नहीं हो सका"
    override val namazModuAcilamadi = "नमाज़ मोड चालू नहीं हो सका। अपने फ़ोन से कोशिश करें"
    override val camiKaydedildi = "मस्जिद में आपकी मौजूदगी दर्ज हो गई"
    override val camiBirDahaSorulmaz = "इस नमाज़ के वक़्त में दोबारा नहीं पूछा जाएगा"
    override val camiSayilmaz = "यह जगह आगे से मस्जिद नहीं गिनी जाएगी"
    override val soruGecersiz = "यह सवाल अब लागू नहीं है"
    override val islemYapilamadi = "यह काम नहीं हो सका। अपने फ़ोन से कोशिश करें"

    override val hoparlorYokBilgi = "आपकी घड़ी में स्पीकर नहीं है; आवाज़ में सुनाने की जगह सिर्फ़ वाइब्रेशन होगा।"
    override val motorYokBilgi = "आपकी घड़ी में टेक्स्ट पढ़ने वाला इंजन नहीं मिला; आवाज़ में सुनाने की जगह सिर्फ़ वाइब्रेशन होगा।"
    override val sesYokBilgi = "आपकी घड़ी में हिन्दी आवाज़ नहीं है; आवाज़ में सुनाने की जगह सिर्फ़ वाइब्रेशन होगा।"
    override val otomatikYerAciklamasi =
        "फ़ोन पास हो तो आवाज़ में सुनाने का काम फ़ोन करता है; घड़ी सिर्फ़ फ़ोन दूर होने पर बोलती है। सिर्फ़ वही रिमाइंडर सुनाए जाते हैं जिनमें आवाज़ में सुनाना चालू हो।"
    override val saatYerAciklamasi = "आवाज़ में सुनाने का काम आपकी घड़ी करती है। सिर्फ़ वही रिमाइंडर सुनाए जाते हैं जिनमें आवाज़ में सुनाना चालू हो।"
    override val hoparlorYok = "घड़ी में स्पीकर नहीं है"
    override val sesCalisti = "आवाज़ चल गई"
    override val motorYok = "टेक्स्ट पढ़ने वाला इंजन नहीं"
    override val sesYok = "हिन्दी आवाज़ नहीं"
    override val sesCalinamadi = "आवाज़ नहीं चल सकी"

    override fun vaktiCikiyor(ad: String) = "$ad का वक़्त ख़त्म हो रहा है"
    override val tesbihatTamamlandi = "तस्बीह पूरी हो गई"
    override val toplam = "कुल संख्या"
    override val zikirSubhanallah = "सुब्हान अल्लाह"
    override val zikirElhamdulillah = "अल्हम्दुलिल्लाह"
    override val zikirAllahuEkber = "अल्लाहु अकबर"
    override val zikirTehlil = "ला इलाहा इल्लल्लाह"
    override val tehlilMetni = "ला इलाहा इल्लल्लाहु वह्दहू ला शरीका लहू, लहुल मुल्कु व लहुल हम्दु व हुवा अला कुल्लि शैइन क़दीर"
    override val tesbihatKaynagi = "सहीह मुस्लिम, किताबुल मसाजिद 146"
}

// bn — Bengalce (beta): JS `sozluk/bn` (vakit, sure, kible, samimiyet); "Kılındı" = "পড়া হয়েছে".
// CLDR bn: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); Bengalcede sayıdan sonra isim çekimlenmez.
// SHORT_TEXT başlığı ~7 karakter taşır → [giriseKisa]'da "সূর্যোদয়" yerine "সূর্য". Rakam Batı (0-9).
object SaatDiliBn : SaatDili {
    override val kod = "bn"

    private val ADLAR = mapOf(
        "imsak" to "ফজর", "gunes" to "সূর্যোদয়", "ogle" to "যোহর",
        "ikindi" to "আসর", "aksam" to "মাগরিব", "yatsi" to "ইশা",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ঘ"
    override val birimDk = "মি"
    override val birimSn = "সে"
    override val birDakikadanAzKisa = "<1 মি"
    override fun saatSesli(n: Long) = "${n} ঘণ্টা"
    override fun dakikaSesli(n: Long) = "${n} মিনিট"
    override val birDakikadanAzSesli = "1 মিনিটের কম"

    override fun cikisaUzun(ad: String) = "${ad} শেষ হতে"
    override fun cikisaAciklama(ad: String) = "${ad}-এর ওয়াক্ত শেষ হতে বাকি সময়"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "সূর্য" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} পর্যন্ত"
    override fun giriseAciklama(ad: String) = "${ad} পর্যন্ত বাকি সময়"

    override val cikisBasligi = "শেষ"
    override val girisBasligi = "শুরু"
    override fun cikisUzun(ad: String, saat: String) = "${ad} শেষ ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "${ad}-এর ওয়াক্ত শেষ হয় ${saat}-এ"
    override fun girisUzun(ad: String, saat: String) = "${ad} শুরু ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "${ad}-এর ওয়াক্ত শুরু হয় ${saat}-এ"
    override fun siradakiUzun(ad: String, saat: String) = "পরবর্তী: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "পরবর্তী নামাজ ${ad}, শুরু ${saat}"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "শেষ হতে বাকি" else "শুরু হতে বাকি"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "শেষ" else "শুরু"
        return "${ad}-এর ওয়াক্ত ${fiil} হতে ${sure} বাকি"
    }

    override val kilindiEki = ", পড়া হয়েছে"
    override fun sonDakikaEki(dk: Int) = ", শেষ ${dk} মিনিট"
    override fun bugunEki(kilinan: Int, toplam: Int) = "। আজ ${kilinan}/${toplam} পড়া হয়েছে"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · শেষ ${dk} মি"
    override fun dugmeAciklamasi(ad: String) = "${ad} পড়া হয়েছে হিসেবে চিহ্নিত করুন"
    override fun onaySorusuSatirlari(ad: String) = "আপনি কি ${ad}" to "পড়েছেন?"
    override val vakitDegisti = "নামাজের ওয়াক্ত বদলে গেছে; চিহ্নিত হয়নি।"
    override val kabulDuasi = "আল্লাহ কবুল করুন"

    override val kibleHizali = "আপনি কিবলামুখী আছেন"
    override val kibleArkada = "কিবলা আপনার পেছনে"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "কিবলা আপনার ${if (sag) "ডানে" else "বামে"} ${adim}°"
    override val donusArkada = "পেছনে"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "ডানে" else "বামে"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "নামাজ মোড চালু · শেষ ${saat}"
    override val namazModuAcik = "নামাজ মোড চালু"
    override val namazModuKapandi = "নামাজ মোড বন্ধ হয়েছে"
    override val namazModuTelefondaAcin = "ফোনে একবার নামাজ মোড চালু করুন"
    override val telefonaUlasilamadi = "আপনার ফোনে পৌঁছানো যায়নি"
    override val namazModuAcilamadi = "নামাজ মোড চালু করা যায়নি। ফোন থেকে চেষ্টা করুন"
    override val camiKaydedildi = "আপনি মসজিদে আছেন বলে সংরক্ষিত হয়েছে"
    override val camiBirDahaSorulmaz = "এই ওয়াক্তে আর জিজ্ঞেস করা হবে না"
    override val camiSayilmaz = "এই জায়গা আর মসজিদ গণ্য হবে না"
    override val soruGecersiz = "এই প্রশ্ন আর প্রযোজ্য নয়"
    override val islemYapilamadi = "কাজটি করা যায়নি। ফোন থেকে চেষ্টা করুন"

    override val hoparlorYokBilgi = "আপনার ঘড়িতে স্পিকার নেই; জোরে পড়ার বদলে শুধু কাঁপবে।"
    override val motorYokBilgi = "আপনার ঘড়িতে লেখা-থেকে-কণ্ঠ ইঞ্জিন পাওয়া যায়নি; জোরে পড়ার বদলে শুধু কাঁপবে।"
    override val sesYokBilgi = "আপনার ঘড়িতে বাংলা কণ্ঠ নেই; জোরে পড়ার বদলে শুধু কাঁপবে।"
    override val otomatikYerAciklamasi =
        "ফোন সাথে থাকলে ফোন জোরে পড়ে; ফোন দূরে থাকলে তবেই ঘড়ি কথা বলে। শুধু জোরে পড়া চালু থাকা রিমাইন্ডারগুলো পড়া হয়।"
    override val saatYerAciklamasi = "আপনার ঘড়ি জোরে পড়ে। শুধু জোরে পড়া চালু থাকা রিমাইন্ডারগুলো পড়া হয়।"
    override val hoparlorYok = "ঘড়িতে স্পিকার নেই"
    override val sesCalisti = "শব্দ বেজেছে"
    override val motorYok = "লেখা-থেকে-কণ্ঠ ইঞ্জিন নেই"
    override val sesYok = "বাংলা কণ্ঠ নেই"
    override val sesCalinamadi = "শব্দ বাজানো যায়নি"

    override fun vaktiCikiyor(ad: String) = "${ad}-এর ওয়াক্ত শেষ হচ্ছে"
    override val tesbihatTamamlandi = "তাসবিহ সম্পন্ন"
    override val toplam = "মোট"
    override val zikirSubhanallah = "সুবহানাল্লাহ"
    override val zikirElhamdulillah = "আলহামদুলিল্লাহ"
    override val zikirAllahuEkber = "আল্লাহু আকবার"
    override val zikirTehlil = "লা ইলাহা ইল্লাল্লাহ"
    override val tehlilMetni = "লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকা লাহু, লাহুল মুলকু ওয়া লাহুল হামদু ওয়া হুয়া আলা কুল্লি শাইয়িন কাদীর"
    override val tesbihatKaynagi = "সহীহ মুসলিম, মাসাজিদ 146"
}

// fa — Farsça (beta): JS `sozluk/fa` (vakit, sure, kible, samimiyet); hitap "شما", "Kılındı" = "خوانده شد".
// CLDR fa: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); sayıdan sonra ad tekildir → iki biçim aynı.
// Süre birimi kısaltılmaz. SHORT_TEXT başlığı ~7 karakter → [giriseKisa]'da "طلوع آفتاب" yerine "طلوع".
object SaatDiliFa : SaatDili {
    override val kod = "fa"

    private val ADLAR = mapOf(
        "imsak" to "صبح", "gunes" to "طلوع آفتاب", "ogle" to "ظهر",
        "ikindi" to "عصر", "aksam" to "مغرب", "yatsi" to "عشا",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ساعت"
    override val birimDk = "دقیقه"
    override val birimSn = "ثانیه"
    override val birDakikadanAzKisa = "کمتر از 1 دقیقه"
    override fun saatSesli(n: Long) = "$n ساعت"
    override fun dakikaSesli(n: Long) = "$n دقیقه"
    override val birDakikadanAzSesli = "کمتر از 1 دقیقه"

    override fun cikisaUzun(ad: String) = "تا پایان $ad"
    override fun cikisaAciklama(ad: String) = "زمان باقی‌مانده تا پایان وقت $ad"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "طلوع" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "تا ${vakitAdi(vakit)}"
    override fun giriseAciklama(ad: String) = "زمان باقی‌مانده تا $ad"

    override val cikisBasligi = "پایان"
    override val girisBasligi = "آغاز"
    override fun cikisUzun(ad: String, saat: String) = "پایان $ad $saat"
    override fun cikisAciklama(ad: String, saat: String) = "وقت $ad ساعت $saat تمام می‌شود"
    override fun girisUzun(ad: String, saat: String) = "آغاز $ad $saat"
    override fun girisAciklama(ad: String, saat: String) = "وقت $ad ساعت $saat آغاز می‌شود"
    override fun siradakiUzun(ad: String, saat: String) = "بعدی: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "نماز بعدی $ad، آغاز ساعت $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "تا پایان وقت" else "تا رسیدن وقت"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "تمام می‌شود" else "می‌رسد"
        return "وقت $ad $sure دیگر $fiil"
    }

    override val kilindiEki = "، خوانده شد"
    override fun sonDakikaEki(dk: Int) = "، $dk دقیقهٔ آخر"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". امروز $kilinan/$toplam خوانده شد"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · $dk دقیقهٔ آخر"
    override fun dugmeAciklamasi(ad: String) = "علامت زدن $ad به‌عنوان خوانده‌شده"
    override fun onaySorusuSatirlari(ad: String) = "نماز $ad را" to "خواندید؟"
    override val vakitDegisti = "وقت نماز عوض شد؛ علامت نخورد."
    override val kabulDuasi = "قبول باشد"

    override val kibleHizali = "رو به قبله هستید"
    override val kibleArkada = "قبله پشت سر شماست"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "قبله $adim° سمت ${if (sag) "راست" else "چپ"} شماست"
    override val donusArkada = "پشت سر"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "راست" else "چپ"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "حالت نماز روشن · پایان $saat"
    override val namazModuAcik = "حالت نماز روشن"
    override val namazModuKapandi = "حالت نماز خاموش شد"
    override val namazModuTelefondaAcin = "حالت نماز را یک بار روی تلفن روشن کنید"
    override val telefonaUlasilamadi = "به تلفن شما دسترسی نشد"
    override val namazModuAcilamadi = "حالت نماز روشن نشد. از روی تلفن امتحان کنید"
    override val camiKaydedildi = "حضور شما در مسجد ثبت شد"
    override val camiBirDahaSorulmaz = "برای این وقت نماز دیگر پرسیده نمی‌شود"
    override val camiSayilmaz = "این مکان دیگر مسجد به حساب نمی‌آید"
    override val soruGecersiz = "این پرسش دیگر معتبر نیست"
    override val islemYapilamadi = "این کار انجام نشد. از روی تلفن امتحان کنید"

    override val hoparlorYokBilgi = "ساعت شما بلندگو ندارد؛ به جای خواندن با صدا فقط می‌لرزد."
    override val motorYokBilgi = "موتور تبدیل متن به گفتار روی ساعت شما پیدا نشد؛ به جای خواندن با صدا فقط می‌لرزد."
    override val sesYokBilgi = "ساعت شما صدای فارسی ندارد؛ به جای خواندن با صدا فقط می‌لرزد."
    override val otomatikYerAciklamasi =
        "وقتی تلفن همراه شماست، تلفن با صدا می‌خواند؛ ساعت فقط وقتی تلفن دور است صحبت می‌کند. فقط یادآوری‌هایی که خواندن با صدایشان روشن است خوانده می‌شوند."
    override val saatYerAciklamasi = "ساعت شما با صدا می‌خواند. فقط یادآوری‌هایی که خواندن با صدایشان روشن است خوانده می‌شوند."
    override val hoparlorYok = "ساعت بلندگو ندارد"
    override val sesCalisti = "صدا پخش شد"
    override val motorYok = "موتور تبدیل متن به گفتار نیست"
    override val sesYok = "صدای فارسی نیست"
    override val sesCalinamadi = "صدا پخش نشد"

    override fun vaktiCikiyor(ad: String) = "وقت $ad رو به پایان است"
    override val tesbihatTamamlandi = "تسبیح کامل شد"
    override val toplam = "مجموع"
    override val zikirSubhanallah = "سبحان‌الله"
    override val zikirElhamdulillah = "الحمدلله"
    override val zikirAllahuEkber = "الله‌اکبر"
    override val zikirTehlil = "لا اله الا الله"
    override val tehlilMetni = "لا اله الا الله وحده لا شریک له، له الملک و له الحمد و هو علی کل شیء قدیر"
    override val tesbihatKaynagi = "صحیح مسلم، کتاب المساجد 146"
}

// ps — Peştuca (beta): JS `sozluk/ps` (vakit, sure, kible, samimiyet); hitap "تاسو", "Kılındı" = "ادا شو".
// CLDR ps: one/other. Peştucada süre birimi kısaltılmaz (JS `sure.kisa`: ساعت/دقیقې/ثانیې). Vakit adları
// en çok 7 karakter → SHORT_TEXT başlığında ad aynen. Zikirler Arap harfli yaygın yazımla (Arapça kef U+0643 yok).
object SaatDiliPs : SaatDili {
    override val kod = "ps"

    private val ADLAR = mapOf(
        "imsak" to "سهار", "gunes" to "لمر ختل", "ogle" to "ماسپښین",
        "ikindi" to "مازدیګر", "aksam" to "ماښام", "yatsi" to "ماسخوتن",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ساعت"
    override val birimDk = "دقیقې"
    override val birimSn = "ثانیې"
    override val birDakikadanAzKisa = "له 1 دقیقې لږ"
    override fun saatSesli(n: Long) = if (n == 1L) "1 ساعت" else "$n ساعته"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 دقیقه" else "$n دقیقې"
    override val birDakikadanAzSesli = "له یوې دقیقې لږ"

    override fun cikisaUzun(ad: String) = "د $ad تر پایه"
    override fun cikisaAciklama(ad: String) = "د $ad د وخت تر پایه پاتې وخت"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} ته"
    override fun giriseAciklama(ad: String) = "د $ad تر وخته پاتې وخت"

    override val cikisBasligi = "پای"
    override val girisBasligi = "پیل"
    override fun cikisUzun(ad: String, saat: String) = "$ad پای $saat"
    override fun cikisAciklama(ad: String, saat: String) = "د $ad وخت په $saat پای ته رسېږي"
    override fun girisUzun(ad: String, saat: String) = "$ad پیل $saat"
    override fun girisAciklama(ad: String, saat: String) = "د $ad وخت په $saat پیلېږي"
    override fun siradakiUzun(ad: String, saat: String) = "بل: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "بل لمونځ $ad، پیل $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "تر پایه" else "تر پیله"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "پایه" else "پیله"
        return "د $ad د وخت تر $fiil $sure"
    }

    override val kilindiEki = "، ادا شو"
    override fun sonDakikaEki(dk: Int) = "، وروستۍ $dk دقیقې"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". نن $kilinan/$toplam ادا شول"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · وروستۍ $dk دقیقې"
    override fun dugmeAciklamasi(ad: String) = "د $ad لمونځ د ادا شوي په توګه نښه کړئ"
    override fun onaySorusuSatirlari(ad: String) = "ایا د $ad لمونځ" to "مو وکړ؟"
    override val vakitDegisti = "د لمانځه وخت بدل شو؛ نښه نه شو."
    override val kabulDuasi = "الله دې قبول کړي"

    override val kibleHizali = "تاسو د قبلې په لور یاست"
    override val kibleArkada = "قبله ستاسو شاته ده"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "قبله ستاسو ${if (sag) "ښي" else "کیڼ"} لور ته $adim° ده"
    override val donusArkada = "شاته"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "ښي" else "کیڼ"} لور ته $adim°"

    override fun namazModuAcikBitis(saat: String) = "د لمانځه حالت فعال · پای $saat"
    override val namazModuAcik = "د لمانځه حالت فعال دی"
    override val namazModuKapandi = "د لمانځه حالت بند شو"
    override val namazModuTelefondaAcin = "په خپل موبایل کې د لمانځه حالت یو ځل فعال کړئ"
    override val telefonaUlasilamadi = "ستاسو موبایل ته لاسرسی نشته"
    override val namazModuAcilamadi = "د لمانځه حالت فعال نه شو. له خپل موبایل څخه یې وازمویئ"
    override val camiKaydedildi = "ثبت شو چې تاسو په جومات کې یاست"
    override val camiBirDahaSorulmaz = "د دې وخت لپاره به بیا پوښتنه ونه شي"
    override val camiSayilmaz = "دا ځای به بیا جومات ونه ګڼل شي"
    override val soruGecersiz = "دا پوښتنه نور اعتبار نه لري"
    override val islemYapilamadi = "دا کار ونه شو. له خپل موبایل څخه یې وازمویئ"

    override val hoparlorYokBilgi = "ستاسو ساعت سپیکر نه لري؛ غږیز اعلانونه یوازې په لړزې خبرول کېږي."
    override val motorYokBilgi = "ستاسو په ساعت کې د متن لوستلو انجن ونه موندل شو؛ غږیز اعلانونه یوازې په لړزې خبرول کېږي."
    override val sesYokBilgi = "ستاسو په ساعت کې پښتو غږ نشته؛ غږیز اعلانونه یوازې په لړزې خبرول کېږي."
    override val otomatikYerAciklamasi =
        "کله چې موبایل مو درسره وي، غږیز لوستل موبایل کوي؛ ساعت یوازې هغه وخت غږېږي چې موبایل لرې وي. یوازې هغه یادونې لوستل کېږي چې غږیز اعلان یې فعال وي."
    override val saatYerAciklamasi = "غږیز لوستل ستاسو ساعت کوي. یوازې هغه یادونې لوستل کېږي چې غږیز اعلان یې فعال وي."
    override val hoparlorYok = "ستاسو ساعت سپیکر نه لري"
    override val sesCalisti = "غږ کار وکړ"
    override val motorYok = "د متن لوستلو انجن نشته"
    override val sesYok = "پښتو غږ نشته"
    override val sesCalinamadi = "غږ ونه غږېد"

    override fun vaktiCikiyor(ad: String) = "د $ad وخت وځي"
    override val tesbihatTamamlandi = "تسبیح بشپړ شو"
    override val toplam = "ټول"
    override val zikirSubhanallah = "سبحان الله"
    override val zikirElhamdulillah = "الحمد لله"
    override val zikirAllahuEkber = "الله اکبر"
    override val zikirTehlil = "لا اله الا الله"
    override val tehlilMetni = "لا اله الا الله وحده لا شریک له، له الملک وله الحمد وهو علی کل شیء قدیر"
    override val tesbihatKaynagi = "صحیح مسلم، کتاب المساجد 146"
}

// ckb
object SaatDiliCkb : SaatDili {
    override val kod = "ckb"

    private val ADLAR = mapOf(
        "imsak" to "بەیانی", "gunes" to "خۆرھەڵاتن", "ogle" to "نیوەڕۆ",
        "ikindi" to "عەسر", "aksam" to "ئێوارە", "yatsi" to "خەوتنان",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    // Soranîde sayıdan sonra isim tekil: one = other.
    override val birimSa = "کاتژمێر"
    override val birimDk = "خولەک"
    override val birimSn = "چرکە"
    override val birDakikadanAzKisa = "<1 خولەک"
    override fun saatSesli(n: Long) = "$n کاتژمێر"
    override fun dakikaSesli(n: Long) = "$n خولەک"
    override val birDakikadanAzSesli = "کەمتر لە 1 خولەک"

    override fun cikisaUzun(ad: String) = "ماوە تا کۆتایی ${ad}"
    override fun cikisaAciklama(ad: String) = "کاتی ماوە تا دەرچوونی ${ad}"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "ماوە بۆ ${vakitAdi(vakit)}"
    override fun giriseAciklama(ad: String) = "کاتی ماوە تا ${ad}"

    override val cikisBasligi = "کۆتایی"
    override val girisBasligi = "دەستپێک"
    override fun cikisUzun(ad: String, saat: String) = "${ad} کۆتایی ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "${ad} لە ${saat} کۆتایی دێت"
    override fun girisUzun(ad: String, saat: String) = "${ad} دەستپێک ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "${ad} لە ${saat} دەست پێدەکات"
    override fun siradakiUzun(ad: String, saat: String) = "داھاتوو: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "نوێژی داھاتوو ${ad}، لە ${saat} دەست پێدەکات"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "تا کۆتایی" else "تا دەستپێک"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "کۆتایی دێت" else "دەست پێدەکات"
        return "${ad} دوای ${sure} ${fiil}"
    }

    override val kilindiEki = "، کرا"
    override fun sonDakikaEki(dk: Int) = "، دوا ${dk} خولەک"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". ئەمڕۆ ${kilinan}/${toplam} کراوە"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · دوا ${dk} خ"
    override fun dugmeAciklamasi(ad: String) = "${ad} وەک کراو نیشانە بکەن"
    override fun onaySorusuSatirlari(ad: String) = "نوێژی ${ad}" to "کردتان؟"
    override val vakitDegisti = "کاتی نوێژ گۆڕا؛ نیشانە نەکرا."
    override val kabulDuasi = "خوا قبوڵی بکات"

    override val kibleHizali = "ڕووتان لە قیبلەیە"
    override val kibleArkada = "قیبلە لە پشتتانەوەیە"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "قیبلە ${adim}° لە لای ${if (sag) "ڕاست" else "چەپ"}تانە"
    override val donusArkada = "لە پشتەوە"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "ڕاست" else "چەپ"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "دۆخی نوێژ چالاکە · کۆتایی ${saat}"
    override val namazModuAcik = "دۆخی نوێژ چالاکە"
    override val namazModuKapandi = "دۆخی نوێژ کوژایەوە"
    override val namazModuTelefondaAcin = "یەک جار دۆخی نوێژ لەسەر مۆبایلەکەتان چالاک بکەن"
    override val telefonaUlasilamadi = "ناتوانرێت بگاتە مۆبایلەکەتان"
    override val namazModuAcilamadi = "دۆخی نوێژ چالاک نەکرا. لە مۆبایلەکەتانەوە ھەوڵ بدەن"
    override val camiKaydedildi = "پاشەکەوت کرا کە لە مزگەوتن"
    override val camiBirDahaSorulmaz = "بۆ ئەم کاتی نوێژە دووبارە پرسیارتان لێ ناکرێت"
    override val camiSayilmaz = "ئەم شوێنە دووبارە وەک مزگەوت حیساب ناکرێت"
    override val soruGecersiz = "ئەم پرسیارە ئیتر بەکار نایەت"
    override val islemYapilamadi = "ئەمە تەواو نەکرا. لە مۆبایلەکەتانەوە ھەوڵ بدەن"

    override val hoparlorYokBilgi = "کاتژمێرەکەتان بڵندگۆی نییە؛ ڕاگەیاندنە دەنگییەکان تەنیا دەلەرێنەوە."
    override val motorYokBilgi = "ھیچ بزوێنەرێکی خوێندنەوەی دەق لەسەر کاتژمێرەکەتان نەدۆزرایەوە؛ ڕاگەیاندنە دەنگییەکان تەنیا دەلەرێنەوە."
    override val sesYokBilgi = "کاتژمێرەکەتان دەنگی تورکیی نییە؛ ڕاگەیاندنە دەنگییەکان تەنیا دەلەرێنەوە."
    override val otomatikYerAciklamasi =
        "کاتێک مۆبایلەکەتان لەگەڵتانە، مۆبایلەکە بە دەنگ دەخوێنێتەوە؛ کاتژمێرەکەتان تەنیا کاتێک مۆبایلەکە دوورە قسە دەکات. تەنیا ئەو بیرخستنەوانە دەخوێندرێنەوە کە خوێندنەوەی دەنگییان چالاکە."
    override val saatYerAciklamasi = "کاتژمێرەکەتان بە دەنگ دەخوێنێتەوە. تەنیا ئەو بیرخستنەوانە دەخوێندرێنەوە کە خوێندنەوەی دەنگییان چالاکە."
    override val hoparlorYok = "کاتژمێرەکەتان بڵندگۆی نییە"
    override val sesCalisti = "دەنگەکە کاری کرد"
    override val motorYok = "بزوێنەری خوێندنەوەی دەق نییە"
    override val sesYok = "دەنگی تورکی نییە"
    override val sesCalinamadi = "دەنگەکە لێنەدرا"

    override fun vaktiCikiyor(ad: String) = "کاتی ${ad} دەردەچێت"
    override val tesbihatTamamlandi = "تەسبیحات تەواو بوو"
    override val toplam = "کۆی گشتی"
    override val zikirSubhanallah = "سوبحانەڵڵا"
    override val zikirElhamdulillah = "ئەلحەمدولیللا"
    override val zikirAllahuEkber = "ئەڵڵاھو ئەکبەر"
    override val zikirTehlil = "لا ئیلاھە ئیللەڵڵا"
    override val tehlilMetni = "لا ئیلاھە ئیللەڵڵاھو وەحدەھو لا شەریکە لەھ، لەھول مولکو وە لەھول حەمدو وە ھووە عەلا کوللی شەیئین قەدیر"
    override val tesbihatKaynagi = "موسلیم، مەساجید 146"
}

// ug — Uygurca (beta): JS `sozluk/ug` (vakit, sure, kible, samimiyet); hitap "سىز", "Kılındı" = "ئوقۇلدى".
// CLDR ug: one/other; Uygurcada sayıdan sonra isim çoğul eki almaz. Süre birimi kısaltılmaz (JS `sure.kisa`).
// SHORT_TEXT başlığı ~7 karakter → [giriseKisa]'da "قۇياش چىقىش" yerine "قۇياش". Rakam Batı (0-9).
object SaatDiliUg : SaatDili {
    override val kod = "ug"

    private val ADLAR = mapOf(
        "imsak" to "بامدات", "gunes" to "قۇياش چىقىش", "ogle" to "پېشىن",
        "ikindi" to "ئەسىر", "aksam" to "شام", "yatsi" to "خۇپتەن",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "سائەت"
    override val birimDk = "مىنۇت"
    override val birimSn = "سېكۇنت"
    override val birDakikadanAzKisa = "1 مىنۇتتىن ئاز"
    override fun saatSesli(n: Long) = "$n سائەت"
    override fun dakikaSesli(n: Long) = "$n مىنۇت"
    override val birDakikadanAzSesli = "1 مىنۇتتىن ئاز"

    override fun cikisaUzun(ad: String) = "$ad چىقىشىغا"
    override fun cikisaAciklama(ad: String) = "$ad ۋاقتىنىڭ چىقىشىغا قالغان ۋاقىت"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "قۇياش" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} ۋاقتىغا"
    override fun giriseAciklama(ad: String) = "$ad ۋاقتىغا قالغان ۋاقىت"

    override val cikisBasligi = "چىقىش"
    override val girisBasligi = "كىرىش"
    override fun cikisUzun(ad: String, saat: String) = "$ad چىقىشى $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad ۋاقتىنىڭ چىقىش سائىتى $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad كىرىشى $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad ۋاقتىنىڭ كىرىش سائىتى $saat"
    override fun siradakiUzun(ad: String, saat: String) = "كېيىنكىسى: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "كېيىنكى ناماز $ad، كىرىشى $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "ۋاقىت چىقىشىغا" else "ۋاقىت كىرىشىگە"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "چىقىشىغا" else "كىرىشىگە"
        return "$ad ۋاقتىنىڭ $fiil $sure"
    }

    override val kilindiEki = "، ئوقۇلدى"
    override fun sonDakikaEki(dk: Int) = "، ئاخىرقى $dk مىنۇت"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". بۈگۈن $kilinan/$toplam ئوقۇلدى"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · ئاخىرقى $dk مىنۇت"
    override fun dugmeAciklamasi(ad: String) = "$ad نامىزىنى ئوقۇلدى دەپ بەلگىلەڭ"
    override fun onaySorusuSatirlari(ad: String) = "$ad نامىزىنى" to "ئوقۇدىڭىزمۇ؟"
    override val vakitDegisti = "ۋاقىت ئۆزگەردى، بەلگىلەنمىدى."
    override val kabulDuasi = "ئاللاھ قوبۇل قىلسۇن"

    override val kibleHizali = "قىبلە تەرەپكە قاراپ تۇرۇۋاتىسىز"
    override val kibleArkada = "قىبلە ئارقىڭىزدا"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "قىبلە ${if (sag) "ئوڭ" else "سول"} تەرىپىڭىزدە $adim°"
    override val donusArkada = "ئارقىڭىزدا"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "ئوڭغا" else "سولغا"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "ناماز ھالىتى ئوچۇق · ئاخىرلىشىشى $saat"
    override val namazModuAcik = "ناماز ھالىتى ئوچۇق"
    override val namazModuKapandi = "ناماز ھالىتى تاقالدى"
    override val namazModuTelefondaAcin = "تېلېفونىڭىزدا ناماز ھالىتىنى بىر قېتىم ئېچىڭ"
    override val telefonaUlasilamadi = "تېلېفونىڭىزغا ئۇلىنالمىدى"
    override val namazModuAcilamadi = "ناماز ھالىتى ئېچىلمىدى. تېلېفونىڭىزدىن سىناڭ"
    override val camiKaydedildi = "مەسچىتتە ئىكەنلىكىڭىز خاتىرىلەندى"
    override val camiBirDahaSorulmaz = "بۇ ۋاقىتتا قايتا سورالمايدۇ"
    override val camiSayilmaz = "بۇ جاي قايتا مەسچىت دەپ ھېسابلانمايدۇ"
    override val soruGecersiz = "بۇ سوئال ئەمدى ئىناۋەتسىز"
    override val islemYapilamadi = "مەشغۇلات ئورۇندالمىدى. تېلېفونىڭىزدىن سىناڭ"

    override val hoparlorYokBilgi = "سائىتىڭىزدا ياڭراتقۇ يوق؛ ئاۋازلىق ئۇقتۇرۇشلار پەقەت تىترەش بىلەن بىلدۈرۈلىدۇ."
    override val motorYokBilgi = "سائىتىڭىزدا تېكىست ئوقۇش ماتورى تېپىلمىدى؛ ئاۋازلىق ئۇقتۇرۇشلار پەقەت تىترەش بىلەن بىلدۈرۈلىدۇ."
    override val sesYokBilgi = "سائىتىڭىزدا ئۇيغۇرچە ئاۋاز يوق؛ ئاۋازلىق ئۇقتۇرۇشلار پەقەت تىترەش بىلەن بىلدۈرۈلىدۇ."
    override val otomatikYerAciklamasi =
        "تېلېفونىڭىز يېنىڭىزدا بولسا ئاۋازلىق ئوقۇشنى تېلېفونىڭىز قىلىدۇ؛ سائىتىڭىز پەقەت تېلېفون يىراقتا بولغاندا سۆزلەيدۇ. پەقەت ئاۋازلىق ئوقۇش ئوچۇق ئەسكەرتىشلەرلا ئوقۇلىدۇ."
    override val saatYerAciklamasi = "ئاۋازلىق ئوقۇشنى سائىتىڭىز قىلىدۇ. پەقەت ئاۋازلىق ئوقۇش ئوچۇق ئەسكەرتىشلەرلا ئوقۇلىدۇ."
    override val hoparlorYok = "سائىتىڭىزدا ياڭراتقۇ يوق"
    override val sesCalisti = "ئاۋاز چېلىندى"
    override val motorYok = "تېكىست ئوقۇش ماتورى يوق"
    override val sesYok = "ئۇيغۇرچە ئاۋاز يوق"
    override val sesCalinamadi = "ئاۋاز چېلىنمىدى"

    override fun vaktiCikiyor(ad: String) = "$ad ۋاقتى چىقىۋاتىدۇ"
    override val tesbihatTamamlandi = "تەسبىھ تاماملاندى"
    override val toplam = "جەمئىي"
    override val zikirSubhanallah = "سۇبھانەللاھ"
    override val zikirElhamdulillah = "ئەلھەمدۇلىللاھ"
    override val zikirAllahuEkber = "ئاللاھۇ ئەكبەر"
    override val zikirTehlil = "لا ئىلاھە ئىللەللاھ"
    override val tehlilMetni = "لا ئىلاھە ئىللەللاھۇ ۋەھدەھۇ لا شەرىكە لەھۇ، لەھۇل مۇلكۇ ۋە لەھۇل ھەمدۇ ۋە ھۇۋە ئەلا كۇللى شەيئىن قەدىر"
    override val tesbihatKaynagi = "مۇسلىم، مەساجىد 146"
}

// ÇEVİRİ: az
object SaatDiliAz : SaatDili {
    override val kod = "az"

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

// uz — Özbekçe (beta, LATİN): JS `sozluk/uz` (Kiril kaynak → kirildenLatine); hitap "Siz", "Kılındı" = "Oʻqildi".
// CLDR uz: one/other; sayıdan sonra isim çoğul eki almaz. Birimler `sure.kisa` (soat/daq/s). Vakit adları
// en çok 6 karakter → SHORT_TEXT başlığında ad aynen.
object SaatDiliUz : SaatDili {
    override val kod = "uz"

    private val ADLAR = mapOf(
        "imsak" to "Bomdod", "gunes" to "Quyosh", "ogle" to "Peshin",
        "ikindi" to "Asr", "aksam" to "Shom", "yatsi" to "Xufton",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "soat"
    override val birimDk = "daq"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<1 daq"
    override fun saatSesli(n: Long) = "$n soat"
    override fun dakikaSesli(n: Long) = "$n daqiqa"
    override val birDakikadanAzSesli = "1 daqiqadan kam"

    override fun cikisaUzun(ad: String) = "$ad tugashigacha"
    override fun cikisaAciklama(ad: String) = "$ad vaqti tugashigacha qolgan vaqt"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)}gacha"
    override fun giriseAciklama(ad: String) = "$ad vaqtigacha qolgan vaqt"

    override val cikisBasligi = "Tugashi"
    override val girisBasligi = "Kirishi"
    override fun cikisUzun(ad: String, saat: String) = "$ad tugashi $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad vaqti soat $saat da tugaydi"
    override fun girisUzun(ad: String, saat: String) = "$ad kirishi $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad vaqti soat $saat da kiradi"
    override fun siradakiUzun(ad: String, saat: String) = "Keyingisi: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Keyingi namoz $ad, kirishi $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "tugashigacha" else "kirishigacha"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "tugashigacha" else "kirishigacha"
        return "$ad vaqti $fiil $sure"
    }

    override val kilindiEki = ", oʻqildi"
    override fun sonDakikaEki(dk: Int) = ", oxirgi $dk daqiqa"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Bugun $kilinan/$toplam oʻqildi"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · oxirgi $dk daq"
    override fun dugmeAciklamasi(ad: String) = "$ad namozini oʻqildi deb belgilash"
    override fun onaySorusuSatirlari(ad: String) = "$ad namozini" to "oʻqidingizmi?"
    override val vakitDegisti = "Namoz vaqti oʻzgardi; belgilanmadi."
    override val kabulDuasi = "Alloh qabul qilsin"

    override val kibleHizali = "Siz qiblaga qarab turibsiz"
    override val kibleArkada = "Qibla orqangizda"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Qibla ${if (sag) "oʻng" else "chap"} tomoningizda, $adim°"
    override val donusArkada = "Orqangizda"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Oʻngga" else "Chapga"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Namoz rejimi yoniq · tugashi $saat"
    override val namazModuAcik = "Namoz rejimi yoniq"
    override val namazModuKapandi = "Namoz rejimi oʻchirildi"
    override val namazModuTelefondaAcin = "Namoz rejimini telefoningizda bir marta yoqing"
    override val telefonaUlasilamadi = "Telefoningizga ulanib boʻlmadi"
    override val namazModuAcilamadi = "Namoz rejimini yoqib boʻlmadi. Telefoningizdan urinib koʻring"
    override val camiKaydedildi = "Masjidda ekanligingiz saqlandi"
    override val camiBirDahaSorulmaz = "Bu namoz vaqtida qayta soʻralmaydi"
    override val camiSayilmaz = "Bu joy endi masjid deb hisoblanmaydi"
    override val soruGecersiz = "Bu savol endi amal qilmaydi"
    override val islemYapilamadi = "Amalni bajarib boʻlmadi. Telefoningizdan urinib koʻring"

    override val hoparlorYokBilgi = "Soatingizda dinamik yoʻq; ovozli eslatmalar faqat tebranish bilan bildiriladi."
    override val motorYokBilgi = "Soatingizda nutq sintezi topilmadi; ovozli eslatmalar faqat tebranish bilan bildiriladi."
    override val sesYokBilgi = "Soatingizda oʻzbekcha ovoz yoʻq; ovozli eslatmalar faqat tebranish bilan bildiriladi."
    override val otomatikYerAciklamasi =
        "Telefoningiz yoningizda boʻlsa, ovoz chiqarib telefoningiz oʻqiydi; soatingiz faqat telefon uzoqda boʻlganda gapiradi. Faqat ovoz chiqarib oʻqish yoqilgan eslatmalar oʻqiladi."
    override val saatYerAciklamasi = "Ovoz chiqarib soatingiz oʻqiydi. Faqat ovoz chiqarib oʻqish yoqilgan eslatmalar oʻqiladi."
    override val hoparlorYok = "Soatingizda dinamik yoʻq"
    override val sesCalisti = "Ovoz ishladi"
    override val motorYok = "Nutq sintezi yoʻq"
    override val sesYok = "Oʻzbekcha ovoz yoʻq"
    override val sesCalinamadi = "Ovozni ijro etib boʻlmadi"

    override fun vaktiCikiyor(ad: String) = "$ad vaqti tugayapti"
    override val tesbihatTamamlandi = "Tasbeh yakunlandi"
    override val toplam = "Jami"
    override val zikirSubhanallah = "Subhanalloh"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allohu akbar"
    override val zikirTehlil = "La ilaha illalloh"
    override val tehlilMetni = "La ilaha illallohu vahdahu la shariyka lah, lahul mulku va lahul hamdu va huva ʼala kulli shayʼin qodir"
    override val tesbihatKaynagi = "Muslim, Masojid 146"
}

// ÇEVİRİ: kk
object SaatDiliKk : SaatDili {
    override val kod = "kk"

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

// ÇEVİRİ: ky
object SaatDiliKy : SaatDili {
    override val kod = "ky"

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

// ÇEVİRİ: tg
object SaatDiliTg : SaatDili {
    override val kod = "tg"

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
