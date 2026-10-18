/**
 * Camideyim ayar sayfası (issue #297). Üç sekme:
 *  - Ayarlar: aç/kapa, kalma süresi, vakit kapısı, AÇILIŞ BİÇİMİ (akıllı/otomatik/
 *    sorarak — güven puanı), İZLEME KAPSAMI (yakındakiler/yalnız seçtiklerim),
 *    camideyken davranışı ve erişilebilir yakın cami listesi.
 *  - Harita (Faz 2, MapLibre + OpenFreeMap): alanlar, uyandırma çemberi, yer ekleme.
 *  - Nasıl algılanır: iki aşamalı tespit, güven örnekleri (JS ikiziyle canlı) ve
 *    "Son algılamalar" zaman çizelgesi (neden algılandı / neden algılanmadı).
 *
 * Karar native'de verilir; ekran yalnız ayarı yazar ve olay günlüğünü okur.
 * Başlık navigasyon header'ındadır (AGENTS.md: sayfa başlığı TEK yerde).
 */
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRenkler } from '../../core/theme';
import { SayisalSecici } from '../components/common/SayisalSecici';
import { BildirimModali } from '../components/common/BildirimModali';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { AyarKutusu } from '../components/ayar/AyarKutusu';
import { KonumIzniDisclosureModali } from '../components/KonumIzniDisclosureModali';
import { useCamideyim } from '../hooks/useCamideyim';
import { useAppSelector } from '../store/hooks';
import {
    IZLENEN_CAMI_SAYISI,
    ALAN_ADIM_M,
    ALAN_MAX_M,
    ALAN_MIN_M,
    BEKLEME_MAX_DK,
    BEKLEME_MIN_DK,
    KAPI_CUMA_ONCE_DK,
    KAPI_CUMA_SONRA_DK,
    KAPI_ONCE_DK,
    KAPI_SONRA_DK,
    VARSAYILAN_ALAN_M,
    type YerKaydi,
} from '../../core/cami/camiTipleri';
import { mesafeM } from '../../core/cami/geometri';
import type { OlaySatiri } from '../../core/cami/olayMetinleri';
import { camidenCik } from '../../../modules/expo-cami-geofence/src';
import { SecenekCipleri, type Secenek } from '../components/cami/SecenekCipleri';
import { CamiHaritasi } from '../components/cami/CamiHaritasi';
import { EYLEM_METNI, guvenOrnekleriOlustur } from '../../core/cami/guvenOrnekleri';
import type { AcilisBicimi, IzlemeKapsami } from '../../core/cami/guvenPuani';
import type { AyarlarStackParamList } from '../../navigation/ayarlarEkranlari';

interface ListeYeri {
    id: string;
    ad: string;
    mesafe: number | null;
    yaricapM: number;
    poligonVar: boolean;
    ayar?: YerKaydi;
}

export const mesafeMetni = (m: number | null): string => {
    if (m == null) return 'uzakta';
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
};

