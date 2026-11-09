/**
 * Kayıtlı duvar fotoğrafının adresi ve boyutu (kırpma için). Dosya okunamazsa `null`
 * (sahne gece zeminine düşer, native ile aynı).
 */
import * as React from 'react';
import { Image } from 'react-native';
import type { FotoKaynagi } from './DuvarSahnesi';
import { fotoAdresi } from './duvarFotografi';

export interface FotoKaynagiDurumu {
  kaynak: FotoKaynagi | null;
  /** Dosya var ama okunamadı (silinmiş, başka cihazdan gelmiş). Okuma sürerken `false`. */
  okunamadi: boolean;
}

export function useFotoKaynagiDurumu(dosya: string | null, bilinen?: FotoKaynagi | null): FotoKaynagiDurumu {
  const [durum, setDurum] = React.useState<FotoKaynagiDurumu>({ kaynak: bilinen ?? null, okunamadi: false });
  React.useEffect(() => {
    if (!dosya) {
      setDurum({ kaynak: null, okunamadi: false });
      return;
    }
    const uri = fotoAdresi(dosya);
    if (!uri) {
      setDurum({ kaynak: null, okunamadi: true });
      return;
    }
    if (bilinen && bilinen.uri === uri) {
      setDurum({ kaynak: bilinen, okunamadi: false });
      return;
    }
    let iptal = false;
    Image.getSize(
      uri,
      (genislik, yukseklik) => {
        if (!iptal) setDurum({ kaynak: { uri, genislik, yukseklik }, okunamadi: false });
      },
      () => {
        if (!iptal) setDurum({ kaynak: null, okunamadi: true });
      }
    );
    return () => {
      iptal = true;
    };
  }, [dosya, bilinen]);
  return durum;
}

export function useFotoKaynagi(dosya: string | null, bilinen?: FotoKaynagi | null): FotoKaynagi | null {
  return useFotoKaynagiDurumu(dosya, bilinen).kaynak;
}
