import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { useRenkler } from '../../../core/theme';
import { useKible } from '../../hooks/useKible';
import { useKibleGeriBildirimi } from '../../hooks/useKibleGeriBildirimi';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { DurumSatiri } from '../../components/ortak/DurumSatiri';
import { Depolama } from '../../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { PusulaGorunumu } from './PusulaGorunumu';
import { KameraGorunumu } from './KameraGorunumu';

type Mod = 'pusula' | 'kamera';

/**
 * İki mod, farkı TEK cümle. Etiketler ekranda görünenle birebir (Maestro/simülatör
 * betikleri "Kıble" sekmesine metinle gider; varsayılan mod Pusula — emülatörde kamera yok).
 */
const SEKMELER: Array<{ key: Mod; label: string; a11yLabel: string; aciklama: string }> = [
  {
    key: 'pusula',
    label: 'Pusula',
    a11yLabel: 'Pusula modu',
    aciklama: 'Kâbe işareti üstteki çentiğe gelince kıble yönündesiniz. Telefonu dikleştirince pusula ufka yatar.',
  },
  {
    key: 'kamera',
    label: 'Kamera',
    a11yLabel: 'Kamera modu',
    aciklama: 'Telefonu dik tutup çevrenize bakın; Kâbe işareti kıble yönünde belirir. İnternet gerekmez.',
  },
];

/**
 * Kıble sekmesi. Yön tek kaynaktan (`useKible`) gelir; iki mod aynı aboneliği paylaşır,
 * mod değiştirmek sensörleri yeniden başlatmaz.
 *
 * ODAK KAPISI: sekmeler mount kalır (`detachInactiveScreens={false}`). Sensörler ve kamera
 * YALNIZ sekme odaktayken (ve uygulama ön plandayken — `useKible`) çalışır.
 */
