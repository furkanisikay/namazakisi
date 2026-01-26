/**
 * Rozet Karti
 * Tek bir rozeti gosterir - kazanilmis veya kilitli durumda
 * 
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { ROZET_RENKLERI } from '../../core/constants/UygulamaSabitleri';
import { RozetDetay, RozetSeviyesi } from '../../core/types/SeriTipleri';

interface RozetKartiProps {
  rozet: RozetDetay;
  onPress?: () => void;
  kompakt?: boolean;
}

/**
 * Rozet seviyesine gore renk dondurur
 */
const seviyeRengiAl = (seviye: RozetSeviyesi): string => {
  switch (seviye) {
    case 'bronz':
      return ROZET_RENKLERI.BRONZ;
    case 'gumus':
      return ROZET_RENKLERI.GUMUS;
    case 'altin':
      return ROZET_RENKLERI.ALTIN;
    case 'elmas':
      return ROZET_RENKLERI.ELMAS;
    default:
      return ROZET_RENKLERI.BRONZ;
  }
};

// Rozet emoji -> ikon eslesmesi
const ROZET_IKONLARI: Record<string, string> = {
  '🌱': 'seedling',
  '🔥': 'fire-alt',
  '💎': 'gem',
  '👑': 'crown',
  '🔄': 'sync-alt',
  '⭐': 'star',
  '💯': 'percent',
  '🏅': 'medal',
};

/**
 * Rozet ikonunu al
 */
const rozetIkonuAl = (emojiIkon: string): string => {
  return ROZET_IKONLARI[emojiIkon] || 'award';
};

/**
 * Rozet Karti Komponenti
 */
export const RozetKarti: React.FC<RozetKartiProps> = ({
  rozet,
  onPress,
  kompakt = false,
}) => {
  const renkler = useRenkler();

  // Parlama animasyonu (kazanilmis rozetler icin)
  const parlamaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (rozet.kazanildiMi) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(parlamaAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(parlamaAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [rozet.kazanildiMi]);

  const seviyeRengi = seviyeRengiAl(rozet.seviye);

  if (kompakt) {
    // Kompakt mod - sadece ikon ve isim
    return (
      <TouchableOpacity
        className="items-center p-3 rounded-xl border w-20 mr-2"
        style={{
          backgroundColor: rozet.kazanildiMi
            ? `${seviyeRengi}20`
            : renkler.kartArkaplan,
          borderColor: rozet.kazanildiMi ? seviyeRengi : renkler.sinir,
          opacity: rozet.kazanildiMi ? 1 : 0.5,
        }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View className="mb-1">
          {rozet.kazanildiMi ? (
            <FontAwesome5
              name={rozetIkonuAl(rozet.ikon)}
              size={28}
              color={seviyeRengi}
              solid
            />
          ) : (
            <FontAwesome5
              name="lock"
              size={28}
              color={renkler.metinIkincil}
              style={{ opacity: 0.4 }}
            />
          )}
        </View>
        <Text
          className="text-center font-semibold"
          style={{
            fontSize: 10,
            color: rozet.kazanildiMi ? seviyeRengi : renkler.metinIkincil,
          }}
          numberOfLines={1}
        >
          {rozet.ad}
        </Text>
      </TouchableOpacity>
    );
  }

  // Normal mod - detayli kart
  return (
    <TouchableOpacity
      className="flex-row items-center p-3 rounded-2xl border mb-3 overflow-hidden"
      style={{
        backgroundColor: rozet.kazanildiMi
          ? `${seviyeRengi}10`
          : renkler.kartArkaplan,
        borderColor: rozet.kazanildiMi ? seviyeRengi : renkler.sinir,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Parlama efekti */}
      {rozet.kazanildiMi && (
        <Animated.View
          className="absolute top-0 left-0 right-0 bottom-0"
          style={{
            backgroundColor: seviyeRengi,
            opacity: parlamaAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.05, 0.1],
            }),
          }}
        />
      )}

      {/* Ikon container */}
      <View
        className="w-14 h-14 rounded-full items-center justify-center mr-3 border-2"
        style={{
          backgroundColor: rozet.kazanildiMi
            ? `${seviyeRengi}20`
            : renkler.sinir,
          borderColor: rozet.kazanildiMi ? seviyeRengi : 'transparent',
        }}
      >
        {rozet.kazanildiMi ? (
          <FontAwesome5
            name={rozetIkonuAl(rozet.ikon)}
            size={24}
            color={seviyeRengi}
            solid
          />
        ) : (
          <FontAwesome5
            name="lock"
            size={24}
            color={renkler.metinIkincil}
            style={{ opacity: 0.3 }}
          />
        )}
      </View>

      {/* Bilgiler */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="font-bold flex-1"
            style={{
              fontSize: 15,
              color: rozet.kazanildiMi ? renkler.metin : renkler.metinIkincil,
            }}
          >
            {rozet.ad}
          </Text>
          <View
            className="px-2 py-0.5 rounded-lg ml-2"
            style={{ backgroundColor: `${seviyeRengi}20` }}
          >
            <Text
              className="font-bold"
              style={{ fontSize: 9, color: seviyeRengi }}
            >
              {rozet.seviye.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text
          className="text-xs leading-4"
          style={{
            color: rozet.kazanildiMi ? renkler.metinIkincil : renkler.sinir,
          }}
          numberOfLines={2}
        >
          {rozet.kazanildiMi ? rozet.aciklama : rozet.kosulAciklamasi}
        </Text>

        {rozet.kazanildiMi && rozet.kazanilmaTarihi && (
          <Text
            className="text-xs font-semibold mt-1"
            style={{ color: seviyeRengi }}
          >
            {new Date(rozet.kazanilmaTarihi).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        )}
      </View>

      {/* Kilit ikonu - kazanilmamis rozetler icin */}
      {!rozet.kazanildiMi && (
        <View className="ml-2">
          <FontAwesome5
            name="lock"
            size={16}
            color={renkler.metinIkincil}
            style={{ opacity: 0.5 }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Mini Rozet - cok kucuk gosterim
 */
export const MiniRozet: React.FC<{
  rozet: RozetDetay;
  boyut?: number;
}> = ({ rozet, boyut = 36 }) => {
  const renkler = useRenkler();
  const seviyeRengi = seviyeRengiAl(rozet.seviye);

  return (
    <View
      className="items-center justify-center"
      style={{
        width: boyut,
        height: boyut,
        borderRadius: boyut / 2,
        backgroundColor: rozet.kazanildiMi ? `${seviyeRengi}20` : renkler.sinir,
        borderColor: rozet.kazanildiMi ? seviyeRengi : 'transparent',
        borderWidth: rozet.kazanildiMi ? 2 : 0,
      }}
    >
      {rozet.kazanildiMi ? (
        <FontAwesome5
          name={rozetIkonuAl(rozet.ikon)}
          size={boyut * 0.4}
          color={seviyeRengi}
          solid
        />
      ) : (
        <FontAwesome5
          name="question"
          size={boyut * 0.4}
          color={renkler.metinIkincil}
        />
      )}
    </View>
  );
};
