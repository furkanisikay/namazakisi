/**
 * Haptik (titresim) geri bildirim servisi
 * Kullanici etkilesimlerinde titresim saglar
 */

import * as Haptics from 'expo-haptics';

/**
 * Titresim tipleri
 */
export type TitresimTipi = 'hafif' | 'orta' | 'guclu' | 'basari' | 'uyari' | 'hata' | 'secim';

/**
 * Haptik servisi
 * Titresim fonksiyonlarini icerir
 */
export const HaptikServisi = {
  /**
   * Hafif titresim - buton tiklama
   */
  hafifTitresim: async (): Promise<void> => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (hata) {
      console.warn('Hafif titresim hatasi:', hata);
    }
  },

  /**
   * Orta titresim - islem tamamlama
   */
  ortaTitresim: async (): Promise<void> => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (hata) {
      console.warn('Orta titresim hatasi:', hata);
    }
  },

  /**
   * Guclu titresim - onemli bildirimler
   */
  gucluTitresim: async (): Promise<void> => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (hata) {
      console.warn('Guclu titresim hatasi:', hata);
    }
  },

  /**
   * Basari titresimi - olumlu sonuclar
   */
  basariTitresimi: async (): Promise<void> => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (hata) {
      console.warn('Basari titresimi hatasi:', hata);
    }
  },

  /**
   * Uyari titresimi
   */
  uyariTitresimi: async (): Promise<void> => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (hata) {
      console.warn('Uyari titresimi hatasi:', hata);
    }
  },

  /**
   * Hata titresimi - olumsuz sonuclar
   */
  hataTitresimi: async (): Promise<void> => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (hata) {
      console.warn('Hata titresimi hatasi:', hata);
    }
  },

  /**
   * Secim titresimi - menu, liste secimi
   */
  secimTitresimi: async (): Promise<void> => {
    try {
      await Haptics.selectionAsync();
    } catch (hata) {
      console.warn('Secim titresimi hatasi:', hata);
    }
  },

  /**
   * Ozel titresim deseni - kutlama icin
   */
  kutlamaTitresimi: async (): Promise<void> => {
    try {
      // Ardisik titresimler ile kutlama hissi
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 150));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (hata) {
      console.warn('Kutlama titresimi hatasi:', hata);
    }
  },

  /**
   * Tip bazli titresim
   */
  titret: async (tip: TitresimTipi): Promise<void> => {
    switch (tip) {
      case 'hafif':
        return HaptikServisi.hafifTitresim();
      case 'orta':
        return HaptikServisi.ortaTitresim();
      case 'guclu':
        return HaptikServisi.gucluTitresim();
      case 'basari':
        return HaptikServisi.basariTitresimi();
      case 'uyari':
        return HaptikServisi.uyariTitresimi();
      case 'hata':
        return HaptikServisi.hataTitresimi();
      case 'secim':
        return HaptikServisi.secimTitresimi();
      default:
        return HaptikServisi.hafifTitresim();
    }
  },
};

