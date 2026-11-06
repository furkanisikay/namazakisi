import { gunMetni } from '../kazaMetinleri';
import { aktifDiliKur, aktifDilSifirla } from '../../../../core/dil/aktifDil';

describe('gunMetni', () => {
  afterEach(() => aktifDilSifirla());

  it('Türkçede gün ve ay adı', () => {
    expect(gunMetni('2026-10-14')).toBe('14 Ekim');
  });

  // NÖBETÇİ: ay adı tarih içi biçimden (ilgi hâli), yalın hâlden değil ("14 Октябрь" yanlış).
  it('ilgi hâli kullanan dillerde ay tarih içi biçimde', () => {
    aktifDiliKur('ru');
    expect(gunMetni('2026-10-14')).toBe('14 октября');
    aktifDiliKur('hr');
    expect(gunMetni('2026-10-14')).toMatch(/listopada/);
    aktifDiliKur('uk');
    expect(gunMetni('2026-10-14')).toMatch(/жовтня/);
  });

  it('geçersiz tarih olduğu gibi döner', () => {
    expect(gunMetni('yok')).toBe('yok');
  });
});
