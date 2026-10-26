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
import { YonluIkon } from '../../components/common/YonluIkon';
import { useRenkler } from '../../../core/theme';
import { sistemCipi } from '../../../core/sistem/sistemDurumu';
import { useSistemKosullari } from '../../hooks/useSistemKosullari';
import { useMetin } from '../../hooks/useMetin';

export interface SistemDurumuCipiProps {
  /** Android pil optimizasyonu muafiyeti (`null`/yok = bilinmiyor). */
  pilMuaf: boolean | null | undefined;
  /** Uyarı tonunda dokununca pil rehberi açılır. */
  onPilRehberi: () => void;
  /** Kurulum sağlığı kartı pil kısıtını zaten gösteriyorsa güç tasarrufu çipi çizilmez. */
  pilUyarisiGosteriliyor?: boolean;
}

export const SistemDurumuCipi: React.FC<SistemDurumuCipiProps> = ({
  pilMuaf,
  onPilRehberi,
  pilUyarisiGosteriliyor = false,
}) => {
  const renkler = useRenkler();
  // Dile abone: çip metni `metin()`'den üretilir.
  const m = useMetin().ayarlar.ana;
  const kosullar = useSistemKosullari();
  const cip = sistemCipi(kosullar, pilMuaf ?? null, pilUyarisiGosteriliyor);
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
      {cip.pilRehberi ? <YonluIkon name="chevron-right" size={12} color={renkler.metinIkincil} /> : null}
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
        accessibilityHint={m.pilRehberIpucu}
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
