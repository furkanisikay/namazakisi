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
import type { AlarmKitDurumu } from '../../../core/muhafiz/ios/alarmKit';
import { ALARMKIT_IOS_SURUMU, iosAlarmKitYokNedeni } from '../../../core/muhafiz/alarmNotlari';
import { bicim, metin as sozlukMetni } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

export interface AlarmOnayModalProps {
    gorunur: boolean;
    platform: MuhafizPlatformu;
    /** iOS AlarmKit durumu (iOS 26) — maddeler buna göre; `null` bilinmiyor. */
    alarmKit?: AlarmKitDurumu | null;
    /** iOS ana sürümü; `null` bilinmiyor (sürüm cümlesi SÖYLENMEZ). */
    iosSurum?: number | null;
    /** Android tam ekran izni; `false` ise "tam ekran açılır" yerine izin şartı söylenir. */
    tamEkran?: boolean | null;
    onOnayla: () => void;
    /** Geri tuşu / backdrop / "Vazgeç": HİÇBİR ŞEY yazılmaz. */
    onIptal: () => void;
}

/** iPhone'da AlarmKit (iOS 26) kullanılabilir mi — izin verilmemiş olsa da istenebilir mi? */
export const iosAlarmKitVarMi = (alarmKit: AlarmKitDurumu | null | undefined): boolean =>
    alarmKit === 'belirsiz' || alarmKit === 'izinli' || alarmKit === 'reddedildi';

/** Maddeler platforma göre — iPhone'da ne olacağı AlarmKit durumuna bağlı (sessiz sapma yok). */
export function alarmOnayMaddeleri(
    platform: MuhafizPlatformu,
    alarmKit: AlarmKitDurumu | null = null,
    secenek: { iosSurum?: number | null; tamEkran?: boolean | null } = {}
): { ikon: string; metin: string }[] {
    const a = sozlukMetni().hatirlatma.alarmOnay;
    const ortak = { ikon: 'check-circle', metin: a.ortak };
    if (platform === 'ios' && iosAlarmKitVarMi(alarmKit)) {
        return [
            {
                ikon: 'clock',
                metin: a.iosIlk,
            },
            alarmKit === 'reddedildi'
                ? {
                      ikon: 'cog',
                      metin: a.iosReddedildi,
                  }
                : alarmKit === 'belirsiz'
                  ? { ikon: 'user-check', metin: a.iosBelirsiz }
                  : { ikon: 'shield-alt', metin: a.iosIzinli },
            {
                ikon: 'check-circle',
                metin: a.iosDurdur,
            },
        ];
    }
    if (platform === 'ios' && alarmKit === null) {
        // Durum henüz okunmadı: iki olasılık da SÖYLENİR, hiçbiri kesin vaat edilmez.
        return [
            {
                ikon: 'clock',
                metin: a.iosBilinmiyor,
            },
            {
                ikon: 'info-circle',
                metin: a.iosBilinmiyorSessiz,
            },
        ];
    }
    if (platform === 'ios') {
        return [
            {
                ikon: 'clock',
                metin: a.iosYok,
            },
            {
                ikon: 'info-circle',
                // Sürüm cümlesi yalnız sürüm GERÇEKTEN eskiyse: iOS 26+ cihazda "desteklenmiyor"
                // geçici bir hata demektir ve "güncelleyin" demek yalan olurdu.
                metin:
                    iosAlarmKitYokNedeni(secenek.iosSurum) !== null
                        ? bicim(a.iosSessizSurum, { gerekli: ALARMKIT_IOS_SURUMU, surum: secenek.iosSurum ?? '' })
                        : a.iosSessiz,
            },
            {
                // Bu dalda alarm ekranı YOK: "alarm ekranından Kıldım" yalan olurdu.
                // Bildirim düğmeleri yüzeye göre değişir (cuma/takvimde Kıldım yok) → kesin yazılmaz.
                ikon: 'bell',
                metin: a.iosEkranYok,
            },
        ];
    }
    return [
        {
            ikon: 'clock',
            metin: bicim(a.androidIlk, { dk: ALARM_CALMA_SURESI_DK }),
        },
        {
            ikon: 'bell-slash',
            metin:
                secenek.tamEkran === false ? a.androidIzinsiz : a.android,
        },
        ortak,
        { ikon: 'mosque', metin: a.camide },
    ];
}

/** Başlığın alt satırı: AlarmKit durumu okunmadıysa (`null`) kesin bir vaat yok. */
export function alarmOnayAltBasligi(platform: MuhafizPlatformu, alarmKit: AlarmKitDurumu | null = null): string {
    const a = sozlukMetni().hatirlatma.alarmOnay;
    if (platform !== 'ios' || iosAlarmKitVarMi(alarmKit)) return a.altBaslik;
    if (alarmKit === null) return a.altBaslikBilinmiyor;
    return a.altBaslikYok;
}

export const AlarmOnayModal: React.FC<AlarmOnayModalProps> = ({
    gorunur,
    platform,
    alarmKit = null,
    iosSurum = null,
    tamEkran = null,
    onOnayla,
    onIptal,
}) => {
    const renkler = useRenkler();
    const ma = useMetin().hatirlatma.alarmOnay;
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
                                {ma.baslik}
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                {alarmOnayAltBasligi(platform, alarmKit)}
                            </Text>
                        </View>
                    </View>

                    {alarmOnayMaddeleri(platform, alarmKit, { iosSurum, tamEkran }).map(({ ikon, metin }) => (
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
                        {ma.kapatmaNotu}
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
                            accessibilityLabel={ma.vazgec}
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                                {ma.vazgec}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-[1.4] flex-row items-center justify-center py-3.5 rounded-2xl"
                            style={{ minHeight: 44, backgroundColor: renkler.birincil }}
                            onPress={onOnayla}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel={ma.onayla}
                        >
                            <FontAwesome5 name="check" size={13} color="#FFF" style={{ marginRight: 8 }} />
                            <Text className="text-sm font-bold" style={{ color: '#FFF' }}>
                                {ma.onayla}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
