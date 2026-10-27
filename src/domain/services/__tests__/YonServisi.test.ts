/**
 * Yazı yönü: etkin dilin yönü native'e yazılır (soldan sağa dilde allowRTL(false) — cihaz dili
 * Arapça telefonda Türkçe arayüz aynalanmasın), çizilen yön farklıysa açılışta en fazla 2 kez
 * sessizce yeniden başlatılır (sayaç DİSKTE; sonsuz döngü yok).
 */
const disk: Record<string, unknown> = {};
jest.mock('../../../data/local/Depolama', () => ({
  Depolama: {
    oku: jest.fn(async (k: string) => disk[k] ?? null),
    yaz: jest.fn(async (k: string, v: unknown) => {
      disk[k] = v;
    }),
    sil: jest.fn(async (k: string) => {
      delete disk[k];
    }),
    guncelle: jest.fn(async (k: string, f: (m: unknown) => unknown) => {
      disk[k] = f(disk[k] ?? null);
      return disk[k];
    }),
  },
}));
jest.mock('../../../core/utils/Logger', () => ({ Logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() } }));
const mockYenidenBaslat = jest.fn(() => Promise.resolve(true));
jest.mock('../../../../modules/expo-sistem-durumu/src', () => ({ yenidenBaslat: () => mockYenidenBaslat() }));

import { I18nManager } from 'react-native';
import { YonServisi, YON_AZAMI_DENEME } from '../YonServisi';
import { aktifDiliKur, aktifDilSifirla } from '../../../core/dil/aktifDil';
import { sagdanSolaMi } from '../../../core/dil/yon';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const ANAHTAR = DEPOLAMA_ANAHTARLARI.YON_DENEMESI;

describe('YonServisi', () => {
  let allow: jest.SpyInstance;
  let force: jest.SpyInstance;
  beforeEach(() => {
    for (const k of Object.keys(disk)) delete disk[k];
    aktifDilSifirla();
    mockYenidenBaslat.mockReset().mockResolvedValue(true);
    allow = jest.spyOn(I18nManager, 'allowRTL');
    force = jest.spyOn(I18nManager, 'forceRTL');
  });
  afterEach(() => jest.restoreAllMocks());

  it('saf çekirdek: yön DILLER kaydından', () => {
    expect(sagdanSolaMi('ar')).toBe(true);
    expect(sagdanSolaMi('ur')).toBe(true);
    expect(sagdanSolaMi('tr')).toBe(false);
    expect(sagdanSolaMi('xx')).toBe(false);
  });

  it('soldan sağa dilde allowRTL(false) + forceRTL(false) yazılır (cihaz dili RTL olsa da ayna yok)', () => {
    expect(YonServisi.uygula()).toBe(false);
    expect(allow).toHaveBeenCalledWith(false);
    expect(force).toHaveBeenCalledWith(false);
  });

  it('sağdan sola dilde allowRTL(true) + forceRTL(true) yazılır', () => {
    aktifDiliKur('ar');
    expect(YonServisi.uygula()).toBe(true);
    expect(allow).toHaveBeenCalledWith(true);
    expect(force).toHaveBeenCalledWith(true);
  });

  it('bekliyorMu = çizilen yön (I18nManager.isRTL) ≠ istenen', () => {
    jest.replaceProperty(I18nManager, 'isRTL', false);
    expect(YonServisi.bekliyorMu()).toBe(false);
    aktifDiliKur('ar');
    expect(YonServisi.bekliyorMu()).toBe(true);
    jest.replaceProperty(I18nManager, 'isRTL', true);
    expect(YonServisi.bekliyorMu()).toBe(false);
    aktifDiliKur('tr');
    expect(YonServisi.bekliyorMu()).toBe(true);
  });

  it('yenidenBaslat native köprünün sonucunu döner; köprü fırlatırsa false', async () => {
    expect(await YonServisi.yenidenBaslat()).toBe(true);
    mockYenidenBaslat.mockRejectedValueOnce(new Error('yok'));
    expect(await YonServisi.yenidenBaslat()).toBe(false);
  });

  describe('açılış kapısı (deneme sayacı diskte)', () => {
    it('yön eşleşiyorsa yeniden başlatmaz ve sayacı siler', async () => {
      jest.replaceProperty(I18nManager, 'isRTL', false);
      disk[ANAHTAR] = 1;
      expect(await YonServisi.acilistaDenetle()).toBe('hazir');
      expect(mockYenidenBaslat).not.toHaveBeenCalled();
      expect(disk[ANAHTAR]).toBeUndefined();
      expect(allow).toHaveBeenCalledWith(false);
    });

    it('cihaz dili Arapça telefonda Türkçe arayüz aynalanmışsa sessizce yeniden başlatır; sayaç ÖNCE yazılır', async () => {
      jest.replaceProperty(I18nManager, 'isRTL', true);
      mockYenidenBaslat.mockImplementation(async () => {
        // Yeniden yükleme JS'i öldürür: sayaç bu anda diskte olmalı.
        expect(disk[ANAHTAR]).toBe(1);
        return true;
      });
      expect(await YonServisi.acilistaDenetle()).toBe('yenidenBaslatiliyor');
      expect(mockYenidenBaslat).toHaveBeenCalledTimes(1);
    });

    it(`NÖBETÇİ: en fazla ${YON_AZAMI_DENEME} deneme; tükenince yalnız loglanır, açılış sürer (sonsuz döngü yok)`, async () => {
      jest.replaceProperty(I18nManager, 'isRTL', true);
      // Her "yeniden başlatma"da JS belleği sıfırlanır; yalnız disk kalır.
      for (let i = 1; i <= YON_AZAMI_DENEME; i++) {
        expect(await YonServisi.acilistaDenetle()).toBe('yenidenBaslatiliyor');
      }
      expect(await YonServisi.acilistaDenetle()).toBe('hazir');
      expect(await YonServisi.acilistaDenetle()).toBe('hazir');
      expect(mockYenidenBaslat).toHaveBeenCalledTimes(YON_AZAMI_DENEME);
      // Tükenmiş sayaç her açılışta büyümez.
      expect(disk[ANAHTAR]).toBe(YON_AZAMI_DENEME + 1);
    });

    it('yön sonunda eşleşince sayaç sıfırlanır (sonraki uyuşmazlıkta yine 2 hak)', async () => {
      jest.replaceProperty(I18nManager, 'isRTL', true);
      await YonServisi.acilistaDenetle();
      jest.replaceProperty(I18nManager, 'isRTL', false);
      await YonServisi.acilistaDenetle();
      expect(disk[ANAHTAR]).toBeUndefined();
    });

    it('yeniden başlatılamazsa (köprü yok) açılış sürer', async () => {
      jest.replaceProperty(I18nManager, 'isRTL', true);
      mockYenidenBaslat.mockResolvedValue(false);
      expect(await YonServisi.acilistaDenetle()).toBe('hazir');
    });

    it('sayaç yazılamazsa yeniden BAŞLATMAZ (döngü riski)', async () => {
      jest.replaceProperty(I18nManager, 'isRTL', true);
      const { Depolama } = jest.requireMock('../../../data/local/Depolama') as { Depolama: { guncelle: jest.Mock } };
      Depolama.guncelle.mockRejectedValueOnce(new Error('disk'));
      expect(await YonServisi.acilistaDenetle()).toBe('hazir');
      expect(mockYenidenBaslat).not.toHaveBeenCalled();
    });
  });
});
