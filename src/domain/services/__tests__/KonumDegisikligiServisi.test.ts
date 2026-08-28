/**
 * KonumDegisikligiServisi testleri — konuma bağlı yaymanın NÖBETÇİSİ
 *
 * Bu dosyanın asıl işi "her tüketici çağrıldı mı" sorusunu kilitlemektir. Liste
 * eskiden İKİ yerde yaşıyordu (App.tsx açılışta yedisini, konum yolu yalnız
 * muhafızı besliyordu) ve ayrıştığı için kullanıcı şehir değiştirdiğinde geri
 * sayım / iftar / sahur / widget eski şehirde kalıyordu. Yeni bir konuma-bağlı
 * tüketici eklenip buraya bağlanmazsa "tum tuketiciler" testi kırılmalıdır.
 */

// --- Native köprü taşıyan tüketiciler: fabrikalı mock (gerçek modül YÜKLENMEZ) ---
jest.mock('../NamazVaktiHesaplayiciServisi', () => ({
    NamazVaktiHesaplayiciServisi: {
        getInstance: jest.fn(() => ({ yapilandir: jest.fn() })),
    },
}));
jest.mock('../ArkaplanMuhafizServisi', () => ({
    ArkaplanMuhafizServisi: {
        getInstance: jest.fn(() => ({ yapilandirVePlanla: jest.fn(() => Promise.resolve()) })),
    },
}));
jest.mock('../VakitBildirimYoneticiServisi', () => ({
    VakitBildirimYoneticiServisi: {
        getInstance: jest.fn(() => ({ bildirimleriGuncelle: jest.fn(() => Promise.resolve()) })),
    },
}));
jest.mock('../VakitSayacBildirimServisi', () => ({
    VakitSayacBildirimServisi: {
        getInstance: jest.fn(() => ({ yapilandirVePlanla: jest.fn(() => Promise.resolve()) })),
    },
}));
jest.mock('../IftarSayacBildirimServisi', () => ({
    IftarSayacBildirimServisi: {
        getInstance: jest.fn(() => ({ yapilandirVePlanla: jest.fn(() => Promise.resolve()) })),
    },
}));
jest.mock('../SahurSayacBildirimServisi', () => ({
    SahurSayacBildirimServisi: {
        getInstance: jest.fn(() => ({ yapilandirVePlanla: jest.fn(() => Promise.resolve()) })),
    },
}));
// Seri sayaci: notifee + native countdown koprusunu ceker -> fabrikali mock SART.
jest.mock('../SeriSayacBildirimServisi', () => ({
    SeriSayacBildirimServisi: {
        getInstance: jest.fn(() => ({ yapilandirVePlanla: jest.fn(() => Promise.resolve()) })),
    },
}));
jest.mock('../SeriSayacHazirlayici', () => ({
    seriSayacAyarlariniHazirla: jest.fn(() =>
        Promise.resolve({ aktif: true, hedef: new Date(), seriBugunTamMi: false })
    ),
}));
jest.mock('../WidgetServisi', () => ({
    WidgetServisi: {
        getInstance: jest.fn(() => ({ vakitleriyaz: jest.fn(() => Promise.resolve()) })),
    },
}));

const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null)),
        setItem: jest.fn(async (k: string, v: string) => { mockStore.set(k, v); }),
        removeItem: jest.fn(async (k: string) => { mockStore.delete(k); }),
    },
}));

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { konumDegistiUygula } from '../KonumDegisikligiServisi';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { ArkaplanMuhafizServisi } from '../ArkaplanMuhafizServisi';
import { VakitBildirimYoneticiServisi } from '../VakitBildirimYoneticiServisi';
import { VakitSayacBildirimServisi } from '../VakitSayacBildirimServisi';
import { IftarSayacBildirimServisi } from '../IftarSayacBildirimServisi';
import { SahurSayacBildirimServisi } from '../SahurSayacBildirimServisi';
import { SeriSayacBildirimServisi } from '../SeriSayacBildirimServisi';
import { WidgetServisi } from '../WidgetServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { eskidenMatriseGoc } from '../../../core/muhafiz/muhafizGoc';
import type { MuhafizMatrisi } from '../../../core/muhafiz/matrisTipleri';

