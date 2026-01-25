/**
 * Konum Ayarlari Sayfasi
 * Kullanicinin konumunu GPS veya manuel secim ile belirlemesini saglar
 * 
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
 */

import * as React from 'react';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    FlatList,
    Dimensions,
    Animated,
    Pressable,
    Switch,
    Alert,
    Linking,
} from 'react-native';
import * as Location from 'expo-location';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { konumAyarlariniGuncelle, GpsAdres } from '../store/konumSlice';
import { NamazVaktiHesaplayiciServisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { TurkiyeKonumServisi, Il, Ilce, TURKIYE_ILLERI_OFFLINE } from '../../domain/services/TurkiyeKonumServisi';
import { KonumTakipServisi } from '../../domain/services/KonumTakipServisi';
import { useFeedback } from '../../core/feedback';

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');

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
                        <Text className="text-xs font-semibold text-white">Secili</Text>
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
        return 'Konum seciniz...';
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
                                            {adim === 'il' ? 'Il Secimi' : `${secilenIl?.ad} - Ilce Secimi`}
                                        </Text>
                                    </View>
                                    <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                                        {adim === 'il' ? '81 il arasindan secin' : 'Ilce secerek devam edin'}
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
                                    placeholder={adim === 'il' ? 'Il ara...' : 'Ilce ara...'}
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
                                        : `${filtreliIlceler.length} ilce listeleniyor`
                                    }
                                </Text>
                            </View>

                            {/* Liste */}
                            {ilcelerYukleniyor ? (
                                <View className="flex-1 items-center justify-center py-12">
                                    <ActivityIndicator size="large" color={renkler.birincil} />
                                    <Text className="text-sm mt-3" style={{ color: renkler.metinIkincil }}>
                                        Ilceler yukleniyor...
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
                                                "{aramaMetni}" icin sonuc bulunamadi
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
                                                    ? `"${aramaMetni}" icin sonuc bulunamadi`
                                                    : 'Bu il icin ilce verisi bulunamadi'
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
 * Konum Ayarlari Sayfasi
 */
export const KonumAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const konumAyarlari = useAppSelector((state) => state.konum);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [takipDurumuYukleniyor, setTakipDurumuYukleniyor] = useState(false);
    const [takipAktif, setTakipAktif] = useState(konumAyarlari.akilliTakipAktif);

    useEffect(() => {
        const takipDurumunuKontrolEt = async () => {
            const aktifMi = await KonumTakipServisi.getInstance().aktifMi();
            setTakipAktif(aktifMi);
            if (aktifMi !== konumAyarlari.akilliTakipAktif) {
                dispatch(konumAyarlariniGuncelle({ akilliTakipAktif: aktifMi }));
            }
        };
        takipDurumunuKontrolEt();
    }, []);

    useEffect(() => {
        const takibiDurdur = async () => {
            if (konumAyarlari.konumModu === 'manuel' && takipAktif) {
                await KonumTakipServisi.getInstance().durdur();
                setTakipAktif(false);
                dispatch(konumAyarlariniGuncelle({ akilliTakipAktif: false }));
            }
        };
        takibiDurdur();
    }, [konumAyarlari.konumModu]);

    const handleAkilliTakipDegistir = async (aktif: boolean) => {
        await butonTiklandiFeedback();
        setTakipDurumuYukleniyor(true);

        try {
            const servis = KonumTakipServisi.getInstance();

            if (aktif) {
                const arkaPlanIzniVar = await servis.arkaPlanIzniVarMi();
                if (!arkaPlanIzniVar) {
                    Alert.alert(
                        'Arka Plan Konum Izni',
                        'Akilli konum takibi icin "Her zaman" konum iznine ihtiyac var. Bu sayede hareket halindeyken konumunuz otomatik guncellenir.\n\nPil tuketimi minimumdur - sadece 5km+ degisikliklerde tetiklenir.',
                        [
                            { text: 'Iptal', style: 'cancel' },
                            {
                                text: 'Izin Ver',
                                onPress: async () => {
                                    const basarili = await servis.baslat();
                                    if (basarili) {
                                        setTakipAktif(true);
                                        dispatch(konumAyarlariniGuncelle({ akilliTakipAktif: true }));
                                    } else {
                                        Alert.alert(
                                            'Izin Gerekli',
                                            'Arka plan konum izni verilemedi. Ayarlar sayfasindan "Konum" bolumune gidip "Her zaman izin ver" secenegini etkinlestirin.',
                                            [
                                                { text: 'Vazgec', style: 'cancel' },
                                                { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
                                            ]
                                        );
                                    }
                                    setTakipDurumuYukleniyor(false);
                                },
                            },
                        ]
                    );
                    setTakipDurumuYukleniyor(false);
                    return;
                }

                const basarili = await servis.baslat();
                if (basarili) {
                    setTakipAktif(true);
                    dispatch(konumAyarlariniGuncelle({ akilliTakipAktif: true }));
                } else {
                    Alert.alert(
                        'Izin Gerekli',
                        'Arka plan konum izni verilemedi. Ayarlar sayfasindan "Konum" bolumune gidip "Her zaman izin ver" secenegini etkinlestirin.',
                        [
                            { text: 'Vazgec', style: 'cancel' },
                            { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
                        ]
                    );
                }
            } else {
                await servis.durdur();
                setTakipAktif(false);
                dispatch(konumAyarlariniGuncelle({ akilliTakipAktif: false }));
            }
        } catch (hata) {
            console.error('Konum takibi hatasi:', hata);
            Alert.alert('Hata', 'Konum takibi ayarlanirken bir hata olustu.');
        } finally {
            setTakipDurumuYukleniyor(false);
        }
    };

    const handleKonumOto = async () => {
        await butonTiklandiFeedback();
        setYukleniyor(true);

        try {
            const sonuc = await NamazVaktiHesaplayiciServisi.getInstance().guncelleKonumOto();

            if (sonuc) {
                let gpsAdres: GpsAdres | null = null;

                try {
                    const adresler = await Location.reverseGeocodeAsync({
                        latitude: sonuc.lat,
                        longitude: sonuc.lng,
                    });

                    if (adresler && adresler.length > 0) {
                        const adres = adresler[0];
                        const ilce = adres.district || adres.subregion || '';
                        const il = adres.city || adres.region || '';
                        gpsAdres = { semt: '', ilce, il };
                    }
                } catch (geoError) {
                    console.warn('Reverse geocoding basarisiz:', geoError);
                }

                dispatch(konumAyarlariniGuncelle({
                    konumModu: 'oto',
                    koordinatlar: sonuc,
                    gpsAdres,
                    seciliSehirId: '',
                    sonGpsGuncellemesi: new Date().toISOString(),
                }));
            }
        } finally {
            setYukleniyor(false);
        }
    };

    const handleKonumSecimi = async (il: Il, ilce?: Ilce) => {
        await butonTiklandiFeedback();
        const lat = ilce?.lat || il.lat;
        const lng = ilce?.lng || il.lng;

        NamazVaktiHesaplayiciServisi.getInstance().guncelleKonumManuel(il.plakaKodu);

        dispatch(konumAyarlariniGuncelle({
            konumModu: 'manuel',
            seciliSehirId: il.plakaKodu,
            seciliIlId: il.id,
            seciliIlceId: ilce?.id || null,
            seciliIlAdi: il.ad,
            seciliIlceAdi: ilce?.ad || '',
            koordinatlar: { lat, lng }
        }));
    };

    const konumMetniOlustur = (): string => {
        if (konumAyarlari.konumModu === 'oto') {
            if (konumAyarlari.gpsAdres) {
                const { ilce, il } = konumAyarlari.gpsAdres;
                if (ilce && il) return `${ilce}, ${il}`;
                return ilce || il || 'GPS konumu alindi';
            }
            return 'Konum takip ediliyor';
        }
        if (konumAyarlari.seciliIlceAdi && konumAyarlari.seciliIlAdi) {
            return `${konumAyarlari.seciliIlceAdi}, ${konumAyarlari.seciliIlAdi}`;
        }
        return konumAyarlari.seciliIlAdi || 'Konum secilmedi';
    };

    const sonGuncellemeMetniOlustur = (): string | null => {
        if (konumAyarlari.konumModu !== 'oto' || !konumAyarlari.sonGpsGuncellemesi) {
            return null;
        }

        const guncellemeTarihi = new Date(konumAyarlari.sonGpsGuncellemesi);
        const simdi = new Date();
        const farkMs = simdi.getTime() - guncellemeTarihi.getTime();
        const farkDakika = Math.floor(farkMs / (1000 * 60));
        const farkSaat = Math.floor(farkMs / (1000 * 60 * 60));
        const farkGun = Math.floor(farkMs / (1000 * 60 * 60 * 24));

        if (farkDakika < 1) return 'Az once guncellendi';
        if (farkDakika < 60) return `${farkDakika} dakika once guncellendi`;
        if (farkSaat < 24) return `${farkSaat} saat once guncellendi`;
        if (farkGun === 1) return 'Dun guncellendi';
        if (farkGun < 7) return `${farkGun} gun once guncellendi`;

        const aylar = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];
        return `${guncellemeTarihi.getDate()} ${aylar[guncellemeTarihi.getMonth()]} ${guncellemeTarihi.getFullYear()}`;
    };

    const sonGuncellemeMetni = sonGuncellemeMetniOlustur();

    return (
        <ScrollView className="flex-1 p-4" style={{ backgroundColor: renkler.arkaplan }}>
            {/* Baslik Karti */}
            <View
                className="items-center p-6 rounded-2xl border mb-4 mt-2"
                style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
            >
                <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: `${renkler.birincil}15` }}
                >
                    <FontAwesome5 name="map-marker-alt" size={28} color={renkler.birincil} solid />
                </View>
                <Text className="text-xl font-bold mb-2" style={{ color: renkler.metin }}>
                    Konum Ayarlari
                </Text>
                <Text className="text-sm text-center leading-5" style={{ color: renkler.metinIkincil }}>
                    Namaz vakitlerinin dogru hesaplanabilmesi icin konumunuzu belirleyin
                </Text>
            </View>

            {/* Mevcut Konum Gosterimi */}
            <View
                className="p-4 rounded-2xl border mb-4"
                style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${renkler.birincil}15` }}
                        >
                            <FontAwesome5
                                name={konumAyarlari.konumModu === 'oto' ? 'satellite-dish' : 'city'}
                                size={20}
                                color={renkler.birincil}
                                solid
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-medium mb-0.5" style={{ color: renkler.metinIkincil }}>
                                Mevcut Konum
                            </Text>
                            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                {konumMetniOlustur()}
                            </Text>
                        </View>
                    </View>
                    <View
                        className="px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: konumAyarlari.konumModu === 'oto' ? '#4CAF5020' : '#2196F320' }}
                    >
                        <Text
                            className="text-xs font-bold"
                            style={{ color: konumAyarlari.konumModu === 'oto' ? '#4CAF50' : '#2196F3' }}
                        >
                            {konumAyarlari.konumModu === 'oto' ? 'GPS' : 'Manuel'}
                        </Text>
                    </View>
                </View>
                {sonGuncellemeMetni && (
                    <View className="flex-row items-center mt-3 pt-3 border-t" style={{ borderTopColor: renkler.sinir }}>
                        <FontAwesome5 name="clock" size={12} color={renkler.metinIkincil} />
                        <Text className="text-sm ml-1.5" style={{ color: renkler.metinIkincil }}>
                            {sonGuncellemeMetni}
                        </Text>
                    </View>
                )}
            </View>

            {/* Konum Secim Secenekleri */}
            <View
                className="rounded-2xl border p-4 mb-4"
                style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
            >
                <View className="flex-row items-center mb-4">
                    <FontAwesome5 name="cog" size={16} color={renkler.metinIkincil} />
                    <Text className="text-xs font-semibold tracking-wider ml-2" style={{ color: renkler.metinIkincil }}>
                        KONUM BELIRLEME YONTEMI
                    </Text>
                </View>

                {/* GPS Secenegi */}
                <TouchableOpacity
                    className="flex-row items-center p-3.5 rounded-xl border-2 mb-2.5"
                    style={{
                        backgroundColor: konumAyarlari.konumModu === 'oto' ? `${renkler.birincil}15` : 'transparent',
                        borderColor: konumAyarlari.konumModu === 'oto' ? renkler.birincil : renkler.sinir,
                    }}
                    onPress={handleKonumOto}
                    disabled={yukleniyor}
                    activeOpacity={0.7}
                >
                    <View
                        className="w-5.5 h-5.5 rounded-full border-2 items-center justify-center mr-3"
                        style={{ borderColor: konumAyarlari.konumModu === 'oto' ? renkler.birincil : renkler.sinir }}
                    >
                        {konumAyarlari.konumModu === 'oto' && (
                            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: renkler.birincil }} />
                        )}
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center">
                            <FontAwesome5 name="satellite-dish" size={14} color={renkler.metin} />
                            <Text className="text-base font-semibold ml-2" style={{ color: renkler.metin }}>
                                Otomatik (GPS)
                            </Text>
                        </View>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            Cihazinizin GPS'ini kullanarak konumunuzu otomatik belirler
                        </Text>
                    </View>
                    {yukleniyor && <ActivityIndicator size="small" color={renkler.birincil} />}
                </TouchableOpacity>

                {/* Manuel Secenegi */}
                <TouchableOpacity
                    className="flex-row items-center p-3.5 rounded-xl border-2"
                    style={{
                        backgroundColor: konumAyarlari.konumModu === 'manuel' ? `${renkler.birincil}15` : 'transparent',
                        borderColor: konumAyarlari.konumModu === 'manuel' ? renkler.birincil : renkler.sinir,
                    }}
                    onPress={() => dispatch(konumAyarlariniGuncelle({ konumModu: 'manuel' }))}
                    activeOpacity={0.7}
                >
                    <View
                        className="w-5.5 h-5.5 rounded-full border-2 items-center justify-center mr-3"
                        style={{ borderColor: konumAyarlari.konumModu === 'manuel' ? renkler.birincil : renkler.sinir }}
                    >
                        {konumAyarlari.konumModu === 'manuel' && (
                            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: renkler.birincil }} />
                        )}
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center">
                            <FontAwesome5 name="city" size={14} color={renkler.metin} />
                            <Text className="text-base font-semibold ml-2" style={{ color: renkler.metin }}>
                                Manuel Secim
                            </Text>
                        </View>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            Il ve ilce secerek konumunuzu belirleyin
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Sehir Secici - Sadece Manuel Modda */}
                {konumAyarlari.konumModu === 'manuel' && (
                    <View className="mt-2">
                        <IlIlceSecici
                            seciliIlId={konumAyarlari.seciliIlId}
                            seciliIlceId={konumAyarlari.seciliIlceId}
                            seciliIlAdi={konumAyarlari.seciliIlAdi}
                            seciliIlceAdi={konumAyarlari.seciliIlceAdi}
                            onKonumSec={handleKonumSecimi}
                        />
                    </View>
                )}
            </View>

            {/* Akilli Konum Takibi - Sadece GPS modunda */}
            {konumAyarlari.konumModu === 'oto' && (
                <View
                    className="p-4 rounded-2xl border mb-4"
                    style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                >
                    <View className="flex-row items-center mb-3">
                        <FontAwesome5 name="compass" size={16} color={renkler.metinIkincil} />
                        <Text className="text-xs font-semibold tracking-wider ml-2" style={{ color: renkler.metinIkincil }}>
                            AKILLI KONUM TAKIBI
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-3">
                            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                Hareket Halinde Guncelle
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                5km+ konum degisikliginde otomatik gunceller. Pil dostu.
                            </Text>
                        </View>
                        {takipDurumuYukleniyor ? (
                            <ActivityIndicator size="small" color={renkler.birincil} />
                        ) : (
                            <Switch
                                value={takipAktif}
                                onValueChange={handleAkilliTakipDegistir}
                                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                                thumbColor={takipAktif ? renkler.birincil : '#f4f3f4'}
                            />
                        )}
                    </View>

                    {takipAktif && (
                        <View
                            className="flex-row items-center mt-3 p-2.5 rounded-lg border"
                            style={{ backgroundColor: '#4CAF5015', borderColor: '#4CAF50' }}
                        >
                            <FontAwesome5 name="check-circle" size={14} color="#4CAF50" solid />
                            <Text className="text-sm font-medium ml-2" style={{ color: '#4CAF50' }}>
                                Arka planda konum takibi aktif
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Koordinat Bilgisi */}
            <View
                className="p-4 rounded-2xl border"
                style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
            >
                <View className="flex-row items-center mb-3">
                    <FontAwesome5 name="globe" size={14} color={renkler.metinIkincil} />
                    <Text className="text-xs font-semibold tracking-wider ml-2" style={{ color: renkler.metinIkincil }}>
                        KOORDINATLAR
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <View className="flex-1 items-center">
                        <Text className="text-xs mb-1" style={{ color: renkler.metinIkincil }}>Enlem</Text>
                        <Text className="text-lg font-bold" style={{ color: renkler.metin }}>
                            {konumAyarlari.koordinatlar.lat.toFixed(4)}°K
                        </Text>
                    </View>
                    <View className="w-px h-10 mx-4" style={{ backgroundColor: renkler.sinir }} />
                    <View className="flex-1 items-center">
                        <Text className="text-xs mb-1" style={{ color: renkler.metinIkincil }}>Boylam</Text>
                        <Text className="text-lg font-bold" style={{ color: renkler.metin }}>
                            {konumAyarlari.koordinatlar.lng.toFixed(4)}°D
                        </Text>
                    </View>
                </View>
            </View>

            <View className="h-10" />
        </ScrollView>
    );
};
