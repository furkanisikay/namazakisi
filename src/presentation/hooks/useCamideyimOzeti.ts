/**
 * Ayarlar ana sayfasındaki Camideyim / Namaz modu satırlarının özet metni.
 * Kaynak native'dir; ekran açılışında ve uygulamaya dönüşte okunur.
 * Köprü yoksa (iOS) `kullanilabilir` false → satırlar hiç çizilmez.
 */
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as kopru from '../../../modules/expo-cami-geofence/src';
import { camideyimAyarlariniNormalize } from '../../core/cami/camideyimAyarlari';

export interface CamideyimOzeti {
    kullanilabilir: boolean;
    cami: string;
    namazModu: string;
}

export function camideyimOzetiOlustur(
    ayarlarHam: unknown,
    durum: kopru.CamiNativeDurumu | null
): Pick<CamideyimOzeti, 'cami' | 'namazModu'> {
    const a = camideyimAyarlariniNormalize(ayarlarHam);
    const cami = !a.aktif
        ? 'Kapalı'
        : durum?.camide
          ? 'Şu an camidesiniz'
          : durum && durum.izin !== 'tamam'
            ? 'Konum izni gerekiyor'
            : `Camide ${a.beklemeDk} dk kalınca`;
    const m = durum?.namazModu;
    const namazModu = !m?.ayarlar?.etkin
        ? 'Kapalı'
        : !m.erisim
          ? 'Rahatsız Etmeyin erişimi gerekiyor'
          : m.aktif
            ? 'Şu an açık'
            : [m.ayarlar.cuma ? 'Cuma hutbesi' : null, m.ayarlar.vakit ? 'vakit girince' : null, a.aktif && a.namazModu ? 'camide' : null]
                  .filter(Boolean)
                  .join(', ') || 'Açık';
    return { cami, namazModu };
}

export function useCamideyimOzeti(): CamideyimOzeti {
    const kullanilabilir = kopru.camiModuluVarMi();
    const [ozet, setOzet] = useState({ cami: '', namazModu: '' });

    const yenile = useCallback(async () => {
        if (!kullanilabilir) return;
        const [ham, durum] = await Promise.all([kopru.ayarlariAl(), kopru.durumAl()]);
        setOzet(camideyimOzetiOlustur(ham, durum));
    }, [kullanilabilir]);

    useEffect(() => {
        yenile().catch(() => undefined);
        const abonelik = AppState.addEventListener('change', (s) => {
            if (s === 'active') yenile().catch(() => undefined);
        });
        return () => abonelik.remove();
    }, [yenile]);

    return { kullanilabilir, ...ozet };
}
