/**
 * Ayarlar'da kurulum sağlığı kartının altındaki tek satırlık sistem durumu çipi:
 * "Güç tasarrufu açık — hatırlatmalar etkilenmez" gibi. Metin ve karar saf
 * çekirdektedir (`core/sistem/sistemDurumu.ts > sistemCipi`); bilinmeyen durumda
 * hiçbir şey çizilmez (yanlış alarm, hiç uyarmamaktan kötü).
 *
 * Renk YALNIZ dekoratiftir (ikon); metin daima tema metni (kontrast kuralı).
 */
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { sistemCipi } from '../../../core/sistem/sistemDurumu';
import { useSistemKosullari } from '../../hooks/useSistemKosullari';

export interface SistemDurumuCipiProps {
  /** Android pil optimizasyonu muafiyeti (`null`/yok = bilinmiyor). */
  pilMuaf: boolean | null | undefined;
  /** Uyarı tonunda dokununca pil rehberi açılır. */
  onPilRehberi: () => void;
}

export const SistemDurumuCipi: React.FC<SistemDurumuCipiProps> = ({ pilMuaf, onPilRehberi }) => {
  const renkler = useRenkler();
  const kosullar = useSistemKosullari();
  const cip = sistemCipi(kosullar, pilMuaf ?? null);
  if (!cip) return null;

  const ikonRengi = cip.ton === 'uyari' ? renkler.durum.dikkat : renkler.durum.bilgi;
  const icerik = (
    <>
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: ikonRengi + '20' }}
      >
        <FontAwesome5 name={cip.ikon} size={13} color={ikonRengi} solid />
      </View>
      <Text className="text-sm flex-1" style={{ color: renkler.metin }}>
        {cip.metin}
      </Text>
      {cip.pilRehberi ? <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} /> : null}
    </>
  );

  const stil = {
    backgroundColor: renkler.kartArkaplan,
    borderWidth: 1,
    borderColor: renkler.sinir,
    minHeight: 48,
  };

  if (cip.pilRehberi) {
    return (
      <TouchableOpacity
        testID="sistem-durumu-cipi"
        className="flex-row items-center rounded-full mx-4 mb-4 px-3 py-2"
        style={stil}
        onPress={onPilRehberi}
        accessibilityRole="button"
        accessibilityLabel={cip.metin}
        accessibilityHint="Pil ayarlarını nasıl değiştireceğinizi gösterir"
      >
        {icerik}
      </TouchableOpacity>
    );
  }
  return (
    <View
      testID="sistem-durumu-cipi"
      className="flex-row items-center rounded-full mx-4 mb-4 px-3 py-2"
      style={stil}
      accessible
      accessibilityRole="text"
      accessibilityLabel={cip.metin}
    >
      {icerik}
    </View>
  );
};
