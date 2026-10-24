package com.furkanisikay.namazakisi.cekirdek

/**
 * Tasker / MacroDroid / Automate eklentisi (issue #278) — SAF kurallar
 * (JVM testi: OtomasyonKurallariTest). Android import ETMEZ.
 *
 * PROTOKOL KENDİMİZ YAZILDI: Locale eklenti protokolü ve Tasker'ın uzantıları
 * BELGELERDEN uygulanır; `com.joaomgcd:taskerpluginlibrary` (GPL) ve örnek kodlar
 * KULLANILMAZ, kopyalanmaz (AGENTS.md lisans sınırı). Aşağıdaki dizeler protokolün
 * kendisidir (eylem/ek adları), kod değil.
 *
 * GÜVENLİK MODELİ: FIRE_SETTING / QUERY_CONDITION yayınlarının GÖNDERENİ bilinemez
 * (BroadcastReceiver'da `getReferrer` yok). Bu yüzden eklenti paketi yalnız BİZİM
 * düzenleme etkinliğimizden çıkar ve içinde o otomasyon uygulamasına (paket başına)
 * üretilmiş rastgele bir GİZLİ BELİRTEÇ taşır. Düzenleme etkinliği `startActivityForResult`
 * ile açıldığı için çağıranı (`callingPackage`) kesin bilir ve güven listesine
 * (`KildimGuvenKurallari`, issue #299) sorar. Yayın geldiğinde: paket biçimi geçerli,
 * belirteç o pakete verilenle AYNI ve paket güven listesinde hâlâ "izin" → işlenir.
 * Başka bir uygulama rastgele yayınla işaretleyemez; kullanıcı uygulamayı Ayarlar'dan
 * engellerse ya da kaldırırsa eski paketler kendiliğinden geçersizleşir.
 */
object OtomasyonProtokolu {
    // --- Locale (twofortyfouram) eklenti protokolü ---
    const val AYAR_DUZENLE = "com.twofortyfouram.locale.intent.action.EDIT_SETTING"
    const val AYAR_CALISTIR = "com.twofortyfouram.locale.intent.action.FIRE_SETTING"
    const val KOSUL_DUZENLE = "com.twofortyfouram.locale.intent.action.EDIT_CONDITION"
    const val KOSUL_SORGULA = "com.twofortyfouram.locale.intent.action.QUERY_CONDITION"
    const val SORGU_ISTE = "com.twofortyfouram.locale.intent.action.REQUEST_QUERY"
    const val EK_PAKET = "com.twofortyfouram.locale.intent.extra.BUNDLE"
    const val EK_OZET = "com.twofortyfouram.locale.intent.extra.BLURB"
    const val EK_ETKINLIK = "com.twofortyfouram.locale.intent.extra.ACTIVITY"
    const val SONUC_SAGLANDI = 16
    const val SONUC_SAGLANMADI = 17
    const val SONUC_BILINMIYOR = 18

    // --- Tasker uzantıları ---
    /** Olay (event) eklentisinin düzenleme eylemi — koşuldan ayrı etkinlik. */
    const val TASKER_OLAY_DUZENLE = "net.dinglisch.android.tasker.ACTION_EDIT_EVENT"
    /** Sorgu sonucunun ek'lerinde döndürülen değişken paketi. */
    const val TASKER_DEGISKENLER = "net.dinglisch.android.tasker.extras.VARIABLES"
    /** Düzenleme sonucunda "bu eklenti şu değişkenleri verir" listesi. */
    const val TASKER_ILGILI_DEGISKENLER = "net.dinglisch.android.tasker.RELEVANT_VARIABLES"
    /** REQUEST_QUERY → QUERY_CONDITION arasında olduğu gibi geri gelen veri paketi. */
    const val TASKER_GECIS_VERISI = "net.dinglisch.android.tasker.extras.PASS_THROUGH_DATA"
    const val TASKER_MESAJ_KIMLIGI = "net.dinglisch.android.tasker.MESSAGE_ID"
}

