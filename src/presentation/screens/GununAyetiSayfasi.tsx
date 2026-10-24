/**
 * Günün ayeti sayfası (#380) — widget'a dokununca (`namazakisi://gunun-ayeti`) ve Ayarlar'dan açılır.
 *
 * Ayet widget ve duvar kâğıdıyla AYNI seçimden gelir (`core/icerik/gununAyeti.ts`): gün imsakta
 * değişir, konum yoksa yerel 05:00. Arapça Tanzil'den, meal QuranEnc'ten birebir; tam künye ve
 * Tanzil bağlantısı bu sayfada görünür (lisans/atıf şartı). Tasarım: W6 tuvali, sahip onaylı.
 */
import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { Linking, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { bicim } from '../../core/dil/aktifDil';
import {
  aktifNamazGunu,
  gununAyetiGorunumu,
  gununAyetiKaydi,
  isoGun,
  type GununAyetiGorunumu,
} from '../../core/icerik/gununAyeti';
import { koordinatImsakKaynagi } from '../../core/icerik/gununAyetiYuku';
import { useAppSelector } from '../store/hooks';
import { useAktifDil, useMetin } from '../hooks/useMetin';
import { AyarSatiri } from './Ayarlar/AyarSatiri';
import { BolumBasligi } from '../components/ortak/BolumBasligi';
import { NotSatiri } from '../components/ortak/NotSatiri';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { AyetGorseli, ayetGorseliniPaylas, useArapcaYaziTipi } from '../components/gununAyeti/AyetGorseli';

type Navigasyon = { navigate: (ekran: string) => void };

/**
 * Sabit adres: dışarıdan gelmediği için `guvenilirBaglantiMi`'ye (güncelleme indirme listesi)
 * girmez; o listeyi genişletmek APK indirme güvenini de genişletirdi.
 */
const TANZIL_ADRESI = 'https://tanzil.net/';
/** "Önceki günler" listesindeki gün sayısı (dün dahil). */
const ONCEKI_GUN_SAYISI = 3;

/** Paylaşılan düz metin: Arapça, meal ve künye (atıf her zaman metinle gider). */
export function ayetPaylasimMetni(a: GununAyetiGorunumu): string {
  const satirlar = [a.ar];
  if (a.meal) satirlar.push('', a.meal);
  satirlar.push('', a.kisaKunye);
  if (a.mealKaynagi) satirlar.push(a.mealKaynagi);
  return satirlar.join('\n');
}

export const GununAyetiSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.gununAyeti;
  const dil = useAktifDil();
  const navigation = useNavigation() as unknown as Navigasyon;
  const koordinat = useAppSelector((state) => state.konum.koordinatlar);
  const yaziTipi = useArapcaYaziTipi();
  const gorselRef = useRef<View>(null);
  const [paylasiliyor, setPaylasiliyor] = useState(false);
  const [simdi] = useState(() => new Date());

  const lat = koordinat?.lat ?? 0;
  const lng = koordinat?.lng ?? 0;
  const { bugun, ayet, oncekiler } = useMemo(() => {
    const gun = aktifNamazGunu(simdi, koordinatImsakKaynagi(lat === 0 && lng === 0 ? null : { lat, lng }));
    const gorunum = (t: Date) => gununAyetiGorunumu(gununAyetiKaydi(isoGun(t)), dil);
    const liste = Array.from({ length: ONCEKI_GUN_SAYISI }, (_, i) => {
      const t = new Date(gun.getFullYear(), gun.getMonth(), gun.getDate() - i - 1);
      return { tarih: t, ayet: gorunum(t) };
    });
    return { bugun: gun, ayet: gorunum(gun), oncekiler: liste };
  }, [simdi, lat, lng, dil]);

  const tarihBasligi = bicim(m.sayfa.tarih, {
    gunAdi: s.tarih.gunler[bugun.getDay()],
    gun: bugun.getDate(),
    ay: s.tarih.aylar[bugun.getMonth()],
  });

  const metniPaylas = () => {
    Share.share({ message: ayetPaylasimMetni(ayet) }).catch(() => kisaBildirimGoster(m.sayfa.paylasilamadi));
  };

  const gorseliPaylas = async () => {
    if (paylasiliyor) return;
    setPaylasiliyor(true);
    try {
      if (!(await ayetGorseliniPaylas(gorselRef.current, m.baslik))) kisaBildirimGoster(m.sayfa.paylasilamadi);
    } catch {
      kisaBildirimGoster(m.sayfa.paylasilamadi);
    } finally {
      setPaylasiliyor(false);
    }
  };

  const tanzilAc = () => {
    Linking.openURL(TANZIL_ADRESI).catch(() => undefined);
  };

  const kart = { backgroundColor: renkler.kartArkaplan, borderRadius: 24, padding: 20 } as const;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Paylaşım görseli: ekran dışında çizilir, yalnız yakalanır. */}
      <View style={{ position: 'absolute', left: -10000, top: 0 }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <AyetGorseli ref={gorselRef} ayet={ayet} tur="kart" yaziTipi={yaziTipi} />
      </View>

      <View style={kart} testID="gunun-ayeti-kart">
        <Text style={{ fontSize: 14, color: renkler.metinIkincil }}>{tarihBasligi}</Text>
        <View
          style={{
            alignSelf: 'flex-start',
            marginTop: 10,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: renkler.birincil + '20',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: renkler.birincil }}>{ayet.kisaKunye}</Text>
        </View>
        <Text
          style={{
            fontFamily: yaziTipi,
            fontSize: 26,
            lineHeight: 50,
            marginTop: 16,
            textAlign: 'right',
            writingDirection: 'rtl',
            color: renkler.metin,
          }}
        >
          {ayet.ar}
        </Text>
        {ayet.meal ? (
          <Text style={{ fontSize: 18, lineHeight: 27, marginTop: 14, color: renkler.metin }}>{ayet.meal}</Text>
        ) : (
          <NotSatiri metin={m.sayfa.mealYok} style={{ marginTop: 14 }} />
        )}
        <Text style={{ fontSize: 12, lineHeight: 17, marginTop: 16, color: renkler.metinIkincil }}>{ayet.tamKunye}</Text>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TouchableOpacity
          testID="gunun-ayeti-metin-paylas"
          onPress={metniPaylas}
          accessibilityRole="button"
          activeOpacity={0.7}
          style={{
            flex: 1,
            minHeight: 48,
            marginRight: 6,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: renkler.sinir,
            backgroundColor: renkler.arkaplan,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome5 name="share-alt" size={14} color={renkler.metin} />
          <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: renkler.metin }}>{m.sayfa.metniPaylasin}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="gunun-ayeti-gorsel-paylas"
          onPress={gorseliPaylas}
          disabled={paylasiliyor}
          accessibilityRole="button"
          accessibilityState={{ disabled: paylasiliyor, busy: paylasiliyor }}
          activeOpacity={0.8}
          style={{
            flex: 1,
            minHeight: 48,
            marginLeft: 6,
            borderRadius: 16,
            backgroundColor: renkler.birincil,
            opacity: paylasiliyor ? 0.6 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome5 name="image" size={14} color="#FFFFFF" />
          <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>{m.sayfa.gorselPaylasin}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: renkler.kartArkaplan, marginTop: 16 }}>
        <AyarSatiri
          varyant="navigasyon"
          ikon={<FontAwesome5 name="mobile-alt" size={20} color={renkler.birincil} />}
          baslik={m.sayfa.widgetVeDuvar}
          ozet={m.sayfa.widgetVeDuvarAciklama}
          onPress={() => navigation.navigate('GununAyetiAyarlari')}
        />
      </View>

      <BolumBasligi metin={m.sayfa.oncekiGunler} style={{ marginTop: 24 }} />
      <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: renkler.kartArkaplan }}>
        {oncekiler.map(({ tarih, ayet: onceki }, i) => (
          <View
            key={isoGun(tarih)}
            style={{ padding: 16, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: renkler.sinir }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: renkler.metinIkincil }}>
              {i === 0
                ? m.sayfa.dun
                : bicim(m.sayfa.kisaTarih, { gun: tarih.getDate(), ay: s.tarih.aylarKisa[tarih.getMonth()] })}
              {` · ${onceki.kisaKunye}`}
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22, marginTop: 6, color: renkler.metin }}>{onceki.meal ?? onceki.ar}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 13, lineHeight: 19, marginTop: 20, color: renkler.metinIkincil }}>{m.sayfa.kaynakNotu}</Text>
      <TouchableOpacity
        testID="gunun-ayeti-tanzil"
        onPress={tanzilAc}
        accessibilityRole="link"
        style={{ minHeight: 44, justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: renkler.birincil }}>{m.sayfa.tanzilBaglanti}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default GununAyetiSayfasi;
