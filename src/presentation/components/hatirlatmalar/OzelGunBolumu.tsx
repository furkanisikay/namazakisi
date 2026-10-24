/**
 * Özel gün — seriyi dondurur ve hatırlatmaları durdurur (hayız/nifas, hastalık…).
 * Sade tasarımda (Dalga 3) "Seri ve hedefler"den Hatırlatmalar sayfasının en altına
 * taşındı: hatırlatmaları etkilediği için orada aranır. Yazma yolu birebir: dört özel
 * gün thunk'ı (`ozelGunListener` fulfilled'a bağlı → tek yayma noktası yeniden planlar).
 */
import * as React from 'react';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ozelGunBaslat, ozelGunModuDurumunuGuncelle } from '../../store/seriSlice';
import { OzelGunTakvimi } from '../OzelGunTakvimi';
import { ISOTarihiDateNesnesiNeCevir, tarihiISOFormatinaCevir } from '../../../core/utils/TarihYardimcisi';
import { bicim, metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { OZEL_GUN_RENGI } from '../../../core/constants/OzelGunRengi';
import { AnahtarSatiri } from '../ortak/AnahtarSatiri';
import { NotSatiri } from '../ortak/NotSatiri';
import { kisaBildirimGoster } from '../common/KisaBildirim';

const ikiHane = (n: number) => String(n).padStart(2, '0');
/** Sayısal tarih ("24.10.2026"); `Intl`/`toLocale*`'e bağlı değil (Hermes ICU). */
const tarihYazisi = (iso: string) => {
    const t = ISOTarihiDateNesnesiNeCevir(iso);
    return bicim(metin().hatirlatma.ozelGun.tarih, { gun: ikiHane(t.getDate()), ay: ikiHane(t.getMonth() + 1), yil: t.getFullYear() });
};

export const OzelGunBolumu: React.FC = () => {
    const renkler = useRenkler();
    const m = useMetin().hatirlatma.ozelGun;
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const ozelGun = useAppSelector((s) => s.seri.ozelGunAyarlari);
    const [takvim, setTakvim] = useState(false);

    // Onay ancak kayıt GERÇEKTEN bittikten sonra söylenir: yazım reddedilirse "başladı"
    // demek kullanıcıyı korumasız bırakırdı (hatırlatmalar susmaz).
    const baslat = async (baslangic: Date, bitis: Date) => {
        setTakvim(false);
        const sonuc = await dispatch(
            ozelGunBaslat({
                baslangicTarihi: tarihiISOFormatinaCevir(baslangic),
                bitisTarihi: tarihiISOFormatinaCevir(bitis),
            })
        );
        if (ozelGunBaslat.fulfilled.match(sonuc)) {
            kisaBildirimGoster(metin().hatirlatma.ozelGun.basladi);
        } else {
            kisaBildirimGoster(metin().hatirlatma.ozelGun.baslatilamadi, true);
        }
    };

    return (
        <View>
            <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 }}>
                <AnahtarSatiri
                    ikon="magic"
                    renk={OZEL_GUN_RENGI}
                    baslik={m.baslik}
                    ozet={m.ozet}
                    deger={ozelGun.ozelGunModuAktif}
                    onDegistir={async (v) => {
                        await butonTiklandiFeedback();
                        dispatch(ozelGunModuDurumunuGuncelle({ aktif: v }));
                    }}
                    testID="ozel-gun-anahtari"
                />
            </View>

            {ozelGun.ozelGunModuAktif && !ozelGun.aktifOzelGun ? (
                <TouchableOpacity
                    onPress={() => setTakvim(true)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={m.baslatin}
                    style={{
                        marginTop: 12,
                        minHeight: 48,
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: OZEL_GUN_RENGI,
                    }}
                >
                    <FontAwesome5 name="calendar-plus" size={15} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: renkler.birincilMetin }}>{m.baslatin}</Text>
                </TouchableOpacity>
            ) : null}

            {ozelGun.aktifOzelGun ? (
                <View
                    testID="ozel-gun-suruyor"
                    style={{
                        marginTop: 12,
                        padding: 14,
                        borderRadius: 16,
                        borderLeftWidth: 3,
                        borderLeftColor: OZEL_GUN_RENGI,
                        backgroundColor: renkler.kartArkaplan,
                    }}
                >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: renkler.metin }}>{m.suruyor}</Text>
                    <Text style={{ fontSize: 14, marginTop: 2, color: renkler.metinIkincil }}>
                        {tarihYazisi(ozelGun.aktifOzelGun.baslangicTarihi)} – {tarihYazisi(ozelGun.aktifOzelGun.bitisTarihi)}
                    </Text>
                </View>
            ) : null}

            <NotSatiri metin={m.not} style={{ marginTop: 12 }} />

            <OzelGunTakvimi gorunur={takvim} onKapat={() => setTakvim(false)} onBaslat={(b, s) => void baslat(b, s)} />
        </View>
    );
};