enum class OtomasyonOlayi(val kod: String) {
    VAKIT_GIRDI("girdi"),
    VAKIT_CIKIYOR("cikiyor"),
    CAMIDE("camide");

    companion object {
        fun koddan(kod: String?): OtomasyonOlayi? = values().firstOrNull { it.kod == kod }
    }
}

/** DURUM: Locale/MacroDroid koşulu (sürekli doğru/yanlış). OLAY: Tasker olayı (an). */
enum class KosulKipi(val kod: String) {
    DURUM("durum"),
    OLAY("olay");

    companion object {
        fun koddan(kod: String?): KosulKipi? = values().firstOrNull { it.kod == kod }
    }
}

/** Eklenti paketinin (Locale `EXTRA_BUNDLE`) çözülmüş hâli. */
sealed class EklentiAyari {
    abstract val paket: String
    abstract val belirtec: String

    data class Kildim(override val paket: String, override val belirtec: String) : EklentiAyari()

    /** @param vakit widget kodu (`sabah`, `ogle`…); `null` = herhangi bir vakit. */
    data class Kosul(
        override val paket: String,
        override val belirtec: String,
        val kip: KosulKipi,
        val olay: OtomasyonOlayi,
        val vakit: String?,
    ) : EklentiAyari()
}

/** Gönderilmiş bir olayın kaydı: sorgu geldiğinde mesaj kimliğiyle bulunur. */
data class OtomasyonOlayKaydi(
    val mesajId: Int,
    val olay: OtomasyonOlayi,
    /** Widget kodu (`sabah`…); camide olayında bilinmeyebilir. */
    val vakit: String?,
    val tarih: String?,
    val zamanMs: Long,
    val kalanDk: Int? = null,
    val camiAdi: String? = null,
)

/** "Camidesiniz" hâli (Camideyim modülünün yayınından). */
data class CamideDurumu(val ad: String, val vakit: String?, val tarih: String?, val bitisMs: Long)

data class SorguSonucu(val kod: Int, val degiskenler: Map<String, String> = emptyMap())

object OtomasyonKurallari {
    const val SURUM = "1"

    // Paket anahtarları — yalnız String değer (Locale: paket ilkel türler taşımalı).
    const val A_SURUM = "com.furkanisikay.namazakisi.otomasyon.SURUM"
    const val A_TUR = "com.furkanisikay.namazakisi.otomasyon.TUR"
    const val A_PAKET = "com.furkanisikay.namazakisi.otomasyon.PAKET"
    const val A_BELIRTEC = "com.furkanisikay.namazakisi.otomasyon.BELIRTEC"
    const val A_KIP = "com.furkanisikay.namazakisi.otomasyon.KIP"
    const val A_OLAY = "com.furkanisikay.namazakisi.otomasyon.OLAY"
    const val A_VAKIT = "com.furkanisikay.namazakisi.otomasyon.VAKIT"

    private const val TUR_KILDIM = "kildim"
    private const val TUR_KOSUL = "kosul"

    /** 32 bayt rastgele → 64 onaltılık karakter. */
    const val BELIRTEC_UZUNLUGU = 64
    private val BELIRTEC_DESENI = Regex("^[0-9a-f]{$BELIRTEC_UZUNLUGU}$")

    /** "Vakit çıkıyor": vaktin çıkmasına en çok bu kadar kala gelen ilk muhafız uyarısı. */
    const val CIKIYOR_ESIK_DK = 45

    /**
     * "Vakit girdi" olayı ancak giriş bu kadar yeni ise gönderilir. Sınır alarmı
     * uyandırmaz (RTC); cihaz uyurken saatlerce gecikmiş bir "vakit girdi" yanıltır.
     */
    const val GIRDI_TAZELIK_MS = 30 * 60_000L

