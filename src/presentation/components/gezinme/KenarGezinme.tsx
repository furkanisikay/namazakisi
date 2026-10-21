/**
 * Tablet / iPad gezinme yüzeyi — alt sekme çubuğunun geniş ekran karşılığı.
 *
 * - `ray` (600–839 dp, Material 3 navigation rail): 80 dp, ikon üstte etiket altta,
 *   seçili sekmede ikonun arkasında tonlu hap.
 * - `kenar` (≥840 dp; iPadOS kenar çubuğu / Material kalıcı gezinme): 220 dp, üstte
 *   uygulama adı, ikon + etiket yan yana, seçili satır tonlu zemin.
 *
 * `Tab.Navigator`'ın `tabBar`'ı olarak verilir (`tabBarPosition: 'left'`). Sekme
 * tanımları (ikon, etiket, rozet, sade görünümde gizleme) AppNavigator'daki tek
 * kaynaktan okunur; telefonun alt çubuğu birebir eskisi kalır.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRenkler } from '../../../core/theme';
import { KENAR_GENISLIGI_DP, RAY_GENISLIGI_DP, type GezinmeTuru } from '../../../core/utils/ekranSinifi';

interface Props extends BottomTabBarProps {
    tur: Exclude<GezinmeTuru, 'alt'>;
}

export const KenarGezinme: React.FC<Props> = ({ state, descriptors, navigation, insets, tur }) => {
    const renkler = useRenkler();
    const odak = descriptors[state.routes[state.index].key]?.options;
    // Sade görünüm sekme çubuğunu gizler (`tabBarStyle: { display: 'none' }`); kenar da gizlenir.
    const gizli = (odak?.tabBarStyle as { display?: string } | undefined)?.display === 'none';
    if (gizli) return null;

    const kenar = tur === 'kenar';
    return (
        <View
            testID={kenar ? 'kenar-gezinme' : 'ray-gezinme'}
            accessibilityRole="tablist"
            style={[
                stil.kok,
                {
                    width: (kenar ? KENAR_GENISLIGI_DP : RAY_GENISLIGI_DP) + insets.left,
                    paddingLeft: insets.left,
                    paddingTop: insets.top + (kenar ? 20 : 16),
                    paddingBottom: insets.bottom + 12,
                    backgroundColor: renkler.kartArkaplan,
                    borderRightColor: renkler.sinir,
                },
            ]}
        >
            {kenar ? (
                <Text className="text-xl font-bold px-5 mb-6" style={{ color: renkler.metin }} accessibilityRole="header">
                    Namaz Akışı
                </Text>
            ) : null}
            {state.routes.map((route, i) => {
                const options = descriptors[route.key].options;
                const odakli = state.index === i;
                const etiket =
                    typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;
                const renk = odakli ? renkler.birincil : renkler.metinIkincil;
                const ikon = options.tabBarIcon?.({ focused: odakli, color: renk, size: 20 });
                const rozet = options.tabBarBadge !== undefined;
                const bas = () => {
                    const olay = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!odakli && !olay.defaultPrevented) navigation.navigate(route.name, route.params);
                };
                return (
                    <Pressable
                        key={route.key}
                        onPress={bas}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: odakli }}
                        accessibilityLabel={rozet ? `${etiket}, yeni` : etiket}
                        testID={`gezinme-${route.name}`}
                        style={kenar ? stil.kenarSatir : stil.raySatir}
                    >
                        <View
                            style={[
                                kenar ? stil.kenarZemin : stil.rayHap,
                                odakli && { backgroundColor: renkler.birincil + '20' },
                            ]}
                        >
                            <View>
                                {ikon}
                                {rozet ? <View style={[stil.rozet, { backgroundColor: renkler.birincil }]} /> : null}
                            </View>
                            {kenar ? (
                                <Text
                                    className="text-base ml-4"
                                    style={{ color: renkler.metin, fontWeight: odakli ? '700' : '500' }}
                                >
                                    {etiket}
                                </Text>
                            ) : null}
                        </View>
                        {!kenar ? (
                            <Text
                                className="text-xs mt-1"
                                style={{ color: odakli ? renkler.metin : renkler.metinIkincil, fontWeight: odakli ? '700' : '500' }}
                                numberOfLines={1}
                            >
                                {etiket}
                            </Text>
                        ) : null}
                    </Pressable>
                );
            })}
        </View>
    );
};

const stil = StyleSheet.create({
    kok: { borderRightWidth: StyleSheet.hairlineWidth, height: '100%' },
    raySatir: { alignItems: 'center', marginBottom: 12, minHeight: 56 },
    rayHap: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    kenarSatir: { paddingHorizontal: 12, marginBottom: 4 },
    kenarZemin: { flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 14, borderRadius: 14 },
    rozet: { position: 'absolute', top: -2, right: -6, width: 9, height: 9, borderRadius: 5 },
});
