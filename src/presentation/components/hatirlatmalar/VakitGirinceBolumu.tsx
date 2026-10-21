/**
 * "Vakit girince" — vakit bildirimleri (beş vakit anahtarı). Eskiden Bildirimler
 * sayfasının ilk bölümüydü; sade tasarımda (Dalga 3) Hatırlatmalar > Vakit girince
 * ayrıntısıdır. Yazma yolu aynı: `vakitBildirimAyariniGuncelle` (kaydet + yeniden planla).
 *
 * `vakitBildirim` dilimi açılışta YÜKLENMEZ (AGENTS.md hidrasyon kuralı) → bölüm açılınca yükler.
 *
 * SES (Android): açık her vaktin altında kompakt ses satırı — telefonun sesleri (sistem
 * seçicisi) ya da kendi dosyanız (ör. ezan kaydı; Android 10+). Ses kanalın özelliğidir;
 * seçilmeyen vakit bugünkü `vakit_bildirim` kanalında kalır. iOS'ta ses seçici yok
 * (`sesSecici: false`) → satır çizilmez.
 */
import * as React from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    vakitBildirimAyariniGuncelle,
    vakitBildirimAyarlariniYukle,
    vakitBildirimSesiniGuncelle,
    vakitBildirimSesleriniYukle,
} from '../../store/vakitBildirimSlice';
import { SesSecimSatiri } from '../hatirlatma/SesSecimSatiri';
import { usePlatformYetenekleri } from '../../hooks/usePlatformYetenekleri';
import { useSesDosyasiSecimi } from '../../hooks/useSesDosyasiSecimi';
import { sesSec } from '../../../../modules/expo-countdown-notification/src';
import { OnizlemeSesServisi } from '../../../domain/services/OnizlemeSesServisi';
import {
    VAKIT_VARSAYILAN_SES_ADI,
    vakitSesGorunenAdi,
    type VakitSesSecimi,
} from '../../../core/bildirim/vakitBildirimSesi';
import { ozelSesMi } from '../../../core/muhafiz/sesKimligi';

/** Taban `vakit_bildirim` kanalı sistemin varsayılan bildirim sesini çalar (önizleme bunu çalar). */
const SISTEM_BILDIRIM_SESI = 'content://settings/system/notification_sound';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { AnahtarSatiri } from '../ortak/AnahtarSatiri';
import { NotSatiri } from '../ortak/NotSatiri';

type VakitAnahtari = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

const VAKITLER: readonly { anahtar: VakitAnahtari; ad: string; ikon: string }[] = [
    { anahtar: 'imsak', ad: NamazAdi.Sabah, ikon: 'cloud-sun' },
    { anahtar: 'ogle', ad: NamazAdi.Ogle, ikon: 'sun' },
    { anahtar: 'ikindi', ad: NamazAdi.Ikindi, ikon: 'cloud-sun' },
    { anahtar: 'aksam', ad: NamazAdi.Aksam, ikon: 'cloud-moon' },
    { anahtar: 'yatsi', ad: NamazAdi.Yatsi, ikon: 'moon' },
];

export const VakitGirinceBolumu: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const ayarlar = useAppSelector((s) => s.vakitBildirim.ayarlar);
    const sesler = useAppSelector((s) => s.vakitBildirim.sesler) ?? {};
    const sesSecilebilir = usePlatformYetenekleri().sesSecici;
    const dosyaSecimi = useSesDosyasiSecimi();
    const [seciciAcikVakit, setSeciciAcikVakit] = React.useState<VakitAnahtari | null>(null);

    useEffect(() => {
        dispatch(vakitBildirimAyarlariniYukle());
        dispatch(vakitBildirimSesleriniYukle());
    }, [dispatch]);

    const sesiYaz = (vakit: VakitAnahtari, secim: VakitSesSecimi | null) => {
        dispatch(vakitBildirimSesiniGuncelle({ vakit, secim }));
    };

    const sistemdenSec = async (vakit: VakitAnahtari, ad: string) => {
        if (seciciAcikVakit) return;
        setSeciciAcikVakit(vakit);
        try {
            const mevcut = sesler[vakit]?.bildirimSesi;
            const secilen = await sesSec(ozelSesMi(mevcut) ? mevcut! : null, `${ad} vakti sesi`);
            if (secilen) sesiYaz(vakit, { bildirimSesi: secilen.uri, sesAdi: secilen.ad || undefined });
        } finally {
            setSeciciAcikVakit(null);
        }
    };

    const dosyadanSec = async (vakit: VakitAnahtari) => {
        const secilen = await dosyaSecimi.sec();
        if (secilen) sesiYaz(vakit, { bildirimSesi: secilen.uri, sesAdi: secilen.ad || undefined });
    };

    const ozelSesVar = sesSecilebilir && VAKITLER.some((v) => ayarlar[v.anahtar] === true && sesler[v.anahtar]);

    const degistir = async (vakit: VakitAnahtari, aktif: boolean) => {
        await butonTiklandiFeedback();
        dispatch(vakitBildirimAyariniGuncelle({ vakit, aktif }));
    };

    return (
        <View>
            <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 }}>
                {VAKITLER.map((v, i) => (
                    <View
                        key={v.anahtar}
                        style={i > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir } : undefined}
                    >
                        <AnahtarSatiri
                            ikon={v.ikon}
                            baslik={`${v.ad} vakti`}
                            deger={ayarlar[v.anahtar] === true}
                            onDegistir={(yeni) => void degistir(v.anahtar, yeni)}
                            testID={`vakit-girince-${v.anahtar}`}
                        />
                        {sesSecilebilir && ayarlar[v.anahtar] === true ? (
                            <View style={{ marginLeft: 54, marginTop: -6, marginBottom: 6 }}>
                                <SesSecimSatiri
                                    kompakt
                                    testID={`vakit-sesi-${v.anahtar}`}
                                    sesEtiketi={`${v.ad} bildirim sesi`}
                                    bildirimSesi={sesler[v.anahtar]?.bildirimSesi ?? 'varsayilan'}
                                    sesAdi={vakitSesGorunenAdi(sesler[v.anahtar])}
                                    varsayilanAdi={VAKIT_VARSAYILAN_SES_ADI}
                                    varsayilanaDonEtiketi="Telefonun bildirim sesine dön"
                                    seciliyor={seciciAcikVakit === v.anahtar}
                                    dosyaAktariliyor={dosyaSecimi.seciliyor}
                                    onSec={() => void sistemdenSec(v.anahtar, v.ad)}
                                    onDosyadanSec={
                                        dosyaSecimi.destekleniyor ? () => void dosyadanSec(v.anahtar) : undefined
                                    }
                                    onVarsayilanaDon={() => sesiYaz(v.anahtar, null)}
                                    onDinle={() =>
                                        void OnizlemeSesServisi.bildirimSesiniCal(
                                            sesler[v.anahtar]?.bildirimSesi ?? SISTEM_BILDIRIM_SESI
                                        )
                                    }
                                />
                            </View>
                        ) : null}
                    </View>
                ))}
            </View>
            <NotSatiri
                metin="Vakit girince ayet ya da hadisle haber verilir."
                style={{ marginTop: 12, paddingHorizontal: 4 }}
            />
            {ozelSesVar ? (
                <NotSatiri
                    testID="vakit-sesi-uzunluk-notu"
                    metin="Seçtiğiniz ses sonuna kadar çalar; bildirimi kapatınca susar."
                    style={{ marginTop: 6, paddingHorizontal: 4 }}
                />
            ) : null}
        </View>
    );
};
