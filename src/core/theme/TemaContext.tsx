/**
 * Tema Context ve Provider
 * Uygulama genelinde tema yonetimi
 */

import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Tema,
  RenkPaleti,
  TemaModu,
  TemaTercihleri,
  ACIK_TEMA,
  KOYU_TEMA,
  RENK_PALETLERI,
  VARSAYILAN_TERCIHLER,
  VARSAYILAN_PALET_ID,
} from './temalar';

// AsyncStorage anahtari
const TEMA_TERCIHLERI_ANAHTAR = 'tema_tercihleri';

// Context deger tipi
interface TemaContextDeger {
  // Mevcut tema (acik veya koyu)
  tema: Tema;
  // Secili renk paleti
  palet: RenkPaleti;
  // Tema modu (sistem/acik/koyu)
  mod: TemaModu;
  // Koyu tema aktif mi?
  koyuMu: boolean;
  // Tum paletler
  tumPaletler: RenkPaleti[];
  // Mod degistirme fonksiyonu
  moduDegistir: (yeniMod: TemaModu) => void;
  // Palet degistirme fonksiyonu
  paletiDegistir: (paletId: string) => void;
  // Yukleniyor durumu
  yukleniyor: boolean;
}

// Default context degeri
const defaultContext: TemaContextDeger = {
  tema: ACIK_TEMA,
  palet: RENK_PALETLERI[0],
  mod: 'sistem',
  koyuMu: false,
  tumPaletler: RENK_PALETLERI,
  moduDegistir: () => {},
  paletiDegistir: () => {},
  yukleniyor: true,
};

// Context olustur
export const TemaContext = createContext<TemaContextDeger>(defaultContext);

// Provider props
interface TemaProviderProps {
  children: ReactNode;
}

/**
 * Tema Provider
 * Tema yonetimi ve AsyncStorage senkronizasyonu
 */
export const TemaProvider: React.FC<TemaProviderProps> = ({ children }) => {
  const sistemTemas = useColorScheme();
  const [tercihler, setTercihler] = useState<TemaTercihleri>(VARSAYILAN_TERCIHLER);
  const [yukleniyor, setYukleniyor] = useState(true);

  // AsyncStorage'dan tercihleri yukle
  useEffect(() => {
    const tercihleriYukle = async () => {
      try {
        const kayitliTercihler = await AsyncStorage.getItem(TEMA_TERCIHLERI_ANAHTAR);
        if (kayitliTercihler) {
          const parse = JSON.parse(kayitliTercihler) as TemaTercihleri;
          setTercihler(parse);
        }
      } catch (hata) {
        console.error('Tema tercihleri yuklenirken hata:', hata);
      } finally {
        setYukleniyor(false);
      }
    };

    tercihleriYukle();
  }, []);

  // Tercihleri AsyncStorage'a kaydet
  const tercihleriKaydet = useCallback(async (yeniTercihler: TemaTercihleri) => {
    try {
      await AsyncStorage.setItem(TEMA_TERCIHLERI_ANAHTAR, JSON.stringify(yeniTercihler));
    } catch (hata) {
      console.error('Tema tercihleri kaydedilirken hata:', hata);
    }
  }, []);

  // Koyu tema aktif mi hesapla
  const koyuMu = useMemo(() => {
    if (tercihler.mod === 'sistem') {
      return sistemTemas === 'dark';
    }
    return tercihler.mod === 'koyu';
  }, [tercihler.mod, sistemTemas]);

  // Mevcut tema
  const tema = useMemo(() => {
    return koyuMu ? KOYU_TEMA : ACIK_TEMA;
  }, [koyuMu]);

  // Mevcut palet
  const palet = useMemo(() => {
    const bulunan = RENK_PALETLERI.find(p => p.id === tercihler.paletId);
    return bulunan || RENK_PALETLERI[0];
  }, [tercihler.paletId]);

  // Mod degistirme
  const moduDegistir = useCallback((yeniMod: TemaModu) => {
    const yeniTercihler = { ...tercihler, mod: yeniMod };
    setTercihler(yeniTercihler);
    tercihleriKaydet(yeniTercihler);
  }, [tercihler, tercihleriKaydet]);

  // Palet degistirme
  const paletiDegistir = useCallback((paletId: string) => {
    const yeniTercihler = { ...tercihler, paletId };
    setTercihler(yeniTercihler);
    tercihleriKaydet(yeniTercihler);
  }, [tercihler, tercihleriKaydet]);

  // Context degeri
  const deger = useMemo<TemaContextDeger>(() => ({
    tema,
    palet,
    mod: tercihler.mod,
    koyuMu,
    tumPaletler: RENK_PALETLERI,
    moduDegistir,
    paletiDegistir,
    yukleniyor,
  }), [tema, palet, tercihler.mod, koyuMu, moduDegistir, paletiDegistir, yukleniyor]);

  return (
    <TemaContext.Provider value={deger}>
      {children}
    </TemaContext.Provider>
  );
};

