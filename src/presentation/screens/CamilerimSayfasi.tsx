/**
 * Camilerim — Namazda sessiz'in harita alt sayfası (sade tasarım, Dalga 3). Eskiden
 * Camideyim sayfasının iç "Harita" sekmesiydi; iç sekme çubuğu kalktı. Harita bileşeni
 * ve yazma yolu (`useCamideyim` → native) aynıdır.
 */
import * as React from 'react';
import { Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useCamideyim } from '../hooks/useCamideyim';
import { CamiHaritasi } from '../components/cami/CamiHaritasi';

export const CamilerimSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const c = useCamideyim();
    if (!c.kullanilabilir) {
        return (
            <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: renkler.arkaplan }}>
                <FontAwesome5 name="mosque" size={28} color={renkler.metinIkincil} solid />
                <Text style={{ fontSize: 14, textAlign: 'center', marginTop: 12, color: renkler.metinIkincil }}>
                    Camilerim bu telefonda yok.
                </Text>
            </View>
        );
    }
    return (
        <View style={{ flex: 1, backgroundColor: renkler.arkaplan }}>
            <CamiHaritasi c={c} />
        </View>
    );
};

export default CamilerimSayfasi;
