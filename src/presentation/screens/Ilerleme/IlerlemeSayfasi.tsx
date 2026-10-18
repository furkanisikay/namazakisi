/**
 * İlerleme sekmesi (sade tasarım Dalga 4) — eski üç yüzey TEK kaydırmalı sayfada:
 *
 *   1. Seri (gök paneli + tesbih + söz) — en motive edici öğe en üstte,
 *   2. Kılma oranı (Haftalık · Aylık, tek basit seçici; hedef seri eşiğinden türer),
 *   3. Seviye ve rozetler.
 *
 * Eskiden: İstatistik sekmesi (Günlük/Haftalık/Aylık/Seri iç sekme çubuğu) + ayrı
 * Rozetler sekmesi. Sayfa kendi başlığını taşır (sekme kökü istisnası).
 *
 * ODAK: sekmeler mount kalır (`detachInactiveScreens={false}`). Seri bölümü YALNIZ
 * odaktayken çizilir (gök paneli döngüleri arka planda koşmasın; her girişte açılış
 * animasyonu yeniden oynar). İstatistik her odakta tazelenir (`useFocusEffect`).
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { haftalikIstatistikleriYukle, aylikIstatistikleriYukle } from '../../store/namazSlice';
import { useRenkler } from '../../../core/theme';
import { SeriSekmesi } from '../Seri/SeriSekmesi';
import { KilmaOraniBolumu, type KilmaOraniDonemi } from './KilmaOraniBolumu';
import { RozetlerBolumu } from './RozetlerBolumu';

export const IlerlemeSayfasi: React.FC = () => {
  const dispatch = useAppDispatch();
  const renkler = useRenkler();
  const odakta = useIsFocused();
  const [donem, setDonem] = useState<KilmaOraniDonemi>('haftalik');
  const { haftalikIstatistik, aylikIstatistik, yukleniyor } = useAppSelector((state) => state.namaz);
  const tamGunEsigi = useAppSelector((state) => state.seri.ayarlar?.tamGunEsigi ?? 5);

  const istatistikYukle = useCallback(
    (d: KilmaOraniDonemi) => {
      if (d === 'haftalik') dispatch(haftalikIstatistikleriYukle());
      else dispatch(aylikIstatistikleriYukle());
    },
    [dispatch]
  );

  useFocusEffect(
    useCallback(() => {
      istatistikYukle(donem);
    }, [istatistikYukle, donem])
  );

  const donemSec = useCallback((d: KilmaOraniDonemi) => setDonem(d), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: renkler.arkaplan }} edges={['top', 'left', 'right']}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: renkler.sinir }}>
        <Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '700', color: renkler.metin }}>
          İlerleme
        </Text>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={yukleniyor} onRefresh={() => istatistikYukle(donem)} colors={[renkler.birincil]} />
        }
      >
        {odakta ? <SeriSekmesi gomulu /> : null}
        <View style={{ height: 24 }} />
        <KilmaOraniBolumu
          donem={donem}
          onDonemSec={donemSec}
          haftalik={haftalikIstatistik}
          aylik={aylikIstatistik}
          yukleniyor={yukleniyor}
          tamGunEsigi={tamGunEsigi}
        />
        <View style={{ height: 12 }} />
        <RozetlerBolumu />
      </ScrollView>
    </SafeAreaView>
  );
};
