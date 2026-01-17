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
import type { GunSonuBildirimModu, BildirimGunSecimi } from '../../core/types/SeriTipleri';
import { KonumYoneticiServisi } from '../../domain/services/KonumYoneticiServisi';

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
    <View style={styles.saatSeciciWrapper}>
      <TouchableOpacity
        style={[styles.saatButon, { backgroundColor: renkler.sinir }]}
        onPress={handleAzalt}
        disabled={deger <= min}
      >
        <Text style={[styles.saatButonMetin, { color: deger <= min ? renkler.metinIkincil : renkler.metin }]}>−</Text>
      </TouchableOpacity>
      <View style={[styles.saatDeger, { backgroundColor: renkler.kartArkaplan }]}>
        <Text style={[styles.saatDegerMetin, { color: renkler.metin }]}>
          {String(deger).padStart(2, '0')}{birim ? ` ${birim}` : ''}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.saatButon, { backgroundColor: renkler.sinir }]}
        onPress={handleArtir}
        disabled={deger >= max}
      >
        <Text style={[styles.saatButonMetin, { color: deger >= max ? renkler.metinIkincil : renkler.metin }]}>+</Text>
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
  const handleGunSonuBildirimToggle = (yeniDeger: boolean) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimAktif: yeniDeger } }));
  };

  const handleGunSonuSureSecimi = (dk: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimDk: dk } }));
  };

  // Yeni bildirim modu handler'ları
  const handleBildirimModuSecimi = (mod: GunSonuBildirimModu) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimModu: mod } }));
  };

  const handleBildirimGunSecimi = (gun: BildirimGunSecimi) => {
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

  const sureSecenekleri = [
    { deger: 30, etiket: '30 Dk' },
    { deger: 60, etiket: '1 Saat' },
    { deger: 120, etiket: '2 Saat' },
  ];

  const imsakOncesiSecenekleri = [
    { deger: 15, etiket: '15 Dk' },
    { deger: 30, etiket: '30 Dk' },
    { deger: 45, etiket: '45 Dk' },
    { deger: 60, etiket: '1 Saat' },
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
            SERİ BİLDİRİMLERİ
          </Text>

          {/* Seri Hatirlatici - Toggle ve ayarlar tek kartta */}
          <View style={[styles.seriHatirlaticiKart, { backgroundColor: renkler.kartArkaplan }]}>
            {/* Header: Toggle */}
            <View style={styles.seriHatirlaticiHeader}>
              <Text style={styles.ayarIkon}>🔔</Text>
              <View style={styles.ayarMetinContainer}>
                <Text style={[styles.ayarBaslik, { color: renkler.metin }]}>Seri Hatırlatıcı</Text>
                <Text style={[styles.ayarAciklama, { color: renkler.metinIkincil }]}>
                  Gün bitmeden serinizi kurtarmanız için bildirim al
                </Text>
              </View>
              <Switch
                value={seriAyarlari.gunSonuBildirimAktif}
                onValueChange={handleGunSonuBildirimToggle}
                trackColor={{ false: renkler.sinir, true: renkler.birincilAcik }}
                thumbColor={seriAyarlari.gunSonuBildirimAktif ? renkler.birincil : '#f4f3f4'}
              />
            </View>

            {/* Alt ayarlar - aktifse goster */}
            {seriAyarlari.gunSonuBildirimAktif && (
              <View style={styles.seriHatirlaticiAyarlar}>
                {/* Bildirim Modu Seçici */}
                <Text style={[styles.altAyarBaslik, { color: renkler.metinIkincil }]}>
                  Bildirim Modu
                </Text>
                <View style={styles.sureContainer}>
                  <TouchableOpacity
                    style={[
                      styles.sureButon,
                      {
                        backgroundColor: seriAyarlari.gunSonuBildirimModu === 'otomatik' ? renkler.birincil : renkler.kartArkaplan,
                        borderColor: seriAyarlari.gunSonuBildirimModu === 'otomatik' ? renkler.birincil : renkler.sinir,
                      },
                    ]}
                    onPress={() => handleBildirimModuSecimi('otomatik')}
                  >
                    <Text style={[styles.sureMetin, { color: seriAyarlari.gunSonuBildirimModu === 'otomatik' ? '#FFF' : renkler.metin }]}>
                      🔄 İmsak Öncesi
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sureButon,
                      {
                        backgroundColor: seriAyarlari.gunSonuBildirimModu === 'sabit' ? renkler.birincil : renkler.kartArkaplan,
                        borderColor: seriAyarlari.gunSonuBildirimModu === 'sabit' ? renkler.birincil : renkler.sinir,
                      },
                    ]}
                    onPress={() => handleBildirimModuSecimi('sabit')}
                  >
                    <Text style={[styles.sureMetin, { color: seriAyarlari.gunSonuBildirimModu === 'sabit' ? '#FFF' : renkler.metin }]}>
                      ⏰ Sabit Zamanlı
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Otomatik Mod Ayarları */}
                {seriAyarlari.gunSonuBildirimModu === 'otomatik' && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.altAyarBaslik, { color: renkler.metinIkincil }]}>
                      İmsak vaktinden ne kadar önce?
                    </Text>
                    <View style={styles.saatSeciciContainer}>
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
                      <Text style={[styles.bilgiMetniKucuk, { color: renkler.metinIkincil }]}>
                        İmsak: {String(imsakVakti.getHours()).padStart(2, '0')}:{String(imsakVakti.getMinutes()).padStart(2, '0')}
                      </Text>
                    )}
                  </View>
                )}

                {/* Sabit Mod Ayarları */}
                {seriAyarlari.gunSonuBildirimModu === 'sabit' && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.altAyarBaslik, { color: renkler.metinIkincil }]}>
                      Bildirim zamanı
                    </Text>
                    <View style={styles.sureContainer}>
                      <TouchableOpacity
                        style={[
                          styles.sureButon,
                          {
                            backgroundColor: seriAyarlari.bildirimGunSecimi === 'ayniGun' ? renkler.birincil : renkler.kartArkaplan,
                            borderColor: seriAyarlari.bildirimGunSecimi === 'ayniGun' ? renkler.birincil : renkler.sinir,
                          },
                        ]}
                        onPress={() => handleBildirimGunSecimi('ayniGun')}
                      >
                        <Text style={[styles.sureMetin, { color: seriAyarlari.bildirimGunSecimi === 'ayniGun' ? '#FFF' : renkler.metin }]}>
                          Aynı Gün
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.sureButon,
                          {
                            backgroundColor: seriAyarlari.bildirimGunSecimi === 'ertesiGun' ? renkler.birincil : renkler.kartArkaplan,
                            borderColor: seriAyarlari.bildirimGunSecimi === 'ertesiGun' ? renkler.birincil : renkler.sinir,
                          },
                        ]}
                        onPress={() => handleBildirimGunSecimi('ertesiGun')}
                      >
                        <Text style={[styles.sureMetin, { color: seriAyarlari.bildirimGunSecimi === 'ertesiGun' ? '#FFF' : renkler.metin }]}>
                          Ertesi Gün
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Saat Seçici */}
                    <View style={styles.saatSeciciContainer}>
                      <Text style={[styles.saatLabel, { color: renkler.metinIkincil }]}>Saat:</Text>
                      <View style={styles.saatSeciciRow}>
                        <SaatSecici
                          deger={seriAyarlari.bildirimSaati || (seriAyarlari.bildirimGunSecimi === 'ayniGun' ? (yatsiVakti ? yatsiVakti.getHours() : 18) : 0)}
                          min={seriAyarlari.bildirimGunSecimi === 'ayniGun' ? (yatsiVakti ? yatsiVakti.getHours() : 18) : 0}
                          max={seriAyarlari.bildirimGunSecimi === 'ayniGun' ? 23 : (imsakVakti ? imsakVakti.getHours() : 6)}
                          onChange={handleBildirimSaatiChange}
                        />
                        <Text style={[styles.saatAyirici, { color: renkler.metin }]}>:</Text>
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
                      <Text style={[styles.uyariMetni, { color: '#FF9800' }]}>
                        ⚠️ İmsak{imsakVakti ? `: ${String(imsakVakti.getHours()).padStart(2, '0')}:${String(imsakVakti.getMinutes()).padStart(2, '0')}` : ''} vaktinden sonrası seçilemez
                      </Text>
                    )}
                    {seriAyarlari.bildirimGunSecimi === 'ayniGun' && (
                      <Text style={[styles.uyariMetni, { color: '#FF9800' }]}>
                        ⚠️ Yatsı{yatsiVakti ? `: ${String(yatsiVakti.getHours()).padStart(2, '0')}:${String(yatsiVakti.getMinutes()).padStart(2, '0')}` : ''} vaktinden öncesi seçilemez
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Namaz Muhafizi Bolumu */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            NAMAZ MUHAFIZI
          </Text>

          <NavigasyonSatiri
            baslik="Muhafız Ayarları"
            aciklama="Hatırlatma sıklığı ve konum ayarları"
            ikon="🛡️"
            onPress={() => navigation.navigate('MuhafizAyarlari')}
          />
        </View>

        {/* Bilgi Notu */}
        <View style={[styles.bilgiKutusu, { backgroundColor: renkler.kartArkaplan }]}>
          <Text style={styles.bilgiIkon}>💡</Text>
          <Text style={[styles.bilgiMetin, { color: renkler.metinIkincil }]}>
            Bildirimlerin çalışabilmesi için cihaz ayarlarindan uygulama bildirimlerinin
            açık olduğuna emin olun.
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
  bilgiMetniKucuk: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  // Saat secici stilleri
  saatSeciciContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  saatSeciciWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saatButon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saatButonMetin: {
    fontSize: 20,
    fontWeight: '700',
  },
  saatDeger: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saatDegerMetin: {
    fontSize: 18,
    fontWeight: '600',
  },
  saatSeciciRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saatAyirici: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 4,
  },
  saatLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  uyariMetni: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
  },
  // Seri Hatirlatici kart stilleri
  seriHatirlaticiKart: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  seriHatirlaticiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  seriHatirlaticiAyarlar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
