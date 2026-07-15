/**
 * namazSlice davranis testleri
 *
 * Kapsam: async thunk basari/red yollari, reducer dallari (eslesme/eslesmeme
 * guard'lari) ve istatistik hesaplama (haftalik/aylik) — bos veri ve karisik
 * tamamlanma dahil edge case'ler. Slice'in TEK bagimliligi LocalNamazServisi
 * mocklanir; TarihYardimcisi (saf tarih yardimcilari) gercek calisir, bu yuzden
 * istatistik thunk'lari deterministik kalir.
 */

import { configureStore } from '@reduxjs/toolkit';
import namazReducer, {
  namazlariYukle,
  namazDurumunuDegistir,
  tumNamazlariTamamla,
  tumNamazlariSifirla,
  haftalikIstatistikleriYukle,
  aylikIstatistikleriYukle,
  tarihiDegistir,
  hataTemizle,
} from '../namazSlice';
import { NamazAdi, NAMAZ_ISIMLERI } from '../../../core/constants/UygulamaSabitleri';
import { GunlukNamazlar } from '../../../core/types';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';

// ==================== MOCKLAR ====================

const mockLocalNamazlariGetir = jest.fn();
const mockLocalNamazDurumunuGuncelle = jest.fn();
const mockLocalTumNamazlariGuncelle = jest.fn();
const mockLocalTarihAraligindakiNamazlariGetir = jest.fn();

jest.mock('../../../data/local/LocalNamazServisi', () => ({
  localNamazlariGetir: (...args: any[]) => mockLocalNamazlariGetir(...args),
  localNamazDurumunuGuncelle: (...args: any[]) => mockLocalNamazDurumunuGuncelle(...args),
  localTumNamazlariGuncelle: (...args: any[]) => mockLocalTumNamazlariGuncelle(...args),
  localTarihAraligindakiNamazlariGetir: (...args: any[]) =>
    mockLocalTarihAraligindakiNamazlariGetir(...args),
}));

// ==================== YARDIMCILAR ====================

