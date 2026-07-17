import type { SeviyeAyari, VakitMuhafizAyari } from './matrisTipleri';

export function aktifSeviyeyiBul(vakitAyari: VakitMuhafizAyari, kalanDk: number): SeviyeAyari | null {
  // Pencereyi kapsayan (kalanDk <= esikDk) + sessiz olmayan seviyeler; en küçük eşikli (en acil) kazanır.
  const kapsayan = vakitAyari.seviyeler
    .filter((s) => s.mod !== 'sessiz' && kalanDk <= s.esikDk)
    .sort((a, b) => a.esikDk - b.esikDk);
  return kapsayan[0] ?? null;
}

export function esikSiralamasiGecerliMi(seviyeler: SeviyeAyari[]): boolean {
  // SEVIYE_KADEMELERI sırası (nazik→acil) kesin azalan eşik olmalı.
  for (let i = 1; i < seviyeler.length; i++) {
    if (seviyeler[i].esikDk >= seviyeler[i - 1].esikDk) return false;
  }
  return true;
}
