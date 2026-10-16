import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import seferilikReducer, {
  seferilikAyarlariniGuncelle,
  seferilikIkametiAyarla,
  seferilikKartiniKapat,
  seferilikKonumIsle,
  seferilikYukle,
} from '../seferilikSlice';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const ANKARA = { lat: 39.9208, lng: 32.8541 };
const ESKISEHIR = { lat: 39.7767, lng: 30.5206 };

const storeKur = () => configureStore({ reducer: { seferilik: seferilikReducer } });

const oku = async (anahtar: string) => {
  const ham = await AsyncStorage.getItem(anahtar);
  return ham === null ? null : JSON.parse(ham);
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('seferilikSlice', () => {
  it('başlangıçta yüklenmemiştir (initialState gerçek veri sanılmasın)', () => {
    const s = storeKur().getState().seferilik;
    expect(s.yuklendi).toBe(false);
    expect(s.sonKonum).toBeNull();
  });

  it('yükleme ayar + hafızayı diskten okur; ikinci yükleme condition ile atlanır, zorla geçer', async () => {
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI, JSON.stringify({ mezhep: 'safii' }));
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI,
      JSON.stringify({ yolculuktaKapatildi: true }),
    );
    const store = storeKur();
    await store.dispatch(seferilikYukle());
    expect(store.getState().seferilik).toMatchObject({
      yuklendi: true,
      ayarlar: { mezhep: 'safii', kartAcik: true },
      hafiza: { yolculuktaKapatildi: true },
    });
    // Mezhep ORTAK ayardır (Kaza Defteri 2.0): ilk okumada seferîlik kaydından bir kez
    // göç edildi; bundan sonra kaynak ortak anahtardır.
    expect(await oku(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI)).toEqual({ mezhep: 'safii' });
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI, JSON.stringify({ mezhep: 'hanefi' }));
    await store.dispatch(seferilikYukle());
    expect(store.getState().seferilik.ayarlar.mezhep).toBe('safii');
    await store.dispatch(seferilikYukle({ zorla: true }));
    expect(store.getState().seferilik.ayarlar.mezhep).toBe('hanefi');
  });

  it('kartı kapatma iyimserdir ve diske yazılır', async () => {
    const store = storeKur();
    const bekleyen = store.dispatch(seferilikKartiniKapat());
    expect(store.getState().seferilik.hafiza.yolculuktaKapatildi).toBe(true);
    await bekleyen;
    expect(await oku(DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI)).toEqual({ yolculuktaKapatildi: true });
  });

  it('mezhep/kart anahtarı diskte birleşerek yazılır (ikamet korunur)', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI,
      JSON.stringify({ ikamet: { ...ANKARA, kaynak: 'kullanici' } }),
    );
    const store = storeKur();
    await store.dispatch(seferilikAyarlariniGuncelle({ mezhep: 'safii' }));
    await store.dispatch(seferilikAyarlariniGuncelle({ kartAcik: false }));
    // Mezhep ortak anahtara da yazılır (kaza defteri vitri buradan okur); kullanıcının
    // BİLİNÇLİ seçimi olarak işaretlenir (eski yedeğin seferîlik mezhebi onu ezmez).
    expect(await oku(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI)).toEqual({ mezhep: 'safii', secildi: true });
    expect(await oku(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI)).toEqual({
      kartAcik: false,
      mezhep: 'safii',
      ikamet: { ...ANKARA, kaynak: 'kullanici' },
    });
  });

  it('konum işleme DİSKTEKİ konumu saklar', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI,
      JSON.stringify({ konumModu: 'manuel', koordinatlar: ANKARA, seciliIlAdi: 'Ankara', seciliIlceAdi: 'Çankaya' }),
    );
    const store = storeKur();
    await store.dispatch(seferilikKonumIsle());
    const s = store.getState().seferilik;
    expect(s.sonKonum).toEqual(ANKARA);
    expect(s.sonKonumAdi).toBe('Çankaya, Ankara');
    expect(s.ayarlar.ikamet).toMatchObject({ ...ANKARA, kaynak: 'ilkKonum' });
  });

  it('"Burası evim" ikameti kullanıcı kaynağıyla yazar ve kapatma hafızasını sıfırlar', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI,
      JSON.stringify({ ikamet: { ...ANKARA, kaynak: 'ilkKonum' } }),
    );
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI,
      JSON.stringify({ yolculuktaKapatildi: true }),
    );
    const store = storeKur();
    await store.dispatch(seferilikIkametiAyarla({ konum: ESKISEHIR, ad: 'Tepebaşı, Eskişehir' }));
    const s = store.getState().seferilik;
    expect(s.ayarlar.ikamet).toEqual({ ...ESKISEHIR, ad: 'Tepebaşı, Eskişehir', kaynak: 'kullanici' });
    expect(s.hafiza.yolculuktaKapatildi).toBe(false);
    expect(await oku(DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI)).toEqual({ yolculuktaKapatildi: false });
  });
});
