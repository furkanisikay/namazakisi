/**
 * Ana navigasyon yapisi
 * Tab navigator ile sayfa gecisleri
 * Tema destekli
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { createBottomTabNavigator, BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigationContainerRef, type NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Dimensions, Platform, Text, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { KenarGezinme } from '../presentation/components/gezinme/KenarGezinme';
import { gezinmeTuruSec } from '../core/utils/ekranSinifi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AnaSayfa,
  IlerlemeSayfasi,
  AyarlarSayfasi,
  MuhafizAyarlariSayfasi,
  GorunumAyarlariSayfasi,
  HatirlatmalarSayfasi,
  VakitGirinceSayfasi,
  CumaHatirlatmaSayfasi,
  CamiyeGitSayfasi,
  YatisHatirlatmaSayfasi,
  TakvimCakismaSayfasi,
  GunSonuSayfasi,
  OzelGunSayfasi,
  NamazVakitleriSayfasi,
  SaatVeWidgetSayfasi,
  YardimSayfasi,
  CamilerimSayfasi,
  SeriHedefAyarlariSayfasi,
  HakkindaSayfasi,
  KonumAyarlariSayfasi,
  KibleSayfasi,
  RamazanAyarlariSayfasi,
  NafileAyarlariSayfasi,
  NowBarAyarlariSayfasi,
  NamazdaSessizSayfasi,
  NamazdaSessizIosSayfasi,
  SaatAyarlariSayfasi,
  TelevizyonSayfasi,
  CihazlarimSayfasi,
  KildimUygulamalariSayfasi,
  OtomasyonRehberiSayfasi,
  DebugLogsSayfasi,
  KazaDefteriSayfasi,
  KazaGecmisiSayfasi,
  KazaOtomatikAyarSayfasi,
  KazaTemizlikSayfasi,
  KazaYenidenHesaplaSayfasi,
  KurulumSihirbaziSayfasi,
  TakvimAyarlariSayfasi,
  SeferilikAyarlariSayfasi,
  NelerYeniSayfasi,
  YedeklemeSayfasi,
  IceAktarmaSihirbaziSayfasi,
  EsitlemeSayfasi,
  TaniGeriBildirimSayfasi,
} from '../presentation/screens';
import type { AyarlarEkranAdi, AyarlarStackParamList } from './ayarlarEkranlari';
import { KAZA_EKRAN_BASLIKLARI, type KazaStackParamList } from './kazaEkranlari';
import { DEPOLAMA_ANAHTARLARI } from '../core/constants/UygulamaSabitleri';
import { useRenkler } from '../core/theme';
import { useAppDispatch, useAppSelector } from '../presentation/store/hooks';
import { useEvEkraniAyari } from '../presentation/hooks/useEvEkraniAyari';
import { EvEkraniPanosu } from '../presentation/components/evEkrani/EvEkraniPanosu';
import { evEkraniGosterilsinMi } from '../core/evEkrani/evEkrani';
import { konumMetniHesapla } from '../core/ayarlar/konumMetni';
import { ozellikleriYukle } from '../presentation/store/ozelliklerSlice';
import { useYeniOzellikler } from '../presentation/hooks/useYeniOzellikler';
import { GuncellemeBildirimi } from '../presentation/components/guncelleme/GuncellemeBildirimi';
import ErrorBoundary from '../presentation/components/common/ErrorBoundary';
import {
  useKildimDerinBaglantisi,
  kildimOnayBasligi,
  KILDIM_ONAY_MESAJI,
} from '../presentation/hooks/useKildimDerinBaglantisi';
import { KildimIzinModali } from '../presentation/components/kildim/KildimIzinModali';
import { useSiriEkranIstegi } from '../presentation/hooks/useSiriEkranIstegi';
import { derinBaglantiYapilandirmasi, type AnaSekmeParamList } from './derinBaglantilar';
import { anaAyrintiYerlesimiOlustur } from '../presentation/components/common/AnaAyrintiDuzeni';
import { CihazRoluSorusu } from '../presentation/components/cihaz/CihazRoluSorusu';
import { OkunabilirGenislik } from '../presentation/components/common/OkunabilirGenislik';
import { useSadeGorunum } from '../presentation/hooks/useSadeGorunum';
import { anaAyrintiMi } from '../core/utils/ekranSinifi';

/**
 * Root stack navigation parameter list.
 * Defines all top-level screens and their params.
 */
