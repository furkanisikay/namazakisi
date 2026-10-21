/**
 * ÖLÇÜM + NÖBETÇİ (denetim 2026-10-21, D-02 / D-15): 15 dk arka plan turunun muhafız
 * adımı cihaza KAÇ köprü çağrısı yapar, ve "atla" kapısı her şüphede kurar mı?
 *
 * Gerçek `ArkaplanMuhafizServisi` + gerçek adhan (İstanbul) + DURUM TUTAN sahte
 * `expo-notifications` (schedule listeye ekler, cancel düşürür, getAll listeyi döner).
 * Mevcut `getAll → []` mock'larıyla kapı hiç açılamaz; ölçüm bu yüzden ayrı dosyadadır.
 * Kurulan bildirim sayısı günün saatine bağlıdır; testler sayıyı değil İLİŞKİYİ ölçer.
 */
type Istek = { identifier: string; trigger: { value?: number } | null };

const mockPlanli = new Map<string, Istek>();
const mockSayac = { schedule: 0, cancel: 0, getAll: 0 };

jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(async (istek: { identifier: string; trigger: { date: Date } }) => {
        mockSayac.schedule++;
        mockPlanli.set(istek.identifier, { identifier: istek.identifier, trigger: { value: istek.trigger.date.getTime() } });
        return istek.identifier;
    }),
    cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
        mockSayac.cancel++;
        mockPlanli.delete(id);
    }),
    getAllScheduledNotificationsAsync: jest.fn(async () => {
        mockSayac.getAll++;
        return [...mockPlanli.values()];
    }),
    setNotificationCategoryAsync: jest.fn().mockResolvedValue(null),
    AndroidNotificationPriority: { MAX: 'max', HIGH: 'high' },
    SchedulableTriggerInputTypes: { DATE: 'date' },
}));

jest.mock('../BildirimServisi', () => ({ MUHAFIZ_KATEGORISI: 'muhafiz_category' }));

const mockDepo = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(async (k: string) => mockDepo.get(k) ?? null),
    setItem: jest.fn(async (k: string, v: string) => {
        mockDepo.set(k, v);
    }),
    removeItem: jest.fn(async (k: string) => {
        mockDepo.delete(k);
    }),
    multiGet: jest.fn(async (ks: string[]) => ks.map((k) => [k, mockDepo.get(k) ?? null])),
    getAllKeys: jest.fn(async () => [...mockDepo.keys()]),
    multiRemove: jest.fn(async (ks: string[]) => ks.forEach((k) => mockDepo.delete(k))),
}));

const mockAnonsSayisi = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: jest.fn().mockReturnValue(true),
    bekleyenAnonsSayisi: (...a: unknown[]) => mockAnonsSayisi(...a),
    trDestekleniyorMu: jest.fn().mockResolvedValue(true),
    muhafizKanaliniGarantile: jest.fn(),
    muhafizKanallariniTemizle: jest.fn(),
}));

jest.mock('../MuhafizKanalServisi', () => ({
    MuhafizKanalServisi: {
        hazirla: jest.fn(async (m?: unknown) => m),
        nafileSesleriniDogrula: async (a: unknown) => a,
    },
}));

import { ArkaplanMuhafizServisi } from '../ArkaplanMuhafizServisi';
import { muhafizTeslimcisiniAyarla, type MuhafizTeslimcisi } from '../MuhafizTeslimcisi';
import { AndroidMuhafizTeslimcisi } from '../AndroidMuhafizTeslimcisi';
import { muhafizMatrisiniCoz } from '../../../core/muhafiz/motorAdaptoru';
import { muhafizPlaniDinleyicisiniAyarla } from '../muhafizPlaniGozlemcisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';
import { PLAN_KAYDI_AZAMI_YAS_MS, PLAN_TETIK_PAYI_MS } from '../../../core/muhafiz/planParmakIzi';
import type { MuhafizMatrisi, MuhafizVakti } from '../../../core/muhafiz/matrisTipleri';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const matris = muhafizMatrisiniCoz({
    esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
    sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
});
const ayarlar = { aktif: true, koordinatlar: ISTANBUL, matris };
const KAYIT = DEPOLAMA_ANAHTARLARI.MUHAFIZ_PLAN_KAYDI;

const sifirla = () => {
    mockSayac.schedule = 0;
    mockSayac.cancel = 0;
    mockSayac.getAll = 0;
};

beforeEach(() => {
    mockPlanli.clear();
    mockDepo.clear();
    sifirla();
    mockAnonsSayisi.mockResolvedValue(0);
    muhafizTeslimcisiniAyarla(new AndroidMuhafizTeslimcisi());
    muhafizPlaniDinleyicisiniAyarla(null);
});

afterAll(() => {
    muhafizTeslimcisiniAyarla(null);
    muhafizPlaniDinleyicisiniAyarla(null);
});

