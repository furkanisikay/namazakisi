/**
 * İçe Aktarma Sihirbazı — çok adımlı, animasyonlu yedek geri yükleme akışı.
 *
 * Görsel dil Kurulum Sihirbazı ile birebir: ilerleme noktaları, üst bar (geri),
 * büyük ikon kutusu, InfoKutu, kart seçim deseni, tam genişlik CTA, fade+slide
 * geçiş animasyonu. Tüm metin kibar "siz" dilindedir.
 *
 * Adımlar (state makinesi `adim` 0..4 + ara "gelişmiş" alt-ekranı):
 *   0 — Dosya seç      (expo-document-picker → expo-file-system ile UTF-8 oku)
 *   1 — Çöz & doğrula  (YedeklemeServisi.zarfiCoz; null → kibar hata)
 *   2 — Karşılaştır & strateji  (FarkOzeti + 4 strateji; Gelişmiş alt-ekran)
 *   3 — Uygula         (yedeklemeSlice.iceAktarmayiUygula; store.durum izlenir)
 *   4 — Özet           (başarı; "Tamam" → durumuSifirla + goBack)
 *
 * Tasarım: docs/superpowers/specs/2026-06-14-yerel-yedekleme-aktarim-design.md
 */

import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system/next';

import { styles } from './stiller';
import {
  DosyaSecAdimi,
  CozumleniyorAdimi,
  CozmeHatasiAdimi,
  KarsilastirmaAdimi,
  GelismisAdimi,
  UygulaniyorAdimi,
  UygulamaHatasiAdimi,
  OzetAdimi,
  type KategoriMeta,
} from './adimlar';
import { useRenkler } from '../../../../core/theme';
import { useFeedback } from '../../../../core/feedback';
import { useDonanimGeriTusu } from '../../../hooks/useDonanimGeriTusu';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  iceAktarmayiUygula,
  durumuSifirla,
} from '../../../store/yedeklemeSlice';
import { zarfiCoz, mevcutVeriyiTopla } from '../../../../domain/services/YedeklemeServisi';
import { farkCikar } from '../../../../domain/services/YedekBirlestirmeServisi';
import { Logger } from '../../../../core/utils/Logger';
import type {
  YedekPayload,
  FarkOzeti,
  BirlestirmeStratejisi,
  KategoriStratejisi,
  KategoriSecimleri,
} from '../../../../core/types';

// ─── Adım sabitleri ──────────────────────────────────────────────────────────

const ADIM = {
  DOSYA_SEC: 0,
  COZUMLE: 1,
  KARSILASTIR: 2,
  UYGULA: 3,
  OZET: 4,
} as const;

const TOPLAM_NOKTA = 5;

type KategoriSecimDurumu = Record<KategoriMeta['id'], KategoriStratejisi>;

const VARSAYILAN_GELISMIS: KategoriSecimDurumu = {
  namaz: 'akilli',
  puan: 'akilli',
  kaza: 'akilli',
  ayarlar: 'akilli',
};

/**
 * Global stratejiyi (akilli/uzerineYaz/eksikleriEkle) dört alanın da aynı olduğu
 * `KategoriSecimleri`'ne çevirir. ("gelismis" burada gelmez — o alan-alan seçilir.)
 */
