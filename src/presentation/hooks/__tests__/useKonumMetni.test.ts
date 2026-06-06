import { konumMetniHesapla } from '../useKonumMetni';

describe('konumMetniHesapla', () => {
  it('oto + gpsAdres (ilçe+il) → "ilçe, il"', () => {
    expect(
      konumMetniHesapla({ konumModu: 'oto', gpsAdres: { ilce: 'Kadıköy', il: 'İstanbul' } } as any)
    ).toBe('Kadıköy, İstanbul');
  });

  it('oto + gpsAdres yok → "Konum takip ediliyor"', () => {
    expect(konumMetniHesapla({ konumModu: 'oto', gpsAdres: null } as any)).toBe('Konum takip ediliyor');
  });

  it('manuel + seçili il/ilçe → "ilçe, il"', () => {
    expect(
      konumMetniHesapla({ konumModu: 'manuel', seciliIlceAdi: 'Çankaya', seciliIlAdi: 'Ankara' } as any)
    ).toBe('Çankaya, Ankara');
  });

  it('hiçbiri → "Konum seçilmedi" (kanonik metin)', () => {
    expect(
      konumMetniHesapla({ konumModu: 'manuel', seciliIlceAdi: '', seciliIlAdi: '' } as any)
    ).toBe('Konum seçilmedi');
  });
});
