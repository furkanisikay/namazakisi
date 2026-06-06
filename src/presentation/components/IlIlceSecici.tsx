import * as React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    ActivityIndicator,
    Animated,
    Pressable,
    Dimensions,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useDonanimGeriTusu } from '../hooks/useDonanimGeriTusu';
import { TurkiyeKonumServisi, Il, Ilce, TURKIYE_ILLERI_OFFLINE } from '../../domain/services/TurkiyeKonumServisi';

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');

export interface IlIlceSeciciProps {
    seciliIlId: number | null;
    seciliIlceId: number | null;
    seciliIlAdi: string;
    seciliIlceAdi: string;
    onKonumSec: (il: Il, ilce?: Ilce) => void;
}

/**
 * Profesyonel Il/Ilce Secici Komponenti
 */
export const IlIlceSecici: React.FC<IlIlceSeciciProps> = ({
    seciliIlId,
    seciliIlceId,
    seciliIlAdi,
    seciliIlceAdi,
    onKonumSec
}) => {
    const renkler = useRenkler();
    const [modalGorunum, setModalGorunum] = useState(false);
    const [aramaMetni, setAramaMetni] = useState('');
    const [secilenIl, setSecilenIl] = useState<Il | null>(null);
    const [ilceler, setIlceler] = useState<Ilce[]>([]);
    const [ilcelerYukleniyor, setIlcelerYukleniyor] = useState(false);
    const [adim, setAdim] = useState<'il' | 'ilce'>('il');
    const animDeger = useRef(new Animated.Value(0)).current;

    const [iller, setIller] = useState<Il[]>(TURKIYE_ILLERI_OFFLINE);

    useEffect(() => {
        const illerYukle = async () => {
            const illerData = await TurkiyeKonumServisi.illeriGetir();
            setIller(illerData);
        };
        illerYukle();
    }, []);

    const normalizeMetin = useCallback((metin: string) => {
        return metin.toLowerCase().replace(/[ığüşöçİ]/g, (char) => {
            const harita: Record<string, string> = {
                'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c', 'İ': 'i'
            };
            return harita[char] || char;
        });
    }, []);

    const filtreliIller = useMemo(() => {
        if (!aramaMetni) return iller.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
        const aramaKucuk = normalizeMetin(aramaMetni);
        return iller
            .filter(il => normalizeMetin(il.ad).includes(aramaKucuk))
            .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    }, [iller, aramaMetni, normalizeMetin]);

    const filtreliIlceler = useMemo(() => {
        if (!aramaMetni) return ilceler.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
        const aramaKucuk = normalizeMetin(aramaMetni);
        return ilceler
            .filter(ilce => normalizeMetin(ilce.ad).includes(aramaKucuk))
            .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    }, [ilceler, aramaMetni, normalizeMetin]);

    const modalAc = useCallback(() => {
        setModalGorunum(true);
        setAdim('il');
        setSecilenIl(null);
        setAramaMetni('');
        Animated.spring(animDeger, {
            toValue: 1,
            useNativeDriver: true,
            tension: 65,
            friction: 10,
        }).start();
    }, [animDeger]);

    const modalKapat = useCallback(() => {
        Animated.timing(animDeger, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setModalGorunum(false);
            setAramaMetni('');
            setAdim('il');
            setSecilenIl(null);
        });
    }, [animDeger]);

    const ilSecHandler = useCallback(async (il: Il) => {
        setSecilenIl(il);
        setAramaMetni('');
        setIlcelerYukleniyor(true);
        const ilceData = await TurkiyeKonumServisi.ilceleriGetir(il.id);
        setIlceler(ilceData);
        setIlcelerYukleniyor(false);
        if (ilceData.length > 0) {
            setAdim('ilce');
        } else {
            onKonumSec(il);
            modalKapat();
        }
    }, [onKonumSec, modalKapat]);

    const ilceSecHandler = useCallback((ilce: Ilce) => {
        if (secilenIl) {
            onKonumSec(secilenIl, ilce);
            modalKapat();
        }
    }, [secilenIl, onKonumSec, modalKapat]);

    const geriHandler = useCallback(() => {
        setAdim('il');
        setSecilenIl(null);
        setAramaMetni('');
    }, []);

    // Geri tuşu: ilçe adımındaysa il adımına dön, değilse modalı kapat
    const handleModalGeri = useCallback(() => {
        if (adim === 'ilce') geriHandler();
        else modalKapat();
    }, [adim, geriHandler, modalKapat]);
    useDonanimGeriTusu(modalGorunum, handleModalGeri);

    const ilOgesiRender = useCallback(({ item }: { item: Il }) => {
        const seciliMi = item.id === seciliIlId;
        return (
            <TouchableOpacity
                className="flex-row items-center justify-between py-3.5 px-4 rounded-xl mb-2 border"
                style={{
                    backgroundColor: seciliMi ? `${renkler.birincil}15` : 'transparent',
                    borderColor: seciliMi ? renkler.birincil : 'transparent',
                }}
                onPress={() => ilSecHandler(item)}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center flex-1">
                    <View
                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                        style={{ backgroundColor: seciliMi ? renkler.birincil : renkler.sinir }}
                    >
                        <Text className="text-base text-white font-semibold">{item.plakaKodu}</Text>
                    </View>
                    <View className="flex-1">
                        <Text
                            className="text-base"
                            style={{ color: seciliMi ? renkler.birincil : renkler.metin, fontWeight: seciliMi ? '700' : '500' }}
                        >
                            {item.ad}
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {item.lat.toFixed(2)}°K, {item.lng.toFixed(2)}°D
                        </Text>
                    </View>
                </View>
                <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} />
            </TouchableOpacity>
        );
    }, [seciliIlId, renkler, ilSecHandler]);

    const ilceOgesiRender = useCallback(({ item }: { item: Ilce }) => {
        const seciliMi = item.id === seciliIlceId;
        return (
            <TouchableOpacity
                className="flex-row items-center justify-between py-3.5 px-4 rounded-xl mb-2 border"
                style={{
                    backgroundColor: seciliMi ? `${renkler.birincil}15` : 'transparent',
                    borderColor: seciliMi ? renkler.birincil : 'transparent',
                }}
                onPress={() => ilceSecHandler(item)}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center flex-1">
                    <View
                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                        style={{ backgroundColor: seciliMi ? renkler.birincil : renkler.sinir }}
                    >
                        <FontAwesome5
                            name={seciliMi ? 'check' : 'map-marker-alt'}
                            size={16}
                            color="#FFF"
                        />
                    </View>
                    <Text
                        className="text-base flex-1"
                        style={{ color: seciliMi ? renkler.birincil : renkler.metin, fontWeight: seciliMi ? '700' : '500' }}
                    >
                        {item.ad}
                    </Text>
                </View>
                {seciliMi && (
                    <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: renkler.birincil }}>
                        <Text className="text-xs font-semibold text-white">Seçili</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [seciliIlceId, renkler, ilceSecHandler]);

    const konumMetni = useMemo(() => {
        if (seciliIlceAdi && seciliIlAdi) {
            return `${seciliIlceAdi}, ${seciliIlAdi}`;
        }
        if (seciliIlAdi) {
            return seciliIlAdi;
        }
        return 'Konum seçiniz...';
    }, [seciliIlAdi, seciliIlceAdi]);

    return (
        <>
            {/* Konum Secici Butonu */}
            <TouchableOpacity
                className="rounded-2xl p-4 flex-row items-center justify-between"
                style={{
                    backgroundColor: renkler.kartArkaplan,
                    borderColor: seciliIlId ? renkler.birincil : renkler.sinir,
                    borderWidth: seciliIlId ? 2 : 1,
                }}
                onPress={modalAc}
                activeOpacity={0.8}
            >
                <View className="flex-row items-center flex-1">
                    <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3.5"
                        style={{ backgroundColor: seciliIlId ? `${renkler.birincil}20` : renkler.sinir }}
                    >
                        <FontAwesome5 name="map-marker-alt" size={20} color={seciliIlId ? renkler.birincil : renkler.metinIkincil} solid />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-medium tracking-wider mb-0.5" style={{ color: renkler.metinIkincil }}>
                            KONUM
                        </Text>
                        <Text
                            className="text-lg font-semibold"
                            style={{ color: seciliIlId ? renkler.metin : renkler.metinIkincil }}
                        >
                            {konumMetni}
                        </Text>
                    </View>
                </View>
                <View className="w-8 h-8 rounded-lg items-center justify-center">
                    <FontAwesome5 name="chevron-down" size={12} color={renkler.metinIkincil} />
                </View>
            </TouchableOpacity>

            {/* Il/Ilce Secim Modali */}
            <Modal visible={modalGorunum} transparent animationType="none" onRequestClose={modalKapat}>
                <Pressable className="flex-1 bg-black/50 justify-end" onPress={modalKapat}>
                    <Animated.View
                        style={{
                            height: EKRAN_YUKSEKLIGI * 0.75,
                            backgroundColor: renkler.arkaplan,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            overflow: 'hidden',
                            transform: [{
                                translateY: animDeger.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [EKRAN_YUKSEKLIGI, 0],
                                })
                            }]
                        }}
                    >
                        <Pressable style={{ flex: 1 }} onPress={(e) => e.stopPropagation()}>
                            {/* Modal Baslik */}
                            <View className="flex-row items-center justify-between px-5 pt-4 pb-4 border-b" style={{ borderBottomColor: renkler.sinir }}>
                                {adim === 'ilce' && (
                                    <TouchableOpacity
                                        className="w-9 h-9 rounded-full items-center justify-center mr-2"
                                        style={{ backgroundColor: renkler.sinir }}
                                        onPress={geriHandler}
                                    >
                                        <FontAwesome5 name="arrow-left" size={14} color={renkler.metin} />
                                    </TouchableOpacity>
                                )}
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <FontAwesome5 name={adim === 'il' ? 'city' : 'map-marker-alt'} size={16} color={renkler.metin} />
                                        <Text className="text-xl font-bold ml-2" style={{ color: renkler.metin }}>
                                            {adim === 'il' ? 'İl Seçimi' : `${secilenIl?.ad} - İlçe Seçimi`}
                                        </Text>
                                    </View>
                                    <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                                        {adim === 'il' ? '81 il arasından seçin' : 'İlçe seçerek devam edin'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    className="w-9 h-9 rounded-full items-center justify-center"
                                    style={{ backgroundColor: renkler.sinir }}
                                    onPress={modalKapat}
                                >
                                    <FontAwesome5 name="times" size={14} color={renkler.metin} />
                                </TouchableOpacity>
                            </View>

                            {/* Breadcrumb */}
                            {adim === 'ilce' && secilenIl && (
                                <View
                                    className="mx-4 mt-2 px-4 py-2.5 rounded-lg flex-row items-center"
                                    style={{ backgroundColor: `${renkler.birincil}10` }}
                                >
                                    <FontAwesome5 name="map-marker-alt" size={12} color={renkler.birincil} />
                                    <Text className="text-sm font-semibold ml-2" style={{ color: renkler.birincil }}>
                                        {secilenIl.ad} ({secilenIl.plakaKodu})
                                    </Text>
                                </View>
                            )}

                            {/* Arama Alani */}
                            <View
                                className="flex-row items-center mx-4 my-3 rounded-xl px-3 h-12"
                                style={{ backgroundColor: renkler.kartArkaplan }}
                            >
                                <View
                                    className="w-8 h-8 rounded-lg items-center justify-center mr-2.5"
                                    style={{ backgroundColor: renkler.sinir }}
                                >
                                    <FontAwesome5 name="search" size={12} color={renkler.metinIkincil} />
                                </View>
                                <TextInput
                                    className="flex-1 text-base h-12"
                                    style={{ color: renkler.metin }}
                                    placeholder={adim === 'il' ? 'İl ara...' : 'İlçe ara...'}
                                    placeholderTextColor={renkler.metinIkincil}
                                    value={aramaMetni}
                                    onChangeText={setAramaMetni}
                                    autoFocus={false}
                                />
                                {aramaMetni.length > 0 && (
                                    <TouchableOpacity
                                        className="w-7 h-7 items-center justify-center"
                                        onPress={() => setAramaMetni('')}
                                    >
                                        <FontAwesome5 name="times-circle" size={14} color={renkler.metinIkincil} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Sonuc Sayisi */}
                            <View className="px-4 mb-2">
                                <Text className="text-xs font-medium" style={{ color: renkler.metinIkincil }}>
                                    {adim === 'il'
                                        ? `${filtreliIller.length} il listeleniyor`
                                        : `${filtreliIlceler.length} ilçe listeleniyor`
                                    }
                                </Text>
                            </View>

                            {/* Liste */}
                            {ilcelerYukleniyor ? (
                                <View className="flex-1 items-center justify-center py-12">
                                    <ActivityIndicator size="large" color={renkler.birincil} />
                                    <Text className="text-sm mt-3" style={{ color: renkler.metinIkincil }}>
                                        İlçeler yükleniyor...
                                    </Text>
                                </View>
                            ) : adim === 'il' ? (
                                <FlatList
                                    data={filtreliIller}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={ilOgesiRender}
                                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    initialNumToRender={20}
                                    ListEmptyComponent={
                                        <View className="items-center py-12">
                                            <FontAwesome5 name="search" size={40} color={renkler.metinIkincil} style={{ opacity: 0.5 }} />
                                            <Text className="text-base text-center mt-4" style={{ color: renkler.metinIkincil }}>
                                                "{aramaMetni}" için sonuç bulunamadı
                                            </Text>
                                        </View>
                                    }
                                />
                            ) : (
                                <FlatList
                                    data={filtreliIlceler}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={ilceOgesiRender}
                                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    initialNumToRender={20}
                                    ListEmptyComponent={
                                        <View className="items-center py-12">
                                            <FontAwesome5 name="search" size={40} color={renkler.metinIkincil} style={{ opacity: 0.5 }} />
                                            <Text className="text-base text-center mt-4" style={{ color: renkler.metinIkincil }}>
                                                {aramaMetni
                                                    ? `"${aramaMetni}" için sonuç bulunamadı`
                                                    : 'Bu il için ilçe verisi bulunamadı'
                                                }
                                            </Text>
                                        </View>
                                    }
                                />
                            )}
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>
        </>
    );
};
