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
    RUTIN_ANAHTAR_KELIMELERI,
} from '../../core/otomasyon/anahtarKelimeler';
import { ONE_UI_NOTU, rutinOnkosulNotu } from '../../core/otomasyon/rehberNotlari';
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

const SEKMELER: { id: Sekme; etiket: string; ikon: string }[] = [
    { id: 'rutinler', etiket: 'Samsung Rutinler', ikon: 'magic' },
    { id: 'eklenti', etiket: 'Tasker · MacroDroid', ikon: 'puzzle-piece' },
];

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
                <Text className="flex-1 text-sm" style={{ color: renkler.metin }} accessibilityLabel={`${i + 1}. adım: ${a}`}>
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
                Bilmeniz gerekenler
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

const RutinlerRehberi: React.FC<{ renkler: Renkler; onkosul: string | null }> = ({ renkler, onkosul }) => (
    <View style={{ gap: 16 }}>
        <Kart renkler={renkler} ikon="bell" baslik="Vakit girince bir şey yapın" testID="rehber-rutin-tetik">
            <Adimlar
                renkler={renkler}
                adimlar={[
                    'Telefonunuzun Ayarlar > Modlar ve Rutinler > Rutinler bölümünü açın, yeni bir rutin ekleyin.',
                    '"Eğer" kısmında "Bildirim alındığında" koşulunu seçin.',
                    'Uygulama olarak Namaz Akışı\'nı seçin, anahtar kelimeye aşağıdakilerden birini harfiyen yazın.',
                    '"Ardından" kısmında istediğiniz eylemi ekleyin (ör. ses modunu titreşime alın).',
                ]}
            />
            <View className="mt-4" style={{ gap: 8 }}>
                {RUTIN_ANAHTAR_KELIMELERI.map((k) => (
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
        </Kart>
        <Kart renkler={renkler} ikon="check" baslik="Rutinden namazı işaretleyin" testID="rehber-rutin-kildim">
            <Adimlar
                renkler={renkler}
                adimlar={[
                    'Rutinin "Ardından" kısmında Uygulamalar bölümünü açın ve bir uygulama eylemi ekleyin.',
                    'Namaz Akışı\'nın "Şu anki vakti kıldım" kısayolunu seçin.',
                    'Rutin ilk çalıştığında size sorulur. "Her zaman izin ver" derseniz bir daha sorulmaz.',
                ]}
            />
        </Kart>
        <Notlar
            renkler={renkler}
            notlar={[
                'Namaz Akışı bildirimlerini ya da ilgili bildirim kategorisini sessize alırsanız rutin tetiklenmez.',
                ...(onkosul ? [onkosul] : []),
                ONE_UI_NOTU,
            ]}
        />
    </View>
);

const EklentiRehberi: React.FC<{ renkler: Renkler }> = ({ renkler }) => (
    <View style={{ gap: 16 }}>
        <Kart renkler={renkler} ikon="bolt" baslik="Vakit olaylarıyla başlatın" testID="rehber-eklenti-olay">
            <Adimlar
                renkler={renkler}
                adimlar={[
                    'Tasker\'da yeni bir profil ekleyin: Olay > Eklenti > "Namaz Akışı: Vakit olayı". MacroDroid ve Automate\'te "Namaz Akışı: Vakit durumu" eklentisini seçin.',
                    `Olayı seçin: vakit girdiğinde, vakit çıkıyor (${CIKIYOR_ESIK_DK} dk kala) ya da camide olduğunuz algılandığında. İsterseniz tek bir vakti seçebilirsiniz.`,
                    'İlk eklediğinizde uygulamaya izin vermeniz istenir.',
                ]}
            />
            <Text className="text-xs font-bold mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
                KULLANABİLECEĞİNİZ DEĞİŞKENLER
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
        <Kart renkler={renkler} ikon="check" baslik="Namazı işaretleyin" testID="rehber-eklenti-kildim">
            <Adimlar
                renkler={renkler}
                adimlar={[
                    'Göreve eylem ekleyin: Eklenti > "Namaz Akışı: Kıldım".',
                    'Eylem çalıştığında o anki vakit kılındı olarak işaretlenir. Vakit yoksa ya da zaten işaretliyse hiçbir şey değişmez.',
                ]}
            />
        </Kart>
        <Notlar
            renkler={renkler}
            notlar={[
                '"Vakit girdi" olayı ekran kapalıyken birkaç dakika gecikebilir. Tam vaktinde çalışması gerekiyorsa bildirim tetikleyicisini ("vakti girdi") kullanın.',
                '"Vakit çıkıyor" namaz muhafızı açıkken ve namaz henüz işaretlenmemişken çalışır.',
                'Bir uygulamayı aşağıdaki listeden engellerseniz ya da kaldırırsanız kurduğunuz eklentiler çalışmaz. Otomasyonu başka bir telefona taşıdığınızda eklentiyi bir kez yeniden düzenleyin.',
            ]}
        />
    </View>
);

export const OtomasyonRehberiSayfasi: React.FC = () => {
    const renkler = useRenkler();
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
                    Bu rehber yalnız Android telefonlar içindir.
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
                Vakit girince telefonunuzu sessize almak, camiye girince bir şeyi kapatmak ya da namazı tek dokunuşla
                işaretlemek için Namaz Akışı&apos;nı otomasyon uygulamalarıyla kullanabilirsiniz.
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
                accessibilityLabel="Kıldım işaretleyebilen uygulamalar"
                accessibilityHint="Otomasyon uygulamalarına verdiğiniz izinleri yönetin"
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
                        Kıldım işaretleyebilen uygulamalar
                    </Text>
                    <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                        İzin verdiğiniz uygulamaları yönetin
                    </Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color={renkler.metinIkincil} />
            </TouchableOpacity>
        </ScrollView>
    );
};
