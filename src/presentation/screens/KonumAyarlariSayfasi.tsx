/**
 * Konum Ayarlari Sayfasi
 * Kullanicinin konumunu GPS veya manuel secim ile belirlemesini saglar
 * SOLID: Single Responsibility - Sadece konum ayarlari
 */

import * as React from 'react';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
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
 * Konum Ayarlari Sayfasi
 * GPS veya manuel sehir secimi ile konum belirleme
 */
export const KonumAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const konumAyarlari = useAppSelector((state) => state.konum);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [takipDurumuYukleniyor, setTakipDurumuYukleniyor] = useState(false);
    const [takipAktif, setTakipAktif] = useState(konumAyarlari.akilliTakipAktif);

    // Baslangicta takip durumunu kontrol et
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

    // Manuel moda gecildiginde takibi durdur
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

    /**
     * Akilli konum takibini ac/kapat
     */
    const handleAkilliTakipDegistir = async (aktif: boolean) => {
        await butonTiklandiFeedback();
        setTakipDurumuYukleniyor(true);

        try {
            const servis = KonumTakipServisi.getInstance();

            if (aktif) {
                // Arka plan izni kontrolu
                const arkaPlanIzniVar = await servis.arkaPlanIzniVarMi();
                if (!arkaPlanIzniVar) {
                    Alert.alert(
                        'Arka Plan Konum İzni',
                        'Akıllı konum takibi için "Her zaman" konum iznine ihtiyaç var. Bu sayede hareket halindeyken konumunuz otomatik güncellenir.\n\nPil tüketimi minimumdur - sadece 5km+ değişikliklerde tetiklenir.',
                        [
                            { text: 'İptal', style: 'cancel' },
                            {
                                text: 'İzin Ver',
                                onPress: async () => {
                                    const basarili = await servis.baslat();
                                    if (basarili) {
                                        setTakipAktif(true);
                                        dispatch(konumAyarlariniGuncelle({ akilliTakipAktif: true }));
                                    } else {
                                        // Izin reddedildi - ayarlar sayfasina yonlendir
                                        Alert.alert(
                                            'İzin Gerekli',
                                            'Arka plan konum izni verilemedi. Ayarlar sayfasından "Konum" bölümüne gidip "Her zaman izin ver" seçeneğini etkinleştirin.',
                                            [
                                                { text: 'Vazgeç', style: 'cancel' },
                                                {
                                                    text: 'Ayarlara Git',
                                                    onPress: () => Linking.openSettings(),
                                                },
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
                    // Izin reddedildi - ayarlar sayfasina yonlendir
                    Alert.alert(
                        'İzin Gerekli',
                        'Arka plan konum izni verilemedi. Ayarlar sayfasından "Konum" bölümüne gidip "Her zaman izin ver" seçeneğini etkinleştirin.',
                        [
                            { text: 'Vazgeç', style: 'cancel' },
                            {
                                text: 'Ayarlara Git',
                                onPress: () => Linking.openSettings(),
                            },
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
            Alert.alert('Hata', 'Konum takibi ayarlanırken bir hata oluştu.');
        } finally {
            setTakipDurumuYukleniyor(false);
        }
    };

    /**
     * GPS ile otomatik konum al
     */
    const handleKonumOto = async () => {
        await butonTiklandiFeedback();
        setYukleniyor(true);

        try {
            const sonuc = await NamazVaktiHesaplayiciServisi.getInstance().guncelleKonumOto();

            if (sonuc) {
                // Reverse geocoding ile adres bilgisi al
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

                        gpsAdres = {
                            semt: '',
                            ilce: ilce,
                            il: il,
                        };
                    }
                } catch (geoError) {
                    console.warn('Reverse geocoding basarisiz:', geoError);
                }

                dispatch(konumAyarlariniGuncelle({
                    konumModu: 'oto',
                    koordinatlar: sonuc,
                    gpsAdres: gpsAdres,
                    seciliSehirId: '',
                    sonGpsGuncellemesi: new Date().toISOString(),
                }));
            } else {
                // Hata durumu - kullaniciya bildir
                console.warn('Konum alinamadi');
            }
        } finally {
            setYukleniyor(false);
        }
    };

    /**
     * Il/Ilce manuel secimi
     */
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

    /**
     * Mevcut konum metnini olustur
     */
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

    /**
     * Son GPS guncelleme zamanini formatla
     */
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

        if (farkDakika < 1) {
            return 'Az önce güncellendi';
        } else if (farkDakika < 60) {
            return `${farkDakika} dakika önce güncellendi`;
        } else if (farkSaat < 24) {
            return `${farkSaat} saat önce güncellendi`;
        } else if (farkGun === 1) {
            return 'Dün güncellendi';
        } else if (farkGun < 7) {
            return `${farkGun} gün önce güncellendi`;
        } else {
            // Tarih formatla: "15 Ocak 2026"
            const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            return `${guncellemeTarihi.getDate()} ${aylar[guncellemeTarihi.getMonth()]} ${guncellemeTarihi.getFullYear()}`;
        }
    };

    const sonGuncellemeMetni = sonGuncellemeMetniOlustur();

    return (
        <ScrollView style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
            {/* Baslik Karti */}
            <View style={[styles.baslikKart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                <Text style={styles.baslikIkon}>📍</Text>
                <Text style={[styles.baslikMetin, { color: renkler.metin }]}>
                    Konum Ayarları
                </Text>
                <Text style={[styles.baslikAciklama, { color: renkler.metinIkincil }]}>
                    Namaz vakitlerinin doğru hesaplanabilmesi için konumunuzu belirleyin
                </Text>
            </View>

            {/* Mevcut Konum Gosterimi */}
            <View style={[styles.mevcutKonumKart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                <View style={styles.mevcutKonumUst}>
                    <View style={styles.mevcutKonumBaslik}>
                        <Text style={styles.mevcutKonumIkon}>
                            {konumAyarlari.konumModu === 'oto' ? '📡' : '🏙️'}
                        </Text>
                        <View style={styles.mevcutKonumMetin}>
                            <Text style={[styles.mevcutKonumEtiket, { color: renkler.metinIkincil }]}>
                                Mevcut Konum
                            </Text>
                            <Text style={[styles.mevcutKonumDeger, { color: renkler.metin }]}>
                                {konumMetniOlustur()}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.mevcutKonumBadge, {
                        backgroundColor: konumAyarlari.konumModu === 'oto' ? '#4CAF5020' : '#2196F320'
                    }]}>
                        <Text style={[styles.mevcutKonumBadgeMetin, {
                            color: konumAyarlari.konumModu === 'oto' ? '#4CAF50' : '#2196F3'
                        }]}>
                            {konumAyarlari.konumModu === 'oto' ? 'GPS' : 'Manuel'}
                        </Text>
                    </View>
                </View>
                {/* Son Guncelleme Bilgisi - Sadece GPS modunda */}
                {sonGuncellemeMetni && (
                    <View style={[styles.sonGuncellemeContainer, { borderTopColor: renkler.sinir }]}>
                        <Text style={styles.sonGuncellemeIkon}>🕐</Text>
                        <Text style={[styles.sonGuncellemeMetin, { color: renkler.metinIkincil }]}>
                            {sonGuncellemeMetni}
                        </Text>
                    </View>
                )}
            </View>

            {/* Konum Secim Secenekleri */}
            <View style={[styles.seceneklerKart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                <View style={styles.seceneklerBaslik}>
                    <Text style={styles.seceneklerIkon}>⚙️</Text>
                    <Text style={[styles.seceneklerEtiket, { color: renkler.metinIkincil }]}>
                        Konum Belirleme Yöntemi
                    </Text>
                </View>

                {/* GPS Secenegi */}
                <TouchableOpacity
                    style={[
                        styles.konumSecenegi,
                        {
                            backgroundColor: konumAyarlari.konumModu === 'oto' ? `${renkler.birincil}15` : 'transparent',
                            borderColor: konumAyarlari.konumModu === 'oto' ? renkler.birincil : renkler.sinir,
                        }
                    ]}
                    onPress={handleKonumOto}
                    disabled={yukleniyor}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.radioButon,
                        { borderColor: konumAyarlari.konumModu === 'oto' ? renkler.birincil : renkler.sinir }
                    ]}>
                        {konumAyarlari.konumModu === 'oto' && (
                            <View style={[styles.radioButonIc, { backgroundColor: renkler.birincil }]} />
                        )}
                    </View>
                    <View style={styles.konumSecenegiMetin}>
                        <Text style={[styles.konumSecenegiBaslik, { color: renkler.metin }]}>
                            📡 Otomatik (GPS)
                        </Text>
                        <Text style={[styles.konumSecenegiAlt, { color: renkler.metinIkincil }]}>
                            Cihazınızın GPS'ini kullanarak konumunuzu otomatik belirler
                        </Text>
                    </View>
                    {yukleniyor && <ActivityIndicator size="small" color={renkler.birincil} />}
                </TouchableOpacity>

                {/* Manuel Secenegi */}
                <TouchableOpacity
                    style={[
                        styles.konumSecenegi,
                        {
                            backgroundColor: konumAyarlari.konumModu === 'manuel' ? `${renkler.birincil}15` : 'transparent',
                            borderColor: konumAyarlari.konumModu === 'manuel' ? renkler.birincil : renkler.sinir,
                        }
                    ]}
                    onPress={() => {
                        dispatch(konumAyarlariniGuncelle({ konumModu: 'manuel' }));
                    }}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.radioButon,
                        { borderColor: konumAyarlari.konumModu === 'manuel' ? renkler.birincil : renkler.sinir }
                    ]}>
                        {konumAyarlari.konumModu === 'manuel' && (
                            <View style={[styles.radioButonIc, { backgroundColor: renkler.birincil }]} />
                        )}
                    </View>
                    <View style={styles.konumSecenegiMetin}>
                        <Text style={[styles.konumSecenegiBaslik, { color: renkler.metin }]}>
                            🏙️ Manuel Seçim
                        </Text>
                        <Text style={[styles.konumSecenegiAlt, { color: renkler.metinIkincil }]}>
                            İl ve ilçe seçerek konumunuzu belirleyin
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Sehir Secici - Sadece Manuel Modda */}
                {konumAyarlari.konumModu === 'manuel' && (
                    <View style={styles.sehirSeciciWrapper}>
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
                <View style={[styles.akilliTakipKart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                    <View style={styles.akilliTakipBaslik}>
                        <Text style={styles.akilliTakipIkon}>🧭</Text>
                        <Text style={[styles.akilliTakipEtiket, { color: renkler.metinIkincil }]}>
                            Akıllı Konum Takibi
                        </Text>
                    </View>

                    <View style={styles.akilliTakipIcerik}>
                        <View style={styles.akilliTakipMetin}>
                            <Text style={[styles.akilliTakipBaslikMetin, { color: renkler.metin }]}>
                                Hareket Halinde Güncelle
                            </Text>
                            <Text style={[styles.akilliTakipAciklama, { color: renkler.metinIkincil }]}>
                                5km+ konum değişikliğinde otomatik günceller. Pil dostu.
                            </Text>
                        </View>
                        {takipDurumuYukleniyor ? (
                            <ActivityIndicator size="small" color={renkler.birincil} />
                        ) : (
                            <Switch
                                value={takipAktif}
                                onValueChange={handleAkilliTakipDegistir}
                                trackColor={{ false: renkler.sinir, true: renkler.birincilAcik }}
                                thumbColor={takipAktif ? renkler.birincil : '#f4f3f4'}
                            />
                        )}
                    </View>

                    {takipAktif && (
                        <View style={[styles.takipAktifBadge, { backgroundColor: '#4CAF5015', borderColor: '#4CAF50' }]}>
                            <Text style={styles.takipAktifIkon}>✓</Text>
                            <Text style={[styles.takipAktifMetin, { color: '#4CAF50' }]}>
                                Arka planda konum takibi aktif
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Koordinat Bilgisi */}
            <View style={[styles.koordinatKart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
                <Text style={[styles.koordinatBaslik, { color: renkler.metinIkincil }]}>
                    🌍 Koordinatlar
                </Text>
                <View style={styles.koordinatDegerler}>
                    <View style={styles.koordinatItem}>
                        <Text style={[styles.koordinatEtiket, { color: renkler.metinIkincil }]}>Enlem</Text>
                        <Text style={[styles.koordinatDeger, { color: renkler.metin }]}>
                            {konumAyarlari.koordinatlar.lat.toFixed(4)}°K
                        </Text>
                    </View>
                    <View style={[styles.koordinatAyrac, { backgroundColor: renkler.sinir }]} />
                    <View style={styles.koordinatItem}>
                        <Text style={[styles.koordinatEtiket, { color: renkler.metinIkincil }]}>Boylam</Text>
                        <Text style={[styles.koordinatDeger, { color: renkler.metin }]}>
                            {konumAyarlari.koordinatlar.lng.toFixed(4)}°D
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    // Baslik Karti
    baslikKart: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
        marginTop: 8,
    },
    baslikIkon: {
        fontSize: 48,
        marginBottom: 12,
    },
    baslikMetin: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    baslikAciklama: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    // Mevcut Konum Karti
    mevcutKonumKart: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    mevcutKonumUst: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mevcutKonumBaslik: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    mevcutKonumIkon: {
        fontSize: 28,
        marginRight: 12,
    },
    mevcutKonumMetin: {
        flex: 1,
    },
    mevcutKonumEtiket: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    mevcutKonumDeger: {
        fontSize: 16,
        fontWeight: '600',
    },
    mevcutKonumBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    mevcutKonumBadgeMetin: {
        fontSize: 12,
        fontWeight: '700',
    },
    sonGuncellemeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    sonGuncellemeIkon: {
        fontSize: 14,
        marginRight: 6,
    },
    sonGuncellemeMetin: {
        fontSize: 13,
    },
    // Secenekler Karti
    seceneklerKart: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    seceneklerBaslik: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    seceneklerIkon: {
        fontSize: 20,
        marginRight: 8,
    },
    seceneklerEtiket: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Konum Secenekleri
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
        marginTop: 8,
    },
    // Akilli Takip Karti
    akilliTakipKart: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    akilliTakipBaslik: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    akilliTakipIkon: {
        fontSize: 20,
        marginRight: 8,
    },
    akilliTakipEtiket: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    akilliTakipIcerik: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    akilliTakipMetin: {
        flex: 1,
        marginRight: 12,
    },
    akilliTakipBaslikMetin: {
        fontSize: 15,
        fontWeight: '600',
    },
    akilliTakipAciklama: {
        fontSize: 12,
        marginTop: 2,
    },
    takipAktifBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    takipAktifIkon: {
        fontSize: 14,
        marginRight: 8,
        color: '#4CAF50',
    },
    takipAktifMetin: {
        fontSize: 13,
        fontWeight: '500',
    },
    // Koordinat Karti
    koordinatKart: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    koordinatBaslik: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    koordinatDegerler: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    koordinatItem: {
        flex: 1,
        alignItems: 'center',
    },
    koordinatEtiket: {
        fontSize: 12,
        marginBottom: 4,
    },
    koordinatDeger: {
        fontSize: 18,
        fontWeight: '700',
    },
    koordinatAyrac: {
        width: 1,
        height: 40,
        marginHorizontal: 16,
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
    sehirOkIkon: {
        fontSize: 12,
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
});
