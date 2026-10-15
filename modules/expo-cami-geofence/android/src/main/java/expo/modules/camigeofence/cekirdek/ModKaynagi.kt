package expo.modules.camigeofence.cekirdek

import kotlin.math.min

/**
 * Namaz modu (Rahatsız Etmeyin) KAYNAKLARININ ömrü — SAF (JVM testi: ModKaynagiTest).
 *
 * Mod açık kaldığı sürece kullanıcı arama/mesaj KAÇIRIR; bu yüzden hiçbir kaynak
 * süresiz olamaz. Her kaynak açılırken bir bitiş anı taşır ve süresi geçmiş kaynak
 * HER değerlendirmede düşer (alarm silinmiş olsa bile: force-stop, OEM uyku
 * kısıtı). Bitiş anı bilinmeyen (eski biçim / bozuk) kaynak GEÇERSİZDİR —
 * "bilmiyorum" durumunda güvenli taraf modu KAPATMAKTIR.
 *
 * JS ikizi YOK: karar yalnız native'de verilir.
 */
object ModKaynagi {
    /**
     * Mutlak tavan: bir kaynağın istenen bitişi ne olursa olsun mod en fazla bu
     * kadar açık kalır (cuma camide üst süresi 150 dk + pay). Bozuk bir plan
     * penceresi saatlerce sessizlik üretemesin.
     */
    const val AZAMI_SURE_MS = 180 * CamiSabitleri.DAKIKA_MS

    /** Açılış anında yazılacak bitiş: istenen ile tavanın küçüğü. */
    fun bitisHesapla(simdiMs: Long, istenenBitisMs: Long): Long = min(istenenBitisMs, simdiMs + AZAMI_SURE_MS)

    /** Kaynak hâlâ geçerli mi? Bitiş bilinmiyorsa (null / ≤0) GEÇERSİZ. */
    fun gecerliMi(simdiMs: Long, bitisMs: Long?): Boolean = bitisMs != null && bitisMs > 0 && simdiMs < bitisMs

    /** Düşürülmesi gereken kaynakların adları. */
    fun suresiGecenler(simdiMs: Long, kaynaklar: Map<String, Long?>): Set<String> =
        kaynaklar.filterValues { !gecerliMi(simdiMs, it) }.keys
}
