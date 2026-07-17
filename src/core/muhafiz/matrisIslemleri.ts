import type { MuhafizMatrisi, MuhafizVakti, SeviyeKademe, Siklik } from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI } from './matrisTipleri';

const derinKopya = <T>(o: T): T => JSON.parse(JSON.stringify(o));

export function tumVakitlereUygula(matris: MuhafizMatrisi, kaynak: MuhafizVakti): MuhafizMatrisi {
  const sonuc = derinKopya(matris);
  for (const v of MUHAFIZ_VAKITLERI) {
    sonuc[v] = derinKopya(matris[kaynak]);
  }
  return sonuc;
}

export function presetUygula(
  matris: MuhafizMatrisi,
  esikler: Record<SeviyeKademe, number>,
  sikliklar: Record<SeviyeKademe, number>,
): MuhafizMatrisi {
  const sonuc = derinKopya(matris);
  for (const v of MUHAFIZ_VAKITLERI) {
    sonuc[v].seviyeler.forEach((s, i) => {
      const kademe = SEVIYE_KADEMELERI[i];
      s.esikDk = esikler[kademe];
      s.siklik = { herDk: sikliklar[kademe] };
    });
  }
  return sonuc;
}

const siklikDk = (s: Siklik): number => (s === 'birkez' ? -1 : s.herDk);

export function zamanlamaDegistiMi(a: MuhafizMatrisi, b: MuhafizMatrisi): boolean {
  // Yalnız esikDk + siklik karşılaştırılır (mod/ses/anons zamanlama ekseni değil).
  for (const v of MUHAFIZ_VAKITLERI) {
    const as = a[v].seviyeler, bs = b[v].seviyeler;
    for (let i = 0; i < as.length; i++) {
      if (as[i].esikDk !== bs[i].esikDk) return true;
      if (siklikDk(as[i].siklik) !== siklikDk(bs[i].siklik)) return true;
    }
  }
  return false;
}
