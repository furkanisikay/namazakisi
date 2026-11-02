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
 * Düzen: dil başına bir nesne, sıra tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk
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

    /**
     * Sayı ile kısa birim arası ("5 dk"); boşluksuz yazan dil (Çince "5分钟") "" verir.
     * JS `sure.birimli` kalıbının `{n}` ile `{birim}` arası (nöbetçi `nativeSureAyiraclari.test.ts`).
     */
    val birimAyirici: String get() = " "

    /** Ardışık süre parçaları arası ("1 sa 5 dk", "1 saat 5 dakika"); JS `sure.parcali`. */
    val parcaAyirici: String get() = " "

    /** Kısa süre: bir dakikanın altı ("1 dk'dan az"). */
    val birDakikadanAzKisa: String
    fun saatSesli(n: Long): String
    fun dakikaSesli(n: Long): String
    val birDakikadanAzSesli: String

    /** Uzun biçimdeki parçaların arası ("1 saat 58 dakika"). */
    fun sesliBirlesik(saat: String, dakika: String): String = "${saat}${parcaAyirici}${dakika}"

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
    "sw" -> SaatDiliSw
    "ha" -> SaatDiliHa
    "am" -> SaatDiliAm
    "om" -> SaatDiliOm
    "so" -> SaatDiliSo
    "ff" -> SaatDiliFf
    "yo" -> SaatDiliYo
    "zh" -> SaatDiliZh
    "ta" -> SaatDiliTa
    "ml" -> SaatDiliMl
    "th" -> SaatDiliTh
    "ko" -> SaatDiliKo
    "vi" -> SaatDiliVi
    "pt" -> SaatDiliPt
    "it" -> SaatDiliIt
    "sv" -> SaatDiliSv
    "uk" -> SaatDiliUk
    "ro" -> SaatDiliRo
    "hr" -> SaatDiliHr
    "sr" -> SaatDiliSr
    "el" -> SaatDiliEl
    "ku" -> SaatDiliKu
    "tk" -> SaatDiliTk
    "tt" -> SaatDiliTt
    "sd" -> SaatDiliSd
    "pl" -> SaatDiliPl
    "ja" -> SaatDiliJa
    "gu" -> SaatDiliGu
    "bg" -> SaatDiliBg
    "mk" -> SaatDiliMk
    else -> SaatDiliTr
}

