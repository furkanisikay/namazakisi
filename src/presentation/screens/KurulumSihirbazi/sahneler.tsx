/**
 * Kurulum sihirbazının canlı resimleri (görsel anlatı) — her adımın kendi sahnesi.
 *
 * Sahip kararı (2026-10-19): adım sayısı azaldı ama anlatım kalmalı. Sahneler ekran
 * GÖRÜNÜRKEN yumuşak döngüyle oynar (`useDonguAcik`: odak + ön plan + "Animasyonları
 * azalt" kapalı); kapı düşünce durur ve DİNLENME POZUNA döner. Dinlenme pozu resmin
 * eksiksiz hâlidir (halka ölçek 1, zil 0°, bildirim kartı yerinde) — azaltılmış
 * harekette de anlatım kaybolmaz. Hepsi dekoratif (ekran okuyucudan gizli; aynı bilgi
 * başlık ve maddelerde yazılı), yalnız transform/opaklık + native driver, renkler tema.
 *
 *  - Hoş geldiniz: cami, iki halka sırayla nefes alır.
 *  - Konum: harita üstünde iğne düşer, yere değince halka yayılır; konum alınınca ✓.
 *  - Bildirim: zil sallanır, üstten bir bildirim kartı iner; izin verilince ✓.
 *  - Hatırlatma düzeyi: `DuzeyOnizlemesi` (seçime göre değişen canlı zaman rayı).
 *  - Hazır: ✓ + bir kez saçılan kutlama noktaları (tek seferlik).
 */
import * as React from 'react';
import { Animated, Easing, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { BasariIsareti, useDonguAcik, useDonguAnimasyonu } from '../../components/hareket';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';

const SAHNE = 150;

/** Ortak çerçeve: sahne alanı, ekran okuyucudan gizli. */
const Cerceve: React.FC<{ children: React.ReactNode; testID?: string }> = ({ children, testID }) => (
    <View
        testID={testID}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={{ alignSelf: 'center', width: SAHNE, height: SAHNE, marginTop: 4, marginBottom: 16, alignItems: 'center', justifyContent: 'center' }}
    >
        {children}
    </View>
);

/** Köşedeki küçük rozet (✓ ya da yardımcı ikon). */
const Rozet: React.FC<{ ikon: string; renk: string }> = ({ ikon, renk }) => {
    const renkler = useRenkler();
    return (
        <View
            style={{
                position: 'absolute',
                right: 14,
                bottom: 14,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: renkler.kartArkaplan,
                borderWidth: 2,
                borderColor: renk + '50',
            }}
        >
            <FontAwesome5 name={ikon} size={16} color={renk} solid />
        </View>
    );
};

// ─── 1. Hoş geldiniz ─────────────────────────────────────────────────────────

export const HosgeldinizSahnesi: React.FC = () => {
    const renkler = useRenkler();
    const acik = useDonguAcik();
    const ic = React.useRef(new Animated.Value(1)).current;
    const dis = React.useRef(new Animated.Value(1)).current;
    useDonguAnimasyonu(
        acik,
        () =>
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(ic, { toValue: 1.12, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                    Animated.timing(ic, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.delay(400),
                    Animated.timing(dis, { toValue: 1.2, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                    Animated.timing(dis, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                ]),
            ]),
        () => {
            ic.setValue(1);
            dis.setValue(1);
        },
    );
    return (
        <Cerceve testID="sahne-hosgeldiniz">
            <Animated.View style={{ position: 'absolute', width: 146, height: 146, borderRadius: 73, backgroundColor: renkler.birincil + '12', transform: [{ scale: dis }] }} />
            <Animated.View style={{ position: 'absolute', width: 118, height: 118, borderRadius: 59, backgroundColor: renkler.birincil + '22', transform: [{ scale: ic }] }} />
            <View style={{ width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: renkler.birincil }}>
                <FontAwesome5 name="mosque" size={40} color={renkler.birincilMetin} solid />
            </View>
            <Rozet ikon="moon" renk={renkler.birincil} />
        </Cerceve>
    );
};

// ─── 2. Konum ────────────────────────────────────────────────────────────────

export const KonumSahnesi: React.FC<{ alindi: boolean }> = ({ alindi }) => {
    const renkler = useRenkler();
    const acik = useDonguAcik();
    const dusus = React.useRef(new Animated.Value(1)).current; // 0 = havada, 1 = yerde
    const halka = React.useRef(new Animated.Value(1)).current; // 0 → 1 yayılır (1 = görünmez)
    useDonguAnimasyonu(
        acik && !alindi,
        () =>
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(dusus, { toValue: 0, duration: 0, useNativeDriver: true }),
                    Animated.timing(halka, { toValue: 0, duration: 0, useNativeDriver: true }),
                ]),
                // Yerçekimi: hızlanan düşüş, sonra hafif sekme.
                Animated.timing(dusus, { toValue: 1, duration: 520, easing: Easing.bounce, useNativeDriver: true }),
                Animated.timing(halka, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.delay(1100),
            ]),
        () => {
            dusus.setValue(1);
            halka.setValue(1);
        },
    );
    const yol = { position: 'absolute' as const, height: 3, borderRadius: 2, backgroundColor: renkler.sinir };
    return (
        <Cerceve testID="sahne-konum">
            {/* Harita: tonlu daire + iki yol */}
            <View style={{ position: 'absolute', width: 132, height: 132, borderRadius: 66, overflow: 'hidden', backgroundColor: renkler.birincil + '14' }}>
                <View style={[yol, { width: 180, left: -24, top: 82, transform: [{ rotate: '-18deg' }] }]} />
                <View style={[yol, { width: 160, left: -10, top: 54, transform: [{ rotate: '62deg' }] }]} />
            </View>
            {/* Yere değdiği yerde yayılan halka */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 92,
                    width: 44,
                    height: 16,
                    borderRadius: 22,
                    borderWidth: 2,
                    borderColor: renkler.birincil,
                    opacity: halka.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.7, 0] }),
                    transform: [{ scale: halka.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.9] }) }],
                }}
            />
            {/* Gölge (yerde sabit) */}
            <View style={{ position: 'absolute', top: 96, width: 18, height: 6, borderRadius: 9, backgroundColor: renkler.metin + '22' }} />
            {/* İğne */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 46,
                    transform: [{ translateY: dusus.interpolate({ inputRange: [0, 1], outputRange: [-34, 0] }) }],
                    opacity: dusus.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1] }),
                }}
            >
                <FontAwesome5 name="map-marker-alt" size={48} color={renkler.birincil} solid />
            </Animated.View>
            {alindi ? <Rozet ikon="check" renk={renkler.basarili} /> : <Rozet ikon="compass" renk={renkler.birincil} />}
        </Cerceve>
    );
};

