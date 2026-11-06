/**
 * "Bu hafta" paneli (tablet / iPad geniş düzen) — SAF hafta özeti.
 *
 * Hafta Pazartesi başlar (Türkiye takvimi). Oran yalnız GEÇMİŞ ve BUGÜN üzerinden
 * hesaplanır: gelecek günler paydaya girseydi Pazartesi sabahı oran %3 görünürdü.
 * Gün NAMAZ günüdür (çağıran `gunTarihiIso`'yu aktif günden verir).
 */
import { metin } from '../dil/aktifDil';
import { gunEkle, ISOTarihiDateNesnesiNeCevir } from '../utils/TarihYardimcisi';

/** Pazartesi'den başlayan gün harfleri, etkin dilde. */
export const haftaGunHarfleri = (): readonly string[] => metin().tarih.haftaHarfleri;
export const GUNLUK_FARZ = 5;

export interface HaftaGunu {
    tarih: string;
    /** "Pt", "Sa" … */
    harf: string;
    /** O gün kılınan farz sayısı (0–5). Gelecek günde 0. */
    kilinan: number;
    bugunMu: boolean;
    gelecekMi: boolean;
}

export interface HaftaOzeti {
    gunler: HaftaGunu[];
    kilinan: number;
    /** Geçmiş + bugün × 5. */
    toplam: number;
    /** 0–100 tam sayı; toplam 0 ise 0. */
    yuzde: number;
}

/** Gösterilen günün haftasının Pazartesi'si (ISO). */
export function haftaBasi(gunTarihiIso: string): string {
    const gun = ISOTarihiDateNesnesiNeCevir(gunTarihiIso).getDay(); // 0 = Pazar
    const geri = (gun + 6) % 7;
    return gunEkle(gunTarihiIso, -geri);
}

/**
 * @param kilinanlar tarih → kılınan farz sayısı (eksik gün = 0).
 */
export function haftaOzetiHesapla(gunTarihiIso: string, kilinanlar: Record<string, number>): HaftaOzeti {
    const bas = haftaBasi(gunTarihiIso);
    const gunler: HaftaGunu[] = haftaGunHarfleri().map((harf, i) => {
        const tarih = gunEkle(bas, i);
        const gelecekMi = tarih > gunTarihiIso;
        const ham = gelecekMi ? 0 : kilinanlar[tarih] ?? 0;
        return {
            tarih,
            harf,
            kilinan: Math.max(0, Math.min(GUNLUK_FARZ, ham)),
            bugunMu: tarih === gunTarihiIso,
            gelecekMi,
        };
    });
    const gecmis = gunler.filter((g) => !g.gelecekMi);
    const kilinan = gecmis.reduce((t, g) => t + g.kilinan, 0);
    const toplam = gecmis.length * GUNLUK_FARZ;
    return { gunler, kilinan, toplam, yuzde: toplam > 0 ? Math.round((kilinan / toplam) * 100) : 0 };
}
