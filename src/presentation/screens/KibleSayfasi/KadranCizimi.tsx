import React from 'react';
import Svg, { Circle, Defs, Line, RadialGradient, Stop, Text as SvgText, G } from 'react-native-svg';

/**
 * Pusula kadranının STATİK çizimi (viewBox 0–200). Dönmez, eğilmez: hareket onu saran
 * Animated.View'un dönüşümüyle verilir, yani bu ağaç sensör hızında yeniden çizilmez.
 * Yalnız tema ya da kıble açısı değişince çizilir (`React.memo`).
 */
export const KadranCizimi: React.FC<{
  boyut: number;
  zemin: string;
  cizgi: string;
  metin: string;
  kuzey: string;
  vurgu: string;
  /** Kıble açısı (gerçek kuzeye göre) ya da bilinmiyor. */
  kibleAcisi: number | null;
}> = React.memo(({ boyut, zemin, cizgi, metin, kuzey, vurgu, kibleAcisi }) => {
  const isaretler = [];
  for (let i = 0; i < 72; i++) {
    const aci = i * 5;
    const ana = aci % 30 === 0;
    const uzunluk = aci % 90 === 0 ? 11 : ana ? 8 : 4;
    isaretler.push(
      <Line
        key={i}
        x1={100}
        y1={9}
        x2={100}
        y2={9 + uzunluk}
        stroke={aci === 0 ? kuzey : cizgi}
        strokeWidth={ana ? 1.6 : 0.9}
        strokeLinecap="round"
        transform={`rotate(${aci} 100 100)`}
      />,
    );
  }
  const harfler: Array<[string, number]> = [
    ['K', 0],
    ['D', 90],
    ['G', 180],
    ['B', 270],
  ];
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 200 200">
      <Defs>
        <RadialGradient id="kadranZemin" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={vurgu} stopOpacity={0.1} />
          <Stop offset="0.7" stopColor={zemin} stopOpacity={1} />
          <Stop offset="1" stopColor={zemin} stopOpacity={1} />
        </RadialGradient>
      </Defs>
      <Circle cx={100} cy={100} r={97} fill="url(#kadranZemin)" stroke={cizgi} strokeWidth={1.2} />
      <Circle cx={100} cy={100} r={64} fill="none" stroke={cizgi} strokeWidth={0.6} strokeDasharray="2 4" />
      {isaretler}
      {harfler.map(([h, a]) => (
        <G key={h} transform={`rotate(${a} 100 100)`}>
          <SvgText
            x={100}
            y={36}
            fill={a === 0 ? kuzey : metin}
            fontSize={a === 0 ? 15 : 13}
            fontWeight="700"
            textAnchor="middle"
          >
            {h}
          </SvgText>
        </G>
      ))}
      {kibleAcisi !== null && (
        <G transform={`rotate(${kibleAcisi} 100 100)`}>
          <Line x1={100} y1={100} x2={100} y2={26} stroke={vurgu} strokeWidth={2.2} strokeLinecap="round" strokeDasharray="1 5" />
          <Circle cx={100} cy={20} r={4} fill={vurgu} />
        </G>
      )}
      <Circle cx={100} cy={100} r={3.5} fill={metin} />
    </Svg>
  );
});
KadranCizimi.displayName = 'KadranCizimi';
