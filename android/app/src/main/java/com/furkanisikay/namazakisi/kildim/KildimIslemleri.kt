package com.furkanisikay.namazakisi.kildim

import android.content.Context
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.arayuzDili
import com.furkanisikay.namazakisi.dildeBaglam
import com.furkanisikay.namazakisi.cekirdek.KildimDurumKarari
import com.furkanisikay.namazakisi.cekirdek.KildimDurumu
import com.furkanisikay.namazakisi.cekirdek.VakitKodlari
import com.furkanisikay.namazakisi.cekirdek.saatMetni
import com.furkanisikay.namazakisi.widget.WidgetGuncelleyici
import com.furkanisikay.namazakisi.widget.WidgetVeriDeposu

/**
 * Widget, hızlı ayarlar kutusu ve kısayolun ORTAK "Kıldım" yolu (issue #275/#276).
 *
 * Sıra: kuyruğa yaz (kalıcı) → widget + kutu "işaretleniyor" çizilir (iyimser) →
 * JS uyandırılır. JS kaydı yazınca kılınmışlık dinleyicisi widget'ı "kılındı"ya
 * çevirir. Yalnız İŞARETLEME: kılınmış vakit için hiçbir şey yapılmaz (geri alma
 * uygulamada).
 */
object KildimIslemleri {

    /** [vakitAdi]/[siradakiAd] arayüz dilindeki GÖRÜNEN addır (kimlik değil). */
    sealed class Sonuc {
        data class Isaretlendi(val vakitAdi: String) : Sonuc()
        data class ZatenKilindi(val vakitAdi: String) : Sonuc()
        /** Güneş→öğle arası: sıradaki vakit ve girişi. */
        data class VakitYok(val siradakiAd: String?, val giris: String?) : Sonuc()
        object VeriYok : Sonuc()
        /** Onay beklerken vakit değişti: yanlış vakit işaretlenmez. */
        object VakitDegisti : Sonuc()
    }

    /** İşaretlemeden ÖNCE durum: ya kesin sonuç ya da işaretlenebilecek aday. */
    sealed class Degerlendirme {
        data class Kesin(val sonuc: Sonuc) : Degerlendirme()
        data class Aday(val tarih: String, val widgetKodu: String, val vakitAdi: String) : Degerlendirme()
    }

    /** Şu anki vakit işaretlenebilir mi? Hiçbir şey YAZMAZ (onay penceresi için). */
    fun simdikiVaktiDegerlendir(context: Context): Degerlendirme {
        val a = WidgetVeriDeposu.anlik(context)
        val dil = context.arayuzDili()
        val aktif = a.durum.aktif
        if (aktif == null || a.durum.bitisMs == null) {
            val s = a.durum.sonraki ?: return Degerlendirme.Kesin(Sonuc.VeriYok)
            return Degerlendirme.Kesin(Sonuc.VakitYok(VakitKodlari.gorunenAd(s.kod, dil), saatMetni(s.ms)))
        }
        val ad = VakitKodlari.gorunenAd(aktif.kod, dil)
        return when (a.kildim) {
            KildimDurumu.KILINDI, KildimDurumu.BEKLIYOR -> Degerlendirme.Kesin(Sonuc.ZatenKilindi(ad))
            else -> Degerlendirme.Aday(aktif.tarih, aktif.kod, ad)
        }
    }

    /**
     * Adayı işaretler — ama önce YENİDEN değerlendirir: onay penceresi açıkken vakit
     * değişmiş olabilir (aynı vakit değilse [Sonuc.VakitDegisti]).
     */
    fun adayiKuyrugaAl(context: Context, aday: Degerlendirme.Aday, kaynak: String): Sonuc =
        when (val simdi = simdikiVaktiDegerlendir(context)) {
            is Degerlendirme.Kesin -> simdi.sonuc
            is Degerlendirme.Aday -> when {
                simdi.tarih != aday.tarih || simdi.widgetKodu != aday.widgetKodu -> Sonuc.VakitDegisti
                !kuyrugaAlVeUyandir(context, simdi.tarih, simdi.widgetKodu, kaynak) -> Sonuc.VeriYok
                else -> Sonuc.Isaretlendi(simdi.vakitAdi)
            }
        }

    /** "Şu anki vakti kıldım" — kutu (kullanıcının kendi dokunuşu; onay yok). */
    fun simdikiVaktiKuyrugaAl(context: Context, kaynak: String): Sonuc =
        when (val d = simdikiVaktiDegerlendir(context)) {
            is Degerlendirme.Kesin -> d.sonuc
            is Degerlendirme.Aday -> adayiKuyrugaAl(context, d, kaynak)
        }

    /** Widget dokunuşu: yalnız dokunulan vakit HÂLÂ aktifse işaretlenir. */
    fun dokunustanKuyrugaAl(context: Context, tarih: String, widgetKodu: String, kaynak: String) {
        val a = WidgetVeriDeposu.anlik(context)
        if (KildimDurumKarari.dokunusGecerliMi(a.durum, tarih, widgetKodu) && a.kildim == KildimDurumu.KILINABILIR) {
            kuyrugaAlVeUyandir(context, tarih, widgetKodu, kaynak)
        } else {
            WidgetGuncelleyici.tumunuGuncelle(context)
        }
    }

    private fun kuyrugaAlVeUyandir(context: Context, tarih: String, widgetKodu: String, kaynak: String): Boolean {
        val vakitAdi = VakitKodlari.kuyrukVakti(widgetKodu) ?: return false
        if (!KildimKuyrugu.ekle(context, tarih, vakitAdi, kaynak)) return false
        WidgetGuncelleyici.tumunuGuncelle(context)
        KildimKuyrugu.jsUyandir(context)
        return true
    }

    /**
     * Kullanıcıya kısa geri bildirim (kibar "siz" — arayüz yönetimi, ibadet çağrısı değil).
     * Arayüz dilinde, kaynaklardan (`kildim_sonuc_*`); JS `genel.kildim.sonuc` ile aynı kalıp.
     */
    fun sonucMetni(context: Context, sonuc: Sonuc): String {
        val m = context.dildeBaglam()
        return when (sonuc) {
            is Sonuc.Isaretlendi -> m.getString(R.string.kildim_sonuc_isaretlendi, sonuc.vakitAdi)
            is Sonuc.ZatenKilindi -> m.getString(R.string.kildim_sonuc_zaten_kilindi, sonuc.vakitAdi)
            is Sonuc.VakitYok ->
                if (sonuc.siradakiAd != null) m.getString(R.string.kildim_sonuc_vakit_yok_siradaki, sonuc.siradakiAd, sonuc.giris)
                else m.getString(R.string.kildim_sonuc_vakit_yok)
            Sonuc.VeriYok -> m.getString(R.string.kildim_sonuc_veri_yok)
            Sonuc.VakitDegisti -> m.getString(R.string.kildim_sonuc_vakit_degisti)
        }
    }
}
