/**
 * Hatırlatma düzeyinin CANLI önizlemesi (görsel anlatı) — eski sihirbazın "Muhafız nasıl
 * çalışır?" animatiğinin yerine, ama sabit tablo yerine motorun planından.
 *
 * Yatay bir zaman rayı: solda ilk uyarı ("45 dk önce"), sağda vaktin çıkışı (bayrak).
 * Noktalar seçilen düzeyin gerçek tetikleridir (`duzeyOnizlemeAdimlari`); nokta büyüklüğü
 * sertliği, hoparlör işareti sesli okumayı gösterir. Bir "şimdi" çizgisi raydan geçer ve
 * değdiği nokta bir an yaylanır — kullanıcı uyarıların zamanla SIKLAŞTIĞINI görür.
 *
 *  - `dongu`: sihirbazda ekran görünürken döngüde oynar (`useDonguAcik` kapısı);
 *    ayar ekranında (`dongu={false}`) düzey değişince BİR KEZ geçer.
 *  - Seçim değişince sahne baştan kurulur.
 *  - Kapalı düzey: sakin dinlenme resmi (ay + boş ray), hareket yok.
 *  - `sesliAcik={false}` (sesli rıza yok / sesli kapatılmış): sesli hücreler bildirime düşer,
 *    "sesli" nokta ve açıklaması ÇİZİLMEZ — resim cihazın kuracağı planla ayrışmasın.
 *  - Dekoratiftir (ekran okuyucudan gizli): bilgi seçicinin altındaki cümlede yazılıdır.
 *  - Yalnız transform/opaklık, native driver; renkler tema token'ı.
 */
import * as React from 'react';
import { Animated, Easing, Text, View, type LayoutChangeEvent } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { duzeyOnizlemeAdimlari, type HatirlatmaDuzeyi } from '../../../core/hatirlatma/duzeyOzeti';
import { HATIRLATMA_PRESETLERI } from '../../store/muhafizSlice';
import type { PresetSeviyeleri } from '../../../core/muhafiz/matrisIslemleri';
import { useDonguAcik, useDonguAnimasyonu } from '../hareket/dongu';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';

const GECIS_MS = 3200;
const BEKLEME_MS = 900;
/** Nokta çapı sertliğe göre (1 nazik … 4 acil). */
const CAP = [0, 10, 12, 14, 16];

/** Nokta etiketinin yerleşimi (saf — test edilebilir). */
export interface DuzeyEtiketi {
    kalanDk: number;
    metin: string;
    sesli: boolean;
    sol: number;
    genislik: number;
    /** Etiket satırı (0 = ilk satır). Binen etiket ATLANMAZ, bir alt satıra kayar. */
    satir: number;
}

/** Etiket genişliği tahmini (12 px yazı + ikon): binme denetimi için yeterli. */
const etiketGenisligi = (metin: string): number => 16 + metin.length * 6.5;

/** Bayrağın ÜSTÜNDE duran pencere sonu yazısı (etiket satırında yer kaplamaz). */
export const VAKIT_CIKAR_METNI = 'Vakit çıkar';
/** Bir etiket satırının yüksekliği (dp). */
export const ETIKET_SATIRI_DP = 18;

/**
 * Her noktanın altına AYNI biçimde "N dk" etiketi. Etiket noktanın altında ortalanır, kart
 * kenarlarına kenetlenir. HİÇBİR ETİKET ATLANMAZ (görsel inceleme 2026-10: ortadaki "10 dk"
 * kayboluyordu): bir öncekine binecek etiket, sığdığı ilk alt satıra kayar (gerekirse yeni
 * satır açılır).
 */
export function duzeyEtiketleriniYerlestir(
    adimlar: readonly { kalanDk: number; sesli: boolean }[],
    genislik: number,
    raySol: number,
    ilkDk: number,
): DuzeyEtiketi[] {
    if (genislik <= 0 || ilkDk <= 0) return [];
    const ray = Math.max(0, genislik - raySol * 2);
    const sonuc: DuzeyEtiketi[] = [];
    const satirSonlari: number[] = [];
    for (const a of adimlar) {
        const metin = `${a.kalanDk} dk`;
        const w = etiketGenisligi(metin);
        const merkez = raySol + (1 - a.kalanDk / ilkDk) * ray;
        const sol = Math.min(Math.max(0, merkez - w / 2), Math.max(0, genislik - w));
        let satir = satirSonlari.findIndex((sag) => sol >= sag + 4);
        if (satir === -1) {
            satir = satirSonlari.length;
            satirSonlari.push(-Infinity);
        }
        satirSonlari[satir] = sol + w;
        sonuc.push({ kalanDk: a.kalanDk, metin, sesli: a.sesli, sol, genislik: w, satir });
    }
    return sonuc;
}

