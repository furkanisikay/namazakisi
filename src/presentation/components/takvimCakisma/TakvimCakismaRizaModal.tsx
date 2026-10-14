/**
 * Takvim çakışması uyarısı — AÇIK RIZA modalı (issue #291).
 *
 * Başka takvimleri okumak bir kapsam genişlemesidir: özellik ancak kullanıcı
 * bu açıklamayı EKRANDA görüp "Kabul ediyorum" dediğinde açılır (rıza kaydı
 * `rizaZamani` yalnız buradan doğar). Geri tuşu / backdrop / "Vazgeç" =
 * hiçbir şey yazılmaz (sesli onay modalındaki "geri tuşu = vazgeç" dersi).
 *
 * Görsel dil `KerahatOnayModal` / `BildirimModali` ile aynı: fade + şeffaf,
 * backdrop içeriğin KARDEŞİ, `useDonanimGeriTusu`.
 */
import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';

interface TakvimCakismaRizaModalProps {
    gorunur: boolean;
    onKabul: () => void;
    onVazgec: () => void;
}

interface Madde {
    ikon: string;
    metin: string;
}

const MADDELER: Madde[] = [
    {
        ikon: 'clock',
        metin:
            'Takvimlerinizdeki etkinliklerin yalnızca başlangıç ve bitiş saatleri, "tüm gün" ve "meşgul" bilgisi okunur.',
    },
    {
        ikon: 'eye-slash',
        metin:
            'Etkinlik adı varsayılan olarak bildirimde yer almaz; "Takvimindeki bir etkinlik" yazar. Adı göstermeyi siz açabilirsiniz; açarsanız ad, bildirimle birlikte kilit ekranında ve bildirimleri aynalayan saat, bileklik ya da benzeri uygulamalarda da görünebilir.',
    },
    {
        ikon: 'mobile-alt',
        metin:
            'İşlem yalnızca bu cihazda yapılır. Takvim bilgileriniz saklanmaz, yedeğe girmez ve hiçbir yere gönderilmez.',
    },
    {
        ikon: 'toggle-off',
        metin: 'Uyarıyı istediğiniz an kapatabilirsiniz; takvim iznini sistem ayarlarından da geri alabilirsiniz.',
    },
];

export const TakvimCakismaRizaModal: React.FC<TakvimCakismaRizaModalProps> = ({ gorunur, onKabul, onVazgec }) => {
    const renkler = useRenkler();
    useDonanimGeriTusu(gorunur, onVazgec);

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onVazgec}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableWithoutFeedback onPress={onVazgec} accessibilityLabel="Vazgeçin">
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    style={{
                        width: '88%',
                        maxWidth: 420,
                        maxHeight: '86%',
                        backgroundColor: renkler.kartArkaplan,
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: renkler.sinir,
                    }}
                >
                    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                        <View className="flex-row items-center mb-3">
                            <View
                                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: renkler.birincil + '20' }}
                            >
                                <FontAwesome5 name="calendar-check" size={18} color={renkler.birincil} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                    Takviminiz okunsun mu?
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    Takvim çakışması uyarısı için gerekli
                                </Text>
                            </View>
                        </View>

                        <Text className="text-sm leading-5 mb-4" style={{ color: renkler.metin }}>
                            Bir etkinlik, bittiğinde vaktin çıkmasına çok az süre bırakıyorsa sizi önceden
                            uyarabilmemiz için cihazınızdaki takvimlere bakmamız gerekiyor.
                        </Text>

                        <View
                            className="rounded-xl p-3 mb-5"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                        >
                            {MADDELER.map((m, i) => (
                                <View key={m.ikon} className={`flex-row items-start ${i > 0 ? 'mt-3' : ''}`}>
                                    <View className="w-6 items-center" style={{ marginTop: 2 }}>
                                        <FontAwesome5 name={m.ikon} size={13} color={renkler.birincil} />
                                    </View>
                                    <Text className="text-sm leading-5 flex-1 ml-2" style={{ color: renkler.metin }}>
                                        {m.metin}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <Text className="text-xs leading-4 mb-5" style={{ color: renkler.metinIkincil }}>
                            Kabul ettiğinizde sistem sizden takvim iznini isteyecek.
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 items-center justify-center py-3.5 rounded-2xl"
                                style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 44 }}
                                onPress={onVazgec}
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
                                style={{ backgroundColor: renkler.birincil, minHeight: 44 }}
                                onPress={onKabul}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel="Kabul ediyorum, takvim iznini isteyin"
                            >
                                <FontAwesome5 name="check" size={14} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                                <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                    Kabul ediyorum
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