/** Tablosu olan diller, düzen sırasıyla (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk). */
val SAAT_DILLERI: List<SaatDili> = listOf(
    SaatDiliTr, SaatDiliEn, SaatDiliId, SaatDiliDe, SaatDiliFr, SaatDiliBs, SaatDiliRu, SaatDiliMs,
    SaatDiliAr, SaatDiliUr, SaatDiliEs, SaatDiliNl, SaatDiliSq, SaatDiliHi, SaatDiliBn,
    SaatDiliFa, SaatDiliPs, SaatDiliCkb, SaatDiliUg,
    SaatDiliAz, SaatDiliUz, SaatDiliKk, SaatDiliKy, SaatDiliTg,
    SaatDiliSw, SaatDiliHa, SaatDiliAm, SaatDiliOm, SaatDiliSo, SaatDiliFf, SaatDiliYo,
    SaatDiliZh, SaatDiliTa, SaatDiliMl, SaatDiliTh, SaatDiliKo, SaatDiliVi,
    SaatDiliPt, SaatDiliIt, SaatDiliSv, SaatDiliUk, SaatDiliRo, SaatDiliHr, SaatDiliSr, SaatDiliEl,
    SaatDiliKu, SaatDiliTk, SaatDiliTt, SaatDiliSd, SaatDiliPl, SaatDiliJa, SaatDiliGu, SaatDiliBg, SaatDiliMk,
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

// az — Azərbaycan dili (beta): JS `sozluk/az` (vakit, sure, kible, samimiyet); hitap "siz", "Kılındı" = "Qılındı".
// CLDR az: one/other; saydan sonra isim tək qalır → iki biçim eyni. Birimlər `sure.kisa` (saat/dəq/san).
// Yönəlmə hâli sabit xəritədir (ek üretilmez); SHORT_TEXT başlığı ~7 karakter → "Məğribə" yerine "Məğrib".
object SaatDiliAz : SaatDili {
    override val kod = "az"

    private val ADLAR = mapOf(
        "imsak" to "Sübh", "gunes" to "Günəş", "ogle" to "Zöhr",
        "ikindi" to "Əsr", "aksam" to "Məğrib", "yatsi" to "İşa",
    )

    /** Yönəlmə hâli ("…-ə qalan") — sabit xəritə. */
    private val YONELME = mapOf(
        "imsak" to "Sübhə", "gunes" to "Günəşə", "ogle" to "Zöhrə",
        "ikindi" to "Əsrə", "aksam" to "Məğribə", "yatsi" to "İşaya",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "saat"
    override val birimDk = "dəq"
    override val birimSn = "san"
    override val birDakikadanAzKisa = "<1 dəq"
    override fun saatSesli(n: Long) = "$n saat"
    override fun dakikaSesli(n: Long) = "$n dəqiqə"
    override val birDakikadanAzSesli = "1 dəqiqədən az"

    override fun cikisaUzun(ad: String) = "$ad çıxışına"
    override fun cikisaAciklama(ad: String) = "$ad vaxtının çıxmasına qalan vaxt"

    /** "Məğribə" 6 simvolu aşır → qısa başlıqda yalnız ad. */
    override fun giriseKisa(vakit: String): String {
        val yon = giriseUzun(vakit)
        return if (yon.length <= 6) yon else vakitAdi(vakit)
    }

    override fun giriseUzun(vakit: String) = YONELME[vakit] ?: vakitAdi(vakit)
    override fun giriseAciklama(ad: String) = "$ad vaxtına qalan vaxt"

    override val cikisBasligi = "Çıxış"
    override val girisBasligi = "Giriş"
    override fun cikisUzun(ad: String, saat: String) = "$ad çıxışı $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad vaxtının çıxış saatı $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad girişi $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad vaxtının giriş saatı $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Növbəti: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Növbəti namaz $ad, giriş $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "vaxtın çıxmasına" else "vaxtın girməsinə"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "çıxmasına" else "girməsinə"
        return "$ad vaxtının $fiil $sure"
    }

    override val kilindiEki = ", qılındı"
    override fun sonDakikaEki(dk: Int) = ", son $dk dəqiqə"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Bu gün $kilinan/$toplam qılındı"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · son $dk dəq"
    override fun dugmeAciklamasi(ad: String) = "$ad vaxtını qıldım kimi qeyd edin"

    /** Vaxt adına hal şəkilçisi ARTIRILMIR: "Zöhr namazını". */
    override fun onaySorusuSatirlari(ad: String) = "$ad namazını" to "qıldınızmı?"
    override val vakitDegisti = "Vaxt dəyişdi, qeyd edilmədi."
    override val kabulDuasi = "Allah qəbul etsin"

    override val kibleHizali = "Qiblə istiqamətindəsiniz"
    override val kibleArkada = "Qiblə arxanızdadır"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Qiblə $adim dərəcə ${if (sag) "sağınızdadır" else "solunuzdadır"}"
    override val donusArkada = "Arxanızda"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Sağa" else "Sola"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Namaz rejimi açıqdır · bitmə $saat"
    override val namazModuAcik = "Namaz rejimi açıqdır"
    override val namazModuKapandi = "Namaz rejimi bağlandı"
    override val namazModuTelefondaAcin = "Telefonunuzda Namaz rejimini bir dəfə açın"
    override val telefonaUlasilamadi = "Telefonunuzla əlaqə qurulmadı"
    override val namazModuAcilamadi = "Namaz rejimi açılmadı. Telefonunuzdan cəhd edin"
    override val camiKaydedildi = "Məsciddə olduğunuz qeydə alındı"
    override val camiBirDahaSorulmaz = "Bu vaxtda bir daha soruşulmayacaq"
    override val camiSayilmaz = "Bu yer bir daha məscid sayılmayacaq"
    override val soruGecersiz = "Bu sual artıq etibarlı deyil"
    override val islemYapilamadi = "Əməliyyat yerinə yetirilmədi. Telefonunuzdan cəhd edin"

    override val hoparlorYokBilgi = "Saatınızda dinamik yoxdur; səsli elanlar yalnız vibrasiya ilə bildirilir."
    override val motorYokBilgi = "Saatınızda mətn oxuma mühərriki tapılmadı; səsli elanlar yalnız vibrasiya ilə bildirilir."
    override val sesYokBilgi = "Saatınızda Azərbaycan dilində səs yoxdur; səsli elanlar yalnız vibrasiya ilə bildirilir."
    override val otomatikYerAciklamasi =
        "Telefonunuz yanınızda olanda səsli oxumanı telefonunuz edir; saatınız yalnız telefon uzaqda olanda danışır. Yalnız səsli elanı açıq olan xatırlatmalar oxunur."
    override val saatYerAciklamasi = "Səsli oxumanı saatınız edir. Yalnız səsli elanı açıq olan xatırlatmalar oxunur."
    override val hoparlorYok = "Saatınızda dinamik yoxdur"
    override val sesCalisti = "Səs işlədi"
    override val motorYok = "Mətn oxuma mühərriki yoxdur"
    override val sesYok = "Azərbaycan dilində səs yoxdur"
    override val sesCalinamadi = "Səs çalınmadı"

    override fun vaktiCikiyor(ad: String) = "$ad vaxtı çıxır"
    override val tesbihatTamamlandi = "Təsbihat tamamlandı"
    override val toplam = "Cəmi"
    override val zikirSubhanallah = "Sübhanəllah"
    override val zikirElhamdulillah = "Əlhəmdulillah"
    override val zikirAllahuEkber = "Allahu Əkbər"
    override val zikirTehlil = "La ilahə illəllah"
    override val tehlilMetni = "La ilahə illəllahu vəhdəhu la şərikə ləh, ləhul-mulku və ləhul-həmdu və huvə alə kulli şəy'in qadir"
    override val tesbihatKaynagi = "Müslim, Məsacid 146"
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

// kk — Kazakça (beta, Kiril): JS `sozluk/kk` (vakit adları QMDB: Таң, Күн, Бесін, Екінті, Ақшам, Құптан;
// hitap "Сіз"; "Kılındı" = "Оқылды"). CLDR kk: one/other; sayıdan sonra isim çoğul eki almaz → iki biçim aynı.
// Birimler `sure.kisa` (сағ/мин/с). Vakit adları en çok 6 karakter → SHORT_TEXT başlığında ad aynen.
// Zikir okunuşları Kazakça yaygın yazımla (yerli okuyucuyla DOĞRULANMADI).
object SaatDiliKk : SaatDili {
    override val kod = "kk"

    private val ADLAR = mapOf(
        "imsak" to "Таң", "gunes" to "Күн", "ogle" to "Бесін",
        "ikindi" to "Екінті", "aksam" to "Ақшам", "yatsi" to "Құптан",
    )

    /** Yönelme hâli ("…-ға қалды") — sabit harita, ek üretilmez. */
    private val YONELME = mapOf(
        "imsak" to "Таңға", "gunes" to "Күн шығуына", "ogle" to "Бесінге",
        "ikindi" to "Екінтіге", "aksam" to "Ақшамға", "yatsi" to "Құптанға",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "сағ"
    override val birimDk = "мин"
    override val birimSn = "с"
    override val birDakikadanAzKisa = "<1 мин"
    override fun saatSesli(n: Long) = "$n сағат"
    override fun dakikaSesli(n: Long) = "$n минут"
    override val birDakikadanAzSesli = "1 минуттан аз"

    override fun cikisaUzun(ad: String) = "$ad шығуына"
    override fun cikisaAciklama(ad: String) = "$ad уақытының шығуына қалған уақыт"

    /** "Екінтіге" / "Күн шығуына" 7 karakteri aşar → kısa başlıkta yalnız ad. */
    override fun giriseKisa(vakit: String): String {
        val yon = giriseUzun(vakit)
        return if (yon.length <= 7) yon else vakitAdi(vakit)
    }

    override fun giriseUzun(vakit: String) = YONELME[vakit] ?: vakitAdi(vakit)
    override fun giriseAciklama(ad: String) = "$ad уақытына қалған уақыт"

    override val cikisBasligi = "Шығуы"
    override val girisBasligi = "Кіруі"
    override fun cikisUzun(ad: String, saat: String) = "$ad шығуы $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad уақытының шығуы $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad кіруі $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad уақытының кіруі $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Келесі: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Келесі намаз $ad, кіруі $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "уақыттың шығуына" else "уақыттың кіруіне"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "шығуына" else "кіруіне"
        return "$ad уақытының $fiil $sure"
    }

    override val kilindiEki = ", оқылды"
    override fun sonDakikaEki(dk: Int) = ", соңғы $dk минут"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Бүгін $kilinan/$toplam оқылды"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · соңғы $dk мин"
    override fun dugmeAciklamasi(ad: String) = "$ad намазын оқыдым деп белгілеңіз"

    /** Vakit adına çekim eki ÜRETİLMEZ: "Бесін намазын". */
    override fun onaySorusuSatirlari(ad: String) = "$ad намазын" to "оқыдыңыз ба?"
    override val vakitDegisti = "Намаз уақыты өзгерді, белгіленбеді."
    override val kabulDuasi = "Алла қабыл етсін"

    override val kibleHizali = "Сіз құбыла бағытындасыз"
    override val kibleArkada = "Құбыла артыңызда"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Құбыла ${if (sag) "оң" else "сол"} жағыңызда, $adim°"
    override val donusArkada = "Артыңызда"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Оңға" else "Солға"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Намаз режимі қосулы · аяқталуы $saat"
    override val namazModuAcik = "Намаз режимі қосулы"
    override val namazModuKapandi = "Намаз режимі өшірілді"
    override val namazModuTelefondaAcin = "Намаз режимін телефоныңызда бір рет қосыңыз"
    override val telefonaUlasilamadi = "Телефонға қосылу мүмкін емес"
    override val namazModuAcilamadi = "Намаз режимі қосылмады. Телефоныңыздан көріңіз"
    override val camiKaydedildi = "Мешітте екеніңіз сақталды"
    override val camiBirDahaSorulmaz = "Бұл уақытта қайта сұралмайды"
    override val camiSayilmaz = "Бұл орын енді мешіт деп саналмайды"
    override val soruGecersiz = "Бұл сұрақ енді жарамсыз"
    override val islemYapilamadi = "Әрекет орындалмады. Телефоныңыздан көріңіз"

    override val hoparlorYokBilgi = "Сағатыңызда динамик жоқ; дауыстап оқу тек дірілмен хабарланады."
    override val motorYokBilgi = "Сағатыңызда мәтінді оқу жүйесі табылмады; дауыстап оқу тек дірілмен хабарланады."
    override val sesYokBilgi = "Сағатыңызда қазақ тіліндегі дауыс жоқ; дауыстап оқу тек дірілмен хабарланады."
    override val otomatikYerAciklamasi =
        "Телефоныңыз жаныңызда болғанда дауыстап оқуды телефон жасайды; сағатыңыз тек телефон алыста болғанда сөйлейді. Тек дауыстап оқуы қосулы еске салғыштар оқылады."
    override val saatYerAciklamasi = "Дауыстап оқуды сағатыңыз жасайды. Тек дауыстап оқуы қосулы еске салғыштар оқылады."
    override val hoparlorYok = "Сағатыңызда динамик жоқ"
    override val sesCalisti = "Дыбыс шықты"
    override val motorYok = "Мәтінді оқу жүйесі жоқ"
    override val sesYok = "Қазақ тіліндегі дауыс жоқ"
    override val sesCalinamadi = "Дыбыс шықпады"

    override fun vaktiCikiyor(ad: String) = "$ad уақыты шығып барады"
    override val tesbihatTamamlandi = "Тәспих аяқталды"
    override val toplam = "Барлығы"
    override val zikirSubhanallah = "Субханаллаһ"
    override val zikirElhamdulillah = "Әлхамдулиллаһ"
    override val zikirAllahuEkber = "Аллаһу әкбар"
    override val zikirTehlil = "Лә иләһә иллаллаһ"
    override val tehlilMetni = "Лә иләһә иллаллаһу уахдаһу лә шәрийкә ләһ, ләһул-мулку уә ләһул-хамду уә һуә ғалә кулли шәй-ин қадир"
    override val tesbihatKaynagi = "Муслим, Мәсәжид 146"
}

// ky
object SaatDiliKy : SaatDili {
    override val kod = "ky"

    private val ADLAR = mapOf(
        "imsak" to "Багымдат", "gunes" to "Күн чыгыш", "ogle" to "Бешим",
        "ikindi" to "Аср", "aksam" to "Шам", "yatsi" to "Куптан",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ст"
    override val birimDk = "мүн"
    override val birimSn = "сек"
    override val birDakikadanAzKisa = "<1 мүн"
    override fun saatSesli(n: Long) = "$n саат"
    override fun dakikaSesli(n: Long) = "$n мүнөт"
    override val birDakikadanAzSesli = "1 мүнөттөн аз"

    override fun cikisaUzun(ad: String) = "$ad бүткөнгө чейин"
    override fun cikisaAciklama(ad: String) = "$ad убактысынын бүтүшүнө калган убакыт"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} убактысына"
    override fun giriseAciklama(ad: String) = "$ad убактысына калган убакыт"

    override val cikisBasligi = "Бүтөт"
    override val girisBasligi = "Кирет"
    override fun cikisUzun(ad: String, saat: String) = "$ad бүтөт $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad убактысы саат $saat бүтөт"
    override fun girisUzun(ad: String, saat: String) = "$ad кирет $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad убактысы саат $saat кирет"
    override fun siradakiUzun(ad: String, saat: String) = "Кийинки: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Кийинки намаз $ad, саат $saat кирет"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "бүткөнгө чейин" else "киргенге чейин"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val ne = if (mod == KalanSure.Mod.CIKIS) "бүтүшүнө" else "киришине"
        return "$ad убактысынын $ne $sure калды"
    }

    override val kilindiEki = ", окулду"
    override fun sonDakikaEki(dk: Int) = ", акыркы $dk мүнөт"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Бүгүн $kilinan/$toplam окулду"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · акыркы $dk мүн"
    override fun dugmeAciklamasi(ad: String) = "$ad намазын окулду деп белгилөө"
    override fun onaySorusuSatirlari(ad: String) = "$ad намазын" to "окудуңузбу?"
    override val vakitDegisti = "Намаз убактысы өзгөрдү; белгиленген жок."
    override val kabulDuasi = "Алла кабыл кылсын"

    override val kibleHizali = "Сиз кыбылага карап турасыз"
    override val kibleArkada = "Кыбыла артыңызда"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Кыбыла сизден $adim° ${if (sag) "оң" else "сол"} тарапта"
    override val donusArkada = "Артыңызда"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Оңго" else "Солго"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Намаз режими күйүк · $saat бүтөт"
    override val namazModuAcik = "Намаз режими күйүк"
    override val namazModuKapandi = "Намаз режими өчүрүлдү"
    override val namazModuTelefondaAcin = "Намаз режимин телефонуңузда бир жолу күйгүзүңүз"
    override val telefonaUlasilamadi = "Телефонуңузга туташуу мүмкүн эмес"
    override val namazModuAcilamadi = "Намаз режими күйгөн жок. Телефонуңуздан аракет кылыңыз"
    override val camiKaydedildi = "Мечитте экениңиз сакталды"
    override val camiBirDahaSorulmaz = "Бул намаз убактысында сизден кайра суралбайт"
    override val camiSayilmaz = "Бул жер мындан ары мечит деп эсептелбейт"
    override val soruGecersiz = "Бул суроо мындан ары жарактуу эмес"
    override val islemYapilamadi = "Бул аткарылган жок. Телефонуңуздан аракет кылыңыз"

    override val hoparlorYokBilgi = "Саатыңызда динамик жок; үн менен окуулар дирилдөө менен гана билдирилет."
    override val motorYokBilgi = "Саатыңыздан текстти үнгө айландыруучу кыймылдаткыч табылган жок; үн менен окуулар дирилдөө менен гана билдирилет."
    override val sesYokBilgi = "Саатыңызда кыргызча үн жок; үн менен окуулар дирилдөө менен гана билдирилет."
    override val otomatikYerAciklamasi =
        "Телефонуңуз жаныңызда болгондо телефонуңуз үн менен окуйт; саатыңыз телефонуңуз алыс болгондо гана сүйлөйт. Үн менен окуу күйгүзүлгөн эскертмелер гана окулат."
    override val saatYerAciklamasi = "Саатыңыз үн менен окуйт. Үн менен окуу күйгүзүлгөн эскертмелер гана окулат."
    override val hoparlorYok = "Саатыңызда динамик жок"
    override val sesCalisti = "Үн иштеди"
    override val motorYok = "Текстти үнгө айландыруучу кыймылдаткыч жок"
    override val sesYok = "Кыргызча үн жок"
    override val sesCalinamadi = "Үн ойногон жок"

    override fun vaktiCikiyor(ad: String) = "$ad убактысы бүтүп баратат"
    override val tesbihatTamamlandi = "Тасбих аяктады"
    override val toplam = "Бардыгы"
    override val zikirSubhanallah = "Субханаллах"
    override val zikirElhamdulillah = "Алхамдулиллах"
    override val zikirAllahuEkber = "Аллаху акбар"
    override val zikirTehlil = "Ла илаха иллаллах"
    override val tehlilMetni = "Ла илаха иллаллаху вахдаху ла шарика лах, лахул-мулку ва лахул-хамду ва хува ала кулли шайин кадир"
    override val tesbihatKaynagi = "Муслим, Масажид 146"
}

// tg — Tacikçe (beta): JS `sozluk/tg` (vakit, sure, kible, samimiyet); hitap "Шумо", "Kılındı" = "Хонда шуд".
// CLDR tg: one/other (n == 1); sayıdan sonra ad tekildir → iki biçim aynı. Kısa birimler соат/дақ/сон.
// SHORT_TEXT başlığı ~7 karakter: vakit adları en fazla 6 harf. Zikirler Tacik Kiril yaygın yazımıyla.
object SaatDiliTg : SaatDili {
    override val kod = "tg"

    private val ADLAR = mapOf(
        "imsak" to "Бомдод", "gunes" to "Тулӯъ", "ogle" to "Пешин",
        "ikindi" to "Аср", "aksam" to "Шом", "yatsi" to "Хуфтан",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "соат"
    override val birimDk = "дақ"
    override val birimSn = "сон"
    override val birDakikadanAzKisa = "<1 дақ"
    override fun saatSesli(n: Long) = "$n соат"
    override fun dakikaSesli(n: Long) = "$n дақиқа"
    override val birDakikadanAzSesli = "камтар аз 1 дақиқа"

    override fun cikisaUzun(ad: String) = "то анҷоми $ad"
    override fun cikisaAciklama(ad: String) = "Вақти боқимонда то анҷоми вақти $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "то ${vakitAdi(vakit)}"
    override fun giriseAciklama(ad: String) = "Вақти боқимонда то $ad"

    override val cikisBasligi = "Анҷом"
    override val girisBasligi = "Оғоз"
    override fun cikisUzun(ad: String, saat: String) = "Анҷоми $ad $saat"
    override fun cikisAciklama(ad: String, saat: String) = "Вақти $ad соати $saat ба охир мерасад"
    override fun girisUzun(ad: String, saat: String) = "Оғози $ad $saat"
    override fun girisAciklama(ad: String, saat: String) = "Вақти $ad соати $saat оғоз мешавад"
    override fun siradakiUzun(ad: String, saat: String) = "Навбатӣ: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Намози навбатӣ $ad, оғоз соати $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "то анҷоми вақт" else "то расидани вақт"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ба охир мерасад" else "мерасад"
        return "Вақти $ad баъд аз $sure $fiil"
    }

    override val kilindiEki = ", хонда шуд"
    override fun sonDakikaEki(dk: Int) = ", $dk дақиқаи охир"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Имрӯз $kilinan/$toplam хонда шуд"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · $dk дақ монд"
    override fun dugmeAciklamasi(ad: String) = "Намози $ad-ро ҳамчун хондашуда қайд кунед"
    override fun onaySorusuSatirlari(ad: String) = "Намози $ad-ро" to "хондед?"
    override val vakitDegisti = "Вақт иваз шуд; қайд нашуд."
    override val kabulDuasi = "Худо қабул кунад"

    override val kibleHizali = "Шумо рӯ ба қибла ҳастед"
    override val kibleArkada = "Қибла дар паси Шумост"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Қибла $adim° аз тарафи ${if (sag) "рости" else "чапи"} Шумост"
    override val donusArkada = "Дар пас"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Рост" else "Чап"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Реҷаи намоз фаъол · анҷом $saat"
    override val namazModuAcik = "Реҷаи намоз фаъол"
    override val namazModuKapandi = "Реҷаи намоз хомӯш шуд"
    override val namazModuTelefondaAcin = "Реҷаи намозро як бор дар телефонатон фаъол кунед"
    override val telefonaUlasilamadi = "Ба телефонатон дастрасӣ нашуд"
    override val namazModuAcilamadi = "Реҷаи намоз фаъол нашуд. Аз телефонатон кӯшиш кунед"
    override val camiKaydedildi = "Дар масҷид будани Шумо сабт шуд"
    override val camiBirDahaSorulmaz = "Барои ин вақт дигар пурсида намешавад"
    override val camiSayilmaz = "Ин ҷо дигар масҷид ҳисоб намешавад"
    override val soruGecersiz = "Ин савол дигар эътибор надорад"
    override val islemYapilamadi = "Амал анҷом нашуд. Аз телефонатон кӯшиш кунед"

    override val hoparlorYokBilgi = "Соати Шумо баландгӯяк надорад; хониши овозӣ танҳо бо ларзиш хабар дода мешавад."
    override val motorYokBilgi = "Дар соати Шумо муҳаррики хониши матн ёфт нашуд; хониши овозӣ танҳо бо ларзиш хабар дода мешавад."
    override val sesYokBilgi = "Соати Шумо овози тоҷикӣ надорад; хониши овозӣ танҳо бо ларзиш хабар дода мешавад."
    override val otomatikYerAciklamasi =
        "Вақте ки телефонатон бо Шумост, хониши овозиро телефон иҷро мекунад; соат танҳо ҳангоми дур будани телефон сухан мегӯяд. Танҳо ёдовариҳое хонда мешаванд, ки хониши овозиашон фаъол аст."
    override val saatYerAciklamasi = "Хониши овозиро соататон иҷро мекунад. Танҳо ёдовариҳое хонда мешаванд, ки хониши овозиашон фаъол аст."
    override val hoparlorYok = "Соат баландгӯяк надорад"
    override val sesCalisti = "Садо кор кард"
    override val motorYok = "Муҳаррики хониши матн нест"
    override val sesYok = "Овози тоҷикӣ нест"
    override val sesCalinamadi = "Садо пахш нашуд"

    override fun vaktiCikiyor(ad: String) = "Вақти $ad ба охир мерасад"
    override val tesbihatTamamlandi = "Тасбеҳот анҷом ёфт"
    override val toplam = "Ҳамагӣ"
    override val zikirSubhanallah = "Субҳаналлоҳ"
    override val zikirElhamdulillah = "Алҳамдулиллоҳ"
    override val zikirAllahuEkber = "Аллоҳу акбар"
    override val zikirTehlil = "Ло илоҳа иллаллоҳ"
    override val tehlilMetni = "Ло илоҳа иллаллоҳу ваҳдаҳу ло шарика лаҳ, лаҳул-мулку ва лаҳул-ҳамду ва ҳува ъало кулли шайъин қадир"
    override val tesbihatKaynagi = "Муслим, Масоҷид 146"
}

// sw
object SaatDiliSw : SaatDili {
    override val kod = "sw"

    private val ADLAR = mapOf(
        "imsak" to "Alfajiri", "gunes" to "Macheo", "ogle" to "Adhuhuri",
        "ikindi" to "Alasiri", "aksam" to "Magharibi", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "saa"
    override val birimDk = "dk"
    override val birimSn = "s"
    override val birDakikadanAzKisa = "<dk 1"
    override fun saatSesli(n: Long) = "saa $n"
    override fun dakikaSesli(n: Long) = "dakika $n"
    override val birDakikadanAzSesli = "chini ya dakika moja"

    override fun cikisaUzun(ad: String) = "$ad inaisha baada ya"
    override fun cikisaAciklama(ad: String) = "Muda uliobaki hadi $ad iishe"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "Hadi ${vakitAdi(vakit)}"
    override fun giriseAciklama(ad: String) = "Muda uliobaki hadi $ad"

    override val cikisBasligi = "Inaisha"
    override val girisBasligi = "Inaingia"
    override fun cikisUzun(ad: String, saat: String) = "$ad inaisha $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad inaisha saa $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad inaingia $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad inaingia saa $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Inayofuata: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Swala inayofuata $ad, inaingia saa $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "hadi iishe" else "hadi iingie"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "inaisha" else "inaingia"
        return "$ad $fiil baada ya $sure"
    }

    override val kilindiEki = ", imeswaliwa"
    override fun sonDakikaEki(dk: Int) = ", dakika $dk za mwisho"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Leo $kilinan/$toplam zimeswaliwa"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · dk $dk za mwisho"
    override fun dugmeAciklamasi(ad: String) = "Weka alama $ad imeswaliwa"
    override fun onaySorusuSatirlari(ad: String) = "Umeswali" to "$ad?"
    override val vakitDegisti = "Wakati wa Swala umebadilika; haikuwekwa alama."
    override val kabulDuasi = "Mwenyezi Mungu aikubali"

    override val kibleHizali = "Umeelekea Kibla"
    override val kibleArkada = "Kibla iko nyuma yako"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Kibla iko $adim° upande wako wa ${if (sag) "kulia" else "kushoto"}"
    override val donusArkada = "Nyuma yako"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Kulia" else "Kushoto"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Hali ya Swala imewashwa · inaisha $saat"
    override val namazModuAcik = "Hali ya Swala imewashwa"
    override val namazModuKapandi = "Hali ya Swala imezimwa"
    override val namazModuTelefondaAcin = "Washa Hali ya Swala mara moja kwenye simu yako"
    override val telefonaUlasilamadi = "Simu yako haifikiki"
    override val namazModuAcilamadi = "Hali ya Swala haikuweza kuwashwa. Jaribu kutoka kwenye simu yako"
    override val camiKaydedildi = "Imehifadhiwa kuwa uko msikitini"
    override val camiBirDahaSorulmaz = "Hutaulizwa tena kwa wakati huu wa Swala"
    override val camiSayilmaz = "Mahali hapa hapatahesabiwa tena kuwa msikiti"
    override val soruGecersiz = "Swali hili si halali tena"
    override val islemYapilamadi = "Haikuweza kukamilika. Jaribu kutoka kwenye simu yako"

    override val hoparlorYokBilgi = "Saa yako haina spika; matangazo ya sauti yanatetemeka tu."
    override val motorYokBilgi = "Hakuna injini ya kusoma maandishi iliyopatikana kwenye saa yako; matangazo ya sauti yanatetemeka tu."
    override val sesYokBilgi = "Saa yako haina sauti ya Kiswahili; matangazo ya sauti yanatetemeka tu."
    override val otomatikYerAciklamasi =
        "Simu yako ikiwa nawe, simu inasoma kwa sauti; saa yako inaongea tu simu ikiwa mbali. Vikumbusho vilivyowashwa kusoma kwa sauti tu ndivyo vinavyosomwa."
    override val saatYerAciklamasi = "Saa yako inasoma kwa sauti. Vikumbusho vilivyowashwa kusoma kwa sauti tu ndivyo vinavyosomwa."
    override val hoparlorYok = "Saa yako haina spika"
    override val sesCalisti = "Sauti imefanya kazi"
    override val motorYok = "Hakuna injini ya kusoma maandishi"
    override val sesYok = "Hakuna sauti ya Kiswahili"
    override val sesCalinamadi = "Sauti haikuweza kucheza"

    override fun vaktiCikiyor(ad: String) = "$ad inaisha"
    override val tesbihatTamamlandi = "Tasbihi imekamilika"
    override val toplam = "Jumla"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// ha
// CLDR ha: one/other (0 çoğul). Hausa'da sayı addan sonra gelir, ad çekilmez ("minti 5").
object SaatDiliHa : SaatDili {
    override val kod = "ha"

    private val ADLAR = mapOf(
        "imsak" to "Asuba", "gunes" to "Fitowar Rana", "ogle" to "Azahar",
        "ikindi" to "Laʼasar", "aksam" to "Magariba", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "awa"
    override val birimDk = "min"
    override val birimSn = "daƙ"
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = "awa $n"
    override fun dakikaSesli(n: Long) = "minti $n"
    override val birDakikadanAzSesli = "ƙasa da minti 1"

    override fun cikisaUzun(ad: String) = "$ad za ta fita cikin"
    override fun cikisaAciklama(ad: String) = "Lokacin da ya rage kafin $ad ta fita"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "Zuwa ${vakitAdi(vakit)}"
    override fun giriseAciklama(ad: String) = "Lokacin da ya rage zuwa $ad"

    override val cikisBasligi = "Fita"
    override val girisBasligi = "Farawa"
    override fun cikisUzun(ad: String, saat: String) = "$ad za ta fita $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad za ta fita da ƙarfe $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad za ta yi $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad za ta yi da ƙarfe $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Na gaba: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Salla ta gaba $ad, za ta yi da ƙarfe $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "kafin ta fita" else "kafin ta yi"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "za ta fita" else "za ta yi"
        return "$ad $fiil cikin $sure"
    }

    override val kilindiEki = ", an yi"
    override fun sonDakikaEki(dk: Int) = ", minti $dk na ƙarshe"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Yau an yi $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · minti $dk na ƙarshe"
    override fun dugmeAciklamasi(ad: String) = "Yi alama an yi sallar $ad"
    override fun onaySorusuSatirlari(ad: String) = "Kun yi sallar" to "$ad?"
    override val vakitDegisti = "Lokacin salla ya canja; ba a yi alama ba."
    override val kabulDuasi = "Allah ya karɓa"

    override val kibleHizali = "Kuna fuskantar Alƙibla"
    override val kibleArkada = "Alƙibla tana bayanku"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Alƙibla tana ${if (sag) "dama" else "hagu"} da ku da $adim°"
    override val donusArkada = "A bayanku"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Dama" else "Hagu"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Yanayin salla a kunne · zai ƙare $saat"
    override val namazModuAcik = "Yanayin salla a kunne"
    override val namazModuKapandi = "An kashe Yanayin salla"
    override val namazModuTelefondaAcin = "Ku kunna Yanayin salla sau ɗaya a wayarku"
    override val telefonaUlasilamadi = "Ba a iya kaiwa ga wayarku ba"
    override val namazModuAcilamadi = "Ba a iya kunna Yanayin salla ba. Ku gwada daga wayarku"
    override val camiKaydedildi = "An ajiye cewa kuna masallaci"
    override val camiBirDahaSorulmaz = "Ba za a sake tambayar ku ba a wannan lokacin salla"
    override val camiSayilmaz = "Ba za a sake ƙidaya wannan wuri a matsayin masallaci ba"
    override val soruGecersiz = "Wannan tambaya ba ta aiki kuma"
    override val islemYapilamadi = "Ba a iya kammala wannan ba. Ku gwada daga wayarku"

    override val hoparlorYokBilgi = "Agogonku ba shi da lasifika; sanarwa da murya tana girgiza kawai."
    override val motorYokBilgi = "Ba a sami injin karatu da murya a agogonku ba; sanarwa da murya tana girgiza kawai."
    override val sesYokBilgi = "Agogonku ba shi da muryar Hausa; sanarwa da murya tana girgiza kawai."
    override val otomatikYerAciklamasi =
        "Idan wayarku tana tare da ku, wayar ce ke karantawa da murya; agogonku yana magana ne kawai idan wayarku ba ta kusa. Tunatarwar da aka kunna karatu da murya kaɗai ake karantawa."
    override val saatYerAciklamasi = "Agogonku yana karantawa da murya. Tunatarwar da aka kunna karatu da murya kaɗai ake karantawa."
    override val hoparlorYok = "Agogonku ba shi da lasifika"
    override val sesCalisti = "Sautin ya yi aiki"
    override val motorYok = "Babu injin karatu da murya"
    override val sesYok = "Babu muryar Hausa"
    override val sesCalinamadi = "Sautin bai kunna ba"

    override fun vaktiCikiyor(ad: String) = "$ad tana ƙarewa"
    override val tesbihatTamamlandi = "An kammala tasbihi"
    override val toplam = "Jimilla"
    override val zikirSubhanallah = "Subhanallahi"
    override val zikirElhamdulillah = "Alhamdulillahi"
    override val zikirAllahuEkber = "Allahu Akbar"
    override val zikirTehlil = "La ilaha illallahu"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lahu, lahul-mulku wa lahul-hamdu wa huwa ala kulli shayʼin qadir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// am — Amharca (beta); terimler src/core/dil/sozluk/am (Kıldım "ሰገድኩ", Kılındı "ተሰግዷል", hitap እርስዎ).
// CLDR am: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); sayıdan sonra ad tekil kalır (JS sure.ts).
object SaatDiliAm : SaatDili {
    override val kod = "am"

    private val ADLAR = mapOf(
        "imsak" to "ፈጅር", "gunes" to "ፀሐይ መውጣት", "ogle" to "ዙህር",
        "ikindi" to "አስር", "aksam" to "መግሪብ", "yatsi" to "ኢሻ",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ሰዓ"
    override val birimDk = "ደቂ"
    override val birimSn = "ሰከ"
    override val birDakikadanAzKisa = "<1 ደቂ"
    override fun saatSesli(n: Long) = "$n ሰዓት"
    override fun dakikaSesli(n: Long) = "$n ደቂቃ"
    override val birDakikadanAzSesli = "ከ1 ደቂቃ ያነሰ"

    override fun cikisaUzun(ad: String) = "$ad እስኪያልቅ"
    override fun cikisaAciklama(ad: String) = "$ad እስኪያልቅ የቀረው ጊዜ"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} እስኪገባ"
    override fun giriseAciklama(ad: String) = "$ad እስኪገባ የቀረው ጊዜ"

    override val cikisBasligi = "ያበቃል"
    override val girisBasligi = "ይገባል"
    override fun cikisUzun(ad: String, saat: String) = "$ad ያበቃል $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad በ$saat ያበቃል"
    override fun girisUzun(ad: String, saat: String) = "$ad ይገባል $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad በ$saat ይገባል"
    override fun siradakiUzun(ad: String, saat: String) = "ቀጣይ፦ $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "ቀጣይ ሶላት ${ad}፣ በ$saat ይገባል"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "እስኪያልቅ" else "እስኪገባ"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ያበቃል" else "ይገባል"
        return "$ad ከ$sure በኋላ $fiil"
    }

    override val kilindiEki = "፣ ተሰግዷል"
    override fun sonDakikaEki(dk: Int) = "፣ የመጨረሻዎቹ $dk ደቂቃዎች"
    override fun bugunEki(kilinan: Int, toplam: Int) = "። ዛሬ $kilinan/$toplam ተሰግደዋል"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · የመጨረሻ $dk ደቂ"
    override fun dugmeAciklamasi(ad: String) = "${ad}ን እንደተሰገደ ምልክት አድርግ"
    override fun onaySorusuSatirlari(ad: String) = "${ad}ን" to "ሰግደዋል?"
    override val vakitDegisti = "የሶላቱ ሰዓት ተቀይሯል፤ ምልክት አልተደረገም።"
    override val kabulDuasi = "አላህ ይቀበለው"

    override val kibleHizali = "ወደ ቂብላ ዞረዋል"
    override val kibleArkada = "ቂብላ ከኋላዎ ነው"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "ቂብላ ከ${if (sag) "ቀኝዎ" else "ግራዎ"} $adim° ነው"
    override val donusArkada = "ከኋላዎ"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "ቀኝ" else "ግራ"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "የሶላት ሁነታ በርቷል · በ$saat ያበቃል"
    override val namazModuAcik = "የሶላት ሁነታ በርቷል"
    override val namazModuKapandi = "የሶላት ሁነታ ጠፍቷል"
    override val namazModuTelefondaAcin = "የሶላት ሁነታን በስልክዎ ላይ አንድ ጊዜ ያብሩ"
    override val telefonaUlasilamadi = "ስልክዎ ሊደረስበት አልቻለም"
    override val namazModuAcilamadi = "የሶላት ሁነታ ሊበራ አልቻለም። ከስልክዎ ይሞክሩ"
    override val camiKaydedildi = "መስጂድ ውስጥ መሆንዎ ተመዝግቧል"
    override val camiBirDahaSorulmaz = "ለዚህ የሶላት ሰዓት ዳግም አይጠየቁም"
    override val camiSayilmaz = "ይህ ቦታ ዳግም እንደ መስጂድ አይቆጠርም"
    override val soruGecersiz = "ይህ ጥያቄ ከአሁን በኋላ አያገለግልም"
    override val islemYapilamadi = "ይህን ማጠናቀቅ አልተቻለም። ከስልክዎ ይሞክሩ"

    override val hoparlorYokBilgi = "ሰዓትዎ ድምፅ ማጉያ የለውም፤ ጮክ ተነባቢ ማስታወቂያዎች የሚንዘሩ ብቻ ናቸው።"
    override val motorYokBilgi = "በሰዓትዎ ላይ የጽሑፍ ወደ ንግግር ሞተር አልተገኘም፤ ጮክ ተነባቢ ማስታወቂያዎች የሚንዘሩ ብቻ ናቸው።"
    override val sesYokBilgi = "ሰዓትዎ የአማርኛ ድምፅ የለውም፤ ጮክ ተነባቢ ማስታወቂያዎች የሚንዘሩ ብቻ ናቸው።"
    override val otomatikYerAciklamasi =
        "ስልክዎ ከእርስዎ ጋር ሲሆን ስልክዎ ጮክ ብሎ ያነባል፤ ሰዓትዎ የሚናገረው ስልክዎ ሲርቅ ብቻ ነው። የሚነበቡት ጮክ ብሎ ማንበብ የበራላቸው አስታዋሾች ብቻ ናቸው።"
    override val saatYerAciklamasi = "ሰዓትዎ ጮክ ብሎ ያነባል። የሚነበቡት ጮክ ብሎ ማንበብ የበራላቸው አስታዋሾች ብቻ ናቸው።"
    override val hoparlorYok = "ሰዓትዎ ድምፅ ማጉያ የለውም"
    override val sesCalisti = "ድምፁ ሠርቷል"
    override val motorYok = "የጽሑፍ ወደ ንግግር ሞተር የለም"
    override val sesYok = "የአማርኛ ድምፅ የለም"
    override val sesCalinamadi = "ድምፁ ሊጫወት አልቻለም"

    override fun vaktiCikiyor(ad: String) = "$ad እያለቀ ነው"
    override val tesbihatTamamlandi = "ተስቢሑ ተጠናቋል"
    override val toplam = "ጠቅላላ"
    override val zikirSubhanallah = "ሱብሓነላህ"
    override val zikirElhamdulillah = "አልሐምዱሊላህ"
    override val zikirAllahuEkber = "አላሁ አክበር"
    override val zikirTehlil = "ላ ኢላሀ ኢለላህ"
    override val tehlilMetni = "ላ ኢላሀ ኢለላሁ ወሕደሁ ላ ሸሪከ ለሁ፣ ለሁል ሙልኩ ወለሁል ሐምዱ ወሁወ ዐላ ኩሊ ሸይኢን ቀዲር"
    override val tesbihatKaynagi = "ሙስሊም፣ መሳጂድ 146"
}

// om
object SaatDiliOm : SaatDili {
    override val kod = "om"

    private val ADLAR = mapOf(
        "imsak" to "Subhii", "gunes" to "Baha aduu", "ogle" to "Zuhrii",
        "ikindi" to "Asrii", "aksam" to "Maghriba", "yatsi" to "Ishaa'ii",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "sa'a"
    override val birimDk = "daq"
    override val birimSn = "sek"
    override val birDakikadanAzKisa = "<1 daq"
    override fun saatSesli(n: Long) = "$n sa'aatii"
    override fun dakikaSesli(n: Long) = "$n daqiiqaa"
    override val birDakikadanAzSesli = "daqiiqaa 1 gadi"

    override fun cikisaUzun(ad: String) = "$ad xumuramuuf"
    override fun cikisaAciklama(ad: String) = "Hanga $ad xumuramutti yeroo hafe"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "Hanga ${vakitAdi(vakit)}tti"
    override fun giriseAciklama(ad: String) = "Hanga ${ad}tti yeroo hafe"

    override val cikisBasligi = "Xumura"
    override val girisBasligi = "Jalqaba"
    override fun cikisUzun(ad: String, saat: String) = "$ad $saat xumurama"
    override fun cikisAciklama(ad: String, saat: String) = "$ad sa'aatii ${saat}tti xumurama"
    override fun girisUzun(ad: String, saat: String) = "$ad $saat jalqaba"
    override fun girisAciklama(ad: String, saat: String) = "$ad sa'aatii ${saat}tti jalqaba"
    override fun siradakiUzun(ad: String, saat: String) = "Itti aanu: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Salaanni itti aanu $ad, sa'aatii ${saat}tti jalqaba"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "hanga xumuramutti" else "hanga jalqabutti"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "xumurama" else "jalqaba"
        return "$ad $sure booda $fiil"
    }

    override val kilindiEki = ", salaatameera"
    override fun sonDakikaEki(dk: Int) = ", daqiiqaa $dk dhumaa"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Har'a $kilinan/$toplam salaatame"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · daq $dk dhumaa"
    override fun dugmeAciklamasi(ad: String) = "$ad akka salaatameetti mallatteessaa"
    override fun onaySorusuSatirlari(ad: String) = "$ad" to "salaattaniittuu?"
    override val vakitDegisti = "Yeroon salaataa jijjiirameera; hin mallattoofne."
    override val kabulDuasi = "Rabbiin haa qeebalu"

    override val kibleHizali = "Gara qiblaatti garagaltaniittu"
    override val kibleArkada = "Qiblaan duuba keessan jira"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Qiblaan gara ${if (sag) "mirga" else "bitaa"} keessanii $adim° irra jira"
    override val donusArkada = "Duuba keessan"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Mirga" else "Bitaa"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Haalli salaataa banaa · ${saat}tti xumurama"
    override val namazModuAcik = "Haalli salaataa banaa dha"
    override val namazModuKapandi = "Haalli salaataa cufameera"
    override val namazModuTelefondaAcin = "Haala salaataa si'a tokko bilbila irratti banaa"
    override val telefonaUlasilamadi = "Bilbilli keessan hin argamu"
    override val namazModuAcilamadi = "Haalli salaataa banamuu hin dandeenye. Bilbila irraa yaalaa"
    override val camiKaydedildi = "Masjiida keessa akka jirtan olkaa'ameera"
    override val camiBirDahaSorulmaz = "Yeroo salaataa kanaaf lammata hin gaafatamtan"
    override val camiSayilmaz = "Bakki kun kana booda akka masjiidaatti hin lakkaa'amu"
    override val soruGecersiz = "Gaaffiin kun kana booda hin hojjetu"
    override val islemYapilamadi = "Kana xumuruu hin dandeenye. Bilbila irraa yaalaa"

    override val hoparlorYokBilgi = "Sa'aatiin keessan sagalee baasaa hin qabu; beeksisni sagaleen dubbifamu raafama qofa."
    override val motorYokBilgi = "Sa'aatii keessan irratti meeshaan barreeffama sagaleetti jijjiiru hin argamne; beeksisni sagaleen dubbifamu raafama qofa."
    override val sesYokBilgi = "Sa'aatiin keessan sagalee Afaan Oromoo hin qabu; beeksisni sagaleen dubbifamu raafama qofa."
    override val otomatikYerAciklamasi =
        "Yeroo bilbilli keessan isin bira jiru, bilbilli sagaleen dubbisa; sa'aatiin keessan yeroo bilbilli fagaatu qofa dubbata. Yaadachiisa sagaleen dubbisuun irratti banamee qofatu dubbifama."
    override val saatYerAciklamasi = "Sa'aatiin keessan sagaleen dubbisa. Yaadachiisa sagaleen dubbisuun irratti banamee qofatu dubbifama."
    override val hoparlorYok = "Sa'aatiin keessan sagalee baasaa hin qabu"
    override val sesCalisti = "Sagaleen hojjeteera"
    override val motorYok = "Meeshaan barreeffama sagaleetti jijjiiru hin jiru"
    override val sesYok = "Sagaleen Afaan Oromoo hin jiru"
    override val sesCalinamadi = "Sagaleen taphachuu hin dandeenye"

    override fun vaktiCikiyor(ad: String) = "$ad xumuramaa jira"
    override val tesbihatTamamlandi = "Tasbiihiin xumurameera"
    override val toplam = "Walumaagala"
    override val zikirSubhanallah = "Subhaanallaah"
    override val zikirElhamdulillah = "Alhamdulillaah"
    override val zikirAllahuEkber = "Allaahu akbar"
    override val zikirTehlil = "Laa ilaaha illallaah"
    override val tehlilMetni = "Laa ilaaha illallaahu wahdahuu laa shariika lah, lahul-mulku wa lahul-hamdu wa huwa alaa kulli shay'in qadiir"
    override val tesbihatKaynagi = "Muslim, Masaajid 146"
}

// so
object SaatDiliSo : SaatDili {
    override val kod = "so"

    private val ADLAR = mapOf(
        "imsak" to "Subax", "gunes" to "Qorrax soo bax", "ogle" to "Duhur",
        "ikindi" to "Casar", "aksam" to "Maghrib", "yatsi" to "Cishe",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "s"
    override val birimDk = "daq"
    override val birimSn = "ilb"
    override val birDakikadanAzKisa = "<1 daq"
    override fun saatSesli(n: Long) = if (n == 1L) "1 saac" else "$n saacadood"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 daqiiqo" else "$n daqiiqo"
    override val birDakikadanAzSesli = "wax ka yar 1 daqiiqo"

    override fun cikisaUzun(ad: String) = "$ad wuxuu dhammaanayaa"
    override fun cikisaAciklama(ad: String) = "Waqtiga u haray dhammaadka $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} wuxuu galayaa"
    override fun giriseAciklama(ad: String) = "Waqtiga u haray $ad"

    override val cikisBasligi = "Dhammaad"
    override val girisBasligi = "Bilow"
    override fun cikisUzun(ad: String, saat: String) = "$ad wuxuu dhammaanayaa $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad wuxuu dhammaanayaa saacadda $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad wuxuu bilaabmayaa $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad wuxuu bilaabmayaa saacadda $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Xiga: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Salaadda xigta $ad, waxay bilaabmaysaa saacadda $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "ilaa uu dhammaado" else "ilaa uu bilaabmo"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "dhammaanayaa" else "bilaabmayaa"
        return "$ad wuxuu $fiil $sure kadib"
    }

    override val kilindiEki = ", la tukaday"
    override fun sonDakikaEki(dk: Int) = ", $dk daqiiqo ee ugu dambeeya"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Maanta $kilinan/$toplam la tukaday"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · $dk daq ee dambe"
    override fun dugmeAciklamasi(ad: String) = "U calaamadee $ad la tukaday"
    override fun onaySorusuSatirlari(ad: String) = "Ma tukatay" to "$ad?"
    override val vakitDegisti = "Waqtiga salaaddu wuu isbeddelay; lama calaamadeyn."
    override val kabulDuasi = "Alle ha aqbalo"

    override val kibleHizali = "Waxaad u jeeddaa Qiblada"
    override val kibleArkada = "Qibladu waa gadaashaada"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Qibladu waa $adim° dhanka ${if (sag) "midigtaada" else "bidixdaada"}"
    override val donusArkada = "Gadaashaada"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Midig" else "Bidix"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Qaabka Salaadda waa shidan yahay · wuxuu dhammaanayaa $saat"
    override val namazModuAcik = "Qaabka Salaadda waa shidan yahay"
    override val namazModuKapandi = "Qaabka Salaadda waa la damiyay"
    override val namazModuTelefondaAcin = "Hal mar ka shid qaabka Salaadda taleefankaaga"
    override val telefonaUlasilamadi = "Taleefankaaga lama gaari karo"
    override val namazModuAcilamadi = "Qaabka Salaadda lama shidi karin. Isku day taleefankaaga"
    override val camiKaydedildi = "Waa la kaydiyay inaad masjidka joogto"
    override val camiBirDahaSorulmaz = "Mar dambe laguma weydiin doono waqtigan salaadda"
    override val camiSayilmaz = "Meeshan mar dambe looma tirin doono masjid"
    override val soruGecersiz = "Su'aashani mar dambe ma shaqeyso"
    override val islemYapilamadi = "Tan lama dhammaystiri karin. Isku day taleefankaaga"

    override val hoparlorYokBilgi = "Saacaddaadu sameecad ma laha; ogeysiisyada codka ahi way gariiraan oo kaliya."
    override val motorYokBilgi = "Mishiin qoraal-ilaa-cod ah lagama helin saacaddaada; ogeysiisyada codka ahi way gariiraan oo kaliya."
    override val sesYokBilgi = "Saacaddaadu ma laha cod Soomaali ah; ogeysiisyada codka ahi way gariiraan oo kaliya."
    override val otomatikYerAciklamasi =
        "Marka taleefankaagu kula jiro, taleefankaaga ayaa kor u akhriya; saacaddaadu waxay hadashaa oo kaliya marka taleefankaagu fog yahay. Kaliya xusuusinta akhrinta codka loo shiday ayaa la akhriyaa."
    override val saatYerAciklamasi = "Saacaddaada ayaa kor u akhrisa. Kaliya xusuusinta akhrinta codka loo shiday ayaa la akhriyaa."
    override val hoparlorYok = "Saacaddaadu sameecad ma laha"
    override val sesCalisti = "Codku wuu shaqeeyay"
    override val motorYok = "Mishiin qoraal-ilaa-cod ah ma jiro"
    override val sesYok = "Cod Soomaali ah ma jiro"
    override val sesCalinamadi = "Codka lama shidi karin"

    override fun vaktiCikiyor(ad: String) = "$ad wuu dhammaanayaa"
    override val tesbihatTamamlandi = "Tasbiixa waa la dhammaystiray"
    override val toplam = "Wadarta"
    override val zikirSubhanallah = "Subxaanallaah"
    override val zikirElhamdulillah = "Alxamdulillaah"
    override val zikirAllahuEkber = "Allaahu akbar"
    override val zikirTehlil = "Laa ilaaha illallaah"
    override val tehlilMetni = "Laa ilaaha illallaahu waxdahu laa shariika lah, lahul-mulku wa lahul-xamdu wa huwa calaa kulli shay'in qadiir"
    override val tesbihatKaynagi = "Muslim, Masaajid 146"
}

// ff
// CLDR ff: one = 0 ve 1, other (JS `cogul.ts > sifirBir`; 1,5 de tekil, burada yalnız tam sayı).
// Pular: sayı önce ("5 hojomaaji"), terimler src/core/dil/sozluk/ff (vakit.ts başlık yorumu).
object SaatDiliFf : SaatDili {
    override val kod = "ff"

    private val ADLAR = mapOf(
        "imsak" to "Subaka", "gunes" to "Puɗal naange", "ogle" to "Fanaa",
        "ikindi" to "Alansaraa", "aksam" to "Futuroo", "yatsi" to "Geeƴe",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "sa"
    override val birimDk = "hj"
    override val birimSn = "mj"
    override val birDakikadanAzKisa = "<1 hj"
    override fun saatSesli(n: Long) = if (n == 0L || n == 1L) "$n saa’i" else "$n saa’iiji"
    override fun dakikaSesli(n: Long) = if (n == 0L || n == 1L) "$n hojom" else "$n hojomaaji"
    override val birDakikadanAzSesli = "ko ɓuri famɗude hojom gooto"

    override fun cikisaUzun(ad: String) = "$ad gasay caggal"
    override fun cikisaAciklama(ad: String) = "Saa’i heddiiɗo haa $ad gasa"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "Haa ${vakitAdi(vakit)}"
    override fun giriseAciklama(ad: String) = "Saa’i heddiiɗo haa $ad"

    override val cikisBasligi = "Gasay"
    override val girisBasligi = "Fuɗɗoto"
    override fun cikisUzun(ad: String, saat: String) = "$ad gasay $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad gasay e $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad fuɗɗoto $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad fuɗɗoto e $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Garoore: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Juulde garoore $ad, fuɗɗoto e $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "haa nde gasa" else "haa nde fuɗɗoo"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "gasay" else "fuɗɗoto"
        return "$ad $fiil caggal $sure"
    }

    override val kilindiEki = ", juulaama"
    override fun sonDakikaEki(dk: Int) = ", $dk hojomaaji sakkitoraaji"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Hannde $kilinan/$toplam juulaama"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · $dk hj sakkitoraaji"
    override fun dugmeAciklamasi(ad: String) = "Maandinee $ad ko juulaama"
    override fun onaySorusuSatirlari(ad: String) = "On juulii" to "$ad?"
    override val vakitDegisti = "Waqutu juulde waylii; maandinaaka."
    override val kabulDuasi = "Yo Alla jaɓu"

    override val kibleHizali = "Hiɗon ndaari qibla"
    override val kibleArkada = "Qibla hino caggal mon"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Qibla hino $adim° e ${if (sag) "ñaamo" else "nano"} mon"
    override val donusArkada = "Caggal mon"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Ñaamo" else "Nano"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Mode juulde huɓɓinaa · gasay $saat"
    override val namazModuAcik = "Mode juulde huɓɓinaa"
    override val namazModuKapandi = "Mode juulde ñifaama"
    override val namazModuTelefondaAcin = "Huɓɓinee Mode juulde laawol go’o e talifon mon"
    override val telefonaUlasilamadi = "Talifon mon hewtaaka"
    override val namazModuAcilamadi = "Mode juulde huɓɓinaaka. Etee iwrude e talifon mon"
    override val camiKaydedildi = "Mooftaama ko hiɗon e juulirde"
    override val camiBirDahaSorulmaz = "On naamnetaake kadi ngam ndee waqutu juulde"
    override val camiSayilmaz = "Nokku ngoo limtetaake wa juulirde kadi"
    override val soruGecersiz = "Ngal naamnal golltaa kadi"
    override val islemYapilamadi = "Ɗum timmaani. Etee iwrude e talifon mon"

    override val hoparlorYokBilgi = "Montoro mon alaa kaakaawal sowto; tintine e hito ndillata tan."
    override val motorYokBilgi = "Alaa masiŋ janngugol binndi heɓaaka e montoro mon; tintine e hito ndillata tan."
    override val sesYokBilgi = "Montoro mon alaa hito Pular; tintine e hito ndillata tan."
    override val otomatikYerAciklamasi =
        "So talifon mon hino wondi e mon, talifon mon janngata e hito; montoro mon wowlata tan so talifon mon woɗɗii. Siftinooje ɗe janngugol e hito huɓɓinaa tan njanngetee."
    override val saatYerAciklamasi = "Montoro mon janngata e hito. Siftinooje ɗe janngugol e hito huɓɓinaa tan njanngetee."
    override val hoparlorYok = "Montoro mon alaa kaakaawal sowto"
    override val sesCalisti = "Sowto ngo golli"
    override val motorYok = "Alaa masiŋ janngugol binndi"
    override val sesYok = "Alaa hito Pular"
    override val sesCalinamadi = "Sowto ngo fijjaaki"

    override fun vaktiCikiyor(ad: String) = "$ad hino gasa"
    override val tesbihatTamamlandi = "Tasbiihu timmii"
    override val toplam = "Fow"
    override val zikirSubhanallah = "Subhaanallaah"
    override val zikirElhamdulillah = "Alhamdulillaah"
    override val zikirAllahuEkber = "Allaahu akbar"
    override val zikirTehlil = "Laa ilaaha illallaah"
    override val tehlilMetni = "Laa ilaaha illallaahu wahdahuu laa shariika lahuu, lahul-mulku wa lahul-hamdu wa huwa ‘alaa kulli shay’in qadiir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// yo
// CLDR yo: yalnız other (JS `cogul.ts > hepDiger`); Yorubada sayı ismin ARDINDAN gelir ("wákàtí 2").
object SaatDiliYo : SaatDili {
    override val kod = "yo"

    private val ADLAR = mapOf(
        "imsak" to "Subh", "gunes" to "Yíyọ òòrùn", "ogle" to "Ṭḥuhr",
        "ikindi" to "‘Asr", "aksam" to "Mọgrib", "yatsi" to "‘Iṣā’",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "wkt"
    override val birimDk = "ìṣj"
    override val birimSn = "ìṣ-àá"
    override val birDakikadanAzKisa = "<1 ìṣj"
    override fun saatSesli(n: Long) = "wákàtí $n"
    override fun dakikaSesli(n: Long) = "ìṣẹ́jú $n"
    override val birDakikadanAzSesli = "kò tó ìṣẹ́jú kan"

    override fun cikisaUzun(ad: String) = "$ad yóò parí ní"
    override fun cikisaAciklama(ad: String) = "Àkókò tó kù kí $ad tó parí"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} lẹ́yìn"
    override fun giriseAciklama(ad: String) = "Àkókò tó kù sí $ad"

    override val cikisBasligi = "Ìparí"
    override val girisBasligi = "Ìbẹ̀rẹ̀"
    override fun cikisUzun(ad: String, saat: String) = "$ad yóò parí $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad yóò parí ní $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad yóò bẹ̀rẹ̀ $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad yóò bẹ̀rẹ̀ ní $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Èyí tó kàn: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Ìrun tó kàn $ad, yóò bẹ̀rẹ̀ ní $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "títí yóò fi parí" else "títí yóò fi bẹ̀rẹ̀"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "yóò parí" else "yóò bẹ̀rẹ̀"
        return "$ad $fiil lẹ́yìn $sure"
    }

    override val kilindiEki = ", ti kírun"
    override fun sonDakikaEki(dk: Int) = ", ìṣẹ́jú $dk tó kẹ́yìn"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Òní $kilinan/$toplam ti kírun"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · ìṣj $dk tó kẹ́yìn"
    override fun dugmeAciklamasi(ad: String) = "Sàmì sí $ad pé ẹ ti kí i"
    override fun onaySorusuSatirlari(ad: String) = "Ṣé ẹ ti kí" to "$ad?"
    override val vakitDegisti = "Àkókò ìrun ti yí padà; a kò sàmì sí i."
    override val kabulDuasi = "Kí Allāhu gbà á"

    override val kibleHizali = "Ẹ dojú kọ Ƙiblah"
    override val kibleArkada = "Ƙiblah wà lẹ́yìn yín"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Ƙiblah wà ní $adim° sí ${if (sag) "ọ̀tún" else "òsì"} yín"
    override val donusArkada = "Lẹ́yìn yín"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Ọ̀tún" else "Òsì"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Ipò ìrun wà ní títàn · yóò parí $saat"
    override val namazModuAcik = "Ipò ìrun wà ní títàn"
    override val namazModuKapandi = "A ti pa Ipò ìrun"
    override val namazModuTelefondaAcin = "Ẹ tan Ipò ìrun lẹ́ẹ̀kan lórí fóònù yín"
    override val telefonaUlasilamadi = "A kò lè dé ọ̀dọ̀ fóònù yín"
    override val namazModuAcilamadi = "A kò lè tan Ipò ìrun. Ẹ gbìyànjú láti fóònù yín"
    override val camiKaydedildi = "A ti kọ ọ́ sílẹ̀ pé ẹ wà ní mọ́sálásí"
    override val camiBirDahaSorulmaz = "A kò ní bi yín léèrè mọ́ fún àkókò ìrun yìí"
    override val camiSayilmaz = "A kò ní ka ibi yìí sí mọ́sálásí mọ́"
    override val soruGecersiz = "Ìbéèrè yìí kò wúlò mọ́"
    override val islemYapilamadi = "A kò lè parí èyí. Ẹ gbìyànjú láti fóònù yín"

    override val hoparlorYokBilgi = "Aago ọwọ́ yín kò ní agbọ́hùnsáfẹ́fẹ́; ìkéde ohùn yóò kàn gbọ̀n ni."
    override val motorYokBilgi = "A kò rí ẹ̀rọ kíkà sókè lórí aago ọwọ́ yín; ìkéde ohùn yóò kàn gbọ̀n ni."
    override val sesYokBilgi = "Aago ọwọ́ yín kò ní ohùn Yorùbá; ìkéde ohùn yóò kàn gbọ̀n ni."
    override val otomatikYerAciklamasi =
        "Nígbà tí fóònù yín bá wà lọ́dọ̀ yín, fóònù ni yóò kà á sókè; aago ọwọ́ yín ń sọ̀rọ̀ kìkì nígbà tí fóònù bá jìnnà. Àwọn ìránnilétí tí kíkà sókè wà ní títàn nìkan ni a ń kà."
    override val saatYerAciklamasi = "Aago ọwọ́ yín ni yóò kà á sókè. Àwọn ìránnilétí tí kíkà sókè wà ní títàn nìkan ni a ń kà."
    override val hoparlorYok = "Aago ọwọ́ yín kò ní agbọ́hùnsáfẹ́fẹ́"
    override val sesCalisti = "Ohùn náà ṣiṣẹ́"
    override val motorYok = "Kò sí ẹ̀rọ kíkà sókè"
    override val sesYok = "Kò sí ohùn Yorùbá"
    override val sesCalinamadi = "Ohùn náà kò lè dún"

    override fun vaktiCikiyor(ad: String) = "$ad ń parí"
    override val tesbihatTamamlandi = "Tasbīḥ ti parí"
    override val toplam = "Àpapọ̀"
    override val zikirSubhanallah = "Subḥānallāh"
    override val zikirElhamdulillah = "Al-ḥamdu lillāh"
    override val zikirAllahuEkber = "Allāhu akbar"
    override val zikirTehlil = "Lā ilāha illallāh"
    override val tehlilMetni = "Lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ‘alā kulli shay’in qadīr"
    override val tesbihatKaynagi = "Muslim, Masājid 146"
}

// zh
// CLDR zh: yalnız other (JS `cogul.ts > hepDiger`); sayıdan sonra isim çekimlenmez.
// Şablonlarda `${ad}` yazılır: Han harfi Kotlin'de tanımlayıcıya yapışır ("$ad结束" derlenmez).
object SaatDiliZh : SaatDili {
    override val kod = "zh"

    private val ADLAR = mapOf(
        "imsak" to "晨礼", "gunes" to "日出", "ogle" to "晌礼",
        "ikindi" to "晡礼", "aksam" to "昏礼", "yatsi" to "宵礼",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "小时"
    override val birimDk = "分钟"
    override val birimSn = "秒"
    // Boşluksuz yazılır ("5分钟", "1小时5分钟"; JS `sure.birimli` / `sure.parcali`).
    override val birimAyirici = ""
    override val parcaAyirici = ""
    override val birDakikadanAzKisa = "<1分钟"
    override fun saatSesli(n: Long) = "${n}小时"
    override fun dakikaSesli(n: Long) = "${n}分钟"
    override val birDakikadanAzSesli = "不到1分钟"

    override fun cikisaUzun(ad: String) = "距${ad}结束"
    override fun cikisaAciklama(ad: String) = "距${ad}结束还有"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "距${vakitAdi(vakit)}"
    override fun giriseAciklama(ad: String) = "距${ad}还有"

    override val cikisBasligi = "结束"
    override val girisBasligi = "开始"
    override fun cikisUzun(ad: String, saat: String) = "${ad} ${saat}结束"
    override fun cikisAciklama(ad: String, saat: String) = "${ad}于${saat}结束"
    override fun girisUzun(ad: String, saat: String) = "${ad} ${saat}开始"
    override fun girisAciklama(ad: String, saat: String) = "${ad}于${saat}开始"
    override fun siradakiUzun(ad: String, saat: String) = "下一个: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "下一番礼拜${ad}，于${saat}开始"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "后结束" else "后开始"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "结束" else "开始"
        return "${ad}将在${sure}后${fiil}"
    }

    override val kilindiEki = "，已礼拜"
    override fun sonDakikaEki(dk: Int) = "，最后${dk}分钟"
    override fun bugunEki(kilinan: Int, toplam: Int) = "。今天已礼 ${kilinan}/${toplam}"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · 最后${dk}分钟"
    override fun dugmeAciklamasi(ad: String) = "将${ad}标记为已礼拜"
    override fun onaySorusuSatirlari(ad: String) = "您礼了" to "${ad}吗？"
    override val vakitDegisti = "礼拜时间已变化；未标记。"
    override val kabulDuasi = "愿真主准承"

    override val kibleHizali = "您已面向朝向"
    override val kibleArkada = "朝向在您身后"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "朝向在您${if (sag) "右" else "左"}侧${adim}°"
    override val donusArkada = "在身后"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "向右" else "向左"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "礼拜模式已开启 · ${saat}结束"
    override val namazModuAcik = "礼拜模式已开启"
    override val namazModuKapandi = "礼拜模式已关闭"
    override val namazModuTelefondaAcin = "先在手机上开启一次礼拜模式"
    override val telefonaUlasilamadi = "无法连接您的手机"
    override val namazModuAcilamadi = "无法开启礼拜模式。改从手机上尝试"
    override val camiKaydedildi = "已记录您在清真寺"
    override val camiBirDahaSorulmaz = "本次礼拜时间内不会再询问您"
    override val camiSayilmaz = "此地点不会再被算作清真寺"
    override val soruGecersiz = "此问题已失效"
    override val islemYapilamadi = "无法完成此操作。改从手机上尝试"

    override val hoparlorYokBilgi = "您的手表没有扬声器；朗读提醒只会振动。"
    override val motorYokBilgi = "您的手表上没有找到语音合成引擎；朗读提醒只会振动。"
    override val sesYokBilgi = "您的手表上没有中文语音；朗读提醒只会振动。"
    override val otomatikYerAciklamasi =
        "手机在您身边时，由手机朗读；手机不在身边时，手表才会发声。只朗读开启了朗读的提醒。"
    override val saatYerAciklamasi = "由手表朗读。只朗读开启了朗读的提醒。"
    override val hoparlorYok = "您的手表没有扬声器"
    override val sesCalisti = "声音正常"
    override val motorYok = "没有语音合成引擎"
    override val sesYok = "没有中文语音"
    override val sesCalinamadi = "无法播放声音"

    override fun vaktiCikiyor(ad: String) = "${ad}即将结束"
    override val tesbihatTamamlandi = "赞念已完成"
    override val toplam = "总计"
    override val zikirSubhanallah = "赞主清净"
    override val zikirElhamdulillah = "一切赞颂全归真主"
    override val zikirAllahuEkber = "真主至大"
    override val zikirTehlil = "万物非主，唯有真主"
    override val tehlilMetni = "万物非主，唯有真主，独一无偶；国权归他，赞颂归他，他对万事是全能的"
    override val tesbihatKaynagi = "《穆斯林圣训实录》，清真寺篇 146"
}

// ta
object SaatDiliTa : SaatDili {
    override val kod = "ta"

    private val ADLAR = mapOf(
        "imsak" to "ஃபஜ்ர்", "gunes" to "சூரிய உதயம்", "ogle" to "லுஹர்",
        "ikindi" to "அஸர்", "aksam" to "மஃரிப்", "yatsi" to "இஷா",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "மணி"
    override val birimDk = "நிமி"
    override val birimSn = "வி"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 நிமி"
    override fun saatSesli(n: Long) = "${n} மணிநேரம்"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 நிமிடம்" else "${n} நிமிடங்கள்"
    override val birDakikadanAzSesli = "1 நிமிடத்திற்கும் குறைவு"

    override fun cikisaUzun(ad: String) = "${ad} முடிய"
    override fun cikisaAciklama(ad: String) = "${ad} முடிய மீதமுள்ள நேரம்"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} வரை"
    override fun giriseAciklama(ad: String) = "${ad} வரை மீதமுள்ள நேரம்"

    override val cikisBasligi = "முடிவு"
    override val girisBasligi = "தொடக்கம்"
    override fun cikisUzun(ad: String, saat: String) = "${ad} முடிவு ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "${ad} ${saat} மணிக்கு முடியும்"
    override fun girisUzun(ad: String, saat: String) = "${ad} தொடக்கம் ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "${ad} ${saat} மணிக்குத் தொடங்கும்"
    override fun siradakiUzun(ad: String, saat: String) = "அடுத்தது: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "அடுத்த தொழுகை ${ad}, ${saat} மணிக்குத் தொடங்கும்"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "முடிய" else "தொடங்க"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "முடிய" else "தொடங்க"
        return "${ad} ${fiil} ${sure} உள்ளது"
    }

    override val kilindiEki = ", தொழுதாகிவிட்டது"
    override fun sonDakikaEki(dk: Int) = ", கடைசி ${dk} நிமிடங்கள்"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". இன்று ${kilinan}/${toplam} தொழுதாகிவிட்டது"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · கடைசி ${dk} நிமி"
    override fun dugmeAciklamasi(ad: String) = "${ad} தொழுததாகக் குறிக்க"
    override fun onaySorusuSatirlari(ad: String) = ad to "தொழுதீர்களா?"
    override val vakitDegisti = "தொழுகை நேரம் மாறியது; குறிக்கப்படவில்லை."
    override val kabulDuasi = "அல்லாஹ் ஏற்றுக்கொள்வானாக"

    override val kibleHizali = "நீங்கள் கிப்லா திசையை நோக்கியுள்ளீர்கள்"
    override val kibleArkada = "கிப்லா உங்களுக்குப் பின்னால் உள்ளது"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "கிப்லா உங்கள் ${if (sag) "வலப்புறம்" else "இடப்புறம்"} ${adim}° உள்ளது"
    override val donusArkada = "பின்னால்"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "வலம்" else "இடம்"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "தொழுகைப் பயன்முறை இயக்கத்தில் · முடிவு ${saat}"
    override val namazModuAcik = "தொழுகைப் பயன்முறை இயக்கத்தில்"
    override val namazModuKapandi = "தொழுகைப் பயன்முறை முடக்கப்பட்டது"
    override val namazModuTelefondaAcin = "தொழுகைப் பயன்முறையை உங்கள் ஃபோனில் ஒருமுறை இயக்கவும்"
    override val telefonaUlasilamadi = "உங்கள் ஃபோனை அடைய முடியவில்லை"
    override val namazModuAcilamadi = "தொழுகைப் பயன்முறையை இயக்க முடியவில்லை. ஃபோனிலிருந்து முயலவும்"
    override val camiKaydedildi = "நீங்கள் பள்ளிவாசலில் இருப்பது சேமிக்கப்பட்டது"
    override val camiBirDahaSorulmaz = "இந்தத் தொழுகை நேரத்திற்கு மீண்டும் கேட்கப்படாது"
    override val camiSayilmaz = "இந்த இடம் இனி பள்ளிவாசலாகக் கருதப்படாது"
    override val soruGecersiz = "இந்தக் கேள்வி இனி செல்லாது"
    override val islemYapilamadi = "இதை முடிக்க முடியவில்லை. ஃபோனிலிருந்து முயலவும்"

    override val hoparlorYokBilgi = "உங்கள் வாட்ச்சில் ஸ்பீக்கர் இல்லை; சத்தமாகப் படித்தலுக்குப் பதிலாக அதிர்வு மட்டுமே இருக்கும்."
    override val motorYokBilgi = "உங்கள் வாட்ச்சில் உரையிலிருந்து பேச்சு இயந்திரம் இல்லை; சத்தமாகப் படித்தலுக்குப் பதிலாக அதிர்வு மட்டுமே இருக்கும்."
    override val sesYokBilgi = "உங்கள் வாட்ச்சில் தமிழ்க் குரல் இல்லை; சத்தமாகப் படித்தலுக்குப் பதிலாக அதிர்வு மட்டுமே இருக்கும்."
    override val otomatikYerAciklamasi =
        "உங்கள் ஃபோன் அருகில் இருக்கும்போது ஃபோன் சத்தமாகப் படிக்கும்; ஃபோன் தொலைவில் இருக்கும்போது மட்டுமே வாட்ச் பேசும். சத்தமாகப் படித்தல் இயக்கத்தில் உள்ள நினைவூட்டல்கள் மட்டுமே படிக்கப்படும்."
    override val saatYerAciklamasi = "உங்கள் வாட்ச் சத்தமாகப் படிக்கும். சத்தமாகப் படித்தல் இயக்கத்தில் உள்ள நினைவூட்டல்கள் மட்டுமே படிக்கப்படும்."
    override val hoparlorYok = "வாட்ச்சில் ஸ்பீக்கர் இல்லை"
    override val sesCalisti = "ஒலி வேலை செய்தது"
    override val motorYok = "பேச்சு இயந்திரம் இல்லை"
    override val sesYok = "தமிழ்க் குரல் இல்லை"
    override val sesCalinamadi = "ஒலியை இயக்க முடியவில்லை"

    override fun vaktiCikiyor(ad: String) = "${ad} நேரம் முடிகிறது"
    override val tesbihatTamamlandi = "தஸ்பீஹ் நிறைவடைந்தது"
    override val toplam = "மொத்தம்"
    override val zikirSubhanallah = "சுப்ஹானல்லாஹ்"
    override val zikirElhamdulillah = "அல்ஹம்துலில்லாஹ்"
    override val zikirAllahuEkber = "அல்லாஹு அக்பர்"
    override val zikirTehlil = "லா இலாஹ இல்லல்லாஹ்"
    override val tehlilMetni = "லா இலாஹ இல்லல்லாஹு வஹ்தஹு லா ஷரீக லஹு, லஹுல் முல்கு வ லஹுல் ஹம்து வ ஹுவ அலா குல்லி ஷைஇன் கதீர்"
    override val tesbihatKaynagi = "ஸஹீஹ் முஸ்லிம், மஸாஜித் 146"
}

// ml — Malayalamca (beta): JS `sozluk/ml` (vakit, sure, kible, samimiyet); "Kılındı" = "നമസ്കരിച്ചു".
// CLDR ml: one (yalnız 1) / other; Malayalamcada sayıdan sonra isim çekimlenmez. Malayalam harfi
// Kotlin tanımlayıcısına yapışır: şablonda harften önce `${...}`. SHORT_TEXT dar → güneş "ഉദയം".
object SaatDiliMl : SaatDili {
    override val kod = "ml"

    private val ADLAR = mapOf(
        "imsak" to "സുബ്‌ഹ്", "gunes" to "സൂര്യോദയം", "ogle" to "ളുഹർ",
        "ikindi" to "അസ്ർ", "aksam" to "മഗ്‌രിബ്", "yatsi" to "ഇശാ",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "മ"
    override val birimDk = "മി"
    override val birimSn = "സെ"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 മി"
    override fun saatSesli(n: Long) = "${n} മണിക്കൂർ"
    override fun dakikaSesli(n: Long) = "${n} മിനിറ്റ്"
    override val birDakikadanAzSesli = "1 മിനിറ്റിൽ താഴെ"

    override fun cikisaUzun(ad: String) = "${ad} തീരാൻ"
    override fun cikisaAciklama(ad: String) = "${ad} തീരാൻ ബാക്കിയുള്ള സമയം"
    override fun giriseKisa(vakit: String) = if (vakit == "gunes") "ഉദയം" else vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} വരെ"
    override fun giriseAciklama(ad: String) = "${ad} വരെ ബാക്കിയുള്ള സമയം"

    override val cikisBasligi = "തീരും"
    override val girisBasligi = "തുടങ്ങും"
    override fun cikisUzun(ad: String, saat: String) = "${ad} തീരും ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "${ad} ${saat}-ന് തീരും"
    override fun girisUzun(ad: String, saat: String) = "${ad} തുടങ്ങും ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "${ad} ${saat}-ന് തുടങ്ങും"
    override fun siradakiUzun(ad: String, saat: String) = "അടുത്തത്: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "അടുത്ത നമസ്കാരം ${ad}, ${saat}-ന് തുടങ്ങും"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "തീരാൻ" else "തുടങ്ങാൻ"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "തീരാൻ" else "തുടങ്ങാൻ"
        return "${ad} ${fiil} ${sure}"
    }

    override val kilindiEki = ", നമസ്കരിച്ചു"
    override fun sonDakikaEki(dk: Int) = ", അവസാന ${dk} മിനിറ്റ്"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". ഇന്ന് ${kilinan}/${toplam} നമസ്കരിച്ചു"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · അവസാന ${dk} മി"
    override fun dugmeAciklamasi(ad: String) = "${ad} നമസ്കരിച്ചതായി അടയാളപ്പെടുത്തുക"
    override fun onaySorusuSatirlari(ad: String) = "${ad}" to "നമസ്കരിച്ചോ?"
    override val vakitDegisti = "നമസ്കാര സമയം മാറി; അടയാളപ്പെടുത്തിയില്ല."
    override val kabulDuasi = "അല്ലാഹു സ്വീകരിക്കട്ടെ"

    override val kibleHizali = "നിങ്ങൾ ഖിബ്‌ലയ്ക്ക് നേരെയാണ്"
    override val kibleArkada = "ഖിബ്‌ല നിങ്ങളുടെ പിന്നിലാണ്"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "ഖിബ്‌ല നിങ്ങളുടെ ${if (sag) "വലത്തോട്ട്" else "ഇടത്തോട്ട്"} ${adim}°"
    override val donusArkada = "പിന്നിൽ"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "വലത്ത്" else "ഇടത്ത്"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "നമസ്കാര മോഡ് ഓൺ · ${saat}-ന് തീരും"
    override val namazModuAcik = "നമസ്കാര മോഡ് ഓൺ"
    override val namazModuKapandi = "നമസ്കാര മോഡ് ഓഫായി"
    override val namazModuTelefondaAcin = "ഫോണിൽ ഒരിക്കൽ നമസ്കാര മോഡ് ഓണാക്കുക"
    override val telefonaUlasilamadi = "ഫോണുമായി ബന്ധപ്പെടാനാവുന്നില്ല"
    override val namazModuAcilamadi = "നമസ്കാര മോഡ് ഓണാക്കാനായില്ല. ഫോണിൽ നിന്ന് ശ്രമിക്കുക"
    override val camiKaydedildi = "നിങ്ങൾ പള്ളിയിലാണെന്ന് രേഖപ്പെടുത്തി"
    override val camiBirDahaSorulmaz = "ഈ നമസ്കാര സമയത്ത് വീണ്ടും ചോദിക്കില്ല"
    override val camiSayilmaz = "ഈ സ്ഥലം ഇനി പള്ളിയായി കണക്കാക്കില്ല"
    override val soruGecersiz = "ഈ ചോദ്യം ഇനി സാധുവല്ല"
    override val islemYapilamadi = "ഇത് പൂർത്തിയാക്കാനായില്ല. ഫോണിൽ നിന്ന് ശ്രമിക്കുക"

    override val hoparlorYokBilgi = "വാച്ചിൽ സ്പീക്കറില്ല; ഉറക്കെ വായനയ്ക്ക് പകരം വിറയ്ക്കുക മാത്രം ചെയ്യും."
    override val motorYokBilgi = "വാച്ചിൽ ഉറക്കെ വായനാ എഞ്ചിൻ കണ്ടെത്തിയില്ല; ഉറക്കെ വായനയ്ക്ക് പകരം വിറയ്ക്കുക മാത്രം ചെയ്യും."
    override val sesYokBilgi = "വാച്ചിൽ മലയാളം ശബ്ദമില്ല; ഉറക്കെ വായനയ്ക്ക് പകരം വിറയ്ക്കുക മാത്രം ചെയ്യും."
    override val otomatikYerAciklamasi =
        "ഫോൺ കൂടെയുള്ളപ്പോൾ ഫോൺ ഉറക്കെ വായിക്കും; ഫോൺ അകലെയാകുമ്പോൾ മാത്രം വാച്ച് സംസാരിക്കും. ഉറക്കെ വായന ഓണാക്കിയ ഓർമ്മപ്പെടുത്തലുകൾ മാത്രമേ വായിക്കൂ."
    override val saatYerAciklamasi = "വാച്ച് ഉറക്കെ വായിക്കും. ഉറക്കെ വായന ഓണാക്കിയ ഓർമ്മപ്പെടുത്തലുകൾ മാത്രമേ വായിക്കൂ."
    override val hoparlorYok = "വാച്ചിൽ സ്പീക്കറില്ല"
    override val sesCalisti = "ശബ്ദം പ്രവർത്തിച്ചു"
    override val motorYok = "ഉറക്കെ വായനാ എഞ്ചിനില്ല"
    override val sesYok = "മലയാളം ശബ്ദമില്ല"
    override val sesCalinamadi = "ശബ്ദം പ്ലേ ചെയ്യാനായില്ല"

    override fun vaktiCikiyor(ad: String) = "${ad} സമയം തീരുന്നു"
    override val tesbihatTamamlandi = "തസ്ബീഹ് പൂർത്തിയായി"
    override val toplam = "ആകെ"
    override val zikirSubhanallah = "സുബ്ഹാനല്ലാഹ്"
    override val zikirElhamdulillah = "അൽഹംദുലില്ലാഹ്"
    override val zikirAllahuEkber = "അല്ലാഹു അക്ബർ"
    override val zikirTehlil = "ലാ ഇലാഹ ഇല്ലല്ലാഹ്"
    override val tehlilMetni = "ലാ ഇലാഹ ഇല്ലല്ലാഹു വഹ്ദഹു ലാ ശരീക ലഹു, ലഹുൽ മുൽകു വ ലഹുൽ ഹംദു വ ഹുവ അലാ കുല്ലി ശൈഇൻ ഖദീർ"
    override val tesbihatKaynagi = "സ്വഹീഹ് മുസ്‌ലിം, മസാജിദ് 146"
}

