/**
 * Ana ekranın proaktif onarım kararı — SAF.
 *
 * Kurulum sağlığı kartı (Ayarlar) bu sorunları zaten söylüyordu, ama "ayarlara hiç bakmayan"
 * kullanıcı (persona çalışması: kurulumu oğlu/kızı yapan yaşlı kullanıcı) onu hiç görmez. Bir
 * gün sistemden bildirim iznini kapatır ya da Android tam zamanlı alarm iznini geri alır ve
 * uygulama sessizce susar. Bu karar yalnız İKİ ölçülebilen, HİÇBİR hatırlatmanın gelmemesine
 * ya da geç gelmesine yol açan durumu ana ekrana taşır:
 *
 * - bildirim izni kapalı (yalnız 'reddedildi'; 'belirsiz' = henüz sorulmamış/okunamadı → YOK)
 * - tam zamanlı hatırlatma izni kapalı (Android 12+; yalnız bir hatırlatma açıkken anlamlı)
 *
 * Yanlış alarm, hiç uyarmamaktan kötüdür: bilinmeyen durum daima "sorun yok" sayılır.
 */

export type OnarimTuru = 'bildirimIzni' | 'tamAlarm';

export interface OnarimGirdisi {
    bildirimIzni: 'verildi' | 'reddedildi' | 'belirsiz';
    tamAlarm: 'verildi' | 'reddedildi' | 'belirsiz';
    /** Muhafız ya da vakit girince bildirimi açık mı (tam alarm yalnız o zaman sorun). */
    hatirlatmaVar: boolean;
    /** Kullanıcı bu oturumda "Şimdi değil" dediyse o tür gösterilmez. */
    ertelenenler: readonly OnarimTuru[];
}

export function kurulumOnarimiSec(g: OnarimGirdisi): OnarimTuru | null {
    if (g.bildirimIzni === 'reddedildi' && !g.ertelenenler.includes('bildirimIzni')) return 'bildirimIzni';
    if (g.hatirlatmaVar && g.tamAlarm === 'reddedildi' && !g.ertelenenler.includes('tamAlarm')) return 'tamAlarm';
    return null;
}

/**
 * "Şimdi değil" 7 GÜN geçerlidir: bildirimleri BİLEREK kapatan kullanıcı (persona: oğlu
 * gece bildirimleri yüzünden sistemden kapattı) her açılışta kırmızı bantla dürtülmesin; ama
 * kalıcı da susturulmasın — kapalı izin hiçbir hatırlatmanın gelmemesi demektir.
 */
export const ONARIM_ERTELEME_MS = 7 * 24 * 60 * 60 * 1000;

/** Kayıtlı erteleme anlarından şu an geçerli olanlar. Bozuk kayıt yok sayılır. */
export function gecerliErtelemeler(kayit: unknown, simdiMs: number): OnarimTuru[] {
    if (!kayit || typeof kayit !== 'object') return [];
    const sonuc: OnarimTuru[] = [];
    for (const tur of ['bildirimIzni', 'tamAlarm'] as const) {
        const an = (kayit as Record<string, unknown>)[tur];
        if (typeof an === 'number' && Number.isFinite(an) && simdiMs - an >= 0 && simdiMs - an < ONARIM_ERTELEME_MS) sonuc.push(tur);
    }
    return sonuc;
}

export const ONARIM_METINLERI: Record<OnarimTuru, { baslik: string; metin: string; eylem: string }> = {
    bildirimIzni: {
        baslik: 'Bildirimler kapalı',
        metin: 'Vakit hatırlatmaları size ulaşamıyor. İzni tek dokunuşla açabilirsiniz.',
        eylem: 'İzni açın',
    },
    tamAlarm: {
        baslik: 'Hatırlatmalar geç gelebilir',
        metin: 'Tam zamanlı hatırlatma izni kapalı; vaktin son dakikalarında bu önemli.',
        eylem: 'İzni açın',
    },
};
