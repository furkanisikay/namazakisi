import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  seferilikAyarlariniGuncelle,
  seferilikIkametiAyarla,
  seferilikKartiniKapat,
  seferilikKonumIsle,
  seferilikYukle,
  type SeferilikState,
} from '../store/seferilikSlice';
import type { Mezhep } from '../../core/seferilik/seferilikAyarlari';

export interface SeferilikKontrolu {
  /** Dilim store'da yoksa (eski ekran test mock'ları) null → tüketici hiçbir şey çizmez. */
  durum: SeferilikState | null;
  kartiKapat: () => void;
  kartAcikAyarla: (acik: boolean) => void;
  mezhepAyarla: (mezhep: Mezhep) => void;
  /** Diskteki konumu yeniden işler (ana ekran: açılış + konum değişimi). */
  konumuIsle: () => void;
  /** "Burası evim": son işlenen (diskteki) konumu ikamet yapar. Konum yoksa false. */
  buradaIkametEt: () => Promise<boolean>;
}

/**
 * Seferîlik ayarının tek tüketici kapısı (issue #296): ayarı TEMBEL yükler
 * (ilk tüketici tetikler; `condition` ikinci okumayı atlar).
 */
export function useSeferilik(): SeferilikKontrolu {
  const dispatch = useAppDispatch();
  const durum = useAppSelector((s) => (s as { seferilik?: SeferilikState }).seferilik) ?? null;
  const yukluMu = durum ? durum.yuklendi || durum.yukleniyor : true;

  useEffect(() => {
    if (!yukluMu) dispatch(seferilikYukle());
  }, [dispatch, yukluMu]);

  const kartiKapat = useCallback(() => {
    dispatch(seferilikKartiniKapat());
  }, [dispatch]);
  const kartAcikAyarla = useCallback((acik: boolean) => {
    dispatch(seferilikAyarlariniGuncelle({ kartAcik: acik }));
  }, [dispatch]);
  const mezhepAyarla = useCallback((mezhep: Mezhep) => {
    dispatch(seferilikAyarlariniGuncelle({ mezhep }));
  }, [dispatch]);
  const konumuIsle = useCallback(() => {
    dispatch(seferilikKonumIsle());
  }, [dispatch]);
  const sonKonum = durum?.sonKonum ?? null;
  const sonKonumAdi = durum?.sonKonumAdi;
  const buradaIkametEt = useCallback(async () => {
    if (!sonKonum) return false;
    const sonuc = await dispatch(seferilikIkametiAyarla({ konum: sonKonum, ad: sonKonumAdi }));
    return seferilikIkametiAyarla.fulfilled.match(sonuc);
  }, [dispatch, sonKonum, sonKonumAdi]);

  return { durum, kartiKapat, kartAcikAyarla, mezhepAyarla, konumuIsle, buradaIkametEt };
}
