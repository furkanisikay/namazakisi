import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { nowBarAyarlariniNormalize, type NowBarAyarlari } from '../../core/sayac/nowBar';

/**
 * Now Bar ve canlı sayaçlar seçimi (issue #282 ikinci aşama).
 *
 * Okuma ASLA reddetmez: bozuk/nesne-dışı kayıt varsayılana (= ilk aşamanın
 * davranışı) düşer, eksik öğe varsayılandan tamamlanır (`LocalNafileServisi`
 * deseni; AGENTS.md "sessiz sonsuz spinner" dersi). Store'suzdur: arka plan
 * görevinde ve sayaç servislerinde Redux yoktur.
 */
export const LocalNowBarServisi = {
  getAyarlar: async (): Promise<NowBarAyarlari> => {
    try {
      const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.NOW_BAR_AYARLARI);
      if (ham == null) return nowBarAyarlariniNormalize(null);
      try {
        return nowBarAyarlariniNormalize(JSON.parse(ham));
      } catch {
        Logger.warn('LocalNowBarServisi', 'Bozuk kayit (JSON), varsayilana donuldu');
        return nowBarAyarlariniNormalize(null);
      }
    } catch (e) {
      Logger.error('LocalNowBarServisi', 'Ayarlar okunamadi:', e);
      return nowBarAyarlariniNormalize(null);
    }
  },

  saveAyarlar: async (ayarlar: NowBarAyarlari): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.NOW_BAR_AYARLARI,
        JSON.stringify(nowBarAyarlariniNormalize(ayarlar))
      );
      return true;
    } catch (e) {
      Logger.error('LocalNowBarServisi', 'Ayarlar kaydedilemedi:', e);
      return false;
    }
  },
};
