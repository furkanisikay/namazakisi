/**
 * Kutlama Modal
 * Rozet kazanildiginda, hedef tamamlandiginda veya seviye atlandiginda
 * gosterilen Lottie animasyonlu kutlama popup'i
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRenkler } from '../../core/theme';
import { BOYUTLAR } from '../../core/constants/UygulamaSabitleri';
import { KutlamaBilgisi, KutlamaTipi } from '../../core/types/SeriTipleri';
import { LottieAnimasyon } from './LottieAnimasyon';

const { width: EKRAN_GENISLIGI } = Dimensions.get('window');

interface KutlamaModalProps {
  kutlama: KutlamaBilgisi | null;
  gorunur: boolean;
  onKapat: () => void;
}

/**
 * Kutlama tipine gore tema uyumlu vurgu rengi
 * Arka plan rengi artik temadan (kartArkaplan) aliyor; burada sadece vurgu rengi donduruluyor.
 */
const kutlamaVurguRengiAl = (
  tip: KutlamaTipi,
  renkler: ReturnType<typeof useRenkler>
): string => {
  switch (tip) {
    case 'rozet_kazanildi':
      return renkler.uyari;
    case 'hedef_tamamlandi':
      return renkler.basarili;
    case 'seviye_atlandi':
      return renkler.bilgi;
    case 'toparlanma_tamamlandi':
      return renkler.vurgu;
    case 'en_uzun_seri':
      return renkler.birincil;
    default:
      return renkler.birincil;
  }
};

/**
 * Kutlama Modal Komponenti
 * Tema sistemiyle tam entegre; hem acik hem koyu temada dogru gorunur.
 */
export const KutlamaModal: React.FC<KutlamaModalProps> = ({
  kutlama,
  gorunur,
  onKapat,
}) => {
  const renkler = useRenkler();

  // Animasyonlar
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const konfettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gorunur) {
      // Giris animasyonu
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(konfettiAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Ikon donme animasyonu
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      scaleAnim.setValue(0);
      konfettiAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [gorunur]);

  if (!kutlama) return null;

  // TypeScript tip guvenceligi icin explicit cast
  const kutlamaBilgisi = kutlama as any;
  const vurguRengi = kutlamaVurguRengiAl(kutlamaBilgisi.tip, renkler);

  const handleKapat = () => {
    // Cikis animasyonu
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onKapat();
    });
  };

  // Konfetti parcalari - palet renkleriyle uyumlu
  const konfettiRenkleri = [
    renkler.uyari,
    renkler.birincil,
    renkler.basarili,
    renkler.bilgi,
    renkler.vurgu,
  ];

  const konfettiParcalari = Array.from({ length: 20 }).map((_, index) => {
    const sol = Math.random() * EKRAN_GENISLIGI;
    const renk = konfettiRenkleri[index % konfettiRenkleri.length];

    return (
      <Animated.View
        key={index}
        style={[
          styles.konfettiParca,
          {
            left: sol,
            backgroundColor: renk,
            transform: [
              {
                translateY: konfettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 400],
                }),
              },
              {
                rotate: konfettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${360 + Math.random() * 360}deg`],
                }),
              },
            ],
            opacity: konfettiAnim.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 1, 0],
            }),
          },
        ]}
      />
    );
  });

  return (
    <Modal
      visible={gorunur}
      transparent
      animationType="fade"
      onRequestClose={handleKapat}
    >
      <View style={styles.overlay}>
        {/* Konfetti */}
        <View style={styles.konfettiContainer}>{konfettiParcalari}</View>

        {/* Ana kart - tema karti arkaplan rengiyle */}
        <Animated.View
          style={[
            styles.kartContainer,
            {
              backgroundColor: renkler.kartArkaplan,
              borderColor: vurguRengi,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Lottie animasyon */}
          <View style={styles.animasyonContainer}>
            <LottieAnimasyon
              tip={kutlamaBilgisi.tip === 'rozet_kazanildi' ? 'basari' : 'kutlama'}
              otomatikOynat
              dongu={false}
              stil={styles.lottieAnimasyon}
            />
          </View>

          {/* Ikon - vurgu rengi arkaplanla */}
          <Animated.View
            style={[
              styles.ikonContainer,
              {
                backgroundColor: `${vurguRengi}25`,
                borderColor: vurguRengi,
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.ikon}>{kutlamaBilgisi.ikon}</Text>
          </Animated.View>

          {/* Baslik - vurgu rengiyle */}
          <Text style={[styles.baslik, { color: vurguRengi }]}>
            {`${kutlamaBilgisi.baslik}`}
          </Text>

          {/* Mesaj - tema metin rengiyle */}
          <Text style={[styles.mesaj, { color: renkler.metin }]}>
            {`${kutlamaBilgisi.mesaj}`}
          </Text>

          {/* Ekstra bilgi (rozet varsa) */}
          {kutlamaBilgisi.ekstraVeri?.rozet && (
            <View
              style={[
                styles.ekstraBilgi,
                {
                  backgroundColor: `${vurguRengi}18`,
                  borderColor: `${vurguRengi}40`,
                },
              ]}
            >
              <Text style={[styles.ekstraBilgiMetin, { color: vurguRengi }]}>
                🏅 Rozet koleksiyonunuza eklendi!
              </Text>
            </View>
          )}

          {/* Ekstra bilgi (seviye varsa) */}
          {kutlamaBilgisi.ekstraVeri?.seviye && (
            <View
              style={[
                styles.ekstraBilgi,
                {
                  backgroundColor: `${vurguRengi}18`,
                  borderColor: `${vurguRengi}40`,
                },
              ]}
            >
              <Text style={[styles.ekstraBilgiMetin, { color: vurguRengi }]}>
                ⭐ Yeni rank: {(kutlamaBilgisi.ekstraVeri.seviye as { rank: string })?.rank || ''}
              </Text>
            </View>
          )}

          {/* Kapat butonu - birincil renk */}
          <TouchableOpacity
            style={[styles.kapatButon, { backgroundColor: vurguRengi }]}
            onPress={handleKapat}
            activeOpacity={0.8}
          >
            <Text style={styles.kapatButonMetin}>Devam Et</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  konfettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  konfettiParca: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  kartContainer: {
    width: EKRAN_GENISLIGI * 0.85,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK * 2,
    padding: BOYUTLAR.PADDING_BUYUK * 1.5,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  animasyonContainer: {
    position: 'absolute',
    top: -60,
    width: 200,
    height: 200,
  },
  lottieAnimasyon: {
    width: '100%',
    height: '100%',
  },
  ikonContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    marginBottom: BOYUTLAR.MARGIN_BUYUK,
    marginTop: 60,
  },
  ikon: {
    fontSize: 48,
  },
  baslik: {
    fontSize: BOYUTLAR.FONT_BASLIK,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  mesaj: {
    fontSize: BOYUTLAR.FONT_ORTA,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: BOYUTLAR.MARGIN_BUYUK,
  },
  ekstraBilgi: {
    paddingHorizontal: BOYUTLAR.PADDING_ORTA,
    paddingVertical: BOYUTLAR.PADDING_KUCUK,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
    borderWidth: 1,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  ekstraBilgiMetin: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: '600',
  },
  kapatButon: {
    paddingHorizontal: BOYUTLAR.PADDING_BUYUK * 2,
    paddingVertical: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    marginTop: BOYUTLAR.MARGIN_ORTA,
  },
  kapatButonMetin: {
    color: '#FFFFFF',
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
  },
});
