/**
 * Ayarlar ekranındaki bir grubu (ör. "Namaz vakitleri") tek bir kart içinde
 * gösterir: başlık kartın DIŞINDA, çocuklar (AyarSatiri) tek kartın İÇİNDE,
 * aralarında ince bir ayraç.
 *
 * (Task 4 brief — Ayarlar ekranı yeniden kurulumu, One UI esinli grup deseni)
 */
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRenkler } from '../../../core/theme';

export interface AyarGrubuProps {
  baslik: string;
  children: React.ReactNode;
}

export const AyarGrubu: React.FC<AyarGrubuProps> = ({ baslik, children }) => {
  const renkler = useRenkler();
  const cocuklar = React.Children.toArray(children);

  return (
    <View className="mb-6">
      {/*
        Renk `metinIkincil`, `birincil` DEGIL. Bolum baslıkları bu sayfanın bilgi
        mimarisini tasır (dekoratif degil), dolayısıyla WCAG AA normal-metin
        esigine (4.5:1) uymalı. Olculdu: `birincil` acık temada Zumrut ~2.7:1,
        Gunes ~2.1:1; koyu temada Gece ~2.0:1 — hepsi esigin altında.
        `metinIkincil` ~4.5:1 verir ve eski bolum baslıklarıyla da tutarlıdır.
      */}
      <Text
        className="text-xs font-semibold mx-4 mb-2"
        style={{ color: renkler.metinIkincil }}
        accessibilityRole="header"
      >
        {baslik}
      </Text>
      <View
        className="rounded-2xl mx-4 shadow-sm overflow-hidden"
        style={{ backgroundColor: renkler.kartArkaplan }}
      >
        {cocuklar.map((cocuk, indeks) => (
          <View
            key={indeks}
            style={
              indeks > 0
                ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir }
                : undefined
            }
          >
            {cocuk}
          </View>
        ))}
      </View>
    </View>
  );
};
