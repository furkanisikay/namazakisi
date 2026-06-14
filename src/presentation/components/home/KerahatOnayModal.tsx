import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';

interface KerahatOnayModalProps {
    /** Modal görünür mü */
    gorunur: boolean;
    /** Kerahat (mekruh) vakti açıklaması — kullanıcıyı bilgilendirir */
    aciklama: string | null;
    /** İşaretlenecek namazın adı (örn: "İkindi") */
    namazAdi: string;
    /** Kullanıcı "Yine de İşaretle" derse çağrılır — işaretlemeye İZİN verilir */
    onOnayla: () => void;
    /** Kullanıcı vazgeçerse (buton/backdrop/geri tuşu) çağrılır */
    onVazgec: () => void;
}

/**
 * Kerahat (mekruh) vaktinde namaz "kılındı" işaretlenmeden önce gösterilen kibar onay modalı.
 *
 * Davranış (issue #82): Kerahat vaktinde işaretleme ENGELLENMEZ; kullanıcı uyarılır ama
 * onaylarsa işaretlemesine izin verilir. Engelleme yerine bilinçli onay.
 *
 * New Architecture'da <Modal> onRequestClose donanım geri tuşunda güvenilmez olduğundan
 * useDonanimGeriTusu ile geri tuşu garanti altına alınır.
 */
export const KerahatOnayModal: React.FC<KerahatOnayModalProps> = ({
    gorunur,
    aciklama,
    namazAdi,
    onOnayla,
    onVazgec,
}) => {
    const renkler = useRenkler();

    // Modal "fade" ile kapanırken parent namazAdi'yı boşaltır; son geçerli adı
    // önbelleğe alıp animasyon boyunca göstererek metin kaymasını (flicker) önle.
    const [sonNamazAdi, setSonNamazAdi] = React.useState(namazAdi || 'Namaz');
    React.useEffect(() => {
        if (gorunur && namazAdi) {
            setSonNamazAdi(namazAdi);
        }
    }, [gorunur, namazAdi]);

    // New Architecture'da Modal onRequestClose güvenilir değil → BackHandler ile garanti
    useDonanimGeriTusu(gorunur, onVazgec);

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onVazgec}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {/* Backdrop — absolute sibling (içeriği sarmaz) */}
                <TouchableWithoutFeedback onPress={onVazgec}>
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
                    {/* Başlık + ikon */}
                    <View className="flex-row items-center mb-3">
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: renkler.durum.uyari + '20' }}
                        >
                            <FontAwesome5 name="exclamation-triangle" size={18} color={renkler.durum.uyari} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                Kerahat Vakti
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                {sonNamazAdi} namazını işaretliyorsunuz
                            </Text>
                        </View>
                    </View>

                    {/* Kerahat açıklaması (uyarı metni) */}
                    {aciklama && (
                        <View
                            className="rounded-xl p-3 mb-4"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                        >
                            <Text className="text-sm leading-5" style={{ color: renkler.metinIkincil }}>
                                {aciklama}
                            </Text>
                        </View>
                    )}

                    {/* Onay sorusu — kibar "siz" dili */}
                    <Text className="text-sm leading-5 mb-5" style={{ color: renkler.metin }}>
                        Kerahat vakti olsa da {sonNamazAdi} namazınızı kıldığınız için işaretleyebilirsiniz.
                        Yine de kılındı olarak işaretlemek istiyor musunuz?
                    </Text>

                    {/* Butonlar */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 items-center justify-center py-3.5 rounded-2xl"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            onPress={onVazgec}
                            activeOpacity={0.7}
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                                Vazgeç
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-[1.4] flex-row items-center justify-center py-3.5 rounded-2xl"
                            style={{ backgroundColor: renkler.birincil }}
                            onPress={onOnayla}
                            activeOpacity={0.85}
                        >
                            <FontAwesome5 name="check" size={14} color="#FFF" style={{ marginRight: 8 }} />
                            <Text className="text-sm font-bold" style={{ color: '#FFF' }}>
                                Yine de İşaretle
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
