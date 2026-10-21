import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { aciNormalize } from '../../../core/kible/acilar';
import type { KameraOptigi } from '../../../core/kible/kameraProjeksiyonu';
import { kibleYoluFazi, kibleYoluGeometrisi } from '../../../core/kible/kibleYolu';
import type { KibleKaresi } from '../../hooks/useKible';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Hizasızken yol beyaz ve soluk; hizalanınca tema yeşiline döner ve netleşir. Dekoratif. */
const HIZASIZ = '#FFFFFF';
const HIZASIZ_OPAKLIK = [0.22, 0.14, 0.07] as const;
const HIZALI_OPAKLIK = [0.5, 0.34, 0.18] as const;

/**
 * Kameralı kıblede yerdeki yol (Google Qibla Finder AR'daki gibi): ayaktan kıble yönüne
 * zeminde uzanan, ufka doğru daralan şerit + Kâbe'ye doğru akan noktalar.
 *
 * Geometri SAF çekirdekte (`core/kible/kibleYolu`), Kâbe işaretiyle AYNI süzülmüş taban ve
 * iğne deliği modeli → yolun ucu işaretin altında birleşir. Sensör karesi React state'ine
 * YAZILMAZ: kare aboneliğinden path dizeleri shared value'lara gider (useKible kuralı).
 * Bu küçük Svg'nin her güncellemesi yalnız kendi 4 düğümünü yeniden çizer — büyük bir
 * ağaca gömülmez (Seri gök paneli dersi). Hareket azaltılmışsa noktalar akmaz.
 *
 * Yalnız görseldir (`accessibilityElementsHidden`); yön bilgisi alttaki cümlede kalır.
 */
export const KibleYolu: React.FC<{
  abone: (d: (k: KibleKaresi) => void) => () => void;
  kibleAcisi: number | null;
  genislik: number;
  yukseklik: number;
  optik: KameraOptigi;
  hizali: boolean;
  renk: string;
  hareketAzalt: boolean;
}> = ({ abone, kibleAcisi, genislik, yukseklik, optik, hizali, renk, hareketAzalt }) => {
  const yakin = useSharedValue('');
  const orta = useSharedValue('');
  const uzak = useSharedValue('');
  const noktalar = useSharedValue('');
  const girdi = useRef({ kibleAcisi, genislik, yukseklik, hareketAzalt });
  girdi.current = { kibleAcisi, genislik, yukseklik, hareketAzalt };

  useEffect(
    () =>
      abone((k) => {
        const { kibleAcisi: kible, genislik: w, yukseklik: h, hareketAzalt: azalt } = girdi.current;
        if (!k.taban || kible === null || w <= 0 || h <= 0 || k.dikOrani < 0.5) {
          yakin.value = '';
          orta.value = '';
          uzak.value = '';
          noktalar.value = '';
          return;
        }
        const g = kibleYoluGeometrisi({
          taban: k.taban,
          kibleManyetik: aciNormalize(kible - k.manyetikSapma),
          genislik: w,
          yukseklik: h,
          optik,
          faz: kibleYoluFazi(Date.now(), azalt),
        });
        yakin.value = g.bantlar[0];
        orta.value = g.bantlar[1];
        uzak.value = g.bantlar[2];
        noktalar.value = g.noktalar;
      }),
    [abone, optik, yakin, orta, uzak, noktalar],
  );

  const yakinProps = useAnimatedProps(() => ({ d: yakin.value }));
  const ortaProps = useAnimatedProps(() => ({ d: orta.value }));
  const uzakProps = useAnimatedProps(() => ({ d: uzak.value }));
  const noktaProps = useAnimatedProps(() => ({ d: noktalar.value }));

  const dolgu = hizali ? renk : HIZASIZ;
  const opaklik = hizali ? HIZALI_OPAKLIK : HIZASIZ_OPAKLIK;
  return (
    <Svg
      testID="kible-yolu"
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width={genislik}
      height={yukseklik}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AnimatedPath animatedProps={uzakProps} fill={dolgu} fillOpacity={opaklik[2]} />
      <AnimatedPath animatedProps={ortaProps} fill={dolgu} fillOpacity={opaklik[1]} />
      {/* Yakın bant: hizalıyken ince parıltı konturu. */}
      <AnimatedPath
        animatedProps={yakinProps}
        fill={dolgu}
        fillOpacity={opaklik[0]}
        stroke={hizali ? renk : 'none'}
        strokeOpacity={0.55}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <AnimatedPath animatedProps={noktaProps} fill="#FFFFFF" fillOpacity={hizali ? 0.95 : 0.7} />
    </Svg>
  );
};