function storeOlustur() {
  return configureStore({
    reducer: { namaz: namazReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

// 5 farz namazli bir gun olustur; varsayilan: hepsi tamamlanmamis
const gunOlustur = (
  tarih: string,
  tamamlananlar: Partial<Record<NamazAdi, boolean>> = {}
): GunlukNamazlar => ({
  tarih,
  namazlar: NAMAZ_ISIMLERI.map((namazAdi) => ({
    namazAdi,
    tamamlandi: tamamlananlar[namazAdi] ?? false,
    tarih,
  })),
});

// ==================== TESTLER ====================

describe('namazSlice', () => {
  let store: ReturnType<typeof storeOlustur>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = storeOlustur();
  });

  describe('senkron reducer aksiyonlari', () => {
    test('tarihiDegistir mevcutTarih state alanini gunceller', () => {
      store.dispatch(tarihiDegistir('2026-03-15'));
      expect(store.getState().namaz.mevcutTarih).toBe('2026-03-15');
    });

    test('hataTemizle hata alanini null yapar', async () => {
      // Once bir hata uret
      mockLocalNamazlariGetir.mockResolvedValueOnce({ basarili: false, hata: 'patladi' });
      await store.dispatch(namazlariYukle({ tarih: '2026-03-15' }));
      expect(store.getState().namaz.hata).toBe('patladi');

      store.dispatch(hataTemizle());
      expect(store.getState().namaz.hata).toBeNull();
    });
  });

  describe('namazlariYukle', () => {
    test('basarili: gunlukNamazlar ve mevcutTarih payload ile guncellenir, yukleniyor kapanir', async () => {
      const veri = gunOlustur('2026-03-15', { [NamazAdi.Sabah]: true });
      mockLocalNamazlariGetir.mockResolvedValueOnce({ basarili: true, veri });

      const sonuc = await store.dispatch(namazlariYukle({ tarih: '2026-03-15' }));

      expect(sonuc.type).toContain('fulfilled');
      const s = store.getState().namaz;
      expect(s.yukleniyor).toBe(false);
      expect(s.gunlukNamazlar).toEqual(veri);
      expect(s.mevcutTarih).toBe('2026-03-15');
      expect(s.hata).toBeNull();
      expect(mockLocalNamazlariGetir).toHaveBeenCalledWith('2026-03-15');
    });

    test('basarisiz (basarili=false): servis hatasi state.hata olur, gunlukNamazlar null kalir', async () => {
      mockLocalNamazlariGetir.mockResolvedValueOnce({ basarili: false, hata: 'disk hatasi' });

      const sonuc = await store.dispatch(namazlariYukle({ tarih: '2026-03-15' }));

      expect(sonuc.type).toContain('rejected');
      const s = store.getState().namaz;
      expect(s.yukleniyor).toBe(false);
      expect(s.hata).toBe('disk hatasi');
      expect(s.gunlukNamazlar).toBeNull();
    });

    test('basarisiz (veri yok): varsayilan hata mesaji kullanilir', async () => {
      // basarili:true ama veri undefined -> thunk fallback mesajla firlatir
      mockLocalNamazlariGetir.mockResolvedValueOnce({ basarili: true, veri: undefined });

      const sonuc = await store.dispatch(namazlariYukle({ tarih: '2026-03-15' }));

      expect(sonuc.type).toContain('rejected');
      expect(store.getState().namaz.hata).toBe('Namazlar yuklenemedi');
    });

    test('pending: yukleniyor true olur ve onceki hata temizlenir', async () => {
      // Onceki hatayi kur
      mockLocalNamazlariGetir.mockResolvedValueOnce({ basarili: false, hata: 'eski' });
      await store.dispatch(namazlariYukle({ tarih: '2026-03-15' }));
      expect(store.getState().namaz.hata).toBe('eski');

      // Cozulmeyen promise ile pending pencereyi yakala
      let coz: (v: any) => void;
      mockLocalNamazlariGetir.mockReturnValueOnce(new Promise((r) => { coz = r; }));
      const bekleyen = store.dispatch(namazlariYukle({ tarih: '2026-03-16' }));

      // Pending uygulandi: yukleniyor true, hata temizlendi
      expect(store.getState().namaz.yukleniyor).toBe(true);
      expect(store.getState().namaz.hata).toBeNull();

      coz!({ basarili: true, veri: gunOlustur('2026-03-16') });
      await bekleyen;
      expect(store.getState().namaz.yukleniyor).toBe(false);
    });
  });

  describe('namazDurumunuDegistir', () => {
    test('eslesen tarihte ilgili namazin tamamlandi alanini gunceller', async () => {
      // Once bir gun yukle
      mockLocalNamazlariGetir.mockResolvedValueOnce({
        basarili: true,
        veri: gunOlustur('2026-03-15'),
      });
      await store.dispatch(namazlariYukle({ tarih: '2026-03-15' }));

      mockLocalNamazDurumunuGuncelle.mockResolvedValueOnce({ basarili: true });
      const sonuc = await store.dispatch(
        namazDurumunuDegistir({ tarih: '2026-03-15', namazAdi: NamazAdi.Ogle, tamamlandi: true })
      );

      expect(sonuc.type).toContain('fulfilled');
      const s = store.getState().namaz;
      expect(s.guncelleniyor).toBe(false);
      const ogle = s.gunlukNamazlar!.namazlar.find((n) => n.namazAdi === NamazAdi.Ogle);
      expect(ogle!.tamamlandi).toBe(true);
      // Diger namazlar etkilenmedi
      const sabah = s.gunlukNamazlar!.namazlar.find((n) => n.namazAdi === NamazAdi.Sabah);
      expect(sabah!.tamamlandi).toBe(false);
      expect(mockLocalNamazDurumunuGuncelle).toHaveBeenCalledWith('2026-03-15', NamazAdi.Ogle, true);
    });

    test('payload tarihi yuklu gunden FARKLIYSA state degismez (guard dali)', async () => {
      mockLocalNamazlariGetir.mockResolvedValueOnce({
        basarili: true,
        veri: gunOlustur('2026-03-15'),
      });
      await store.dispatch(namazlariYukle({ tarih: '2026-03-15' }));

      mockLocalNamazDurumunuGuncelle.mockResolvedValueOnce({ basarili: true });
      // Baska bir gun icin guncelle
      await store.dispatch(
        namazDurumunuDegistir({ tarih: '2026-03-99', namazAdi: NamazAdi.Ogle, tamamlandi: true })
      );

      // Yuklu gun (2026-03-15) hic dokunulmamali — tum namazlar hala false
      const s = store.getState().namaz;
      expect(s.gunlukNamazlar!.namazlar.every((n) => !n.tamamlandi)).toBe(true);
    });

    test('gunlukNamazlar null iken fulfilled cokmeden gecer (guard dali)', async () => {
      mockLocalNamazDurumunuGuncelle.mockResolvedValueOnce({ basarili: true });
      const sonuc = await store.dispatch(
        namazDurumunuDegistir({ tarih: '2026-03-15', namazAdi: NamazAdi.Ogle, tamamlandi: true })
      );
      expect(sonuc.type).toContain('fulfilled');
      expect(store.getState().namaz.gunlukNamazlar).toBeNull();
    });

    test('servis throw ederse rejected olur ve hata state alanina yazilir', async () => {
      mockLocalNamazDurumunuGuncelle.mockRejectedValueOnce(new Error('yazma basarisiz'));
      const sonuc = await store.dispatch(
        namazDurumunuDegistir({ tarih: '2026-03-15', namazAdi: NamazAdi.Ogle, tamamlandi: true })
      );
      expect(sonuc.type).toContain('rejected');
      const s = store.getState().namaz;
      expect(s.guncelleniyor).toBe(false);
      expect(s.hata).toBe('yazma basarisiz');
    });
  });

  describe('tumNamazlariTamamla / tumNamazlariSifirla', () => {
    async function gunYukle(tarih: string, tamamlananlar: Partial<Record<NamazAdi, boolean>> = {}) {
      mockLocalNamazlariGetir.mockResolvedValueOnce({
        basarili: true,
        veri: gunOlustur(tarih, tamamlananlar),
      });
      await store.dispatch(namazlariYukle({ tarih }));
    }

    test('tumNamazlariTamamla eslesen gunde tum namazlari tamamlar', async () => {
      await gunYukle('2026-03-15');
      mockLocalTumNamazlariGuncelle.mockResolvedValueOnce({ basarili: true });

      await store.dispatch(tumNamazlariTamamla({ tarih: '2026-03-15' }));

      const s = store.getState().namaz;
      expect(s.gunlukNamazlar!.namazlar.every((n) => n.tamamlandi)).toBe(true);
      expect(mockLocalTumNamazlariGuncelle).toHaveBeenCalledWith('2026-03-15', true);
    });

    test('tumNamazlariSifirla eslesen gunde tum namazlari sifirlar', async () => {
      // Hepsi tamamlanmis baslangic
      await gunYukle('2026-03-15', {
        [NamazAdi.Sabah]: true,
        [NamazAdi.Ogle]: true,
        [NamazAdi.Ikindi]: true,
        [NamazAdi.Aksam]: true,
        [NamazAdi.Yatsi]: true,
      });
      mockLocalTumNamazlariGuncelle.mockResolvedValueOnce({ basarili: true });

      await store.dispatch(tumNamazlariSifirla({ tarih: '2026-03-15' }));

      const s = store.getState().namaz;
      expect(s.gunlukNamazlar!.namazlar.every((n) => !n.tamamlandi)).toBe(true);
      expect(mockLocalTumNamazlariGuncelle).toHaveBeenCalledWith('2026-03-15', false);
    });

    test('farkli tarih payload state degistirmez (guard dali)', async () => {
      await gunYukle('2026-03-15', { [NamazAdi.Sabah]: true });
      mockLocalTumNamazlariGuncelle.mockResolvedValue({ basarili: true });

      await store.dispatch(tumNamazlariTamamla({ tarih: '2026-03-16' }));
      await store.dispatch(tumNamazlariSifirla({ tarih: '2026-03-16' }));

      // Yuklu gun degismedi: yalniz Sabah tamamli kaldi
      const s = store.getState().namaz;
      const sabah = s.gunlukNamazlar!.namazlar.find((n) => n.namazAdi === NamazAdi.Sabah);
      const ogle = s.gunlukNamazlar!.namazlar.find((n) => n.namazAdi === NamazAdi.Ogle);
      expect(sabah!.tamamlandi).toBe(true);
      expect(ogle!.tamamlandi).toBe(false);
    });
  });

  describe('haftalikIstatistikleriYukle', () => {
    test('servis verisini eksik gunlerle tamamlayip 7 gunluk istatistik uretir', async () => {
      const bugun = bugunuAl();
      // Servis tek bir gun (bugun) dondursun: 2/5 tamamli
      mockLocalTarihAraligindakiNamazlariGetir.mockResolvedValueOnce({
        basarili: true,
        veri: [gunOlustur(bugun, { [NamazAdi.Sabah]: true, [NamazAdi.Ogle]: true })],
      });

      const sonuc = await store.dispatch(haftalikIstatistikleriYukle());
      expect(sonuc.type).toContain('fulfilled');

      const ist = store.getState().namaz.haftalikIstatistik!;
      // Hafta 7 gun: servis 1 gun verdi, 6'si eksik gun olarak (tum bos) eklendi
      expect(ist.gunlukVeriler.length).toBe(7);
      // Toplam namaz = 7 gun * 5 = 35
      expect(ist.toplamNamaz).toBe(35);
      // Tamamlanan = yalniz bugunun 2 namazi
      expect(ist.tamamlananNamaz).toBe(2);
      expect(ist.tamamlanmaYuzdesi).toBe(Math.round((2 / 35) * 100));
      // En iyi gun = bugun (yuzde 40), digerleri 0
      expect(ist.enIyiGun!.tarih).toBe(bugun);
      expect(ist.enIyiGun!.tamamlanmaYuzdesi).toBe(40);
      // Gunluk veriler tarihe gore sirali (artirak)
      const tarihler = ist.gunlukVeriler.map((g) => g.tarih);
      expect([...tarihler].sort()).toEqual(tarihler);
    });

    test('servis bos donerse (veri yok) tum hafta sifir istatistikle doldurulur', async () => {
      mockLocalTarihAraligindakiNamazlariGetir.mockResolvedValueOnce({
        basarili: true,
        veri: [],
      });

      await store.dispatch(haftalikIstatistikleriYukle());

      const ist = store.getState().namaz.haftalikIstatistik!;
      expect(ist.gunlukVeriler.length).toBe(7);
      expect(ist.toplamNamaz).toBe(35);
      expect(ist.tamamlananNamaz).toBe(0);
      expect(ist.tamamlanmaYuzdesi).toBe(0);
      // Hicbiri tamamlanmadi -> en iyi gun yuzdesi 0
      expect(ist.enIyiGun!.tamamlanmaYuzdesi).toBe(0);
    });

    test('servis yaniti veri alanini hic icermezse (undefined) coken yok, yukleniyor kapanir', async () => {
      // yanit.veri undefined -> thunk icinde `|| []` ile bos diziye duser
      mockLocalTarihAraligindakiNamazlariGetir.mockResolvedValueOnce({ basarili: true });

      const sonuc = await store.dispatch(haftalikIstatistikleriYukle());
      expect(sonuc.type).toContain('fulfilled');
      const s = store.getState().namaz;
      expect(s.yukleniyor).toBe(false);
      expect(s.haftalikIstatistik!.toplamNamaz).toBe(35);
    });

    test('servis throw ederse rejected olur ve hata yazilir', async () => {
      mockLocalTarihAraligindakiNamazlariGetir.mockRejectedValueOnce(new Error('aralik okunamadi'));

      const sonuc = await store.dispatch(haftalikIstatistikleriYukle());
      expect(sonuc.type).toContain('rejected');
      const s = store.getState().namaz;
      expect(s.yukleniyor).toBe(false);
      expect(s.hata).toBe('aralik okunamadi');
    });
  });

  describe('aylikIstatistikleriYukle', () => {
    test('namaz bazinda yuzdeleri ve aktif gun sayisini dogru hesaplar', async () => {
      const bugun = bugunuAl();
      // Iki gun: birinde Sabah tamamli, digerinde Sabah+Ogle tamamli
      const gun1 = gunOlustur(bugun, { [NamazAdi.Sabah]: true });
      // Aydaki ikinci bir tarih uret (bugun ayin 1'i degilse onceki gun, degilse sonraki):
      const tarihObj = new Date(bugun);
      const testGun = tarihObj.getDate() === 15 ? 16 : 15;
      const ikinciTarih = new Date(tarihObj.getFullYear(), tarihObj.getMonth(), testGun)
        .toISOString()
        .split('T')[0];
      const gun2 = gunOlustur(ikinciTarih, { [NamazAdi.Sabah]: true, [NamazAdi.Ogle]: true });

      mockLocalTarihAraligindakiNamazlariGetir.mockResolvedValueOnce({
        basarili: true,
        veri: [gun1, gun2],
      });

      const sonuc = await store.dispatch(aylikIstatistikleriYukle());
      expect(sonuc.type).toContain('fulfilled');

      const ist = store.getState().namaz.aylikIstatistik!;
      // 2 gun * 5 = 10 toplam namaz
      expect(ist.toplamNamaz).toBe(10);
      // Tamamlanan: gun1 Sabah(1) + gun2 Sabah,Ogle(2) = 3
      expect(ist.tamamlananNamaz).toBe(3);
      expect(ist.tamamlanmaYuzdesi).toBe(Math.round((3 / 10) * 100));
      // Iki ayri gunde tamamlanan namaz var -> aktif gun = 2
      expect(ist.aktifGunSayisi).toBe(2);
      // Sabah iki gunde de tamamli -> 2/2 = %100
      expect(ist.namazBazindaYuzdeler[NamazAdi.Sabah]).toBe(100);
      // Ogle yalniz 1 gunde -> 1/2 = %50
      expect(ist.namazBazindaYuzdeler[NamazAdi.Ogle]).toBe(50);
      // Ikindi hic -> %0
      expect(ist.namazBazindaYuzdeler[NamazAdi.Ikindi]).toBe(0);
      // Ay/yil bugunun degerleriyle eslesir
      expect(ist.ay).toBe(tarihObj.getMonth());
      expect(ist.yil).toBe(tarihObj.getFullYear());
    });

    test('bos veride tum yuzdeler 0, aktif gun 0', async () => {
      mockLocalTarihAraligindakiNamazlariGetir.mockResolvedValueOnce({ basarili: true, veri: [] });

      await store.dispatch(aylikIstatistikleriYukle());

      const ist = store.getState().namaz.aylikIstatistik!;
      expect(ist.toplamNamaz).toBe(0);
      expect(ist.tamamlananNamaz).toBe(0);
      expect(ist.tamamlanmaYuzdesi).toBe(0);
      expect(ist.aktifGunSayisi).toBe(0);
      NAMAZ_ISIMLERI.forEach((ad) => {
        expect(ist.namazBazindaYuzdeler[ad]).toBe(0);
      });
    });

    test('servis throw ederse rejected olur ve hata yazilir', async () => {
      mockLocalTarihAraligindakiNamazlariGetir.mockRejectedValueOnce(new Error('aylik patladi'));

      const sonuc = await store.dispatch(aylikIstatistikleriYukle());
      expect(sonuc.type).toContain('rejected');
      const s = store.getState().namaz;
      expect(s.yukleniyor).toBe(false);
      expect(s.hata).toBe('aylik patladi');
    });
  });
});
