/**
 * Muhafiz Ayarlari Sayfasi
 * Namaz hatirlatma bildirimleri ayarlari
 * 
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
 */

import * as React from 'react';
import { useState, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { muhafizAyarlariniGuncelle, HATIRLATMA_PRESETLERI } from '../store/muhafizSlice';
import { useFeedback } from '../../core/feedback';

/**
 * Seviye renkleri
 */
const SEVIYE_RENKLERI = {
    seviye1: '#4CAF50', // Yesil - Nazik
    seviye2: '#FF9800', // Turuncu - Uyari
    seviye3: '#F44336', // Kirmizi - Mucadele
    seviye4: '#D32F2F', // Koyu Kirmizi - Alarm
};

/**
 * Seviye bilgileri
 */
const SEVIYE_BILGILERI = [
    { id: 'seviye1', baslik: 'Nazik Hatirlatma', ikonAdi: 'bell', renk: SEVIYE_RENKLERI.seviye1, minEsik: 15, maxEsik: 90 },
    { id: 'seviye2', baslik: 'Uyari', ikonAdi: 'exclamation-triangle', renk: SEVIYE_RENKLERI.seviye2, minEsik: 10, maxEsik: 60 },
    { id: 'seviye3', baslik: 'Seytanla Mucadele', ikonAdi: 'fire-alt', renk: SEVIYE_RENKLERI.seviye3, minEsik: 5, maxEsik: 30 },
    { id: 'seviye4', baslik: 'Acil Alarm', ikonAdi: 'exclamation-circle', renk: SEVIYE_RENKLERI.seviye4, minEsik: 1, maxEsik: 15 },
];

// Throttle suresi (ms)
const THROTTLE_SURESI = 100;

/**
 * Numerik Up/Down Komponenti Props
 */
interface SayisalSeciciProps {
    deger: number;
    min: number;
    max: number;
    adim?: number;
    birim?: string;
    onChange: (yeniDeger: number) => void;
    renk: string;
}

/**
 * Numerik Up/Down Komponenti
 */
const SayisalSecici: React.FC<SayisalSeciciProps> = ({
    deger,
    min,
    max,
    adim = 1,
    birim = 'dk',
    onChange,
    renk,
}) => {
    const renkler = useRenkler();
    const sonTiklamaRef = useRef<number>(0);

    const throttleKontrol = useCallback((): boolean => {
        const simdi = Date.now();
        if (simdi - sonTiklamaRef.current < THROTTLE_SURESI) {
            return false;
        }
        sonTiklamaRef.current = simdi;
        return true;
    }, []);

    const azalt = useCallback(() => {
        if (!throttleKontrol()) return;
        const yeni = Math.max(min, deger - adim);
        onChange(yeni);
    }, [deger, min, adim, onChange, throttleKontrol]);

    const artir = useCallback(() => {
        if (!throttleKontrol()) return;
        const yeni = Math.min(max, deger + adim);
        onChange(yeni);
    }, [deger, max, adim, onChange, throttleKontrol]);

    return (
        <View className="flex-row items-center rounded-lg overflow-hidden border" style={{ borderColor: renkler.sinir }}>
            <TouchableOpacity
                className="w-9 h-9 items-center justify-center"
                style={{ backgroundColor: deger <= min ? renkler.sinir : renk }}
                onPress={azalt}
                disabled={deger <= min}
                activeOpacity={0.7}
            >
                <FontAwesome5 name="minus" size={12} color="#FFF" />
            </TouchableOpacity>
            <View
                className="px-3 h-9 items-center justify-center flex-row min-w-[90px]"
                style={{ backgroundColor: renkler.kartArkaplan }}
            >
                <Text className="text-base font-bold mr-1" style={{ color: renkler.metin }}>{deger}</Text>
                <Text className="text-xs" style={{ color: renkler.metinIkincil }}>{birim}</Text>
            </View>
            <TouchableOpacity
                className="w-9 h-9 items-center justify-center"
                style={{ backgroundColor: deger >= max ? renkler.sinir : renk }}
                onPress={artir}
                disabled={deger >= max}
                activeOpacity={0.7}
            >
                <FontAwesome5 name="plus" size={12} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

/**
 * Bildirim bilgisi tipi
 */
interface BildirimBilgisi {
    dakika: number;
    seviye: number;
    renk: string;
    ikonAdi: string;
    tekrarMi: boolean;
}

/**
 * Bildirim Onizleme Props
 */
interface BildirimOnizlemeProps {
    esikler: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
    sikliklar: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
}

/**
 * Bildirim Onizleme Diagrami
 */
const BildirimOnizleme: React.FC<BildirimOnizlemeProps> = ({ esikler, sikliklar }) => {
    const renkler = useRenkler();
    const [acikMi, setAcikMi] = useState(false);
    const animDeger = useRef(new Animated.Value(0)).current;

    // Tum bildirimleri hesapla
    const tumBildirimler = useMemo(() => {
        const bildirimler: BildirimBilgisi[] = [];
        const seviyeler = [
            { seviye: 1, esik: esikler.seviye1, siklik: sikliklar.seviye1, renk: SEVIYE_RENKLERI.seviye1, ikonAdi: 'bell' },
            { seviye: 2, esik: esikler.seviye2, siklik: sikliklar.seviye2, renk: SEVIYE_RENKLERI.seviye2, ikonAdi: 'exclamation-triangle' },
            { seviye: 3, esik: esikler.seviye3, siklik: sikliklar.seviye3, renk: SEVIYE_RENKLERI.seviye3, ikonAdi: 'fire-alt' },
            { seviye: 4, esik: esikler.seviye4, siklik: sikliklar.seviye4, renk: SEVIYE_RENKLERI.seviye4, ikonAdi: 'exclamation-circle' },
        ];

        for (const seviye of seviyeler) {
            const sonrakiSeviye = seviyeler.find(s => s.seviye === seviye.seviye + 1);
            const bitisDakikasi = sonrakiSeviye ? sonrakiSeviye.esik : 0;
            let mevcutDakika = seviye.esik;
            let ilkMi = true;

            while (mevcutDakika > bitisDakikasi && mevcutDakika > 0) {
                bildirimler.push({
                    dakika: mevcutDakika,
                    seviye: seviye.seviye,
                    renk: seviye.renk,
                    ikonAdi: seviye.ikonAdi,
                    tekrarMi: !ilkMi,
                });
                mevcutDakika -= seviye.siklik;
                ilkMi = false;
            }
        }
        return bildirimler.sort((a, b) => b.dakika - a.dakika);
    }, [esikler, sikliklar]);

    // Seviye bazli sayilar
    const seviyeSayilari = useMemo(() => {
        return [1, 2, 3, 4].map(seviye => ({
            seviye,
            sayi: tumBildirimler.filter(b => b.seviye === seviye).length,
            renk: seviye === 1 ? SEVIYE_RENKLERI.seviye1 :
                seviye === 2 ? SEVIYE_RENKLERI.seviye2 :
                    seviye === 3 ? SEVIYE_RENKLERI.seviye3 : SEVIYE_RENKLERI.seviye4,
            ikonAdi: seviye === 1 ? 'bell' : seviye === 2 ? 'exclamation-triangle' : seviye === 3 ? 'fire-alt' : 'exclamation-circle',
        }));
    }, [tumBildirimler]);

    // Ac/kapa animasyonu
    const toggleAcKapa = useCallback(() => {
        Animated.timing(animDeger, {
            toValue: acikMi ? 0 : 1,
            duration: 250,
            useNativeDriver: false,
        }).start();
        setAcikMi(!acikMi);
    }, [acikMi, animDeger]);

    return (
        <View
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
        >
            {/* Baslik - Tiklanabilir */}
            <TouchableOpacity
                className="flex-row items-center justify-between p-3.5"
                onPress={toggleAcKapa}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center">
                    <FontAwesome5 name="chart-bar" size={14} color={renkler.metin} />
                    <Text className="text-sm font-bold ml-2" style={{ color: renkler.metin }}>
                        Bildirim Ozeti
                    </Text>
                    <View className="ml-2 px-2 py-0.5 rounded-lg" style={{ backgroundColor: renkler.birincil }}>
                        <Text className="text-xs font-bold text-white">{tumBildirimler.length} Bildirim</Text>
                    </View>
                </View>
                <Animated.View style={{
                    transform: [{
                        rotate: animDeger.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                        })
                    }]
                }}>
                    <FontAwesome5 name="chevron-down" size={12} color={renkler.metinIkincil} />
                </Animated.View>
            </TouchableOpacity>

            {/* Kompakt Ozet */}
            <View className="flex-row px-3.5 pb-3 gap-2">
                {seviyeSayilari.map((item) => (
                    <View
                        key={item.seviye}
                        className="flex-1 flex-row items-center justify-center py-2 px-2.5 rounded-lg gap-1"
                        style={{ backgroundColor: `${item.renk}15` }}
                    >
                        <FontAwesome5 name={item.ikonAdi} size={12} color={item.renk} solid />
                        <Text className="text-sm font-bold" style={{ color: item.renk }}>{item.sayi}x</Text>
                    </View>
                ))}
            </View>

            {/* Genisletilmis Detay */}
            {acikMi && (
                <Animated.View
                    className="border-t px-3.5 py-3"
                    style={{ opacity: animDeger, borderTopColor: renkler.sinir }}
                >
                    <Text
                        className="text-xs font-semibold mb-2.5 tracking-wider"
                        style={{ color: renkler.metinIkincil }}
                    >
                        ZAMAN CIZELGESI
                    </Text>

                    <View className="mt-1">
                        {tumBildirimler.map((bildirim, index) => (
                            <View key={`${bildirim.seviye}-${bildirim.dakika}`} className="flex-row items-start">
                                <View className="w-11 items-center">
                                    <View
                                        className="w-8 h-8 rounded-full items-center justify-center"
                                        style={{ backgroundColor: bildirim.renk }}
                                    >
                                        <FontAwesome5 name={bildirim.ikonAdi} size={12} color="#FFF" solid />
                                    </View>
                                    {index < tumBildirimler.length - 1 && (
                                        <View className="w-0.5 h-8 my-0.5" style={{ backgroundColor: renkler.sinir }} />
                                    )}
                                </View>

                                <View
                                    className="flex-1 ml-2 mb-1.5 p-2.5 rounded-lg border"
                                    style={{
                                        backgroundColor: bildirim.tekrarMi ? 'transparent' : `${bildirim.renk}12`,
                                        borderColor: bildirim.tekrarMi ? renkler.sinir : bildirim.renk,
                                        borderWidth: bildirim.tekrarMi ? 1 : 1.5,
                                    }}
                                >
                                    <View className="flex-row items-center justify-between mb-0.5">
                                        <Text className="text-sm font-bold" style={{ color: bildirim.renk }}>
                                            {bildirim.dakika} dk kala
                                        </Text>
                                        <View className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: bildirim.renk }}>
                                            <Text className="text-[9px] font-semibold text-white">Seviye {bildirim.seviye}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-[11px]" style={{ color: renkler.metinIkincil }}>
                                        {bildirim.seviye === 1 && 'Nazik Hatirlatma'}
                                        {bildirim.seviye === 2 && 'Uyari'}
                                        {bildirim.seviye === 3 && 'Seytanla mucadele'}
                                        {bildirim.seviye === 4 && 'Acil alarm'}
                                        {' bildirimi'}
                                        {bildirim.tekrarMi && ' (tekrar)'}
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {/* Vakit Cikisi */}
                        <View className="flex-row items-start">
                            <View className="w-11 items-center">
                                <View
                                    className="w-8 h-8 rounded-full items-center justify-center"
                                    style={{ backgroundColor: renkler.sinir }}
                                >
                                    <FontAwesome5 name="clock" size={12} color={renkler.metinIkincil} />
                                </View>
                            </View>
                            <View
                                className="flex-1 ml-2 p-2.5 rounded-lg border"
                                style={{ backgroundColor: `${renkler.sinir}20`, borderColor: renkler.sinir }}
                            >
                                <Text className="text-sm font-bold" style={{ color: renkler.metinIkincil }}>
                                    Vakit Cikisi
                                </Text>
                                <Text className="text-[11px]" style={{ color: renkler.metinIkincil }}>
                                    Namaz vaktinin sonu
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

/**
 * Muhafiz Ayarlari Sayfasi
 */
export const MuhafizAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();
    const { butonTiklandiFeedback } = useFeedback();
    const muhafizAyarlari = useAppSelector((state) => state.muhafiz);
    const konumAyarlari = useAppSelector((state) => state.konum);

    /**
     * Konum metnini olustur
     */
    const konumMetniOlustur = (): string => {
        if (konumAyarlari.konumModu === 'oto') {
            if (konumAyarlari.gpsAdres) {
                const { ilce, il } = konumAyarlari.gpsAdres;
                if (ilce && il) return `${ilce}, ${il}`;
                return ilce || il || 'GPS konumu';
            }
            return 'GPS aktif';
        }
        if (konumAyarlari.seciliIlceAdi && konumAyarlari.seciliIlAdi) {
            return `${konumAyarlari.seciliIlceAdi}, ${konumAyarlari.seciliIlAdi}`;
        }
        return konumAyarlari.seciliIlAdi || 'Konum secilmedi';
    };

    /**
     * Son GPS guncelleme zamanini kisa formatla
     */
    const sonGuncellemeKisaMetin = (): string | null => {
        if (konumAyarlari.konumModu !== 'oto' || !konumAyarlari.sonGpsGuncellemesi) {
            return null;
        }

        const guncellemeTarihi = new Date(konumAyarlari.sonGpsGuncellemesi);
        const simdi = new Date();
        const farkMs = simdi.getTime() - guncellemeTarihi.getTime();
        const farkDakika = Math.floor(farkMs / (1000 * 60));
        const farkSaat = Math.floor(farkMs / (1000 * 60 * 60));
        const farkGun = Math.floor(farkMs / (1000 * 60 * 60 * 24));

        if (farkDakika < 1) {
            return 'Az once';
        } else if (farkDakika < 60) {
            return `${farkDakika} dk once`;
        } else if (farkSaat < 24) {
            return `${farkSaat} sa once`;
        } else {
            return `${farkGun} gun once`;
        }
    };

    // Yogunluk secimi
    const handleYogunlukSec = async (yogunluk: 'hafif' | 'normal' | 'yogun') => {
        await butonTiklandiFeedback();
        const preset = HATIRLATMA_PRESETLERI[yogunluk];
        dispatch(muhafizAyarlariniGuncelle({
            yogunluk,
            esikler: preset.esikler,
            sikliklar: preset.sikliklar,
        }));
    };

    // Gelismis ayarlar
    const esikDegistir = (seviye: keyof typeof muhafizAyarlari.esikler, yeniDeger: number) => {
        dispatch(muhafizAyarlariniGuncelle({
            esikler: { ...muhafizAyarlari.esikler, [seviye]: yeniDeger }
        }));
    };

    const siklikDegistir = (seviye: keyof typeof muhafizAyarlari.sikliklar, yeniDeger: number) => {
        dispatch(muhafizAyarlariniGuncelle({
            sikliklar: { ...muhafizAyarlari.sikliklar, [seviye]: yeniDeger }
        }));
    };

    return (
        <ScrollView
            className="flex-1 p-4"
            style={{ backgroundColor: renkler.arkaplan }}
        >
            {/* ANA SWITCH */}
            <View
                className="flex-row items-center justify-between p-5 rounded-2xl border-2 mb-4 mt-2"
                style={{
                    backgroundColor: muhafizAyarlari.aktif ? renkler.birincil : renkler.kartArkaplan,
                    borderColor: muhafizAyarlari.aktif ? renkler.birincil : renkler.sinir,
                }}
            >
                <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: muhafizAyarlari.aktif ? 'rgba(255,255,255,0.2)' : renkler.sinir }}>
                        <FontAwesome5
                            name={muhafizAyarlari.aktif ? 'shield-alt' : 'moon'}
                            size={24}
                            color={muhafizAyarlari.aktif ? '#FFF' : renkler.metinIkincil}
                            solid
                        />
                    </View>
                    <View className="flex-1">
                        <Text
                            className="text-xl font-bold"
                            style={{ color: muhafizAyarlari.aktif ? '#FFF' : renkler.metin }}
                        >
                            Namaz Muhafizi
                        </Text>
                        <Text
                            className="text-sm mt-0.5"
                            style={{ color: muhafizAyarlari.aktif ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }}
                        >
                            {muhafizAyarlari.aktif ? 'Hatirlatmalar aktif' : 'Hatirlatmalar kapali'}
                        </Text>
                    </View>
                </View>
                <Switch
                    value={muhafizAyarlari.aktif}
                    onValueChange={(val) => { dispatch(muhafizAyarlariniGuncelle({ aktif: val })); }}
                    trackColor={{ false: renkler.sinir, true: 'rgba(255,255,255,0.3)' }}
                    thumbColor={muhafizAyarlari.aktif ? '#FFF' : '#f4f3f4'}
                />
            </View>

            {/* Kapali ise mesaj goster */}
            {!muhafizAyarlari.aktif && (
                <View
                    className="items-center p-10 rounded-2xl border"
                    style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                >
                    <FontAwesome5 name="bed" size={48} color={renkler.metinIkincil} />
                    <Text className="text-base text-center mt-3" style={{ color: renkler.metinIkincil }}>
                        Muhafiz kapali. Namaz vakitleri hatirlatilmayacak.
                    </Text>
                </View>
            )}

            {/* AKTIF ISE AYARLAR */}
            {muhafizAyarlari.aktif && (
                <>
                    {/* KONUM BILGISI - Salt Okunur Badge */}
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-3.5 rounded-xl border mb-4"
                        style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                        onPress={() => navigation.navigate('KonumAyarlari')}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${renkler.birincil}15` }}>
                                <FontAwesome5
                                    name={konumAyarlari.konumModu === 'oto' ? 'satellite-dish' : 'map-marker-alt'}
                                    size={16}
                                    color={renkler.birincil}
                                    solid
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[11px] font-medium tracking-wider" style={{ color: renkler.metinIkincil }}>
                                    KONUM {sonGuncellemeKisaMetin() && `• ${sonGuncellemeKisaMetin()}`}
                                </Text>
                                <Text className="text-base font-semibold mt-0.5" style={{ color: renkler.metin }}>
                                    {konumMetniOlustur()}
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            {konumAyarlari.akilliTakipAktif && konumAyarlari.konumModu === 'oto' && (
                                <View className="w-7 h-7 rounded-full items-center justify-center mr-1.5" style={{ backgroundColor: '#4CAF5020' }}>
                                    <FontAwesome5 name="compass" size={12} color="#4CAF50" />
                                </View>
                            )}
                            <View
                                className="px-2.5 py-1 rounded-lg mr-2"
                                style={{ backgroundColor: konumAyarlari.konumModu === 'oto' ? '#4CAF5020' : '#2196F320' }}
                            >
                                <Text
                                    className="text-xs font-bold"
                                    style={{ color: konumAyarlari.konumModu === 'oto' ? '#4CAF50' : '#2196F3' }}
                                >
                                    {konumAyarlari.konumModu === 'oto' ? 'GPS' : 'Manuel'}
                                </Text>
                            </View>
                            <FontAwesome5 name="chevron-right" size={14} color={renkler.metinIkincil} />
                        </View>
                    </TouchableOpacity>

                    {/* YOGUNLUK SECIMI */}
                    <View
                        className="rounded-2xl border p-4 mb-4"
                        style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                    >
                        <View className="flex-row items-center mb-3">
                            <FontAwesome5 name="bell" size={16} color={renkler.metinIkincil} solid />
                            <Text className="text-xs font-semibold tracking-wider ml-2" style={{ color: renkler.metinIkincil }}>
                                HATIRLATMA SIKLIGI
                            </Text>
                        </View>

                        {/* Preset Butonlari */}
                        <View className="flex-row gap-2.5">
                            {(['hafif', 'normal', 'yogun'] as const).map((yog) => {
                                const preset = HATIRLATMA_PRESETLERI[yog];
                                const seciliMi = muhafizAyarlari.yogunluk === yog;
                                const ikonAdi = yog === 'hafif' ? 'feather-alt' : yog === 'normal' ? 'balance-scale' : 'bolt';
                                return (
                                    <TouchableOpacity
                                        key={yog}
                                        className="flex-1 items-center py-4 px-2 rounded-xl border-2"
                                        style={{
                                            backgroundColor: seciliMi ? renkler.birincil : 'transparent',
                                            borderColor: seciliMi ? renkler.birincil : renkler.sinir,
                                        }}
                                        onPress={() => handleYogunlukSec(yog)}
                                        activeOpacity={0.7}
                                    >
                                        <FontAwesome5
                                            name={ikonAdi}
                                            size={18}
                                            color={seciliMi ? '#FFF' : renkler.metin}
                                        />
                                        <Text
                                            className="text-sm font-bold mt-1.5"
                                            style={{ color: seciliMi ? '#FFF' : renkler.metin }}
                                        >
                                            {yog === 'hafif' ? 'Hafif' : yog === 'normal' ? 'Normal' : 'Yogun'}
                                        </Text>
                                        <Text
                                            className="text-[10px] mt-0.5 text-center"
                                            style={{ color: seciliMi ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }}
                                        >
                                            {preset.aciklama}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Ozel Secenegi */}
                        <TouchableOpacity
                            className="flex-row items-center p-3.5 rounded-xl border-2 mt-2.5"
                            style={{
                                backgroundColor: muhafizAyarlari.yogunluk === 'ozel' ? `${renkler.birincil}15` : 'transparent',
                                borderColor: muhafizAyarlari.yogunluk === 'ozel' ? renkler.birincil : renkler.sinir,
                            }}
                            onPress={() => { dispatch(muhafizAyarlariniGuncelle({ yogunluk: 'ozel' })); }}
                            activeOpacity={0.7}
                        >
                            <View
                                className="w-5.5 h-5.5 rounded-full border-2 items-center justify-center mr-3"
                                style={{ borderColor: muhafizAyarlari.yogunluk === 'ozel' ? renkler.birincil : renkler.sinir }}
                            >
                                {muhafizAyarlari.yogunluk === 'ozel' && (
                                    <View className="w-3 h-3 rounded-full" style={{ backgroundColor: renkler.birincil }} />
                                )}
                            </View>
                            <FontAwesome5 name="cog" size={16} color={renkler.metin} />
                            <View className="flex-1 ml-2.5">
                                <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                    Ozel Secim
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    Hatirlatma bildirimlerini kendine gore ayarla
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* OZEL AYARLAR */}
                    {muhafizAyarlari.yogunluk === 'ozel' && (
                        <View
                            className="rounded-2xl border p-4 mb-4"
                            style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                        >
                            <View className="flex-row items-center mb-1">
                                <FontAwesome5 name="cog" size={16} color={renkler.metin} />
                                <Text className="text-base font-bold ml-2" style={{ color: renkler.metin }}>
                                    Ozel Bildirim Ayarlari
                                </Text>
                            </View>
                            <Text className="text-xs mb-4" style={{ color: renkler.metinIkincil }}>
                                Her seviyenin zamanini ve tekrar sikligini ayarlayin.
                            </Text>

                            {SEVIYE_BILGILERI.map((seviye, index) => {
                                const seviyeKey = seviye.id as keyof typeof muhafizAyarlari.esikler;
                                return (
                                    <View
                                        key={seviye.id}
                                        className="p-4 rounded-xl border mb-3"
                                        style={{
                                            backgroundColor: renkler.arkaplan,
                                            borderColor: renkler.sinir,
                                            borderLeftWidth: 4,
                                            borderLeftColor: seviye.renk,
                                        }}
                                    >
                                        <View className="flex-row items-center mb-4">
                                            <View
                                                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                                style={{ backgroundColor: `${seviye.renk}20` }}
                                            >
                                                <FontAwesome5 name={seviye.ikonAdi} size={16} color={seviye.renk} solid />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-base font-bold" style={{ color: seviye.renk }}>
                                                    Seviye {index + 1}
                                                </Text>
                                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                                    {seviye.baslik}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center justify-between mb-3">
                                            <Text className="text-sm font-medium flex-1" style={{ color: renkler.metin }}>Ne zaman:</Text>
                                            <SayisalSecici
                                                deger={muhafizAyarlari.esikler[seviyeKey]}
                                                min={seviye.minEsik}
                                                max={seviye.maxEsik}
                                                adim={5}
                                                birim="dk kala"
                                                onChange={(val) => esikDegistir(seviyeKey, val)}
                                                renk={seviye.renk}
                                            />
                                        </View>
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-sm font-medium flex-1" style={{ color: renkler.metin }}>Tekrar:</Text>
                                            <SayisalSecici
                                                deger={muhafizAyarlari.sikliklar[seviyeKey]}
                                                min={1}
                                                max={30}
                                                adim={1}
                                                birim="dk'da bir"
                                                onChange={(val) => siklikDegistir(seviyeKey, val)}
                                                renk={seviye.renk}
                                            />
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* BILDIRIM ONIZLEME */}
                    <View className="mb-4">
                        <BildirimOnizleme esikler={muhafizAyarlari.esikler} sikliklar={muhafizAyarlari.sikliklar} />
                    </View>
                </>
            )}

            <View className="h-10" />
        </ScrollView>
    );
};