// th
// CLDR th: yalnız other (JS `cogul.ts > hepDiger`); sayıdan sonra isim çekimlenmez.
// Tay harfleri Kotlin'de tanımlayıcı karakteridir: şablonda "${ad}ละหมาด" (süslü parantezli) yazılır.
object SaatDiliTh : SaatDili {
    override val kod = "th"

    private val ADLAR = mapOf(
        "imsak" to "ซุบฮ์", "gunes" to "ซูรูก", "ogle" to "ดุฮ์ริ",
        "ikindi" to "อัสร์", "aksam" to "มักริบ", "yatsi" to "อีซา",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ชม."
    override val birimDk = "นาที"
    override val birimSn = "วิ"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 นาที"
    override fun saatSesli(n: Long) = "${n} ชั่วโมง"
    override fun dakikaSesli(n: Long) = "${n} นาที"
    override val birDakikadanAzSesli = "ไม่ถึง 1 นาที"

    override fun cikisaUzun(ad: String) = "${ad}หมดในอีก"
    override fun cikisaAciklama(ad: String) = "เวลาที่เหลือก่อนหมดเวลา${ad}"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)}ในอีก"
    override fun giriseAciklama(ad: String) = "เวลาที่เหลือก่อน${ad}"

    override val cikisBasligi = "หมด"
    override val girisBasligi = "เข้า"
    override fun cikisUzun(ad: String, saat: String) = "${ad}หมด ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "${ad}หมดเวลา ${saat}"
    override fun girisUzun(ad: String, saat: String) = "${ad}เข้า ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "${ad}เข้าเวลา ${saat}"
    override fun siradakiUzun(ad: String, saat: String) = "ถัดไป: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "เวลาละหมาดถัดไป ${ad} เริ่มเวลา ${saat}"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "ก่อนหมดเวลา" else "ก่อนเข้าเวลา"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "จะหมดเวลา" else "จะเข้าเวลา"
        return "${ad}${fiil}ในอีก ${sure}"
    }

    override val kilindiEki = " ละหมาดแล้ว"
    override fun sonDakikaEki(dk: Int) = " ${dk} นาทีสุดท้าย"
    override fun bugunEki(kilinan: Int, toplam: Int) = " วันนี้ละหมาดแล้ว ${kilinan}/${toplam}"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · ${dk} นาทีสุดท้าย"
    override fun dugmeAciklamasi(ad: String) = "ทำเครื่องหมายว่าละหมาด${ad}แล้ว"
    override fun onaySorusuSatirlari(ad: String) = "คุณละหมาด" to "${ad}แล้วหรือยัง"
    override val vakitDegisti = "เวลาละหมาดเปลี่ยนไปแล้ว จึงไม่ได้ทำเครื่องหมาย"
    override val kabulDuasi = "ขออัลลอฮ์ทรงตอบรับ"

    override val kibleHizali = "คุณหันไปทางกิบลัตแล้ว"
    override val kibleArkada = "กิบลัตอยู่ด้านหลัง"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "กิบลัตอยู่ทาง${if (sag) "ขวา" else "ซ้าย"} ${adim}°"
    override val donusArkada = "ด้านหลัง"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "ขวา" else "ซ้าย"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "โหมดละหมาดเปิดอยู่ · สิ้นสุด ${saat}"
    override val namazModuAcik = "โหมดละหมาดเปิดอยู่"
    override val namazModuKapandi = "ปิดโหมดละหมาดแล้ว"
    override val namazModuTelefondaAcin = "เปิดโหมดละหมาดบนโทรศัพท์หนึ่งครั้งก่อน"
    override val telefonaUlasilamadi = "เชื่อมต่อโทรศัพท์ไม่ได้"
    override val namazModuAcilamadi = "เปิดโหมดละหมาดไม่ได้ โปรดลองจากโทรศัพท์"
    override val camiKaydedildi = "บันทึกว่าคุณอยู่ที่มัสยิดแล้ว"
    override val camiBirDahaSorulmaz = "จะไม่ถามอีกสำหรับเวลาละหมาดนี้"
    override val camiSayilmaz = "สถานที่นี้จะไม่นับเป็นมัสยิดอีก"
    override val soruGecersiz = "คำถามนี้ใช้ไม่ได้แล้ว"
    override val islemYapilamadi = "ดำเนินการไม่สำเร็จ โปรดลองจากโทรศัพท์"

    override val hoparlorYokBilgi = "นาฬิกาของคุณไม่มีลำโพง ประกาศแบบอ่านออกเสียงจะสั่นอย่างเดียว"
    override val motorYokBilgi = "ไม่พบระบบอ่านออกเสียงบนนาฬิกาของคุณ ประกาศแบบอ่านออกเสียงจะสั่นอย่างเดียว"
    override val sesYokBilgi = "นาฬิกาของคุณไม่มีเสียงภาษาไทย ประกาศแบบอ่านออกเสียงจะสั่นอย่างเดียว"
    override val otomatikYerAciklamasi =
        "เมื่อโทรศัพท์อยู่กับคุณ โทรศัพท์จะอ่านออกเสียง นาฬิกาจะพูดเฉพาะเมื่อโทรศัพท์อยู่ห่าง จะอ่านเฉพาะการเตือนที่เปิดการอ่านออกเสียงไว้"
    override val saatYerAciklamasi = "นาฬิกาของคุณจะอ่านออกเสียง จะอ่านเฉพาะการเตือนที่เปิดการอ่านออกเสียงไว้"
    override val hoparlorYok = "นาฬิกาไม่มีลำโพง"
    override val sesCalisti = "เสียงทำงานแล้ว"
    override val motorYok = "ไม่มีระบบอ่านออกเสียง"
    override val sesYok = "ไม่มีเสียงภาษาไทย"
    override val sesCalinamadi = "เล่นเสียงไม่ได้"

    override fun vaktiCikiyor(ad: String) = "${ad}ใกล้หมดเวลา"
    override val tesbihatTamamlandi = "ตัสบีห์ครบแล้ว"
    override val toplam = "รวม"
    override val zikirSubhanallah = "ซุบฮานัลลอฮ์"
    override val zikirElhamdulillah = "อัลฮัมดุลิลลาฮ์"
    override val zikirAllahuEkber = "อัลลอฮุอักบัร"
    override val zikirTehlil = "ลาอิลาฮะอิลลัลลอฮ์"
    override val tehlilMetni = "ลาอิลาฮะอิลลัลลอฮุ วะห์ดะฮู ลาชะรีกะละฮ์ ละฮุลมุลกุ วะละฮุลฮัมดุ วะฮุวะอะลา กุลลิชัยอิน เกาะดีร"
    override val tesbihatKaynagi = "บันทึกโดยมุสลิม, อัลมะสาญิด 146"
}

