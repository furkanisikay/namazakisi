/**
 * Sesli anons JS koprusu (Faz 4).
 *
 * Kopru INCE olmali: platform kapisi + bos-deger savunmasi + native cagri.
 * `trDestekleniyorMu` ASLA firlatmamali (ekran uyarisi buna bakar).
 */

const mockPlanlaAnons = jest.fn();
const mockIptalEtAnons = jest.fn();
const mockIptalEtTumAnonslar = jest.fn();
const mockTrDestekleniyorMu = jest.fn();

jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  requireNativeModule: () => ({
    startCountdown: jest.fn(),
    stopCountdown: jest.fn(),
    stopAll: jest.fn(),
    planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
    iptalEtAnons: (...args: unknown[]) => mockIptalEtAnons(...args),
    iptalEtTumAnonslar: (...args: unknown[]) => mockIptalEtTumAnonslar(...args),
    trDestekleniyorMu: (...args: unknown[]) => mockTrDestekleniyorMu(...args),
  }),
}));

// Platform.OS testler arasinda degistirilebilsin diye getter ile mock'lanir.
const mockPlatformDurumu = { OS: 'android' };
jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatformDurumu.OS;
    },
  },
}));

import { planlaAnons, iptalEtAnons, iptalEtTumAnonslar, trDestekleniyorMu } from '../index';

describe('Sesli anons koprusu — Android', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatformDurumu.OS = 'android';
  });

  test('planlaAnons native fonksiyona id/zaman/metni oldugu gibi gecirir', () => {
    planlaAnons('muhafiz_2026-07-18_vakit_aksam_seviye_1_dk_20', 1_800_000_000_000, 'Akşam vakti çıkıyor.');

    expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
    expect(mockPlanlaAnons).toHaveBeenCalledWith(
      'muhafiz_2026-07-18_vakit_aksam_seviye_1_dk_20',
      1_800_000_000_000,
      'Akşam vakti çıkıyor.'
    );
  });

  test('bos / yalnizca bosluk metin native tarafa hic gitmez', () => {
    planlaAnons('id-1', 1_800_000_000_000, '');
    planlaAnons('id-2', 1_800_000_000_000, '   ');
    expect(mockPlanlaAnons).not.toHaveBeenCalled();
  });

  test('bos id ile planlama yapilmaz (iptal edilemeyecek alarm kalmasin)', () => {
    planlaAnons('', 1_800_000_000_000, 'Akşam vakti çıkıyor.');
    expect(mockPlanlaAnons).not.toHaveBeenCalled();
  });

  test('iptalEtAnons id ile cagrilir; bos id native tarafa gitmez', () => {
    iptalEtAnons('id-1');
    iptalEtAnons('');
    expect(mockIptalEtAnons).toHaveBeenCalledTimes(1);
    expect(mockIptalEtAnons).toHaveBeenCalledWith('id-1');
  });

  test('iptalEtTumAnonslar native temizligi tetikler', () => {
    iptalEtTumAnonslar();
    expect(mockIptalEtTumAnonslar).toHaveBeenCalledTimes(1);
  });

  test('trDestekleniyorMu: native true -> true', async () => {
    mockTrDestekleniyorMu.mockResolvedValue(true);
    await expect(trDestekleniyorMu()).resolves.toBe(true);
  });

  test('trDestekleniyorMu: native false -> false', async () => {
    mockTrDestekleniyorMu.mockResolvedValue(false);
    await expect(trDestekleniyorMu()).resolves.toBe(false);
  });

  test('trDestekleniyorMu: native HATA verirse firlatmaz, false doner', async () => {
    mockTrDestekleniyorMu.mockRejectedValue(new Error('native yok'));
    await expect(trDestekleniyorMu()).resolves.toBe(false);
  });

  test('trDestekleniyorMu: boolean olmayan cevap false sayilir', async () => {
    mockTrDestekleniyorMu.mockResolvedValue('evet');
    await expect(trDestekleniyorMu()).resolves.toBe(false);
  });
});

describe('Sesli anons koprusu — Android disi (no-op)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatformDurumu.OS = 'ios';
  });

  afterAll(() => {
    mockPlatformDurumu.OS = 'android';
  });

  test('hicbir native anons cagrisi yapilmaz', () => {
    planlaAnons('id-1', 1_800_000_000_000, 'Akşam vakti çıkıyor.');
    iptalEtAnons('id-1');
    iptalEtTumAnonslar();

    expect(mockPlanlaAnons).not.toHaveBeenCalled();
    expect(mockIptalEtAnons).not.toHaveBeenCalled();
    expect(mockIptalEtTumAnonslar).not.toHaveBeenCalled();
  });

  test('trDestekleniyorMu native sormadan false doner', async () => {
    await expect(trDestekleniyorMu()).resolves.toBe(false);
    expect(mockTrDestekleniyorMu).not.toHaveBeenCalled();
  });
});
