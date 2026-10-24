/**
 * Türkiye DIŞINDA elle şehir seçimi (GeoNames, çevrimdışı). Türkiye için `IlIlceSecici`.
 *
 * Akış: arama kutusu → (boşken) ülke listesi → ülkenin şehirleri; yazınca tüm dünyada
 * şehir arar. Her satır ülkenin önerilen takvimini (JAKIM, Umm al-Qura…) çip olarak
 * gösterir; "Genel yöntem" çipi o ülke için doğrulanmış kaynak olmadığını söyler.
 * Liste ilk açılışta varlıktan okunur (≈1,4 MB); okunamazsa yeniden dene düğmesi çıkar.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  InteractionManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useDonanimGeriTusu } from '../hooks/useDonanimGeriTusu';
import { sehirAra, aramaAnahtari, type DunyaSehirVerisi, type DunyaSehri } from '../../core/konum/dunyaSehirleri';
import { ulkeAdi } from '../../core/konum/ulkeAdlari';
import { ulkeVarsayilani } from '../../core/vakit/ulkeProfilleri';
import { HESAP_PROFILLERI } from '../../core/vakit/hesapProfilleri';
import type { DunyaSehriKaydi } from '../../data/local/LocalKonumServisi';
import { useMetin } from '../hooks/useMetin';
import { aktifDil, bicim } from '../../core/dil/aktifDil';

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');

export interface DunyaSehirSeciciProps {
  secili: DunyaSehriKaydi | null | undefined;
  onSec: (sehir: DunyaSehri) => void;
}

type Satir =
  | { tur: 'ulke'; kod: string; ad: string }
  | { tur: 'sehir'; sehir: DunyaSehri };

function ProfilCipi({ ulke }: { ulke: string }) {
  const renkler = useRenkler();
  const m = useMetin().konum.dunya;
  const v = ulkeVarsayilani(ulke);
  const genel = v.guven === 'genel';
  return (
    <View
      className="px-2 py-1 rounded-lg ml-2"
      style={{
        backgroundColor: genel ? `${renkler.durum.uyari}25` : `${renkler.birincil}20`,
        borderWidth: 1,
        borderColor: genel ? `${renkler.durum.uyari}80` : `${renkler.birincil}60`,
      }}
    >
      <Text className="text-xs font-bold" style={{ color: renkler.metin }}>
        {genel ? m.genelYontem : HESAP_PROFILLERI[v.profil].kisaAd}
      </Text>
    </View>
  );
}

export const DunyaSehirSecici: React.FC<DunyaSehirSeciciProps> = ({ secili, onSec }) => {
  const renkler = useRenkler();
  const sozlukMetni = useMetin();
  const m = sozlukMetni.konum.dunya;
  const [gorunur, setGorunur] = useState(false);
  const [veri, setVeri] = useState<DunyaSehirVerisi | null>(null);
  const [durum, setDurum] = useState<'bos' | 'yukleniyor' | 'hata' | 'hazir'>('bos');
  const [arama, setArama] = useState('');
  const [ulke, setUlke] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    setDurum('yukleniyor');
    let v: DunyaSehirVerisi | null = null;
    try {
      // Tembel require: okuyucu expo-asset/expo-file-system yükler (ekran testleri, AGENTS.md).
      const okuyucu = require('../../data/local/dunyaSehirVerisi') as typeof import('../../data/local/dunyaSehirVerisi');
      v = await okuyucu.dunyaSehirVerisiniAl();
    } catch {
      v = null;
    }
    setVeri(v);
    setDurum(v ? 'hazir' : 'hata');
  }, []);

  // Kart görünür olur olmaz (geçiş bitince) önceden yüklenir: 34 bin şehirlik varlığın
  // okunması emülatörde birkaç saniye sürüyor, liste ilk dokunuşta hazır olsun.
  useEffect(() => {
    const is = InteractionManager.runAfterInteractions(() => {
      if (!veri && durum === 'bos') void yukle();
    });
    return () => is.cancel();
    // Yalnız ilk görünüşte; hata sonrası yeniden deneme listeyi açınca yapılır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gorunur && !veri && durum !== 'yukleniyor') void yukle();
  }, [gorunur, veri, durum, yukle]);

  const ac = useCallback(() => {
    setArama('');
    setUlke(null);
    setGorunur(true);
  }, []);
  const kapat = useCallback(() => setGorunur(false), []);
  const geri = useCallback(() => {
    if (ulke) {
      setUlke(null);
      setArama('');
    } else {
      kapat();
    }
  }, [ulke, kapat]);
  useDonanimGeriTusu(gorunur, geri);

  const ulkeListesi = useMemo(
    () =>
      (veri?.ulkeler ?? [])
        .map((kod) => ({ kod, ad: ulkeAdi(kod, aktifDil()) }))
        .sort((a, b) => a.ad.localeCompare(b.ad, aktifDil())),
    // Ülke adları dil başına: dil değişince liste yeniden kurulsun.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [veri, sozlukMetni],
  );

  const satirlar = useMemo<Satir[]>(() => {
    if (!veri) return [];
    if (!ulke && !arama.trim()) {
      return ulkeListesi.map((u) => ({ tur: 'ulke' as const, kod: u.kod, ad: u.ad }));
    }
    const sehirler = sehirAra(veri, arama, { ulke: ulke ?? undefined, limit: ulke ? 200 : 40 });
    const sonuc: Satir[] = [];
    if (!ulke && arama.trim()) {
      const anahtar = aramaAnahtari(arama);
      for (const u of ulkeListesi) {
        if (anahtar && aramaAnahtari(u.ad).startsWith(anahtar)) sonuc.push({ tur: 'ulke', kod: u.kod, ad: u.ad });
        if (sonuc.length >= 3) break;
      }
    }
    for (const s of sehirler) sonuc.push({ tur: 'sehir', sehir: s });
    return sonuc;
  }, [veri, ulke, arama, ulkeListesi]);

  const sec = useCallback(
    (s: DunyaSehri) => {
      onSec(s);
      setGorunur(false);
    },
    [onSec],
  );

  const satirCiz = useCallback(
    ({ item }: { item: Satir }) => {
      if (item.tur === 'ulke') {
        return (
          <TouchableOpacity
            className="flex-row items-center py-3.5 px-4 rounded-xl mb-2"
            style={{ backgroundColor: renkler.kartArkaplan, minHeight: 52 }}
            onPress={() => {
              setUlke(item.kod);
              setArama('');
            }}
            accessibilityRole="button"
            accessibilityLabel={bicim(m.sehirleriGoster, { ulke: item.ad })}
          >
            <Text className="text-base font-semibold flex-1" style={{ color: renkler.metin }}>
              {item.ad}
            </Text>
            <ProfilCipi ulke={item.kod} />
            <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        );
      }
      const s = item.sehir;
      const seciliMi = !!secili && secili.ad === s.ad && secili.ulke === s.ulke && secili.bolge === s.bolge;
      const alt = [s.bolge, ulkeAdi(s.ulke, aktifDil())].filter(Boolean).join(' · ');
      return (
        <TouchableOpacity
          className="flex-row items-center py-3 px-4 rounded-xl mb-2 border"
          style={{
            backgroundColor: seciliMi ? `${renkler.birincil}15` : renkler.kartArkaplan,
            borderColor: seciliMi ? renkler.birincil : 'transparent',
            minHeight: 56,
          }}
          onPress={() => sec(s)}
          accessibilityRole="button"
          accessibilityLabel={`${s.ad}, ${alt}`}
          accessibilityState={{ selected: seciliMi }}
        >
          <View className="flex-1">
            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
              {s.ad}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
              {alt}
            </Text>
          </View>
          <ProfilCipi ulke={s.ulke} />
        </TouchableOpacity>
      );
    },
    [renkler, secili, sec, m],
  );

  const baslik = ulke ? ulkeAdi(ulke, aktifDil()) : m.sehirSecin;
  const konumMetni = secili ? `${secili.ad}, ${ulkeAdi(secili.ulke, aktifDil())}` : m.sehirSecin;

  return (
    <>
      <TouchableOpacity
        className="rounded-2xl p-4 flex-row items-center"
        style={{
          backgroundColor: renkler.kartArkaplan,
          borderColor: secili ? renkler.birincil : renkler.sinir,
          borderWidth: secili ? 2 : 1,
        }}
        onPress={ac}
        accessibilityRole="button"
        accessibilityLabel={secili ? bicim(m.seciliErisim, { konum: konumMetni }) : m.sehirSecin}
      >
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-3.5"
          style={{ backgroundColor: secili ? `${renkler.birincil}20` : renkler.sinir }}
        >
          <FontAwesome5 name="globe-europe" size={20} color={secili ? renkler.birincil : renkler.metinIkincil} />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-medium tracking-wider mb-0.5" style={{ color: renkler.metinIkincil }}>
            {m.sehirBaslik}
          </Text>
          <Text className="text-lg font-semibold" style={{ color: secili ? renkler.metin : renkler.metinIkincil }}>
            {konumMetni}
          </Text>
        </View>
        <FontAwesome5 name="chevron-down" size={12} color={renkler.metinIkincil} />
      </TouchableOpacity>

      <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={geri}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={kapat}
            accessibilityRole="button"
            accessibilityLabel={sozlukMetni.ortak.kapatin}
          />
          <View
            style={{
              height: EKRAN_YUKSEKLIGI * 0.8,
              backgroundColor: renkler.arkaplan,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: 'hidden',
            }}
          >
            <View className="flex-row items-center px-5 pt-4 pb-3 border-b" style={{ borderBottomColor: renkler.sinir }}>
              {ulke && (
                <TouchableOpacity
                  className="w-11 h-11 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: renkler.sinir }}
                  onPress={geri}
                  accessibilityRole="button"
                  accessibilityLabel={m.ulkeListesineDon}
                >
                  <FontAwesome5 name="arrow-left" size={14} color={renkler.metin} />
                </TouchableOpacity>
              )}
              <View className="flex-1">
                <Text className="text-xl font-bold" style={{ color: renkler.metin }}>
                  {baslik}
                </Text>
                <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                  {ulke ? m.sehrinizi : m.ulkeYaDaSehir}
                </Text>
              </View>
              <TouchableOpacity
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: renkler.sinir }}
                onPress={kapat}
                accessibilityRole="button"
                accessibilityLabel={sozlukMetni.ortak.kapatin}
              >
                <FontAwesome5 name="times" size={14} color={renkler.metin} />
              </TouchableOpacity>
            </View>

            <View
              className="flex-row items-center mx-4 my-3 rounded-xl px-3"
              style={{ backgroundColor: renkler.kartArkaplan, height: 48 }}
            >
              <FontAwesome5 name="search" size={14} color={renkler.metinIkincil} />
              <TextInput
                className="flex-1 text-base ml-2.5"
                style={{ color: renkler.metin, height: 48 }}
                placeholder={ulke ? m.sehirArayin : m.ulkeSehirArayin}
                placeholderTextColor={renkler.metinIkincil}
                value={arama}
                onChangeText={setArama}
                autoCorrect={false}
                accessibilityLabel={ulke ? m.sehirArayin : m.ulkeSehirArayin}
              />
            </View>

            {durum === 'yukleniyor' || (durum === 'bos' && !veri) ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={renkler.birincil} />
                <Text className="text-sm mt-3" style={{ color: renkler.metinIkincil }}>
                  {m.aciliyor}
                </Text>
              </View>
            ) : durum === 'hata' ? (
              <View className="flex-1 items-center justify-center px-8">
                <Text className="text-base text-center" style={{ color: renkler.metin }}>
                  {m.acilamadi}
                </Text>
                <TouchableOpacity
                  className="mt-4 px-5 rounded-xl items-center justify-center"
                  style={{ backgroundColor: renkler.birincil, minHeight: 48 }}
                  onPress={() => void yukle()}
                  accessibilityRole="button"
                >
                  <Text className="text-base font-bold" style={{ color: '#FFFFFF' }}>
                    {m.yenidenDeneyin}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={satirlar}
                keyExtractor={(s) => (s.tur === 'ulke' ? `u-${s.kod}` : `s-${s.sehir.ulke}-${s.sehir.ad}-${s.sehir.lat}`)}
                renderItem={satirCiz}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={20}
                ListEmptyComponent={
                  <Text className="text-base text-center mt-10" style={{ color: renkler.metinIkincil }}>
                    {bicim(m.sonucYok, { arama })}
                  </Text>
                }
                ListFooterComponent={
                  <Text className="text-xs text-center mt-4" style={{ color: renkler.metinIkincil }}>
                    {m.kaynak}
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};
