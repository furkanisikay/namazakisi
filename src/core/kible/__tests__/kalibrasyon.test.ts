import { kalibrasyonNedeni, sonsuzlukYolu } from '../kalibrasyon';
import { yonKalitesi } from '../yonFiltresi';

describe('kalibrasyonNedeni', () => {
  it('yalnız veri güvenilmezken bir neden döner; alan bozulması önceliklidir', () => {
    expect(kalibrasyonNedeni({ dogruluk: 3, alanBozuk: false, tutarsiz: false })).toBeNull();
    expect(kalibrasyonNedeni({ dogruluk: 2, alanBozuk: false, tutarsiz: false })).toBeNull();
    expect(kalibrasyonNedeni({ dogruluk: null, alanBozuk: false, tutarsiz: false })).toBeNull();
    expect(kalibrasyonNedeni({ dogruluk: 1, alanBozuk: false, tutarsiz: false })).toBe('dogruluk');
    expect(kalibrasyonNedeni({ dogruluk: 0, alanBozuk: false, tutarsiz: false })).toBe('dogruluk');
    expect(kalibrasyonNedeni({ dogruluk: 3, alanBozuk: false, tutarsiz: true })).toBe('tutarsiz');
    expect(kalibrasyonNedeni({ dogruluk: 0, alanBozuk: true, tutarsiz: true })).toBe('alan');
  });
});

describe('yonKalitesi', () => {
  it('en zayıf halka belirler', () => {
    expect(yonKalitesi({ alanUt: 48, sapmaRms: 1 }, 3)).toBe(1);
    expect(yonKalitesi({ alanUt: 48, sapmaRms: 1 }, 1)).toBeCloseTo(0.35, 6);
    expect(yonKalitesi({ alanUt: 290, sapmaRms: 1 }, 3)).toBe(0);
    expect(yonKalitesi({ alanUt: 48, sapmaRms: 6 }, null)).toBeCloseTo(0.5, 6);
    expect(yonKalitesi({ alanUt: null, sapmaRms: 0 }, null)).toBe(1);
  });
});

describe('sonsuzlukYolu', () => {
  const yol = sonsuzlukYolu(168, 72);

  it('kutuya sığar ve iki lobu vardır (merkezden iki kez geçer)', () => {
    for (let i = 0; i < yol.x.length; i++) {
      expect(yol.x[i]).toBeGreaterThanOrEqual(0);
      expect(yol.x[i]).toBeLessThanOrEqual(168);
      expect(yol.y[i]).toBeGreaterThanOrEqual(0);
      expect(yol.y[i]).toBeLessThanOrEqual(72);
    }
    const merkezYakin = yol.x.filter((x, i) => Math.abs(x - 84) < 3 && Math.abs(yol.y[i] - 36) < 3).length;
    expect(merkezYakin).toBeGreaterThanOrEqual(2);
  });

  it('örnekler yay uzunluğuna göre eşit aralıklı (silüet sabit hızla ilerler)', () => {
    const adimlar = yol.x.map((x, i) => {
      const j = (i + 1) % yol.x.length;
      return Math.hypot(yol.x[j] - x, yol.y[j] - yol.y[i]);
    });
    const beklenen = yol.uzunluk / yol.x.length;
    for (const a of adimlar) expect(Math.abs(a - beklenen) / beklenen).toBeLessThan(0.05);
  });

  it('path dizesi kapalı', () => {
    expect(yol.d.startsWith('M')).toBe(true);
    expect(yol.d.endsWith('Z')).toBe(true);
  });
});
