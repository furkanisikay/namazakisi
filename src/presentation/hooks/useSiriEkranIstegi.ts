/**
 * Siri / Kısayollar "Kıbleyi aç" (issue #279) — iOS.
 *
 * Intent uygulamayı öne getirir ve bir EKRAN İSTEĞİ bırakır (`SiriDeposu`); gezinme
 * burada, gezinme kabı HAZIR olunca yapılır. Doğrudan `namazakisi://kible` açmak
 * soğuk açılışta işe yaramazdı: JS henüz yüklenmemişken gelen bağlantı olayının
 * dinleyicisi yoktur ve kaybolur.
 *
 * İsteği üç an tüketir: gezinme kabı hazır olduğunda (`onReady`), intent uygulama
 * açıkken çalıştığında (olay) ve uygulama öne geldiğinde. İstek bir kez tüketilir,
 * bayat istek (2 dk) native tarafta yok sayılır. Kurulum sihirbazı sürerken tüketilmez.
 */
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import {
    siriDegisikliginiDinle,
    siriEkranIstegiAl,
} from '../../../modules/expo-siri-kisayollari/src';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Logger } from '../../core/utils/Logger';

/** Intent'in yazabileceği ekran adları → kök yığın rotası. */
const SIRI_EKRANLARI: Readonly<Record<string, 'KibleSayfasi'>> = {
    kible: 'KibleSayfasi',
};

/** @returns `NavigationContainer.onReady`'ye verilecek geri çağrı. */
export function useSiriEkranIstegi(
    etkin: boolean,
    navRef: NavigationContainerRefWithCurrent<RootStackParamList>
): () => void {
    const isle = useCallback(() => {
        // Gezinme hazır değilken TÜKETME: istek kaybolurdu (onReady yeniden dener).
        if (!etkin || !navRef.isReady()) return;
        siriEkranIstegiAl()
            .then((ekran) => {
                const rota = ekran ? SIRI_EKRANLARI[ekran] : undefined;
                if (rota && navRef.isReady()) navRef.navigate(rota);
            })
            .catch((e) => Logger.warn('SiriEkranIstegi', 'Ekran istegi islenemedi', e));
    }, [etkin, navRef]);

    useEffect(() => {
        if (!etkin) return;
        isle();
        const kaldir = siriDegisikliginiDinle((tur) => {
            if (tur === 'ekran') isle();
        });
        const abonelik = AppState.addEventListener('change', (durum) => {
            if (durum === 'active') isle();
        });
        return () => {
            kaldir();
            abonelik.remove();
        };
    }, [etkin, isle]);

    return isle;
}
