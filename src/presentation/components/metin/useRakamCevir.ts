/**
 * Metin kapısının (`MetinKapisi`) görmediği yüzeyler için rakam çevirici: SVG `Text`,
 * `Animated.Text`, `TextInput` değeri. Etkin dil yerel rakamlıysa (Arapça, Bengalce, Farsça, Peştuca, Soranî, Sindhçe, Marathi, Pencapça,
 * Assamca, Nepalce) ve yerel rakam seçiliyse Batı rakamlarını o dilin rakamına (٠١٢… / ০১২… / १२३…) çevirir; dil ya da rakam seçimi değişince yeniden çizdirir.
 * Kapıdan ayrı dosyadadır: kapı yazı tipi yükleyicisini (expo-font) taşır, bu hook taşımaz.
 */
import { useCallback, useSyncExternalStore } from 'react';
import { aktifDil, aktifRakamSistemi, dilDegisiminiDinle } from '../../../core/dil/aktifDil';
import { rakamlariCevir, rakamSecilebilir, type RakamSistemi } from '../../../core/dil/rakam';

const etkinSistem = (): RakamSistemi => (rakamSecilebilir(aktifDil()) ? aktifRakamSistemi() : 'latn');

export function useRakamCevir(): (deger: string | number) => string {
  const sistem = useSyncExternalStore(dilDegisiminiDinle, etkinSistem);
  return useCallback((deger: string | number) => rakamlariCevir(String(deger), sistem), [sistem]);
}