export type RootStackParamList = {
  KurulumSihirbazi: undefined;
  /** Parametre yalnız derin bağlantı içindir (`namazakisi://kaza`, issue #276). */
  MainTabs: NavigatorScreenParams<AnaSekmeParamList> | undefined;
};

/** Navigation prop type for screens inside root stack. */
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AyarlarStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const KazaStackNav = createNativeStackNavigator<KazaStackParamList>();

/**
 * Ayarlar stack'indeki ekran tanımları — `Record<AyarlarEkranAdi, …>` her
 * adı ZORUNLU kılar: `ayarlarEkranlari.ts`'teki liste ile burası ayrışırsa
 * (biri eksik/fazlaysa) `npm run typecheck` düşer. Nöbetçi test yerine
 * derleme zamanı garantisi (task-1-brief.md).
 *
 * Başlıklar ve `headerShown` değerleri eski satır-satır tanımlardan BİREBİR
 * korunmuştur — davranış değişmez.
 */
const AYARLAR_EKRAN_TANIMLARI: Record<
  AyarlarEkranAdi,
  { component: React.ComponentType; options?: NativeStackNavigationOptions }
> = {
  // `title` baslik icin degil (header gizli): iOS geri dugmesinin erisilebilirlik
  // etiketi ve uzun basista acilan gecmis menusu onceki ekranin basligini okur.
  AyarlarAna: { component: AyarlarSayfasi, options: { headerShown: false, title: 'Ayarlar' } },
  // Sade tasarım (Dalga 3): tek Hatırlatmalar sayfası + ayrıntıları.
  Hatirlatmalar: { component: HatirlatmalarSayfasi, options: { title: 'Hatırlatmalar' } },
  VakitGirinceAyarlari: { component: VakitGirinceSayfasi, options: { title: 'Vakit girince' } },
  CumaHatirlatmaAyarlari: { component: CumaHatirlatmaSayfasi, options: { title: 'Cuma namazı' } },
  CamiyeGitAyarlari: { component: CamiyeGitSayfasi, options: { title: 'Camiye gitme vakti' } },
  YatisHatirlatmaAyarlari: { component: YatisHatirlatmaSayfasi, options: { title: 'Yatmadan önce' } },
  TakvimCakismaAyarlari: { component: TakvimCakismaSayfasi, options: { title: 'Toplantı çakışırsa' } },
  GunSonuAyarlari: { component: GunSonuSayfasi, options: { title: 'Günü tamamlamadıysam' } },
  OzelGunAyarlari: { component: OzelGunSayfasi, options: { title: 'Özel gün' } },
  NamazVakitleriAyarlari: { component: NamazVakitleriSayfasi, options: { title: 'Namaz vakitleri' } },
  SaatVeWidgetAyarlari: { component: SaatVeWidgetSayfasi, options: { title: 'Saat ve widget' } },
  Yardim: { component: YardimSayfasi, options: { title: 'Yardım' } },
  Camilerim: { component: CamilerimSayfasi, options: { title: 'Camilerim' } },
  KonumAyarlari: { component: KonumAyarlariSayfasi, options: { title: 'Konum' } },
  GorünumAyarlari: { component: GorunumAyarlariSayfasi, options: { title: 'Görünüm' } },
  // Eski "Bildirimler" rotası (Neler Yeni, eski bağlantılar) Hatırlatmalar sayfasını açar.
  BildirimAyarlari: { component: HatirlatmalarSayfasi, options: { title: 'Hatırlatmalar' } },
  SeriHedefAyarlari: { component: SeriHedefAyarlariSayfasi, options: { title: 'Seri hedefi' } },
  MuhafizAyarlari: { component: MuhafizAyarlariSayfasi, options: { title: 'Vakit çıkmadan' } },
  Hakkinda: { component: HakkindaSayfasi, options: { title: 'Hakkında' } },
  RamazanAyarlari: { component: RamazanAyarlariSayfasi, options: { title: 'Ramazan' } },
  NafileAyarlari: { component: NafileAyarlariSayfasi, options: { title: 'Nafile Namazlar' } },
  // iOS (#295): ayni secim canli etkinlik (Dinamik Ada / kilit ekrani) olarak calisir.
  NowBarAyarlari: {
    component: NowBarAyarlariSayfasi,
    // Ad marka terimi DEĞİL (Now Bar yalnız Samsung'da); kök satırıyla aynı ad.
    options: { title: Platform.OS === 'ios' ? 'Canlı etkinlikler' : 'Canlı sayaçlar' },
  },
  // Camideyim + Namaz modu TEK sayfa ("Namazda sessiz"); iki eski rota da onu açar
  // (derin bağlantı `namazakisi://camideyim` ve saat W3 çalışmaya devam eder).
  // iPhone'da Camideyim modülü yok; aynı rota Odak + Kısayollar kurulum rehberini açar.
  CamideyimAyarlari: { component: Platform.OS === 'ios' ? NamazdaSessizIosSayfasi : NamazdaSessizSayfasi, options: { title: 'Namazda sessiz' } },
  NamazModuAyarlari: { component: Platform.OS === 'ios' ? NamazdaSessizIosSayfasi : NamazdaSessizSayfasi, options: { title: 'Namazda sessiz' } },
  // Wear OS saati ile iş bölümü (saat W3) — listede yalnız Android'de görünür.
  SaatAyarlari: { component: SaatAyarlariSayfasi, options: { title: 'Akıllı saat' } },
  Cihazlarim: { component: CihazlarimSayfasi, options: { title: 'Cihazlarım' } },
  // TV ekranı "Ayarlar › Cihazlarım › TV ekleyin" der; başlık bu yolla birebir aynı kalmalı.
  TelevizyonAyarlari: { component: TelevizyonSayfasi, options: { title: 'TV ekleyin' } },
  KildimUygulamalari: { component: KildimUygulamalariSayfasi, options: { title: 'Kıldım İşaretleyen Uygulamalar' } },
  OtomasyonRehberi: { component: OtomasyonRehberiSayfasi, options: { title: 'Otomasyonlarla Kullanın' } },
  DebugLogs: { component: DebugLogsSayfasi, options: { title: 'Tanı kayıtları' } },
  TakvimAyarlari: { component: TakvimAyarlariSayfasi, options: { title: 'Vakitleri takvime ekleyin' } },
  SeferilikAyarlari: { component: SeferilikAyarlariSayfasi, options: { title: 'Yolculuk Bilgisi' } },
  NelerYeni: { component: NelerYeniSayfasi, options: { title: 'Neler Yeni' } },
  YedeklemeAktarim: { component: YedeklemeSayfasi, options: { title: 'Yedek ve eşitleme' } },
  IceAktarmaSihirbazi: { component: IceAktarmaSihirbaziSayfasi, options: { headerShown: false } },
  EsitlemeAyarlari: { component: EsitlemeSayfasi, options: { title: 'Cihazlar arası eşitleme' } },
  TaniGeriBildirim: { component: TaniGeriBildirimSayfasi, options: { title: 'Tanı ve Geri Bildirim' } },
};

