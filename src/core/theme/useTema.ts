/**
 * Tema hook'u
 * Tema context'ine kolay erisim
 */

import { useContext, useMemo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { TemaContext } from './TemaContext';

/**
 * Tema hook'u
 * @returns Tema context degerleri ve yardimci fonksiyonlar
 */
export const useTema = () => {
  const context = useContext(TemaContext);

  if (!context) {
    throw new Error('useTema hook\'u TemaProvider icinde kullanilmalidir');
  }

  return context;
};

/**
 * Stil olusturma hook'u
 * Tema degerlerine gore dinamik stiller olusturur
 * NOT: stilOlusturucu fonksiyonu useCallback ile sarmalanmali
 */
export const useTemaliStiller = <T extends StyleSheet.NamedStyles<T>>(
  stilOlusturucu: (tema: ReturnType<typeof useTema>) => T
): T => {
  const temaContext = useTema();

  // stilOlusturucu dependency'den cikarildi cunku her renderda yeni referans olusturur
  // Bu sekilde sadece tema degistiginde stiller yeniden hesaplanir
  const stiller = useMemo(() => {
    return StyleSheet.create(stilOlusturucu(temaContext));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temaContext]);

  return stiller;
};

/**
 * Renk hook'u
 * Kolay renk erisimi icin
 */
export const useRenkler = () => {
  const { tema, palet } = useTema();

  return useMemo(() => ({
    // Tema renkleri
    arkaplan: tema.renkler.arkaplan,
    kartArkaplan: tema.renkler.kartArkaplan,
    metin: tema.renkler.metin,
    metinIkincil: tema.renkler.metinIkincil,
    sinir: tema.renkler.sinir,
    // Durum renkleri (düz erişim için)
    basarili: tema.renkler.durum.basarili,
    uyari: tema.renkler.durum.uyari,
    hata: tema.renkler.durum.hata,
    bilgi: tema.renkler.durum.bilgi,
    // Durum renkleri (iç içe erişim için: renkler.durum.hata)
    durum: tema.renkler.durum,
    // Palet renkleri
    birincil: palet.birincil,
    birincilKoyu: palet.birincilKoyu,
    birincilAcik: palet.birincilAcik,
    vurgu: palet.vurgu,
  }), [tema, palet]);
};

