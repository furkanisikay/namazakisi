/**
 * Ramazan Ayarları Sayfası
 * İftar sayacı toggle ve bilgi
 */

import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Animated,
  Easing,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  iftarSayacAyariniGuncelle,
  iftarSayacAyarlariniYukle,
} from '../store/iftarSayacSlice';
import {
  sahurSayacAyariniGuncelle,
  sahurSayacAyarlariniYukle,
} from '../store/sahurSayacSlice';
import { IftarSayacBildirimServisi } from '../../domain/services/IftarSayacBildirimServisi';
import { SahurSayacBildirimServisi } from '../../domain/services/SahurSayacBildirimServisi';
import { store } from '../store/store';

/**
 * Ramazan Ayarlari Sayfasi
 */
export const RamazanAyarlariSayfasi: React.FC<any> = () => {
  const renkler = useRenkler();
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

  const handleSayacToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    await dispatch(iftarSayacAyariniGuncelle({ aktif: yeniDeger }));

    // Bildirim servisini güncelle
    const konumState = store.getState().konum;
    if (konumState.koordinatlar) {
      await IftarSayacBildirimServisi.getInstance().yapilandirVePlanla({
        aktif: yeniDeger,
        koordinatlar: konumState.koordinatlar,
      });
    }
  };

  const handleSahurSayacToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    await dispatch(sahurSayacAyariniGuncelle({ aktif: yeniDeger }));

    // Bildirim servisini güncelle
    const konumState = store.getState().konum;
    if (konumState.koordinatlar) {
      await SahurSayacBildirimServisi.getInstance().yapilandirVePlanla({
        aktif: yeniDeger,
        koordinatlar: konumState.koordinatlar,
      });
    }
  };

  const iftarRenk = '#E65100';
  const iftarRenkAcik = '#FFF3E0';
  const sahurRenk = '#3F51B5'; // İftar turuncu, Sahur lacivert/mavi
  const sahurRenkAcik = '#E8EAF6';

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Ramazan Başlık Kartı */}
        <View
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            backgroundColor: iftarRenkAcik,
            borderWidth: 1,
            borderColor: `${iftarRenk}20`,
          }}
        >
          <View
            style={{
              height: 4,
              backgroundColor: iftarRenk,
            }}
          />
          <View className="p-5 items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: `${iftarRenk}15` }}
            >
              <FontAwesome5 name="moon" size={28} color={iftarRenk} solid />
            </View>
            <Text
              className="text-lg font-bold mb-1"
              style={{ color: iftarRenk }}
            >
              Ramazan Özel
            </Text>
            <Text
              className="text-xs text-center"
              style={{ color: renkler.metinIkincil }}
            >
              Ramazan ayına özel iftar geri sayım bildirimi
            </Text>
          </View>
        </View>

        {/* İftar Sayacı Ayarı */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            İFTAR SAYACI
          </Text>

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
                  className="text-xs mt-0.5"
                  style={{ color: renkler.metinIkincil }}
                >
                  Bildirim menüsünde iftar vaktine geri sayım göster
                </Text>
              </View>
              <Switch
                value={ayarlar.aktif}
                onValueChange={handleSayacToggle}
                trackColor={{
                  false: renkler.sinir,
                  true: `${iftarRenk}60`,
                }}
                thumbColor={ayarlar.aktif ? iftarRenk : '#f4f3f4'}
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
                    className="text-xs flex-1"
                    style={{ color: renkler.metinIkincil }}
                  >
                    Sabah namazından sonra bildirim menüsünde aktif olur ve
                    akşam namazı vaktine kalan süreyi gösterir. Vakit girdikten
                    10 dakika sonra otomatik kaybolur.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Sahur Sayacı Ayarı */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            SAHUR SAYACI
          </Text>

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
                  className="text-xs mt-0.5"
                  style={{ color: renkler.metinIkincil }}
                >
                  Bildirim menüsünde gece boyu sahur vaktine geri sayım göster
                </Text>
              </View>
              <Switch
                value={sahurAyarlar.aktif}
                onValueChange={handleSahurSayacToggle}
                trackColor={{
                  false: renkler.sinir,
                  true: `${sahurRenk}60`,
                }}
                thumbColor={sahurAyarlar.aktif ? sahurRenk : '#f4f3f4'}
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
                    className="text-xs flex-1"
                    style={{ color: renkler.metinIkincil }}
                  >
                    Yatsı vaktinden sonra bildirim menüsünde aktif olur ve
                    imsak (sahur bitiş) vaktine kalan süreyi gösterir. İmsak girdikten
                    10 dakika sonra otomatik kaybolur.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Bilgi Notu */}
        <View
          className="flex-row items-start p-4 rounded-xl"
          style={{ backgroundColor: renkler.kartArkaplan }}
        >
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: '#FF980015' }}
          >
            <FontAwesome5
              name="exclamation-triangle"
              size={14}
              color="#FF9800"
            />
          </View>
          <Text
            className="flex-1 text-xs leading-4"
            style={{ color: renkler.metinIkincil }}
          >
            Bu sayaç tahmini hesaplamaya dayanmaktadır. Lütfen ezanı duymadan
            orucunuzu açmayınız. Ezan saatleri için Diyanet İşleri Başkanlığı
            verilerini esas alınız.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};
