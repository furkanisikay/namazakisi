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
import type { MuhafizVakti } from '../../../core/muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI } from '../../../core/muhafiz/matrisTipleri';

/**
 * Faz 3: esikler artik VAKIT BAZLI. Eski global `baslangicEsikDk: 30`in birebir
 * karsiligi "her vakit 30 dk"dir; mevcut testler bu sabitle ayni davranisi korur.
 */
const esikleriKur = (esikler: Partial<Record<MuhafizVakti, number>>, varsayilan = 0): Record<MuhafizVakti, number> => {
  const sonuc = {} as Record<MuhafizVakti, number>;
  for (const vakit of MUHAFIZ_VAKITLERI) sonuc[vakit] = esikler[vakit] ?? varsayilan;
  return sonuc;
};

const TUM_VAKITLER_30 = esikleriKur({}, 30);

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
    // Kanal ARTIK planlanacak en az bir vakit varsa acilir (bos planda kanal
    // acmak gereksizdi; muhafiz tum vakitleri kapsadiginda da acilmamali).
    // Bu yuzden saati planlanabilir bir ana sabitle.
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();

    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikleri: TUM_VAKITLER_30,
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
      baslangicEsikleri: TUM_VAKITLER_30,
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
        baslangicEsikleri: TUM_VAKITLER_30,
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
      baslangicEsikleri: TUM_VAKITLER_30,
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
      baslangicEsikleri: TUM_VAKITLER_30,
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
      baslangicEsikleri: TUM_VAKITLER_30,
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
      baslangicEsikleri: TUM_VAKITLER_30,
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
      baslangicEsikleri: TUM_VAKITLER_30,
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

  it('muhafiz aktif: cakismayi onlemek icin sayac bildirimi PLANLANMAMALI (yalniz temizlik) (#90)', async () => {
    // Saati ogle oncesine sabitle ki muhafiz olmasaydi normalde planlanacak adaylar olsun
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikleri: TUM_VAKITLER_30,
      muhafizAktif: true,
    });

    // Once temizleme calismali (gosterilen bildirimler taranir) ...
    expect(notifee.getDisplayedNotifications).toHaveBeenCalled();
    // ... ama muhafiz acikken kanal acilmaz ve YENI hicbir bildirim olusturulmaz
    expect(notifee.createChannel).not.toHaveBeenCalled();
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
    expect(mockStartCountdown).not.toHaveBeenCalled();
  });

  it('muhafiz kapali: sayac bildirimi normal planlanmali (cakisma yokken bastirma yapilmamali) (#90)', async () => {
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikleri: TUM_VAKITLER_30,
      muhafizAktif: false,
    });

    // Muhafiz kapaliyken sayac normal calismali: kanal acilir ve ogle icin trigger kurulur
    expect(notifee.createChannel).toHaveBeenCalled();
    const createIds = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .map((c: any[]) => c[0].id as string);
    const ogleId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle`;
    expect(createIds).toContain(ogleId);
  });

  it('muhafiz aktif ama O VAKIT tumden sessiz: sayac bastirilmamali (#90 boslugu)', async () => {
    // Faz 2 ile kullanici TEK bir vakti matriste tumden susturabiliyor. O vakitte
    // muhafiz hicbir bildirim uretmez -> global bastirma uygulanirsa kullanici o
    // vakit icin HICBIR hatirlatma almaz. Bastirma yalniz muhafizin gercekten
    // uyardigi vakitlere uygulanmali.
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikleri: TUM_VAKITLER_30,
      muhafizAktif: true,
      // 'ogle' listede YOK -> muhafiz orada susuyor -> sayac calismali
      muhafizUyarilanVakitler: ['imsak', 'ikindi', 'aksam', 'yatsi'],
    });

    const createIds = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .map((c: any[]) => c[0].id as string);
    const onek = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_`;

    // Muhafizin sustugu 'ogle' icin sayac KURULMALI
    expect(createIds).toContain(`${onek}ogle`);
    // Muhafizin uyardigi vakitler icin ise cakismayi onlemek uzere KURULMAMALI
    expect(createIds).not.toContain(`${onek}ikindi`);
    expect(createIds).not.toContain(`${onek}aksam`);
    expect(createIds).not.toContain(`${onek}yatsi`);
  });

  it('esikler VAKIT BAZLI: her vakit kendi sayac baslangicini kullanmali', async () => {
    // 10:00. ogle cikisi (asr) 15:00, ikindi cikisi (maghrib) 18:00.
    // ogle esigi 30 dk -> 14:30; ikindi esigi 45 dk -> 17:15.
    // Global tek esik regresyonunda ikisi de ayni degeri kullanir ve test duser.
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikleri: esikleriKur({ ogle: 30, ikindi: 45, aksam: 20, yatsi: 20, imsak: 20 }),
    });

    const createCalls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const onek = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_`;
    const tetik = (id: string) => createCalls.find((c: any[]) => c[0].id === id)?.[1].timestamp;

    expect(tetik(`${onek}ogle`)).toBe(mockPrayerTimes.asr.getTime() - 30 * 60 * 1000);
    expect(tetik(`${onek}ikindi`)).toBe(mockPrayerTimes.maghrib.getTime() - 45 * 60 * 1000);
  });

  it('esigi olmayan/0 olan vakit icin sayac planlanmaz', async () => {
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      // 'ogle' esigi 0 -> planlanacak baslangic noktasi yok
      baslangicEsikleri: esikleriKur({ ikindi: 30, aksam: 30, yatsi: 30, imsak: 30 }),
    });

    const createIds = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .map((c: any[]) => c[0].id as string);
    const onek = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_`;

    expect(createIds).not.toContain(`${onek}ogle`);
    expect(createIds).toContain(`${onek}ikindi`);
  });

  it('muhafizAktif belirtilmemis: geriye uyumlu sekilde sayac normal planlanmali', async () => {
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.yapilandirVePlanla({
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikleri: TUM_VAKITLER_30,
    });

    const createIds = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .map((c: any[]) => c[0].id as string);
    const ogleId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle`;
    expect(createIds).toContain(ogleId);
  });

  it('kanal idempotency: ikinci yapilandirmada kanal TEKRAR olusturulmamali', async () => {
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));

    const servis = VakitSayacBildirimServisi.getInstance();
    const ayarlar = {
      aktif: true,
      koordinatlar: { lat: 41, lng: 29 },
      baslangicEsikleri: TUM_VAKITLER_30,
    };

    await servis.yapilandirVePlanla(ayarlar);
    expect(notifee.createChannel).toHaveBeenCalledTimes(1);

    // Ikinci kez yapilandir: kanal zaten olusturuldu bayragi set => tekrar acilmamali
    await servis.yapilandirVePlanla(ayarlar);
    expect(notifee.createChannel).toHaveBeenCalledTimes(1);
  });

  it('kanal olusturma hatasi: createChannel reddetse bile akis cokmemeli (catch yutulur)', async () => {
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));
    (notifee.createChannel as jest.Mock).mockRejectedValueOnce(new Error('kanal patladi'));

    const servis = VakitSayacBildirimServisi.getInstance();

    // Kanal acilamasa da yapilandirma reddetmemeli; planlama yine de denenmeli
    await expect(
      servis.yapilandirVePlanla({
        aktif: true,
        koordinatlar: { lat: 41, lng: 29 },
        baslangicEsikleri: TUM_VAKITLER_30,
      })
    ).resolves.toBeUndefined();

    // Kanal hatasi yutuldu, vakit planlamasi yine de yapildi
    const createIds = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .map((c: any[]) => c[0].id as string);
    expect(createIds).toContain(`${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle`);
  });

  it('hemen baslayan sayac hatasi: startCountdown firlatsa bile temizleme trigger\'i yine kurulmali', async () => {
    // 14:45: ogle cikisi 15:00, esik 30dk => HEMEN native countdown baslar (firlatacak)
    saatiDondur(new OriginalDate('2026-02-19T14:45:00'));
    mockStartCountdown.mockImplementationOnce(() => {
      throw new Error('native sayac patladi');
    });

    const servis = VakitSayacBildirimServisi.getInstance();

    await expect(
      servis.yapilandirVePlanla({
        aktif: true,
        koordinatlar: { lat: 41, lng: 29 },
        baslangicEsikleri: TUM_VAKITLER_30,
      })
    ).resolves.toBeUndefined();

    // Native sayac firlatti ama akis devam etti: ogle icin temizleme (_bitis) trigger'i kuruldu
    const ogleBitis = (notifee.createTriggerNotification as jest.Mock).mock.calls
      .find((c: any[]) => c[0].id === `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle_bitis`);
    expect(ogleBitis).toBeDefined();
  });

  it('trigger planlama hatasi: createTriggerNotification reddetse bile diger vakitler planlanmaya devam etmeli', async () => {
    // 10:00: ogle/ikindi/aksam/yatsi gelecekte; ilk trigger cagrisi reddedilsin
    saatiDondur(new OriginalDate('2026-02-19T10:00:00'));
    (notifee.createTriggerNotification as jest.Mock).mockRejectedValueOnce(new Error('trigger patladi'));

    const servis = VakitSayacBildirimServisi.getInstance();

    await expect(
      servis.yapilandirVePlanla({
        aktif: true,
        koordinatlar: { lat: 41, lng: 29 },
        baslangicEsikleri: TUM_VAKITLER_30,
      })
    ).resolves.toBeUndefined();

    // Ilk trigger reddedildi (catch yutuldu) ama sonraki vakitler icin cagri devam etti
    expect((notifee.createTriggerNotification as jest.Mock).mock.calls.length).toBeGreaterThan(1);
  });

  it('asamaGecisiniIsle: _vakitgirdi sonekli ID temel bildirimi iptal etmeli', async () => {
    const servis = VakitSayacBildirimServisi.getInstance();
    const temelId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle`;

    await servis.asamaGecisiniIsle(`${temelId}_vakitgirdi`);

    expect(notifee.cancelNotification).toHaveBeenCalledWith(temelId);
  });

  it('asamaGecisiniIsle: _bitis sonekli ID hem temel hem _vakitgirdi bildirimini iptal etmeli', async () => {
    const servis = VakitSayacBildirimServisi.getInstance();
    const temelId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle`;

    await servis.asamaGecisiniIsle(`${temelId}_bitis`);

    const iptalEdilenler = (notifee.cancelNotification as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(iptalEdilenler).toContain(temelId);
    expect(iptalEdilenler).toContain(`${temelId}_vakitgirdi`);
  });

  it('asamaGecisiniIsle: eslesmeyen sonekte hicbir iptal yapilmamali', async () => {
    const servis = VakitSayacBildirimServisi.getInstance();

    await servis.asamaGecisiniIsle(`${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}2026-02-19_ogle`);

    expect(notifee.cancelNotification).not.toHaveBeenCalled();
  });

  it('temizleme trigger hatasi: _bitis trigger\'i reddetse bile sonraki vakitler planlanmaya devam etmeli', async () => {
    // 14:45: ogle HEMEN baslar (startCountdown), ardindan ilk createTriggerNotification cagrisi
    // ogle'nin _bitis temizleme trigger'idir; bunu reddet => _bitis trigger'inin catch'i yutar, akis devam eder.
    saatiDondur(new OriginalDate('2026-02-19T14:45:00'));
    (notifee.createTriggerNotification as jest.Mock).mockRejectedValueOnce(new Error('bitis trigger patladi'));

    const servis = VakitSayacBildirimServisi.getInstance();

    await expect(
      servis.yapilandirVePlanla({
        aktif: true,
        koordinatlar: { lat: 41, lng: 29 },
        baslangicEsikleri: TUM_VAKITLER_30,
      })
    ).resolves.toBeUndefined();

    // Ilk _bitis reddedildi (catch yutuldu) ama sonraki vakitlerin (ikindi/aksam/yatsi) planlamasi surdu
    expect((notifee.createTriggerNotification as jest.Mock).mock.calls.length).toBeGreaterThan(1);
  });

  it('temizleme: gosterilen sayac bildirimleri iptal edilmeli, sayac olmayanlar dokunulmamali', async () => {
    const onek = BILDIRIM_SABITLERI.ONEKLEME.SAYAC;
    const sayacBildirimId = `${onek}2026-02-19_ogle`;
    (notifee.getDisplayedNotifications as jest.Mock).mockResolvedValue([
      { id: sayacBildirimId },
      { id: 'baska_bildirim_123' }, // sayac onekli degil -> dokunulmamali
      { id: undefined }, // id'siz -> guvenli atlanmali
    ]);

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.tumSayacBildirimleriniTemizle();

    // Sayac onekli bildirim icin native countdown durdurulup notifee iptali yapilmali
    expect(mockStopCountdown).toHaveBeenCalledWith(sayacBildirimId);
    expect(notifee.cancelNotification).toHaveBeenCalledWith(sayacBildirimId);
    // Sayac olmayan bildirim icin iptal yapilmamali
    expect(notifee.cancelNotification).not.toHaveBeenCalledWith('baska_bildirim_123');
  });

  it('temizleme: sayac onekli trigger ID\'leri iptal edilmeli, digerleri korunmali', async () => {
    const onek = BILDIRIM_SABITLERI.ONEKLEME.SAYAC;
    const sayacTriggerId = `${onek}2026-02-19_yatsi`;
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
      sayacTriggerId,
      'muhafiz_2026-02-19_ogle', // baska servisin trigger'i -> korunmali
    ]);

    const servis = VakitSayacBildirimServisi.getInstance();
    await servis.tumSayacBildirimleriniTemizle();

    expect(notifee.cancelTriggerNotification).toHaveBeenCalledWith(sayacTriggerId);
    expect(notifee.cancelTriggerNotification).not.toHaveBeenCalledWith('muhafiz_2026-02-19_ogle');
  });

  it('temizleme hatasi: getDisplayedNotifications reddetse bile metot reddetmemeli (catch yutulur)', async () => {
    (notifee.getDisplayedNotifications as jest.Mock).mockRejectedValueOnce(new Error('liste alinamadi'));

    const servis = VakitSayacBildirimServisi.getInstance();

    await expect(servis.tumSayacBildirimleriniTemizle()).resolves.toBeUndefined();
  });
});
