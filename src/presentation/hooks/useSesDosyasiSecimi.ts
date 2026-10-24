/**
 * "Kendi dosyanızdan seçin" — muhafız adımı ve vakit bildirimi AYNI yoldan geçer.
 *
 * Native taraf (`SesIceAktarici`) dosyayı belge seçicisiyle alır, doğrular ve kalıcı
 * bildirim sesi yapar (MediaStore › Bildirimler/NamazAkisi). Bu kanca yalnız bekleme
 * durumunu tutar ve hatayı kullanıcıya kibar dille söyler. Android 10+ dışında
 * `destekleniyor` false → ekran seçeneği HİÇ çizmez (sistem ses seçicisi kalır).
 */
import { useCallback, useRef, useState } from 'react';
import {
    sesDosyasiDestekleniyor,
    sesDosyasiSec,
    type SecilenSes,
    type SesDosyasiHatasi,
} from '../../../modules/expo-countdown-notification/src';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { canli } from '../../core/dil/aktifDil';

export const SES_DOSYASI_HATA_METINLERI: Readonly<Record<SesDosyasiHatasi, string>> = canli(
    (s) => s.muhafizAyar.kanca.sesDosyasi
);

export interface SesDosyasiSecimi {
    destekleniyor: boolean;
    seciliyor: boolean;
    /** Seçilen ses ya da (vazgeçildi/hata) null; hata kullanıcıya söylenmiştir. */
    sec: () => Promise<SecilenSes | null>;
}

export function useSesDosyasiSecimi(): SesDosyasiSecimi {
    // `typeof` korumasi: ekran testleri koprüyu dar bir mock'la (yalniz `sesSec`) kurar.
    const [destekleniyor] = useState(
        () => typeof sesDosyasiDestekleniyor === 'function' && sesDosyasiDestekleniyor()
    );
    const [seciliyor, setSeciliyor] = useState(false);
    const kilit = useRef(false);

    const sec = useCallback(async (): Promise<SecilenSes | null> => {
        if (kilit.current) return null;
        kilit.current = true;
        setSeciliyor(true);
        try {
            const sonuc = await sesDosyasiSec();
            if (!sonuc) return null;
            if ('hata' in sonuc) {
                kisaBildirimGoster(SES_DOSYASI_HATA_METINLERI[sonuc.hata], true);
                return null;
            }
            return sonuc;
        } finally {
            kilit.current = false;
            setSeciliyor(false);
        }
    }, []);

    return { destekleniyor, seciliyor, sec };
}
