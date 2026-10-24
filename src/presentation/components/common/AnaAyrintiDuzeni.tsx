/**
 * Ana-ayrıntı (master-detail) düzeni — tablet / iPad geniş pencerede Ayarlar ve Kaza.
 *
 * Yığının `screenLayout`'u olarak verilir. Geniş pencerede (`anaAyrintiMi`) her ekran
 * solda liste (yığının kök sayfası, 340 dp) + ince ayırıcı + sağda sayfa olarak çizilir:
 * - Kök rotadayken sağda `varsayilan` sayfa açıktır (boş "bir şey seçin" ekranı yok).
 * - Listeden seçim yığını köke indirip (`popTo`) yeni sayfayı açar → derinlik 2'yi
 *   geçmez; sayfanın kendi alt sayfaları (ör. Hatırlatmalar → Vakit çıkmadan) normal
 *   yığın gibi açılır ve sağ başlıkta geri oku çıkar.
 * - Native başlık gizlenir (çağıran `headerShown: false` verir); başlık yalnız ayrıntının
 *   üstünde, zemin renginde büyük başlık olarak çizilir (yarım genişlikte yeşil şerit
 *   listeyle kopuk duruyordu). Açık ayrıntının satırı listede seçili görünür.
 * Telefonda ve dar pencerede (Split View) davranış birebir eskisidir: okunabilir sütun.
 */
import * as React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { useRenkler } from '../../../core/theme';
import { anaAyrintiMi } from '../../../core/utils/ekranSinifi';
import { OkunabilirGenislik } from './OkunabilirGenislik';
import { AnaAyrintiSecimi } from './anaAyrintiSecimi';
import { useMetin } from '../../hooks/useMetin';

export { useAnaAyrintiSecimi } from './anaAyrintiSecimi';

export const ANA_LISTE_GENISLIGI_DP = 340;

/** Ekranın ihtiyaç duyduğu gezinme yüzeyi (native-stack navigation'ın alt kümesi). */
interface YiginGezinmesi {
    navigate: (...args: never[]) => void;
    popTo?: (ad: string) => void;
    goBack: () => void;
    getState: () => { index: number; routes: Array<{ name: string }> };
}

export interface AnaAyrintiTanimi {
    /** Yığının kök rotası (liste). */
    anaRota: string;
    /** Liste bileşeni (kök rotanın bileşeni). */
    Ana: React.ComponentType;
    /** Kök rotadayken sağda açık duran sayfa. */
    Varsayilan: React.ComponentType;
    /** Varsayılan sayfanın rota adı (liste satırı seçili görünsün). */
    varsayilanRota: string;
    /** Etkin dilde okunsun diye çağıran getter verebilir (çerçeve dile abonedir). */
    varsayilanBaslik: string;
    /** Rota → ayrıntı başlığı. */
    basliklar: Record<string, string | undefined>;
}

/** Listeden yapılan seçim yığını önce köke indirir: ayrıntı derinliği büyümez. */
function listeGezinmesi<T extends YiginGezinmesi>(nav: T, anaRota: string): T {
    const sar = Object.create(nav) as T & { navigate: (...a: unknown[]) => void };
    sar.navigate = (...args: unknown[]) => {
        const durum = nav.getState();
        if (durum.routes[durum.index]?.name !== anaRota) nav.popTo?.(anaRota);
        (nav.navigate as (...a: unknown[]) => void)(...args);
    };
    return sar;
}

const AyrintiBasligi: React.FC<{ baslik?: string; geri?: () => void }> = ({ baslik, geri }) => {
    const renkler = useRenkler();
    const insets = useSafeAreaInsets();
    const m = useMetin().genel.ortak;
    return (
        <View
            style={[
                stil.baslik,
                { paddingTop: insets.top, height: 60 + insets.top, backgroundColor: renkler.arkaplan, borderBottomColor: renkler.sinir },
            ]}
        >
            {geri ? (
                <Pressable
                    onPress={geri}
                    accessibilityRole="button"
                    accessibilityLabel={m.geri}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={stil.geri}
                >
                    <FontAwesome5 name="chevron-left" size={18} color={renkler.birincil} />
                </Pressable>
            ) : (
                <View style={stil.geriBosluk} />
            )}
            {baslik ? (
                <Text style={[stil.baslikMetni, { color: renkler.metin }]} numberOfLines={1} accessibilityRole="header">
                    {baslik}
                </Text>
            ) : null}
        </View>
    );
};

