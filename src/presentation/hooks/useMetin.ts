import { useAppSelector } from '../store/hooks';
import { sozluk } from '../../core/dil/aktifDil';
import { VARSAYILAN_DIL } from '../../core/dil/diller';
import type { Sozluk } from '../../core/dil/sozluk/tr';

/**
 * Ekranın metin sözlüğü: `const m = useMetin(); <Text>{m.kurulum.baslik}</Text>`.
 * Dil slice'ı değişince yeniden çizer. Store'da dil yoksa (ör. ekran testi) Türkçe.
 * Yer tutucu/çoğul için `bicim`/`sayili` (`core/dil/aktifDil`).
 */
export function useMetin(): Sozluk {
  const kod = useAppSelector((s) => s.dil?.kod) ?? VARSAYILAN_DIL;
  return sozluk(kod);
}
