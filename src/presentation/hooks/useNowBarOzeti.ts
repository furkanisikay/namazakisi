/**
 * Ayarlar satırı için Now Bar özeti (issue #282 ikinci aşama). Android'de daima;
 * iOS'ta yalnız build canlı etkinlik taşıyorsa (#295, widget uzantısı bayrağı)
 * görünür — aynı seçim orada Dinamik Ada / kilit ekranı geri sayımıdır.
 *
 * Slice açılışta yüklenmez (AGENTS.md hidrasyon kuralı) → satır görünürken
 * yüklenmemişse yükletir; yüklenene kadar özet boş kalır (initialState gerçek
 * veri sanılmasın).
 */
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { nowBarAyarlariniYukle } from '../store/nowBarSlice';
import { acikOgeSayisi, NOW_BAR_OGELERI } from '../../core/sayac/nowBar';
import { iosCanliOgesiMi } from '../../core/sayac/iosCanliEtkinlik';
import { canliEtkinlikDestekli } from '../../../modules/expo-siri-kisayollari/src';

export function useNowBarOzeti(): { kullanilabilir: boolean; ozet: string | undefined } {
  const dispatch = useAppDispatch();
  // Savunmalı: dar mock'lanmış store'da dilim olmayabilir.
  const dilim = useAppSelector((s) => (s as { nowBar?: typeof s.nowBar }).nowBar);
  const kullanilabilir = Platform.OS === 'android' || (Platform.OS === 'ios' && canliEtkinlikDestekli());
  const yuklendi = dilim?.yuklendi === true;

  useEffect(() => {
    if (kullanilabilir && dilim && !yuklendi) dispatch(nowBarAyarlariniYukle());
  }, [dispatch, kullanilabilir, dilim, yuklendi]);

  if (!kullanilabilir || !dilim || !yuklendi) return { kullanilabilir, ozet: undefined };
  // iOS'ta desteklenmeyen öğeler (iftar/sahur/seri) sayılmaz: özet ekranla aynı şeyi söylesin.
  const sayi =
    Platform.OS === 'ios'
      ? NOW_BAR_OGELERI.filter((o) => iosCanliOgesiMi(o) && dilim.ayarlar.ogeler[o].acik).length
      : acikOgeSayisi(dilim.ayarlar);
  return { kullanilabilir, ozet: sayi === 0 ? 'Kapalı' : `${sayi} öğe açık` };
}