/**
 * Tablet / iPad geniş pencerede Ayarlar ana-ayrıntı: solda ayar listesi, sağda sayfa
 * (kökteyken Hatırlatmalar). Dar pencerede okunabilir sütun (eski davranış).
 * Modül düzeyi: `screenLayout` referansı sabit kalsın.
 */
/** Kıble ve İlerleme sekmelerinin sarmalayıcısı (modül düzeyi: referansı sabit): geniş pencerede okunabilir sütun. */
const ayarEkraniYerlesimi = ({ children }: { children: React.ReactElement }) => (
  <OkunabilirGenislik>{children}</OkunabilirGenislik>
);

const ayarlarYerlesimi = anaAyrintiYerlesimiOlustur(
  {
    anaRota: 'AyarlarAna',
    Ana: AyarlarSayfasi,
    Varsayilan: HatirlatmalarSayfasi,
    varsayilanRota: 'Hatirlatmalar',
    varsayilanBaslik: 'Hatırlatmalar',
    basliklar: Object.fromEntries(
      Object.entries(AYARLAR_EKRAN_TANIMLARI).map(([ad, t]) => [ad, t.options?.title as string | undefined])
    ),
  },
  ['IceAktarmaSihirbazi']
);

/** Kaza ana-ayrıntı: solda defter, sağda (kökteyken) geçmiş. */
const kazaYerlesimi = anaAyrintiYerlesimiOlustur({
  anaRota: 'KazaDefteriAna',
  Ana: KazaDefteriSayfasi,
  Varsayilan: KazaGecmisiSayfasi,
  varsayilanRota: 'KazaGecmisi',
  varsayilanBaslik: KAZA_EKRAN_BASLIKLARI.KazaGecmisi,
  basliklar: KAZA_EKRAN_BASLIKLARI,
});

