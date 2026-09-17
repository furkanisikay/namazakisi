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
 * iOS'TA SORU FARKLI KOPRUYE SORULUR (Faz 2). Android koprusu iOS'ta `false`
 * doner ("sorgulanamadi" anlaminda) ve bu deger uyari bandini YANLISLIKLA
 * yakardi. iOS'ta anons cihaz-ici `AVSpeechSynthesizer` ile uretilir; Turkce ses
 * yoksa klip URETILMEZ ve anons duyulmaz → soru anlamli, ama cevabi
 * `expo-muhafiz-anons` verir. Modul bu build'de yoksa (eski surum) soru
 * sorulmaz: `null` = bilinmiyor = uyari YOK.
 */
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { trDestekleniyorMu } from '../../../modules/expo-countdown-notification/src';
import { anonsModuluVarMi, trSesTanimlayici } from '../../../modules/expo-muhafiz-anons/src';

export function useTurkceTtsDestegi(): boolean | null {
    const [destekli, setDestekli] = useState<boolean | null>(null);

    useEffect(() => {
        let iptalEdildi = false;

        if (Platform.OS !== 'android') {
            // iOS: yalniz cihaz-ici anons modulu VARSA sor. Yoksa Android koprusu
            // `false` dondururdu ve bu YANLIS uyari olurdu.
            if (!anonsModuluVarMi()) return;
            trSesTanimlayici()
                .then((sesId) => {
                    if (!iptalEdildi) setDestekli(sesId !== null);
                })
                .catch(() => {
                    if (!iptalEdildi) setDestekli(null);
                });
            return () => {
                iptalEdildi = true;
            };
        }

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
