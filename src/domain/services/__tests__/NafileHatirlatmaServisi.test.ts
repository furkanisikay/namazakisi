/**
 * NafileHatirlatmaServisi + nafile plan üreticisi (issue #77, #273).
 *
 * Plan üretici SAF (koordinat/zaman enjekte); vakitler gerçek adhan'dan
 * (İstanbul). Sabit "bugün" yazılmaz: plan `bugunIso` ve `simdi` ile çağrılır,
 * servis testi `bugunuAl()` kullanır.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    NafileHatirlatmaServisi,
    NAFILE_ID_ONEKI,
    nafilePlaniOlustur,
    nafileTeslimcisiniAyarla,
} from '../NafileHatirlatmaServisi';
import { LocalNafileServisi, nafileAyarlariniNormalize } from '../../../data/local/LocalNafileServisi';
import {
    VARSAYILAN_NAFILE_AYARLARI,
    type NafileAyarlari,
    type NafileHatirlatmaAyari,
} from '../../../core/nafile/nafileTipleri';
import { nafileAdimi } from '../../../core/nafile/nafileAdimlari';
import { gununNafilePencereleri } from '../../../core/nafile/gunVakitleri';
import { NAFILE_NASLARI } from '../../../core/nafile/nafileMetinleri';
import { nafileAnonsAlarmiKurarMi } from '../../../core/nafile/nafilePlani';
import { BILDIRIM_SABITLERI, DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { bugunuAl, gunEkle } from '../../../core/utils/TarihYardimcisi';
import { IOS_BILDIRIM_SESI } from '../../../core/muhafiz/ios/teslimPlani';

// Fabrikalı mock: automock `export *` ile gelen ses enum'larını (AndroidAudioUsage) düşürür.
jest.mock('expo-notifications', () => ({
    getAllScheduledNotificationsAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    getNotificationChannelAsync: jest.fn(),
    setNotificationChannelAsync: jest.fn(),
    getPresentedNotificationsAsync: jest.fn(),
    dismissNotificationAsync: jest.fn(),
    SchedulableTriggerInputTypes: { DATE: 'date' },
    AndroidImportance: { MAX: 7 },
    AndroidNotificationPriority: { MAX: 'max', HIGH: 'high' },
    AndroidAudioUsage: { ALARM: 4 },
    AndroidAudioContentType: { SONIFICATION: 4 },
}));
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: jest.fn(() => true),
}));
jest.mock('../MuhafizKanalServisi', () => ({
    MuhafizKanalServisi: {
        hazirla: jest.fn(async (m: unknown) => m),
        ekKanallariHazirla: jest.fn(async () => undefined),
    },
}));
jest.mock('../../../data/local/LocalNafileServisi', () => ({
    ...jest.requireActual('../../../data/local/LocalNafileServisi'),
    LocalNafileServisi: {
        getAyarlar: jest.fn(),
        saveAyarlar: jest.fn(),
        getKilinanlar: jest.fn(),
        kilindiIsaretle: jest.fn(),
    },
}));
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const kopru = jest.requireMock('../../../../modules/expo-countdown-notification/src') as Record<string, jest.Mock>;
const { MuhafizKanalServisi } = jest.requireMock('../MuhafizKanalServisi') as {
    MuhafizKanalServisi: { ekKanallariHazirla: jest.Mock };
};

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const GUN = '2026-06-21';
const DK = 60 * 1000;

/** Eski (#273 öncesi) biçimde kayıt → göçten geçmiş ayar. */
const eskiKayit = (k: Record<string, unknown>): NafileAyarlari =>
    nafileAyarlariniNormalize({ ...VARSAYILAN_NAFILE_AYARLARI, ...k });

const gunduz = (ayar: Partial<NafileHatirlatmaAyari>): NafileHatirlatmaAyari => ({
    aktif: true,
    yon: 'girisindenItibaren',
    adimlar: [nafileAdimi(5)],
    ...ayar,
});

const ayar = (d: Partial<NafileAyarlari> = {}): NafileAyarlari => ({ ...VARSAYILAN_NAFILE_AYARLARI, ...d });

