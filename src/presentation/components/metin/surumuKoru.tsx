/**
 * Karışık satırda yalnız sürüm numarasını metin kapısından korur ("Kur'an 2:255 · …, QuranEnc 1.0.3"):
 * ayet numarası yerel rakamla çizilir, sürüm Batı rakamıyla kalır (duvar kâğıdı ve Hakkında ile aynı).
 * Sürümün tamamı ayrı bir satırsa `<Text rakamKoru>` yeter.
 */
import * as React from 'react';
import { Text } from 'react-native';

export function surumuKoru(metin: string, surum: string | null): React.ReactNode {
  if (!surum) return metin;
  const parcalar = metin.split(surum);
  if (parcalar.length === 1) return metin;
  return parcalar.flatMap((parca, i) =>
    i === 0
      ? [parca]
      : [
          <Text key={`surum-${i}`} rakamKoru>
            {surum}
          </Text>,
          parca,
        ],
  );
}