/**
 * Ayarlar Alt Navigasyonu
 * Tum ayar sayfalari burada tanimlanir
 */
const AyarlarStack: React.FC = () => {
  const renkler = useRenkler();
  // Ana-ayrıntıda başlık yalnız ayrıntının üstünde çizilir (native başlık tam genişlikti).
  const anaAyrinti = anaAyrintiMi(useWindowDimensions().width);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: renkler.birincil,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // iOS: bos `headerBackTitle` YOK SAYILIR ve geri dugmesine onceki ekranin
        // basligi yazilir — Ayarlar kokunun basligi olmadigi icin ROTA ADI
        // ("AyarlarAna") gorunuyordu. Yalniz ok gosterilir.
        headerBackButtonDisplayMode: 'minimal',
        headerShown: !anaAyrinti,
      }}
      // Katlanabilir/tablet (issue #283): orta pencerede okunabilir sütun, geniş
      // pencerede ana-ayrıntı; telefonda etkisizdir.
      screenLayout={ayarlarYerlesimi}
    >
      {(Object.entries(AYARLAR_EKRAN_TANIMLARI) as Array<
        [AyarlarEkranAdi, (typeof AYARLAR_EKRAN_TANIMLARI)[AyarlarEkranAdi]]
      >).map(([ad, tanim]) => (
        <Stack.Screen key={ad} name={ad} component={tanim.component} options={tanim.options} />
      ))}
    </Stack.Navigator>
  );
};

/**
 * Kaza Defteri sekmesi (Kaza Defteri 2.0): kök kendi başlığını taşır, alt
 * ekranların başlığı yalnız burada (navigasyon header'ı) durur.
 */
const KazaStack: React.FC = () => {
  const renkler = useRenkler();
  const anaAyrinti = anaAyrintiMi(useWindowDimensions().width);
  return (
    <KazaStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: renkler.birincil },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackButtonDisplayMode: 'minimal',
        headerShown: !anaAyrinti,
      }}
      screenLayout={kazaYerlesimi}
    >
      <KazaStackNav.Screen
        name="KazaDefteriAna"
        component={KazaDefteriSayfasi}
        options={{ headerShown: false, title: 'Kaza Defteri' }}
      />
      <KazaStackNav.Screen name="KazaGecmisi" component={KazaGecmisiSayfasi} options={{ title: KAZA_EKRAN_BASLIKLARI.KazaGecmisi }} />
      <KazaStackNav.Screen
        name="KazaOtomatikAyar"
        component={KazaOtomatikAyarSayfasi}
        options={{ title: KAZA_EKRAN_BASLIKLARI.KazaOtomatikAyar }}
      />
      <KazaStackNav.Screen name="KazaTemizlik" component={KazaTemizlikSayfasi} options={{ title: KAZA_EKRAN_BASLIKLARI.KazaTemizlik }} />
      <KazaStackNav.Screen
        name="KazaYenidenHesapla"
        component={KazaYenidenHesaplaSayfasi}
        options={{ title: KAZA_EKRAN_BASLIKLARI.KazaYenidenHesapla }}
      />
    </KazaStackNav.Navigator>
  );
};

