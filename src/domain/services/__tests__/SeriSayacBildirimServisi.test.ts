/**
 * Seri sayaci bildirim servisi — kapilar ve native cagri sozlesmesi.
 */

const mockStartCountdown = jest.fn();
const mockStopCountdown = jest.fn();

jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  startCountdown: (...a: unknown[]) => mockStartCountdown(...a),
  stopCountdown: (...a: unknown[]) => mockStopCountdown(...a),
}));

// Sayac yalniz Android'de calisir; jest ortaminda Platform.OS varsayilani
// android DEGILDIR (mevcut sayac testlerinin konvansiyonu).
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(() => Promise.resolve()),
    deleteChannel: jest.fn(() => Promise.resolve()),
    displayNotification: jest.fn(() => Promise.resolve()),
    createTriggerNotification: jest.fn(() => Promise.resolve()),
    cancelNotification: jest.fn(() => Promise.resolve()),
    cancelTriggerNotification: jest.fn(() => Promise.resolve()),
    getDisplayedNotifications: jest.fn(() => Promise.resolve([])),
    getTriggerNotificationIds: jest.fn(() => Promise.resolve([])),
  },
  AndroidImportance: { DEFAULT: 3 },
  AndroidStyle: { BIGTEXT: 0 },
  TriggerType: { TIMESTAMP: 0 },
}));

import { SeriSayacBildirimServisi } from '../SeriSayacBildirimServisi';

const servis = SeriSayacBildirimServisi.getInstance();

/** Hedef: şimdiden `dk` dakika sonra. */
const hedefDk = (dk: number) => new Date(Date.now() + dk * 60000);

beforeEach(() => jest.clearAllMocks());

describe('SeriSayacBildirimServisi', () => {
  test('eşik içinde ve gün eksikse sayaç BAŞLAR', async () => {
    await servis.yapilandirVePlanla({
      aktif: true,
      hedef: hedefDk(90),
      seriBugunTamMi: false,
    });

    expect(mockStartCountdown).toHaveBeenCalledTimes(1);
  });

  test('gün ZATEN TAMSA sayaç HİÇ çıkmaz', async () => {
    await servis.yapilandirVePlanla({
      aktif: true,
      hedef: hedefDk(90),
      seriBugunTamMi: true,
    });

    expect(mockStartCountdown).not.toHaveBeenCalled();
  });

  test('kullanıcı kapattıysa sayaç çıkmaz', async () => {
    await servis.yapilandirVePlanla({
      aktif: false,
      hedef: hedefDk(90),
      seriBugunTamMi: false,
    });

    expect(mockStartCountdown).not.toHaveBeenCalled();
  });

  test('eşiğin DIŞINDAysa (hedefe çok var) sayaç çıkmaz', async () => {
    await servis.yapilandirVePlanla({
      aktif: true,
      hedef: hedefDk(300),
      seriBugunTamMi: false,
    });

    expect(mockStartCountdown).not.toHaveBeenCalled();
  });

  /** Chronometer sıfırı geçince YUKARI sayar — geçmiş hedefle asla kurulmamalı. */
  test('hedef GEÇMİŞSE sayaç çıkmaz', async () => {
    await servis.yapilandirVePlanla({
      aktif: true,
      hedef: hedefDk(-5),
      seriBugunTamMi: false,
    });

    expect(mockStartCountdown).not.toHaveBeenCalled();
  });

  test('hedef null ise sayaç çıkmaz', async () => {
    await servis.yapilandirVePlanla({ aktif: true, hedef: null, seriBugunTamMi: false });

    expect(mockStartCountdown).not.toHaveBeenCalled();
  });

  test('özel eşik geçilebilir', async () => {
    await servis.yapilandirVePlanla({
      aktif: true,
      hedef: hedefDk(300),
      seriBugunTamMi: false,
      esikDk: 360,
    });

    expect(mockStartCountdown).toHaveBeenCalledTimes(1);
  });

  /**
   * NÖBETÇİ: chronometer hedefte durmaz, sıfırı geçince yukarı sayar. Bayrak
   * düşerse kullanıcı "gün bitti" yerine artan bir sayaç görür.
   */
  test("native çağrı 'seri' temasıyla ve hedefte-kaybol bayrağıyla yapılır", async () => {
    const hedef = hedefDk(90);
    await servis.yapilandirVePlanla({ aktif: true, hedef, seriBugunTamMi: false });

    expect(mockStartCountdown).toHaveBeenCalledWith(
      expect.objectContaining({
        themeType: 'seri',
        autoDismissAtTarget: true,
        targetTimeMs: hedef.getTime(),
        channelId: 'seri_sayac',
      })
    );
  });

  test('her çağrıda önce temizler (idempotent — arka plan görevi 15 dk’da bir çağırır)', async () => {
    const notifee = jest.requireMock('@notifee/react-native').default;
    notifee.getDisplayedNotifications.mockResolvedValueOnce([{ id: 'seri_sayac_2026-01-15' }]);

    await servis.yapilandirVePlanla({ aktif: false, hedef: null, seriBugunTamMi: true });

    expect(mockStopCountdown).toHaveBeenCalledWith('seri_sayac_2026-01-15');
  });
});
