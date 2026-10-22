/**
 * Cihazlar arası eşitleme (issue #288) — ekran kancası + ön plan uygulayıcısı.
 *
 * Ön planda gelen veri İKİNCİ BİR YOLDAN DEĞİL, yedekten geri yüklemenin AYNI
 * thunk'ından (`iceAktarmayiUygula`, akıllı strateji) geçer: disk + store tazeleme +
 * reconcile + hatırlatmaların yeniden kurulması orada zaten sıralı yapılıyor.
 *
 * Domain servisi TEMBEL yüklenir (`require`): zincir expo-crypto/secure-store
 * köprülerini çeker; kancayı yükleyen ekran testleri köprü mock'lamak zorunda kalmasın.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { YedekPayload } from '../../core/types';
import {
  EsitlemeDurumu,
  EsitlemeHataKodu,
  SaglayiciKimligi,
  VARSAYILAN_ESITLEME_DURUMU,
} from '../../core/esitleme/esitlemeTipleri';
import {
  BeklemeNedeni,
  EsitlemeTercihleri,
  EsitlemeTetigi,
  VARSAYILAN_ESITLEME_TERCIHLERI,
} from '../../core/esitleme/esitlemePolitikasi';
import { kullanilabilirSaglayicilar } from '../../domain/services/esitlemeSaglayicilari';
import { AKILLI_SECIMLER } from '../../domain/services/YedekBirlestirmeServisi';
import type { EsitlemeSonucu, KurulumModu } from '../../domain/services/EsitlemeServisi';
import { iceAktarmayiUygula } from '../store/yedeklemeSlice';
import { useAppDispatch } from '../store/hooks';
import type { AppDispatch } from '../store/store';

type EsitlemeServisiTipi = typeof import('../../domain/services/EsitlemeServisi')['EsitlemeServisi'];

const servis = (): EsitlemeServisiTipi =>
  (require('../../domain/services/EsitlemeServisi') as typeof import('../../domain/services/EsitlemeServisi'))
    .EsitlemeServisi;

/** Ön plan uygulayıcısı: gelen veriyi içe aktarma thunk'ıyla akıllı birleştirir. */
export const onPlanUygulayicisi =
  (dispatch: AppDispatch) =>
  async (gelen: YedekPayload): Promise<void> => {
    await dispatch(iceAktarmayiUygula({ payload: gelen, secimler: { ...AKILLI_SECIMLER } })).unwrap();
  };

/** Ön planda bir eşitleme turu (açılış / öne geliş / "Şimdi eşitle"). Fırlatmaz. */
export async function onPlandaEsitle(dispatch: AppDispatch): Promise<EsitlemeSonucu> {
  try {
    return await servis().esitle({ uygula: onPlanUygulayicisi(dispatch), turetebilir: true });
  } catch {
    return { tur: 'hata', kod: 'bilinmiyor' };
  }
}

/**
 * Ön planda OTOMATİK tur (açılış / öne geliş / yerel değişiklik / koşul değişimi):
 * tercih ve sistem koşulları kapısından geçer. Fırlatmaz.
 */
export async function onPlandaOtomatikEsitle(dispatch: AppDispatch, tetik: EsitlemeTetigi): Promise<EsitlemeSonucu> {
  try {
    return await servis().otomatikEsitle(tetik, { uygula: onPlanUygulayicisi(dispatch), turetebilir: true });
  } catch {
    return { tur: 'hata', kod: 'bilinmiyor' };
  }
}

/** Otomatik turun beklediği koşulun kısa açıklaması (tek kaynak). */
export function esitlemeBeklemeMetni(neden: BeklemeNedeni): string {
  switch (neden) {
    case 'wifi':
      return 'Otomatik eşitleme Wi-Fi bağlantısını bekliyor.';
    case 'sarj':
      return 'Otomatik eşitleme şarja takılmayı bekliyor.';
    case 'gucTasarrufu':
      return 'Güç tasarrufu açık; otomatik eşitleme şarja takılınca ya da mod kapanınca yapılır.';
    case 'veriTasarrufu':
      return 'Veri tasarrufu açık; eşitleme uygulamayı açtığınızda yapılır.';
    case 'agYok':
      return 'İnternet bağlantısı yok; bağlantı gelince eşitlenir.';
    case 'elle':
      return 'Otomatik eşitleme kapalı; "Şimdi eşitleyin" ile eşitleyebilirsiniz.';
    default:
      return 'Sıradaki otomatik eşitleme zamanı bekleniyor.';
  }
}

