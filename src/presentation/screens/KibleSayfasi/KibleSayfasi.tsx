import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativePusulaView } from './NativePusulaView';
import { WebPusulaView } from './WebPusulaView';
import { useRenkler } from '../../../core/theme';
import { useNavigation } from '@react-navigation/native';

/** Tab konfigurasyonlari */
const TABS = [
  { key: 'native' as const, label: 'Pusula', a11yLabel: 'Pusula modu' },
  { key: 'web' as const, label: 'Google AR', a11yLabel: 'Google AR modu' },
];

/**
 * Qibla finder screen component.
 * Provides two modes: native compass view and Google AR WebView.
 * @returns {React.JSX.Element} Screen with tab switcher between native compass and web view.
 */
export const KibleSayfasi = () => {
  const [aktifMod, setAktifMod] = useState<'native' | 'web'>('native');
  const renkler = useRenkler();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: renkler.arkaplan }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: renkler.sinir }]}>
        <TouchableOpacity
          testID="back-button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Geri dön"
          accessibilityRole="button"
        >
          <FontAwesome5 name="arrow-left" size={20} color={renkler.metin} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: renkler.metin }]}>Kıbleyi Bul</Text>
        <View style={styles.headerSpacer} />
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
      </View>

      <View style={styles.content}>
        {aktifMod === 'native' ? <NativePusulaView /> : <WebPusulaView />}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 20,
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
