/**
 * Özel gün değişikliği → hatırlatmalar HEMEN yeniden planlanır (issue #272).
 * Liste ikinci kez yazılmaz: tek yayma noktası `konumDegistiUygula` çağrılır.
 */
const mockKonumDegistiUygula = jest.fn();
const mockOzelGunDurumunuYukle = jest.fn();

jest.mock('../KonumDegisikligiServisi', () => ({
  konumDegistiUygula: (...a: unknown[]) => mockKonumDegistiUygula(...a),
}));
jest.mock('../NamazMuhafiziServisi', () => ({
  NamazMuhafiziServisi: {
    getInstance: () => ({ ozelGunDurumunuYukle: () => mockOzelGunDurumunuYukle() }),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ozelGunDegistiUygula } from '../OzelGunDegisikligiServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

describe('ozelGunDegistiUygula', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockKonumDegistiUygula.mockResolvedValue(undefined);
    mockOzelGunDurumunuYukle.mockResolvedValue(undefined);
    await AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
  });

  test('ön plan kapısını tazeler ve TÜM tüketicileri mevcut konumla yeniden planlar', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI,
      JSON.stringify({ koordinatlar: { lat: 39.9, lng: 41.27 } })
    );

    await ozelGunDegistiUygula();

    expect(mockOzelGunDurumunuYukle).toHaveBeenCalledTimes(1);
    expect(mockKonumDegistiUygula).toHaveBeenCalledWith({ lat: 39.9, lng: 41.27 });
  });

  test('konum yoksa yeniden planlama atlanır ama ön plan kapısı yine tazelenir', async () => {
    await ozelGunDegistiUygula();

    expect(mockOzelGunDurumunuYukle).toHaveBeenCalledTimes(1);
    expect(mockKonumDegistiUygula).not.toHaveBeenCalled();
  });

  test('ASLA fırlatmaz: ön plan ve yayma hataları yutulur', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI,
      JSON.stringify({ koordinatlar: { lat: 41, lng: 29 } })
    );
    mockOzelGunDurumunuYukle.mockRejectedValue(new Error('x'));
    mockKonumDegistiUygula.mockRejectedValue(new Error('y'));

    await expect(ozelGunDegistiUygula()).resolves.toBeUndefined();
    // Ön planın hatası yaymayı ENGELLEMEMELİ.
    expect(mockKonumDegistiUygula).toHaveBeenCalled();
  });
});
