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
 *
 * iOS'TA SORU ANLAMSIZ → `null` (sorulmaz bile). Kopru Android disinda `false`
 * doner ("sorgulanamadi" anlaminda) ve bu deger uyari bandini YAKARDI: iOS'ta
 * sesli anons TTS ile degil on-kayitli ses klibiyle calisir, dolayisiyla
 * "cihazinizda Turkce dil paketi yok" uyarisi hem YANLIS olur hem de
 * kullanicinin yapabilecegi bir sey yoktur. Yukaridaki sozlesme aynen gecerli:
 * `null` = bilinmiyor = uyari YOK.
 */
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { trDestekleniyorMu } from '../../../modules/expo-countdown-notification/src';

export function useTurkceTtsDestegi(): boolean | null {
    const [destekli, setDestekli] = useState<boolean | null>(null);

    useEffect(() => {
        // Android disinda hic sorma: kopru `false` dondurur ve bu YANLIS uyari olur.
        if (Platform.OS !== 'android') return;

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