    /** Gönderilen olay sorguya bu süre boyunca açıktır. */
    const val OLAY_OMRU_MS = 10 * 60_000L
    const val OLAY_KAYIT_SINIRI = 10

    // Tasker değişkenleri (yerel: küçük harf, ≥3 karakter).
    const val D_VAKIT = "%vakit"
    const val D_VAKIT_KODU = "%vakitkodu"
    const val D_TARIH = "%tarih"
    const val D_KALAN_DK = "%kalandk"
    const val D_CAMI = "%cami"

    fun belirtecBicimiGecerliMi(b: String?): Boolean = b != null && BELIRTEC_DESENI.matches(b)

    /** Sabit zamanlı karşılaştırma — belirteç zamanlamayla tahmin edilemesin. */
    fun belirtecEsitMi(gelen: String?, saklanan: String?): Boolean {
        if (!belirtecBicimiGecerliMi(gelen) || !belirtecBicimiGecerliMi(saklanan)) return false
        var fark = 0
        for (i in 0 until BELIRTEC_UZUNLUGU) fark = fark or (gelen!![i].code xor saklanan!![i].code)
        return fark == 0
    }

    /**
     * Yayın işlenebilir mi? Belirteç o pakete verilenle aynı VE paket güven
     * listesinde hâlâ "izin". Engellenen/kaldırılan uygulamanın eski paketi düşer.
     */
    fun yetkiliMi(ayar: EklentiAyari, saklananBelirtec: String?, karar: KildimGuvenKurallari.Karar?): Boolean =
        karar == KildimGuvenKurallari.Karar.IZIN && belirtecEsitMi(ayar.belirtec, saklananBelirtec)

    /** Düzenleme etkinliğinin çağırana göre ne yapacağı. */
    enum class DuzenlemeEylemi { KAYDET, SOR, ENGELLI, REDDET }

    /**
     * Kendi paketimiz ve kimliği bilinmeyen çağıran (`startActivity` ile açılmış,
     * `callingPackage` yok) için belirteç ÜRETİLMEZ. Tarayıcıya kalıcı izin yok
     * (issue #299 kuralı) → reddedilir.
     */
    fun duzenlemeEylemi(sinif: KildimGuvenKurallari.KaynakSinifi, kayitli: KildimGuvenKurallari.Karar?): DuzenlemeEylemi =
        when (sinif) {
            KildimGuvenKurallari.KaynakSinifi.UYGULAMA, KildimGuvenKurallari.KaynakSinifi.ANA_EKRAN -> when (kayitli) {
                KildimGuvenKurallari.Karar.IZIN -> DuzenlemeEylemi.KAYDET
                KildimGuvenKurallari.Karar.ENGEL -> DuzenlemeEylemi.ENGELLI
                null -> DuzenlemeEylemi.SOR
            }
            else -> DuzenlemeEylemi.REDDET
        }

    // --- Paket ↔ model ---------------------------------------------------------------

    fun paketeYaz(ayar: EklentiAyari): Map<String, String> {
        val m = linkedMapOf(A_SURUM to SURUM, A_PAKET to ayar.paket, A_BELIRTEC to ayar.belirtec)
        when (ayar) {
            is EklentiAyari.Kildim -> m[A_TUR] = TUR_KILDIM
            is EklentiAyari.Kosul -> {
                m[A_TUR] = TUR_KOSUL
                m[A_KIP] = ayar.kip.kod
                m[A_OLAY] = ayar.olay.kod
                if (ayar.vakit != null) m[A_VAKIT] = ayar.vakit
            }
        }
        return m
    }

