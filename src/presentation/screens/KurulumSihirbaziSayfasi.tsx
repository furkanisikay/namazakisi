/**
 * Kurulum Sihirbazi
 * 9 adimli profesyonel ilk kurulum deneyimi
 * Adimlar: Hosgeldiniz → Bildirim İzni → Konum → Tema → Vakit Bildirimleri
 *          → Muhafız Tanıtım → Muhafız Yoğunluk → Özel Gün → Hazır
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Switch,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useDispatch } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTema } from '../../core/theme';
import { RENK_PALETLERI } from '../../core/theme/temalar';
import type { TemaModu } from '../../core/theme/temalar';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { tumVakitBildirimAyarlariniGuncelle } from '../store/vakitBildirimSlice';
import { muhafizAyarlariniGuncelle, HATIRLATMA_PRESETLERI } from '../store/muhafizSlice';
import { konumAyarlariniGuncelle } from '../store/konumSlice';
import type { AppDispatch } from '../store/store';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { TurkiyeKonumServisi, TURKIYE_ILLERI_OFFLINE } from '../../domain/services/TurkiyeKonumServisi';
import type { Il } from '../../domain/services/TurkiyeKonumServisi';
import { KonumIzniDisclosureModali } from '../components/KonumIzniDisclosureModali';

type Props = NativeStackScreenProps<RootStackParamList, 'KurulumSihirbazi'>;

const { width: EKRAN_GENISLIGI } = Dimensions.get('window');
const TOPLAM_ADIM = 9;

// Adım sabitleri — okunabilirlik için
const ADIM = {
  HOSGELDINIZ: 0,
  BILDIRIM_IZNI: 1,
  KONUM: 2,
  TEMA: 3,
  VAKIT_BILDIRIM: 4,
  MUHAFIZ_TANITIM: 5,
  MUHAFIZ_YOGUNLUK: 6,
  OZEL_GUN: 7,
  HAZIR: 8,
} as const;

type BildirimAyarlari = {
  imsak: boolean;
  ogle: boolean;
  ikindi: boolean;
  aksam: boolean;
  yatsi: boolean;
};

type MuhafizYogunluk = 'hafif' | 'normal' | 'yogun' | 'ozel';
type KonumDurumu = 'bekliyor' | 'gpsAliniyor' | 'gpsBasarili' | 'gpsReddedildi';

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export const KurulumSihirbaziSayfasi: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { paletiDegistir, moduDegistir, palet, mod } = useTema();

  const [adim, setAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Bildirim izni
  const [bildirimIzni, setBildirimIzni] = useState<'bekliyor' | 'isteniyor' | 'verildi' | 'reddedildi'>('bekliyor');

  // Konum
  const [konumDurumu, setKonumDurumu] = useState<KonumDurumu>('bekliyor');
  const [konumBilgi, setKonumBilgi] = useState<string>('');
  const [manuelIl, setManuelIl] = useState<Il | null>(null);

  // Vakit bildirimleri
  const [bildirimler, setBildirimler] = useState<BildirimAyarlari>({
    imsak: true,
    ogle: true,
    ikindi: true,
    aksam: true,
    yatsi: true,
  });

  // Muhafız
  const [muhafizAktif, setMuhafizAktif] = useState(true);
  const [muhafizYogunluk, setMuhafizYogunluk] = useState<MuhafizYogunluk>('normal');

  // Konum izni disclosure modal
  const [disclosureGorunur, setDisclosureGorunur] = useState(false);
  const disclosureKabulRef = useRef<(() => void) | null>(null);

  // ─── Geçiş Animasyonu ────────────────────────────────────────────────────

  const gecisYap = useCallback((hedefAdim: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -28, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setAdim(hedefAdim);
      slideAnim.setValue(28);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const ilerle = useCallback(() => {
    if (adim < TOPLAM_ADIM - 1) gecisYap(adim + 1);
  }, [adim, gecisYap]);

  const geriDon = useCallback(() => {
    if (adim > 0) gecisYap(adim - 1);
  }, [adim, gecisYap]);

  // ─── Bildirim İzni ───────────────────────────────────────────────────────

  const bildirimIzniIste = useCallback(async () => {
    setBildirimIzni('isteniyor');
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setBildirimIzni('verildi');
      setTimeout(() => ilerle(), 1400);
    } else {
      setBildirimIzni('reddedildi');
    }
  }, [ilerle]);

  // ─── Konum İzni + GPS ────────────────────────────────────────────────────

  const konumIzniIsteInternal = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setKonumDurumu('gpsReddedildi');
        return;
      }
      setKonumDurumu('gpsAliniyor');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lng } = location.coords;

      let gpsAdres = { il: '', ilce: '', semt: '' };
      try {
        const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        const g = geo[0];
        gpsAdres = {
          il: g.city || g.region || '',
          ilce: g.district || g.subregion || '',
          semt: g.street || '',
        };
      } catch { /* geocode opsiyonel */ }

      dispatch(konumAyarlariniGuncelle({
        konumModu: 'oto',
        koordinatlar: { lat, lng },
        gpsAdres,
        sonGpsGuncellemesi: new Date().toISOString(),
      }));

      setKonumBilgi(gpsAdres.ilce || gpsAdres.il || 'Konum alındı');
      setKonumDurumu('gpsBasarili');
      setTimeout(() => ilerle(), 1400);
    } catch {
      setKonumDurumu('gpsReddedildi');
    }
  }, [dispatch, ilerle]);

  const konumIzniIste = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      await konumIzniIsteInternal();
      return;
    }
    disclosureKabulRef.current = () => { void konumIzniIsteInternal(); };
    setDisclosureGorunur(true);
  }, [konumIzniIsteInternal]);

  const disclosureKabulEt = useCallback(() => {
    setDisclosureGorunur(false);
    const cb = disclosureKabulRef.current;
    disclosureKabulRef.current = null;
    if (cb) cb();
  }, []);

  const disclosureReddet = useCallback(() => {
    setDisclosureGorunur(false);
    disclosureKabulRef.current = null;
    setKonumDurumu('gpsReddedildi');
  }, []);

  const manuelKonumKaydet = useCallback(() => {
    if (!manuelIl) return;
    dispatch(konumAyarlariniGuncelle({
      konumModu: 'manuel',
      seciliIlId: manuelIl.id,
      seciliIlAdi: manuelIl.ad,
      seciliSehirId: String(manuelIl.id),
      koordinatlar: { lat: manuelIl.lat, lng: manuelIl.lng },
      seciliIlceId: null,
      seciliIlceAdi: '',
    }));
    ilerle();
  }, [manuelIl, dispatch, ilerle]);

  // ─── Tamamla ─────────────────────────────────────────────────────────────

  const kurulumTamamla = useCallback(async () => {
    setYukleniyor(true);
    try {
      await dispatch(tumVakitBildirimAyarlariniGuncelle(bildirimler));
      if (muhafizAktif && muhafizYogunluk !== 'ozel') {
        await dispatch(muhafizAyarlariniGuncelle({
          aktif: true,
          yogunluk: muhafizYogunluk,
          gelismisMod: false,
          ...HATIRLATMA_PRESETLERI[muhafizYogunluk],
        }));
      } else if (muhafizAktif && muhafizYogunluk === 'ozel') {
        await dispatch(muhafizAyarlariniGuncelle({
          aktif: true,
          yogunluk: 'ozel',
          gelismisMod: true,
          ...HATIRLATMA_PRESETLERI.normal, // Ozel baslangic olarak normal preset
        }));
      } else {
        await dispatch(muhafizAyarlariniGuncelle({
          aktif: false,
          yogunluk: 'normal',
          gelismisMod: false,
          ...HATIRLATMA_PRESETLERI.normal,
        }));
      }
      await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI, 'true');
      navigation.replace('MainTabs');
    } catch {
      setYukleniyor(false);
    }
  }, [bildirimler, muhafizAktif, muhafizYogunluk, dispatch, navigation]);

  // ─── İlerleme Noktaları ──────────────────────────────────────────────────

  const renderNoktalar = () => (
    <View style={styles.noktaKapsayici}>
      {Array.from({ length: TOPLAM_ADIM }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.nokta,
            i === adim && styles.noktaAktif,
            i < adim && styles.noktaTamamlandi,
          ]}
        />
      ))}
    </View>
  );

  // ─── Adım Render ─────────────────────────────────────────────────────────

  const renderAdim = () => {
    switch (adim) {
      case ADIM.HOSGELDINIZ: return <HosgeldinizAdimi />;
      case ADIM.BILDIRIM_IZNI: return <BildirimIzniAdimi bildirimIzni={bildirimIzni} />;
      case ADIM.KONUM: return (
        <KonumAdimi
          konumDurumu={konumDurumu}
          konumBilgi={konumBilgi}
          manuelIl={manuelIl}
          setManuelIl={setManuelIl}
          onIzinIste={konumIzniIste}
          onAtla={ilerle}
          onManuelKaydet={manuelKonumKaydet}
        />
      );
      case ADIM.TEMA: return (
        <TemaAdimi
          palet={palet}
          mod={mod}
          paletiDegistir={paletiDegistir}
          moduDegistir={moduDegistir}
        />
      );
      case ADIM.VAKIT_BILDIRIM: return (
        <VakitBildirimAdimi bildirimler={bildirimler} onToggle={v => setBildirimler(p => ({ ...p, [v]: !p[v] }))} />
      );
      case ADIM.MUHAFIZ_TANITIM: return (
        <MuhafizTanitimAdimi muhafizAktif={muhafizAktif} setMuhafizAktif={setMuhafizAktif} />
      );
      case ADIM.MUHAFIZ_YOGUNLUK: return (
        <MuhafizYogunlukAdimi
          yogunluk={muhafizYogunluk}
          setYogunluk={setMuhafizYogunluk}
          muhafizAktif={muhafizAktif}
        />
      );
      case ADIM.OZEL_GUN: return <OzelGunAdimi />;
      case ADIM.HAZIR: return <HazirAdimi />;
      default: return null;
    }
  };

  // ─── Buton Render ────────────────────────────────────────────────────────

  const renderButon = () => {
    if (adim === ADIM.HOSGELDINIZ) {
      return (
        <TouchableOpacity
          style={[styles.buton, styles.butonBirincil, { backgroundColor: palet.birincil }]}
          onPress={ilerle}
        >
          <Text style={styles.butonMetin}>Kuruluma Başla</Text>
          <FontAwesome5 name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      );
    }
    if (adim === ADIM.BILDIRIM_IZNI) {
      if (bildirimIzni === 'isteniyor' || bildirimIzni === 'verildi') return null;
      if (bildirimIzni === 'reddedildi') {
        return (
          <TouchableOpacity
            style={[styles.buton, styles.butonBirincil, { backgroundColor: palet.birincil }]}
            onPress={ilerle}
          >
            <FontAwesome5 name="arrow-right" size={16} color="#fff" />
            <Text style={styles.butonMetin}>Şimdilik Geç</Text>
          </TouchableOpacity>
        );
      }
      return (
        <>
          <TouchableOpacity
            style={[styles.buton, styles.butonBirincil, { backgroundColor: palet.birincil }]}
            onPress={bildirimIzniIste}
          >
            <FontAwesome5 name="bell" size={16} color="#fff" />
            <Text style={styles.butonMetin}>Bildirimlere İzin Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.atlaButon} onPress={ilerle}>
            <Text style={styles.atlaButonMetin}>Şimdilik geç</Text>
          </TouchableOpacity>
        </>
      );
    }
    if (adim === ADIM.KONUM) {
      if (konumDurumu === 'bekliyor') {
        return (
          <>
            <TouchableOpacity
              style={[styles.buton, styles.butonBirincil, { backgroundColor: palet.birincil }]}
              onPress={konumIzniIste}
            >
              <FontAwesome5 name="map-marker-alt" size={16} color="#fff" />
              <Text style={styles.butonMetin}>Konum İznini Ver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.atlaButon} onPress={() => setKonumDurumu('gpsReddedildi')}>
              <Text style={styles.atlaButonMetin}>Manuel seçeceğim</Text>
            </TouchableOpacity>
          </>
        );
      }
      if (konumDurumu === 'gpsReddedildi') {
        return (
          <TouchableOpacity
            style={[styles.buton, styles.butonBirincil, { backgroundColor: manuelIl ? palet.birincil : '#9ca3af' }]}
            onPress={manuelKonumKaydet}
            disabled={!manuelIl}
          >
            <FontAwesome5 name="check" size={16} color="#fff" />
            <Text style={styles.butonMetin}>
              {manuelIl ? `${manuelIl.ad} ile Devam Et` : 'Şehir Seçin'}
            </Text>
          </TouchableOpacity>
        );
      }
      if (konumDurumu === 'gpsAliniyor' || konumDurumu === 'gpsBasarili') {
        return null; // auto-advance
      }
    }
    if (adim === ADIM.HAZIR) {
      return (
        <TouchableOpacity
          style={[styles.buton, styles.butonYesil]}
          onPress={kurulumTamamla}
          disabled={yukleniyor}
        >
          {yukleniyor
            ? <ActivityIndicator color="#fff" />
            : <><FontAwesome5 name="check" size={16} color="#fff" /><Text style={styles.butonMetin}>Uygulamayı Kullanmaya Başla</Text></>
          }
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={[styles.buton, styles.butonBirincil, { backgroundColor: palet.birincil }]}
        onPress={ilerle}
      >
        <Text style={styles.butonMetin}>Devam Et</Text>
        <FontAwesome5 name="arrow-right" size={16} color="#fff" />
      </TouchableOpacity>
    );
  };

  const geriGoster = adim > 0 && adim < ADIM.HAZIR
    && konumDurumu !== 'gpsAliniyor' && konumDurumu !== 'gpsBasarili';

  // ─── Özel Ekranlar (gradient arka plan) ──────────────────────────────────

  if (adim === ADIM.HOSGELDINIZ) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.tamEkran}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[styles.gradientKapsayici, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <HosgeldinizAdimi />
          <View style={styles.gradientButonAlani}>
            {renderNoktalar()}
            {renderButon()}
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  if (adim === ADIM.HAZIR) {
    return (
      <LinearGradient colors={['#064e3b', '#065f46', '#059669']} style={styles.tamEkran}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[styles.gradientKapsayici, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <HazirAdimi />
          <View style={styles.gradientButonAlani}>
            {renderNoktalar()}
            {renderButon()}
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ─── Standart Sayfa ───────────────────────────────────────────────────────

  return (
    <View style={styles.tamEkran}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.ustBar}>
        {geriGoster
          ? <TouchableOpacity onPress={geriDon} style={styles.geriButon}>
              <FontAwesome5 name="arrow-left" size={16} color="#6b7280" />
            </TouchableOpacity>
          : <View style={styles.geriButon} />}
        {renderNoktalar()}
        <View style={styles.geriButon} />
      </View>

      <Animated.View style={[styles.icerikAlani, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {renderAdim()}
      </Animated.View>

      <View style={styles.butonAlani}>
        {renderButon()}
      </View>

      <KonumIzniDisclosureModali
        gorunur={disclosureGorunur}
        tip="onPlan"
        onKabul={disclosureKabulEt}
        onReddet={disclosureReddet}
      />
    </View>
  );
};

// ─── Adım 0: Hoş Geldiniz ────────────────────────────────────────────────────

const HosgeldinizAdimi: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulse2Anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.18, duration: 1400, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
    ])).start();
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse2Anim, { toValue: 1.35, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse2Anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])).start();
    }, 500);
  }, []);

  return (
    <View style={styles.hosgeldinizIcerik}>
      <Animated.View style={[styles.halka2, { transform: [{ scale: pulse2Anim }] }]} />
      <Animated.View style={[styles.halka1, { transform: [{ scale: pulseAnim }] }]} />
      <View style={styles.moskeIkon}>
        <FontAwesome5 name="mosque" size={68} color="#fff" />
      </View>
      <Text style={styles.hosgeldinizBaslik}>Namaz Akışı</Text>
      <Text style={styles.hosgeldinizAltBaslik}>
        Günlük namazlarınızı takip etmenin en kolay yolu
      </Text>
      <Text style={styles.hosgeldinizAciklama}>
        Bu kurulum sihirbazı sizi yalnızca{' '}
        <Text style={{ fontWeight: '700' }}>birkaç dakika</Text> alacak.
        {'\n'}Adım adım uygulamayı size özel ayarlayacağız.
      </Text>
    </View>
  );
};

