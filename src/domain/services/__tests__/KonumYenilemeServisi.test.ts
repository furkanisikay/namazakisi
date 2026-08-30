/**
 * KonumYenilemeServisi — kullanıcı tetikli "şu anki konumu al" yolu.
 *
 * Kritik sözleşmeler:
 *  - İzin İSTEMEZ, yalnız sorar (Prominent Disclosure metni Konum Ayarları'nda).
 *  - Yazma/yayma işini KENDİ yapmaz: `yeniKonumuUygula`dan geçer ki konuma bağlı
 *    tüketici listesi ikinci bir yerde yaşamasın.
 *  - Elle yenilemede mesafe eşiği YOKTUR (0) — kullanıcı butona bastıysa günceli ister.
 */

import * as Location from 'expo-location';
import { konumuYenile } from '../KonumYenilemeServisi';
import { KonumTakipServisi, yeniKonumuUygula } from '../KonumTakipServisi';

jest.mock('../KonumTakipServisi', () => ({
  yeniKonumuUygula: jest.fn(),
  KonumTakipServisi: {
    getInstance: jest.fn(),
  },
}));

const mockYeniKonumuUygula = yeniKonumuUygula as jest.Mock;
const mockGetInstance = KonumTakipServisi.getInstance as unknown as jest.Mock;
const mockIzinDurumu = Location.getForegroundPermissionsAsync as unknown as jest.Mock;
const mockKonumAl = Location.getCurrentPositionAsync as unknown as jest.Mock;

describe('konumuYenile', () => {
  let takipAktifMi: jest.Mock;
  let takipYenidenBaslat: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIzinDurumu.mockResolvedValue({ status: 'granted' });
    mockKonumAl.mockResolvedValue({ coords: { latitude: 40.21, longitude: 28.86 } });
    mockYeniKonumuUygula.mockResolvedValue(true);

    takipAktifMi = jest.fn().mockResolvedValue(false);
    takipYenidenBaslat = jest.fn().mockResolvedValue(true);
    mockGetInstance.mockReturnValue({
      aktifMi: takipAktifMi,
      yenidenBaslat: takipYenidenBaslat,
    });
  });

  test('izin varsa taze konumu alır, uygular ve koordinatı döner', async () => {
    const sonuc = await konumuYenile();

    expect(sonuc).toEqual({ durum: 'basarili', koordinatlar: { lat: 40.21, lng: 28.86 } });
    expect(mockYeniKonumuUygula).toHaveBeenCalledWith(40.21, 28.86, 0);
  });

  test('mesafe eşiği 0 geçilir: birkaç yüz metrelik değişimde bile günceller', async () => {
    await konumuYenile();

    // Otomatik yolda eşik pil koruması içindir; ELLE yenilemede "her zaman uygula".
    const [, , esik] = mockYeniKonumuUygula.mock.calls[0];
    expect(esik).toBe(0);
  });

  test('izin YOKSA izin İSTEMEZ, konum bile almaz', async () => {
    mockIzinDurumu.mockResolvedValue({ status: 'denied' });

    const sonuc = await konumuYenile();

    expect(sonuc).toEqual({ durum: 'izinYok' });
    expect(mockKonumAl).not.toHaveBeenCalled();
    expect(mockYeniKonumuUygula).not.toHaveBeenCalled();
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  test('GPS sabitlemesi alınamazsa konumAlinamadi döner (çökmez)', async () => {
    mockKonumAl.mockRejectedValue(new Error('konum servisi kapalı'));

    await expect(konumuYenile()).resolves.toEqual({ durum: 'konumAlinamadi' });
    expect(mockYeniKonumuUygula).not.toHaveBeenCalled();
  });

  test('yazma reddedilirse (ör. mod otomatik değil) uygulanamadi döner', async () => {
    mockYeniKonumuUygula.mockResolvedValue(false);

    await expect(konumuYenile()).resolves.toEqual({ durum: 'uygulanamadi' });
  });

  test('takip AÇIKSA bölge de taze konuma taşınır', async () => {
    takipAktifMi.mockResolvedValue(true);

    await konumuYenile();

    expect(takipYenidenBaslat).toHaveBeenCalledTimes(1);
  });

  test('takip KAPALIYSA bölgeye dokunulmaz', async () => {
    takipAktifMi.mockResolvedValue(false);

    await konumuYenile();

    expect(takipYenidenBaslat).not.toHaveBeenCalled();
  });

  test('bölge yeniden merkezlenemese bile sonuç BAŞARILIDIR (konum güncellendi)', async () => {
    takipAktifMi.mockResolvedValue(true);
    takipYenidenBaslat.mockRejectedValue(new Error('geofence yok'));

    const sonuc = await konumuYenile();

    expect(sonuc.durum).toBe('basarili');
  });

  test('izin durumu okunamazsa izinYok kabul edilir (sessiz çökme yok)', async () => {
    mockIzinDurumu.mockRejectedValue(new Error('bilinmeyen'));

    await expect(konumuYenile()).resolves.toEqual({ durum: 'izinYok' });
  });
});
