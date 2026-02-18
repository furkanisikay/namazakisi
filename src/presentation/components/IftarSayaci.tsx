/**
 * İftar Sayacı Bileşeni
 * Akşam namazı vaktine geri sayım gösteren dekoratif sayaç
 * 
 * - Sabah namazından sonra aktif olur
 * - Akşam namazı vaktine kalan süreyi gösterir
 * - Vakit girdikten sonra 10 dk boyunca geçen süreyi gösterir
 * - 10 dk sonra kaybolur
 */

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { useRenkler } from '../../core/theme';
import { useAppSelector } from '../store/hooks';

interface IftarSayaciProps {
  koordinatlar: { lat: number; lng: number } | null;
}

interface SayacDurumu {
  gorunur: boolean;
  geriSayim: boolean;
  saat: number;
  dakika: number;
  saniye: number;
  gecenDk: number;
}

/**
 * Sayaç durumunu hesaplar
 */
function sayacDurumuHesapla(
  koordinatlar: { lat: number; lng: number } | null
): SayacDurumu {
  const varsayilan: SayacDurumu = {
    gorunur: false,
    geriSayim: false,
    saat: 0,
    dakika: 0,
    saniye: 0,
    gecenDk: 0,
  };

  if (!koordinatlar) return varsayilan;

  const simdi = new Date();
  const coordinates = new Coordinates(koordinatlar.lat, koordinatlar.lng);
  const params = CalculationMethod.Turkey();
  const prayerTimes = new PrayerTimes(coordinates, simdi, params);

  const sabahVakti = prayerTimes.fajr;
  const aksamVakti = prayerTimes.maghrib;

  // Sabah namazından önce gösterme
  if (simdi < sabahVakti) {
    return varsayilan;
  }

  // Akşam namazından sonraki süre hesabı
  if (simdi >= aksamVakti) {
    const gecenMs = simdi.getTime() - aksamVakti.getTime();
    const gecenDk = Math.floor(gecenMs / (1000 * 60));

    // 10 dakikadan sonra kaybol
    if (gecenDk >= 10) {
      return varsayilan;
    }

    return {
      gorunur: true,
      geriSayim: false,
      saat: 0,
      dakika: 0,
      saniye: 0,
      gecenDk,
    };
  }

  // Sabah → Akşam arası: geri sayım
  const kalanMs = aksamVakti.getTime() - simdi.getTime();
  const saat = Math.floor(kalanMs / (1000 * 60 * 60));
  const dakika = Math.floor((kalanMs % (1000 * 60 * 60)) / (1000 * 60));
  const saniye = Math.floor((kalanMs % (1000 * 60)) / 1000);

  return {
    gorunur: true,
    geriSayim: true,
    saat,
    dakika,
    saniye,
    gecenDk: 0,
  };
}

export const IftarSayaci: React.FC<IftarSayaciProps> = ({ koordinatlar }) => {
  const renkler = useRenkler();
  const { ayarlar } = useAppSelector((state) => state.iftarSayac);
  const [durum, setDurum] = useState<SayacDurumu>(() =>
    sayacDurumuHesapla(koordinatlar)
  );

  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  // Her saniye güncelle
  useEffect(() => {
    if (!ayarlar.aktif || !koordinatlar) return;

    const guncelle = () => {
      const yeniDurum = sayacDurumuHesapla(koordinatlar);
      setDurum(yeniDurum);

      // Son 5 dakika nabız animasyonu
      if (
        yeniDurum.geriSayim &&
        yeniDurum.saat === 0 &&
        yeniDurum.dakika < 5
      ) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    guncelle();
    const interval = setInterval(guncelle, 1000);
    return () => clearInterval(interval);
  }, [ayarlar.aktif, koordinatlar, pulseAnim]);

  // Giriş animasyonu
  useEffect(() => {
    if (durum.gorunur && ayarlar.aktif) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [durum.gorunur, ayarlar.aktif, fadeAnim]);

  if (!ayarlar.aktif || !durum.gorunur || !koordinatlar) return null;

  const zamanStr = `${String(durum.saat).padStart(2, '0')}:${String(durum.dakika).padStart(2, '0')}:${String(durum.saniye).padStart(2, '0')}`;

  // Renk temaları
  const iftarRenk = '#E65100';
  const iftarRenkAcik = '#FFF3E0';
  const iftarRenkOrta = '#FF8F00';

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: pulseAnim }],
        marginHorizontal: 16,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          backgroundColor: renkler.kartArkaplan,
          borderRadius: 20,
          overflow: 'hidden',
          shadowColor: iftarRenk,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        {/* Üst dekoratif şerit */}
        <View
          style={{
            height: 4,
            backgroundColor: iftarRenk,
          }}
        />

        <View style={{ padding: 16 }}>
          {/* Başlık */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <FontAwesome5
              name="moon"
              size={14}
              color={iftarRenkOrta}
              solid
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 2,
                color: iftarRenkOrta,
                marginLeft: 6,
              }}
            >
              İFTAR SAYACI
            </Text>
            <FontAwesome5
              name="moon"
              size={14}
              color={iftarRenkOrta}
              solid
              style={{ marginLeft: 6 }}
            />
          </View>

          {durum.geriSayim ? (
            <>
              {/* Geri sayım */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                {/* Saat kutuları */}
                {zamanStr.split(':').map((birim, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: '900',
                          color: iftarRenk,
                          marginHorizontal: 4,
                        }}
                      >
                        :
                      </Text>
                    )}
                    <View
                      style={{
                        backgroundColor: iftarRenkAcik,
                        borderRadius: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        minWidth: 60,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: '900',
                          color: iftarRenk,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {birim}
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: '600',
                          color: iftarRenkOrta,
                          marginTop: 2,
                        }}
                      >
                        {index === 0 ? 'SAAT' : index === 1 ? 'DAKİKA' : 'SANİYE'}
                      </Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>

              <Text
                style={{
                  fontSize: 11,
                  color: renkler.metinIkincil,
                  textAlign: 'center',
                }}
              >
                Akşam namazı vaktine kalan süre
              </Text>
            </>
          ) : (
            <>
              {/* Vakit girdi bildirimi */}
              <View
                style={{
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: iftarRenkAcik,
                    borderRadius: 16,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <FontAwesome5
                    name="check-circle"
                    size={20}
                    color="#4CAF50"
                    solid
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: iftarRenk,
                      marginLeft: 8,
                    }}
                  >
                    Vakit gireli {durum.gecenDk} dk oldu
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Dipnot */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: `${renkler.sinir}40`,
            }}
          >
            <FontAwesome5
              name="exclamation-triangle"
              size={10}
              color="#FF9800"
              style={{ marginTop: 2, marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: 10,
                color: renkler.metinIkincil,
                flex: 1,
                lineHeight: 14,
              }}
            >
              Bu sayaç tahmini hesaplamaya dayanır. Lütfen ezanı duymadan
              orucunuzu açmayınız.
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
