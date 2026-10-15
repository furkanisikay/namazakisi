package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * "Bugün" tile'ının İKİ DOKUNUŞLU ONAYI (issue #281) — SAF, JVM testli.
 *
 * Tile'da dokunuş bir `LoadAction`'dır: sistem tile'ı yeniden ister ve isteğe son
 * dokunulan öğenin kimliğini koyar. Kimlikler bu yüzden işi tek başına taşır:
 *
 *  - `sec|<tarih_vakit>|<üretim ms>`: ilk dokunuş → o vakit 8 sn "Onaylamak için
 *    tekrar" durumuna geçer (zaman çizelgesinde 8 sn geçerli bir girdi; süre bitince
 *    tile kendiliğinden normal görünüme döner, uyandırma gerekmez).
 *  - `onay|<tarih_vakit>|<seçim ms>`: ikinci dokunuş → seçimden bu yana 8 sn
 *    geçmediyse ve vakit hâlâ işaretlenebilirse "Kıldım".
 *
 * Yalnız İŞARETLEME vardır, geri alma yoktur (bilekte yanlışlıkla bir kaydı silmek,
 * yanlışlıkla eklemekten pahalıdır; geri alma telefonda).
 *
 * SON KİMLİK TEKRARI: sistem, dokunuşla tetiklenmeyen bir yenilemede (ör. yeni yük)
 * son tıklanan kimliği yeniden gönderebilir. Her işlenen kimlik saklanır ve ikinci
 * kez işlenmez; kimlikler her çizimde yeni bir zaman damgası taşıdığı için gerçek
 * bir yeni dokunuş daima farklı bir kimlikle gelir.
 */
object BugunTileKarari {
    const val ONAY_SURESI_MS = 8_000L

    private const val SEC = "sec"
    private const val ONAY = "onay"
    private const val AYRAC = '|'

    fun secKimligi(kimlik: String, uretimMs: Long) = "$SEC$AYRAC$kimlik$AYRAC$uretimMs"

    fun onayKimligi(kimlik: String, secimMs: Long) = "$ONAY$AYRAC$kimlik$AYRAC$secimMs"

    sealed class Karar {
        /** Bir şey yapma; normal görünüm. */
        data object Yok : Karar()

        /** İlk dokunuş: `bitisMs`'e kadar bu vakit onay bekler. */
        data class OnayBekle(val kimlik: String, val secimMs: Long, val bitisMs: Long) : Karar()

        /** İkinci dokunuş geçerli: vakit "kılındı" işaretlenir. */
        data class Isaretle(val kimlik: String) : Karar()
    }

    /**
     * @param tiklanan isteğin `lastClickableId`'si (boş/null olabilir)
     * @param sonIslenen bir önceki istekte işlenmiş kimlik (tekrar koruması)
     * @param isaretlenebilir `<tarih>_<vakit>` → şu an işaretlenebilir mi?
     */
    fun karar(
        tiklanan: String?,
        sonIslenen: String?,
        simdi: Long,
        isaretlenebilir: (String) -> Boolean,
    ): Karar {
        if (tiklanan.isNullOrEmpty() || tiklanan == sonIslenen) return Karar.Yok
        val parcalar = tiklanan.split(AYRAC)
        if (parcalar.size != 3) return Karar.Yok
        val (tur, kimlik, msMetni) = parcalar
        val ms = msMetni.toLongOrNull() ?: return Karar.Yok
        if (!isaretlenebilir(kimlik)) return Karar.Yok
        return when (tur) {
            SEC -> Karar.OnayBekle(kimlik, simdi, simdi + ONAY_SURESI_MS)
            // Saat geri alındıysa (simdi < ms) da onay geçersizdir: süre ölçülemez.
            ONAY -> if (simdi >= ms && simdi - ms <= ONAY_SURESI_MS) Karar.Isaretle(kimlik) else Karar.Yok
            else -> Karar.Yok
        }
    }

    /**
     * Tesbihat kısayolu (issue #293) ipucu satırının YERİNE çizilir: yalnız bilekte
     * yapılacak bir iş (onay bekleyen ya da kılınmamış vakit) yokken. Tipik an: vakti
     * yeni işaretlemiş kişi — tam tesbihat zamanı. Ayrı satır eklenmez (küçük yuvarlak
     * ekranda daireler kenara taşardı).
     */
    fun tesbihatKisayoluGoster(onayVar: Boolean, kalanVar: Boolean): Boolean = !onayVar && !kalanVar

    /**
     * Saklanan onay hâlâ geçerli mi? Onay beklerken tile başka bir sebeple yeniden
     * istenirse (yeni yük, aynı eski kimliğe ikinci hızlı dokunuş → `Yok`) "Tekrar"
     * görünümü kaybolmamalı: süre ve işaretlenebilirlik sürdükçe yeniden çizilir.
     */
    fun etkinOnay(
        kimlik: String?,
        secimMs: Long,
        simdi: Long,
        isaretlenebilir: (String) -> Boolean,
    ): Karar.OnayBekle? {
        if (kimlik.isNullOrEmpty() || simdi < secimMs) return null
        val bitis = secimMs + ONAY_SURESI_MS
        if (simdi >= bitis || !isaretlenebilir(kimlik)) return null
        return Karar.OnayBekle(kimlik, secimMs, bitis)
    }
}
