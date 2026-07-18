/**
 * Seri ve Hedef Ayarlari Sayfasi
 * Tam gun esigi, gun bitis saati ve ozel gun modu ayarlari
 * 
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
 */

import * as React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  seriAyarlariniGuncelle,
  seriStateSifirla,
  ozelGunModuDurumunuGuncelle,
  ozelGunBaslat,
} from '../store/seriSlice';
import { OzelGunTakvimi } from '../components';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { BildirimModali, BildirimTipi } from '../components/common/BildirimModali';

/**
 * Bildirim/onay modalı durumu — Alert.alert yerine tema-uyumlu BildirimModali ile
 * gösterilir. İki-butonlu onaylarda (sıfırla/sihirbaz) birincil eylem + tehlikeli stil,
 * tek-butonlu başarı bildirimlerinde yalnız "Tamam" kullanılır.
 */
interface SeriBildirimi {
  gorunur: boolean;
  tip: BildirimTipi;
  baslik: string;
  mesaj: string;
  birincilEtiket?: string;
  birincilIkon?: string;
  onBirincil?: () => void;
  kapatEtiketi?: string;
  tehlikeli?: boolean;
}

/**
 * Sayisal secici bileseni
 */
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
    <View className="flex-row items-center justify-center gap-2">
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: deger <= min ? renkler.sinir : butonRenk }}
        onPress={azalt}
        disabled={deger <= min}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Azalt"
      >
        <FontAwesome5
          name="minus"
          size={14}
          color={deger <= min ? renkler.metinIkincil : '#FFFFFF'}
        />
      </TouchableOpacity>
      <View
        className="min-w-[60px] py-2 px-3 rounded-lg border flex-row items-center justify-center gap-1"
        style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
      >
        <Text className="text-lg font-bold" style={{ color: renkler.metin }}>
          {String(deger).padStart(2, '0')}
        </Text>
        {birim ? (
          <Text className="text-sm" style={{ color: renkler.metinIkincil }}>{birim}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: deger >= max ? renkler.sinir : butonRenk }}
        onPress={artir}
        disabled={deger >= max}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Artır"
      >
        <FontAwesome5
          name="plus"
          size={14}
          color={deger >= max ? renkler.metinIkincil : '#FFFFFF'}
        />
      </TouchableOpacity>
    </View>
  );
};

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
    <View className="flex-row gap-2">
      {secenekler.map((secenek) => {
        const seciliMi = seciliDeger === secenek.deger;
        return (
          <TouchableOpacity
            key={secenek.deger}
            className="flex-1 py-3 rounded-xl border-2 items-center"
            style={{
              backgroundColor: seciliMi ? renkler.birincil : renkler.kartArkaplan,
              borderColor: seciliMi ? renkler.birincil : renkler.sinir,
            }}
            onPress={() => handleSecim(secenek.deger)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={secenek.etiket}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: seciliMi ? '#FFFFFF' : renkler.metin }}
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
  ikonAdi: string;
  children: React.ReactNode;
}

const AyarKarti: React.FC<AyarKartiProps> = ({
  baslik,
  aciklama,
  ikonAdi,
  children,
}) => {
  const renkler = useRenkler();

  return (
    <View
      className="rounded-xl p-4 mb-3 shadow-sm"
      style={{ backgroundColor: renkler.kartArkaplan }}
    >
      <View className="flex-row items-start mb-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${renkler.birincil}15` }}
        >
          <FontAwesome5 name={ikonAdi} size={18} color={renkler.birincil} solid />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
            {baslik}
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
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
  const navigation = useNavigation();
  const { butonTiklandiFeedback } = useFeedback();

  const { ayarlar: seriAyarlari, ozelGunAyarlari } = useAppSelector((state) => state.seri);
  const [takvimGorunur, setTakvimGorunur] = useState(false);

  // Alert.alert yerine tema-uyumlu bildirim/onay modalı
  const [bildirim, setBildirim] = useState<SeriBildirimi>({
    gorunur: false,
    tip: 'basari',
    baslik: '',
    mesaj: '',
  });
  const bildirimKapat = useCallback(
    () => setBildirim((onceki) => ({ ...onceki, gorunur: false })),
    []
  );
  // Tek-butonlu başarı/bilgi bildirimi göster
  const basariBildiriminiGoster = useCallback((baslik: string, mesaj: string) => {
    setBildirim({ gorunur: true, tip: 'basari', baslik, mesaj });
  }, []);

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

  // Handlers
  const handleEsikSecimi = (esik: number) => {
    dispatch(seriAyarlariniGuncelle({ ayarlar: { tamGunEsigi: esik } }));
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
    basariBildiriminiGoster(
      'Başarılı',
      'Özel gün modu başlatıldı. Seriniz seçilen tarihler arasında dondurulacaktır.'
    );
  };

  const handleSeriSifirla = () => {
    setBildirim({
      gorunur: true,
      tip: 'hata',
      baslik: 'Seri Sıfırla',
      mesaj: 'Tüm seri verileriniz (seri, rozetler, puanlar) sıfırlanacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      birincilEtiket: 'Sıfırla',
      birincilIkon: 'trash-alt',
      tehlikeli: true,
      kapatEtiketi: 'İptal',
      onBirincil: () => {
        dispatch(seriStateSifirla());
        basariBildiriminiGoster('Başarılı', 'Seri verileriniz sıfırlandı.');
      },
    });
  };

  const handleKurulumSifirla = () => {
    setBildirim({
      gorunur: true,
      tip: 'bilgi',
      baslik: 'Kurulumu Sıfırla',
      mesaj: 'Kurulum sihirbazı yeniden başlatılacak. Namaz, seri ve puan verileriniz korunacaktır. Devam etmek istiyor musunuz?',
      birincilEtiket: 'Sihirbazı Aç',
      birincilIkon: 'magic',
      kapatEtiketi: 'İptal',
      onBirincil: async () => {
        bildirimKapat();
        await AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'KurulumSihirbazi' }],
          })
        );
      },
    });
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Hedef Ayarlari Bolumu */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            HEDEF AYARLARI
          </Text>

          <AyarKarti
            baslik="Tam Gün Eşiği"
            aciklama="O günün serisini tamamlandı saymak için günde kılmanız gereken minimum namaz sayısını belirler"
            ikonAdi="chart-bar"
          >
            <SecimGrubu
              secenekler={tamGunEsikleri}
              seciliDeger={seriAyarlari.tamGunEsigi}
              onSecim={handleEsikSecimi}
            />
          </AyarKarti>
        </View>

        {/* Ozel Gun Modu Bolumu */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            ÖZEL GÜN MODU
          </Text>

          <View
            className="flex-row items-center p-4 rounded-xl mb-2"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: renkler.vurgu + '20' }}
            >
              <FontAwesome5 name="magic" size={18} color={renkler.vurgu} solid />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                Özel Gün Modu
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                Özel günlerde seriyi dondurma imkanı sağlar
              </Text>
            </View>
            <Switch
              value={ozelGunAyarlari.ozelGunModuAktif}
              onValueChange={handleOzelGunModuToggle}
              trackColor={{ false: renkler.sinir, true: renkler.vurgu + '80' }}
              thumbColor={ozelGunAyarlari.ozelGunModuAktif ? renkler.vurgu : '#f4f3f4'}
            />
          </View>

          {ozelGunAyarlari.ozelGunModuAktif && !ozelGunAyarlari.aktifOzelGun && (
            <TouchableOpacity
              className="py-3.5 rounded-xl items-center flex-row justify-center gap-2"
              style={{ backgroundColor: renkler.vurgu }}
              onPress={() => setTakvimGorunur(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Özel Gün Başlat"
            >
              <FontAwesome5 name="calendar-plus" size={16} color="#FFFFFF" />
              <Text className="text-base font-bold text-white">
                Özel Gün Başlat
              </Text>
            </TouchableOpacity>
          )}

          {ozelGunAyarlari.aktifOzelGun && (
            <View
              className="p-4 rounded-xl border"
              style={{ backgroundColor: renkler.vurgu + '10', borderColor: renkler.vurgu + '50' }}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <FontAwesome5 name="check-circle" size={16} color={renkler.vurgu} solid />
                <Text className="text-sm font-bold" style={{ color: renkler.vurgu }}>
                  Aktif Özel Gün
                </Text>
              </View>
              <Text className="text-sm" style={{ color: renkler.vurgu }}>
                {new Date(ozelGunAyarlari.aktifOzelGun.baslangicTarihi).toLocaleDateString('tr-TR')}{' '}
                -{' '}
                {new Date(ozelGunAyarlari.aktifOzelGun.bitisTarihi).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          )}
        </View>

        {/* Tehlikeli Bolge */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.hata }}
          >
            TEHLİKELİ BÖLGE
          </Text>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-xl"
            style={{ backgroundColor: renkler.hata + '15' }}
            onPress={handleSeriSifirla}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Seri Verilerini Sıfırla"
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: renkler.hata + '20' }}
            >
              <FontAwesome5 name="exclamation-triangle" size={18} color={renkler.hata} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: renkler.hata }}>
                Seri Verilerini Sıfırla
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: renkler.hata, opacity: 0.8 }}>
                Tüm seri, rozet ve puan verilerini siler
              </Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color={renkler.hata} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-xl mt-2"
            style={{ backgroundColor: renkler.uyari + '15' }}
            onPress={handleKurulumSifirla}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Kurulum Sihirbazını Yeniden Çalıştır"
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: renkler.uyari + '20' }}
            >
              <FontAwesome5 name="redo-alt" size={18} color={renkler.uyari} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: renkler.uyari }}>
                Kurulum Sihirbazını Yeniden Çalıştır
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: renkler.uyari, opacity: 0.8 }}>
                Verileriniz silinmez, yalnızca kurulum ekranı açılır
              </Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color={renkler.uyari} />
          </TouchableOpacity>
        </View>

        {/* Ozel Gun Takvimi Modal */}
        <OzelGunTakvimi
          gorunur={takvimGorunur}
          onKapat={() => setTakvimGorunur(false)}
          onBaslat={handleMazeretBaslat}
        />

        {/* Bildirim/onay modalı — Alert.alert yerine tema-uyumlu modal */}
        <BildirimModali
          gorunur={bildirim.gorunur}
          tip={bildirim.tip}
          baslik={bildirim.baslik}
          mesaj={bildirim.mesaj}
          birincilEtiket={bildirim.birincilEtiket}
          birincilIkon={bildirim.birincilIkon}
          onBirincil={bildirim.onBirincil}
          tehlikeli={bildirim.tehlikeli}
          kapatEtiketi={bildirim.kapatEtiketi}
          onKapat={bildirimKapat}
        />
      </Animated.View>
    </ScrollView>
  );
};
