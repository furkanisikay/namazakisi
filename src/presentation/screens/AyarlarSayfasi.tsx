/**
 * Ayarlar Sayfasi
 * Temiz ve minimal ayarlar listesi
 * Her kategori ayri sayfaya yonlendirir
 */

import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
} from 'react-native';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';

/**
 * Ayar menu satiri props arayuzu
 */
interface AyarMenuSatiriProps {
  baslik: string;
  aciklama: string;
  ikon: string;
  onPress: () => void;
}

/**
 * Navigasyon ayar satiri bileseni
 */
const AyarMenuSatiri: React.FC<AyarMenuSatiriProps> = ({
  baslik,
  aciklama,
  ikon,
  onPress,
}) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();

  const handlePress = async () => {
    await butonTiklandiFeedback();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.menuSatiri, { backgroundColor: renkler.kartArkaplan }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.ikonContainer, { backgroundColor: renkler.birincilAcik }]}>
        <Text style={styles.menuIkon}>{ikon}</Text>
      </View>
      <View style={styles.menuMetinContainer}>
        <Text style={[styles.menuBaslik, { color: renkler.metin }]}>{baslik}</Text>
        <Text style={[styles.menuAciklama, { color: renkler.metinIkincil }]}>
          {aciklama}
        </Text>
      </View>
      <Text style={[styles.okIsareti, { color: renkler.metinIkincil }]}>›</Text>
    </TouchableOpacity>
  );
};

/**
 * Toggle ayar satiri props arayuzu
 */
interface ToggleAyarSatiriProps {
  baslik: string;
  aciklama: string;
  ikon: string;
  deger: boolean;
  onDegistir: (yeniDeger: boolean) => void;
}

/**
 * Toggle ayar satiri bileseni
 */
const ToggleAyarSatiri: React.FC<ToggleAyarSatiriProps> = ({
  baslik,
  aciklama,
  ikon,
  deger,
  onDegistir,
}) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();

  const handleToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    onDegistir(yeniDeger);
  };

  return (
    <View style={[styles.toggleSatiri, { backgroundColor: renkler.kartArkaplan }]}>
      <View style={[styles.ikonContainer, { backgroundColor: renkler.birincilAcik }]}>
        <Text style={styles.menuIkon}>{ikon}</Text>
      </View>
      <View style={styles.menuMetinContainer}>
        <Text style={[styles.menuBaslik, { color: renkler.metin }]}>{baslik}</Text>
        <Text style={[styles.menuAciklama, { color: renkler.metinIkincil }]}>
          {aciklama}
        </Text>
      </View>
      <Switch
        value={deger}
        onValueChange={handleToggle}
        trackColor={{ false: renkler.sinir, true: renkler.birincilAcik }}
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
      ikon: '📍',
      sayfa: 'KonumAyarlari',
    },
    {
      baslik: 'Namaz Muhafızı',
      aciklama: 'Hatırlatma bildirimleri ve sıklık ayarları',
      ikon: '🛡️',
      sayfa: 'MuhafizAyarlari',
    },
    {
      baslik: 'Görüntü',
      aciklama: 'Tema ve renk paleti ayarları',
      ikon: '🎨',
      sayfa: 'GorünumAyarlari',
    },
    {
      baslik: 'Bildirimler',
      aciklama: 'Hatırlatıcı ve bildirim tercihleri',
      ikon: '🔔',
      sayfa: 'BildirimAyarlari',
    },
    {
      baslik: 'Seri ve Hedefler',
      aciklama: 'Seri eşikleri ve özel gün modu',
      ikon: '🎯',
      sayfa: 'SeriHedefAyarlari',
    },
    {
      baslik: 'Hakkında',
      aciklama: 'Uygulama bilgileri ve versiyon',
      ikon: 'ℹ️',
      sayfa: 'Hakkinda',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: renkler.arkaplan }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Ana Menu Bolumu */}
        <View style={styles.bolum}>
          {menuOgeleri.map((oge, index) => (
            <AyarMenuSatiri
              key={oge.sayfa}
              baslik={oge.baslik}
              aciklama={oge.aciklama}
              ikon={oge.ikon}
              onPress={() => navigation.navigate(oge.sayfa)}
            />
          ))}
        </View>

        {/* Hizli Ayarlar Bolumu */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            HIZLI AYARLAR
          </Text>

          <ToggleAyarSatiri
            baslik="Titreşim"
            aciklama="Etkileşimlerde telefon titrer."
            ikon="📳"
            deger={ayarlar.titresimAktif}
            onDegistir={titresimDurumunuDegistir}
          />

          <ToggleAyarSatiri
            baslik="Ses Efektleri"
            aciklama="Etkileşimlerde ses efektleri verir."
            ikon="🔊"
            deger={ayarlar.sesAktif}
            onDegistir={sesDurumunuDegistir}
          />
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  bolum: {
    marginBottom: 24,
  },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  // Menu satiri stilleri
  menuSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ikonContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIkon: {
    fontSize: 22,
  },
  menuMetinContainer: {
    flex: 1,
  },
  menuBaslik: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuAciklama: {
    fontSize: 13,
    marginTop: 2,
  },
  okIsareti: {
    fontSize: 24,
    fontWeight: '300',
  },
  // Toggle satiri stilleri
  toggleSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
