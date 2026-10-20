/**
 * Telefon → TV konum aktarma sahnesi (Televizyonda gösterin sayfasının imza öğesi).
 *
 * Fiil "gönder", metafor konum iğnesinin kendisi: iğne telefondan kalkar, istek sürerken
 * yerinde süzülür (dürüst bekleme; döngü yalnız istek sürerken çalışır ve onunla biter),
 * başarıda yay çizerek TV'ye uçar, konunca TV ekranı dolar ve köşede ✓ belirir. Hatada iğne
 * telefona geri düşer, aradaki köprü kırmızı düz çizgiye döner (flatline).
 *
 * Boşta SIFIR hareket. Yalnız transform/opacity, native sürücü. Hareketi azalt → son kare.
 */
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';

export type SahneDurumu = 'hazir' | 'gonderiliyor' | 'tamam' | 'hata';

const YUKSEKLIK = 190;
const TEL_G = 56;
const TEL_Y = 100;
const TV_G = 132;
const TV_Y = 80;
const IGNE = 30;

interface Props {
    durum: SahneDurumu;
    hareketAzalt: boolean;
}

export const TelevizyonSahnesi: React.FC<Props> = ({ durum, hareketAzalt }) => {
    const renkler = useRenkler();
    const [genislik, setGenislik] = useState(0);
    const x = useRef(new Animated.Value(0)).current;
    const y = useRef(new Animated.Value(0)).current;
    const egim = useRef(new Animated.Value(0)).current;
    const dolgu = useRef(new Animated.Value(0)).current;
    const onay = useRef(new Animated.Value(0)).current;
    const dongu = useRef<Animated.CompositeAnimation | null>(null);

    // Yerleşim (genişliğe göre): telefon solda, TV sağda.
    const telX = genislik * 0.2 - TEL_G / 2;
    const telUst = (YUKSEKLIK - TEL_Y) / 2 + 6;
    const tvX = genislik * 0.74 - TV_G / 2;
    const tvUst = (YUKSEKLIK - TV_Y) / 2 - 8;
    const igneBasX = telX + TEL_G / 2 - IGNE / 2;
    const igneBasY = telUst + TEL_Y / 2 - IGNE / 2 - 6;
    const dx = tvX + TV_G / 2 - IGNE / 2 - igneBasX;
    const dy = tvUst + TV_Y / 2 - IGNE / 2 - igneBasY;

    useEffect(() => {
        if (genislik === 0) return;
        dongu.current?.stop();
        dongu.current = null;
        const yerel = (deger: Animated.Value, hedef: number) => deger.setValue(hedef);

        if (durum === 'hazir') {
            [x, y, egim, dolgu, onay].forEach((d) => yerel(d, 0));
            return;
        }
        if (hareketAzalt) {
            yerel(x, durum === 'tamam' ? dx : 0);
            yerel(y, durum === 'tamam' ? dy : durum === 'gonderiliyor' ? -24 : 0);
            yerel(egim, 0);
            yerel(dolgu, durum === 'tamam' ? 1 : 0);
            yerel(onay, durum === 'tamam' ? 1 : 0);
            return;
        }
        if (durum === 'gonderiliyor') {
            dolgu.setValue(0);
            onay.setValue(0);
            x.setValue(0);
            // Kalkış, sonra istek sürdükçe süzülme.
            const a = Animated.sequence([
                Animated.spring(y, { toValue: -24, useNativeDriver: true, friction: 5, tension: 90 }),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(y, { toValue: -31, duration: 620, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                        Animated.timing(y, { toValue: -24, duration: 620, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                    ]),
                ),
            ]);
            dongu.current = a;
            a.start();
            return;
        }
        if (durum === 'tamam') {
            const ust = Math.min(dy, 0) - 64;
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(x, { toValue: dx, duration: 680, easing: Easing.linear, useNativeDriver: true }),
                    Animated.sequence([
                        Animated.timing(y, { toValue: ust, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                        Animated.timing(y, { toValue: dy, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(egim, { toValue: 1, duration: 300, useNativeDriver: true }),
                        Animated.timing(egim, { toValue: 0, duration: 380, useNativeDriver: true }),
                    ]),
                ]),
                Animated.parallel([
                    Animated.timing(dolgu, { toValue: 1, duration: 260, useNativeDriver: true }),
                    Animated.spring(onay, { toValue: 1, useNativeDriver: true, friction: 4, tension: 120 }),
                ]),
            ]).start();
            return;
        }
        // hata: iğne telefona geri düşer, sekerek oturur.
        Animated.parallel([
            Animated.timing(x, { toValue: 0, duration: 260, useNativeDriver: true }),
            Animated.timing(y, { toValue: 0, duration: 520, easing: Easing.bounce, useNativeDriver: true }),
            Animated.timing(egim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
    }, [durum, genislik, hareketAzalt, dx, dy, x, y, egim, dolgu, onay]);

    useEffect(() => () => dongu.current?.stop(), []);

    const hata = durum === 'hata';
    const kopruRengi = hata ? renkler.hata : renkler.birincil;
    const kopru =
        genislik === 0
            ? ''
            : hata
              ? `M ${telX + TEL_G + 8} ${telUst + TEL_Y / 2} L ${tvX - 8} ${telUst + TEL_Y / 2}`
              : `M ${telX + TEL_G / 2} ${telUst - 6} Q ${(telX + tvX + TV_G) / 2} ${tvUst - 70} ${tvX + TV_G / 2} ${tvUst - 6}`;

    const donme = egim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '10deg'] });

    return (
        <View
            onLayout={(e: LayoutChangeEvent) => setGenislik(e.nativeEvent.layout.width)}
            style={{ height: YUKSEKLIK }}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
        >
            {genislik > 0 ? (
                <>
                    <Svg width={genislik} height={YUKSEKLIK} style={{ position: 'absolute' }}>
                        <Path
                            d={kopru}
                            stroke={kopruRengi}
                            strokeOpacity={hata ? 0.9 : 0.45}
                            strokeWidth={2}
                            strokeDasharray={hata ? '2 7' : '4 8'}
                            strokeLinecap="round"
                            fill="none"
                        />
                        {/* Telefon */}
                        <Rect x={telX} y={telUst} width={TEL_G} height={TEL_Y} rx={12} fill={renkler.arkaplan} stroke={renkler.metinIkincil} strokeWidth={2} />
                        <Rect x={telX + TEL_G / 2 - 9} y={telUst + TEL_Y - 11} width={18} height={3} rx={1.5} fill={renkler.metinIkincil} />
                        {/* TV */}
                        <Rect x={tvX} y={tvUst} width={TV_G} height={TV_Y} rx={10} fill={renkler.arkaplan} stroke={renkler.metinIkincil} strokeWidth={2} />
                        <Path
                            d={`M ${tvX + TV_G / 2 - 22} ${tvUst + TV_Y + 16} L ${tvX + TV_G / 2 + 22} ${tvUst + TV_Y + 16} M ${tvX + TV_G / 2} ${tvUst + TV_Y + 2} L ${tvX + TV_G / 2} ${tvUst + TV_Y + 16}`}
                            stroke={renkler.metinIkincil}
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                    </Svg>
                    {/* TV ekranı dolar (başarı) */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: tvX + 5,
                            top: tvUst + 5,
                            width: TV_G - 10,
                            height: TV_Y - 10,
                            borderRadius: 6,
                            backgroundColor: renkler.birincil + '33',
                            opacity: dolgu,
                        }}
                    />
                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: tvX + TV_G - 20,
                            top: tvUst - 12,
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: renkler.birincil,
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: [{ scale: onay }],
                        }}
                    >
                        <FontAwesome5 name="check" size={14} color="#FFFFFF" />
                    </Animated.View>
                    {/* Konum iğnesi */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: igneBasX,
                            top: igneBasY,
                            width: IGNE,
                            height: IGNE,
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: [{ translateX: x }, { translateY: y }, { rotate: donme }],
                        }}
                    >
                        <FontAwesome5 name="map-marker-alt" size={26} color={hata ? renkler.hata : renkler.birincil} />
                    </Animated.View>
                </>
            ) : null}
        </View>
    );
};
