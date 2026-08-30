/**
 * "Konumu yenile" eyleminin TEK kaynağı.
 *
 * Ana ekrandaki konum çipi ve Ayarlar'daki konum satırı aynı işi yapar; sonuç
 * metinleri ve izin yönlendirmesi iki ekranda ayrı yazılsaydı zamanla ayrışırdı.
 * Hook yalnız orkestrasyon yapar — asıl yazma/yayma işi `KonumYenilemeServisi`de.
 */

import { useCallback } from 'react';
import { ToastAndroid } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { konumuYenileAsync } from '../store/konumSlice';

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

      if (sonuc?.durum === 'basarili') {
        ToastAndroid.show('Konumunuz güncellendi', ToastAndroid.SHORT);
        return;
      }

      if (sonuc?.durum === 'izinYok') {
        // İzin diyaloğu, Play "Prominent Disclosure" metniyle birlikte Konum
        // Ayarları'nda açılır; buradan sessizce izin istemek o bağlamı atlardı.
        ToastAndroid.show('Konum izni gerekiyor: Ayarlar > Konum', ToastAndroid.LONG);
        return;
      }

      ToastAndroid.show('Konum güncellenemedi, lütfen tekrar deneyin', ToastAndroid.SHORT);
    })();
  }, [dispatch, yenileniyor]);

  return {
    yenilenebilir: konumModu === 'oto',
    yenileniyor,
    yenile,
  };
}
