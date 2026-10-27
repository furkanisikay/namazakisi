/**
 * Rahatsız Etmeyin erişimi rehberi — Namaz modu (issue #277).
 *
 * Pil rehberi deseni (`PilRehberModal`): uygulama izin İSTEMEZ, telefonun kendi
 * erişim ekranını açar; o ekranda ne yapılacağı önceden üç adımla gösterilir.
 * Bottom-sheet: backdrop içeriği SARMAZ, kardeştir (AGENTS.md).
 */
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { canli } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

/** Erişim adımları (sözlük `cami.rehber.adimlar`; okunduğu an etkin dilde). */
export const ERISIM_ADIM_METINLERI: readonly string[] = canli((s) => s.cami.rehber.adimlar);

export interface NamazModuRehberModalProps {
    gorunur: boolean;
    onAc: () => void;
    onKapat: () => void;
}

export const NamazModuRehberModal: React.FC<NamazModuRehberModalProps> = ({ gorunur, onAc, onKapat }) => {
    const renkler = useRenkler();
    const m = useMetin().cami.rehber;
    useDonanimGeriTusu(gorunur, onKapat);

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onKapat}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableWithoutFeedback onPress={onKapat} accessibilityLabel={m.kapat}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>
                <View
                    testID="namaz-modu-rehberi"
                    style={{
                        backgroundColor: renkler.kartArkaplan,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingHorizontal: 20,
                        paddingTop: 10,
                        paddingBottom: 28,
                    }}
                >
                    <View className="self-center w-10 h-1 rounded-full mb-4" style={{ backgroundColor: renkler.sinir }} />
                    <View className="flex-row items-center mb-2">
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${renkler.birincil}20` }}
                        >
                            <FontAwesome5 name="moon" size={17} color={renkler.birincil} solid />
                        </View>
                        <Text className="text-base font-bold flex-1" style={{ color: renkler.metin }}>
                            {m.baslik}
                        </Text>
                    </View>
                    <Text className="text-sm mb-4" style={{ color: renkler.metinIkincil }}>
                        {m.aciklama}
                    </Text>

                    {m.adimlar.map((metin, i) => (
                        <View key={metin} className="flex-row items-start" style={{ marginTop: i === 0 ? 0 : 10 }}>
                            <View
                                className="w-7 h-7 rounded-full items-center justify-center mr-2.5"
                                style={{ backgroundColor: `${renkler.birincil}20` }}
                            >
                                <Text className="text-xs font-bold" style={{ color: renkler.birincil }}>
                                    {i + 1}
                                </Text>
                            </View>
                            <Text className="text-sm flex-1 leading-5" style={{ color: renkler.metin, paddingTop: 4 }}>
                                {metin}
                            </Text>
                        </View>
                    ))}

                    <View className="flex-row items-start mt-4">
                        <FontAwesome5 name="lock" size={11} color={renkler.metinIkincil} style={{ marginTop: 3, marginRight: 6 }} />
                        <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                            {m.gizlilik}
                        </Text>
                    </View>

                    <TouchableOpacity
                        className="flex-row items-center justify-center rounded-2xl mt-5"
                        style={{ backgroundColor: renkler.birincil, minHeight: 48 }}
                        onPress={onAc}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel={m.erisimAyari}
                    >
                        <FontAwesome5 name="external-link-alt" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                        <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                            {m.erisimAyari}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="items-center justify-center rounded-2xl mt-2.5"
                        style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 48 }}
                        onPress={onKapat}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={m.vazgecinErisim}
                    >
                        <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                            {m.vazgec}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
