import { renderHook } from '@testing-library/react-native';
import { konumMetniHesapla, useKonumMetni } from '../useKonumMetni';

describe('konumMetniHesapla', () => {
  it('oto + gpsAdres (ilçe+il) → "ilçe, il"', () => {
    expect(
      konumMetniHesapla({ konumModu: 'oto', gpsAdres: { ilce: 'Kadıköy', il: 'İstanbul' } } as any)
    ).toBe('Kadıköy, İstanbul');
  });

  it('oto + gpsAdres yok → "Konum takip ediliyor"', () => {
    expect(konumMetniHesapla({ konumModu: 'oto', gpsAdres: null } as any)).toBe('Konum takip ediliyor');
  });

  // --- oto modu kısmî adres dalları (satır 13: return ilce || il || fallback) ---
  // Bu dallar, "ilçe, il" virgüllü birleştirme (satır 12) ile tek-alan dönüşü
  // arasındaki ayrımı sabitler; biri bozulursa (ör. her durumda virgüllü birleştirme
  // yapılırsa "Beşiktaş, " gibi sondan virgüllü bozuk metin çıkar) bu testler yakalar.
  it('oto + gpsAdres yalnız ilçe dolu (il boş) → sadece "ilçe" (virgül yok)', () => {
    expect(
      konumMetniHesapla({ konumModu: 'oto', gpsAdres: { ilce: 'Beşiktaş', il: '' } } as any)
    ).toBe('Beşiktaş');
  });

  it('oto + gpsAdres yalnız il dolu (ilçe boş) → sadece "il" (ilce||il sıralaması)', () => {
    expect(
      konumMetniHesapla({ konumModu: 'oto', gpsAdres: { ilce: '', il: 'İzmir' } } as any)
    ).toBe('İzmir');
  });

  it('oto + gpsAdres var ama ilçe ve il ikisi de boş → "GPS konumu alındı" (kanonik fallback)', () => {
    expect(
      konumMetniHesapla({ konumModu: 'oto', gpsAdres: { ilce: '', il: '' } } as any)
    ).toBe('GPS konumu alındı');
  });

  it('manuel + seçili il/ilçe → "ilçe, il"', () => {
    expect(
      konumMetniHesapla({ konumModu: 'manuel', seciliIlceAdi: 'Çankaya', seciliIlAdi: 'Ankara' } as any)
    ).toBe('Çankaya, Ankara');
  });

  // --- manuel modu kısmî seçim dalı (satır 20: return seciliIlAdi || fallback) ---
  // Yalnızca il seçili, ilçe seçilmemiş: il bazında il geneli seçim. Mevcut testler
  // yalnız "ikisi de dolu" veya "ikisi de boş" senaryosunu kapsıyordu; bu ara durum
  // (ilçe boş ama il dolu) sadece "il" döndürmeli, virgüllü birleştirmeye düşmemeli.
  it('manuel + yalnız il seçili (ilçe boş) → sadece "il" (virgül/fallback yok)', () => {
    expect(
      konumMetniHesapla({ konumModu: 'manuel', seciliIlceAdi: '', seciliIlAdi: 'Bursa' } as any)
    ).toBe('Bursa');
  });

  it('hiçbiri → "Konum seçilmedi" (kanonik metin)', () => {
    expect(
      konumMetniHesapla({ konumModu: 'manuel', seciliIlceAdi: '', seciliIlAdi: '' } as any)
    ).toBe('Konum seçilmedi');
  });
});

describe('useKonumMetni (memoize edilmiş hook sarmalayıcı)', () => {
  it('aynı girdi referansıyla yeniden render edildiğinde aynı metni döndürür (memoize)', () => {
    const ayarlar = { konumModu: 'manuel', seciliIlceAdi: 'Çankaya', seciliIlAdi: 'Ankara' } as any;
    const { result, rerender } = renderHook((p: any) => useKonumMetni(p), { initialProps: ayarlar });

    expect(result.current).toBe('Çankaya, Ankara');

    // Aynı obje referansıyla yeniden render: useMemo bağımlılığı değişmediğinden
    // sonuç aynı (string) kalmalı.
    rerender(ayarlar);
    expect(result.current).toBe('Çankaya, Ankara');
  });

  it('girdi referansı değişince yeniden hesaplar (useMemo bağımlılığı girdiye bağlı)', () => {
    const ilk = { konumModu: 'manuel', seciliIlceAdi: 'Çankaya', seciliIlAdi: 'Ankara' } as any;
    const { result, rerender } = renderHook((p: any) => useKonumMetni(p), { initialProps: ilk });

    expect(result.current).toBe('Çankaya, Ankara');

    // Yeni referans + farklı içerik: bağımlılık değiştiği için yeniden hesaplanmalı.
    // useMemo deps yanlışlıkla sabitlenseydi (ör. []), eski metin takılı kalır ve
    // bu assertion FAIL ederdi.
    rerender({ konumModu: 'oto', gpsAdres: { ilce: 'Kadıköy', il: 'İstanbul' } } as any);
    expect(result.current).toBe('Kadıköy, İstanbul');
  });
});
