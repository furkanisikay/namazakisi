/**
 * Bugünün (namaz günü) ayeti, widget ve duvar kâğıdıyla aynı seçimden (`aktifNamazGunu` +
 * `gununAyetiKaydi`); konum yoksa gün sınırı 05:00.
 */
import { useMemo } from 'react';
import { aktifNamazGunu, gununAyetiGorunumu, gununAyetiKaydi, isoGun, type GununAyetiGorunumu } from '../../../../core/icerik/gununAyeti';
import { koordinatImsakKaynagi } from '../../../../core/icerik/gununAyetiYuku';
import { useAppSelector } from '../../../store/hooks';
import { useAktifDil, useMetin } from '../../../hooks/useMetin';

export function useBugununAyeti(): GununAyetiGorunumu {
  const sozlukler = useMetin();
  const dil = useAktifDil();
  const koordinat = useAppSelector((state) => state.konum.koordinatlar);
  const lat = koordinat?.lat ?? 0;
  const lng = koordinat?.lng ?? 0;
  return useMemo(() => {
    const gun = aktifNamazGunu(new Date(), koordinatImsakKaynagi(lat === 0 && lng === 0 ? null : { lat, lng }));
    return gununAyetiGorunumu(gununAyetiKaydi(isoGun(gun), dil), dil);
    // `sozlukler`: alfabe (Latin/Kiril) değişince meal yeniden çevrilir; dil aynı kalır, sözlük referansı değişir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, dil, sozlukler]);
}
