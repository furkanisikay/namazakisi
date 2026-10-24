/**
 * iPhone "Namazda sessiz" kurulum rehberinin hafızası (SAF).
 *
 * iOS Odak'ın gerçekten kurulu/açık olduğunu uygulamaya SÖYLEMEZ; işaretli adımlar
 * yalnız kullanıcının kendi notudur ("bunu yaptım"). Süre, Kısayollar'daki
 * "Namaz sessizliği" eylemine yazılacak dakikayla aynı tutulsun diye burada saklanır
 * ve "Bugün" önizlemesini besler. Bozuk kayıt varsayılana düşer.
 */
import { SESSIZLIK_VARSAYILAN_DK, sessizlikDakikasiniKenetle } from '../siri/sessizlikKarari';
import { bicim, metin } from '../dil/aktifDil';

export type IosSessizAdim = 'odak' | 'cami' | 'vakit';
export const IOS_SESSIZ_ADIMLARI: readonly IosSessizAdim[] = ['odak', 'cami', 'vakit'];

export interface IosSessizKurulum {
    tamam: IosSessizAdim[];
    dakika: number;
}

export const IOS_SESSIZ_VARSAYILAN: IosSessizKurulum = { tamam: [], dakika: SESSIZLIK_VARSAYILAN_DK };

export function iosSessizKurulumuNormalize(ham: unknown): IosSessizKurulum {
    if (!ham || typeof ham !== 'object') return IOS_SESSIZ_VARSAYILAN;
    const k = ham as { tamam?: unknown; dakika?: unknown };
    const tamam = Array.isArray(k.tamam)
        ? IOS_SESSIZ_ADIMLARI.filter((a) => (k.tamam as unknown[]).includes(a))
        : [];
    const dakika = typeof k.dakika === 'number' ? sessizlikDakikasiniKenetle(k.dakika) : SESSIZLIK_VARSAYILAN_DK;
    return { tamam, dakika };
}

export function iosSessizAdimiDegistir(k: IosSessizKurulum, adim: IosSessizAdim): IosSessizKurulum {
    const varMi = k.tamam.includes(adim);
    const tamam = IOS_SESSIZ_ADIMLARI.filter((a) => (a === adim ? !varMi : k.tamam.includes(a)));
    return { ...k, tamam };
}

/** Ayarlar ana sayfasındaki satır özeti. */
export function iosSessizOzeti(k: IosSessizKurulum): string {
    const m = metin().cami.ozet;
    const n = k.tamam.length;
    if (n === 0) return m.odakIleKurun;
    if (n === IOS_SESSIZ_ADIMLARI.length) return m.odakIleKuruldu;
    return bicim(m.adimTamam, { n, toplam: IOS_SESSIZ_ADIMLARI.length });
}
