/**
 * Konum Ayarları Sayfası — konumu GPS (otomatik) ya da il/ilçe (manuel) ile belirler.
 *
 * Sade tasarım Dalga 4:
 *   - Gövdedeki tanıtım kartı kalktı; sayfanın kahramanı DURUM KARTI: konum ne, ne zaman
 *     güncellendi, tek "Yenile" (otomatik modda; `useKonumYenile` — metinler tek yerde).
 *   - Takip hassasiyeti ve koordinatlar "Gelişmiş" katında (varsayılan kapalı).
 *   - Damga bayatlığı "konumunuz eski" DEĞİLDİR (nabız konum almadan tazeler; bayatlık
 *     arka plan görevinin koşmadığını gösterir) → kartta yalnız zaman yazılır, "konumunuzu
 *     yenileyin" uyarısı ÜRETİLMEZ.
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
    Linking,
    Platform,
} from 'react-native';
import { Anahtar } from '../components/common/Anahtar';
import * as Location from 'expo-location';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { konumAyarlariniGuncelle, GpsAdres } from '../store/konumSlice';
import type { TakipHassasiyeti } from '../store/konumSlice';
import { VARSAYILAN_TAKIP_HASSASIYETI } from '../../core/constants/UygulamaSabitleri';
import { NamazVaktiHesaplayiciServisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { Il, Ilce } from '../../domain/services/TurkiyeKonumServisi';
import { KonumTakipServisi } from '../../domain/services/KonumTakipServisi';
import { useFeedback } from '../../core/feedback';
import { Logger } from '../../core/utils/Logger';
import { KonumIzniDisclosureModali, IzinTipi } from '../components/KonumIzniDisclosureModali';
import { useDonanimGeriTusu } from '../hooks/useDonanimGeriTusu';
import { useKonumMetni } from '../hooks/useKonumMetni';
import { IlIlceSecici } from '../components/IlIlceSecici';
import { BildirimModali, BildirimTipi } from '../components/common/BildirimModali';
import { VurguSaglayici } from '../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../components/ayar/AyarCapasi';
import { useKonumYenile } from '../hooks/useKonumYenile';
import { BolumBasligi } from '../components/ortak/BolumBasligi';

/**
 * Bildirim modalı durumu — Alert.alert yerine tema-uyumlu BildirimModali ile gösterilir.
 * İsteğe bağlı birincil eylem (ör. "Ayarlara Git") ve etiket/ikon taşır.
 */
interface KonumBildirimi {
    gorunur: boolean;
    tip: BildirimTipi;
    baslik: string;
    mesaj: string;
    birincilEtiket?: string;
    birincilIkon?: string;
    onBirincil?: () => void;
    kapatEtiketi?: string;
}



/**
 * Konum Ayarlari Sayfasi
 */
export const KonumAyarlariSayfasi: React.FC = () => {
    return (
        <VurguSaglayici>
            <KonumAyarlariIcerik />
        </VurguSaglayici>
    );
};

/**
 * İçerik bileşeni `VurguSaglayici` altında yaşar — `useVurguKurulumu()`
 * yalnızca sağlayıcı içinde çağrılabilir (bkz. task-4 entegrasyon örneği).
 */
