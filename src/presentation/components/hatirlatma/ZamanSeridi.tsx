/**
 * ZAMAN SERIDI — muhafiz ayar ekraninin IMZA OGESI.
 *
 * Vaktin BUGUNKU penceresini yatay bir ray olarak cizer ve her hatirlatmanin
 * o pencerede nereye dustugunu gosterir:
 *   - CUBUK: bir adimin ILK tetigi. Yuksekligi SERTLIGI tasir (nazik kisa →
 *     acil uzun) — eskalasyon renkten degil BICIMDEN okunur (renk korlugu).
 *   - TIK: ayni adimin tekrari (gercek plan tetikleri, ozet degil).
 *   - BANT: ilk uyaridan son uyariya kapsama — yon farkini cubuklardan ONCE
 *     soyler (cikista saga yasli kisa bant, giriste pencereyi kaplayan bant).
 *   - IMLEC: yalniz vakit SU AN suruyorsa; gecmis uyarilar soluklasir.
 *
 * Veri `core/muhafiz/zamanSeridi.ts`'ten gelir, o da `pencerePlaniOlustur`'dan —
 * "Akisi onizle" ile AYNI dizi. Bu bilesen hicbir zamanlama karari vermez.
 *
 * ANIMASYON (yalniz YON degisince, dongu YOK): cubuklar coker, yeni yerlerinde
 * yeniden yukselir. KAYMA animasyonu BILINCLI olarak kullanilmadi: yon
 * degisiminde esikler gercekten YENIDEN KURULUR (`vaktinYonunuDegistir`), yani
 * cubuk bir yerden baska yere gitmez — yeni bir plan dogar. Kayma olmayan bir
 * surekliligi anlatirdi.
 *
 * Cekirdek `Animated` kullanilir (Reanimated DEGIL): bu bilesen
 * `MuhafizAyarlariSayfasi` testlerinde render edilir ve Reanimated jest'te global
 * mock'lu degil. `scaleY` + `transformOrigin` native driver ile calisir;
 * `height` animasyonuna gerek yoktur.
 *
 * Reduced motion: animasyon hic kurulmaz, son durum dogrudan cizilir. Statik
 * hal bilginin tamamini tasir.
 */
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Text, View, type LayoutChangeEvent } from 'react-native';
import { useRenkler } from '../../../core/theme';
import type { UyariPlani } from '../../../core/muhafiz/motorAdaptoru';
import type { PencereYonu } from '../../../core/muhafiz/pencereTipleri';
import {
    cubukKonumlariniYay,
    kalanDkAni,
    saatMetni,
    seritDuzeniHesapla,
    simdiOrani,
    type SeritDuzeni,
} from '../../../core/muhafiz/zamanSeridi';
import type { AdimBilgisi } from './pencereTanimi';

/** Cubuk yukseklikleri (dp), seviye 1..4. */
export const CUBUK_YUKSEKLIKLERI = [8, 13, 18, 24];
const CUBUK_GENISLIGI = 4;
const CUBUK_MIN_ARALIK = 7;
const CUBUK_ALANI = 28;
const BANT_YUKSEKLIGI = 6;
const TIK_YUKSEKLIGI = 6;
const ETIKET_SATIRI = 14;
/** Ilk-uyari etiketinin uc etiketlerle cakismamasi icin gereken bosluk. */
const ETIKET_GENISLIGI = 34;

const COKUS_MS = 120;
const YUKSELIS_MS = 220;
const KADEME_MS = 40;

export interface ZamanSeridiProps {
    plan: readonly UyariPlani[];
    pencereUzunluguDk: number;
    baslangic: Date;
    bitis: Date;
    yon: PencereYonu;
    adimBilgileri: AdimBilgisi[];
    /** Verilirse ve vakit suruyorsa imlec cizilir. */
    simdi?: Date;
    /** `false` → hic animasyon yok ("?" modalindaki statik kopyalar). */
    animasyonlu?: boolean;
    erisimEtiketi: string;
    testID?: string;
}

