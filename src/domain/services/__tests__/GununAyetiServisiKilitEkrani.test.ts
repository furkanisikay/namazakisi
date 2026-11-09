/**
 * `GununAyetiServisi.kilitEkraniProfili`: native köprüye savunmalı erişim. Yöntem yoksa (eski
 * ikili), reddederse ya da bozuk dönerse `okunamadi`; `profil`, `referans-yok` ve `oran` geçer.
 * Android `DuvarKagidi`, iPhone siri modülü.
 */
import { NativeModules, Platform } from 'react-native';

const mockSiri: { kilitEkraniProfili?: jest.Mock } = {};
jest.mock('../../../../modules/expo-siri-kisayollari/src', () => ({
  siriVeriYazici: () => null,
  get kilitEkraniProfili() {
    return mockSiri.kilitEkraniProfili;
  },
}));
jest.mock('../../../data/local/Depolama', () => ({ Depolama: { oku: jest.fn(() => Promise.resolve(null)), yaz: jest.fn(() => Promise.resolve()) } }));

import { GununAyetiServisi } from '../GununAyetiServisi';

const servis = () => GununAyetiServisi.getInstance();
const URI = 'file:///onbellek/kilit.png';

describe('GununAyetiServisi.kilitEkraniProfili', () => {
  const eskiModul = NativeModules.DuvarKagidi;
  afterEach(() => {
    NativeModules.DuvarKagidi = eskiModul;
    delete mockSiri.kilitEkraniProfili;
    jest.restoreAllMocks();
  });

  describe('Android', () => {
    beforeEach(() => jest.replaceProperty(Platform, 'OS', 'android'));

    it('köprü ya da yöntem yoksa okunamadı', async () => {
      NativeModules.DuvarKagidi = undefined;
      await expect(servis().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });
      NativeModules.DuvarKagidi = { durum: jest.fn(), simdiUygula: jest.fn() };
      await expect(servis().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });
    });

    it('profil, referans yok ve oran geçer; ret ve bozuk yanıt okunamadı', async () => {
      const yontem = jest.fn();
      NativeModules.DuvarKagidi = { kilitEkraniProfili: yontem };
      yontem.mockResolvedValueOnce({ profil: [0, 0.1] });
      await expect(servis().kilitEkraniProfili(URI)).resolves.toEqual({ profil: [0, 0.1] });
      expect(yontem).toHaveBeenCalledWith(URI);
      yontem.mockResolvedValueOnce({ hata: 'referans-yok' });
      await expect(servis().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'referans-yok' });
      yontem.mockResolvedValueOnce({ hata: 'oran' });
      await expect(servis().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'oran' });
      yontem.mockRejectedValueOnce(new Error('çözülemedi'));
      await expect(servis().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });
      yontem.mockResolvedValueOnce({ baska: 1 });
      await expect(servis().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });
    });
  });

  describe('iPhone', () => {
    beforeEach(() => jest.replaceProperty(Platform, 'OS', 'ios'));

    it('siri modülündeki yöntemi kullanır; eski ikilide okunamadı', async () => {
      await expect(servis().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });
      mockSiri.kilitEkraniProfili = jest.fn().mockResolvedValue({ hata: 'referans-yok' });
      await expect(servis().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'referans-yok' });
      expect(mockSiri.kilitEkraniProfili).toHaveBeenCalledWith(URI);
    });
  });
});