// ─── Adım 1: Bildirim İzni ───────────────────────────────────────────────────

const BildirimIzniAdimi: React.FC<{
  bildirimIzni: 'bekliyor' | 'isteniyor' | 'verildi' | 'reddedildi';
}> = ({ bildirimIzni }) => {
  const bellAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (bildirimIzni === 'bekliyor') {
      Animated.loop(Animated.sequence([
        Animated.timing(bellAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: -1, duration: 200, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.delay(2000),
      ])).start();
    }
  }, [bildirimIzni]);

  useEffect(() => {
    if (bildirimIzni === 'verildi') {
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }
  }, [bildirimIzni]);

  const rotate = bellAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] });

  // ── İsteniyor (loading) ──
  if (bildirimIzni === 'isteniyor') {
    return (
      <View style={styles.merkezliIcerik}>
        <ActivityIndicator size="large" color="#f59e0b" style={{ marginBottom: 20 }} />
        <Text style={styles.adimBaslik}>İzin Bekleniyor...</Text>
        <Text style={styles.adimAltBaslik}>Açılan sistem ekranında izin verin</Text>
      </View>
    );
  }

  // ── Verildi (başarı) ──
  if (bildirimIzni === 'verildi') {
    return (
      <View style={styles.merkezliIcerik}>
        <Animated.View style={[styles.buyukIkonCember, { backgroundColor: '#fef3c720', transform: [{ scale: scaleAnim }] }]}>
          <FontAwesome5 name="check-circle" size={52} color="#10b981" />
        </Animated.View>
        <Text style={styles.adimBaslik}>Bildirimler Açık!</Text>
        <Text style={styles.adimAltBaslik}>Namaz vakitleri yaklaştığında sizi bilgilendireceğiz.</Text>
        <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          Bir sonraki adıma geçiliyor...
        </Text>
      </View>
    );
  }

  // ── Reddedildi (fallback) ──
  if (bildirimIzni === 'reddedildi') {
    return (
      <View style={styles.merkezliIcerik}>
        <View style={[styles.buyukIkonCember, { backgroundColor: '#fef2f220' }]}>
          <FontAwesome5 name="bell-slash" size={44} color="#ef4444" />
        </View>
        <Text style={styles.adimBaslik}>İzin Verilmedi</Text>
        <Text style={styles.adimAltBaslik}>
          Bildirimler olmadan da uygulamayı kullanabilirsiniz.
          {'\n'}Daha sonra Ayarlar → Bildirimler bölümünden açabilirsiniz.
        </Text>
        <View style={[styles.bilgiKutu, { marginTop: 16 }]}>
          <FontAwesome5 name="info-circle" size={14} color="#3b82f6" />
          <Text style={styles.bilgiKutuMetin}>
            Bildirimleri açmak için telefonunuzun uygulama ayarlarından izin verebilirsiniz.
          </Text>
        </View>
      </View>
    );
  }

  // ── Bekliyor (varsayılan) ──
  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.buyukIkonCember, { backgroundColor: '#fef3c720' }, { transform: [{ rotate }] }]}>
        <FontAwesome5 name="bell" size={44} color="#f59e0b" />
      </Animated.View>

      <Text style={styles.adimBaslik}>Bildirim İzni</Text>
      <Text style={styles.adimAltBaslik}>
        Namazları hiç kaçırmamak için bildirim iznine ihtiyacımız var
      </Text>

      <InfoKutu
        ikon="clock"
        renk="#3b82f6"
        baslik="Namaz Vakti Bildirimleri"
        aciklama="Seçtiğiniz namaz vakitleri yaklaştığında sizi önceden bilgilendiririz."
      />
      <InfoKutu
        ikon="shield-alt"
        renk="#10b981"
        baslik="Namaz Muhafızı"
        aciklama="Namaz kılana kadar artan hatırlatmalar göndeririz — vakti kaçırmanız imkansız olur."
      />
      <InfoKutu
        ikon="fire"
        renk="#f97316"
        baslik="Seri & Rozetler"
        aciklama="Seriniz tehlikedeyken veya yeni bir rozet kazandığınızda bildirim alırsınız."
      />

      <View style={styles.gizlilikBanner}>
        <FontAwesome5 name="lock" size={14} color="#059669" />
        <Text style={styles.gizlilikBannerMetin}>
          <Text style={{ fontWeight: '700' }}>Gizlilik güvencesi:</Text> Bildirimler{' '}
          <Text style={{ fontWeight: '700' }}>yalnızca namaz vakitleri</Text> için kullanılır.
          Reklam veya pazarlama amaçlı bildirim gönderilmez.
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── Adım 2: Konum ───────────────────────────────────────────────────────────

