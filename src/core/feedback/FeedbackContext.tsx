/**
 * Feedback Context ve Provider
 * Haptik ve ses geri bildirimlerini yonetir
 */

import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HaptikServisi, TitresimTipi } from './HaptikServisi';
import { SesServisi, SesTipi } from './SesServisi';

// AsyncStorage anahtarlari
const FEEDBACK_AYARLARI_ANAHTAR = 'feedback_ayarlari';

// Feedback ayarlari tipi
export interface FeedbackAyarlari {
  titresimAktif: boolean;
  sesAktif: boolean;
}

// Varsayilan ayarlar
const VARSAYILAN_AYARLAR: FeedbackAyarlari = {
  titresimAktif: true,
  sesAktif: true,
};

// Context deger tipi
interface FeedbackContextDeger {
  // Ayarlar
  ayarlar: FeedbackAyarlari;
  // Ayar degistirme
  titresimDurumunuDegistir: (aktif: boolean) => void;
  sesDurumunuDegistir: (aktif: boolean) => void;
  // Feedback fonksiyonlari
  titret: (tip: TitresimTipi) => Promise<void>;
  sesCal: (tip: SesTipi) => Promise<void>;
  // Ozel kombinasyonlar
  namazTamamlandiFeedback: () => Promise<void>;
  tumNamazlarTamamlandiFeedback: () => Promise<void>;
  butonTiklandiFeedback: () => Promise<void>;
  hataFeedback: () => Promise<void>;
  // Yukleniyor
  yukleniyor: boolean;
}

// Default context
const defaultContext: FeedbackContextDeger = {
  ayarlar: VARSAYILAN_AYARLAR,
  titresimDurumunuDegistir: () => {},
  sesDurumunuDegistir: () => {},
  titret: async () => {},
  sesCal: async () => {},
  namazTamamlandiFeedback: async () => {},
  tumNamazlarTamamlandiFeedback: async () => {},
  butonTiklandiFeedback: async () => {},
  hataFeedback: async () => {},
  yukleniyor: true,
};

// Context olustur
export const FeedbackContext = createContext<FeedbackContextDeger>(defaultContext);

// Provider props
interface FeedbackProviderProps {
  children: ReactNode;
}

/**
 * Feedback Provider
 * Haptik ve ses geri bildirimlerini yonetir
 */
export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ children }) => {
  const [ayarlar, setAyarlar] = useState<FeedbackAyarlari>(VARSAYILAN_AYARLAR);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Ayarlari AsyncStorage'dan yukle
  useEffect(() => {
    const ayarlariYukle = async () => {
      try {
        // Ses sistemini hazirla
        await SesServisi.hazirla();

        const kayitliAyarlar = await AsyncStorage.getItem(FEEDBACK_AYARLARI_ANAHTAR);
        if (kayitliAyarlar) {
          setAyarlar(JSON.parse(kayitliAyarlar));
        }
      } catch (hata) {
        console.error('Feedback ayarlari yuklenirken hata:', hata);
      } finally {
        setYukleniyor(false);
      }
    };

    ayarlariYukle();

    // Cleanup
    return () => {
      SesServisi.temizle();
    };
  }, []);

  // Ayarlari kaydet
  const ayarlariKaydet = useCallback(async (yeniAyarlar: FeedbackAyarlari) => {
    try {
      await AsyncStorage.setItem(FEEDBACK_AYARLARI_ANAHTAR, JSON.stringify(yeniAyarlar));
    } catch (hata) {
      console.error('Feedback ayarlari kaydedilirken hata:', hata);
    }
  }, []);

  // Titresim durumunu degistir
  const titresimDurumunuDegistir = useCallback((aktif: boolean) => {
    const yeniAyarlar = { ...ayarlar, titresimAktif: aktif };
    setAyarlar(yeniAyarlar);
    ayarlariKaydet(yeniAyarlar);
  }, [ayarlar, ayarlariKaydet]);

  // Ses durumunu degistir
  const sesDurumunuDegistir = useCallback((aktif: boolean) => {
    const yeniAyarlar = { ...ayarlar, sesAktif: aktif };
    setAyarlar(yeniAyarlar);
    ayarlariKaydet(yeniAyarlar);
  }, [ayarlar, ayarlariKaydet]);

  // Titresim calistir (ayar kontrolu ile)
  const titret = useCallback(async (tip: TitresimTipi) => {
    if (ayarlar.titresimAktif) {
      await HaptikServisi.titret(tip);
    }
  }, [ayarlar.titresimAktif]);

  // Ses calistir (ayar kontrolu ile)
  const sesCal = useCallback(async (tip: SesTipi) => {
    if (ayarlar.sesAktif) {
      await SesServisi.sesCal(tip);
    }
  }, [ayarlar.sesAktif]);

  // Namaz tamamlandi feedback
  const namazTamamlandiFeedback = useCallback(async () => {
    await Promise.all([
      titret('basari'),
      sesCal('basari'),
    ]);
  }, [titret, sesCal]);

  // Tum namazlar tamamlandi feedback
  const tumNamazlarTamamlandiFeedback = useCallback(async () => {
    if (ayarlar.titresimAktif) {
      await HaptikServisi.kutlamaTitresimi();
    }
    await sesCal('kutlama');
  }, [ayarlar.titresimAktif, sesCal]);

  // Buton tiklandi feedback
  const butonTiklandiFeedback = useCallback(async () => {
    await Promise.all([
      titret('hafif'),
      sesCal('tiklama'),
    ]);
  }, [titret, sesCal]);

  // Hata feedback
  const hataFeedback = useCallback(async () => {
    await Promise.all([
      titret('hata'),
      sesCal('hata'),
    ]);
  }, [titret, sesCal]);

  // Context degeri
  const deger = useMemo<FeedbackContextDeger>(() => ({
    ayarlar,
    titresimDurumunuDegistir,
    sesDurumunuDegistir,
    titret,
    sesCal,
    namazTamamlandiFeedback,
    tumNamazlarTamamlandiFeedback,
    butonTiklandiFeedback,
    hataFeedback,
    yukleniyor,
  }), [
    ayarlar,
    titresimDurumunuDegistir,
    sesDurumunuDegistir,
    titret,
    sesCal,
    namazTamamlandiFeedback,
    tumNamazlarTamamlandiFeedback,
    butonTiklandiFeedback,
    hataFeedback,
    yukleniyor,
  ]);

  return (
    <FeedbackContext.Provider value={deger}>
      {children}
    </FeedbackContext.Provider>
  );
};

/**
 * Feedback hook'u
 */
export const useFeedback = () => {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback hook\'u FeedbackProvider icinde kullanilmalidir');
  }

  return context;
};