    /**
     * Dışarıdan gelen paketi doğrular. Değerler `String` olmalı (tür sızdırılamaz),
     * boyutlar sınırlı. Geçersiz her şey `null` — asla fırlatmaz.
     */
    fun paketOku(m: Map<String, Any?>?): EklentiAyari? {
        if (m == null) return null
        fun s(k: String): String? = (m[k] as? String)?.takeIf { it.length <= 256 }
        if (s(A_SURUM) != SURUM) return null
        val paket = s(A_PAKET)?.takeIf { KildimGuvenKurallari.paketGecerliMi(it) } ?: return null
        val belirtec = s(A_BELIRTEC)?.takeIf { belirtecBicimiGecerliMi(it) } ?: return null
        return when (s(A_TUR)) {
            TUR_KILDIM -> EklentiAyari.Kildim(paket, belirtec)
            TUR_KOSUL -> {
                val kip = KosulKipi.koddan(s(A_KIP)) ?: return null
                val olay = OtomasyonOlayi.koddan(s(A_OLAY)) ?: return null
                val vakit = m[A_VAKIT]?.let { v -> (v as? String)?.takeIf { it in VakitKodlari.KILINABILIR } ?: return null }
                // Camide olayında vakit süzgeci anlamsız: kabul edilir ama yok sayılır.
                EklentiAyari.Kosul(paket, belirtec, kip, olay, if (olay == OtomasyonOlayi.CAMIDE) null else vakit)
            }
            else -> null
        }
    }

    // --- Görünen metinler (Tasker/MacroDroid listesinde "blurb") — kibar "siz" ---------
    // Özet düzenleme anında host'a yazılır (host saklar); dil değişince eski özet kalır,
    // eklenti yeniden düzenlenince yenilenir. Değişken ADLARI kimliktir, çevrilmez.

    fun ozet(ayar: EklentiAyari, dil: String = MetinDili.TR): String = when (ayar) {
        is EklentiAyari.Kildim -> MetinDili.sec(dil, "Şu anki vakti kılındı olarak işaretle", "Mark the current prayer as prayed")
        is EklentiAyari.Kosul -> {
            val ad = ayar.vakit?.let { VakitKodlari.gorunenAd(it, dil) }
            when (ayar.olay) {
                OtomasyonOlayi.VAKIT_GIRDI -> when {
                    ayar.kip == KosulKipi.OLAY ->
                        if (ad != null) MetinDili.sec(dil, "$ad vakti girdiğinde", "When $ad time begins")
                        else MetinDili.sec(dil, "Bir vakit girdiğinde", "When a prayer time begins")
                    ad != null -> MetinDili.sec(dil, "$ad vakti içindeyken", "While it's $ad time")
                    else -> MetinDili.sec(dil, "Bir vakit içindeyken", "While it's a prayer time")
                }
                OtomasyonOlayi.VAKIT_CIKIYOR -> MetinDili.sec(
                    dil,
                    (if (ad != null) "$ad vakti çıkıyor" else "Vakit çıkıyor") + " ($CIKIYOR_ESIK_DK dk kala)",
                    (if (ad != null) "$ad time is ending" else "Prayer time is ending") + " ($CIKIYOR_ESIK_DK min left)",
                )
                OtomasyonOlayi.CAMIDE ->
                    if (ayar.kip == KosulKipi.OLAY) MetinDili.sec(dil, "Camide olduğunuz algılandığında", "When you're detected at a mosque")
                    else MetinDili.sec(dil, "Camideyken", "While at a mosque")
            }
        }
    }

