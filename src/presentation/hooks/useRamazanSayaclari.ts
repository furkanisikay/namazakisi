/**
 * İftar / sahur sayacı anahtarları — Ramazan sayfası ve Hatırlatmalar sayfası (Dalga 3)
 * AYNI yoldan yazar: ayar thunk'ı + sayaç servisinin hemen yeniden planlanması.
 * Slice'lar açılışta yüklenir (`App.tsx`); yine de ekran açılınca tazelenir.
 */
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { iftarSayacAyariniGuncelle, iftarSayacAyarlariniYukle } from '../store/iftarSayacSlice';
import { sahurSayacAyariniGuncelle, sahurSayacAyarlariniYukle } from '../store/sahurSayacSlice';
import { IftarSayacBildirimServisi } from '../../domain/services/IftarSayacBildirimServisi';
import { SahurSayacBildirimServisi } from '../../domain/services/SahurSayacBildirimServisi';

type Kaynak = {
    iftarSayac?: { ayarlar?: { aktif?: boolean } };
    sahurSayac?: { ayarlar?: { aktif?: boolean } };
    konum?: { koordinatlar?: { lat: number; lng: number } };
};

export interface RamazanSayaclari {
    iftar: boolean;
    sahur: boolean;
    iftarDegistir: (aktif: boolean) => Promise<void>;
    sahurDegistir: (aktif: boolean) => Promise<void>;
}

export function useRamazanSayaclari(): RamazanSayaclari {
    const dispatch = useAppDispatch();
    const iftar = useAppSelector((s) => (s as unknown as Kaynak).iftarSayac?.ayarlar?.aktif === true);
    const sahur = useAppSelector((s) => (s as unknown as Kaynak).sahurSayac?.ayarlar?.aktif === true);
    const koordinatlar = useAppSelector((s) => (s as unknown as Kaynak).konum?.koordinatlar);

    useEffect(() => {
        dispatch(iftarSayacAyarlariniYukle());
        dispatch(sahurSayacAyarlariniYukle());
    }, [dispatch]);

    const iftarDegistir = useCallback(
        async (aktif: boolean) => {
            await dispatch(iftarSayacAyariniGuncelle({ aktif }));
            if (koordinatlar) {
                await IftarSayacBildirimServisi.getInstance().yapilandirVePlanla({ aktif, koordinatlar });
            }
        },
        [dispatch, koordinatlar]
    );

    const sahurDegistir = useCallback(
        async (aktif: boolean) => {
            await dispatch(sahurSayacAyariniGuncelle({ aktif }));
            if (koordinatlar) {
                await SahurSayacBildirimServisi.getInstance().yapilandirVePlanla({ aktif, koordinatlar });
            }
        },
        [dispatch, koordinatlar]
    );

    return { iftar, sahur, iftarDegistir, sahurDegistir };
}
