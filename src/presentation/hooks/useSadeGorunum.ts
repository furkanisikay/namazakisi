import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  geciciCik,
  geciciCikisiBitir,
  sadeGorunumAyarlariniYukle,
  sadeGorunumuAyarla,
  type SadeGorunumState,
} from '../store/sadeGorunumSlice';

export interface SadeGorunumKontrolu {
  /** Disk okundu mu? (Okunmadan "kapalı" sanılmasın.) */
  yuklendi: boolean;
  /** Ayar açık mı (kalıcı)? */
  ayarAcik: boolean;
  /** Şu an sade görünüm GÖSTERİLMELİ mi? (ayar açık ve geçici çıkış yok) */
  etkin: boolean;
  /** Ayar açık ama kullanıcı bu oturum için tüm uygulamayı açtı. */
  geciciCikista: boolean;
  ayarla: (aktif: boolean) => void;
  tumUygulamayiAc: () => void;
  sadeyeDon: () => void;
}

/**
 * Sade görünümün tek tüketici kapısı (issue #295): ayarı TEMBEL yükler (ilk
 * tüketici tetikler; `condition` ikinci okumayı atlar) ve geçici çıkışta uygulama
 * arka plana gidince sade görünüme geri döndürür.
 *
 * State'i olmayan bir store'da (eski ekran test mock'ları) güvenle "kapalı +
 * yüklü" döner — ana ekran o durumda birebir eski hâlindedir.
 */
export function useSadeGorunum(): SadeGorunumKontrolu {
  const dispatch = useAppDispatch();
  // Eski ekran testlerinin mock state'inde dilim yoktur → `undefined` olabilir.
  const durum = useAppSelector((s) => s.sadeGorunum as SadeGorunumState | undefined);

  const yuklendi = durum ? durum.yuklendi : true;
  const yukleniyor = durum?.yukleniyor ?? false;
  const ayarAcik = !!durum?.ayarlar.aktif;
  const geciciCikis = !!durum?.geciciCikis;

  useEffect(() => {
    if (durum && !yuklendi && !yukleniyor) {
      dispatch(sadeGorunumAyarlariniYukle());
    }
  }, [dispatch, durum, yuklendi, yukleniyor]);

  // Geçici çıkıştayken uygulama arka plana giderse sade görünüme dön.
  useEffect(() => {
    if (!geciciCikis) return undefined;
    const abonelik = AppState.addEventListener('change', (yeni) => {
      if (yeni === 'background') dispatch(geciciCikisiBitir());
    });
    return () => abonelik.remove();
  }, [dispatch, geciciCikis]);

  const ayarla = useCallback((aktif: boolean) => {
    dispatch(sadeGorunumuAyarla(aktif));
  }, [dispatch]);
  const tumUygulamayiAc = useCallback(() => {
    dispatch(geciciCik());
  }, [dispatch]);
  const sadeyeDon = useCallback(() => {
    dispatch(geciciCikisiBitir());
  }, [dispatch]);

  return {
    yuklendi,
    ayarAcik,
    etkin: yuklendi && ayarAcik && !geciciCikis,
    geciciCikista: ayarAcik && geciciCikis,
    ayarla,
    tumUygulamayiAc,
    sadeyeDon,
  };
}