// ko
// CLDR ko: yalnız other (JS `cogul.ts > hepDiger`); sayıdan sonra isim çekimlenmez. Sayı–birim
// bitişik ("5분"), parçalar boşluklu ("1시간 5분"). Hangıl tanımlayıcıya yapışır: "${ad}분" yazılır.
object SaatDiliKo : SaatDili {
    override val kod = "ko"

    private val ADLAR = mapOf(
        "imsak" to "새벽", "gunes" to "일출", "ogle" to "정오",
        "ikindi" to "오후", "aksam" to "저녁", "yatsi" to "밤",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "시간"
    override val birimDk = "분"
    override val birimSn = "초"
    override val birimAyirici = ""
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1분"
    override fun saatSesli(n: Long) = "${n}시간"
    override fun dakikaSesli(n: Long) = "${n}분"
    override val birDakikadanAzSesli = "1분 미만"

    override fun cikisaUzun(ad: String) = "${ad} 종료까지"
    override fun cikisaAciklama(ad: String) = "${ad} 예배 종료까지 남은 시간"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} 예배까지"
    override fun giriseAciklama(ad: String) = "${ad} 예배까지 남은 시간"

    override val cikisBasligi = "종료"
    override val girisBasligi = "시작"
    override fun cikisUzun(ad: String, saat: String) = "${ad} ${saat} 종료"
    override fun cikisAciklama(ad: String, saat: String) = "${ad} 예배는 ${saat}에 끝납니다"
    override fun girisUzun(ad: String, saat: String) = "${ad} ${saat} 시작"
    override fun girisAciklama(ad: String, saat: String) = "${ad} 예배는 ${saat}에 시작합니다"
    override fun siradakiUzun(ad: String, saat: String) = "다음: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "다음 예배 ${ad}, ${saat} 시작"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "종료까지" else "시작까지"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "끝납니다" else "시작합니다"
        return "${ad} 예배가 ${sure} 후 ${fiil}"
    }

    override val kilindiEki = ", 예배 완료"
    override fun sonDakikaEki(dk: Int) = ", 마지막 ${dk}분"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". 오늘 ${kilinan}/${toplam} 드림"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · 마지막 ${dk}분"
    override fun dugmeAciklamasi(ad: String) = "${ad} 예배를 완료로 표시"
    override fun onaySorusuSatirlari(ad: String) = "${ad} 예배를" to "드렸나요?"
    override val vakitDegisti = "예배 시간이 바뀌어 표시하지 않았습니다."
    override val kabulDuasi = "하나님께서 받아주시길"

    override val kibleHizali = "예배 방향을 바라보고 있습니다"
    override val kibleArkada = "예배 방향이 뒤쪽에 있습니다"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "예배 방향이 ${if (sag) "오른쪽" else "왼쪽"}으로 ${adim}° 있습니다"
    override val donusArkada = "뒤쪽"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "오른쪽" else "왼쪽"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "예배 모드 켜짐 · ${saat} 종료"
    override val namazModuAcik = "예배 모드 켜짐"
    override val namazModuKapandi = "예배 모드를 껐습니다"
    override val namazModuTelefondaAcin = "휴대전화에서 예배 모드를 한 번 켜세요"
    override val telefonaUlasilamadi = "휴대전화에 연결할 수 없습니다"
    override val namazModuAcilamadi = "예배 모드를 켤 수 없습니다. 휴대전화에서 시도하세요"
    override val camiKaydedildi = "성원에 있다고 저장했습니다"
    override val camiBirDahaSorulmaz = "이 예배 시간에는 다시 묻지 않습니다"
    override val camiSayilmaz = "이곳은 다시 성원으로 세지 않습니다"
    override val soruGecersiz = "이 질문은 더 이상 유효하지 않습니다"
    override val islemYapilamadi = "완료할 수 없습니다. 휴대전화에서 시도하세요"

    override val hoparlorYokBilgi = "시계에 스피커가 없어 음성 안내는 진동만 합니다."
    override val motorYokBilgi = "시계에서 음성 합성 엔진을 찾지 못해 음성 안내는 진동만 합니다."
    override val sesYokBilgi = "시계에 한국어 음성이 없어 음성 안내는 진동만 합니다."
    override val otomatikYerAciklamasi =
        "휴대전화가 가까이 있으면 휴대전화가 소리 내어 읽고, 휴대전화가 멀리 있을 때만 시계가 말합니다. 소리 내어 읽기가 켜진 알림만 읽습니다."
    override val saatYerAciklamasi = "시계가 소리 내어 읽습니다. 소리 내어 읽기가 켜진 알림만 읽습니다."
    override val hoparlorYok = "시계에 스피커가 없습니다"
    override val sesCalisti = "소리가 작동했습니다"
    override val motorYok = "음성 합성 엔진 없음"
    override val sesYok = "한국어 음성 없음"
    override val sesCalinamadi = "소리를 재생할 수 없습니다"

    override fun vaktiCikiyor(ad: String) = "${ad} 예배 시간이 끝나 갑니다"
    override val tesbihatTamamlandi = "타스비흐 완료"
    override val toplam = "전체"
    override val zikirSubhanallah = "수브하날라"
    override val zikirElhamdulillah = "알함두릴라"
    override val zikirAllahuEkber = "알라후 아크바르"
    override val zikirTehlil = "라 일라하 일랄라"
    override val tehlilMetni = "라 일라하 일랄라후 와흐다후 라 샤리카 라흐, 라훌 물쿠 와 라훌 함두 와 후와 알라 쿨리 샤이인 까디르"
    override val tesbihatKaynagi = "무슬림, 마사지드 146"
}

