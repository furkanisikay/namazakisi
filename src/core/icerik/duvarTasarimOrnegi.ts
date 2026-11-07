/**
 * Duvar kâğıdı tasarım sözleşmesinin platformlar arası eşlik örneği (SAF, deterministik).
 * Üretici `scripts/icerik/duvar-tasarim-ornek-uret.js`; nöbetçi `__tests__/duvarTasarimi.test.ts`.
 * Kotlin ve Swift aynı girdilerle aynı `beklenen`i üretmek zorundadır.
 */
import {
  cisimKonumuSec,
  GOK_SAHNELERI,
  IZINLI_BANTLAR,
  okunurlukKarari,
  sonrakiGokSiniri,
  vaktinGogu,
  VARSAYILAN_MERKEZ,
  yaziYerlesimi,
  DUVAR_GOKLERI,
  type DuvarEkrani,
  type DuvarPlatformu,
  type GunVakitleri,
} from './duvarTasarimi';
import { duvarAyariNormalize } from './gununAyetiYuku';

const yuvarla = (v: number) => Math.round(v * 1e6) / 1e6;

export function duvarTasarimOrnegi() {
  // 2026-11-07 İstanbul benzeri vakitler (sabit epoch ms; saat dilimi bağımsız).
  const v: GunVakitleri = [1762489200000, 1762494300000, 1762514700000, 1762524000000, 1762528800000];
  const anlar = [v[0] - 1, v[0], v[1] - 1, v[1], v[2], v[3] + 60000, v[4], v[4] + 3600000];

  const yerlesim: unknown[] = [];
  const platformlar: DuvarPlatformu[] = ['android', 'ios'];
  const ekranlar: DuvarEkrani[] = ['kilit', 'ana'];
  for (const p of platformlar) {
    for (const e of ekranlar) {
      for (const istenen of [0, 0.15, 0.4, VARSAYILAN_MERKEZ[p][e], 0.95]) {
        for (const blok of [0.08, 0.17, 0.3, 0.9]) {
          const r = yaziYerlesimi(istenen, blok, IZINLI_BANTLAR[p][e]);
          yerlesim.push({ platform: p, ekran: e, istenen, blok, beklenen: r ? { ust: yuvarla(r.ust), bant: r.bant } : null });
        }
      }
    }
  }

  const kutular: (readonly [number, number, number, number] | null)[] = [null, [0.1, 0.6, 0.9, 0.7], [0.1, 0.3, 0.9, 0.36], [0.05, 0.2, 0.95, 0.9]];
  const cisim: unknown[] = [];
  for (const g of DUVAR_GOKLERI) {
    const c = GOK_SAHNELERI[g].cisim;
    if (!c) continue;
    for (const kutu of kutular) cisim.push({ gok: g, kutu, oran: 2.1667, beklenen: cisimKonumuSec(c, kutu, 2.1667) });
  }

  return {
    surum: 1,
    sahneler: GOK_SAHNELERI,
    izinliBantlar: IZINLI_BANTLAR,
    varsayilanMerkez: VARSAYILAN_MERKEZ,
    gok: { vakitler: v, ornekler: anlar.map((an) => ({ an, gok: vaktinGogu(an, v), sonrakiSinir: sonrakiGokSiniri(an, v) })) },
    yerlesim,
    cisim,
    okunurluk: [0, 0.05, 0.12, 0.18, 0.25, 0.35, 0.5, 0.7, 1].map((L) => ({ parlaklik: L, beklenen: okunurlukKarari(L) })),
    // Eski kayıt (yalnız v1 alanları) → yeni alanlar varsayılanla dolar; native ayrıştırıcı da aynısını yapmalı.
    normalize: [
      { ham: { acik: true, yer: 'kilit', zemin: 'gece', arapca: false, paletRenk: '#2E7D32' }, beklenen: duvarAyariNormalize({ acik: true, yer: 'kilit', zemin: 'gece', arapca: false, paletRenk: '#2E7D32' }) },
      { ham: { zemin: 'foto', foto: { dosya: '../x.jpg', karartma: 2 }, yazi: { olcek: 9, hiza: 'x' } }, beklenen: duvarAyariNormalize({ zemin: 'foto', foto: { dosya: '../x.jpg', karartma: 2 }, yazi: { olcek: 9, hiza: 'x' } }) },
    ],
  };
}
