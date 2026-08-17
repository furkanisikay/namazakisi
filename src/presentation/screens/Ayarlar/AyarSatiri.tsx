/**
 * Ayarlar ekranındaki tek bir satırı iki varyantla gösterir:
 *  - `navigasyon`: dokununca başka bir ekrana geçer (chevron-right ile).
 *  - `toggle`: sağda bir Switch taşır; satırın kendisi tıklanabilir DEĞİLDİR
 *    (AGENTS.md TalkBack kuralı: Switch, satırı saran Touchable'ın İÇİNE değil
 *    KARDEŞİNE konur — bu yüzden toggle varyantında satır zaten Touchable
 *    KULLANMAZ, düz `View`'dır ve Switch doğrudan onun içine yerleştirilir).
 *
 * İkon çipini kim çizeceğine (FontAwesome5/MaterialIcons/…) bu bileşen karar
 * vermez — çağıran `ikon` prop'una hazır bir React elemanı verir, `AyarSatiri`
 * yalnız onu w-11 h-11 tonlu çipin içine yerleştirir.
 *
 * (Task 4 brief — Ayarlar ekranı yeniden kurulumu)
 */
import * as React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { YeniRozet } from '../../components/YeniRozet';

interface AyarSatiriOrtakProps {
  /** Hazır ikon elemanı (ör. `<FontAwesome5 name="map-marker-alt" ... />`). */
  ikon: React.ReactNode;
  baslik: string;
  ozet: string;
}

export interface AyarSatiriNavigasyonProps extends AyarSatiriOrtakProps {
  varyant: 'navigasyon';
  onPress: () => void;
  /** "Yeni" rozetini göster (varsayılan: gösterme). */
  yeniRozetGoster?: boolean;
}

export interface AyarSatiriToggleProps extends AyarSatiriOrtakProps {
  varyant: 'toggle';
  deger: boolean;
  onDegistir: (deger: boolean) => void;
}

export type AyarSatiriProps = AyarSatiriNavigasyonProps | AyarSatiriToggleProps;

export const AyarSatiri: React.FC<AyarSatiriProps> = (props) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();
  const { ikon, baslik, ozet } = props;
  const erisimEtiketi = `${baslik}. ${ozet}`;

  const ikonCipi = (
    <View
      className="w-11 h-11 rounded-2xl items-center justify-center mr-3.5"
      style={{ backgroundColor: `${renkler.birincil}15` }}
    >
      {ikon}
    </View>
  );

  const metinBlogu = (
    <View className="flex-1">
      <View className="flex-row items-center">
        <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
          {baslik}
        </Text>
        {props.varyant === 'navigasyon' && props.yeniRozetGoster && (
          <View className="ml-2">
            <YeniRozet />
          </View>
        )}
      </View>
      <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
        {ozet}
      </Text>
    </View>
  );

  if (props.varyant === 'navigasyon') {
    const { onPress } = props;
    const handlePress = async () => {
      await butonTiklandiFeedback();
      onPress();
    };

    return (
      <TouchableOpacity
        className="flex-row items-center py-3.5 px-4"
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={erisimEtiketi}
      >
        {ikonCipi}
        {metinBlogu}
        <FontAwesome5 name="chevron-right" size={14} color={renkler.metinIkincil} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    );
  }

  const { deger, onDegistir } = props;
  const handleToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    onDegistir(yeniDeger);
  };

  return (
    <View className="flex-row items-center py-3.5 px-4">
      {ikonCipi}
      {metinBlogu}
      <Switch
        value={deger}
        onValueChange={handleToggle}
        trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
        thumbColor={deger ? renkler.birincil : '#f4f3f4'}
        accessibilityRole="switch"
        accessibilityState={{ checked: deger }}
        accessibilityLabel={erisimEtiketi}
      />
    </View>
  );
};
