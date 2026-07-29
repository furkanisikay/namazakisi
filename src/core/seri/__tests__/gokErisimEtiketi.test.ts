import { gokErisimEtiketi } from '../gokErisimEtiketi';
import { GunDurumu, IzgaraGunu } from '../aylikIzgara';

const gun = (tarih: string, durum: GunDurumu): IzgaraGunu => ({
  tarih,
  gunNo: Number(tarih.slice(-2)),
  digerAy: false,
  durum,
});

const kilinanSayi = (tarih: string, sayi: number): IzgaraGunu => {
  const vakitler = Array.from({ length: 5 }, (_, i) => i < sayi);
  return gun(tarih, { tip: 'kilindi', vakitler });
};

const dondurulmus = (tarih: string): IzgaraGunu => gun(tarih, { tip: 'dondurulmus' });
const gelecek = (tarih: string): IzgaraGunu => gun(tarih, { tip: 'gelecek' });

describe('gokErisimEtiketi', () => {
  test('bos ayda cokmez, sayilar sifir olur', () => {
    const etiket = gokErisimEtiketi([], 'Temmuz 2026', 0, 5);
    expect(etiket).toBe(
      'Temmuz 2026. 0 gün hedef tutuldu, 0 günde beş vakit tamamlandı, 0 gün dondurulmuş. Mevcut seri 0 gün.'
    );
  });

  test('dolu bir ayda uc kategoriyi de dogru sayar', () => {
    const izgara: IzgaraGunu[] = [
      kilinanSayi('2026-07-01', 5), // bes vakit tamamlandi
      kilinanSayi('2026-07-02', 5), // bes vakit tamamlandi
      kilinanSayi('2026-07-03', 3), // hedef tutuldu (esik=3, 5 degil)
      kilinanSayi('2026-07-04', 1), // esigin altinda - sayilmaz
      dondurulmus('2026-07-05'),
      gelecek('2026-07-06'), // henuz yasanmadi - sayilmaz
    ];

    const etiket = gokErisimEtiketi(izgara, 'Temmuz 2026', 15, 3);

    expect(etiket).toBe(
      'Temmuz 2026. 1 gün hedef tutuldu, 2 günde beş vakit tamamlandı, 1 gün dondurulmuş. Mevcut seri 15 gün.'
    );
  });

  test('dondurulmus gunlu bir ayda dondurulmus sayaci artar, kilinmislik sayilmaz', () => {
    const izgara: IzgaraGunu[] = [
      dondurulmus('2026-08-01'),
      dondurulmus('2026-08-02'),
      kilinanSayi('2026-08-03', 5),
    ];

    const etiket = gokErisimEtiketi(izgara, 'Ağustos 2026', 4, 5);

    expect(etiket).toBe(
      'Ağustos 2026. 0 gün hedef tutuldu, 1 günde beş vakit tamamlandı, 2 gün dondurulmuş. Mevcut seri 4 gün.'
    );
  });

  test('mevcutSeri metne dogrudan yansitilir', () => {
    const etiket = gokErisimEtiketi([], 'Eylül 2026', 42, 5);
    expect(etiket).toContain('Mevcut seri 42 gün.');
  });

  test('komsu ay gunleri (digerAy:true) de sayima katilir - panelle tutarli olsun diye', () => {
    // Gok paneli komsu ayin gunlerini soluk ama GERCEK gosterir (spec "Ay siniri
    // tanimaz"); ozet de onlari saymazsa ekran okuyucu kullanicisi panelde gorunen
    // hucre sayisiyla duydugu sayinin tutmadigini fark eder.
    const komsuAyGunu = (tarih: string, sayi: number): IzgaraGunu => ({
      tarih,
      gunNo: Number(tarih.slice(-2)),
      digerAy: true,
      durum: { tip: 'kilindi', vakitler: Array.from({ length: 5 }, (_, i) => i < sayi) },
    });

    const izgara: IzgaraGunu[] = [
      komsuAyGunu('2026-06-29', 5), // onceki aydan, bes vakit tamamlandi
      komsuAyGunu('2026-06-30', 3), // onceki aydan, hedef tutuldu (esik=3)
      kilinanSayi('2026-07-01', 5),
    ];

    const etiket = gokErisimEtiketi(izgara, 'Temmuz 2026', 3, 3);

    expect(etiket).toBe(
      'Temmuz 2026. 1 gün hedef tutuldu, 2 günde beş vakit tamamlandı, 0 gün dondurulmuş. Mevcut seri 3 gün.'
    );
  });
});
