/**
 * Hareket geçmişi (Kaza Defteri 2.0, ekran 2).
 *
 * Güne göre gruplu (yerel gün, yeniden eskiye); her satır kaynağını, ilgili
 * namaz gününü ve cihazı söyler. Satırlar `gecmisSatirlari` (saf) ile türer:
 * tarama günlüğü otomatik kayıtların "eklendi / geri alındı" anını besler,
 * sayıya girmez. Satıra dokununca ayrıntı sayfası açılır.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, SectionList, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRenkler } from '../../../core/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { kazaVerileriniYukle } from '../../store/kazaSlice';
import { gecmisSatirlari, type GecmisSatiri } from '../../../core/kaza/kazaDefteriHesabi';
import { tarihiISOFormatinaCevir } from '../../../core/utils/TarihYardimcisi';
import {
  GECMIS_SUZGECLERI,
  KAYNAK_GORUNUMU,
  deltaMetni,
  gunBasligi,
  satirAltMetni,
  satirBasligi,
  satirErisimEtiketi,
  suzgeceUyarMi,
  type GecmisSuzgeci,
} from '../../components/kaza/kazaMetinleri';
import { IkonCipi, KazaDugme, SecimCipi, kaynakRengi } from '../../components/kaza/KazaOrtak';
import { KazaHareketAyrintiModal } from '../../components/kaza/KazaHareketAyrintiModal';
import type { KazaStackParamList } from '../../../navigation/kazaEkranlari';

interface Bolum {
  baslik: string;
  data: GecmisSatiri[];
}

export const KazaGecmisiSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<KazaStackParamList>>();
  const { kazaDurumu, hareketler, cihaz } = useAppSelector((s) => s.kaza);
  const [suzgec, setSuzgec] = useState<GecmisSuzgeci>('tumu');
  const [secili, setSecili] = useState<GecmisSatiri | null>(null);

  useEffect(() => {
    if (!kazaDurumu) dispatch(kazaVerileriniYukle());
  }, [dispatch, kazaDurumu]);

  const bolumler = useMemo<Bolum[]>(() => {
    if (!kazaDurumu) return [];
    const satirlar = gecmisSatirlari(hareketler, kazaDurumu).filter((s) => suzgeceUyarMi(s, suzgec));
    const gruplar = new Map<string, GecmisSatiri[]>();
    for (const s of satirlar) {
      const gun = tarihiISOFormatinaCevir(new Date(s.zaman));
      gruplar.set(gun, [...(gruplar.get(gun) ?? []), s]);
    }
    const bugun = new Date();
    return Array.from(gruplar.values()).map((data) => ({ baslik: gunBasligi(data[0].zaman, bugun), data }));
  }, [hareketler, kazaDurumu, suzgec]);

  const satirCiz = useCallback(
    ({ item }: { item: GecmisSatiri }) => {
      const gorunum = KAYNAK_GORUNUMU[item.tur];
      const delta = deltaMetni(item);
      return (
        <TouchableOpacity
          onPress={() => setSecili(item)}
          accessibilityRole="button"
          accessibilityLabel={satirErisimEtiketi(item, cihaz)}
          style={[
            stiller.satir,
            { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir },
            item.gizli && stiller.soluk,
          ]}
        >
          <IkonCipi ikon={gorunum.ikon} renk={kaynakRengi(renkler, gorunum.renk)} />
          <View style={stiller.satirMetin}>
            <Text style={[stiller.satirBaslik, { color: renkler.metin }]} numberOfLines={2}>
              {satirBasligi(item)}
            </Text>
            <Text style={[stiller.satirAlt, { color: renkler.metinIkincil }]} numberOfLines={2}>
              {satirAltMetni(item, cihaz)}
              {item.gizli ? ' · gizlendi' : ''}
              {item.geriAlindi ? ' · geri alındı' : ''}
            </Text>
          </View>
          {delta !== '' && (
            <Text
              style={[
                stiller.delta,
                { color: renkler.metin },
                item.gizli && stiller.ustuCizili,
              ]}
            >
              {delta}
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [cihaz, renkler]
  );

  const toplamSatir = bolumler.reduce((t, b) => t + b.data.length, 0);

  return (
    <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={stiller.suzgecler}>
          {GECMIS_SUZGECLERI.map((s) => (
            <SecimCipi key={s.id} etiket={s.etiket} secili={suzgec === s.id} onPress={() => setSuzgec(s.id)} />
          ))}
        </ScrollView>
      </View>
      <SectionList
        sections={bolumler}
        keyExtractor={(s) => s.anahtar}
        renderItem={satirCiz}
        renderSectionHeader={({ section }) => (
          <View style={stiller.bolumBaslik}>
            <Text style={[stiller.bolumMetin, { color: renkler.metinIkincil }]} accessibilityRole="header">
              {section.baslik}
            </Text>
            <Text style={[stiller.bolumMetin, { color: renkler.metinIkincil }]}>{section.data.length} kayıt</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={stiller.liste}
        initialNumToRender={20}
        ListEmptyComponent={
          <Text style={[stiller.bos, { color: renkler.metinIkincil }]}>
            {suzgec === 'tumu'
              ? 'Henüz bir hareket yok. Borç eklediğinizde, kaza kıldığınızda ya da otomatik ekleme çalıştığında burada görünür.'
              : 'Bu süzgece uyan bir kayıt yok. Başka bir süzgeç seçebilirsiniz.'}
          </Text>
        }
        ListFooterComponent={
          toplamSatir > 0 ? (
            <KazaDugme
              etiket="Kayıtları temizleyin"
              ikon="broom"
              tur="ikincil"
              onPress={() => navigation.navigate('KazaTemizlik')}
              style={stiller.altDugme}
            />
          ) : null
        }
      />
      <KazaHareketAyrintiModal satir={secili} cihaz={cihaz} onKapat={() => setSecili(null)} />
    </SafeAreaView>
  );
};

const stiller = StyleSheet.create({
  kap: { flex: 1 },
  suzgecler: { paddingHorizontal: 16, paddingTop: 12 },
  liste: { paddingHorizontal: 16, paddingBottom: 32 },
  bolumBaslik: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 8, marginHorizontal: 4 },
  bolumMetin: { fontSize: 12, fontWeight: '600' },
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    minHeight: 56,
  },
  soluk: { opacity: 0.6 },
  satirMetin: { flex: 1 },
  satirBaslik: { fontSize: 14, fontWeight: '600' },
  satirAlt: { fontSize: 12, marginTop: 2 },
  delta: { fontSize: 16, fontWeight: '800' },
  ustuCizili: { textDecorationLine: 'line-through' },
  bos: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 32, marginHorizontal: 16 },
  altDugme: { marginTop: 12 },
});
