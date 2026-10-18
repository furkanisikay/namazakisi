/**
 * Satır içi kısa not — bilgi / uyarı / başarı (tek fikir, ≤ 12 kelime).
 *
 * Renk dekoratiftir (ikon); metin daima tema metni (kontrast tuzağı: `durum.dikkat`
 * metin rengi olarak KULLANILMAZ). Uyarıda sol kenar çizgisi biçimle de söyler.
 * Eylem gereken durumda `NotSatiri` değil `DurumSatiri` kullanın (sebep + tek düğme).
 */
import * as React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';

export type NotTipi = 'bilgi' | 'uyari' | 'basari';

export interface NotSatiriProps {
    metin: string;
    tip?: NotTipi;
    /** Varsayılan ikonun yerine (ör. 'mobile-alt'). */
    ikon?: string;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

export const NotSatiri: React.FC<NotSatiriProps> = ({ metin, tip = 'bilgi', ikon, style, testID }) => {
    const renkler = useRenkler();
    const t = {
        bilgi: { ikon: 'info-circle', renk: renkler.bilgi },
        uyari: { ikon: 'exclamation-triangle', renk: renkler.dikkat },
        basari: { ikon: 'check-circle', renk: renkler.basarili },
    }[tip];
    return (
        <View
            testID={testID}
            accessible
            accessibilityLabel={metin}
            style={[
                { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
                tip === 'uyari' ? { borderLeftWidth: 3, borderLeftColor: t.renk, paddingLeft: 10 } : null,
                style,
            ]}
        >
            <FontAwesome5 name={ikon ?? t.ikon} size={13} color={t.renk} solid style={{ marginRight: 8, marginTop: 3 }} />
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: renkler.metin }}>{metin}</Text>
        </View>
    );
};