const globalStratejiyiYay = (strateji: KategoriStratejisi): KategoriSecimleri => ({
  namaz: strateji,
  puan: strateji,
  kaza: strateji,
  ayarlar: strateji,
});

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export const IceAktarmaSihirbaziSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { butonTiklandiFeedback, hataFeedback } = useFeedback();
  const { durum, hata, sonOzet } = useAppSelector((s) => s.yedekleme);

  const [adim, setAdim] = useState<number>(ADIM.DOSYA_SEC);
  // Karşılaştırma adımında "Gelişmiş" alt-ekranını gösterir.
  const [gelismisAcik, setGelismisAcik] = useState(false);
  const [dosyaHatasi, setDosyaHatasi] = useState(false);

  const [gelenPayload, setGelenPayload] = useState<YedekPayload | null>(null);
  const [fark, setFark] = useState<FarkOzeti | null>(null);

  const [seciliStrateji, setSeciliStrateji] = useState<BirlestirmeStratejisi>('akilli');
  const [gelismisSecimler, setGelismisSecimler] = useState<KategoriSecimDurumu>(VARSAYILAN_GELISMIS);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ─── Geçiş animasyonu (Kurulum Sihirbazı deseni) ─────────────────────────

  const gecisYap = useCallback(
    (calistir: () => void) => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -28, duration: 160, useNativeDriver: true }),
      ]).start(() => {
        calistir();
        slideAnim.setValue(28);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      });
    },
    [fadeAnim, slideAnim]
  );

  const adimaGec = useCallback(
    (hedef: number) => {
      gecisYap(() => {
        setGelismisAcik(false);
        setDosyaHatasi(false);
        setAdim(hedef);
      });
    },
    [gecisYap]
  );

  // ─── Çıkış ───────────────────────────────────────────────────────────────

  const sihirbazdanCik = useCallback(() => {
    dispatch(durumuSifirla());
    navigation.goBack();
  }, [dispatch, navigation]);

  // ─── Adım 0: Dosya seç + oku ─────────────────────────────────────────────

  const dosyayiCozumle = useCallback(async (icerik: string) => {
    adimaGec(ADIM.COZUMLE);
    try {
      const payload = await zarfiCoz(icerik);
      if (!payload) {
        await hataFeedback();
        gecisYap(() => setDosyaHatasi(true));
        return;
      }
      const mevcut = await mevcutVeriyiTopla();
      const ozet = farkCikar(mevcut, payload);
      setGelenPayload(payload);
      setFark(ozet);
      adimaGec(ADIM.KARSILASTIR);
    } catch (error) {
      Logger.error('IceAktarmaSihirbazi', 'Yedek çözümlenemedi', error);
      await hataFeedback();
      gecisYap(() => setDosyaHatasi(true));
    }
  }, [adimaGec, gecisYap, hataFeedback]);

  const dosyaSec = useCallback(async () => {
    await butonTiklandiFeedback();
    try {
      const sonuc = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      // İptal → adımda kal.
      if (sonuc.canceled || !sonuc.assets?.[0]) return;

      const uri = sonuc.assets[0].uri;
      const icerik = await new File(uri).text();
      await dosyayiCozumle(icerik);
    } catch (error) {
      Logger.error('IceAktarmaSihirbazi', 'Dosya seçilemedi/okunamadı', error);
      await hataFeedback();
      gecisYap(() => {
        setAdim(ADIM.COZUMLE);
        setDosyaHatasi(true);
      });
    }
  }, [butonTiklandiFeedback, dosyayiCozumle, hataFeedback, gecisYap]);

  // ─── Adım 3: Uygula ──────────────────────────────────────────────────────

  const iceAktar = useCallback(async () => {
    if (!gelenPayload) return;
    await butonTiklandiFeedback();

    const secimler: KategoriSecimleri =
      seciliStrateji === 'gelismis'
        ? { ...gelismisSecimler }
        : globalStratejiyiYay(seciliStrateji);

    adimaGec(ADIM.UYGULA);
    dispatch(iceAktarmayiUygula({ payload: gelenPayload, secimler }));
  }, [
    gelenPayload,
    seciliStrateji,
    gelismisSecimler,
    butonTiklandiFeedback,
    adimaGec,
    dispatch,
  ]);

  // Uygulama bittiğinde adım 4'e geç (store.durum izlenir).
  useEffect(() => {
    if (adim === ADIM.UYGULA && durum === 'tamam') {
      adimaGec(ADIM.OZET);
    }
  }, [adim, durum, adimaGec]);

  // ─── Geri tuşu ───────────────────────────────────────────────────────────

  const geriTusuIslevi = useCallback((): boolean => {
    // Çözme/uygulama sürerken geri tuşu yok say (yarış önle).
    if (durum === 'uygulaniyor' || adim === ADIM.COZUMLE) return true;
    if (adim === ADIM.OZET) {
      sihirbazdanCik();
      return true;
    }
    if (adim === ADIM.UYGULA && durum === 'hata') {
      // Hata ekranından karşılaştırmaya dön.
      dispatch(durumuSifirla());
      adimaGec(ADIM.KARSILASTIR);
      return true;
    }
    if (dosyaHatasi) {
      adimaGec(ADIM.DOSYA_SEC);
      return true;
    }
    if (gelismisAcik) {
      // Gelişmiş alt-ekranından çıkınca önerilen stratejiye dön (CTA tekrar görünür).
      gecisYap(() => {
        setGelismisAcik(false);
        setSeciliStrateji('akilli');
      });
      return true;
    }
    if (adim === ADIM.KARSILASTIR) {
      adimaGec(ADIM.DOSYA_SEC);
      return true;
    }
    // Adım 0 → sihirbazdan çık.
    sihirbazdanCik();
    return true;
  }, [adim, durum, dosyaHatasi, gelismisAcik, adimaGec, gecisYap, sihirbazdanCik, dispatch]);

  useDonanimGeriTusu(true, geriTusuIslevi);

  // ─── İlerleme noktaları ──────────────────────────────────────────────────

  // Görsel ilerleme: çözme adımı 0'la birlikte gösterilir; nokta indeksi sıkıştırılır.
  const noktaIndeks =
    adim === ADIM.COZUMLE ? ADIM.DOSYA_SEC : Math.min(adim, TOPLAM_NOKTA - 1);

  const renderNoktalar = () => (
    <View style={styles.noktaKapsayici}>
      {Array.from({ length: TOPLAM_NOKTA }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.nokta,
            i === noktaIndeks && [styles.noktaAktif, { backgroundColor: renkler.birincil }],
            i < noktaIndeks && styles.noktaTamamlandi,
          ]}
        />
      ))}
    </View>
  );

  // ─── Adım render ──────────────────────────────────────────────────────────

  const renderAdim = () => {
    if (dosyaHatasi) return <CozmeHatasiAdimi renkler={renkler} />;

    switch (adim) {
      case ADIM.DOSYA_SEC:
        return <DosyaSecAdimi renkler={renkler} />;
      case ADIM.COZUMLE:
        return <CozumleniyorAdimi renkler={renkler} />;
      case ADIM.KARSILASTIR:
        if (gelismisAcik) {
          return (
            <GelismisAdimi
              renkler={renkler}
              secimler={gelismisSecimler}
              onDegis={(kategori, strateji) =>
                setGelismisSecimler((p) => ({ ...p, [kategori]: strateji }))
              }
            />
          );
        }
        return fark ? (
          <KarsilastirmaAdimi
            renkler={renkler}
            fark={fark}
            seciliStrateji={seciliStrateji}
            onStratejiSec={(s) => {
              setSeciliStrateji(s);
              if (s === 'gelismis') {
                // Gelişmiş başlangıcını "akilli" yap.
                setGelismisSecimler(VARSAYILAN_GELISMIS);
                gecisYap(() => setGelismisAcik(true));
              }
            }}
          />
        ) : null;
      case ADIM.UYGULA:
        return durum === 'hata' ? (
          <UygulamaHatasiAdimi renkler={renkler} hata={hata} />
        ) : (
          <UygulaniyorAdimi renkler={renkler} />
        );
      case ADIM.OZET:
        return (
          <OzetAdimi
            renkler={renkler}
            yazilanAnahtarSayisi={sonOzet?.yazilanAnahtarSayisi ?? 0}
          />
        );
      default:
        return null;
    }
  };

  // ─── Buton render ─────────────────────────────────────────────────────────

  const birincilButon = (
    etiket: string,
    onPress: () => void,
    ikon?: string,
    ikonSonda = false,
    renk = renkler.birincil
  ) => (
    <TouchableOpacity
      style={[styles.buton, styles.butonGolge, { backgroundColor: renk, shadowColor: renk }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {!ikonSonda && ikon && <FontAwesome5 name={ikon} size={16} color="#fff" />}
      <Text style={styles.butonMetin}>{etiket}</Text>
      {ikonSonda && ikon && <FontAwesome5 name={ikon} size={16} color="#fff" />}
    </TouchableOpacity>
  );

  const ikincilButon = (etiket: string, onPress: () => void, ikon?: string) => (
    <TouchableOpacity
      style={[styles.butonIkincil, { borderColor: `${renkler.sinir}`, backgroundColor: renkler.kartArkaplan }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {ikon && <FontAwesome5 name={ikon} size={15} color={renkler.metinIkincil} />}
      <Text style={[styles.butonIkincilMetin, { color: renkler.metin }]}>{etiket}</Text>
    </TouchableOpacity>
  );

  const renderButon = () => {
    if (dosyaHatasi) {
      return (
        <>
          {birincilButon('Tekrar Deneyin', () => adimaGec(ADIM.DOSYA_SEC), 'redo')}
          {ikincilButon('Vazgeçin', sihirbazdanCik)}
        </>
      );
    }

    switch (adim) {
      case ADIM.DOSYA_SEC:
        return birincilButon('Dosya Seçin', dosyaSec, 'folder-open');

      case ADIM.COZUMLE:
        return null;

      case ADIM.KARSILASTIR:
        if (gelismisAcik) {
          return birincilButon('Uygulayın', iceAktar, 'arrow-right', true);
        }
        // Gelişmiş seçiliyken karşılaştırma ekranında CTA gizli (alt-ekrana yönlendirir).
        if (seciliStrateji === 'gelismis') return null;
        return birincilButon('Devam Edin', iceAktar, 'arrow-right', true);

      case ADIM.UYGULA:
        if (durum === 'hata') {
          return (
            <>
              {birincilButon(
                'Tekrar Deneyin',
                () => {
                  dispatch(durumuSifirla());
                  adimaGec(ADIM.KARSILASTIR);
                },
                'redo'
              )}
              {ikincilButon('Vazgeçin', sihirbazdanCik)}
            </>
          );
        }
        return null;

      case ADIM.OZET:
        return birincilButon('Tamam', sihirbazdanCik, 'check', false, renkler.basarili);

      default:
        return null;
    }
  };

  // Üst barda geri okunu ne zaman gösterelim?
  const geriGoster =
    durum !== 'uygulaniyor' &&
    adim !== ADIM.COZUMLE &&
    adim !== ADIM.UYGULA &&
    adim !== ADIM.OZET;

  return (
    <View style={[styles.tamEkran, { backgroundColor: renkler.arkaplan }]}>
      <StatusBar barStyle="default" />

      <View style={styles.ustBar}>
        {geriGoster ? (
          <TouchableOpacity
            onPress={geriTusuIslevi}
            style={styles.geriButon}
            accessibilityRole="button"
            accessibilityLabel="Geri"
          >
            <FontAwesome5 name="arrow-left" size={16} color={renkler.metinIkincil} />
          </TouchableOpacity>
        ) : (
          <View style={styles.geriButon} />
        )}
        {renderNoktalar()}
        <View style={styles.geriButon} />
      </View>

      <Animated.View
        style={[styles.icerikAlani, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {renderAdim()}
      </Animated.View>

      <View style={styles.butonAlani}>{renderButon()}</View>
    </View>
  );
};
