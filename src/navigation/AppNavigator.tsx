/**
 * Ana navigasyon yapisi
 * Tab navigator ile sayfa gecisleri
 * Tema destekli
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AnaSayfa,
  IstatistikSayfasi,
  AyarlarSayfasi,
  RozetlerSayfasi,
  MuhafizAyarlariSayfasi,
  GorünumAyarlariSayfasi,
  BildirimAyarlariSayfasi,
  SeriHedefAyarlariSayfasi,
  HakkindaSayfasi,
  KonumAyarlariSayfasi,
  KibleSayfasi,
  RamazanAyarlariSayfasi,
  DebugLogsSayfasi,
  KazaDefteriSayfasi,
  KurulumSihirbaziSayfasi,
  TakvimAyarlariSayfasi,
  NelerYeniSayfasi,
  YedeklemeSayfasi,
  IceAktarmaSihirbaziSayfasi,
  TaniGeriBildirimSayfasi,
} from '../presentation/screens';
import type { AyarlarEkranAdi, AyarlarStackParamList } from './ayarlarEkranlari';
import { DEPOLAMA_ANAHTARLARI } from '../core/constants/UygulamaSabitleri';
import { useRenkler } from '../core/theme';
import { useAppDispatch } from '../presentation/store/hooks';
import { ozellikleriYukle } from '../presentation/store/ozelliklerSlice';
import { useYeniOzellikler } from '../presentation/hooks/useYeniOzellikler';
import { GuncellemeBildirimi } from '../presentation/components/guncelleme/GuncellemeBildirimi';
import ErrorBoundary from '../presentation/components/common/ErrorBoundary';

/**
 * Root stack navigation parameter list.
 * Defines all top-level screens and their params.
 */
export type RootStackParamList = {
  KurulumSihirbazi: undefined;
  MainTabs: undefined;
  KibleSayfasi: undefined;
};

/** Navigation prop type for screens inside root stack. */
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AyarlarStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

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
  AyarlarAna: { component: AyarlarSayfasi, options: { headerShown: false } },
  KonumAyarlari: { component: KonumAyarlariSayfasi, options: { title: 'Konum Ayarları' } },
  GorünumAyarlari: { component: GorünumAyarlariSayfasi, options: { title: 'Görünüm' } },
  BildirimAyarlari: { component: BildirimAyarlariSayfasi, options: { title: 'Bildirimler' } },
  SeriHedefAyarlari: { component: SeriHedefAyarlariSayfasi, options: { title: 'Seri ve Hedefler' } },
  MuhafizAyarlari: { component: MuhafizAyarlariSayfasi, options: { title: 'Namaz Muhafızı' } },
  Hakkinda: { component: HakkindaSayfasi, options: { title: 'Hakkında' } },
  RamazanAyarlari: { component: RamazanAyarlariSayfasi, options: { title: 'Ramazan Özel' } },
  DebugLogs: { component: DebugLogsSayfasi, options: { title: 'Debug Logları' } },
  TakvimAyarlari: { component: TakvimAyarlariSayfasi, options: { title: 'Takvim Entegrasyonu' } },
  NelerYeni: { component: NelerYeniSayfasi, options: { title: 'Neler Yeni' } },
  YedeklemeAktarim: { component: YedeklemeSayfasi, options: { title: 'Yedekleme & Aktarım' } },
  IceAktarmaSihirbazi: { component: IceAktarmaSihirbaziSayfasi, options: { headerShown: false } },
  TaniGeriBildirim: { component: TaniGeriBildirimSayfasi, options: { headerShown: false } },
};

/**
 * Ayarlar Alt Navigasyonu
 * Tum ayar sayfalari burada tanimlanir
 */
const AyarlarStack: React.FC = () => {
  const renkler = useRenkler();

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
        headerBackTitle: '',
      }}
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
 * Ana Tab Navigasyonu
 */
const MainTabs: React.FC = () => {
  const renkler = useRenkler();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { okunmamisVarMi } = useYeniOzellikler();

  // Yeni özellik duyuru durumunu uygulama açılışında yükle (tab rozeti için)
  useEffect(() => {
    dispatch(ozellikleriYukle());
  }, [dispatch]);

  return (
    <Tab.Navigator
      initialRouteName="AnaSayfa"
      detachInactiveScreens={false}
      screenOptions={{
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
          tabBarLabel: 'Ana Sayfa',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome5 name="mosque" size={20} color={focused ? renkler.birincil : renkler.metinIkincil} />
          ),
        }}
      />
      <Tab.Screen
        name="Rozetler"
        component={RozetlerSayfasi}
        options={{
          title: 'Rozetler',
          tabBarLabel: 'Rozetler',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome5 name="trophy" size={20} color={focused ? renkler.birincil : renkler.metinIkincil} />
          ),
        }}
      />
      <Tab.Screen
        name="KazaDefteri"
        component={KazaDefteriSayfasi}
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
        name="Istatistikler"
        component={IstatistikSayfasi}
        options={{
          title: 'İstatistikler',
          tabBarLabel: 'İstatistik',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome5 name="chart-bar" size={20} color={focused ? renkler.birincil : renkler.metinIkincil} />
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
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome5 name="cog" size={20} color={focused ? renkler.birincil : renkler.metinIkincil} />
          ),
        }}
      />
    </Tab.Navigator>
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

  if (ilkKurulum === null) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <NavigationContainer>
      <ErrorBoundary name="NavigatorBoundary">
        <RootStack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={ilkKurulum ? 'KurulumSihirbazi' : 'MainTabs'}
        >
          <RootStack.Screen name="KurulumSihirbazi" component={KurulumSihirbaziSayfasi} />
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="KibleSayfasi" component={KibleSayfasi} />
        </RootStack.Navigator>
      </ErrorBoundary>
      <ErrorBoundary name="GuncellemeBoundary">
        <GuncellemeBildirimi />
      </ErrorBoundary>
    </NavigationContainer>
  );
};
