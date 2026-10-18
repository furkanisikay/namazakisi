/**
 * Seri hedefi sayfası — tam gün eşiği ve seriyi sıfırlama.
 * Sade tasarım (Dalga 3): özel gün Hatırlatmalar sayfasına (hatırlatmaları da durdurur),
 * "Kurulumu yeniden başlat" Yardım sayfasına taşındı; gün sonu hatırlatması
 * Hatırlatmalar > Günü tamamlamadıysam'dadır.
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
  Animated,
  Easing,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  seriAyarlariniGuncelle,
  seriStateSifirla,
} from '../store/seriSlice';
import { BildirimModali, BildirimTipi } from '../components/common/BildirimModali';
import { VurguSaglayici } from '../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../components/ayar/AyarCapasi';
import { AYARLANABILIR_EYLEMLER, useSayisalAdim } from '../hooks/useSayisalAdim';

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
  const { gorunenDeger, azaltDugmesi, artirDugmesi, erisilebilirlikEylemi } = useSayisalAdim({
    deger,
    min,
    max,
    adim,
    onChange,
  });
  const altta = gorunenDeger <= min;
  const ustte = gorunenDeger >= max;

  return (
    <View className="flex-row items-center justify-center gap-2">
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: altta ? renkler.sinir : butonRenk }}
        {...azaltDugmesi}
        disabled={altta}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Azalt"
      >
        <FontAwesome5
          name="minus"
          size={14}
          color={altta ? renkler.metinIkincil : '#FFFFFF'}
        />
      </TouchableOpacity>
      <View
        className="min-w-[60px] py-2 px-3 rounded-lg border flex-row items-center justify-center gap-1"
        style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Değer"
        accessibilityValue={{ min, max, now: gorunenDeger }}
        accessibilityActions={AYARLANABILIR_EYLEMLER}
        onAccessibilityAction={erisilebilirlikEylemi}
      >
        <Text className="text-lg font-bold" style={{ color: renkler.metin }}>
          {String(gorunenDeger).padStart(2, '0')}
        </Text>
        {birim ? (
          <Text className="text-sm" style={{ color: renkler.metinIkincil }}>{birim}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: ustte ? renkler.sinir : butonRenk }}
        {...artirDugmesi}
        disabled={ustte}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Artır"
      >
        <FontAwesome5
          name="plus"
          size={14}
          color={ustte ? renkler.metinIkincil : '#FFFFFF'}
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
  return (
    <VurguSaglayici>
      <SeriHedefAyarlariIcerik />
    </VurguSaglayici>
  );
};

/**
 * İçerik bileşeni `VurguSaglayici` altında yaşar — `useVurguKurulumu()`
 * yalnızca sağlayıcı içinde çağrılabilir.
 */
const SeriHedefAyarlariIcerik: React.FC = () => {
  const renkler = useRenkler();
  const scrollRef = useVurguKurulumu();
  const dispatch = useAppDispatch();

  const { ayarlar: seriAyarlari } = useAppSelector((state) => state.seri);

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

  return (
    <ScrollView
      ref={scrollRef}
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

          <AyarCapasi id="tamGunEsigi">
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
          </AyarCapasi>
        </View>

        {/* Tehlikeli Bolge */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: '#DC2626' }}
          >
            SIFIRLAMA
          </Text>

          <TouchableOpacity
            className="flex-row items-center p-4 rounded-xl"
            style={{ backgroundColor: '#FEE2E2' }}
            onPress={handleSeriSifirla}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Seri Verilerini Sıfırla"
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#DC262620' }}
            >
              <FontAwesome5 name="exclamation-triangle" size={18} color="#DC2626" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: '#DC2626' }}>
                Seri Verilerini Sıfırla
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: '#DC2626', opacity: 0.8 }}>
                Tüm seri, rozet ve puan verilerini siler
              </Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#DC2626" />
          </TouchableOpacity>
        </View>

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
