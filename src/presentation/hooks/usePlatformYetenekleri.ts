/**
 * Ekranlarin platform yeteneklerine ULASTIGI TEK KAPI.
 *
 * Amaci `Platform.OS`'u BILESENLERDEN UZAK TUTMAK: hatirlatma bilesenleri
 * (`PencereKarti`, `AdimDetayModal`, `AdimNotlari`) "bir vakit" degil "bir
 * hatirlatma penceresi" cizer ve neyin duzenlenebilecegini yalnizca
 * `PencereTanimi`'ndan okur. Platform bilgisi tanima BURADAN girer; bilesenlere
 * `Platform.OS` sizarsa cuma/seri gibi ileride eklenecek yuzeyler yeniden
 * platform dallanmasi yazmak zorunda kalir.
 *
 * Motor ile ekran AYNI yetenek nesnesini kullanir (`core/muhafiz/ios/
 * platformYetenekleri`), dolayisiyla "ekranda gorunuyor ama calismiyor"
 * ayrismasi yapisal olarak imkansizdir.
 *
 * Faz 3'te AlarmKit izni buraya baglanacak (`sessizligiDelebilir`); o yuzden
 * hook sabit bir nesne degil, hesaplanmis bir deger dondurur.
 */
import { useMemo } from 'react';
import { Platform } from 'react-native';

import {
    yetenekleriSec,
    type PlatformYetenekleri,
} from '../../core/muhafiz/ios/platformYetenekleri';

export function usePlatformYetenekleri(): PlatformYetenekleri {
    return useMemo(
        () =>
            yetenekleriSec(
                Platform.OS === 'ios' ? 'ios' : 'android',
                // Faz 1/2: AlarmKit yok. Faz 3'te kopru izni buraya baglanir.
                false
            ),
        []
    );
}
