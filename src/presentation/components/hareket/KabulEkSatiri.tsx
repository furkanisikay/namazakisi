/**
 * Kıldım düğmesinin altındaki sessiz ek söz ("Hayırlı sabahlar" / "Hayırlı geceler").
 *
 * Koreografi (motion-choreography — olay tabanlı, tek sefer, ~1 sn içinde biter): düğmenin
 * dönüşümü (büzülme + halka ≈ 600 ms) bittikten SONRA kısa bir gecikmeyle aşağıdan 6 dp
 * yükselerek belirir ve öyle KALIR. İlk çizimde, gün/vakit (`kimlik`) değiştiğinde ve
 * "Animasyonları azalt" açıkken son karesine atlar — ana ekran saniyede bir çizilir, vakit
 * değişimi bir işaretleme değildir (KildimDugmesi ile aynı kural). Bilgi hareketle sınırlı
 * değildir: metin düz `Text`tir, ekran okuyucu düğmenin duyurusunu zaten aldığı için bu satır
 * ayrıca duyurulmaz (çift okuma olmasın).
 */
import * as React from 'react';
import { Animated, Text } from 'react-native';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { EGRI, SURE } from './sureler';

export interface KabulEkSatiriProps {
    metin: string;
    /** Satır yalnız kılınmışken görünür. */
    gorunur: boolean;
    kimlik?: string;
    testID?: string;
}

/** Düğme sahnesinden sonra (büzülme + halka) bekleme. */
const GECIKME_MS = SURE.buzulme + SURE.halka - 120;

export const KabulEkSatiri: React.FC<KabulEkSatiriProps> = React.memo(function KabulEkSatiri({
    metin,
    gorunur,
    kimlik,
    testID,
}) {
    const renkler = useRenkler();
    const azalt = useHareketAzalt();
    const deger = React.useRef(new Animated.Value(gorunur ? 1 : 0)).current;
    const onceki = React.useRef({ gorunur, kimlik });

    React.useEffect(() => {
        const eski = onceki.current;
        onceki.current = { gorunur, kimlik };
        if (eski.gorunur === gorunur) return;
        const gercekGecis = eski.kimlik === kimlik;
        if (!gorunur || !gercekGecis || azalt) {
            deger.setValue(gorunur ? 1 : 0);
            return;
        }
        deger.setValue(0);
        Animated.timing(deger, {
            toValue: 1,
            duration: SURE.giris,
            delay: GECIKME_MS,
            easing: EGRI.giris,
            useNativeDriver: true,
        }).start();
    }, [gorunur, kimlik, azalt, deger]);

    if (!gorunur) return null;
    return (
        <Animated.View
            testID={testID}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={{
                marginTop: 14,
                alignItems: 'center',
                opacity: deger,
                transform: [{ translateY: deger.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
            }}
        >
            <Text style={{ color: renkler.metinIkincil, fontSize: 14, fontWeight: '500' }}>{metin}</Text>
        </Animated.View>
    );
});
