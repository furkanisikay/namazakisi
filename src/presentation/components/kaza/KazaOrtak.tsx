/**
 * Kaza Defteri 2.0 ekranlarının ortak yapı taşları — mevcut görsel dile sadık:
 * kart `borderRadius: 24`, tonlu ikon çipi (`renk + '20'`), birincil düğme dolu
 * `birincil` + ikon + beyaz metin, ikincil düğme `arkaplan` + `sinir`. Renkler
 * yalnız tema token'larından; kaynak renkleri DEKORATİFTİR (ikon + çip zemini),
 * metin daima tema metnidir.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import type { KaynakRenkAnahtari } from './kazaMetinleri';

type Renkler = ReturnType<typeof useRenkler>;

/** Kaynak renk anahtarını tema rengine çevirir. */
export const kaynakRengi = (renkler: Renkler, anahtar: KaynakRenkAnahtari): string => renkler[anahtar];

export const KazaKart: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({ children, style }) => {
  const renkler = useRenkler();
  return (
    <View style={[stiller.kart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }, style]}>
      {children}
    </View>
  );
};

export const IkonCipi: React.FC<{ ikon: string; renk: string; boyut?: number }> = ({ ikon, renk, boyut = 36 }) => (
  <View
    style={[stiller.ikonCipi, { width: boyut, height: boyut, borderRadius: boyut / 2, backgroundColor: `${renk}20` }]}
    importantForAccessibility="no-hide-descendants"
    accessibilityElementsHidden
  >
    <FontAwesome5 name={ikon} size={Math.round(boyut * 0.4)} color={renk} />
  </View>
);

export const BolumBasligi: React.FC<{ children: string }> = ({ children }) => {
  const renkler = useRenkler();
  return (
    <Text style={[stiller.bolumBasligi, { color: renkler.metinIkincil }]} accessibilityRole="header">
      {children}
    </Text>
  );
};

/** Seçilebilir çip (tekli ya da çoklu seçim). Dokunma hedefi ≥44 dp. */
export const SecimCipi: React.FC<{
  etiket: string;
  secili: boolean;
  onPress: () => void;
  coklu?: boolean;
}> = ({ etiket, secili, onPress, coklu = false }) => {
  const renkler = useRenkler();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole={coklu ? 'checkbox' : 'radio'}
      accessibilityState={coklu ? { checked: secili } : { selected: secili, checked: secili }}
      accessibilityLabel={etiket}
      style={[
        stiller.cip,
        {
          backgroundColor: secili ? `${renkler.birincil}20` : renkler.arkaplan,
          borderColor: secili ? renkler.birincil : renkler.sinir,
        },
      ]}
    >
      {secili && coklu && <FontAwesome5 name="check" size={11} color={renkler.birincil} style={stiller.cipIkon} />}
      <Text style={[stiller.cipMetin, { color: renkler.metin }]}>{etiket}</Text>
    </TouchableOpacity>
  );
};

export const KazaDugme: React.FC<{
  etiket: string;
  ikon?: string;
  onPress: () => void;
  tur?: 'birincil' | 'ikincil';
  devreDisi?: boolean;
  erisimEtiketi?: string;
  style?: StyleProp<ViewStyle>;
}> = ({ etiket, ikon, onPress, tur = 'birincil', devreDisi = false, erisimEtiketi, style }) => {
  const renkler = useRenkler();
  const birincil = tur === 'birincil';
  const metinRengi = birincil ? renkler.birincilMetin : renkler.metin;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={devreDisi}
      accessibilityRole="button"
      accessibilityLabel={erisimEtiketi ?? etiket}
      accessibilityState={{ disabled: devreDisi }}
      style={[
        stiller.dugme,
        birincil
          ? { backgroundColor: renkler.birincil, borderColor: renkler.birincil, flexGrow: 1.15 }
          : { backgroundColor: renkler.arkaplan, borderColor: renkler.sinir, flexGrow: 1 },
        devreDisi && stiller.devreDisi,
        style,
      ]}
    >
      {ikon ? <FontAwesome5 name={ikon} size={13} color={metinRengi} style={stiller.dugmeIkon} /> : null}
      <Text style={[stiller.dugmeMetin, { color: metinRengi }]}>{etiket}</Text>
    </TouchableOpacity>
  );
};

/** Bilgi / uyarı bandı (bozuk ay, eski kayıt). Renk yalnız ikon ve kenarda. */
export const KazaBant: React.FC<{ ikon: string; renk: string; metin: string; testID?: string }> = ({
  ikon,
  renk,
  metin,
  testID,
}) => {
  const renkler = useRenkler();
  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      style={[stiller.bant, { backgroundColor: renkler.kartArkaplan, borderColor: renk }]}
    >
      <FontAwesome5 name={ikon} size={14} color={renk} />
      <Text style={[stiller.bantMetin, { color: renkler.metin }]}>{metin}</Text>
    </View>
  );
};

export const stiller = StyleSheet.create({
  kart: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 12 },
  ikonCipi: { alignItems: 'center', justifyContent: 'center' },
  bolumBasligi: { fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 8, marginHorizontal: 4 },
  cip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  cipIkon: { marginRight: 6 },
  cipMetin: { fontSize: 13, fontWeight: '600' },
  dugme: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  dugmeIkon: { marginRight: 8 },
  dugmeMetin: { fontSize: 15, fontWeight: '700' },
  devreDisi: { opacity: 0.5 },
  bant: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 10,
  },
  bantMetin: { flex: 1, fontSize: 13, lineHeight: 18 },
});
