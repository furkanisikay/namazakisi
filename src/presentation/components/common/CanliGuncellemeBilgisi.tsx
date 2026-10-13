/**
 * Sayaç ayarlarındaki "Live Update" bilgi satırı (issue #282).
 *
 * Uygulama içinde AYAR YOKTUR: öne çıkarmayı kullanıcı sistem ayarlarından
 * ("Canlı güncellemeler") yönetir. Satır yalnız Android'de çizilir (iOS'ta sayaç
 * bildirimi yok). Metin tek kaynaktan: `CANLI_GUNCELLEME_BILGI_METNI`.
 */
import * as React from 'react';
import { Platform, Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { CANLI_GUNCELLEME_BILGI_METNI } from '../../../core/sayac/canliGuncelleme';

export const CanliGuncellemeBilgisi: React.FC = () => {
  const renkler = useRenkler();
  if (Platform.OS !== 'android') return null;
  return (
    <View className="flex-row items-start mt-2 gap-2" testID="canli-guncelleme-bilgisi">
      <FontAwesome5 name="mobile-alt" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
      <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
        {CANLI_GUNCELLEME_BILGI_METNI}
      </Text>
    </View>
  );
};
