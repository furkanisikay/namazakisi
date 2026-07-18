/**
 * Bildirim sesi secimi — TEK SATIR (eski 3 cipli sahte palet yerine).
 *
 * NEDEN TEK SATIR: eski palet uc isim ('Çan'/'Melodi'/'Alarm') gosteriyordu ama
 * ucu de AYNI dosyaya cozuluyordu; kullanici "Melodi" secince "Çan" duyuyordu.
 * Artik secim sistem ses secicisine devrediliyor (kullanicinin KENDI muzikleri
 * dahil), bu yuzden sabit bir grid'in anlami kalmadi: gosterilecek tek sey
 * "su an hangi ses secili"dir.
 *
 * ANIMASYON BUTCESI BURAYA HARCANDI (AGENTS.md: "cesareti tek imza ogesinde
 * harca"): secici kapandiginda yeni ad satira yumusak bir gecisle yerlesir —
 * ekranin geri kalani sakin kalir.
 */
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { VARSAYILAN_SES_ADI } from '../../../core/muhafiz/matrisTipleri';
import { ozelSesMi } from '../../../core/muhafiz/sesKimligi';

export interface SesSecimSatiriProps {
    /** `varsayilan` ya da `content://...` */
    bildirimSesi: string;
    /** Kayitli gorunen ad (yoksa kibar yedek metin gosterilir) */
    sesAdi?: string;
    /** Sistem ses secicisini acar */
    onSec: () => void;
    /** Secili sesi calar */
    onDinle: () => void;
}

/** Ad cozulememisse ham `content://...` GOSTERILMEZ — kullaniciya hicbir sey anlatmaz. */
function gorunenAd(bildirimSesi: string, sesAdi?: string): string {
    const ad = sesAdi?.trim();
    if (ad) return ad;
    return ozelSesMi(bildirimSesi) ? 'Seçtiğiniz ses' : VARSAYILAN_SES_ADI;
}

export const SesSecimSatiri: React.FC<SesSecimSatiriProps> = ({
    bildirimSesi,
    sesAdi,
    onSec,
    onDinle,
}) => {
    const renkler = useRenkler();
    const ad = gorunenAd(bildirimSesi, sesAdi);
    const ozelMi = ozelSesMi(bildirimSesi);

    // Ad degisince yumusak gecis: hafif yukari kayma + fade.
    const [gosterilenAd, setGosterilenAd] = useState(ad);
    const canlandirma = useRef(new Animated.Value(1)).current;
    const oncekiAd = useRef(ad);

    useEffect(() => {
        if (oncekiAd.current === ad) return;
        oncekiAd.current = ad;
        setGosterilenAd(ad);
        canlandirma.setValue(0);
        Animated.timing(canlandirma, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [ad, canlandirma]);

    return (
        <View
            className="flex-row items-center p-3 rounded-2xl border"
            style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
        >
            {/* Secime goturen ana dokunma hedefi (satirin govdesi) */}
            <TouchableOpacity
                className="flex-row items-center flex-1"
                style={{ minHeight: 44 }}
                onPress={onSec}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Bildirim sesi: ${ad}. Değiştirmek için dokunun.`}
            >
                <View
                    className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${renkler.birincil}20` }}
                >
                    <FontAwesome5
                        name={ozelMi ? 'music' : 'bell'}
                        size={16}
                        color={renkler.birincil}
                        solid
                    />
                </View>
                <View className="flex-1 pr-2">
                    <Animated.Text
                        numberOfLines={1}
                        className="text-sm font-semibold"
                        style={{
                            color: renkler.metin,
                            opacity: canlandirma,
                            transform: [
                                {
                                    translateY: canlandirma.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [6, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        {gosterilenAd}
                    </Animated.Text>
                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                        {ozelMi ? 'Kendi seçtiğiniz ses' : 'Dokunarak değiştirin'}
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                className="w-11 h-11 items-center justify-center rounded-xl border mr-1.5"
                style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                onPress={onDinle}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Seçili bildirim sesini dinleyin"
            >
                <FontAwesome5 name="play" size={12} color={renkler.birincil} solid />
            </TouchableOpacity>

            <FontAwesome5 name="chevron-right" size={13} color={renkler.metinIkincil} />
        </View>
    );
};
