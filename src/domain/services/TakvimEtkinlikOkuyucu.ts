/**
 * Cihaz takviminden ÇAKIŞMA taraması için etkinlik okuma (issue #291).
 *
 * GİZLİLİK SÖZLEŞMESİ:
 *  - Okunan etkinlikler yalnız BELLEKTE yaşar; diske, loga, yedeğe yazılmaz,
 *    hiçbir yere gönderilmez. Loga yalnız SAYI yazılır, ad/saat yazılmaz.
 *  - İzin burada İSTENMEZ (arka plan görevi diyalog açamaz); yalnız durumu
 *    okunur. İzin isteme yolu ayar ekranındaki rıza akışıdır (`takvimIzniIste`).
 *  - Uygulamanın kendi yazdığı namaz etkinlikleri süzgeçte atlanır
 *    (`etkinlikleriSuz` → `UYGULAMA_TAKVIM_NOTU`).
 *
 * `expo-calendar` TEMBEL yüklenir: bu dosyayı (dolaylı olarak) yükleyen
 * bildirim defteri, konum yayması ve arka plan görevi testleri native modülü
 * mock'lamak zorunda kalmasın.
 */
import { Logger } from '../../core/utils/Logger';
import {
    etkinlikleriSuz,
    type HamTakvimEtkinligi,
    type TakvimEtkinligi,
} from '../../core/bildirim/takvimCakismaPlani';

export type TakvimOkumaSonucu =
    | { durum: 'tamam'; etkinlikler: TakvimEtkinligi[] }
    | { durum: 'izinYok' }
    | { durum: 'hata' };

export type TakvimIzinDurumu = 'verildi' | 'verilmedi' | 'bilinmiyor';

type TakvimModulu = typeof import('expo-calendar');

const modulAl = (): TakvimModulu | null => {
    try {
        return require('expo-calendar') as TakvimModulu;
    } catch {
        return null;
    }
};

/** İzin durumunu SORMADAN okur. */
export async function takvimIzinDurumunuOku(): Promise<TakvimIzinDurumu> {
    const Calendar = modulAl();
    if (!Calendar) return 'bilinmiyor';
    try {
        const { status } = await Calendar.getCalendarPermissionsAsync();
        return status === 'granted' ? 'verildi' : 'verilmedi';
    } catch {
        return 'bilinmiyor';
    }
}

/** Sistem izin diyaloğunu açar (yalnız ayar ekranından, rıza VERİLDİKTEN sonra). */
export async function takvimIzniIste(): Promise<boolean> {
    const Calendar = modulAl();
    if (!Calendar) return false;
    try {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        return status === 'granted';
    } catch (e) {
        Logger.warn('TakvimEtkinlikOkuyucu', 'Takvim izni istenemedi', e);
        return false;
    }
}

/**
 * [baslangic, bitis) aralığındaki etkinlikleri tüm etkinlik takvimlerinden
 * okuyup çakışma süzgecinden geçirir. ASLA fırlatmaz.
 */
export async function cakismaEtkinlikleriniOku(baslangic: Date, bitis: Date): Promise<TakvimOkumaSonucu> {
    const Calendar = modulAl();
    if (!Calendar) return { durum: 'hata' };
    const izin = await takvimIzinDurumunuOku();
    // "Bilinmiyor" (köprü hatası) izin yokluğu DEĞİLDİR: kurulu plan korunsun.
    if (izin === 'verilmedi') return { durum: 'izinYok' };
    if (izin === 'bilinmiyor') return { durum: 'hata' };
    try {
        const takvimler = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const kimlikler = takvimler
            // Doğum günü takvimi (iOS) yalnız tüm gün etkinliği taşır; okumaya gerek yok.
            .filter((t) => String(t.type ?? '') !== 'birthdays')
            .map((t) => t.id)
            .filter((id): id is string => typeof id === 'string' && id.length > 0);
        if (kimlikler.length === 0) return { durum: 'tamam', etkinlikler: [] };
        const hamlar = (await Calendar.getEventsAsync(kimlikler, baslangic, bitis)) as HamTakvimEtkinligi[];
        const etkinlikler = etkinlikleriSuz(hamlar);
        Logger.info('TakvimEtkinlikOkuyucu', `${hamlar.length} etkinlik okundu, ${etkinlikler.length} tanesi dikkate alindi`);
        return { durum: 'tamam', etkinlikler };
    } catch (e) {
        Logger.warn('TakvimEtkinlikOkuyucu', 'Etkinlikler okunamadi', e);
        return { durum: 'hata' };
    }
}

/** Plan ufkunun okuma aralığı: dünün başından ufkun ertesi gününün sonuna. */
export function okumaAraligi(simdi: Date, gunSayisi: number): { baslangic: Date; bitis: Date } {
    return {
        baslangic: new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate() - 1),
        bitis: new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate() + gunSayisi + 1),
    };
}
