/**
 * Ayarlar arama sonuçları listesi.
 *
 * Filtrelenmiş/skorlanmış kayıtları (`ayarAra` çıktısı) `AyarlarSayfasi`'dan
 * `sonuclar` prop'u ile alır — burada arama/eşleştirme mantığı YOKTUR, yalnız
 * sunum. Her satırın bağlamı ("Hatırlatmalar › Bildirimler") `AYAR_INDEKSI`
 * içindeki navigasyon kaydından (aynı `sayfa`ya giden çapasız kayıt) türetilir;
 * o kayıt yoksa veya aynıysa tek seviyeli `grup` gösterilir.
 *
 * Navigasyon tipi AÇIKÇA belirtilir — tipsiz `useNavigation()` `navigate`'in
 * ikinci argümanını (`{ vurgula }`) kabul etmez.
 *
 * (Task 5 — Ayarlar ekranı yeniden kurulumu, arama arayüzü)
 */
import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { AYAR_INDEKSI, type AyarIndeksKaydi } from '../../../core/ayarlar/aramaIndeksi';
import type { AyarlarStackParamList } from '../../../navigation/ayarlarEkranlari';

export interface AramaSonuclariProps {
  sonuclar: AyarIndeksKaydi[];
}

/** Bir kaydın sonuç satırında gösterilecek bağlam metni ("Üst grup › Alt grup"). */
function baglamOlustur(kayit: AyarIndeksKaydi): string {
  if (!kayit.capa) return kayit.grup;

  const navKaydi = AYAR_INDEKSI.find(k => !k.capa && k.sayfa === kayit.sayfa);
  if (navKaydi && navKaydi.grup !== kayit.grup) {
    return `${navKaydi.grup} › ${kayit.grup}`;
  }
  return kayit.grup;
}

export const AramaSonuclari: React.FC<AramaSonuclariProps> = ({ sonuclar }) => {
  const renkler = useRenkler();
  const navigation = useNavigation<NativeStackNavigationProp<AyarlarStackParamList>>();

  if (sonuclar.length === 0) {
    return (
      <View
        className="items-center px-8 py-16"
        accessible
        accessibilityRole="text"
        accessibilityLabel="Eşleşen ayar bulunamadı. Farklı bir sözcük deneyin."
      >
        <FontAwesome5
          name="search"
          size={26}
          color={renkler.metinIkincil}
          solid
          style={{ marginBottom: 12 }}
        />
        <Text className="text-base font-semibold text-center" style={{ color: renkler.metin }}>
          Eşleşen ayar bulunamadı
        </Text>
        <Text className="text-sm text-center mt-1" style={{ color: renkler.metinIkincil }}>
          Farklı bir sözcük deneyin.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Ekran okuyucular için sessiz duyuru; görsel olarak gizli. */}
      <Text
        accessibilityLiveRegion="polite"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
      >
        {`${sonuclar.length} sonuç bulundu`}
      </Text>

      <View
        className="rounded-2xl mx-4 shadow-sm overflow-hidden"
        style={{ backgroundColor: renkler.kartArkaplan }}
      >
        {sonuclar.map((kayit, indeks) => (
          <TouchableOpacity
            key={kayit.id}
            className="flex-row items-center py-3.5 px-4"
            style={
              indeks > 0
                ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir }
                : undefined
            }
            onPress={() =>
              navigation.navigate(kayit.sayfa, kayit.capa ? { vurgula: kayit.capa } : undefined)
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${kayit.baslik}. ${baglamOlustur(kayit)}`}
          >
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                {kayit.baslik}
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                {baglamOlustur(kayit)}
              </Text>
            </View>
            <FontAwesome5
              name="chevron-right"
              size={14}
              color={renkler.metinIkincil}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
