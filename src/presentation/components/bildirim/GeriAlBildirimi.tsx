/**
 * "Uygulandı · GERİ AL" şeridi (issue #298) — öneri tek dokunuşla uygulanır,
 * bu şeritten tek dokunuşla geri alınır. Birkaç saniye sonra kendiliğinden
 * kapanır. `kisaBildirimGoster` eylem düğmesi taşımadığı için ayrı bileşen.
 *
 * Renkler tersine çevrilmiş tema tokenlarıdır (zemin `metin`, yazı
 * `kartArkaplan`): iki temada da yüksek kontrastlı snackbar.
 */
import * as React from 'react';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useMetin } from '../../hooks/useMetin';

export const GERI_AL_SURESI_MS = 8000;

interface Props {
    metin: string | null;
    onGeriAl: () => void;
    onKapat: () => void;
}

export const GeriAlBildirimi: React.FC<Props> = ({ metin, onGeriAl, onKapat }) => {
    const renkler = useRenkler();
    const mg = useMetin().hatirlatma.geriAl;

    useEffect(() => {
        if (!metin) return;
        const zamanlayici = setTimeout(onKapat, GERI_AL_SURESI_MS);
        return () => clearTimeout(zamanlayici);
    }, [metin, onKapat]);

    if (!metin) return null;

    return (
        <View
            testID="geri-al-bildirimi"
            accessibilityLiveRegion="polite"
            className="flex-row items-center rounded-2xl px-4"
            style={{
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: 24,
                minHeight: 52,
                backgroundColor: renkler.metin,
                elevation: 6,
            }}
        >
            <FontAwesome5 name="check-circle" size={14} color={renkler.kartArkaplan} solid />
            <Text className="text-sm flex-1 mx-3 py-3" style={{ color: renkler.kartArkaplan }}>
                {metin}
            </Text>
            <TouchableOpacity
                onPress={onGeriAl}
                accessibilityRole="button"
                accessibilityLabel={mg.etiket}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="justify-center"
                style={{ minHeight: 44 }}
            >
                <Text className="text-sm font-bold" style={{ color: renkler.kartArkaplan }}>
                    {mg.buyuk}
                </Text>
            </TouchableOpacity>
        </View>
    );
};
