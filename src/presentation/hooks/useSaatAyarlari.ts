/**
 * Saat (Wear OS) iş bölümü ayarı — ekran kancası (saat W3).
 *
 * Kaynak disktir (store'a yazılmaz): ayarı okuyan herkes arka plan planlayıcısıdır
 * (muhafız, nafile, saat yükü, bildirim defteri) ve Redux'u görmez. Değişince yeniden
 * planlama TEK yayma noktasından geçer (`saatAyarlariDegistiUygula`).
 *
 * Yeniden planlama servisi TEMBEL `require` ile yüklenir: konum yayma listesi native
 * köprüleri (TTS, notifee, task-manager) çeker; statik import, Ayarlar yığınını yükleyen
 * her ekran testine köprü mock'u zorunlu kılardı (konumSlice dersi).
 */
import { useCallback, useEffect, useState } from 'react';
import { LocalSaatAyarlariServisi } from '../../data/local/LocalSaatAyarlariServisi';
import type { SaatAyarlari } from '../../core/saat/saatAyarlari';
import { Logger } from '../../core/utils/Logger';

export function useSaatAyarlari(): {
    ayarlar: SaatAyarlari | null;
    guncelle: (degisim: Partial<SaatAyarlari>) => Promise<void>;
} {
    const [ayarlar, setAyarlar] = useState<SaatAyarlari | null>(null);

    useEffect(() => {
        let iptal = false;
        LocalSaatAyarlariServisi.oku().then((a) => {
            if (!iptal) setAyarlar(a);
        });
        return () => {
            iptal = true;
        };
    }, []);

    const guncelle = useCallback(async (degisim: Partial<SaatAyarlari>) => {
        const yeni = await LocalSaatAyarlariServisi.guncelle((mevcut) => ({ ...mevcut, ...degisim }));
        setAyarlar(yeni);
        try {
            const { saatAyarlariDegistiUygula } =
                require('../../domain/services/SaatAyarDegisikligiServisi') as typeof import('../../domain/services/SaatAyarDegisikligiServisi');
            await saatAyarlariDegistiUygula();
        } catch (e) {
            Logger.warn('useSaatAyarlari', 'Yeniden planlama baslatilamadi', e);
        }
    }, []);

    return { ayarlar, guncelle };
}
