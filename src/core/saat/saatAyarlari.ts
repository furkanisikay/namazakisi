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

/** Yedek, vaktin/pencerenin sonunu bu kadar önce geçmez (çıkıştan sonra alarm zaten çalmaz). */
export const SAAT_YEDEK_SON_PAYI_MS = 30 * 1000;

/**
 * Saatte bir uyandırmaya verilen cevap (saat W3). Telefonun NATIVE deposunda tutulur
 * (`SaatUyandirmaDeposu.kt`; saatin "kapandı" mesajı JS'i beklemeden işlenir) ve planlama
 * turu onu okur. Okunmazsa her planlama turu kapatılan yedeği aynı kimlikle YENİDEN kurardı.
 *
 * ERTELE YOK (sahip kararı 2026-10-19, muhafızla aynı): saatte "10 dk ertele" kaldırıldı.
 * Güncelleme öncesinden kalan `ertele` kaydı YOK SAYILIR → telefon yedeği planlandığı
 * (özgün) anında çalar; kişi uyandığını onaylamadı.
 */
export type SaatUyandirmaDurumu = { islem: 'kapat' };

/** Plan üreticilerinin gördüğü saat bağlamı: ayar + saatin uyandırma cevapları. */
export interface SaatTeslimBaglami extends SaatAyarlari {
    uyandirmaDurumlari?: Readonly<Record<string, SaatUyandirmaDurumu>>;
}

/** Native deponun JSON'u (kimlik → `{islem}`); bozuk ve eski `ertele` öğesi atlanır, asla fırlatmaz. */
export function saatUyandirmaDurumlariniCoz(ham: unknown): Record<string, SaatUyandirmaDurumu> {
    const sonuc: Record<string, SaatUyandirmaDurumu> = {};
    if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return sonuc;
    for (const [id, deger] of Object.entries(ham as Record<string, unknown>)) {
        const o = deger && typeof deger === 'object' ? (deger as Record<string, unknown>) : null;
        if (!o) continue;
        if (o.islem === 'kapat') sonuc[id] = { islem: 'kapat' };
    }
    return sonuc;
}

/**
 * Bir UYANDIRMA tetiğinin telefondaki anı — TEK KURAL (muhafız + nafile üreticileri ve
 * native `SaatUyandirmaDeposu`'nun yeniden kurduğu an aynı olmalı). `null` = kurulmaz.
 *  - saatte KAPATILDI → telefon da çalmaz (ikinci kez uyandırmaz);
 *  - değilse: `saat` seçiliyse özgün an + gecikme, aksi halde özgün an.
 * Hepsi pencere sonundan `SAAT_YEDEK_SON_PAYI_MS` önceyle sınırlanır (gecikmeli olanlar).
 */
export function uyandirmaTelefonMs(
    baglam: SaatTeslimBaglami | undefined,
    id: string,
    ozgunMs: number,
    sonMs: number
): number | null {
    const gecikme = SAAT_YEDEK_GECIKMESI_DK * 60 * 1000;
    const sinir = sonMs - SAAT_YEDEK_SON_PAYI_MS;
    const d = baglam && saatUyandiriyorMu(baglam) ? baglam.uyandirmaDurumlari?.[id] : undefined;
    if (d?.islem === 'kapat') return null;
    return telefonYedegiGecikirMi(baglam) ? Math.min(ozgunMs + gecikme, sinir) : ozgunMs;
}

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