// vi
// CLDR vi: yalnız other (JS `cogul.ts > hepDiger`); sayıdan sonra isim çekimlenmez.
// Terimler JS sözlüğünden (src/core/dil/sozluk/vi): Salah, hành lễ, Masjid, Qiblah. Şablonlarda `${}` zorunlu.
object SaatDiliVi : SaatDili {
    override val kod = "vi"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Mặt trời mọc", "ogle" to "Zhuhr",
        "ikindi" to "‘Asr", "aksam" to "Maghrib", "yatsi" to "‘Isha’",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "giờ"
    override val birimDk = "phút"
    override val birimSn = "giây"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 phút"
    override fun saatSesli(n: Long) = "${n} giờ"
    override fun dakikaSesli(n: Long) = "${n} phút"
    override val birDakikadanAzSesli = "chưa đến 1 phút"

    override fun cikisaUzun(ad: String) = "${ad} kết thúc sau"
    override fun cikisaAciklama(ad: String) = "Thời gian còn lại đến khi hết giờ ${ad}"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "Đến ${vakitAdi(vakit)}"
    override fun giriseAciklama(ad: String) = "Thời gian còn lại đến ${ad}"

    override val cikisBasligi = "Kết thúc"
    override val girisBasligi = "Bắt đầu"
    override fun cikisUzun(ad: String, saat: String) = "${ad} kết thúc ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "${ad} kết thúc lúc ${saat}"
    override fun girisUzun(ad: String, saat: String) = "${ad} bắt đầu ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "${ad} bắt đầu lúc ${saat}"
    override fun siradakiUzun(ad: String, saat: String) = "Tiếp theo: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "Giờ Salah tiếp theo ${ad}, bắt đầu lúc ${saat}"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "đến khi kết thúc" else "đến khi bắt đầu"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "kết thúc" else "bắt đầu"
        return "${ad} ${fiil} sau ${sure}"
    }

    override val kilindiEki = ", đã hành lễ"
    override fun sonDakikaEki(dk: Int) = ", ${dk} phút cuối"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Hôm nay đã hành lễ ${kilinan}/${toplam}"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · ${dk} phút cuối"
    override fun dugmeAciklamasi(ad: String) = "Đánh dấu ${ad} là đã hành lễ"
    override fun onaySorusuSatirlari(ad: String) = "Bạn đã hành lễ" to "${ad} chưa?"
    override val vakitDegisti = "Giờ Salah đã thay đổi; chưa đánh dấu."
    override val kabulDuasi = "Cầu xin Allah chấp nhận"

    override val kibleHizali = "Bạn đang hướng về Qiblah"
    override val kibleArkada = "Qiblah ở phía sau bạn"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Qiblah lệch ${adim}° về bên ${if (sag) "phải" else "trái"}"
    override val donusArkada = "Phía sau"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Phải" else "Trái"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "Chế độ Salah bật · kết thúc ${saat}"
    override val namazModuAcik = "Chế độ Salah đang bật"
    override val namazModuKapandi = "Đã tắt Chế độ Salah"
    override val namazModuTelefondaAcin = "Hãy bật Chế độ Salah một lần trên điện thoại"
    override val telefonaUlasilamadi = "Không thể kết nối với điện thoại"
    override val namazModuAcilamadi = "Không thể bật Chế độ Salah. Hãy thử từ điện thoại"
    override val camiKaydedildi = "Đã lưu là bạn đang ở Masjid"
    override val camiBirDahaSorulmaz = "Bạn sẽ không được hỏi lại trong giờ Salah này"
    override val camiSayilmaz = "Nơi này sẽ không được tính là Masjid nữa"
    override val soruGecersiz = "Câu hỏi này không còn hiệu lực"
    override val islemYapilamadi = "Không thể hoàn tất. Hãy thử từ điện thoại"

    override val hoparlorYokBilgi = "Đồng hồ không có loa; thông báo đọc to chỉ rung."
    override val motorYokBilgi = "Không tìm thấy công cụ chuyển văn bản thành giọng nói trên đồng hồ; thông báo đọc to chỉ rung."
    override val sesYokBilgi = "Đồng hồ không có giọng đọc ở ngôn ngữ của ứng dụng; thông báo đọc to chỉ rung."
    override val otomatikYerAciklamasi =
        "Khi điện thoại ở bên bạn, điện thoại sẽ đọc to; đồng hồ chỉ phát tiếng khi điện thoại ở xa. Chỉ những lời nhắc đã bật đọc to mới được đọc."
    override val saatYerAciklamasi = "Đồng hồ sẽ đọc to. Chỉ những lời nhắc đã bật đọc to mới được đọc."
    override val hoparlorYok = "Đồng hồ không có loa"
    override val sesCalisti = "Âm thanh đã phát"
    override val motorYok = "Không có công cụ đọc văn bản"
    override val sesYok = "Không có giọng đọc ở ngôn ngữ ứng dụng"
    override val sesCalinamadi = "Không thể phát âm thanh"

    override fun vaktiCikiyor(ad: String) = "${ad} sắp kết thúc"
    override val tesbihatTamamlandi = "Đã hoàn thành Tasbih"
    override val toplam = "Tổng"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu Akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ‘ala kulli shay’in qadir"
    override val tesbihatKaynagi = "Muslim ghi lại, Masajid 146"
}

// pt — Portekizce (beta, pt-PT); terimler src/core/dil/sozluk/pt (Kıldım "Rezei", Kılındı "Rezada")
// CLDR pt-PT: one = 1, many = 1.000.000 katları, other (JS `cogul.ts > ispanyolca`); Avrupa/Afrika normu, Brezilya değil.
object SaatDiliPt : SaatDili {
    override val kod = "pt"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Nascer do Sol", "ogle" to "Zuhr",
        "ikindi" to "Assr", "aksam" to "Magrib", "yatsi" to "Ishá",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 hora" else "$n horas"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minuto" else "$n minutos"
    override val birDakikadanAzSesli = "menos de 1 minuto"

    override fun cikisaUzun(ad: String) = "$ad termina em"
    override fun cikisaAciklama(ad: String) = "Tempo até ao fim de $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} em"
    override fun giriseAciklama(ad: String) = "Tempo até $ad"

    override val cikisBasligi = "Termina"
    override val girisBasligi = "Começa"
    override fun cikisUzun(ad: String, saat: String) = "$ad termina $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad termina às $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad começa $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad começa às $saat"
    override fun siradakiUzun(ad: String, saat: String) = "A seguir: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Próxima oração $ad, começa às $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "até ao fim" else "até ao início"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "termina" else "começa"
        return "$ad $fiil dentro de $sure"
    }

    override val kilindiEki = ", rezada"
    override fun sonDakikaEki(dk: Int) = ", últimos $dk minutos"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Hoje $kilinan/$toplam rezadas"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · últimos $dk min"
    override fun dugmeAciklamasi(ad: String) = "Marcar $ad como rezada"
    override fun onaySorusuSatirlari(ad: String) = "Já rezou" to "$ad?"
    override val vakitDegisti = "A hora da oração mudou; não marcada."
    override val kabulDuasi = "Que Allah aceite"

    override val kibleHizali = "A Quibla está à sua frente"
    override val kibleArkada = "A Quibla está atrás de si"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "A Quibla está $adim° à sua ${if (sag) "direita" else "esquerda"}"
    override val donusArkada = "Atrás de si"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Direita" else "Esquerda"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Modo oração ativado · termina $saat"
    override val namazModuAcik = "Modo oração ativado"
    override val namazModuKapandi = "Modo oração desativado"
    override val namazModuTelefondaAcin = "Ative o Modo oração uma vez no telemóvel"
    override val telefonaUlasilamadi = "Não é possível contactar o telemóvel"
    override val namazModuAcilamadi = "Não foi possível ativar o Modo oração. Tente no telemóvel"
    override val camiKaydedildi = "Ficou registado que está na mesquita"
    override val camiBirDahaSorulmaz = "A pergunta não se repete nesta hora de oração"
    override val camiSayilmaz = "Este local deixa de contar como mesquita"
    override val soruGecersiz = "Esta pergunta já não é válida"
    override val islemYapilamadi = "Não foi possível concluir. Tente no telemóvel"

    override val hoparlorYokBilgi = "O relógio não tem altifalante; os avisos falados só vibram."
    override val motorYokBilgi = "Não foi encontrado um motor de leitura de texto no relógio; os avisos falados só vibram."
    override val sesYokBilgi = "O relógio não tem voz em português; os avisos falados só vibram."
    override val otomatikYerAciklamasi =
        "Quando o telemóvel está consigo, é ele que lê em voz alta; o relógio só fala quando o telemóvel está longe. Só são lidos os lembretes com leitura em voz alta ativada."
    override val saatYerAciklamasi = "O relógio lê em voz alta. Só são lidos os lembretes com leitura em voz alta ativada."
    override val hoparlorYok = "O relógio não tem altifalante"
    override val sesCalisti = "O som funcionou"
    override val motorYok = "Sem motor de leitura de texto"
    override val sesYok = "Sem voz em português"
    override val sesCalinamadi = "Não foi possível reproduzir o som"

    override fun vaktiCikiyor(ad: String) = "$ad está a terminar"
    override val tesbihatTamamlandi = "Tasbih concluído"
    override val toplam = "Total"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay’in qadir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// it
// CLDR it: one = 1, many = 1.000.000 katları, other (JS `cogul.ts > ispanyolca`).
object SaatDiliIt : SaatDili {
    override val kod = "it"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sorgere del sole", "ogle" to "Zuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 ora" else "$n ore"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minuto" else "$n minuti"
    override val birDakikadanAzSesli = "meno di 1 minuto"

    override fun cikisaUzun(ad: String) = "$ad finisce tra"
    override fun cikisaAciklama(ad: String) = "Tempo rimasto alla fine di $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} tra"
    override fun giriseAciklama(ad: String) = "Tempo rimasto a $ad"

    override val cikisBasligi = "Fine"
    override val girisBasligi = "Inizio"
    override fun cikisUzun(ad: String, saat: String) = "$ad finisce $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad finisce alle $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad inizia $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad inizia alle $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Prossimo: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Prossimo orario $ad, inizia alle $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "alla fine" else "all’inizio"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "finisce" else "inizia"
        return "$ad $fiil tra $sure"
    }

    override val kilindiEki = ", compiuta"
    override fun sonDakikaEki(dk: Int) = ", ultimi $dk minuti"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Oggi $kilinan/$toplam compiute"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · ultimi $dk min"
    override fun dugmeAciklamasi(ad: String) = "Segnare $ad come compiuto"
    override fun onaySorusuSatirlari(ad: String) = "Ha compiuto" to "$ad?"
    override val vakitDegisti = "L’orario è cambiato; non segnato."
    override val kabulDuasi = "Che Allah l’accetti"

    override val kibleHizali = "È in direzione della qibla"
    override val kibleArkada = "La qibla è alle sue spalle"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "La qibla è $adim° alla sua ${if (sag) "destra" else "sinistra"}"
    override val donusArkada = "Alle sue spalle"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Destra" else "Sinistra"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Modalità preghiera attiva · fino alle $saat"
    override val namazModuAcik = "Modalità preghiera attiva"
    override val namazModuKapandi = "Modalità preghiera disattivata"
    override val namazModuTelefondaAcin = "Attivi una volta la modalità preghiera sul telefono"
    override val telefonaUlasilamadi = "Il telefono non è raggiungibile"
    override val namazModuAcilamadi = "Impossibile attivare la modalità preghiera. Provi dal telefono"
    override val camiKaydedildi = "Presenza in moschea registrata"
    override val camiBirDahaSorulmaz = "Non le verrà chiesto di nuovo per questo orario"
    override val camiSayilmaz = "Questo luogo non conterà più come moschea"
    override val soruGecersiz = "Questa domanda non è più valida"
    override val islemYapilamadi = "Operazione non riuscita. Provi dal telefono"

    override val hoparlorYokBilgi = "L’orologio non ha altoparlante; gli annunci letti ad alta voce vibrano soltanto."
    override val motorYokBilgi = "Sull’orologio non è stato trovato un motore di sintesi vocale; gli annunci letti ad alta voce vibrano soltanto."
    override val sesYokBilgi = "L’orologio non ha una voce italiana; gli annunci letti ad alta voce vibrano soltanto."
    override val otomatikYerAciklamasi =
        "Quando il telefono è con lei, legge il telefono; l’orologio parla solo quando il telefono è lontano. Vengono letti solo i promemoria con la lettura ad alta voce attiva."
    override val saatYerAciklamasi = "Legge l’orologio. Vengono letti solo i promemoria con la lettura ad alta voce attiva."
    override val hoparlorYok = "L’orologio non ha altoparlante"
    override val sesCalisti = "Il suono ha funzionato"
    override val motorYok = "Nessun motore di sintesi vocale"
    override val sesYok = "Nessuna voce italiana"
    override val sesCalinamadi = "Impossibile riprodurre il suono"

    override fun vaktiCikiyor(ad: String) = "$ad sta finendo"
    override val tesbihatTamamlandi = "Tasbih completato"
    override val toplam = "Totale"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay’in qadir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// sv
// CLDR sv: one/other (JS `cogul.ts > birDiger`).
object SaatDiliSv : SaatDili {
    override val kod = "sv"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Soluppgång", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = if (n == 1L) "1 timme" else "$n timmar"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 minut" else "$n minuter"
    override val birDakikadanAzSesli = "mindre än 1 minut"

    override fun cikisaUzun(ad: String) = "$ad slutar om"
    override fun cikisaAciklama(ad: String) = "Tid kvar tills $ad slutar"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} om"
    override fun giriseAciklama(ad: String) = "Tid kvar till $ad"

    override val cikisBasligi = "Slutar"
    override val girisBasligi = "Börjar"
    override fun cikisUzun(ad: String, saat: String) = "$ad slutar $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad slutar klockan $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad börjar $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad börjar klockan $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Nästa: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Nästa bön $ad, börjar klockan $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "tills den slutar" else "tills den börjar"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "slutar" else "börjar"
        return "$ad $fiil om $sure"
    }

    override val kilindiEki = ", förrättad"
    override fun sonDakikaEki(dk: Int) = ", sista $dk minuterna"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". I dag $kilinan/$toplam förrättade"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · sista $dk min"
    override fun dugmeAciklamasi(ad: String) = "Markera $ad som förrättad"
    override fun onaySorusuSatirlari(ad: String) = "Har du bett" to "$ad?"
    override val vakitDegisti = "Bönetiden ändrades; inte markerad."
    override val kabulDuasi = "Må Allah acceptera det"

    override val kibleHizali = "Du är vänd mot Qibla"
    override val kibleArkada = "Qibla är bakom dig"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Qibla är $adim° till ${if (sag) "höger" else "vänster"} om dig"
    override val donusArkada = "Bakom dig"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Höger" else "Vänster"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Böneläge på · slutar $saat"
    override val namazModuAcik = "Böneläge på"
    override val namazModuKapandi = "Böneläge avstängt"
    override val namazModuTelefondaAcin = "Slå på Böneläge en gång på telefonen"
    override val telefonaUlasilamadi = "Telefonen kan inte nås"
    override val namazModuAcilamadi = "Böneläge kunde inte slås på. Försök från telefonen"
    override val camiKaydedildi = "Sparat att du är i moskén"
    override val camiBirDahaSorulmaz = "Du tillfrågas inte igen under den här bönetiden"
    override val camiSayilmaz = "Den här platsen räknas inte som moské igen"
    override val soruGecersiz = "Den här frågan gäller inte längre"
    override val islemYapilamadi = "Det gick inte att slutföra. Försök från telefonen"

    override val hoparlorYokBilgi = "Klockan har ingen högtalare; uppläsningar vibrerar bara."
    override val motorYokBilgi = "Ingen talsyntes hittades på klockan; uppläsningar vibrerar bara."
    override val sesYokBilgi = "Klockan har ingen svensk röst; uppläsningar vibrerar bara."
    override val otomatikYerAciklamasi =
        "När telefonen är med dig läser telefonen upp; klockan talar bara när telefonen är borta. Bara påminnelser med uppläsning påslagen läses upp."
    override val saatYerAciklamasi = "Klockan läser upp. Bara påminnelser med uppläsning påslagen läses upp."
    override val hoparlorYok = "Klockan har ingen högtalare"
    override val sesCalisti = "Ljudet fungerade"
    override val motorYok = "Ingen talsyntes"
    override val sesYok = "Ingen svensk röst"
    override val sesCalinamadi = "Ljudet kunde inte spelas"

    override fun vaktiCikiyor(ad: String) = "$ad håller på att ta slut"
    override val tesbihatTamamlandi = "Tasbih fullbordad"
    override val toplam = "Totalt"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// uk
// CLDR uk: one (1, 21…), few (2–4, 22–24…), many (gerisi) — JS `cogul.ts > rusca`; tarihte ay ilgi hâlinde.
// Terimler JS `sozluk/uk` (молитва, Аллаг, kişisiz "Здійснено"); birimler `sure.kisa` (год/хв/с).
object SaatDiliUk : SaatDili {
    override val kod = "uk"

    private val ADLAR = mapOf(
        "imsak" to "Фаджр", "gunes" to "Схід сонця", "ogle" to "Зугр",
        "ikindi" to "Аср", "aksam" to "Магріб", "yatsi" to "Іша",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "год"
    override val birimDk = "хв"
    override val birimSn = "с"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 хв"
    /** CLDR uk (JS `cogul.ts > rusca`; tam sayı). */
    fun cogulKategorisi(n: Long): String {
        val s10 = n % 10L
        val s100 = n % 100L
        return when {
            s10 == 1L && s100 != 11L -> "one"
            s10 in 2L..4L && s100 !in 12L..14L -> "few"
            else -> "many"
        }
    }

    override fun saatSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n година"
        "few" -> "$n години"
        "many" -> "$n годин"
        else -> "$n години"
    }
    override fun dakikaSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n хвилина"
        "few" -> "$n хвилини"
        "many" -> "$n хвилин"
        else -> "$n хвилини"
    }
    override val birDakikadanAzSesli = "менше хвилини"

    override fun cikisaUzun(ad: String) = "$ad закінчиться через"
    override fun cikisaAciklama(ad: String) = "Лишилося до кінця часу молитви $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} через"
    override fun giriseAciklama(ad: String) = "Лишилося до часу молитви $ad"

    override val cikisBasligi = "Кінець"
    override val girisBasligi = "Початок"
    override fun cikisUzun(ad: String, saat: String) = "$ad: кінець $saat"
    override fun cikisAciklama(ad: String, saat: String) = "Час молитви $ad закінчується о $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad: початок $saat"
    override fun girisAciklama(ad: String, saat: String) = "Час молитви $ad починається о $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Далі: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Наступна молитва — $ad, початок о $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "до кінця часу" else "до початку часу"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val sinir = if (mod == KalanSure.Mod.CIKIS) "кінця" else "початку"
        return "До $sinir часу молитви $ad — $sure"
    }

    override val kilindiEki = ", здійснено"
    override fun sonDakikaEki(dk: Int) = when (cogulKategorisi(dk.toLong())) {
        "one" -> ", остання $dk хвилина"
        "few" -> ", останні $dk хвилини"
        else -> ", останні $dk хвилин"
    }
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Сьогодні здійснено $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · останні $dk хв"
    override fun dugmeAciklamasi(ad: String) = "Позначити молитву $ad як здійснену"
    override fun onaySorusuSatirlari(ad: String) = "Ви здійснили" to "молитву $ad?"
    override val vakitDegisti = "Час молитви змінився; не позначено."
    override val kabulDuasi = "Нехай Аллаг прийме"

    override val kibleHizali = "Ви стоїте обличчям до Кибли"
    override val kibleArkada = "Кибла позаду вас"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Кибла на $adim° ${if (sag) "праворуч" else "ліворуч"} від вас"
    override val donusArkada = "Позаду вас"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Праворуч" else "Ліворуч"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Режим молитви ввімкнено · до $saat"
    override val namazModuAcik = "Режим молитви ввімкнено"
    override val namazModuKapandi = "Режим молитви вимкнено"
    override val namazModuTelefondaAcin = "Один раз увімкніть Режим молитви на телефоні"
    override val telefonaUlasilamadi = "Телефон недоступний"
    override val namazModuAcilamadi = "Не вдалося ввімкнути Режим молитви. Спробуйте з телефона"
    override val camiKaydedildi = "Збережено, що ви в мечеті"
    override val camiBirDahaSorulmaz = "Для цього часу молитви вас більше не запитають"
    override val camiSayilmaz = "Це місце більше не вважатиметься мечеттю"
    override val soruGecersiz = "Це запитання вже неактуальне"
    override val islemYapilamadi = "Не вдалося виконати. Спробуйте з телефона"

    override val hoparlorYokBilgi = "У годиннику немає динаміка; замість читання вголос буде лише вібрація."
    override val motorYokBilgi = "У годиннику не знайдено рушія синтезу мовлення; замість читання вголос буде лише вібрація."
    override val sesYokBilgi = "У годиннику немає українського голосу; замість читання вголос буде лише вібрація."
    override val otomatikYerAciklamasi =
        "Коли телефон з вами, вголос читає телефон; годинник говорить, лише коли телефона немає поруч. Читаються лише нагадування з увімкненим читанням уголос."
    override val saatYerAciklamasi = "Вголос читає годинник. Читаються лише нагадування з увімкненим читанням уголос."
    override val hoparlorYok = "У годиннику немає динаміка"
    override val sesCalisti = "Звук працює"
    override val motorYok = "Немає рушія синтезу мовлення"
    override val sesYok = "Немає українського голосу"
    override val sesCalinamadi = "Не вдалося відтворити звук"

    override fun vaktiCikiyor(ad: String) = "Час молитви $ad закінчується"
    override val tesbihatTamamlandi = "Тасбіх завершено"
    override val toplam = "Усього"
    override val zikirSubhanallah = "Субханаллаг"
    override val zikirElhamdulillah = "Альхамдуліллаг"
    override val zikirAllahuEkber = "Аллагу акбар"
    override val zikirTehlil = "Ля іляга ілляллаг"
    override val tehlilMetni = "Ля іляга ілляллагу вахдагу ля шаріка лягу, лягуль-мульку ва лягуль-хамду ва гуа аля кулли шай’ін кадір"
    override val tesbihatKaynagi = "Муслім, Масаджид 146"
}

