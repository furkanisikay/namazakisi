/**
 * "Otomasyonlarla kullanın" rehberi (issue #278) — yalnız Android.
 *
 * İki yol anlatılır:
 *  - Samsung Rutinler: üçüncü taraf tetik SDK'sı yok; "Bildirim alındığında" koşulu +
 *    sabit anahtar kelime (`core/otomasyon/anahtarKelimeler.ts`) ve "Şu anki vakti kıldım"
 *    kısayolu uygulama eylemi olarak.
 *  - Tasker / MacroDroid / Automate: Locale eklenti protokolü (native `otomasyon/`).
 *
 * İmza öğesi: üstteki iki sekmeli seçici (kullanıcı kendi uygulamasını seçer, yalnız o
 * adımları görür). Gerisi sakin, numaralı adım kartları. Başlık navigasyon header'ındadır
 * (AGENTS.md: sayfa başlığı TEK yerde).
 */
import * as React from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import {
    CIKIYOR_ESIK_DK,
    EKLENTI_DEGISKENLERI,
    rutinAnahtarKelimeleri,
    vakitGirdiEki,
} from '../../core/otomasyon/anahtarKelimeler';
import { oneUiNotu, rutinOnkosulNotu } from '../../core/otomasyon/rehberNotlari';
import { bicim, metin } from '../../core/dil/aktifDil';
import { useMetin } from '../hooks/useMetin';
import { cihazYerelAyari } from '../../domain/services/DilServisi';
import { useCihazDurumu } from '../hooks/useCihazDurumu';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

/**
 * Vakit bildirimleri ve Camideyim açık mı? Diskten/köprüden SALT okunur (bu ekran store'a
 * bağlı değil; vakit bildirimi dilimi açılışta yüklenmez). Okunamazsa `null` = bilinmiyor.
 */
function useRutinOnkosullari(): { vakit: boolean | null; cami: boolean | null } {
    const [durum, setDurum] = React.useState<{ vakit: boolean | null; cami: boolean | null }>({ vakit: null, cami: null });
    React.useEffect(() => {
        let iptal = false;
        void (async () => {
            let vakit: boolean | null = null;
            let cami: boolean | null = null;
            try {
                const AsyncStorage = (require('@react-native-async-storage/async-storage') as typeof import('@react-native-async-storage/async-storage')).default;
                const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_AYARLARI);
                vakit = ham ? Object.values(JSON.parse(ham) as Record<string, unknown>).some((v) => v === true) : false;
            } catch {
                vakit = null;
            }
            try {
                const kopru = require('../../../modules/expo-cami-geofence/src') as typeof import('../../../modules/expo-cami-geofence/src');
                if (kopru.camiModuluVarMi()) {
                    const a = (await kopru.ayarlariAl()) as { aktif?: unknown } | null;
                    cami = typeof a?.aktif === 'boolean' ? a.aktif : null;
                }
            } catch {
                cami = null;
            }
            if (!iptal && (vakit !== null || cami !== null)) setDurum({ vakit, cami });
        })();
        return () => {
            iptal = true;
        };
    }, []);
    return durum;
}

type Sekme = 'rutinler' | 'eklenti';

const CIHAZ_ALANLARI = ['samsung'] as const;

type Renkler = ReturnType<typeof useRenkler>;

const SEKMELER: { id: Sekme; readonly etiket: string; ikon: string }[] = [
    { id: 'rutinler', get etiket() { return metin().muhafizAyar.otomasyon.sekmeRutinler; }, ikon: 'magic' },
    { id: 'eklenti', get etiket() { return metin().muhafizAyar.otomasyon.sekmeEklenti; }, ikon: 'puzzle-piece' },
];

/**
 * Native etiketler (Android `res/values`, W5'e kadar YALNIZ Türkçe): rehber bunları
 * kullanıcının ekranda gördüğü gibi aynen yazar; çevrilmiş ad bulunamazdı.
 */
/**
 * Native kısayol ve eklenti etiketleri — başlatıcı ve Tasker/MacroDroid onları TELEFONUN
 * diliyle çözer (uygulama dili değil): `android/app/src/main/res/values[-en]`. Rehber de
 * telefonun dilindeki adı gösterir; İngilizce dışındaki cihaz dilleri Türkçe varsayılana düşer.
 */
const NATIVE_ETIKETLER = {
    tr: {
        kisayol: 'Şu anki vakti kıldım', // dil-haric: kimlik (native kısayol etiketi, values/)
        olay: 'Namaz Akışı: Vakit olayı', // dil-haric: kimlik (native eklenti etiketi, values/)
        kosul: 'Namaz Akışı: Vakit durumu', // dil-haric: kimlik (native eklenti etiketi, values/)
        eylem: 'Namaz Akışı: Kıldım', // dil-haric: kimlik (native eklenti etiketi, values/)
    },
    en: {
        kisayol: "I've prayed the current prayer",
        olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native eklenti etiketi, values-en/)
        kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native eklenti etiketi, values-en/)
        eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native eklenti etiketi, values-en/)
    },
} as const;

