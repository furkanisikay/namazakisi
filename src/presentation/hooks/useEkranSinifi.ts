/**
 * Pencerenin boyut sınıfı (kompakt / orta / geniş) — katlanabilir ve tablet
 * düzeninin tek kapısı (issue #283).
 *
 * `useWindowDimensions` katla/aç, döndürme ve bölünmüş ekranda yeniden çizim
 * tetikler. Android'de `MainActivity` `configChanges` sayesinde bu
 * değişimlerde YENİDEN YARATILMAZ: pager ve geri sayım durumu korunurken düzen
 * yeni genişliğe göre kurulur. Kırılım mantığı saftır: `core/utils/ekranSinifi.ts`.
 */
import { useWindowDimensions } from 'react-native';

import { ekranSinifiHesapla, type EkranSinifi } from '../../core/utils/ekranSinifi';

export function useEkranSinifi(): EkranSinifi {
  const { width } = useWindowDimensions();
  return ekranSinifiHesapla(width);
}
