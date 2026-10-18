import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { NativePusulaView } from './NativePusulaView';
import { WebPusulaView } from './WebPusulaView';
import { useRenkler } from '../../../core/theme';

/**
 * İki mod, farkı TEK cümle (sade tasarım Dalga 4). "Google AR" teknik addı → "Kamera".
 * Etiketler ekranda görünenle birebir (Maestro/simülatör betikleri metinle seçer).
 */
const TABS = [
  {
    key: 'native' as const,
    label: 'Pusula',
    a11yLabel: 'Pusula modu',
    aciklama: 'Telefonu düz tutun; Kâbe işareti yukarıyı gösterince kıble yönündesiniz.',
  },
  {
    key: 'web' as const,
    label: 'Kamera',
    a11yLabel: 'Kamera modu',
    aciklama: "Google'ın kıble bulucusu kamerada ve haritada Kâbe yönünü gösterir; internet gerekir.",
  },
];

/**
 * Kıble sekmesi (Dalga 4'ten beri alt sekme; eskiden kök yığında, ana ekran header'ından
 * açılan ekrandı). Sekme kökü kendi başlığını taşır, geri düğmesi YOK.
 *
 * ODAK KAPISI: sekmeler `detachInactiveScreens={false}` ile mount kalır. Pusula
 * (konum + yön aboneliği) ve WebView YALNIZ sekme odaktayken çizilir; başka sekmeye
 * geçince söner — yoksa algılayıcı ve WebView arka planda pil tüketirdi. İlk odakta
 * pusula başlar (konum izni orada okunur, açıklamasız İSTENMEZ — bkz. `useKible`).
 */
export const KibleSayfasi = () => {
  const [aktifMod, setAktifMod] = useState<'native' | 'web'>('native');
  const renkler = useRenkler();
  const odakta = useIsFocused();
  const aktif = TABS.find((t) => t.key === aktifMod) ?? TABS[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: renkler.arkaplan }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: renkler.sinir }]}>
        <Text style={[styles.title, { color: renkler.metin }]} accessibilityRole="header">
          Kıble
        </Text>
      </View>

      <View style={styles.tabWrapper}>
        <View style={[styles.tabContainer, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                aktifMod === tab.key && { backgroundColor: renkler.birincil },
              ]}
              onPress={() => setAktifMod(tab.key)}
              accessibilityLabel={tab.a11yLabel}
              accessibilityRole="tab"
              accessibilityState={{ selected: aktifMod === tab.key }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: aktifMod === tab.key ? renkler.birincilMetin : renkler.metin },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text testID="kible-mod-aciklamasi" style={[styles.modAciklama, { color: renkler.metinIkincil }]}>
          {aktif.aciklama}
        </Text>
      </View>

      <View style={styles.content}>
        {!odakta ? null : aktifMod === 'native' ? (
          <NativePusulaView onHaritaModu={() => setAktifMod('web')} />
        ) : (
          <WebPusulaView />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modAciklama: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabWrapper: {
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
});
