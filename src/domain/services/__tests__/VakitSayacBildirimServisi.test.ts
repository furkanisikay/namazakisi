import notifee, { TriggerType } from '@notifee/react-native';
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

// Kilinan vakit kaynagi mock'lanir; varsayilan olarak hicbir vakit kilinmamis.
const mockKilinanVakitleriAl = jest.fn();
jest.mock('../../../data/local/LocalNamazServisi', () => ({
  kilinanVakitleriAl: (...args: any[]) => mockKilinanVakitleriAl(...args),
}));

import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VakitSayacBildirimServisi } from '../VakitSayacBildirimServisi';

const OriginalDate = global.Date;

/**
 * Sistem saatini sabit bir ana DONDURUR (yalnizca arg'siz `new Date()` icin).
 * Arg'li `new Date(...)` ve Date.now/parse/UTC orijinal davranisini korur ki
 * adhan mock'unun urettigi sabit vakit Date'leri etkilenmesin.
 */
function saatiDondur(simdi: Date): void {
  const MockDate = function (...args: any[]) {
    if (args.length === 0) return simdi;
    return new (Function.prototype.bind.apply(OriginalDate, [null, ...args] as any))();
  } as any;
  MockDate.now = () => simdi.getTime();
  MockDate.parse = OriginalDate.parse;
  MockDate.UTC = OriginalDate.UTC;
  MockDate.prototype = OriginalDate.prototype;
  global.Date = MockDate;
}

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
    mockKilinanVakitleriAl.mockResolvedValue([]);
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
      baslangicEsikDk: 30,
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
      baslangicEsikDk: 30,
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

    // Sadece benzersiz ID degil, TETIK ZAMANLARI da fiziksel olarak dogru olmali.
    // Saat 10:00, esik 30dk. Ogle vaktinin cikisi = ikindi girisi = asr (15:00).
    // => Temizleme tam vakit cikisinda (15:00), sayac ise cikis - 30dk (14:30) tetiklenmeli.
    const sayacOnek = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle`;
    const ogleSayac = createCalls.find((call: any[]) => call[0].id === sayacOnek);
    const ogleBitis = createCalls.find((call: any[]) => call[0].id === `${sayacOnek}_bitis`);

    expect(ogleSayac).toBeDefined();
    expect(ogleBitis).toBeDefined();

    const cikis = mockPrayerTimes.asr.getTime();
    // Temizleme tam vakit cikisinda tetiklenmeli (otomatik kapanma)
    expect(ogleBitis![1].timestamp).toBe(cikis);
    expect(ogleBitis![1].type).toBe(TriggerType.TIMESTAMP);
    // Sayac, cikis - esikDk*60000 (14:30) tetiklenmeli; simdi+5sn (10:00:05) alt siniri burada baskin degil
    expect(ogleSayac![1].timestamp).toBe(cikis - 30 * 60 * 1000);
    expect(ogleSayac![1].type).toBe(TriggerType.TIMESTAMP);
    // Sayac, temizlemeden ONCE tetiklenmeli (mantiksal sira: once say, sonra temizle)
    expect(ogleSayac![1].timestamp).toBeLessThan(ogleBitis![1].timestamp);
  });

  it('vakitSayaciniIptalEt: bitis trigger\'ini da iptal etmeli', async () => {
    const servis = VakitSayacBildirimServisi.getInstance();

    await servis.vakitSayaciniIptalEt('ogle');

    const cancelCalls = (notifee.cancelTriggerNotification as jest.Mock).mock.calls
      .map((call: any[]) => call[0] as string);

    const bitisCalls = cancelCalls.filter((id: string) => id.endsWith('_bitis'));
    expect(bitisCalls.length).toBeGreaterThan(0);
  });

  it('iOS: yapilandirVePlanla erken donmeli, kanal/trigger/countdown OLUSTURULMAMALI', async () => {
    const reactNative = jest.requireMock('react-native');
    reactNative.Platform.OS = 'ios';
    try {
      const servis = VakitSayacBildirimServisi.getInstance();

      await servis.yapilandirVePlanla({
        aktif: true,
        koordinatlar: { lat: 41, lng: 29 },
        baslangicEsikDk: 30,
      });

      // iOS dalinda yalnizca temizleme calismali; hicbir yeni planlama yapilmamali
      expect(notifee.createChannel).not.toHaveBeenCalled();
      expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
      expect(mockStartCountdown).not.toHaveBeenCalled();
    } finally {
      // Diger testleri etkilememek icin Android'e geri don
      reactNative.Platform.OS = 'android';
    }
  });

  it('aktif:false: once temizleme calismali, ardindan hicbir yeni bildirim olusturulmamali', async () => {
    const servis = VakitSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({
      aktif: false,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikDk: 30,
    });

    // Devre disi: temizleme tetiklenir (gosterilen bildirimler taranir) ...
    expect(notifee.getDisplayedNotifications).toHaveBeenCalled();
    // ... ama kanal acilmaz ve yeni hicbir sayac/temizleme trigger'i kurulmaz
    expect(notifee.createChannel).not.toHaveBeenCalled();
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
    expect(mockStartCountdown).not.toHaveBeenCalled();
  });

  it('gece yarisi: imsak oncesinde (03:00) dunun yatsisi DUN tarihiyle, cikisi bugunun imsagi olmali', async () => {
    // simdi imsaktan (fajr=04:00) once => dunun yatsisi hala aktif
    saatiDondur(new OriginalDate('2026-02-19T03:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikDk: 30,
    });

    const createCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const idVar = (id: string) => createCalls.some((c: any[]) => c[0].id === id);

    // Imsak oncesinde dunun yatsisi DUNE ait tarihle (2026-02-18) planlanmali.
    // Bu, bugunun yatsisindan (2026-02-19) ayri bir entry'dir; kritik olan dun-tarihli
    // entry'nin uretilmis olmasi (gece-donumu mantigi simdi < fajr dalini calistirir).
    const yatsiDunId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-18_yatsi`;
    expect(idVar(yatsiDunId)).toBe(true);

    // Dun-yatsisinin cikisi BUGUNUN imsagi (fajr=04:00) olmali (gece-donumu sınırı)
    const yatsiBitis = createCalls.find((c: any[]) => c[0].id === `${yatsiDunId}_bitis`);
    expect(yatsiBitis).toBeDefined();
    expect(yatsiBitis![1].timestamp).toBe(mockPrayerTimes.fajr.getTime());
  });

  it('kilinmis vakit atlanir: ogle kilinmissa ogle icin sayac/temizleme planlanmamali', async () => {
    // Saati ogle oncesine sabitle ki ogle normalde planlanacak bir aday olsun
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));
    // Bugun ogle kilinmis olarak dondur (dun icin bos kalir)
    mockKilinanVakitleriAl.mockImplementation(async (tarih: string) =>
      tarih === '2026-02-19' ? ['ogle'] : []
    );

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikDk: 30,
    });

    const createIds = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .map((c: any[]) => c[0].id as string);
    const startIds = mockStartCountdown.mock.calls.map((c: any[]) => c[0].id as string);
    const tumIds = [...createIds, ...startIds];

    const ogleId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle`;
    // Kilinmis ogle icin NE trigger NE de countdown / temizleme olusturulmamali
    expect(tumIds).not.toContain(ogleId);
    expect(tumIds).not.toContain(`${ogleId}_bitis`);
    // Kilinmamis ikindi icin planlama yine de yapilmali (filtre fazla agresif degil)
    const ikindiId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ikindi`;
    expect(tumIds).toContain(ikindiId);
  });

  it('gecmis vakit atlanir: 19:00\'da yalnizca akSam (cikis 20:00 > simdi) planlanmali', async () => {
    // 19:00: imsak(06)/ogle(15)/ikindi(18) cikislari gecmis; aksam cikisi (isha=20:00) gelecekte
    saatiDondur(new OriginalDate('2026-02-19T19:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikDk: 30,
    });

    const createIds = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .map((c: any[]) => c[0].id as string);
    const startIds = mockStartCountdown.mock.calls.map((c: any[]) => c[0].id as string);
    const tumIds = [...createIds, ...startIds];
    const onek = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_`;

    // Yalnizca aksam planlanmali
    expect(tumIds).toContain(`${onek}aksam`);
    expect(tumIds).not.toContain(`${onek}imsak`);
    expect(tumIds).not.toContain(`${onek}ogle`);
    expect(tumIds).not.toContain(`${onek}ikindi`);
  });

  it('esik araliginda: cikisa esikten az kala native countdown HEMEN dogru hedefle baslamali', async () => {
    // 14:45: ogle cikisi asr=15:00, esik 30dk => sayacBaslangic 14:30 <= simdi => HEMEN baslar
    saatiDondur(new OriginalDate('2026-02-19T14:45:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikDk: 30,
    });

    const ogleId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle`;
    const ogleCountdown = mockStartCountdown.mock.calls.find((c: any[]) => c[0].id === ogleId);

    // Native sayac CAGRILMALI ve hedefi tam vakit cikisi (asr=15:00) olmali
    expect(ogleCountdown).toBeDefined();
    expect(ogleCountdown![0].targetTimeMs).toBe(mockPrayerTimes.asr.getTime());
    expect(ogleCountdown![0].channelId).toBe(BILDIRIM_SABITLERI.KANALLAR.VAKIT_SAYAC);

    // Hemen baslayan sayac icin trigger (placeholder) DEGIL countdown kullanilmali
    const ogleTrigger = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .find((c: any[]) => c[0].id === ogleId);
    expect(ogleTrigger).toBeUndefined();

    // Temizleme trigger'i ise yine de tam cikista (15:00) kurulmali
    const ogleBitis = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .find((c: any[]) => c[0].id === `${ogleId}_bitis`);
    expect(ogleBitis).toBeDefined();
    expect(ogleBitis![1].timestamp).toBe(mockPrayerTimes.asr.getTime());
  });
});