/** Tuketicilere iletilen ayar yukunun test-ici gevsek tipi */
type YaymaYuku = {
    aktif?: boolean;
    koordinatlar?: { lat: number; lng: number };
    matris?: MuhafizMatrisi;
    muhafizAktif?: boolean;
    muhafizUyarilanVakitler?: unknown[];
    baslangicEsikleri?: unknown;
};

/** Bir mock'a gecilen ilk argumani tipli olarak alir */
function ilkArg(f: jest.Mock): YaymaYuku {
    const cagri = f.mock.calls[0];
    if (!cagri) throw new Error('Mock hic cagrilmadi');
    return cagri[0] as YaymaYuku;
}

const ANKARA = { lat: 39.9208, lng: 32.8541 };

/** Her tuketicinin tek, kararli sahte ornegini tutar (getInstance her cagride yeni nesne dondurmesin) */
const sahte = {
    yapilandir: jest.fn((..._a: unknown[]) => undefined as unknown),
    muhafiz: jest.fn((..._a: unknown[]) => Promise.resolve()),
    vakitBildirim: jest.fn((..._a: unknown[]) => Promise.resolve()),
    vakitSayac: jest.fn((..._a: unknown[]) => Promise.resolve()),
    iftar: jest.fn((..._a: unknown[]) => Promise.resolve()),
    sahur: jest.fn((..._a: unknown[]) => Promise.resolve()),
    seriSayac: jest.fn((..._a: unknown[]) => Promise.resolve()),
    widget: jest.fn((..._a: unknown[]) => Promise.resolve()),
};

beforeEach(() => {
    jest.clearAllMocks();
    mockStore.clear();

    Object.values(sahte).forEach((f) => f.mockImplementation(() => Promise.resolve()));
    sahte.yapilandir.mockImplementation(() => undefined);


    (NamazVaktiHesaplayiciServisi.getInstance as jest.Mock).mockReturnValue({ yapilandir: sahte.yapilandir });
    (ArkaplanMuhafizServisi.getInstance as jest.Mock).mockReturnValue({ yapilandirVePlanla: sahte.muhafiz });
    (VakitBildirimYoneticiServisi.getInstance as jest.Mock).mockReturnValue({ bildirimleriGuncelle: sahte.vakitBildirim });
    (VakitSayacBildirimServisi.getInstance as jest.Mock).mockReturnValue({ yapilandirVePlanla: sahte.vakitSayac });
    (IftarSayacBildirimServisi.getInstance as jest.Mock).mockReturnValue({ yapilandirVePlanla: sahte.iftar });
    (SahurSayacBildirimServisi.getInstance as jest.Mock).mockReturnValue({ yapilandirVePlanla: sahte.sahur });
    (SeriSayacBildirimServisi.getInstance as jest.Mock).mockReturnValue({ yapilandirVePlanla: sahte.seriSayac });
    (WidgetServisi.getInstance as jest.Mock).mockReturnValue({ vakitleriyaz: sahte.widget });
});

