/**
 * Katlanabilir cihazın anlık postürü (issue #283 — masaüstü postürü).
 *
 * Native köprü (`modules/expo-katlanma-posturu`, Jetpack WindowManager) yalnız
 * Android'de vardır; iOS'ta, köprüsüz build'de ve katlanma olmayan cihazda daima
 * "düz" döner. Ham veri saf `posturuCoz` ile doğrulanır.
 *
 * Değer yalnız GERÇEKTEN değişince yeni referans üretir (`posturlerAyniMi`):
 * ana ekran saniyede bir çizilir, postür nesnesi her olayda yenilenseydi
 * düzen bileşeni gereksiz yere yeniden çizilirdi.
 */
import { useEffect, useState } from 'react';

import * as kopru from '../../../modules/expo-katlanma-posturu/src';
import { posturlerAyniMi, posturuCoz, type Postur } from '../../core/utils/katlanmaPosturu';

function ilkPostur(): Postur {
    return posturuCoz(kopru.sonPostur());
}

export function useKatlanmaPosturu(): Postur {
    const [postur, setPostur] = useState<Postur>(ilkPostur);

    useEffect(() => {
        const guncelle = (ham: unknown) => {
            const yeni = posturuCoz(ham);
            setPostur((onceki) => (posturlerAyniMi(onceki, yeni) ? onceki : yeni));
        };
        const abonelik = kopru.posturDinle(guncelle);
        // Abonelik izlemeyi başlatır; arada gelmiş bir değişimi kaçırmamak için
        // bilinen son değer bir kez daha okunur.
        guncelle(kopru.sonPostur());
        return () => abonelik.remove();
    }, []);

    return postur;
}
