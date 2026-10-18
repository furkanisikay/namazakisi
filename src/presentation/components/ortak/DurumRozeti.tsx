/**
 * Namaz durumu rozeti — tek sözlükten (`core/vakit/durumSozlugu`): Kılındı / Vakti geldi /
 * Henüz girmedi. Renk + ikon + metin birlikte (renk tek başına bilgi taşımaz).
 */
import * as React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { NAMAZ_DURUMLARI, type NamazDurumu } from '../../../core/vakit/durumSozlugu';

export interface DurumRozetiProps {
    durum: NamazDurumu;
    /** Yalnız ikon (dar satır); metin yine ekran okuyucuya gider. */
    yalnizIkon?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const DurumRozeti: React.FC<DurumRozetiProps> = ({ durum, yalnizIkon = false, style }) => {
    const renkler = useRenkler();
    const t = NAMAZ_DURUMLARI[durum];
    const renk = renkler[t.renk];
    return (
        <View
            accessible
            accessibilityLabel={t.etiket}
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    paddingHorizontal: yalnizIkon ? 6 : 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: renk + '20',
                },
                style,
            ]}
        >
            <FontAwesome5 name={t.ikon} size={12} color={renk} solid />
            {yalnizIkon ? null : (
                <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: '600', color: renkler.metin }}>{t.etiket}</Text>
            )}
        </View>
    );
};
