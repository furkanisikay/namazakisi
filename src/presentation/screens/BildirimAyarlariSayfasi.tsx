/**
 * Bildirim Ayarlari Sayfasi
 * Seri hatirlaticilari, gun sonu bildirimi ve muhafiz ayarlari
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
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { seriAyarlariniGuncelle } from '../store/seriSlice';

/**
 * Ayar satiri props arayuzu
 */
interface AyarSatiriProps {
  baslik: string;
  aciklama?: string;
  ikon: string;
  deger: boolean;
  degerDegistir: (yeniDeger: boolean) => void;
}

/**
 * Toggle ayar satiri bileseni
 */
const AyarSatiri: React.FC<AyarSatiriProps> = ({
  baslik,
  aciklama,
  ikon,
  deger,
  degerDegistir,
}) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();

  const handleToggle = async (yeniDeger: boolean) => {
    await butonTiklandiFeedback();
    degerDegistir(yeniDeger);
  };

  return (
    <View style={[styles.ayarSatiri, { backgroundColor: renkler.kartArkaplan }]}>
      <Text style={styles.ayarIkon}>{ikon}</Text>
      <View style={styles.ayarMetinContainer}>
        <Text style={[styles.ayarBaslik, { color: renkler.metin }]}>{baslik}</Text>
        {aciklama && (
          <Text style={[styles.ayarAciklama, { color: renkler.metinIkincil }]}>
            {aciklama}
          </Text>
        )}
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
 * Navigasyon satiri bileseni
 */
interface NavigasyonSatiriProps {
  baslik: string;
  aciklama?: string;
  ikon: string;
  onPress: () => void;
}

const NavigasyonSatiri: React.FC<NavigasyonSatiriProps> = ({
  baslik,
  aciklama,
  ikon,
  onPress,
}) => {
  const renkler = useRenkler();

  return (
    <TouchableOpacity
      style={[styles.ayarSatiri, { backgroundColor: renkler.kartArkaplan }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.ayarIkon}>{ikon}</Text>
      <View style={styles.ayarMetinContainer}>
        <Text style={[styles.ayarBaslik, { color: renkler.metin }]}>{baslik}</Text>
        {aciklama && (
          <Text style={[styles.ayarAciklama, { color: renkler.metinIkincil }]}>
            {aciklama}
          </Text>
        )}
      </View>
      <Text style={{ color: renkler.metinIkincil, fontSize: 20 }}>›</Text>
    </TouchableOpacity>
  );
};

/**
 * Sure secici bileseni
 */
interface SureSeciciProps {
  seciliDeger: number;
  secenekler: { deger: number; etiket: string }[];
  onSecim: (deger: number) => void;
}

const SureSecici: React.FC<SureSeciciProps> = ({
  seciliDeger,
  secenekler,
  onSecim,
}) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();

  const handleSecim = async (deger: number) => {
    await butonTiklandiFeedback();
    onSecim(deger);
  };

  return (
    <View style={styles.sureContainer}>
      {secenekler.map((secenek) => {
        const seciliMi = seciliDeger === secenek.deger;
        return (
          <TouchableOpacity
            key={secenek.deger}
            style={[
              styles.sureButon,
              {
                backgroundColor: seciliMi ? renkler.birincil : renkler.kartArkaplan,
                borderColor: seciliMi ? renkler.birincil : renkler.sinir,
              },
            ]}
            onPress={() => handleSecim(secenek.deger)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sureMetin,
                { color: seciliMi ? '#FFFFFF' : renkler.metin },
              ]}
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
 * Bildirim Ayarlari Sayfasi
 */
export const BildirimAyarlariSayfasi: React.FC<any> = ({ navigation }) => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const { ayarlar: seriAyarlari } = useAppSelector((state) => state.seri);

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

  // Handlers
  const handleBildirimToggle = (yeniDeger: boolean) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { bildirimlerAktif: yeniDeger } }));
  };

  const handleGunSonuBildirimToggle = (yeniDeger: boolean) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimAktif: yeniDeger } }));
  };

  const handleGunSonuSureSecimi = (dk: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimDk: dk } }));
  };

  const sureSecenekleri = [
    { deger: 30, etiket: '30 Dk' },
    { deger: 60, etiket: '1 Saat' },
    { deger: 120, etiket: '2 Saat' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: renkler.arkaplan }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Seri Bildirimleri Bolumu */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            SERI BILDIRIMLERI
          </Text>

          <AyarSatiri
            baslik="Seri Hatirlaticilari"
            aciklama="Serinin bozulmamasi icin bildirim al"
            ikon="🔔"
            deger={seriAyarlari.bildirimlerAktif}
            degerDegistir={handleBildirimToggle}
          />

          <AyarSatiri
            baslik="Gun Sonu Hatirlatici"
            aciklama="Gun bitmeden serinizi kurtarmaniz icin hatirlatma"
            ikon="🕒"
            deger={seriAyarlari.gunSonuBildirimAktif}
            degerDegistir={handleGunSonuBildirimToggle}
          />

          {seriAyarlari.gunSonuBildirimAktif && (
            <View style={[styles.altAyarKutusu, { backgroundColor: renkler.kartArkaplan }]}>
              <Text style={[styles.altAyarBaslik, { color: renkler.metinIkincil }]}>
                Gun bitimine ne kadar kala?
              </Text>
              <SureSecici
                seciliDeger={seriAyarlari.gunSonuBildirimDk}
                secenekler={sureSecenekleri}
                onSecim={handleGunSonuSureSecimi}
              />
            </View>
          )}
        </View>

        {/* Namaz Muhafizi Bolumu */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            NAMAZ MUHAFIZI
          </Text>

          <NavigasyonSatiri
            baslik="Muhafiz Ayarlari"
            aciklama="Hatirlatma sikligi ve konum ayarlari"
            ikon="🛡️"
            onPress={() => navigation.navigate('MuhafizAyarlari')}
          />
        </View>

        {/* Bilgi Notu */}
        <View style={[styles.bilgiKutusu, { backgroundColor: renkler.kartArkaplan }]}>
          <Text style={styles.bilgiIkon}>💡</Text>
          <Text style={[styles.bilgiMetin, { color: renkler.metinIkincil }]}>
            Bildirimlerin calisabilmesi icin cihaz ayarlarindan uygulama bildirimlerinin
            acik olduguna emin olun.
          </Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  bolum: {
    marginBottom: 24,
  },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  // Ayar satiri stilleri
  ayarSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ayarIkon: {
    fontSize: 24,
    marginRight: 14,
  },
  ayarMetinContainer: {
    flex: 1,
  },
  ayarBaslik: {
    fontSize: 16,
    fontWeight: '600',
  },
  ayarAciklama: {
    fontSize: 13,
    marginTop: 2,
  },
  // Alt ayar kutusu
  altAyarKutusu: {
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  altAyarBaslik: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  // Sure secici
  sureContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sureButon: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  sureMetin: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Bilgi kutusu
  bilgiKutusu: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  bilgiIkon: {
    fontSize: 20,
    marginRight: 12,
  },
  bilgiMetin: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
