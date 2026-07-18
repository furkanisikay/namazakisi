/**
 * Cihazda Turkce TTS (metin okuma) paketi var mi?
 *
 * Faz 5: sesli anons modlari gercekten calisiyor, ama TTS motorunda `tr-TR` dil
 * verisi kurulu degilse anons SESSIZ kalabilir. Kullaniciyi ENGELLEMEYIZ (mod
 * yine secilebilir, ayarlar kaydedilir) — yalniz bilgilendirme bandi gosteririz.
 *
 * Donus:
 *   `null`  → henuz bilinmiyor / sorgulanamadi → uyari GOSTERME (yanlis alarm yok)
 *   `true`  → paket var
 *   `false` → paket yok → kibar uyari goster
 *
 * `trDestekleniyorMu` kopruye gore asla firlatmaz; yine de savunmaci `catch`
 * birakilir (native modul hic yuklenmemis olabilir).
 */
import { useEffect, useState } from 'react';
import { trDestekleniyorMu } from '../../../modules/expo-countdown-notification/src';

export function useTurkceTtsDestegi(): boolean | null {
    const [destekli, setDestekli] = useState<boolean | null>(null);

    useEffect(() => {
        let iptalEdildi = false;

        trDestekleniyorMu()
            .then((sonuc) => {
                if (!iptalEdildi) setDestekli(sonuc);
            })
            .catch(() => {
                // Sorgulanamadi → "bilinmiyor" olarak birak; uyari gosterme.
                if (!iptalEdildi) setDestekli(null);
            });

        return () => {
            iptalEdildi = true;
        };
    }, []);

    return destekli;
}
