/**
 * iPhone "Namazda sessiz" rehberinin işaretli adımları + süre (yalnız cihaz, yedeklenmez).
 * Yazım `Depolama.guncelle` ile atomik; okuma hatası varsayılanla devam eder.
 */
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import {
    IOS_SESSIZ_VARSAYILAN,
    iosSessizAdimiDegistir,
    iosSessizKurulumuNormalize,
    type IosSessizAdim,
    type IosSessizKurulum,
} from '../../core/sessiz/iosSessizKurulum';
import { sessizlikDakikasiniKenetle } from '../../core/siri/sessizlikKarari';

const ANAHTAR = DEPOLAMA_ANAHTARLARI.IOS_SESSIZ_KURULUM;

export function useIosSessizKurulum(): {
    kurulum: IosSessizKurulum;
    yuklendi: boolean;
    adimiDegistir: (adim: IosSessizAdim) => void;
    dakikaYaz: (dakika: number) => void;
} {
    const [kurulum, setKurulum] = useState<IosSessizKurulum>(IOS_SESSIZ_VARSAYILAN);
    const [yuklendi, setYuklendi] = useState(false);

    const yukle = useCallback(async () => {
        try {
            setKurulum(iosSessizKurulumuNormalize(await Depolama.oku<unknown>(ANAHTAR)));
        } catch {
            // varsayılanla devam
        } finally {
            setYuklendi(true);
        }
    }, []);

    useEffect(() => {
        yukle().catch(() => undefined);
        const abonelik = AppState.addEventListener('change', (s) => {
            if (s === 'active') yukle().catch(() => undefined);
        });
        return () => abonelik.remove();
    }, [yukle]);

    const yaz = useCallback((donustur: (k: IosSessizKurulum) => IosSessizKurulum) => {
        setKurulum((k) => donustur(k));
        Depolama.guncelle<unknown>(ANAHTAR, (m) => donustur(iosSessizKurulumuNormalize(m))).catch(() => undefined);
    }, []);

    const adimiDegistir = useCallback((adim: IosSessizAdim) => yaz((k) => iosSessizAdimiDegistir(k, adim)), [yaz]);
    const dakikaYaz = useCallback(
        (dakika: number) => yaz((k) => ({ ...k, dakika: sessizlikDakikasiniKenetle(dakika) })),
        [yaz]
    );

    return { kurulum, yuklendi, adimiDegistir, dakikaYaz };
}
