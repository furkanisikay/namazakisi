/**
 * Kayıtlı duvar fotoğrafının adresi ve boyutu (kırpma için). Dosya okunamazsa `null`
 * (sahne gece zeminine düşer, native ile aynı).
 */
import * as React from 'react';
import { Image } from 'react-native';
import type { FotoKaynagi } from './DuvarSahnesi';
import { fotoAdresi } from './duvarFotografi';

export function useFotoKaynagi(dosya: string | null, bilinen?: FotoKaynagi | null): FotoKaynagi | null {
  const [kaynak, setKaynak] = React.useState<FotoKaynagi | null>(bilinen ?? null);
  React.useEffect(() => {
    if (!dosya) {
      setKaynak(null);
      return;
    }
    const uri = fotoAdresi(dosya);
    if (!uri) {
      setKaynak(null);
      return;
    }
    if (bilinen && bilinen.uri === uri) {
      setKaynak(bilinen);
      return;
    }
    let iptal = false;
    Image.getSize(
      uri,
      (genislik, yukseklik) => {
        if (!iptal) setKaynak({ uri, genislik, yukseklik });
      },
      () => {
        if (!iptal) setKaynak(null);
      }
    );
    return () => {
      iptal = true;
    };
  }, [dosya, bilinen]);
  return kaynak;
}
