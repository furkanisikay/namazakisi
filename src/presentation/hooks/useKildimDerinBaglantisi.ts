/**
 * `namazakisi://kildim` derin bağlantısı (issue #276): içinde bulunulan vakti
 * kılındı olarak işaretler ve kısa bir mesaj gösterir. Yalnız İŞARETLER — geri
 * alma uygulamada. Uygulama soğuk açılışta bağlantıyla geldiyse de çalışır.
 *
 * ONAY ŞART: bağlantıyı cihazdaki HERHANGİ bir uygulama ya da bir web sayfası
 * açabilir ve JS kaynağını ayırt edemez → işaretleme sessizce YAPILMAZ; kullanıcı
 * uygulama içindeki onay penceresinde "Kıldım" demelidir. İşaretlenecek bir şey
 * yoksa (zaten kılınmış, vakit yok, konum yok) yalnız bilgi verilir.
 *
 * Android kısayolu bu yolu KULLANMAZ (uygulamayı açmadan native işaretler, kaynağı
 * kendisi doğrular — `KildimKisayolActivity`); bu hook iOS ve elle açılan bağlantı içindir.
 */
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { kildimBaglantisiMi } from '../../navigation/derinBaglantilar';
import {
    KildimKuyruguServisi,
    type KildimAdayi,
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
        case 'vakitDegisti':
            return 'Vakit değişti, işaretleme yapılmadı. Lütfen yeniden deneyin.';
    }
}

/** Onay penceresi metni (kibar "siz"). */
export const kildimOnayBasligi = (aday: KildimAdayi): string =>
    `${aday.vakitAdi} namazı kılındı olarak işaretlensin mi?`;
export const KILDIM_ONAY_MESAJI = 'Bu istek bir bağlantı üzerinden geldi. Namazınızı kıldıysanız onaylayın.';

const HATA_METNI = 'İşaretleme yapılamadı. Lütfen uygulamadan işaretleyin.';

export interface KildimDerinBaglantiOnayi {
    /** Onay bekleyen vakit; yoksa null (pencere kapalı). */
    onayAdayi: KildimAdayi | null;
    /** "Kıldım": adayı (yeniden doğrulayarak) işaretler. */
    onayla: () => void;
    /** "Vazgeç" / geri tuşu: hiçbir şey yazılmaz. */
    vazgec: () => void;
}

/** @param etkin Kurulum sihirbazı sürerken bağlantı yok sayılır. */
export function useKildimDerinBaglantisi(etkin: boolean): KildimDerinBaglantiOnayi {
    const [onayAdayi, setOnayAdayi] = useState<KildimAdayi | null>(null);

    useEffect(() => {
        if (!etkin) return;
        const isle = (url: string | null): void => {
            if (!kildimBaglantisiMi(url)) return;
            KildimKuyruguServisi.getInstance()
                .simdikiVaktiDegerlendir()
                .then((d) => {
                    if (d.tur === 'aday') setOnayAdayi(d);
                    else kisaBildirimGoster(kildimSonucMetni(d));
                })
                .catch((e) => {
                    Logger.warn('KildimDerinBaglanti', 'Derin baglanti degerlendirilemedi', e);
                    kisaBildirimGoster(HATA_METNI);
                });
        };
        Linking.getInitialURL().then(isle).catch(() => undefined);
        const abonelik = Linking.addEventListener('url', ({ url }) => isle(url));
        return () => abonelik.remove();
    }, [etkin]);

    const onayla = useCallback(() => {
        const aday = onayAdayi;
        setOnayAdayi(null);
        if (!aday) return;
        KildimKuyruguServisi.getInstance()
            .adayiIsaretle(aday)
            .then((sonuc) => kisaBildirimGoster(kildimSonucMetni(sonuc)))
            .catch((e) => {
                Logger.warn('KildimDerinBaglanti', 'Derin baglantidan isaretleme basarisiz', e);
                kisaBildirimGoster(HATA_METNI);
            });
    }, [onayAdayi]);

    const vazgec = useCallback(() => setOnayAdayi(null), []);

    return { onayAdayi, onayla, vazgec };
}
