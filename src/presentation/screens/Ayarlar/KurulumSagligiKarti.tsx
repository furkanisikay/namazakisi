/**
 * Ayarlar ekranının en üstündeki "kurulum sağlığı" kartı.
 *
 * Sorun yoksa tek satırlık yeşil bir özet gösterir. Sorun varsa ilk (en
 * yüksek öncelikli) sorunu tam kart olarak gösterir; kalan sorunlar
 * "N sorun daha" metnine dokununca aynı kartın içinde açılır.
 *
 * Seviye renkleri (`durum.hata`/`durum.uyari`/`durum.bilgi`) YALNIZ
 * dekoratiftir (ikon çipi + sol şerit) — gövde metni daima
 * `renkler.metin`/`metinIkincil` (AGENTS.md kontrast tuzağı, PR #139/#166).
 *
 * Sol şerit deseni `MuhafizAyarlari/VakitKarti.tsx`'teki tercih edilen
 * yoldan alınmıştır: tam çerçeve (hairline border) + `borderLeftWidth: 4`.
 *
 * (Task 4 brief — Ayarlar ekranı yeniden kurulumu)
 */
import * as React from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import type { Sorun, SorunSeviyesi } from '../../../core/ayarlar/kurulumSagligi';

export interface KurulumSagligiKartiProps {
  sorunlar: Sorun[];
  onEylem: (sorun: Sorun) => void;
  /** Sorun yokken gösterilen tek satırlık özet (brief: "Kurulumunuz eksiksiz · ..."). */
  ozetSatiri: string;
}

const SEVIYE_IKONLARI: Record<SorunSeviyesi, string> = {
  kritik: 'exclamation-circle',
  uyari: 'exclamation-triangle',
  bilgi: 'info-circle',
};

export const KurulumSagligiKarti: React.FC<KurulumSagligiKartiProps> = ({
  sorunlar,
  onEylem,
  ozetSatiri,
}) => {
  const renkler = useRenkler();
  const [genisletildiMi, setGenisletildiMi] = useState(false);

  const seviyeRengi = (seviye: SorunSeviyesi): string => {
    if (seviye === 'kritik') return renkler.durum.hata;
    if (seviye === 'uyari') return renkler.durum.uyari;
    return renkler.durum.bilgi;
  };

  if (sorunlar.length === 0) {
    return (
      <View
        className="flex-row items-center rounded-2xl mx-4 mb-4 p-4"
        style={{ backgroundColor: `${renkler.durum.basarili}15` }}
        accessible
        accessibilityRole="text"
        accessibilityLabel={ozetSatiri}
      >
        <FontAwesome5
          name="check-circle"
          size={18}
          color={renkler.durum.basarili}
          solid
          style={{ marginRight: 10 }}
        />
        <Text className="text-sm font-semibold flex-1" style={{ color: renkler.metin }}>
          {ozetSatiri}
        </Text>
      </View>
    );
  }

  const [ilkSorun, ...digerSorunlar] = sorunlar;
  const kalanSayi = digerSorunlar.length;
  const anaRenk = seviyeRengi(ilkSorun.seviye);

  const sorunuRenderla = (sorun: Sorun, sonElemanMi: boolean) => {
    const renk = seviyeRengi(sorun.seviye);
    return (
      <View key={sorun.id} style={sonElemanMi ? undefined : { marginBottom: 12 }}>
        <View className="flex-row items-start">
          <View
            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: `${renk}20` }}
          >
            <FontAwesome5 name={SEVIYE_IKONLARI[sorun.seviye]} size={16} color={renk} solid />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold" style={{ color: renkler.metin }}>
              {sorun.baslik}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
              {sorun.aciklama}
            </Text>
          </View>
        </View>
        {sorun.eylemEtiketi && (
          <TouchableOpacity
            className="self-start rounded-xl px-5 mt-3"
            style={{ backgroundColor: renkler.birincil, minHeight: 44, justifyContent: 'center' }}
            onPress={() => onEylem(sorun)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={sorun.eylemEtiketi}
          >
            <Text className="text-xs font-bold" style={{ color: renkler.birincilMetin }}>
              {sorun.eylemEtiketi}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View
      className="rounded-2xl mx-4 mb-4 p-4"
      style={{
        backgroundColor: renkler.kartArkaplan,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: renkler.sinir,
        borderLeftWidth: 4,
        borderLeftColor: anaRenk,
      }}
    >
      {sorunuRenderla(ilkSorun, kalanSayi === 0)}

      {kalanSayi > 0 && !genisletildiMi && (
        <TouchableOpacity
          onPress={() => setGenisletildiMi(true)}
          activeOpacity={0.7}
          style={{ minHeight: 44, justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={`${kalanSayi} sorun daha göster`}
        >
          <Text className="text-xs font-semibold" style={{ color: renkler.birincil }}>
            {kalanSayi} sorun daha
          </Text>
        </TouchableOpacity>
      )}

      {genisletildiMi &&
        digerSorunlar.map((sorun, indeks) =>
          sorunuRenderla(sorun, indeks === digerSorunlar.length - 1)
        )}
    </View>
  );
};
