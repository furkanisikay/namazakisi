import { tumVakitlereUygula, presetUygula, zamanlamaDegistiMi } from '../matrisIslemleri';
import { MUHAFIZ_VAKITLERI } from '../matrisTipleri';
import type { MuhafizMatrisi, SeviyeAyari, UyariModu, VakitMuhafizAyari } from '../matrisTipleri';

const sv = (esikDk: number, mod: UyariModu = 'bildirim', ses = 'can'): SeviyeAyari =>
  ({ kademe: 'nazik', mod, esikDk, siklik: 'birkez', bildirimSesi: ses, anonsMetni: '' });
const vakit = (esik: number): VakitMuhafizAyari => ({ seviyeler: [sv(esik), sv(esik - 5), sv(esik - 10), sv(esik - 15)] });
const matris = (): MuhafizMatrisi =>
  Object.fromEntries(MUHAFIZ_VAKITLERI.map((v) => [v, vakit(30)])) as MuhafizMatrisi;

describe('tumVakitlereUygula', () => {
  test('kaynak vaktin ayarını tüm vakitlere kopyalar', () => {
    const m = matris();
    m.ikindi = vakit(60);
    const sonuc = tumVakitlereUygula(m, 'ikindi');
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(sonuc[v].seviyeler[0].esikDk).toBe(60);
    }
  });
  test('derin kopya: sonucu değiştirmek kaynağı bozmaz', () => {
    const m = matris();
    const sonuc = tumVakitlereUygula(m, 'ikindi');
    sonuc.ogle.seviyeler[0].esikDk = 999;
    expect(sonuc.ikindi.seviyeler[0].esikDk).not.toBe(999);
  });
});

describe('presetUygula', () => {
  test('yalnız eşik/sıklık değişir, mod/ses korunur', () => {
    const m = matris();
    m.ogle.seviyeler[0].mod = 'ikisi';
    m.ogle.seviyeler[0].bildirimSesi = 'alarm';
    const esikler = { nazik: 45, uyari: 25, sert: 10, acil: 3 };
    const sikliklar = { nazik: 20, uyari: 10, sert: 5, acil: 2 };
    const sonuc = presetUygula(m, esikler, sikliklar);
    expect(sonuc.ogle.seviyeler[0].esikDk).toBe(45);
    expect(sonuc.ogle.seviyeler[0].mod).toBe('ikisi');       // korundu
    expect(sonuc.ogle.seviyeler[0].bildirimSesi).toBe('alarm'); // korundu
  });
});

describe('zamanlamaDegistiMi (spec 4.1 elle-değişiklik → ozel)', () => {
  test('eşik değişince true', () => {
    const a = matris(); const b = matris(); b.ogle.seviyeler[0].esikDk = 99;
    expect(zamanlamaDegistiMi(a, b)).toBe(true);
  });
  test('sıklık değişince true', () => {
    const a = matris(); const b = matris(); b.ikindi.seviyeler[1].siklik = { herDk: 7 };
    expect(zamanlamaDegistiMi(a, b)).toBe(true);
  });
  test('yalnız mod/ses değişince false (zamanlama ekseni değil)', () => {
    const a = matris(); const b = matris();
    b.aksam.seviyeler[0].mod = 'sesli'; b.aksam.seviyeler[0].bildirimSesi = 'alarm';
    expect(zamanlamaDegistiMi(a, b)).toBe(false);
  });
  test('aynı matris false', () => {
    expect(zamanlamaDegistiMi(matris(), matris())).toBe(false);
  });
});
