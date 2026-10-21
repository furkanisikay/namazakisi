import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { aciNormalize } from '../../../core/kible/acilar';
import type { KameraOptigi } from '../../../core/kible/kameraProjeksiyonu';
import { kibleYoluFazi, kibleYoluGeometrisi } from '../../../core/kible/kibleYolu';
import type { KibleKaresi } from '../../hooks/useKible';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Hizasızken yol beyaz ve soluk; hizalanınca tema yeşiline döner ve netleşir. Dekoratif. */
const HIZASIZ = '#FFFFFF';
const HIZASIZ_OPAKLIK = [0.24, 0.15, 0.07] as const;
const HIZALI_OPAKLIK = [0.46, 0.3, 0.15] as const;

/**
 * Kameralı kıblede yerdeki yol (Google Qibla Finder AR'daki gibi): ayağın dibinde geniş,
 * ufka doğru daralan yarı saydam şerit (eğime göre perspektifi değişir), kenarlarında
 * yumuşak parıltı, üstünde Kâbe'ye doğru akan çevronlar (›). Hizalanınca yeşile döner ve
 * BİR KEZ hafifçe nabız atar.
 *
 * Geometri SAF çekirdekte (`core/kible/kibleYolu`), Kâbe işaretiyle AYNI süzülmüş taban ve
 * iğne deliği modeli → yolun ucu işaretin altında birleşir. Sensör karesi React state'ine
 * YAZILMAZ: kare aboneliğinden path dizeleri shared value'lara gider (useKible kuralı).
 * Bu küçük Svg'nin her güncellemesi yalnız kendi 6 düğümünü yeniden çizer — büyük bir
 * ağaca gömülmez (Seri gök paneli dersi). Hareket azaltılmışsa çevronlar akmaz, nabız yok.
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
  const kenarlar = useSharedValue('');
  const cevronlar = useSharedValue('');
  const nabiz = useSharedValue(1);
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
          kenarlar.value = '';
          cevronlar.value = '';
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
        kenarlar.value = g.kenarlar;
        cevronlar.value = g.cevronlar;
      }),
    [abone, optik, yakin, orta, uzak, kenarlar, cevronlar],
  );

  // Hizaya girişte TEK nabız (sonsuz değil): yol bir an söner ve netleşir.
  useEffect(() => {
    if (!hizali || hareketAzalt) return;
    nabiz.value = withSequence(withTiming(0.45, { duration: 140 }), withTiming(1, { duration: 520 }));
  }, [hizali, hareketAzalt, nabiz]);
  const nabizStili = useAnimatedStyle(() => ({ opacity: nabiz.value }));

  const yakinProps = useAnimatedProps(() => ({ d: yakin.value }));
  const ortaProps = useAnimatedProps(() => ({ d: orta.value }));
  const uzakProps = useAnimatedProps(() => ({ d: uzak.value }));
  const kenarProps = useAnimatedProps(() => ({ d: kenarlar.value }));
  const kenarIzProps = useAnimatedProps(() => ({ d: kenarlar.value }));
  const cevronProps = useAnimatedProps(() => ({ d: cevronlar.value }));

  const dolgu = hizali ? renk : HIZASIZ;
  const opaklik = hizali ? HIZALI_OPAKLIK : HIZASIZ_OPAKLIK;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, nabizStili]}>
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
        <AnimatedPath animatedProps={yakinProps} fill={dolgu} fillOpacity={opaklik[0]} />
        {/* Kenar parıltısı: geniş + çok soluk kontur altta, ince + parlak üstte (blur yok). */}
        <AnimatedPath
          animatedProps={kenarIzProps}
          fill="none"
          stroke={dolgu}
          strokeOpacity={hizali ? 0.28 : 0.16}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <AnimatedPath
          animatedProps={kenarProps}
          fill="none"
          stroke={dolgu}
          strokeOpacity={hizali ? 0.85 : 0.6}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <AnimatedPath animatedProps={cevronProps} fill="#FFFFFF" fillOpacity={hizali ? 0.95 : 0.8} />
      </Svg>
    </Animated.View>
  );
};
