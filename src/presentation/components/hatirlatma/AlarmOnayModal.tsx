/**
 * Gerçek alarm ilk-kez onayı (issue #74).
 *
 * NEDEN VAR: gerçek alarm `USAGE_ALARM` sesiyle çalar, kilit ekranında tam ekran açılır
 * ve sessiz modu / Rahatsız Etmeyin'i delebilir. Tek bir anahtar dokunuşuyla bunun
 * açılması kullanıcıyı şaşırtır → İLK açılışta ne olacağı anlatılır (`SesliOnayModal`
 * deseni). Onay kalıcıdır (`muhafizSlice.alarmOnayi`) ve yalnız BURADA verilir.
 *
 * Geri tuşu / backdrop / "Vazgeç" = hiçbir şey yazılmaz (anahtar kapalı kalır).
 */
import * as React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { ALARM_CALMA_SURESI_DK } from '../../../core/muhafiz/alarmYuku';
import type { MuhafizPlatformu } from '../../../core/muhafiz/ios/platformYetenekleri';

export interface AlarmOnayModalProps {
    gorunur: boolean;
    platform: MuhafizPlatformu;
    onOnayla: () => void;
    /** Geri tuşu / backdrop / "Vazgeç": HİÇBİR ŞEY yazılmaz. */
    onIptal: () => void;
}

/** Maddeler platforma göre — iPhone'da gerçek alarm henüz yok, söylenmeli (sessiz sapma yok). */
export function alarmOnayMaddeleri(platform: MuhafizPlatformu): { ikon: string; metin: string }[] {
    const ortak = {
        ikon: 'check-circle',
        metin: 'Alarm ekranından tek dokunuşla "Kıldım" diyebilir ya da 10 dakika erteleyebilirsiniz.',
    };
    if (platform === 'ios') {
        return [
            {
                ikon: 'clock',
                metin: 'Bu adımın ilk hatırlatması zamana duyarlı bir bildirim ve yaklaşık 30 saniyelik bir sesle gelir; Odak modunu deler.',
            },
            {
                ikon: 'info-circle',
                metin: 'iPhone\'da sessiz anahtarı açıkken ses duyulmaz. Gerçek alarm iOS 26 AlarmKit desteğiyle gelecek.',
            },
            ortak,
        ];
    }
    return [
        {
            ikon: 'clock',
            metin: `Bu adımın ilk hatırlatmasında telefonunuzun alarmı çalar; siz kapatana kadar, en fazla ${ALARM_CALMA_SURESI_DK} dakika sürer.`,
        },
        {
            ikon: 'bell-slash',
            metin: 'Alarm gibi davranır: telefonunuz sessizde veya Rahatsız Etmeyin modundayken de duyulabilir, kilit ekranında tam ekran açılır.',
        },
        ortak,
        { ikon: 'mosque', metin: 'Camideyken alarm çalmaz; hatırlatma sessiz bildirim olarak gelir.' },
    ];
}

export const AlarmOnayModal: React.FC<AlarmOnayModalProps> = ({ gorunur, platform, onOnayla, onIptal }) => {
    const renkler = useRenkler();
    useDonanimGeriTusu(gorunur, onIptal);

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onIptal}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {/* Backdrop — absolute sibling; dokunmak VAZGEÇER */}
                <TouchableWithoutFeedback onPress={onIptal}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    style={{
                        width: '88%',
                        maxWidth: 420,
                        backgroundColor: renkler.kartArkaplan,
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: renkler.sinir,
                    }}
                >
                    <View className="flex-row items-center mb-3">
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${renkler.birincil}20` }}
                        >
                            <FontAwesome5 name="clock" size={17} color={renkler.birincil} solid />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                Gerçek alarm açılsın mı?
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                {platform === 'ios'
                                    ? 'iPhone\'da şimdilik uzun sesli bildirim olarak gelir'
                                    : 'Telefonunuzun alarm uygulaması gibi çalar'}
                            </Text>
                        </View>
                    </View>

                    {alarmOnayMaddeleri(platform).map(({ ikon, metin }) => (
                        <View key={ikon} className="flex-row items-start mb-2.5">
                            <FontAwesome5
                                name={ikon}
                                size={12}
                                color={renkler.birincil}
                                solid
                                style={{ marginRight: 10, marginTop: 3 }}
                            />
                            <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metinIkincil }}>
                                {metin}
                            </Text>
                        </View>
                    ))}

                    <Text className="text-xs leading-4 mt-1" style={{ color: renkler.metinIkincil }}>
                        Dilediğiniz zaman aynı anahtardan kapatabilirsiniz.
                    </Text>

                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity
                            className="flex-1 items-center justify-center py-3.5 rounded-2xl"
                            style={{
                                minHeight: 44,
                                backgroundColor: renkler.arkaplan,
                                borderWidth: 1,
                                borderColor: renkler.sinir,
                            }}
                            onPress={onIptal}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel="Vazgeç"
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                                Vazgeç
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-[1.4] flex-row items-center justify-center py-3.5 rounded-2xl"
                            style={{ minHeight: 44, backgroundColor: renkler.birincil }}
                            onPress={onOnayla}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Alarmı açın"
                        >
                            <FontAwesome5 name="check" size={13} color="#FFF" style={{ marginRight: 8 }} />
                            <Text className="text-sm font-bold" style={{ color: '#FFF' }}>
                                Alarmı açın
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