// ro
// CLDR ro: one = 1; few = 0 ve …01–…19 (1 hariç); other "de" ile (JS `cogul.ts > rumence`); ș ț virgüllü.
// Terimler JS sözlüğünden (src/core/dil/sozluk/ro): Fajr · Răsărit · Dhuhr · Asr · Maghrib · Ișa; "M-am rugat" / "Efectuată".
// Rumence harfler (ă â î ș ț) tanımlayıcıya yapışır: şablonlarda `${}` zorunlu.
object SaatDiliRo : SaatDili {
    override val kod = "ro"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Răsărit", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Ișa",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 min"
    /** CLDR ro (JS `cogul.ts > rumence`; tam sayı). */
    fun cogulKategorisi(n: Long): String {
        val s100 = n % 100L
        return when {
            n == 1L -> "one"
            n == 0L || s100 in 1L..19L -> "few"
            else -> "other"
        }
    }

    override fun saatSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "${n} oră"
        "few" -> "${n} ore"
        else -> "${n} de ore"
    }
    override fun dakikaSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "${n} minut"
        "few" -> "${n} minute"
        else -> "${n} de minute"
    }
    override val birDakikadanAzSesli = "mai puțin de un minut"

    override fun cikisaUzun(ad: String) = "${ad} se încheie în"
    override fun cikisaAciklama(ad: String) = "Timp rămas până se încheie ${ad}"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "Până la ${vakitAdi(vakit)}"
    override fun giriseAciklama(ad: String) = "Timp rămas până la ${ad}"

    override val cikisBasligi = "Final"
    override val girisBasligi = "Început"
    override fun cikisUzun(ad: String, saat: String) = "${ad} se încheie ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "${ad} se încheie la ${saat}"
    override fun girisUzun(ad: String, saat: String) = "${ad} începe ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "${ad} începe la ${saat}"
    override fun siradakiUzun(ad: String, saat: String) = "Urmează: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "Rugăciunea următoare ${ad}, începe la ${saat}"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "până la final" else "până la început"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "se încheie" else "începe"
        return "${ad} ${fiil} în ${sure}"
    }

    override val kilindiEki = ", efectuată"
    override fun sonDakikaEki(dk: Int) = ", ultimele ${dk} minute"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Azi ${kilinan}/${toplam} efectuate"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · ultimele ${dk} min"
    override fun dugmeAciklamasi(ad: String) = "Marcați ${ad} ca efectuată"
    override fun onaySorusuSatirlari(ad: String) = "Ați efectuat" to "${ad}?"
    override val vakitDegisti = "Timpul rugăciunii s-a schimbat; nu s-a marcat."
    override val kabulDuasi = "Allah să primească"

    override val kibleHizali = "Sunteți cu fața spre Qibla"
    override val kibleArkada = "Qibla este în spate"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Qibla este la ${adim}° spre ${if (sag) "dreapta" else "stânga"}"
    override val donusArkada = "În spate"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Dreapta" else "Stânga"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "Modul rugăciune activat · până la ${saat}"
    override val namazModuAcik = "Modul rugăciune activat"
    override val namazModuKapandi = "Modul rugăciune dezactivat"
    override val namazModuTelefondaAcin = "Activați o dată Modul rugăciune pe telefon"
    override val telefonaUlasilamadi = "Telefonul nu poate fi accesat"
    override val namazModuAcilamadi = "Modul rugăciune nu a putut fi activat. Încercați de pe telefon"
    override val camiKaydedildi = "S-a salvat că sunteți la moschee"
    override val camiBirDahaSorulmaz = "Nu vi se va mai cere pentru acest timp de rugăciune"
    override val camiSayilmaz = "Acest loc nu va mai fi considerat moschee"
    override val soruGecersiz = "Această întrebare nu mai este valabilă"
    override val islemYapilamadi = "Acțiunea nu a putut fi finalizată. Încercați de pe telefon"

    override val hoparlorYokBilgi = "Ceasul nu are difuzor; anunțurile vocale doar vibrează."
    override val motorYokBilgi = "Pe ceas nu s-a găsit niciun motor de sinteză vocală; anunțurile vocale doar vibrează."
    override val sesYokBilgi = "Ceasul nu are o voce în limba română; anunțurile vocale doar vibrează."
    override val otomatikYerAciklamasi =
        "Când telefonul este aproape, el citește cu voce tare; ceasul vorbește doar când telefonul este departe. Se citesc doar mementourile cu citirea cu voce tare activată."
    override val saatYerAciklamasi = "Ceasul citește cu voce tare. Se citesc doar mementourile cu citirea cu voce tare activată."
    override val hoparlorYok = "Ceasul nu are difuzor"
    override val sesCalisti = "Sunetul a funcționat"
    override val motorYok = "Niciun motor de sinteză vocală"
    override val sesYok = "Nicio voce în limba română"
    override val sesCalinamadi = "Sunetul nu a putut fi redat"

    override fun vaktiCikiyor(ad: String) = "${ad} se încheie"
    override val tesbihatTamamlandi = "Tesbih încheiat"
    override val toplam = "Total"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir"
    override val tesbihatKaynagi = "Muslim, Masajid 146"
}

// hr
// CLDR hr: one (…1, …11 hariç), few (…2–4, …12–14 hariç), other — JS `cogul.ts > bosnakca`; tarihte ay ilgi hâlinde.
object SaatDiliHr : SaatDili {
    override val kod = "hr"

    private val ADLAR = mapOf(
        "imsak" to "Sabah", "gunes" to "Izlazak Sunca", "ogle" to "Podne",
        "ikindi" to "Ikindija", "aksam" to "Akšam", "yatsi" to "Jacija",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 min"
    /** CLDR hr (JS `cogul.ts > bosnakca`; tam sayı). */
    fun cogulKategorisi(n: Long): String {
        val s10 = n % 10L
        val s100 = n % 100L
        return when {
            s10 == 1L && s100 != 11L -> "one"
            s10 in 2L..4L && s100 !in 12L..14L -> "few"
            else -> "other"
        }
    }

    override fun saatSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n sat"
        "few" -> "$n sata"
        else -> "$n sati"
    }
    override fun dakikaSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n minuta"
        "few" -> "$n minute"
        else -> "$n minuta"
    }
    override val birDakikadanAzSesli = "manje od 1 minute"

    override fun cikisaUzun(ad: String) = "$ad istječe za"
    override fun cikisaAciklama(ad: String) = "Preostalo vrijeme do isteka: $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} za"
    override fun giriseAciklama(ad: String) = "Preostalo vrijeme do: $ad"

    override val cikisBasligi = "Istječe"
    override val girisBasligi = "Počinje"
    override fun cikisUzun(ad: String, saat: String) = "$ad istječe $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad istječe u $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad počinje $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad počinje u $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Sljedeći: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Sljedeći namaz $ad, počinje u $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "do isteka" else "do početka"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "istječe" else "počinje"
        return "$ad $fiil za $sure"
    }

    override val kilindiEki = ", klanjano"
    override fun sonDakikaEki(dk: Int) = ", posljednje minute: $dk"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Danas klanjano $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · još $dk min"
    override fun dugmeAciklamasi(ad: String) = "Označite kao klanjano: $ad"
    override fun onaySorusuSatirlari(ad: String) = "$ad:" to "jeste li klanjali?"
    override val vakitDegisti = "Vrijeme namaza promijenilo se; nije označeno."
    override val kabulDuasi = "Allah kabul ejlesun"

    override val kibleHizali = "Okrenuti ste prema kibli"
    override val kibleArkada = "Kibla je iza vas"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Kibla je $adim° ${if (sag) "udesno" else "ulijevo"} od vas"
    override val donusArkada = "Iza vas"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Desno" else "Lijevo"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Način za namaz uključen · do $saat"
    override val namazModuAcik = "Način za namaz uključen"
    override val namazModuKapandi = "Način za namaz isključen"
    override val namazModuTelefondaAcin = "Jednom uključite način za namaz na telefonu"
    override val telefonaUlasilamadi = "Telefon nije dostupan"
    override val namazModuAcilamadi = "Način za namaz nije se mogao uključiti. Pokušajte s telefona"
    override val camiKaydedildi = "Spremljeno da ste u džamiji"
    override val camiBirDahaSorulmaz = "Za ovo vrijeme namaza više vas nećemo pitati"
    override val camiSayilmaz = "Ovo se mjesto više neće računati kao džamija"
    override val soruGecersiz = "Ovo pitanje više ne vrijedi"
    override val islemYapilamadi = "To nije bilo moguće dovršiti. Pokušajte s telefona"

    override val hoparlorYokBilgi = "Vaš sat nema zvučnik; obavijesti za čitanje naglas samo vibriraju."
    override val motorYokBilgi = "Na satu nije pronađen mehanizam za pretvaranje teksta u govor; obavijesti za čitanje naglas samo vibriraju."
    override val sesYokBilgi = "Na vašem satu nema odgovarajućeg glasa; obavijesti za čitanje naglas samo vibriraju."
    override val otomatikYerAciklamasi =
        "Kad je telefon uz vas, naglas čita telefon; sat govori samo kad telefon nije uz vas. Čitaju se samo podsjetnici s uključenim čitanjem naglas."
    override val saatYerAciklamasi = "Naglas čita vaš sat. Čitaju se samo podsjetnici s uključenim čitanjem naglas."
    override val hoparlorYok = "Vaš sat nema zvučnik"
    override val sesCalisti = "Zvuk je radio"
    override val motorYok = "Nema mehanizma za govor"
    override val sesYok = "Nema odgovarajućeg glasa"
    override val sesCalinamadi = "Zvuk se nije mogao reproducirati"

    override fun vaktiCikiyor(ad: String) = "$ad istječe"
    override val tesbihatTamamlandi = "Tesbih je dovršen"
    override val toplam = "Ukupno"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Elhamdulillah"
    override val zikirAllahuEkber = "Allahu ekber"
    override val zikirTehlil = "La ilahe illallah"
    override val tehlilMetni = "La ilahe illallahu vahdehu la šerike leh, lehul-mulku ve lehul-hamdu ve huve ala kulli šej'in kadir"
    override val tesbihatKaynagi = "Muslim, Mesadžid 146"
}

// sr
// CLDR sr: one/few/other (JS `cogul.ts > bosnakca`); KİRİL yazılır (Latin seçenek yok).
object SaatDiliSr : SaatDili {
    override val kod = "sr"

    private val ADLAR = mapOf(
        "imsak" to "Сабах", "gunes" to "Излазак сунца", "ogle" to "Подне",
        "ikindi" to "Икиндија", "aksam" to "Акшам", "yatsi" to "Јација",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ч"
    override val birimDk = "мин"
    override val birimSn = "с"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 мин"
    /** CLDR sr (JS `cogul.ts > bosnakca`; tam sayı). */
    fun cogulKategorisi(n: Long): String {
        val s10 = n % 10L
        val s100 = n % 100L
        return when {
            s10 == 1L && s100 != 11L -> "one"
            s10 in 2L..4L && s100 !in 12L..14L -> "few"
            else -> "other"
        }
    }

    override fun saatSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n сат"
        "few" -> "$n сата"
        else -> "$n сати"
    }
    override fun dakikaSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n минут"
        "few" -> "$n минута"
        else -> "$n минута"
    }
    override val birDakikadanAzSesli = "мање од 1 минута"

    override fun cikisaUzun(ad: String) = "$ad истиче за"
    override fun cikisaAciklama(ad: String) = "Преостало време до истека: $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} за"
    override fun giriseAciklama(ad: String) = "Преостало време до наступања: $ad"

    override val cikisBasligi = "Истиче"
    override val girisBasligi = "Наступа"
    override fun cikisUzun(ad: String, saat: String) = "$ad истиче $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad: време истиче у $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad наступа $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad: време наступа у $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Следеће: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Следећи намаз: $ad, наступа у $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "до истека" else "до наступања"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "истиче" else "наступа"
        return "$ad: време $fiil за $sure"
    }

    override val kilindiEki = ", клањано"
    override fun sonDakikaEki(dk: Int) = ", још $dk мин"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Данас клањано $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · још $dk мин"
    override fun dugmeAciklamasi(ad: String) = "Означите намаз ($ad) као клањан"

    /** Ada hâl eki üretilmez (çekimsiz ad): ad ilk satırda, soru ikinci satırda. */
    override fun onaySorusuSatirlari(ad: String) = "$ad:" to "да ли сте клањали?"
    override val vakitDegisti = "Време намаза се променило; није означено."
    override val kabulDuasi = "Аллах примио"

    override val kibleHizali = "Окренути сте према кибли"
    override val kibleArkada = "Кибла је иза вас"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Кибла је $adim° ${if (sag) "десно" else "лево"} од вас"
    override val donusArkada = "Иза вас"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Десно" else "Лево"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Режим намаза укључен · до $saat"
    override val namazModuAcik = "Режим намаза укључен"
    override val namazModuKapandi = "Режим намаза је искључен"
    override val namazModuTelefondaAcin = "Једном укључите Режим намаза на телефону"
    override val telefonaUlasilamadi = "Ваш телефон није доступан"
    override val namazModuAcilamadi = "Режим намаза није укључен. Покушајте са телефона"
    override val camiKaydedildi = "Забележено је да сте у џамији"
    override val camiBirDahaSorulmaz = "За ово време намаза више нећете бити упитани"
    override val camiSayilmaz = "Ово место се више неће рачунати као џамија"
    override val soruGecersiz = "Ово питање више не важи"
    override val islemYapilamadi = "Радња није извршена. Покушајте са телефона"

    override val hoparlorYokBilgi = "Ваш сат нема звучник; обавештења за читање наглас само вибрирају."
    override val motorYokBilgi = "На вашем сату није пронађен систем за читање текста; обавештења за читање наглас само вибрирају."
    override val sesYokBilgi = "На вашем сату нема турског гласа; обавештења за читање наглас само вибрирају."
    override val otomatikYerAciklamasi =
        "Када је телефон код вас, чита телефон; сат говори само када је телефон далеко. Читају се само подсетници са укљученим читањем наглас."
    override val saatYerAciklamasi = "Читање наглас обавља ваш сат. Читају се само подсетници са укљученим читањем наглас."
    override val hoparlorYok = "Ваш сат нема звучник"
    override val sesCalisti = "Звук ради"
    override val motorYok = "Нема система за читање текста"
    override val sesYok = "Нема турског гласа"
    override val sesCalinamadi = "Звук није могао да се пусти"

    override fun vaktiCikiyor(ad: String) = "$ad: време истиче"
    override val tesbihatTamamlandi = "Тесбих је завршен"
    override val toplam = "Укупно"
    override val zikirSubhanallah = "Субханаллах"
    override val zikirElhamdulillah = "Елхамдулиллах"
    override val zikirAllahuEkber = "Аллаху екбер"
    override val zikirTehlil = "Ла илахе иллаллах"
    override val tehlilMetni = "Ла илахе иллаллаху вахдеху ла шерике лех, лехул-мулку ве лехул-хамду ве хуве ала кулли шеј'ин кадир"
    override val tesbihatKaynagi = "Муслим, Месаџид 146"
}

// el
// CLDR el: one/other (JS `cogul.ts > birDiger`); büyük harfte vurgu (tonos) düşer, soru işareti ";".
// Yunan harfleri Kotlin'de tanımlayıcı karakteridir: şablonda hep `${ad}` yazılır.
object SaatDiliEl : SaatDili {
    override val kod = "el"

    private val ADLAR = mapOf(
        "imsak" to "Φατζρ", "gunes" to "Ανατολή ηλίου", "ogle" to "Δουχρ",
        "ikindi" to "‘Ασρ", "aksam" to "Μάγριμπ", "yatsi" to "‘Ισά’",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ώ."
    override val birimDk = "λ."
    override val birimSn = "δευτ."
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 λ."
    override fun saatSesli(n: Long) = if (n == 1L) "1 ώρα" else "${n} ώρες"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 λεπτό" else "${n} λεπτά"
    override val birDakikadanAzSesli = "λιγότερο από 1 λεπτό"

    override fun cikisaUzun(ad: String) = "Η ${ad} λήγει σε"
    override fun cikisaAciklama(ad: String) = "Χρόνος έως τη λήξη της ${ad}"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} σε"
    override fun giriseAciklama(ad: String) = "Χρόνος έως την ${ad}"

    override val cikisBasligi = "Λήγει"
    override val girisBasligi = "Αρχίζει"
    override fun cikisUzun(ad: String, saat: String) = "Η ${ad} λήγει ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "Η ${ad} λήγει στις ${saat}"
    override fun girisUzun(ad: String, saat: String) = "Η ${ad} αρχίζει ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "Η ${ad} αρχίζει στις ${saat}"
    override fun siradakiUzun(ad: String, saat: String) = "Επόμενη: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "Επόμενη προσευχή ${ad}, αρχίζει στις ${saat}"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "έως τη λήξη" else "έως την έναρξη"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "λήγει" else "αρχίζει"
        return "Η ${ad} ${fiil} σε ${sure}"
    }

    override val kilindiEki = ", τελέστηκε"
    override fun sonDakikaEki(dk: Int) = ", τελευταία ${dk} λεπτά"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Σήμερα τελέστηκαν ${kilinan}/${toplam}"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · τελευταία ${dk} λ."
    override fun dugmeAciklamasi(ad: String) = "Σήμανση της προσευχής ${ad} ως τελεσμένης"
    override fun onaySorusuSatirlari(ad: String) = "Τελέσατε την" to "${ad};"
    override val vakitDegisti = "Η ώρα προσευχής άλλαξε· δεν σημειώθηκε."
    override val kabulDuasi = "Ας τη δεχτεί ο Αλλάχ"

    override val kibleHizali = "Είστε στραμμένοι προς την Κίμπλα"
    override val kibleArkada = "Η Κίμπλα είναι πίσω σας"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Η Κίμπλα είναι ${adim}° στα ${if (sag) "δεξιά" else "αριστερά"} σας"
    override val donusArkada = "Πίσω σας"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Δεξιά" else "Αριστερά"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "Λειτουργία προσευχής ενεργή · λήγει ${saat}"
    override val namazModuAcik = "Λειτουργία προσευχής ενεργή"
    override val namazModuKapandi = "Η Λειτουργία προσευχής απενεργοποιήθηκε"
    override val namazModuTelefondaAcin = "Ενεργοποιήστε μία φορά τη Λειτουργία προσευχής στο τηλέφωνο"
    override val telefonaUlasilamadi = "Το τηλέφωνό σας δεν είναι προσβάσιμο"
    override val namazModuAcilamadi = "Η Λειτουργία προσευχής δεν ενεργοποιήθηκε. Δοκιμάστε από το τηλέφωνο"
    override val camiKaydedildi = "Καταγράφηκε ότι είστε στο τζαμί"
    override val camiBirDahaSorulmaz = "Δεν θα ερωτηθείτε ξανά για αυτή την ώρα προσευχής"
    override val camiSayilmaz = "Αυτό το μέρος δεν θα θεωρείται πλέον τζαμί"
    override val soruGecersiz = "Αυτή η ερώτηση δεν ισχύει πλέον"
    override val islemYapilamadi = "Δεν ήταν δυνατή η ολοκλήρωση. Δοκιμάστε από το τηλέφωνο"

    override val hoparlorYokBilgi = "Το ρολόι σας δεν έχει ηχείο· οι εκφωνήσεις γίνονται μόνο με δόνηση."
    override val motorYokBilgi = "Δεν βρέθηκε μηχανή μετατροπής κειμένου σε ομιλία στο ρολόι σας· οι εκφωνήσεις γίνονται μόνο με δόνηση."
    override val sesYokBilgi = "Το ρολόι σας δεν έχει ελληνική φωνή· οι εκφωνήσεις γίνονται μόνο με δόνηση."
    override val otomatikYerAciklamasi =
        "Όταν το τηλέφωνο είναι μαζί σας, εκφωνεί το τηλέφωνο· το ρολόι μιλά μόνο όταν το τηλέφωνο είναι μακριά. Εκφωνούνται μόνο οι υπενθυμίσεις με ενεργή εκφώνηση."
    override val saatYerAciklamasi = "Εκφωνεί το ρολόι σας. Εκφωνούνται μόνο οι υπενθυμίσεις με ενεργή εκφώνηση."
    override val hoparlorYok = "Το ρολόι δεν έχει ηχείο"
    override val sesCalisti = "Ο ήχος λειτούργησε"
    override val motorYok = "Χωρίς μηχανή ομιλίας"
    override val sesYok = "Χωρίς ελληνική φωνή"
    override val sesCalinamadi = "Ο ήχος δεν ακούστηκε"

    override fun vaktiCikiyor(ad: String) = "Η ${ad} λήγει"
    override val tesbihatTamamlandi = "Το τασμπίχ ολοκληρώθηκε"
    override val toplam = "Σύνολο"
    override val zikirSubhanallah = "Σουμπχανάλλαχ"
    override val zikirElhamdulillah = "Αλχαμντουλίλλαχ"
    override val zikirAllahuEkber = "Αλλάχου άκμπαρ"
    override val zikirTehlil = "Λα ιλάχα ιλλαλλάχ"
    override val tehlilMetni = "Λα ιλάχα ιλλαλλάχου ουαχντάχου λα σαρίκα λαχ, λαχουλ-μούλκου ουα λαχουλ-χάμντου ουα χούα αλά κούλλι σάιιν καντίρ"
    override val tesbihatKaynagi = "Μουσλίμ, Μασάτζιντ 146"
}

// ÇEVİRİ: ku
// CLDR ku: one/other (JS `cogul.ts > birDiger`); Kurmancî (Hawar Latin), kod `ku` (`kmr` değil), Soranî (`ckb`) ayrı dil.
object SaatDiliKu : SaatDili {
    override val kod = "ku"

