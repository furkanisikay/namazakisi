/**
 * NafileHatirlatmaServisi (issue #77). Plan üretici SAF (koordinat/zaman enjekte);
 * vakitler gerçek adhan'dan (İstanbul). Sabit "bugün" yazılmaz: plan `bugunIso`
 * ve `simdi` ile çağrılır, servis testi `bugunuAl()` kullanır.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NafileHatirlatmaServisi, nafilePlaniOlustur, NAFILE_ID_ONEKI } from '../NafileHatirlatmaServisi';
import { LocalNafileServisi } from '../../../data/local/LocalNafileServisi';
import { VARSAYILAN_NAFILE_AYARLARI, type NafileAyarlari } from '../../../core/nafile/nafileTipleri';
import { gununNafilePencereleri } from '../../../core/nafile/gunVakitleri';
import { BILDIRIM_SABITLERI } from '../../../core/constants/UygulamaSabitleri';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';

// Fabrikalı mock: automock `export *` ile gelen ses enum'larını (AndroidAudioUsage) düşürür.
jest.mock('expo-notifications', () => ({
    getAllScheduledNotificationsAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    getNotificationChannelAsync: jest.fn(),
    setNotificationChannelAsync: jest.fn(),
    SchedulableTriggerInputTypes: { DATE: 'date' },
    AndroidImportance: { MAX: 7 },
    AndroidAudioUsage: { ALARM: 4 },
    AndroidAudioContentType: { SONIFICATION: 4 },
}));
jest.mock('../../../data/local/LocalNafileServisi', () => ({
    ...jest.requireActual('../../../data/local/LocalNafileServisi'),
    LocalNafileServisi: { getAyarlar: jest.fn(), saveAyarlar: jest.fn() },
}));
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const GUN = '2026-06-21';
const DK = 60 * 1000;

const ayar = (d: Partial<NafileAyarlari> = {}): NafileAyarlari => ({
    ...VARSAYILAN_NAFILE_AYARLARI,
    ...d,
});

describe('nafilePlaniOlustur', () => {
    const gunBasi = new Date(gununNafilePencereleri(ISTANBUL, GUN)[0].baslangic.getTime() - 3 * 60 * DK);

    it('hepsi kapalıyken boş plan', () => {
        expect(nafilePlaniOlustur(ISTANBUL, ayar(), gunBasi, GUN)).toEqual([]);
    });

    it('kuşluk: bugün + 2 gün, pencere başı + ofset, id formatı', () => {
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: false, ofsetDk: 15 } } }),
            gunBasi,
            GUN
        );
        expect(plan).toHaveLength(3);
        expect(plan.map((p) => p.id)).toEqual([
            `${NAFILE_ID_ONEKI}2026-06-21_kusluk`,
            `${NAFILE_ID_ONEKI}2026-06-22_kusluk`,
            `${NAFILE_ID_ONEKI}2026-06-23_kusluk`,
        ]);
        const k = gununNafilePencereleri(ISTANBUL, GUN)[0];
        expect(plan[0].zaman.getTime()).toBe(k.baslangic.getTime() + 5 * DK);
        expect(plan[0].uyandirma).toBe(false);
    });

    it('ofset pencereyi aşarsa o gün planlanmaz', () => {
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ hatirlatmalar: { kusluk: { aktif: false, ofsetDk: 5 }, evvabin: { aktif: true, ofsetDk: 120 } } }),
            gunBasi,
            GUN
        );
        // Haziranda İstanbul'da akşam→yatsı ~1,5 sa: 120 dk ofset pencere dışında.
        expect(plan).toEqual([]);
    });

    it('teheccüd: 7 gece; uyandırmada her gece 3 dk sonra ikinci hatırlatma', () => {
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ teheccud: { aktif: true, hedef: 'sonUcteBir', imsaktanOnceDk: 60, uyandirma: true } }),
            gunBasi,
            GUN
        );
        expect(plan.filter((p) => !p.id.endsWith('_2'))).toHaveLength(7);
        expect(plan.filter((p) => p.id.endsWith('_2'))).toHaveLength(7);
        expect(plan.every((p) => p.uyandirma)).toBe(true);
        expect(plan[1].zaman.getTime() - plan[0].zaman.getTime()).toBe(3 * DK);
        expect(plan[0].govde.startsWith('Kalk')).toBe(true);
    });

    it('GECE YARISI: imsaktan önce çağrılınca DÜNÜN gecesinin teheccüdü hâlâ planlanır', () => {
        const dunGecesi = gununNafilePencereleri(ISTANBUL, '2026-06-20')[2];
        const geceOrtasi = new Date((dunGecesi.baslangic.getTime() + dunGecesi.faziletli.getTime()) / 2);
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ teheccud: { aktif: true, hedef: 'sonUcteBir', imsaktanOnceDk: 60, uyandirma: false } }),
            geceOrtasi,
            GUN
        );
        expect(plan[0].id).toBe(`${NAFILE_ID_ONEKI}2026-06-20_teheccud`);
        expect(plan[0].zaman).toEqual(dunGecesi.faziletli);
    });

    it('geçmiş anlar planlanmaz ve plan kronolojiktir', () => {
        const ogleden = new Date(gununNafilePencereleri(ISTANBUL, GUN)[0].bitis.getTime() + DK);
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: true, ofsetDk: 15 } } }),
            ogleden,
            GUN
        );
        expect(plan.every((p) => p.zaman.getTime() > ogleden.getTime())).toBe(true);
        const zamanlar = plan.map((p) => p.zaman.getTime());
        expect([...zamanlar].sort((a, b) => a - b)).toEqual(zamanlar);
        expect(plan.some((p) => p.id === `${NAFILE_ID_ONEKI}2026-06-21_kusluk`)).toBe(false);
    });
});

describe('NafileHatirlatmaServisi', () => {
    const servis = NafileHatirlatmaServisi.getInstance();
    const getAyarlar = LocalNafileServisi.getAyarlar as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: `${NAFILE_ID_ONEKI}eski` },
            { identifier: 'cuma_hatirlatma_2026-01-02' },
        ]);
        (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
        (Notifications.getNotificationChannelAsync as jest.Mock).mockResolvedValue(null);
    });

    it('hepsi kapalı → yalnız nafile önekli bildirimleri temizler, başka sisteme dokunmaz', async () => {
        getAyarlar.mockResolvedValue(ayar());
        await servis.hatirlatmalariGuncelle(ISTANBUL);
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(`${NAFILE_ID_ONEKI}eski`);
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it.each([null, { lat: 0, lng: 0 }])('konum yoksa (%p) KURULU plan korunur (temizlenmez)', async (k) => {
        getAyarlar.mockResolvedValue(ayar({ teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true } }));
        await servis.hatirlatmalariGuncelle(k);
        expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    afterEach(() => jest.restoreAllMocks());

    it('ANDROID: uyandırma açıkken kanal planlamadan ÖNCE, YOKSA oluşturulur ve bildirim o kanala gider', async () => {
        // Jest varsayılan platformu iOS'tur (AGENTS.md) — Android dalı açıkça seçilir.
        jest.replaceProperty(Platform, 'OS', 'android');
        getAyarlar.mockResolvedValue(
            ayar({ teheccud: { aktif: true, hedef: 'sonUcteBir', imsaktanOnceDk: 60, uyandirma: true } })
        );
        await servis.hatirlatmalariGuncelle(ISTANBUL);

        const kanal = Notifications.setNotificationChannelAsync as jest.Mock;
        expect(kanal).toHaveBeenCalledTimes(1);
        expect(kanal.mock.calls[0][0]).toBe(BILDIRIM_SABITLERI.KANALLAR.NAFILE_UYANDIRMA);
        expect(kanal.mock.calls[0][1]).toMatchObject({
            bypassDnd: true,
            sound: 'bildirim.mp3',
            importance: 7,
            audioAttributes: { usage: 4, contentType: 4 },
        });
        const planla = Notifications.scheduleNotificationAsync as jest.Mock;
        expect(kanal.mock.invocationCallOrder[0]).toBeLessThan(planla.mock.invocationCallOrder[0]);
        expect(planla.mock.calls[0][0].trigger.channelId).toBe(BILDIRIM_SABITLERI.KANALLAR.NAFILE_UYANDIRMA);
    });

    it('iOS: kanal oluşturulmaz, uyandırma time-sensitive bildirimdir', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        getAyarlar.mockResolvedValue(
            ayar({ teheccud: { aktif: true, hedef: 'sonUcteBir', imsaktanOnceDk: 60, uyandirma: true } })
        );
        await servis.hatirlatmalariGuncelle(ISTANBUL);
        expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
        const istek = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
        expect(istek.content.interruptionLevel).toBe('timeSensitive');
        expect(istek.content.sound).toBe('bildirim.wav');
    });

    it('mevcut kanala DOKUNULMAZ (ses/önem sonradan değiştirilemez)', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        (Notifications.getNotificationChannelAsync as jest.Mock).mockResolvedValue({ id: 'nafile_uyandirma' });
        getAyarlar.mockResolvedValue(
            ayar({ teheccud: { aktif: true, hedef: 'sonUcteBir', imsaktanOnceDk: 60, uyandirma: true } })
        );
        await servis.hatirlatmalariGuncelle(ISTANBUL);
        expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });

    it('gündüz nafilesi mevcut vakit_bildirim kanalından gider (yeni kanal açılmaz)', async () => {
        getAyarlar.mockResolvedValue(
            ayar({ hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: true, ofsetDk: 15 } } })
        );
        await servis.hatirlatmalariGuncelle(ISTANBUL);
        expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
        const cagrilar = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
        expect(cagrilar.length).toBeGreaterThan(0);
        for (const [istek] of cagrilar) {
            expect(istek.trigger.channelId).toBe(BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM);
            expect(istek.identifier.startsWith(`${NAFILE_ID_ONEKI}`)).toBe(true);
            expect(istek.identifier).not.toContain('undefined');
        }
        // Planlanan ilk gün bugün ya da sonrasıdır (tarih bugunuAl ile, sabit değil).
        expect(cagrilar[0][0].identifier >= `${NAFILE_ID_ONEKI}${bugunuAl()}`).toBe(true);
    });
});
