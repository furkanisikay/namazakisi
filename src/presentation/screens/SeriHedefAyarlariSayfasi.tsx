/**
 * Seri ve Hedef Ayarlari Sayfasi
 * Tam gun esigi, gun bitis saati ve ozel gun modu ayarlari
 * 
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
 */

import * as React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  seriAyarlariniGuncelle,
  seriStateSifirla,
  ozelGunModuDurumunuGuncelle,
  ozelGunBaslat,
} from '../store/seriSlice';
import { OzelGunTakvimi } from '../components';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';

/**
 * Sayisal secici bileseni
 */
interface SayisalSeciciProps {
  deger: number;
  min: number;
  max: number;
  adim?: number;
  birim?: string;
  onChange: (yeniDeger: number) => void;
  renk?: string;
}

const SayisalSecici: React.FC<SayisalSeciciProps> = ({
  deger,
  min,
  max,
  adim = 1,
  birim = '',
  onChange,
  renk,
}) => {
  const renkler = useRenkler();
  const butonRenk = renk || renkler.birincil;

  const azalt = useCallback(() => {
    const yeni = Math.max(min, deger - adim);
    onChange(yeni);
  }, [deger, min, adim, onChange]);

  const artir = useCallback(() => {
    const yeni = Math.min(max, deger + adim);
    onChange(yeni);
  }, [deger, max, adim, onChange]);

  return (
    <View className="flex-row items-center justify-center gap-2">
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: deger <= min ? renkler.sinir : butonRenk }}
        onPress={azalt}
        disabled={deger <= min}
        activeOpacity={0.7}
      >
        <FontAwesome5
          name="minus"
          size={14}
          color={deger <= min ? renkler.metinIkincil : '#FFFFFF'}
        />
      </TouchableOpacity>
      <View
        className="min-w-[60px] py-2 px-3 rounded-lg border flex-row items-center justify-center gap-1"
        style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
      >
        <Text className="text-lg font-bold" style={{ color: renkler.metin }}>
          {String(deger).padStart(2, '0')}
        </Text>
        {birim ? (
          <Text className="text-sm" style={{ color: renkler.metinIkincil }}>{birim}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: deger >= max ? renkler.sinir : butonRenk }}
        onPress={artir}
        disabled={deger >= max}
        activeOpacity={0.7}
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
 * Secim buton grubu bileseni
 */
interface SecimGrubuProps {
  secenekler: { deger: any; etiket: string }[];
  seciliDeger: any;
  onSecim: (deger: any) => void;
}

