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

type TakvimModulu = typeof import('expo-calendar/legacy');

const modulAl = (): TakvimModulu | null => {
    try {
        return require('expo-calendar/legacy') as TakvimModulu;
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

/** İzin isteğinin sonucu. `tekrarSorulabilir: false` → sistem diyaloğu bir daha açılmaz, ayarlar gerekir. */
export interface TakvimIzinIstekSonucu {
    verildi: boolean;
    tekrarSorulabilir: boolean;
}

type HamIzin = { status?: unknown; canAskAgain?: unknown; granted?: unknown };

const hamVerildiMi = (h: HamIzin | null | undefined): boolean => !!h && (h.status === 'granted' || h.granted === true);

/** Loga yalnız durum alanları (kişisel veri yok). */
const hamOzet = (h: HamIzin | null | undefined): string =>
    h ? `status=${String(h.status)} canAskAgain=${String(h.canAskAgain)}` : 'yok';

/**
 * Sistem izin diyaloğunu açar (yalnız ayar ekranından, rıza VERİLDİKTEN ve rıza
 * modalı TAMAMEN kapandıktan sonra). ASLA fırlatmaz.
 *
 * İstek "verilmedi" derse durum bir kez daha OKUNUR: v0.31.0 iç testinde (Samsung)
 * kullanıcı izni verdiği hâlde özellik "izin verilmedi" dedi — istek, kapanmakta
 * olan modalla aynı anda gönderilince sonuç güvenilmez olabiliyor. Gerçek durum
 * okumada "verildi" ise verildi sayılır. Ham durum + `canAskAgain` loglanır.
 */
export async function takvimIzniIste(): Promise<TakvimIzinIstekSonucu> {
    const Calendar = modulAl();
    if (!Calendar) return { verildi: false, tekrarSorulabilir: false };
    let istek: HamIzin | null = null;
    try {
        istek = (await Calendar.requestCalendarPermissionsAsync()) as HamIzin;
    } catch (e) {
        Logger.warn('TakvimEtkinlikOkuyucu', 'Takvim izni istenemedi', e);
    }
    if (hamVerildiMi(istek)) return { verildi: true, tekrarSorulabilir: true };

    let okuma: HamIzin | null = null;
    try {
        okuma = (await Calendar.getCalendarPermissionsAsync()) as HamIzin;
    } catch (e) {
        Logger.warn('TakvimEtkinlikOkuyucu', 'Takvim izni okunamadi', e);
    }
    Logger.info('TakvimEtkinlikOkuyucu', `Takvim izni: istek ${hamOzet(istek)} / okuma ${hamOzet(okuma)}`);
    if (hamVerildiMi(okuma)) return { verildi: true, tekrarSorulabilir: true };
    const kaynak = okuma ?? istek;
    return { verildi: false, tekrarSorulabilir: kaynak?.canAskAgain !== false };
}

/**
 * Süren okumalar (aralık anahtarıyla). Konum yayması, açılış zinciri ve bildirim defteri
 * (`Promise.all`) AYNI aralığı aynı anda okuyabilir: her biri ayrı köprü turu açarsa takvim
 * sağlayıcısı (binder) gereksiz yere yorulur ve yarışan turlar farklı anlık görüntü görebilir.
 * Eşzamanlı çağrılar TEK okumayı paylaşır; okuma bitince kayıt silinir (KALICI önbellek YOK —
 * takvim dışarıdan değişir, her tur taze okur).
 */
const surenOkumalar = new Map<string, Promise<TakvimOkumaSonucu>>();

/** Paylaşılan sonucun kopyası — bir tüketicinin diziyi değiştirmesi ötekine sızmasın. */
const kopyala = (s: TakvimOkumaSonucu): TakvimOkumaSonucu =>
    s.durum === 'tamam' ? { durum: 'tamam', etkinlikler: s.etkinlikler.map((e) => ({ ...e })) } : s;

/**
 * [baslangic, bitis) aralığındaki etkinlikleri tüm etkinlik takvimlerinden
 * okuyup çakışma süzgecinden geçirir. ASLA fırlatmaz. Aynı aralığın eşzamanlı
 * okumaları tek köprü turunu paylaşır.
 */
export async function cakismaEtkinlikleriniOku(baslangic: Date, bitis: Date): Promise<TakvimOkumaSonucu> {
    const anahtar = `${baslangic.getTime()}|${bitis.getTime()}`;
    let okuma = surenOkumalar.get(anahtar);
    if (!okuma) {
        okuma = etkinlikleriOku(baslangic, bitis).finally(() => surenOkumalar.delete(anahtar));
        surenOkumalar.set(anahtar, okuma);
    }
    return kopyala(await okuma);
}

async function etkinlikleriOku(baslangic: Date, bitis: Date): Promise<TakvimOkumaSonucu> {
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
