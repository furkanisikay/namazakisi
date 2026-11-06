/**
 * Tek seçimli çip grubu (Camideyim ayarları: sekmeler, açılış biçimi, izleme kapsamı).
 * Seçili çip birincil renkte çerçevelenir; erişilebilirlikte radyo düğmesi gibi okunur.
 */
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';

export interface Secenek<T extends string> {
    deger: T;
    etiket: string;
    ikon?: string;
}

interface Props<T extends string> {
    secenekler: readonly Secenek<T>[];
    secili: T;
    onSec: (deger: T) => void;
    /** Erişilebilirlik grubu adı (ör. "Açılış biçimi"). */
    grupEtiketi: string;
    /** 'sekme' → sayfa sekmeleri (tab rolü). */
    rol?: 'radio' | 'tab';
    testIDOnEki?: string;
}

export function SecenekCipleri<T extends string>({ secenekler, secili, onSec, grupEtiketi, rol = 'radio', testIDOnEki }: Props<T>) {
    const renkler = useRenkler();
    return (
        <View
            className="flex-row gap-2"
            accessibilityRole={rol === 'tab' ? 'tablist' : 'radiogroup'}
            accessibilityLabel={grupEtiketi}
        >
            {secenekler.map((s) => {
                const sec = s.deger === secili;
                return (
                    <TouchableOpacity
                        key={s.deger}
                        testID={testIDOnEki ? `${testIDOnEki}-${s.deger}` : undefined}
                        className="flex-1 flex-row items-center justify-center rounded-2xl px-2 py-1.5"
                        style={{
                            minHeight: 44,
                            borderWidth: sec ? 2 : 1,
                            borderColor: sec ? renkler.birincil : renkler.sinir,
                            backgroundColor: sec ? `${renkler.birincil}18` : renkler.arkaplan,
                        }}
                        onPress={() => onSec(s.deger)}
                        accessibilityRole={rol}
                        accessibilityState={{ selected: sec, checked: rol === 'radio' ? sec : undefined }}
                        accessibilityLabel={s.etiket}
                    >
                        {s.ikon ? (
                            <FontAwesome5 name={s.ikon} size={12} color={sec ? renkler.birincil : renkler.metinIkincil} style={{ marginRight: 6 }} />
                        ) : null}
                        <Text
                            className="text-xs font-semibold text-center"
                            // Seçililik çerçeve + ikonla okunur; metin daima tema metni (yeşil küçük metin kontrastı düşük).
                            // flexShrink: uzun etiket çipin içinde sarılır; yoksa metin tam genişlikte
                            // ölçülüp ortalanır ve ikon çipin dışına itilir (ta/ml kare turu).
                            style={{ color: renkler.metin, fontWeight: sec ? '700' : '600', flexShrink: 1 }}
                            numberOfLines={3}
                        >
                            {s.etiket}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
