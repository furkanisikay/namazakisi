import React from 'react';
import Svg, { Circle, Defs, Line, Path, RadialGradient, Stop, G } from 'react-native-svg';

/** Kadran birimiyle (viewBox 0–200) yerleşim: Kâbe küpü merkezi, ışın ucu, yön harfleri. */
export const KABE_HALKA_R = 50;
export const KIBLE_ISIN_UCU = 41;
export const HARF_HALKA_R = 71;

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
  /** Kuzey işaret çizgisinin rengi. */
  kuzey: string;
  vurgu: string;
  /**
   * Kıble açısı (gerçek kuzeye göre) ya da bilinmiyor. Yön harfleri (K/D/G/B) burada
   * ÇİZİLMEZ: kadranla dönerlerdi; `PusulaGorunumu` onları dik duran ayrı katmanda çizer.
   */
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
      <Circle cx={100} cy={100} r={60} fill="none" stroke={cizgi} strokeWidth={0.6} />
      {isaretler}
      {kibleAcisi !== null && (
        // Düz, kalın kıble ışını: merkezden çıkar, ucu Kâbe'nin hemen önünde ok başıyla biter
        // (Kâbe küpü r=KABE_HALKA_R'de, kardeş katmanda durur). Dış halkada küçük işaret.
        <G transform={`rotate(${kibleAcisi} 100 100)`}>
          <Line x1={100} y1={92} x2={100} y2={100 - KIBLE_ISIN_UCU} stroke={vurgu} strokeWidth={3.2} strokeLinecap="round" />
          <Path
            d={`M100 ${100 - KIBLE_ISIN_UCU - 6} L94.5 ${100 - KIBLE_ISIN_UCU + 3} L105.5 ${100 - KIBLE_ISIN_UCU + 3} Z`}
            fill={vurgu}
          />
          <Path d="M100 9 L95.5 3 L104.5 3 Z" fill={vurgu} />
        </G>
      )}
      <Circle cx={100} cy={100} r={3.5} fill={metin} />
    </Svg>
  );
});
KadranCizimi.displayName = 'KadranCizimi';
