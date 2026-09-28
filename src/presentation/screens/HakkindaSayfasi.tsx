/**
 * Hakkinda Sayfasi
 * Uygulama bilgileri ve versiyonu
 * Guncelleme kontrolu dahil
 *
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
 */

import * as React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Easing,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRenkler } from '../../core/theme';
import { UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { guncellemeKontrolEt } from '../store/guncellemeSlice';
import { Logger } from '../../core/utils/Logger';
import { guvenilirBaglantiMi } from '../../domain/services/GuncellemeServisi';

/**
 * Bilgi satiri bileseni
 */
interface BilgiSatiriProps {
  etiket: string;
  deger: string;
  ikonAdi?: string;
  onPress?: () => void;
}

const BilgiSatiri: React.FC<BilgiSatiriProps> = ({ etiket, deger, ikonAdi, onPress }) => {
  const renkler = useRenkler();

  const icerik = (
    <View
      className="flex-row justify-between items-center py-3.5 px-4 border-b"
      style={{ borderBottomColor: renkler.sinir }}
    >
      <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
        {etiket}
      </Text>
      <View className="flex-row items-center gap-2">
        {ikonAdi && (
          <FontAwesome5
            name={ikonAdi}
            size={14}
            color={onPress ? renkler.birincil : renkler.metin}
          />
        )}
        <Text
          className="text-sm font-semibold"
          style={{ color: onPress ? renkler.birincil : renkler.metin }}
        >
          {deger}
        </Text>
        {onPress && (
          <FontAwesome5
            name="external-link-alt"
            size={10}
            color={renkler.birincil}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="link"
        accessibilityLabel={`${etiket}: ${deger}`}
        accessibilityHint="Tarayıcıda açılır"
      >
        {icerik}
      </TouchableOpacity>
    );
  }

  return icerik;
};

/**
 * Hakkinda Sayfasi
 */
export const HakkindaSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();

  // Guncelleme durumu
  const kontrolEdiliyor = useAppSelector((state) => state.guncelleme.kontrolEdiliyor);
  const guncellemeMevcut = useAppSelector((state) => state.guncelleme.guncellemeMevcut);
  const bilgi = useAppSelector((state) => state.guncelleme.bilgi);

  // Guncel yil
  const guncelYil = new Date().getFullYear();

  // Giris animasyonu
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Bağlantıyı sistem tarayıcısında açar. Kendisi DOĞRULAMA YAPMAZ: bu sayfadaki
  // bağlantılar koda gömülü sabitlerdir; dış kaynaktan gelen URL'ler (güncelleme
  // bağlantısı) çağırandan önce guvenilirBaglantiMi ile doğrulanır (handleIndirBasildi).
  const handleWebSitesiAc = (url: string) => {
    Linking.openURL(url).catch((hata) => {
      Logger.warn('HakkindaSayfasi', 'Baglanti acilamadi', hata);
    });
  };

  /**
   * Guncelleme indirme/yonlendirme butonuna basildi.
   * Play Store kaynaginda indirmeBaglantisi 'playstore://update' seklindedir —
   * guvenilirBaglantiMi bunu reddeder, bu yuzden Play Store akisi ayri ele alinir.
   * GitHub/sideload icin baglanti guvenilirBaglantiMi ile dogrulanir; gecemezse
   * sessizce loglanir ve hicbir sey yapilmaz (kullanici zarari olmaz).
   */
  const handleIndirBasildi = (indirmeBaglantisi: string) => {
    if (bilgi?.kaynak === 'playstore') {
      // Play Store native akisi — Linking ile degil, native modül üzerinden yönetilir.
      // Bu buton Play Store durumunda zaten gosterilmez (bildirim Play Store
      // native sheet'ini kullanir), ama savunma amacli kontrol eklenir.
      Logger.warn('HakkindaSayfasi', 'Play Store guncelleme akisi bu sayfadan baslatilamaz');
      return;
    }
    // Derinlemesine savunma: baglantinin guvenilir oldugunu dogrula
    if (!guvenilirBaglantiMi(indirmeBaglantisi)) {
      Logger.warn('HakkindaSayfasi', 'Guncelleme baglantisi guvenilmez domain iceriyor, islemi iptal edildi');
      return;
    }
    handleWebSitesiAc(indirmeBaglantisi);
  };

  // Manuel guncelleme kontrolu
  const handleGuncellemeKontrol = useCallback(() => {
    dispatch(guncellemeKontrolEt(true));
  }, [dispatch]);

  // Guncelleme butonu icerigi
  const guncellemeDurumMetni = kontrolEdiliyor
    ? 'Kontrol ediliyor...'
    : guncellemeMevcut && bilgi
      ? `${bilgi.yeniVersiyonEtiketi ?? `v${bilgi.yeniVersiyon}`} mevcut`
      : 'Güncel';

  const guncellemeDurumRengi = guncellemeMevcut && bilgi
    ? renkler.bilgi
    : renkler.basarili;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Logo ve Baslik */}
        <View
          className="rounded-2xl p-6 items-center mb-6 shadow-md"
          style={{ backgroundColor: renkler.kartArkaplan }}
        >
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg"
            style={{ backgroundColor: renkler.birincil }}
          >
            <FontAwesome5 name="mosque" size={36} color="#FFFFFF" solid />
          </View>
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: renkler.metin }}
          >
            {UYGULAMA.ADI}
          </Text>
          <Text
            className="text-sm text-center leading-5"
            style={{ color: renkler.metinIkincil }}
          >
            {UYGULAMA.ACIKLAMA}
          </Text>
        </View>

        {/* Uygulama Bilgileri */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            UYGULAMA BİLGİLERİ
          </Text>

          <View
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            <BilgiSatiri
              etiket="Versiyon"
              deger={UYGULAMA.VERSIYON}
              ikonAdi="code-branch"
            />
            <BilgiSatiri
              etiket="Geliştirici"
              deger="Furkan ISIKAY"
              ikonAdi="user"
              onPress={() => handleWebSitesiAc('https://furkanisikay.com.tr')}
            />
            <BilgiSatiri
              etiket="GitHub"
              deger="namazakisi"
              ikonAdi="github"
              onPress={() => handleWebSitesiAc('https://github.com/furkanisikay/namazakisi')}
            />
          </View>
        </View>

        {/* Guncelleme Kontrolu */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            GÜNCELLEME
          </Text>

          {/* "İndir" butonu kontrol butonunun İÇİNDE değil KARDEŞİNDE durur: Touchable
              çocuklarını tek erişilebilirlik düğümüne düzleştirir, iç içe buton TalkBack'e
              görünmez ve dokunma hedefleri çakışır (AGENTS.md). */}
          <View
            className="flex-row items-center rounded-xl"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            <TouchableOpacity
              onPress={handleGuncellemeKontrol}
              disabled={kontrolEdiliyor}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center py-3.5 px-4"
              // Etiket VERİLMEZ: başlık + durum metni ("Güncel", "… mevcut") birlikte okunsun.
              accessibilityRole="button"
              accessibilityState={{ disabled: kontrolEdiliyor, busy: kontrolEdiliyor }}
            >
              <View
                className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
                style={{ backgroundColor: `${guncellemeDurumRengi}26` }}
              >
                {kontrolEdiliyor ? (
                  <ActivityIndicator size="small" color={renkler.bilgi} />
                ) : (
                  <MaterialIcons
                    name="system-update"
                    size={22}
                    color={guncellemeDurumRengi}
                  />
                )}
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: renkler.metin }}
                >
                  Güncelleme Kontrolü
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: guncellemeDurumRengi }}
                >
                  {guncellemeDurumMetni}
                </Text>
              </View>
              {!(guncellemeMevcut && bilgi) && (
                <MaterialIcons
                  name="refresh"
                  size={20}
                  color={renkler.metinIkincil}
                />
              )}
            </TouchableOpacity>
            {guncellemeMevcut && bilgi && (
              <TouchableOpacity
                onPress={() => handleIndirBasildi(bilgi.indirmeBaglantisi)}
                className="px-3 py-1.5 rounded-lg mr-4"
                style={{ backgroundColor: renkler.bilgi }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Güncellemeyi indirin"
              >
                <Text className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
                  İndir
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Telif Hakki */}
        <View className="items-center mt-4">
          <Text className="text-xs mb-0.5" style={{ color: renkler.metinIkincil }}>
            © {guncelYil} Furkan ISIKAY
          </Text>
          <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
            Tüm hakları saklıdır.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};