const nativeEtiketler = () => (cihazYerelAyari()?.split(/[-_]/)[0] === 'en' ? NATIVE_ETIKETLER.en : NATIVE_ETIKETLER.tr);

const Kart: React.FC<{ renkler: Renkler; ikon: string; baslik: string; children: React.ReactNode; testID?: string }> = ({
    renkler,
    ikon,
    baslik,
    children,
    testID,
}) => (
    <View
        testID={testID}
        className="p-4"
        style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: renkler.sinir }}
    >
        <View className="flex-row items-center mb-3">
            <View
                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: renkler.birincil + '20' }}
            >
                <FontAwesome5 name={ikon} size={17} color={renkler.birincil} solid />
            </View>
            <Text className="flex-1 text-base font-bold" style={{ color: renkler.metin }} accessibilityRole="header">
                {baslik}
            </Text>
        </View>
        {children}
    </View>
);

const Adimlar: React.FC<{ renkler: Renkler; adimlar: string[] }> = ({ renkler, adimlar }) => (
    <View style={{ gap: 10 }}>
        {adimlar.map((a, i) => (
            <View key={a} className="flex-row">
                <View
                    className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                    style={{ backgroundColor: renkler.birincil }}
                    importantForAccessibility="no-hide-descendants"
                >
                    <Text className="text-xs font-bold" style={{ color: renkler.birincilMetin }}>
                        {i + 1}
                    </Text>
                </View>
                <Text className="flex-1 text-sm" style={{ color: renkler.metin }} accessibilityLabel={bicim(metin().muhafizAyar.otomasyon.adimEtiketi, { n: i + 1, metin: a })}>
                    {a}
                </Text>
            </View>
        ))}
    </View>
);

const Notlar: React.FC<{ renkler: Renkler; notlar: string[] }> = ({ renkler, notlar }) => (
    <View
        className="p-4"
        style={{ backgroundColor: renkler.dikkat + '14', borderRadius: 24, borderWidth: 1, borderColor: renkler.dikkat + '55' }}
    >
        <View className="flex-row items-center mb-2">
            <FontAwesome5 name="exclamation-circle" size={15} color={renkler.dikkat} solid />
            <Text className="ml-2 text-sm font-bold" style={{ color: renkler.metin }}>
                {metin().muhafizAyar.otomasyon.notlarBaslik}
            </Text>
        </View>
        <View style={{ gap: 8 }}>
            {notlar.map((n) => (
                <Text key={n} className="text-sm" style={{ color: renkler.metinIkincil }}>
                    {'• '}
                    {n}
                </Text>
            ))}
        </View>
    </View>
);

const RutinlerRehberi: React.FC<{ renkler: Renkler; onkosul: string | null }> = ({ renkler, onkosul }) => {
    const mo = useMetin().muhafizAyar.otomasyon;
    return (
    <View style={{ gap: 16 }}>
        <Kart renkler={renkler} ikon="bell" baslik={mo.rutinTetikBaslik} testID="rehber-rutin-tetik">
            <Adimlar renkler={renkler} adimlar={[...mo.rutinTetikAdimlar]} />
            <View className="mt-4" style={{ gap: 8 }}>
                {rutinAnahtarKelimeleri().map((k) => (
                    <View
                        key={k.kelime}
                        className="flex-row items-center px-3 py-2 rounded-xl"
                        style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                    >
                        <Text selectable className="text-sm font-bold mr-2" style={{ color: renkler.metin }}>
                            {k.kelime}
                        </Text>
                        <Text className="flex-1 text-xs text-right" style={{ color: renkler.metinIkincil }}>
                            {k.aciklama}
                        </Text>
                    </View>
                ))}
            </View>
            {/* Anahtar kelime dile bağlıdır (Türkçe dahil her dilde söylenir). */}
            <View className="flex-row items-start mt-3 gap-2" testID="rehber-rutin-dil-notu">
                <FontAwesome5 name="language" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} solid />
                <Text className="flex-1 text-xs" style={{ color: renkler.metinIkincil }}>
                    {mo.dilNotu}
                </Text>
            </View>
        </Kart>
        <Kart renkler={renkler} ikon="check" baslik={mo.rutinKildimBaslik} testID="rehber-rutin-kildim">
            <Adimlar renkler={renkler} adimlar={mo.rutinKildimAdimlar.map((a) => bicim(a, nativeEtiketler()))} />
        </Kart>
        <Notlar renkler={renkler} notlar={[mo.rutinSessiz, ...(onkosul ? [onkosul] : []), oneUiNotu()]} />
    </View>
    );
};

