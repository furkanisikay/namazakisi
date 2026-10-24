package com.furkanisikay.namazakisi.cekirdek

import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

/**
 * Sistem asistanı (Android AppFunctions — cihaz içi MCP) kararları (issue #94) — SAF.
 *
 * iOS Siri / Kısayollar'ın (issue #279) ANDROID İKİZİDİR: aynı üç eylem, aynı veri
 * (widget yükü, `core/widget/widgetYuku.ts`), aynı metinler. Kararlar ve metinler
 * `src/core/siri/siriKarari.ts` ve `modules/expo-siri-kisayollari/ios/VakitKarari.swift`
 * ile birebir aynıdır; üçü de `modules/expo-siri-kisayollari/test/siri-ornek.json`
 * fikstürünü doğrular (`AsistanKarariTest`). Kural ya da metin değişirse DÖRDÜNÜ
 * (TS + Swift + Kotlin + fikstür) birlikte değiştir.
 *
 * Vakit seçimi widget/kutu/saat ile ORTAKTIR ([VakitCizelgesi.durumHesapla]),
 * kılınmışlık [KildimDurumKarari.hesapla] (kayıt ∪ kuyrukta bekleyen).
 *
 * Metinler ARAYÜZ kaydındadır (kibar "siz"): asistan cevabı ibadete çağrı değil,
 * kullanıcının sorduğu soruya verilen bilgidir. Saate hal eki EKLENMEZ ("saat 15:42").
 * Dil son parametre `dil` (varsayılan Türkçe — fikstür Türkçeyi kilitler); İngilizce
 * karşılıklar JS `genel.kildim.sonuc` / `sade` sözlüğüyle aynı kalıptadır ([MetinDili]).
 *
 * Bu dosya Android'e dokunmaz (JVM testi `android/app/src/test`).
 */
object AsistanKarari {

    /** Veri hiç yokken (uygulama hiç açılmamış / konum yok). Swift `konumYokMetni` ikizi. */
    const val KONUM_YOK_METNI = "Vakitleri hesaplayabilmek için uygulamayı açıp konumunuzu ayarlayın."

    /** Çizelge tükenmişken (uygulama ~bir haftadır açılmamış). Swift `veriEskiMetni` ikizi. */
    const val VERI_ESKI_METNI = "Vakit bilgisi eskimiş. Güncellemek için uygulamayı bir kez açın."

    /** [KONUM_YOK_METNI]'nin arayüz dilindeki hâli. */
    fun konumYokMetni(dil: String = MetinDili.TR): String = MetinDili.sec(
        dil, KONUM_YOK_METNI, "Open the app and set your location so prayer times can be calculated.",
    )

    /** [VERI_ESKI_METNI]'nin arayüz dilindeki hâli. */
    fun veriEskiMetni(dil: String = MetinDili.TR): String = MetinDili.sec(
        dil, VERI_ESKI_METNI, "Prayer time data is out of date. Open the app once to update it.",
    )

    /** "Kıldım" kararı — iOS `SiriKildimKarari` ikizi. */
    sealed class KildimKarari {
        /** İşaretlenebilecek vakit. [kayitVakti]: kuyruk/kayıt kodu (`imsak`…). */
        data class Aday(val vakit: VakitAni, val kayitVakti: String, val ad: String) : KildimKarari() {
            /** Onay kimliği = kuyruk kimliği ("<tarih>_<kayitVakti>"). */
            val onayKimligi: String get() = kildimKimligi(vakit.tarih, kayitVakti)
        }
        data class ZatenKilindi(val ad: String) : KildimKarari()
        data class VakitYok(val siradaki: VakitAni?) : KildimKarari()
    }