    private val ADLAR = mapOf(
        "imsak" to "Fajr", "gunes" to "Sunrise", "ogle" to "Dhuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isha",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
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

// tk — Türkmen dili (beta); terminler src/core/dil/sozluk/tk (Okadym / Okaldy, hitap "siz")
// CLDR tk: one/other (JS `cogul.ts > birDiger`); Türkmence Latin, i/I (Türkçe noktalı/noktasız ayrımı yok).
// San bilen at ýeke sanda galýar ("5 minut"), şonuň üçin one/other şekli birmeňzeş.
object SaatDiliTk : SaatDili {
    override val kod = "tk"

    private val ADLAR = mapOf(
        "imsak" to "Ertir", "gunes" to "Gün dogşy", "ogle" to "Öýle",
        "ikindi" to "Ikindi", "aksam" to "Agşam", "yatsi" to "Ýassy",
    )

    /** Ýöneliş düşümi ("…-a galan") — sabit sözlük. */
    private val YONELME = mapOf(
        "imsak" to "Ertire", "gunes" to "Gün dogşuna", "ogle" to "Öýlä",
        "ikindi" to "Ikindä", "aksam" to "Agşama", "yatsi" to "Ýassa",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "sag"
    override val birimDk = "min"
    override val birimSn = "sek"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 min"
    override fun saatSesli(n: Long) = "$n sagat"
    override fun dakikaSesli(n: Long) = "$n minut"
    override val birDakikadanAzSesli = "1 minutdan az"

    override fun cikisaUzun(ad: String) = "$ad çykmagyna"
    override fun cikisaAciklama(ad: String) = "$ad wagtynyň çykmagyna galan wagt"

    /** "Gün dogşuna" gysga sözbaşa sygmaýar → gysga sözbaşyda diňe at. */
    override fun giriseKisa(vakit: String): String {
        val yon = giriseUzun(vakit)
        return if (yon.length <= 6) yon else vakitAdi(vakit)
    }

    override fun giriseUzun(vakit: String) = YONELME[vakit] ?: vakitAdi(vakit)
    override fun giriseAciklama(ad: String) = "$ad wagtyna galan wagt"

    override val cikisBasligi = "Çykyş"
    override val girisBasligi = "Giriş"
    override fun cikisUzun(ad: String, saat: String) = "$ad gutarýar $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad wagty sagat $saat bolanda gutarýar"
    override fun girisUzun(ad: String, saat: String) = "$ad girýär $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad wagty sagat $saat bolanda girýär"
    override fun siradakiUzun(ad: String, saat: String) = "Indiki: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Indiki namaz $ad, girýän wagty $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "wagtyň çykmagyna" else "wagtyň girmegine"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "çykmagyna" else "girmegine"
        return "$ad wagtynyň $fiil $sure"
    }

    override val kilindiEki = ", okaldy"
    override fun sonDakikaEki(dk: Int) = ", soňky $dk minut"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Şu gün $kilinan/$toplam okaldy"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · soňky $dk min"
    override fun dugmeAciklamasi(ad: String) = "$ad namazyny okaldy diýip belläň"

    /** Wagt adyna düşüm goşulmasy GOŞULMAÝAR: "Öýle namazyny". */
    override fun onaySorusuSatirlari(ad: String) = "$ad namazyny" to "okadyňyzmy?"
    override val vakitDegisti = "Namaz wagty üýtgedi; bellenmedi."
    override val kabulDuasi = "Alla kabul etsin"

    override val kibleHizali = "Kybla tarap durupsyňyz"
    override val kibleArkada = "Kybla arkaňyzda"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Kybla ${if (sag) "sagyňyzda" else "çepiňizde"} $adim°"
    override val donusArkada = "Arkaňyzda"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Saga" else "Çepe"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Namaz tertibi açyk · gutarýar $saat"
    override val namazModuAcik = "Namaz tertibi açyk"
    override val namazModuKapandi = "Namaz tertibi öçdi"
    override val namazModuTelefondaAcin = "Namaz tertibini telefonyňyzda bir gezek açyň"
    override val telefonaUlasilamadi = "Telefonyňyza ýetip bolmaýar"
    override val namazModuAcilamadi = "Namaz tertibi açylmady. Telefonyňyzdan synanyşyň"
    override val camiKaydedildi = "Metjitdedigiňiz ýatda saklandy"
    override val camiBirDahaSorulmaz = "Bu namaz wagty üçin gaýtadan soralmaz"
    override val camiSayilmaz = "Bu ýer gaýdyp metjit hasaplanmaz"
    override val soruGecersiz = "Bu sorag indi güýçde däl"
    override val islemYapilamadi = "Muny tamamlap bolmady. Telefonyňyzdan synanyşyň"

    override val hoparlorYokBilgi = "Sagadyňyzda dinamik ýok; sesli bildirişler diňe titreýär."
    override val motorYokBilgi = "Sagadyňyzda sesli okamak hereketlendirijisi tapylmady; sesli bildirişler diňe titreýär."
    override val sesYokBilgi = "Sagadyňyzda türkmen sesi ýok; sesli bildirişler diňe titreýär."
    override val otomatikYerAciklamasi =
        "Telefonyňyz ýanyňyzda bolanda sesli okamagy telefonyňyz edýär; sagadyňyz diňe telefon uzakda bolanda gürleýär. Diňe sesli okamak açyk ýatlatmalar okalýar."
    override val saatYerAciklamasi = "Sesli okamagy sagadyňyz edýär. Diňe sesli okamak açyk ýatlatmalar okalýar."
    override val hoparlorYok = "Sagadyňyzda dinamik ýok"
    override val sesCalisti = "Ses işledi"
    override val motorYok = "Sesli okamak hereketlendirijisi ýok"
    override val sesYok = "Türkmen sesi ýok"
    override val sesCalinamadi = "Ses çalynmady"

    override fun vaktiCikiyor(ad: String) = "$ad wagty çykýar"
    override val tesbihatTamamlandi = "Tesbih tamamlandy"
    override val toplam = "Jemi"
    override val zikirSubhanallah = "Subhanalla"
    override val zikirElhamdulillah = "Elhamdulilla"
    override val zikirAllahuEkber = "Allahu ekber"
    override val zikirTehlil = "La ilahe illalla"
    override val tehlilMetni = "La ilahe illallahu wahdehu la şerike leh, lehul-mülkü we lehul-hamdu we huwe ala külli şeý'in kadir"
    override val tesbihatKaynagi = "Müslim, Mesajid 146"
}

// tt — Tatarca (beta, Kiril): JS `sozluk/tt` (vakit adları ДУМ РТ: Иртәнге, Кояш, Өйлә, Икенде, Ахшам, Ястү;
// hitap küçük "сез"; "Kılındı" = "Укылды"). Tatarca CLDR çoğul tablosunda yok → ICU kökü: yalnız other
// (JS `cogul.ts > hepDiger`); sayıdan sonra isim çoğul eki almaz. Birimler `sure.kisa` (сәг/мин/сек).
// Kotlin şablonunda Kiril harf tanımlayıcıya yapışır: ek alan değişken `${ad}` biçiminde yazılır.
// Zikir okunuşları Tatarca yaygın yazımla (yerli okuyucuyla DOĞRULANMADI).
object SaatDiliTt : SaatDili {
    override val kod = "tt"

    private val ADLAR = mapOf(
        "imsak" to "Иртәнге", "gunes" to "Кояш", "ogle" to "Өйлә",
        "ikindi" to "Икенде", "aksam" to "Ахшам", "yatsi" to "Ястү",
    )

    /** Yönelme hâli ("…-гә калды") — sabit harita, ek üretilmez. */
    private val YONELME = mapOf(
        "imsak" to "Иртәнгегә", "gunes" to "Кояш чыгуга", "ogle" to "Өйләгә",
        "ikindi" to "Икендегә", "aksam" to "Ахшамга", "yatsi" to "Ястүгә",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "сәг"
    override val birimDk = "мин"
    override val birimSn = "сек"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 мин"
    override fun saatSesli(n: Long) = "$n сәгать"
    override fun dakikaSesli(n: Long) = "$n минут"
    override val birDakikadanAzSesli = "1 минуттан аз"

    override fun cikisaUzun(ad: String) = "$ad чыкканчы"
    override fun cikisaAciklama(ad: String) = "$ad вакыты чыкканчы калган вакыт"

    /** "Икендегә" / "Кояш чыгуга" 7 karakteri aşar → kısa başlıkta yalnız ad. */
    override fun giriseKisa(vakit: String): String {
        val yon = giriseUzun(vakit)
        return if (yon.length <= 7) yon else vakitAdi(vakit)
    }

    override fun giriseUzun(vakit: String) = YONELME[vakit] ?: vakitAdi(vakit)
    override fun giriseAciklama(ad: String) = "$ad вакытына калган вакыт"

    override val cikisBasligi = "Чыгуы"
    override val girisBasligi = "Керүе"
    override fun cikisUzun(ad: String, saat: String) = "$ad чыгуы $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad вакытының чыгуы $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad керүе $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad вакытының керүе $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Чираттагы: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Чираттагы намаз $ad, керүе $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "вакыт чыкканчы" else "вакыт кергәнче"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "чыкканчы" else "кергәнче"
        return "$ad вакыты $fiil $sure"
    }

    override val kilindiEki = ", укылды"
    override fun sonDakikaEki(dk: Int) = ", соңгы $dk минут"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Бүген $kilinan/$toplam укылды"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · соңгы $dk мин"
    override fun dugmeAciklamasi(ad: String) = "$ad намазын укыдым дип билгеләгез"

    /** Vakit adına çekim eki ÜRETİLMEZ: "Өйлә намазын". */
    override fun onaySorusuSatirlari(ad: String) = "$ad намазын" to "укыдыгызмы?"
    override val vakitDegisti = "Намаз вакыты үзгәрде, билгеләнмәде."
    override val kabulDuasi = "Аллаһ кабул кылсын"

    override val kibleHizali = "Сез кыйбла юнәлешендә"
    override val kibleArkada = "Кыйбла артыгызда"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Кыйбла ${if (sag) "уң" else "сул"} ягыгызда, $adim°"
    override val donusArkada = "Артыгызда"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Уңга" else "Сулга"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Намаз режимы кабызылган · бетүе $saat"
    override val namazModuAcik = "Намаз режимы кабызылган"
    override val namazModuKapandi = "Намаз режимы сүндерелде"
    override val namazModuTelefondaAcin = "Намаз режимын телефоныгызда бер тапкыр кабызыгыз"
    override val telefonaUlasilamadi = "Телефонга тоташып булмый"
    override val namazModuAcilamadi = "Намаз режимы кабызылмады. Телефоныгыздан карагыз"
    override val camiKaydedildi = "Мәчеттә булуыгыз сакланды"
    override val camiBirDahaSorulmaz = "Бу вакытта яңадан соралмый"
    override val camiSayilmaz = "Бу урын инде мәчет дип саналмый"
    override val soruGecersiz = "Бу сорау инде гамәлдә түгел"
    override val islemYapilamadi = "Гамәл башкарылмады. Телефоныгыздан карагыз"

    override val hoparlorYokBilgi = "Сәгатегездә динамик юк; тавыш белән уку тибрәнү белән генә хәбәр ителә."
    override val motorYokBilgi = "Сәгатегездә текст уку системасы табылмады; тавыш белән уку тибрәнү белән генә хәбәр ителә."
    override val sesYokBilgi = "Сәгатегездә татар телендәге тавыш юк; тавыш белән уку тибрәнү белән генә хәбәр ителә."
    override val otomatikYerAciklamasi =
        "Телефоныгыз яныгызда булганда тавыш белән укуны телефон башкара; сәгатегез телефон ерак булганда гына сөйли. Бары тавыш белән уку кабызылган искәртүләр генә укыла."
    override val saatYerAciklamasi = "Тавыш белән укуны сәгатегез башкара. Бары тавыш белән уку кабызылган искәртүләр генә укыла."
    override val hoparlorYok = "Сәгатегездә динамик юк"
    override val sesCalisti = "Тавыш чыкты"
    override val motorYok = "Текст уку системасы юк"
    override val sesYok = "Татар телендәге тавыш юк"
    override val sesCalinamadi = "Тавыш чыкмады"

    override fun vaktiCikiyor(ad: String) = "$ad вакыты чыгып бара"
    override val tesbihatTamamlandi = "Тәсбих тәмамланды"
    override val toplam = "Барлыгы"
    override val zikirSubhanallah = "Сөбханаллаһ"
    override val zikirElhamdulillah = "Әлхәмдүлилләһ"
    override val zikirAllahuEkber = "Аллаһу әкбәр"
    override val zikirTehlil = "Лә иләһә илләллаһ"
    override val tehlilMetni = "Лә иләһә илләллаһү вәхдәһү лә шәрикә ләһ, ләһүл-мүлкү вә ләһүл-хәмдү вә һүвә гәлә күлли шәйин кадир"
    override val tesbihatKaynagi = "Мөслим, Мәсаҗид 146"
}

// sd
// CLDR sd: one/other (JS `cogul.ts > birDiger`); Arap harfli, SAĞDAN SOLA, yerel rakam `arab`. Sindhçede süre
// birimi kısaltılmaz (JS `sozluk/sd/sure.ts`). Kotlin şablonunda Arap harfi tanımlayıcıya yapışır: `${ad}`.
object SaatDiliSd : SaatDili {
    override val kod = "sd"

    private val ADLAR = mapOf(
        "imsak" to "فجر", "gunes" to "سج اڀرڻ", "ogle" to "ظهر",
        "ikindi" to "عصر", "aksam" to "مغرب", "yatsi" to "عشاء",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ڪلاڪ"
    override val birimDk = "منٽ"
    override val birimSn = "سيڪنڊ"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "1 منٽ کان گهٽ"
    override fun saatSesli(n: Long) = "$n ڪلاڪ"
    override fun dakikaSesli(n: Long) = "$n منٽ"
    override val birDakikadanAzSesli = "1 منٽ کان گهٽ"

    override fun cikisaUzun(ad: String) = "$ad ختم ٿيڻ ۾"
    override fun cikisaAciklama(ad: String) = "$ad جو وقت ختم ٿيڻ ۾ باقي وقت"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} تائين"
    override fun giriseAciklama(ad: String) = "$ad تائين باقي وقت"

    override val cikisBasligi = "پڄاڻي"
    override val girisBasligi = "شروع"
    override fun cikisUzun(ad: String, saat: String) = "$ad پڄاڻي $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad جو وقت $saat تي ختم ٿئي ٿو"
    override fun girisUzun(ad: String, saat: String) = "$ad شروع $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad جو وقت $saat تي شروع ٿئي ٿو"
    override fun siradakiUzun(ad: String, saat: String) = "ايندڙ: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "ايندڙ نماز $ad، شروع $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "ختم ٿيڻ ۾" else "شروع ٿيڻ ۾"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "ختم ٿيڻ" else "شروع ٿيڻ"
        return "$ad جو وقت $fiil ۾ $sure"
    }

    override val kilindiEki = "، پڙهي وئي"
    override fun sonDakikaEki(dk: Int) = "، آخري $dk منٽ"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". اڄ $kilinan/$toplam پڙهيون"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · آخري $dk منٽ"
    override fun dugmeAciklamasi(ad: String) = "$ad تي پڙهي وئي جو نشان لڳايو"
    override fun onaySorusuSatirlari(ad: String) = "ڇا $ad جي نماز" to "پڙهي ورتي؟"
    override val vakitDegisti = "نماز جو وقت بدلجي ويو؛ نشان نه لڳو."
    override val kabulDuasi = "الله قبول ڪري"

    override val kibleHizali = "اوهان جو منهن قبلي ڏانهن آهي"
    override val kibleArkada = "قبلو اوهان جي پٺيان آهي"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "قبلو اوهان جي ${if (sag) "ساڄي" else "کاٻي"} پاسي $adim° تي آهي"
    override val donusArkada = "پٺيان"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "ساڄي" else "کاٻي"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "نماز موڊ چالو · پڄاڻي $saat"
    override val namazModuAcik = "نماز موڊ چالو"
    override val namazModuKapandi = "نماز موڊ بند ٿيو"
    override val namazModuTelefondaAcin = "فون تي نماز موڊ هڪ ڀيرو چالو ڪريو"
    override val telefonaUlasilamadi = "اوهان جي فون سان رابطو نه ٿي سگهيو"
    override val namazModuAcilamadi = "نماز موڊ چالو نه ٿي سگهيو. فون مان ڪوشش ڪريو"
    override val camiKaydedildi = "اوهان جو مسجد ۾ هجڻ محفوظ ٿيو"
    override val camiBirDahaSorulmaz = "هن نماز جي وقت ۾ ٻيهر نه پڇيو ويندو"
    override val camiSayilmaz = "هي جاءِ اڳتي مسجد شمار نه ٿيندي"
    override val soruGecersiz = "هي سوال هاڻي لاڳو ناهي"
    override val islemYapilamadi = "هي ڪم نه ٿي سگهيو. فون مان ڪوشش ڪريو"

    override val hoparlorYokBilgi = "اوهان جي واچ ۾ اسپيڪر ناهي؛ وڏي آواز ۾ پڙهڻ بدران صرف ٿرٿراهٽ ٿيندي."
    override val motorYokBilgi = "اوهان جي واچ ۾ متن پڙهڻ وارو انجڻ نه مليو؛ وڏي آواز ۾ پڙهڻ بدران صرف ٿرٿراهٽ ٿيندي."
    override val sesYokBilgi = "اوهان جي واچ ۾ سنڌي آواز ناهي؛ وڏي آواز ۾ پڙهڻ بدران صرف ٿرٿراهٽ ٿيندي."
    override val otomatikYerAciklamasi =
        "فون ويجهو هجي ته فون وڏي آواز ۾ پڙهي ٿو؛ واچ صرف فون پري هجڻ تي ڳالهائي ٿي. صرف اهي ياددهانيون پڙهيون وڃن ٿيون جن ۾ وڏي آواز ۾ پڙهڻ چالو هجي."
    override val saatYerAciklamasi = "اوهان جي واچ وڏي آواز ۾ پڙهي ٿي. صرف اهي ياددهانيون پڙهيون وڃن ٿيون جن ۾ وڏي آواز ۾ پڙهڻ چالو هجي."
    override val hoparlorYok = "واچ ۾ اسپيڪر ناهي"
    override val sesCalisti = "آواز هليو"
    override val motorYok = "متن پڙهڻ وارو انجڻ ناهي"
    override val sesYok = "سنڌي آواز ناهي"
    override val sesCalinamadi = "آواز هلي نه سگهيو"

    override fun vaktiCikiyor(ad: String) = "$ad جو وقت ختم ٿي رهيو آهي"
    override val tesbihatTamamlandi = "تسبيح پوري ٿي"
    override val toplam = "ڪل"
    override val zikirSubhanallah = "سبحان الله"
    override val zikirElhamdulillah = "الحمد لله"
    override val zikirAllahuEkber = "الله اڪبر"
    override val zikirTehlil = "لا اله الا الله"
    override val tehlilMetni = "لا اله الا الله وحده لا شريڪ له، له الملڪ وله الحمد وهو عليٰ ڪل شيءٍ قدير"
    override val tesbihatKaynagi = "صحيح مسلم، ڪتاب المساجد 146"
}

// pl
// CLDR pl: one = 1; few = …2–4 (…12–14 hariç); many = gerisi (0, 5–21, 25…) — JS `cogul.ts > lehce`; tarihte ay ilgi hâlinde.
// Terimler JS `sozluk/pl` (modlitwa, Allah, kişisiz "Odprawiono"); birimler `sure.kisa` (godz./min/sek.).
object SaatDiliPl : SaatDili {
    override val kod = "pl"

    private val ADLAR = mapOf(
        "imsak" to "Fadżr", "gunes" to "Wschód słońca", "ogle" to "Zuhr",
        "ikindi" to "Asr", "aksam" to "Maghrib", "yatsi" to "Isza",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "godz."
    override val birimDk = "min"
    override val birimSn = "sek."
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 min"
    /** CLDR pl (JS `cogul.ts > lehce`; tam sayı). */
    fun cogulKategorisi(n: Long): String {
        if (n == 1L) return "one"
        val s10 = n % 10L
        val s100 = n % 100L
        return if (s10 in 2L..4L && s100 !in 12L..14L) "few" else "many"
    }

    override fun saatSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n godzina"
        "few" -> "$n godziny"
        "many" -> "$n godzin"
        else -> "$n godziny"
    }
    override fun dakikaSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n minuta"
        "few" -> "$n minuty"
        "many" -> "$n minut"
        else -> "$n minuty"
    }
    override val birDakikadanAzSesli = "mniej niż minuta"

    override fun cikisaUzun(ad: String) = "$ad: koniec za"
    override fun cikisaAciklama(ad: String) = "Pozostało do końca czasu modlitwy $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} za"
    override fun giriseAciklama(ad: String) = "Pozostało do czasu modlitwy $ad"

    override val cikisBasligi = "Koniec"
    override val girisBasligi = "Początek"
    override fun cikisUzun(ad: String, saat: String) = "$ad: koniec $saat"
    override fun cikisAciklama(ad: String, saat: String) = "Czas modlitwy $ad kończy się o $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad: początek $saat"
    override fun girisAciklama(ad: String, saat: String) = "Czas modlitwy $ad zaczyna się o $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Następna: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Następna modlitwa $ad, początek o $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "do końca czasu" else "do początku czasu"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val sinir = if (mod == KalanSure.Mod.CIKIS) "końca" else "początku"
        return "Do $sinir czasu modlitwy $ad: $sure"
    }

    override val kilindiEki = ", odprawiona"
    override fun sonDakikaEki(dk: Int) = when (cogulKategorisi(dk.toLong())) {
        "one" -> ", ostatnia $dk minuta"
        "few" -> ", ostatnie $dk minuty"
        else -> ", ostatnich $dk minut"
    }
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Dziś odprawiono $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · ostatnie $dk min"
    override fun dugmeAciklamasi(ad: String) = "Oznacz modlitwę $ad jako odprawioną"
    override fun onaySorusuSatirlari(ad: String) = "Czy modlitwa" to "$ad odprawiona?"
    override val vakitDegisti = "Czas modlitwy się zmienił; nie oznaczono."
    override val kabulDuasi = "Niech Allah przyjmie"

    override val kibleHizali = "Kibla jest przed Tobą"
    override val kibleArkada = "Kibla jest za Tobą"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Kibla jest $adim° w ${if (sag) "prawo" else "lewo"}"
    override val donusArkada = "Za Tobą"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "W prawo" else "W lewo"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Tryb modlitwy wł. · koniec $saat"
    override val namazModuAcik = "Tryb modlitwy wł."
    override val namazModuKapandi = "Tryb modlitwy wyłączony"
    override val namazModuTelefondaAcin = "Włącz raz Tryb modlitwy na telefonie"
    override val telefonaUlasilamadi = "Telefon jest nieosiągalny"
    override val namazModuAcilamadi = "Nie udało się włączyć Trybu modlitwy. Spróbuj z telefonu"
    override val camiKaydedildi = "Zapisano pobyt w meczecie"
    override val camiBirDahaSorulmaz = "W tym czasie modlitwy pytanie się nie powtórzy"
    override val camiSayilmaz = "To miejsce nie będzie już liczone jako meczet"
    override val soruGecersiz = "To pytanie jest już nieaktualne"
    override val islemYapilamadi = "Nie udało się tego wykonać. Spróbuj z telefonu"

    override val hoparlorYokBilgi = "Zegarek nie ma głośnika; zamiast odczytu na głos będą tylko wibracje."
    override val motorYokBilgi = "Na zegarku nie znaleziono syntezatora mowy; zamiast odczytu na głos będą tylko wibracje."
    override val sesYokBilgi = "Zegarek nie ma polskiego głosu; zamiast odczytu na głos będą tylko wibracje."
    override val otomatikYerAciklamasi =
        "Gdy telefon jest przy Tobie, na głos czyta telefon; zegarek mówi tylko wtedy, gdy telefonu nie ma w pobliżu. Czytane są tylko przypomnienia z włączonym odczytem na głos."
    override val saatYerAciklamasi = "Na głos czyta zegarek. Czytane są tylko przypomnienia z włączonym odczytem na głos."
    override val hoparlorYok = "Zegarek nie ma głośnika"
    override val sesCalisti = "Dźwięk działa"
    override val motorYok = "Brak syntezatora mowy"
    override val sesYok = "Brak polskiego głosu"
    override val sesCalinamadi = "Nie udało się odtworzyć dźwięku"

    override fun vaktiCikiyor(ad: String) = "Czas modlitwy $ad się kończy"
    override val tesbihatTamamlandi = "Tasbih ukończony"
    override val toplam = "Łącznie"
    override val zikirSubhanallah = "Subhanallah"
    override val zikirElhamdulillah = "Alhamdulillah"
    override val zikirAllahuEkber = "Allahu akbar"
    override val zikirTehlil = "La ilaha illallah"
    override val tehlilMetni = "La ilaha illallahu wahdahu la szarika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli szaj’in kadir"
    override val tesbihatKaynagi = "Muslim, Masadżid 146"
}

