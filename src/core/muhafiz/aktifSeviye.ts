import type { SeviyeAyari, VakitMuhafizAyari } from './matrisTipleri';
import { SEVIYE_KADEMELERI } from './matrisTipleri';

export function aktifSeviyeyiBul(vakitAyari: VakitMuhafizAyari, kalanDk: number): SeviyeAyari | null {
  // Pencereyi kapsayan (kalanDk <= esikDk) + sessiz olmayan seviyeler; en küçük eşikli (en acil) kazanır.
  // EŞİT eşikte kademe sırası belirler: daha sert olan (acil > sert > uyari > nazik) kazanır.
  // UI sırayı zorlar (esikSinirlari) ama eski global ayardan göç eden matriste eşit eşik
  // olabilir; eski motorun kademeli-override davranışı bu tie-break ile korunur.
  const kapsayan = vakitAyari.seviyeler
    .filter((s) => s.mod !== 'sessiz' && kalanDk <= s.esikDk)
    .sort((a, b) =>
      a.esikDk !== b.esikDk
        ? a.esikDk - b.esikDk
        : SEVIYE_KADEMELERI.indexOf(b.kademe) - SEVIYE_KADEMELERI.indexOf(a.kademe)
    );
  return kapsayan[0] ?? null;
}

export function esikSiralamasiGecerliMi(seviyeler: SeviyeAyari[]): boolean {
  // SEVIYE_KADEMELERI sırası (nazik→acil) kesin azalan eşik olmalı.
  for (let i = 1; i < seviyeler.length; i++) {
    if (seviyeler[i].esikDk >= seviyeler[i - 1].esikDk) return false;
  }
  return true;
}
