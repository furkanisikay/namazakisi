/**
 * PARÇALI SEÇİCİ (segmented control) — birleşik hatırlatma modülü §3.2/§3.5.
 *
 * Birbirini DIŞLAYAN kısa seçimler (yön: 2, yoğunluk: 3–4) için. Eskiden her seçenek ikon +
 * başlık + açıklama taşıyan büyük bir karttı; seçimler tek satıra iner, seçili seçeneğin
 * açıklaması çağıranın altına yazdığı TEK satırdır (NN/g: tek seçim = radyo/parçalı; bağımsız
 * evet/hayır = anahtar).
 *
 * Görsel dil: seçili parça birincil buton desenidir (dolu `birincil` + beyaz metin), diğerleri
 * zeminsiz. Her parça ≥44dp, `accessibilityState.selected` taşır.
 */
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';

export interface ParcaliSecenek<T extends string> {
    deger: T;
    etiket: string;
    ikon?: string;
    /** Ekran okuyucu etiketi; verilmezse `etiket`. */
    erisimEtiketi?: string;
    testID?: string;
}

export interface ParcaliSeciciProps<T extends string> {
    secenekler: ParcaliSecenek<T>[];
    /** Seçili değer; hiçbiri seçili değilse `null`. */
    secili: T | null;
    onSec: (deger: T) => void;
}

export function ParcaliSecici<T extends string>({ secenekler, secili, onSec }: ParcaliSeciciProps<T>) {
    const renkler = useRenkler();
    return (
        <View
            className="flex-row rounded-2xl border p-1"
            style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
            accessibilityRole="radiogroup"
        >
            {secenekler.map((s) => {
                const seciliMi = s.deger === secili;
                return (
                    <TouchableOpacity
                        key={s.deger}
                        testID={s.testID}
                        className="flex-1 flex-row items-center justify-center rounded-xl px-1.5"
                        style={{ minHeight: 44, backgroundColor: seciliMi ? renkler.birincil : 'transparent' }}
                        onPress={() => onSec(s.deger)}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityState={{ selected: seciliMi }}
                        accessibilityLabel={s.erisimEtiketi ?? s.etiket}
                    >
                        {s.ikon && (
                            <FontAwesome5
                                name={s.ikon}
                                size={12}
                                color={seciliMi ? '#FFFFFF' : renkler.metinIkincil}
                                style={{ marginRight: 6 }}
                                solid
                            />
                        )}
                        <Text
                            className="text-xs font-semibold"
                            numberOfLines={1}
                            style={{ color: seciliMi ? '#FFFFFF' : renkler.metin }}
                        >
                            {s.etiket}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
