/**
 * Konumu yenileme düğmesi (Ayarlar listesindeki konum satırının sağı).
 *
 * Ana ekrandaki karşılığı `VakitKarti` içindeki konum çipidir; orada düğme ayrı
 * bir kutu olarak yer kaplamasın diye çipin kendisi basılabilir. Burada satırda
 * yer olduğu için erişilebilirlik tabanı (44dp) doğrudan karşılanır.
 */

import * as React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';

interface KonumYenileButonuProps {
  onPress: () => void;
  yenileniyor?: boolean;
}

export const KonumYenileButonu: React.FC<KonumYenileButonuProps> = ({
  onPress,
  yenileniyor = false,
}) => {
  const renkler = useRenkler();

  return (
    <TouchableOpacity
      className="w-11 h-11 rounded-2xl items-center justify-center"
      style={{ backgroundColor: `${renkler.birincil}15` }}
      onPress={onPress}
      disabled={yenileniyor}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Konumu yenile"
      accessibilityHint="Şu anki konumunuzu alır ve namaz vakitlerini ona göre günceller"
      accessibilityState={{ disabled: yenileniyor, busy: yenileniyor }}
    >
      {yenileniyor ? (
        <ActivityIndicator size="small" color={renkler.birincil} />
      ) : (
        <FontAwesome5 name="sync-alt" size={16} color={renkler.birincil} />
      )}
    </TouchableOpacity>
  );
};