const EklentiRehberi: React.FC<{ renkler: Renkler }> = ({ renkler }) => {
    const mo = useMetin().muhafizAyar.otomasyon;
    return (
    <View style={{ gap: 16 }}>
        <Kart renkler={renkler} ikon="bolt" baslik={mo.eklentiOlayBaslik} testID="rehber-eklenti-olay">
            <Adimlar
                renkler={renkler}
                adimlar={mo.eklentiOlayAdimlar.map((a) => bicim(a, { ...nativeEtiketler(), dk: CIKIYOR_ESIK_DK }))}
            />
            <Text className="text-xs font-bold mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
                {mo.degiskenler}
            </Text>
            <View style={{ gap: 6 }}>
                {EKLENTI_DEGISKENLERI.map((d) => (
                    <View key={d.ad} className="flex-row">
                        <Text selectable className="text-sm font-bold w-24" style={{ color: renkler.metin }}>
                            {d.ad}
                        </Text>
                        <Text className="flex-1 text-sm" style={{ color: renkler.metinIkincil }}>
                            {d.aciklama}
                        </Text>
                    </View>
                ))}
            </View>
        </Kart>
        <Kart renkler={renkler} ikon="check" baslik={mo.eklentiKildimBaslik} testID="rehber-eklenti-kildim">
            <Adimlar renkler={renkler} adimlar={mo.eklentiKildimAdimlar.map((a) => bicim(a, nativeEtiketler()))} />
        </Kart>
        <Notlar renkler={renkler} notlar={mo.eklentiNotlar.map((n) => bicim(n, { kelime: vakitGirdiEki() }))} />
    </View>
    );
};

export const OtomasyonRehberiSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const mo = useMetin().muhafizAyar.otomasyon;
    const navigation = useNavigation<{ navigate: (ad: string) => void }>();
    const [sekme, setSekme] = React.useState<Sekme>('rutinler');
    // Samsung Rutinler yalnız Samsung'da var: Samsung DEĞİLSE sekme seçici gizlenir,
    // yalnız eklenti rehberi kalır. Bilinmiyorsa bugünkü düzen (iki sekme).
    const { durum: cihaz } = useCihazDurumu(CIHAZ_ALANLARI, Platform.OS === 'android');
    const samsungDegil = cihaz.samsung === false;
    const onkosullar = useRutinOnkosullari();
    const etkinSekme: Sekme = samsungDegil ? 'eklenti' : sekme;

    if (Platform.OS !== 'android') {
        return (
            <View className="flex-1 p-6 items-center justify-center" style={{ backgroundColor: renkler.arkaplan }}>
                <FontAwesome5 name="magic" size={28} color={renkler.metinIkincil} solid />
                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                    {mo.yalnizAndroid}
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <Text className="text-sm mb-4" style={{ color: renkler.metinIkincil }}>
                {mo.giris}
            </Text>

            {!samsungDegil && (
                <View
                    className="flex-row p-1 mb-4"
                    accessibilityRole="tablist"
                    style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: renkler.sinir }}
                >
                    {SEKMELER.map((s) => {
                        const secili = s.id === etkinSekme;
                        return (
                            <TouchableOpacity
                                key={s.id}
                                testID={`rehber-sekme-${s.id}`}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: secili }}
                                accessibilityLabel={s.etiket}
                                onPress={() => setSekme(s.id)}
                                className="flex-1 flex-row items-center justify-center rounded-2xl px-2"
                                style={{ minHeight: 44, backgroundColor: secili ? renkler.birincil : 'transparent' }}
                            >
                                <FontAwesome5
                                    name={s.ikon}
                                    size={13}
                                    color={secili ? renkler.birincilMetin : renkler.metinIkincil}
                                    solid
                                />
                                <Text
                                    className="ml-2 text-sm font-semibold"
                                    numberOfLines={1}
                                    style={{ color: secili ? renkler.birincilMetin : renkler.metin }}
                                >
                                    {s.etiket}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {etkinSekme === 'rutinler' ? (
                <RutinlerRehberi renkler={renkler} onkosul={rutinOnkosulNotu(onkosullar.vakit, onkosullar.cami)} />
            ) : (
                <EklentiRehberi renkler={renkler} />
            )}

            {/* "Kıldım işaretleyebilen uygulamalar" (#299) Ayarlar ana listesinde DEĞİL, yalnız
                burada: güven listesi otomasyonun parçasıdır; ana listeyi kalabalıklaştırıyordu. */}
            <TouchableOpacity
                testID="rehber-guven-listesi"
                accessibilityRole="button"
                accessibilityLabel={mo.guvenListesi}
                accessibilityHint={mo.guvenIpucu}
                onPress={() => navigation.navigate('KildimUygulamalari')}
                className="flex-row items-center mt-5 p-4"
                style={{ minHeight: 64, backgroundColor: renkler.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: renkler.sinir }}
            >
                <View
                    className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: renkler.birincil + '20' }}
                >
                    <FontAwesome5 name="user-shield" size={17} color={renkler.birincil} solid />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                        {mo.guvenListesi}
                    </Text>
                    <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                        {mo.guvenAciklama}
                    </Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color={renkler.metinIkincil} />
            </TouchableOpacity>
        </ScrollView>
    );
};