    /** Tasker'ın değişken seçicisi: "%ad\nEtiket\nAçıklama". */
    fun ilgiliDegiskenler(olay: OtomasyonOlayi, dil: String = MetinDili.TR): Array<String> {
        val ortak = listOf(
            "$D_VAKIT\n" + MetinDili.sec(dil, "Vakit\nVaktin adı (ör. Öğle)", "Prayer\nPrayer name (e.g. Dhuhr)"),
            "$D_VAKIT_KODU\n" + MetinDili.sec(
                dil,
                "Vakit kodu\nsabah, ogle, ikindi, aksam ya da yatsi",
                "Prayer code\nsabah, ogle, ikindi, aksam or yatsi",
            ),
            "$D_TARIH\n" + MetinDili.sec(
                dil,
                "Namaz günü\nYYYY-AA-GG; gece yarısından sonraki yatsı bir önceki güne aittir",
                "Prayer day\nYYYY-MM-DD; Isha after midnight belongs to the previous day",
            ),
        )
        return when (olay) {
            OtomasyonOlayi.VAKIT_GIRDI -> ortak
            OtomasyonOlayi.VAKIT_CIKIYOR -> ortak + ("$D_KALAN_DK\n" + MetinDili.sec(
                dil,
                "Kalan dakika\nVaktin çıkmasına kalan dakika",
                "Minutes left\nMinutes left until the prayer time ends",
            ))
            OtomasyonOlayi.CAMIDE -> ortak + ("$D_CAMI\n" + MetinDili.sec(dil, "Cami\nAlgılanan caminin adı", "Mosque\nName of the detected mosque"))
        }.toTypedArray()
    }

    /** `%vakit` arayüz dilindeki görünen addır; `%vakitkodu` dilden bağımsız kimliktir. */
    private fun vakitDegiskenleri(vakit: String?, tarih: String?, dil: String): Map<String, String> {
        val m = linkedMapOf<String, String>()
        if (vakit != null) {
            m[D_VAKIT] = VakitKodlari.gorunenAd(vakit, dil)
            m[D_VAKIT_KODU] = vakit
        }
        if (tarih != null) m[D_TARIH] = tarih
        return m
    }

    // --- Sorgu değerlendirmesi ---------------------------------------------------------

