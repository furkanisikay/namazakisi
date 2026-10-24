/**
 * Hesap profillerinin görünen adları ve özet metinleri — etkin dilin sözlüğünden (`hesap`).
 * Tablolar canlı görünümdür: dil değişince yeni değeri okur.
 */
import type { CalculationParameters } from 'adhan';
import { bicim, canli, metin, sayiYaz } from '../dil/aktifDil';
import type { Sozluk } from '../dil/sozluk/tr';
import type { HesapProfiliKimligi, IkindiYontemi, ProfilGuveni } from './hesapProfilleri';

// Derleme anı denetimi: yeni profil eklenip sözlüğe adı yazılmazsa `tsc` hata verir.
type ProfillerTam = Sozluk['hesap']['profiller'] extends Record<HesapProfiliKimligi, string> ? true : never;
const _profillerTam: ProfillerTam = true;
void _profillerTam;

export const PROFIL_ADLARI: Readonly<Record<HesapProfiliKimligi, string>> = canli((s) => s.hesap.profiller);

export const GUVEN_METNI: Readonly<Record<ProfilGuveni, string>> = canli((s) => s.hesap.guven);

export const IKINDI_ADLARI: Readonly<Record<IkindiYontemi, string>> = canli((s) => s.hesap.ikindi);

export const IKINDI_ACIKLAMASI: Readonly<Record<IkindiYontemi, string>> = canli((s) => s.hesap.ikindiAciklama);

function derece(d: number): string {
  return `${sayiYaz(Number.isInteger(d) ? d : Number(d.toFixed(1)))}°`;
}

/** "Sabah 18° · Yatsı 17°" ya da "Sabah 18,5° · Yatsı akşamdan 90 dk sonra". */
export function aciOzeti(p: CalculationParameters): string {
  const h = metin().hesap;
  const yatsi = p.ishaInterval > 0 ? bicim(h.yatsiDakika, { dk: p.ishaInterval }) : bicim(h.yatsiAci, { aci: derece(p.ishaAngle) });
  return bicim(h.aciOzeti, { fecr: derece(p.fajrAngle), yatsi });
}
