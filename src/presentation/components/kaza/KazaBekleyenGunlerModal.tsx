/**
 * "Kontrol bekleyen günler" (Kaza Defteri 2.0) — alttan açılan sayfa.
 *
 * Hiç işaret olmayan (uygulamanın açılmadığı) kapanmış günler "Bana sorun"
 * tercihinde deftere YAZILMAZ; burada sorulur. Karar bir harekettir
 * (`gunKarari`): "Kazaya ekleyin" o günün işaretsiz vakitlerini izdüşüme
 * katar, "Yok sayın" katmaz. Sonradan "kıldım" denirse kayıt yine düşer.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { useAppDispatch } from '../../store/hooks';
import { gunKarariVer } from '../../store/kazaSlice';
import { gunMetni } from './kazaMetinleri';
import { KazaDugme } from './KazaOrtak';
import { kisaBildirimGoster } from '../common/KisaBildirim';

interface Props {
  gorunur: boolean;
  gunler: readonly string[];
  onKapat: () => void;
}

export const KazaBekleyenGunlerModal: React.FC<Props> = ({ gorunur, gunler, onKapat }) => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const [mesgul, setMesgul] = useState(false);
  useDonanimGeriTusu(gorunur, onKapat);

  const karar = useCallback(
    async (secilen: string[], k: 'ekle' | 'yoksay') => {
      setMesgul(true);
      try {
        await dispatch(gunKarariVer({ gunler: secilen, karar: k })).unwrap();
        kisaBildirimGoster(
          k === 'ekle' ? `${secilen.length} gün kazaya eklendi` : `${secilen.length} gün yok sayıldı`
        );
        if (secilen.length >= gunler.length) onKapat();
      } catch {
        kisaBildirimGoster('Karar kaydedilemedi. Lütfen tekrar deneyin.');
      } finally {
        setMesgul(false);
      }
    },
    [dispatch, gunler.length, onKapat]
  );

  return (
    <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onKapat}>
      <View style={stiller.kapsayici}>
        <TouchableWithoutFeedback onPress={onKapat} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[StyleSheet.absoluteFill, stiller.perde]} />
        </TouchableWithoutFeedback>
        <View style={[stiller.sayfa, { backgroundColor: renkler.kartArkaplan }]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={stiller.icerik}>
            <Text style={[stiller.baslik, { color: renkler.metin }]} accessibilityRole="header">
              Kontrol bekleyen {gunler.length} gün
            </Text>
            <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
              Bu günlerde hiçbir vakit işaretlenmemiş. Uygulamayı açmadığınız için olabilir; kılmadıysanız kazaya
              ekleyin, kıldıysanız yok sayın.
            </Text>
            {gunler.map((gun) => (
              <View key={gun} style={[stiller.gunSatiri, { borderColor: renkler.sinir }]}>
                <Text style={[stiller.gunMetni, { color: renkler.metin }]}>{gunMetni(gun)}</Text>
                <View style={stiller.gunDugmeleri}>
                  <KazaDugme
                    etiket="Yok sayın"
                    tur="ikincil"
                    onPress={() => karar([gun], 'yoksay')}
                    devreDisi={mesgul}
                    erisimEtiketi={`${gunMetni(gun)} gününü yok sayın`}
                  />
                  <KazaDugme
                    etiket="Ekleyin"
                    ikon="plus"
                    onPress={() => karar([gun], 'ekle')}
                    devreDisi={mesgul}
                    erisimEtiketi={`${gunMetni(gun)} gününü kazaya ekleyin`}
                  />
                </View>
              </View>
            ))}
            {gunler.length > 1 && (
              <View style={stiller.toplu}>
                <KazaDugme etiket="Hepsini yok sayın" tur="ikincil" onPress={() => karar([...gunler], 'yoksay')} devreDisi={mesgul} />
                <KazaDugme etiket="Hepsini ekleyin" ikon="plus" onPress={() => karar([...gunler], 'ekle')} devreDisi={mesgul} />
              </View>
            )}
            <KazaDugme etiket="Sonra karar vereceğim" tur="ikincil" onPress={onKapat} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const stiller = StyleSheet.create({
  kapsayici: { flex: 1, justifyContent: 'flex-end' },
  perde: { backgroundColor: 'rgba(0,0,0,0.45)' },
  sayfa: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  icerik: { padding: 20, paddingBottom: 32, gap: 10 },
  baslik: { fontSize: 17, fontWeight: '700' },
  alt: { fontSize: 13, lineHeight: 18 },
  gunSatiri: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 8 },
  gunMetni: { fontSize: 15, fontWeight: '600' },
  gunDugmeleri: { flexDirection: 'row', gap: 10 },
  toplu: { flexDirection: 'row', gap: 10, marginTop: 6 },
});
