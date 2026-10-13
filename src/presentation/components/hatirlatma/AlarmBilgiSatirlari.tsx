/**
 * Gerçek alarm anahtarının altındaki bilgi/izin satırları (issue #74).
 * Metinler saf `core/muhafiz/alarmNotlari.ts`'ten gelir; burada yalnız çizilir.
 */
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import type { AlarmNotu } from '../../../core/muhafiz/alarmNotlari';

export { alarmNotlariniOlustur } from '../../../core/muhafiz/alarmNotlari';

export interface AlarmBilgiSatirlariProps {
    notlar: AlarmNotu[];
    /** Tam ekran izni ayarını açar. */
    onIzinAyari: () => void;
}

export const AlarmBilgiSatirlari: React.FC<AlarmBilgiSatirlariProps> = ({ notlar, onIzinAyari }) => {
    const renkler = useRenkler();
    if (notlar.length === 0) return null;
    return (
        <View className="mt-3">
            {notlar.map((not) => {
                const renk = not.tip === 'uyari' ? renkler.durum.dikkat : renkler.durum.bilgi;
                return (
                    <View key={not.metin} className="flex-row items-start mt-1.5">
                        <FontAwesome5
                            name={not.tip === 'uyari' ? 'exclamation-circle' : 'info-circle'}
                            size={12}
                            color={renk}
                            solid
                            style={{ marginRight: 8, marginTop: 2 }}
                        />
                        <View className="flex-1">
                            <Text className="text-xs leading-4" style={{ color: renkler.metinIkincil }}>
                                {not.metin}
                            </Text>
                            {not.eylem === 'tamEkranIzni' && (
                                <TouchableOpacity
                                    className="self-start flex-row items-center justify-center rounded-2xl mt-2 px-4"
                                    style={{ minHeight: 44, backgroundColor: renkler.birincil }}
                                    onPress={onIzinAyari}
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel="Tam ekran iznini açın"
                                >
                                    <FontAwesome5 name="unlock-alt" size={12} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text className="text-sm font-bold" style={{ color: '#FFF' }}>
                                        İzni açın
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};
