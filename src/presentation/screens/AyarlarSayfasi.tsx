/**
 * Ayarlar Sayfası (One UI esinli yeniden kurulum — Plan 1 + Plan 2 arama/başlık)
 *
 * Dört grup: Namaz vakitleri · Hatırlatmalar · Uygulama · Veri ve destek.
 * Her satırın ikinci satırı `useAyarOzetleri` ile o ayarın MEVCUT değeridir;
 * en üstteki `KurulumSagligiKarti` ekranın tek imza öğesidir.
 *
 * Arama açıkken (sorgu boş değilken) gruplar ve sağlık kartı gizlenir, yalnız
 * `AramaSonuclari` görünür — sorgu temizlenince Plan 1 düzeni aynen döner.
 *
 * Yapışkanlık ↔ giriş animasyonu çatışması: `stickyHeaderIndices` yalnız
 * `ScrollView`'ün DOĞRUDAN çocuğuna işler. Bu yüzden yapışkan üst blok
 * (kompakt başlık + arama hapı) giriş animasyonu sarmalayıcısının DIŞINDA,
 * `ScrollView`'ün ilk çocuğu olarak durur; geri kalan içerik (büyük başlık +
 * kart/gruplar/sonuçlar) ikinci çocuktaki giriş animasyonunu KORUR.
 *
 * Büyük başlık → kompakt başlık geçişi `fontSize` ANİMASYONU YAPMAZ (native
 * driver'da çalışmaz) — iki ayrı `Text`, opacity+translateY çapraz geçişiyle.
 *
 * (Task 5 — spec: docs/superpowers/specs/2026-07-29-ayarlar-sayfasi-yeniden-kurulum-design.md)
 */
