/**
 * Ayar sayfasındaki önizlemenin ve iPhone'da elle kaydedilen görselin çizdiği ayar: "vakte uysun"
 * açıksa o anın göğü (kilit ekranında çizilenle aynı). Dakikada bir yenilenir.
 */
import { useEffect, useMemo, useState } from 'react';
import { anlikDuvarAyari, koordinatImsakKaynagi, koordinatVakitKaynagi, type DuvarKagidiAyari } from '../../../../core/icerik/gununAyetiYuku';
import { useAppSelector } from '../../../store/hooks';

export function useAnlikDuvarAyari(ayar: DuvarKagidiAyari | null): DuvarKagidiAyari | null {
  const koordinat = useAppSelector((state) => state.konum.koordinatlar);
  const lat = koordinat?.lat ?? 0;
  const lng = koordinat?.lng ?? 0;
  const [dakika, setDakika] = useState(() => Math.floor(Date.now() / 60000));
  const izle = !!ayar?.vakteUysun;
  useEffect(() => {
    if (!izle) return;
    const z = setInterval(() => setDakika(Math.floor(Date.now() / 60000)), 60000);
    return () => clearInterval(z);
  }, [izle]);
  return useMemo(() => {
    if (!ayar) return ayar;
    const k = lat === 0 && lng === 0 ? null : { lat, lng };
    return anlikDuvarAyari(ayar, new Date(dakika * 60000), koordinatImsakKaynagi(k), koordinatVakitKaynagi(k));
  }, [ayar, lat, lng, dakika]);
}
