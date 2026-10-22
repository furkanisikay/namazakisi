/**
 * `namazakisi://kildim` derin bağlantısı (issue #276): içinde bulunulan vakti
 * kılındı olarak işaretler ve kısa bir mesaj gösterir. Yalnız İŞARETLER — geri
 * alma uygulamada. Uygulama soğuk açılışta bağlantıyla geldiyse de çalışır.
 *
 * GÜVEN LİSTESİ (issue #299): bağlantıyı cihazdaki HERHANGİ bir uygulama ya da bir
 * web sayfası açabilir. Android'de MainActivity başlatan paketi yakalar ve native güven
 * listesi karar verir (`KildimGuvenServisi.derinBaglantiKarari`): ana ekran ya da izinli
 * uygulama → sormadan işaretlenir; engellenmiş uygulama → yok sayılır; ilk kez gelen
 * uygulama → tek seferlik soru [Her zaman izin ver] [Yalnız bu sefer] [Engelle].
 * Tarayıcıya kalıcı izin sunulmaz (her web sayfası bağlantıyı açabilir). Başlatan
 * bilinmiyorsa (iOS, uydurulabilir referrer eki) yalnız "bu seferlik" onay sorulur. İşaretlenecek bir şey yoksa (zaten kılınmış, vakit yok, konum yok)
 * yalnız bilgi verilir.
 *
 * Android kısayolu bu yolu KULLANMAZ (uygulamayı açmadan native işaretler, kaynağı
 * kendisi doğrular — `KildimKisayolActivity`); bu hook iOS ve elle açılan bağlantı içindir.
 */
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { kildimBaglantisiMi } from '../../navigation/derinBaglantilar';
import { KildimGuvenServisi } from '../../domain/services/KildimGuvenServisi';
import {
    kildimEngellendiMetni,
    type KildimBaglantiKarari,
} from '../../core/kildim/kildimGuven';
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
            return `${sonuc.vakitAdi} namazınız kılındı olarak işaretlendi. Allah kabul etsin.`;
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
/** Başlatanı BİLİNMEYEN bağlantıda (karar saklanamaz) gösterilen açıklama. */
export const KILDIM_ONAY_MESAJI = 'Bu istek bir bağlantı üzerinden geldi. Namazınızı kıldıysanız onaylayın.';

const HATA_METNI = 'İşaretleme yapılamadı. Lütfen uygulamadan işaretleyin.';

export interface KildimDerinBaglantiOnayi {
    /** Onay bekleyen vakit; yoksa null (pencere kapalı). */
    onayAdayi: KildimAdayi | null;
    /** Bağlantıyı açan uygulama ve hangi kalıcı seçeneklerin sunulacağı. */
    baslatan: KildimBaglantiKarari | null;
    /** "Yalnız bu sefer" / "Kıldım": adayı (yeniden doğrulayarak) işaretler, karar saklanmaz. */
    onayla: () => void;
    /** "Her zaman izin ver": kararı saklar ve işaretler. */
    herZamanIzinVer: () => void;
    /** "Engelle": kararı saklar, hiçbir şey işaretlenmez. */
    engelle: () => void;
    /** "Vazgeç" / geri tuşu: hiçbir şey yazılmaz, bir dahaki istekte yine sorulur. */
    vazgec: () => void;
}

interface Onay {
    aday: KildimAdayi;
    baslatan: KildimBaglantiKarari;
}

/**
 * Açılış bağlantısı süreç başına BİR KEZ işlenir. `getInitialURL` süreç ömrü
 * boyunca aynı adresi döndürür; kancayı taşıyan ağaç yeniden bağlanırsa
 * (ör. sihirbaz → ana akış) bağlantı ikinci kez işlenir, native kayıt ilk
 * turda tüketildiği için başlatan BİLİNMİYOR olur ve gereksiz ikinci soru çıkardı.
 */
let acilisBaglantisiIslendi = false;

/** Yalnız testler için: modül düzeyi bayrağı sıfırlar. */
export const acilisBaglantisiBayraginiSifirla = (): void => {
    acilisBaglantisiIslendi = false;
};

/** @param etkin Kurulum sihirbazı sürerken bağlantı yok sayılır. */
export function useKildimDerinBaglantisi(etkin: boolean): KildimDerinBaglantiOnayi {
    const [onay, setOnay] = useState<Onay | null>(null);

    useEffect(() => {
        if (!etkin) return;
        const isle = async (url: string | null): Promise<void> => {
            if (!kildimBaglantisiMi(url)) return;
            try {
                // Native kaydı TÜKETİR → bağlantı başına tek çağrı.
                const baslatan = await KildimGuvenServisi.derinBaglantiKarari();
                if (baslatan.eylem === 'yokSay') {
                    Logger.info('KildimDerinBaglanti', `Engellenmis uygulama yok sayildi: ${baslatan.paket}`);
                    return;
                }
                const servis = KildimKuyruguServisi.getInstance();
                if (baslatan.eylem === 'dogrudan') {
                    kisaBildirimGoster(kildimSonucMetni(await servis.simdikiVaktiKildim()));
                    return;
                }
                const d = await servis.simdikiVaktiDegerlendir();
                if (d.tur === 'aday') setOnay({ aday: d, baslatan });
                else kisaBildirimGoster(kildimSonucMetni(d));
            } catch (e) {
                Logger.warn('KildimDerinBaglanti', 'Derin baglanti degerlendirilemedi', e);
                kisaBildirimGoster(HATA_METNI);
            }
        };
        if (!acilisBaglantisiIslendi) {
            Linking.getInitialURL()
                .then((url) => {
                    if (acilisBaglantisiIslendi) return;
                    acilisBaglantisiIslendi = true;
                    return isle(url);
                })
                .catch(() => undefined);
        }
        const abonelik = Linking.addEventListener('url', ({ url }) => {
            isle(url).catch(() => undefined);
        });
        return () => abonelik.remove();
    }, [etkin]);

    const isaretle = useCallback((aday: KildimAdayi) => {
        KildimKuyruguServisi.getInstance()
            .adayiIsaretle(aday)
            .then((sonuc) => kisaBildirimGoster(kildimSonucMetni(sonuc)))
            .catch((e) => {
                Logger.warn('KildimDerinBaglanti', 'Derin baglantidan isaretleme basarisiz', e);
                kisaBildirimGoster(HATA_METNI);
            });
    }, []);

    const onayla = useCallback(() => {
        const o = onay;
        setOnay(null);
        if (o) isaretle(o.aday);
    }, [onay, isaretle]);

    const herZamanIzinVer = useCallback(() => {
        const o = onay;
        setOnay(null);
        if (!o) return;
        if (o.baslatan.paket && o.baslatan.herZaman) {
            KildimGuvenServisi.soruyuYanitla(o.baslatan.paket, 'izin').catch(() => false);
        }
        isaretle(o.aday);
    }, [onay, isaretle]);

    const engelle = useCallback(() => {
        const o = onay;
        setOnay(null);
        if (!o?.baslatan.paket || !o.baslatan.engel) return;
        const ad = o.baslatan.ad;
        KildimGuvenServisi.soruyuYanitla(o.baslatan.paket, 'engel')
            .then((yazildi) => {
                if (yazildi) kisaBildirimGoster(kildimEngellendiMetni(ad));
            })
            .catch(() => undefined);
    }, [onay]);

    const vazgec = useCallback(() => setOnay(null), []);

    return {
        onayAdayi: onay?.aday ?? null,
        baslatan: onay?.baslatan ?? null,
        onayla,
        herZamanIzinVer,
        engelle,
        vazgec,
    };
}
