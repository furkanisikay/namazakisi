import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { KISVE_ALTINI, KISVE_SIYAHI, KISVE_YUZ_ACIK } from './sabitler';

/**
 * Üç çeyrekten görülen Kâbe: iki yan yüz + üst yüz, altın kuşak. Statik çizim (filtre,
 * gradyan yok — Android'de FeGaussianBlur yaklaşıktır); boyut prop'la.
 */
export const KabeSimgesi: React.FC<{ boyut: number; kontur: string }> = React.memo(({ boyut, kontur }) => (
  <Svg width={boyut} height={boyut} viewBox="0 0 48 48" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {/* üst yüz */}
    <Path d="M24 6 L42 13 L24 20 L6 13 Z" fill={KISVE_YUZ_ACIK} stroke={kontur} strokeWidth={0.8} strokeLinejoin="round" />
    {/* sol yüz */}
    <Path d="M6 13 L24 20 L24 42 L6 35 Z" fill={KISVE_SIYAHI} stroke={kontur} strokeWidth={0.8} strokeLinejoin="round" />
    {/* sağ yüz */}
    <Path d="M42 13 L24 20 L24 42 L42 35 Z" fill={KISVE_YUZ_ACIK} stroke={kontur} strokeWidth={0.8} strokeLinejoin="round" />
    {/* altın kuşak (hizam) iki yüzde */}
    <Path d="M6 18.5 L24 25.5 L24 28.5 L6 21.5 Z" fill={KISVE_ALTINI} />
    <Path d="M42 18.5 L24 25.5 L24 28.5 L42 21.5 Z" fill={KISVE_ALTINI} opacity={0.85} />
    {/* kapı */}
    <Path d="M28 31 L33 29 L33 36.5 L28 38.5 Z" fill={KISVE_ALTINI} opacity={0.9} />
  </Svg>
));
KabeSimgesi.displayName = 'KabeSimgesi';
