package com.furkanisikay.namazakisi.kildim

import android.app.Activity
import android.os.Bundle
import android.widget.Toast
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari

/**
 * "Şu anki vakti kıldım" kısayolu (issue #276) — arayüzü olmayan geçiş etkinliği.
 * Uygulamayı AÇMADAN işaretler, kısa bir mesaj gösterip kapanır. Samsung Rutinler ve
 * otomasyon uygulamaları kısayolu "uygulama eylemi" olarak çağırır.
 *
 * Etkinlik görünür olduğu an uygulama ön plandadır → headless görev arka plan
 * kısıtına takılmadan başlar. Intent-filter'ı YOKTUR: `namazakisi://kildim`
 * MainActivity'nin genel filtresine de uyduğu için ikinci bir filtre seçim
 * penceresi açardı; kısayol bu etkinliği açık bileşen adıyla çağırır.
 */
class KildimKisayolActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val sonuc = KildimIslemleri.simdikiVaktiKuyrugaAl(this, KildimKuyruguKurallari.KAYNAK_KISAYOL)
        Toast.makeText(applicationContext, KildimIslemleri.sonucMetni(sonuc), Toast.LENGTH_SHORT).show()
        finish()
    }
}
