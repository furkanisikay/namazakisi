/**
 * Ayarlar kökü — görev bazlı gruplar (sade tasarım, Dalga 3).
 *
 *   Namaz              · Hatırlatmalar · Namazda sessiz · Namaz vakitleri · Seri hedefi
 *   Ekran ve cihazlar  · Görünüm · Saat ve widget · Dokunma titreşimi · Dokunma sesleri
 *   Hesap              · Yedek ve eşitleme · Yardım
 *
 * Her satırın ikinci satırı o ayarın CANLI özetidir (`useAyarOzetleri`,
 * `core/hatirlatma/hatirlatmaOzetleri`); en üstteki `KurulumSagligiKarti` durumu tek
 * bakışta söyler. Taşınanlar (envanter 4.3): Bildirimler → Hatırlatmalar sayfasına
 * dağıldı; Camideyim + Namaz modu → "Namazda sessiz"; mezhep → Namaz vakitleri; özel gün →
 * Hatırlatmalar; kurulumu yeniden başlatma → Yardım; vakit sayacı, canlı sayaçlar,
 * bileklik rehberi, otomasyon → Saat ve widget. Ayar verisi/anahtarları DEĞİŞMEDİ.
 *
 * Arama açıkken (sorgu boş değilken) gruplar ve sağlık kartı gizlenir, yalnız
 * `AramaSonuclari` görünür. Yapışkan üst blok (kompakt başlık + arama) giriş
 * animasyonu sarmalayıcısının DIŞINDA, `ScrollView`'ün ilk çocuğudur
 * (`stickyHeaderIndices` yalnız doğrudan çocuğa işler). Büyük → kompakt başlık
 * geçişi `fontSize` animasyonu yapmaz (native driver), iki ayrı `Text` çapraz geçer.
 */
