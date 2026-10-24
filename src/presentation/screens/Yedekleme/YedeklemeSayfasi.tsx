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
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { yedeginiPaylas } from '../../../domain/services/YedeklemeServisi';
import { Logger } from '../../../core/utils/Logger';
import { BildirimModali } from '../../components/common/BildirimModali';
import { VurguSaglayici } from '../../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../../components/ayar/AyarCapasi';
import { kullanilabilirSaglayicilar } from '../../../domain/services/esitlemeSaglayicilari';
import { Depolama } from '../../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { yedeklemeOzeti } from '../../../core/ayarlar/ozetler';
import { BolumBasligi } from '../../components/ortak/BolumBasligi';
import { useMetin } from '../../hooks/useMetin';

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
      accessibilityRole="button"
      accessibilityLabel={baslik}
      accessibilityHint={aciklama}
      accessibilityState={{ disabled: !!(pasif || yukleniyor), busy: !!yukleniyor }}
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
  return (
    <VurguSaglayici>
      <YedeklemeIcerik />
    </VurguSaglayici>
  );
};

/**
 * İçerik bileşeni `VurguSaglayici` altında yaşar — `useVurguKurulumu()`
 * yalnızca sağlayıcı içinde çağrılabilir.
 */
const YedeklemeIcerik: React.FC = () => {
  const renkler = useRenkler();
  const m = useMetin().yedekleme.sayfa;
  const scrollRef = useVurguKurulumu();
  const navigation = useNavigation();
  const { butonTiklandiFeedback, hataFeedback } = useFeedback();

  const [yedekleniyor, setYedekleniyor] = useState(false);
  // Yedek hatası: Alert yerine tema-uyumlu BildirimModali gösterilir.
  const [hataModaliGorunur, setHataModaliGorunur] = useState(false);
  // Durum kartı: son dışa aktarma ("yedek alındı" DEĞİL — paylaşımın kaydedildiği bilinemez).
  const [sonDisaAktarma, setSonDisaAktarma] = useState<string | null>(null);
  const sonDisaAktarmayiOku = React.useCallback(() => {
    Depolama.oku<string>(DEPOLAMA_ANAHTARLARI.SON_DISA_AKTARMA)
      .then((d) => setSonDisaAktarma(typeof d === 'string' ? d : null))
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    sonDisaAktarmayiOku();
  }, [sonDisaAktarmayiOku]);

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
      sonDisaAktarmayiOku();
    } catch (error) {
      Logger.error('YedeklemeSayfasi', 'Yedek oluşturulamadı', error);
      await hataFeedback();
      setHataModaliGorunur(true);
    } finally {
      setYedekleniyor(false);
    }
  };

  // "Tekrar deneyin" — modalı kapatıp yeniden yedek oluşturmayı dener.
  const handleTekrarDene = async () => {
    setHataModaliGorunur(false);
    await handleYedekOlustur();
  };

  // Sağlayıcı yapılandırması derleme zamanı sabittir → bir kez hesaplanır.
  const esitlemeVar = React.useMemo(() => kullanilabilirSaglayicilar().length > 0, []);

  const handleEsitleme = async () => {
    await butonTiklandiFeedback();
    navigation.navigate('EsitlemeAyarlari' as never);
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
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* DURUM KARTI — son dışa aktarma + tek cümle güvence */}
          <View
            testID="yedek-durum-karti"
            className="p-5 mb-6"
            style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24 }}
          >
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-3.5"
                style={{ backgroundColor: `${renkler.birincil}15` }}
              >
                <FontAwesome5 name="shield-alt" size={20} color={renkler.birincil} solid />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                  {m.sonDisaAktarma}
                </Text>
                <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                  {yedeklemeOzeti(sonDisaAktarma, new Date())}
                </Text>
              </View>
            </View>
            <View
              className="flex-row items-center mt-4 pt-4 border-t"
              style={{ borderTopColor: `${renkler.sinir}80` }}
            >
              <FontAwesome5 name="file-alt" size={13} color={renkler.basarili} solid />
              <Text className="text-sm ml-2 flex-1" style={{ color: renkler.metinIkincil }}>
                {m.guvence}
              </Text>
            </View>
          </View>

          <BolumBasligi metin={m.islemler} />

          {/* Yedek oluştur */}
          <AyarCapasi id="disaAktar">
            <AksiyonKarti
              ikon="cloud-upload-alt"
              baslik={m.yedekOlusturun}
              aciklama={m.yedekOlusturunAciklama}
              onPress={handleYedekOlustur}
              yukleniyor={yedekleniyor}
            />
          </AyarCapasi>

          {/* İçe aktar / Geri yükle */}
          <AyarCapasi id="iceAktar">
            <AksiyonKarti
              ikon="cloud-download-alt"
              baslik={m.geriYukleyin}
              aciklama={m.geriYukleyinAciklama}
              onPress={handleIceAktar}
              pasif={yedekleniyor}
            />
          </AyarCapasi>

          {/* Cihazlar arası eşitleme (issue #288): YALNIZ bu build'de yapılandırılmış
              bir sağlayıcı varsa görünür — kullanıcıya çalışmayan seçenek sunulmaz. */}
          {esitlemeVar && (
            <AksiyonKarti
              ikon="sync-alt"
              baslik={m.esitleme}
              aciklama={m.esitlemeAciklama}
              onPress={handleEsitleme}
              pasif={yedekleniyor}
            />
          )}
        </Animated.View>
      </ScrollView>

      {/* Yedek hatası — Alert yerine tema-uyumlu bildirim modalı */}
      <BildirimModali
        gorunur={hataModaliGorunur}
        tip="hata"
        baslik={m.hataBaslik}
        mesaj={m.hataMesaj}
        birincilEtiket={m.tekrarDeneyin}
        onBirincil={handleTekrarDene}
        onKapat={() => setHataModaliGorunur(false)}
      />
    </SafeAreaView>
  );
};
