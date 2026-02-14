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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
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
} from '../presentation/screens';
import { useRenkler } from '../core/theme';

/**
 * Root stack navigation parameter list.
 * Defines all top-level screens and their params.
 */
export type RootStackParamList = {
  MainTabs: undefined;
  KibleSayfasi: undefined;
};

/** Navigation prop type for screens inside root stack. */
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator<RootStackParamList>();

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
      <Stack.Screen
        name="AyarlarAna"
        component={AyarlarSayfasi}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="KonumAyarlari"
        component={KonumAyarlariSayfasi}
        options={{ title: 'Konum Ayarları' }}
      />
      <Stack.Screen
        name="GorünumAyarlari"
        component={GorünumAyarlariSayfasi}
        options={{ title: 'Görünüm' }}
      />
      <Stack.Screen
        name="BildirimAyarlari"
        component={BildirimAyarlariSayfasi}
        options={{ title: 'Bildirimler' }}
      />
      <Stack.Screen
        name="SeriHedefAyarlari"
        component={SeriHedefAyarlariSayfasi}
        options={{ title: 'Seri ve Hedefler' }}
      />
      <Stack.Screen
        name="MuhafizAyarlari"
        component={MuhafizAyarlariSayfasi}
        options={{ title: 'Namaz Muhafızı' }}
      />
      <Stack.Screen
        name="Hakkinda"
        component={HakkindaSayfasi}
        options={{ title: 'Hakkında' }}
      />
    </Stack.Navigator>
  );
};

/**
 * Ana Tab Navigasyonu
 */
const MainTabs: React.FC = () => {
  const renkler = useRenkler();

  return (
    <Tab.Navigator
      initialRouteName="AnaSayfa"
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
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
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
 * Tema destekli
 */
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen name="KibleSayfasi" component={KibleSayfasi} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
