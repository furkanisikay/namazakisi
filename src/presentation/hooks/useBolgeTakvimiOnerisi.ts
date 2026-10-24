/**
 * "Bölgenizin takvimine geçelim mi?" — ülke değişince BİR KEZ sorulan öneri.
 *
 * Ülke: konum kaydından (elle seçim, GPS ters kodlaması) ya da GPS koordinatından
 * çevrimdışı tespit (`core/konum/ulkeTespiti`). Karar saf `bolgeOnerisi`'nde: yöntem asla
 * sessizce değişmez, aynı ülke için ikinci kez sorulmaz. Hesap ayarı yüklenmeden karar
 * verilmez (initialState Diyanet'i gerçek veri sanmamak için).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hesapAyariniKaydet } from '../store/hesapSlice';
import { bolgeOnerisi, type UlkeVarsayilani } from '../../core/vakit/ulkeProfilleri';
import { kayitliUlkeKodu, koordinatinUlkesi } from '../../core/konum/ulkeTespiti';

export interface BolgeTakvimiOnerisi {
  ulke: string;
  oneri: UlkeVarsayilani;
  kabul: () => void;
  reddet: () => void;
}

export function useBolgeTakvimiOnerisi(): BolgeTakvimiOnerisi | null {
  const dispatch = useAppDispatch();
  const hesap = useAppSelector((s) => s.hesap);
  const konum = useAppSelector((s) => s.konum);
  const [tespitEdilen, setTespitEdilen] = useState<string | null>(null);

  const kayitli = kayitliUlkeKodu(konum);
  const lat = konum.koordinatlar?.lat;
  const lng = konum.koordinatlar?.lng;

  // GPS'te ülke kayıtta yoksa koordinattan bul (yaklaşık 11 km'lik ızgarada bir kez).
  const izgara = typeof lat === 'number' && typeof lng === 'number' ? `${lat.toFixed(1)},${lng.toFixed(1)}` : '';
  useEffect(() => {
    if (kayitli || !izgara || typeof lat !== 'number' || typeof lng !== 'number') {
      setTespitEdilen(null);
      return;
    }
    let iptal = false;
    // Tembel require: varlık okuyucusu expo-asset/expo-file-system yükler (native modül yoksa,
    // ör. jest, yükleme atlanır ve yalnız Türkiye ilçe tablosuyla karar verilir).
    let veriAl: () => Promise<import('../../core/konum/dunyaSehirleri').DunyaSehirVerisi | null>;
    try {
      veriAl = (require('../../data/local/dunyaSehirVerisi') as typeof import('../../data/local/dunyaSehirVerisi')).dunyaSehirVerisiniAl;
    } catch {
      veriAl = async () => null;
    }
    void veriAl().then((veri) => {
      if (!iptal) setTespitEdilen(koordinatinUlkesi(lat, lng, veri));
    });
    return () => {
      iptal = true;
    };
    // lat/lng yalnız ızgara değişince okunur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kayitli, izgara]);

  const ulke = kayitli ?? tespitEdilen;
  const ayar = hesap?.ayar;
  const oneri = useMemo(
    () => (hesap?.yuklendi && ayar ? bolgeOnerisi(ulke, ayar) : null),
    [hesap?.yuklendi, ayar, ulke],
  );

  const kabul = useCallback(() => {
    if (!ayar || !ulke || !oneri) return;
    void dispatch(
      hesapAyariniKaydet({
        ...ayar,
        profil: oneri.profil,
        ikindi: oneri.ikindi,
        ofsetler: undefined,
        aci: undefined,
        sorulanUlkeler: [...(ayar.sorulanUlkeler ?? []), ulke],
      }),
    );
  }, [dispatch, ayar, ulke, oneri]);

  const reddet = useCallback(() => {
    if (!ayar || !ulke) return;
    void dispatch(hesapAyariniKaydet({ ...ayar, sorulanUlkeler: [...(ayar.sorulanUlkeler ?? []), ulke] }));
  }, [dispatch, ayar, ulke]);

  if (!oneri || !ulke) return null;
  return { ulke, oneri, kabul, reddet };
}