const servis = ArkaplanMuhafizServisi.getInstance();
const ATLA = { degismediyseAtla: true };

/** İlk tam kurulum → (araya bir şey) → periyodik tur; periyodik turun sayaçları. */
const ikinciTur = async (once?: () => void, a = ayarlar) => {
    await servis.yapilandirVePlanla(a);
    once?.();
    sifirla();
    await servis.yapilandirVePlanla(a, ATLA);
    return { ...mockSayac };
};
const atlandi = (s: typeof mockSayac) => s.schedule === 0 && s.cancel === 0;

/** Her vaktin 2. adımını sesli yapar (anons sayısı kapısını ölçmek için). */
const sesliMatris = (): MuhafizMatrisi => {
    const m = JSON.parse(JSON.stringify(matris)) as MuhafizMatrisi;
    for (const v of Object.keys(m) as MuhafizVakti[]) {
        const adim = m[v].seviyeler[1];
        adim.kanallar = { bildirim: true, sesli: true };
        adim.anonsMetni = '{vakit} vaktinin çıkmasına {süre} dakika kaldı.';
    }
    return m;
};

describe('15 dk turu — muhafız adımının köprü çağrıları (ölçüm, D-02/D-15)', () => {
    it('ÖNCE (kapısız yol): ikinci tur her şeyi silip yeniden kurar', async () => {
        await servis.yapilandirVePlanla(ayarlar);
        const kurulu = mockPlanli.size;
        sifirla();
        await servis.yapilandirVePlanla(ayarlar);
        expect(mockSayac).toEqual({ schedule: kurulu, cancel: kurulu, getAll: 1 });
        expect(mockPlanli.size).toBe(kurulu);
    });

    it('SONRA (periyodik tur, girdiler aynı): 0 schedule, 0 cancel, 1 getAll; kurulum yerinde', async () => {
        await servis.yapilandirVePlanla(ayarlar);
        const kurulu = mockPlanli.size;
        sifirla();
        await servis.yapilandirVePlanla(ayarlar, ATLA);
        expect(mockSayac).toEqual({ schedule: 0, cancel: 0, getAll: 1 });
        expect(mockPlanli.size).toBe(kurulu);
    });

    it('art arda periyodik turlar da atlar (kayıt tam kurulumdan kalır)', async () => {
        await ikinciTur();
        sifirla();
        await servis.yapilandirVePlanla(ayarlar, ATLA);
        expect(atlandi(mockSayac)).toBe(true);
    });
});

