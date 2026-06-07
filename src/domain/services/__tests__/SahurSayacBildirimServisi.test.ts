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

  it('imsak oncesi: countdown imsak\'a, vakitGirdi imsak\'a, bitis imsak+10dk\'ya planlanir; trigger ID\'leri benzersiz', async () => {
    tarihiSabitle('2026-02-19T02:00:00'); // imsak (04:00) oncesi -> ilk dal (simdi < imsakBugun)
    const servis = SahurSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    const imsakMs = mockPrayerTimes.fajr.getTime();

    // 1) Native countdown imsak (sahur bitisi) vaktine, sahur_sayac_v2 kanalinda sayar.
    //    channelId/targetTimeMs sabit degerlere kilitli: yanlis kanal veya yatsi/imsak+10
    //    karisikligi (yanlis hedef) testte yakalanir.
    expect(mockStartCountdown).toHaveBeenCalledTimes(1);
    expect(mockStartCountdown).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: 'sahur_sayac_v2', targetTimeMs: imsakMs })
    );

    const triggerCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const triggerIds = triggerCalls.map((call: any[]) => call[0].id as string);

    // 2) "vakit girdi" trigger'i TAM imsak vaktine planlanir (ikinci arg = trigger.timestamp).
    //    Sahur'un vakitGirdiBildirimIcerigi ms param'ini yok saydigi icin zaman icerikten
    //    degil, mutlaka trigger.timestamp'ten dogrulanir.
    const vakitGirdiCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_vakitgirdi'));
    expect(vakitGirdiCall).toBeDefined();
    expect(vakitGirdiCall![1].timestamp).toBe(imsakMs);

    // 3) Temizleme (_bitis) trigger'i imsak + 10 dk'ya planlanir.
    const bitisCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_bitis'));
    expect(bitisCall).toBeDefined();
    expect(bitisCall![1].timestamp).toBe(imsakMs + 10 * 60 * 1000);

    // 4) ID benzersizligi: vakitGirdi ve bitis ayri ID'lerle planlanir (trigger cakismasi olmaz).
    expect(triggerIds.filter((id) => id.endsWith('_vakitgirdi')).length).toBe(1);
    expect(triggerIds.filter((id) => id.endsWith('_bitis')).length).toBe(1);
    expect(new Set(triggerIds).size).toBe(triggerIds.length);
    expect(vakitGirdiCall![0].id).not.toBe(bitisCall![0].id);
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
