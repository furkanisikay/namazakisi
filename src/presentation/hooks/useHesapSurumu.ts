import { useAppSelector } from '../store/hooks';

/**
 * Etkin hesap yönteminin (profil, ikindi, dakika düzeltmeleri, açılar) kararlı imzası.
 *
 * Vakitleri koordinattan hesaplayan her `useMemo`/`useEffect` bunu bağımlılığa katar: yöntem
 * değişince konum değişmez, yalnız `lat,lng`'ye bağlı bir önbellek eski yöntemle kalır
 * (yaşanmış: JAKIM'e geçince ana ekrandaki kuşluk penceresi Diyanet saatinde kaldı).
 * `sorulanUlkeler` gibi vakti etkilemeyen alanlar imzaya girmez.
 */
export function useHesapSurumu(): string {
  const ayar = useAppSelector((s) => s.hesap?.ayar);
  if (!ayar) return 'diyanet';
  return JSON.stringify([ayar.profil, ayar.ikindi ?? null, ayar.ofsetler ?? null, ayar.aci ?? null]);
}
