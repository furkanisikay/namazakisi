/**
 * "Günlük Akış" zincirindeki nafile satırı (issue #77).
 *
 * Farz satırıyla AYNI üç sütun (saat | halka + bağlantı çizgisi | kart), ama
 * ikincil seste: daha küçük ve kesikli halka, zeminsiz kesikli kart, normal
 * kalınlıkta saat. Kılma halkası, puan ve "Kıldım" farz satırlarına özgüdür —
 * nafile kayda/puana/seriye işlenmez. Dokununca vaktin ayrıntısı açılır.
 *
 * Bağlantı çizgisi kopmaz: satır, içinde durduğu iki farz arasındaki çizginin
 * rengini taşır (`ustDolu`/`altDolu` çağırandan gelir).
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { BildirimModali } from '../common/BildirimModali';
import type { NafileZincirSatiri as Satir } from '../../../core/nafile/nafileZinciri';

export interface NafileZincirSatiriProps {
    satir: Satir;
    ustCizgi: boolean;
    altCizgi: boolean;
    /** Çizgi, içinde durduğu farz bağlantısı doluysa yeşil. */
    cizgiDolu: boolean;
}

const NafileZincirSatiriIc: React.FC<NafileZincirSatiriProps> = ({ satir, ustCizgi, altCizgi, cizgiDolu }) => {
    const renkler = useRenkler();
    const [bilgiAcik, setBilgiAcik] = useState(false);
    const aktif = satir.durum === 'aktif';
    const opacity = satir.durum === 'gecti' ? 0.5 : 1;
    const cizgiRengi = cizgiDolu ? renkler.durum.basarili : renkler.sinir;

    return (
        <>
            <TouchableOpacity
                testID={`nafile-satir-${satir.tur}`}
                className="flex-row items-stretch"
                activeOpacity={0.7}
                onPress={() => setBilgiAcik(true)}
                accessibilityRole="button"
                accessibilityLabel={`${satir.ad}, nafile, ${satir.durumMetni}. Ayrıntı için dokunun.`}
            >
                <View className="w-12 justify-center items-end" style={{ opacity }}>
                    <Text
                        className="text-sm font-medium"
                        style={{ color: renkler.metinIkincil, fontVariant: ['tabular-nums'] }}
                    >
                        {satir.saat}
                    </Text>
                </View>

                <View className="w-10 mx-2 items-center justify-center">
                    {ustCizgi && (
                        <View
                            className="absolute top-0 w-0.5"
                            style={{ height: '50%', backgroundColor: cizgiRengi }}
                        />
                    )}
                    {altCizgi && (
                        <View
                            className="absolute bottom-0 w-0.5"
                            style={{ height: '50%', backgroundColor: cizgiRengi }}
                        />
                    )}
                    <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{
                            backgroundColor: aktif ? `${renkler.birincil}25` : renkler.arkaplan,
                            borderWidth: 1.5,
                            borderStyle: aktif ? 'solid' : 'dashed',
                            borderColor: aktif ? renkler.birincil : renkler.sinir,
                            opacity,
                        }}
                    >
                        <FontAwesome5 name={satir.ikon} size={10} color={renkler.birincil} solid />
                    </View>
                </View>

                <View
                    className="flex-1 flex-row items-center gap-3 my-0.5 px-3 py-2 rounded-xl"
                    style={{
                        minHeight: 44,
                        opacity,
                        borderWidth: 1,
                        borderStyle: aktif ? 'solid' : 'dashed',
                        borderColor: aktif ? `${renkler.birincil}70` : renkler.sinir,
                        backgroundColor: aktif ? `${renkler.birincil}10` : 'transparent',
                    }}
                >
                    <View className="flex-1">
                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                            {satir.ad}
                        </Text>
                        <Text
                            className="text-[11px] font-medium"
                            style={{ color: aktif ? renkler.birincil : renkler.metinIkincil }}
                        >
                            {satir.durumMetni}
                        </Text>
                    </View>
                    <FontAwesome5 name="info-circle" size={13} color={renkler.metinIkincil} />
                </View>
            </TouchableOpacity>
            <BildirimModali
                gorunur={bilgiAcik}
                tip="bilgi"
                baslik={satir.bilgiBaslik}
                mesaj={satir.bilgiMetni}
                onKapat={() => setBilgiAcik(false)}
            />
        </>
    );
};

export const NafileZincirSatiri = React.memo(NafileZincirSatiriIc);
