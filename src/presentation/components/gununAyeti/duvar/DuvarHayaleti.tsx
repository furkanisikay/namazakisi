/**
 * Düzenleyicide tuvalin üstündeki yol gösterici katman (görsele GİRMEZ): telefonun kilit
 * saati/tarihi ve alt simgelerin silik hayaleti, yazının giremeyeceği bölgeler (kesik çizgi,
 * `IZINLI_BANTLAR` dışı) ve sürüklemede ortalama kılavuzları. Ekran okuyucudan gizlidir.
 */
import * as React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import type { DuvarEkrani, DuvarPlatformu } from '../../../../core/icerik/duvarTasarimi';
import { yasakBolgeler } from '../../../../core/icerik/duvarCizimi';

interface Props {
  genislik: number;
  yukseklik: number;
  platform: DuvarPlatformu;
  ekran: DuvarEkrani;
  /** Hayaletin rengi (zeminin yazı rengi). */
  renk: string;
  saat: string;
  tarih: string;
  saatEtiketi: string;
  /** Sürüklemede dikey orta çizgisi (yazı ortalanmışken). */
  dikeyKilavuz: boolean;
  /** Varsayılan yüksekliğe oturduğunda yatay çizgi (ekran kesri) ya da `null`. */
  yatayKilavuz: number | null;
}

/** Durum çubuğu gibi ince bölgeler kesik çizgiyle gösterilmez. */
const EN_AZ_BOLGE = 0.09;

export const DuvarHayaleti: React.FC<Props> = ({ genislik: g, yukseklik: y, platform, ekran, renk, saat, tarih, saatEtiketi, dikeyKilavuz, yatayKilavuz }) => {
  const bolgeler = yasakBolgeler(platform, ekran).filter(([a, b]) => b - a >= EN_AZ_BOLGE);
  // Kilit ekranında saat en büyük yasak bölgededir; alt bölge simgelerindir.
  const saatBolgesi = ekran === 'kilit' ? bolgeler.filter((b) => b[1] < 0.99).sort((a, b) => b[1] - b[0] - (a[1] - a[0]))[0] ?? null : null;
  const altBolge = bolgeler.find((b) => b[1] >= 0.99) ?? null;
  const pay = g * 0.07;
  const simgeSayisi = ekran === 'kilit' ? 2 : 4;
  const simgeR = g * 0.055;
  const saatBoyu = saatBolgesi ? Math.min(g * 0.2, (saatBolgesi[1] - saatBolgesi[0]) * y * 0.42) : 0;

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', left: 0, top: 0, width: g, height: y }}>
      <Svg width={g} height={y} style={{ position: 'absolute', left: 0, top: 0 }}>
        {bolgeler.map(([a, b]) => (
          <Rect
            key={`${a}-${b}`}
            x={pay * 0.6}
            y={a * y + 4}
            width={g - pay * 1.2}
            height={(b - a) * y - 8}
            rx={14}
            fill="none"
            stroke={renk}
            strokeOpacity={0.55}
            strokeWidth={1.2}
            strokeDasharray="5 4"
          />
        ))}
        {altBolge
          ? Array.from({ length: simgeSayisi }, (_, i) => (
              <Circle
                key={i}
                cx={simgeSayisi === 2 ? (i === 0 ? pay * 2.2 : g - pay * 2.2) : pay * 1.8 + (i * (g - pay * 3.6)) / (simgeSayisi - 1)}
                cy={(altBolge[0] + altBolge[1]) * 0.5 * y}
                r={simgeR}
                fill={renk}
                opacity={0.18}
              />
            ))
          : null}
        {dikeyKilavuz ? <Line x1={g / 2} y1={0} x2={g / 2} y2={y} stroke={renk} strokeOpacity={0.75} strokeWidth={1.2} strokeDasharray="5 4" /> : null}
        {yatayKilavuz !== null ? (
          <Line x1={0} y1={yatayKilavuz * y} x2={g} y2={yatayKilavuz * y} stroke={renk} strokeOpacity={0.75} strokeWidth={1.2} strokeDasharray="5 4" />
        ) : null}
      </Svg>
      {saatBolgesi ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: saatBolgesi[0] * y, height: (saatBolgesi[1] - saatBolgesi[0]) * y, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: Math.max(8, saatBoyu * 0.2), color: renk, opacity: 0.85 }}>{tarih}</Text>
          <Text style={{ fontSize: saatBoyu, lineHeight: saatBoyu * 1.15, fontWeight: '300', color: renk, opacity: 0.9 }}>{saat}</Text>
          <Text style={{ position: 'absolute', right: pay, bottom: 8, fontSize: 9, color: renk, opacity: 0.75 }}>{saatEtiketi}</Text>
        </View>
      ) : null}
    </View>
  );
};
