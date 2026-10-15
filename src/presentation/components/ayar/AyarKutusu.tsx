/**
 * Ayar sayfalarındaki tek satırlık kutu: tonlu ikon çipi + başlık/açıklama +
 * sağda anahtar ya da başka bir denetim. Camideyim ve Namaz modu sayfaları
 * paylaşır (Nafile sayfasındaki `kartBasligi` görsel dilinin aynısı).
 *
 * Anahtar satırı saran bir Touchable'ın İÇİNE konmaz (AGENTS.md: TalkBack
 * çocukları tek düğüme düzleştirir) — burada satırın kendisi dokunulmaz.
 */
import React from 'react';
import { Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { Anahtar } from '../common/Anahtar';

export interface AyarKutusuProps {
    ikon: string;
    baslik: string;
    aciklama?: string;
    /** Verilirse sağda anahtar çizilir. */
    deger?: boolean;
    onDegis?: (v: boolean) => void;
    devreDisi?: boolean;
    /** Anahtar yerine özel denetim (ör. SayisalSecici). */
    sag?: React.ReactNode;
    testID?: string;
}

export const AyarKutusu: React.FC<AyarKutusuProps> = ({ ikon, baslik, aciklama, deger, onDegis, devreDisi, sag, testID }) => {
    const renkler = useRenkler();
    return (
        <View
            testID={testID}
            className="flex-row items-center p-3.5 rounded-2xl border mb-2"
            style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir, minHeight: 56 }}
        >
            <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${renkler.birincil}20` }}
            >
                <FontAwesome5 name={ikon} size={14} color={renkler.birincil} solid />
            </View>
            <View className="flex-1 pr-2">
                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                    {baslik}
                </Text>
                {aciklama ? (
                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                        {aciklama}
                    </Text>
                ) : null}
            </View>
            {sag}
            {deger !== undefined && onDegis ? (
                <Anahtar
                    value={deger}
                    onValueChange={onDegis}
                    disabled={devreDisi}
                    trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                    thumbColor={deger ? renkler.birincil : '#f4f3f4'}
                    accessibilityLabel={baslik}
                />
            ) : null}
        </View>
    );
};