const KonumAdimi: React.FC<{
  konumDurumu: KonumDurumu;
  konumBilgi: string;
  manuelIl: Il | null;
  setManuelIl: (il: Il) => void;
  onIzinIste: () => void;
  onAtla: () => void;
  onManuelKaydet: () => void;
}> = ({ konumDurumu, konumBilgi, manuelIl, setManuelIl }) => {

  if (konumDurumu === 'gpsAliniyor') {
    return (
      <View style={styles.merkezliIcerik}>
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginBottom: 20 }} />
        <Text style={styles.adimBaslik}>Konum Alınıyor...</Text>
        <Text style={styles.adimAltBaslik}>GPS sinyali bekleniyor, lütfen bekleyin</Text>
      </View>
    );
  }

  if (konumDurumu === 'gpsBasarili') {
    return (
      <View style={styles.merkezliIcerik}>
        <View style={[styles.buyukIkonCember, { backgroundColor: '#10b98120' }]}>
          <FontAwesome5 name="check-circle" size={52} color="#10b981" />
        </View>
        <Text style={styles.adimBaslik}>Konum Alındı</Text>
        <Text style={styles.adimAltBaslik}>{konumBilgi}</Text>
        <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          Namaz vakitleri hesaplanıyor...
        </Text>
      </View>
    );
  }

  if (konumDurumu === 'gpsReddedildi') {
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.buyukIkonCember, { backgroundColor: '#6366f120', alignSelf: 'center' }]}>
          <FontAwesome5 name="city" size={40} color="#6366f1" />
        </View>
        <Text style={[styles.adimBaslik, { textAlign: 'center' }]}>Şehrinizi Seçin</Text>
        <Text style={[styles.adimAltBaslik, { textAlign: 'center', marginBottom: 12 }]}>
          Doğru namaz vakitleri için bulunduğunuz ili seçin
        </Text>
        {manuelIl && (
          <View style={styles.seciliIlBanner}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#6366f1" />
            <Text style={styles.seciliIlMetin}>Seçili: {manuelIl.ad}</Text>
          </View>
        )}
        <FlatList
          data={TURKIYE_ILLERI_OFFLINE}
          keyExtractor={item => String(item.id)}
          style={styles.ilListesi}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.ilSatir,
                manuelIl?.id === item.id && styles.ilSatirSecili,
              ]}
              onPress={() => setManuelIl(item)}
            >
              <Text style={[
                styles.ilAdi,
                manuelIl?.id === item.id && styles.ilAdiSecili,
              ]}>
                {item.ad}
              </Text>
              {manuelIl?.id === item.id && (
                <FontAwesome5 name="check" size={14} color="#6366f1" />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // bekliyor durumu — varsayılan
  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: '#3b82f620', alignSelf: 'center' }]}>
        <FontAwesome5 name="map-marker-alt" size={44} color="#3b82f6" />
      </View>
      <Text style={styles.adimBaslik}>Konumunuz</Text>
      <Text style={styles.adimAltBaslik}>
        Namaz vakitleri ve kıble yönünün doğru hesaplanabilmesi için konum bilginize ihtiyacımız var
      </Text>

      <InfoKutu ikon="clock" renk="#10b981" baslik="Namaz Vakitleri" aciklama="Konum verisi yalnızca namaz vakitlerini hesaplamak için kullanılır. Coğrafi konuma göre vakitler farklılık gösterir." />
      <InfoKutu ikon="compass" renk="#f59e0b" baslik="Kıble Yönü" aciklama="Konum verisi, Kâbe'ye göre doğru kıble yönünün hesaplanmasında kullanılır." />
      <InfoKutu ikon="map-pin" renk="#8b5cf6" baslik="Seyahatte Otomatik Güncelleme" aciklama="İsteğe bağlı seyahat modu; siz bir şehirden diğerine geçtiğinizde namaz vakitlerini sessizce günceller. Varsayılan olarak kapalıdır." />

      <View style={styles.gizlilikBanner}>
        <FontAwesome5 name="lock" size={14} color="#059669" />
        <Text style={styles.gizlilikBannerMetin}>
          Konum veriniz{' '}
          <Text style={{ fontWeight: '700' }}>yalnızca cihazınızda işlenir</Text>;
          sunucularımıza gönderilmez, üçüncü taraflarla paylaşılmaz ve reklam/analitik amacıyla kullanılmaz.
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── Adım 3: Tema ────────────────────────────────────────────────────────────

