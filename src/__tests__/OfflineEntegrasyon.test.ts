
import { configureStore } from '@reduxjs/toolkit';
import namazReducer, {
    namazDurumunuDegistir,
    namazlariYukle,
    tumNamazlariTamamla,
    tumNamazlariSifirla,
} from '../presentation/store/namazSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NamazAdi, NAMAZ_ISIMLERI } from '../core/constants/UygulamaSabitleri';
import * as LocalNamazServisi from '../data/local/LocalNamazServisi';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));


describe('Offline Namaz Entegrasyon Testi (Redux namazSlice <-> LocalStorage)', () => {
    let store: any;
    const mockDate = '2025-05-15';

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Store setup — bu test dosyasi yalnizca namazSlice <-> LocalStorage
        // round-trip'ini dogrular; seri/bildirim/konum zinciri burada kapsam disi.
        store = configureStore({
            reducer: {
                namaz: namazReducer,
            },
        });
    });


    test('Namaz durumu değiştirildiğinde AsyncStorage güncellenmeli', async () => {
        // 0. Mock initial load to populate state
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
            [mockDate]: { 'Sabah': false }
        }));
        await store.dispatch(namazlariYukle({ tarih: mockDate }));

        // 1. Dispatch action to toggle prayer status
        await store.dispatch(namazDurumunuDegistir({
            tarih: mockDate,
            namazAdi: 'Sabah' as NamazAdi,
            tamamlandi: true
        }));

        // 2. Verify state update
        const state = store.getState();
        const gunlukData = state.namaz.gunlukNamazlar;
        expect(gunlukData).toBeDefined();
        expect(gunlukData!.tarih).toBe(mockDate);
        expect(gunlukData!.namazlar.find((n: any) => n.namazAdi === 'Sabah')?.tamamlandi).toBe(true);

        // 3. Verify AsyncStorage interaction
        // It saves to "namaz_verileri" key
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        const callArgs = (AsyncStorage.setItem as jest.Mock).mock.lastCall;

        // Gun-bazli model (Faz 1): anahtar `namaz_gun_<tarih>`, deger o gunun {namazAdi:bool} JSON'i.
        expect(callArgs[0]).toContain(mockDate); // Tarih artik ANAHTARDA
        expect(callArgs[1]).toContain('"Sabah":true'); // Deger guncel durumu icermeli
    });

    test('Namazlar yüklendiğinde AsyncStorage verisi okunmalı', async () => {
        // 1. Storage'da var olan veriyi mock'la.
        //    Anahtarlar NamazAdi enum degerleridir (Turkce karakterli: 'Öğle', 'İkindi', ...).
        //    Storage'da string anahtar olarak Turkce karakterli saklanir; bunlarin storage'dan
        //    DOGRU sekilde okunup state'e tasindigini (round-trip) dogrularız.
        // Gun-bazli model (Faz 1): veri `namaz_gun_<tarih>` anahtarinda {namazAdi:bool} olarak durur.
        // Migrasyon bayragi '1' -> goc atlanir, dogrudan gun-anahtari okunur (anahtar-bazli mock).
        const gunVerisi = JSON.stringify({
            [NamazAdi.Sabah]: true,
            [NamazAdi.Ogle]: true,    // 'Öğle' Turkce anahtar round-trip
            [NamazAdi.Ikindi]: false,
            [NamazAdi.Aksam]: true,   // 'Akşam' Turkce anahtar round-trip
            [NamazAdi.Yatsi]: false,
        });
        (AsyncStorage.getItem as jest.Mock).mockImplementation(async (anahtar: string) => {
            if (anahtar === `namaz_gun_${mockDate}`) return gunVerisi;
            if (anahtar === '@namaz_akisi/namaz_gun_migrasyon_tamam') return '1';
            return null;
        });

        // 2. Dispatch load action
        await store.dispatch(namazlariYukle({ tarih: mockDate }));

        // 3. Verify AsyncStorage was queried
        // LocalNamazServisi uses DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI
        expect(AsyncStorage.getItem).toHaveBeenCalled();

        // 4. State, storage'daki BES vaktin tamamiyla beslenmis olmali.
        //    Sadece 'Sabah' (ASCII) degil; Turkce-karakterli enum anahtarlarinin da
        //    true/false olarak dogru okundugunu net assert ediyoruz. Uretimdeki
        //    `tarihVerileri[namazAdi] || false` fallback'i, kirik bir anahtar aramasini
        //    sessizce false'a cevirip regresyonu gizleyebilir; bu yuzden true beklenen
        //    Turkce anahtarlar (Öğle/Akşam) round-trip'i fiilen kanitlar.
        const state = store.getState();
        const gunlukData = state.namaz.gunlukNamazlar;
        expect(gunlukData).toBeDefined();

        const bul = (ad: NamazAdi) =>
            gunlukData!.namazlar.find((n: any) => n.namazAdi === ad)?.tamamlandi;
        expect(bul(NamazAdi.Sabah)).toBe(true);
        expect(bul(NamazAdi.Ogle)).toBe(true);    // 'Öğle' Turkce anahtar round-trip
        expect(bul(NamazAdi.Ikindi)).toBe(false);
        expect(bul(NamazAdi.Aksam)).toBe(true);   // 'Akşam' Turkce anahtar round-trip
        expect(bul(NamazAdi.Yatsi)).toBe(false);
    });


    test('Olmayan veri yüklendiğinde varsayılan yapı oluşturulmalı', async () => {
        // 1. Mock no data (null)
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        // 2. Dispatch load action
        await store.dispatch(namazlariYukle({ tarih: mockDate }));

        // 3. Verify state has default structure (all false)
        const state = store.getState();
        const gunlukData = state.namaz.gunlukNamazlar;
        expect(gunlukData).toBeDefined();
        expect(gunlukData!.namazlar).toHaveLength(5);
        expect(gunlukData!.namazlar.every((n: any) => n.tamamlandi === false)).toBe(true);
    });

    test('Servis basarisiz dondugunde namazlariYukle.rejected state.hata set etmeli', async () => {
        // localNamazlariGetir {basarili:false} dondugunde thunk Error firlatir -> rejected ->
        // state.hata dolar. (Not: AsyncStorage.getItem reject etse bile tumVerileriAl bunu
        // yutup {} dondurdugu icin servis basarili kalir; bu yuzden servis seviyesinde
        // dogrudan basarisiz yanit zorlanir.)
        const casus = jest
            .spyOn(LocalNamazServisi, 'localNamazlariGetir')
            .mockResolvedValue({ basarili: false, hata: 'storage patladi' });

        try {
            const sonuc = await store.dispatch(namazlariYukle({ tarih: mockDate }));

            // Thunk reddedilmis olmali (fulfilled DEGIL).
            expect(sonuc.type).toBe('namaz/namazlariYukle/rejected');

            const state = store.getState();
            // Hata kullaniciya gosterilebilmesi icin state'e yansimali; sessizce yutulmamali.
            expect(state.namaz.hata).toBeTruthy();
            expect(state.namaz.yukleniyor).toBe(false);
            // Veri yuklenemediginden gunlukNamazlar bos kalmali.
            expect(state.namaz.gunlukNamazlar).toBeNull();
        } finally {
            casus.mockRestore();
        }
    });

    test('Bozuk JSON yuklendiginde varsayilan (hepsi false) yapi uretilmeli, cokmemeli', async () => {
        // tumVerileriAl JSON.parse hatasini yakalayip {} doner -> 5 vakit tamamlandi:false.
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{ bozuk json !!!');

        const sonuc = await store.dispatch(namazlariYukle({ tarih: mockDate }));

        // localNamazlariGetir {basarili:true} dondugu icin thunk basariyla tamamlanmali.
        expect(sonuc.type).toBe('namaz/namazlariYukle/fulfilled');

        const state = store.getState();
        const gunlukData = state.namaz.gunlukNamazlar;
        expect(gunlukData).toBeDefined();
        expect(gunlukData!.tarih).toBe(mockDate);
        expect(gunlukData!.namazlar).toHaveLength(5);
        expect(gunlukData!.namazlar.every((n: any) => n.tamamlandi === false)).toBe(true);
        // Hata yolu DEGIL: bozuk JSON kullaniciya hata gostermeden zarif sekilde bos veriye dusmeli.
        expect(state.namaz.hata).toBeNull();
    });
});

