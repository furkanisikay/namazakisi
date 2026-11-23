/**
 * Etiketli kaydırıcı (yeni bağımlılık YOK: `PanResponder`). Ekran okuyucuda ayarlanabilir öğe:
 * yukarı/aşağı kaydırma %5 adımla değiştirir. Dokunma hedefi 44 dp.
 */
import * as React from 'react';
import { PanResponder, Text, View, type LayoutChangeEvent } from 'react-native';
import { useRenkler } from '../../../../core/theme';
import { SOLDAN_SAGA } from '../../common/yon';

interface Props {
  etiket: string;
  deger: number;
  min: number;
  max: number;
  onDegistir: (deger: number) => void;
  devreDisi?: boolean;
  testID?: string;
}

const BASPARMAK = 22;

export const Kaydirici: React.FC<Props> = ({ etiket, deger, min, max, onDegistir, devreDisi = false, testID }) => {
  const renkler = useRenkler();
  const [genislik, setGenislik] = React.useState(0);
  const durum = React.useRef({ genislik: 0, min, max, onDegistir, devreDisi, baslangic: 0 });
  durum.current = { ...durum.current, genislik, min, max, onDegistir, devreDisi };
  const oran = max > min ? Math.min(1, Math.max(0, (deger - min) / (max - min))) : 0;

  const konumdan = (x: number) => {
    const d = durum.current;
    const iz = Math.max(1, d.genislik - BASPARMAK);
    // Kaydırıcı fizikseldir (soldan sağa); sağdan sola arayüzde de sol = en az.
    const o = Math.min(1, Math.max(0, (x - BASPARMAK / 2) / iz));
    d.onDegistir(Math.round((d.min + o * (d.max - d.min)) * 100) / 100);
  };

  const yanit = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !durum.current.devreDisi,
      onMoveShouldSetPanResponder: () => !durum.current.devreDisi,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        durum.current.baslangic = e.nativeEvent.locationX;
        konumdan(e.nativeEvent.locationX);
      },
      onPanResponderMove: (_e, g) => konumdan(durum.current.baslangic + g.dx),
    })
  ).current;

  const adim = (yon: 1 | -1) => {
    const yeni = Math.min(max, Math.max(min, deger + yon * (max - min) * 0.05));
    onDegistir(Math.round(yeni * 100) / 100);
  };
  const iz = Math.max(0, genislik - BASPARMAK);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, opacity: devreDisi ? 0.45 : 1 }}>
      <Text style={{ fontSize: 13, color: renkler.metinIkincil, minWidth: 84, marginEnd: 10 }} numberOfLines={1}>
        {etiket}
      </Text>
      <View
        testID={testID}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={etiket}
        accessibilityState={{ disabled: devreDisi }}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(oran * 100) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (devreDisi) return;
          // Sağdan sola arayüzde de "artır" değeri büyütür (görsel yön fiziksel kalır).
          if (e.nativeEvent.actionName === 'increment') adim(1);
          if (e.nativeEvent.actionName === 'decrement') adim(-1);
        }}
        onLayout={(e: LayoutChangeEvent) => setGenislik(e.nativeEvent.layout.width)}
        style={[SOLDAN_SAGA, { flex: 1, height: 44, justifyContent: 'center' }]}
        {...yanit.panHandlers}
      >
        <View pointerEvents="none" style={{ height: 5, borderRadius: 3, marginHorizontal: BASPARMAK / 2, backgroundColor: renkler.sinir }}>
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: iz * oran, borderRadius: 3, backgroundColor: renkler.birincil }} />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            width: BASPARMAK,
            height: BASPARMAK,
            borderRadius: BASPARMAK / 2,
            borderWidth: 2,
            borderColor: renkler.birincil,
            backgroundColor: renkler.kartArkaplan,
            transform: [{ translateX: iz * oran }],
          }}
        />
      </View>
    </View>
  );
};
