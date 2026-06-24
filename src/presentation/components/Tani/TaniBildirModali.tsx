import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    StyleSheet,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { taniModaliKapat, hatirlatmayiGuncelle } from '../../store/taniSlice';
import { TaniOnizleme } from './TaniOnizleme';

/**
 * Otomatik tanı/sorun bildirme uyarı modalı.
 *
 * Store'dan `state.tani` okur; `sorunAlgilandi && hatirlatmaAcik` iken görünür.
 * App kökünde host edilir — props almaz.
 *
 * "Bildir" → TaniOnizleme açar (önizleme kapanınca taniModaliKapat dispatch'ler).
 * "Şimdi değil" → taniModaliKapat.
 * "Bir daha sorma" → hatirlatmayiGuncelle(false) + taniModaliKapat.
 *
 * New Architecture'da Modal onRequestClose güvenilmez → useDonanimGeriTusu ile garanti.
 */
export const TaniBildirModali: React.FC = () => {
    const dispatch = useAppDispatch();
    const { sorunAlgilandi, hatirlatmaAcik, baglam } = useAppSelector(s => s.tani);
    const renkler = useRenkler();
    const [onizleme, setOnizleme] = useState(false);

    const gorunur = sorunAlgilandi && hatirlatmaAcik;

    // New Architecture'da Modal onRequestClose güvenilmez → BackHandler ile garanti
    // dispatch dönüş değeri action object olduğundan void'e indirgenip handler tipine uyum sağlanır
    useDonanimGeriTusu(gorunur, () => { dispatch(taniModaliKapat()); });

    const simdidegil = () => {
        dispatch(taniModaliKapat());
    };

    const birDahaSorma = () => {
        dispatch(hatirlatmayiGuncelle(false));
        dispatch(taniModaliKapat());
    };

    const bildir = () => {
        setOnizleme(true);
    };

    const onizlemeKapat = () => {
        setOnizleme(false);
        dispatch(taniModaliKapat());
    };

    return (
        <>
            <Modal
                visible={gorunur}
                animationType="fade"
                transparent
                statusBarTranslucent
                onRequestClose={simdidegil}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {/* Backdrop — absolute sibling (içeriği sarmaz) */}
                    <TouchableWithoutFeedback onPress={simdidegil}>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <View
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    backgroundColor: renkler.durum.uyari + '20',
                                }}
                            >
                                <FontAwesome5 name="exclamation-triangle" size={22} color={renkler.durum.uyari} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: renkler.metin }}>
                                    Bir sorun oluştu
                                </Text>
                                <Text style={{ fontSize: 13, marginTop: 2, color: renkler.metinIkincil }}>
                                    Bize bildirmek ister misiniz?
                                </Text>
                            </View>
                        </View>

                        {/* Güven rozetleri */}
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                    borderRadius: 12,
                                    backgroundColor: renkler.birincil + '20',
                                    gap: 6,
                                }}
                            >
                                <FontAwesome5 name="lock" size={12} color={renkler.birincil} />
                                <Text style={{ fontSize: 11, color: renkler.birincil, flex: 1 }}>
                                    Otomatik gönderilmez
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                    borderRadius: 12,
                                    backgroundColor: renkler.birincil + '20',
                                    gap: 6,
                                }}
                            >
                                <FontAwesome5 name="check-circle" size={12} color={renkler.birincil} />
                                <Text style={{ fontSize: 11, color: renkler.birincil, flex: 1 }}>
                                    Onay sizde
                                </Text>
                            </View>
                        </View>

                        {/* Birincil buton: Bildir */}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 14,
                                borderRadius: 16,
                                backgroundColor: renkler.birincil,
                                marginBottom: 12,
                            }}
                            onPress={bildir}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                        >
                            <FontAwesome5 name="paper-plane" size={14} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: renkler.birincilMetin }}>
                                Bildir
                            </Text>
                        </TouchableOpacity>

                        {/* İkincil aksiyonlar */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                            <TouchableOpacity
                                onPress={simdidegil}
                                accessibilityRole="button"
                                style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                            >
                                <Text style={{ fontSize: 13, color: renkler.metinIkincil }}>
                                    Şimdi değil
                                </Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 13, color: renkler.metinIkincil, paddingVertical: 8 }}>
                                ·
                            </Text>
                            <TouchableOpacity
                                onPress={birDahaSorma}
                                accessibilityRole="button"
                                style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                            >
                                <Text style={{ fontSize: 13, color: renkler.metinIkincil }}>
                                    Bir daha sorma
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* TaniOnizleme — "Bildir" basılınca açılır; kapanınca taniModaliKapat dispatch'ler */}
            <TaniOnizleme
                gorunur={onizleme}
                baglam={baglam}
                onKapat={onizlemeKapat}
                onLoglariGor={() => {}}
            />
        </>
    );
};
