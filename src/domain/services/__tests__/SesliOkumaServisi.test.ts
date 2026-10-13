/**
 * Sade görünüm sesli okuması (issue #295): yeni bağımlılık YOK, mevcut iki TTS
 * yolundan biri seçilir. Karar PLATFORMA değil önce YETENEĞE bağlıdır (jest'te
 * varsayılan `Platform.OS` 'ios' — AGENTS.md test konvansiyonu).
 */
import { Platform } from 'react-native';

const mockPlanlaAnons = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
}));
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import {
  SADE_OKUMA_ANONS_ID,
  SADE_OKUMA_GECIKMESI_MS,
  sesliOku,
  sesliOkumaDestekleniyorMu,
} from '../SesliOkumaServisi';

// moduleNameMapper ile eşlenen mock'a `require` ile ulaşılır (AGENTS.md).
const anons = require('../../../../modules/expo-muhafiz-anons/src');

describe('SesliOkumaServisi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    anons.anonsModuluVarMi.mockReturnValue(false);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('boş metin okunmaz', () => {
    expect(sesliOku('   ')).toBe(false);
    expect(mockPlanlaAnons).not.toHaveBeenCalled();
    expect(anons.anonsuKonus).not.toHaveBeenCalled();
  });

  it('cihaz-içi anons modülü varsa (iOS) HEMEN konuşur, önceki okumayı susturur', () => {
    anons.anonsModuluVarMi.mockReturnValue(true);
    expect(sesliOkumaDestekleniyorMu()).toBe(true);
    expect(sesliOku(' Şimdi ikindi vakti. ')).toBe(true);
    expect(anons.anonsuSustur).toHaveBeenCalled();
    expect(anons.anonsuKonus).toHaveBeenCalledWith('Şimdi ikindi vakti.');
    expect(mockPlanlaAnons).not.toHaveBeenCalled();
  });

  it('Android: SABİT kimlikle kısa gecikmeli tek atışlık anons kurulur', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const once = Date.now();
    expect(sesliOkumaDestekleniyorMu()).toBe(true);
    expect(sesliOku('Şimdi ikindi vakti.')).toBe(true);
    const [id, zaman, metin] = mockPlanlaAnons.mock.calls[0];
    expect(id).toBe(SADE_OKUMA_ANONS_ID);
    expect(id.startsWith('muhafiz_')).toBe(false); // önek iptalleri dokunmasın
    expect(zaman).toBeGreaterThanOrEqual(once + SADE_OKUMA_GECIKMESI_MS);
    expect(metin).toBe('Şimdi ikindi vakti.');
  });

  it('Android köprüsü fırlatırsa UI düşmez', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockPlanlaAnons.mockImplementationOnce(() => {
      throw new Error('kopru');
    });
    expect(sesliOku('metin')).toBe(false);
  });

  it('iOS ama modül yok (eski build): okuma YOK, destek yok', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    expect(sesliOkumaDestekleniyorMu()).toBe(false);
    expect(sesliOku('metin')).toBe(false);
    expect(mockPlanlaAnons).not.toHaveBeenCalled();
  });
});
