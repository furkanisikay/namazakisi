/**
 * Cihazlar arası eşitleme (issue #288) — ön plan tetikleyicisi (görünmez).
 *
 * Otomatik turları doğurur; turun KOŞUP KOŞMAYACAĞINA servisteki tek kapı
 * (`esitlemeKarari`: sıklık, yalnız Wi-Fi, yalnız şarjda, güç/veri tasarrufu, ağ)
 * karar verir. Tetikler:
 *  - açılış (arayüz etkileşimleri bittikten sonra) ve uygulamanın öne gelişi,
 *  - "Değişince hemen": bu cihazda namaz kaydı değişince, art arda işaretlemeler
 *    tek tura insin diye `DEGISIKLIK_BEKLEMESI_MS` sonra,
 *  - koşul değişimi: Wi-Fi geldi, şarja takıldı, güç tasarrufu kapandı (bekleyen
 *    tur varsa hemen koşar).
 * Eşitleme kapalıysa her tur tek disk okumasıyla biter; hiçbir sağlayıcı yoksa hiçbir
 * şey kurulmaz. Arka plan turu `ArkaplanGorevServisi`'ndedir (aynı kapı).
 */

import { useEffect, useRef } from 'react';
import { AppState, InteractionManager } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { kullanilabilirSaglayicilar } from '../../../domain/services/esitlemeSaglayicilari';
import { onPlandaOtomatikEsitle } from '../../hooks/useEsitleme';
import { DEGISIKLIK_BEKLEMESI_MS, EsitlemeTetigi } from '../../../core/esitleme/esitlemePolitikasi';
import { kayitDegistiDinleyicisiEkle } from '../../../data/local/LocalNamazServisi';
import { sistemKosullarinaAbone, sonSistemKosullari } from '../../../domain/services/SistemKosullariServisi';
import { sinirsizAgMi } from '../../../core/sistem/sistemDurumu';

/** Koşul özeti: yalnız bunlar değişince "koşul değişti" turu denenir. */
const kosulAnahtari = () => {
  const d = sonSistemKosullari();
  return `${d.agTuru === 'yok'}|${sinirsizAgMi(d)}|${d.sarjda}|${d.gucTasarrufu}|${d.veriTasarrufu}`;
};

export const EsitlemeTetikleyici: React.FC = () => {
  const dispatch = useAppDispatch();
  const degisiklikZamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (kullanilabilirSaglayicilar().length === 0) return undefined;

    const kos = (tetik: EsitlemeTetigi) => {
      onPlandaOtomatikEsitle(dispatch, tetik).catch(() => undefined);
    };

    const etkilesim = InteractionManager.runAfterInteractions(() => kos('acilis'));
    const abonelik = AppState.addEventListener('change', (yeni) => {
      if (yeni === 'active') kos('oneGelis');
    });

    kayitDegistiDinleyicisiEkle('esitleme', () => {
      if (degisiklikZamanlayici.current) clearTimeout(degisiklikZamanlayici.current);
      degisiklikZamanlayici.current = setTimeout(() => {
        degisiklikZamanlayici.current = null;
        kos('degisiklik');
      }, DEGISIKLIK_BEKLEMESI_MS);
    });

    let sonKosul = kosulAnahtari();
    const kosulAboneligi = sistemKosullarinaAbone(() => {
      const yeni = kosulAnahtari();
      if (yeni === sonKosul) return;
      sonKosul = yeni;
      if (AppState.currentState === 'active') kos('kosulDegisti');
    });

    return () => {
      etkilesim.cancel();
      abonelik.remove();
      kosulAboneligi();
      kayitDegistiDinleyicisiEkle('esitleme', null);
      if (degisiklikZamanlayici.current) clearTimeout(degisiklikZamanlayici.current);
    };
  }, [dispatch]);

  return null;
};