const SecimGrubu: React.FC<SecimGrubuProps> = ({
  secenekler,
  seciliDeger,
  onSecim,
}) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();

  const handleSecim = async (deger: any) => {
    await butonTiklandiFeedback();
    onSecim(deger);
  };

  return (
    <View className="flex-row gap-2">
      {secenekler.map((secenek) => {
        const seciliMi = seciliDeger === secenek.deger;
        return (
          <TouchableOpacity
            key={secenek.deger}
            className="flex-1 py-3 rounded-xl border-2 items-center"
            style={{
              backgroundColor: seciliMi ? renkler.birincil : renkler.kartArkaplan,
              borderColor: seciliMi ? renkler.birincil : renkler.sinir,
            }}
            onPress={() => handleSecim(secenek.deger)}
            activeOpacity={0.7}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: seciliMi ? '#FFFFFF' : renkler.metin }}
            >
              {secenek.etiket}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/**
 * Ayar karti bileseni
 */
interface AyarKartiProps {
  baslik: string;
  aciklama: string;
  ikonAdi: string;
  children: React.ReactNode;
}

const AyarKarti: React.FC<AyarKartiProps> = ({
  baslik,
  aciklama,
  ikonAdi,
  children,
}) => {
  const renkler = useRenkler();

  return (
    <View
      className="rounded-xl p-4 mb-3 shadow-sm"
      style={{ backgroundColor: renkler.kartArkaplan }}
    >
      <View className="flex-row items-start mb-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${renkler.birincil}15` }}
        >
          <FontAwesome5 name={ikonAdi} size={18} color={renkler.birincil} solid />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
            {baslik}
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
            {aciklama}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
};

/**
 * Seri ve Hedef Ayarlari Sayfasi
 */
export const SeriHedefAyarlariSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const { butonTiklandiFeedback } = useFeedback();

  const { ayarlar: seriAyarlari, ozelGunAyarlari } = useAppSelector((state) => state.seri);
  const [takvimGorunur, setTakvimGorunur] = useState(false);

  // Giris animasyonu
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // Tam gun esigi secenekleri
  const tamGunEsikleri = [
    { deger: 3, etiket: '3 vakit' },
    { deger: 4, etiket: '4 vakit' },
    { deger: 5, etiket: '5 vakit' },
  ];

  // Handlers
  const handleEsikSecimi = (esik: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { tamGunEsigi: esik } }));
  };

  const handleOzelGunModuToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    dispatch(ozelGunModuDurumunuGuncelle({ aktif: yeniDeger }));
  };

  const handleMazeretBaslat = (baslangic: Date, bitis: Date) => {
    dispatch(
      ozelGunBaslat({
        baslangicTarihi: tarihiISOFormatinaCevir(baslangic),
        bitisTarihi: tarihiISOFormatinaCevir(bitis),
      })
    );
    setTakvimGorunur(false);
    Alert.alert(
      'Basarili',
      'Ozel gun modu baslatildi. Seriniz secilen tarihler arasinda dondurulacaktir.'
    );
  };

  const handleSeriSifirla = () => {
    Alert.alert(
      'Seri Sifirla',
      'Tum seri verileriniz (seri, rozetler, puanlar) sifirlanacak. Bu islem geri alinamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Sifirla',
          style: 'destructive',
          onPress: () => {
            dispatch(seriStateSifirla());
            Alert.alert('Basarili', 'Seri verileriniz sifirlandi.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Hedef Ayarlari Bolumu */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            HEDEF AYARLARI
          </Text>

          <AyarKarti
            baslik="Tam Gun Esigi"
            aciklama="O gunun serisini tamamlandi saymak icin gunde kilmaniz gereken minimum namaz sayisini belirler"
            ikonAdi="chart-bar"
          >
            <SecimGrubu
              secenekler={tamGunEsikleri}
              seciliDeger={seriAyarlari.tamGunEsigi}
              onSecim={handleEsikSecimi}
            />
          </AyarKarti>
        </View>

        {/* Ozel Gun Modu Bolumu */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            OZEL GUN MODU
          </Text>

          <View
            className="flex-row items-center p-4 rounded-xl mb-2"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#FFC0CB20' }}
            >
              <FontAwesome5 name="magic" size={18} color="#D81B60" solid />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                Ozel Gun Modu
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                Ozel gunlerde seriyi dondurma imkani saglar
              </Text>
            </View>
            <Switch
              value={ozelGunAyarlari.ozelGunModuAktif}
              onValueChange={handleOzelGunModuToggle}
              trackColor={{ false: renkler.sinir, true: '#FFC0CB' }}
              thumbColor={ozelGunAyarlari.ozelGunModuAktif ? '#D81B60' : '#f4f3f4'}
            />
          </View>

          {ozelGunAyarlari.ozelGunModuAktif && !ozelGunAyarlari.aktifOzelGun && (
            <TouchableOpacity
              className="py-3.5 rounded-xl items-center flex-row justify-center gap-2"
              style={{ backgroundColor: '#D81B60' }}
              onPress={() => setTakvimGorunur(true)}
              activeOpacity={0.8}
            >
              <FontAwesome5 name="calendar-plus" size={16} color="#FFFFFF" />
              <Text className="text-base font-bold text-white">
                Ozel Gun Baslat
              </Text>
            </TouchableOpacity>
          )}

          {ozelGunAyarlari.aktifOzelGun && (
            <View
              className="p-4 rounded-xl border"
              style={{ backgroundColor: '#FFF0F5', borderColor: '#FFC0CB' }}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <FontAwesome5 name="check-circle" size={16} color="#D81B60" solid />
                <Text className="text-sm font-bold" style={{ color: '#D81B60' }}>
                  Aktif Ozel Gun
                </Text>
              </View>
              <Text className="text-sm" style={{ color: '#AD1457' }}>
                {new Date(ozelGunAyarlari.aktifOzelGun.baslangicTarihi).toLocaleDateString('tr-TR')}{' '}
                -{' '}
                {new Date(ozelGunAyarlari.aktifOzelGun.bitisTarihi).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          )}
        </View>

        {/* Tehlikeli Bolge */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: '#DC2626' }}
          >
            TEHLIKELI BOLGE
          </Text>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-xl"
            style={{ backgroundColor: '#FEE2E2' }}
            onPress={handleSeriSifirla}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#DC262620' }}
            >
              <FontAwesome5 name="exclamation-triangle" size={18} color="#DC2626" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: '#DC2626' }}>
                Seri Verilerini Sifirla
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: '#DC2626', opacity: 0.8 }}>
                Tum seri, rozet ve puan verilerini siler
              </Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* Ozel Gun Takvimi Modal */}
        <OzelGunTakvimi
          gorunur={takvimGorunur}
          onKapat={() => setTakvimGorunur(false)}
          onBaslat={handleMazeretBaslat}
        />
      </Animated.View>
    </ScrollView>
  );
};
