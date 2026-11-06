/**
 * "Geri al" bandı — şaşırtabilecek ama geri alınabilir eylemler için (onay modalı DEĞİL).
 *
 * Kullanım (çağıranın React ağacında olması gerekmez; host `App.tsx` kökünde BİR kez):
 *   geriAlBandiGoster({ mesaj: 'Hatırlatma silindi', geriAl: () => eskiyiYaz(yedek) });
 *
 * Kurallar (plan §7.4): ekranın altında, sekme çubuğunun üstünde hap; 6 sn; ekran
 * okuyucuya duyurulur; "Geri al" dokunma hedefi ≥ 44 dp; AYNI ANDA TEK bant — yeni
 * çağrı öncekinin yerine geçer (önceki geri alınamaz hâle gelir, eylemi zaten yapılmıştır).
 * Geri al = önceki durumu BİREBİR geri yaz (çağıranın sorumluluğu). Geri alınamayan
 * işlemde bant yerine önizleme + onay kullanın.
 *
 * RN `<Modal>` ayrı bir pencerede çizilir; kökteki host onun ALTINDA kalır ve bant
 * görünmez. Modal içinden çağrılacaksa modalın ağacına yerel bir host koyun:
 *   <Modal …>…<GeriAlBandiKatmani altBosluk={24} /></Modal>
 * Hostlar YIĞIN olarak tutulur: istek yalnız EN SON bağlanan hosta gider (modal açıkken
 * modalınki, kapanınca kökünki); diğerleri bandını kapatır → ekranda daima tek bant.
 *
 * Erişilebilirlik: bant `announceForAccessibility` ile BİR KEZ duyurulur; canlı bölge
 * (`accessibilityLiveRegion`) bilinçli olarak YOK — Android ikisini birden okurdu.
 */
import * as React from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { EGRI, SURE } from '../hareket/sureler';
import { bicim, metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

export const GERI_AL_SURESI_MS = 6000;

export interface GeriAlIstegi {
    mesaj: string;
    geriAl: () => void | Promise<unknown>;
    ikon?: string;
    /** Varsayılan 6 sn. */
    sureMs?: number;
}

type Dinleyici = (istek: GeriAlIstegi | null) => void;
/** Bağlanma sırasıyla hostlar; sonuncusu (en üstteki pencere) istekleri alır. */
const dinleyiciler: Dinleyici[] = [];

export function geriAlBandiGoster(istek: GeriAlIstegi): void {
    const ust = dinleyiciler[dinleyiciler.length - 1];
    dinleyiciler.forEach((d) => d(d === ust ? istek : null));
}

/** Bandı hemen kapatır (ör. ekran değişti, işlem artık geri alınamaz). */
export function geriAlBandiniKapat(): void {
    dinleyiciler.forEach((d) => d(null));
}

export interface GeriAlBandiKatmaniProps {
    /** Alttan boşluk (dp). Kök: sekme çubuğunun üstü (104); modal içinde daha az. */
    altBosluk?: number;
}

export const GeriAlBandiKatmani: React.FC<GeriAlBandiKatmaniProps> = ({ altBosluk = 104 }) => {
    const renkler = useRenkler();
    const m = useMetin().genel.ortak;
    const azalt = useHareketAzalt();
    const [istek, setIstek] = React.useState<GeriAlIstegi | null>(null);
    const gorunum = React.useRef(new Animated.Value(0)).current;
    const zamanlayici = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    // `azalt` ref ile okunur: etkiye bağımlılık olsaydı, bant açıkken "Animasyonları azalt"
    // değişince temizlik zamanlayıcıyı siler ve bant hiç kendiliğinden kapanmazdı.
    const azaltRef = React.useRef(azalt);
    azaltRef.current = azalt;

    React.useEffect(() => {
        const dinleyici: Dinleyici = (yeni) => {
            if (zamanlayici.current) clearTimeout(zamanlayici.current);
            if (!yeni) {
                setIstek(null);
                gorunum.setValue(0);
                return;
            }
            setIstek(yeni);
            AccessibilityInfo.announceForAccessibility?.(bicim(metin().genel.ortak.geriAlDuyuru, { mesaj: yeni.mesaj }));
            if (azaltRef.current) gorunum.setValue(1);
            else {
                gorunum.setValue(0);
                Animated.timing(gorunum, { toValue: 1, duration: SURE.giris, easing: EGRI.giris, useNativeDriver: true }).start();
            }
            zamanlayici.current = setTimeout(() => setIstek(null), yeni.sureMs ?? GERI_AL_SURESI_MS);
        };
        dinleyiciler.push(dinleyici);
        return () => {
            const i = dinleyiciler.indexOf(dinleyici);
            if (i >= 0) dinleyiciler.splice(i, 1);
            if (zamanlayici.current) clearTimeout(zamanlayici.current);
        };
    }, [gorunum]);

    if (!istek) return null;

    const geriAl = () => {
        if (zamanlayici.current) clearTimeout(zamanlayici.current);
        const yapilacak = istek.geriAl;
        setIstek(null);
        void Promise.resolve()
            .then(yapilacak)
            .then(() => AccessibilityInfo.announceForAccessibility?.(metin().genel.ortak.geriAlindi))
            .catch(() => undefined);
    };

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[
                styles.kap,
                {
                    bottom: altBosluk,
                    opacity: gorunum,
                    transform: [{ translateY: gorunum.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
                },
            ]}
        >
            <View testID="geri-al-bandi" style={[styles.hap, { backgroundColor: renkler.metin }]}>
                <FontAwesome5 name={istek.ikon ?? 'undo'} size={13} color={renkler.arkaplan} style={{ marginRight: 10 }} />
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: renkler.arkaplan }}>{istek.mesaj}</Text>
                <TouchableOpacity
                    onPress={geriAl}
                    accessibilityRole="button"
                    accessibilityLabel={m.geriAl}
                    style={{ minHeight: 44, minWidth: 44, paddingHorizontal: 12, justifyContent: 'center' }}
                >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: renkler.arkaplan, textDecorationLine: 'underline' }}>{m.geriAl}</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    kap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
    hap: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        maxWidth: 480,
        borderRadius: 20,
        paddingLeft: 16,
        paddingRight: 4,
        minHeight: 52,
    },
});