describe('konumDegistiUygula — tuketici kapsami (NOBETCI)', () => {
    it('KRITIK: konuma bagli TUM tuketiciler cagrilmali', async () => {
        // Bu test kirilirsa: ya bir tuketici yayma listesinden dustu, ya da yeni
        // eklenen bir konuma-bagli tuketici buraya baglanmadi. Ikisi de kullaniciya
        // "sehir degistim ama X eski sehirde kaldi" olarak yansir.
        await konumDegistiUygula(ANKARA);

        expect(sahte.yapilandir).toHaveBeenCalledTimes(1);
        expect(sahte.muhafiz).toHaveBeenCalledTimes(1);
        expect(sahte.vakitBildirim).toHaveBeenCalledTimes(1);
        expect(sahte.vakitSayac).toHaveBeenCalledTimes(1);
        expect(sahte.iftar).toHaveBeenCalledTimes(1);
        expect(sahte.sahur).toHaveBeenCalledTimes(1);
        // Seri sayaci da konuma baglidir: hedefi SONRAKI IMSAK'tir ve sehir
        // degisince kayar. Bu listeden duserse kullanici yeni sehrinde eski
        // sehrin imsagina gore geri sayim gorur.
        expect(sahte.seriSayac).toHaveBeenCalledTimes(1);
        expect(sahte.widget).toHaveBeenCalledTimes(1);
    });

    it('YENI koordinat her tuketiciye iletilmeli', async () => {
        await konumDegistiUygula(ANKARA);

        expect(sahte.yapilandir).toHaveBeenCalledWith({ latitude: 39.9208, longitude: 32.8541 });
        expect(ilkArg(sahte.muhafiz)).toMatchObject({ koordinatlar: ANKARA });
        expect(ilkArg(sahte.vakitSayac)).toMatchObject({ koordinatlar: ANKARA });
        expect(ilkArg(sahte.iftar)).toMatchObject({ koordinatlar: ANKARA });
        expect(ilkArg(sahte.sahur)).toMatchObject({ koordinatlar: ANKARA });
        expect(sahte.widget).toHaveBeenCalledWith(ANKARA);
    });

    it('KRITIK SIRA: hesaplayici, vakit bildirimlerinden ONCE yapilandirilmali', async () => {
        // VakitBildirimYoneticiServisi koordinati NamazVaktiHesaplayiciServisi
        // singleton'inin getKonfig()'inden okur. Arka planda singleton taze/bos
        // oldugu icin sira bozulursa vakit bildirimleri "Konum yok" deyip HIC
        // planlanmaz (uygulama icinde ise BAYAT koordinatla planlanir).
        await konumDegistiUygula(ANKARA);

        const yapilandirSira = sahte.yapilandir.mock.invocationCallOrder[0];
        const bildirimSira = sahte.vakitBildirim.mock.invocationCallOrder[0];
        expect(yapilandirSira).toBeLessThan(bildirimSira);
    });
});

describe('konumDegistiUygula — gecersiz koordinat', () => {
    it('0/0 nobetcisi hicbir tuketiciyi tetiklememeli', async () => {
        // {0,0} bu projede "henuz yapilandirilmadi" demek (Gine Korfezi degil).
        await konumDegistiUygula({ lat: 0, lng: 0 });

        expect(sahte.yapilandir).not.toHaveBeenCalled();
        expect(sahte.muhafiz).not.toHaveBeenCalled();
        expect(sahte.widget).not.toHaveBeenCalled();
    });

    it('NaN koordinat hicbir tuketiciyi tetiklememeli', async () => {
        await konumDegistiUygula({ lat: NaN, lng: 32.8 });

        expect(sahte.muhafiz).not.toHaveBeenCalled();
    });
});

describe('konumDegistiUygula — hata yalitimi', () => {
    it('KRITIK: bir tuketici patlasa da DIGERLERI calismali', async () => {
        // Ortak tek bir try/catch, ilk patlayanda zinciri keser ve kalan
        // tuketicileri sessizce atlardi (ayni tuzak MuhafizKanalServisi'nde yasandi).
        sahte.muhafiz.mockRejectedValue(new Error('muhafiz coktu'));

        await expect(konumDegistiUygula(ANKARA)).resolves.toBeUndefined();

        expect(sahte.vakitSayac).toHaveBeenCalledTimes(1);
        expect(sahte.iftar).toHaveBeenCalledTimes(1);
        expect(sahte.sahur).toHaveBeenCalledTimes(1);
        // Seri sayaci da konuma baglidir: hedefi SONRAKI IMSAK'tir ve sehir
        // degisince kayar. Bu listeden duserse kullanici yeni sehrinde eski
        // sehrin imsagina gore geri sayim gorur.
        expect(sahte.seriSayac).toHaveBeenCalledTimes(1);
        expect(sahte.widget).toHaveBeenCalledTimes(1);
    });

    it('hesaplayici yapilandirmasi patlasa da akis SURMELI', async () => {
        sahte.yapilandir.mockImplementation(() => { throw new Error('yapilandirma coktu'); });

        await expect(konumDegistiUygula(ANKARA)).resolves.toBeUndefined();

        expect(sahte.muhafiz).toHaveBeenCalledTimes(1);
    });
});