import * as React from 'react';
import { useRef, useEffect, useState, useMemo } from 'react';
import { Text, Animated, Easing, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { useYeniOzellikler } from '../hooks/useYeniOzellikler';
import { useAyarOzetleri } from '../hooks/useAyarOzetleri';
import { useKonumYenile } from '../hooks/useKonumYenile';
import { KonumYenileButonu } from '../components/common/KonumYenileButonu';
import { YeniOzellikKarti } from '../components/YeniOzellikKarti';
import { AyarGrubu } from './Ayarlar/AyarGrubu';
import { AyarSatiri } from './Ayarlar/AyarSatiri';
import { KurulumSagligiKarti } from './Ayarlar/KurulumSagligiKarti';
import { AramaAlani } from './Ayarlar/AramaAlani';
import { AramaSonuclari } from './Ayarlar/AramaSonuclari';
import { AYAR_INDEKSI } from '../../core/ayarlar/aramaIndeksi';
import { ayarAra } from '../../core/ayarlar/ayarAra';
import type { AyarlarEkranAdi, AyarlarStackParamList } from '../../navigation/ayarlarEkranlari';
import type { Sorun } from '../../core/ayarlar/kurulumSagligi';

/** Kompakt başlığın belirmeye başlayıp tamamen görünür olduğu kaydırma mesafesi (dp). */
const KOMPAKT_BASLIK_GECIS_ARALIGI = 32;

export const AyarlarSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const navigation = useNavigation<NativeStackNavigationProp<AyarlarStackParamList>>();
  const { ayarlar, titresimDurumunuDegistir, sesDurumunuDegistir } = useFeedback();
  const { kart, okunmamisVarMi, sayfaOkunmamisMi, sayfayiGorulduIsaretle, kartiKapat } = useYeniOzellikler();
  const { ozetler, sorunlar, saglikOzetSatiri } = useAyarOzetleri();
  const konumYenile = useKonumYenile();

  const [sorgu, setSorgu] = useState('');
  const sorguTemiz = sorgu.trim();
  const sonuclar = useMemo(
    () => (sorguTemiz ? ayarAra(AYAR_INDEKSI, sorgu) : []),
    [sorgu, sorguTemiz]
  );

  // Giriş animasyonu (KORUNUR — spec §1 "KORUNACAK davranışlar")
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Büyük başlık → kompakt başlık geçişi.
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );
  const kompaktBaslikOpaklik = scrollY.interpolate({
    inputRange: [0, KOMPAKT_BASLIK_GECIS_ARALIGI],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const kompaktBaslikKaymasi = scrollY.interpolate({
    inputRange: [0, KOMPAKT_BASLIK_GECIS_ARALIGI],
    outputRange: [8, 0],
    extrapolate: 'clamp',
  });

  // Bir satıra dokununca ilgili özelliği (varsa) görüldü işaretle, sonra geç.
  // "Neler yeni" hariç — o sayfanın kendi rozet semantiği var (okunmamisVarMi).
  const menuyeGit = (sayfa: AyarlarEkranAdi) => {
    if (sayfa !== 'NelerYeni') sayfayiGorulduIsaretle(sayfa);
    navigation.navigate(sayfa);
  };

  const saglikEylemi = (sorun: Sorun) => {
    if (sorun.eylem?.tip === 'sistemAyarlari') {
      Linking.openSettings();
    } else if (sorun.eylem?.tip === 'sayfa') {
      menuyeGit(sorun.eylem.sayfa as AyarlarEkranAdi);
    }
  };

  const ikonRengi = renkler.birincil;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['top', 'left', 'right']}>
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Yapışkan üst blok — ScrollView'ün DOĞRUDAN çocuğu (bkz. dosya başı notu). */}
        <Animated.View style={{ backgroundColor: renkler.arkaplan, paddingTop: 8, paddingBottom: 12 }}>
          <Animated.View
            style={{
              opacity: kompaktBaslikOpaklik,
              transform: [{ translateY: kompaktBaslikKaymasi }],
            }}
          >
            <Text
              className="text-base font-bold mx-4 mb-2"
              style={{ color: renkler.metin }}
              numberOfLines={1}
            >
              Ayarlar
            </Text>
          </Animated.View>
          <AramaAlani deger={sorgu} onDegistir={setSorgu} />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text className="text-3xl font-bold mx-4 mb-4 mt-2" style={{ color: renkler.metin }}>
            Ayarlar
          </Text>

          {sorguTemiz ? (
            <AramaSonuclari sonuclar={sonuclar} />
          ) : (
            <>
              {/* Yeni Özellik Tanıtım Kartı (yalnızca Ayarlar'da; anasayfaya dokunmaz) — KORUNUR */}
              {kart && (
                <YeniOzellikKarti
                  ozellik={kart}
                  onAc={() => {
                    if (kart.hedefSayfa) menuyeGit(kart.hedefSayfa as AyarlarEkranAdi);
                  }}
                  onKapat={() => kartiKapat(kart.id)}
                />
              )}

              <KurulumSagligiKarti sorunlar={sorunlar} onEylem={saglikEylemi} ozetSatiri={saglikOzetSatiri} />

              <AyarGrubu baslik="Namaz vakitleri">
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="map-marker-alt" size={20} color={ikonRengi} solid />}
                  baslik="Konum"
                  ozet={ozetler.konum}
                  yeniRozetGoster={sayfaOkunmamisMi('KonumAyarlari')}
                  onPress={() => menuyeGit('KonumAyarlari')}
                  // Otomatik modda konum bayat kalabilir (bölge olayı düşmemişse);
                  // sayfaya girmeden tek dokunuşla tazelenebilsin.
                  ekEylem={
                    konumYenile.yenilenebilir ? (
                      <KonumYenileButonu
                        onPress={konumYenile.yenile}
                        yenileniyor={konumYenile.yenileniyor}
                      />
                    ) : undefined
                  }
                />
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="calendar-alt" size={20} color={ikonRengi} solid />}
                  baslik="Takvim entegrasyonu"
                  ozet={ozetler.takvim}
                  yeniRozetGoster={sayfaOkunmamisMi('TakvimAyarlari')}
                  onPress={() => menuyeGit('TakvimAyarlari')}
                />
              </AyarGrubu>

              <AyarGrubu baslik="Hatırlatmalar">
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="shield-alt" size={20} color={ikonRengi} solid />}
                  baslik="Namaz muhafızı"
                  ozet={ozetler.muhafiz}
                  yeniRozetGoster={sayfaOkunmamisMi('MuhafizAyarlari')}
                  onPress={() => menuyeGit('MuhafizAyarlari')}
                />
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="bell" size={20} color={ikonRengi} solid />}
                  baslik="Bildirimler"
                  ozet={ozetler.bildirim}
                  yeniRozetGoster={sayfaOkunmamisMi('BildirimAyarlari')}
                  onPress={() => menuyeGit('BildirimAyarlari')}
                />
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="bullseye" size={20} color={ikonRengi} solid />}
                  baslik="Seri ve hedefler"
                  ozet={ozetler.seri}
                  yeniRozetGoster={sayfaOkunmamisMi('SeriHedefAyarlari')}
                  onPress={() => menuyeGit('SeriHedefAyarlari')}
                />
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="moon" size={20} color={ikonRengi} solid />}
                  baslik="Ramazan özel"
                  ozet={ozetler.ramazan}
                  yeniRozetGoster={sayfaOkunmamisMi('RamazanAyarlari')}
                  onPress={() => menuyeGit('RamazanAyarlari')}
                />
              </AyarGrubu>

              <AyarGrubu baslik="Uygulama">
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="palette" size={20} color={ikonRengi} solid />}
                  baslik="Görünüm"
                  ozet={ozetler.gorunum}
                  yeniRozetGoster={sayfaOkunmamisMi('GorünumAyarlari')}
                  onPress={() => menuyeGit('GorünumAyarlari')}
                />
                <AyarSatiri
                  varyant="toggle"
                  ikon={<MaterialIcons name="vibration" size={22} color={ikonRengi} />}
                  baslik="Titreşim"
                  ozet="Etkileşimlerde telefon titrer."
                  deger={ayarlar.titresimAktif}
                  onDegistir={titresimDurumunuDegistir}
                />
                <AyarSatiri
                  varyant="toggle"
                  ikon={<FontAwesome5 name="volume-up" size={20} color={ikonRengi} solid />}
                  baslik="Ses efektleri"
                  ozet="Etkileşimlerde ses efektleri verir."
                  deger={ayarlar.sesAktif}
                  onDegistir={sesDurumunuDegistir}
                />
              </AyarGrubu>

              <AyarGrubu baslik="Veri ve destek">
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="cloud-download-alt" size={20} color={ikonRengi} solid />}
                  baslik="Yedekleme ve aktarım"
                  ozet={ozetler.yedekleme}
                  yeniRozetGoster={sayfaOkunmamisMi('YedeklemeAktarim')}
                  onPress={() => menuyeGit('YedeklemeAktarim')}
                />
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="comment-dots" size={20} color={ikonRengi} solid />}
                  baslik="Tanı ve geri bildirim"
                  ozet="Sorun bildirin, tanı raporu gönderin"
                  yeniRozetGoster={sayfaOkunmamisMi('TaniGeriBildirim')}
                  onPress={() => menuyeGit('TaniGeriBildirim')}
                />
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="gift" size={20} color={ikonRengi} solid />}
                  baslik="Neler yeni"
                  ozet="Uygulamaya eklenen yeni özellikler"
                  yeniRozetGoster={okunmamisVarMi}
                  onPress={() => menuyeGit('NelerYeni')}
                />
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="info-circle" size={20} color={ikonRengi} solid />}
                  baslik="Hakkında"
                  ozet={ozetler.hakkinda}
                  yeniRozetGoster={sayfaOkunmamisMi('Hakkinda')}
                  onPress={() => menuyeGit('Hakkinda')}
                />
              </AyarGrubu>
            </>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};
