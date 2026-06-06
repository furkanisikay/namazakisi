/**
 * Konum Ayarları Sayfası
 * Kullanıcının konumunu GPS veya manuel seçim ile belirlemesini sağlar
 * 
 * NativeWind + Expo Vector Icons ile güncellenmiş versiyon
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
    Switch,
    Alert,
    Linking,
} from 'react-native';
import * as Location from 'expo-location';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { konumAyarlariniGuncelle, GpsAdres } from '../store/konumSlice';
import type { TakipHassasiyeti } from '../store/konumSlice';
import { TAKIP_PROFILLERI, VARSAYILAN_TAKIP_HASSASIYETI } from '../../core/constants/UygulamaSabitleri';
import { NamazVaktiHesaplayiciServisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { Il, Ilce } from '../../domain/services/TurkiyeKonumServisi';
import { KonumTakipServisi } from '../../domain/services/KonumTakipServisi';
import { useFeedback } from '../../core/feedback';
import { Logger } from '../../core/utils/Logger';
import { KonumIzniDisclosureModali, IzinTipi } from '../components/KonumIzniDisclosureModali';
import { useDonanimGeriTusu } from '../hooks/useDonanimGeriTusu';
import { useKonumMetni } from '../hooks/useKonumMetni';
import { IlIlceSecici } from '../components/IlIlceSecici';



/**
 * Konum Ayarlari Sayfasi
 */
