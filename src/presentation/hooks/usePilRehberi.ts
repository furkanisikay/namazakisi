/**
 * Pil rehberi akışı: rehberi göster → ayar ekranını aç → dönüşte doğrula.
 *
 * Dönüşte durum YENİDEN okunur; uygulama gerçekten "Kısıtlanmamış" olduysa kısa
 * bir onay gösterilir. Olmadıysa sessiz kalınır (kart zaten yerinde durur) —
 * kullanıcıyı azarlayan bir mesaj, yanlış bir başarı mesajından da kötüdür.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { pilAyarlariniAc } from '../../domain/services/SistemDurumuOkuyucu';
import type { SistemDurumu } from './useSistemDurumu';
import { metin } from '../../core/dil/aktifDil';

export function usePilRehberi(sistem: Pick<SistemDurumu, 'pil' | 'yenile'>) {
    const [gorunur, setGorunur] = useState(false);
    const donusBekleniyor = useRef(false);
    const { yenile } = sistem;
    const samsung = sistem.pil?.samsung ?? false;

    useEffect(() => {
        const abonelik = AppState.addEventListener('change', async (durum) => {
            if (durum !== 'active' || !donusBekleniyor.current) return;
            donusBekleniyor.current = false;
            const { pil } = await yenile();
            if (pil.muaf === true) {
                kisaBildirimGoster(
                    pil.samsung ? metin().ayarlar.pil.uyutulmayacak : metin().ayarlar.pil.kisitKalkti
                );
            }
        });
        return () => abonelik.remove();
    }, [yenile]);

    const ayarlariAc = useCallback(async () => {
        setGorunur(false);
        donusBekleniyor.current = true;
        const acilan = await pilAyarlariniAc();
        if (!acilan) {
            donusBekleniyor.current = false;
            kisaBildirimGoster(metin().ayarlar.pil.acilamadi, true);
        }
    }, []);

    return {
        rehberGorunur: gorunur,
        samsung,
        rehberiAc: useCallback(() => setGorunur(true), []),
        rehberiKapat: useCallback(() => setGorunur(false), []),
        ayarlariAc,
    };
}
