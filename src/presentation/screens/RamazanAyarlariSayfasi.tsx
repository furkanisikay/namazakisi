/**
 * Ramazan Ayarları Sayfası — iftar ve sahur geri sayımı.
 *
 * Sade tasarım Dalga 4: dekoratif başlık kartı kalktı (sayfa başlığı header'da);
 * bölüm başlıkları `BolumBasligi`; açıklamalar tek cümle (≤ 12 kelime, 14 pt);
 * oruç uyarısı kısa ve ikonu tema tokenı (`dikkat`, yalnız dekoratif). İftar/sahur
 * vurgu renkleri KASTEN sabit (temada karşılığı yok; yalnız ikon/anahtar — metin değil).
 */

import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { Anahtar } from '../components/common/Anahtar';
import { CanliGuncellemeBilgisi } from '../components/common/CanliGuncellemeBilgisi';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  iftarSayacAyarlariniYukle,
} from '../store/iftarSayacSlice';
import {
  sahurSayacAyarlariniYukle,
} from '../store/sahurSayacSlice';
import { useRamazanSayaclari } from '../hooks/useRamazanSayaclari';
import { VurguSaglayici } from '../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../components/ayar/AyarCapasi';
import { BolumBasligi } from '../components/ortak/BolumBasligi';
import { TanitimResmi } from '../components/hareket/TanitimResmi';

/**
 * Ramazan Ayarlari Sayfasi
 */
export const RamazanAyarlariSayfasi: React.FC<any> = () => {
  return (
    <VurguSaglayici>
      <RamazanAyarlariIcerik />
    </VurguSaglayici>
  );
};

/**
 * İçerik bileşeni `VurguSaglayici` altında yaşar — `useVurguKurulumu()`
 * yalnızca sağlayıcı içinde çağrılabilir (bkz. task-4 entegrasyon örneği).
 */
