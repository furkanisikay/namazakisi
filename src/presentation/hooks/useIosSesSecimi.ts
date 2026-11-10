/**
 * iPhone'un ses listesi — eklenen dosyalar + "Kendi dosyanızdan seçin".
 *
 * iOS'ta sistem ses seçicisi yoktur (`PlatformYetenekleri.sistemSesSecici: false`):
 * liste uygulamanın sesleri (`paket:<ad>`) ve kullanıcının eklediği dosyalardır
 * (`dosya:<ad>`). Dosya belge seçicisiyle (expo-document-picker, uygulama önbelleğine
 * kopya) alınır; native `sesIceAktar` onu ≤29,5 sn CAF'a çevirip `Library/Sounds`'a
 * yazar. Bu kanca listeyi, bekleme durumunu ve hataları (kibar dille) taşır; muhafız
 * adımı ve vakit bildirimi AYNI yoldan geçer (Android `useSesDosyasiSecimi` ikizi).
 *
 * `aktif` false iken (Android, kapalı modal) native'e hiç gidilmez.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    iceAktarilanSesler,
    sesIceAktar,
    sesIceAktarmaDestekleniyor,
    type IceAktarilanSes,
} from '../../../modules/expo-muhafiz-anons/src';
import { dosyaSesKimligi, kullaniciSesDosyasi } from '../../core/muhafiz/ios/paketSesleri';
import { eklenmisSesleriAyarla } from '../../core/muhafiz/sesKimligi';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { metin } from '../../core/dil/aktifDil';
import { SES_DOSYASI_HATA_METINLERI } from './useSesDosyasiSecimi';
import { Logger } from '../../core/utils/Logger';

export interface IosSesSecimi {
    /** Bu build kendi dosyanızı ekleyebiliyor mu? (eski native ikilide hayır) */
    destekleniyor: boolean;
    /** Eklenmiş, diskte duran sesler (eklenme sırasıyla). */
    dosyalar: readonly IceAktarilanSes[];
    ekleniyor: boolean;
    /** Belge seçicisini açar; eklenen sesin kimliği + adı ya da (vazgeçildi/hata) null. */
    ekle: () => Promise<{ kimlik: string; ad: string } | null>;
    /** Eklenmiş sesi siler (`dosya:` kimliğiyle). */
    sil: (kimlik: string) => Promise<void>;
}

/** Görünen ad: dosya adının uzantısız hâli ("Ezan.m4a" → "Ezan"). */
export function dosyaGorunenAdi(ad: string | null | undefined): string {
    const kirpik = (ad ?? '').trim();
    const nokta = kirpik.lastIndexOf('.');
    return (nokta > 0 ? kirpik.slice(0, nokta) : kirpik).slice(0, 80);
}

export function useIosSesSecimi(aktif: boolean): IosSesSecimi {
    const destekleniyor =
        aktif && typeof sesIceAktarmaDestekleniyor === 'function' && sesIceAktarmaDestekleniyor();
    const [dosyalar, setDosyalar] = useState<readonly IceAktarilanSes[]>([]);
    const [ekleniyor, setEkleniyor] = useState(false);
    const kilit = useRef(false);
    const canli = useRef(true);

    const tazele = useCallback(async () => {
        const liste = await iceAktarilanSesler();
        // Ad üreticisinin kaydı da tazelenir (okunamadıysa dokunulmaz → "bilinmiyor").
        if (liste) eklenmisSesleriAyarla(liste.map((d) => d.dosya));
        if (canli.current) setDosyalar(liste ?? []);
    }, []);

    useEffect(() => {
        canli.current = true;
        if (aktif) void tazele();
        return () => {
            canli.current = false;
        };
    }, [aktif, tazele]);

    const ekle = useCallback(async (): Promise<{ kimlik: string; ad: string } | null> => {
        if (kilit.current || !destekleniyor) return null;
        kilit.current = true;
        setEkleniyor(true);
        try {
            // TEMBEL: belge seçici native olay yayıcısını yükler; bu kancayı (dolaylı) yükleyen
            // her ekran testi onu mock'lamak zorunda kalmasın (AGENTS.md `requireNativeModule`).
            let secim: import('expo-document-picker').DocumentPickerResult;
            try {
                const DocumentPicker = require('expo-document-picker') as typeof import('expo-document-picker');
                secim = await DocumentPicker.getDocumentAsync({
                    type: 'audio/*',
                    copyToCacheDirectory: true,
                    multiple: false,
                });
            } catch (e) {
                Logger.warn('IosSes', 'Belge seçici açılamadı', e);
                kisaBildirimGoster(SES_DOSYASI_HATA_METINLERI.erisim, true);
                return null;
            }
            const varlik = secim.canceled ? null : secim.assets?.[0];
            if (!varlik?.uri) return null;
            const sonuc = await sesIceAktar(varlik.uri, dosyaGorunenAdi(varlik.name));
            if ('hata' in sonuc) {
                // iPhone OGG okuyamaz → biçim hatası OGG önermez (Android'in metni OGG der).
                kisaBildirimGoster(
                    sonuc.hata === 'bicim'
                        ? metin().muhafizAyar.kanca.sesDosyasi.bicimIos
                        : SES_DOSYASI_HATA_METINLERI[sonuc.hata],
                    true
                );
                return null;
            }
            // Sessiz sapma yok: 30 sn'den uzun dosyanın yalnız başı çalar.
            if (sonuc.kirpildi) kisaBildirimGoster(metin().hatirlatma.sesSecim.uzunlukNotu, true);
            await tazele();
            return { kimlik: dosyaSesKimligi(sonuc.dosya), ad: sonuc.ad };
        } finally {
            kilit.current = false;
            if (canli.current) setEkleniyor(false);
        }
    }, [destekleniyor, tazele]);

    const sil = useCallback(
        async (kimlik: string) => {
            if (!kullaniciSesDosyasi(kimlik)) return;
            // TEK yol: dosya silinir, onu kullanan HER kayıt varsayılana döner, slice'lar
            // tazelenir ve planlar yenilenir (`store/iosSesSilme`). TEMBEL: store'u (ve
            // ağır servisleri) bu kancayı yükleyen her ekran testi yüklemesin.
            const { store } = require('../store/store') as typeof import('../store/store');
            const { iosSesiniSil } = require('../store/iosSesSilme') as typeof import('../store/iosSesSilme');
            try {
                await store.dispatch(iosSesiniSil(kimlik));
            } catch (e) {
                Logger.warn('IosSes', 'Ses silinemedi', e);
            }
            await tazele();
        },
        [tazele]
    );

    return { destekleniyor, dosyalar, ekleniyor, ekle, sil };
}
