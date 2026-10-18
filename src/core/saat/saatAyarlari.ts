/**
 * Saat (Wear OS) ile telefonun İŞ BÖLÜMÜ ayarları (saat W3) — SAF.
 *
 * İki soru, iki cevap:
 * - Uyandırma (sabahın gerçek alarm adımı + teheccüd uyandırması) NEREDE çalsın?
 *   `telefon` = bugünkü davranış (saat hiçbir şey yapmaz). `saat` = saat titreşimle
 *   uyandırır, telefon kendi alarmını `SAAT_YEDEK_GECIKMESI_DK` sonraya YEDEK kurar
 *   (saatte kapatılınca telefon yedeği iptal eder; saat şarjdaysa ya da ulaşılamazsa
 *   yedek çalar, kimse uyanmadan kalmaz). `ikisi` = ikisi aynı anda çalar.
 * - Muhafızın sesli anonsu NEREDE konuşsun? `otomatik` (varsayılan) = telefon konuşur;
 *   telefon yanında değilse (saat yakında bağlı bir telefon göremiyorsa) saat konuşur.
 *   `saat` = yalnız saat (telefon TTS planlamaz). `telefon` = yalnız telefon.
 *   "İkisi birden" BİLİNÇLİ OLARAK YOK: aynı odada iki cihazın aynı cümleyi okuması
 *   çift konuşmadır (AGENTS ön plan/arka plan dersi).
 *
 * Ayar cihaza özgüdür (saat eşleşmesine bağlı) → yedeklemeye GİRMEZ (Camideyim gibi).
 */

export type UyandirmaYeri = 'telefon' | 'saat' | 'ikisi';
export type AnonsYeri = 'otomatik' | 'telefon' | 'saat';

export interface SaatAyarlari {
    uyandirmaYeri: UyandirmaYeri;
    anonsYeri: AnonsYeri;
}

export const VARSAYILAN_SAAT_AYARLARI: SaatAyarlari = { uyandirmaYeri: 'telefon', anonsYeri: 'otomatik' };

/** "Saat" seçiliyken telefonun yedek alarmı bu kadar dakika SONRA çalar. */
export const SAAT_YEDEK_GECIKMESI_DK = 3;

const UYANDIRMA_YERLERI: readonly UyandirmaYeri[] = ['telefon', 'saat', 'ikisi'];
const ANONS_YERLERI: readonly AnonsYeri[] = ['otomatik', 'telefon', 'saat'];

/** Bozuk/eksik kayıt varsayılana düşer (asla fırlatmaz). */
export function saatAyarlariniNormalize(ham: unknown): SaatAyarlari {
    const o = ham && typeof ham === 'object' ? (ham as Record<string, unknown>) : {};
    return {
        uyandirmaYeri: UYANDIRMA_YERLERI.includes(o.uyandirmaYeri as UyandirmaYeri)
            ? (o.uyandirmaYeri as UyandirmaYeri)
            : VARSAYILAN_SAAT_AYARLARI.uyandirmaYeri,
        anonsYeri: ANONS_YERLERI.includes(o.anonsYeri as AnonsYeri)
            ? (o.anonsYeri as AnonsYeri)
            : VARSAYILAN_SAAT_AYARLARI.anonsYeri,
    };
}

/** Saat uyandırma listesini alsın mı? (`saat` ya da `ikisi`) */
export const saatUyandiriyorMu = (a: SaatAyarlari): boolean => a.uyandirmaYeri !== 'telefon';

/**
 * Telefonun uyandırması YEDEK mi (gecikmeli)? TEK KAPI: muhafız ve nafile plan
 * üreticileri bunu okur, bildirim defteri (#298) aynı üreticileri koştuğu için
 * otomatik olarak eşleşir.
 */
export const telefonYedegiGecikirMi = (a: SaatAyarlari | undefined): boolean => a?.uyandirmaYeri === 'saat';

/**
 * Telefon muhafızın sesli anonsunu planlasın mı? TEK KAPI: `saat` seçiliyse telefon
 * konuşmaz — arka plan teslimcisi, ön plan muhafızı ve defter aynı cevabı alır.
 */
export const telefonAnonsuKonusurMu = (a: SaatAyarlari | undefined): boolean => a?.anonsYeri !== 'saat';
