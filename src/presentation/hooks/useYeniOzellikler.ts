import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    ozellikGorulduIsaretle,
    ozellikKartiKapat,
} from '../store/ozelliklerSlice';
import { YENI_OZELLIKLER, type YeniOzellik } from '../../core/constants/YeniOzellikler';
import { yeniOzellikGorunurMu } from './yeniOzellikYetenegi';
import { gorulmeAnahtari, ozellikKayittaMi } from '../../core/utils/yeniOzellikGorulme';

/** Kimlik(ler)i katalogdaki öğenin BUGÜNKÜ sürümlü görülme anahtarına çevirir. */
function anahtarlaraCevir(id: string | string[]): string[] {
    const idler = Array.isArray(id) ? id : [id];
    return idler.map((i) => {
        const ozellik = YENI_OZELLIKLER.find((o) => o.id === i);
        return ozellik ? gorulmeAnahtari(ozellik) : i;
    });
}

/**
 * Yeni özellik duyurularının ortak erişim noktası.
 * Rozet, tanıtım kartı ve "Neler Yeni" sayfası bu hook'tan beslenir.
 * Görülme/kapatma sürümlü anahtarla tutulur (`core/utils/yeniOzellikGorulme.ts`):
 * `surum`'u yükseltilen duyuru yeniden okunmamış olur.
 */
export function useYeniOzellikler() {
    const dispatch = useAppDispatch();
    const { gorulenIdler, kapatilanKartIdler } = useAppSelector(s => s.ozellikler);

    const okunmamis = useMemo(
        () => YENI_OZELLIKLER.filter(o => yeniOzellikGorunurMu(o) && !ozellikKayittaMi(o, gorulenIdler)),
        [gorulenIdler]
    );

    // Ayarlar üstünde gösterilecek tek tanıtım kartı (en güncel, kapatılmamış)
    const kart = useMemo<YeniOzellik | null>(
        () => okunmamis.find(o => o.kartGoster && !ozellikKayittaMi(o, kapatilanKartIdler)) ?? null,
        [okunmamis, kapatilanKartIdler]
    );

    const sayfaOkunmamisMi = useCallback(
        (sayfa: string) => okunmamis.some(o => o.hedefSayfa === sayfa),
        [okunmamis]
    );

    const isaretle = useCallback(
        (id: string | string[]) => { dispatch(ozellikGorulduIsaretle(anahtarlaraCevir(id))); },
        [dispatch]
    );

    const sayfayiGorulduIsaretle = useCallback(
        (sayfa: string) => {
            const idler = okunmamis.filter(o => o.hedefSayfa === sayfa).map(gorulmeAnahtari);
            if (idler.length > 0) dispatch(ozellikGorulduIsaretle(idler));
        },
        [dispatch, okunmamis]
    );

    const kartiKapat = useCallback(
        (id: string) => { dispatch(ozellikKartiKapat(anahtarlaraCevir(id)[0])); },
        [dispatch]
    );

    return {
        okunmamis,
        okunmamisVarMi: okunmamis.length > 0,
        kart,
        sayfaOkunmamisMi,
        isaretle,
        sayfayiGorulduIsaretle,
        kartiKapat,
    };
}