const saatMetni = (ms: number): string => {
    const d = new Date(ms);
    const bugun = new Date();
    const saat = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (d.toDateString() === bugun.toDateString()) return saat;
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} ${saat}`;
};

type Sekme = 'ayarlar' | 'harita' | 'nasil';

const SEKMELER: readonly Secenek<Sekme>[] = [
    { deger: 'ayarlar', etiket: 'Ayarlar', ikon: 'sliders-h' },
    { deger: 'harita', etiket: 'Harita', ikon: 'map-marked-alt' },
    { deger: 'nasil', etiket: 'Nasıl algılanır', ikon: 'question-circle' },
];

const ACILIS_SECENEKLERI: readonly Secenek<AcilisBicimi>[] = [
    { deger: 'akilli', etiket: 'Akıllı (önerilen)', ikon: 'magic' },
    { deger: 'otomatik', etiket: 'Otomatik', ikon: 'bolt' },
    { deger: 'sorarak', etiket: 'Sorarak', ikon: 'question' },
];

const ACILIS_ACIKLAMASI: Readonly<Record<AcilisBicimi, string>> = {
    akilli:
        'Ezan vaktinde ve caminin içindeyken kendiliğinden açılır. Emin olunamazsa (yolda bekleme, binanın hemen dışı) sessiz bir bildirimle size sorulur; önünden geçerken hiçbir şey olmaz.',
    otomatik: 'Camide sayıldığınız her seferinde sormadan açılır. Önünden geçerken ya da araçtayken yine açılmaz.',
    sorarak: 'Her seferinde önce sessiz bir bildirimle "Camide misiniz?" diye sorulur; siz onaylarsanız açılır.',
};

const KAPSAM_SECENEKLERI: readonly Secenek<IzlemeKapsami>[] = [
    { deger: 'yakindakiler', etiket: 'Yakınımdaki tüm camiler', ikon: 'mosque' },
    { deger: 'secilenler', etiket: 'Yalnız seçtiklerim', ikon: 'star' },
];

export const CamideyimAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const navigation = useNavigation<NativeStackNavigationProp<AyarlarStackParamList>>();
    const c = useCamideyim();
    // "Hatırlatmalar sessiz gelsin" açıklaması yalnız muhafız açıkken anlamlı (muhafız
    // durumu açılışta yüklenir; bilinmiyorsa açıklama kalır).
    const muhafizAktif = useAppSelector((s) => (s as { muhafiz?: { aktif?: boolean } }).muhafiz?.aktif ?? null);
    const { ayarlar, durum } = c;
    const [disclosure, setDisclosure] = useState(false);
    const [izinUyarisi, setIzinUyarisi] = useState(false);
    const [acikYer, setAcikYer] = useState<string | null>(null);
    const [ekleniyor, setEkleniyor] = useState(false);
    const [sekme, setSekme] = useState<Sekme>('ayarlar');

    const aktiflestir = useCallback(async () => {
        const sonuc = await c.guncelle({ aktif: true });
        if (sonuc === 'izinYok') setIzinUyarisi(true);
    }, [c]);

    const aktifDegis = useCallback(
        async (v: boolean) => {
            if (!v) {
                await c.guncelle({ aktif: false });
                return;
            }
            const arka = await Location.getBackgroundPermissionsAsync().catch(() => null);
            if (arka?.status === 'granted') {
                await aktiflestir();
            } else {
                setDisclosure(true);
            }
        },
        [c, aktiflestir]
    );

    const disclosureKabul = useCallback(async () => {
        setDisclosure(false);
        try {
            const on = await Location.requestForegroundPermissionsAsync();
            if (on?.status !== 'granted') {
                setIzinUyarisi(true);
                return;
            }
            const arka = await Location.requestBackgroundPermissionsAsync();
            if (arka?.status !== 'granted') {
                setIzinUyarisi(true);
                return;
            }
            await aktiflestir();
        } catch {
            setIzinUyarisi(true);
        }
    }, [aktiflestir]);

    const yerEkle = useCallback(async () => {
        setEkleniyor(true);
        const eklendi = await c.bulundugumYeriEkle();
        setEkleniyor(false);
        kisaBildirimGoster(
            eklendi ? 'Bulunduğunuz yer eklendi' : 'Konumunuz alınamadı; konum izni ve GPS açık mı kontrol edin.',
            !eklendi
        );
    }, [c]);


    const liste = useMemo<ListeYeri[]>(() => {
        const sonuc: ListeYeri[] = c.yakinlar.map((y) => ({
            id: y.id,
            ad: y.ad,
            mesafe: y.mesafeM,
            yaricapM: y.yaricapM,
            poligonVar: y.poligonVar,
            ayar: ayarlar.yerler[y.id],
        }));
        const var_ = new Set(sonuc.map((y) => y.id));
        const merkez = c.merkez;
        for (const [id, ayar] of Object.entries(ayarlar.yerler)) {
            if (var_.has(id)) continue;
            if (!ayar.kendi && ayar.durum === 'normal') continue;
            const mesafe =
                merkez && typeof ayar.lat === 'number' && typeof ayar.lng === 'number'
                    ? mesafeM(merkez.lat, merkez.lng, ayar.lat, ayar.lng)
                    : null;
            sonuc.push({ id, ad: ayar.ad ?? '', mesafe, yaricapM: 0, poligonVar: false, ayar });
        }
        return sonuc.sort((a, b) => (a.mesafe ?? Infinity) - (b.mesafe ?? Infinity));
    }, [c.yakinlar, c.merkez, ayarlar.yerler]);

    const secilenSayisi = Object.values(ayarlar.yerler).filter((y) => y.kendi || y.durum === 'favori').length;
    const yerSay = (kosul: (y: YerKaydi) => boolean) => Object.values(ayarlar.yerler).filter(kosul).length;
    const haritaOzeti = `${yerSay((y) => y.durum === 'favori')} favori · ${yerSay((y) => y.durum === 'haric')} cami değil · ${yerSay((y) => y.kendi === true)} sizin yeriniz`;
    const ornekler = guvenOrnekleriOlustur(ayarlar);

    const bolum = (metin: string) => (
        <Text className="text-xs font-bold tracking-wider mt-6 mb-2" style={{ color: renkler.metinIkincil }}>
            {metin}
        </Text>
    );
    const kartStili = { backgroundColor: renkler.kartArkaplan, borderRadius: 24 };

    if (!c.kullanilabilir) {
        return (
            <View className="flex-1 p-6 items-center justify-center" style={{ backgroundColor: renkler.arkaplan }}>
                <FontAwesome5 name="mosque" size={28} color={renkler.metinIkincil} solid />
                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                    Camideyim yalnız Android telefonlarda kullanılabilir.
                </Text>
            </View>
        );
    }

    const izinEksik = ayarlar.aktif && durum != null && durum.izin !== 'tamam';
    const modKapali = ayarlar.namazModu && durum?.namazModu && !durum.namazModu.ayarlar.etkin;

    const yerSatiri = (y: ListeYeri) => {
        const ayar = y.ayar;
        const kendi = ayar?.kendi === true;
        const haric = ayar?.durum === 'haric';
        const favori = ayar?.durum === 'favori';
        const acik = acikYer === y.id;
        const ad = y.ad || (kendi ? 'Eklediğim yer' : 'Adı bilinmeyen cami');
        const etiketler = [mesafeMetni(y.mesafe), kendi ? 'sizin yeriniz' : null, favori ? 'favori' : null, haric ? 'cami değil' : null]
            .filter(Boolean)
            .join(' · ');
        const alan = ayar?.alanM ?? (y.yaricapM > 0 ? y.yaricapM : VARSAYILAN_ALAN_M);
        return (
            <View key={y.id} className="rounded-2xl border mb-2" style={{ borderColor: renkler.sinir, backgroundColor: renkler.arkaplan }}>
                <TouchableOpacity
                    testID={`cami-${y.id}`}
                    className="flex-row items-center p-3"
                    style={{ minHeight: 56 }}
                    onPress={() => setAcikYer(acik ? null : y.id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: acik }}
                    accessibilityLabel={`${ad}, ${etiketler}`}
                >
                    <View
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${haric ? renkler.metinIkincil : renkler.birincil}20` }}
                    >
                        <FontAwesome5
                            name={haric ? 'ban' : kendi ? 'home' : 'mosque'}
                            size={14}
                            color={haric ? renkler.metinIkincil : renkler.birincil}
                            solid
                        />
                    </View>
                    <View className="flex-1 pr-2">
                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }} numberOfLines={1}>
                            {ad}
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {etiketler}
                        </Text>
                    </View>
                    {favori && <FontAwesome5 name="star" size={12} color={renkler.birincil} solid style={{ marginRight: 8 }} />}
                    <FontAwesome5 name={acik ? 'chevron-up' : 'chevron-down'} size={12} color={renkler.metinIkincil} />
                </TouchableOpacity>
                {acik && (
                    <View className="px-3 pb-3">
                        {haric ? (
                            <Text className="text-xs mb-2" style={{ color: renkler.metinIkincil }}>
                                Burada hiçbir zaman "camidesiniz" denmez.
                            </Text>
                        ) : (
                            <>
                                <View className="flex-row items-center justify-between mb-1">
                                    <View className="flex-1 pr-2">
                                        <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                                            Algılama alanı
                                        </Text>
                                        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                                            Bu alanın içindeyseniz camide sayılırsınız
                                        </Text>
                                    </View>
                                    <SayisalSecici
                                        deger={alan}
                                        min={ALAN_MIN_M}
                                        max={ALAN_MAX_M}
                                        adim={ALAN_ADIM_M}
                                        birim="m"
                                        onChange={(v) => c.yerGuncelle(y.id, { alanM: v })}
                                        renk={renkler.birincil}
                                        aciklama={`${ad} alanı`}
                                    />
                                </View>
                                {y.poligonVar && (
                                    <Text className="text-xs mb-1" style={{ color: renkler.metinIkincil }}>
                                        {ayar?.alanM == null
                                            ? 'Şu an caminin bina sınırı kullanılıyor; alan seçerseniz onun yerine geçer.'
                                            : 'Seçtiğiniz alan bina sınırının yerine kullanılıyor.'}
                                    </Text>
                                )}
                            </>
                        )}
                        <View className="flex-row gap-2 mt-2">
                            {kendi ? (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-2xl border"
                                    style={{ borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan, minHeight: 44 }}
                                    onPress={() => c.yerSil(y.id)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${ad} yerini silin`}
                                >
                                    <FontAwesome5 name="trash-alt" size={12} color={renkler.metin} style={{ marginRight: 6 }} />
                                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                        Sil
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-2xl border"
                                    style={{ borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan, minHeight: 44 }}
                                    onPress={() =>
                                        c.yerGuncelle(y.id, haric ? { durum: 'normal' } : { durum: 'haric', ad: y.ad })
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel={haric ? `${ad}: geri alın` : `${ad}: cami değil`}
                                >
                                    <FontAwesome5 name={haric ? 'undo' : 'ban'} size={12} color={renkler.metin} style={{ marginRight: 6 }} />
                                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                        {haric ? 'Geri alın' : 'Cami değil'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {!haric && (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-2xl"
                                    style={{
                                        backgroundColor: favori ? renkler.birincil : renkler.kartArkaplan,
                                        borderWidth: favori ? 0 : 1,
                                        borderColor: renkler.sinir,
                                        minHeight: 44,
                                    }}
                                    onPress={() => {
                                        const kayit = c.yakinlar.find((k) => k.id === y.id);
                                        c.yerGuncelle(
                                            y.id,
                                            favori
                                                ? { durum: 'normal' }
                                                : { durum: 'favori', ad: y.ad, ...(kayit ? { lat: kayit.lat, lng: kayit.lng } : {}) }
                                        );
                                    }}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: favori }}
                                    accessibilityLabel={favori ? `${ad}: favoriden çıkarın` : `${ad}: favorilere ekleyin`}
                                >
                                    <FontAwesome5
                                        name="star"
                                        size={12}
                                        color={favori ? renkler.birincilMetin : renkler.metin}
                                        solid
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text className="text-sm font-semibold" style={{ color: favori ? renkler.birincilMetin : renkler.metin }}>
                                        {favori ? 'Favoride' : 'Favori'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const olaySatiri = (o: OlaySatiri, i: number, son: boolean) => {
        const renk = o.ton === 'uyari' ? renkler.durum.uyari : o.ton === 'iyi' ? renkler.birincil : renkler.metinIkincil;
        return (
            <View key={`${o.zamanMs}-${i}`} className="flex-row">
                <Text className="text-xs pt-1" style={{ color: renkler.metinIkincil, width: 72, fontVariant: ['tabular-nums'] }}>
                    {saatMetni(o.zamanMs)}
                </Text>
                <View className="items-center mr-2.5" style={{ width: 24 }}>
                    <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: `${renk}26` }}>
                        <FontAwesome5 name={o.ikon} size={10} color={o.ton === 'uyari' ? renkler.metin : renk} solid />
                    </View>
                    {!son && <View style={{ flex: 1, width: 2, minHeight: 14, backgroundColor: renkler.sinir }} />}
                </View>
                <View className="flex-1 pb-3">
                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                        {o.baslik}
                    </Text>
                    {o.aciklama ? (
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {o.aciklama}
                        </Text>
                    ) : null}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: renkler.arkaplan }}>
            <View className="px-4 pt-3 pb-2">
                <SecenekCipleri secenekler={SEKMELER} secili={sekme} onSec={setSekme} grupEtiketi="Camideyim bölümleri" rol="tab" testIDOnEki="sekme" />
            </View>
            {sekme === 'harita' ? (
                <CamiHaritasi c={c} />
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {sekme === 'ayarlar' ? (
                        <>
            <Text className="text-sm mb-4" style={{ color: renkler.metinIkincil }}>
                Bir camide namaz için durduğunuzda telefonunuz bunu kendiliğinden anlar. Konumunuz telefonunuzdan çıkmaz.
            </Text>

            <View className="p-3" style={kartStili}>
                <AyarKutusu
                    testID="camideyim-ana"
                    ikon="mosque"
                    baslik="Camideyim"
                    aciklama="Yakınınızdaki camileri izler; geçip gitmek sayılmaz"
                    deger={ayarlar.aktif}
                    onDegis={aktifDegis}
                />
                {izinEksik && (
                    <TouchableOpacity
                        testID="camideyim-izin-uyarisi"
                        className="flex-row items-center p-3.5 rounded-2xl mb-2"
                        style={{ backgroundColor: `${renkler.durum.uyari}20`, minHeight: 56 }}
                        onPress={() => Linking.openSettings().catch(() => undefined)}
                        accessibilityRole="button"
                        accessibilityLabel="Konum izni eksik. Uygulama ayarlarını açın"
                    >
                        <FontAwesome5 name="exclamation-circle" size={16} color={renkler.metin} style={{ marginRight: 10 }} />
                        <Text className="text-sm flex-1" style={{ color: renkler.metin }}>
                            {durum?.izin === 'arkaPlanYok'
                                ? 'Konum izni "Her zaman" olmadığı için uygulama kapalıyken algılanamaz. Ayarları açmak için dokunun.'
                                : 'Konum izni verilmediği için camiler izlenemiyor. Ayarları açmak için dokunun.'}
                        </Text>
                    </TouchableOpacity>
                )}
                {durum?.camide && (
                    <View className="flex-row items-center p-3.5 rounded-2xl mb-2" style={{ backgroundColor: `${renkler.birincil}15` }}>
                        <FontAwesome5 name="mosque" size={16} color={renkler.birincil} solid style={{ marginRight: 10 }} />
                        <Text className="text-sm flex-1 font-semibold" style={{ color: renkler.metin }}>
                            Camidesiniz · {durum.camide.ad || 'Cami'}
                        </Text>
                        <TouchableOpacity
                            className="px-3 rounded-xl items-center justify-center"
                            style={{ minHeight: 44, borderWidth: 1, borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan }}
                            onPress={async () => {
                                await camidenCik();
                                await c.yenile();
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Camide değilim"
                        >
                            <Text className="text-xs font-semibold" style={{ color: renkler.metin }}>
                                Camide değilim
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                {durum?.soru && !durum.camide && (
                    <View className="p-3.5 rounded-2xl mb-2" style={{ backgroundColor: `${renkler.durum.bilgi}15` }} testID="camideyim-soru">
                        <View className="flex-row items-center mb-2">
                            <FontAwesome5 name="question-circle" size={16} color={renkler.durum.bilgi} solid style={{ marginRight: 10 }} />
                            <Text className="text-sm flex-1 font-semibold" style={{ color: renkler.metin }}>
                                Camide misiniz? · {durum.soru.yer.ad || 'Cami'}
                            </Text>
                        </View>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                className="flex-1 items-center justify-center rounded-xl"
                                style={{ minHeight: 44, borderWidth: 1, borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan }}
                                onPress={() => c.soruyuCevapla(false)}
                                accessibilityRole="button"
                                accessibilityLabel="Hayır, camide değilim"
                            >
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    Hayır
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-xl"
                                style={{ flex: 1.4, minHeight: 44, backgroundColor: renkler.birincil }}
                                onPress={() => c.soruyuCevapla(true)}
                                accessibilityRole="button"
                                accessibilityLabel={ayarlar.namazModu ? 'Namaz modunu açın' : 'Evet, camideyim'}
                            >
                                <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                    {ayarlar.namazModu ? 'Namaz modunu açın' : 'Evet, camideyim'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {ayarlar.aktif && (
                <>
                    {bolum('NE ZAMAN "CAMİDESİNİZ" DENİR')}
                    <View className="p-3" style={kartStili}>
                        <AyarKutusu
                            ikon="hourglass-half"
                            baslik="En az kalma süresi"
                            aciklama="Önünden geçmek ya da kısa uğramak sayılmaz"
                            sag={
                                <SayisalSecici
                                    deger={ayarlar.beklemeDk}
                                    min={BEKLEME_MIN_DK}
                                    max={BEKLEME_MAX_DK}
                                    birim="dk"
                                    onChange={(v) => c.guncelle({ beklemeDk: v })}
                                    renk={renkler.birincil}
                                    aciklama="En az kalma süresi"
                                />
                            }
                        />
                        <AyarKutusu
                            ikon="clock"
                            baslik="Yalnız vakit yakınında"
                            aciklama={`Vakit girişinden ${KAPI_ONCE_DK} dk önce → ${KAPI_SONRA_DK} dk sonra · cuma: ${KAPI_CUMA_ONCE_DK} dk önce → ${KAPI_CUMA_SONRA_DK} dk sonra. Teravih, cenaze ya da sohbet için kapatabilirsiniz.`}
                            deger={ayarlar.vakitKapisi}
                            onDegis={(v) => c.guncelle({ vakitKapisi: v })}
                        />
                        <View className="px-1 pt-2 pb-1" testID="acilis-bicimi">
                            <Text className="text-sm font-semibold mb-2" style={{ color: renkler.metin }}>
                                Nasıl açılsın?
                            </Text>
                            <SecenekCipleri
                                secenekler={ACILIS_SECENEKLERI}
                                secili={ayarlar.acilisBicimi}
                                onSec={(v) => c.guncelle({ acilisBicimi: v })}
                                grupEtiketi="Açılış biçimi"
                                testIDOnEki="acilis"
                            />
                            <Text className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
                                {ACILIS_ACIKLAMASI[ayarlar.acilisBicimi]}
                            </Text>
                        </View>
                    </View>

                    {bolum('CAMİDEYKEN')}
                    <View className="p-3" style={kartStili}>
                        <AyarKutusu
                            ikon="moon"
                            baslik="Namaz moduna geçin"
                            aciklama={'Telefonunuzun Modlar ekranındaki "Namaz" modu açılır'}
                            deger={ayarlar.namazModu}
                            onDegis={(v) => c.guncelle({ namazModu: v })}
                        />
                        {modKapali && (
                            <TouchableOpacity
                                className="flex-row items-center px-3.5 mb-2 rounded-2xl"
                                style={{ minHeight: 44 }}
                                onPress={() => navigation.navigate('NamazModuAyarlari')}
                                accessibilityRole="button"
                                accessibilityLabel="Namaz modu kapalı. Namaz modu ayarlarını açın"
                            >
                                <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginRight: 6 }} />
                                <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                                    Namaz modu henüz açık değil. Açmak için dokunun.
                                </Text>
                                <FontAwesome5 name="chevron-right" size={11} color={renkler.metinIkincil} />
                            </TouchableOpacity>
                        )}
                        <AyarKutusu
                            ikon="volume-mute"
                            baslik="Hatırlatmalar sessiz gelsin"
                            aciklama={
                                muhafizAktif === false
                                    ? undefined
                                    : 'Hatırlatmalar gelmeye devam eder; sesli okuma susar ve Rahatsız Etmeyin delinmez'
                            }
                            deger={ayarlar.sessiz}
                            onDegis={(v) => c.guncelle({ sessiz: v })}
                        />
                        <AyarKutusu
                            ikon="check-circle"
                            baslik={'Çıkınca "Kıldınız mı?" diye sorulsun'}
                            aciklama="Tek dokunuşla işaretleyebilirsiniz"
                            deger={ayarlar.kildimSor}
                            onDegis={(v) => c.guncelle({ kildimSor: v })}
                        />
                    </View>

                    {bolum('HANGİ CAMİLER İZLENSİN')}
                    <View className="p-3" style={kartStili} testID="izleme-kapsami">
                        <SecenekCipleri
                            secenekler={KAPSAM_SECENEKLERI}
                            secili={ayarlar.izlemeKapsami}
                            onSec={(v) => c.guncelle({ izlemeKapsami: v })}
                            grupEtiketi="İzleme kapsamı"
                            testIDOnEki="kapsam"
                        />
                        <Text className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
                            {ayarlar.izlemeKapsami === 'secilenler'
                                ? 'Yalnız favorileriniz ve eklediğiniz yerler izlenir; başka bir camide algılanmazsınız.'
                                : `Telefonun konum servisi size en yakın ${IZLENEN_CAMI_SAYISI} camiyi izler; uzaklaştıkça liste kendiliğinden yenilenir. Favorileriniz uzakta da olsa izlenir.`}
                        </Text>
                        {ayarlar.izlemeKapsami === 'secilenler' && secilenSayisi === 0 && (
                            <View className="flex-row items-center p-3 rounded-2xl mt-2" style={{ backgroundColor: `${renkler.durum.uyari}20` }}>
                                <FontAwesome5 name="exclamation-circle" size={14} color={renkler.metin} style={{ marginRight: 8 }} />
                                <Text className="text-xs flex-1" style={{ color: renkler.metin }}>
                                    Henüz favori ya da eklediğiniz bir yer yok; şu an hiçbir yer izlenmiyor.
                                </Text>
                            </View>
                        )}
                        <View className="flex-row items-start mt-3">
                            <FontAwesome5 name="battery-three-quarters" size={12} color={renkler.metinIkincil} style={{ marginRight: 8, marginTop: 2 }} />
                            <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                                {`Pil: Bölgeleri telefonun kendi konum servisi aynı düşük güçlü akışla izler; ${IZLENEN_CAMI_SAYISI} bölge ile 1 bölgenin pil maliyeti hemen hemen aynıdır. Seçim yine de sizde.`}
                            </Text>
                        </View>
                    </View>

                    {bolum('CAMİLER')}
                    <View className="p-3" style={kartStili}>
                        <TouchableOpacity
                            testID="haritaya-git"
                            className="flex-row items-center p-3 rounded-2xl mb-3"
                            style={{ borderWidth: 1, borderColor: renkler.sinir, backgroundColor: renkler.arkaplan, minHeight: 56 }}
                            onPress={() => setSekme('harita')}
                            accessibilityRole="button"
                            accessibilityLabel="Haritada görün ve düzenleyin"
                        >
                            <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${renkler.birincil}20` }}>
                                <FontAwesome5 name="map-marked-alt" size={14} color={renkler.birincil} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    Haritada görün ve düzenleyin
                                </Text>
                                <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                                    {haritaOzeti}
                                </Text>
                            </View>
                            <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="yer-ekle"
                            className="flex-row items-center justify-center rounded-2xl mb-3"
                            style={{ backgroundColor: renkler.birincil, minHeight: 48, opacity: ekleniyor ? 0.6 : 1 }}
                            onPress={yerEkle}
                            disabled={ekleniyor}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: ekleniyor, busy: ekleniyor }}
                            accessibilityLabel="Bulunduğunuz yeri ekleyin"
                        >
                            <FontAwesome5 name="plus" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                            <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                Bulunduğunuz yeri ekleyin
                            </Text>
                        </TouchableOpacity>
                        <Text className="text-xs mb-3" style={{ color: renkler.metinIkincil }}>
                            İş yerindeki mescit, Kur'an kursu ya da namaz kıldığınız herhangi bir yer. Favoriler uzakta da olsa hep izlenir.
                        </Text>
                        {liste.length === 0 ? (
                            <Text className="text-sm text-center py-4" style={{ color: renkler.metinIkincil }}>
                                {durum?.veriVar === false
                                    ? 'Bu sürümde cami verisi yok; eklediğiniz yerler yine algılanır.'
                                    : 'Yakınınızda cami bulunamadı. Konumunuzu Konum Ayarları\'ndan kontrol edin.'}
                            </Text>
                        ) : (
                            liste.map(yerSatiri)
                        )}
                        {durum?.veriVar ? (
                            <Text className="text-[11px] mt-1" style={{ color: renkler.metinIkincil }}>
                                Cami verisi: © OpenStreetMap katkıcıları (ODbL)
                            </Text>
                        ) : null}
                    </View>
                </>
            )}

                        </>
                    ) : (
                        <>
            <View className="p-4" style={kartStili} testID="nasil-algilanir">
                {[
                    {
                        ikon: 'satellite-dish',
                        baslik: 'Tek konum değil, bütün camiler',
                        metin: 'Telefon yakınınızdaki camilerin çevresini kendi konum servisiyle izler; uygulama yalnız bir olay olunca uyanır.',
                    },
                    {
                        ikon: 'hourglass-half',
                        baslik: 'Önce bekleme',
                        metin: `Bir caminin ~100 m çevresinde en az ${ayarlar.beklemeDk} dakika kalırsanız telefon haber verir. Önünden geçmek sayılmaz.`,
                    },
                    {
                        ikon: 'crosshairs',
                        baslik: 'Sonra tek hassas ölçüm',
                        metin: 'Konum bir kez hassas ölçülür ve caminin bina sınırıyla ya da seçtiğiniz alanla karşılaştırılır. Ölçüm kaba gelirse hiçbir şey yapılmaz.',
                    },
                    {
                        ikon: 'balance-scale',
                        baslik: 'Son olarak güven',
                        metin: 'Ezan vaktine yakınlık, cuma namazı, binanın içinde olmanız, hızınız ve bekleme süresi birlikte değerlendirilir: güven yüksekse açılır, sınırdaysa size sorulur.',
                    },
                ].map((m) => (
                    <View key={m.ikon} className="flex-row mb-3">
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${renkler.birincil}20` }}>
                            <FontAwesome5 name={m.ikon} size={12} color={renkler.birincil} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                {m.baslik}
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                {m.metin}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {bolum('ÖRNEKLER · SİZİN AYARLARINIZLA')}
            <View className="p-3" style={kartStili} testID="guven-ornekleri">
                {ornekler.map((o) => (
                    <View key={o.id} className="flex-row items-center py-2" accessible accessibilityLabel={`${o.baslik}: ${o.olculmez ? 'konum bile ölçülmez' : EYLEM_METNI[o.eylem]}`}>
                        <FontAwesome5 name={o.ikon} size={13} color={renkler.metinIkincil} style={{ width: 22, textAlign: 'center', marginRight: 8 }} />
                        <Text className="text-sm flex-1" style={{ color: renkler.metin }}>
                            {o.baslik}
                        </Text>
                        <View
                            className="px-2.5 py-1 rounded-full"
                            style={{
                                backgroundColor:
                                    o.eylem === 'otomatik' ? `${renkler.birincil}20` : o.eylem === 'sor' ? `${renkler.durum.bilgi}20` : `${renkler.metinIkincil}20`,
                            }}
                        >
                            <Text className="text-xs font-semibold" style={{ color: renkler.metin }}>
                                {o.olculmez ? 'Ölçülmez bile' : EYLEM_METNI[o.eylem]}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {bolum('SON ALGILAMALAR')}
            <View className="p-4" style={kartStili} testID="son-algilamalar">
                {c.olaylar.length === 0 ? (
                    <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                        Henüz bir algılama yok. Bir camide vakit yakınında birkaç dakika kaldığınızda burada neden algılandığını
                        göreceksiniz.
                    </Text>
                ) : (
                    <>
                        {c.olaylar.slice(0, 12).map((o, i, d) => olaySatiri(o, i, i === d.length - 1))}
                        <TouchableOpacity
                            className="self-start justify-center"
                            style={{ minHeight: 44 }}
                            onPress={c.gunluguTemizle}
                            accessibilityRole="button"
                            accessibilityLabel="Son algılamaları temizleyin"
                        >
                            <Text className="text-xs font-semibold" style={{ color: renkler.birincil }}>
                                Listeyi temizleyin
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

                        </>
                    )}
                </ScrollView>
            )}
            <KonumIzniDisclosureModali
                gorunur={disclosure}
                tip="camideyim"
                onKabul={disclosureKabul}
                onReddet={() => setDisclosure(false)}
            />
            <BildirimModali
                gorunur={izinUyarisi}
                tip="bilgi"
                baslik={'"Her zaman" konum izni gerekiyor'}
                mesaj={
                    'Camideyim, uygulama kapalıyken de camide olduğunuzu anlamak için konum iznini "Her zaman" olarak ister. Ayarlardan izin verip buraya dönebilirsiniz.'
                }
                birincilEtiket="Ayarları açın"
                birincilIkon="external-link-alt"
                onBirincil={() => {
                    setIzinUyarisi(false);
                    Linking.openSettings().catch(() => undefined);
                }}
                onKapat={() => setIzinUyarisi(false)}
            />
        </View>
    );
};

export default CamideyimAyarlariSayfasi;