/**
 * Ana Tab Navigasyonu — sade tasarım (Dalga 4): Bugün · Kıble · Kaza · İlerleme · Ayarlar.
 * Kıble kök yığından sekmeye taşındı (eski `KibleSayfasi` rotası yok; Siri ve
 * `namazakisi://kible` sekmeyi açar). Rozetler + İstatistik + Seri tek "İlerleme"
 * sekmesinde.
 */
const MainTabs: React.FC = () => {
  const renkler = useRenkler();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { okunmamisVarMi } = useYeniOzellikler();
  // Sade görünüm (issue #295): ana ekranda sekme çubuğu GİZLİ — tek ekran, gezinme yok.
  // Koşullu yayma şart: `tabBarStyle: undefined` screenOptions'taki stili EZERDİ.
  const sade = useSadeGorunum();

  // Yeni özellik duyuru durumunu uygulama açılışında yükle (tab rozeti için)
  useEffect(() => {
    dispatch(ozellikleriYukle());
  }, [dispatch]);

  // Tablet / iPad: alt çubuk yerine ray (orta) ya da kalıcı kenar çubuğu (geniş).
  const pencere = useWindowDimensions();
  const gezinme = gezinmeTuruSec(pencere.width);
  const kenarCubugu = useCallback(
    (props: BottomTabBarProps) =>
      gezinme === 'alt' ? <BottomTabBar {...props} /> : <KenarGezinme {...props} tur={gezinme} />,
    [gezinme]
  );

  // Tablet ev ekranı (ayardan açılır): yatay tam ekranda pano tüm gezinmenin üstüne çizilir.
  const evEkrani = useEvEkraniAyari();
  const konum = useAppSelector((s) => s.konum);
  const [evEkraniKapatildi, setEvEkraniKapatildi] = useState(false);
  useEffect(() => {
    if (!evEkrani.acik) setEvEkraniKapatildi(false);
  }, [evEkrani.acik]);
  const panoGoster =
    !evEkraniKapatildi &&
    !!konum?.koordinatlar &&
    !(konum.koordinatlar.lat === 0 && konum.koordinatlar.lng === 0) &&
    evEkraniGosterilsinMi({
      ayarAcik: evEkrani.acik,
      sadeEtkin: sade.etkin,
      pencere,
      ekran: Dimensions.get('screen'),
    });

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      initialRouteName="AnaSayfa"
      detachInactiveScreens={false}
      tabBar={kenarCubugu}
      screenOptions={{
        tabBarPosition: gezinme === 'alt' ? 'bottom' : 'left',
        headerStyle: {
          backgroundColor: renkler.birincil,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: renkler.kartArkaplan,
          borderTopColor: renkler.sinir,
          borderTopWidth: 1,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          height: 65 + insets.bottom,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: renkler.birincil,
        tabBarInactiveTintColor: renkler.metinIkincil,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        // react-freeze Suspense mekanizmasinin NavigationStateContext'i kaybetmesini engeller
        freezeOnBlur: false,
      }}
    >
      <Tab.Screen
        name="AnaSayfa"
        component={AnaSayfa}
        options={{
          title: 'Namaz Akışı',
          // Rota adı `AnaSayfa` KALIR (derin bağlantı `ana`, testler); görünen ad "Bugün".
          tabBarLabel: 'Bugün',
          headerShown: false,
          ...(sade.etkin ? { tabBarStyle: { display: 'none' as const } } : {}),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="mosque" size={20} color={focused ? renkler.birincil : renkler.metinIkincil} />
          ),
        }}
      />
      <Tab.Screen
        name="Kible"
        component={KibleSayfasi}
        // Tablet/açık katlanabilirde okunabilir sütun (Ayarlar/Kaza yığınlarıyla aynı sarmalayıcı).
        layout={ayarEkraniYerlesimi}
        options={{
          title: 'Kıble',
          tabBarLabel: 'Kıble',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="compass" size={20} color={focused ? renkler.birincil : renkler.metinIkincil} />
          ),
        }}
      />
      <Tab.Screen
        name="KazaDefteri"
        component={KazaStack}
        options={{
          title: 'Kaza Defteri',
          headerShown: false,
          tabBarLabel: 'Kaza',
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="book" size={20} color={focused ? renkler.birincil : renkler.metinIkincil} />
          ),
        }}
      />
      <Tab.Screen
        name="Ilerleme"
        component={IlerlemeSayfasi}
        // Tablet/açık katlanabilirde okunabilir sütun (Ayarlar/Kaza yığınlarıyla aynı sarmalayıcı).
        layout={ayarEkraniYerlesimi}
        options={{
          title: 'İlerleme',
          tabBarLabel: 'İlerleme',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="star" solid size={20} color={focused ? renkler.birincil : renkler.metinIkincil} />
          ),
        }}
      />
      <Tab.Screen
        name="Ayarlar"
        component={AyarlarStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Ayarlar',
          // Okunmamış yeni özellik varsa küçük nokta rozeti (anasayfa akışını bozmaz)
          tabBarBadge: okunmamisVarMi ? '' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: renkler.birincil,
            minWidth: 10,
            maxHeight: 10,
            borderRadius: 5,
            fontSize: 1,
            lineHeight: 10,
            alignSelf: 'center',
            marginTop: 4,
          },
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="cog" size={20} color={focused ? renkler.birincil : renkler.metinIkincil} />
          ),
        }}
      />
    </Tab.Navigator>
    {/* Gezinmenin ÜSTÜNDE (kardeş, sonra çizilir); Split View'da gösterilmez. */}
    {panoGoster ? (
      <EvEkraniPanosu
        lat={konum.koordinatlar.lat}
        lng={konum.koordinatlar.lng}
        konumMetni={konumMetniHesapla(konum)}
        onKapat={() => setEvEkraniKapatildi(true)}
      />
    ) : null}
    {/* Tek beyin: geniş ekranda bir kez "ana telefonunuz mu?" (yeni kurulum sihirbazda görür). */}
    <CihazRoluSorusu />
    </View>
  );
};

