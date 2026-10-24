/**
 * Yeniden hesapla (Kaza Defteri 2.0, ekran 4) — sihirbazın SON adımı.
 *
 * Yazmadan önce neyin değişip neyin kaldığını gösterir: yalnız yeni bir TABAN
 * yazılır; elle eklenenler, otomatik/bildirimle eklenenler ve kılınanlar yeni
 * tabana kendiliğinden uygulanır. Önceki sürümden aktarılan taban değişiyorsa
 * bunu AÇIKÇA söyler (sahip kararı: geçişle gelen taban ilk yeniden hesapta
 * tümden değişir; önceki sürümde kılınanlar yeni tabandan da düşülür).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useAppDispatch } from '../../store/hooks';
import { yeniTabanUygula } from '../../store/kazaSlice';
import * as KazaDefteri from '../../../domain/services/KazaDefteriServisi';
import { sihirbazTabani } from '../../../domain/services/KazaHesaplayiciServisi';
import { kazaVaktiGoster } from '../../../core/kaza/kazaHareketi';
import type { OrtusmeSecimi } from '../../../core/kaza/kazaDefteriHesabi';
import { gunMetni } from '../../components/kaza/kazaMetinleri';
import { BolumBasligi, KazaBant, KazaDugme, KazaKart } from '../../components/kaza/KazaOrtak';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';
import type { KazaStackParamList } from '../../../navigation/kazaEkranlari';
import { bicim, sayili, sayiYaz } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

const fmt = sayiYaz;

export const KazaYenidenHesaplaSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<KazaStackParamList, 'KazaYenidenHesapla'>>();
  const taban = useMemo(() => sihirbazTabani(route.params.girdi), [route.params.girdi]);
  const [o, setO] = useState<KazaDefteri.TabanOnizlemeOzeti | null>(null);
  const [hata, setHata] = useState(false);
  const [ortusme, setOrtusme] = useState<OrtusmeSecimi>('ayrica');
  const [mesgul, setMesgul] = useState(false);
  const metinler = useMetin();
  const sozluk = metinler.kaza;
  const m = sozluk.hesap;

  useEffect(() => {
    let iptal = false;
    KazaDefteri.yeniTabanOnizlemesiHesapla(taban)
      .then((sonuc) => {
        if (!iptal) setO(sonuc);
      })
      .catch(() => {
        if (!iptal) setHata(true);
      });
    return () => {
      iptal = true;
    };
  }, [taban]);

  const uygula = useCallback(async () => {
    if (!o) return;
    setMesgul(true);
    try {
      await dispatch(yeniTabanUygula({ taban, kapsamBitis: o.kapsamBitis, ortusme })).unwrap();
      kisaBildirimGoster(m.uygulandi);
      navigation.goBack();
    } catch {
      kisaBildirimGoster(m.uygulanamadi);
    } finally {
      setMesgul(false);
    }
  }, [dispatch, navigation, o, ortusme, taban, m]);

  if (hata) {
    return (
      <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
        <View style={stiller.icerik}>
          <KazaBant ikon="exclamation-triangle" renk={renkler.hata} metin={m.onizlemeHata} />
          <KazaDugme etiket={m.geriDonun} tur="ikincil" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }
  if (!o) {
    return (
      <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
        <Text style={[stiller.alt, stiller.orta, { color: renkler.metinIkincil }]}>{m.hesaplaniyor}</Text>
      </SafeAreaView>
    );
  }

  const ortusenToplam = o.ortusenOtomatik + o.ortusenBildirim;
  const sonKalan = ortusme === 'gizle' && o.gizleKalan !== null ? o.gizleKalan : o.ayricaKalan;
  const korunanlar: Array<{ etiket: string; deger: string; ikon: string }> = [
    { etiket: m.elleEklenen, deger: `+${fmt(o.ozet.elle)}`, ikon: 'pen' },
    { etiket: m.otomatikEklenen, deger: `+${fmt(o.ozet.otomatik)}`, ikon: 'robot' },
    { etiket: m.bildirimdenEklenen, deger: `+${fmt(o.ozet.bildirim)}`, ikon: 'bell' },
    { etiket: sozluk.kaynak.kilinan, deger: `−${fmt(o.ozet.kilinan)}`, ikon: 'check' },
  ].filter((k) => k.deger !== '+0' && k.deger !== '−0');

  return (
    <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={stiller.icerik}>
        <KazaKart>
          <Text style={[stiller.etiket, { color: renkler.metinIkincil }]}>{m.kalanKaza}</Text>
          <View style={stiller.buyukSatir} accessible accessibilityLabel={bicim(m.kalanErisim, { eski: fmt(o.eskiKalan), yeni: fmt(sonKalan) })}>
            <Text style={[stiller.eski, { color: renkler.metinIkincil }]}>{fmt(o.eskiKalan)}</Text>
            <FontAwesome5 name="arrow-right" size={16} color={renkler.metinIkincil} />
            <Text style={[stiller.yeni, { color: renkler.metin }]}>{fmt(sonKalan)}</Text>
          </View>
          <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
            {bicim(m.kapsam, { gun: gunMetni(o.kapsamBitis) })}
          </Text>
        </KazaKart>

        <BolumBasligi>{m.degisen}</BolumBasligi>
        <KazaKart>
          <View style={stiller.satir}>
            <Text style={[stiller.satirMetin, { color: renkler.metin }]}>{m.hesaplananBorc}</Text>
            <Text style={[stiller.satirDeger, { color: renkler.metin }]}>
              {o.eskiTaban === null ? '—' : fmt(o.eskiTaban)} → {fmt(o.yeniTaban)}
            </Text>
          </View>
          {o.vakitler.map((v) => (
            <View key={v.vakit} style={[stiller.satir, stiller.inceSatir]}>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>{kazaVaktiGoster(v.vakit)}</Text>
              <Text style={[stiller.alt, { color: renkler.metin }]}>
                {fmt(v.eski)} → {fmt(v.yeni)}
              </Text>
            </View>
          ))}
        </KazaKart>

        {o.gocmisTabanDegisiyor && (
          <KazaBant
            testID="gocmis-taban-uyarisi"
            ikon="info-circle"
            renk={renkler.bilgi}
            metin={bicim(m.gocmisUyari, { n: fmt(o.gocmisKilinan) })}
          />
        )}

        {korunanlar.length > 0 && (
          <>
            <BolumBasligi>{m.korunanlar}</BolumBasligi>
            <KazaKart>
              {korunanlar.map((k) => (
                <View key={k.etiket} style={stiller.satir}>
                  <View style={stiller.ikonluMetin}>
                    <FontAwesome5 name={k.ikon} size={12} color={renkler.metinIkincil} />
                    <Text style={[stiller.satirMetin, { color: renkler.metin }]}>{k.etiket}</Text>
                  </View>
                  <Text style={[stiller.satirDeger, { color: renkler.metin }]}>{k.deger}</Text>
                </View>
              ))}
            </KazaKart>
          </>
        )}

        {ortusenToplam > 0 && o.gizleKalan !== null && (
          <>
            <BolumBasligi>{sayili(m.ortusen, ortusenToplam, { n: fmt(ortusenToplam) })}</BolumBasligi>
            <Text style={[stiller.alt, stiller.yanBosluk, { color: renkler.metinIkincil }]}>
              {m.ortusenAlt}
            </Text>
            {(
              [
                { id: 'ayrica', baslik: m.ayrica, alt: m.ayricaAlt },
                { id: 'gizle', baslik: m.gizle, alt: bicim(m.gizleAlt, { n: fmt(o.gizleKalan) }) },
              ] as const
            ).map((s) => {
              const secili = ortusme === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setOrtusme(s.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: secili, checked: secili }}
                  accessibilityLabel={`${s.baslik}. ${s.alt}`}
                  style={[
                    stiller.secenek,
                    { backgroundColor: renkler.kartArkaplan, borderColor: secili ? renkler.birincil : renkler.sinir },
                  ]}
                >
                  <FontAwesome5 name={secili ? 'dot-circle' : 'circle'} size={18} color={secili ? renkler.birincil : renkler.metinIkincil} />
                  <View style={stiller.esnek}>
                    <Text style={[stiller.satirMetin, { color: renkler.metin }]}>{s.baslik}</Text>
                    <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>{s.alt}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {o.yeniFazla > 0 && (
          <KazaBant
            ikon="info-circle"
            renk={renkler.bilgi}
            metin={bicim(m.fazla, { n: fmt(o.yeniFazla) })}
          />
        )}

        <Text style={[stiller.not, { color: renkler.metinIkincil }]}>
          {m.not}
        </Text>

        <View style={stiller.dugmeler}>
          <KazaDugme etiket={metinler.ortak.vazgecin} tur="ikincil" onPress={() => navigation.goBack()} />
          <KazaDugme etiket={m.uygulayin} ikon="check" onPress={uygula} devreDisi={mesgul} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const stiller = StyleSheet.create({
  kap: { flex: 1 },
  icerik: { padding: 16, paddingBottom: 32 },
  orta: { textAlign: 'center', marginTop: 32 },
  etiket: { fontSize: 13, fontWeight: '600' },
  buyukSatir: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 6 },
  eski: { fontSize: 22, fontWeight: '600', textDecorationLine: 'line-through' },
  yeni: { fontSize: 34, fontWeight: '800' },
  alt: { fontSize: 13, lineHeight: 18 },
  satir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 },
  inceSatir: { minHeight: 24 },
  satirMetin: { fontSize: 14, fontWeight: '600' },
  satirDeger: { fontSize: 14, fontWeight: '700' },
  ikonluMetin: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secenek: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 8, minHeight: 56 },
  esnek: { flex: 1 },
  yanBosluk: { marginHorizontal: 4, marginBottom: 8 },
  not: { fontSize: 12, lineHeight: 17, marginVertical: 8, marginHorizontal: 4 },
  dugmeler: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