export const ZamanSeridi: React.FC<ZamanSeridiProps> = ({
    plan,
    pencereUzunluguDk,
    baslangic,
    bitis,
    yon,
    adimBilgileri,
    simdi,
    animasyonlu = true,
    erisimEtiketi,
    testID,
}) => {
    const renkler = useRenkler();
    const [genislik, setGenislik] = useState(0);

    const hedefDuzen = useMemo(
        () => seritDuzeniHesapla(plan, pencereUzunluguDk),
        [plan, pencereUzunluguDk]
    );

    // Gosterilen duzen, yon degisiminde cokus BITINCE hedefe gecer.
    const [gosterilen, setGosterilen] = useState<{ duzen: SeritDuzeni; yon: PencereYonu }>({
        duzen: hedefDuzen,
        yon,
    });

    const olcekler = useRef([0, 1, 2, 3].map(() => new Animated.Value(1))).current;
    const katman = useRef(new Animated.Value(1)).current;
    const hareketAzaltRef = useRef(false);
    const oncekiYonRef = useRef(yon);

    useEffect(() => {
        let iptal = false;
        AccessibilityInfo.isReduceMotionEnabled()
            .then((deger) => {
                if (!iptal) hareketAzaltRef.current = deger === true;
            })
            .catch(() => undefined);
        return () => {
            iptal = true;
        };
    }, []);

    useEffect(() => {
        const yonDegisti = oncekiYonRef.current !== yon;
        oncekiYonRef.current = yon;

        if (!yonDegisti || !animasyonlu || hareketAzaltRef.current) {
            // Esik/stepper degisimi ya da hareket azaltma: dogrudan yerlestir.
            olcekler.forEach((o) => o.setValue(1));
            katman.setValue(1);
            setGosterilen((onceki) =>
                onceki.duzen === hedefDuzen && onceki.yon === yon ? onceki : { duzen: hedefDuzen, yon }
            );
            return;
        }

        const cokus = Animated.parallel([
            ...olcekler.map((o) =>
                Animated.timing(o, {
                    toValue: 0.08,
                    duration: COKUS_MS,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                })
            ),
            Animated.timing(katman, { toValue: 0, duration: COKUS_MS, useNativeDriver: true }),
        ]);

        cokus.start(({ finished }) => {
            if (!finished) return;
            setGosterilen({ duzen: hedefDuzen, yon });
            Animated.parallel([
                ...olcekler.map((o, i) =>
                    Animated.timing(o, {
                        toValue: 1,
                        duration: YUKSELIS_MS,
                        delay: i * KADEME_MS,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    })
                ),
                Animated.timing(katman, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        });

        return () => cokus.stop();
    }, [hedefDuzen, yon, animasyonlu, olcekler, katman]);

    const { duzen } = gosterilen;
    const cubukPx = useMemo(
        () =>
            genislik > 0
                ? cubukKonumlariniYay(
                    duzen.cubuklar.map((c) => c.oran),
                    genislik,
                    CUBUK_MIN_ARALIK,
                    gosterilen.yon
                )
                : [],
        [duzen, genislik, gosterilen.yon]
    );

    const imlecOrani = simdi ? simdiOrani(baslangic, bitis, simdi) : null;
    const simdiDk = imlecOrani !== null ? imlecOrani * pencereUzunluguDk : null;
    const gecmisMi = (oran: number) => simdiDk !== null && oran * pencereUzunluguDk < simdiDk;

    const renkAl = (seviye: number) =>
        (adimBilgileri[seviye - 1] ?? adimBilgileri[0])?.renk ?? renkler.birincil;

    const onLayout = (e: LayoutChangeEvent) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w !== genislik) setGenislik(w);
    };

    // Ilk-uyari etiketi: uc etiketlerle cakisiyorsa HIC cizilmez (cumle soyler).
    const ilkCubuk = duzen.cubuklar[0];
    const ilkX = ilkCubuk !== undefined ? cubukPx[0] : undefined;
    const ilkEtiketGorunur =
        ilkX !== undefined &&
        ilkX > ETIKET_GENISLIGI * 1.2 &&
        ilkX < genislik - ETIKET_GENISLIGI * 1.2;

    return (
        <View
            testID={testID}
            accessible
            accessibilityRole="image"
            accessibilityLabel={erisimEtiketi}
            style={{ paddingTop: 8, paddingBottom: 4 }}
        >
            <View style={{ height: CUBUK_ALANI + 2 }} onLayout={onLayout}>
                {/* Ray */}
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 2,
                        borderRadius: 1,
                        backgroundColor: renkler.sinir,
                    }}
                />
                {/* Uc kapaklari: pencerenin giris ve cikisi */}
                {[0, 1].map((uc) => (
                    <View
                        key={`uc-${uc}`}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            [uc === 0 ? 'left' : 'right']: 0,
                            width: 2,
                            height: 6,
                            borderRadius: 1,
                            backgroundColor: renkler.sinir,
                        }}
                    />
                ))}

                {genislik > 0 && (
                    <>
                        {/* Kapsama bandi + tikler */}
                        <Animated.View
                            pointerEvents="none"
                            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, opacity: katman }}
                        >
                            {duzen.bant && (
                                <View
                                    testID="zaman-seridi-bant"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: duzen.bant.bas * genislik,
                                        width: Math.max(
                                            BANT_YUKSEKLIGI,
                                            (duzen.bant.son - duzen.bant.bas) * genislik
                                        ),
                                        height: BANT_YUKSEKLIGI,
                                        borderRadius: BANT_YUKSEKLIGI / 2,
                                        backgroundColor: `${renkler.birincil}1F`,
                                    }}
                                />
                            )}
                            {duzen.tikler.map((t, i) => (
                                <View
                                    key={`tik-${i}`}
                                    testID="zaman-seridi-tik"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: t.oran * genislik - 1,
                                        width: 2,
                                        height: TIK_YUKSEKLIGI,
                                        borderRadius: 1,
                                        backgroundColor: renkAl(t.seviye),
                                        opacity: gecmisMi(t.oran) ? 0.2 : 0.55,
                                    }}
                                />
                            ))}
                        </Animated.View>

                        {/* Ilk-tetik cubuklari */}
                        {duzen.cubuklar.map((c, i) => (
                            <Animated.View
                                key={`cubuk-${c.seviye}`}
                                testID="zaman-seridi-cubuk"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: (cubukPx[i] ?? 0) - CUBUK_GENISLIGI / 2,
                                    width: CUBUK_GENISLIGI,
                                    height: CUBUK_YUKSEKLIKLERI[c.seviye - 1] ?? CUBUK_YUKSEKLIKLERI[0],
                                    borderRadius: 2,
                                    backgroundColor: renkAl(c.seviye),
                                    opacity: gecmisMi(c.oran) ? 0.35 : 1,
                                    transformOrigin: 'bottom',
                                    transform: [{ scaleY: olcekler[i] ?? 1 }],
                                }}
                            />
                        ))}

                        {/* Simdi imleci — yalniz vakit suruyorsa */}
                        {imlecOrani !== null && (
                            <View
                                testID="zaman-seridi-imlec"
                                pointerEvents="none"
                                style={{
                                    position: 'absolute',
                                    bottom: -4,
                                    left: imlecOrani * genislik - 0.75,
                                    width: 1.5,
                                    height: CUBUK_ALANI + 6,
                                    backgroundColor: renkler.metin,
                                    opacity: 0.7,
                                }}
                            >
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: -2,
                                        left: -2,
                                        width: 5,
                                        height: 5,
                                        borderRadius: 2.5,
                                        backgroundColor: renkler.metin,
                                    }}
                                />
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* Saat etiketleri: iki uc sabit + ilk uyari (cakismiyorsa) */}
            <View style={{ height: ETIKET_SATIRI, marginTop: 3 }}>
                <Text
                    style={{ position: 'absolute', left: 0, fontSize: 10, lineHeight: 14, color: renkler.metinIkincil, fontVariant: ['tabular-nums'] }}
                >
                    {saatMetni(baslangic)}
                </Text>
                {ilkEtiketGorunur && ilkCubuk && ilkX !== undefined && (
                    <Text
                        testID="zaman-seridi-ilk-saat"
                        style={{
                            position: 'absolute',
                            left: ilkX - ETIKET_GENISLIGI / 2,
                            width: ETIKET_GENISLIGI,
                            textAlign: 'center',
                            fontSize: 10,
                            lineHeight: 14,
                            color: renkler.metin,
                            fontVariant: ['tabular-nums'],
                        }}
                    >
                        {saatMetni(kalanDkAni(bitis, ilkCubuk.kalanDk))}
                    </Text>
                )}
                <Text
                    style={{ position: 'absolute', right: 0, fontSize: 10, lineHeight: 14, color: renkler.metinIkincil, fontVariant: ['tabular-nums'] }}
                >
                    {saatMetni(bitis)}
                </Text>
            </View>
        </View>
    );
};
