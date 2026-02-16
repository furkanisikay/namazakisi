/**
 * Ses efektleri servisi
 * Kullanici etkilesimlerinde ses geri bildirimi
 */

import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { Logger } from '../utils/Logger';

/**
 * Ses tipleri
 */
export type SesTipi = 'tiklama' | 'basari' | 'tamamlandi' | 'kutlama' | 'hata' | 'bildirim';

// Ses dosyalari etkin mi
const SES_ETKIN = true;

// Yuklu ses dosyalari cache
const yukluSesler: Map<SesTipi, AudioPlayer> = new Map();

/**
 * Ses dosyasi kaynaklari
 */
const SES_DOSYALARI: Record<SesTipi, any> = {
  tiklama: require('../../../assets/sounds/tiklama.mp3'),
  basari: require('../../../assets/sounds/basari.mp3'),
  tamamlandi: require('../../../assets/sounds/tamamlandi.mp3'),
  kutlama: require('../../../assets/sounds/kutlama.mp3'),
  hata: require('../../../assets/sounds/hata.mp3'),
  bildirim: require('../../../assets/sounds/bildirim.mp3'),
};

/**
 * Ses dosyasini yukle ve cache'e ekle
 */
const sesDosyasiniYukle = (sesTipi: SesTipi): AudioPlayer | undefined => {
  try {
    const player = createAudioPlayer(SES_DOSYALARI[sesTipi]);
    yukluSesler.set(sesTipi, player);
    return player;
  } catch (hata) {
    Logger.debug('SesServisi', `Ses dosyasi yuklenemedi (${sesTipi}):`, hata);
    return undefined;
  }
};

/**
 * Guvenli ses calistirma
 */
const guvenliSesCal = async (sesTipi: SesTipi, volume: number = 0.5): Promise<void> => {
  // Ses devre disi ise cik
  if (!SES_ETKIN) return;

  try {
    // Cache'den kontrol et
    let player = yukluSesler.get(sesTipi);

    if (!player) {
      player = sesDosyasiniYukle(sesTipi);
    }

    if (player) {
      // Ses zaten oynatılıyorsa başa sar
      if (player.playing) {
        player.pause();
        player.seekTo(0);
      }
      player.volume = volume;
      player.play();
    }

  } catch (hata) {
    // Ses calinamazsa sessizce devam et
    Logger.debug('SesServisi', `Ses calinamadi (${sesTipi}):`, hata);
  }
};

/**
 * Ses servisi
 * Ses efekti fonksiyonlarini icerir
 */
export const SesServisi = {
  /**
   * Ses sistemini hazirla
   */
  hazirla: async (): Promise<void> => {
    if (!SES_ETKIN) return;

    try {
      // Android'de interruptionMode string casting hatası nedeniyle 
      // şimdilik sadece temel ayarları yapıyoruz
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });
    } catch (hata) {
      Logger.warn('SesServisi', 'Ses sistemi hazirlama hatasi:', hata);
    }
  },

  /**
   * Tiklama sesi - buton, kart tiklamalari
   */
  tiklamaSesiCal: async (): Promise<void> => {
    await guvenliSesCal('tiklama', 0.3);
  },

  /**
   * Basari sesi - tek namaz tamamlama
   */
  basariSesiCal: async (): Promise<void> => {
    await guvenliSesCal('basari', 0.5);
  },

  /**
   * Tamamlandi sesi - islem tamamlandi
   */
  tamamlandiSesiCal: async (): Promise<void> => {
    await guvenliSesCal('tamamlandi', 0.5);
  },

  /**
   * Kutlama sesi - tum namazlar tamamlandi
   */
  kutlamaSesiCal: async (): Promise<void> => {
    await guvenliSesCal('kutlama', 0.7);
  },

  /**
   * Hata sesi
   */
  hataSesiCal: async (): Promise<void> => {
    await guvenliSesCal('hata', 0.4);
  },

  /**
   * Bildirim sesi
   */
  bildirimSesiCal: async (): Promise<void> => {
    await guvenliSesCal('bildirim', 0.5);
  },

  /**
   * Tip bazli ses cal
   */
  sesCal: async (tip: SesTipi): Promise<void> => {
    switch (tip) {
      case 'tiklama':
        return SesServisi.tiklamaSesiCal();
      case 'basari':
        return SesServisi.basariSesiCal();
      case 'tamamlandi':
        return SesServisi.tamamlandiSesiCal();
      case 'kutlama':
        return SesServisi.kutlamaSesiCal();
      case 'hata':
        return SesServisi.hataSesiCal();
      case 'bildirim':
        return SesServisi.bildirimSesiCal();
      default:
        return;
    }
  },

  /**
   * Seslerin etkin olup olmadigini kontrol et
   */
  seslerEtkinMi: (): boolean => {
    return SES_ETKIN;
  },

  /**
   * Tum sesleri temizle
   */
  temizle: async (): Promise<void> => {
    for (const player of yukluSesler.values()) {
      try {
        player.release();
      } catch (e) {
        // Sessizce devam
      }
    }
    yukluSesler.clear();
  },
};
