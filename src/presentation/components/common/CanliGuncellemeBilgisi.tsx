/**
 * Sayaç ayarlarındaki canlı güncelleme satırı (issue #282) — ÖLÇEREK konuşur.
 *
 * Eskiden her Android'e "Android 16+ cihazlarda … Now Bar'da görünür" yazıyordu: Android
 * 14'te gereksiz, Samsung olmayan telefonda yanlış ("Now Bar" yalnız Samsung'da),
 * kullanıcı sistem ayarında kapattıysa da eksikti. Şimdi:
 *   - açık ya da bu telefonda yok ya da bilinmiyor → HİÇBİR ŞEY çizilmez;
 *   - kapalı → sebep + "Ayarları açın" (tek dokunuş, `DurumSatiri`).
 * Yalnız Android'de çizilir (iOS'ta sayaç bildirimi yok).
 */
import * as React from 'react';
import { Platform, View } from 'react-native';
import { useCihazDurumu } from '../../hooks/useCihazDurumu';
import { durumNotu } from '../../../core/cihaz/durumNotlari';
import { DurumSatiri } from '../ortak/DurumSatiri';

const ALANLAR = ['canliGuncelleme'] as const;

export const CanliGuncellemeBilgisi: React.FC = () => {
  const android = Platform.OS === 'android';
  const { durum } = useCihazDurumu(ALANLAR, android);
  if (!android) return null;
  const not = durumNotu('canliGuncelleme', durum);
  if (!not) return null;
  return (
    <View className="mt-2" testID="canli-guncelleme-bilgisi">
      <DurumSatiri durum={not} />
    </View>
  );
};