import * as React from 'react';
import { useRef, useEffect, useState, useMemo } from 'react';
import { Text, Animated, Easing, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { useYeniOzellikler } from '../hooks/useYeniOzellikler';
import { useAyarOzetleri } from '../hooks/useAyarOzetleri';
import { useSistemDurumu } from '../hooks/useSistemDurumu';
import { usePilRehberi } from '../hooks/usePilRehberi';
import { useCamideyimOzeti } from '../hooks/useCamideyimOzeti';
import { useNowBarOzeti } from '../hooks/useNowBarOzeti';
import { PilRehberModal } from '../components/pil/PilRehberi';
import { alarmIzniAyariniAc } from '../../domain/services/SistemDurumuOkuyucu';
import { useKonumYenile } from '../hooks/useKonumYenile';
import { useSeferilik } from '../hooks/useSeferilik';
import { MEZHEP_ADLARI } from '../../core/seferilik/seferilikAyarlari';
import { konumMetniHesapla } from '../../core/ayarlar/konumMetni';
import { useAppSelector } from '../store/hooks';
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

/**
 * Bir kök satırın altında kalan sayfalar — "Yeni" rozeti ve görüldü işareti grup
 * bazındadır (duyuru `hedefSayfa`sı alt sayfayı gösterebilir).
 */
const HATIRLATMA_SAYFALARI: readonly AyarlarEkranAdi[] = [
  'Hatirlatmalar',
  'BildirimAyarlari',
  'MuhafizAyarlari',
  'VakitGirinceAyarlari',
  'CumaHatirlatmaAyarlari',
  'CamiyeGitAyarlari',
  'YatisHatirlatmaAyarlari',
  'TakvimCakismaAyarlari',
  'GunSonuAyarlari',
  'OzelGunAyarlari',
  'NafileAyarlari',
  'RamazanAyarlari',
];
const SESSIZ_SAYFALARI: readonly AyarlarEkranAdi[] = ['CamideyimAyarlari', 'NamazModuAyarlari', 'Camilerim'];
const VAKIT_SAYFALARI: readonly AyarlarEkranAdi[] = [
  'NamazVakitleriAyarlari',
  'KonumAyarlari',
  'SeferilikAyarlari',
  'TakvimAyarlari',
];
const CIHAZ_SAYFALARI: readonly AyarlarEkranAdi[] = [
  'SaatVeWidgetAyarlari',
  'SaatAyarlari',
  'TelevizyonAyarlari',
  'NowBarAyarlari',
  'OtomasyonRehberi',
  'KildimUygulamalari',
];
const YARDIM_SAYFALARI: readonly AyarlarEkranAdi[] = ['Yardim', 'TaniGeriBildirim', 'Hakkinda'];

export const AyarlarSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const navigation = useNavigation<NativeStackNavigationProp<AyarlarStackParamList>>();
  const { ayarlar, titresimDurumunuDegistir, sesDurumunuDegistir } = useFeedback();
  const { kart, okunmamisVarMi, sayfaOkunmamisMi, sayfayiGorulduIsaretle, kartiKapat } = useYeniOzellikler();
  // Pil muafiyeti + tam alarm: uygulamaya dönüşte de tazelenir (ayar ekranından geri gelince).
  const sistem = useSistemDurumu();
  // Camideyim + Namaz modu (#297/#277): Android'de köprü varken; iPhone'da daima (Odak rehberi).
  const camideyim = useCamideyimOzeti();
  // Now Bar ve canlı sayaçlar (#282): Android; iOS'ta canlı etkinlik taşıyan build.
  const nowBar = useNowBarOzeti();
  const pilRehberi = usePilRehberi(sistem);
  const { ozetler, sorunlar, saglikOzetSatiri } = useAyarOzetleri(sistem);
  const konumYenile = useKonumYenile();
  // Mezhep (ortak ayar) seferîlik diliminde yaşar; dilim yoksa (eski test mock'u) Hanefî.
  const seferilik = useSeferilik().durum;
  const konum = useAppSelector((s) => s.konum);

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
    // Rota birleşimi büyük (35 ekran): TS aşırı yük çıkarımı bölünmüyor → tek imza.
    (navigation.navigate as (ekran: AyarlarEkranAdi) => void)(sayfa);
  };

  /** Grup satırı: alt sayfaların duyurularını da görüldü sayar. */
  const grubaGit = (sayfa: AyarlarEkranAdi, grup: readonly AyarlarEkranAdi[]) => {
    grup.forEach((g) => sayfayiGorulduIsaretle(g));
    menuyeGit(sayfa);
  };
  const grupOkunmamisMi = (grup: readonly AyarlarEkranAdi[]) => grup.some((g) => sayfaOkunmamisMi(g));

  // ── Canlı özetler ──
  const hatirlatmaOzeti = ozetler.hatirlatmalar;
  const namazdaSessizOzeti = camideyim.iosOzeti ??
    (camideyim.cami === 'Kapalı' && camideyim.namazModu === 'Kapalı'
      ? 'Kapalı'
      : camideyim.cami !== 'Kapalı'
        ? `Camide: ${camideyim.cami}`
        : `Vakitlerde: ${camideyim.namazModu}`);
  const mezhep = seferilik?.ayarlar.mezhep ?? 'hanefi';
  const namazVakitleriOzeti = `${konumMetniHesapla({
    konumModu: konum.konumModu,
    gpsAdres: konum.gpsAdres,
    seciliIlceAdi: konum.seciliIlceAdi,
    seciliIlAdi: konum.seciliIlAdi,
  })} · ${MEZHEP_ADLARI[mezhep]}`;
  // Saat ve widget: Android'de her zaman (saat, sayaç, bileklik); iOS'ta yalnız canlı
  // etkinlik taşıyan build'de (başka bir şey yoksa sayfa "bu telefonda yok"tan ibaret olurdu).
  const saatVeWidgetVar = Platform.OS === 'android' || nowBar.kullanilabilir;
  const saatVeWidgetOzeti =
    Platform.OS === 'android' ? 'Saat, canlı sayaç, bileklik' : `Canlı etkinlikler · ${nowBar.ozet ?? ''}`.replace(/ · $/, '');

  const saglikEylemi = (sorun: Sorun) => {
    if (sorun.eylem?.tip === 'sistemAyarlari') {
      Linking.openSettings();
    } else if (sorun.eylem?.tip === 'sayfa') {
      menuyeGit(sorun.eylem.sayfa as AyarlarEkranAdi);
    } else if (sorun.eylem?.tip === 'pilAyarlari') {
      pilRehberi.rehberiAc();
    } else if (sorun.eylem?.tip === 'alarmIzni') {
      void alarmIzniAyariniAc();
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

              <AyarGrubu baslik="Namaz">
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="bell" size={20} color={ikonRengi} solid />}
                  baslik="Hatırlatmalar"
                  ozet={hatirlatmaOzeti}
                  yeniRozetGoster={grupOkunmamisMi(HATIRLATMA_SAYFALARI)}
                  onPress={() => grubaGit('Hatirlatmalar', HATIRLATMA_SAYFALARI)}
                />
                {/* Dizi (Fragment değil): AyarGrubu ayraçları Children.toArray ile sayar. */}
                {camideyim.kullanilabilir && [
                  <AyarSatiri
                    key="namazda-sessiz"
                    varyant="navigasyon"
                    ikon={<FontAwesome5 name="volume-mute" size={20} color={ikonRengi} solid />}
                    baslik="Namazda sessiz"
                    ozet={namazdaSessizOzeti}
                    yeniRozetGoster={grupOkunmamisMi(SESSIZ_SAYFALARI)}
                    onPress={() => grubaGit('CamideyimAyarlari', SESSIZ_SAYFALARI)}
                  />,
                ]}
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="map-marker-alt" size={20} color={ikonRengi} solid />}
                  baslik="Namaz vakitleri"
                  ozet={namazVakitleriOzeti}
                  yeniRozetGoster={grupOkunmamisMi(VAKIT_SAYFALARI)}
                  onPress={() => grubaGit('NamazVakitleriAyarlari', VAKIT_SAYFALARI)}
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
                  ikon={<FontAwesome5 name="bullseye" size={20} color={ikonRengi} solid />}
                  baslik="Seri hedefi"
                  ozet={ozetler.seri}
                  yeniRozetGoster={sayfaOkunmamisMi('SeriHedefAyarlari')}
                  onPress={() => menuyeGit('SeriHedefAyarlari')}
                />
              </AyarGrubu>

              <AyarGrubu baslik="Ekran ve cihazlar">
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="palette" size={20} color={ikonRengi} solid />}
                  baslik="Görünüm"
                  ozet={ozetler.gorunum}
                  yeniRozetGoster={sayfaOkunmamisMi('GorünumAyarlari')}
                  onPress={() => menuyeGit('GorünumAyarlari')}
                />
                {saatVeWidgetVar && [
                  <AyarSatiri
                    key="saat-widget"
                    varyant="navigasyon"
                    ikon={<FontAwesome5 name="clock" size={20} color={ikonRengi} />}
                    baslik="Saat ve widget"
                    ozet={saatVeWidgetOzeti}
                    yeniRozetGoster={grupOkunmamisMi(CIHAZ_SAYFALARI)}
                    onPress={() => grubaGit('SaatVeWidgetAyarlari', CIHAZ_SAYFALARI)}
                  />,
                ]}
                <AyarSatiri
                  varyant="toggle"
                  ikon={<MaterialIcons name="vibration" size={22} color={ikonRengi} />}
                  baslik="Dokunma titreşimi"
                  ozet="Dokununca telefon hafifçe titrer"
                  deger={ayarlar.titresimAktif}
                  onDegistir={titresimDurumunuDegistir}
                />
                <AyarSatiri
                  varyant="toggle"
                  ikon={<FontAwesome5 name="volume-up" size={20} color={ikonRengi} solid />}
                  baslik="Dokunma sesleri"
                  ozet="Dokununca kısa bir ses çıkar"
                  deger={ayarlar.sesAktif}
                  onDegistir={sesDurumunuDegistir}
                />
              </AyarGrubu>

              <AyarGrubu baslik="Hesap">
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="cloud-download-alt" size={20} color={ikonRengi} solid />}
                  baslik="Yedek ve eşitleme"
                  ozet={ozetler.yedekleme}
                  yeniRozetGoster={sayfaOkunmamisMi('YedeklemeAktarim')}
                  onPress={() => menuyeGit('YedeklemeAktarim')}
                />
                <AyarSatiri
                  varyant="navigasyon"
                  ikon={<FontAwesome5 name="life-ring" size={20} color={ikonRengi} solid />}
                  baslik="Yardım"
                  ozet="Sorun bildirin, neler yeni"
                  yeniRozetGoster={okunmamisVarMi}
                  onPress={() => grubaGit('Yardim', YARDIM_SAYFALARI)}
                />
              </AyarGrubu>
            </>
          )}
        </Animated.View>
      </Animated.ScrollView>
      <PilRehberModal
        gorunur={pilRehberi.rehberGorunur}
        samsung={pilRehberi.samsung}
        onAc={pilRehberi.ayarlariAc}
        onKapat={pilRehberi.rehberiKapat}
      />
    </SafeAreaView>
  );
};
