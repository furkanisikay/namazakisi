import { vakitOzetiOlustur, aktifSeviyeSayisi } from '../vakitOzeti';
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

describe('vakitOzetiOlustur', () => {
  test('tüm adımlar kapalıysa "Kapalı"', () => {
    expect(vakitOzetiOlustur(vakit(sv(45, KAPALI), sv(25, KAPALI)))).toBe('Kapalı');
  });

  test('yalnız bildirim kanalı → "Sadece bildirim" + en erken eşik', () => {
    expect(vakitOzetiOlustur(vakit(sv(45, BILDIRIM), sv(25, BILDIRIM))))
      .toBe('Sadece bildirim · 45 dk kala başlar');
  });

  test('yalnız sesli kanalı → "Sadece sesli anons"', () => {
    expect(vakitOzetiOlustur(vakit(sv(30, SESLI), sv(10, SESLI))))
      .toBe('Sadece sesli anons · 30 dk kala başlar');
  });

  test('bildirim + sesli karışımı → "Sesli + bildirim"', () => {
    expect(vakitOzetiOlustur(vakit(sv(60, BILDIRIM), sv(20, SESLI))))
      .toBe('Sesli + bildirim · 60 dk kala başlar');
  });

  test('bildirim + sesli birlikte açık adım hem bildirim hem sesli sayılır', () => {
    expect(vakitOzetiOlustur(vakit(sv(15, IKISI)))).toBe('Sesli + bildirim · 15 dk kala başlar');
  });

  test('kapalı adım en erken eşiği belirlemez', () => {
    // 90 kapalı -> özet 45'ten başlamalı
    expect(vakitOzetiOlustur(vakit(sv(90, KAPALI), sv(45, BILDIRIM))))
      .toBe('Sadece bildirim · 45 dk kala başlar');
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
      .toBe('Sadece bildirim · girişten 5 dk sonra başlar');
  });

  test('kapalı adımlar giriş yönünde de sayılmaz', () => {
    expect(vakitOzetiOlustur(girisVakti(sv(5, KAPALI), sv(20, IKISI))))
      .toBe('Sesli + bildirim · girişten 20 dk sonra başlar');
  });

  test('tüm adımlar kapalıysa yine "Kapalı"', () => {
    expect(vakitOzetiOlustur(girisVakti(sv(5, KAPALI)))).toBe('Kapalı');
  });
});
