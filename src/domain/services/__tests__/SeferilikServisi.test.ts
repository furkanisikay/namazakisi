/**
 * SeferilikServisi — disk yan etkileri (issue #296). AsyncStorage jest.setup'taki
 * resmî bellek-içi mock'tur; Depolama katmanı gerçektir.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SeferilikServisi } from '../SeferilikServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const ANKARA = { lat: 39.9208, lng: 32.8541 };
const GOLBASI = { lat: 39.7905, lng: 32.8045 };
const ESKISEHIR = { lat: 39.7767, lng: 30.5206 };

const oku = async (anahtar: string) => {
  const ham = await AsyncStorage.getItem(anahtar);
  return ham === null ? null : JSON.parse(ham);
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('SeferilikServisi.konumIsle', () => {
  it('ikamet yoksa ilk geçerli konumu ikamet olarak YAZAR', async () => {
    const durum = await SeferilikServisi.konumIsle(ANKARA, 'Çankaya, Ankara');
    expect(durum.ayarlar.ikamet).toEqual({ ...ANKARA, ad: 'Çankaya, Ankara', kaynak: 'ilkKonum' });
    expect((await oku(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI)).ikamet).toEqual(durum.ayarlar.ikamet);
  });

  it('kayıtlı ikameti EZMEZ (sonraki konumlar yolculuk sayılır)', async () => {
    await SeferilikServisi.konumIsle(ANKARA);
    const durum = await SeferilikServisi.konumIsle(ESKISEHIR);
    expect(durum.ayarlar.ikamet).toMatchObject(ANKARA);
  });

  it('{0,0} nöbetçisi ikamet olarak yazılmaz', async () => {
    const durum = await SeferilikServisi.konumIsle({ lat: 0, lng: 0 });
    expect(durum.ayarlar.ikamet).toBeNull();
    expect(await oku(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI)).toBeNull();
  });

  it('eve dönünce kapatma hafızasını sıfırlar (arka plan yolu)', async () => {
    await SeferilikServisi.konumIsle(ANKARA);
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI,
      JSON.stringify({ yolculuktaKapatildi: true }),
    );
    const yolda = await SeferilikServisi.konumIsle(ESKISEHIR);
    expect(yolda.hafiza.yolculuktaKapatildi).toBe(true);
    const evde = await SeferilikServisi.konumIsle(GOLBASI);
    expect(evde.hafiza.yolculuktaKapatildi).toBe(false);
    expect(await oku(DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI)).toEqual({ yolculuktaKapatildi: false });
  });

  it('bozuk ayar kaydında çökmez, varsayılandan devam eder', async () => {
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI, '{bozuk');
    const durum = await SeferilikServisi.konumIsle(ANKARA);
    expect(durum.ayarlar).toMatchObject({ kartAcik: true, mezhep: 'hanefi' });
    expect(durum.ayarlar.ikamet).toMatchObject(ANKARA);
  });
});

describe('SeferilikServisi.diskKonumunuIsle', () => {
  it('KRİTİK: konum kaydı YOKSA hiçbir şey yazmaz (store\'un İstanbul varsayılanı ikamet olmasın)', async () => {
    const durum = await SeferilikServisi.diskKonumunuIsle();
    expect(durum.konum).toBeNull();
    expect(durum.ayarlar.ikamet).toBeNull();
    expect(await oku(DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI)).toBeNull();
  });

  it('diskteki konumu ve adını işler', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI,
      JSON.stringify({
        konumModu: 'oto',
        koordinatlar: ESKISEHIR,
        gpsAdres: { ilce: 'Tepebaşı', il: 'Eskişehir' },
        seciliIlAdi: 'Istanbul',
      }),
    );
    const durum = await SeferilikServisi.diskKonumunuIsle();
    expect(durum.konum).toEqual(ESKISEHIR);
    expect(durum.konumAdi).toBe('Tepebaşı, Eskişehir');
    expect(durum.ayarlar.ikamet).toEqual({ ...ESKISEHIR, ad: 'Tepebaşı, Eskişehir', kaynak: 'ilkKonum' });
  });

  it('bozuk konum kaydı (nesne-dışı) yalnız mevcut durumu döndürür', async () => {
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI, '42');
    const durum = await SeferilikServisi.diskKonumunuIsle();
    expect(durum.konum).toBeNull();
    expect(durum.ayarlar.ikamet).toBeNull();
  });
});
