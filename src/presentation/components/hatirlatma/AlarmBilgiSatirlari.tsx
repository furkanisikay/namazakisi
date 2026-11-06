/**
 * Gerçek alarm anahtarının altındaki bilgi/izin satırları (issue #74).
 * Metinler saf `core/muhafiz/alarmNotlari.ts`'ten gelir; burada yalnız çizilir.
 */
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import type { AlarmNotu } from '../../../core/muhafiz/alarmNotlari';
import { useMetin } from '../../hooks/useMetin';

export { alarmNotlariniOlustur } from '../../../core/muhafiz/alarmNotlari';

export interface AlarmBilgiSatirlariProps {
    notlar: AlarmNotu[];
    /** İzin ayarını açar (Android tam ekran izni; iOS uygulamanın Ayarlar sayfası). */
    onIzinAyari: () => void;
    /** iOS: sistem alarm izni penceresini açar (AlarmKit, iOS 26). */
    onAlarmIzni?: () => void;
    /** Android: "Alarmlar ve hatırlatıcılar" (tam alarm) izin ekranını açar. */
    onTamAlarm?: () => void;
}

/** Eylem düğmesinin görünüşü — metin ve ikon eyleme göre. */
const EYLEM_IKONLARI: Record<NonNullable<AlarmNotu['eylem']>, string> = {
    tamEkranIzni: 'unlock-alt',
    ayarlar: 'cog',
    alarmIzni: 'clock',
    tamAlarm: 'stopwatch',
};

export const AlarmBilgiSatirlari: React.FC<AlarmBilgiSatirlariProps> = ({ notlar, onIzinAyari, onAlarmIzni, onTamAlarm }) => {
    const renkler = useRenkler();
    const eylemler = useMetin().hatirlatma.alarmEylem;
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
                            {not.eylem &&
                                (not.eylem !== 'alarmIzni' || onAlarmIzni) &&
                                (not.eylem !== 'tamAlarm' || onTamAlarm) && (
                                <TouchableOpacity
                                    className="self-start flex-row items-center justify-center rounded-2xl mt-2 px-4"
                                    style={{ minHeight: 44, backgroundColor: renkler.birincil }}
                                    onPress={
                                        not.eylem === 'alarmIzni' ? onAlarmIzni : not.eylem === 'tamAlarm' ? onTamAlarm : onIzinAyari
                                    }
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={eylemler[not.eylem].etiket}
                                >
                                    <FontAwesome5
                                        name={EYLEM_IKONLARI[not.eylem]}
                                        size={12}
                                        color="#FFF"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text className="text-sm font-bold" style={{ color: '#FFF' }}>
                                        {eylemler[not.eylem].metin}
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
