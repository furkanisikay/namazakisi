/**
 * Konum İzni Disclosure Modali
 *
 * Google Play User Data policy'nin "Prominent Disclosure and Consent"
 * gereksinimine uyum sağlamak için, sistem konum izni penceresi
 * açılmadan önce kullanıcıya verinin hangi amaçla toplandığı, nasıl
 * kullanıldığı ve paylaşılmadığı açıkça anlatılır.
 *
 * İki farklı varyant destekler:
 *   - 'onPlan':  Ön plan (foreground) konum izni
 *   - 'arkaPlan': Her zaman / arka plan konum izni (seyahat modu)
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';

export type IzinTipi = 'onPlan' | 'arkaPlan';

interface DisclosureMaddesi {
  ikon: string;
  baslik: string;
  aciklama: string;
  renk: string;
}

const MADDELER: Record<IzinTipi, {
  baslik: string;
  altBaslik: string;
  ikon: string;
  maddeler: DisclosureMaddesi[];
  kabulButonMetni: string;
  reddetButonMetni: string;
}> = {
  onPlan: {
    baslik: 'Konum Verisi Kullanımı',
    altBaslik: 'Devam etmeden önce, konum bilginizin nasıl kullanılacağını lütfen gözden geçirin.',
    ikon: 'map-marker-alt',
    maddeler: [
      {
        ikon: 'clock',
        baslik: 'Namaz Vakitleri',
        aciklama: 'GPS koordinatları yalnızca bulunduğunuz konuma uygun namaz vakitlerini hesaplamak için kullanılır.',
        renk: '#10b981',
      },
      {
        ikon: 'compass',
        baslik: 'Kıble Yönü',
        aciklama: 'Kıble pusulasını Kâbe’ye göre doğru hizalamak için enlem ve boylam bilgisi kullanılır.',
        renk: '#f59e0b',
      },
      {
        ikon: 'mobile-alt',
        baslik: 'Yalnızca Cihazda',
        aciklama: 'Veriniz yalnızca cihazınızda işlenir ve saklanır. Sunucularımıza gönderilmez, üçüncü taraflarla paylaşılmaz.',
        renk: '#3b82f6',
      },
      {
        ikon: 'ban',
        baslik: 'Reklam ve Analitik Yok',
        aciklama: 'Konum verisi reklam, izleme veya analitik amacıyla asla kullanılmaz.',
        renk: '#ef4444',
      },
    ],
    kabulButonMetni: 'Devam Et ve İzin Ekranını Aç',
    reddetButonMetni: 'Şimdi Değil',
  },
  arkaPlan: {
    baslik: 'Arka Plan Konum Kullanımı',
    altBaslik: 'Seyahatte otomatik güncelleme açılmadan önce, arka plan konum verisinin nasıl kullanılacağını lütfen gözden geçirin.',
    ikon: 'route',
    maddeler: [
      {
        ikon: 'plane-departure',
        baslik: 'Seyahatte Otomatik Güncelleme',
        aciklama: 'Uygulama kapalıyken bile, şehirler arası seyahat ettiğinizde namaz vakitleri konumunuza göre sessizce güncellenir.',
        renk: '#8b5cf6',
      },
      {
        ikon: 'battery-half',
        baslik: 'Pil Dostu Tetikleme',
        aciklama: 'Seçtiğiniz hassasiyet profiline göre (2–10 km / 5–30 dk) tetiklenir; sürekli GPS okuması yapılmaz.',
        renk: '#10b981',
      },
      {
        ikon: 'mobile-alt',
        baslik: 'Yalnızca Cihazda İşlenir',
        aciklama: 'Arka planda alınan konum verisi yalnızca cihazınızda kullanılır; sunucularımıza gönderilmez, üçüncü taraflarla paylaşılmaz.',
        renk: '#3b82f6',
      },
      {
        ikon: 'toggle-off',
        baslik: 'İstediğiniz Zaman Kapatın',
        aciklama: 'Bu özelliği uygulama içinden kapatabilir veya Android Ayarlar → Uygulamalar → İzinler yolundan "Her zaman" iznini geri alabilirsiniz.',
        renk: '#f59e0b',
      },
    ],
    kabulButonMetni: 'Devam Et ve İzin Ekranını Aç',
    reddetButonMetni: 'Vazgeç',
  },
};

interface Props {
  gorunur: boolean;
  tip: IzinTipi;
  onKabul: () => void;
  onReddet: () => void;
}

export const KonumIzniDisclosureModali: React.FC<Props> = ({
  gorunur,
  tip,
  onKabul,
  onReddet,
}) => {
  const renkler = useRenkler();
  const { height: ekranYuksekligi } = useWindowDimensions();
  const animDeger = useRef(new Animated.Value(0)).current;
  const ikonOlcek = useRef(new Animated.Value(0.6)).current;
  const icerikOpacity = useRef(new Animated.Value(0)).current;

  const icerik = MADDELER[tip];

  useEffect(() => {
    if (gorunur) {
      Animated.parallel([
        Animated.spring(animDeger, {
          toValue: 1,
          tension: 60,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(80),
          Animated.spring(ikonOlcek, {
            toValue: 1,
            tension: 110,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(icerikOpacity, {
          toValue: 1,
          duration: 300,
          delay: 140,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      animDeger.setValue(0);
      ikonOlcek.setValue(0.6);
      icerikOpacity.setValue(0);
    }
  }, [gorunur]);

  const kapatAnimasyonu = (sonrasinda: () => void) => {
    Animated.timing(animDeger, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      sonrasinda();
    });
  };

  const handleKabul = () => kapatAnimasyonu(onKabul);
  const handleReddet = () => kapatAnimasyonu(onReddet);

  const translateY = animDeger.interpolate({
    inputRange: [0, 1],
    outputRange: [ekranYuksekligi, 0],
  });

  const overlayOpacity = animDeger.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={gorunur}
      transparent
      animationType="none"
      onRequestClose={handleReddet}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity, backgroundColor: 'rgba(15, 23, 42, 0.6)' },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleReddet} />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: renkler.arkaplan,
              maxHeight: ekranYuksekligi * 0.9,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.tutamac, { backgroundColor: renkler.sinir }]} />

          <ScrollView
            contentContainerStyle={styles.scrollIcerik}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View
              style={[
                styles.ikonCember,
                {
                  backgroundColor: `${renkler.birincil}1F`,
                  transform: [{ scale: ikonOlcek }],
                },
              ]}
            >
              <FontAwesome5
                name={icerik.ikon}
                size={36}
                color={renkler.birincil}
                solid
              />
            </Animated.View>

            <Animated.View style={{ opacity: icerikOpacity }}>
              <Text style={[styles.baslik, { color: renkler.metin }]}>
                {icerik.baslik}
              </Text>
              <Text style={[styles.altBaslik, { color: renkler.metinIkincil }]}>
                {icerik.altBaslik}
              </Text>

              <View style={styles.maddeListesi}>
                {icerik.maddeler.map((m) => (
                  <View
                    key={m.baslik}
                    style={[
                      styles.maddeKarti,
                      {
                        backgroundColor: renkler.kartArkaplan,
                        borderColor: renkler.sinir,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.maddeIkonCember,
                        { backgroundColor: `${m.renk}20` },
                      ]}
                    >
                      <FontAwesome5
                        name={m.ikon}
                        size={16}
                        color={m.renk}
                        solid
                      />
                    </View>
                    <View style={styles.maddeMetinAlan}>
                      <Text
                        style={[
                          styles.maddeBaslik,
                          { color: renkler.metin },
                        ]}
                      >
                        {m.baslik}
                      </Text>
                      <Text
                        style={[
                          styles.maddeAciklama,
                          { color: renkler.metinIkincil },
                        ]}
                      >
                        {m.aciklama}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          </ScrollView>

          <Animated.View
            style={[
              styles.butonAlan,
              {
                opacity: icerikOpacity,
                borderTopColor: renkler.sinir,
                backgroundColor: renkler.arkaplan,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.birincilButon,
                { backgroundColor: renkler.birincil },
              ]}
              onPress={handleKabul}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={icerik.kabulButonMetni}
            >
              <FontAwesome5
                name="check-circle"
                size={16}
                color="#FFFFFF"
                solid
              />
              <Text style={styles.birincilButonMetin}>
                {icerik.kabulButonMetni}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ikincilButon}
              onPress={handleReddet}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={icerik.reddetButonMetni}
            >
              <Text
                style={[
                  styles.ikincilButonMetin,
                  { color: renkler.metinIkincil },
                ]}
              >
                {icerik.reddetButonMetni}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    overflow: 'hidden',
  },
  tutamac: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  scrollIcerik: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
  },
  ikonCember: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  baslik: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  altBaslik: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  maddeListesi: {
    gap: 10,
  },
  maddeKarti: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  maddeIkonCember: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  maddeMetinAlan: {
    flex: 1,
    paddingTop: 2,
  },
  maddeBaslik: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  maddeAciklama: {
    fontSize: 13,
    lineHeight: 18,
  },
  butonAlan: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  birincilButon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  birincilButonMetin: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ikincilButon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  ikincilButonMetin: {
    fontSize: 14,
    fontWeight: '600',
  },
});
