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
}));

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('adhan');
jest.mock('@react-native-async-storage/async-storage');

import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VakitSayacBildirimServisi } from '../VakitSayacBildirimServisi';

const OriginalDate = global.Date;

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
(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

describe('VakitSayacBildirimServisi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (VakitSayacBildirimServisi as any).instance = undefined;
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([]);
    (notifee.getDisplayedNotifications as jest.Mock).mockResolvedValue([]);
    global.Date = OriginalDate;
  });

  afterAll(() => {
    global.Date = OriginalDate;
  });

  it('kanal olusturma: eski kanal silinip yeni DEFAULT importance ile olusturulmali', async () => {
    const servis = VakitSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      seviye2Esik: 30,
    });

    expect(notifee.deleteChannel).toHaveBeenCalledWith('vakit_sayac');
    expect(notifee.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'vakit_sayac_v2',
        importance: 3, // AndroidImportance.DEFAULT
      })
    );
  });

  it('trigger cakismasi: temizleme trigger\'i farkli ID kullanmali', async () => {
    // Zamani ogle vaktinden once ayarla (trigger planlansin)
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

    const servis = VakitSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      seviye2Esik: 30,
    });

    const createCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    // En az bir cift (sayac + bitis) olusturulmali
    expect(createCalls.length).toBeGreaterThanOrEqual(2);

    const ids = createCalls.map((call: any[]) => call[0].id as string);
    const bitisIds = ids.filter((id: string) => id.endsWith('_bitis'));
    const sayacIds = ids.filter((id: string) => !id.endsWith('_bitis'));

    expect(bitisIds.length).toBeGreaterThan(0);
    expect(sayacIds.length).toBeGreaterThan(0);

    // Sayac ID'leri _bitis ile bitmemeli
    for (const id of sayacIds) {
      expect(id).not.toMatch(/_bitis$/);
    }
    // Temizleme ID'leri _bitis ile bitmeli
    for (const id of bitisIds) {
      expect(id).toMatch(/_bitis$/);
    }
  });

  it('vakitSayaciniIptalEt: bitis trigger\'ini da iptal etmeli', async () => {
    const servis = VakitSayacBildirimServisi.getInstance();

    await servis.vakitSayaciniIptalEt('ogle');

    const cancelCalls = (notifee.cancelTriggerNotification as jest.Mock).mock.calls
      .map((call: any[]) => call[0] as string);

    const bitisCalls = cancelCalls.filter((id: string) => id.endsWith('_bitis'));
    expect(bitisCalls.length).toBeGreaterThan(0);
  });
});
