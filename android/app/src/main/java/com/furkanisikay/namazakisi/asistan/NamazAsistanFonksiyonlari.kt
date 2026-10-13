package com.furkanisikay.namazakisi.asistan

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.appfunctions.AppFunctionAppUnknownException
import androidx.appfunctions.AppFunctionContext
import androidx.appfunctions.AppFunctionSerializable
import androidx.appfunctions.service.AppFunction
import com.furkanisikay.namazakisi.cekirdek.AsistanKarari
import com.furkanisikay.namazakisi.cekirdek.KildimDurumu
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.cekirdek.VakitAni
import com.furkanisikay.namazakisi.cekirdek.VakitKodlari
import com.furkanisikay.namazakisi.cekirdek.saatMetni
import com.furkanisikay.namazakisi.kildim.KildimIslemleri
import com.furkanisikay.namazakisi.widget.WidgetVeriDeposu
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Android AppFunctions — "cihaz içi MCP" (issue #94; epik #271).
 *
 * HTTP MCP sunucusu YAZILMADI: sürekli açık bir sunucu çevrimdışı uygulama vaadine
 * aykırıdır. Bunun yerine sistem asistanı (Gemini vb., `EXECUTE_APP_FUNCTIONS` iznini
 * tutan ayrıcalıklı ajan) bu üç fonksiyonu cihaz içinde keşfedip çağırır. iOS Siri /
 * Kısayollar'ın (issue #279) ikizidir: aynı üç eylem, aynı veri (widget yükü), aynı
 * metinler; kararlar SAF [AsistanKarari]'ndadır.
 *
 * Yapı (androidx.appfunctions **1.0.0-alpha08** — RN 0.81'in AGP 8.11 / compileSdk 36
 * hattına uyan SON sürüm; alpha09+ compileSdk 37 + AGP 9.1 ister, AGENTS.md):
 * - Bu sınıfın `@AppFunction` yöntemleri KSP ile toplanır
 *   (`ksp { arg("appfunctions:aggregateAppFunctions", "true") }`); servis
 *   (`androidx.appfunctions.service.PlatformAppFunctionService`) kütüphane manifestinden
 *   gelir, yalnız sistem bağlanabilir (`BIND_APP_FUNCTION_SERVICE`).
 * - Örnek argümansız kurucuyla oluşturulur (`AppFunctionConfiguration` gerekmez).
 * - İlk parametre `AppFunctionContext` olmak ZORUNDADIR (alpha08 sözleşmesi).
 *
 * KDoc İNGİLİZCE yazıldı: `isDescribedByKDoc = true` onu asistanın gördüğü araç
 * açıklamasına çevirir (LLM'e giden sözleşme); kullanıcıya görünen `ozet`/`mesaj`
 * metinleri Türkçe ve kibar "siz" dilindedir.
 */
class NamazAsistanFonksiyonlari {

    /**
     * Returns the current and the next Islamic prayer time for the user's saved location
     * (Diyanet / Turkey calculation method), works fully offline.
     *
     * Use it for questions like "when is the next prayer?", "how much time is left for the
     * afternoon prayer?". Read [SiradakiNamazSonucu.ozet] to the user as is; it is already a
     * complete Turkish sentence.
     *
     * @param appFunctionContext The context of this app function call.
     * @return The current prayer window (if any), whether it is already marked as prayed,
     *   and the next prayer.
     */
    @AppFunction(isDescribedByKDoc = true)
    suspend fun siradakiNamaz(appFunctionContext: AppFunctionContext): SiradakiNamazSonucu =
        withContext(Dispatchers.IO) {
            try {
                siradakiNamazHesapla(appFunctionContext.context, System.currentTimeMillis())
            } catch (e: Exception) {
                Log.w(TAG, "siradakiNamaz basarisiz", e)
                throw AppFunctionAppUnknownException("Vakit bilgisi okunamadı.")
            }
        }

    /**
     * Marks the CURRENT prayer as performed in the user's prayer log. Two-step and
     * confirmation-gated: this function never writes anything without a confirmation id.
     *
     * Step 1: call with [onayKimligi] = null. Nothing is written. If a prayer can be marked,
     * the result has `durum = "onayBekleniyor"`, a Turkish question in [KildimSonucu.onaySorusu]
     * and an [KildimSonucu.onayKimligi]. Ask the user that question.
     * Step 2: only if the user explicitly confirms, call again with the returned
     * [KildimSonucu.onayKimligi]. If the prayer time changed in between, nothing is marked and
     * `durum = "vakitDegisti"` is returned.
     *
     * Other `durum` values: "isaretlendi" (marked), "zatenKilindi" (already marked),
     * "vakitYok" (no prayer can be performed right now, e.g. between sunrise and noon),
     * "veriYok" (the app has never been opened / no location). Always read
     * [KildimSonucu.mesaj] to the user.
     *
     * @param appFunctionContext The context of this app function call.
     * @param onayKimligi Confirmation id from step 1. Leave empty (null) on the first call.
     *   Never invent it.
     */
    @AppFunction(isDescribedByKDoc = true)
    suspend fun simdikiVaktiKildim(
        appFunctionContext: AppFunctionContext,
        onayKimligi: String? = null,
    ): KildimSonucu = withContext(Dispatchers.IO) {
        try {
            kildimIsle(appFunctionContext.context, onayKimligi, System.currentTimeMillis())
        } catch (e: Exception) {
            Log.w(TAG, "simdikiVaktiKildim basarisiz", e)
            throw AppFunctionAppUnknownException("İşaretleme yapılamadı.")
        }
    }

    /**
     * Opens the Qibla (prayer direction) compass screen of the app. Returns an intent that
     * the assistant should launch to show the screen to the user.
     *
     * @param appFunctionContext The context of this app function call.
     */
    @AppFunction(isDescribedByKDoc = true)
    suspend fun kibleyiAc(appFunctionContext: AppFunctionContext): PendingIntent =
        kibleNiyeti(appFunctionContext.context)

    companion object {
        private const val TAG = "NamazAsistan"

        /** Kıble derin bağlantısı — `src/navigation/derinBaglantilar.ts > KibleSayfasi`. */
        const val KIBLE_BAGLANTISI = "namazakisi://kible"
        private const val KIBLE_ISTEK_KODU = 0x4B42 // "KB"
        /** Sınıf adı (applicationId DEĞİL): derleme zamanı bağı kurmadan açık bileşen. */
        private const val ANA_ETKINLIK = "com.furkanisikay.namazakisi.MainActivity"

        internal fun siradakiNamazHesapla(context: Context, simdiMs: Long): SiradakiNamazSonucu {
            val a = WidgetVeriDeposu.anlik(context, simdiMs)
            if (a.vakitler.isEmpty()) {
                return SiradakiNamazSonucu(
                    durum = DURUM_KONUM_YOK,
                    ozet = AsistanKarari.KONUM_YOK_METNI,
                    simdikiVakit = null,
                    simdikiVakitKilindi = false,
                    siradakiVakit = null,
                )
            }
            val d = a.durum
            val bugun = AsistanKarari.takvimGunu(simdiMs)
            val aktif = d.aktif
            val bitis = d.bitisMs
            val durum = when {
                aktif != null && bitis != null -> DURUM_VAKIT_ICINDE
                d.sonraki != null -> DURUM_VAKIT_ARASI
                else -> DURUM_VERI_ESKI
            }
            return SiradakiNamazSonucu(
                durum = durum,
                ozet = AsistanKarari.siradakiNamazMetni(d, a.kildim, bugun) { saatMetni(it) },
                simdikiVakit = if (aktif != null && bitis != null) vakit(aktif, bitis, simdiMs) else null,
                simdikiVakitKilindi = a.kildim == KildimDurumu.KILINDI || a.kildim == KildimDurumu.BEKLIYOR,
                siradakiVakit = d.sonraki?.let { vakit(it, null, simdiMs) },
            )
        }

        private fun vakit(v: VakitAni, cikisMs: Long?, simdiMs: Long) = AsistanVakti(
            kod = v.kod,
            ad = VakitKodlari.gorunenAd(v.kod),
            namazGunu = v.tarih,
            giris = AsistanKarari.isoZaman(v.ms),
            cikis = cikisMs?.let { AsistanKarari.isoZaman(it) },
            kalanDakika = cikisMs?.let { AsistanKarari.kalanDakika(it, simdiMs) },
        )

        internal fun kildimIsle(context: Context, onayKimligi: String?, simdiMs: Long): KildimSonucu {
            val a = WidgetVeriDeposu.anlik(context, simdiMs)
            if (a.vakitler.isEmpty()) {
                return KildimSonucu(KILDIM_VERI_YOK, AsistanKarari.KONUM_YOK_METNI, null, null, null)
            }
            val bugun = AsistanKarari.takvimGunu(simdiMs)
            val saat: (Long) -> String = { saatMetni(it) }
            val karar = AsistanKarari.kildimKarari(a.durum, a.kildim)
            return when (val adim = AsistanKarari.kildimAdimi(karar, onayKimligi)) {
                is AsistanKarari.KildimAdimi.OnayIste -> KildimSonucu(
                    durum = KILDIM_ONAY_BEKLENIYOR,
                    mesaj = adim.soru,
                    vakit = adim.aday.ad,
                    onaySorusu = adim.soru,
                    onayKimligi = adim.aday.onayKimligi,
                )
                AsistanKarari.KildimAdimi.VakitDegisti ->
                    KildimSonucu(KILDIM_VAKIT_DEGISTI, AsistanKarari.VAKIT_DEGISTI_METNI, null, null, null)
                is AsistanKarari.KildimAdimi.Bilgi -> bilgiSonucu(adim.karar, bugun, saat)
                is AsistanKarari.KildimAdimi.Isaretle -> {
                    // Ortak "Kıldım" yolu (widget/kutu/kısayol/otomasyon ile aynı): yazmadan
                    // ÖNCE yeniden değerlendirir, vakit değiştiyse işaretlemez.
                    val aday = KildimIslemleri.Degerlendirme.Aday(adim.aday.vakit.tarih, adim.aday.vakit.kod, adim.aday.ad)
                    val sonuc = KildimIslemleri.adayiKuyrugaAl(context, aday, KildimKuyruguKurallari.KAYNAK_ASISTAN)
                    KildimSonucu(
                        durum = when (sonuc) {
                            is KildimIslemleri.Sonuc.Isaretlendi -> KILDIM_ISARETLENDI
                            is KildimIslemleri.Sonuc.ZatenKilindi -> KILDIM_ZATEN_KILINDI
                            is KildimIslemleri.Sonuc.VakitYok -> KILDIM_VAKIT_YOK
                            KildimIslemleri.Sonuc.VakitDegisti -> KILDIM_VAKIT_DEGISTI
                            KildimIslemleri.Sonuc.VeriYok -> KILDIM_VERI_YOK
                        },
                        mesaj = KildimIslemleri.sonucMetni(sonuc),
                        vakit = adim.aday.ad,
                        onaySorusu = null,
                        onayKimligi = null,
                    )
                }
            }
        }

        private fun bilgiSonucu(karar: AsistanKarari.KildimKarari, bugun: String, saat: (Long) -> String) =
            KildimSonucu(
                durum = when (karar) {
                    is AsistanKarari.KildimKarari.ZatenKilindi -> KILDIM_ZATEN_KILINDI
                    else -> KILDIM_VAKIT_YOK
                },
                mesaj = AsistanKarari.kildimMetni(karar, bugun, saat),
                vakit = (karar as? AsistanKarari.KildimKarari.ZatenKilindi)?.ad,
                onaySorusu = null,
                onayKimligi = null,
            )

        /**
         * Kıble ekranını açan niyet. Uygulamanın kendi derin bağlantısıdır (RN Linking
         * soğuk açılışta `getInitialURL` ile okur); bileşen AÇIK verilir ki seçim
         * penceresi çıkmasın. Değişmez (FLAG_IMMUTABLE): asistan niyeti değiştiremez.
         */
        internal fun kibleNiyeti(context: Context): PendingIntent {
            val niyet = Intent(Intent.ACTION_VIEW, Uri.parse(KIBLE_BAGLANTISI))
                .setClassName(context, ANA_ETKINLIK)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            return PendingIntent.getActivity(
                context,
                KIBLE_ISTEK_KODU,
                niyet,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
            )
        }

        const val DURUM_VAKIT_ICINDE = "vakitIcinde"
        const val DURUM_VAKIT_ARASI = "vakitArasi"
        const val DURUM_VERI_ESKI = "veriEski"
        const val DURUM_KONUM_YOK = "konumYok"

        const val KILDIM_ONAY_BEKLENIYOR = "onayBekleniyor"
        const val KILDIM_ISARETLENDI = "isaretlendi"
        const val KILDIM_ZATEN_KILINDI = "zatenKilindi"
        const val KILDIM_VAKIT_YOK = "vakitYok"
        const val KILDIM_VAKIT_DEGISTI = "vakitDegisti"
        const val KILDIM_VERI_YOK = "veriYok"
    }
}

/** A prayer time window. Times are ISO 8601 with the device's UTC offset. */
@AppFunctionSerializable(isDescribedByKDoc = true)
data class AsistanVakti(
    /** Stable prayer code: "sabah" (fajr), "ogle", "ikindi", "aksam" or "yatsi". */
    val kod: String,
    /** Turkish display name, e.g. "Öğle". */
    val ad: String,
    /** The prayer day (YYYY-MM-DD). After midnight the night prayer still belongs to the previous day. */
    val namazGunu: String,
    /** Start time of the prayer (ISO 8601). */
    val giris: String,
    /** End time of the prayer window (ISO 8601); null for an upcoming prayer. */
    val cikis: String?,
    /** Whole minutes left until the end of the window (rounded up); null for an upcoming prayer. */
    val kalanDakika: Int?,
)

/** Answer to "when is the next prayer?". */
@AppFunctionSerializable(isDescribedByKDoc = true)
data class SiradakiNamazSonucu(
    /**
     * "vakitIcinde" (a prayer window is running), "vakitArasi" (between windows, e.g. after
     * sunrise), "veriEski" (prayer data expired; the user should open the app),
     * "konumYok" (no location saved yet).
     */
    val durum: String,
    /** Ready-to-speak Turkish summary. Read it to the user. */
    val ozet: String,
    /** The running prayer window, if any. */
    val simdikiVakit: AsistanVakti?,
    /** Whether the running prayer is already marked as performed. */
    val simdikiVakitKilindi: Boolean,
    /** The next prayer. */
    val siradakiVakit: AsistanVakti?,
)

/** Result of the two-step "mark the current prayer as performed" action. */
@AppFunctionSerializable(isDescribedByKDoc = true)
data class KildimSonucu(
    /** "onayBekleniyor", "isaretlendi", "zatenKilindi", "vakitYok", "vakitDegisti" or "veriYok". */
    val durum: String,
    /** Ready-to-speak Turkish message. Read it to the user. */
    val mesaj: String,
    /** Turkish name of the prayer concerned, if any. */
    val vakit: String?,
    /** Question to ask the user before marking (only when durum = "onayBekleniyor"). */
    val onaySorusu: String?,
    /** Pass this back unchanged to confirm (only when durum = "onayBekleniyor"). */
    val onayKimligi: String?,
)
