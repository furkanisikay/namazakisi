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
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './KurulumSihirbazi/stiller';
import { BildirimAyarlari, MuhafizYogunluk, KonumDurumu } from './KurulumSihirbazi/tipler';
import { HosgeldinizAdimi, BildirimIzniAdimi, KonumAdimi, TemaAdimi, VakitBildirimAdimi, MuhafizTanitimAdimi, MuhafizYogunlukAdimi, OzelGunAdimi, HazirAdimi } from './KurulumSihirbazi/adimlar';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Logger } from '../../core/utils/Logger';
import * as Notifications from 'expo-notifications';
import { useDispatch } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTema } from '../../core/theme';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { tumVakitBildirimAyarlariniGuncelle } from '../store/vakitBildirimSlice';
import { muhafizAyarlariniGuncelle, presetAyarlariniOlustur } from '../store/muhafizSlice';
import { konumAyarlariniGuncelle } from '../store/konumSlice';
import type { AppDispatch } from '../store/store';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { TurkiyeKonumServisi } from '../../domain/services/TurkiyeKonumServisi';
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
        if (g) {
          gpsAdres = {
            il: g.city || g.region || '',
            ilce: g.district || g.subregion || '',
            semt: g.street || '',
          };
        }
      } catch (error) {
        // Ters geocode opsiyonel; başarısız olsa da koordinatlar kullanılır.
        Logger.warn('KurulumSihirbazi', 'Ters geocode başarısız', error);
      }

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
          ...presetAyarlariniOlustur(muhafizYogunluk),
        }));
      } else if (muhafizAktif && muhafizYogunluk === 'ozel') {
        await dispatch(muhafizAyarlariniGuncelle({
          aktif: true,
          yogunluk: 'ozel',
          gelismisMod: true,
          ...presetAyarlariniOlustur('normal'), // Ozel baslangic olarak normal preset
        }));
      } else {
        // Muhafızı kapatan kullanıcı yoğunluk adımının sesli anons bilgi kutusunu
        // HİÇ görmez (o kutu yalnız `muhafizAktif` dalında render edilir) →
        // `sesliOnayi` YAZILMAZ. Aksi halde sonradan muhafızı açıp preset seçtiğinde
        // `SesliOnayModal` atlanır ve sessiz modu delen TTS bilgilendirmesiz açılır.
        await dispatch(muhafizAyarlariniGuncelle({
          aktif: false,
          yogunluk: 'normal',
          gelismisMod: false,
          ...presetAyarlariniOlustur('normal', false),
        }));
      }
      await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI, 'true');
      navigation.replace('MainTabs');
    } catch (error) {
      Logger.error('KurulumSihirbazi', 'Kurulum tamamlanamadı', error);
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

