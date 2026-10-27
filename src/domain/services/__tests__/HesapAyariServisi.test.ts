const disk: Record<string, unknown> = {};
jest.mock('../../../data/local/Depolama', () => ({
  Depolama: {
    oku: jest.fn(async (k: string) => disk[k] ?? null),
    yaz: jest.fn(async (k: string, v: unknown) => {
      disk[k] = v;
    }),
  },
}));

import { HesapAyariServisi } from '../HesapAyariServisi';
import { aktifHesapAyari, aktifHesapSifirla } from '../../../core/vakit/aktifHesap';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

describe('HesapAyariServisi', () => {
  beforeEach(() => {
    for (const k of Object.keys(disk)) delete disk[k];
    aktifHesapSifirla();
    HesapAyariServisi._sifirla();
  });

  it('disk boşsa Diyanet (eski kurulumlar değişmez)', async () => {
    await HesapAyariServisi.hazir();
    expect(aktifHesapAyari()).toEqual({ profil: 'diyanet' });
  });

  it('diskteki ayarı etkin yapar', async () => {
    disk[DEPOLAMA_ANAHTARLARI.HESAP_AYARI] = { profil: 'jakim', ofsetler: { aksam: 2 } };
    await HesapAyariServisi.hazir();
    expect(aktifHesapAyari()).toEqual({ profil: 'jakim', ofsetler: { aksam: 2 } });
  });

  it('kaydet: vakti etkileyen değişiklikte true, yalnız soru hafızasında false döner', async () => {
    await HesapAyariServisi.hazir();
    expect(await HesapAyariServisi.kaydet({ profil: 'diyanet', sorulanUlkeler: ['MY'] })).toBe(false);
    expect(await HesapAyariServisi.kaydet({ profil: 'jakim', sorulanUlkeler: ['MY'] })).toBe(true);
    expect(disk[DEPOLAMA_ANAHTARLARI.HESAP_AYARI]).toEqual({ profil: 'jakim', sorulanUlkeler: ['MY'] });
    expect((await HesapAyariServisi.yukle()).profil).toBe('jakim');
  });
});
