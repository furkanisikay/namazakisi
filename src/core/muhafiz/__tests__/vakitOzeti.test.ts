import { vakitOzetiOlustur, vakitOzetiVerisi, aktifSeviyeSayisi } from '../vakitOzeti';
import type { SeviyeAyari, UyariKanallari, VakitMuhafizAyari } from '../matrisTipleri';

/** Kanal kümesi kısayolları (Faz 2: `mod` enum'unun yerini aldı). */
const KAPALI = {};
const BILDIRIM = { bildirim: true };
const SESLI = { sesli: true };
const IKISI = { bildirim: true, sesli: true };

const sv = (esikDk: number, kanallar: UyariKanallari): SeviyeAyari => ({
  kademe: 'nazik', kanallar, esikDk, siklik: 'birkez', bildirimSesi: 'can', anonsMetni: '',
});
const vakit = (...seviyeler: SeviyeAyari[]): VakitMuhafizAyari => ({ seviyeler });
const girisVakti = (...seviyeler: SeviyeAyari[]): VakitMuhafizAyari =>
  ({ seviyeler, yon: 'girisindenItibaren' });

describe('vakitOzetiOlustur (ekran okuyucu cümlesi)', () => {
  test('tüm adımlar kapalıysa "Kapalı"', () => {
    expect(vakitOzetiOlustur(vakit(sv(45, KAPALI), sv(25, KAPALI)))).toBe('Kapalı');
  });

  test('yalnız bildirim → en erken eşik + "bildirim"', () => {
    expect(vakitOzetiOlustur(vakit(sv(45, BILDIRIM), sv(25, BILDIRIM))))
      .toBe('45 dk kala başlar: bildirim');
  });

  test('yalnız sesli okuma', () => {
    expect(vakitOzetiOlustur(vakit(sv(30, SESLI), sv(10, SESLI))))
      .toBe('30 dk kala başlar: sesli okuma');
  });

  test('bildirim + sesli karışımı birleşim olarak okunur', () => {
    expect(vakitOzetiOlustur(vakit(sv(60, BILDIRIM), sv(20, SESLI))))
      .toBe('60 dk kala başlar: bildirim ve sesli okuma');
  });

  test('bildirim + sesli birlikte açık adım hem bildirim hem sesli sayılır', () => {
    expect(vakitOzetiOlustur(vakit(sv(15, IKISI)))).toBe('15 dk kala başlar: bildirim ve sesli okuma');
  });

  test('kapalı adım en erken eşiği belirlemez', () => {
    // 90 kapalı -> özet 45'ten başlamalı
    expect(vakitOzetiOlustur(vakit(sv(90, KAPALI), sv(45, BILDIRIM))))
      .toBe('45 dk kala başlar: bildirim');
  });

  test('cümlede orta nokta ayracı YOK (görsel dil: ikon çipleri)', () => {
    expect(vakitOzetiOlustur(vakit(sv(15, { ...IKISI, titresim: true, alarm: true })))).not.toContain('·');
  });
});

describe('vakitOzetiVerisi — yapısal özet (ikon çipleri)', () => {
  test('kanallar açık adımların BİRLEŞİMİDİR, gösterim sırasında', () => {
    const ozet = vakitOzetiVerisi(vakit(
      sv(45, { alarm: true, bildirim: true }),
      sv(10, { titresim: true, sesli: true }),
    ));
    expect(ozet).toEqual({ kapali: false, baslangic: '45 dk kala', kanallar: ['bildirim', 'sesli', 'titresim', 'alarm'] });
  });
  test('kapalı adımın kanalı birleşime girmez', () => {
    expect(vakitOzetiVerisi(vakit(sv(45, KAPALI), sv(10, SESLI))).kanallar).toEqual(['sesli']);
  });
  test('hepsi kapalıysa boş', () => {
    expect(vakitOzetiVerisi(vakit(sv(45, KAPALI)))).toEqual({ kapali: true, baslangic: '', kanallar: [] });
  });
});

describe('aktifSeviyeSayisi', () => {
  test('açık adımları sayar', () => {
    expect(aktifSeviyeSayisi(vakit(sv(45, BILDIRIM), sv(25, KAPALI), sv(10, IKISI)))).toBe(2);
  });
  test('hepsi kapalıysa 0', () => {
    expect(aktifSeviyeSayisi(vakit(sv(45, KAPALI)))).toBe(0);
  });
});

describe('vakitOzetiOlustur — giriş yönü', () => {
  /**
   * Giriş yönünde eskalasyon TERSİNE döner: ilk uyarı en KÜÇÜK eşikte çalar
   * (vakit girdikten 5 dk sonra), çıkışta ise en BÜYÜK eşikte. Math.max'i olduğu
   * gibi bırakmak "45 dk sonra başlar" der ama motor 5. dakikada konuşur.
   */
  test('ilk uyarı EN KÜÇÜK eşiktir ve "girişten N dk sonra başlar" denir', () => {
    expect(vakitOzetiOlustur(girisVakti(sv(5, BILDIRIM), sv(45, BILDIRIM))))
      .toBe('girişten 5 dk sonra başlar: bildirim');
  });

  test('kapalı adımlar giriş yönünde de sayılmaz', () => {
    expect(vakitOzetiOlustur(girisVakti(sv(5, KAPALI), sv(20, IKISI))))
      .toBe('girişten 20 dk sonra başlar: bildirim ve sesli okuma');
  });

  test('tüm adımlar kapalıysa yine "Kapalı"', () => {
    expect(vakitOzetiOlustur(girisVakti(sv(5, KAPALI)))).toBe('Kapalı');
  });
});
