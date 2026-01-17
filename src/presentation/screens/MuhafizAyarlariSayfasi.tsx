import * as React from 'react';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    FlatList,
    Dimensions,
    Animated,
    Pressable,
} from 'react-native';
import * as Location from 'expo-location';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { muhafizAyarlariniGuncelle, HATIRLATMA_PRESETLERI, HatirlatmaYogunlugu } from '../store/muhafizSlice';
import { NamazVaktiHesaplayiciServisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { TurkiyeKonumServisi, Il, Ilce, TURKIYE_ILLERI_OFFLINE } from '../../domain/services/TurkiyeKonumServisi';
import { useFeedback } from '../../core/feedback';

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');

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

/**
 * Numerik Up/Down Komponenti
 * Throttle ile hizli tiklamalari kontrol altina alir
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

// Throttle suresi (ms) - bu sure icinde sadece bir tiklama islenir
const THROTTLE_SURESI = 100;

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

    // Throttle kontrolu - cok hizli tiklamalari engelle
    const throttleKontrol = useCallback((): boolean => {
        const simdi = Date.now();
        if (simdi - sonTiklamaRef.current < THROTTLE_SURESI) {
            return false; // Cok hizli, engelle
        }
        sonTiklamaRef.current = simdi;
        return true; // Izin ver
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
 * Il/Ilce Secici Komponenti Props
 */
interface IlIlceSeciciProps {
    seciliIlId: number | null;
    seciliIlceId: number | null;
    seciliIlAdi: string;
    seciliIlceAdi: string;
    onKonumSec: (il: Il, ilce?: Ilce) => void;
}

/**
 * Profesyonel Il/Ilce Secici Komponenti
 * Cascading dropdown: Il sec -> Ilce sec
 */
const IlIlceSecici: React.FC<IlIlceSeciciProps> = ({
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

    // Iller listesi (offline + API)
    const [iller, setIller] = useState<Il[]>(TURKIYE_ILLERI_OFFLINE);

    // Baslangicta illeri yukle
    useEffect(() => {
        const illerYukle = async () => {
            const illerData = await TurkiyeKonumServisi.illeriGetir();
            setIller(illerData);
        };
        illerYukle();
    }, []);

    // Turkce karakter normalizasyonu
    const normalizeMetin = useCallback((metin: string) => {
        return metin.toLowerCase().replace(/[ığüşöçİ]/g, (char) => {
            const harita: Record<string, string> = {
                'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c', 'İ': 'i'
            };
            return harita[char] || char;
        });
    }, []);

    // Filtrelenmis iller
    const filtreliIller = useMemo(() => {
        if (!aramaMetni) return iller.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
        const aramaKucuk = normalizeMetin(aramaMetni);
        return iller
            .filter(il => normalizeMetin(il.ad).includes(aramaKucuk))
            .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    }, [iller, aramaMetni, normalizeMetin]);

    // Filtrelenmis ilceler
    const filtreliIlceler = useMemo(() => {
        if (!aramaMetni) return ilceler.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
        const aramaKucuk = normalizeMetin(aramaMetni);
        return ilceler
            .filter(ilce => normalizeMetin(ilce.ad).includes(aramaKucuk))
            .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    }, [ilceler, aramaMetni, normalizeMetin]);

    // Modal ac
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

    // Modal kapat
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

    // Il secimi
    const ilSecHandler = useCallback(async (il: Il) => {
        setSecilenIl(il);
        setAramaMetni('');
        setIlcelerYukleniyor(true);

        // Ilceleri yukle
        const ilceData = await TurkiyeKonumServisi.ilceleriGetir(il.id);
        setIlceler(ilceData);
        setIlcelerYukleniyor(false);

        if (ilceData.length > 0) {
            setAdim('ilce');
        } else {
            // Ilce yoksa direkt il ile devam et
            onKonumSec(il);
            modalKapat();
        }
    }, [onKonumSec, modalKapat]);

    // Ilce secimi
    const ilceSecHandler = useCallback((ilce: Ilce) => {
        if (secilenIl) {
            onKonumSec(secilenIl, ilce);
            modalKapat();
        }
    }, [secilenIl, onKonumSec, modalKapat]);

    // Geri butonu (ilce -> il)
    const geriHandler = useCallback(() => {
        setAdim('il');
        setSecilenIl(null);
        setAramaMetni('');
    }, []);

    // Il listesi ogesi render
    const ilOgesiRender = useCallback(({ item }: { item: Il }) => {
        const seciliMi = item.id === seciliIlId;
        return (
            <TouchableOpacity
                style={[
                    styles.sehirListeOge,
                    {
                        backgroundColor: seciliMi ? `${renkler.birincil}15` : 'transparent',
                        borderColor: seciliMi ? renkler.birincil : 'transparent',
                    }
                ]}
                onPress={() => ilSecHandler(item)}
                activeOpacity={0.7}
            >
                <View style={styles.sehirListeIcerik}>
                    <View style={[
                        styles.sehirListeIkon,
                        { backgroundColor: seciliMi ? renkler.birincil : renkler.sinir }
                    ]}>
                        <Text style={styles.sehirListeIkonMetin}>{item.plakaKodu}</Text>
                    </View>
                    <View style={styles.sehirListeMetin}>
                        <Text style={[
                            styles.sehirListeAd,
                            {
                                color: seciliMi ? renkler.birincil : renkler.metin,
                                fontWeight: seciliMi ? '700' : '500'
                            }
                        ]}>
                            {item.ad}
                        </Text>
                        <Text style={[styles.sehirListeKoordinat, { color: renkler.metinIkincil }]}>
                            {item.lat.toFixed(2)}°K, {item.lng.toFixed(2)}°D
                        </Text>
                    </View>
                </View>
                <Text style={[styles.sehirOkIkon, { color: renkler.metinIkincil }]}>▶</Text>
            </TouchableOpacity>
        );
    }, [seciliIlId, renkler, ilSecHandler]);

    // Ilce listesi ogesi render
    const ilceOgesiRender = useCallback(({ item }: { item: Ilce }) => {
        const seciliMi = item.id === seciliIlceId;
        return (
            <TouchableOpacity
                style={[
                    styles.sehirListeOge,
                    {
                        backgroundColor: seciliMi ? `${renkler.birincil}15` : 'transparent',
                        borderColor: seciliMi ? renkler.birincil : 'transparent',
                    }
                ]}
                onPress={() => ilceSecHandler(item)}
                activeOpacity={0.7}
            >
                <View style={styles.sehirListeIcerik}>
                    <View style={[
                        styles.sehirListeIkon,
                        { backgroundColor: seciliMi ? renkler.birincil : renkler.sinir }
                    ]}>
                        <Text style={styles.sehirListeIkonMetin}>
                            {seciliMi ? '✓' : '📍'}
                        </Text>
                    </View>
                    <View style={styles.sehirListeMetin}>
                        <Text style={[
                            styles.sehirListeAd,
                            {
                                color: seciliMi ? renkler.birincil : renkler.metin,
                                fontWeight: seciliMi ? '700' : '500'
                            }
                        ]}>
                            {item.ad}
                        </Text>
                    </View>
                </View>
                {seciliMi && (
                    <View style={[styles.seciliBadge, { backgroundColor: renkler.birincil }]}>
                        <Text style={styles.seciliBadgeMetin}>Secili</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [seciliIlceId, renkler, ilceSecHandler]);

    // Konum metni
    const konumMetni = useMemo(() => {
        if (seciliIlceAdi && seciliIlAdi) {
            return `${seciliIlceAdi}, ${seciliIlAdi}`;
        }
        if (seciliIlAdi) {
            return seciliIlAdi;
        }
        return 'Konum seciniz...';
    }, [seciliIlAdi, seciliIlceAdi]);

    return (
        <>
            {/* Konum Secici Butonu */}
            <TouchableOpacity
                style={[
                    styles.sehirSeciciButon,
                    {
                        backgroundColor: renkler.kartArkaplan,
                        borderColor: seciliIlId ? renkler.birincil : renkler.sinir,
                        borderWidth: seciliIlId ? 2 : 1,
                    }
                ]}
                onPress={modalAc}
                activeOpacity={0.8}
            >
                <View style={styles.sehirSeciciIcerik}>
                    <View style={[
                        styles.sehirSeciciIkonContainer,
                        { backgroundColor: seciliIlId ? `${renkler.birincil}20` : renkler.sinir }
                    ]}>
                        <Text style={styles.sehirSeciciIkon}>📍</Text>
                    </View>
                    <View style={styles.sehirSeciciMetin}>
                        <Text style={[styles.sehirSeciciEtiket, { color: renkler.metinIkincil }]}>
                            Konum
                        </Text>
                        <Text style={[
                            styles.sehirSeciciDeger,
                            { color: seciliIlId ? renkler.metin : renkler.metinIkincil }
                        ]}>
                            {konumMetni}
                        </Text>
                    </View>
                </View>
                <View style={styles.sehirSeciciOk}>
                    <Text style={[styles.sehirSeciciOkMetin, { color: renkler.metinIkincil }]}>▼</Text>
                </View>
            </TouchableOpacity>

            {/* Il/Ilce Secim Modali */}
            <Modal
                visible={modalGorunum}
                transparent
                animationType="none"
                onRequestClose={modalKapat}
            >
                <Pressable
                    style={styles.modalArkaplan}
                    onPress={modalKapat}
                >
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            {
                                backgroundColor: renkler.arkaplan,
                                transform: [{
                                    translateY: animDeger.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [EKRAN_YUKSEKLIGI, 0],
                                    })
                                }]
                            }
                        ]}
                    >
                        <Pressable style={{ flex: 1 }} onPress={(e) => e.stopPropagation()}>
                            {/* Modal Baslik */}
                            <View style={[styles.modalBaslik, { borderBottomColor: renkler.sinir }]}>
                                {adim === 'ilce' && (
                                    <TouchableOpacity
                                        style={[styles.geriButon, { backgroundColor: renkler.sinir }]}
                                        onPress={geriHandler}
                                    >
                                        <Text style={[styles.geriButonMetin, { color: renkler.metin }]}>◀</Text>
                                    </TouchableOpacity>
                                )}
                                <View style={[styles.modalBaslikTutucu, adim === 'ilce' && { display: 'none' }]} />
                                <View style={styles.modalBaslikIcerik}>
                                    <Text style={[styles.modalBaslikMetin, { color: renkler.metin }]}>
                                        {adim === 'il' ? '🏙️ İl Seçimi' : `📍 ${secilenIl?.ad} - İlçe Seçimi`}
                                    </Text>
                                    <Text style={[styles.modalAltBaslik, { color: renkler.metinIkincil }]}>
                                        {adim === 'il' ? '81 il arasından seçin' : 'İlçe seçerek devam edin'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.modalKapatButon, { backgroundColor: renkler.sinir }]}
                                    onPress={modalKapat}
                                >
                                    <Text style={[styles.modalKapatMetin, { color: renkler.metin }]}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Breadcrumb - Sadece ilce adiminda */}
                            {adim === 'ilce' && secilenIl && (
                                <View style={[styles.breadcrumb, { backgroundColor: `${renkler.birincil}10` }]}>
                                    <Text style={[styles.breadcrumbMetin, { color: renkler.birincil }]}>
                                        📍 {secilenIl.ad} ({secilenIl.plakaKodu})
                                    </Text>
                                </View>
                            )}

                            {/* Arama Alani */}
                            <View style={[styles.aramaContainer, { backgroundColor: renkler.kartArkaplan }]}>
                                <View style={[styles.aramaIkon, { backgroundColor: renkler.sinir }]}>
                                    <Text>🔍</Text>
                                </View>
                                <TextInput
                                    style={[styles.aramaInput, { color: renkler.metin }]}
                                    placeholder={adim === 'il' ? 'İl ara...' : 'İlçe ara...'}
                                    placeholderTextColor={renkler.metinIkincil}
                                    value={aramaMetni}
                                    onChangeText={setAramaMetni}
                                    autoFocus={false}
                                />
                                {aramaMetni.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.aramaTemizle}
                                        onPress={() => setAramaMetni('')}
                                    >
                                        <Text style={{ color: renkler.metinIkincil }}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Sonuc Sayisi */}
                            <View style={styles.sonucBilgi}>
                                <Text style={[styles.sonucMetin, { color: renkler.metinIkincil }]}>
                                    {adim === 'il'
                                        ? `${filtreliIller.length} il listeleniyor`
                                        : `${filtreliIlceler.length} ilçe listeleniyor`
                                    }
                                </Text>
                            </View>

                            {/* Liste */}
                            {ilcelerYukleniyor ? (
                                <View style={styles.yuklemeContainer}>
                                    <ActivityIndicator size="large" color={renkler.birincil} />
                                    <Text style={[styles.yuklemeMetin, { color: renkler.metinIkincil }]}>
                                        İlçeler yükleniyor...
                                    </Text>
                                </View>
                            ) : adim === 'il' ? (
                                <FlatList
                                    data={filtreliIller}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={ilOgesiRender}
                                    contentContainerStyle={styles.sehirListeContainer}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    initialNumToRender={20}
                                    ListEmptyComponent={
                                        <View style={styles.bosListeContainer}>
                                            <Text style={styles.bosListeIkon}>🔍</Text>
                                            <Text style={[styles.bosListeMetin, { color: renkler.metinIkincil }]}>
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
                                    contentContainerStyle={styles.sehirListeContainer}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    initialNumToRender={20}
                                    ListEmptyComponent={
                                        <View style={styles.bosListeContainer}>
                                            <Text style={styles.bosListeIkon}>🔍</Text>
                                            <Text style={[styles.bosListeMetin, { color: renkler.metinIkincil }]}>
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

/**
 * Bildirim bilgisi tipi
 */
interface BildirimBilgisi {
    dakika: number;
    seviye: number;
    renk: string;
    ikon: string;
    tekrarMi: boolean; // Ilk bildirim mi yoksa tekrar mi
}

/**
 * Bildirim Onizleme Diagrami
 * Tum esikler ve sikliklara gore planlanacak bildirimleri gosterir
 */
interface BildirimOnizlemeProps {
    esikler: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
    sikliklar: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
}

const BildirimOnizleme: React.FC<BildirimOnizlemeProps> = ({ esikler, sikliklar }) => {
    const renkler = useRenkler();
    const [acikMi, setAcikMi] = useState(false);
    const animDeger = useRef(new Animated.Value(0)).current;

    // Tum bildirimleri hesapla (esikler + tekrarlar)
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

            {/* Kompakt Ozet - Her Zaman Gorunur */}
            <View style={styles.kompaktOzet}>
                {seviyeSayilari.map((item) => (
                    <View key={item.seviye} style={[styles.kompaktOzetItem, { backgroundColor: `${item.renk}15` }]}>
                        <Text style={styles.kompaktOzetIkon}>{item.ikon}</Text>
                        <Text style={[styles.kompaktOzetSayi, { color: item.renk }]}>{item.sayi}x</Text>
                    </View>
                ))}
            </View>

            {/* Genisletilmis Detay - Zaman Cizelgesi */}
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

                    {/* Timeline Gorsel */}
                    <View style={styles.timelineContainer}>
                        {tumBildirimler.map((bildirim, index) => (
                            <View key={`${bildirim.seviye}-${bildirim.dakika}`} style={styles.timelineSatir}>
                                {/* Sol: Zaman Cizgisi */}
                                <View style={styles.timelineSol}>
                                    <View style={[styles.timelineNokta, { backgroundColor: bildirim.renk }]}>
                                        <Text style={styles.timelineNoktaIkon}>{bildirim.ikon}</Text>
                                    </View>
                                    {index < tumBildirimler.length - 1 && (
                                        <View style={[styles.timelineCizgi, { backgroundColor: renkler.sinir }]} />
                                    )}
                                </View>

                                {/* Sag: Bildirim Detayi */}
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
 * Muhafiz Ayarlari Sayfasi - Basitlestirilmis UX
 * 3 adimda hazir: 1) Ac/Kapat 2) Konum 3) Yogunluk
 */
export const MuhafizAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const muhafizAyarlari = useAppSelector((state) => state.muhafiz);
    const [yukleniyor, setYukleniyor] = useState(false);

    // GPS ile konum al ve reverse geocoding yap
    const handleKonumOto = async () => {
        await butonTiklandiFeedback();
        setYukleniyor(true);

        try {
            const sonuc = await NamazVaktiHesaplayiciServisi.getInstance().guncelleKonumOto();

            if (sonuc) {
                // Reverse geocoding ile adres bilgisi al
                let gpsAdres: { semt: string; ilce: string; il: string } | null = null;

                try {
                    const adresler = await Location.reverseGeocodeAsync({
                        latitude: sonuc.lat,
                        longitude: sonuc.lng,
                    });

                    if (adresler && adresler.length > 0) {
                        const adres = adresler[0];
                        // Turkiye icin: district=ilce, city/region=il
                        // subregion bazen ilce, bazen bölge olabiliyor
                        const ilce = adres.district || adres.subregion || '';
                        const il = adres.city || adres.region || '';

                        gpsAdres = {
                            semt: '', // expo-location mahalle bilgisi vermiyor
                            ilce: ilce,
                            il: il,
                        };
                    }
                } catch (geoError) {
                    console.warn('Reverse geocoding basarisiz:', geoError);
                }

                dispatch(muhafizAyarlariniGuncelle({
                    konumModu: 'oto',
                    koordinatlar: sonuc,
                    gpsAdres: gpsAdres,
                    seciliSehirId: ''
                }));
            } else {
                Alert.alert('Konum Alinamadi', 'Sehri manuel olarak seciniz.');
            }
        } finally {
            setYukleniyor(false);
        }
    };

    // Il/Ilce secimi
    const handleKonumSecimi = async (il: Il, ilce?: Ilce) => {
        await butonTiklandiFeedback();
        const lat = ilce?.lat || il.lat;
        const lng = ilce?.lng || il.lng;

        NamazVaktiHesaplayiciServisi.getInstance().guncelleKonumManuel(il.plakaKodu);

        dispatch(muhafizAyarlariniGuncelle({
            konumModu: 'manuel',
            seciliSehirId: il.plakaKodu,
            seciliIlId: il.id,
            seciliIlceId: ilce?.id || null,
            seciliIlAdi: il.ad,
            seciliIlceAdi: ilce?.ad || '',
            koordinatlar: { lat, lng }
        }));
    };

    // Yogunluk secimi (sadece preset'ler icin)
    const handleYogunlukSec = async (yogunluk: 'hafif' | 'normal' | 'yogun') => {
        await butonTiklandiFeedback();
        const preset = HATIRLATMA_PRESETLERI[yogunluk];
        dispatch(muhafizAyarlariniGuncelle({
            yogunluk,
            esikler: preset.esikler,
            sikliklar: preset.sikliklar,
        }));
    };

    // Gelismis ayarlar icin
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
            {/* ===================== */}
            {/* ANA SWITCH - EN USTE */}
            {/* ===================== */}
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

            {/* Kapali ise basit mesaj goster */}
            {!muhafizAyarlari.aktif && (
                <View style={[styles.kapaliMesaj, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                    <Text style={styles.kapaliIkon}>😴</Text>
                    <Text style={[styles.kapaliMetin, { color: renkler.metinIkincil }]}>
                        Muhafız kapalı. Namaz vakitleri hatırlatılmayacak.
                    </Text>
                </View>
            )}

            {/* ===================== */}
            {/* AKTIF ISE AYARLAR */}
            {/* ===================== */}
            {muhafizAyarlari.aktif && (
                <>
                    {/* ===================== */}
                    {/* KONUM SECIMI - Radio Button Tarzinda */}
                    {/* ===================== */}
                    <View style={[styles.basitKart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                        <View style={styles.basitKartBaslik}>
                            <Text style={styles.basitKartIkon}>📍</Text>
                            <Text style={[styles.basitKartEtiket, { color: renkler.metinIkincil }]}>Konum Ayarı</Text>
                        </View>

                        {/* GPS Secenegi */}
                        <TouchableOpacity
                            style={[
                                styles.konumSecenegi,
                                {
                                    backgroundColor: muhafizAyarlari.konumModu === 'oto' ? `${renkler.birincil}15` : 'transparent',
                                    borderColor: muhafizAyarlari.konumModu === 'oto' ? renkler.birincil : renkler.sinir,
                                }
                            ]}
                            onPress={handleKonumOto}
                            disabled={yukleniyor}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.radioButon,
                                { borderColor: muhafizAyarlari.konumModu === 'oto' ? renkler.birincil : renkler.sinir }
                            ]}>
                                {muhafizAyarlari.konumModu === 'oto' && (
                                    <View style={[styles.radioButonIc, { backgroundColor: renkler.birincil }]} />
                                )}
                            </View>
                            <View style={styles.konumSecenegiMetin}>
                                <Text style={[styles.konumSecenegiBaslik, { color: renkler.metin }]}>
                                    📡 Otomatik (GPS)
                                </Text>
                                <Text style={[styles.konumSecenegiAlt, { color: renkler.metinIkincil }]}>
                                    {muhafizAyarlari.konumModu === 'oto'
                                        ? (muhafizAyarlari.gpsAdres
                                            ? (muhafizAyarlari.gpsAdres.ilce && muhafizAyarlari.gpsAdres.il
                                                ? `${muhafizAyarlari.gpsAdres.ilce}, ${muhafizAyarlari.gpsAdres.il}`
                                                : (muhafizAyarlari.gpsAdres.ilce || muhafizAyarlari.gpsAdres.il || 'Konum alindi'))
                                            : 'Konum takip ediliyor')
                                        : 'Konumunuzu GPS üzerinden alır'
                                    }
                                </Text>
                            </View>
                            {yukleniyor && <ActivityIndicator size="small" color={renkler.birincil} />}
                        </TouchableOpacity>

                        {/* Manuel Secenegi */}
                        <TouchableOpacity
                            style={[
                                styles.konumSecenegi,
                                {
                                    backgroundColor: muhafizAyarlari.konumModu === 'manuel' ? `${renkler.birincil}15` : 'transparent',
                                    borderColor: muhafizAyarlari.konumModu === 'manuel' ? renkler.birincil : renkler.sinir,
                                }
                            ]}
                            onPress={() => {
                                dispatch(muhafizAyarlariniGuncelle({ konumModu: 'manuel' }));
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.radioButon,
                                { borderColor: muhafizAyarlari.konumModu === 'manuel' ? renkler.birincil : renkler.sinir }
                            ]}>
                                {muhafizAyarlari.konumModu === 'manuel' && (
                                    <View style={[styles.radioButonIc, { backgroundColor: renkler.birincil }]} />
                                )}
                            </View>
                            <View style={styles.konumSecenegiMetin}>
                                <Text style={[styles.konumSecenegiBaslik, { color: renkler.metin }]}>
                                    🏙️ Manuel Seçim
                                </Text>
                                <Text style={[styles.konumSecenegiAlt, { color: renkler.metinIkincil }]}>
                                    {muhafizAyarlari.konumModu === 'manuel' && muhafizAyarlari.seciliIlAdi
                                        ? (muhafizAyarlari.seciliIlceAdi
                                            ? `${muhafizAyarlari.seciliIlceAdi}, ${muhafizAyarlari.seciliIlAdi}`
                                            : muhafizAyarlari.seciliIlAdi)
                                        : 'Şehir ve İlçe seçiniz'
                                    }
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Sehir Secici - Sadece Manuel Modda */}
                        {muhafizAyarlari.konumModu === 'manuel' && (
                            <View style={styles.sehirSeciciWrapper}>
                                <IlIlceSecici
                                    seciliIlId={muhafizAyarlari.seciliIlId}
                                    seciliIlceId={muhafizAyarlari.seciliIlceId}
                                    seciliIlAdi={muhafizAyarlari.seciliIlAdi}
                                    seciliIlceAdi={muhafizAyarlari.seciliIlceAdi}
                                    onKonumSec={handleKonumSecimi}
                                />
                            </View>
                        )}
                    </View>

                    {/* ===================== */}
                    {/* YOGUNLUK SECIMI - 4 Secenek (Hafif/Normal/Yogun/Ozel) */}
                    {/* ===================== */}
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

                    {/* OZEL AYARLAR - Sadece "Ozel" seciliyken goster */}
                    {muhafizAyarlari.yogunluk === 'ozel' && (
                        <View style={[styles.ozelAyarlarContainer, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                            <Text style={[styles.ozelAyarlarBaslik, { color: renkler.metin }]}>
                                ⚙️ Özel Bildirim Ayarları
                            </Text>
                            <Text style={[styles.ozelAyarlarAciklama, { color: renkler.metinIkincil }]}>
                                Her seviyenin zamanını ve tekrar sıklığını ayarlayın. Hangi seviyedeki bildirimin ne zaman geleceğini ve ne sıklıkla tekrar edeceğini belirleyebilirsiniz.
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
    // =====================
    // ANA SWITCH STILLERI
    // =====================
    anaSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        marginBottom: 20,
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
    // =====================
    // BASIT KART STILLERI
    // =====================
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
    basitKartIcerik: {},
    // =====================
    // KONUM SECENEKLERI
    // =====================
    konumSecenegi: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 10,
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
    konumSecenegiMetin: {
        flex: 1,
    },
    konumSecenegiBaslik: {
        fontSize: 15,
        fontWeight: '600',
    },
    konumSecenegiAlt: {
        fontSize: 12,
        marginTop: 2,
    },
    sehirSeciciWrapper: {
        marginTop: 4,
    },
    // =====================
    // YOGUNLUK SECICI
    // =====================
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
    // =====================
    // OZEL BUTON
    // =====================
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
    // =====================
    // OZEL AYARLAR CONTAINER
    // =====================
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
    // =====================
    // ESKI STILLER (geriye uyumluluk)
    // =====================
    header: {
        marginBottom: 24,
        marginTop: 10,
    },
    headerBaslik: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    headerAltBaslik: {
        fontSize: 14,
        lineHeight: 20,
    },
    bolum: {
        marginBottom: 24,
    },
    bolumBaslik: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1,
    },
    kart: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    kartIcerik: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    kartIkon: {
        fontSize: 24,
        marginRight: 12,
    },
    kartMetin: {
        flex: 1,
    },
    kartBaslik: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    kartAltMetin: {
        fontSize: 12,
    },
    // Sehir Secici Stilleri
    sehirSeciciButon: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sehirSeciciIcerik: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sehirSeciciIkonContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    sehirSeciciIkon: {
        fontSize: 24,
    },
    sehirSeciciMetin: {
        flex: 1,
    },
    sehirSeciciEtiket: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sehirSeciciDeger: {
        fontSize: 17,
        fontWeight: '600',
    },
    sehirSeciciOk: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sehirSeciciOkMetin: {
        fontSize: 12,
    },
    // Modal Stilleri
    modalArkaplan: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: EKRAN_YUKSEKLIGI * 0.75,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    modalBaslik: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    modalBaslikTutucu: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ccc',
        position: 'absolute',
        top: 8,
        left: '50%',
        marginLeft: -20,
    },
    modalBaslikIcerik: {
        flex: 1,
    },
    modalBaslikMetin: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalAltBaslik: {
        fontSize: 13,
        marginTop: 2,
    },
    modalKapatButon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalKapatMetin: {
        fontSize: 16,
        fontWeight: '600',
    },
    // Geri Butonu
    geriButon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    geriButonMetin: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Breadcrumb
    breadcrumb: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 8,
    },
    breadcrumbMetin: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Yukleme Container
    yuklemeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 48,
    },
    yuklemeMetin: {
        fontSize: 14,
        marginTop: 12,
    },
    // Ok Ikonu (il listesinde)
    sehirOkIkon: {
        fontSize: 12,
    },
    // Arama Stilleri
    aramaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    aramaIkon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    aramaInput: {
        flex: 1,
        fontSize: 16,
        height: 48,
    },
    aramaTemizle: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sonucBilgi: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    sonucMetin: {
        fontSize: 12,
        fontWeight: '500',
    },
    // Sehir Liste Stilleri
    sehirListeContainer: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    sehirListeOge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
    },
    sehirListeIcerik: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sehirListeIkon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sehirListeIkonMetin: {
        fontSize: 16,
        color: '#FFF',
    },
    sehirListeMetin: {
        flex: 1,
    },
    sehirListeAd: {
        fontSize: 16,
    },
    sehirListeKoordinat: {
        fontSize: 12,
        marginTop: 2,
    },
    seciliBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    seciliBadgeMetin: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
    },
    bosListeContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    bosListeIkon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.5,
    },
    bosListeMetin: {
        fontSize: 15,
        textAlign: 'center',
    },
    ayarSatiri: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    konumBilgiKutusu: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    konumBilgiBaslik: {
        fontSize: 12,
        fontWeight: '500',
    },
    konumBilgiDeger: {
        fontSize: 14,
        fontWeight: '700',
    },
    aciklamaMetni: {
        fontSize: 13,
        marginBottom: 16,
        lineHeight: 18,
    },
    // Seviye Kart Stilleri
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
    // Sayisal Secici Stilleri
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
    // Onizleme Stilleri - Kompakt Versiyon
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
    // Kompakt Ozet - Her Zaman Gorunur
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
    // Detay Container - Genisletilmis
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
    // Timeline Stilleri
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
