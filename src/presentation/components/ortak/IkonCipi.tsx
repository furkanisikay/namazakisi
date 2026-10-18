/**
 * Tonlu ikon çipi — `renk + '20'` zemin, `rounded-2xl`, FontAwesome5 (tek görsel dil).
 * Boyutlar: kucuk 36 · orta 44 (varsayılan, dokunma hedefiyle aynı) · buyuk 56.
 * Dekoratiftir: ekran okuyucudan gizlenir (anlamı yanındaki metin taşır).
 */
import * as React from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';

export type IkonCipiBoyutu = 'kucuk' | 'orta' | 'buyuk';

const OLCU: Record<IkonCipiBoyutu, { kutu: number; ikon: number; radius: number }> = {
    kucuk: { kutu: 36, ikon: 14, radius: 12 },
    orta: { kutu: 44, ikon: 17, radius: 16 },
    buyuk: { kutu: 56, ikon: 22, radius: 20 },
};

export interface IkonCipiProps {
    ikon: string;
    /** Varsayılan `birincil`. Sabit renk değil, tema token'ı verin. */
    renk?: string;
    boyut?: IkonCipiBoyutu;
    /** Kapalı/pasif durum: gri çip (renk tek başına bilgi taşımaz — ikonu da `-slash` seçin). */
    soluk?: boolean;
    /** `useYayVurgu` gibi bir ölçek değeri (anahtar değişince ikon yaylanır). */
    olcek?: Animated.Value;
    style?: StyleProp<ViewStyle>;
}

export const IkonCipi: React.FC<IkonCipiProps> = ({ ikon, renk, boyut = 'orta', soluk = false, olcek, style }) => {
    const renkler = useRenkler();
    const r = soluk ? renkler.metinIkincil : (renk ?? renkler.birincil);
    const o = OLCU[boyut];
    return (
        <Animated.View
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={[
                {
                    width: o.kutu,
                    height: o.kutu,
                    borderRadius: o.radius,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: r + '20',
                },
                olcek ? { transform: [{ scale: olcek }] } : null,
                style,
            ]}
        >
            <FontAwesome5 name={ikon} size={o.ikon} color={r} solid />
        </Animated.View>
    );
};