const RamazanAyarlariIcerik: React.FC = () => {
  const renkler = useRenkler();
  const scrollRef = useVurguKurulumu();
  const dispatch = useAppDispatch();
  const { butonTiklandiFeedback } = useFeedback();
  const iftarSayac = useAppSelector((state) => state.iftarSayac);
  const sahurSayac = useAppSelector((state) => state.sahurSayac);
  const ayarlar = iftarSayac?.ayarlar || { aktif: false };
  const sahurAyarlar = sahurSayac?.ayarlar || { aktif: false };

  // Giris animasyonu
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(iftarSayacAyarlariniYukle());
    dispatch(sahurSayacAyarlariniYukle());
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [dispatch, fadeAnim]);

  // Yazma yolu Hatırlatmalar sayfasıyla ORTAK (`useRamazanSayaclari`: thunk + yeniden planlama).
  const ramazan = useRamazanSayaclari();
  const handleSayacToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    await ramazan.iftarDegistir(yeniDeger);
  };

  const handleSahurSayacToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    await ramazan.sahurDegistir(yeniDeger);
  };

  const iftarRenk = '#E65100';
  const sahurRenk = '#3F51B5'; // İftar turuncu, Sahur lacivert/mavi

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Görsel anlatı: hilal ve yıldızlar girişte bir kez belirir (başlık header'da). */}
        <TanitimResmi
          ikon="moon"
          renk={iftarRenk}
          eslik={[
            { ikon: 'star', x: -70, y: -30, boyut: 10 },
            { ikon: 'star', x: 64, y: -40, boyut: 13 },
            { ikon: 'star', x: 74, y: 22, boyut: 9 },
          ]}
          style={{ marginBottom: 12 }}
          testID="ramazan-tanitim-resmi"
        />
        {/* İftar Sayacı Ayarı */}
        <View className="mb-6">
          <BolumBasligi metin="İftar" ikon="moon" />

          <AyarCapasi id="iftarSayaci">
          <View
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            {/* Header: Toggle */}
            <View className="flex-row items-center p-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${iftarRenk}15` }}
              >
                <FontAwesome5
                  name="hourglass-half"
                  size={18}
                  color={iftarRenk}
                  solid
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: renkler.metin }}
                >
                  İftar Sayacı
                </Text>
                <Text
                  className="text-sm mt-0.5"
                  style={{ color: renkler.metinIkincil }}
                >
                  Sabahtan akşama iftara kalan süre görünür
                </Text>
              </View>
              <Anahtar
                value={ayarlar.aktif}
                onValueChange={handleSayacToggle}
                trackColor={{
                  false: renkler.sinir,
                  true: `${iftarRenk}60`,
                }}
                thumbColor={ayarlar.aktif ? iftarRenk : '#f4f3f4'}
                accessibilityLabel="İftar sayacı"
              />
            </View>

            {/* Alt bilgi - aktifse göster */}
            {ayarlar.aktif && (
              <View
                className="px-4 pb-4 border-t"
                style={{ borderTopColor: `${renkler.sinir}50` }}
              >
                <View className="flex-row items-start mt-3 gap-2">
                  <FontAwesome5
                    name="info-circle"
                    size={12}
                    color={renkler.metinIkincil}
                    style={{ marginTop: 2 }}
                  />
                  <Text
                    className="text-sm flex-1"
                    style={{ color: renkler.metinIkincil }}
                  >
                    Akşam girdikten 10 dakika sonra kendiliğinden kalkar.
                  </Text>
                </View>
                <CanliGuncellemeBilgisi />
              </View>
            )}
          </View>
          </AyarCapasi>
        </View>

        {/* Sahur Sayacı Ayarı */}
        <View className="mb-6">
          <BolumBasligi metin="Sahur" ikon="utensils" />

          <AyarCapasi id="sahurSayaci">
          <View
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            {/* Header: Toggle */}
            <View className="flex-row items-center p-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${sahurRenk}15` }}
              >
                <FontAwesome5
                  name="utensils"
                  size={18}
                  color={sahurRenk}
                  solid
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: renkler.metin }}
                >
                  Sahur Sayacı
                </Text>
                <Text
                  className="text-sm mt-0.5"
                  style={{ color: renkler.metinIkincil }}
                >
                  Yatsıdan imsaka sahura kalan süre görünür
                </Text>
              </View>
              <Anahtar
                value={sahurAyarlar.aktif}
                onValueChange={handleSahurSayacToggle}
                trackColor={{
                  false: renkler.sinir,
                  true: `${sahurRenk}60`,
                }}
                thumbColor={sahurAyarlar.aktif ? sahurRenk : '#f4f3f4'}
                accessibilityLabel="Sahur sayacı"
              />
            </View>

            {/* Alt bilgi - aktifse göster */}
            {sahurAyarlar.aktif && (
              <View
                className="px-4 pb-4 border-t"
                style={{ borderTopColor: `${renkler.sinir}50` }}
              >
                <View className="flex-row items-start mt-3 gap-2">
                  <FontAwesome5
                    name="info-circle"
                    size={12}
                    color={renkler.metinIkincil}
                    style={{ marginTop: 2 }}
                  />
                  <Text
                    className="text-sm flex-1"
                    style={{ color: renkler.metinIkincil }}
                  >
                    İmsak girdikten 10 dakika sonra kendiliğinden kalkar.
                  </Text>
                </View>
                <CanliGuncellemeBilgisi />
              </View>
            )}
          </View>
          </AyarCapasi>
        </View>

        {/* Bilgi Notu */}
        <View
          className="flex-row items-start p-4 rounded-xl"
          style={{ backgroundColor: renkler.kartArkaplan }}
        >
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${renkler.dikkat}20` }}
          >
            <FontAwesome5
              name="exclamation-triangle"
              size={14}
              color={renkler.dikkat}
            />
          </View>
          <Text
            className="flex-1 text-sm leading-5"
            style={{ color: renkler.metin }}
          >
            Sayaç hesaplamaya dayanır; orucunuzu ezanla açın. Esas olan Diyanet takvimidir.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};
