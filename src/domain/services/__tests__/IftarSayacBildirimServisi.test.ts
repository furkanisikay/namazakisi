import notifee from '@notifee/react-native';
import { BILDIRIM_SABITLERI } from '../../../core/constants/UygulamaSabitleri';

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
import { IftarSayacBildirimServisi } from '../IftarSayacBildirimServisi';

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

// Orijinal Date'i sakla
const OriginalDate = global.Date;

describe('IftarSayacBildirimServisi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (IftarSayacBildirimServisi as any).instance = undefined;
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([]);
    (notifee.getDisplayedNotifications as jest.Mock).mockResolvedValue([]);
    global.Date = OriginalDate;
  });

  afterAll(() => {
    global.Date = OriginalDate;
  });

  it('kanal olusturma: eski kanal silinip yeni DEFAULT importance ile olusturulmali', async () => {
    // Zamani sabah ile aksam arasi ayarla
    const simdi = new OriginalDate('2026-02-19T10:00:00');
    const MockDate = function (...args: any[]) {
      if (args.length === 0) return simdi;
      return new (Function.prototype.bind.apply(OriginalDate, [null, ...args] as any))();
    } as any;
    MockDate.now = OriginalDate.now;
    MockDate.parse = OriginalDate.parse;
    MockDate.UTC = OriginalDate.UTC;
    MockDate.prototype = OriginalDate.prototype;
    global.Date = MockDate;

    const servis = IftarSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
    });

    expect(notifee.deleteChannel).toHaveBeenCalledWith('iftar_sayac');
    expect(notifee.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'iftar_sayac_v2',
        importance: 3, // AndroidImportance.DEFAULT
      })
    );
  });

  it('trigger cakismasi: her asama farkli ID kullanmali', async () => {
    // Zamani sabah ile aksam arasi ayarla (simdi < aksamVakti dalina girmek icin)
    const simdi = new OriginalDate('2026-02-19T10:00:00');
    const MockDate = function (...args: any[]) {
      if (args.length === 0) return simdi;
      return new (Function.prototype.bind.apply(OriginalDate, [null, ...args] as any))();
    } as any;
    MockDate.now = OriginalDate.now;
    MockDate.parse = OriginalDate.parse;
    MockDate.UTC = OriginalDate.UTC;
    MockDate.prototype = OriginalDate.prototype;
    global.Date = MockDate;

    const servis = IftarSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
    });

    // Sabah-aksam arasi: native countdown baslatilmali (displayNotification yerine)
    expect(mockStartCountdown).toHaveBeenCalledWith(
      expect.objectContaining({
        channelId: expect.any(String),
        targetTimeMs: expect.any(Number),
      })
    );

    // vakitGirdi ve temizleme trigger'lari Notifee ile planlanmali
    const triggerCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const triggerIds = triggerCalls.map((call: any[]) => call[0].id as string);

    const vakitGirdiIds = triggerIds.filter((id: string) => id.endsWith('_vakitgirdi'));
    const bitisIds = triggerIds.filter((id: string) => id.endsWith('_bitis'));

    expect(vakitGirdiIds.length).toBeGreaterThan(0);
    expect(bitisIds.length).toBeGreaterThan(0);

    // Tum ID'ler birbirinden farkli olmali
    const uniqueIds = new Set(triggerIds);
    expect(uniqueIds.size).toBe(triggerIds.length);
  });

  it('temizleme: tum iftar sayac bildirimleri temizlenmeli', async () => {
    const iftarTriggerIds = [
      'iftar_sayac_2026-02-19',
      'iftar_sayac_2026-02-19_vakitgirdi',
      'iftar_sayac_2026-02-19_bitis',
    ];
    const digerTriggerIds = ['sayac_2026-02-19_ogle'];

    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
      ...iftarTriggerIds,
      ...digerTriggerIds,
    ]);
    (notifee.getDisplayedNotifications as jest.Mock).mockResolvedValue([
      { id: 'iftar_sayac_2026-02-19', notification: {} },
      { id: 'sayac_2026-02-19_ikindi', notification: {} },
    ]);

    const servis = IftarSayacBildirimServisi.getInstance();
    await servis.tumBildirimleriniTemizle();

    // Iftar trigger'lari iptal edilmeli
    for (const id of iftarTriggerIds) {
      expect(notifee.cancelTriggerNotification).toHaveBeenCalledWith(id);
    }
    // Diger trigger'lar iptal edilMEMELI
    expect(notifee.cancelTriggerNotification).not.toHaveBeenCalledWith('sayac_2026-02-19_ogle');

    // Iftar goruntulenen bildirimi iptal edilmeli
    expect(notifee.cancelNotification).toHaveBeenCalledWith('iftar_sayac_2026-02-19');
    // Diger goruntulenen bildirim iptal edilMEMELI
    expect(notifee.cancelNotification).not.toHaveBeenCalledWith('sayac_2026-02-19_ikindi');
  });
});
