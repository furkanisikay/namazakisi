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
import { tarihiISOFormatinaCevir } from '../../../core/utils/TarihYardimcisi';
import { OZEL_GUN_RENGI } from '../../../core/constants/OzelGunRengi';
import { AnahtarSatiri } from '../ortak/AnahtarSatiri';
import { NotSatiri } from '../ortak/NotSatiri';
import { kisaBildirimGoster } from '../common/KisaBildirim';

const tarihYazisi = (iso: string) => new Date(iso).toLocaleDateString('tr-TR');

export const OzelGunBolumu: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const ozelGun = useAppSelector((s) => s.seri.ozelGunAyarlari);
    const [takvim, setTakvim] = useState(false);

    const baslat = (baslangic: Date, bitis: Date) => {
        dispatch(
            ozelGunBaslat({
                baslangicTarihi: tarihiISOFormatinaCevir(baslangic),
                bitisTarihi: tarihiISOFormatinaCevir(bitis),
            })
        );
        setTakvim(false);
        kisaBildirimGoster('Özel gün başladı; hatırlatmalar bu günlerde durur.');
    };

    return (
        <View>
            <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 }}>
                <AnahtarSatiri
                    ikon="magic"
                    renk={OZEL_GUN_RENGI}
                    baslik="Özel gün"
                    ozet="Seri donar, hatırlatmalar durur"
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
                    accessibilityLabel="Özel günü başlatın"
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
                    <Text style={{ fontSize: 15, fontWeight: '700', color: renkler.birincilMetin }}>Özel günü başlatın</Text>
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
                    <Text style={{ fontSize: 15, fontWeight: '700', color: renkler.metin }}>Özel gün sürüyor</Text>
                    <Text style={{ fontSize: 14, marginTop: 2, color: renkler.metinIkincil }}>
                        {tarihYazisi(ozelGun.aktifOzelGun.baslangicTarihi)} – {tarihYazisi(ozelGun.aktifOzelGun.bitisTarihi)}
                    </Text>
                </View>
            ) : null}

            <NotSatiri metin="Bu günlerde seri bozulmaz, hiçbir hatırlatma gelmez." style={{ marginTop: 12 }} />

            <OzelGunTakvimi gorunur={takvim} onKapat={() => setTakvim(false)} onBaslat={baslat} />
        </View>
    );
};
