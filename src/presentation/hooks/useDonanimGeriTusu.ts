import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Android donanim geri tusunu guvenilir sekilde yakalar.
 *
 * Neden gerekli: New Architecture (Fabric) altinda RN <Modal> bileseninin
 * `onRequestClose` callback'i Android donanim geri tusunda guvenilir
 * tetiklenmiyor. Acik modal/overlay'lerde geri tusuyla kapatma davranisini
 * garanti altina almak icin BackHandler dinleyicisi kullaniyoruz.
 *
 * @param aktif   Dinleyici aktif mi (ornegin modal gorunur oldugunda true).
 * @param handler Geri tusuna basildiginda calisir. `false` donerse olay
 *                tuketilmez ve normal davranis (navigasyon/cikis) devam eder;
 *                aksi halde (true/undefined) olay tuketilir.
 */
export function useDonanimGeriTusu(
    aktif: boolean,
    handler: () => boolean | void
): void {
    useEffect(() => {
        if (!aktif) return;

        const abone = BackHandler.addEventListener('hardwareBackPress', () => {
            const sonuc = handler();
            // undefined veya true => olayi tuket (modal kapanir, ekran degismez)
            return sonuc !== false;
        });

        return () => abone.remove();
    }, [aktif, handler]);
}