/** Hata kodunun kullanıcıya görünen kibar açıklaması (tek kaynak). */
export function esitlemeHataMetni(kod: EsitlemeHataKodu): string {
  switch (kod) {
    case 'agYok':
      return 'İnternet bağlantısı olmadığı için eşitlenemedi. Bağlantı gelince kendiliğinden yeniden denenir.';
    case 'yetkiYok':
      return 'Hesap bağlantınız sona ermiş. Yeniden bağlanarak eşitlemeyi sürdürebilirsiniz.';
    case 'yapilandirilmamis':
      return 'Bu eşitleme hizmeti bu sürümde kullanılamıyor.';
    case 'parolaGerekli':
    case 'parolaYanlis':
      return 'Eşitleme parolanız başka bir cihazda değiştirilmiş görünüyor. Yeni parolayı girerek sürdürebilirsiniz.';
    case 'bozukVeri':
      return 'Buluttaki eşitleme kaydı okunamadı. Verilerinizi korumak için üzerine yazılmadı.';
    case 'surumYeni':
      return 'Buluttaki kayıt uygulamanın daha yeni bir sürümüyle oluşturulmuş. Uygulamayı güncelleyin.';
    case 'boyutAsimi':
      return 'Bulut alanınızda yer kalmadı ya da kayıt hizmetin sınırını aşıyor.';
    default:
      return 'Eşitleme sırasında beklenmeyen bir sorun oluştu. Daha sonra yeniden deneyin.';
  }
}

export interface EsitlemeKancasi {
  durum: EsitlemeDurumu;
  yuklendi: boolean;
  /** Bu build'de kullanılabilen sağlayıcılar (boşsa eşitleme hiç gösterilmez). */
  saglayicilar: { kimlik: SaglayiciKimligi; ad: string }[];
  mesgul: boolean;
  /** Otomatik eşitleme tercihleri (cihaza özgü). */
  tercihler: EsitlemeTercihleri;
  tercihleriDegistir: (yeni: Partial<EsitlemeTercihleri>) => Promise<void>;
  yenile: () => Promise<void>;
  esitle: () => Promise<EsitlemeSonucu>;
  baglan: (kimlik: SaglayiciKimligi, zorla?: boolean) => ReturnType<EsitlemeServisiTipi['baglan']>;
  uzakDurumu: (kimlik: SaglayiciKimligi) => ReturnType<EsitlemeServisiTipi['uzakDurumu']>;
  kur: (kimlik: SaglayiciKimligi, parola: string, mod: KurulumModu) => Promise<EsitlemeSonucu>;
  kapat: (uzaktakiniSil: boolean) => ReturnType<EsitlemeServisiTipi['kapat']>;
}

export function useEsitleme(): EsitlemeKancasi {
  const dispatch = useAppDispatch();
  const [durum, setDurum] = useState<EsitlemeDurumu>(VARSAYILAN_ESITLEME_DURUMU);
  const [yuklendi, setYuklendi] = useState(false);
  const [mesgul, setMesgul] = useState(false);
  const [tercihler, setTercihler] = useState<EsitlemeTercihleri>(VARSAYILAN_ESITLEME_TERCIHLERI);
  const bagli = useRef(true);

  const saglayicilar = useMemo(
    () => kullanilabilirSaglayicilar().map((s) => ({ kimlik: s.kimlik, ad: s.ad })),
    []
  );

  const yenile = useCallback(async () => {
    try {
      const [yeni, t] = await Promise.all([servis().durumuOku(), servis().tercihleriOku()]);
      if (bagli.current) {
        setDurum(yeni);
        setTercihler(t);
      }
    } catch {
      // Durum okunamazsa varsayılan (kapalı) gösterilir.
    } finally {
      if (bagli.current) setYuklendi(true);
    }
  }, []);

  useEffect(() => {
    bagli.current = true;
    yenile();
    return () => {
      bagli.current = false;
    };
  }, [yenile]);

  /** Meşgul göstergesiyle sarmalar ve sonunda durumu tazeler. */
  const sarmala = useCallback(
    async <T,>(is: () => Promise<T>): Promise<T> => {
      setMesgul(true);
      try {
        return await is();
      } finally {
        await yenile();
        if (bagli.current) setMesgul(false);
      }
    },
    [yenile]
  );

  const esitle = useCallback(() => sarmala(() => onPlandaEsitle(dispatch)), [sarmala, dispatch]);
  const baglan = useCallback(
    (kimlik: SaglayiciKimligi, zorla?: boolean) => sarmala(() => servis().baglan(kimlik, zorla)),
    [sarmala]
  );
  const uzakDurumu = useCallback(
    (kimlik: SaglayiciKimligi) => sarmala(() => servis().uzakDurumu(kimlik)),
    [sarmala]
  );
  const kur = useCallback(
    (kimlik: SaglayiciKimligi, parola: string, mod: KurulumModu) =>
      sarmala(() => servis().kur({ kimlik, parola, mod, uygula: onPlanUygulayicisi(dispatch) })),
    [sarmala, dispatch]
  );
  const kapat = useCallback(
    (uzaktakiniSil: boolean) => sarmala(() => servis().kapat({ uzaktakiniSil })),
    [sarmala]
  );

  const tercihleriDegistir = useCallback(
    async (yeni: Partial<EsitlemeTercihleri>) => {
      // İyimser: anahtar hemen dönsün; yazılan değer diskten doğrulanır.
      setTercihler((onceki) => ({ ...onceki, ...yeni }));
      try {
        const yazilan = await servis().tercihleriYaz(yeni);
        if (bagli.current) setTercihler(yazilan);
      } finally {
        await yenile();
      }
    },
    [yenile]
  );

  return {
    durum,
    yuklendi,
    saglayicilar,
    mesgul,
    tercihler,
    tercihleriDegistir,
    yenile,
    esitle,
    baglan,
    uzakDurumu,
    kur,
    kapat,
  };
}
