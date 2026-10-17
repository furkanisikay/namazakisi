/**
 * CamiyeGitHatirlatmaServisi (issue #292) — cuma servisinin deseni.
 * Saat yalnız `Date` sahtelenerek sabitlenir (zamanlayıcılar gerçek).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CamiyeGitHatirlatmaServisi, camiyeGitTeslimcisiniAl, camiyeGitTeslimcisiniAyarla } from '../CamiyeGitHatirlatmaServisi';
import { DEPOLAMA_ANAHTARLARI, BILDIRIM_SABITLERI } from '../../../core/constants/UygulamaSabitleri';

// Android teslimcisi native TTS köprüsünü import eder (jest'te yok — AGENTS.md).
const mockOnekliAnons = jest.fn((_o: string) => true);
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: (o: string) => mockOnekliAnons(o),
    muhafizKanaliniGarantile: jest.fn(),
    muhafizKanallariniTemizle: jest.fn(),
}));

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
/** 13 Ekim 2026 Salı 09:00 — 16 Ekim cuma. */
const SALI_SABAH = new Date(2026, 9, 13, 9, 0, 0);

const disk = new Map<string, string>();
const planlananlar = () =>
    (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);

const ayarYaz = (ayar: object) => disk.set(DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI, JSON.stringify(ayar));
const ACIK = {
    aktif: true,
    vakitler: { imsak: false, ogle: true, ikindi: false, aksam: false, yatsi: false },
    yurumeDk: 10,
    hazirlikDk: 0,
    yurumeKaynagi: 'elle',
};

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: SALI_SABAH, doNotFake: ['setTimeout', 'clearTimeout', 'setImmediate', 'nextTick', 'queueMicrotask'] });
    disk.clear();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) => disk.get(k) ?? null);
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
    jest.replaceProperty(Platform, 'OS', 'android');
    camiyeGitTeslimcisiniAyarla(null);
});

afterEach(() => {
    jest.useRealTimers();
});

afterAll(() => camiyeGitTeslimcisiniAyarla(null));

describe('CamiyeGitHatirlatmaServisi', () => {
    const servis = () => CamiyeGitHatirlatmaServisi.getInstance();

    it('kapalıyken planlamaz ve YALNIZ kendi önekli bildirimlerini temizler', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'camiye_git_2026-10-13_ogle' },
            { identifier: 'cuma_hatirlatma_2026-10-16' },
        ]);
        await servis().hatirlatmalariGuncelle(ISTANBUL);
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('camiye_git_2026-10-13_ogle');
        expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('cuma_hatirlatma_2026-10-16');
    });

    it('konum yoksa (null / 0,0) KURULU planı silmez — bayat plan plansızlıktan iyidir', async () => {
        ayarYaz(ACIK);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'camiye_git_2026-10-13_ogle' },
        ]);
        await servis().hatirlatmalariGuncelle({ lat: 0, lng: 0 });
        await servis().hatirlatmalariGuncelle(null);
        expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('Android: 7 gün, vakit_bildirim kanalı, DATE tetiği, tarihli kimlik', async () => {
        ayarYaz(ACIK);
        await servis().hatirlatmalariGuncelle(ISTANBUL);
        const p = planlananlar();
        expect(p).toHaveLength(7);
        expect(p[0].identifier).toBe('camiye_git_2026-10-13_ogle');
        expect(p[0].trigger).toMatchObject({
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
        });
        expect(p[0].content.title).toBe('Öğle · ezana 10 dk · camiye yola çık');
        expect(p[0].content.body).toBe('Öğle namazına camide yetişmek için yola çık — ezana 10 dk.');
        expect(p[0].content.data).toEqual({ tip: 'camiye_git', vakit: 'ogle', tarih: '2026-10-13' });
        // Kategori YOK ("Kıldım" FARZ yazmasın), ses sistem sesi.
        expect(p[0].content).not.toHaveProperty('categoryIdentifier');
        expect(p[0].content.sound).toBe(true);
        // Teslim muhafızın teslim katmanından, KENDİ örneğiyle.
        expect(camiyeGitTeslimcisiniAl().ad).toBe('android');
    });

    it('önceki turun anonsları YALNIZ kendi önekiyle silinir (muhafız/nafile/cuma korunur)', async () => {
        ayarYaz(ACIK);
        await servis().hatirlatmalariGuncelle(ISTANBUL);
        expect(mockOnekliAnons).toHaveBeenCalledWith('camiye_git_');
        expect(mockOnekliAnons).not.toHaveBeenCalledWith('muhafiz_');
    });

    it('çok adım + tekrar: ilk tetik tarihsel kimlik, tekrarlar `_<kalanDk>`', async () => {
        ayarYaz({ ...ACIK, adimlar: [{ esikDk: 30, siklik: { herDk: 10 }, kanallar: { bildirim: true } }] });
        await servis().hatirlatmalariGuncelle(ISTANBUL);
        const bugun = planlananlar()
            .map((p) => String(p.identifier))
            .filter((id) => id.startsWith('camiye_git_2026-10-13_ogle'));
        expect(bugun).toEqual([
            'camiye_git_2026-10-13_ogle',
            'camiye_git_2026-10-13_ogle_20',
            'camiye_git_2026-10-13_ogle_10',
        ]);
    });

    it('iOS: 3 gün ufku (64 bekleyen bildirim bütçesi)', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        ayarYaz(ACIK);
        await servis().hatirlatmalariGuncelle(ISTANBUL);
        expect(planlananlar()).toHaveLength(3);
    });

    it('ÇAKIŞMA: cuma hatırlatması açıksa cuma günü öğle kurulmaz', async () => {
        ayarYaz(ACIK);
        disk.set(
            DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI,
            JSON.stringify({ aktif: true, oncedenDk: 60, siklik: 'birkez' })
        );
        await servis().hatirlatmalariGuncelle(ISTANBUL);
        const ids = planlananlar().map((p) => p.identifier);
        expect(ids).toHaveLength(6);
        expect(ids).not.toContain('camiye_git_2026-10-16_ogle');
    });

    it('özel gün aralığındaki günlerin hatırlatması kurulmaz (kapı planlayıcının İÇİNDE)', async () => {
        ayarYaz(ACIK);
        disk.set(
            DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI,
            JSON.stringify({
                ozelGunModuAktif: true,
                aktifOzelGun: { baslangicTarihi: '2026-10-14', bitisTarihi: '2026-10-15' },
                gecmisKayitlar: [],
            })
        );
        await servis().hatirlatmalariGuncelle(ISTANBUL);
        const ids = planlananlar().map((p) => p.identifier);
        expect(ids).not.toContain('camiye_git_2026-10-14_ogle');
        expect(ids).not.toContain('camiye_git_2026-10-15_ogle');
        expect(ids).toContain('camiye_git_2026-10-13_ogle');
    });

    it('tek planlama patlarsa KALANLAR yine kurulur', async () => {
        ayarYaz(ACIK);
        (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(new Error('x'));
        await servis().hatirlatmalariGuncelle(ISTANBUL);
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(7);
    });
});
