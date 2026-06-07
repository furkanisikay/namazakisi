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
    // PrayerTimes implementasyonunu her testte sabit varsayilana dondur; bir test
    // tarihe-duyarli mock kurarsa sonraki testlere sizmasin (clearAllMocks impl'i silmez).
    (PrayerTimes as unknown as jest.Mock).mockImplementation(() => mockPrayerTimes);
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

  it('imsak yeni girdi penceresi (imsak <= simdi < imsak+10dk): vakit girdi HEMEN gosterilir, countdown BASLAMAZ', async () => {
    // now=04:05 -> imsakBugun (04:00) gecilmis ama imsak+10dk (04:10) icinde.
    // Uretim: vakitGirdiBildirimiHemenGoster (displayNotification) + temizleme plani.
    // Native countdown ASLA baslamamali (vakit zaten girdi).
    tarihiSabitle('2026-02-19T04:05:00');
    const servis = SahurSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    const imsakMs = mockPrayerTimes.fajr.getTime();

    // Vakit girdi: planlanmaz, HEMEN gosterilir (displayNotification).
    expect(notifee.displayNotification).toHaveBeenCalledTimes(1);
    const gosterilen = (notifee.displayNotification as jest.Mock).mock.calls[0][0];
    expect((gosterilen.id as string).endsWith('_vakitgirdi')).toBe(true);

    // Geri sayim baslatilmaz (vakit ici, sayilacak bir sey yok).
    expect(mockStartCountdown).not.toHaveBeenCalled();

    // Sadece temizleme trigger'i (imsak+10dk) planlanir; "vakit girdi" trigger DEGIL.
    const triggerCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const bitisCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_bitis'));
    expect(bitisCall).toBeDefined();
    expect(bitisCall![1].timestamp).toBe(imsakMs + 10 * 60 * 1000);
    expect(triggerCalls.some((c: any[]) => (c[0].id as string).endsWith('_vakitgirdi'))).toBe(false);
  });

  it('gunduz penceresi (imsak+10dk < simdi < yatsi): countdown BASLAMAZ, trigger YARIN imsakina planlanir', async () => {
    // Tarihe-duyarli mock: bugun (19) fajr=04:00, yarin (20) fajr=03:50.
    // Boylece "yarin imsakina planlandi" iddiasi gercekten YARIN'i isaret eder,
    // bugunun imsakiyla karistirilamaz.
    const fajrBugun = new OriginalDate('2026-02-19T04:00:00');
    const fajrYarin = new OriginalDate('2026-02-20T03:50:00');
    (PrayerTimes as unknown as jest.Mock).mockImplementation((_coord: any, tarih: Date) => ({
      ...mockPrayerTimes,
      fajr: tarih.getDate() === 20 ? fajrYarin : fajrBugun,
    }));

    tarihiSabitle('2026-02-19T12:00:00'); // imsak+10dk (04:10) ile yatsi (20:00) arasi
    const servis = SahurSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    // Gunduz: geri sayim BASLAMAZ (sahur sayaci bu aksam yatsidan sonra calisacak).
    expect(mockStartCountdown).not.toHaveBeenCalled();
    expect(notifee.displayNotification).not.toHaveBeenCalled();

    const triggerCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const vakitGirdiCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_vakitgirdi'));
    const bitisCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_bitis'));
    expect(vakitGirdiCall).toBeDefined();
    expect(bitisCall).toBeDefined();

    // Vakit girdi trigger'i YARIN imsakina (03:50), bugunkune (04:00) DEGIL.
    expect(vakitGirdiCall![1].timestamp).toBe(fajrYarin.getTime());
    expect(vakitGirdiCall![1].timestamp).not.toBe(fajrBugun.getTime());
    expect(bitisCall![1].timestamp).toBe(fajrYarin.getTime() + 10 * 60 * 1000);
  });

  it('yatsi sonrasi / gece penceresi (simdi >= yatsi): countdown YARIN imsakina baslar', async () => {
    const fajrBugun = new OriginalDate('2026-02-19T04:00:00');
    const fajrYarin = new OriginalDate('2026-02-20T03:50:00');
    (PrayerTimes as unknown as jest.Mock).mockImplementation((_coord: any, tarih: Date) => ({
      ...mockPrayerTimes,
      fajr: tarih.getDate() === 20 ? fajrYarin : fajrBugun,
    }));

    tarihiSabitle('2026-02-19T22:00:00'); // yatsi (20:00) gecilmis -> gece dali
    const servis = SahurSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    // Geri sayim YARIN imsakina (03:50) hedeflenir, bugunkune (04:00) DEGIL.
    expect(mockStartCountdown).toHaveBeenCalledTimes(1);
    expect(mockStartCountdown).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: 'sahur_sayac_v2', targetTimeMs: fajrYarin.getTime() })
    );
    const baslatilanHedef = mockStartCountdown.mock.calls[0][0].targetTimeMs;
    expect(baslatilanHedef).not.toBe(fajrBugun.getTime());

    const triggerCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const vakitGirdiCall = triggerCalls.find((c: any[]) => (c[0].id as string).endsWith('_vakitgirdi'));
    expect(vakitGirdiCall![1].timestamp).toBe(fajrYarin.getTime());
  });

  it('aktif:false: yalnizca temizlenir; kanal olusturulmaz, countdown/trigger planlanmaz', async () => {
    tarihiSabitle('2026-02-19T02:00:00'); // aktif geri sayim penceresi olsa bile
    const servis = SahurSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({ aktif: false, koordinatlar: { lat: 41, lng: 29 } });

    // Kisa devre: hicbir planlama yapilmaz.
    expect(mockStartCountdown).not.toHaveBeenCalled();
    expect(notifee.createChannel).not.toHaveBeenCalled();
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
    expect(notifee.displayNotification).not.toHaveBeenCalled();
  });

  it('Platform.OS android degilse: temizleme yapilir ama kanal/countdown/trigger planlanmaz', async () => {
    // jest.mock react-native Platform.OS='android' sabit; geciciyse override edip geri al.
    const reactNative = require('react-native');
    const eskiOS = reactNative.Platform.OS;
    reactNative.Platform.OS = 'ios';
    try {
      tarihiSabitle('2026-02-19T02:00:00');
      const servis = SahurSayacBildirimServisi.getInstance();

      await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

      expect(mockStartCountdown).not.toHaveBeenCalled();
      expect(notifee.createChannel).not.toHaveBeenCalled();
      expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
      expect(notifee.displayNotification).not.toHaveBeenCalled();
    } finally {
      reactNative.Platform.OS = eskiOS;
    }
  });

  it('vakit girdi bildirim icerigi: dogru baslik ve ongoing/autoCancel davranisi', async () => {
    // imsak yeni girdi penceresi -> displayNotification icerigi dogrulanir.
    tarihiSabitle('2026-02-19T04:05:00');
    const servis = SahurSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } });

    const icerik = (notifee.displayNotification as jest.Mock).mock.calls[0][0];
    expect(icerik.title).toBe('🌙 Sahur Vakti Bitti!');
    // "Sahur bitti" bildirimi kullanici kapatana kadar kalmali (ongoing, otomatik silinmez).
    expect(icerik.android.ongoing).toBe(true);
    expect(icerik.android.autoCancel).toBe(false);
    expect(icerik.android.channelId).toBe('sahur_sayac_v2');
  });

  it('hata dayanikliligi: startCountdown throw etse bile yapilandirVePlanla cozulur (cokmez)', async () => {
    // Native countdown patlarsa servis sessizce yutmali; reject ile cagrani cokertmemeli.
    mockStartCountdown.mockImplementationOnce(() => {
      throw new Error('native countdown patladi');
    });
    tarihiSabitle('2026-02-19T02:00:00'); // countdown'in cagrildigi dal
    const servis = SahurSayacBildirimServisi.getInstance();

    await expect(
      servis.yapilandirVePlanla({ aktif: true, koordinatlar: { lat: 41, lng: 29 } })
    ).resolves.toBeUndefined();

    // Hataya ragmen trigger planlama akisi devam etmis olmali (akis kesilmedi).
    expect(notifee.createTriggerNotification).toHaveBeenCalled();
  });
});
