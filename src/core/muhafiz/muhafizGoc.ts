import type { MuhafizMatrisi, SeviyeAyari } from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from './matrisTipleri';

export interface EskiMuhafizAyari {
  esikler: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
  sikliklar: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
}

export function eskidenMatriseGoc(eski: EskiMuhafizAyari): MuhafizMatrisi {
  const esikDizi = [eski.esikler.seviye1, eski.esikler.seviye2, eski.esikler.seviye3, eski.esikler.seviye4];
  const siklikDizi = [eski.sikliklar.seviye1, eski.sikliklar.seviye2, eski.sikliklar.seviye3, eski.sikliklar.seviye4];
  const vakitAyari = () => ({
    seviyeler: SEVIYE_KADEMELERI.map((kademe, i): SeviyeAyari => ({
      kademe,
      mod: 'bildirim',
      esikDk: esikDizi[i],
      siklik: { herDk: siklikDizi[i] },
      bildirimSesi: VARSAYILAN_SES,
      anonsMetni: '',
    })),
  });
  const matris = {} as MuhafizMatrisi;
  for (const v of MUHAFIZ_VAKITLERI) matris[v] = vakitAyari();
  return matris;
}