    /**
     * "Şu anki vakti kıldım" kararı. Güneş→öğle arasında işaretlenecek vakit yoktur,
     * gece yarısından sonra yatsı DÜNÜN namaz günüdür (kural [VakitCizelgesi]'ndedir).
     *
     * @param kildim [KildimDurumKarari.hesapla] sonucu — KILINDI ve BEKLIYOR ikisi de
     *   "zaten kılındı" sayılır (kuyrukta bekleyen işaretleme ikinci kez sorulmaz).
     */
    fun kildimKarari(durum: VakitDurumu, kildim: KildimDurumu, dil: String = MetinDili.TR): KildimKarari {
        val aktif = durum.aktif
        val kayitVakti = aktif?.let { VakitKodlari.kuyrukVakti(it.kod) }
        if (aktif == null || durum.bitisMs == null || kayitVakti == null) {
            return KildimKarari.VakitYok(durum.sonraki)
        }
        val ad = VakitKodlari.gorunenAd(aktif.kod, dil)
        return when (kildim) {
            KildimDurumu.KILINDI, KildimDurumu.BEKLIYOR -> KildimKarari.ZatenKilindi(ad)
            else -> KildimKarari.Aday(aktif, kayitVakti, ad)
        }
    }

    /**
     * Asistan "Kıldım" çağrısının İKİ ADIMLI akışı.
     *
     * AppFunction bir servistir; uygulama kendi onay penceresini açamaz. Google'ın
     * kuralı ("veri yazan eylemde uygulamanın kendi onay adımı olsun") bu yüzden
     * protokolle karşılanır: ilk çağrı HİÇBİR ŞEY YAZMAZ, soruyu ve bir onay kimliği
     * döner; asistan kullanıcıya sorar, onaylanırsa aynı kimlikle yeniden çağırır.
     * Kimlik o anki vakte bağlıdır: arada vakit değiştiyse yanlış vakit işaretlenmez
     * (iOS intent'inin "onaydan sonra yeniden değerlendir" kuralının ikizi).
     */
    sealed class KildimAdimi {
        data class OnayIste(val aday: KildimKarari.Aday, val soru: String) : KildimAdimi()
        data class Isaretle(val aday: KildimKarari.Aday) : KildimAdimi()
        object VakitDegisti : KildimAdimi()
        /** Yazılacak bir şey yok (zaten kılındı / vakit yok). */
        data class Bilgi(val karar: KildimKarari) : KildimAdimi()
    }

    fun kildimAdimi(karar: KildimKarari, onayKimligi: String?, dil: String = MetinDili.TR): KildimAdimi = when (karar) {
        is KildimKarari.Aday -> when {
            onayKimligi.isNullOrBlank() -> KildimAdimi.OnayIste(karar, onayMetni(karar.ad, dil))
            onayKimligi == karar.onayKimligi -> KildimAdimi.Isaretle(karar)
            else -> KildimAdimi.VakitDegisti
        }
        else -> KildimAdimi.Bilgi(karar)
    }

    /** "saat 15:42" / "yarın saat 05:12" — İngilizcede "at 15:42" / "tomorrow at 05:12". */
    private fun girisMetni(v: VakitAni, bugun: String, saat: (Long) -> String, dil: String): String =
        if (MetinDili.coz(dil) == MetinDili.EN) "${if (v.tarih > bugun) "tomorrow " else ""}at ${saat(v.ms)}"
        else "${if (v.tarih > bugun) "yarın " else ""}saat ${saat(v.ms)}"

    /**
     * "Sıradaki namaz ne zaman?" cevabı. İçinde bulunulan vakit henüz kılınmadıysa
     * önce o söylenir (soran çoğu zaman "ne kadar vaktim var?" diye sorar).
     *
     * @param bugun Cihazın TAKVİM günü (ISO). "yarın" vaktin namaz günüyle
     *   karşılaştırılır: gece yarısından sonra sıradaki sabah BUGÜNdür.
     */
    fun siradakiNamazMetni(
        durum: VakitDurumu,
        kildim: KildimDurumu,
        bugun: String,
        saat: (Long) -> String,
        dil: String = MetinDili.TR,
    ): String {
        val parcalar = mutableListOf<String>()
        val aktif = durum.aktif
        val bitis = durum.bitisMs
        if (aktif != null && bitis != null && kildim == KildimDurumu.KILINABILIR) {
            val ad = VakitKodlari.gorunenAd(aktif.kod, dil)
            // Çıkış sıradaki namazın girişiyle aynıysa (öğle→ikindi) saat iki kez okunmaz.
            parcalar += if (durum.sonraki?.ms == bitis) MetinDili.sec(dil, "Şu an $ad vakti.", "It's $ad time now.")
            else MetinDili.sec(dil, "Şu an $ad vakti, çıkışı saat ${saat(bitis)}.", "It's $ad time now; it ends at ${saat(bitis)}.")
        }
        durum.sonraki?.let { s ->
            val ad = VakitKodlari.gorunenAd(s.kod, dil)
            val giris = girisMetni(s, bugun, saat, dil)
            parcalar += MetinDili.sec(dil, "Sıradaki namaz $ad, $giris.", "The next prayer is $ad, $giris.")
        }
        return if (parcalar.isEmpty()) veriEskiMetni(dil) else parcalar.joinToString(" ")
    }