describe('atla kapısı — NÖBETÇİLER (her şüphede tam kurulum)', () => {
    it('kılınmışlık değişince kurar', async () => {
        const s = await ikinciTur(() => {
            mockDepo.set(`${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${bugunuAl()}`, JSON.stringify(['yatsi']));
        });
        expect(atlandi(s)).toBe(false);
    });

    it('matris değişince kurar', async () => {
        await servis.yapilandirVePlanla(ayarlar);
        sifirla();
        await servis.yapilandirVePlanla({ ...ayarlar, matris: sesliMatris() }, ATLA);
        expect(atlandi(mockSayac)).toBe(false);
    });

    it('konum (vakit saatleri) değişince kurar', async () => {
        await servis.yapilandirVePlanla(ayarlar);
        sifirla();
        await servis.yapilandirVePlanla({ ...ayarlar, koordinatlar: { lat: 39.93, lng: 32.86 } }, ATLA);
        expect(atlandi(mockSayac)).toBe(false);
    });

    it('gelecek bir bildirim cihazdan kaybolmuşsa kurar', async () => {
        await servis.yapilandirVePlanla(ayarlar);
        const gelecek = [...mockPlanli.values()].filter((b) => b.trigger!.value! > Date.now() + PLAN_TETIK_PAYI_MS);
        if (gelecek.length === 0) return; // günün sonunda plan boş olabilir
        mockPlanli.delete(gelecek[gelecek.length - 1].identifier);
        sifirla();
        await servis.yapilandirVePlanla(ayarlar, ATLA);
        expect(atlandi(mockSayac)).toBe(false);
    });

    it('kayıtta olmayan muhafız kimliği (eski _ertele artığı) varsa kurar ve onu siler', async () => {
        const artik = `muhafiz_${bugunuAl()}_vakit_aksam_ertele`;
        const s = await ikinciTur(() => {
            mockPlanli.set(artik, { identifier: artik, trigger: { value: Date.now() + 3600_000 } });
        });
        expect(atlandi(s)).toBe(false);
        expect(mockPlanli.has(artik)).toBe(false);
    });

    it('kayıt AZAMİ YAŞI aştıysa kurar', async () => {
        const s = await ikinciTur(() => {
            const k = JSON.parse(mockDepo.get(KAYIT)!);
            k.kurulumMs -= PLAN_KAYDI_AZAMI_YAS_MS;
            mockDepo.set(KAYIT, JSON.stringify(k));
        });
        expect(atlandi(s)).toBe(false);
    });

    it('kayıt bozuksa kurar', async () => {
        const s = await ikinciTur(() => mockDepo.set(KAYIT, '{bozuk'));
        expect(atlandi(s)).toBe(false);
    });

    it('sesli okuma kayıt defteri boşalmışsa kurar; doluysa atlar', async () => {
        const sesli = { ...ayarlar, matris: sesliMatris() };
        mockAnonsSayisi.mockResolvedValue(0);
        const bos = await ikinciTur(undefined, sesli);
        const kayit = JSON.parse(mockDepo.get(KAYIT)!);
        const gelecekAnons = kayit.ogeler.filter(
            (o: { anons?: true; zamanMs: number }) => o.anons && o.zamanMs > Date.now() + PLAN_TETIK_PAYI_MS
        ).length;
        // Saat sesli adımların tümünü geride bıraktıysa beklenen anons 0'dır → atlar.
        expect(atlandi(bos)).toBe(gelecekAnons === 0);

        mockPlanli.clear();
        mockDepo.clear();
        mockAnonsSayisi.mockResolvedValue(10_000);
        expect(atlandi(await ikinciTur(undefined, sesli))).toBe(true);

        mockAnonsSayisi.mockResolvedValue(null); // okunamadı
        sifirla();
        await servis.yapilandirVePlanla(sesli, ATLA);
        expect(atlandi(mockSayac)).toBe(gelecekAnons === 0);
    });

    it('kapısız çağrı (ön plan / ekran / konum yolu) her zaman tam kurar', async () => {
        await servis.yapilandirVePlanla(ayarlar);
        sifirla();
        await servis.yapilandirVePlanla(ayarlar);
        expect(atlandi(mockSayac)).toBe(false);
    });

    it('muhafız kapatılınca kayıt silinir; yeniden açılınca periyodik tur kurar', async () => {
        await servis.yapilandirVePlanla(ayarlar);
        await servis.yapilandirVePlanla({ ...ayarlar, aktif: false });
        expect(mockDepo.has(KAYIT)).toBe(false);
        expect(mockPlanli.size).toBe(0);
        sifirla();
        await servis.yapilandirVePlanla(ayarlar, ATLA);
        expect(mockSayac.getAll).toBe(1);
        expect(mockDepo.has(KAYIT)).toBe(true);
    });

    it('atlanan turda saat gözlemcisi yine DOĞRULANMIŞ matrisle bildirilir', async () => {
        const dinleyici = jest.fn();
        await servis.yapilandirVePlanla(ayarlar);
        muhafizPlaniDinleyicisiniAyarla(dinleyici);
        sifirla();
        await servis.yapilandirVePlanla(ayarlar, ATLA);
        expect(atlandi(mockSayac)).toBe(true);
        expect(dinleyici).toHaveBeenCalledWith(expect.objectContaining({ aktif: true, matris }));
    });

    it('teslim bağlamı bildirmeyen teslimcide (iOS / el yapımı) kapı AÇILMAZ, kayıt yazılmaz', async () => {
        const android = new AndroidMuhafizTeslimcisi();
        const baglamsiz: MuhafizTeslimcisi = {
            ad: 'android',
            hazirla: (m) => android.hazirla(m),
            uyariPlanla: (t) => android.uyariPlanla(t),
            yanKanaliIptalEt: () => undefined,
            tumYanKanallariIptalEt: () => undefined,
        };
        muhafizTeslimcisiniAyarla(baglamsiz);
        await servis.yapilandirVePlanla(ayarlar);
        const kurulu = mockPlanli.size;
        sifirla();
        await servis.yapilandirVePlanla(ayarlar, ATLA);
        expect(mockSayac.schedule).toBe(kurulu);
        expect(mockDepo.has(KAYIT)).toBe(false);
    });

    it('teslim sonucunu bildirmeyen (void) teslimcide kayıt "eksik" olur → atlanmaz', async () => {
        const android = new AndroidMuhafizTeslimcisi();
        const voidTeslim: MuhafizTeslimcisi = {
            ad: 'android',
            hazirla: (m) => android.hazirla(m),
            uyariPlanla: async (t) => {
                await android.uyariPlanla(t);
            },
            yanKanaliIptalEt: () => undefined,
            tumYanKanallariIptalEt: () => undefined,
            planBaglamiImzasi: () => android.planBaglamiImzasi(),
            butceDolduMu: () => false,
        };
        muhafizTeslimcisiniAyarla(voidTeslim);
        await servis.yapilandirVePlanla(ayarlar);
        const kurulu = mockPlanli.size;
        sifirla();
        await servis.yapilandirVePlanla(ayarlar, ATLA);
        // Plan boşsa (gün sonu) eksik işaretlenecek teslim de yoktur → atlanabilir.
        expect(mockSayac.schedule).toBe(kurulu);
    });
});
