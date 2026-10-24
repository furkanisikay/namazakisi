/**
 * Kaza Defteri kökünün "Diğer" menüsü (sade tasarım Dalga 4).
 *
 * Kök sayfa yalnız "kalan" + vakit satırları + "Kıldım" taşır; seyrek kullanılan her
 * şey (günlük hedef, tempo, yeniden hesaplama, hareket geçmişi, kaza ayarları,
 * temizlik) bu tek alt sayfada toplanır. Bottom-sheet deseni: backdrop içeriği saran
 * değil `StyleSheet.absoluteFill` ile KARDEŞ (iç kaydırma takılmasın), geri tuşu
 * `useDonanimGeriTusu`.
 */
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { useMetin } from '../../hooks/useMetin';

export interface KazaDigerSatiri {
  anahtar: string;
  ikon: string;
  baslik: string;
  /** Kısa durum/özet (≤ 10 kelime). */
  alt?: string;
  onPress: () => void;
  /** Tehlikeli/geri dönüşlü işlem → listenin sonunda, ayrı renkte. */
  tehlikeli?: boolean;
}

interface KazaDigerMenusuProps {
  gorunur: boolean;
  onKapat: () => void;
  satirlar: readonly KazaDigerSatiri[];
  /** Satırların üstünde gösterilen ek içerik (ör. tempo seçici). */
  ust?: React.ReactNode;
}

export const KazaDigerMenusu: React.FC<KazaDigerMenusuProps> = ({ gorunur, onKapat, satirlar, ust }) => {
  const renkler = useRenkler();
  const m = useMetin();
  useDonanimGeriTusu(gorunur, onKapat);

  return (
    <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onKapat}>
      <View style={stiller.kok}>
        <TouchableWithoutFeedback onPress={onKapat} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[StyleSheet.absoluteFill, stiller.perde]} />
        </TouchableWithoutFeedback>
        <View testID="kaza-diger-menusu" style={[stiller.sayfa, { backgroundColor: renkler.kartArkaplan }]}>
          <View style={stiller.baslikSatiri}>
            <Text accessibilityRole="header" style={[stiller.baslik, { color: renkler.metin }]}>
              {m.kaza.diger.baslik}
            </Text>
            <TouchableOpacity
              onPress={onKapat}
              accessibilityRole="button"
              accessibilityLabel={m.ortak.kapatin}
              style={stiller.kapat}
            >
              <FontAwesome5 name="times" size={18} color={renkler.metinIkincil} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {ust}
            {satirlar.map((s) => {
              const renk = s.tehlikeli ? renkler.hata : renkler.birincil;
              return (
                <TouchableOpacity
                  key={s.anahtar}
                  onPress={s.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={s.alt ? `${s.baslik}. ${s.alt}` : s.baslik}
                  style={[stiller.satir, { borderColor: renkler.sinir }]}
                >
                  <View style={[stiller.cip, { backgroundColor: renk + '20' }]}>
                    <FontAwesome5 name={s.ikon} size={15} color={renk} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[stiller.satirBaslik, { color: renkler.metin }]}>{s.baslik}</Text>
                    {s.alt ? <Text style={[stiller.satirAlt, { color: renkler.metinIkincil }]}>{s.alt}</Text> : null}
                  </View>
                  <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const stiller = StyleSheet.create({
  kok: { flex: 1, justifyContent: 'flex-end' },
  perde: { backgroundColor: 'rgba(0,0,0,0.45)' },
  sayfa: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 8, maxHeight: '85%' },
  baslikSatiri: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  baslik: { fontSize: 18, fontWeight: '700' },
  kapat: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  satir: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  cip: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  satirBaslik: { fontSize: 15, fontWeight: '600' },
  satirAlt: { fontSize: 14, marginTop: 2 },
});
