/**
 * Ayarlar Sayfasi
 * Temiz ve minimal ayarlar listesi
 * Her kategori ayri sayfaya yonlendirir
 * 
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
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
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';

// Ikon tipleri
type IkonTipi = {
  name: string;
  family: 'fa5' | 'material';
  solid?: boolean;
};

// Menu ogesi ikon eslesmesi
const MENU_IKONLARI: Record<string, IkonTipi> = {
  konum: { name: 'map-marker-alt', family: 'fa5', solid: true },
  muhafiz: { name: 'shield-alt', family: 'fa5', solid: true },
  goruntu: { name: 'palette', family: 'fa5', solid: true },
  bildirim: { name: 'bell', family: 'fa5', solid: true },
  hedef: { name: 'bullseye', family: 'fa5', solid: true },
  hakkinda: { name: 'info-circle', family: 'fa5', solid: true },
  titresim: { name: 'vibration', family: 'material' },
  ses: { name: 'volume-up', family: 'fa5', solid: true },
};

/**
 * Ayar menu satiri props arayuzu
 */
interface AyarMenuSatiriProps {
  baslik: string;
  aciklama: string;
  ikonAdi: string;
  onPress: () => void;
}

/**
 * Navigasyon ayar satiri bileseni
 */
const AyarMenuSatiri: React.FC<AyarMenuSatiriProps> = ({
  baslik,
  aciklama,
  ikonAdi,
  onPress,
}) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();
  const ikonBilgi = MENU_IKONLARI[ikonAdi];

  const handlePress = async () => {
    await butonTiklandiFeedback();
    onPress();
  };

  return (
    <TouchableOpacity
      className="flex-row items-center py-3.5 px-4 mx-4 mb-2 rounded-xl shadow-sm"
      style={{ backgroundColor: renkler.kartArkaplan }}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
        style={{ backgroundColor: `${renkler.birincil}15` }}
      >
        {ikonBilgi?.family === 'material' ? (
          <MaterialIcons
            name={ikonBilgi.name as any}
            size={22}
            color={renkler.birincil}
          />
        ) : (
          <FontAwesome5
            name={ikonBilgi?.name || 'cog'}
            size={20}
            color={renkler.birincil}
            solid={ikonBilgi?.solid}
          />
        )}
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-semibold"
          style={{ color: renkler.metin }}
        >
          {baslik}
        </Text>
        <Text
          className="text-xs mt-0.5"
          style={{ color: renkler.metinIkincil }}
        >
          {aciklama}
        </Text>
      </View>
      <FontAwesome5
        name="chevron-right"
        size={14}
        color={renkler.metinIkincil}
      />
    </TouchableOpacity>
  );
};

/**
 * Toggle ayar satiri props arayuzu
 */
interface ToggleAyarSatiriProps {
  baslik: string;
  aciklama: string;
  ikonAdi: string;
  deger: boolean;
  onDegistir: (yeniDeger: boolean) => void;
}

/**
 * Toggle ayar satiri bileseni
 */
const ToggleAyarSatiri: React.FC<ToggleAyarSatiriProps> = ({
  baslik,
  aciklama,
  ikonAdi,
  deger,
  onDegistir,
}) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();
  const ikonBilgi = MENU_IKONLARI[ikonAdi];

  const handleToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    onDegistir(yeniDeger);
  };

  return (
    <View
      className="flex-row items-center py-3.5 px-4 mx-4 mb-2 rounded-xl shadow-sm"
      style={{ backgroundColor: renkler.kartArkaplan }}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
        style={{ backgroundColor: `${renkler.birincil}15` }}
      >
        {ikonBilgi?.family === 'material' ? (
          <MaterialIcons
            name={ikonBilgi.name as any}
            size={22}
            color={renkler.birincil}
          />
        ) : (
          <FontAwesome5
            name={ikonBilgi?.name || 'cog'}
            size={20}
            color={renkler.birincil}
            solid={ikonBilgi?.solid}
          />
        )}
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-semibold"
          style={{ color: renkler.metin }}
        >
          {baslik}
        </Text>
        <Text
          className="text-xs mt-0.5"
          style={{ color: renkler.metinIkincil }}
        >
          {aciklama}
        </Text>
      </View>
      <Switch
        value={deger}
        onValueChange={handleToggle}
        trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
        thumbColor={deger ? renkler.birincil : '#f4f3f4'}
      />
    </View>
  );
};

/**
 * Ayarlar Sayfasi
 */
export const AyarlarSayfasi: React.FC<any> = ({ navigation }) => {
  const renkler = useRenkler();
  const { ayarlar, titresimDurumunuDegistir, sesDurumunuDegistir } = useFeedback();

  // Giris animasyonu
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Menu ogelerini tanimla
  const menuOgeleri = [
    {
      baslik: 'Konum',
      aciklama: 'Namaz vakitleri için konum ayarları',
      ikonAdi: 'konum',
      sayfa: 'KonumAyarlari',
    },
    {
      baslik: 'Namaz Muhafızı',
      aciklama: 'Hatırlatma bildirimleri ve sıklık ayarları',
      ikonAdi: 'muhafiz',
      sayfa: 'MuhafizAyarlari',
    },
    {
      baslik: 'Görüntü',
      aciklama: 'Tema ve renk paleti ayarları',
      ikonAdi: 'goruntu',
      sayfa: 'GorünumAyarlari',
    },
    {
      baslik: 'Bildirimler',
      aciklama: 'Hatırlatıcı ve bildirim tercihleri',
      ikonAdi: 'bildirim',
      sayfa: 'BildirimAyarlari',
    },
    {
      baslik: 'Seri ve Hedefler',
      aciklama: 'Seri eşikleri ve özel gün modu',
      ikonAdi: 'hedef',
      sayfa: 'SeriHedefAyarlari',
    },
    {
      baslik: 'Hakkında',
      aciklama: 'Uygulama bilgileri ve versiyon',
      ikonAdi: 'hakkinda',
      sayfa: 'Hakkinda',
    },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['top', 'left', 'right']}>
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Ana Menu Bolumu */}
        <View className="mb-6">
          {menuOgeleri.map((oge) => (
            <AyarMenuSatiri
              key={oge.sayfa}
              baslik={oge.baslik}
              aciklama={oge.aciklama}
              ikonAdi={oge.ikonAdi}
              onPress={() => navigation.navigate(oge.sayfa)}
            />
          ))}
        </View>

        {/* Hizli Ayarlar Bolumu */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mx-4 mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            HIZLI AYARLAR
          </Text>

          <ToggleAyarSatiri
            baslik="Titresim"
            aciklama="Etkilesimlerde telefon titrer."
            ikonAdi="titresim"
            deger={ayarlar.titresimAktif}
            onDegistir={titresimDurumunuDegistir}
          />

          <ToggleAyarSatiri
            baslik="Ses Efektleri"
            aciklama="Etkilesimlerde ses efektleri verir."
            ikonAdi="ses"
            deger={ayarlar.sesAktif}
            onDegistir={sesDurumunuDegistir}
          />
        </View>
      </Animated.View>
    </ScrollView>
    </SafeAreaView>
  );
};