export interface DuzeyOnizlemesiProps {
    duzey: HatirlatmaDuzeyi;
    /** true: görünürken döngü (sihirbaz); false: değişimde bir kez (ayar ekranı). */
    dongu?: boolean;
    /** Sesli okuma gerçekten açık mı (varsayılan evet: sihirbaz rızayı bu adımda alır). */
    sesliAcik?: boolean;
    /**
     * Verilirse resim hazır düzey yerine BU adımlardan çizilir (eski düzey: kullanıcının
     * gerçek planı yeni düzeyin tablosu değildir — resim kartın cümlesiyle aynı şeyi söylesin).
     */
    seviyeler?: PresetSeviyeleri;
    testID?: string;
}

export const DuzeyOnizlemesi: React.FC<DuzeyOnizlemesiProps> = React.memo(function DuzeyOnizlemesi({ duzey, dongu = false, sesliAcik = true, seviyeler, testID }) {
    const renkler = useRenkler();
    const azalt = useHareketAzalt();
    const donguAcik = useDonguAcik();
    const [genislik, setGenislik] = React.useState(0);
    const ilerleme = React.useRef(new Animated.Value(1)).current;

    const adimlar = React.useMemo(
        () =>
            duzeyOnizlemeAdimlari(duzey === 'kapali' ? null : (seviyeler ?? HATIRLATMA_PRESETLERI[duzey].seviyeler), sesliAcik),
        [duzey, sesliAcik, seviyeler],
    );
    const ilkDk = adimlar[0]?.kalanDk ?? 0;
    const kapali = adimlar.length === 0;

    const onLayout = React.useCallback((e: LayoutChangeEvent) => {
        const w = Math.round(e.nativeEvent.layout.width);
        setGenislik((onceki) => (onceki === w ? onceki : w));
    }, []);

    const gecis = React.useCallback(
        () =>
            Animated.sequence([
                Animated.timing(ilerleme, { toValue: 0, duration: 0, useNativeDriver: true }),
                Animated.timing(ilerleme, { toValue: 1, duration: GECIS_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.delay(BEKLEME_MS),
            ]),
        [ilerleme],
    );
    // Dinlenme pozu: çizgi sona varmış ve görünmez, noktalar normal boyda.
    const dinlen = React.useCallback(() => ilerleme.setValue(1), [ilerleme]);

    // Sihirbaz: görünürken döngü.
    useDonguAnimasyonu(dongu && donguAcik && !kapali && genislik > 0, gecis, dinlen, `${duzey}|${genislik}`);

    // Ayar ekranı: düzey değişince (ve ilk girişte) bir kez.
    React.useEffect(() => {
        if (dongu || kapali || genislik === 0 || azalt) return;
        const a = gecis();
        a.start();
        return () => {
            a.stop();
            dinlen();
        };
    }, [dongu, kapali, genislik, azalt, duzey, gecis, dinlen]);

    const raySol = 4;
    const rayGenislik = Math.max(0, genislik - raySol * 2);
    const konum = (kalanDk: number) => (ilkDk > 0 ? 1 - kalanDk / ilkDk : 0);
    const etiketler = React.useMemo(
        () => duzeyEtiketleriniYerlestir(adimlar, genislik, raySol, ilkDk),
        [adimlar, genislik, ilkDk],
    );
    const etiketSatiri = etiketler.reduce((n, e) => Math.max(n, e.satir + 1), 0);

    return (
        <View
            testID={testID}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={{
                marginTop: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: renkler.sinir,
                backgroundColor: renkler.kartArkaplan,
            }}
        >
            {/* "Vakit çıkar" bayrağın ÜSTÜNDE, sağa yaslı — etiket satırında yer kaplamaz. */}
            {!kapali && genislik > 0 ? (
                // Yazı bayrağın SOLUNDA, ikisi tek satırda rayın sağ ucunun üstünde (bayrak
                // eskiden rayın içinde mutlak konumluydu ve yazı onun üstüne biniyordu).
                <View
                    testID="duzey-onizleme-vakit-cikar"
                    style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', marginBottom: -2 }}
                >
                    <Text style={{ fontSize: 12, color: renkler.metinIkincil }} numberOfLines={1}>
                        {VAKIT_CIKAR_METNI}
                    </Text>
                    <FontAwesome5 name="flag-checkered" size={12} color={renkler.metinIkincil} style={{ marginLeft: 5 }} />
                </View>
            ) : null}
            <View testID="duzey-onizleme-ray" onLayout={onLayout} style={{ height: 36, justifyContent: 'center' }}>
                {/* Ray */}
                <View style={{ position: 'absolute', left: raySol, right: raySol, height: 4, borderRadius: 2, backgroundColor: renkler.sinir }} />
                {kapali ? (
                    <View style={{ alignSelf: 'center', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}>
                        <FontAwesome5 name="moon" size={15} color={renkler.metinIkincil} solid />
                    </View>
                ) : genislik > 0 ? (
                    <>
                        {/* "Şimdi" çizgisi */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                left: raySol - 1,
                                width: 2,
                                height: 30,
                                borderRadius: 1,
                                backgroundColor: renkler.birincil,
                                opacity: ilerleme.interpolate({ inputRange: [0, 0.03, 0.97, 1], outputRange: [0, 0.8, 0.8, 0] }),
                                transform: [{ translateX: ilerleme.interpolate({ inputRange: [0, 1], outputRange: [0, rayGenislik] }) }],
                            }}
                        />
                        {adimlar.map((a, i) => {
                            const p = konum(a.kalanDk);
                            const cap = CAP[Math.min(4, Math.max(1, a.seviye))];
                            const x = raySol + p * rayGenislik - cap / 2;
                            return (
                                <Animated.View
                                    key={`${a.kalanDk}-${i}`}
                                    testID={a.sesli ? 'duzey-onizleme-nokta-sesli' : 'duzey-onizleme-nokta'}
                                    style={{
                                        position: 'absolute',
                                        left: x,
                                        width: cap,
                                        height: cap,
                                        borderRadius: cap / 2,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: a.sesli ? renkler.birincil : renkler.kartArkaplan,
                                        borderWidth: 2,
                                        borderColor: renkler.birincil,
                                        transform: [
                                            {
                                                scale: ilerleme.interpolate({
                                                    inputRange: [p - 0.06, p, p + 0.1],
                                                    outputRange: [1, 1.7, 1],
                                                    extrapolate: 'clamp',
                                                }),
                                            },
                                        ],
                                    }}
                                />
                            );
                        })}
                    </>
                ) : null}
            </View>
            {/* Noktaların ALTINDA kısa etiketler, hepsi AYNI biçimde: kanal ikonu (zil / hoparlör)
                + "25 dk". Hiçbiri atlanmaz: binen etiket bir alt satıra kayar. */}
            {!kapali && genislik > 0 ? (
                <View style={{ height: Math.max(1, etiketSatiri) * ETIKET_SATIRI_DP + 2, marginTop: 4 }}>
                    {etiketler.map((e) => (
                        <View
                            key={`e-${e.kalanDk}-${e.sol}`}
                            testID="duzey-onizleme-etiket"
                            style={{
                                position: 'absolute',
                                left: e.sol,
                                top: e.satir * ETIKET_SATIRI_DP,
                                width: e.genislik,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FontAwesome5
                                name={e.sesli ? 'volume-up' : 'bell'}
                                size={9}
                                color={renkler.birincil}
                                solid
                                style={{ marginRight: 3 }}
                            />
                            <Text style={{ fontSize: 12, color: renkler.metin }} numberOfLines={1}>
                                {e.metin}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : null}
            {/* Kapalı düzey ya da yerleşim ölçülmeden (ilk kare): sabit metin satırı. */}
            {kapali || genislik === 0 ? (
                <View style={{ flexDirection: 'row', justifyContent: kapali ? 'center' : 'space-between', marginTop: 6 }}>
                    <Text style={{ fontSize: 12, color: renkler.metinIkincil }}>
                        {kapali ? 'Hatırlatma yok' : `${ilkDk} dk`}
                    </Text>
                    {!kapali ? <Text style={{ fontSize: 12, color: renkler.metinIkincil }}>{VAKIT_CIKAR_METNI}</Text> : null}
                </View>
            ) : null}
        </View>
    );
});
