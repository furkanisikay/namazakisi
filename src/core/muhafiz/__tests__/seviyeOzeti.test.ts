import { seviyeOzetiOlustur } from '../seviyeOzeti';
import type { SeviyeAyari } from '../matrisTipleri';

const temel = (o: Partial<SeviyeAyari>): SeviyeAyari => ({
  kademe: 'nazik', mod: 'bildirim', esikDk: 30, siklik: 'birkez', bildirimSesi: 'can', anonsMetni: '', ...o,
});

describe('seviyeOzetiOlustur', () => {
  test('sessiz mod: yalnız "Sessiz"', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'sessiz' }))).toBe('Sessiz');
  });
  test('bildirim: eşik + bildirim + ses adı', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'bildirim', esikDk: 30, bildirimSesi: 'can' })))
      .toBe('30 dk kala · bildirim · Çan');
  });
  test('ikisi: bildirim + sesli anons + ses adı', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'ikisi', esikDk: 15, bildirimSesi: 'melodi' })))
      .toBe('15 dk kala · bildirim + sesli anons · Melodi');
  });
  test('sesli: yalnız sesli anons (ses adı yok)', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'sesli', esikDk: 8 })))
      .toBe('8 dk kala · sesli anons');
  });
});
