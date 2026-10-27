/**
 * "Konumu yenile" eyleminin TEK kaynağı.
 *
 * Ana ekrandaki konum çipi ve Ayarlar'daki konum satırı aynı işi yapar; sonuç
 * metinleri ve izin yönlendirmesi iki ekranda ayrı yazılsaydı zamanla ayrışırdı.
 * Hook yalnız orkestrasyon yapar — asıl yazma/yayma işi `KonumYenilemeServisi`de.
 */

import { useCallback } from 'react';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { konumuYenileAsync } from '../store/konumSlice';
import { metin } from '../../core/dil/aktifDil';

export interface KonumYenileDurumu {
  /** Konum otomatik modda mı (yenileme yalnız o zaman anlamlı) */
  yenilenebilir: boolean;
  /** İşlem sürüyor mu (düğme beklemeye geçer) */
  yenileniyor: boolean;
  /** Yenilemeyi başlatır; sonucu kullanıcıya kendisi bildirir */
  yenile: () => void;
}

export function useKonumYenile(): KonumYenileDurumu {
  const dispatch = useAppDispatch();
  const konumModu = useAppSelector((state) => state.konum.konumModu);
  const yenileniyor = useAppSelector((state) => state.konum.yenileniyor);

  const yenile = useCallback(() => {
    if (yenileniyor) return;

    void (async () => {
      const sonuc = await dispatch(konumuYenileAsync()).unwrap().catch(() => null);
      const m = metin().konum.yenile;

      if (sonuc?.durum === 'basarili') {
        kisaBildirimGoster(m.basarili);
        return;
      }

      if (sonuc?.durum === 'izinYok') {
        // İzin diyaloğu, Play "Prominent Disclosure" metniyle birlikte Konum
        // Ayarları'nda açılır; buradan sessizce izin istemek o bağlamı atlardı.
        kisaBildirimGoster(m.izinYok, true);
        return;
      }

      kisaBildirimGoster(m.hata);
    })();
  }, [dispatch, yenileniyor]);

  return {
    yenilenebilir: konumModu === 'oto',
    yenileniyor,
    yenile,
  };
}
