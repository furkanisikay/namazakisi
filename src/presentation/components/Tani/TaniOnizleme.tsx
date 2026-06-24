import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    StyleSheet,
    Switch,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { BildirimModali } from '../common/BildirimModali';
import { taniEpostasiniAc } from '../../../domain/services/TaniGonderServisi';

export interface TaniOnizlemeProps {
    /** Modal görünür mü */
    gorunur: boolean;
    /** Gönderilecek bağlam metni (hangi ekrandan açıldığı vb.) */
    baglam: string | null;
    /** Kapat / geri tuşu çağrısı */
    onKapat: () => void;
    /** "Tam kaydı görüntüle" basılınca çağrılır */
    onLoglariGor: () => void;
}

/**
 * Tanı/sorun bildirmeden önce kullanıcıya ne gönderileceğini gösteren onay modalı.
 *
 * "Güven kartı" tasarımı: gönderilecek/gönderilmeyecek şeffaf liste + opsiyonel konum
 * izni. Kullanıcı onaylarsa taniEpostasiniAc servisi çağrılır.
 *
 * New Architecture'da <Modal> onRequestClose donanım geri tuşunda güvenilmez olduğundan
 * useDonanimGeriTusu ile geri tuşu garanti altına alınır.
 */
export const TaniOnizleme: React.FC<TaniOnizlemeProps> = ({
    gorunur,
    baglam,
    onKapat,
    onLoglariGor,
}) => {
    const renkler = useRenkler();
    const [konumDahil, setKonumDahil] = useState(false);
    const [neOldu, setNeOldu] = useState('');
    const [hataBildirimi, setHataBildirimi] = useState(false);
    const [basariBildirimi, setBasariBildirimi] = useState(false);
    const [gonderiyor, setGonderiyor] = useState(false);

    // New Architecture'da Modal onRequestClose güvenilir değil → BackHandler ile garanti
    useDonanimGeriTusu(gorunur, onKapat);

    const epostayiAc = async () => {
        if (gonderiyor) return;
        setGonderiyor(true);
        try {
            const sonuc = await taniEpostasiniAc({
                baglam: baglam ?? undefined,
                konumDahil,
                neOldu: neOldu.trim() || undefined,
            });
            // Önizleme modalını kapat; teyit/hata modalı kardeş olduğundan kapanış
            // sonrası state set güvenli (bileşen unmount olmaz, yalnız Modal gizlenir).
            onKapat();
            if (sonuc === 'hata') {
                setHataBildirimi(true);
            } else if (sonuc === 'gonderildi' || sonuc === 'paylasildi') {
                // 'iptal'de sessiz kal; gönderim/paylaşım hazırlandıysa teyit göster.
                setBasariBildirimi(true);
            }
        } finally {
            setGonderiyor(false);
        }
    };

    return (
        <>
            <Modal
                visible={gorunur}
                animationType="fade"
                transparent
                statusBarTranslucent
                onRequestClose={onKapat}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {/* Backdrop — absolute sibling (içeriği sarmaz) */}
                    <TouchableWithoutFeedback onPress={onKapat}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                    </TouchableWithoutFeedback>

                    <View
                        style={{
                            width: '88%',
                            maxWidth: 420,
                            backgroundColor: renkler.kartArkaplan,
                            borderRadius: 24,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: renkler.sinir,
                        }}
                    >
                        {/* Başlık */}
                        <View className="flex-row items-center mb-4">
                            <View
                                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: renkler.birincil + '20' }}
                            >
                                <FontAwesome5 name="shield-alt" size={18} color={renkler.birincil} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                    Ne gönderiliyor?
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    Göndermeden önce görün
                                </Text>
                            </View>
                        </View>

                        {/* Gönderilecek bölümü */}
                        <Text className="text-xs font-semibold mb-2" style={{ color: renkler.metinIkincil }}>
                            Gönderilecek
                        </Text>
                        <View
                            className="rounded-xl p-3 mb-3"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                        >
                            <SatirOgesi ikon="check" renk={renkler.birincil} metin="Uygulama sürümü" />
                            <SatirOgesi ikon="check" renk={renkler.birincil} metin="Telefon ve Android sürümü" />
                            <SatirOgesi ikon="check" renk={renkler.birincil} metin="Teknik kayıtlar" />
                            {konumDahil && (
                                <SatirOgesi ikon="check" renk={renkler.birincil} metin="Yaklaşık konum (şehir)" sonMu />
                            )}
                        </View>

                        {/* Gönderilmeyecek bölümü */}
                        <Text className="text-xs font-semibold mb-2" style={{ color: renkler.metinIkincil }}>
                            Gönderilmeyecek
                        </Text>
                        <View
                            className="rounded-xl p-3 mb-3"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                        >
                            <SatirOgesi ikon="times" renk={renkler.metinIkincil} metin="Namaz, kaza, puan" />
                            <SatirOgesi ikon="times" renk={renkler.metinIkincil} metin="Kişisel veriler" />
                            {!konumDahil && (
                                <SatirOgesi ikon="times" renk={renkler.metinIkincil} metin="Yaklaşık konum" sonMu />
                            )}
                        </View>

                        {/* Ne oldu? (isteğe bağlı serbest metin) */}
                        <Text className="text-xs font-semibold mb-2" style={{ color: renkler.metinIkincil }}>
                            Ne oldu? (isteğe bağlı)
                        </Text>
                        <TextInput
                            value={neOldu}
                            onChangeText={setNeOldu}
                            placeholder="Kısaca ne yaşadığınızı yazabilirsiniz"
                            placeholderTextColor={renkler.metinIkincil}
                            multiline
                            textAlignVertical="top"
                            className="rounded-xl p-3 mb-3 text-sm"
                            style={{
                                backgroundColor: renkler.arkaplan,
                                borderWidth: 1,
                                borderColor: renkler.sinir,
                                color: renkler.metin,
                                minHeight: 64,
                            }}
                            accessibilityLabel="Ne oldu? İsteğe bağlı açıklama"
                        />

                        {/* Konum Switch */}
                        <View
                            className="flex-row items-center justify-between py-3 mb-1"
                            style={{ borderTopWidth: 1, borderTopColor: renkler.sinir }}
                        >
                            <Text className="text-sm flex-1 mr-3" style={{ color: renkler.metin }}>
                                Yaklaşık konumu ekle
                            </Text>
                            <Switch
                                value={konumDahil}
                                onValueChange={setKonumDahil}
                                trackColor={{ true: renkler.birincil, false: renkler.sinir }}
                                accessibilityLabel="Yaklaşık konumu ekle"
                            />
                        </View>

                        {/* Tam kaydı görüntüle */}
                        <TouchableOpacity
                            onPress={onLoglariGor}
                            accessibilityRole="button"
                            className="py-3 mb-4"
                        >
                            <Text
                                className="text-xs text-center"
                                style={{ color: renkler.birincil }}
                            >
                                Tam kaydı görüntüle
                            </Text>
                        </TouchableOpacity>

                        {/* Butonlar */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 items-center justify-center py-3.5 rounded-2xl"
                                style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                                onPress={onKapat}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                            >
                                <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                                    İptal
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-[1.4] flex-row items-center justify-center py-3.5 rounded-2xl"
                                style={{ backgroundColor: renkler.birincil, opacity: gonderiyor ? 0.6 : 1 }}
                                onPress={epostayiAc}
                                activeOpacity={0.85}
                                disabled={gonderiyor}
                                accessibilityRole="button"
                            >
                                <FontAwesome5 name="envelope" size={14} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                                <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                    E-postayı aç
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Başarı/teyit bildirimi — önizleme kapatıldıktan sonra gösterilir */}
            <BildirimModali
                gorunur={basariBildirimi}
                tip="basari"
                baslik="Teşekkürler"
                mesaj="Tanı kaydınız e-posta uygulamanızda hazırlandı; göndererek bize iletebilirsiniz."
                onKapat={() => setBasariBildirimi(false)}
            />

            {/* Hata bildirimi — önizleme kapatıldıktan sonra gösterilir */}
            <BildirimModali
                gorunur={hataBildirimi}
                tip="hata"
                baslik="Gönderilemedi"
                mesaj="Tanı kaydı gönderilemedi. Birazdan tekrar deneyin; sorun sürerse cihazınızda e-posta veya paylaşım uygulaması olduğundan emin olun."
                onKapat={() => setHataBildirimi(false)}
            />
        </>
    );
};

// Yardımcı bileşen: gönderilecek/gönderilmeyecek satır öğesi
interface SatirOgesiProps {
    ikon: string;
    renk: string;
    metin: string;
    sonMu?: boolean;
}

const SatirOgesi: React.FC<SatirOgesiProps> = ({ ikon, renk, metin, sonMu = false }) => {
    const renkler = useRenkler();
    return (
        <View
            className="flex-row items-center py-1.5"
            style={!sonMu ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: renkler.sinir } : undefined}
        >
            <FontAwesome5 name={ikon} size={12} color={renk} style={{ width: 18 }} />
            <Text className="text-sm flex-1" style={{ color: renkler.metin }}>
                {metin}
            </Text>
        </View>
    );
};
