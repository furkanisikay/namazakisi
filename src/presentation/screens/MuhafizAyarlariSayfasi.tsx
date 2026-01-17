/**
 * Muhafiz Ayarlari Sayfasi
 * Namaz hatirlatma bildirimleri ayarlari
 * SOLID: Single Responsibility - Sadece muhafiz/hatirlatma ayarlari
 */

import * as React from 'react';
import { useState, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
    { id: 'seviye1', baslik: 'Nazik Hatırlatma', ikon: '🔔', renk: SEVIYE_RENKLERI.seviye1, minEsik: 15, maxEsik: 90 },
    { id: 'seviye2', baslik: 'Uyarı', ikon: '⚠️', renk: SEVIYE_RENKLERI.seviye2, minEsik: 10, maxEsik: 60 },
    { id: 'seviye3', baslik: 'Şeytanla Mücadele', ikon: '🔥', renk: SEVIYE_RENKLERI.seviye3, minEsik: 5, maxEsik: 30 },
    { id: 'seviye4', baslik: 'Acil Alarm', ikon: '🚨', renk: SEVIYE_RENKLERI.seviye4, minEsik: 1, maxEsik: 15 },
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
        <View style={[styles.sayisalSecici, { borderColor: renkler.sinir }]}>
            <TouchableOpacity
                style={[styles.sayisalButon, { backgroundColor: deger <= min ? renkler.sinir : renk }]}
                onPress={azalt}
                disabled={deger <= min}
                activeOpacity={0.7}
            >
                <Text style={styles.sayisalButonMetin}>−</Text>
            </TouchableOpacity>
            <View style={[styles.sayisalDegerContainer, { backgroundColor: renkler.kartArkaplan }]}>
                <Text style={[styles.sayisalDeger, { color: renkler.metin }]}>{deger}</Text>
                <Text style={[styles.sayisalBirim, { color: renkler.metinIkincil }]}>{birim}</Text>
            </View>
            <TouchableOpacity
                style={[styles.sayisalButon, { backgroundColor: deger >= max ? renkler.sinir : renk }]}
                onPress={artir}
                disabled={deger >= max}
                activeOpacity={0.7}
            >
                <Text style={styles.sayisalButonMetin}>+</Text>
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
    ikon: string;
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
            { seviye: 1, esik: esikler.seviye1, siklik: sikliklar.seviye1, renk: SEVIYE_RENKLERI.seviye1, ikon: '🔔' },
            { seviye: 2, esik: esikler.seviye2, siklik: sikliklar.seviye2, renk: SEVIYE_RENKLERI.seviye2, ikon: '⚠️' },
            { seviye: 3, esik: esikler.seviye3, siklik: sikliklar.seviye3, renk: SEVIYE_RENKLERI.seviye3, ikon: '🔥' },
            { seviye: 4, esik: esikler.seviye4, siklik: sikliklar.seviye4, renk: SEVIYE_RENKLERI.seviye4, ikon: '🚨' },
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
                    ikon: seviye.ikon,
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
            ikon: seviye === 1 ? '🔔' : seviye === 2 ? '⚠️' : seviye === 3 ? '🔥' : '🚨',
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
        <View style={[styles.onizlemeContainer, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
            {/* Baslik - Tiklanabilir */}
            <TouchableOpacity
                style={styles.onizlemeBaslikContainer}
                onPress={toggleAcKapa}
                activeOpacity={0.7}
            >
                <View style={styles.onizlemeBaslikSol}>
                    <Text style={[styles.onizlemeBaslik, { color: renkler.metin }]}>📊 Bildirim Özeti</Text>
                    <View style={[styles.toplamBadge, { backgroundColor: renkler.birincil }]}>
                        <Text style={styles.toplamBadgeMetin}>{tumBildirimler.length} Bildirim</Text>
                    </View>
                </View>
                <Animated.Text style={[
                    styles.acKapaIkon,
                    {
                        color: renkler.metinIkincil,
                        transform: [{
                            rotate: animDeger.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '180deg'],
                            })
                        }]
                    }
                ]}>▼</Animated.Text>
            </TouchableOpacity>

            {/* Kompakt Ozet */}
            <View style={styles.kompaktOzet}>
                {seviyeSayilari.map((item) => (
                    <View key={item.seviye} style={[styles.kompaktOzetItem, { backgroundColor: `${item.renk}15` }]}>
                        <Text style={styles.kompaktOzetIkon}>{item.ikon}</Text>
                        <Text style={[styles.kompaktOzetSayi, { color: item.renk }]}>{item.sayi}x</Text>
                    </View>
                ))}
            </View>

            {/* Genisletilmis Detay */}
            {acikMi && (
                <Animated.View style={[
                    styles.detayContainer,
                    {
                        opacity: animDeger,
                        borderTopColor: renkler.sinir
                    }
                ]}>
                    <Text style={[styles.detayBaslik, { color: renkler.metinIkincil }]}>
                        Zaman Çizelgesi
                    </Text>

                    <View style={styles.timelineContainer}>
                        {tumBildirimler.map((bildirim, index) => (
                            <View key={`${bildirim.seviye}-${bildirim.dakika}`} style={styles.timelineSatir}>
                                <View style={styles.timelineSol}>
                                    <View style={[styles.timelineNokta, { backgroundColor: bildirim.renk }]}>
                                        <Text style={styles.timelineNoktaIkon}>{bildirim.ikon}</Text>
                                    </View>
                                    {index < tumBildirimler.length - 1 && (
                                        <View style={[styles.timelineCizgi, { backgroundColor: renkler.sinir }]} />
                                    )}
                                </View>

                                <View style={[
                                    styles.timelineKart,
                                    {
                                        backgroundColor: bildirim.tekrarMi ? 'transparent' : `${bildirim.renk}12`,
                                        borderColor: bildirim.tekrarMi ? renkler.sinir : bildirim.renk,
                                        borderWidth: bildirim.tekrarMi ? 1 : 1.5,
                                    }
                                ]}>
                                    <View style={styles.timelineKartUst}>
                                        <Text style={[styles.timelineDakika, { color: bildirim.renk }]}>
                                            {bildirim.dakika} dk kala
                                        </Text>
                                        <View style={[styles.timelineBadge, { backgroundColor: bildirim.renk }]}>
                                            <Text style={styles.timelineBadgeMetin}>Seviye {bildirim.seviye}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.timelineAciklama, { color: renkler.metinIkincil }]}>
                                        {bildirim.seviye === 1 && 'Nazik Hatırlatma'}
                                        {bildirim.seviye === 2 && 'Uyarı'}
                                        {bildirim.seviye === 3 && 'Şeytanla mücadele'}
                                        {bildirim.seviye === 4 && 'Acil alarm'}
                                        {' bildirimi'}
                                        {bildirim.tekrarMi && ' (tekrar)'}
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {/* Vakit Cikisi */}
                        <View style={styles.timelineSatir}>
                            <View style={styles.timelineSol}>
                                <View style={[styles.timelineNokta, { backgroundColor: renkler.sinir }]}>
                                    <Text style={styles.timelineNoktaIkon}>⏰</Text>
                                </View>
                            </View>
                            <View style={[
                                styles.timelineKart,
                                { backgroundColor: '#1a1a1a15', borderColor: renkler.sinir, borderWidth: 1.5 }
                            ]}>
                                <Text style={[styles.timelineDakika, { color: renkler.metinIkincil }]}>
                                    Vakit Çıkışı
                                </Text>
                                <Text style={[styles.timelineAciklama, { color: renkler.metinIkincil }]}>
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
            return 'Az önce';
        } else if (farkDakika < 60) {
            return `${farkDakika} dk önce`;
        } else if (farkSaat < 24) {
            return `${farkSaat} sa önce`;
        } else {
            return `${farkGun} gün önce`;
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
        <ScrollView style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
            {/* ANA SWITCH */}
            <View style={[
                styles.anaSwitch,
                {
                    backgroundColor: muhafizAyarlari.aktif ? renkler.birincil : renkler.kartArkaplan,
                    borderColor: muhafizAyarlari.aktif ? renkler.birincil : renkler.sinir,
                }
            ]}>
                <View style={styles.anaSwitchIcerik}>
                    <Text style={styles.anaSwitchIkon}>{muhafizAyarlari.aktif ? '🛡️' : '💤'}</Text>
                    <View style={styles.anaSwitchMetin}>
                        <Text style={[styles.anaSwitchBaslik, { color: muhafizAyarlari.aktif ? '#FFF' : renkler.metin }]}>
                            Namaz Muhafızı
                        </Text>
                        <Text style={[styles.anaSwitchAlt, { color: muhafizAyarlari.aktif ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }]}>
                            {muhafizAyarlari.aktif ? 'Hatırlatmalar aktif' : 'Hatırlatmalar kapalı'}
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
                <View style={[styles.kapaliMesaj, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                    <Text style={styles.kapaliIkon}>😴</Text>
                    <Text style={[styles.kapaliMetin, { color: renkler.metinIkincil }]}>
                        Muhafız kapalı. Namaz vakitleri hatırlatılmayacak.
                    </Text>
                </View>
            )}

            {/* AKTIF ISE AYARLAR */}
            {muhafizAyarlari.aktif && (
                <>
                    {/* KONUM BILGISI - Salt Okunur Badge */}
                    <TouchableOpacity
                        style={[styles.konumBadge, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}
                        onPress={() => navigation.navigate('KonumAyarlari')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.konumBadgeIcerik}>
                            <Text style={styles.konumBadgeIkon}>
                                {konumAyarlari.konumModu === 'oto' ? '📡' : '📍'}
                            </Text>
                            <View style={styles.konumBadgeMetin}>
                                <Text style={[styles.konumBadgeEtiket, { color: renkler.metinIkincil }]}>
                                    Konum {sonGuncellemeKisaMetin() && `• ${sonGuncellemeKisaMetin()}`}
                                </Text>
                                <Text style={[styles.konumBadgeDeger, { color: renkler.metin }]}>
                                    {konumMetniOlustur()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.konumBadgeSag}>
                            {konumAyarlari.akilliTakipAktif && konumAyarlari.konumModu === 'oto' && (
                                <View style={[styles.takipBadge, { backgroundColor: '#4CAF5020' }]}>
                                    <Text style={styles.takipBadgeMetin}>🧭</Text>
                                </View>
                            )}
                            <View style={[styles.konumModBadge, { 
                                backgroundColor: konumAyarlari.konumModu === 'oto' ? '#4CAF5020' : '#2196F320' 
                            }]}>
                                <Text style={[styles.konumModBadgeMetin, { 
                                    color: konumAyarlari.konumModu === 'oto' ? '#4CAF50' : '#2196F3' 
                                }]}>
                                    {konumAyarlari.konumModu === 'oto' ? 'GPS' : 'Manuel'}
                                </Text>
                            </View>
                            <Text style={[styles.konumOk, { color: renkler.metinIkincil }]}>›</Text>
                        </View>
                    </TouchableOpacity>

                    {/* YOGUNLUK SECIMI */}
                    <View style={[styles.basitKart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                        <View style={styles.basitKartBaslik}>
                            <Text style={styles.basitKartIkon}>🔔</Text>
                            <Text style={[styles.basitKartEtiket, { color: renkler.metinIkincil }]}>Hatırlatma Sıklığı</Text>
                        </View>

                        {/* Preset Butonlari */}
                        <View style={styles.yogunlukSecici}>
                            {(['hafif', 'normal', 'yogun'] as const).map((yog) => {
                                const preset = HATIRLATMA_PRESETLERI[yog];
                                const seciliMi = muhafizAyarlari.yogunluk === yog;
                                return (
                                    <TouchableOpacity
                                        key={yog}
                                        style={[
                                            styles.yogunlukButon,
                                            {
                                                backgroundColor: seciliMi ? renkler.birincil : 'transparent',
                                                borderColor: seciliMi ? renkler.birincil : renkler.sinir,
                                            }
                                        ]}
                                        onPress={() => handleYogunlukSec(yog)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.yogunlukIkon}>{preset.ikon}</Text>
                                        <Text style={[
                                            styles.yogunlukBaslik,
                                            { color: seciliMi ? '#FFF' : renkler.metin }
                                        ]}>
                                            {yog === 'hafif' ? 'Hafif' : yog === 'normal' ? 'Normal' : 'Yoğun'}
                                        </Text>
                                        <Text style={[
                                            styles.yogunlukAlt,
                                            { color: seciliMi ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }
                                        ]}>
                                            {preset.aciklama}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Ozel Secenegi */}
                        <TouchableOpacity
                            style={[
                                styles.ozelButon,
                                {
                                    backgroundColor: muhafizAyarlari.yogunluk === 'ozel' ? `${renkler.birincil}15` : 'transparent',
                                    borderColor: muhafizAyarlari.yogunluk === 'ozel' ? renkler.birincil : renkler.sinir,
                                }
                            ]}
                            onPress={() => { dispatch(muhafizAyarlariniGuncelle({ yogunluk: 'ozel' })); }}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.radioButon,
                                { borderColor: muhafizAyarlari.yogunluk === 'ozel' ? renkler.birincil : renkler.sinir }
                            ]}>
                                {muhafizAyarlari.yogunluk === 'ozel' && (
                                    <View style={[styles.radioButonIc, { backgroundColor: renkler.birincil }]} />
                                )}
                            </View>
                            <Text style={styles.ozelButonIkon}>⚙️</Text>
                            <View style={styles.ozelButonMetin}>
                                <Text style={[styles.ozelButonBaslik, { color: renkler.metin }]}>
                                    Özel Seçim
                                </Text>
                                <Text style={[styles.ozelButonAlt, { color: renkler.metinIkincil }]}>
                                    Hatırlatma bildirimlerini kendine göre ayarla
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* OZEL AYARLAR */}
                    {muhafizAyarlari.yogunluk === 'ozel' && (
                        <View style={[styles.ozelAyarlarContainer, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                            <Text style={[styles.ozelAyarlarBaslik, { color: renkler.metin }]}>
                                ⚙️ Özel Bildirim Ayarları
                            </Text>
                            <Text style={[styles.ozelAyarlarAciklama, { color: renkler.metinIkincil }]}>
                                Her seviyenin zamanını ve tekrar sıklığını ayarlayın.
                            </Text>

                            {SEVIYE_BILGILERI.map((seviye, index) => {
                                const seviyeKey = seviye.id as keyof typeof muhafizAyarlari.esikler;
                                return (
                                    <View
                                        key={seviye.id}
                                        style={[
                                            styles.seviyeKart,
                                            { backgroundColor: renkler.arkaplan, borderColor: renkler.sinir, borderLeftColor: seviye.renk }
                                        ]}
                                    >
                                        <View style={styles.seviyeUstSatir}>
                                            <Text style={styles.seviyeIkon}>{seviye.ikon}</Text>
                                            <View style={styles.seviyeBaslikContainer}>
                                                <Text style={[styles.seviyeBaslik, { color: seviye.renk }]}>
                                                    Seviye {index + 1}
                                                </Text>
                                                <Text style={[styles.seviyeAltBaslik, { color: renkler.metinIkincil }]}>
                                                    {seviye.baslik}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.ayarSatiriCompact}>
                                            <Text style={[styles.ayarEtiketi, { color: renkler.metin }]}>Ne zaman:</Text>
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
                                        <View style={styles.ayarSatiriCompact}>
                                            <Text style={[styles.ayarEtiketi, { color: renkler.metin }]}>Tekrar:</Text>
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
                    <View style={styles.onizlemeWrapper}>
                        <BildirimOnizleme esikler={muhafizAyarlari.esikler} sikliklar={muhafizAyarlari.sikliklar} />
                    </View>
                </>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    // ANA SWITCH
    anaSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        marginBottom: 16,
        marginTop: 8,
    },
    anaSwitchIcerik: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    anaSwitchIkon: {
        fontSize: 36,
        marginRight: 16,
    },
    anaSwitchMetin: {
        flex: 1,
    },
    anaSwitchBaslik: {
        fontSize: 20,
        fontWeight: '700',
    },
    anaSwitchAlt: {
        fontSize: 14,
        marginTop: 2,
    },
    // KAPALI MESAJ
    kapaliMesaj: {
        alignItems: 'center',
        padding: 40,
        borderRadius: 16,
        borderWidth: 1,
    },
    kapaliIkon: {
        fontSize: 48,
        marginBottom: 12,
    },
    kapaliMetin: {
        fontSize: 15,
        textAlign: 'center',
    },
    // KONUM BADGE
    konumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 16,
    },
    konumBadgeIcerik: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    konumBadgeIkon: {
        fontSize: 24,
        marginRight: 12,
    },
    konumBadgeMetin: {
        flex: 1,
    },
    konumBadgeEtiket: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    konumBadgeDeger: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 2,
    },
    konumBadgeSag: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    takipBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    takipBadgeMetin: {
        fontSize: 14,
    },
    konumModBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    konumModBadgeMetin: {
        fontSize: 11,
        fontWeight: '700',
    },
    konumOk: {
        fontSize: 24,
        fontWeight: '300',
    },
    // BASIT KART
    basitKart: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    basitKartBaslik: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    basitKartIkon: {
        fontSize: 20,
        marginRight: 8,
    },
    basitKartEtiket: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // YOGUNLUK SECICI
    yogunlukSecici: {
        flexDirection: 'row',
        gap: 10,
    },
    yogunlukButon: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 14,
        borderWidth: 2,
    },
    yogunlukIkon: {
        fontSize: 20,
        marginBottom: 6,
    },
    yogunlukBaslik: {
        fontSize: 14,
        fontWeight: '700',
    },
    yogunlukAlt: {
        fontSize: 10,
        marginTop: 2,
        textAlign: 'center',
    },
    // OZEL BUTON
    ozelButon: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        marginTop: 10,
    },
    ozelButonIkon: {
        fontSize: 18,
        marginRight: 10,
    },
    ozelButonMetin: {
        flex: 1,
    },
    ozelButonBaslik: {
        fontSize: 15,
        fontWeight: '600',
    },
    ozelButonAlt: {
        fontSize: 12,
        marginTop: 1,
    },
    radioButon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioButonIc: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    // OZEL AYARLAR
    ozelAyarlarContainer: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    ozelAyarlarBaslik: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    ozelAyarlarAciklama: {
        fontSize: 13,
        marginBottom: 16,
    },
    onizlemeWrapper: {
        marginBottom: 16,
    },
    // SEVIYE KART
    seviyeKart: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderLeftWidth: 4,
        marginBottom: 12,
    },
    seviyeUstSatir: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    seviyeIkon: {
        fontSize: 28,
        marginRight: 12,
    },
    seviyeBaslikContainer: {
        flex: 1,
    },
    seviyeBaslik: {
        fontSize: 16,
        fontWeight: '700',
    },
    seviyeAltBaslik: {
        fontSize: 12,
        marginTop: 2,
    },
    ayarSatiriCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    ayarEtiketi: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    // SAYISAL SECICI
    sayisalSecici: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        overflow: 'hidden',
    },
    sayisalButon: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sayisalButonMetin: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sayisalDegerContainer: {
        paddingHorizontal: 12,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        minWidth: 90,
    },
    sayisalDeger: {
        fontSize: 16,
        fontWeight: '700',
        marginRight: 4,
    },
    sayisalBirim: {
        fontSize: 11,
    },
    // ONIZLEME
    onizlemeContainer: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    onizlemeBaslikContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
    },
    onizlemeBaslikSol: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    onizlemeBaslik: {
        fontSize: 15,
        fontWeight: '700',
    },
    toplamBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    toplamBadgeMetin: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    acKapaIkon: {
        fontSize: 12,
    },
    kompaktOzet: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingBottom: 14,
        gap: 8,
    },
    kompaktOzetItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        gap: 4,
    },
    kompaktOzetIkon: {
        fontSize: 14,
    },
    kompaktOzetSayi: {
        fontSize: 14,
        fontWeight: '700',
    },
    detayContainer: {
        borderTopWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    detayBaslik: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timelineContainer: {
        marginTop: 4,
    },
    timelineSatir: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timelineSol: {
        width: 44,
        alignItems: 'center',
    },
    timelineNokta: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timelineNoktaIkon: {
        fontSize: 14,
    },
    timelineCizgi: {
        width: 2,
        height: 32,
        marginVertical: 2,
    },
    timelineKart: {
        flex: 1,
        marginLeft: 8,
        marginBottom: 6,
        padding: 10,
        borderRadius: 10,
    },
    timelineKartUst: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    timelineDakika: {
        fontSize: 14,
        fontWeight: '700',
    },
    timelineBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    timelineBadgeMetin: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '600',
    },
    timelineAciklama: {
        fontSize: 11,
    },
});
