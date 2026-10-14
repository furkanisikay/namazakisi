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

  it('yeteneksiz duyuru her yerde görünür', () => {
    expect(yeniOzellikGorunurMu({ ...widget, yetenek: undefined })).toBe(true);
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
