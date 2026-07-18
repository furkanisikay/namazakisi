import { vakitOzetiOlustur, aktifSeviyeSayisi } from '../vakitOzeti';
import type { SeviyeAyari, UyariModu, VakitMuhafizAyari } from '../matrisTipleri';

const sv = (esikDk: number, mod: UyariModu): SeviyeAyari => ({
  kademe: 'nazik', mod, esikDk, siklik: 'birkez', bildirimSesi: 'can', anonsMetni: '',
});
const vakit = (...seviyeler: SeviyeAyari[]): VakitMuhafizAyari => ({ seviyeler });

describe('vakitOzetiOlustur', () => {
  test('tüm seviyeler sessizse "Kapalı"', () => {
    expect(vakitOzetiOlustur(vakit(sv(45, 'sessiz'), sv(25, 'sessiz')))).toBe('Kapalı');
  });

  test('yalnız bildirim modları → "Sadece bildirim" + en erken eşik', () => {
    expect(vakitOzetiOlustur(vakit(sv(45, 'bildirim'), sv(25, 'bildirim'))))
      .toBe('Sadece bildirim · 45 dk kala başlar');
  });

  test('yalnız sesli modları → "Sadece sesli anons"', () => {
    expect(vakitOzetiOlustur(vakit(sv(30, 'sesli'), sv(10, 'sesli'))))
      .toBe('Sadece sesli anons · 30 dk kala başlar');
  });

  test('bildirim + sesli karışımı → "Sesli + bildirim"', () => {
    expect(vakitOzetiOlustur(vakit(sv(60, 'bildirim'), sv(20, 'sesli'))))
      .toBe('Sesli + bildirim · 60 dk kala başlar');
  });

  test('tek başına "ikisi" modu hem bildirim hem sesli sayılır', () => {
    expect(vakitOzetiOlustur(vakit(sv(15, 'ikisi')))).toBe('Sesli + bildirim · 15 dk kala başlar');
  });

  test('sessiz seviye en erken eşiği belirlemez', () => {
    // 90 sessiz -> özet 45'ten başlamalı
    expect(vakitOzetiOlustur(vakit(sv(90, 'sessiz'), sv(45, 'bildirim'))))
      .toBe('Sadece bildirim · 45 dk kala başlar');
  });
});

describe('aktifSeviyeSayisi', () => {
  test('sessiz olmayanları sayar', () => {
    expect(aktifSeviyeSayisi(vakit(sv(45, 'bildirim'), sv(25, 'sessiz'), sv(10, 'ikisi')))).toBe(2);
  });
  test('hepsi sessizse 0', () => {
    expect(aktifSeviyeSayisi(vakit(sv(45, 'sessiz')))).toBe(0);
  });
});