// ─── 3. Bildirim ─────────────────────────────────────────────────────────────

export const BildirimSahnesi: React.FC<{ izinVar: boolean }> = ({ izinVar }) => {
    const renkler = useRenkler();
    const acik = useDonguAcik();
    const zil = React.useRef(new Animated.Value(0)).current; // -1..1 → açı
    const kart = React.useRef(new Animated.Value(1)).current; // 0 gizli, 1 yerinde
    const sall = (d: number) => Animated.timing(zil, { toValue: d, duration: 90, useNativeDriver: true });
    useDonguAnimasyonu(
        acik && !izinVar,
        () =>
            Animated.sequence([
                Animated.timing(kart, { toValue: 0, duration: 0, useNativeDriver: true }),
                Animated.delay(300),
                Animated.parallel([
                    Animated.timing(kart, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                    Animated.sequence([sall(1), sall(-1), sall(0.7), sall(-0.7), sall(0)]),
                ]),
                Animated.delay(1700),
                Animated.timing(kart, { toValue: 0, duration: 240, easing: Easing.in(Easing.quad), useNativeDriver: true }),
                Animated.delay(500),
            ]),
        () => {
            zil.setValue(0);
            kart.setValue(1);
        },
    );
    return (
        <Cerceve testID="sahne-bildirim">
            <View style={{ position: 'absolute', width: 132, height: 132, borderRadius: 66, backgroundColor: renkler.birincil + '14' }} />
            <Animated.View style={{ marginTop: 34, transform: [{ rotate: zil.interpolate({ inputRange: [-1, 1], outputRange: ['-16deg', '16deg'] }) }] }}>
                <FontAwesome5 name="bell" size={52} color={renkler.birincil} solid />
            </Animated.View>
            {/* Üstten inen bildirim kartı: ikon + iki satır (metinsiz şema) */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 6,
                    width: 128,
                    height: 34,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                    backgroundColor: renkler.kartArkaplan,
                    borderWidth: 1,
                    borderColor: renkler.sinir,
                    opacity: kart,
                    transform: [{ translateY: kart.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }],
                }}
            >
                <View style={{ width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: renkler.birincil + '22' }}>
                    <FontAwesome5 name="mosque" size={10} color={renkler.birincil} solid />
                </View>
                <View style={{ flex: 1, marginLeft: 7 }}>
                    <View style={{ height: 5, width: '70%', borderRadius: 3, backgroundColor: renkler.metin + '55' }} />
                    <View style={{ height: 4, width: '92%', borderRadius: 2, marginTop: 4, backgroundColor: renkler.metinIkincil + '44' }} />
                </View>
            </Animated.View>
            {izinVar ? <Rozet ikon="check" renk={renkler.basarili} /> : null}
        </Cerceve>
    );
};

// ─── 5. Hazır ────────────────────────────────────────────────────────────────

const PARCACIK = 10;

/** ✓ + adıma girişte BİR KEZ saçılan kutlama noktaları (döngü yok). */
export const HazirSahnesi: React.FC = () => {
    const renkler = useRenkler();
    const azalt = useHareketAzalt();
    const [goster, setGoster] = React.useState(false);
    const sacilma = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        setGoster(true);
        if (azalt) return;
        const a = Animated.timing(sacilma, { toValue: 1, duration: 900, delay: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true });
        a.start();
        return () => a.stop();
    }, [azalt, sacilma]);
    const renkDizisi = [renkler.birincil, renkler.basarili, renkler.birincil + '80'];
    return (
        <Cerceve testID="sahne-hazir">
            {azalt
                ? null
                : Array.from({ length: PARCACIK }).map((_, i) => {
                      const aci = (i / PARCACIK) * Math.PI * 2;
                      const r = 62 + (i % 2) * 10;
                      return (
                          <Animated.View
                              key={i}
                              style={{
                                  position: 'absolute',
                                  width: i % 3 === 0 ? 9 : 7,
                                  height: i % 3 === 0 ? 9 : 7,
                                  borderRadius: 5,
                                  backgroundColor: renkDizisi[i % renkDizisi.length],
                                  opacity: sacilma.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 0.8, 0] }),
                                  transform: [
                                      { translateX: sacilma.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(aci) * r] }) },
                                      { translateY: sacilma.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(aci) * r] }) },
                                      { scale: sacilma.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
                                  ],
                              }}
                          />
                      );
                  })}
            <BasariIsareti goster={goster} boyut={96} />
        </Cerceve>
    );
};