const TemaAdimi: React.FC<{
  palet: typeof RENK_PALETLERI[0];
  mod: string;
  paletiDegistir: (id: string) => void;
  moduDegistir: (mod: TemaModu) => void;
}> = ({ palet, mod, paletiDegistir, moduDegistir }) => {
  const { koyuMu } = useTema();
  // Önizleme için seçili moda göre dark/light hesapla
  const onizlemeKoyu = mod === 'koyu' ? true : mod === 'acik' ? false : koyuMu;
  const onizlemeBg = onizlemeKoyu ? '#1f2937' : '#fff';
  const onizlemeMetin = onizlemeKoyu ? '#f9fafb' : '#111';
  const onizlemeMetinIkincil = onizlemeKoyu ? '#9ca3af' : '#6b7280';
  const onizlemeSinir = onizlemeKoyu ? '#374151' : '#e5e7eb';

  return (
  <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
    <View style={[styles.buyukIkonCember, { backgroundColor: palet.birincil + '25', alignSelf: 'center' }]}>
      <FontAwesome5 name="palette" size={44} color={palet.birincil} />
    </View>
    <Text style={styles.adimBaslik}>Tema Seçin</Text>
    <Text style={styles.adimAltBaslik}>Renk paleti seçin — uygulama anlık olarak değişir</Text>

    {/* Canlı önizleme — seçili moda göre dark/light */}
    <View style={[styles.onizlemeKart, { borderColor: palet.birincil + '40', backgroundColor: onizlemeBg }]}>
      <View style={[styles.onizlemeBaslik, { backgroundColor: palet.birincil }]}>
        <FontAwesome5 name="mosque" size={14} color="#fff" />
        <Text style={styles.onizlemeBaslikMetin}>Namaz Akışı</Text>
      </View>
      <View style={styles.onizlemeIcerik}>
        <View style={[styles.onizlemeVakitSatir, { borderLeftColor: palet.birincil }]}>
          <Text style={[styles.onizlemeVakitAdi, { color: palet.birincil }]}>Öğle</Text>
          <Text style={[styles.onizlemeVakitSaat, { color: onizlemeMetinIkincil }]}>13:24</Text>
          <View style={[styles.onizlemeBadge, { backgroundColor: palet.birincilAcik }]}>
            <Text style={[styles.onizlemeBadgeMetin, { color: palet.birincilKoyu }]}>Aktif</Text>
          </View>
        </View>
        <View style={[styles.onizlemeVakitSatir, { borderLeftColor: onizlemeSinir }]}>
          <Text style={[styles.onizlemeVakitAdiPasif, { color: onizlemeMetinIkincil }]}>İkindi</Text>
          <Text style={[styles.onizlemeVakitSaat, { color: onizlemeMetinIkincil }]}>16:42</Text>
        </View>
      </View>
    </View>

    <Text style={styles.bolumBaslik}>Renk Paleti</Text>
    <View style={styles.paletIzgara}>
      {RENK_PALETLERI.map(p => (
        <TouchableOpacity
          key={p.id}
          style={[styles.paletKart, palet.id === p.id && { borderColor: p.birincil }]}
          onPress={() => paletiDegistir(p.id)}
        >
          <View style={[styles.paletRenk, { backgroundColor: p.birincil }]} />
          <View style={[styles.paletVurgu, { backgroundColor: p.vurgu }]} />
          <Text style={[styles.paletAdi, palet.id === p.id && { color: p.birincil }]}>{p.ad}</Text>
          {palet.id === p.id && (
            <View style={[styles.paletSecimIsaret, { backgroundColor: p.birincil }]}>
              <FontAwesome5 name="check" size={9} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>

    <Text style={styles.bolumBaslik}>Görünüm Modu</Text>
    <View style={styles.modSecici}>
      {(['acik', 'sistem', 'koyu'] as TemaModu[]).map(m => (
        <TouchableOpacity
          key={m}
          style={[styles.modButon, mod === m && { backgroundColor: palet.birincil }]}
          onPress={() => moduDegistir(m)}
        >
          <FontAwesome5
            name={m === 'acik' ? 'sun' : m === 'koyu' ? 'moon' : 'mobile-alt'}
            size={15}
            color={mod === m ? '#fff' : '#6b7280'}
          />
          <Text style={[styles.modButonMetin, mod === m && { color: '#fff' }]}>
            {m === 'acik' ? 'Açık' : m === 'koyu' ? 'Koyu' : 'Sistem'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <Text style={styles.modAciklama}>
      <FontAwesome5 name="info-circle" size={12} color="#9ca3af" />{' '}
      {mod === 'sistem'
        ? 'Telefonunuzun ayarına göre otomatik değişir'
        : mod === 'acik'
        ? 'Her zaman aydınlık görünüm kullanılır'
        : 'Her zaman karanlık görünüm kullanılır'}
    </Text>
  </ScrollView>
  );
};

// ─── Adım 4: Vakit Bildirimleri ──────────────────────────────────────────────

const VakitBildirimAdimi: React.FC<{
  bildirimler: BildirimAyarlari;
  onToggle: (v: keyof BildirimAyarlari) => void;
}> = ({ bildirimler, onToggle }) => {
  const vakitler: { anahtar: keyof BildirimAyarlari; ad: string; ikon: string; renk: string; saat: string }[] = [
    { anahtar: 'imsak', ad: 'İmsak', ikon: 'star', renk: '#6366f1', saat: 'Sabah erkenden' },
    { anahtar: 'ogle', ad: 'Öğle', ikon: 'sun', renk: '#f59e0b', saat: 'Öğleden sonra' },
    { anahtar: 'ikindi', ad: 'İkindi', ikon: 'cloud-sun', renk: '#f97316', saat: 'İkindi vakti' },
    { anahtar: 'aksam', ad: 'Akşam', ikon: 'cloud', renk: '#ef4444', saat: 'Güneş batımında' },
    { anahtar: 'yatsi', ad: 'Yatsı', ikon: 'moon', renk: '#8b5cf6', saat: 'Geç akşam' },
  ];

  const aktifSayisi = Object.values(bildirimler).filter(Boolean).length;

  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: '#fef3c720', alignSelf: 'center' }]}>
        <FontAwesome5 name="bell" size={44} color="#f59e0b" />
      </View>
      <Text style={styles.adimBaslik}>Namaz Vakti Bildirimleri</Text>
      <Text style={styles.adimAltBaslik}>
        Hangi vakitlerde bildirim almak istediğinizi seçin
      </Text>

      <View style={styles.ozet}>
        <FontAwesome5 name="check-circle" size={14} color="#10b981" />
        <Text style={styles.ozetMetin}>
          {aktifSayisi === 0
            ? 'Hiç vakit bildirimi seçilmedi'
            : `${aktifSayisi} vakit için bildirim açık`}
        </Text>
      </View>

      <View style={styles.bildirimListe}>
        {vakitler.map(v => (
          <TouchableOpacity
            key={v.anahtar}
            style={[styles.bildirimSatir, bildirimler[v.anahtar] && { borderColor: v.renk + '50', borderWidth: 1.5 }]}
            onPress={() => onToggle(v.anahtar)}
          >
            <View style={[styles.vakitIkon, { backgroundColor: v.renk + '18' }]}>
              <FontAwesome5 name={v.ikon} size={18} color={v.renk} />
            </View>
            <View style={styles.vakitMetin}>
              <Text style={styles.vakitAdi}>{v.ad}</Text>
              <Text style={styles.vakitAciklama}>{v.saat}</Text>
            </View>
            <Switch
              value={bildirimler[v.anahtar]}
              onValueChange={() => onToggle(v.anahtar)}
              trackColor={{ false: '#e5e7eb', true: v.renk + '70' }}
              thumbColor={bildirimler[v.anahtar] ? v.renk : '#d1d5db'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bilgiKutu}>
        <FontAwesome5 name="info-circle" size={14} color="#3b82f6" />
        <Text style={styles.bilgiKutuMetin}>
          Bildirimler vakit girmeden birkaç dakika önce gelir. İstediğiniz zaman Ayarlar'dan düzenleyebilirsiniz.
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── Adım 5: Muhafız Tanıtım ─────────────────────────────────────────────────

const MuhafizTanitimAdimi: React.FC<{
  muhafizAktif: boolean;
  setMuhafizAktif: (aktif: boolean) => void;
}> = ({ muhafizAktif, setMuhafizAktif }) => {
  const [aktifSeviye, setAktifSeviye] = useState(0);
  const seviyeAnim = useRef(new Animated.Value(0)).current;

  const seviyeler = [
    { saat: '45 dk önce', baslik: '1. Hatırlatma', aciklama: 'Vakit yaklaşıyor, hazırlanmaya başlayın', renk: '#10b981', yogunluk: 1 },
    { saat: '25 dk önce', baslik: '2. Hatırlatma', aciklama: 'Biraz daha yakın, namazı kılmanın vakti geldi', renk: '#3b82f6', yogunluk: 2 },
    { saat: '10 dk önce', baslik: '3. Hatırlatma', aciklama: 'Son dakikalar! Namaz vakti çok yakın', renk: '#f59e0b', yogunluk: 3 },
    { saat: 'Vakit!', baslik: 'Son Çağrı', aciklama: 'Namazı kıldıysanız Muhafız susacak', renk: '#ef4444', yogunluk: 4 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAktifSeviye(prev => (prev + 1) % seviyeler.length);
      Animated.sequence([
        Animated.timing(seviyeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(seviyeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const s = seviyeler[aktifSeviye];

  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: '#10b98120', alignSelf: 'center' }]}>
        <FontAwesome5 name="shield-alt" size={44} color="#10b981" />
      </View>
      <Text style={styles.adimBaslik}>Namaz Muhafızı</Text>
      <Text style={styles.adimAltBaslik}>
        Namazı kılana kadar artan sıklıkta hatırlatan özel koruma sistemi
      </Text>

      {/* Canlı animatik gösterim */}
      <View style={styles.muhafizAnimKart}>
        <View style={styles.muhafizAnimBaslik}>
          <FontAwesome5 name="shield-alt" size={14} color="#10b981" />
          <Text style={styles.muhafizAnimBaslikMetin}>Muhafız nasıl çalışır?</Text>
        </View>
        <View style={styles.muhafizSeviyeCizgi}>
          {seviyeler.map((sv, i) => (
            <View key={i} style={styles.muhafizSeviyeNokta}>
              <View style={[
                styles.muhafizNokta,
                { backgroundColor: i <= aktifSeviye ? sv.renk : '#e5e7eb' },
                i === aktifSeviye && { transform: [{ scale: 1.3 }] },
              ]} />
              {i < seviyeler.length - 1 && (
                <View style={[styles.muhafizCizgi, { backgroundColor: i < aktifSeviye ? sv.renk : '#e5e7eb' }]} />
              )}
            </View>
          ))}
        </View>
        <View style={[styles.muhafizAktifKart, { borderColor: s.renk + '40', backgroundColor: s.renk + '08' }]}>
          <View style={[styles.muhafizYogunlukBar, { backgroundColor: s.renk + '20' }]}>
            {Array.from({ length: s.yogunluk }).map((_, i) => (
              <FontAwesome5 key={i} name="bell" size={12} color={s.renk} />
            ))}
          </View>
          <Text style={[styles.muhafizSaatMetin, { color: s.renk }]}>{s.saat}</Text>
          <Text style={styles.muhafizSeviyeBaslik}>{s.baslik}</Text>
          <Text style={styles.muhafizSeviyeAciklama}>{s.aciklama}</Text>
        </View>
      </View>

      <InfoKutu
        ikon="check-circle"
        renk="#10b981"
        baslik="Namaz kılınca otomatik durur"
        aciklama="Ana ekranda 'Kıldım' butonuna dokunduğunuzda Muhafız o vakit için susar."
      />
      <InfoKutu
        ikon="sliders-h"
        renk="#6366f1"
        baslik="Tamamen özelleştirilebilir"
        aciklama="Her seviyenin zamanlamasını dakika dakika kendiniz ayarlayabilirsiniz."
      />

      <View style={[styles.muhafizToggle, muhafizAktif && styles.muhafizToggleAktif]}>
        <View style={styles.muhafizToggleSol}>
          <FontAwesome5
            name={muhafizAktif ? 'shield-alt' : 'shield'}
            size={22}
            color={muhafizAktif ? '#10b981' : '#9ca3af'}
          />
          <View>
            <Text style={styles.muhafizToggleBaslik}>Muhafızı Etkinleştir</Text>
            <Text style={styles.muhafizToggleAlt}>
              {muhafizAktif ? 'Aktif — namaz kaçırmayacaksınız' : 'Devre dışı'}
            </Text>
          </View>
        </View>
        <Switch
          value={muhafizAktif}
          onValueChange={setMuhafizAktif}
          trackColor={{ false: '#e5e7eb', true: '#10b98160' }}
          thumbColor={muhafizAktif ? '#10b981' : '#d1d5db'}
        />
      </View>
    </ScrollView>
  );
};

// ─── Adım 6: Muhafız Yoğunluk ────────────────────────────────────────────────

const MuhafizYogunlukAdimi: React.FC<{
  yogunluk: MuhafizYogunluk;
  setYogunluk: (y: MuhafizYogunluk) => void;
  muhafizAktif: boolean;
}> = ({ yogunluk, setYogunluk, muhafizAktif }) => {

  const secenekler: {
    id: MuhafizYogunluk;
    ad: string;
    etiket: string;
    renk: string;
    detay: string;
    satir1: string;
    satir2: string;
    icin: string;
  }[] = [
    {
      id: 'hafif',
      ad: 'Hafif',
      etiket: 'Sakin',
      renk: '#10b981',
      detay: 'Gündelik hayatı az bölen, nazik hatırlatmalar',
      satir1: 'İlk hatırlatma vakitten 30 dk önce',
      satir2: 'Her 30 dakikada bir tekrar',
      icin: 'İçin: Zaten düzenli namaz kılanlar',
    },
    {
      id: 'normal',
      ad: 'Normal',
      etiket: 'Önerilen',
      renk: '#3b82f6',
      detay: 'Etkili ve dengeli — çoğu kullanıcı için ideal',
      satir1: 'İlk hatırlatma vakitten 45 dk önce',
      satir2: 'Her 20 dakikada bir tekrar',
      icin: 'İçin: Takibe ihtiyaç duyanlar',
    },
    {
      id: 'yogun',
      ad: 'Yoğun',
      etiket: 'Güçlü',
      renk: '#f97316',
      detay: 'Sık ve ısrarcı hatırlatmalar — kesinlikle kaçırmamak için',
      satir1: 'İlk hatırlatma vakitten 60 dk önce',
      satir2: 'Her 10 dakikada bir tekrar',
      icin: 'İçin: Yoğun tempolu hayat yaşayanlar',
    },
    {
      id: 'ozel',
      ad: 'Özel',
      etiket: 'Gelişmiş',
      renk: '#8b5cf6',
      detay: 'Her seviyenin zamanlamasını kendiniz belirleyin',
      satir1: 'Kurulum sonrası Ayarlar ekranından',
      satir2: '4 seviyeyi bağımsız yapılandırabilirsiniz',
      icin: 'İçin: Tam kontrol isteyenler',
    },
  ];

  if (!muhafizAktif) {
    return (
      <View style={styles.merkezliIcerik}>
        <View style={[styles.buyukIkonCember, { backgroundColor: '#f3f4f6' }]}>
          <FontAwesome5 name="shield" size={44} color="#9ca3af" />
        </View>
        <Text style={styles.adimBaslik}>Hatırlatma Yoğunluğu</Text>
        <Text style={styles.adimAltBaslik}>
          Muhafız devre dışı bırakıldı
        </Text>
        <View style={styles.bilgiKutu}>
          <FontAwesome5 name="info-circle" size={14} color="#6b7280" />
          <Text style={styles.bilgiKutuMetin}>
            Bir önceki adıma dönerek Muhafızı etkinleştirip yoğunluk seçebilirsiniz.
            İstediğiniz zaman Ayarlar → Namaz Muhafızı'ndan da açabilirsiniz.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: '#6366f120', alignSelf: 'center' }]}>
        <FontAwesome5 name="sliders-h" size={44} color="#6366f1" />
      </View>
      <Text style={styles.adimBaslik}>Hatırlatma Yoğunluğu</Text>
      <Text style={styles.adimAltBaslik}>
        Ne sıklıkta hatırlatılmak istediğinizi seçin
      </Text>

      <View style={styles.yogunlukListe}>
        {secenekler.map(s => {
          const secili = yogunluk === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.yogunlukKart, secili && { borderColor: s.renk, borderWidth: 2, backgroundColor: s.renk + '06' }]}
              onPress={() => setYogunluk(s.id)}
            >
              <View style={styles.yogunlukKartUst}>
                <View style={[styles.yogunlukIkon, { backgroundColor: s.renk + '18' }]}>
                  <FontAwesome5 name="bell" size={20} color={s.renk} />
                </View>
                <View style={styles.yogunlukBaslikAlani}>
                  <View style={styles.yogunlukBaslikSatir}>
                    <Text style={[styles.yogunlukAdi, secili && { color: s.renk }]}>{s.ad}</Text>
                    <View style={[styles.yogunlukEtiket, { backgroundColor: s.renk + '18' }]}>
                      <Text style={[styles.yogunlukEtiketMetin, { color: s.renk }]}>{s.etiket}</Text>
                    </View>
                  </View>
                  <Text style={styles.yogunlukDetay}>{s.detay}</Text>
                </View>
                {secili && (
                  <View style={[styles.secimDairesi, { backgroundColor: s.renk }]}>
                    <FontAwesome5 name="check" size={11} color="#fff" />
                  </View>
                )}
              </View>
              <View style={[styles.yogunlukDetayAlti, secili && { borderTopColor: s.renk + '30' }]}>
                <View style={styles.yogunlukSatir}>
                  <FontAwesome5 name="clock" size={11} color="#9ca3af" />
                  <Text style={styles.yogunlukSatirMetin}>{s.satir1}</Text>
                </View>
                <View style={styles.yogunlukSatir}>
                  <FontAwesome5 name="redo" size={11} color="#9ca3af" />
                  <Text style={styles.yogunlukSatirMetin}>{s.satir2}</Text>
                </View>
                <View style={styles.yogunlukSatir}>
                  <FontAwesome5 name="user" size={11} color="#9ca3af" />
                  <Text style={[styles.yogunlukSatirMetin, { fontStyle: 'italic' }]}>{s.icin}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

// ─── Adım 7: Özel Gün Modu ──────────────────────────────────────────────────

const OzelGunAdimi: React.FC = () => (
  <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
    <View style={[styles.buyukIkonCember, { backgroundColor: '#f59e0b20', alignSelf: 'center' }]}>
      <FontAwesome5 name="star" size={44} color="#f59e0b" />
    </View>
    <Text style={styles.adimBaslik}>Özel Gün Modu</Text>
    <Text style={styles.adimAltBaslik}>
      Serinizi koruyun — hayat her zaman kolay olmaz
    </Text>

    <View style={styles.bilgiKutu}>
      <FontAwesome5 name="info-circle" size={14} color="#f59e0b" />
      <Text style={styles.bilgiKutuMetin}>
        <Text style={{ fontWeight: '700' }}>Özel Gün Modu nedir?</Text>{' '}
        Hastalık, yolculuk, operasyon gibi durumlarda namazlarınızı kılamasanız bile serinizi kaybetmemenizi sağlar.
      </Text>
    </View>

    <InfoKutu
      ikon="heart"
      renk="#ef4444"
      baslik="Hastalık veya Yorgunluk"
      aciklama="Hasta olduğunuzda veya aşırı yorgunlukta seri koruması devreye girer, iyileşince kaldığınız yerden devam edersiniz."
    />
    <InfoKutu
      ikon="plane"
      renk="#3b82f6"
      baslik="Yolculuk"
      aciklama="Uzun seyahatlerde, özellikle uçuş veya transit geçişlerde namaz imkânı bulamasanız güvende olursunuz."
    />
    <InfoKutu
      ikon="hospital"
      renk="#8b5cf6"
      baslik="Operasyon / Hastane"
      aciklama="Tıbbi durumlarda aylarca süren seriniz tek günlük bir kesinti yüzünden kaybolmaz."
    />

    <View style={[styles.nasilKullanilirKart]}>
      <Text style={styles.nasilKullanilirBaslik}>
        <FontAwesome5 name="hand-pointer" size={13} color="#374151" />  Nasıl kullanılır?
      </Text>
      <View style={styles.adimAdimSatir}>
        <View style={styles.adimNumara}><Text style={styles.adimNumaraMetin}>1</Text></View>
        <Text style={styles.adimAdimMetin}>Ana ekranda bugünün tarihine uzun basın</Text>
      </View>
      <View style={styles.adimAdimSatir}>
        <View style={styles.adimNumara}><Text style={styles.adimNumaraMetin}>2</Text></View>
        <Text style={styles.adimAdimMetin}>"Özel Gün Olarak İşaretle" seçeneğini seçin</Text>
      </View>
      <View style={styles.adimAdimSatir}>
        <View style={styles.adimNumara}><Text style={styles.adimNumaraMetin}>3</Text></View>
        <Text style={styles.adimAdimMetin}>O gün seri sayımına dahil edilmez</Text>
      </View>
    </View>
  </ScrollView>
);

// ─── Adım 8: Hazır ──────────────────────────────────────────────────────────

const HazirAdimi: React.FC = () => {
  const bounceAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.hosgeldinizIcerik}>
      <Animated.View style={{ transform: [{ scale: bounceAnim }], marginBottom: 28 }}>
        <FontAwesome5 name="check-circle" size={96} color="#fff" />
      </Animated.View>
      <Text style={styles.hosgeldinizBaslik}>Her Şey Hazır!</Text>
      <Text style={styles.hosgeldinizAltBaslik}>Ayarlarınız başarıyla kaydedildi</Text>
      <Text style={styles.hosgeldinizAciklama}>
        İstediğiniz zaman{' '}
        <Text style={{ fontWeight: '700' }}>Ayarlar</Text> ekranından tüm
        tercihleri değiştirebilirsiniz.{'\n\n'}
        Hayırlı namazlar!
      </Text>
    </View>
  );
};

// ─── Yardımcı Bileşenler ─────────────────────────────────────────────────────

const InfoKutu: React.FC<{
  ikon: string;
  renk: string;
  baslik: string;
  aciklama: string;
}> = ({ ikon, renk, baslik, aciklama }) => (
  <View style={styles.infoKutu}>
    <View style={[styles.infoIkon, { backgroundColor: renk + '18' }]}>
      <FontAwesome5 name={ikon} size={18} color={renk} />
    </View>
    <View style={styles.infoMetin}>
      <Text style={styles.infoBaslik}>{baslik}</Text>
      <Text style={styles.infoAciklama}>{aciklama}</Text>
    </View>
  </View>
);

// ─── Stiller ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tamEkran: { flex: 1, backgroundColor: '#fff' },

  // ── Gradient ekranlar ──
  gradientKapsayici: { flex: 1, justifyContent: 'space-between' },
  gradientButonAlani: { paddingHorizontal: 24, paddingBottom: 52, alignItems: 'center', gap: 16 },

  // ── Hoşgeldiniz ──
  hosgeldinizIcerik: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  halka1: {
    position: 'absolute', top: '18%', alignSelf: 'center',
    width: 176, height: 176, borderRadius: 88,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)',
  },
  halka2: {
    position: 'absolute', top: '13%', alignSelf: 'center',
    width: 240, height: 240, borderRadius: 120,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  moskeIkon: { marginBottom: 28, opacity: 0.95 },
  hosgeldinizBaslik: {
    fontSize: 36, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 10, letterSpacing: -0.5,
  },
  hosgeldinizAltBaslik: {
    fontSize: 17, color: 'rgba(255,255,255,0.82)',
    textAlign: 'center', marginBottom: 16, fontWeight: '500',
  },
  hosgeldinizAciklama: {
    fontSize: 14.5, color: 'rgba(255,255,255,0.65)',
    textAlign: 'center', lineHeight: 22,
  },

  // ── Üst bar ──
  ustBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 6,
  },
  geriButon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // ── İlerleme noktaları ──
  noktaKapsayici: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  nokta: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#e5e7eb' },
  noktaAktif: { width: 20, backgroundColor: '#3b82f6' },
  noktaTamamlandi: { backgroundColor: '#10b981' },

  // ── İçerik ──
  icerikAlani: { flex: 1, paddingHorizontal: 24 },
  scrollAdim: { flex: 1 },
  scrollIcerik: { paddingTop: 4, paddingBottom: 20, alignItems: 'center' },
  merkezliIcerik: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },

  // ── Buton alanı ──
  butonAlani: {
    paddingHorizontal: 24, paddingBottom: 44, gap: 8, alignItems: 'center',
  },
  buton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 14, gap: 9, width: '100%',
  },
  butonBirincil: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  butonYesil: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  butonMetin: { color: '#fff', fontSize: 16, fontWeight: '700' },
  atlaButon: { paddingVertical: 8 },
  atlaButonMetin: { color: '#9ca3af', fontSize: 14, fontWeight: '500' },

  // ── Ortak adım ──
  buyukIkonCember: {
    width: 92, height: 92, borderRadius: 46,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  adimBaslik: {
    fontSize: 25, fontWeight: '800', color: '#111',
    textAlign: 'center', marginBottom: 8, letterSpacing: -0.3,
  },
  adimAltBaslik: {
    fontSize: 14.5, color: '#6b7280', textAlign: 'center',
    lineHeight: 22, marginBottom: 20, paddingHorizontal: 4,
  },

  // ── InfoKutu ──
  infoKutu: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#f9fafb', borderRadius: 12,
    padding: 14, gap: 12, marginBottom: 10, width: '100%',
  },
  infoIkon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  infoMetin: { flex: 1 },
  infoBaslik: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 3 },
  infoAciklama: { fontSize: 13, color: '#6b7280', lineHeight: 19 },

  // ── Gizlilik banner ──
  gizlilikBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#f0fdf4', borderRadius: 10, borderWidth: 1,
    borderColor: '#bbf7d0', padding: 12, marginTop: 6, width: '100%',
  },
  gizlilikBannerMetin: { flex: 1, fontSize: 12.5, color: '#374151', lineHeight: 18 },

  // ── Bilgi kutusu (inline, mavi) ──
  bilgiKutu: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#eff6ff', borderRadius: 10, borderWidth: 1,
    borderColor: '#bfdbfe', padding: 12, marginBottom: 10, width: '100%',
  },
  bilgiKutuMetin: { flex: 1, fontSize: 12.5, color: '#1e40af', lineHeight: 18 },

  // ── Tema adımı ──
  onizlemeKart: {
    width: '100%', borderRadius: 14, borderWidth: 1.5,
    overflow: 'hidden', marginBottom: 20,
  },
  onizlemeBaslik: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  onizlemeBaslikMetin: { color: '#fff', fontWeight: '700', fontSize: 14 },
  onizlemeIcerik: { padding: 12, gap: 8 },
  onizlemeVakitSatir: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingLeft: 10, borderLeftWidth: 3, paddingVertical: 6,
  },
  onizlemeVakitAdi: { fontWeight: '700', fontSize: 14 },
  onizlemeVakitAdiPasif: { fontWeight: '600', fontSize: 14, color: '#9ca3af' },
  onizlemeVakitSaat: { flex: 1, fontSize: 13, color: '#6b7280' },
  onizlemeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  onizlemeBadgeMetin: { fontSize: 11, fontWeight: '700' },
  bolumBaslik: {
    fontSize: 14, fontWeight: '700', color: '#374151',
    alignSelf: 'flex-start', marginBottom: 10,
  },
  paletIzgara: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center', marginBottom: 20, width: '100%',
  },
  paletKart: {
    width: (EKRAN_GENISLIGI - 48 - 30) / 3,
    alignItems: 'center', backgroundColor: '#f9fafb',
    borderRadius: 12, padding: 10, borderWidth: 2, borderColor: 'transparent', position: 'relative',
  },
  paletRenk: { width: '100%', height: 26, borderRadius: 7, marginBottom: 4 },
  paletVurgu: { width: '55%', height: 7, borderRadius: 4, marginBottom: 6 },
  paletAdi: { fontSize: 11.5, color: '#374151', fontWeight: '600' },
  paletSecimIsaret: {
    position: 'absolute', top: -6, right: -6,
    width: 19, height: 19, borderRadius: 9.5,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  modSecici: {
    flexDirection: 'row', backgroundColor: '#f3f4f6',
    borderRadius: 12, padding: 3, gap: 2, width: '100%', marginBottom: 8,
  },
  modButon: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 5,
  },
  modButonMetin: { fontSize: 12.5, fontWeight: '600', color: '#6b7280' },
  modAciklama: { fontSize: 12, color: '#9ca3af', alignSelf: 'flex-start', lineHeight: 18 },

  // ── Vakit bildirimleri ──
  ozet: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f0fdf4', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14, width: '100%',
  },
  ozetMetin: { fontSize: 13, color: '#374151', fontWeight: '600' },
  bildirimListe: { width: '100%', gap: 8, marginBottom: 14 },
  bildirimSatir: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb', padding: 13, borderRadius: 12, gap: 12,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  vakitIkon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  vakitMetin: { flex: 1 },
  vakitAdi: { fontSize: 14.5, fontWeight: '700', color: '#111', marginBottom: 2 },
  vakitAciklama: { fontSize: 12, color: '#9ca3af' },

  // ── Konum ──
  seciliIlBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eef2ff', borderRadius: 8, padding: 10,
    marginBottom: 10, width: '100%',
  },
  seciliIlMetin: { fontSize: 13.5, fontWeight: '700', color: '#4338ca' },
  ilListesi: { flex: 1, width: '100%' },
  ilSatir: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  ilSatirSecili: { backgroundColor: '#eef2ff' },
  ilAdi: { flex: 1, fontSize: 14.5, color: '#374151', fontWeight: '500' },
  ilAdiSecili: { color: '#4338ca', fontWeight: '700' },

  // ── Muhafız tanıtım ──
  muhafizAnimKart: {
    width: '100%', backgroundColor: '#f9fafb', borderRadius: 16,
    padding: 16, marginBottom: 14,
  },
  muhafizAnimBaslik: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  muhafizAnimBaslikMetin: { fontSize: 13, fontWeight: '700', color: '#374151' },
  muhafizSeviyeCizgi: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  muhafizSeviyeNokta: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  muhafizNokta: { width: 14, height: 14, borderRadius: 7 },
  muhafizCizgi: { flex: 1, height: 3, marginHorizontal: 2 },
  muhafizAktifKart: {
    borderWidth: 1.5, borderRadius: 12, padding: 14, alignItems: 'center',
  },
  muhafizYogunlukBar: {
    flexDirection: 'row', gap: 4, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, marginBottom: 8,
  },
  muhafizSaatMetin: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  muhafizSeviyeBaslik: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 4 },
  muhafizSeviyeAciklama: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 18 },
  muhafizToggle: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    backgroundColor: '#f9fafb', padding: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb', marginTop: 4,
  },
  muhafizToggleAktif: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  muhafizToggleSol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  muhafizToggleBaslik: { fontSize: 15, fontWeight: '700', color: '#111' },
  muhafizToggleAlt: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  // ── Muhafız yoğunluk ──
  yogunlukListe: { width: '100%', gap: 10 },
  yogunlukKart: {
    backgroundColor: '#f9fafb', borderRadius: 14, overflow: 'hidden',
    borderWidth: 2, borderColor: 'transparent',
  },
  yogunlukKartUst: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  yogunlukIkon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  yogunlukBaslikAlani: { flex: 1 },
  yogunlukBaslikSatir: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  yogunlukAdi: { fontSize: 15.5, fontWeight: '800', color: '#111' },
  yogunlukEtiket: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  yogunlukEtiketMetin: { fontSize: 11, fontWeight: '700' },
  yogunlukDetay: { fontSize: 12.5, color: '#6b7280', lineHeight: 17 },
  secimDairesi: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  yogunlukDetayAlti: {
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    paddingHorizontal: 14, paddingVertical: 10, gap: 6,
  },
  yogunlukSatir: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  yogunlukSatirMetin: { fontSize: 12, color: '#6b7280' },

  // ── Özel gün ──
  nasilKullanilirKart: {
    width: '100%', backgroundColor: '#f9fafb', borderRadius: 14, padding: 16, marginTop: 4,
  },
  nasilKullanilirBaslik: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12 },
  adimAdimSatir: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  adimNumara: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center',
  },
  adimNumaraMetin: { fontSize: 12, fontWeight: '800', color: '#fff' },
  adimAdimMetin: { flex: 1, fontSize: 13.5, color: '#374151', lineHeight: 20 },
});