/**
 * Kalici (stateful) AsyncStorage mock'u ile entegrasyon: gercek bir cihazdaki gibi
 * setItem ile yazilan veri getItem ile geri okunur. Bu, round-trip / read-modify-write /
 * yarış-durumu (lost update) gibi kalicilik garantilerini Redux seviyesinde dogrular.
 * Yukaridaki describe jest.fn() ile kalicisiz mock kullandigi icin bu senaryolari kapsayamaz.
 */
describe('Offline Kalici Entegrasyon (stateful AsyncStorage <-> Redux)', () => {
    let store: any;
    let bellek: Record<string, string>;

    const bul = (state: any, ad: NamazAdi): boolean | undefined =>
        state.namaz.gunlukNamazlar?.namazlar.find((n: any) => n.namazAdi === ad)?.tamamlandi;

    beforeEach(() => {
        jest.clearAllMocks();
        // In-memory kalici depo: gercek AsyncStorage davranisini taklit eder.
        bellek = {};
        (AsyncStorage.getItem as jest.Mock).mockImplementation(
            async (anahtar: string) => (anahtar in bellek ? bellek[anahtar] : null)
        );
        (AsyncStorage.setItem as jest.Mock).mockImplementation(
            async (anahtar: string, deger: string) => {
                bellek[anahtar] = deger;
            }
        );

        store = configureStore({ reducer: { namaz: namazReducer } });
    });

    test('Round-trip: yazilan tek namaz, yeniden yuklendiginde aynen geri okunmali', async () => {
        const tarih = '2025-05-15';

        // Once tarihi yukle (state'i besle), sonra tek vakti isaretle.
        await store.dispatch(namazlariYukle({ tarih }));
        await store.dispatch(namazDurumunuDegistir({
            tarih,
            namazAdi: NamazAdi.Ogle,
            tamamlandi: true,
        }));

        // Yeni bir store ile SIFIRDAN yukle: kalicilik gercekten depodan mi geliyor?
        const yeniStore = configureStore({ reducer: { namaz: namazReducer } });
        await yeniStore.dispatch(namazlariYukle({ tarih }));
        const state = yeniStore.getState();

        // Sadece Ogle true; diger 4 vakit depoda hic yazilmadigi icin false kalmali.
        expect(bul(state, NamazAdi.Ogle)).toBe(true);
        expect(bul(state, NamazAdi.Sabah)).toBe(false);
        expect(bul(state, NamazAdi.Ikindi)).toBe(false);
        expect(bul(state, NamazAdi.Aksam)).toBe(false);
        expect(bul(state, NamazAdi.Yatsi)).toBe(false);
    });

    test('Read-modify-write: bugun toggle edilince dunun verisi ezilmemeli', async () => {
        const dun = '2025-05-14';
        const bugun = '2025-05-15';

        // Dun: Sabah kilinmis olsun.
        await store.dispatch(namazDurumunuDegistir({
            tarih: dun,
            namazAdi: NamazAdi.Sabah,
            tamamlandi: true,
        }));
        // Bugun: Yatsi kilinmis olsun (ayri tarih anahtari).
        await store.dispatch(namazDurumunuDegistir({
            tarih: bugun,
            namazAdi: NamazAdi.Yatsi,
            tamamlandi: true,
        }));

        // Dunun verisi bugunku yazma tarafindan EZILMEMELI.
        const dunStore = configureStore({ reducer: { namaz: namazReducer } });
        await dunStore.dispatch(namazlariYukle({ tarih: dun }));
        expect(bul(dunStore.getState(), NamazAdi.Sabah)).toBe(true);
        expect(bul(dunStore.getState(), NamazAdi.Yatsi)).toBe(false);

        const bugunStore = configureStore({ reducer: { namaz: namazReducer } });
        await bugunStore.dispatch(namazlariYukle({ tarih: bugun }));
        expect(bul(bugunStore.getState(), NamazAdi.Yatsi)).toBe(true);
        expect(bul(bugunStore.getState(), NamazAdi.Sabah)).toBe(false);
    });

    test('Yaris durumu: 5 vakit Promise.all ile eszamanli yazilinca hicbiri kaybolmamali', async () => {
        const tarih = '2025-05-15';

        // Bes vakit AYNI ANDA dispatch edilir. Ortak NAMAZ_VERILERI anahtarinda
        // read-modify-write yapildigi icin, yazma kuyrugu (yazmaKuyrugu) olmasaydi
        // son yazan digerlerini ezerdi (lost update). Bes vaktin de korunmasi bekleniyor.
        await Promise.all(
            NAMAZ_ISIMLERI.map((ad) =>
                store.dispatch(namazDurumunuDegistir({ tarih, namazAdi: ad, tamamlandi: true }))
            )
        );

        // Depodan sifirdan oku.
        const yeniStore = configureStore({ reducer: { namaz: namazReducer } });
        await yeniStore.dispatch(namazlariYukle({ tarih }));
        const state = yeniStore.getState();

        // BES vaktin de true olmasi: lost update YASANMAMIS demektir.
        NAMAZ_ISIMLERI.forEach((ad) => {
            expect(bul(state, ad)).toBe(true);
        });

        // Depodaki ham JSON da bes vakti icermeli (gun-anahtari: namaz_gun_<tarih>).
        const ham = JSON.parse(bellek[`namaz_gun_${tarih}`]);
        expect(Object.keys(ham)).toHaveLength(NAMAZ_ISIMLERI.length);
    });

    test('Toplu tamamla: tumNamazlariTamamla 5 vakti hem state hem depoda true yapmali', async () => {
        const tarih = '2025-05-15';

        await store.dispatch(namazlariYukle({ tarih }));
        await store.dispatch(tumNamazlariTamamla({ tarih }));

        const state = store.getState();
        // State: bes vakit de true.
        NAMAZ_ISIMLERI.forEach((ad) => {
            expect(bul(state, ad)).toBe(true);
        });

        // Depo: gun-anahtarinda da bes vakit true.
        const ham = JSON.parse(bellek[`namaz_gun_${tarih}`]);
        NAMAZ_ISIMLERI.forEach((ad) => {
            expect(ham[ad]).toBe(true);
        });
    });

    test('Toplu sifirla: tumNamazlariSifirla onceden kilinan vakitleri hem state hem depoda false yapmali', async () => {
        const tarih = '2025-05-15';

        // Once hepsini tamamla, sonra sifirla; gercek "yanlislikla isaretledim, hepsini geri al" akisi.
        await store.dispatch(namazlariYukle({ tarih }));
        await store.dispatch(tumNamazlariTamamla({ tarih }));
        await store.dispatch(tumNamazlariSifirla({ tarih }));

        const state = store.getState();
        NAMAZ_ISIMLERI.forEach((ad) => {
            expect(bul(state, ad)).toBe(false);
        });

        const ham = JSON.parse(bellek[`namaz_gun_${tarih}`]);
        NAMAZ_ISIMLERI.forEach((ad) => {
            expect(ham[ad]).toBe(false);
        });
    });
});