// ja
// CLDR ja: yalnız other (JS `cogul.ts > hepDiger`); sayı ile birim BİTİŞİK (Çince gibi).
// Şablonlarda `${ad}` yazılır: kana/kanji Kotlin'de tanımlayıcıya yapışır ("$adまで" derlenmez).
object SaatDiliJa : SaatDili {
    override val kod = "ja"

    private val ADLAR = mapOf(
        "imsak" to "ファジュル", "gunes" to "日の出", "ogle" to "ズフル",
        "ikindi" to "アスル", "aksam" to "マグリブ", "yatsi" to "イシャー",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "時間"
    override val birimDk = "分"
    override val birimSn = "秒"
    override val birimAyirici = ""
    override val parcaAyirici = ""
    override val birDakikadanAzKisa = "<1分"
    override fun saatSesli(n: Long) = "${n}時間"
    override fun dakikaSesli(n: Long) = "${n}分"
    override val birDakikadanAzSesli = "1分未満"

    override fun cikisaUzun(ad: String) = "${ad}終了まで"
    override fun cikisaAciklama(ad: String) = "${ad}が終わるまでの残り時間"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)}まで"
    override fun giriseAciklama(ad: String) = "${ad}までの残り時間"

    override val cikisBasligi = "終了"
    override val girisBasligi = "開始"
    override fun cikisUzun(ad: String, saat: String) = "${ad} ${saat}終了"
    override fun cikisAciklama(ad: String, saat: String) = "${ad}は${saat}に終わります"
    override fun girisUzun(ad: String, saat: String) = "${ad} ${saat}開始"
    override fun girisAciklama(ad: String, saat: String) = "${ad}は${saat}に始まります"
    override fun siradakiUzun(ad: String, saat: String) = "次：${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "次の礼拝は${ad}、${saat}に始まります"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "終了まで" else "開始まで"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "終わります" else "始まります"
        return "${ad}は${sure}後に${fiil}"
    }

    override val kilindiEki = "、礼拝済み"
    override fun sonDakikaEki(dk: Int) = "、最後の${dk}分"
    override fun bugunEki(kilinan: Int, toplam: Int) = "。今日は${kilinan}/${toplam}礼拝済み"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad}・最後の${dk}分"
    override fun dugmeAciklamasi(ad: String) = "${ad}を礼拝済みにする"
    override fun onaySorusuSatirlari(ad: String) = "${ad}を" to "礼拝しましたか？"
    override val vakitDegisti = "礼拝時間が変わったため、記録されませんでした。"
    override val kabulDuasi = "アッラーが受け入れてくださいますように"

    override val kibleHizali = "キブラの方向を向いています"
    override val kibleArkada = "キブラは後ろです"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "キブラは${if (sag) "右" else "左"}に${adim}°です"
    override val donusArkada = "後ろ"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "右" else "左"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "礼拝モードオン・${saat}に終了"
    override val namazModuAcik = "礼拝モードオン"
    override val namazModuKapandi = "礼拝モードをオフにしました"
    override val namazModuTelefondaAcin = "先にスマートフォンで礼拝モードを一度オンにしてください"
    override val telefonaUlasilamadi = "スマートフォンに接続できません"
    override val namazModuAcilamadi = "礼拝モードをオンにできませんでした。スマートフォンからお試しください"
    override val camiKaydedildi = "モスクにいることを記録しました"
    override val camiBirDahaSorulmaz = "この礼拝時間には再び確認しません"
    override val camiSayilmaz = "この場所はモスクと見なされなくなります"
    override val soruGecersiz = "この質問は無効になりました"
    override val islemYapilamadi = "完了できませんでした。スマートフォンからお試しください"

    override val hoparlorYokBilgi = "ウォッチにスピーカーがないため、読み上げのお知らせは振動のみです。"
    override val motorYokBilgi = "ウォッチに音声読み上げエンジンが見つからないため、読み上げのお知らせは振動のみです。"
    override val sesYokBilgi = "ウォッチに日本語の音声がないため、読み上げのお知らせは振動のみです。"
    override val otomatikYerAciklamasi =
        "スマートフォンが手元にあるときはスマートフォンが読み上げ、離れているときだけウォッチが話します。読み上げがオンのリマインダーだけが読み上げられます。"
    override val saatYerAciklamasi = "ウォッチが読み上げます。読み上げがオンのリマインダーだけが読み上げられます。"
    override val hoparlorYok = "ウォッチにスピーカーがありません"
    override val sesCalisti = "音が鳴りました"
    override val motorYok = "音声読み上げエンジンがありません"
    override val sesYok = "日本語の音声がありません"
    override val sesCalinamadi = "音を再生できませんでした"

    override fun vaktiCikiyor(ad: String) = "${ad}がまもなく終わります"
    override val tesbihatTamamlandi = "タスビーフを終えました"
    override val toplam = "合計"
    override val zikirSubhanallah = "スブハーナッラー"
    override val zikirElhamdulillah = "アルハムドゥリッラー"
    override val zikirAllahuEkber = "アッラーフ・アクバル"
    override val zikirTehlil = "ラー・イラーハ・イッラッラー"
    override val tehlilMetni = "ラー・イラーハ・イッラッラーフ・ワハダフ・ラー・シャリーカ・ラフ、ラフル・ムルク・ワ・ラフル・ハムド・ワ・フワ・アラー・クッリ・シャイイン・カディール"
    override val tesbihatKaynagi = "ムスリム『サヒーフ』、モスク篇146"
}

// gu — Gucaratça (beta): JS `sozluk/gu` (vakit, sure, kible, samimiyet); "Kılındı" = "પઢી લીધી".
// CLDR gu: one = 0 ve 1, other (JS `cogul.ts > sifirBir`, Hintçe kuralı); birimler çoğulda değişmez.
// Gucarati harfleri Kotlin'de tanımlayıcıya yapışır: "$adનો" değil "${ad}નો".
object SaatDiliGu : SaatDili {
    override val kod = "gu"

    private val ADLAR = mapOf(
        "imsak" to "ફજર", "gunes" to "સૂર્યોદય", "ogle" to "ઝોહર",
        "ikindi" to "અસર", "aksam" to "મગરિબ", "yatsi" to "ઈશા",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ક"
    override val birimDk = "મિ"
    override val birimSn = "સે"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 મિ"
    override fun saatSesli(n: Long) = "$n કલાક"
    override fun dakikaSesli(n: Long) = "$n મિનિટ"
    override val birDakikadanAzSesli = "1 મિનિટથી ઓછો"

    override fun cikisaUzun(ad: String) = "${ad} પૂરી થવામાં"
    override fun cikisaAciklama(ad: String) = "${ad}નો સમય પૂરો થવામાં બાકી સમય"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} સુધી"
    override fun giriseAciklama(ad: String) = "${ad} સુધી બાકી સમય"

    override val cikisBasligi = "અંત"
    override val girisBasligi = "શરૂ"
    override fun cikisUzun(ad: String, saat: String) = "${ad} અંત ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "${ad}નો સમય ${saat} વાગ્યે પૂરો થાય છે"
    override fun girisUzun(ad: String, saat: String) = "${ad} શરૂ ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "${ad}નો સમય ${saat} વાગ્યે શરૂ થાય છે"
    override fun siradakiUzun(ad: String, saat: String) = "આગામી: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "આગામી નમાઝ ${ad}, ${saat} વાગ્યે શરૂ"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "પૂરો થવામાં" else "શરૂ થવામાં"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "પૂરો થવામાં" else "શરૂ થવામાં"
        return "${ad}નો સમય ${fiil} ${sure}"
    }

    override val kilindiEki = ", પઢી લીધી"
    override fun sonDakikaEki(dk: Int) = ", છેલ્લી ${dk} મિનિટ"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". આજે ${kilinan}/${toplam} પઢી"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · છેલ્લી ${dk} મિ"
    override fun dugmeAciklamasi(ad: String) = "${ad} પઢી લીધી તરીકે નોંધો"
    override fun onaySorusuSatirlari(ad: String) = "શું તમે ${ad}ની નમાઝ" to "પઢી લીધી?"
    override val vakitDegisti = "નમાઝનો સમય બદલાયો; નોંધાયું નથી."
    override val kabulDuasi = "અલ્લાહ કબૂલ કરે"

    override val kibleHizali = "તમે કિબ્લા તરફ છો"
    override val kibleArkada = "કિબ્લા તમારી પાછળ છે"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "કિબ્લા તમારી ${if (sag) "જમણી" else "ડાબી"} બાજુ ${adim}° પર છે"
    override val donusArkada = "પાછળ"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "જમણે" else "ડાબે"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "નમાઝ મોડ ચાલુ · અંત ${saat}"
    override val namazModuAcik = "નમાઝ મોડ ચાલુ"
    override val namazModuKapandi = "નમાઝ મોડ બંધ થયો"
    override val namazModuTelefondaAcin = "તમારા ફોન પર નમાઝ મોડ એક વાર ચાલુ કરો"
    override val telefonaUlasilamadi = "તમારા ફોન સુધી પહોંચી શકાતું નથી"
    override val namazModuAcilamadi = "નમાઝ મોડ ચાલુ થઈ શક્યો નહીં. તમારા ફોનથી પ્રયાસ કરો"
    override val camiKaydedildi = "તમે મસ્જિદમાં છો તે નોંધાયું"
    override val camiBirDahaSorulmaz = "આ નમાઝના સમય માટે ફરી પૂછાશે નહીં"
    override val camiSayilmaz = "આ જગ્યા હવે મસ્જિદ નહીં ગણાય"
    override val soruGecersiz = "આ પ્રશ્ન હવે માન્ય નથી"
    override val islemYapilamadi = "આ પૂરું થઈ શક્યું નહીં. તમારા ફોનથી પ્રયાસ કરો"

    override val hoparlorYokBilgi = "તમારી ઘડિયાળમાં સ્પીકર નથી; મોટેથી વાંચનને બદલે ફક્ત વાઇબ્રેશન થાય છે."
    override val motorYokBilgi = "તમારી ઘડિયાળમાં લખાણ-થી-અવાજ એન્જિન મળ્યું નથી; મોટેથી વાંચનને બદલે ફક્ત વાઇબ્રેશન થાય છે."
    override val sesYokBilgi = "તમારી ઘડિયાળમાં ગુજરાતી અવાજ નથી; મોટેથી વાંચનને બદલે ફક્ત વાઇબ્રેશન થાય છે."
    override val otomatikYerAciklamasi =
        "ફોન તમારી પાસે હોય ત્યારે ફોન મોટેથી વાંચે છે; ઘડિયાળ ફક્ત ફોન દૂર હોય ત્યારે બોલે છે. ફક્ત મોટેથી વાંચન ચાલુ હોય તેવાં રિમાઇન્ડર વંચાય છે."
    override val saatYerAciklamasi = "તમારી ઘડિયાળ મોટેથી વાંચે છે. ફક્ત મોટેથી વાંચન ચાલુ હોય તેવાં રિમાઇન્ડર વંચાય છે."
    override val hoparlorYok = "ઘડિયાળમાં સ્પીકર નથી"
    override val sesCalisti = "અવાજ વાગ્યો"
    override val motorYok = "લખાણ-થી-અવાજ એન્જિન નથી"
    override val sesYok = "ગુજરાતી અવાજ નથી"
    override val sesCalinamadi = "અવાજ વાગી શક્યો નહીં"

    override fun vaktiCikiyor(ad: String) = "${ad}નો સમય પૂરો થાય છે"
    override val tesbihatTamamlandi = "તસ્બીહ પૂરી થઈ"
    override val toplam = "કુલ"
    override val zikirSubhanallah = "સુબ્હાનલ્લાહ"
    override val zikirElhamdulillah = "અલ્હમ્દુલિલ્લાહ"
    override val zikirAllahuEkber = "અલ્લાહુ અકબર"
    override val zikirTehlil = "લા ઇલાહ ઇલ્લલ્લાહ"
    override val tehlilMetni = "લા ઇલાહ ઇલ્લલ્લાહુ વહ્દહુ લા શરીક લહુ, લહુલ મુલ્કુ વ લહુલ હમ્દુ વ હુવ અલા કુલ્લિ શૈઇન કદીર"
    override val tesbihatKaynagi = "સહીહ મુસ્લિમ, કિતાબુલ મસાજિદ 146"
}

// bg
// CLDR bg: one/other (JS `cogul.ts > birDiger`); Kiril; terimler JS `sozluk/bg` (Başmüftülük vakit kutusu).
// Kiril harfi Kotlin'de tanımlayıcı karakteridir: şablonda hep `${ad}` yazılır.
object SaatDiliBg : SaatDili {
    override val kod = "bg"

    private val ADLAR = mapOf(
        "imsak" to "Зора", "gunes" to "Изгрев", "ogle" to "Обяд",
        "ikindi" to "Следобяд", "aksam" to "Залез", "yatsi" to "Нощ",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ч"
    override val birimDk = "мин"
    override val birimSn = "с"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 мин"
    override fun saatSesli(n: Long) = if (n == 1L) "1 час" else "${n} часа"
    override fun dakikaSesli(n: Long) = if (n == 1L) "1 минута" else "${n} минути"
    override val birDakikadanAzSesli = "по-малко от 1 минута"

    override fun cikisaUzun(ad: String) = "${ad} свършва след"
    override fun cikisaAciklama(ad: String) = "Оставащо време до края на ${ad}"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} след"
    override fun giriseAciklama(ad: String) = "Оставащо време до ${ad}"

    override val cikisBasligi = "Край"
    override val girisBasligi = "Начало"
    override fun cikisUzun(ad: String, saat: String) = "${ad} свършва в ${saat}"
    override fun cikisAciklama(ad: String, saat: String) = "${ad} свършва в ${saat}"
    override fun girisUzun(ad: String, saat: String) = "${ad} започва в ${saat}"
    override fun girisAciklama(ad: String, saat: String) = "${ad} започва в ${saat}"
    override fun siradakiUzun(ad: String, saat: String) = "Следва: ${ad} ${saat}"
    override fun siradakiAciklama(ad: String, saat: String) = "Следващ намаз ${ad}, започва в ${saat}"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "до края" else "до началото"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "свършва" else "започва"
        return "${ad} ${fiil} след ${sure}"
    }

    override val kilindiEki = ", изпълнен"
    override fun sonDakikaEki(dk: Int) = if (dk == 1) ", последната 1 минута" else ", последните ${dk} минути"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Днес изпълнени ${kilinan}/${toplam}"
    override fun acilAdSatiri(ad: String, dk: Int) = "${ad} · последни ${dk} мин"
    override fun dugmeAciklamasi(ad: String) = "Отбележете ${ad} като изпълнен"
    override fun onaySorusuSatirlari(ad: String) = "Изпълнихте ли" to "${ad}?"
    override val vakitDegisti = "Времето за намаз се смени; не е отбелязано."
    override val kabulDuasi = "Аллах да приеме"

    override val kibleHizali = "Обърнати сте към киблята"
    override val kibleArkada = "Киблята е зад вас"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Киблята е на ${adim}° ${if (sag) "вдясно" else "вляво"} от вас"
    override val donusArkada = "Зад вас"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Вдясно" else "Вляво"} ${adim}°"

    override fun namazModuAcikBitis(saat: String) = "Режим „Намаз“ е вкл. · до ${saat}"
    override val namazModuAcik = "Режим „Намаз“ е вкл."
    override val namazModuKapandi = "Режимът „Намаз“ е изключен"
    override val namazModuTelefondaAcin = "Включете режим „Намаз“ веднъж на телефона"
    override val telefonaUlasilamadi = "Телефонът ви е недостъпен"
    override val namazModuAcilamadi = "Режимът „Намаз“ не можа да се включи. Опитайте от телефона"
    override val camiKaydedildi = "Записано е, че сте в джамията"
    override val camiBirDahaSorulmaz = "Няма да бъдете питани отново за това време за намаз"
    override val camiSayilmaz = "Това място вече няма да се брои за джамия"
    override val soruGecersiz = "Този въпрос вече не е валиден"
    override val islemYapilamadi = "Това не можа да се изпълни. Опитайте от телефона"

    override val hoparlorYokBilgi = "Часовникът ви няма високоговорител; известията на глас само вибрират."
    override val motorYokBilgi = "На часовника не е открит синтезатор на реч; известията на глас само вибрират."
    override val sesYokBilgi = "Часовникът няма български глас; известията на глас само вибрират."
    override val otomatikYerAciklamasi =
        "Когато телефонът е с вас, той чете на глас; часовникът говори само когато телефонът е далеч. Четат се само напомнянията с включено четене на глас."
    override val saatYerAciklamasi = "Часовникът чете на глас. Четат се само напомнянията с включено четене на глас."
    override val hoparlorYok = "Часовникът няма високоговорител"
    override val sesCalisti = "Звукът работи"
    override val motorYok = "Няма синтезатор на реч"
    override val sesYok = "Няма български глас"
    override val sesCalinamadi = "Звукът не можа да се възпроизведе"

    override fun vaktiCikiyor(ad: String) = "Времето за ${ad} изтича"
    override val tesbihatTamamlandi = "Тесбихът е завършен"
    override val toplam = "Общо"
    override val zikirSubhanallah = "Субханаллах"
    override val zikirElhamdulillah = "Елхамдулиллях"
    override val zikirAllahuEkber = "Аллаху екбер"
    override val zikirTehlil = "Ля иляхе илляллах"
    override val tehlilMetni = "Ля иляхе илляллаху вахдеху ля шерике лех, лехул-мулку ве лехул-хамду ве хуве аля кулли шей’ин кадир"
    override val tesbihatKaynagi = "Муслим, Месаджид 146"
}

// mk
// CLDR mk: one = …1 (…11 hariç), other — JS `cogul.ts > makedonca`; Kiril (ѓ ќ ѕ).
object SaatDiliMk : SaatDili {
    override val kod = "mk"

    private val ADLAR = mapOf(
        "imsak" to "Сабах", "gunes" to "Изгрејсонце", "ogle" to "Пладне",
        "ikindi" to "Икиндија", "aksam" to "Акшам", "yatsi" to "Јација",
    )

    override fun vakitAdi(vakit: String) = ADLAR[vakit] ?: vakit

    override val birimSa = "ч"
    override val birimDk = "мин"
    override val birimSn = "с"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override val birDakikadanAzKisa = "<1 мин"
    /** CLDR mk (JS `cogul.ts > makedonca`; tam sayı). */
    fun cogulKategorisi(n: Long): String {
        return if (n % 10L == 1L && n % 100L != 11L) "one" else "other"
    }

    override fun saatSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n час"
        else -> "$n часа"
    }
    override fun dakikaSesli(n: Long) = when (cogulKategorisi(n)) {
        "one" -> "$n минута"
        else -> "$n минути"
    }
    override val birDakikadanAzSesli = "помалку од 1 минута"

    override fun cikisaUzun(ad: String) = "$ad истекува за"
    override fun cikisaAciklama(ad: String) = "Преостанато време до истекот: $ad"
    override fun giriseKisa(vakit: String) = vakitAdi(vakit)
    override fun giriseUzun(vakit: String) = "${vakitAdi(vakit)} за"
    override fun giriseAciklama(ad: String) = "Преостанато време до настапувањето: $ad"

    override val cikisBasligi = "Истекува"
    override val girisBasligi = "Настапува"
    override fun cikisUzun(ad: String, saat: String) = "$ad истекува $saat"
    override fun cikisAciklama(ad: String, saat: String) = "$ad: времето истекува во $saat"
    override fun girisUzun(ad: String, saat: String) = "$ad настапува $saat"
    override fun girisAciklama(ad: String, saat: String) = "$ad: времето настапува во $saat"
    override fun siradakiUzun(ad: String, saat: String) = "Следен: $ad $saat"
    override fun siradakiAciklama(ad: String, saat: String) = "Следен намаз: $ad, настапува во $saat"

    override fun altYazi(mod: KalanSure.Mod) =
        if (mod == KalanSure.Mod.CIKIS) "до истекот" else "до настапувањето"

    override fun sayacAciklamasi(ad: String, mod: KalanSure.Mod, sure: String): String {
        val fiil = if (mod == KalanSure.Mod.CIKIS) "истекува" else "настапува"
        return "$ad: времето $fiil за $sure"
    }

    override val kilindiEki = ", клањано"
    override fun sonDakikaEki(dk: Int) = ", уште $dk мин"
    override fun bugunEki(kilinan: Int, toplam: Int) = ". Денес клањано $kilinan/$toplam"
    override fun acilAdSatiri(ad: String, dk: Int) = "$ad · уште $dk мин"
    override fun dugmeAciklamasi(ad: String) = "Означете го намазот ($ad) како клањан"

    /** Ada hâl eki üretilmez (çekimsiz ad): ad ilk satırda, soru ikinci satırda. */
    override fun onaySorusuSatirlari(ad: String) = "$ad:" to "дали клањавте?"
    override val vakitDegisti = "Времето за намаз се промени; не е означено."
    override val kabulDuasi = "Аллах нека прими"

    override val kibleHizali = "Свртени сте кон киблата"
    override val kibleArkada = "Киблата е зад вас"
    override fun kibleTarafta(adim: Int, sag: Boolean) = "Киблата е $adim° ${if (sag) "десно" else "лево"} од вас"
    override val donusArkada = "Зад вас"
    override fun donus(adim: Int, sag: Boolean) = "${if (sag) "Десно" else "Лево"} $adim°"

    override fun namazModuAcikBitis(saat: String) = "Режим за намаз вклучен · до $saat"
    override val namazModuAcik = "Режим за намаз вклучен"
    override val namazModuKapandi = "Режимот за намаз е исклучен"
    override val namazModuTelefondaAcin = "Вклучете го Режимот за намаз еднаш на телефонот"
    override val telefonaUlasilamadi = "Вашиот телефон не е достапен"
    override val namazModuAcilamadi = "Режимот за намаз не е вклучен. Обидете се од телефонот"
    override val camiKaydedildi = "Забележано е дека сте во џамија"
    override val camiBirDahaSorulmaz = "За ова време за намаз повеќе нема да бидете прашани"
    override val camiSayilmaz = "Ова место повеќе нема да се смета за џамија"
    override val soruGecersiz = "Ова прашање повеќе не важи"
    override val islemYapilamadi = "Дејството не е извршено. Обидете се од телефонот"

    override val hoparlorYokBilgi = "Вашиот часовник нема звучник; известувањата за читање на глас само вибрираат."
    override val motorYokBilgi = "На вашиот часовник не е пронајден систем за читање текст; известувањата за читање на глас само вибрираат."
    override val sesYokBilgi = "На вашиот часовник нема турски глас; известувањата за читање на глас само вибрираат."
    override val otomatikYerAciklamasi =
        "Кога телефонот е кај вас, чита телефонот; часовникот зборува само кога телефонот е далеку. Се читаат само потсетниците со вклучено читање на глас."
    override val saatYerAciklamasi = "Читањето на глас го врши вашиот часовник. Се читаат само потсетниците со вклучено читање на глас."
    override val hoparlorYok = "Вашиот часовник нема звучник"
    override val sesCalisti = "Звукот работи"
    override val motorYok = "Нема систем за читање текст"
    override val sesYok = "Нема турски глас"
    override val sesCalinamadi = "Звукот не можеше да се пушти"

    override fun vaktiCikiyor(ad: String) = "$ad: времето истекува"
    override val tesbihatTamamlandi = "Тесбихот е завршен"
    override val toplam = "Вкупно"
    override val zikirSubhanallah = "Субханаллах"
    override val zikirElhamdulillah = "Елхамдулиллах"
    override val zikirAllahuEkber = "Аллаху екбер"
    override val zikirTehlil = "Ла илахе иллаллах"
    override val tehlilMetni = "Ла илахе иллаллаху вахдеху ла шерике лех, лехул-мулку ве лехул-хамду ве хуве ала кулли шеј'ин кадир"
    override val tesbihatKaynagi = "Муслим, Месаџид 146"
}
