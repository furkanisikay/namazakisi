import notifee from '@notifee/react-native';

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue('channel-id'),
    deleteChannel: jest.fn().mockResolvedValue(undefined),
    displayNotification: jest.fn().mockResolvedValue('notif-id'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    cancelTriggerNotification: jest.fn().mockResolvedValue(undefined),
    getTriggerNotificationIds: jest.fn().mockResolvedValue([]),
    getDisplayedNotifications: jest.fn().mockResolvedValue([]),
    createTriggerNotification: jest.fn().mockResolvedValue('trigger-id'),
  },
  TriggerType: { TIMESTAMP: 0 },
  AndroidImportance: { LOW: 2, DEFAULT: 3, HIGH: 4 },
  AndroidStyle: { BIGTEXT: 0 },
}));

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('adhan');
jest.mock('@react-native-async-storage/async-storage');

const mockStartCountdown = jest.fn();
const mockStopCountdown = jest.fn();
const mockStopAll = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  startCountdown: (...args: any[]) => mockStartCountdown(...args),
  stopCountdown: (...args: any[]) => mockStopCountdown(...args),
  stopAll: (...args: any[]) => mockStopAll(...args),
}));

import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { SahurSayacBildirimServisi } from '../SahurSayacBildirimServisi';

const mockPrayerTimes = {
  fajr: new Date('2026-02-19T04:00:00'),
  sunrise: new Date('2026-02-19T06:00:00'),
  dhuhr: new Date('2026-02-19T12:00:00'),
  asr: new Date('2026-02-19T15:00:00'),
  maghrib: new Date('2026-02-19T18:00:00'),
  isha: new Date('2026-02-19T20:00:00'),
};

(PrayerTimes as unknown as jest.Mock).mockImplementation(() => mockPrayerTimes);
(Coordinates as unknown as jest.Mock).mockImplementation((lat: number, lng: number) => ({ lat, lng }));
(CalculationMethod as any).Turkey = jest.fn().mockReturnValue({});

const OriginalDate = global.Date;

function tarihiSabitle(iso: string): void {
  const simdi = new OriginalDate(iso);
  const MockDate = function (...args: any[]) {
    if (args.length === 0) return simdi;
    return new (Function.prototype.bind.apply(OriginalDate, [null, ...args] as any))();
  } as any;
  MockDate.now = OriginalDate.now;
  MockDate.parse = OriginalDate.parse;
  MockDate.UTC = OriginalDate.UTC;
  MockDate.prototype = OriginalDate.prototype;
  global.Date = MockDate;
}

describe('SahurSayacBildirimServisi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SahurSayacBildirimServisi as any).instance = undefined;
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([]);
    (notifee.getDisplayedNotifications as jest.Mock).mockResolvedValue([]);
    global.Date = OriginalDate;
  });

  afterAll(() => {
    global.Date = OriginalDate;
  });

  it('kanal: eski sahur_sayac silinip sahur_sayac_v2 DEFAULT importance ile olusturulur', async () => {
    tarihiSabitle('2026-02-19T02:00:00'); // imsak (04:00) oncesi -> aktif geri sayim penceresi
    const servis = SahurSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    expect(notifee.deleteChannel).toHaveBeenCalledWith('sahur_sayac');
    expect(notifee.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'sahur_sayac_v2', importance: 3 })
    );
  });

  it('imsak oncesi: native countdown baslar, vakitGirdi/bitis trigger ID\'leri benzersiz', async () => {
    tarihiSabitle('2026-02-19T02:00:00');
    const servis = SahurSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    expect(mockStartCountdown).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: expect.any(String), targetTimeMs: expect.any(Number) })
    );

    const triggerIds = (notifee.createTriggerNotification as jest.Mock).mock.calls.map(
      (call: any[]) => call[0].id as string
    );
    expect(triggerIds.filter((id) => id.endsWith('_vakitgirdi')).length).toBeGreaterThan(0);
    expect(triggerIds.filter((id) => id.endsWith('_bitis')).length).toBeGreaterThan(0);
    expect(new Set(triggerIds).size).toBe(triggerIds.length);
  });

  it('temizleme: yalnizca sahur_sayac bildirimleri iptal edilir, native countdown durdurulur', async () => {
    const sahurTriggerIds = [
      'sahur_sayac_2026-02-19',
      'sahur_sayac_2026-02-19_vakitgirdi',
      'sahur_sayac_2026-02-19_bitis',
    ];
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
      ...sahurTriggerIds,
      'sayac_2026-02-19_ogle',
    ]);
    (notifee.getDisplayedNotifications as jest.Mock).mockResolvedValue([
      { id: 'sahur_sayac_2026-02-19', notification: {} },
      { id: 'sayac_2026-02-19_ikindi', notification: {} },
    ]);

    const servis = SahurSayacBildirimServisi.getInstance();
    await servis.tumBildirimleriniTemizle();

    for (const id of sahurTriggerIds) {
      expect(notifee.cancelTriggerNotification).toHaveBeenCalledWith(id);
    }
    expect(notifee.cancelTriggerNotification).not.toHaveBeenCalledWith('sayac_2026-02-19_ogle');
    expect(notifee.cancelNotification).toHaveBeenCalledWith('sahur_sayac_2026-02-19');
    expect(notifee.cancelNotification).not.toHaveBeenCalledWith('sayac_2026-02-19_ikindi');
    expect(mockStopCountdown).toHaveBeenCalledWith('sahur_sayac_2026-02-19');
  });
});
