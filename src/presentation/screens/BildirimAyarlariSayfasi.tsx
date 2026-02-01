/**
 * Bildirim Ayarları Sayfası
 * Seri hatırlatıcıları ve gün sonu bildirimi ayarları
 * 
 * NativeWind + Expo Vector Icons ile güncellenmiş versiyon
 */

import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { seriAyarlariniGuncelle } from '../store/seriSlice';
import { vakitBildirimAyariniGuncelle, vakitBildirimAyarlariniYukle } from '../store/vakitBildirimSlice';
import { NamazAdi } from '../../core/constants/UygulamaSabitleri';
import type { GunSonuBildirimModu, BildirimGunSecimi } from '../../core/types/SeriTipleri';
import { KonumYoneticiServisi } from '../../domain/services/KonumYoneticiServisi';

/**
 * Saat/dakika secici bileseni (artir/azalt butonlu)
 */
interface SaatSeciciProps {
  deger: number;
  min: number;
  max: number;
  adim?: number;
  birim?: string;
  onChange: (deger: number) => void;
}

const SaatSecici: React.FC<SaatSeciciProps> = ({
  deger,
  min,
  max,
  adim = 1,
  birim,
  onChange,
}) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();

  const handleAzalt = async () => {
    await butonTiklandiFeedback();
    const yeniDeger = deger - adim;
    if (yeniDeger >= min) {
      onChange(yeniDeger);
    }
  };

  const handleArtir = async () => {
    await butonTiklandiFeedback();
    const yeniDeger = deger + adim;
    if (yeniDeger <= max) {
      onChange(yeniDeger);
    }
  };

  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: deger <= min ? renkler.sinir : renkler.birincil }}
        onPress={handleAzalt}
        disabled={deger <= min}
      >
        <FontAwesome5
          name="minus"
          size={14}
          color={deger <= min ? renkler.metinIkincil : '#FFFFFF'}
        />
      </TouchableOpacity>
      <View
        className="px-4 py-2 rounded-lg min-w-[80px] items-center"
        style={{ backgroundColor: renkler.kartArkaplan }}
      >
        <Text className="text-lg font-semibold" style={{ color: renkler.metin }}>
          {String(deger).padStart(2, '0')}{birim ? ` ${birim}` : ''}
        </Text>
      </View>
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: deger >= max ? renkler.sinir : renkler.birincil }}
        onPress={handleArtir}
        disabled={deger >= max}
      >
        <FontAwesome5
          name="plus"
          size={14}
          color={deger >= max ? renkler.metinIkincil : '#FFFFFF'}
        />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Bildirim Ayarlari Sayfasi
 */
