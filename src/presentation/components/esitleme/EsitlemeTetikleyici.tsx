/**
 * Cihazlar arası eşitleme (issue #288) — ön plan tetikleyicisi (görünmez).
 *
 * Açılışta (arayüz etkileşimleri bittikten sonra) ve uygulama öne geldiğinde en çok
 * 15 dk'da bir tur koşar. Eşitleme kapalıysa tur tek disk okumasıyla biter; hiçbir
 * sağlayıcı yapılandırılmamışsa hiçbir şey yapılmaz. Ağ yoksa sessizdir (kullanıcıya
 * yalnız ayar sayfasında "son deneme" olarak görünür). Arka plan turu
 * `ArkaplanGorevServisi`'ndedir.
 */

import { useEffect, useRef } from 'react';
import { AppState, InteractionManager } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { kullanilabilirSaglayicilar } from '../../../domain/services/esitlemeSaglayicilari';
import { onPlandaEsitle } from '../../hooks/useEsitleme';

/** Öne gelişler arasında en az bu kadar beklenir (arka plan görevinin aralığı). */
export const ON_PLAN_ESITLEME_ARALIGI_MS = 15 * 60 * 1000;

export const EsitlemeTetikleyici: React.FC = () => {
  const dispatch = useAppDispatch();
  const sonTurMs = useRef(0);

  useEffect(() => {
    if (kullanilabilirSaglayicilar().length === 0) return undefined;

    const kos = () => {
      sonTurMs.current = Date.now();
      onPlandaEsitle(dispatch).catch(() => undefined);
    };

    const etkilesim = InteractionManager.runAfterInteractions(kos);
    const abonelik = AppState.addEventListener('change', (yeni) => {
      if (yeni === 'active' && Date.now() - sonTurMs.current >= ON_PLAN_ESITLEME_ARALIGI_MS) {
        kos();
      }
    });
    return () => {
      etkilesim.cancel();
      abonelik.remove();
    };
  }, [dispatch]);

  return null;
};
