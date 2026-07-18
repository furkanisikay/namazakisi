import { sesDosyasiniCoz } from '../sesDosyasi';
import { SES_PALETI, VARSAYILAN_SES } from '../matrisTipleri';

describe('sesDosyasiniCoz', () => {
  it('paletteki her id icin calinabilir bir kaynak dondurur', () => {
    for (const ses of SES_PALETI) {
      const kaynak = sesDosyasiniCoz(ses.id);
      expect(kaynak).toBeDefined();
      expect(kaynak).not.toBeNull();
    }
  });

  it('bilinmeyen/bos id sessizce varsayilana duser (kullanici hicbir sey duymamamali)', () => {
    const varsayilan = sesDosyasiniCoz(VARSAYILAN_SES);
    expect(sesDosyasiniCoz('boyle-bir-ses-yok')).toBe(varsayilan);
    expect(sesDosyasiniCoz('')).toBe(varsayilan);
  });

  it('gercek palet dosyalari eklenene kadar tum idler ayni dosyaya coz{ul}ur', () => {
    // NOT: bu bir SPEC degil, bugunun DURUM tespitidir. Palet dosyalari
    // eklendiginde bu test guncellenmelidir (sesDosyasi.ts'teki harita degisir).
    const kaynaklar = SES_PALETI.map((s) => sesDosyasiniCoz(s.id));
    expect(new Set(kaynaklar).size).toBe(1);
  });
});