export const BildirimAyarlariSayfasi: React.FC<any> = ({ navigation }) => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const { butonTiklandiFeedback } = useFeedback();
  const { ayarlar: seriAyarlari } = useAppSelector((state) => state.seri);
  const { ayarlar: vakitAyarlari } = useAppSelector((state) => state.vakitBildirim);

  // Giris animasyonu
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(vakitBildirimAyarlariniYukle());
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // Handlers
  const handleVakitBildirimToggle = async (vakit: string, yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    dispatch(vakitBildirimAyariniGuncelle({ vakit: vakit as any, aktif: yeniDeger }));
  };

  const handleGunSonuBildirimToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimAktif: yeniDeger } }));
  };

  const handleBildirimModuSecimi = async (mod: GunSonuBildirimModu) => {
    await butonTiklandiFeedback();
    dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimModu: mod } }));
  };

  const handleBildirimGunSecimi = async (gun: BildirimGunSecimi) => {
    await butonTiklandiFeedback();
    dispatch(seriAyarlariniGuncelle({ ayarlar: { bildirimGunSecimi: gun } }));
  };

  const handleBildirimImsakOncesiDk = (dk: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { bildirimImsakOncesiDk: dk } }));
  };

  const handleBildirimSaatiChange = (saat: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { bildirimSaati: saat } }));
  };

  const handleBildirimDakikasiChange = (dakika: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { bildirimDakikasi: dakika } }));
  };

  // Konum servisi ve namaz vakitleri
  const konumServisi = KonumYoneticiServisi.getInstance();
  const imsakVakti = React.useMemo(() => {
    return konumServisi.sonrakiGunImsakVaktiGetir();
  }, []);
  const yatsiVakti = React.useMemo(() => {
    return konumServisi.bugunYatsiVaktiGetir();
  }, []);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Vakit Bildirimleri Bölümü */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            VAKİT BİLDİRİMLERİ
          </Text>

          <View
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            {/* Bilgi Başlığı */}
            <View className="p-4 border-b" style={{ borderBottomColor: `${renkler.sinir}50` }}>
               <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${renkler.birincil}15` }}
                  >
                    <FontAwesome5 name="mosque" size={18} color={renkler.birincil} solid />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                      Namaz Vakti Bildirimleri
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                      Vakit girdiğinde ayet ve hadislerle hatırlatma al
                    </Text>
                  </View>
               </View>
            </View>

            {/* Vakit Switchleri */}
            <View className="p-2">
              {[
                { key: 'imsak', label: NamazAdi.Sabah },
                { key: 'ogle', label: NamazAdi.Ogle },
                { key: 'ikindi', label: NamazAdi.Ikindi },
                { key: 'aksam', label: NamazAdi.Aksam },
                { key: 'yatsi', label: NamazAdi.Yatsi },
              ].map((item, index) => (
                <View
                  key={item.key}
                  className={`flex-row items-center justify-between p-3 ${index !== 4 ? 'border-b' : ''}`}
                  style={{ borderBottomColor: `${renkler.sinir}30` }}
                >
                  <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                    {item.label} Vakti
                  </Text>
                  <Switch
                    value={(vakitAyarlari as any)[item.key]}
                    onValueChange={(val) => handleVakitBildirimToggle(item.key, val)}
                    trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                    thumbColor={(vakitAyarlari as any)[item.key] ? renkler.birincil : '#f4f3f4'}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Seri Bildirimleri Bolumu */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            SERİ BİLDİRİMLERİ
          </Text>

          {/* Seri Hatırlatıcı - Toggle ve ayarlar tek kartta */}
          <View
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            {/* Header: Toggle */}
            <View className="flex-row items-center p-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${renkler.birincil}15` }}
              >
                <FontAwesome5 name="bell" size={18} color={renkler.birincil} solid />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                  Seri Hatırlatıcı
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                  Gün bitmeden serinizi kurtarmanız için bildirim al
                </Text>
              </View>
              <Switch
                value={seriAyarlari.gunSonuBildirimAktif}
                onValueChange={handleGunSonuBildirimToggle}
                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                thumbColor={seriAyarlari.gunSonuBildirimAktif ? renkler.birincil : '#f4f3f4'}
              />
            </View>

            {/* Alt ayarlar - aktifse goster */}
            {seriAyarlari.gunSonuBildirimAktif && (
              <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                {/* Bildirim Modu Secici */}
                <Text
                  className="text-xs font-semibold mt-4 mb-3"
                  style={{ color: renkler.metinIkincil }}
                >
                  Bildirim Modu
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-xl border-2 items-center"
                    style={{
                      backgroundColor: seriAyarlari.gunSonuBildirimModu === 'otomatik'
                        ? renkler.birincil
                        : renkler.kartArkaplan,
                      borderColor: seriAyarlari.gunSonuBildirimModu === 'otomatik'
                        ? renkler.birincil
                        : renkler.sinir,
                    }}
                    onPress={() => handleBildirimModuSecimi('otomatik')}
                  >
                    <FontAwesome5
                      name="sync-alt"
                      size={14}
                      color={seriAyarlari.gunSonuBildirimModu === 'otomatik' ? '#FFF' : renkler.metin}
                    />
                    <Text
                      className="text-sm font-semibold mt-1"
                      style={{
                        color: seriAyarlari.gunSonuBildirimModu === 'otomatik' ? '#FFF' : renkler.metin,
                      }}
                    >
                      İmsak Öncesi
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-xl border-2 items-center"
                    style={{
                      backgroundColor: seriAyarlari.gunSonuBildirimModu === 'sabit'
                        ? renkler.birincil
                        : renkler.kartArkaplan,
                      borderColor: seriAyarlari.gunSonuBildirimModu === 'sabit'
                        ? renkler.birincil
                        : renkler.sinir,
                    }}
                    onPress={() => handleBildirimModuSecimi('sabit')}
                  >
                    <FontAwesome5
                      name="clock"
                      size={14}
                      color={seriAyarlari.gunSonuBildirimModu === 'sabit' ? '#FFF' : renkler.metin}
                    />
                    <Text
                      className="text-sm font-semibold mt-1"
                      style={{
                        color: seriAyarlari.gunSonuBildirimModu === 'sabit' ? '#FFF' : renkler.metin,
                      }}
                    >
                      Sabit Zamanlı
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Otomatik Mod Ayarlari */}
                {seriAyarlari.gunSonuBildirimModu === 'otomatik' && (
                  <View className="mt-4">
                    <Text
                      className="text-xs font-semibold mb-3"
                      style={{ color: renkler.metinIkincil }}
                    >
                      İmsak vaktinden ne kadar önce?
                    </Text>
                    <View className="items-center">
                      <SaatSecici
                        deger={seriAyarlari.bildirimImsakOncesiDk || 30}
                        min={5}
                        max={120}
                        adim={5}
                        birim="dk"
                        onChange={handleBildirimImsakOncesiDk}
                      />
                    </View>
                    {imsakVakti && (
                      <Text
                        className="text-xs text-center mt-2"
                        style={{ color: renkler.metinIkincil }}
                      >
                        Imsak: {String(imsakVakti.getHours()).padStart(2, '0')}:
                        {String(imsakVakti.getMinutes()).padStart(2, '0')}
                      </Text>
                    )}
                  </View>
                )}

                {/* Sabit Mod Ayarlari */}
                {seriAyarlari.gunSonuBildirimModu === 'sabit' && (
                  <View className="mt-4">
                    <Text
                      className="text-xs font-semibold mb-3"
                      style={{ color: renkler.metinIkincil }}
                    >
                      Bildirim zamanı
                    </Text>
                    <View className="flex-row gap-2 mb-3">
                      <TouchableOpacity
                        className="flex-1 py-2.5 rounded-xl border-2 items-center"
                        style={{
                          backgroundColor: seriAyarlari.bildirimGunSecimi === 'ayniGun'
                            ? renkler.birincil
                            : renkler.kartArkaplan,
                          borderColor: seriAyarlari.bildirimGunSecimi === 'ayniGun'
                            ? renkler.birincil
                            : renkler.sinir,
                        }}
                        onPress={() => handleBildirimGunSecimi('ayniGun')}
                      >
                        <Text
                          className="text-sm font-semibold"
                          style={{
                            color: seriAyarlari.bildirimGunSecimi === 'ayniGun' ? '#FFF' : renkler.metin,
                          }}
                        >
                          Aynı Gün
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 py-2.5 rounded-xl border-2 items-center"
                        style={{
                          backgroundColor: seriAyarlari.bildirimGunSecimi === 'ertesiGun'
                            ? renkler.birincil
                            : renkler.kartArkaplan,
                          borderColor: seriAyarlari.bildirimGunSecimi === 'ertesiGun'
                            ? renkler.birincil
                            : renkler.sinir,
                        }}
                        onPress={() => handleBildirimGunSecimi('ertesiGun')}
                      >
                        <Text
                          className="text-sm font-semibold"
                          style={{
                            color: seriAyarlari.bildirimGunSecimi === 'ertesiGun' ? '#FFF' : renkler.metin,
                          }}
                        >
                          Ertesi Gün
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Saat Secici */}
                    <View className="items-center mt-2">
                      <Text className="text-sm font-medium mb-2" style={{ color: renkler.metinIkincil }}>
                        Saat:
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <SaatSecici
                          deger={seriAyarlari.bildirimSaati || (seriAyarlari.bildirimGunSecimi === 'ayniGun' ? (yatsiVakti ? yatsiVakti.getHours() : 18) : 0)}
                          min={seriAyarlari.bildirimGunSecimi === 'ayniGun' ? (yatsiVakti ? yatsiVakti.getHours() : 18) : 0}
                          max={seriAyarlari.bildirimGunSecimi === 'ayniGun' ? 23 : (imsakVakti ? imsakVakti.getHours() : 6)}
                          onChange={handleBildirimSaatiChange}
                        />
                        <Text className="text-2xl font-bold mx-1" style={{ color: renkler.metin }}>:</Text>
                        <SaatSecici
                          deger={seriAyarlari.bildirimDakikasi || 0}
                          min={0}
                          max={59}
                          adim={15}
                          onChange={handleBildirimDakikasiChange}
                        />
                      </View>
                    </View>

                    {seriAyarlari.bildirimGunSecimi === 'ertesiGun' && (
                      <View className="flex-row items-center justify-center mt-3 gap-1">
                        <FontAwesome5 name="exclamation-triangle" size={12} color="#FF9800" />
                        <Text className="text-xs font-medium" style={{ color: '#FF9800' }}>
                          İmsak{imsakVakti ? `: ${String(imsakVakti.getHours()).padStart(2, '0')}:${String(imsakVakti.getMinutes()).padStart(2, '0')}` : ''} vaktinden sonrası seçilemez
                        </Text>
                      </View>
                    )}
                    {seriAyarlari.bildirimGunSecimi === 'ayniGun' && (
                      <View className="flex-row items-center justify-center mt-3 gap-1">
                        <FontAwesome5 name="exclamation-triangle" size={12} color="#FF9800" />
                        <Text className="text-xs font-medium" style={{ color: '#FF9800' }}>
                          Yatsı{yatsiVakti ? `: ${String(yatsiVakti.getHours()).padStart(2, '0')}:${String(yatsiVakti.getMinutes()).padStart(2, '0')}` : ''} vaktinden öncesi seçilemez
                        </Text>
                      </View>
                    )}
                  </View>
                )}
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
            style={{ backgroundColor: `${renkler.birincil}15` }}
          >
            <FontAwesome5 name="lightbulb" size={14} color={renkler.birincil} solid />
          </View>
          <Text
            className="flex-1 text-xs leading-4"
            style={{ color: renkler.metinIkincil }}
          >
            Bildirimlerin çalışabilmesi için cihaz ayarlarından uygulama bildirimlerinin
            açık olduğuna emin olun.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};