interface CerceveProps {
    tanim: AnaAyrintiTanimi;
    route: { name: string };
    navigation: YiginGezinmesi;
    /** Ayrıntı native başlığı kendisi çiziyorsa (ör. içe aktarma sihirbazı) `true`. */
    kendiBasligi?: boolean;
    children: React.ReactElement;
}

const AnaAyrintiCercevesi: React.FC<CerceveProps> = ({ tanim, route, navigation, kendiBasligi, children }) => {
    const { width } = useWindowDimensions();
    const renkler = useRenkler();
    // Dile abone: başlıklar (`varsayilanBaslik` getter'ı, `basliklar` canlı görünümü) dil değişince tazelensin.
    useMetin();
    const listeNav = React.useMemo(() => listeGezinmesi(navigation, tanim.anaRota), [navigation, tanim.anaRota]);

    if (!anaAyrintiMi(width)) return <OkunabilirGenislik>{children}</OkunabilirGenislik>;

    const kokteMi = route.name === tanim.anaRota;
    const { Ana, Varsayilan } = tanim;
    const durum = navigation.getState();
    const derinlik = durum.index;
    const secili = kokteMi ? tanim.varsayilanRota : (durum.routes[1]?.name ?? route.name);
    return (
        <View testID="ana-ayrinti" style={[stil.kok, { backgroundColor: renkler.arkaplan }]}>
            <View testID="ana-ayrinti-liste" style={[stil.liste, { borderRightColor: renkler.sinir }]}>
                <AnaAyrintiSecimi.Provider value={secili}>
                    {kokteMi ? (
                        children
                    ) : (
                        <NavigationContext.Provider value={listeNav as never}>
                            <Ana />
                        </NavigationContext.Provider>
                    )}
                </AnaAyrintiSecimi.Provider>
            </View>
            <View testID="ana-ayrinti-sayfa" style={stil.sayfa}>
                {kendiBasligi ? null : (
                    <AyrintiBasligi
                        baslik={kokteMi ? tanim.varsayilanBaslik : tanim.basliklar[route.name]}
                        geri={!kokteMi && derinlik >= 2 ? navigation.goBack : undefined}
                    />
                )}
                <View style={stil.sayfaIcerik}>{kokteMi ? <Varsayilan /> : children}</View>
            </View>
        </View>
    );
};

/**
 * `screenLayout` üretir (referansı sabit kalsın diye modül düzeyinde bir kez çağrılır).
 * @param kendiBasligiOlanlar Native başlığı zaten gizli ve kendi üst çubuğunu çizen rotalar.
 */
export function anaAyrintiYerlesimiOlustur(tanim: AnaAyrintiTanimi, kendiBasligiOlanlar: readonly string[] = []) {
    const Yerlesim = ({
        route,
        navigation,
        children,
    }: {
        route: { name: string };
        navigation: unknown;
        children: React.ReactElement;
    }) => (
        <AnaAyrintiCercevesi
            tanim={tanim}
            route={route}
            navigation={navigation as YiginGezinmesi}
            kendiBasligi={kendiBasligiOlanlar.includes(route.name)}
        >
            {children}
        </AnaAyrintiCercevesi>
    );
    return Yerlesim;
}

const stil = StyleSheet.create({
    kok: { flex: 1, flexDirection: 'row' },
    liste: { width: ANA_LISTE_GENISLIGI_DP, borderRightWidth: StyleSheet.hairlineWidth },
    sayfa: { flex: 1 },
    sayfaIcerik: { flex: 1 },
    baslik: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
    geri: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    geriBosluk: { width: 12 },
    baslikMetni: { flex: 1, fontSize: 22, fontWeight: '700', marginLeft: 4 },
});
