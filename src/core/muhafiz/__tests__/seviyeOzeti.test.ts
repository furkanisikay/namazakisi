import { seviyeOzetiOlustur } from '../seviyeOzeti';
import type { SeviyeAyari } from '../matrisTipleri';
import { VARSAYILAN_SES } from '../matrisTipleri';

const OZEL_SES = 'content://media/internal/audio/media/42';

const temel = (o: Partial<SeviyeAyari>): SeviyeAyari => ({
  kademe: 'nazik', mod: 'bildirim', esikDk: 30, siklik: 'birkez',
  bildirimSesi: VARSAYILAN_SES, anonsMetni: '', ...o,
});

describe('seviyeOzetiOlustur', () => {
  test('sessiz mod: yalnız "Sessiz"', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'sessiz' }))).toBe('Sessiz');
  });
  test('bildirim: eşik + bildirim + ses adı', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'bildirim', esikDk: 30 })))
      .toBe('30 dk kala · bildirim · Uygulama sesi');
  });
  test('kullanıcının seçtiği sesin ADI gösterilir', () => {
    expect(seviyeOzetiOlustur(temel({ esikDk: 30, bildirimSesi: OZEL_SES, sesAdi: 'Hızır' })))
      .toBe('30 dk kala · bildirim · Hızır');
  });
  test('ad çözülemediyse HAM content:// URI GÖSTERİLMEZ (kullanıcıya hiçbir şey anlatmaz)', () => {
    const ozet = seviyeOzetiOlustur(temel({ bildirimSesi: OZEL_SES }));
    expect(ozet).not.toContain('content://');
    expect(ozet).toBe('30 dk kala · bildirim · Seçtiğiniz ses');
  });
  test('ESKİ palet id de kibar yedek metne düşer (göç gerekmez)', () => {
    expect(seviyeOzetiOlustur(temel({ bildirimSesi: 'melodi' })))
      .toBe('30 dk kala · bildirim · Uygulama sesi');
  });
  test('ikisi: bildirim + sesli anons + ses adı', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'ikisi', esikDk: 15, bildirimSesi: OZEL_SES, sesAdi: 'Melodi 3' })))
      .toBe('15 dk kala · bildirim + sesli anons · Melodi 3');
  });
  test('sesli: yalnız sesli anons (ses adı yok)', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'sesli', esikDk: 8 })))
      .toBe('8 dk kala · sesli anons');
  });
});
