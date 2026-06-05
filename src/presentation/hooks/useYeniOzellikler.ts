import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    ozellikGorulduIsaretle,
    ozellikKartiKapat,
} from '../store/ozelliklerSlice';
import { YENI_OZELLIKLER, type YeniOzellik } from '../../core/constants/YeniOzellikler';

/**
 * Yeni özellik duyurularının ortak erişim noktası.
 * Rozet, tanıtım kartı ve "Neler Yeni" sayfası bu hook'tan beslenir.
 */
export function useYeniOzellikler() {
    const dispatch = useAppDispatch();
    const { gorulenIdler, kapatilanKartIdler } = useAppSelector(s => s.ozellikler);

    const okunmamis = useMemo(
        () => YENI_OZELLIKLER.filter(o => !gorulenIdler.includes(o.id)),
        [gorulenIdler]
    );

    // Ayarlar üstünde gösterilecek tek tanıtım kartı (en güncel, kapatılmamış)
    const kart = useMemo<YeniOzellik | null>(
        () => okunmamis.find(o => o.kartGoster && !kapatilanKartIdler.includes(o.id)) ?? null,
        [okunmamis, kapatilanKartIdler]
    );

    const sayfaOkunmamisMi = useCallback(
        (sayfa: string) => okunmamis.some(o => o.hedefSayfa === sayfa),
        [okunmamis]
    );

    const isaretle = useCallback(
        (id: string | string[]) => { dispatch(ozellikGorulduIsaretle(id)); },
        [dispatch]
    );

    const sayfayiGorulduIsaretle = useCallback(
        (sayfa: string) => {
            const idler = okunmamis.filter(o => o.hedefSayfa === sayfa).map(o => o.id);
            if (idler.length > 0) dispatch(ozellikGorulduIsaretle(idler));
        },
        [dispatch, okunmamis]
    );

    const kartiKapat = useCallback(
        (id: string) => { dispatch(ozellikKartiKapat(id)); },
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
