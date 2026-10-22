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

/** Intent'in yazabileceği ekran adları → alt sekme (Kıble Dalga 4'ten beri sekmedir). */
const SIRI_EKRANLARI: Readonly<Record<string, 'Kible'>> = {
    kible: 'Kible',
};

/**
 * Uygulama simgesi hızlı eylemi "Vakti kıldım" (Android ana ekran kısayolunun ikizi):
 * kişinin kendi ana ekranındaki eylemidir → Android'in "ana ekran = doğrudan" kuralı gibi
 * onay sorulmadan, şu anki vakit yeniden değerlendirilerek işaretlenir; sonuç kısa
 * bildirimle söylenir. Servisler native köprü çektiği için tembel yüklenir.
 */
async function simgedenKildim(): Promise<void> {
    const { KildimKuyruguServisi } = require('../../domain/services/KildimKuyruguServisi') as typeof import('../../domain/services/KildimKuyruguServisi');
    const { kildimSonucMetni } = require('./useKildimDerinBaglantisi') as typeof import('./useKildimDerinBaglantisi');
    const { kisaBildirimGoster } = require('../components/common/KisaBildirim') as typeof import('../components/common/KisaBildirim');
    try {
        kisaBildirimGoster(kildimSonucMetni(await KildimKuyruguServisi.getInstance().simdikiVaktiKildim()));
    } catch (e) {
        Logger.warn('SiriEkranIstegi', 'Hizli eylemden Kildim islenemedi', e);
        kisaBildirimGoster('İşaretleme yapılamadı. Lütfen uygulamadan işaretleyin.');
    }
}

/** @returns `NavigationContainer.onReady`'ye verilecek geri çağrı. */
export function useSiriEkranIstegi(
    etkin: boolean,
    navRef: NavigationContainerRefWithCurrent<RootStackParamList>
): () => void {
    const isle = useCallback(() => {
        // Gezinme hazır değilken TÜKETME: istek kaybolurdu (onReady yeniden dener).
        if (!etkin || !navRef.isReady()) return;
        siriEkranIstegiAl()
            .then(async (ekran) => {
                if (ekran === 'kildim') {
                    await simgedenKildim();
                    return;
                }
                const rota = ekran ? SIRI_EKRANLARI[ekran] : undefined;
                if (rota && navRef.isReady()) navRef.navigate('MainTabs', { screen: rota });
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