const saat = (t: Date) => `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;

describe('GÖÇ: eski kayıt göçten sonra BİREBİR aynı planı üretir (issue #273 nöbetçisi)', () => {
    const gunBasi = new Date(gununNafilePencereleri(ISTANBUL, GUN)[0].baslangic.getTime() - 3 * 60 * DK);

    it('gündüz (kuşluk 5 dk + evvâbîn 15 dk): zaman, gün ve metin eskisiyle aynı', () => {
        const ayarlar = eskiKayit({
            hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: true, ofsetDk: 15 } },
        });
        const plan = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN);
        // Eski üretici (dondurulmuş): bugün + 2 gün, pencere başı + ofset, tek bildirim.
        const beklenen: { tur: string; zaman: number; govde: string }[] = [];
        for (let i = 0; i < 3; i++) {
            const iso = gunEkle(GUN, i);
            for (const p of gununNafilePencereleri(ISTANBUL, iso)) {
                if (p.tur === 'kusluk') {
                    beklenen.push({
                        tur: 'kusluk',
                        zaman: p.baslangic.getTime() + 5 * DK,
                        govde: `Kuşluk vakti girdi. İki rekât için güzel bir an; vakit ${saat(p.bitis)} saatine kadar sürer.\n${NAFILE_NASLARI.kusluk}`,
                    });
                }
                if (p.tur === 'evvabin') {
                    beklenen.push({
                        tur: 'evvabin',
                        zaman: p.baslangic.getTime() + 15 * DK,
                        govde: `Akşam namazından sonra evvâbîn için güzel bir an. Yatsı vakti ${saat(p.bitis)}.`,
                    });
                }
            }
        }
        beklenen.sort((a, b) => a.zaman - b.zaman);
        expect(plan.map((p) => ({ tur: p.tur, zaman: p.zaman.getTime(), govde: p.govde }))).toEqual(beklenen);
        // Göçmüş adım yalnız bildirimdir: sesli anons göçle AÇILMAZ (rıza uydurulamaz).
        expect(plan.every((p) => !nafileAnonsAlarmiKurarMi(p))).toBe(true);
    });

    it('teheccüd imsaktan önce 60 dk → imsak − 60 dk, metin aynı', () => {
        const ayarlar = eskiKayit({ teheccud: { aktif: true, hedef: 'imsaktanOnce', imsaktanOnceDk: 60, uyandirma: false } });
        const plan = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN);
        expect(plan).toHaveLength(7);
        for (const p of plan) {
            const pencere = gununNafilePencereleri(ISTANBUL, p.tarih)[2];
            expect(p.zaman.getTime()).toBe(pencere.bitis.getTime() - 60 * DK);
            expect(p.baslik).toBe('Teheccüd vakti');
            expect(p.govde).toBe('İmsaka 60 dakika kaldı. Teheccüd için güzel bir vakit.');
        }
    });

    it('teheccüd son üçte bir + uyandırma → her gece iki hatırlatma (3 dk arayla), en fazla 1 dk kayma, metin aynı', () => {
        const ayarlar = eskiKayit({ teheccud: { aktif: true, hedef: 'sonUcteBir', imsaktanOnceDk: 60, uyandirma: true } });
        const plan = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN);
        expect(plan).toHaveLength(14);
        for (let i = 0; i < plan.length; i += 2) {
            const pencere = gununNafilePencereleri(ISTANBUL, plan[i].tarih)[2];
            const fark = plan[i].zaman.getTime() - pencere.faziletli.getTime();
            // Motor dakika tamsayısıyla çalışır (alt sınır 1 dk): eski tam an, yeni ≤ 1 dk sonra.
            expect(fark).toBeGreaterThan(0);
            expect(fark).toBeLessThanOrEqual(DK);
            expect(plan[i + 1].zaman.getTime() - plan[i].zaman.getTime()).toBe(3 * DK);
            for (const p of [plan[i], plan[i + 1]]) {
                expect(p.uyandirma).toBe(true);
                expect(p.govde).toBe(
                    `Kalk; gecenin son üçte biri girdi. İmsak vakti ${saat(pencere.bitis)}.\n${NAFILE_NASLARI.teheccud}`
                );
            }
        }
    });

    it('göç İDEMPOTENTTİR: göçmüş kayıt yeniden normalize edilince aynısı çıkar', () => {
        const bir = eskiKayit({
            hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 35 }, evvabin: { aktif: false, ofsetDk: 15 } },
            teheccud: { aktif: true, hedef: 'imsaktanOnce', imsaktanOnceDk: 45, uyandirma: true },
        });
        const iki = nafileAyarlariniNormalize(JSON.parse(JSON.stringify(bir)));
        expect(iki).toEqual(bir);
    });
});

describe('nafilePlaniOlustur (adımlı model)', () => {
    const gunBasi = new Date(gununNafilePencereleri(ISTANBUL, GUN)[0].baslangic.getTime() - 3 * 60 * DK);

    it('hepsi kapalıyken boş plan', () => {
        expect(nafilePlaniOlustur(ISTANBUL, ayar(), gunBasi, GUN)).toEqual([]);
    });

    it('id biçimi `nafile_<gün>_<tür>_<kalanDk>` — Kıldım öneki ayrıştırılabilir ve tekil', () => {
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ hatirlatmalar: { kusluk: gunduz({}), evvabin: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin } }),
            gunBasi,
            GUN
        );
        expect(plan.map((p) => p.id.split('_').slice(0, 3).join('_'))).toEqual([
            `${NAFILE_ID_ONEKI}2026-06-21_kusluk`.replace(/_$/, ''),
            `${NAFILE_ID_ONEKI}2026-06-22_kusluk`.replace(/_$/, ''),
            `${NAFILE_ID_ONEKI}2026-06-23_kusluk`.replace(/_$/, ''),
        ]);
        expect(new Set(plan.map((p) => p.id)).size).toBe(plan.length);
    });

    it('tekrarlı adım bir sonraki adıma kadar sürer; nass yalnız her adımın İLK tetiğinde', () => {
        const kusluk = gunduz({
            adimlar: [nafileAdimi(5, { herDk: 30 }), nafileAdimi(125)],
        });
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ hatirlatmalar: { kusluk, evvabin: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin } }),
            gunBasi,
            GUN,
            () => false,
            { gunduzGunSayisi: 1, teheccudGeceSayisi: 1 }
        );
        const p = gununNafilePencereleri(ISTANBUL, GUN)[0];
        const dakikalar = plan.map((x) => (x.zaman.getTime() - p.baslangic.getTime()) / DK);
        expect(dakikalar).toEqual([5, 35, 65, 95, 125]);
        const nassli = plan.filter((x) => x.govde.includes(NAFILE_NASLARI.kusluk)).map((x) => (x.zaman.getTime() - p.baslangic.getTime()) / DK);
        expect(nassli).toEqual([5, 125]);
    });

    it('çıkış yönü: eşik pencereden uzunsa (pencere öncesi) o gün planlanmaz', () => {
        const evvabin = gunduz({ yon: 'cikisaDogru', adimlar: [nafileAdimi(500)] });
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ hatirlatmalar: { kusluk: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.kusluk, evvabin } }),
            gunBasi,
            GUN
        );
        expect(plan).toEqual([]);
    });

    it('sesli adım: çözülmüş anons cümlesi (yer tutucusuz) ve anons alarmı bayrağı', () => {
        const kusluk = gunduz({ adimlar: [nafileAdimi(5, 'birkez', { bildirim: true, sesli: true })] });
        const [ilk] = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ hatirlatmalar: { kusluk, evvabin: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin } }),
            gunBasi,
            GUN
        );
        expect(ilk.uyari.sesliAnons).toBe(true);
        expect(ilk.uyari.anonsMetni).toBe('Kuşluk vakti girdi. İki rekât için güzel bir an.');
        expect(ilk.uyari.anonsMetni).not.toMatch(/\{/);
        expect(nafileAnonsAlarmiKurarMi(ilk)).toBe(true);
    });

    it('Android alarm bütçesi ÜRETİCİDE kronolojik keser (bildirim 1 + sesli anons 1)', () => {
        const kusluk = gunduz({ adimlar: [nafileAdimi(5, { herDk: 10 }, { bildirim: true, sesli: true })] });
        const ayarlar = ayar({ hatirlatmalar: { kusluk, evvabin: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin } });
        const tam = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN);
        const kesik = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN, () => false, {
            gunduzGunSayisi: 3,
            teheccudGeceSayisi: 7,
            alarmButcesi: 9,
        });
        expect(kesik).toHaveLength(4); // 4 × 2 = 8 ≤ 9; beşinci 10 olurdu
        expect(kesik).toEqual(tam.slice(0, 4));
    });

    it('Kıldım hafızası: o günün o nafilesi planlanmaz, öteki gün/tür aynen kalır', () => {
        const ayarlar = ayar({
            hatirlatmalar: { kusluk: gunduz({}), evvabin: gunduz({ adimlar: [nafileAdimi(15)] }) },
        });
        const tam = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN);
        const kilindi = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN, () => false, {
            gunduzGunSayisi: 3,
            teheccudGeceSayisi: 7,
            kilindiMi: (iso, tur) => iso === GUN && tur === 'kusluk',
        });
        expect(kilindi).toEqual(tam.filter((p) => !(p.tarih === GUN && p.tur === 'kusluk')));
        expect(kilindi.some((p) => p.tarih === GUN && p.tur === 'evvabin')).toBe(true);
    });

    // ÖZEL GÜN (issue #272): atlanan GÜNÜN gündüz nafilesi de gecesinin
    // teheccüdü de kurulmaz; aralık dışındaki günler aynen kalır.
    it('gunAtlanirMi: atlanan günün gündüz + gece hatırlatmaları planlanmaz', () => {
        const ayarlar = ayar({
            hatirlatmalar: { kusluk: gunduz({}), evvabin: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin },
            teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true },
        });
        const tam = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN);
        const atlanan = new Set(['2026-06-21', '2026-06-22']);
        const plan = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN, (iso) => atlanan.has(iso));
        expect(plan).toEqual(tam.filter((p) => !atlanan.has(p.tarih)));
        expect(plan.some((p) => p.tarih === '2026-06-23' && p.tur === 'kusluk')).toBe(true);
    });

    it('GECE YARISI: imsaktan önce çağrılınca DÜNÜN gecesinin teheccüdü hâlâ planlanır', () => {
        const dunGecesi = gununNafilePencereleri(ISTANBUL, '2026-06-20')[2];
        const geceOrtasi = new Date((dunGecesi.baslangic.getTime() + dunGecesi.faziletli.getTime()) / 2);
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true } }),
            geceOrtasi,
            GUN
        );
        expect(plan[0].tarih).toBe('2026-06-20');
        expect(plan[0].tur).toBe('teheccud');
    });

    it('geçmiş anlar planlanmaz ve plan kronolojiktir', () => {
        const ogleden = new Date(gununNafilePencereleri(ISTANBUL, GUN)[0].bitis.getTime() + DK);
        const plan = nafilePlaniOlustur(
            ISTANBUL,
            ayar({ hatirlatmalar: { kusluk: gunduz({}), evvabin: gunduz({ adimlar: [nafileAdimi(15)] }) } }),
            ogleden,
            GUN
        );
        expect(plan.every((p) => p.zaman.getTime() > ogleden.getTime())).toBe(true);
        const zamanlar = plan.map((p) => p.zaman.getTime());
        expect([...zamanlar].sort((a, b) => a - b)).toEqual(zamanlar);
        expect(plan.some((p) => p.tarih === GUN && p.tur === 'kusluk')).toBe(false);
    });
});

describe('NafileHatirlatmaServisi', () => {
    const servis = NafileHatirlatmaServisi.getInstance();
    const getAyarlar = LocalNafileServisi.getAyarlar as jest.Mock;
    const getKilinanlar = LocalNafileServisi.getKilinanlar as jest.Mock;
    const planla = Notifications.scheduleNotificationAsync as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        nafileTeslimcisiniAyarla(null);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: `${NAFILE_ID_ONEKI}eski` },
            { identifier: 'cuma_hatirlatma_2026-01-02' },
        ]);
        (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);
        planla.mockResolvedValue('id');
        (Notifications.getNotificationChannelAsync as jest.Mock).mockResolvedValue(null);
        getKilinanlar.mockResolvedValue({});
        kopru.iptalEtOnekliAnonslar.mockReturnValue(true);
    });

    afterEach(() => jest.restoreAllMocks());
    afterAll(() => nafileTeslimcisiniAyarla(null));

    it('hepsi kapalı → yalnız nafile önekli bildirimleri temizler, başka sisteme dokunmaz', async () => {
        getAyarlar.mockResolvedValue(ayar());
        await servis.hatirlatmalariGuncelle(ISTANBUL);
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(`${NAFILE_ID_ONEKI}eski`);
        expect(planla).not.toHaveBeenCalled();
    });

    it.each([null, { lat: 0, lng: 0 }])('konum yoksa (%p) KURULU plan korunur (temizlenmez)', async (k) => {
        getAyarlar.mockResolvedValue(ayar({ teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true } }));
        await servis.hatirlatmalariGuncelle(k);
        expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
        expect(planla).not.toHaveBeenCalled();
    });

    it('özel gün tüm pencereyi kapsıyorsa eski plan temizlenir, yenisi KURULMAZ (issue #272)', async () => {
        getAyarlar.mockResolvedValue(ayar({ teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true } }));
        await AsyncStorage.setItem(
            'ozel_gun_ayarlari',
            JSON.stringify({
                ozelGunModuAktif: true,
                aktifOzelGun: { baslangicTarihi: gunEkle(bugunuAl(), -1), bitisTarihi: gunEkle(bugunuAl(), 10) },
                gecmisKayitlar: [],
            })
        );
        try {
            await servis.hatirlatmalariGuncelle(ISTANBUL);
            expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(`${NAFILE_ID_ONEKI}eski`);
            expect(planla).not.toHaveBeenCalled();
        } finally {
            await AsyncStorage.removeItem('ozel_gun_ayarlari');
        }
    });

    describe('ANDROID teslimi (AndroidMuhafizTeslimcisi örneği)', () => {
        beforeEach(() => jest.replaceProperty(Platform, 'OS', 'android'));

        it('bildirim yükü NAFİLE yüküdür — muhafız yükü (farz kaydeden Kıldım) ASLA taşınmaz', async () => {
            getAyarlar.mockResolvedValue(
                ayar({ hatirlatmalar: { kusluk: gunduz({}), evvabin: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin } })
            );
            await servis.hatirlatmalariGuncelle(ISTANBUL);
            expect(planla.mock.calls.length).toBeGreaterThan(0);
            for (const [istek] of planla.mock.calls) {
                expect(istek.identifier.startsWith(NAFILE_ID_ONEKI)).toBe(true);
                expect(istek.content.data).toEqual({ tip: 'nafile', tur: 'kusluk', tarih: expect.any(String) });
                expect(istek.content.categoryIdentifier).toBe(BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ);
                // Ortak kanal uzayı: varsayılan ses, titreşimsiz → taban `muhafiz` kanalı.
                expect(istek.trigger.channelId).toBe(BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ);
            }
            expect(planla.mock.calls[0][0].identifier >= `${NAFILE_ID_ONEKI}${bugunuAl()}`).toBe(true);
        });

        it('titreşimli adım hash kanalına gider ve kanal planlamadan ÖNCE (çöp toplamadan) hazırlanır', async () => {
            const kusluk = gunduz({ adimlar: [nafileAdimi(5, 'birkez', { bildirim: true, titresim: true })] });
            getAyarlar.mockResolvedValue(
                ayar({ hatirlatmalar: { kusluk, evvabin: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin } })
            );
            await servis.hatirlatmalariGuncelle(ISTANBUL);
            const hazirla = MuhafizKanalServisi.ekKanallariHazirla;
            expect(hazirla).toHaveBeenCalledWith([{ yon: 'girisindenItibaren', seviyeler: kusluk.adimlar }]);
            expect(hazirla.mock.invocationCallOrder[0]).toBeLessThan(planla.mock.invocationCallOrder[0]);
            expect(planla.mock.calls[0][0].trigger.channelId).toMatch(/^muhafiz_[0-9a-f]{8}$/);
        });

        it('sesli adım: anons alarmı BİLDİRİMLE AYNI kimlikle ve çözülmüş metinle kurulur', async () => {
            const kusluk = gunduz({ adimlar: [nafileAdimi(5, 'birkez', { bildirim: true, sesli: true })] });
            getAyarlar.mockResolvedValue(
                ayar({ hatirlatmalar: { kusluk, evvabin: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin } })
            );
            await servis.hatirlatmalariGuncelle(ISTANBUL);
            const anons = kopru.planlaAnons.mock.calls;
            expect(anons.length).toBe(planla.mock.calls.length);
            anons.forEach(([id, ms, metin], i) => {
                expect(id).toBe(planla.mock.calls[i][0].identifier);
                expect(ms).toBe(planla.mock.calls[i][0].trigger.date.getTime());
                expect(metin).toBe('Kuşluk vakti girdi. İki rekât için güzel bir an.');
            });
        });

        it('temizlik yalnız `nafile_` önekli anonsları siler (muhafız anonslarına dokunmaz)', async () => {
            getAyarlar.mockResolvedValue(ayar());
            await servis.hatirlatmalariGuncelle(ISTANBUL);
            expect(kopru.iptalEtOnekliAnonslar).toHaveBeenCalledWith(NAFILE_ID_ONEKI);
            expect(kopru.iptalEtTumAnonslar).not.toHaveBeenCalled();
        });

        it('uyandırma: kanal planlamadan ÖNCE, YOKSA oluşturulur ve bildirim o kanala gider', async () => {
            getAyarlar.mockResolvedValue(
                ayar({ teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true, uyandirma: true } })
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
            expect(kanal.mock.invocationCallOrder[0]).toBeLessThan(planla.mock.invocationCallOrder[0]);
            expect(planla.mock.calls[0][0].trigger.channelId).toBe(BILDIRIM_SABITLERI.KANALLAR.NAFILE_UYANDIRMA);
            // Uyandırmalı teheccüd ortak kanal istemez.
            expect(MuhafizKanalServisi.ekKanallariHazirla).not.toHaveBeenCalled();
        });

        it('mevcut uyandırma kanalına DOKUNULMAZ (ses/önem sonradan değiştirilemez)', async () => {
            (Notifications.getNotificationChannelAsync as jest.Mock).mockResolvedValue({ id: 'nafile_uyandirma' });
            getAyarlar.mockResolvedValue(
                ayar({ teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true, uyandirma: true } })
            );
            await servis.hatirlatmalariGuncelle(ISTANBUL);
            expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
        });

        it('Kıldım hafızası diskten okunur: o günün o nafilesi yeniden KURULMAZ', async () => {
            getAyarlar.mockResolvedValue(
                ayar({ hatirlatmalar: { kusluk: gunduz({}), evvabin: VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin } })
            );
            const bugun = bugunuAl();
            getKilinanlar.mockResolvedValue({ [bugun]: ['kusluk'] });
            await servis.hatirlatmalariGuncelle(ISTANBUL);
            expect(planla.mock.calls.some(([i]) => i.identifier.startsWith(`${NAFILE_ID_ONEKI}${bugun}_kusluk_`))).toBe(false);
        });
    });

    it('iOS: kanal oluşturulmaz, uyandırma time-sensitive bildirimdir, ses paket sesi', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        getAyarlar.mockResolvedValue(
            ayar({ teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true, uyandirma: true } })
        );
        await servis.hatirlatmalariGuncelle(ISTANBUL);
        expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
        const istek = planla.mock.calls[0][0];
        expect(istek.content.interruptionLevel).toBe('timeSensitive');
        expect(istek.content.sound).toBe(IOS_BILDIRIM_SESI);
        expect(istek.content.data.tip).toBe('nafile');
        expect(kopru.planlaAnons).not.toHaveBeenCalled();
    });

    describe('Kıldım (issue #273)', () => {
        beforeEach(() => jest.replaceProperty(Platform, 'OS', 'android'));

        it('yalnız o günün o nafilesinin bekleyen + gösterilen bildirimlerini ve anonslarını iptal eder', async () => {
            const gun = bugunuAl();
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
                { identifier: `${NAFILE_ID_ONEKI}${gun}_kusluk_170` },
                { identifier: `${NAFILE_ID_ONEKI}${gun}_kusluk_140` },
                { identifier: `${NAFILE_ID_ONEKI}${gun}_evvabin_80` },
                { identifier: `${NAFILE_ID_ONEKI}${gunEkle(gun, 1)}_kusluk_170` },
                { identifier: `muhafiz_${gun}_vakit_ogle_seviye_1_dk_40` },
            ]);
            (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([
                { request: { identifier: `${NAFILE_ID_ONEKI}${gun}_kusluk_200` } },
                { request: { identifier: `muhafiz_${gun}_vakit_ogle_seviye_1_dk_40` } },
            ]);
            await servis.kildimIsle(gun, 'kusluk');

            expect(LocalNafileServisi.kilindiIsaretle).toHaveBeenCalledWith(gun, 'kusluk', gun);
            const iptal = (Notifications.cancelScheduledNotificationAsync as jest.Mock).mock.calls.map(([i]) => i);
            expect(iptal).toEqual([`${NAFILE_ID_ONEKI}${gun}_kusluk_170`, `${NAFILE_ID_ONEKI}${gun}_kusluk_140`]);
            expect(kopru.iptalEtOnekliAnonslar).toHaveBeenCalledWith(`${NAFILE_ID_ONEKI}${gun}_kusluk_`);
            expect(Notifications.dismissNotificationAsync).toHaveBeenCalledTimes(1);
            expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(`${NAFILE_ID_ONEKI}${gun}_kusluk_200`);
        });
    });

    describe('GERÇEK ALARM (issue #74 — nafilede de standart yetenek)', () => {
        it('Kıldım o nafilenin GERÇEK alarmlarını da (çalan dahil) yalnız kendi önekiyle susturur', async () => {
            jest.replaceProperty(Platform, 'OS', 'android');
            const { AndroidMuhafizTeslimcisi } = jest.requireActual('../AndroidMuhafizTeslimcisi') as typeof import('../AndroidMuhafizTeslimcisi');
            const teslimci = new AndroidMuhafizTeslimcisi({ anonsOneki: NAFILE_ID_ONEKI, alarmKanalTemizligi: false });
            const sustur = jest.spyOn(teslimci, 'vakitYanKanallariniIptalEt');
            nafileTeslimcisiniAyarla(teslimci);
            const gun = bugunuAl();
            await servis.kildimIsle(gun, 'teheccud');
            expect(sustur).toHaveBeenCalledWith(`${NAFILE_ID_ONEKI}${gun}_teheccud_`);
        });

        it('iOS: alarmdan basılan Kıldım kuyruğu planlamadan ÖNCE okunur ve susturma hafızasına yazılır', async () => {
            jest.replaceProperty(Platform, 'OS', 'ios');
            const alarmKit = require('../../../../modules/expo-muhafiz-alarmkit/src') as {
                alarmKitNafileKildimleriniAl: jest.Mock;
            };
            alarmKit.alarmKitNafileKildimleriniAl.mockResolvedValueOnce([
                { tarih: '2026-10-13', tur: 'teheccud' },
                { tarih: '2026-10-13', tur: 'bozuk' },
            ]);
            getAyarlar.mockResolvedValue(ayar({}));
            await servis.hatirlatmalariGuncelle(ISTANBUL);
            expect(LocalNafileServisi.kilindiIsaretle).toHaveBeenCalledTimes(1);
            expect(LocalNafileServisi.kilindiIsaretle).toHaveBeenCalledWith('2026-10-13', 'teheccud', bugunuAl());
        });

        it('hepsi kapatılınca bekleyen nafile alarmları da silinir (expo listesinde görünmezler)', async () => {
            jest.replaceProperty(Platform, 'OS', 'android');
            const { NativeModules } = jest.requireActual('react-native') as typeof import('react-native');
            const nativeAlarm = {
                planla: jest.fn().mockResolvedValue(true),
                onekliIptalEt: jest.fn().mockResolvedValue(0),
                kanallariTemizle: jest.fn().mockResolvedValue(undefined),
            };
            (NativeModules as Record<string, unknown>).MuhafizAlarm = nativeAlarm;
            try {
                getAyarlar.mockResolvedValue(ayar({}));
                await servis.hatirlatmalariGuncelle(ISTANBUL);
                expect(nativeAlarm.onekliIptalEt).toHaveBeenCalledWith(NAFILE_ID_ONEKI);
                expect(nativeAlarm.kanallariTemizle).not.toHaveBeenCalled();
            } finally {
                delete (NativeModules as Record<string, unknown>).MuhafizAlarm;
            }
        });
    });

    it('DEPOLAMA: Kıldım hafızası anahtarı yedekleme dışı, ayrı öneklidir', () => {
        expect(DEPOLAMA_ANAHTARLARI.NAFILE_KILINAN.startsWith('@namaz_akisi/')).toBe(true);
    });
});
