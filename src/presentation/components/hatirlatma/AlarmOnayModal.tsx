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
    const ortak = {
        ikon: 'check-circle',
        metin: 'Alarm ekranından tek dokunuşla "Kıldım" diyebilir ya da 10 dakika erteleyebilirsiniz.',
    };
    if (platform === 'ios' && iosAlarmKitVarMi(alarmKit)) {
        return [
            {
                ikon: 'clock',
                metin: 'Bu adımın ilk hatırlatmasında iPhone\'unuzun alarmı çalar; sessiz anahtarı ve Odak açıkken de duyulur.',
            },
            alarmKit === 'reddedildi'
                ? {
                      ikon: 'cog',
                      metin: 'Alarm izni şu an kapalı. Ayarlar\'dan açana kadar bu adım uzun sesli bir bildirimle gelir.',
                  }
                : alarmKit === 'belirsiz'
                  ? { ikon: 'user-check', metin: 'Onayladığınızda iPhone\'unuz bir kez alarm izni isteyecek.' }
                  : { ikon: 'shield-alt', metin: 'Alarm izni verilmiş; ek bir adım gerekmez.' },
            {
                ikon: 'check-circle',
                metin: 'Alarm ekranından durdurabilir ya da 10 dakika erteleyebilirsiniz; vaktin çıkmasına az kaldıysa ikinci düğme "Kıldım" olur.',
            },
        ];
    }
    if (platform === 'ios' && alarmKit === null) {
        // Durum henüz okunmadı: iki olasılık da SÖYLENİR, hiçbiri kesin vaat edilmez.
        return [
            {
                ikon: 'clock',
                metin: "iPhone'unuz destekliyorsa ilk hatırlatmada alarm çalar; desteklemiyorsa zamana duyarlı bir bildirim ve yaklaşık 30 saniyelik bir sesle gelir.",
            },
            {
                ikon: 'info-circle',
                metin: 'Alarm desteklenmiyorsa sessiz anahtarı açıkken ses duyulmaz.',
            },
        ];
    }
    if (platform === 'ios') {
        return [
            {
                ikon: 'clock',
                metin: 'Bu adımın ilk hatırlatması zamana duyarlı bir bildirim ve yaklaşık 30 saniyelik bir sesle gelir; Odak modunu deler.',
            },
            {
                ikon: 'info-circle',
                // Sürüm cümlesi yalnız sürüm GERÇEKTEN eskiyse: iOS 26+ cihazda "desteklenmiyor"
                // geçici bir hata demektir ve "güncelleyin" demek yalan olurdu.
                metin:
                    iosAlarmKitYokNedeni(secenek.iosSurum) !== null
                        ? `iPhone'da sessiz anahtarı açıkken ses duyulmaz. Gerçek alarm iOS ${ALARMKIT_IOS_SURUMU} ve üzerinde çalışır; bu iPhone iOS ${secenek.iosSurum}.`
                        : "iPhone'da sessiz anahtarı açıkken ses duyulmaz.",
            },
            {
                // Bu dalda alarm ekranı YOK: "alarm ekranından Kıldım/ertele" yalan olurdu.
                // Bildirim düğmeleri yüzeye göre değişir (cuma/takvimde Kıldım yok) → kesin yazılmaz.
                ikon: 'bell',
                metin: 'Alarm ekranı açılmaz; hatırlatma bildirim olarak gelir, dokunarak uygulamayı açabilirsiniz.',
            },
        ];
    }
    return [
        {
            ikon: 'clock',
            metin: `Bu adımın ilk hatırlatmasında telefonunuzun alarmı çalar; siz kapatana kadar, en fazla ${ALARM_CALMA_SURESI_DK} dakika sürer.`,
        },
        {
            ikon: 'bell-slash',
            metin:
                secenek.tamEkran === false
                    ? 'Alarm gibi davranır: telefonunuz sessizde veya Rahatsız Etmeyin modundayken de duyulabilir. Kilit ekranında tam ekran açılması için ayrıca izin vermeniz gerekir.'
                    : 'Alarm gibi davranır: telefonunuz sessizde veya Rahatsız Etmeyin modundayken de duyulabilir, kilit ekranında tam ekran açılır.',
        },
        ortak,
        { ikon: 'mosque', metin: 'Camideyken alarm çalmaz; hatırlatma sessiz bildirim olarak gelir.' },
    ];
}

/** Başlığın alt satırı: AlarmKit durumu okunmadıysa (`null`) kesin bir vaat yok. */
export function alarmOnayAltBasligi(platform: MuhafizPlatformu, alarmKit: AlarmKitDurumu | null = null): string {
    if (platform !== 'ios' || iosAlarmKitVarMi(alarmKit)) return 'Telefonunuzun alarm uygulaması gibi çalar';
    if (alarmKit === null) return "iPhone'unuzun desteğine göre alarm ya da uzun sesli bildirim";
    return "Bu iPhone'da uzun sesli bildirim olarak gelir";
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
