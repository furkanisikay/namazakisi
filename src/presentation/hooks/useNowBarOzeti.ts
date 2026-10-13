/**
 * Ayarlar satırı için Now Bar özeti (issue #282 ikinci aşama). Yalnız Android:
 * iOS'ta sayaç bildirimi ve Live Update yoktur → satır çizilmez.
 *
 * Slice açılışta yüklenmez (AGENTS.md hidrasyon kuralı) → satır görünürken
 * yüklenmemişse yükletir; yüklenene kadar özet boş kalır (initialState gerçek
 * veri sanılmasın).
 */
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { nowBarAyarlariniYukle } from '../store/nowBarSlice';
import { acikOgeSayisi } from '../../core/sayac/nowBar';

export function useNowBarOzeti(): { kullanilabilir: boolean; ozet: string | undefined } {
  const dispatch = useAppDispatch();
  // Savunmalı: dar mock'lanmış store'da dilim olmayabilir.
  const dilim = useAppSelector((s) => (s as { nowBar?: typeof s.nowBar }).nowBar);
  const kullanilabilir = Platform.OS === 'android';
  const yuklendi = dilim?.yuklendi === true;

  useEffect(() => {
    if (kullanilabilir && dilim && !yuklendi) dispatch(nowBarAyarlariniYukle());
  }, [dispatch, kullanilabilir, dilim, yuklendi]);

  if (!kullanilabilir || !dilim || !yuklendi) return { kullanilabilir, ozet: undefined };
  const sayi = acikOgeSayisi(dilim.ayarlar);
  return { kullanilabilir, ozet: sayi === 0 ? 'Kapalı' : `${sayi} öğe açık` };
}
