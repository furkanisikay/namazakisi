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

import { Platform } from 'react-native';
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

/**
 * Sistem saatini SABIT bir ana dondurur: new Date() (argumansiz) bu ani verir,
 * argumanli new Date(...) ise orijinal kurucuya dusurur (uretim kodu aksam+10dk'yi
 * boyle hesaplar). Boylece zaman dallari deterministik test edilir, CI'da flaky olmaz.
 */
function saatiDondur(isoYerel: string): void {
  const simdi = new OriginalDate(isoYerel);
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

describe('IftarSayacBildirimServisi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (IftarSayacBildirimServisi as any).instance = undefined;
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([]);
    (notifee.getDisplayedNotifications as jest.Mock).mockResolvedValue([]);
    global.Date = OriginalDate;
    (Platform as any).OS = 'android';
  });

  afterAll(() => {
    global.Date = OriginalDate;
    (Platform as any).OS = 'android';
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

    // Sabah-aksam arasi: native countdown DOGRUDAN aksam ezanina (maghrib) saymali.
    // targetTimeMs'i tam degere kilitle: yanlis hedef (ogle/yatsi karismasi) yakalanir.
    expect(mockStartCountdown).toHaveBeenCalledWith(
      expect.objectContaining({
        channelId: 'iftar_sayac_v2',
        targetTimeMs: mockPrayerTimes.maghrib.getTime(),
      })
    );

    // vakitGirdi ve temizleme trigger'lari Notifee ile planlanmali
    const triggerCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const triggerIds = triggerCalls.map((call: any[]) => call[0].id as string);

    const vakitGirdiIds = triggerIds.filter((id: string) => id.endsWith('_vakitgirdi'));
    const bitisIds = triggerIds.filter((id: string) => id.endsWith('_bitis'));

    expect(vakitGirdiIds.length).toBeGreaterThan(0);
    expect(bitisIds.length).toBeGreaterThan(0);

    // Tum ID'ler birbirinden farkli olmali (asama cakismasi olmamali)
    const uniqueIds = new Set(triggerIds);
    expect(uniqueIds.size).toBe(triggerIds.length);

    // Trigger zamanlarini ID son-ekine gore esle (sira varsayma) ve fiziki kurali dogrula:
    // vakit-girdi bildirimi TAM ezan vaktinde (maghrib), temizleme ise ezandan 10 dk sonra planlanmali.
    const vakitGirdiCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_vakitgirdi'));
    const bitisCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_bitis'));

    expect(vakitGirdiCall?.[1]).toEqual(
      expect.objectContaining({ timestamp: mockPrayerTimes.maghrib.getTime() })
    );
    expect(bitisCall?.[1]).toEqual(
      expect.objectContaining({ timestamp: mockPrayerTimes.maghrib.getTime() + 10 * 60 * 1000 })
    );
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

  // ==================== Zaman dallari ====================

  it('sabah namazindan ONCE: countdown BASLATILMAZ, sadece vakit-girdi ve temizleme trigger planlanir', async () => {
    // simdi = 03:00, sabah (fajr) = 04:00 -> simdi < sabahVakti dali
    saatiDondur('2026-02-19T03:00:00');

    const servis = IftarSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    // Sabah'tan once GERI SAYIM henuz baslamamali (oruc baslamamis)
    expect(mockStartCountdown).not.toHaveBeenCalled();

    // Ama vakit-girdi ve temizleme trigger'lari ileride tetiklenmek uzere planlanmali
    const triggerCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const vakitGirdiCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_vakitgirdi'));
    const bitisCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_bitis'));

    expect(vakitGirdiCall).toBeDefined();
    expect(bitisCall).toBeDefined();

    // Vakit-girdi tam aksam (maghrib) aninda, temizleme aksam+10dk'da planlanmali
    expect(vakitGirdiCall?.[1]).toEqual(
      expect.objectContaining({ timestamp: mockPrayerTimes.maghrib.getTime() })
    );
    expect(bitisCall?.[1]).toEqual(
      expect.objectContaining({ timestamp: mockPrayerTimes.maghrib.getTime() + 10 * 60 * 1000 })
    );

    // Vakit-girdi bildirim ICERIGI: 10 dk sonra otomatik kaybolmali (is kurali)
    expect(vakitGirdiCall?.[0]).toEqual(
      expect.objectContaining({
        title: '🌙 İftar Vakti!',
        android: expect.objectContaining({
          autoCancel: true,
          timeoutAfter: 10 * 60 * 1000, // 600000 ms
        }),
      })
    );
  });

  it('aksam ile aksam+10dk ARASI: vakit-girdi HEMEN gosterilir, countdown/trigger KULLANILMAZ', async () => {
    // simdi = 18:05; aksam = 18:00, aksam+10dk = 18:10 -> aksamVakti <= simdi < aksamArti10 dali
    saatiDondur('2026-02-19T18:05:00');

    const servis = IftarSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    // Bu dalda bildirim HEMEN displayNotification ile gosterilir
    expect(notifee.displayNotification).toHaveBeenCalledTimes(1);
    expect(notifee.displayNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '🌙 İftar Vakti!',
        android: expect.objectContaining({
          autoCancel: true,
          timeoutAfter: 10 * 60 * 1000,
        }),
      })
    );

    // Vakit gectikten sonra geri sayim veya ileri tarihli trigger anlamsiz -> kullanilMAMALI
    expect(mockStartCountdown).not.toHaveBeenCalled();
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
  });

  it('aksam+10dk SONRASI: hicbir bildirim planlanmaz (sessizlik garantisi)', async () => {
    // simdi = 19:00; aksam+10dk = 18:10 -> simdi >= aksamArti10, hicbir dala girmez
    saatiDondur('2026-02-19T19:00:00');

    const servis = IftarSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    expect(mockStartCountdown).not.toHaveBeenCalled();
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
    expect(notifee.displayNotification).not.toHaveBeenCalled();
  });

  // ==================== Kisa devre (erken return) ====================

  it('aktif:false iken sadece temizleme yapilir; kanal/trigger/countdown olusturulmaz', async () => {
    saatiDondur('2026-02-19T10:00:00'); // sabah-aksam arasi olsa bile aktif:false erken doner

    const servis = IftarSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({ aktif: false, koordinatlar: { lat: 41, lng: 29 } });

    // Temizleme yine de calismali (eski plan iptal edilmeli)
    expect(notifee.getTriggerNotificationIds).toHaveBeenCalled();

    // Ama yeni hicbir sey kurulmamali
    expect(notifee.createChannel).not.toHaveBeenCalled();
    expect(mockStartCountdown).not.toHaveBeenCalled();
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
    expect(notifee.displayNotification).not.toHaveBeenCalled();
  });

  it('Platform Android degilken (iOS) sadece temizleme yapilir; kanal/trigger/countdown olusturulmaz', async () => {
    saatiDondur('2026-02-19T10:00:00');
    (Platform as any).OS = 'ios';

    const servis = IftarSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    // Temizleme yine de calismali
    expect(notifee.getTriggerNotificationIds).toHaveBeenCalled();

    // iOS'ta native countdown / kanal / trigger kurulmamali
    expect(notifee.createChannel).not.toHaveBeenCalled();
    expect(mockStartCountdown).not.toHaveBeenCalled();
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
    expect(notifee.displayNotification).not.toHaveBeenCalled();
  });

  // ==================== Kanal onbellegi ====================

  it('ayni instance ile iki kez yapilandirilinca kanal yalnizca BIR kez olusturulur', async () => {
    saatiDondur('2026-02-19T10:00:00'); // countdown dali, kanalOlustur cagrilir

    const servis = IftarSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });
    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    // kanalOlusturuldu onbellegi sayesinde createChannel sadece ilk seferde cagrilmali
    expect(notifee.createChannel).toHaveBeenCalledTimes(1);
  });
});