describe('konumDegistiUygula — ham depolamadan ayar okuma (store YOK)', () => {
    it('ayar hic yoksa tum tuketiciler aktif:false ile cagrilmali', async () => {
        await konumDegistiUygula(ANKARA);

        expect(ilkArg(sahte.muhafiz).aktif).toBe(false);
        expect(ilkArg(sahte.vakitSayac).aktif).toBe(false);
        expect(ilkArg(sahte.iftar).aktif).toBe(false);
        expect(ilkArg(sahte.sahur).aktif).toBe(false);
    });

    it('diskteki aktif bayraklari tuketicilere yansimali', async () => {
        mockStore.set(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify({ aktif: true }));
        mockStore.set(DEPOLAMA_ANAHTARLARI.VAKIT_SAYAC_AYARLARI, JSON.stringify({ aktif: true, sayacBaslangicSeviyesi: 2 }));
        mockStore.set(DEPOLAMA_ANAHTARLARI.IFTAR_SAYAC_AYARLARI, JSON.stringify({ aktif: true }));
        mockStore.set(DEPOLAMA_ANAHTARLARI.SAHUR_SAYAC_AYARLARI, JSON.stringify({ aktif: true }));

        await konumDegistiUygula(ANKARA);

        expect(ilkArg(sahte.muhafiz).aktif).toBe(true);
        expect(ilkArg(sahte.vakitSayac).aktif).toBe(true);
        expect(ilkArg(sahte.iftar).aktif).toBe(true);
        expect(ilkArg(sahte.sahur).aktif).toBe(true);
    });

    it('BOZUK JSON tum yaymayi cokertmemeli (guvenli varsayilan)', async () => {
        mockStore.set(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, '{bozuk');
        mockStore.set(DEPOLAMA_ANAHTARLARI.IFTAR_SAYAC_AYARLARI, 'null');

        await expect(konumDegistiUygula(ANKARA)).resolves.toBeUndefined();

        expect(sahte.muhafiz).toHaveBeenCalledTimes(1);
        expect(ilkArg(sahte.iftar).aktif).toBe(false);
    });

    it('vakit sayaci bastirma alanlarini ALMALI (eksik gecilirse #90 geri doner)', async () => {
        mockStore.set(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify({ aktif: true }));

        await konumDegistiUygula(ANKARA);

        const iletilen = ilkArg(sahte.vakitSayac);
        expect(iletilen.muhafizAktif).toBe(true);
        expect(Array.isArray(iletilen.muhafizUyarilanVakitler)).toBe(true);
        expect(iletilen.baslangicEsikleri).toBeDefined();
    });
});

describe('konumDegistiUygula — muhafiz matrisi cozumu', () => {
    it('esikler/sikliklar YOKSA varsayilanlardan matris turetilmeli', async () => {
        mockStore.set(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify({ aktif: true }));

        await konumDegistiUygula(ANKARA);

        const ogle = ilkArg(sahte.muhafiz).matris!.ogle.seviyeler;
        expect(ogle).toHaveLength(4);
        expect(ogle[0].esikDk).toBe(45);
        expect(ogle[0].siklik).toEqual({ herDk: 15 });
        expect(ogle[3].esikDk).toBe(3);
        expect(ogle[3].siklik).toEqual({ herDk: 1 });
    });

    it('diskteki MATRIS bayat global esikleri EZMEZ', async () => {
        const matris = eskidenMatriseGoc({
            esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
            sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
        });
        matris.aksam.seviyeler[0].esikDk = 77;
        mockStore.set(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify({
            aktif: true,
            esikler: { seviye1: 5, seviye2: 4, seviye3: 3, seviye4: 2 }, // BAYAT
            matris,
        }));

        await konumDegistiUygula(ANKARA);

        const iletilenMatris = ilkArg(sahte.muhafiz).matris!;
        expect(iletilenMatris.aksam.seviyeler[0].esikDk).toBe(77);
        expect(iletilenMatris.ogle.seviyeler[0].esikDk).toBe(45); // bayat 5 sizmamali
    });
});
