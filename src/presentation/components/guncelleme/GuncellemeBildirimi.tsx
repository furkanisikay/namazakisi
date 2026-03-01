/**
 * Guncelleme Bildirimi Bileseni
 *
 * Yeni bir guncelleme mevcut oldugunda ekranin altindan
 * kayarak cikan animasyonlu bildirim paneli.
 *
 * Ozellikler:
 * - Animasyonlu giris/cikis (alttan kayma + fade)
 * - Tema destekli (acik/koyu)
 * - Ikon tabanli (emoji yok)
 * - Minimal ve bilgilendirici tasarim
 * - "Guncelle" ve "Sonra" butonlari
 * - Versiyon bilgisi ve degisiklik notlari
 */

import * as React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Linking,
  Platform,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRenkler } from '../../../core/theme';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Logger } from '../../../core/utils/Logger';
import { guncellemeErtele, bildirimiKapat } from '../../store/guncellemeSlice';
import { yayinTarihiniFormatla, guvenilirBaglantiMi } from '../../../domain/services/GuncellemeServisi';

/**
 * Guncelleme bildirimi bileseni
 * App.tsx'de NavigationContainer icine yerlestirilir
 */
export const GuncellemeBildirimi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();

  const guncellemeMevcut = useAppSelector((state) => state.guncelleme.guncellemeMevcut);
  const bilgi = useAppSelector((state) => state.guncelleme.bilgi);
  const bildirimiKapatti = useAppSelector((state) => state.guncelleme.bildirimiKapatti);

  // Animasyon degerleri
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const gosterilsinMi = guncellemeMevcut && bilgi && !bildirimiKapatti;

  useEffect(() => {
    if (gosterilsinMi) {
      // Giris animasyonu
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Cikis animasyonu
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [gosterilsinMi, slideAnim, fadeAnim]);

  /**
   * Guncelleme baglantisini ac
   */
  const guncelleBasildi = useCallback(() => {
    if (bilgi?.indirmeBaglantisi && guvenilirBaglantiMi(bilgi.indirmeBaglantisi)) {
      Linking.openURL(bilgi.indirmeBaglantisi).catch((hata) => {
        Logger.warn('GuncellemeBildirimi', 'Baglanti acilamadi', hata);
      });
    }
  }, [bilgi]);

  /**
   * Erteleme butonuna basildi
   */
  const sonraBasildi = useCallback(() => {
    if (bilgi?.yeniVersiyon) {
      dispatch(guncellemeErtele(bilgi.yeniVersiyon));
    } else {
      dispatch(bildirimiKapat());
    }
  }, [bilgi, dispatch]);

  // Gosterilmeyecekse bos render
  if (!guncellemeMevcut || !bilgi) {
    return null;
  }

  const formatlananTarih = yayinTarihiniFormatla(bilgi.yayinTarihi);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      pointerEvents={gosterilsinMi ? 'auto' : 'none'}
    >
      {/* Yarim saydam arka plan overlay */}
      <View
        style={{
          marginHorizontal: 12,
          marginBottom: Platform.OS === 'ios' ? 34 : 80,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: renkler.kartArkaplan,
          // Golge
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 16,
          borderWidth: 1,
          borderColor: renkler.sinir,
        }}
      >
        {/* Ust kisim - ikon ve versiyon bilgisi */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          {/* Guncelleme ikonu */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: `${renkler.bilgi}26`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <MaterialIcons
              name="system-update"
              size={24}
              color={renkler.bilgi}
            />
          </View>

          {/* Baslik ve versiyon */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: renkler.metin,
              }}
            >
              Yeni Sürüm Mevcut
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <FontAwesome5
                name="code-branch"
                size={10}
                color={renkler.metinIkincil}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: renkler.metinIkincil,
                  marginLeft: 4,
                }}
              >
                v{bilgi.mevcutVersiyon}
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={12}
                color={renkler.metinIkincil}
                style={{ marginHorizontal: 4 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: renkler.bilgi,
                }}
              >
                v{bilgi.yeniVersiyon}
              </Text>
              {formatlananTarih ? (
                <Text
                  style={{
                    fontSize: 11,
                    color: renkler.metinIkincil,
                    marginLeft: 8,
                  }}
                >
                  {formatlananTarih}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Kapat butonu */}
          <TouchableOpacity
            onPress={sonraBasildi}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: `${renkler.metinIkincil}26`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons
              name="close"
              size={16}
              color={renkler.metinIkincil}
            />
          </TouchableOpacity>
        </View>

        {/* Degisiklik notlari (kisaltilmis) */}
        {bilgi.degisiklikNotlari ? (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: `${renkler.metinIkincil}14`,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: renkler.metinIkincil,
                lineHeight: 18,
              }}
              numberOfLines={3}
            >
              {bilgi.degisiklikNotlari}
            </Text>
          </View>
        ) : null}

        {/* Butonlar */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingBottom: 16,
            gap: 8,
          }}
        >
          {/* Sonra butonu */}
          <TouchableOpacity
            onPress={sonraBasildi}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${renkler.metinIkincil}1F`,
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: renkler.metinIkincil,
              }}
            >
              Sonra
            </Text>
          </TouchableOpacity>

          {/* Guncelle butonu */}
          <TouchableOpacity
            onPress={guncelleBasildi}
            style={{
              flex: 2,
              flexDirection: 'row',
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: renkler.bilgi,
              gap: 6,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="file-download"
              size={16}
              color="#FFFFFF"
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#FFFFFF',
              }}
            >
              Güncelle
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};
