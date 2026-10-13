import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
  sadeGorunumAyarlariniNormalize,
  type SadeGorunumAyarlari,
} from '../../core/sade/sadeGorunum';

/**
 * Sade görünüm ayarı (issue #295).
 *
 * Okuma ASLA reddetmez: bozuk/nesne-dışı kayıt varsayılana (kapalı) düşer
 * (AGENTS.md "sessiz sonsuz spinner" dersi — ana ekran bu ayara bakarak çizilir).
 */
export const LocalSadeGorunumServisi = {
  getAyarlar: async (): Promise<SadeGorunumAyarlari> => {
    try {
      const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SADE_GORUNUM_AYARLARI);
      if (ham == null) return sadeGorunumAyarlariniNormalize(null);
      try {
        return sadeGorunumAyarlariniNormalize(JSON.parse(ham));
      } catch {
        Logger.warn('LocalSadeGorunumServisi', 'Bozuk kayit (JSON), varsayilana donuldu');
        return sadeGorunumAyarlariniNormalize(null);
      }
    } catch (e) {
      Logger.error('LocalSadeGorunumServisi', 'Ayarlar okunamadi:', e);
      return sadeGorunumAyarlariniNormalize(null);
    }
  },

  saveAyarlar: async (ayarlar: SadeGorunumAyarlari): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SADE_GORUNUM_AYARLARI,
        JSON.stringify(sadeGorunumAyarlariniNormalize(ayarlar))
      );
      return true;
    } catch (e) {
      Logger.error('LocalSadeGorunumServisi', 'Ayarlar kaydedilemedi:', e);
      return false;
    }
  },
};
