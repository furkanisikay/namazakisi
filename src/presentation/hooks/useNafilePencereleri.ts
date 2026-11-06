import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { bugunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { aktifGunuHesapla } from '../../core/utils/gunNavigasyonYardimcisi';
import {
    gununNafilePencereleri,
    gunVakitleriniHesapla,
    koordinatGecerliMi,
} from '../../core/nafile/gunVakitleri';
import type { NafilePencere } from '../../core/nafile/nafileVakitleri';
import { useHesapSurumu } from './useHesapSurumu';

/**
 * AKTİF GÜNÜN nafile pencereleri (issue #77).
 *
 * Taban `new Date()`in takvim günü DEĞİL, aktif gündür: gece yarısından sonra
 * (imsak öncesi) aktif gün DÜNDÜR ve "bu gecenin teheccüdü" dünün yatsısı →
 * bugünün imsakıdır (AGENTS.md gece yarısı kuralları).
 *
 * @param aktifGunIso Verilirse (ana ekran zaten hesaplıyor) o gün kullanılır.
 */
export function useNafilePencereleri(aktifGunIso?: string): {
    aktifGun: string;
    pencereler: NafilePencere[];
} {
    const koordinatlar = useAppSelector((s) => s.konum.koordinatlar);
    const lat = koordinatlar?.lat;
    const lng = koordinatlar?.lng;
    const hesapSurumu = useHesapSurumu();

    return useMemo(() => {
        const k = lat !== undefined && lng !== undefined ? { lat, lng } : null;
        const bugun = bugunuAl();
        if (!koordinatGecerliMi(k)) return { aktifGun: aktifGunIso ?? bugun, pencereler: [] };

        const aktifGun =
            aktifGunIso ??
            aktifGunuHesapla(bugun, new Date(), gunVakitleriniHesapla(k, bugun).imsak, gunEkle(bugun, -1));
        try {
            return { aktifGun, pencereler: gununNafilePencereleri(k, aktifGun) };
        } catch {
            return { aktifGun, pencereler: [] };
        }
        // hesapSurumu: yöntem değişince pencereler yeniden hesaplanır (değer kapanışta okunmaz).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lat, lng, aktifGunIso, hesapSurumu]);
}