export const KonumAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const konumAyarlari = useAppSelector((state) => state.konum);
    const konumMetni = useKonumMetni(konumAyarlari);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [takipDurumuYukleniyor, setTakipDurumuYukleniyor] = useState(false);
    const [takipAktif, setTakipAktif] = useState(konumAyarlari.akilliTakipAktif);
    const [seciliHassasiyet, setSeciliHassasiyet] = useState<TakipHassasiyeti>(
        konumAyarlari.takipHassasiyeti || VARSAYILAN_TAKIP_HASSASIYETI
    );
    const [disclosureGorunur, setDisclosureGorunur] = useState(false);
    const [disclosureTipi, setDisclosureTipi] = useState<IzinTipi>('onPlan');
    const disclosureKabulRef = useRef<(() => void) | null>(null);

    const disclosureGoster = useCallback((tip: IzinTipi, onKabul: () => void) => {
        setDisclosureTipi(tip);
        disclosureKabulRef.current = onKabul;
        setDisclosureGorunur(true);
    }, []);

    const disclosureKabulEt = useCallback(() => {
        setDisclosureGorunur(false);
        const devam = disclosureKabulRef.current;
        disclosureKabulRef.current = null;
        if (devam) devam();
    }, []);

    const disclosureReddet = useCallback(() => {
        setDisclosureGorunur(false);
        disclosureKabulRef.current = null;
    }, []);

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

    const handleHassasiyetDegistir = async (yeniHassasiyet: TakipHassasiyeti) => {
        await butonTiklandiFeedback();
        setSeciliHassasiyet(yeniHassasiyet);
        dispatch(konumAyarlariniGuncelle({ takipHassasiyeti: yeniHassasiyet }));

        // Takip aktifse profili hemen uygula (durdur + yeniden baslat)
        if (takipAktif) {
            try {
                const servis = KonumTakipServisi.getInstance();
                await servis.durdur();
                await servis.baslat();
            } catch (e) {
                Logger.error('KonumAyarlariSayfasi', 'Hassasiyet degistirme hatasi', e);
            }
        }
    };

    const handleAkilliTakipDegistir = async (aktif: boolean) => {
        await butonTiklandiFeedback();
        setTakipDurumuYukleniyor(true);

        try {
            const servis = KonumTakipServisi.getInstance();

            if (aktif) {
                const arkaPlanIzniVar = await servis.arkaPlanIzniVarMi();
                if (!arkaPlanIzniVar) {
                    setTakipDurumuYukleniyor(false);
                    disclosureGoster('arkaPlan', async () => {
                        setTakipDurumuYukleniyor(true);
                        try {
                            const basarili = await servis.baslat();
                            if (basarili) {
                                setTakipAktif(true);
                                dispatch(konumAyarlariniGuncelle({ akilliTakipAktif: true }));
                            } else {
                                Alert.alert(
                                    'İzin Gerekli',
                                    'Arka plan konum izni verilemedi. Sistem ayarlarından "Konum" bölümüne gidip "Her zaman izin ver" seçeneğini etkinleştirebilirsiniz.',
                                    [
                                        { text: 'Vazgeç', style: 'cancel' },
                                        { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
                                    ]
                                );
                            }
                        } finally {
                            setTakipDurumuYukleniyor(false);
                        }
                    });
                    return;
                }

                const basarili = await servis.baslat();
                if (basarili) {
                    setTakipAktif(true);
                    dispatch(konumAyarlariniGuncelle({ akilliTakipAktif: true }));
                } else {
                    Alert.alert(
                        'İzin Gerekli',
                        'Arka plan konum izni verilemedi. Sistem ayarlarından "Konum" bölümüne gidip "Her zaman izin ver" seçeneğini etkinleştirebilirsiniz.',
                        [
                            { text: 'Vazgeç', style: 'cancel' },
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
            Logger.error('KonumAyarlariSayfasi', 'Konum takibi hatasi', hata);
            Alert.alert('Hata', 'Konum takibi ayarlanırken bir hata oluştu.');
        } finally {
            setTakipDurumuYukleniyor(false);
        }
    };

    const guncelleKonumOtoInternal = async () => {
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
                    Logger.warn('KonumAyarlariSayfasi', 'Reverse geocoding basarisiz', geoError);
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

    const handleKonumOto = async () => {
        await butonTiklandiFeedback();

        // Prominent Disclosure: sistem izin diyaloğu açılmadan önce konum
        // verisinin neden istendiği, nasıl kullanıldığı ve paylaşılmadığı
        // açıkça bildirilir (Google Play User Data policy gereği).
        const mevcutIzin = await Location.getForegroundPermissionsAsync();
        if (mevcutIzin.status !== 'granted') {
            disclosureGoster('onPlan', () => {
                guncelleKonumOtoInternal();
            });
            return;
        }

        await guncelleKonumOtoInternal();
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

        if (farkDakika < 1) return 'Az önce güncellendi';
        if (farkDakika < 60) return `${farkDakika} dakika önce güncellendi`;
        if (farkSaat < 24) return `${farkSaat} saat önce güncellendi`;
        if (farkGun === 1) return 'Dün güncellendi';
        if (farkGun < 7) return `${farkGun} gün önce güncellendi`;

        const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${guncellemeTarihi.getDate()} ${aylar[guncellemeTarihi.getMonth()]} ${guncellemeTarihi.getFullYear()}`;
    };

    const sonGuncellemeMetni = sonGuncellemeMetniOlustur();

    return (
        <>
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
                    Konum Ayarları
                </Text>
                <Text className="text-sm text-center leading-5" style={{ color: renkler.metinIkincil }}>
                    Namaz vakitlerinin doğru hesaplanabilmesi için konumunuzu belirleyin
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
                                {konumMetni}
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
                        KONUM BELİRLEME YÖNTEMİ
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
                            Cihazınızın GPS'ini kullanarak konumunuzu otomatik belirler
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
                                Manuel Seçim
                            </Text>
                        </View>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            İl ve ilçe seçerek konumunuzu belirleyin
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

            {/* Seyahatte Otomatik Güncelleme - Sadece GPS modunda */}
            {konumAyarlari.konumModu === 'oto' && (
                <View
                    className="p-4 rounded-2xl border mb-4"
                    style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                >
                    <View className="flex-row items-center mb-3">
                        <FontAwesome5 name="route" size={16} color={renkler.metinIkincil} />
                        <Text className="text-xs font-semibold tracking-wider ml-2" style={{ color: renkler.metinIkincil }}>
                            SEYAHATTE OTOMATİK GÜNCELLEME
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-3">
                            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                Şehir Değiştikçe Vakitleri Güncelle
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                {`${(TAKIP_PROFILLERI[seciliHassasiyet].mesafe / 1000).toFixed(0)} km'den uzun bir mesafe katettiğinizde namaz vakitleri yeni konumunuza göre güncellenir`}
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
                        <>
                            <View
                                className="flex-row items-center mt-3 p-2.5 rounded-lg border"
                                style={{ backgroundColor: '#4CAF5015', borderColor: '#4CAF50' }}
                            >
                                <FontAwesome5 name="check-circle" size={14} color="#4CAF50" solid />
                                <Text className="text-sm font-medium ml-2" style={{ color: '#4CAF50' }}>
                                    Seyahatte otomatik güncelleme etkin
                                </Text>
                            </View>

                            {/* Takip Hassasiyeti Secici */}
                            <View className="mt-4 pt-4 border-t" style={{ borderTopColor: renkler.sinir }}>
                                <View className="flex-row items-center mb-3">
                                    <FontAwesome5 name="sliders-h" size={14} color={renkler.metinIkincil} />
                                    <Text className="text-xs font-semibold tracking-wider ml-2" style={{ color: renkler.metinIkincil }}>
                                        TAKİP HASSASİYETİ
                                    </Text>
                                </View>

                                {/* Pil Dostu */}
                                <TouchableOpacity
                                    className="flex-row items-center p-3 rounded-xl border-2 mb-2"
                                    style={{
                                        backgroundColor: seciliHassasiyet === 'pil_dostu' ? '#4CAF5010' : 'transparent',
                                        borderColor: seciliHassasiyet === 'pil_dostu' ? '#4CAF50' : renkler.sinir,
                                    }}
                                    onPress={() => handleHassasiyetDegistir('pil_dostu')}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                                        style={{ backgroundColor: seciliHassasiyet === 'pil_dostu' ? '#4CAF5020' : renkler.sinir }}
                                    >
                                        <FontAwesome5 name="battery-full" size={16} color={seciliHassasiyet === 'pil_dostu' ? '#4CAF50' : renkler.metinIkincil} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>Pil Dostu</Text>
                                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            10km / 30dk - Şehirler arası yolculuk için
                                        </Text>
                                    </View>
                                    {seciliHassasiyet === 'pil_dostu' && (
                                        <FontAwesome5 name="check-circle" size={16} color="#4CAF50" solid />
                                    )}
                                </TouchableOpacity>

                                {/* Dengeli */}
                                <TouchableOpacity
                                    className="flex-row items-center p-3 rounded-xl border-2 mb-2"
                                    style={{
                                        backgroundColor: seciliHassasiyet === 'dengeli' ? '#2196F310' : 'transparent',
                                        borderColor: seciliHassasiyet === 'dengeli' ? '#2196F3' : renkler.sinir,
                                    }}
                                    onPress={() => handleHassasiyetDegistir('dengeli')}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                                        style={{ backgroundColor: seciliHassasiyet === 'dengeli' ? '#2196F320' : renkler.sinir }}
                                    >
                                        <FontAwesome5 name="balance-scale" size={16} color={seciliHassasiyet === 'dengeli' ? '#2196F3' : renkler.metinIkincil} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>Dengeli</Text>
                                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            5km / 15dk - Çoğu kullanıcı için ideal
                                        </Text>
                                    </View>
                                    {seciliHassasiyet === 'dengeli' && (
                                        <FontAwesome5 name="check-circle" size={16} color="#2196F3" solid />
                                    )}
                                </TouchableOpacity>

                                {/* Hassas */}
                                <TouchableOpacity
                                    className="flex-row items-center p-3 rounded-xl border-2"
                                    style={{
                                        backgroundColor: seciliHassasiyet === 'hassas' ? '#FF980010' : 'transparent',
                                        borderColor: seciliHassasiyet === 'hassas' ? '#FF9800' : renkler.sinir,
                                    }}
                                    onPress={() => handleHassasiyetDegistir('hassas')}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                                        style={{ backgroundColor: seciliHassasiyet === 'hassas' ? '#FF980020' : renkler.sinir }}
                                    >
                                        <FontAwesome5 name="crosshairs" size={16} color={seciliHassasiyet === 'hassas' ? '#FF9800' : renkler.metinIkincil} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>Hassas</Text>
                                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            2km / 5dk - Sık hareket edenler için
                                        </Text>
                                    </View>
                                    {seciliHassasiyet === 'hassas' && (
                                        <FontAwesome5 name="check-circle" size={16} color="#FF9800" solid />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
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
        <KonumIzniDisclosureModali
            gorunur={disclosureGorunur}
            tip={disclosureTipi}
            onKabul={disclosureKabulEt}
            onReddet={disclosureReddet}
        />
        </>
    );
};
