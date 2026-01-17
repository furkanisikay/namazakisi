/**
 * Seri ve Hedef Ayarlari Sayfasi
 * Tam gun esigi, gun bitis saati ve ozel gun modu ayarlari
 */

import * as React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
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
import type { GunSonuBildirimModu, BildirimGunSecimi } from '../../core/types/SeriTipleri';
import { OzelGunTakvimi } from '../components';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';
import { KonumYoneticiServisi } from '../../domain/services/KonumYoneticiServisi';

// ==================== SAYISAL SECİCİ BİLEŞENİ ====================

interface SayisalSeciciProps {
  deger: number;
  min: number;
  max: number;
  adim?: number;
  birim?: string;
  onChange: (yeniDeger: number) => void;
  renk?: string;
}

const SayisalSecici: React.FC<SayisalSeciciProps> = ({
  deger,
  min,
  max,
  adim = 1,
  birim = '',
  onChange,
  renk,
}) => {
  const renkler = useRenkler();
  const butonRenk = renk || renkler.birincil;

  const azalt = useCallback(() => {
    const yeni = Math.max(min, deger - adim);
    onChange(yeni);
  }, [deger, min, adim, onChange]);

  const artir = useCallback(() => {
    const yeni = Math.min(max, deger + adim);
    onChange(yeni);
  }, [deger, max, adim, onChange]);

  return (
    <View style={sayisalStyles.container}>
      <TouchableOpacity
        style={[sayisalStyles.buton, { backgroundColor: deger <= min ? renkler.sinir : butonRenk }]}
        onPress={azalt}
        disabled={deger <= min}
        activeOpacity={0.7}
      >
        <Text style={sayisalStyles.butonMetin}>−</Text>
      </TouchableOpacity>
      <View style={[sayisalStyles.degerContainer, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
        <Text style={[sayisalStyles.deger, { color: renkler.metin }]}>
          {String(deger).padStart(2, '0')}
        </Text>
        {birim ? <Text style={[sayisalStyles.birim, { color: renkler.metinIkincil }]}>{birim}</Text> : null}
      </View>
      <TouchableOpacity
        style={[sayisalStyles.buton, { backgroundColor: deger >= max ? renkler.sinir : butonRenk }]}
        onPress={artir}
        disabled={deger >= max}
        activeOpacity={0.7}
      >
        <Text style={sayisalStyles.butonMetin}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const sayisalStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonMetin: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  degerContainer: {
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deger: {
    fontSize: 18,
    fontWeight: '700',
  },
  birim: {
    fontSize: 14,
  },
});

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
  const konumAyarlari = useAppSelector((state) => state.konum);
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

  // Konum servisi instance
  const konumServisi = KonumYoneticiServisi.getInstance();

  // İmsak vakti state
  const [imsakVakti, setImsakVakti] = useState<Date | null>(null);
  const [konumMetni, setKonumMetni] = useState<string>('Konum yükleniyor...');

  // Konum bilgisini yükle ve imsak vaktini hesapla
  useEffect(() => {
    const konumYukle = async () => {
      // Konum ayarlarindan koordinatlari al
      const koordinatlar = konumAyarlari.koordinatlar;
      if (koordinatlar) {
        konumServisi.koordinatlarAyarla(koordinatlar.lat, koordinatlar.lng);
      }

      const vakit = konumServisi.sonrakiGunImsakVaktiGetir();
      setImsakVakti(vakit);
      setKonumMetni(konumServisi.getKonumMetni());
    };
    konumYukle();
  }, [konumAyarlari.koordinatlar]);

  // Tam gun esigi secenekleri
  const tamGunEsikleri = [
    { deger: 3, etiket: '3 vakit' },
    { deger: 4, etiket: '4 vakit' },
    { deger: 5, etiket: '5 vakit' },
  ];

  // Mod seçenekleri
  const modSecenekleri = [
    { deger: 'otomatik' as GunSonuBildirimModu, etiket: '🔄 Otomatik' },
    { deger: 'sabit' as GunSonuBildirimModu, etiket: '⏰ Sabit' },
  ];

  // Gün seçenekleri (sabit mod için)
  const gunSecenekleri = [
    { deger: 'ayniGun' as BildirimGunSecimi, etiket: 'Aynı Gün' },
    { deger: 'ertesiGun' as BildirimGunSecimi, etiket: 'Ertesi Gün' },
  ];

  // Handlers
  const handleEsikSecimi = (esik: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { tamGunEsigi: esik } }));
  };

  const handleModSecimi = (mod: GunSonuBildirimModu) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimModu: mod } }));
  };

  const handleGunSecimi = (gun: BildirimGunSecimi) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { bildirimGunSecimi: gun } }));
  };

  const handleImsakOncesiDakikaChange = (dakika: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { bildirimImsakOncesiDk: dakika } }));
  };

  const handleSabitSaatChange = (saat: number) => {
    // Validasyon: Ertesi gün seçiliyse imsak vaktini geçemez
    if (seriAyarlari.bildirimGunSecimi === 'ertesiGun' && imsakVakti) {
      const imsakSaat = imsakVakti.getHours();
      const imsakDakika = imsakVakti.getMinutes();
      const seciliToplam = saat * 60 + (seriAyarlari.bildirimDakikasi || 0);
      const imsakToplam = imsakSaat * 60 + imsakDakika;

      if (seciliToplam >= imsakToplam) {
        Alert.alert(
          'Uyarı',
          `Seçilen saat imsak vaktini (${String(imsakSaat).padStart(2, '0')}:${String(imsakDakika).padStart(2, '0')}) geçemez.`
        );
        return;
      }
    }
    dispatch(seriAyarlariniGuncelle({ ayarlar: { bildirimSaati: saat } }));
  };

  const handleSabitDakikaChange = (dakika: number) => {
    // Validasyon: Ertesi gün seçiliyse imsak vaktini geçemez
    if (seriAyarlari.bildirimGunSecimi === 'ertesiGun' && imsakVakti) {
      const imsakSaat = imsakVakti.getHours();
      const imsakDakika = imsakVakti.getMinutes();
      const seciliToplam = (seriAyarlari.bildirimSaati || 0) * 60 + dakika;
      const imsakToplam = imsakSaat * 60 + imsakDakika;

      if (seciliToplam >= imsakToplam) {
        Alert.alert(
          'Uyarı',
          `Seçilen saat imsak vaktini (${String(imsakSaat).padStart(2, '0')}:${String(imsakDakika).padStart(2, '0')}) geçemez.`
        );
        return;
      }
    }
    dispatch(seriAyarlariniGuncelle({ ayarlar: { bildirimDakikasi: dakika } }));
  };

  // Hesaplanmış bildirim saatini formatla
  const hesaplananBildirimSaati = React.useMemo(() => {
    if (seriAyarlari.gunSonuBildirimModu === 'otomatik' && imsakVakti) {
      const bildirimMs = imsakVakti.getTime() - (seriAyarlari.bildirimImsakOncesiDk || 30) * 60 * 1000;
      const bildirim = new Date(bildirimMs);
      return `${String(bildirim.getHours()).padStart(2, '0')}:${String(bildirim.getMinutes()).padStart(2, '0')}`;
    }
    return `${String(seriAyarlari.bildirimSaati || 4).padStart(2, '0')}:${String(seriAyarlari.bildirimDakikasi || 0).padStart(2, '0')}`;
  }, [seriAyarlari, imsakVakti]);

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
            baslik="Tam Gün Eşiği"
            aciklama="O günün serisini tamamlandı saymak için günde kılmanız gereken minimum namaz sayısını belirler"
            ikon="📊"
          >
            <SecimGrubu
              secenekler={tamGunEsikleri}
              seciliDeger={seriAyarlari.tamGunEsigi}
              onSecim={handleEsikSecimi}
            />
          </AyarKarti>
        </View>

        {/* Ozel Gun Modu Bolumu */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            ÖZEL GÜN MODU
          </Text>

          <View style={[styles.toggleSatiri, { backgroundColor: renkler.kartArkaplan }]}>
            <Text style={styles.toggleIkon}>✨</Text>
            <View style={styles.toggleMetinContainer}>
              <Text style={[styles.toggleBaslik, { color: renkler.metin }]}>
                Özel Gün Modu
              </Text>
              <Text style={[styles.toggleAciklama, { color: renkler.metinIkincil }]}>
                Özel günlerde seriyi dondurma imkanı sağlar
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
              <Text style={styles.aksiyonButonMetin}>🌸 Özel Gün Başlat</Text>
            </TouchableOpacity>
          )}

          {ozelGunAyarlari.aktifOzelGun && (
            <View style={[styles.aktifMazeretKutusu, { backgroundColor: '#FFF0F5' }]}>
              <Text style={[styles.aktifMazeretBaslik, { color: '#D81B60' }]}>
                Aktif Özel Gün
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
            TEHLİKELİ BÖLGE
          </Text>

          <TouchableOpacity
            style={[styles.tehlikeButonu, { backgroundColor: '#FEE2E2' }]}
            onPress={handleSeriSifirla}
            activeOpacity={0.7}
          >
            <Text style={styles.tehlikeIkon}>⚠️</Text>
            <View style={styles.tehlikeMetinContainer}>
              <Text style={[styles.tehlikeBaslik, { color: '#DC2626' }]}>
                Seri Verilerini Sıfırla
              </Text>
              <Text style={[styles.tehlikeAciklama, { color: '#DC2626' }]}>
                Tüm seri, rozet ve puan verilerini siler
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
  // Gün bitiş modu stilleri
  modIcerik: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  modBaslik: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  ayarSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ayarEtiketi: {
    fontSize: 14,
    fontWeight: '500',
  },
  bilgiMetni: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  saatSeciciContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  saatSecici: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saatAyirici: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 4,
  },
  uyariMetni: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
  },
  // Bilgi kartı stilleri
  bilgiKarti: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  bilgiKartiIcerik: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bilgiKartiIkon: {
    fontSize: 24,
    marginRight: 14,
  },
  bilgiKartiMetinContainer: {
    flex: 1,
  },
  bilgiKartiBaslik: {
    fontSize: 16,
    fontWeight: '600',
  },
  bilgiKartiAciklama: {
    fontSize: 13,
    marginTop: 2,
  },
  bilgiKartiDeger: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bilgiKartiDegerMetin: {
    fontSize: 14,
    fontWeight: '600',
  },
});
