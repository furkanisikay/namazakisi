/**
 * Düzenleyicide tuvalin üstündeki yol gösterici katman (görsele GİRMEZ): telefonun kilit
 * saati/tarihi ve alt simgelerin silik hayaleti, yazının giremeyeceği bölgeler (kesik çizgi,
 * izinli bantların dışı; kilit ekranında saat alanı ayrı çerçevedir) ve sürüklemede ortalama
 * kılavuzları. Saat alanı elle ayarlanırken iki kenarında tutamak çizilir. Ekran okuyucudan
 * gizlidir (kenarların erişilebilir ayarı düzenleyicinin tepsisindedir).
 */
import * as React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { IZINLI_BANTLAR, KILIT_DIS_SINIR, type DuvarEkrani, type DuvarPlatformu, type SaatAlani } from '../../../../core/icerik/duvarTasarimi';
import { yasakBolgeler } from '../../../../core/icerik/duvarCizimi';

interface Props {
  genislik: number;
  yukseklik: number;
  platform: DuvarPlatformu;
  ekran: DuvarEkrani;
  /** Ayardaki HAM saat alanı (`null` = platform varsayılanı); bantlar bununla. */
  ayarSaatAlani: SaatAlani | null;
  /** Çizilen saat alanı (`etkinSaatAlani`; ana ekranda `null`). */
  saatAlani: SaatAlani | null;
  /** Saat alanının kenarları elle ayarlanıyor (tutamaklar görünür). */
  saatKipi: boolean;
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

/** [a, b] aralığından saat alanını çıkarır (kalan parçalar). */
const saatDisinda = ([a, b]: [number, number], alan: SaatAlani | null): [number, number][] => {
  if (!alan || alan[1] <= a || alan[0] >= b) return [[a, b]];
  const kalan: [number, number][] = [];
  if (alan[0] > a) kalan.push([a, alan[0]]);
  if (alan[1] < b) kalan.push([alan[1], b]);
  return kalan;
};

export const DuvarHayaleti: React.FC<Props> = ({
  genislik: g,
  yukseklik: y,
  platform,
  ekran,
  ayarSaatAlani,
  saatAlani,
  saatKipi,
  renk,
  saat,
  tarih,
  saatEtiketi,
  dikeyKilavuz,
  yatayKilavuz,
}) => {
  // Kilit ekranında saat alanı kendi çerçevesidir (ölçülen/ayarlanan); kalan yasak bölgeler ayrı.
  const saatBolgesi: SaatAlani | null = ekran === 'kilit' && saatAlani ? [Math.max(0, saatAlani[0]), Math.min(1, saatAlani[1])] : null;
  const bolgeler = yasakBolgeler(platform, ekran, ayarSaatAlani)
    .flatMap((b) => saatDisinda(b, saatBolgesi))
    .filter(([a, b]) => b - a >= EN_AZ_BOLGE);
  // Alttaki kilit/fener (ya da ana ekran dock) simgeleri saat alanından bağımsız SABİT yerdedir:
  // saat alanı aşağı uzansa da (ör. elle [0,6, 0,95]) hayaletleri kaybolmaz.
  const altSinir = ekran === 'kilit' ? KILIT_DIS_SINIR[platform][1] : IZINLI_BANTLAR[platform].ana.reduce((m, b) => Math.max(m, b[1]), 0);
  const altBolge: readonly [number, number] = [altSinir, 1];
  const ortusur = bolgeler.some((b) => b[0] <= altBolge[0] + 1e-6 && b[1] >= 0.99);
  const cerceveler: (readonly [number, number])[] = [...(saatBolgesi ? [saatBolgesi] : []), ...bolgeler, ...(ortusur ? [] : [altBolge])];
  const pay = g * 0.07;
  const simgeSayisi = ekran === 'kilit' ? 2 : 4;
  const simgeR = g * 0.055;
  const saatBoyu = saatBolgesi ? Math.min(g * 0.2, (saatBolgesi[1] - saatBolgesi[0]) * y * 0.42) : 0;

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', left: 0, top: 0, width: g, height: y }}>
      <Svg width={g} height={y} style={{ position: 'absolute', left: 0, top: 0 }}>
        {cerceveler.map(([a, b], i) => (
          <Rect
            key={`${a}-${b}`}
            x={pay * 0.6}
            y={a * y + 4}
            width={g - pay * 1.2}
            height={Math.max(0, (b - a) * y - 8)}
            rx={14}
            fill="none"
            stroke={renk}
            strokeOpacity={saatKipi && i === 0 && saatBolgesi ? 0.95 : 0.55}
            strokeWidth={saatKipi && i === 0 && saatBolgesi ? 2 : 1.2}
            strokeDasharray="5 4"
          />
        ))}
        {saatKipi && saatBolgesi
          ? saatBolgesi.map((kenar, i) => (
              <Rect
                key={`tutamak-${i}`}
                testID={`duvar-saat-tutamak-${i === 0 ? 'ust' : 'alt'}`}
                x={g / 2 - g * 0.09}
                y={(i === 0 ? kenar * y + 4 : kenar * y - 4) - 4}
                width={g * 0.18}
                height={8}
                rx={4}
                fill={renk}
                opacity={0.95}
              />
            ))
          : null}
        {altBolge[1] - altBolge[0] > 0
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
