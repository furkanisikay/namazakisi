/**
 * `namazakisi://kildim` derin bağlantısı (issue #276): içinde bulunulan vakti
 * kılındı olarak işaretler ve kısa bir mesaj gösterir. Yalnız İŞARETLER — geri
 * alma uygulamada. Uygulama soğuk açılışta bağlantıyla geldiyse de çalışır.
 *
 * Android kısayolu bu yolu KULLANMAZ (uygulamayı açmadan native işaretler); bu
 * hook iOS ve elle açılan bağlantı içindir.
 */
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { kildimBaglantisiMi } from '../../navigation/derinBaglantilar';
import {
    KildimKuyruguServisi,
    type SimdikiVakitSonucu,
} from '../../domain/services/KildimKuyruguServisi';
import { Logger } from '../../core/utils/Logger';

const saatMetni = (ms: number): string => {
    const t = new Date(ms);
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
};

/**
 * Kullanıcıya görünen sonuç — arayüz geri bildirimi olduğu için kibar "siz".
 * Saate hal eki EKLENMEZ ("12:58'de" okunuşa göre değişir — AGENTS.md).
 */
export function kildimSonucMetni(sonuc: SimdikiVakitSonucu): string {
    switch (sonuc.tur) {
        case 'isaretlendi':
            return `${sonuc.vakitAdi} namazınız kılındı olarak işaretlendi.`;
        case 'zatenKilindi':
            return `${sonuc.vakitAdi} namazı zaten kılındı olarak işaretli.`;
        case 'vakitYok':
            return sonuc.siradakiAdi && sonuc.girisMs != null
                ? `Şu an kılınacak vakit yok. Sıradaki ${sonuc.siradakiAdi}, giriş ${saatMetni(sonuc.girisMs)}.`
                : 'Şu an kılınacak vakit yok.';
        case 'konumYok':
            return 'Vakitleri hesaplayabilmek için önce konumunuzu ayarlayın.';
    }
}

const isle = (url: string | null): void => {
    if (!kildimBaglantisiMi(url)) return;
    KildimKuyruguServisi.getInstance()
        .simdikiVaktiKildim()
        .then((sonuc) => kisaBildirimGoster(kildimSonucMetni(sonuc)))
        .catch((e) => {
            Logger.warn('KildimDerinBaglanti', 'Derin baglantidan isaretleme basarisiz', e);
            kisaBildirimGoster('İşaretleme yapılamadı. Lütfen uygulamadan işaretleyin.');
        });
};

/** @param etkin Kurulum sihirbazı sürerken bağlantı yok sayılır. */
export function useKildimDerinBaglantisi(etkin: boolean): void {
    useEffect(() => {
        if (!etkin) return;
        Linking.getInitialURL().then(isle).catch(() => undefined);
        const abonelik = Linking.addEventListener('url', ({ url }) => isle(url));
        return () => abonelik.remove();
    }, [etkin]);
}
