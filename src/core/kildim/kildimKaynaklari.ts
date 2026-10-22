/**
 * Ortak "Kıldım" kuyruğunun kabul ettiği kaynaklar (Android `KildimKuyruguKurallari.KAYNAKLAR`).
 * Üç dilde ikizdir; ortak fikstür `android/app/src/test/resources/kildim-kaynaklari.json`
 * (JS ve Kotlin testleri listeyi, Swift testi `cihaz` kaynağını doğrular).
 */
export const KILDIM_KAYNAKLARI = ['wear', 'widget', 'qs', 'kisayol', 'sayac', 'bildirim', 'otomasyon', 'asistan', 'cihaz'] as const;

/** Cihaz ağından (tablet ↔ telefon) gelen "Kıldım". */
export const KILDIM_KAYNAGI_CIHAZ = 'cihaz';
