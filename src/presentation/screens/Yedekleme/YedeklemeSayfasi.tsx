/**
 * Yedekleme & Aktarım giriş sayfası
 * İki ana akış: (1) Yedek oluştur (dışa aktar + paylaş), (2) İçe aktar / Geri yükle.
 *
 * Görsel dil Ayarlar/Kurulum Sihirbazı ile uyumlu: kart deseni (ikon kutusu
 * w-11/14 rounded-xl, başlık + açıklama), fade-in giriş animasyonu, kibar "siz" dili.
 *
 * Dışa aktarma `yedeginiPaylas` servisine bağlıdır; içe aktarma sihirbaz rotasına
 * (IceAktarmaSihirbazi) navigasyonla gider (rota Task 10'da kaydedilir).
 */

import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { yedeginiPaylas } from '../../../domain/services/YedeklemeServisi';
import { Logger } from '../../../core/utils/Logger';
import { BildirimModali } from '../../components/common/BildirimModali';

/**
 * Büyük aksiyon kartı — birincil eylem (yedek oluştur) ve ikincil eylem
 * (içe aktar) için ortak görsel kabuk. Yükleniyor durumunda spinner gösterir.
 */
interface AksiyonKartiProps {
  ikon: string;
  baslik: string;
  aciklama: string;
  onPress: () => void;
  yukleniyor?: boolean;
  pasif?: boolean;
}

const AksiyonKarti: React.FC<AksiyonKartiProps> = ({
  ikon,
  baslik,
  aciklama,
  onPress,
  yukleniyor,
  pasif,
}) => {
  const renkler = useRenkler();

  return (
    <TouchableOpacity
      className="flex-row items-center p-4 rounded-2xl mb-4 shadow-sm"
      style={{
        backgroundColor: renkler.kartArkaplan,
        opacity: pasif ? 0.6 : 1,
      }}
      onPress={onPress}
      disabled={pasif || yukleniyor}
      activeOpacity={0.7}
    >
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: `${renkler.birincil}15` }}
      >
        {yukleniyor ? (
          <ActivityIndicator color={renkler.birincil} />
        ) : (
          <FontAwesome5 name={ikon} size={24} color={renkler.birincil} solid />
        )}
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-bold"
          style={{ color: renkler.metin }}
        >
          {baslik}
        </Text>
        <Text
          className="text-xs mt-1 leading-4"
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
 * Yedekleme & Aktarım Sayfası
 */
export const YedeklemeSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const navigation = useNavigation();
  const { butonTiklandiFeedback, hataFeedback } = useFeedback();

  const [yedekleniyor, setYedekleniyor] = useState(false);
  // Yedek hatası: Alert yerine tema-uyumlu BildirimModali gösterilir.
  const [hataModaliGorunur, setHataModaliGorunur] = useState(false);

  // Giriş animasyonu (Kurulum Sihirbazı / Ramazan deseni — 300ms cubic fade)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleYedekOlustur = async () => {
    if (yedekleniyor) return;
    await butonTiklandiFeedback();
    setHataModaliGorunur(false);
    setYedekleniyor(true);
    try {
      await yedeginiPaylas();
    } catch (error) {
      Logger.error('YedeklemeSayfasi', 'Yedek oluşturulamadı', error);
      await hataFeedback();
      setHataModaliGorunur(true);
    } finally {
      setYedekleniyor(false);
    }
  };

  // "Tekrar dene" — modalı kapatıp yeniden yedek oluşturmayı dener.
  const handleTekrarDene = async () => {
    setHataModaliGorunur(false);
    await handleYedekOlustur();
  };

  const handleIceAktar = async () => {
    await butonTiklandiFeedback();
    navigation.navigate('IceAktarmaSihirbazi' as never);
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      edges={['left', 'right']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Bilgi Kartı */}
          <View
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-3.5"
                style={{ backgroundColor: `${renkler.birincil}15` }}
              >
                <FontAwesome5
                  name="shield-alt"
                  size={20}
                  color={renkler.birincil}
                  solid
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: renkler.metin }}
                >
                  Verileriniz güvende
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: renkler.metinIkincil }}
                >
                  Tek dosyada, şifreli yedek
                </Text>
              </View>
            </View>

            <Text
              className="text-sm leading-5"
              style={{ color: renkler.metinIkincil }}
            >
              Tüm namaz kayıtlarınız, istatistikleriniz, rozetleriniz ve
              ayarlarınız tek bir şifreli dosyaya yedeklenir. Yedeğinizi güvenle
              saklayabilir, yeni cihazınıza taşıyabilirsiniz.
            </Text>

            {/* Şifreleme satırı */}
            <View
              className="flex-row items-center mt-4 pt-4 border-t"
              style={{ borderTopColor: `${renkler.sinir}80` }}
            >
              <FontAwesome5
                name="lock"
                size={13}
                color={renkler.basarili}
                solid
              />
              <Text
                className="text-xs ml-2 flex-1"
                style={{ color: renkler.metinIkincil }}
              >
                Yedeğiniz şifrelenir; içeriği yalnızca bu uygulama ile açılır.
              </Text>
            </View>
          </View>

          {/* Aksiyonlar başlığı */}
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            İŞLEMLER
          </Text>

          {/* Yedek oluştur */}
          <AksiyonKarti
            ikon="cloud-upload-alt"
            baslik="Yedek oluştur"
            aciklama="Verilerinizi şifreli bir dosyaya aktarıp paylaşın."
            onPress={handleYedekOlustur}
            yukleniyor={yedekleniyor}
          />

          {/* İçe aktar / Geri yükle */}
          <AksiyonKarti
            ikon="cloud-download-alt"
            baslik="İçe aktar / Geri yükle"
            aciklama="Bir yedek dosyasından verilerinizi geri yükleyin."
            onPress={handleIceAktar}
            pasif={yedekleniyor}
          />
        </Animated.View>
      </ScrollView>

      {/* Yedek hatası — Alert yerine tema-uyumlu bildirim modalı */}
      <BildirimModali
        gorunur={hataModaliGorunur}
        tip="hata"
        baslik="Yedek oluşturulamadı"
        mesaj="Yedeğiniz oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin veya daha sonra yeniden deneyiniz."
        birincilEtiket="Tekrar dene"
        onBirincil={handleTekrarDene}
        onKapat={() => setHataModaliGorunur(false)}
      />
    </SafeAreaView>
  );
};
