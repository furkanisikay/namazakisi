/**
 * Takvim çakışması servisi (issue #291): takvim yalnız izin VARKEN okunur ve
 * istenmez; izin geri alınınca plan temizlenir; temizlik yalnız kendi önekine
 * dokunur; kendi namaz etkinliklerimiz çakışma sayılmaz; kılınan vaktin uyarısı
 * takvim okunmadan iptal edilir (adlı yuva `takvimCakisma`).
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const mockIptalEtOnekliAnonslar = jest.fn((..._a: unknown[]) => true);
const mockPlanlaAnons = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: (...a: unknown[]) => mockPlanlaAnons(...a),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: (...a: unknown[]) => mockIptalEtOnekliAnonslar(...a),
    trDestekleniyorMu: jest.fn().mockResolvedValue(true),
    muhafizKanaliniGarantile: jest.fn(),
    muhafizKanallariniTemizle: jest.fn(),
}));

const mockIzin = jest.fn();
const mockIzinIste = jest.fn();
const mockTakvimler = jest.fn();
const mockEtkinlikler = jest.fn();
jest.mock('expo-calendar/legacy', () => ({
    EntityTypes: { EVENT: 'event' },
    getCalendarPermissionsAsync: (...a: unknown[]) => mockIzin(...a),
    requestCalendarPermissionsAsync: (...a: unknown[]) => mockIzinIste(...a),
    getCalendarsAsync: (...a: unknown[]) => mockTakvimler(...a),
    getEventsAsync: (...a: unknown[]) => mockEtkinlikler(...a),
}));

import { TakvimCakismaServisi, takvimCakismaTeslimcisiniAyarla } from '../TakvimCakismaServisi';
import { takvimIzinDurumunuOku, takvimIzniIste } from '../TakvimEtkinlikOkuyucu';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { UYGULAMA_TAKVIM_NOTU } from '../../../core/takvimCakisma/takvimCakismaAyarlari';
import { gurubKerahatiBaslangiciMs } from '../../../core/muhafiz/erteleme';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';
import * as LocalNamazServisi from '../../../data/local/LocalNamazServisi';

const DK = 60_000;
const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const SIMDI = new Date(2026, 9, 12, 7, 0);
const pt = new PrayerTimes(new Coordinates(ISTANBUL.lat, ISTANBUL.lng), new Date(2026, 9, 12), CalculationMethod.Turkey());
const ikindiSonAn = gurubKerahatiBaslangiciMs(pt.maghrib.getTime());
const TOPLANTI = {
    startDate: new Date(pt.asr.getTime() + 60 * DK).toISOString(),
    endDate: new Date(ikindiSonAn + 20 * DK).toISOString(),
    allDay: false,
    availability: 'busy',
    status: 'confirmed',
    title: 'Gizli proje toplantısı',
    notes: '',
};

const planlanan = () => (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
const iptal = () => (Notifications.cancelScheduledNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);

const ayarYaz = (ayar: Record<string, unknown>) =>
    AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI, JSON.stringify(ayar));
const ACIK = { aktif: true, oncedenDk: 30, baslikGoster: false, rizaZamani: '2026-10-01T10:00:00.000Z' };
const tetikler = (p: { trigger: { date: Date } }[]) => p.map((x) => x.trigger.date.getTime());

let servis: TakvimCakismaServisi;

beforeEach(async () => {
    jest.clearAllMocks();
    // Teslimci geçmiş tetiği kurmaz → sistem saati SIMDI'ye sabit (zamanlayıcılar gerçek).
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'queueMicrotask'] });
    jest.setSystemTime(SIMDI);
    await AsyncStorage.clear();
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);
    mockIzin.mockResolvedValue({ status: 'granted' });
    mockIzinIste.mockResolvedValue({ status: 'granted' });
    mockTakvimler.mockResolvedValue([{ id: 'is' }, { id: 'dogum', type: 'birthdays' }]);
    mockEtkinlikler.mockResolvedValue([TOPLANTI]);
    (Notifications.getPresentedNotificationsAsync as jest.Mock | undefined)?.mockResolvedValue?.([]);
    jest.replaceProperty(Platform, 'OS', 'android');
    takvimCakismaTeslimcisiniAyarla(null);
    servis = TakvimCakismaServisi.getInstance();
    servis.__testIcinSifirla();
});

afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    takvimCakismaTeslimcisiniAyarla(null);
});

describe('TakvimCakismaServisi', () => {
    it('çakışan toplantı için vakit_bildirim kanalından TEK uyarı kurar; ad varsayılan GİZLİ', async () => {
        await ayarYaz(ACIK);
        await servis.hatirlatmalariGuncelle(ISTANBUL, SIMDI);
        const p = planlanan();
        expect(p).toHaveLength(1);
        expect(p[0].identifier).toMatch(/^takvim_cakisma_\d{4}-\d{2}-\d{2}_ikindi$/);
        expect(p[0].trigger.channelId).toBe('vakit_bildirim');
        expect(p[0].trigger.date.getTime()).toBe(Date.parse(TOPLANTI.startDate) - 30 * DK);
        // Gizlilik: ad ne metinde ne veride.
        expect(JSON.stringify(p[0].content)).not.toContain('Gizli proje');
        // Doğum günü takvimi okunmaz.
        expect(mockEtkinlikler.mock.calls[0][0]).toEqual(['is']);
    });

    it('ad ayarı AÇIKKEN metinde görünür, veride yine görünmez', async () => {
        await ayarYaz({ ...ACIK, baslikGoster: true });
        await servis.hatirlatmalariGuncelle(ISTANBUL, SIMDI);
        const icerik = planlanan()[0].content;
        expect(icerik.body).toContain('Gizli proje toplantısı');
        expect(JSON.stringify(icerik.data)).not.toContain('Gizli');
    });

    it('uygulamanın KENDİ namaz etkinliği çakışma sayılmaz', async () => {
        await ayarYaz(ACIK);
        mockEtkinlikler.mockResolvedValue([{ ...TOPLANTI, title: 'İkindi Namazı', notes: UYGULAMA_TAKVIM_NOTU }]);
        await servis.hatirlatmalariGuncelle(ISTANBUL, SIMDI);
        expect(planlanan()).toHaveLength(0);
    });

    it('izin İSTENMEZ; izin yoksa takvim okunmaz ve KURULU plan temizlenir', async () => {
        await ayarYaz(ACIK);
        mockIzin.mockResolvedValue({ status: 'denied' });
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'takvim_cakisma_2026-10-12_ikindi' },
        ]);
        await servis.hatirlatmalariGuncelle(ISTANBUL, SIMDI);
        expect(mockIzinIste).not.toHaveBeenCalled();
        expect(mockEtkinlikler).not.toHaveBeenCalled();
        expect(iptal()).toEqual(['takvim_cakisma_2026-10-12_ikindi']);
        expect(planlanan()).toHaveLength(0);
    });

    it('takvim okuma HATASINDA ve konum yokken kurulu plan KORUNUR', async () => {
        await ayarYaz(ACIK);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'takvim_cakisma_2026-10-12_ikindi' },
        ]);
        mockEtkinlikler.mockRejectedValue(new Error('binder'));
        await servis.hatirlatmalariGuncelle(ISTANBUL, SIMDI);
        await servis.hatirlatmalariGuncelle({ lat: 0, lng: 0 }, SIMDI);
        expect(iptal()).toHaveLength(0);
    });

    it('kapalıyken (ya da rıza kaydı yokken) takvim OKUNMAZ, yalnız kendi önekini temizler', async () => {
        await ayarYaz({ ...ACIK, rizaZamani: undefined });
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'takvim_cakisma_2026-10-12_ogle' },
            { identifier: 'camiye_git_2026-10-12_ogle' },
            { identifier: 'muhafiz_2026-10-12_vakit_ogle_seviye_1_dk_45' },
        ]);
        await servis.hatirlatmalariGuncelle(ISTANBUL, SIMDI);
        expect(mockIzin).not.toHaveBeenCalled();
        expect(mockEtkinlikler).not.toHaveBeenCalled();
        expect(iptal()).toEqual(['takvim_cakisma_2026-10-12_ogle']);
    });

    it('koordinat verilmezse ham konum kaydından okunur (headless yol)', async () => {
        await ayarYaz(ACIK);
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI, JSON.stringify({ koordinatlar: ISTANBUL }));
        await servis.hatirlatmalariGuncelle(undefined, SIMDI);
        expect(planlanan()).toHaveLength(1);
    });

    it('kılınmışlık değişince (adlı yuva) o vaktin uyarısı TAKVİM OKUNMADAN iptal edilir', async () => {
        const ekle = jest.spyOn(LocalNamazServisi, 'kayitDegistiDinleyicisiEkle');
        jest.spyOn(LocalNamazServisi, 'kilinanVakitleriAl').mockImplementation(async (t) =>
            t === bugunuAl() ? ['ikindi'] : []
        );
        const kok = `takvim_cakisma_${bugunuAl()}_ikindi`;
        // Kök + tekrarlar iptal edilir; başka vakit / benzer önekli kimlik DOKUNULMAZ.
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: kok },
            { identifier: `${kok}_20` },
            { identifier: `takvim_cakisma_${bugunuAl()}_ogle` },
        ]);
        (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([
            { request: { identifier: `${kok}_10` } },
            { request: { identifier: `takvim_cakisma_${bugunuAl()}_aksam` } },
        ]);
        const sustur = jest.fn();
        takvimCakismaTeslimcisiniAyarla({
            ad: 'android',
            hazirla: jest.fn(async () => undefined),
            uyariPlanla: jest.fn(),
            yanKanaliIptalEt: jest.fn(),
            tumYanKanallariIptalEt: jest.fn(),
            vakitYanKanallariniIptalEt: sustur,
        });
        servis.baslat();
        expect(ekle).toHaveBeenCalledWith('takvimCakisma', expect.any(Function));
        await servis.kilinanlarinUyarilariniIptalEt();
        expect(iptal()).toEqual([kok, `${kok}_20`]);
        expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(`${kok}_10`);
        expect(Notifications.dismissNotificationAsync).toHaveBeenCalledTimes(1);
        // Sesli anons + gerçek alarm (çalan dahil) kökle susar.
        expect(mockIptalEtOnekliAnonslar).toHaveBeenCalledWith(kok);
        expect(sustur).toHaveBeenCalledWith(kok);
        expect(mockEtkinlikler).not.toHaveBeenCalled();
    });

    it('ÇOK ADIM + TEKRAR: tetikler çapaya kadar sürer, ilk tetik tarihsel kimliği korur', async () => {
        await ayarYaz({
            ...ACIK,
            adimlar: [
                { esikDk: 60, siklik: 'birkez', kanallar: { bildirim: true } },
                { esikDk: 20, siklik: { herDk: 10 }, kanallar: { bildirim: true } },
            ],
        });
        await servis.hatirlatmalariGuncelle(ISTANBUL, SIMDI);
        const p = planlanan();
        const bas = Date.parse(TOPLANTI.startDate);
        expect(tetikler(p)).toEqual([bas - 60 * DK, bas - 20 * DK, bas - 10 * DK]);
        expect(p[0].identifier).toMatch(/^takvim_cakisma_\d{4}-\d{2}-\d{2}_ikindi$/);
        expect(p[1].identifier).toBe(`${p[0].identifier}_20`);
        expect(p[2].identifier).toBe(`${p[0].identifier}_10`);
        // Tekrar = AYNI uyarı: metin değişmez, kategori YOK, yük ADSIZ.
        expect(new Set(p.map((x) => x.content.body)).size).toBe(1);
        for (const x of p) {
            expect(x.content.categoryIdentifier).toBeUndefined();
            expect(x.content.data).toEqual({ tip: 'takvim_cakisma', vakit: 'ikindi', tarih: expect.any(String) });
        }
    });

    it('GİZLİLİK: sesli anons metni ad açıkken bile ADI ve SAATİ taşımaz', async () => {
        await ayarYaz({
            ...ACIK,
            baslikGoster: true,
            sesliOnayi: true,
            adimlar: [{ esikDk: 30, siklik: 'birkez', kanallar: { bildirim: true, sesli: true } }],
        });
        await servis.hatirlatmalariGuncelle(ISTANBUL, SIMDI);
        expect(planlanan()[0].content.body).toContain('Gizli proje toplantısı');
        expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
        const metin = JSON.stringify(mockPlanlaAnons.mock.calls[0]);
        expect(metin).not.toContain('Gizli');
        expect(metin).toContain('Takviminizdeki bir etkinlik ikindi vaktine denk geliyor.');
        expect(metin).not.toMatch(/\d{2}:\d{2}/);
    });

    it('izin geri alınınca önceki turun ALARM/ANONSLARI da temizlenir (teslimci hazırlığı)', async () => {
        await ayarYaz(ACIK);
        mockIzin.mockResolvedValue({ status: 'denied' });
        const hazirla = jest.fn(async () => undefined);
        takvimCakismaTeslimcisiniAyarla({
            ad: 'android',
            hazirla,
            uyariPlanla: jest.fn(),
            yanKanaliIptalEt: jest.fn(),
            tumYanKanallariIptalEt: jest.fn(),
        });
        await servis.hatirlatmalariGuncelle(ISTANBUL, SIMDI);
        expect(hazirla).toHaveBeenCalledTimes(1);
        expect(mockIptalEtOnekliAnonslar).toHaveBeenCalledWith('takvim_cakisma_');
    });
});

describe('TakvimEtkinlikOkuyucu izin yardımcıları', () => {
    it('durum sorgusu diyalog açmaz; isteme yalnız açıkça çağrılınca', async () => {
        mockIzin.mockResolvedValue({ status: 'undetermined' });
        await expect(takvimIzinDurumunuOku()).resolves.toBe('verilmedi');
        expect(mockIzinIste).not.toHaveBeenCalled();
        await expect(takvimIzniIste()).resolves.toEqual({ verildi: true, tekrarSorulabilir: true });
        mockIzin.mockRejectedValue(new Error('x'));
        await expect(takvimIzinDurumunuOku()).resolves.toBe('bilinmiyor');
    });
});
