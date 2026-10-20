/**
 * ADIM RAYI — hatırlatma listesinin zaman çizelgesi görünümü.
 *
 * Adımlar artık "1. hatırlatma, 2. hatırlatma" diye numaralanmaz: kronolojik dikey bir
 * rayın üstünde birer DÜĞÜMDÜR. Düğümün rengi adımın tonudur (ad yazılmaz), içi dolu
 * düğüm açık, boş halka kapalı adımdır; sıra rayın kendisinden okunur. Sıra numarası
 * ekran okuyucu etiketinde kalır.
 *
 * HAREKET (yalnız olayla; boşta sıfır):
 *  - Giriş: yeni eklenen satır ya da akordiyon açılınca satırlar 40 ms arayla yukarıdan
 *    süzülerek gelir (opaklık + kayma, 240 ms).
 *  - Çıkış: silinen satırın görsel HAYALETİ sola kayıp söner, sonra kendini düşürür. Veri
 *    beklemez — hayalet erişilebilirlik ağacında yoktur, dokunulmaz.
 *  - Aç/kapa: içerik 1 ↔ 0.65 opaklığa yumuşakça geçer, düğüm bir kez yaylanır.
 *  `LayoutAnimation` KULLANILMAZ; hepsi `transform`/`opacity` + native driver. "Animasyonları
 *  azalt" açıksa son kare doğrudan çizilir.
 */
import * as React from 'react';
import { Animated, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { useYayVurgu } from '../hareket/hareketler';
import { EGRI } from '../hareket/sureler';

/** Kademeli giriş aralığı — satırlar bir cümle gibi sırayla gelir. */
export const RAY_KADEME_MS = 40;
const GIRIS_MS = 240;
const CIKIS_MS = 220;
/** Silme modaldan gelir: kapanan sheet'in arkasında oynamasın diye kısa bekleme. */
const CIKIS_GECIKMESI_MS = 160;
const SOLUK = 0.65;

const RAY_GENISLIGI = 24;
/** Kart başlık satırının merkezine hizalı düğüm (p-3 + başlık satırı). */
const UST_SEGMENT = 16;
const DUGUM = 14;
const CIZGI = 2;

export interface RaySatiriProps {
    /** İlk satır: düğümün üstünde çizgi yok. */
    ilk: boolean;
    /** Son satır: düğümün altında çizgi yok (ardından ekle düğmesi gelecekse `false` verin). */
    son: boolean;
    /** Ton rengi (dekoratif). */
    renk: string;
    acik: boolean;
    /** Verilirse satır doğduğunda bu gecikmeyle süzülerek gelir. */
    girisGecikmesiMs?: number | null;
    /** Çıkış hayaleti: verilirse satır söner ve bitince çağrılır. */
    onCikti?: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const RaySatiri: React.FC<RaySatiriProps> = ({ ilk, son, renk, acik, girisGecikmesiMs, onCikti, children, style }) => {
    const renkler = useRenkler();
    const azalt = useHareketAzalt();
    const cikiyor = !!onCikti;
    const girecek = girisGecikmesiMs != null && !azalt;
    const ilerleme = React.useRef(new Animated.Value(girecek ? 0 : 1)).current;
    const soluk = React.useRef(new Animated.Value(acik ? 1 : SOLUK)).current;
    const dugumOlcek = useYayVurgu(acik);
    const cikti = React.useRef(onCikti);
    cikti.current = onCikti;

    // Giriş / çıkış — yalnız doğuşta bir kez.
    React.useEffect(() => {
        if (cikiyor) {
            if (azalt) {
                cikti.current?.();
                return;
            }
            const a = Animated.timing(ilerleme, {
                toValue: 0,
                duration: CIKIS_MS,
                delay: CIKIS_GECIKMESI_MS,
                easing: EGRI.cikis,
                useNativeDriver: true,
            });
            a.start(({ finished }) => {
                if (finished) cikti.current?.();
            });
            return () => a.stop();
        }
        if (!girecek) return;
        const a = Animated.timing(ilerleme, {
            toValue: 1,
            duration: GIRIS_MS,
            delay: girisGecikmesiMs ?? 0,
            easing: EGRI.giris,
            useNativeDriver: true,
        });
        a.start();
        return () => a.stop();
        // Yalnız doğuşta: sonraki çizimler sahneyi yeniden başlatmaz.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Aç/kapa: içerik soluklaşır/canlanır.
    const ilkAcik = React.useRef(true);
    React.useEffect(() => {
        if (ilkAcik.current) {
            ilkAcik.current = false;
            return;
        }
        if (azalt) {
            soluk.setValue(acik ? 1 : SOLUK);
            return;
        }
        Animated.timing(soluk, { toValue: acik ? 1 : SOLUK, duration: 150, useNativeDriver: true }).start();
    }, [acik, azalt, soluk]);

    const kayma = ilerleme.interpolate({ inputRange: [0, 1], outputRange: cikiyor ? [-20, 0] : [-8, 0] });
    const cizgiRengi = renkler.sinir;

    return (
        <Animated.View
            style={[
                { flexDirection: 'row', opacity: ilerleme },
                cikiyor ? { transform: [{ translateX: kayma }] } : { transform: [{ translateY: kayma }] },
                style,
            ]}
            pointerEvents={cikiyor ? 'none' : 'auto'}
            importantForAccessibility={cikiyor ? 'no-hide-descendants' : 'auto'}
            accessibilityElementsHidden={cikiyor}
        >
            {/* Ray sütunu: üst çizgi → düğüm → alt çizgi (alttaki satır boşluğunu da geçer) */}
            <View
                style={{ width: RAY_GENISLIGI, alignItems: 'center' }}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
            >
                <View style={{ width: CIZGI, height: UST_SEGMENT, backgroundColor: ilk ? 'transparent' : cizgiRengi }} />
                <Animated.View
                    style={{
                        width: DUGUM,
                        height: DUGUM,
                        borderRadius: DUGUM / 2,
                        backgroundColor: acik ? renk : renkler.kartArkaplan,
                        borderWidth: acik ? 3 : 2,
                        borderColor: acik ? `${renk}40` : renkler.sinir,
                        transform: [{ scale: dugumOlcek }],
                    }}
                />
                <View style={{ width: CIZGI, flex: 1, backgroundColor: son ? 'transparent' : cizgiRengi }} />
            </View>
            <Animated.View style={{ flex: 1, paddingBottom: 8, opacity: soluk }}>{children}</Animated.View>
        </Animated.View>
    );
};

/** Rayın sonundaki "ekle" düğümü — kesikli halka + artı; düğmenin kendisi `children`. */
export const RayEkleSatiri: React.FC<{ ilk: boolean; children: React.ReactNode }> = ({ ilk, children }) => {
    const renkler = useRenkler();
    return (
        <View style={{ flexDirection: 'row' }}>
            <View
                style={{ width: RAY_GENISLIGI, alignItems: 'center' }}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
            >
                <View style={{ width: CIZGI, height: 15, backgroundColor: ilk ? 'transparent' : renkler.sinir }} />
                <View
                    className="items-center justify-center"
                    style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        borderWidth: 1.5,
                        borderStyle: 'dashed',
                        borderColor: renkler.birincil,
                        backgroundColor: renkler.kartArkaplan,
                    }}
                >
                    <FontAwesome5 name="plus" size={8} color={renkler.birincil} />
                </View>
            </View>
            <View style={{ flex: 1, paddingBottom: 8 }}>{children}</View>
        </View>
    );
};