    /**
     * DURUM kipi (Locale/MacroDroid/Automate koşulu, Tasker "State").
     * @param durum widget çizelgesinden hesaplanan anlık vakit durumu
     * @param sonCikiyor son "vakit çıkıyor" olayının kimliği (`<tarih>_<widgetKodu>`)
     * @param veriVar widget vakit verisi var mı (yoksa vakit soruları BİLİNMİYOR)
     */
    fun durumuDegerlendir(
        kosul: EklentiAyari.Kosul,
        durum: VakitDurumu,
        veriVar: Boolean,
        sonCikiyor: String?,
        camide: CamideDurumu?,
        simdiMs: Long,
        dil: String = MetinDili.TR,
    ): SorguSonucu {
        if (kosul.olay == OtomasyonOlayi.CAMIDE) {
            val c = camide?.takeIf { it.bitisMs > simdiMs } ?: return SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANMADI)
            val vakit = c.vakit?.let { VakitKodlari.widgetKodu(it) }
            return SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANDI, vakitDegiskenleri(vakit, c.tarih, dil) + (D_CAMI to c.ad))
        }
        if (!veriVar) return SorguSonucu(OtomasyonProtokolu.SONUC_BILINMIYOR)
        val aktif = durum.aktif
        val bitis = durum.bitisMs
        if (aktif == null || bitis == null || (kosul.vakit != null && kosul.vakit != aktif.kod)) {
            return SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANMADI)
        }
        val degiskenler = vakitDegiskenleri(aktif.kod, aktif.tarih, dil)
        return when (kosul.olay) {
            OtomasyonOlayi.VAKIT_GIRDI -> SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANDI, degiskenler)
            // Olayla AYNI an: "çıkıyor" ancak muhafız o vakit için ilk uyarıyı verdiyse doğrudur
            // (bkz. [cikiyorOlayi]) — ikinci bir zamanlama kuralı yok, ikisi ayrışmasın.
            OtomasyonOlayi.VAKIT_CIKIYOR ->
                if (sonCikiyor == kildimKimligi(aktif.tarih, aktif.kod)) {
                    val kalan = ((bitis - simdiMs).coerceAtLeast(0L) / 60_000L).toInt()
                    SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANDI, degiskenler + (D_KALAN_DK to kalan.toString()))
                } else {
                    SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANMADI)
                }
            OtomasyonOlayi.CAMIDE -> SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANMADI)
        }
    }

    /**
     * OLAY kipi (Tasker "Event"). Yalnız BİZİM gönderdiğimiz, hâlâ taze bir olayın
     * mesaj kimliğiyle sorulursa sağlanır — başka bir uygulamanın Tasker'a gönderdiği
     * sahte REQUEST_QUERY kullanıcının profilini tetikleyemez.
     */
    fun olayiDegerlendir(
        kosul: EklentiAyari.Kosul,
        olay: OtomasyonOlayKaydi?,
        simdiMs: Long,
        dil: String = MetinDili.TR,
    ): SorguSonucu {
        if (olay == null || simdiMs - olay.zamanMs !in 0..OLAY_OMRU_MS) return SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANMADI)
        if (olay.olay != kosul.olay) return SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANMADI)
        if (kosul.vakit != null && kosul.vakit != olay.vakit) return SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANMADI)
        val d = vakitDegiskenleri(olay.vakit, olay.tarih, dil).toMutableMap()
        if (olay.kalanDk != null) d[D_KALAN_DK] = olay.kalanDk.toString()
        if (olay.camiAdi != null) d[D_CAMI] = olay.camiAdi
        return SorguSonucu(OtomasyonProtokolu.SONUC_SAGLANDI, d)
    }

    // --- Olay üretimi (yeni alarm KURULMAZ) --------------------------------------------

    /**
     * Widget'ın vakit sınırı alarmı tetiklenince: kılınabilir bir vakit YENİ girdiyse
     * ve bu vakit için daha önce gönderilmediyse olayın kimliği (`<tarih>_<widgetKodu>`).
     * Saat/saat dilimi değişimi ya da tekrar eden tazelemeler ikinci olay üretmez.
     */
    fun girdiOlayi(durum: VakitDurumu, simdiMs: Long, sonGirdi: String?): VakitAni? {
        val aktif = durum.aktif ?: return null
        if (durum.bitisMs == null) return null
        if (simdiMs - aktif.ms !in 0..GIRDI_TAZELIK_MS) return null
        if (kildimKimligi(aktif.tarih, aktif.kod) == sonGirdi) return null
        return aktif
    }

    data class CikiyorOlayi(val tarih: String, val vakit: String, val kalanDk: Int)

    /**
     * Muhafız PLAN bildirimi gösterilirken: vaktin çıkmasına [CIKIYOR_ESIK_DK] ya da
     * daha az kala gelen İLK uyarı "vakit çıkıyor" olayıdır. Kimlik
     * `muhafiz_<tarih>_vakit_<vakit>_seviye_<n>_dk_<kalanDk>`; kalanDk yönden bağımsız
     * olarak çıkışa kalan süredir (AGENTS.md: `UyariPlani.kalanDk` = zamanlama), yani
     * "girişten itibaren" kurulmuş muhafızda da doğru anı verir.
     */
    fun cikiyorOlayi(kimlik: String, sonCikiyor: String?): CikiyorOlayi? {
        if (!MuhafizPlanKimligi.planKimligiMi(kimlik)) return null
        val v = BildirimKildimKurallari.vakitCoz(kimlik) ?: return null
        val kalan = MuhafizPlanKimligi.kimliktenKalanDk(kimlik) ?: return null
        if (kalan < 1 || kalan > CIKIYOR_ESIK_DK) return null
        val kod = VakitKodlari.widgetKodu(v.vakit) ?: return null
        if (kildimKimligi(v.tarih, kod) == sonCikiyor) return null
        return CikiyorOlayi(v.tarih, kod, kalan.toInt())
    }

    /** Taze olaylar, en yenisi sonda, en çok [OLAY_KAYIT_SINIRI]. */
    fun olaylariBuda(liste: List<OtomasyonOlayKaydi>, simdiMs: Long): List<OtomasyonOlayKaydi> =
        liste.filter { simdiMs - it.zamanMs in 0..OLAY_OMRU_MS }.takeLast(OLAY_KAYIT_SINIRI)
}
