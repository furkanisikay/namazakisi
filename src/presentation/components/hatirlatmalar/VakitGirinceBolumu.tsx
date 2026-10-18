/**
 * "Vakit girince" — vakit bildirimleri (beş vakit anahtarı). Eskiden Bildirimler
 * sayfasının ilk bölümüydü; sade tasarımda (Dalga 3) Hatırlatmalar > Vakit girince
 * ayrıntısıdır. Yazma yolu aynı: `vakitBildirimAyariniGuncelle` (kaydet + yeniden planla).
 *
 * `vakitBildirim` dilimi açılışta YÜKLENMEZ (AGENTS.md hidrasyon kuralı) → bölüm açılınca yükler.
 */
import * as React from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { vakitBildirimAyariniGuncelle, vakitBildirimAyarlariniYukle } from '../../store/vakitBildirimSlice';
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

    useEffect(() => {
        dispatch(vakitBildirimAyarlariniYukle());
    }, [dispatch]);

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
                    </View>
                ))}
            </View>
            <NotSatiri
                metin="Vakit girince ayet ya da hadisle haber verilir."
                style={{ marginTop: 12, paddingHorizontal: 4 }}
            />
        </View>
    );
};
