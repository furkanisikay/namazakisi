import { Platform } from 'react-native';
import { YENI_OZELLIKLER } from '../../../core/constants/YeniOzellikler';
import { yeniOzellikGorunurMu } from '../yeniOzellikYetenegi';

const siri = require('../../../../modules/expo-siri-kisayollari/src') as {
  canliEtkinlikDestekli: jest.Mock;
  saatUygulamasiDestekli: jest.Mock;
};
const widget = YENI_OZELLIKLER.find((o) => o.id === 'ios-widget-canli-etkinlik')!;

describe('yeni özellik yeteneği (#295)', () => {
  afterEach(() => siri.canliEtkinlikDestekli.mockReturnValue(false));

  it('yeteneksiz, iki platformlu duyuru her yerde görünür', () => {
    const ortak = { ...widget, yetenek: undefined, platformlar: ['android', 'ios'] as const };
    jest.replaceProperty(Platform, 'OS', 'android');
    expect(yeniOzellikGorunurMu({ ...ortak, platformlar: [...ortak.platformlar] })).toBe(true);
    jest.replaceProperty(Platform, 'OS', 'ios');
    expect(yeniOzellikGorunurMu({ ...ortak, platformlar: [...ortak.platformlar] })).toBe(true);
  });

  it('iPhone widget duyurusu Android\'de görünmez', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    siri.canliEtkinlikDestekli.mockReturnValue(true);
    expect(yeniOzellikGorunurMu(widget)).toBe(false);
  });

  it('iOS\'ta yalnız uzantıyı taşıyan build\'de görünür (bayrak kapalıyken duyuru yok)', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    siri.canliEtkinlikDestekli.mockReturnValue(false);
    expect(yeniOzellikGorunurMu(widget)).toBe(false);
    siri.canliEtkinlikDestekli.mockReturnValue(true);
    expect(yeniOzellikGorunurMu(widget)).toBe(true);
  });
});

describe('yeni özellik yeteneği — Apple Watch (#285)', () => {
  const saat = YENI_OZELLIKLER.find((o) => o.id === 'apple-watch-uygulamasi')!;
  afterEach(() => siri.saatUygulamasiDestekli.mockReturnValue(false));

  it('duyuru saat yeteneğine bağlı', () => {
    expect(saat.yetenek).toBe('appleWatch');
  });

  it('Android\'de görünmez', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    siri.saatUygulamasiDestekli.mockReturnValue(true);
    expect(yeniOzellikGorunurMu(saat)).toBe(false);
  });

  it('iOS\'ta yalnız saat hedefini taşıyan build\'de görünür; widget yeteneği onu AÇMAZ', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    siri.canliEtkinlikDestekli.mockReturnValue(true);
    siri.saatUygulamasiDestekli.mockReturnValue(false);
    expect(yeniOzellikGorunurMu(saat)).toBe(false);
    siri.saatUygulamasiDestekli.mockReturnValue(true);
    expect(yeniOzellikGorunurMu(saat)).toBe(true);
    siri.canliEtkinlikDestekli.mockReturnValue(false);
  });
});

describe('yeni özellik platformu', () => {
  const ornek = YENI_OZELLIKLER.find((o) => o.id === 'sade-gorunum')!;

  it('yalnız Android\'e gelen özellik iPhone\'da görünmez', () => {
    const android = { ...ornek, platformlar: ['android' as const] };
    jest.replaceProperty(Platform, 'OS', 'ios');
    expect(yeniOzellikGorunurMu(android)).toBe(false);
    jest.replaceProperty(Platform, 'OS', 'android');
    expect(yeniOzellikGorunurMu(android)).toBe(true);
  });

  it('yalnız iPhone\'a gelen özellik Android\'de görünmez', () => {
    const ios = { ...ornek, platformlar: ['ios' as const] };
    jest.replaceProperty(Platform, 'OS', 'android');
    expect(yeniOzellikGorunurMu(ios)).toBe(false);
    jest.replaceProperty(Platform, 'OS', 'ios');
    expect(yeniOzellikGorunurMu(ios)).toBe(true);
  });

  it('boş ya da bozuk platform listesi duyuruyu gizler', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    expect(yeniOzellikGorunurMu({ ...ornek, platformlar: [] })).toBe(false);
    expect(yeniOzellikGorunurMu({ ...ornek, platformlar: undefined as never })).toBe(false);
  });

  it('katalogdaki her duyuru geçerli bir platform listesi taşır', () => {
    for (const o of YENI_OZELLIKLER) {
      expect(o.platformlar.length).toBeGreaterThan(0);
      expect(new Set(o.platformlar).size).toBe(o.platformlar.length);
      for (const p of o.platformlar) expect(['android', 'ios']).toContain(p);
    }
  });

  it('iOS yetenekli duyurular yalnız iOS\'a işaretlidir', () => {
    for (const o of YENI_OZELLIKLER.filter((x) => x.yetenek)) {
      expect(o.platformlar).toEqual(['ios']);
    }
  });

  it('platforma özgü bilinen duyurular doğru işaretli', () => {
    const bul = (id: string) => YENI_OZELLIKLER.find((o) => o.id === id)!.platformlar;
    expect(bul('gercek-alarm-iphone')).toEqual(['ios']);
    expect(bul('ios-siri-kisayollar-odak')).toEqual(['ios']);
    expect(bul('gercek-alarm')).toEqual(['android']);
    expect(bul('camideyim')).toEqual(['android']);
    expect(bul('wear-tesbihat')).toEqual(['android']);
    expect(bul('sade-gorunum')).toEqual(['android', 'ios']);
  });
});
