/**
 * Birimli iri süre ("1 sa 9 dk", "9 dk 05 sn"): rakam iri, birim küçük ve ikincil.
 * TEK `Text` + iç içe `Text` → `adjustsFontSizeToFit` bütün satıra işler, ekran okuyucu
 * tek düğüm okur (`accessibilityLabel` saat/dakika adlarıyla). Sayı–birim ve parça arası
 * boşluk sözlükten (`birimAyiraci`/`parcaAyiraci`): Çincede boşluk çizilmez ("1小时5分钟").
 */
import * as React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { birimAyiraci, parcaAyiraci } from '../../../core/dil/sure';
import { kalanSureParcalari, kalanSureSesli } from '../../../core/utils/kalanSureParcalari';
import { useMetin } from '../../hooks/useMetin';

interface BirimliSureProps {
  /** AnaSayfa'nın "SS:DD:ss" sayacı. */
  sure: string;
  /** Rakam stili (boy, ağırlık, renk). */
  style?: StyleProp<TextStyle>;
  /** Birim rengi (genelde ikincil metin). */
  birimRengi: string;
  /** Birimin rakama oranı (varsayılan 0,42). */
  birimOrani?: number;
  /** Rakam boyu (birim boyu bundan türer). */
  rakamBoyu: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  testID?: string;
}

const BirimliSureBileseni: React.FC<BirimliSureProps> = ({
  sure,
  style,
  birimRengi,
  birimOrani = 0.42,
  rakamBoyu,
  adjustsFontSizeToFit,
  minimumFontScale,
  testID,
}) => {
  // Birimler etkin dilde: dil değişince `sure` beklemeden yeniden çizilsin (memo bileşen).
  useMetin();
  const parcalar = kalanSureParcalari(sure);
  const birimArasi = birimAyiraci();
  const parcaArasi = parcaAyiraci();
  const birimStili = { fontSize: Math.round(rakamBoyu * birimOrani), color: birimRengi, fontWeight: '600' as const };
  return (
    <Text
      testID={testID}
      style={[{ fontSize: rakamBoyu, fontVariant: ['tabular-nums'] }, style]}
      numberOfLines={1}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      accessibilityLabel={kalanSureSesli(sure)}
    >
      {parcalar.map((p, i) => (
        <React.Fragment key={`${p.birim}-${i}`}>
          {i > 0 ? parcaArasi : ''}
          {p.sayi}
          {p.birim ? <Text style={birimStili}>{`${birimArasi}${p.birim}`}</Text> : null}
        </React.Fragment>
      ))}
    </Text>
  );
};

export const BirimliSure = React.memo(BirimliSureBileseni);