export const KibleSayfasi = () => {
  const [mod, setModHam] = useState<Mod>('pusula');
  const renkler = useRenkler();
  const odakta = useIsFocused();
  const hareketAzalt = useHareketAzalt();
  const kible = useKible(odakta);
  const aktifSekme = SEKMELER.find((t) => t.key === mod) ?? SEKMELER[0];
  useKibleGeriBildirimi(kible.ozet, odakta && kible.izinVerildi);

  // Son seçilen görünüm hatırlanır (yol haritası 3.4: kamera birincil yol). İlk açılış
  // daima Pusula — emülatör/simülatör kare hatları ve kamerasız cihazlar bunu görür; Kamera
  // ancak kullanıcı onu seçtiyse VE kamera izni zaten verilmişse açılışta geri gelir
  // (izin diyaloğu ekrana kendiliğinden fırlamaz).
  const setMod = useCallback((yeni: Mod) => {
    setModHam(yeni);
    void Depolama.hamYaz(DEPOLAMA_ANAHTARLARI.KIBLE_MODU, yeni).catch(() => undefined);
  }, []);
  useEffect(() => {
    let iptal = false;
    void (async () => {
      try {
        if ((await Depolama.ham(DEPOLAMA_ANAHTARLARI.KIBLE_MODU)) !== 'kamera') return;
        const izin = await Camera.getCameraPermissionsAsync();
        if (!iptal && izin?.granted) setModHam('kamera');
      } catch {
        // okunamadı → Pusula
      }
    })();
    return () => {
      iptal = true;
    };
  }, []);

  const pusulaya = useCallback(() => setMod('pusula'), [setMod]);
  const kameraya = useCallback(() => setMod('kamera'), [setMod]);

  let govde: React.ReactNode;
  if (!odakta) {
    govde = null;
  } else if (kible.yukleniyor) {
    govde = (
      <View style={styles.orta}>
        <Text style={[styles.bilgiMetni, { color: renkler.metinIkincil }]}>Pusula başlatılıyor…</Text>
      </View>
    );
  } else if (kible.hata) {
    const izinSorunu = !kible.izinVerildi && kible.izinTekrarSorulabilir !== null;
    govde = (
      <View style={styles.orta}>
        {!izinSorunu && <Text style={[styles.hataMetni, { color: renkler.metin }]}>{kible.hata}</Text>}
        {izinSorunu && (
          // Sorulabiliyorsa açıklama → sistem diyaloğu; kalıcı redde Ayarlar. Dönüşte `useKible` okur.
          <DurumSatiri
            testID="kible-izin-satiri"
            style={{ marginTop: 16, alignSelf: 'stretch' }}
            durum={{
              tip: 'uyari',
              metin: 'Konum izni kapalı; yönü bulmak için konumunuz gerekiyor.',
              eylem: kible.izinTekrarSorulabilir ? 'konumIzni' : 'uygulamaAyarlari',
            }}
            onSonra={() => void kible.izinIste()}
          />
        )}
      </View>
    );
  } else if (kible.pusulaVar === false && mod === 'pusula') {
    govde = (
      <View style={styles.orta}>
        <FontAwesome5 name="compass" size={32} color={renkler.metinIkincil} />
        <Text style={[styles.hataMetni, { color: renkler.metin, marginTop: 12 }]}>Bu telefonda pusula algılayıcısı yok.</Text>
        {kible.kibleAcisi !== null && (
          <Text style={[styles.bilgiMetni, { color: renkler.metinIkincil }]}>
            Kıble, kuzeyden saat yönünde {Math.round(kible.kibleAcisi)}°.
          </Text>
        )}
      </View>
    );
  } else if (mod === 'kamera') {
    govde = (
      <KameraGorunumu
        aktif={odakta}
        kibleAcisi={kible.kibleAcisi}
        konum={kible.konum}
        ozet={kible.ozet}
        abone={kible.abone}
        vektorGuvenilir={kible.pusulaVar === false ? false : kible.vektorGuvenilir}
        hareketAzalt={hareketAzalt}
        onPusulaya={pusulaya}
      />
    );
  } else {
    govde = (
      <PusulaGorunumu
        kibleAcisi={kible.kibleAcisi}
        konum={kible.konum}
        ozet={kible.ozet}
        abone={kible.abone}
        pusulaDogrulugu={kible.pusulaDogrulugu}
        hareketAzalt={hareketAzalt}
        onKameraya={kameraya}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: renkler.arkaplan }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: renkler.sinir }]}>
        <Text style={[styles.title, { color: renkler.metin }]} accessibilityRole="header">
          Kıble
        </Text>
      </View>

      <View style={styles.tabWrapper}>
        <View style={[styles.tabContainer, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
          {SEKMELER.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, mod === tab.key && { backgroundColor: renkler.birincil }]}
              onPress={() => setMod(tab.key)}
              accessibilityLabel={tab.a11yLabel}
              accessibilityRole="tab"
              accessibilityState={{ selected: mod === tab.key }}
            >
              <FontAwesome5
                name={tab.key === 'pusula' ? 'compass' : 'camera'}
                size={13}
                color={mod === tab.key ? renkler.birincilMetin : renkler.metinIkincil}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.tabText, { color: mod === tab.key ? renkler.birincilMetin : renkler.metin }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text testID="kible-mod-aciklamasi" style={[styles.modAciklama, { color: renkler.metinIkincil }]}>
          {aktifSekme.aciklama}
        </Text>
      </View>

      <View style={styles.content}>{govde}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  tabWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  tabContainer: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  tabButton: { flex: 1, flexDirection: 'row', minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontWeight: '600', fontSize: 14 },
  modAciklama: { fontSize: 14, lineHeight: 20, marginTop: 10 },
  content: { flex: 1 },
  orta: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  bilgiMetni: { textAlign: 'center', fontSize: 14, marginTop: 6 },
  hataMetni: { textAlign: 'center', fontSize: 14, marginBottom: 10 },
});
