/**
 * Seri ve Hedef Ayarlari Sayfasi
 * Tam gun esigi, gun bitis saati ve ozel gun modu ayarlari
 */

import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  seriAyarlariniGuncelle,
  seriStateSifirla,
  ozelGunModuDurumunuGuncelle,
  ozelGunBaslat,
} from '../store/seriSlice';
import { GUN_BITIS_SAATI_SECENEKLERI } from '../../core/types/SeriTipleri';
import { OzelGunTakvimi } from '../components';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';

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
    <View style={styles.secimContainer}>
      {secenekler.map((secenek) => {
        const seciliMi = seciliDeger === secenek.deger;
        return (
          <TouchableOpacity
            key={secenek.deger}
            style={[
              styles.secimButon,
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
                styles.secimMetin,
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
 * Ayar karti bileseni
 */
interface AyarKartiProps {
  baslik: string;
  aciklama: string;
  ikon: string;
  children: React.ReactNode;
}

const AyarKarti: React.FC<AyarKartiProps> = ({
  baslik,
  aciklama,
  ikon,
  children,
}) => {
  const renkler = useRenkler();

  return (
    <View style={[styles.kartContainer, { backgroundColor: renkler.kartArkaplan }]}>
      <View style={styles.kartBaslik}>
        <Text style={styles.kartIkon}>{ikon}</Text>
        <View style={styles.kartBaslikMetinContainer}>
          <Text style={[styles.kartBaslikMetin, { color: renkler.metin }]}>
            {baslik}
          </Text>
          <Text style={[styles.kartAciklama, { color: renkler.metinIkincil }]}>
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
  const { kullanici } = useAppSelector((state) => state.auth);
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

  // Gun bitis saati secenekleri
  const gunBitisSecenekleri = GUN_BITIS_SAATI_SECENEKLERI.map((s) => ({
    deger: s.deger,
    etiket: s.etiket,
  }));

  // Handlers
  const handleEsikSecimi = (esik: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { tamGunEsigi: esik } }));
  };

  const handleGunBitisSaatiSecimi = (saat: string) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { gunBitisSaati: saat } }));
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
      'Başarılı',
      'Özel gün modu başlatıldı. Seriniz seçilen tarihler arasında dondurulacaktır.'
    );
  };

  const handleSeriSifirla = () => {
    Alert.alert(
      'Seri Sıfırla',
      'Tüm seri verileriniz (seri, rozetler, puanlar) sıfırlanacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            dispatch(seriStateSifirla());
            Alert.alert('Başarılı', 'Seri verileriniz sıfırlandı.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: renkler.arkaplan }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Hedef Ayarlari Bolumu */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            HEDEF AYARLARI
          </Text>

          <AyarKarti
            baslik="Tam Gun Esigi"
            aciklama="Seride sayilmak icin gunluk minimum namaz"
            ikon="📊"
          >
            <SecimGrubu
              secenekler={tamGunEsikleri}
              seciliDeger={seriAyarlari.tamGunEsigi}
              onSecim={handleEsikSecimi}
            />
          </AyarKarti>

          <AyarKarti
            baslik="Gun Bitis Saati"
            aciklama="Yatsi namazini ertesi gun bu saate kadar girebilirsiniz"
            ikon="🌙"
          >
            <SecimGrubu
              secenekler={gunBitisSecenekleri}
              seciliDeger={seriAyarlari.gunBitisSaati}
              onSecim={handleGunBitisSaatiSecimi}
            />
            <Text style={[styles.ekAciklama, { color: renkler.metinIkincil }]}>
              Ornek: {seriAyarlari.gunBitisSaati} secilirse, yatsi namazini ertesi gun
              saat {seriAyarlari.gunBitisSaati}'e kadar girebilirsiniz.
            </Text>
          </AyarKarti>
        </View>

        {/* Ozel Gun Modu Bolumu */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            OZEL GUN MODU
          </Text>

          <View style={[styles.toggleSatiri, { backgroundColor: renkler.kartArkaplan }]}>
            <Text style={styles.toggleIkon}>✨</Text>
            <View style={styles.toggleMetinContainer}>
              <Text style={[styles.toggleBaslik, { color: renkler.metin }]}>
                Ozel Gun Modu
              </Text>
              <Text style={[styles.toggleAciklama, { color: renkler.metinIkincil }]}>
                Mazeret durumlarinda seriyi dondurma imkani
              </Text>
            </View>
            <Switch
              value={ozelGunAyarlari.ozelGunModuAktif}
              onValueChange={handleOzelGunModuToggle}
              trackColor={{ false: renkler.sinir, true: renkler.birincilAcik }}
              thumbColor={ozelGunAyarlari.ozelGunModuAktif ? renkler.birincil : '#f4f3f4'}
            />
          </View>

          {ozelGunAyarlari.ozelGunModuAktif && !ozelGunAyarlari.aktifOzelGun && (
            <TouchableOpacity
              style={[styles.aksiyonButonu, { backgroundColor: renkler.birincil }]}
              onPress={() => setTakvimGorunur(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.aksiyonButonMetin}>🌸 Mazeret Donemi Baslat</Text>
            </TouchableOpacity>
          )}

          {ozelGunAyarlari.aktifOzelGun && (
            <View style={[styles.aktifMazeretKutusu, { backgroundColor: '#FFF0F5' }]}>
              <Text style={[styles.aktifMazeretBaslik, { color: '#D81B60' }]}>
                Aktif Mazeret Donemi
              </Text>
              <Text style={[styles.aktifMazeretTarih, { color: '#AD1457' }]}>
                {new Date(ozelGunAyarlari.aktifOzelGun.baslangicTarihi).toLocaleDateString(
                  'tr-TR'
                )}{' '}
                -{' '}
                {new Date(ozelGunAyarlari.aktifOzelGun.bitisTarihi).toLocaleDateString(
                  'tr-TR'
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Tehlikeli Bolge */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: '#DC2626' }]}>
            TEHLIKELI BOLGE
          </Text>

          <TouchableOpacity
            style={[styles.tehlikeButonu, { backgroundColor: '#FEE2E2' }]}
            onPress={handleSeriSifirla}
            activeOpacity={0.7}
          >
            <Text style={styles.tehlikeIkon}>⚠️</Text>
            <View style={styles.tehlikeMetinContainer}>
              <Text style={[styles.tehlikeBaslik, { color: '#DC2626' }]}>
                Seri Verilerini Sifirla
              </Text>
              <Text style={[styles.tehlikeAciklama, { color: '#DC2626' }]}>
                Tum seri, rozet ve puan verilerini sil
              </Text>
            </View>
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
  // Kart stilleri
  kartContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kartBaslik: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  kartIkon: {
    fontSize: 22,
    marginRight: 12,
  },
  kartBaslikMetinContainer: {
    flex: 1,
  },
  kartBaslikMetin: {
    fontSize: 16,
    fontWeight: '600',
  },
  kartAciklama: {
    fontSize: 13,
    marginTop: 2,
  },
  // Secim grubu stilleri
  secimContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  secimButon: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  secimMetin: {
    fontSize: 14,
    fontWeight: '600',
  },
  ekAciklama: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  // Toggle satiri stilleri
  toggleSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  toggleIkon: {
    fontSize: 24,
    marginRight: 14,
  },
  toggleMetinContainer: {
    flex: 1,
  },
  toggleBaslik: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleAciklama: {
    fontSize: 13,
    marginTop: 2,
  },
  // Aksiyon butonu
  aksiyonButonu: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  aksiyonButonMetin: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Aktif mazeret kutusu
  aktifMazeretKutusu: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFC0CB',
  },
  aktifMazeretBaslik: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aktifMazeretTarih: {
    fontSize: 13,
  },
  // Tehlike butonu stilleri
  tehlikeButonu: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  tehlikeIkon: {
    fontSize: 24,
    marginRight: 14,
  },
  tehlikeMetinContainer: {
    flex: 1,
  },
  tehlikeBaslik: {
    fontSize: 15,
    fontWeight: '600',
  },
  tehlikeAciklama: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});
