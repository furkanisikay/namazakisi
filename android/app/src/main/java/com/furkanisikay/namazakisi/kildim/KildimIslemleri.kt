package com.furkanisikay.namazakisi.kildim

import android.content.Context
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

    sealed class Sonuc {
        data class Isaretlendi(val vakitAdi: String) : Sonuc()
        data class ZatenKilindi(val vakitAdi: String) : Sonuc()
        /** Güneş→öğle arası: sıradaki vakit ve girişi. */
        data class VakitYok(val siradakiAd: String?, val giris: String?) : Sonuc()
        object VeriYok : Sonuc()
    }

    /** "Şu anki vakti kıldım" — kutu ve kısayol. */
    fun simdikiVaktiKuyrugaAl(context: Context, kaynak: String): Sonuc {
        val a = WidgetVeriDeposu.anlik(context)
        val aktif = a.durum.aktif
        if (aktif == null || a.durum.bitisMs == null) {
            val s = a.durum.sonraki ?: return Sonuc.VeriYok
            return Sonuc.VakitYok(VakitKodlari.gorunenAd(s.kod), saatMetni(s.ms))
        }
        val ad = VakitKodlari.gorunenAd(aktif.kod)
        return when (a.kildim) {
            KildimDurumu.KILINDI, KildimDurumu.BEKLIYOR -> Sonuc.ZatenKilindi(ad)
            else -> {
                if (!kuyrugaAlVeUyandir(context, aktif.tarih, aktif.kod, kaynak)) Sonuc.VeriYok
                else Sonuc.Isaretlendi(ad)
            }
        }
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

    /** Kullanıcıya kısa geri bildirim (kibar "siz" — arayüz yönetimi, ibadet çağrısı değil). */
    fun sonucMetni(sonuc: Sonuc): String = when (sonuc) {
        is Sonuc.Isaretlendi -> "${sonuc.vakitAdi} namazınız kılındı olarak işaretlendi."
        is Sonuc.ZatenKilindi -> "${sonuc.vakitAdi} namazı zaten kılındı olarak işaretli."
        is Sonuc.VakitYok ->
            if (sonuc.siradakiAd != null) "Şu an kılınacak vakit yok. Sıradaki ${sonuc.siradakiAd}, giriş ${sonuc.giris}."
            else "Şu an kılınacak vakit yok."
        Sonuc.VeriYok -> "Vakit bilgisi yok. Uygulamayı bir kez açın."
    }
}