/**
 * Ana navigator - Root Stack
 * Tema destekli, ilk kurulum kontrollu
 */
export const AppNavigator: React.FC = () => {
  const [ilkKurulum, setIlkKurulum] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI).then(deger => {
      setIlkKurulum(deger === null);
    });
  }, []);

  // Kurulum sihirbazı sürerken derin bağlantı sihirbazı atlatmasın (issue #276).
  // Bağlantı dışarıdan gelebilir → güven listesi karar verir (issue #299).
  const kildimOnayi = useKildimDerinBaglantisi(ilkKurulum === false);
  // iOS Siri / Kısayollar "Kıbleyi aç" (issue #279): intent ekran isteği bırakır,
  // gezinme kabı hazır olunca tüketilir (soğuk açılışta bağlantı olayı kaybolurdu).
  const navRef = useNavigationContainerRef<RootStackParamList>();
  const siriEkranIstegiIsle = useSiriEkranIstegi(ilkKurulum === false, navRef);

  if (ilkKurulum === null) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <NavigationContainer
      ref={navRef}
      onReady={siriEkranIstegiIsle}
      linking={ilkKurulum ? undefined : derinBaglantiYapilandirmasi}
    >
      <ErrorBoundary name="NavigatorBoundary">
        <RootStack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={ilkKurulum ? 'KurulumSihirbazi' : 'MainTabs'}
        >
          <RootStack.Screen name="KurulumSihirbazi" component={KurulumSihirbaziSayfasi} />
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        </RootStack.Navigator>
      </ErrorBoundary>
      <ErrorBoundary name="GuncellemeBoundary">
        <GuncellemeBildirimi />
      </ErrorBoundary>
      <KildimIzinModali
        vakitAdi={kildimOnayi.onayAdayi?.vakitAdi ?? null}
        baslatan={kildimOnayi.baslatan}
        kimliksizBaslik={kildimOnayi.onayAdayi ? kildimOnayBasligi(kildimOnayi.onayAdayi) : ''}
        kimliksizMesaj={KILDIM_ONAY_MESAJI}
        onHerZaman={kildimOnayi.herZamanIzinVer}
        onBuSefer={kildimOnayi.onayla}
        onEngelle={kildimOnayi.engelle}
        onVazgec={kildimOnayi.vazgec}
      />
    </NavigationContainer>
  );
};
