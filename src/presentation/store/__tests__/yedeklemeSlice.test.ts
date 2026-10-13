/**
 * Yedekleme slice + orkestratör thunk testleri.
 *
 * En kritik: store tazeleme SIRASI (spec §10) ve reconcile zincirinin SIRALI olması
 * (`seriKontrolet → puanlamayiYenidenHesapla`, ikisi de `seriVerileriniYukle`'den sonra
 * — AGENTS.md tek-yazıcı/yarış kuralı). Ayrıca plan `Depolama.yaz` ile yazılmalı ve göç
 * bayrağı `Depolama.hamYaz('@namaz_akisi/namaz_gun_migrasyon_tamam', '1')` ile set edilmeli.
 */

import yedeklemeReducer, {
  iceAktarmayiUygula,
  durumuSifirla,
  YedeklemeState,
} from '../yedeklemeSlice';
import { Depolama } from '../../../data/local/Depolama';
import { mevcutVeriyiTopla } from '../../../domain/services/YedeklemeServisi';
import { birlestirmePlaniOlustur } from '../../../domain/services/YedekBirlestirmeServisi';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';
import { YedekPayload, KategoriSecimleri } from '../../../core/types';

// --- Servis + Depolama + tarih mock'ları ---
jest.mock('../../../data/local/Depolama', () => ({
  Depolama: {
    yaz: jest.fn(() => Promise.resolve()),
    hamYaz: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../../../domain/services/YedeklemeServisi', () => ({
  mevcutVeriyiTopla: jest.fn(() => Promise.resolve({} as YedekPayload)),
}));

jest.mock('../../../domain/services/YedekBirlestirmeServisi', () => ({
  birlestirmePlaniOlustur: jest.fn(() => ({})),
}));

jest.mock('../../../core/utils/TarihYardimcisi', () => ({
  bugunuAl: jest.fn(() => '2026-06-14'),
}));

// --- Loader/reconcile thunk mock'ları: her biri benzersiz type'lı action döndürür ---
jest.mock('../konumSlice', () => ({
  konumAyarlariniYukle: jest.fn(() => ({ type: 'konum/yukle' })),
}));
jest.mock('../muhafizSlice', () => ({
  muhafizAyarlariniYukle: jest.fn(() => ({ type: 'muhafiz/yukle' })),
}));
jest.mock('../vakitSayacSlice', () => ({
  vakitSayacAyarlariniYukle: jest.fn(() => ({ type: 'vakitSayac/yukle' })),
}));
jest.mock('../iftarSayacSlice', () => ({
  iftarSayacAyarlariniYukle: jest.fn(() => ({ type: 'iftarSayac/yukle' })),
}));
jest.mock('../sahurSayacSlice', () => ({
  sahurSayacAyarlariniYukle: jest.fn(() => ({ type: 'sahurSayac/yukle' })),
}));
jest.mock('../vakitBildirimSlice', () => ({
  vakitBildirimAyarlariniYukle: jest.fn(() => ({ type: 'vakitBildirim/yukle' })),
}));
jest.mock('../cumaHatirlatmaSlice', () => ({
  cumaHatirlatmaAyarlariniYukle: jest.fn(() => ({ type: 'cumaHatirlatma/yukle' })),
}));
jest.mock('../camiyeGitSlice', () => ({
  camiyeGitAyarlariniYukle: jest.fn(() => ({ type: 'camiyeGit/yukle' })),
}));
const mockCamiyeGitGuncelle = jest.fn((..._a: unknown[]) => Promise.resolve());
jest.mock('../../../domain/services/CamiyeGitHatirlatmaServisi', () => ({
  CamiyeGitHatirlatmaServisi: {
    getInstance: () => ({ hatirlatmalariGuncelle: (...a: unknown[]) => mockCamiyeGitGuncelle(...a) }),
  },
}));
jest.mock('../nafileSlice', () => ({
  nafileAyarlariniYukle: jest.fn(() => ({ type: 'nafile/yukle' })),
}));
jest.mock('../nowBarSlice', () => ({
  nowBarAyarlariniYukle: jest.fn(() => ({ type: 'nowBar/yukle' })),
}));
const mockNafileGuncelle = jest.fn((..._a: unknown[]) => Promise.resolve());
jest.mock('../../../domain/services/NafileHatirlatmaServisi', () => ({
  NafileHatirlatmaServisi: {
    getInstance: () => ({ hatirlatmalariGuncelle: (...a: unknown[]) => mockNafileGuncelle(...a) }),
  },
}));
// Özel gün geri yüklenince tüm hatırlatmalar yeniden kurulmalı (issue #272):
// içe aktarma diske doğrudan yazar, `ozelGunListener` tetiklenmez.
const mockOzelGunDegistiUygula = jest.fn(() => Promise.resolve(true));
jest.mock('../../../domain/services/OzelGunDegisikligiServisi', () => ({
  ozelGunDegistiUygula: () => mockOzelGunDegistiUygula(),
}));
const mockGunSonuGuncelle = jest.fn((..._a: unknown[]) => Promise.resolve());
jest.mock('../../../domain/services/GunSonuHatirlaticiServisi', () => ({
  gunSonuHatirlatmalariniGuncelle: (...a: unknown[]) => mockGunSonuGuncelle(...a),
}));
jest.mock('../../../domain/services/WearSenkronServisi', () => ({
  WearSenkronServisi: { getInstance: () => ({ gonder: jest.fn(() => Promise.resolve()) }) },
}));
jest.mock('../../../domain/services/WidgetServisi', () => ({
  WidgetServisi: { getInstance: () => ({ kilinanlariYaz: jest.fn(() => Promise.resolve()) }) },
}));

jest.mock('../takvimSlice', () => ({
  takvimAyarlariniYukle: jest.fn(() => ({ type: 'takvim/yukle' })),
}));
jest.mock('../namazSlice', () => ({
  namazlariYukle: jest.fn((arg: { tarih: string }) => ({
    type: 'namaz/yukle',
    payload: arg,
  })),
}));
jest.mock('../seriSlice', () => ({
  seriVerileriniYukle: jest.fn(() => ({ type: 'seri/yukle' })),
  seriKontrolet: jest.fn((arg: unknown) => ({ type: 'seri/kontrol', payload: arg })),
  puanlamayiYenidenHesapla: jest.fn((arg: unknown) => ({
    type: 'seri/reconcile',
    payload: arg,
  })),
}));
jest.mock('../kazaSlice', () => ({
  kazaVerileriniYukle: jest.fn(() => ({ type: 'kaza/yukle' })),
}));
jest.mock('../ozelliklerSlice', () => ({
  ozellikleriYukle: jest.fn(() => ({ type: 'ozellikler/yukle' })),
}));

const varsayilanSecimler: KategoriSecimleri = {
  namaz: 'akilli',
  puan: 'akilli',
  kaza: 'akilli',
  ayarlar: 'akilli',
};

const ornekPayload = { namazGunleri: {} } as unknown as YedekPayload;

describe('yedeklemeSlice', () => {
  describe('reducer', () => {
    const varsayilan: YedeklemeState = {
      durum: 'bosta',
      hata: null,
      sonOzet: null,
    };

    it('başlangıç durumu bosta olmalı', () => {
      const state = yedeklemeReducer(undefined, { type: 'unknown' });
      expect(state.durum).toBe('bosta');
      expect(state.hata).toBeNull();
      expect(state.sonOzet).toBeNull();
    });

    it('pending → durum uygulaniyor, hata temizlenir', () => {
      const state = yedeklemeReducer(
        { ...varsayilan, durum: 'hata', hata: 'eski' },
        { type: iceAktarmayiUygula.pending.type }
      );
      expect(state.durum).toBe('uygulaniyor');
      expect(state.hata).toBeNull();
    });

    it('fulfilled → durum tamam, sonOzet set', () => {
      const state = yedeklemeReducer(
        { ...varsayilan, durum: 'uygulaniyor' },
        {
          type: iceAktarmayiUygula.fulfilled.type,
          payload: { yazilanAnahtarSayisi: 3 },
        }
      );
      expect(state.durum).toBe('tamam');
      expect(state.hata).toBeNull();
      expect(state.sonOzet).toEqual({ yazilanAnahtarSayisi: 3 });
    });

    it('rejected → durum hata, hata mesajı set', () => {
      const state = yedeklemeReducer(
        { ...varsayilan, durum: 'uygulaniyor' },
        { type: iceAktarmayiUygula.rejected.type, error: { message: 'patladı' } }
      );
      expect(state.durum).toBe('hata');
      expect(state.hata).toBe('patladı');
    });

    it('durumuSifirla → başlangıca döner', () => {
      const state = yedeklemeReducer(
        { durum: 'tamam', hata: null, sonOzet: { yazilanAnahtarSayisi: 5 } },
        durumuSifirla()
      );
      expect(state.durum).toBe('bosta');
      expect(state.sonOzet).toBeNull();
    });
  });

  describe('iceAktarmayiUygula (orkestratör)', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    /** Çağrı sırasını kaydeden mock dispatch (action.type'ı sırayla toplar). */
    const dispatchYap = (cagriSirasi: string[]) =>
      jest.fn((action: { type: string }) => {
        cagriSirasi.push(action.type);
        return action;
      });

    const getStateYap = () => () => ({
      namaz: { gunlukNamazlar: { tarih: '2026-06-14', namazlar: [] } },
    });

    /** Thunk'u mock dispatch/getState ile çalıştırır (RTK'nın katı tipleri için cast). */
    const calistir = (
      dispatch: ReturnType<typeof dispatchYap>,
      getState: ReturnType<typeof getStateYap>
    ) =>
      iceAktarmayiUygula({ payload: ornekPayload, secimler: varsayilanSecimler })(
        dispatch as never,
        getState as never,
        undefined
      );

    it('store tazeleme spec §10 sırasında: konum İLK, reconcile SIRALI ve seriVerileriniYukle SONRASI', async () => {
      const cagriSirasi: string[] = [];
      const dispatch = dispatchYap(cagriSirasi);

      (birlestirmePlaniOlustur as jest.Mock).mockReturnValue({
        a: 1,
        b: 2,
      });

      await calistir(dispatch, getStateYap());

      // RTK wrapper'ın pending/fulfilled lifecycle action'larını ele (yalnız iş thunk'ları kalsın).
      const loaderSirasi = cagriSirasi.filter(
        (t) => !t.startsWith('yedekleme/iceAktar/')
      );
      const i = (t: string) => loaderSirasi.indexOf(t);

      // konum İLK dispatch edilen loader olmalı.
      expect(loaderSirasi[0]).toBe('konum/yukle');

      // namaz, tüm ayar loader'larından SONRA.
      expect(i('namaz/yukle')).toBeGreaterThan(i('muhafiz/yukle'));
      expect(i('namaz/yukle')).toBeGreaterThan(i('takvim/yukle'));
      // Nafile ayarı da içe aktarmada store'a geri yüklenir (issue #77).
      expect(i('nafile/yukle')).toBeGreaterThan(i('konum/yukle'));

      // seriVerileriniYukle, reconcile zincirinden ÖNCE.
      expect(i('seri/yukle')).toBeGreaterThan(i('namaz/yukle'));
      expect(i('seri/kontrol')).toBeGreaterThan(i('seri/yukle'));
      expect(i('seri/reconcile')).toBeGreaterThan(i('seri/yukle'));

      // reconcile SIRALI: seriKontrolet, puanlamayiYenidenHesapla'dan ÖNCE.
      expect(i('seri/kontrol')).toBeLessThan(i('seri/reconcile'));

      // kaza/ozellikler en sonda (reconcile'den sonra).
      expect(i('kaza/yukle')).toBeGreaterThan(i('seri/reconcile'));
      expect(i('ozellikler/yukle')).toBeGreaterThan(i('seri/reconcile'));
    });

    it('planı Depolama.yaz ile yazar (her anahtar) ve göç bayrağını hamYaz ile set eder', async () => {
      const cagriSirasi: string[] = [];
      const dispatch = dispatchYap(cagriSirasi);

      (birlestirmePlaniOlustur as jest.Mock).mockReturnValue({
        '@namaz_akisi/namaz_gun_2026-06-14': { sabah: true },
        '@namaz_akisi/bonus_puan': 42,
      });

      const sonuc = await calistir(dispatch, getStateYap());

      // Mevcut veri toplandı + plan üretildi.
      expect(mevcutVeriyiTopla).toHaveBeenCalledTimes(1);
      expect(birlestirmePlaniOlustur).toHaveBeenCalledWith(
        expect.anything(),
        ornekPayload,
        varsayilanSecimler
      );

      // Plandaki HER anahtar Depolama.yaz ile yazıldı.
      expect(Depolama.yaz).toHaveBeenCalledTimes(2);
      expect(Depolama.yaz).toHaveBeenCalledWith('@namaz_akisi/namaz_gun_2026-06-14', {
        sabah: true,
      });
      expect(Depolama.yaz).toHaveBeenCalledWith('@namaz_akisi/bonus_puan', 42);

      // Göç bayrağı '1' ile set edildi (açılış göçü ezmesin).
      expect(Depolama.hamYaz).toHaveBeenCalledWith(
        '@namaz_akisi/namaz_gun_migrasyon_tamam',
        '1'
      );

      // Dönen özet doğru.
      expect(sonuc.payload).toEqual({ yazilanAnahtarSayisi: 2 });
    });

    it('namazlariYukle bugünün tarihiyle çağrılır; seriKontrolet state\'ten bugünün namazını alır', async () => {
      const cagriSirasi: string[] = [];
      const dispatch = dispatchYap(cagriSirasi);
      (birlestirmePlaniOlustur as jest.Mock).mockReturnValue({});

      const { namazlariYukle } = jest.requireMock('../namazSlice');
      const { seriKontrolet } = jest.requireMock('../seriSlice');

      await calistir(dispatch, getStateYap());

      expect(bugunuAl).toHaveBeenCalled();
      expect(namazlariYukle).toHaveBeenCalledWith({ tarih: '2026-06-14' });
      expect(seriKontrolet).toHaveBeenCalledWith({
        bugunNamazlar: { tarih: '2026-06-14', namazlar: [] },
        dunNamazlar: null,
      });
    });

    it('boş plan: hiçbir Depolama.yaz çağrılmaz ama göç bayrağı yine de set edilir', async () => {
      const cagriSirasi: string[] = [];
      const dispatch = dispatchYap(cagriSirasi);
      (birlestirmePlaniOlustur as jest.Mock).mockReturnValue({});

      const sonuc = await calistir(dispatch, getStateYap());

      expect(Depolama.yaz).not.toHaveBeenCalled();
      expect(Depolama.hamYaz).toHaveBeenCalledWith(
        '@namaz_akisi/namaz_gun_migrasyon_tamam',
        '1'
      );
      expect(sonuc.payload).toEqual({ yazilanAnahtarSayisi: 0 });
    });

    describe('özel gün / seri ayarı geri yüklenince yeniden planlama (issue #272)', () => {
      beforeEach(() => {
        mockOzelGunDegistiUygula.mockResolvedValue(true);
      });

      it('özel gün kaydı plandaysa TEK yayma noktası çağrılır, cuma/nafile ayrıca kurulmaz', async () => {
        (birlestirmePlaniOlustur as jest.Mock).mockReturnValue({
          ozel_gun_ayarlari: { ozelGunModuAktif: true, aktifOzelGun: null, gecmisKayitlar: [] },
        });

        await calistir(dispatchYap([]), getStateYap());

        expect(mockOzelGunDegistiUygula).toHaveBeenCalledTimes(1);
        // Yayma listesi (konumDegistiUygula) cuma/nafile/gün sonunu zaten kapsar.
        expect(mockNafileGuncelle).not.toHaveBeenCalled();
        expect(mockCamiyeGitGuncelle).not.toHaveBeenCalled();
        expect(mockGunSonuGuncelle).not.toHaveBeenCalled();
      });

      it('seri ayarı plandaysa da yayma çağrılır (gün sonu hatırlatması seri ayarına bağlı)', async () => {
        (birlestirmePlaniOlustur as jest.Mock).mockReturnValue({
          seri_ayarlari: { gunSonuBildirimAktif: false },
        });

        await calistir(dispatchYap([]), getStateYap());

        expect(mockOzelGunDegistiUygula).toHaveBeenCalledTimes(1);
      });

      it('konum yoksa (yayma koşmadı) konumsuz tüketiciler doğrudan tazelenir', async () => {
        mockOzelGunDegistiUygula.mockResolvedValue(false);
        (birlestirmePlaniOlustur as jest.Mock).mockReturnValue({
          ozel_gun_ayarlari: { ozelGunModuAktif: false, aktifOzelGun: null, gecmisKayitlar: [] },
        });

        await calistir(dispatchYap([]), getStateYap());

        expect(mockNafileGuncelle).toHaveBeenCalledTimes(1);
        expect(mockGunSonuGuncelle).toHaveBeenCalledTimes(1);
      });

      it('özel gün/seri ayarı plan DIŞINDAYSA yayma çağrılmaz, eski yol (cuma/nafile) sürer', async () => {
        (birlestirmePlaniOlustur as jest.Mock).mockReturnValue({
          '@namaz_akisi/namaz_gun_2026-06-14': { sabah: true },
        });

        await calistir(dispatchYap([]), getStateYap());

        expect(mockOzelGunDegistiUygula).not.toHaveBeenCalled();
        expect(mockGunSonuGuncelle).not.toHaveBeenCalled();
        expect(mockNafileGuncelle).toHaveBeenCalledTimes(1);
        // "Camide kılacağım" (issue #292): ayarı yüklemek bildirim KURMAZ → açıkça planlanır.
        expect(mockCamiyeGitGuncelle).toHaveBeenCalledTimes(1);
      });
    });
  });
});