    /** "Kıldım" sonucu metni — iOS `siriKildimMetni` / `KildimIslemleri.sonucMetni` ile aynı dil. */
    fun kildimMetni(karar: KildimKarari, bugun: String, saat: (Long) -> String, dil: String = MetinDili.TR): String = when (karar) {
        is KildimKarari.Aday -> MetinDili.sec(
            dil,
            "${karar.ad} namazınız kılındı olarak işaretlendi. Allah kabul etsin.",
            "${karar.ad} is marked as prayed. May Allah accept it.",
        )
        is KildimKarari.ZatenKilindi -> MetinDili.sec(
            dil,
            "${karar.ad} namazı zaten kılındı olarak işaretli.",
            "${karar.ad} is already marked as prayed.",
        )
        is KildimKarari.VakitYok -> karar.siradaki?.let {
            val ad = VakitKodlari.gorunenAd(it.kod, dil)
            val giris = girisMetni(it, bugun, saat, dil)
            MetinDili.sec(
                dil,
                "Şu an kılınacak vakit yok. Sıradaki $ad, $giris.",
                "There is no prayer to mark right now. Next is $ad, starting $giris.",
            )
        } ?: MetinDili.sec(dil, "Şu an kılınacak vakit yok.", "There is no prayer to mark right now.")
    }

    /** Onay sorusu — iOS `siriKildimOnayMetni` ikizi. */
    fun onayMetni(ad: String, dil: String = MetinDili.TR): String =
        MetinDili.sec(dil, "$ad namazı kılındı olarak işaretlensin mi?", "Mark $ad as prayed?")

    const val VAKIT_DEGISTI_METNI = "Vakit değişti, işaretleme yapılmadı. Lütfen yeniden deneyin."

    /** [VAKIT_DEGISTI_METNI]'nin arayüz dilindeki hâli. */
    fun vakitDegistiMetni(dil: String = MetinDili.TR): String = MetinDili.sec(
        dil, VAKIT_DEGISTI_METNI, "The prayer time changed, so nothing was marked. Try again.",
    )

    /**
     * Vaktin çıkışına kalan tam dakika — YUKARI yuvarlanır (sade görünümle aynı:
     * son dakikada "0 dk" denmez). Süre geçmişse 0.
     */
    fun kalanDakika(bitisMs: Long, simdiMs: Long): Int {
        val fark = bitisMs - simdiMs
        if (fark <= 0) return 0
        return ((fark + 59_999) / 60_000).toInt()
    }

    /**
     * ISO 8601 zaman (yerel saat + ofset, ör. `2026-06-21T13:11:00+03:00`). `java.time`
     * KULLANILMAZ: minSdk 24 (API 26 altı) ve desugaring açık değil; `X` deseni API 24'te var.
     */
    fun isoZaman(ms: Long, saatDilimi: TimeZone = TimeZone.getDefault()): String =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX", Locale.ROOT).apply { timeZone = saatDilimi }.format(ms)

    /** Cihazın takvim günü (ISO) — "yarın" kararı için. */
    fun takvimGunu(ms: Long, saatDilimi: TimeZone = TimeZone.getDefault()): String =
        SimpleDateFormat("yyyy-MM-dd", Locale.ROOT).apply { timeZone = saatDilimi }.format(ms)
}
