import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
  bosKazaOneriKaydi,
  kazaOneriAyarlariniNormalize,
  kazaOneriKaydiniNormalize,
  type KazaOneriAyarlari,
  type KazaOneriKaydi,
} from '../../core/kaza/farzSonrasiKazaOnerisi';

/**
 * "Her farzla bir kaza" önerisi (issue #294) — ayar + sorulma hafızası.
 *
 * Okuma ASLA reddetmez (AGENTS.md "kaza yükleme dayanıklılığı"): bozuk kayıt
 * varsayılana / boş güne düşer. Store'suzdur: karar anında doğrudan diskten
 * okunur, böylece ana ekran kaza slice'ının hidrasyonuna bağlı kalmaz
 * (`initialState`'i gerçek veri sanma tuzağı).
 */
export const LocalKazaOneriServisi = {
  ayarlariGetir: async (): Promise<KazaOneriAyarlari> => {
    try {
      const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI);
      if (ham == null) return kazaOneriAyarlariniNormalize(null);
      try {
        return kazaOneriAyarlariniNormalize(JSON.parse(ham));
      } catch {
        Logger.warn('LocalKazaOneriServisi', 'Bozuk ayar kaydi (JSON), varsayilana donuldu');
        return kazaOneriAyarlariniNormalize(null);
      }
    } catch (e) {
      Logger.error('LocalKazaOneriServisi', 'Ayar okunamadi:', e);
      return kazaOneriAyarlariniNormalize(null);
    }
  },

  ayarlariKaydet: async (ayarlar: KazaOneriAyarlari): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI,
        JSON.stringify(kazaOneriAyarlariniNormalize(ayarlar))
      );
      return true;
    } catch (e) {
      Logger.error('LocalKazaOneriServisi', 'Ayar kaydedilemedi:', e);
      return false;
    }
  },

  /** Verilen günün kaydı (başka güne aitse boş). */
  kaydiGetir: async (tarih: string): Promise<KazaOneriKaydi> => {
    try {
      const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KAZA_ONERI_KAYDI);
      if (ham == null) return bosKazaOneriKaydi(tarih);
      try {
        return kazaOneriKaydiniNormalize(JSON.parse(ham), tarih);
      } catch {
        return bosKazaOneriKaydi(tarih);
      }
    } catch (e) {
      Logger.error('LocalKazaOneriServisi', 'Kayit okunamadi:', e);
      return bosKazaOneriKaydi(tarih);
    }
  },

  kaydiYaz: async (kayit: KazaOneriKaydi): Promise<void> => {
    try {
      await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.KAZA_ONERI_KAYDI, JSON.stringify(kayit));
    } catch (e) {
      // Hafıza yazılamazsa en kötü ihtimalle soru bir kez daha sorulur; akışı kesme.
      Logger.warn('LocalKazaOneriServisi', 'Kayit yazilamadi:', e);
    }
  },
};