const KonumAyarlariIcerik: React.FC = () => {
    const renkler = useRenkler();
    const scrollRef = useVurguKurulumu();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const konumAyarlari = useAppSelector((state) => state.konum);
    const konumYenile = useKonumYenile();
    const [gelismisAcik, setGelismisAcik] = useState(false);
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

    // Alert.alert yerine tema-uyumlu bildirim modalı
    const [bildirim, setBildirim] = useState<KonumBildirimi>({
        gorunur: false,
        tip: 'hata',
        baslik: '',
        mesaj: '',
    });
    const bildirimKapat = useCallback(
        () => setBildirim((onceki) => ({ ...onceki, gorunur: false })),
        []
    );
    // Arka plan izni verilemediğinde: kullanıcıyı sistem ayarlarına yönlendiren onay modalı
    const izinGerekliBildiriminiGoster = useCallback(() => {
        setBildirim({
            gorunur: true,
            tip: 'bilgi',
            baslik: 'İzin Gerekli',
            mesaj: 'Arka plan konum izni verilemedi. Sistem ayarlarından "Konum" bölümüne gidip "Her zaman izin ver" seçeneğini etkinleştirebilirsiniz.',
            birincilEtiket: 'Ayarlara Git',
            birincilIkon: 'cog',
            onBirincil: () => {
                setBildirim((onceki) => ({ ...onceki, gorunur: false }));
                Linking.openSettings();
            },
            kapatEtiketi: 'Vazgeç',
        });
    }, []);

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
                                izinGerekliBildiriminiGoster();
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
                    izinGerekliBildiriminiGoster();
                }
            } else {
                await servis.durdur();
                setTakipAktif(false);
                dispatch(konumAyarlariniGuncelle({ akilliTakipAktif: false }));
            }
        } catch (hata) {
            Logger.error('KonumAyarlariSayfasi', 'Konum takibi hatasi', hata);
            setBildirim({
                gorunur: true,
                tip: 'hata',
                baslik: 'Bir hata oluştu',
                mesaj: 'Konum takibi ayarlanırken bir hata oluştu. Lütfen tekrar deneyin.',
            });
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
        <ScrollView ref={scrollRef} className="flex-1 p-4" style={{ backgroundColor: renkler.arkaplan }}>
            {/* DURUM KARTI — konum ne, ne zaman güncellendi, tek "Yenile" */}
            <View
                testID="konum-durum-karti"
                className="p-4 border mb-4 mt-2"
                style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir, borderRadius: 24 }}
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
                                Vakitler bu konuma göre
                            </Text>
                            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                {konumMetni}
                            </Text>
                        </View>
                    </View>
                    <View
                        className="px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: konumAyarlari.konumModu === 'oto' ? `${renkler.durum.basarili}20` : `${renkler.durum.bilgi}20` }}
                    >
                        <Text
                            className="text-xs font-bold"
                            style={{ color: konumAyarlari.konumModu === 'oto' ? renkler.durum.basarili : renkler.durum.bilgi }}
                        >
                            {konumAyarlari.konumModu === 'oto' ? 'Otomatik' : 'Elle'}
                        </Text>
                    </View>
                </View>
                {(sonGuncellemeMetni || konumYenile.yenilenebilir) && (
                    <View className="flex-row items-center mt-3 pt-3 border-t" style={{ borderTopColor: renkler.sinir }}>
                        <FontAwesome5 name="clock" size={12} color={renkler.metinIkincil} />
                        <Text className="text-sm ml-1.5 flex-1" style={{ color: renkler.metinIkincil }}>
                            {sonGuncellemeMetni ?? 'Henüz güncellenmedi'}
                        </Text>
                        {konumYenile.yenilenebilir && (
                            <TouchableOpacity
                                testID="konum-yenile"
                                onPress={konumYenile.yenile}
                                disabled={konumYenile.yenileniyor}
                                accessibilityRole="button"
                                accessibilityLabel="Konumu yenileyin"
                                accessibilityState={{ disabled: konumYenile.yenileniyor, busy: konumYenile.yenileniyor }}
                                className="flex-row items-center px-4 rounded-2xl"
                                style={{ minHeight: 44, backgroundColor: `${renkler.birincil}15` }}
                            >
                                {konumYenile.yenileniyor ? (
                                    <ActivityIndicator size="small" color={renkler.birincil} />
                                ) : (
                                    <FontAwesome5 name="sync-alt" size={13} color={renkler.birincil} />
                                )}
                                <Text className="text-sm font-semibold ml-2" style={{ color: renkler.birincil }}>
                                    Yenile
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Konum Secim Secenekleri */}
            <AyarCapasi id="konumModu">
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
                    accessibilityRole="button"
                    accessibilityLabel={konumAyarlari.konumModu === 'oto' ? 'Otomatik konum seçili' : 'Otomatik konum seç'}
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
                    accessibilityRole="button"
                    accessibilityLabel={konumAyarlari.konumModu === 'manuel' ? 'Manuel konum seçili' : 'Manuel konum seç'}
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
            </AyarCapasi>

            {/* Seyahatte Otomatik Güncelleme - Sadece GPS modunda */}
            {konumAyarlari.konumModu === 'oto' && (
                <AyarCapasi id="akilliTakip">
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
                                Yolculukta vakitleri güncelleyin
                            </Text>
                            <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                                Şehir değişince vakitler kendiliğinden yeni konuma göre hesaplanır
                            </Text>
                        </View>
                        {takipDurumuYukleniyor ? (
                            <ActivityIndicator size="small" color={renkler.birincil} />
                        ) : (
                            <Anahtar
                                value={takipAktif}
                                accessibilityLabel="Yolculukta vakitleri güncelleyin"
                                onValueChange={handleAkilliTakipDegistir}
                                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                                thumbColor={takipAktif ? renkler.birincil : '#f4f3f4'}
                            />
                        )}
                    </View>

                    {takipAktif && (
                        <>
                            {/* Konum değişince bildir — yalnız Android: arka plan takibi (ve
                                dolayısıyla otomatik algılama) iOS'ta yok. */}
                            {Platform.OS === 'android' && (
                                <View
                                    className="flex-row items-center justify-between mt-4 pt-4 border-t"
                                    style={{ borderTopColor: renkler.sinir }}
                                >
                                    <View className="flex-1 mr-3">
                                        <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                            Konum değişince bildir
                                        </Text>
                                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            İlçe ya da şehir değişince sessiz bir bildirimle haber verilir
                                        </Text>
                                    </View>
                                    <Anahtar
                                        value={konumAyarlari.konumDegisimBildirimi !== false}
                                        onValueChange={(acik) => { dispatch(konumAyarlariniGuncelle({ konumDegisimBildirimi: acik })); }}
                                        trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                                        thumbColor={konumAyarlari.konumDegisimBildirimi !== false ? renkler.birincil : '#f4f3f4'}
                                        accessibilityLabel="Konum değişince bildir"
                                    />
                                </View>
                            )}
                        </>
                    )}
                </View>
                </AyarCapasi>
            )}

            {/* GELİŞMİŞ — takip mesafesi ve koordinatlar (varsayılan kapalı) */}
            <TouchableOpacity
                testID="konum-gelismis"
                onPress={() => setGelismisAcik((a) => !a)}
                accessibilityRole="button"
                accessibilityLabel="Gelişmiş"
                accessibilityState={{ expanded: gelismisAcik }}
                className="flex-row items-center justify-between px-4 border"
                style={{ minHeight: 52, backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir, borderRadius: 24 }}
            >
                <Text className="text-base font-semibold" style={{ color: renkler.metin }}>Gelişmiş</Text>
                <FontAwesome5 name={gelismisAcik ? 'chevron-up' : 'chevron-down'} size={13} color={renkler.metinIkincil} />
            </TouchableOpacity>
            {gelismisAcik && (
                <View
                    className="p-4 border mt-2"
                    style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir, borderRadius: 24 }}
                >
                    {/* Takip mesafesi: yalnız otomatik modda ve yolculuk takibi açıkken anlamlı. */}
                    {konumAyarlari.konumModu === 'oto' && takipAktif && (
                            <View className="mb-4">
                                <BolumBasligi metin="Ne kadar uzaklaşınca" ikon="sliders-h" />

                                {/* Pil Dostu */}
                                <TouchableOpacity
                                    className="flex-row items-center p-3 rounded-xl border-2 mb-2"
                                    style={{
                                        backgroundColor: seciliHassasiyet === 'pil_dostu' ? `${renkler.durum.basarili}10` : 'transparent',
                                        borderColor: seciliHassasiyet === 'pil_dostu' ? renkler.durum.basarili : renkler.sinir,
                                    }}
                                    onPress={() => handleHassasiyetDegistir('pil_dostu')}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityLabel={seciliHassasiyet === 'pil_dostu' ? 'Pil Dostu hassasiyet seçili' : 'Pil Dostu hassasiyeti seçin'}
                                >
                                    <View
                                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                                        style={{ backgroundColor: seciliHassasiyet === 'pil_dostu' ? `${renkler.durum.basarili}20` : renkler.sinir }}
                                    >
                                        <FontAwesome5 name="battery-full" size={16} color={seciliHassasiyet === 'pil_dostu' ? renkler.durum.basarili : renkler.metinIkincil} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>Pil Dostu</Text>
                                        <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            10 km · şehirler arası yolculuk
                                        </Text>
                                    </View>
                                    {seciliHassasiyet === 'pil_dostu' && (
                                        <FontAwesome5 name="check-circle" size={16} color={renkler.durum.basarili} solid />
                                    )}
                                </TouchableOpacity>

                                {/* Dengeli */}
                                <TouchableOpacity
                                    className="flex-row items-center p-3 rounded-xl border-2 mb-2"
                                    style={{
                                        backgroundColor: seciliHassasiyet === 'dengeli' ? `${renkler.durum.bilgi}10` : 'transparent',
                                        borderColor: seciliHassasiyet === 'dengeli' ? renkler.durum.bilgi : renkler.sinir,
                                    }}
                                    onPress={() => handleHassasiyetDegistir('dengeli')}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityLabel={seciliHassasiyet === 'dengeli' ? 'Dengeli hassasiyet seçili' : 'Dengeli hassasiyeti seçin'}
                                >
                                    <View
                                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                                        style={{ backgroundColor: seciliHassasiyet === 'dengeli' ? `${renkler.durum.bilgi}20` : renkler.sinir }}
                                    >
                                        <FontAwesome5 name="balance-scale" size={16} color={seciliHassasiyet === 'dengeli' ? renkler.durum.bilgi : renkler.metinIkincil} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>Dengeli</Text>
                                        <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            5 km · çoğu kişi için uygun
                                        </Text>
                                    </View>
                                    {seciliHassasiyet === 'dengeli' && (
                                        <FontAwesome5 name="check-circle" size={16} color={renkler.durum.bilgi} solid />
                                    )}
                                </TouchableOpacity>

                                {/* Hassas */}
                                <TouchableOpacity
                                    className="flex-row items-center p-3 rounded-xl border-2"
                                    style={{
                                        backgroundColor: seciliHassasiyet === 'hassas' ? `${renkler.durum.uyari}10` : 'transparent',
                                        borderColor: seciliHassasiyet === 'hassas' ? renkler.durum.uyari : renkler.sinir,
                                    }}
                                    onPress={() => handleHassasiyetDegistir('hassas')}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityLabel={seciliHassasiyet === 'hassas' ? 'Hassas hassasiyet seçili' : 'Hassas hassasiyeti seçin'}
                                >
                                    <View
                                        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                                        style={{ backgroundColor: seciliHassasiyet === 'hassas' ? `${renkler.durum.uyari}20` : renkler.sinir }}
                                    >
                                        <FontAwesome5 name="crosshairs" size={16} color={seciliHassasiyet === 'hassas' ? renkler.durum.uyari : renkler.metinIkincil} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>Hassas</Text>
                                        <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            2 km · sık yer değiştirenler
                                        </Text>
                                    </View>
                                    {seciliHassasiyet === 'hassas' && (
                                        <FontAwesome5 name="check-circle" size={16} color={renkler.durum.uyari} solid />
                                    )}
                                </TouchableOpacity>
                            </View>

                    )}
                    <BolumBasligi metin="Koordinatlar" ikon="globe" />
                    <View>
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

                </View>
            )}

            <View className="h-10" />
        </ScrollView>
        <KonumIzniDisclosureModali
            gorunur={disclosureGorunur}
            tip={disclosureTipi}
            onKabul={disclosureKabulEt}
            onReddet={disclosureReddet}
        />
        {/* Bilgi/hata bildirimi — Alert.alert yerine tema-uyumlu modal */}
        <BildirimModali
            gorunur={bildirim.gorunur}
            tip={bildirim.tip}
            baslik={bildirim.baslik}
            mesaj={bildirim.mesaj}
            birincilEtiket={bildirim.birincilEtiket}
            birincilIkon={bildirim.birincilIkon}
            onBirincil={bildirim.onBirincil}
            kapatEtiketi={bildirim.kapatEtiketi}
            onKapat={bildirimKapat}
        />
        </>
    );
};
