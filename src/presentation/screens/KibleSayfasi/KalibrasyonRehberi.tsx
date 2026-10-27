import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, AccessibilityInfo } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import {
  KALIBRASYON_KAPANIS_KARARLI_MS,
  KALIBRASYON_TESEKKUR_MS,
  KALIBRASYON_TUR_MS,
  KalibrasyonNedeni,
  sonsuzlukYolu,
} from '../../../core/kible/kalibrasyon';
import { metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import type { KibleKaresi } from '../../hooks/useKible';
import { SOLDAN_SAGA } from '../../components/common/yon';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CIZIM_G = 168;
const CIZIM_Y = 72;
/** İz uzunluğu, yolun oranı olarak (silüetin arkasında kalan kuyruk). */
const IZ_ORANI = 0.42;
const SILUET_G = 16;
const SILUET_Y = 27;

/**
 * Oturum hafızası (uygulama yeniden başlayana dek): rehber bir kez tamamlandıysa ya da
 * "Şimdi değil" dendiyse bu oturumda yeniden açılmaz. Kalıcı DEĞİL (ertesi açılışta yön yine
 * bozuksa rehber yine yardım eder); AsyncStorage'a yazılmaz.
 */
const oturum = { bitti: false };
/** Yalnız testler için. */
export function kalibrasyonOturumunuSifirla(): void {
  oturum.bitti = false;
}

type Evre = 'gizli' | 'acik' | 'tesekkur';

/**
 * Pusula kalibrasyon rehberi (Google Qibla Finder'daki "8 çizin"): telefon silüeti havada
 * ∞ çizer, iz arkasında kalır; altında canlı doğruluk çubuğu. Pusula ve kamera görünümünde
 * AYNI bileşen (`KibleSayfasi` ikisinin de üstüne koyar).
 *
 * Yalnız yön verisi güvenilmezken açılır (`kalibrasyonNedeni`), sürekli uyarmaz: gerek
 * ortadan kalkınca kısa bir "Teşekkürler" ile kendiliğinden kapanır, "Şimdi değil" ile o
 * oturumda bir daha görünmez. Alan bozulmasında (metal/mıknatıs) ek ipucu. Hareket
 * azaltılmışsa ∞ statik çizilir, silüet durur.
 *
 * Animasyon TEK değerdir (`ilerleme`, UI thread): silüetin konumu ve izin `strokeDashoffset`'i
 * ondan türer. Doğruluk çubuğu kare aboneliğinden (`kalite`) beslenir, React state'ine yazılmaz.
 */
export const KalibrasyonRehberi: React.FC<{
  neden: KalibrasyonNedeni | null;
  abone: (d: (k: KibleKaresi) => void) => () => void;
  hareketAzalt: boolean;
}> = ({ neden, abone, hareketAzalt }) => {
  const renkler = useRenkler();
  const m = useMetin().kible.kalibrasyon;
  const [evre, setEvre] = useState<Evre>('gizli');
  const sonNeden = useRef<KalibrasyonNedeni | null>(null);
  if (neden) sonNeden.current = neden;
  const gerekli = neden !== null;

  useEffect(() => {
    if (oturum.bitti) return undefined;
    if (evre === 'gizli' && gerekli) setEvre('acik');
    if (evre === 'acik' && !gerekli) {
      const t = setTimeout(() => setEvre('tesekkur'), KALIBRASYON_KAPANIS_KARARLI_MS);
      return () => clearTimeout(t);
    }
    if (evre === 'tesekkur') {
      AccessibilityInfo.announceForAccessibility?.(metin().kible.kalibrasyon.tesekkurErisim);
      const t = setTimeout(() => {
        oturum.bitti = true;
        setEvre('gizli');
      }, KALIBRASYON_TESEKKUR_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [evre, gerekli]);

  const yol = useMemo(() => sonsuzlukYolu(CIZIM_G, CIZIM_Y), []);
  const ilerleme = useSharedValue(0);
  const kalite = useSharedValue(0);

  const acik = evre !== 'gizli' && !oturum.bitti;

  useEffect(() => {
    if (!acik || evre !== 'acik' || hareketAzalt) {
      cancelAnimation(ilerleme);
      return undefined;
    }
    ilerleme.value = 0;
    ilerleme.value = withRepeat(withTiming(1, { duration: KALIBRASYON_TUR_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(ilerleme);
  }, [acik, evre, hareketAzalt, ilerleme]);

  useEffect(() => {
    if (!acik) return undefined;
    return abone((k) => {
      // Hafif yumuşatma (çubuk her karede zıplamasın); animasyon zamanlayıcısı kullanılmaz.
      kalite.value = kalite.value + 0.15 * ((k.kalite ?? 0) - kalite.value);
    });
  }, [acik, abone, kalite]);

  const { x: xs, y: ys, aci: acilar, uzunluk } = yol;
  const n = xs.length;
  const izUzunluk = uzunluk * IZ_ORANI;

  const izProps = useAnimatedProps(() => ({
    strokeDashoffset: -(ilerleme.value * uzunluk - izUzunluk),
  }));
  const siluetStili = useAnimatedStyle(() => {
    const f = ilerleme.value * n;
    const i = Math.floor(f) % n;
    const j = (i + 1) % n;
    const p = f - Math.floor(f);
    const x = xs[i] + p * (xs[j] - xs[i]);
    const y = ys[i] + p * (ys[j] - ys[i]);
    return {
      transform: [
        { translateX: x - SILUET_G / 2 },
        { translateY: y - SILUET_Y / 2 },
        { rotate: `${acilar[i] * 0.35}deg` },
      ],
    };
  });
  const cubukStili = useAnimatedStyle(() => ({
    width: `${Math.round(Math.max(0.06, Math.min(1, kalite.value)) * 100)}%`,
    backgroundColor: interpolateColor(
      kalite.value,
      [0, 0.5, 1],
      [renkler.durum.hata, renkler.durum.uyari, renkler.durum.basarili],
    ),
  }));

  if (!acik) return null;

  if (evre === 'tesekkur') {
    return (
      <View
        testID="kalibrasyon-tesekkur"
        accessible
        accessibilityLabel={m.tesekkurErisim}
        style={[styles.kart, styles.tesekkur, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}
      >
        <View style={[styles.cip, { backgroundColor: renkler.durum.basarili + '20' }]}>
          <FontAwesome5 name="check" size={16} color={renkler.durum.basarili} />
        </View>
        <Text style={[styles.tesekkurMetni, { color: renkler.metin }]}>{m.tesekkur}</Text>
      </View>
    );
  }

  const alan = sonNeden.current === 'alan';
  return (
    <View
      testID="kalibrasyon-rehberi"
      style={[styles.kart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}
    >
      <View
        accessible
        accessibilityRole="alert"
        accessibilityLabel={[m.baslik + '.', m.sallayin, alan ? m.metal : null].filter(Boolean).join(' ')}
      >
        <Text style={[styles.baslik, { color: renkler.metin }]}>{m.baslik}</Text>

        <View style={styles.cizim} importantForAccessibility="no-hide-descendants">
          <Svg width={CIZIM_G} height={CIZIM_Y}>
            <Path d={yol.d} fill="none" stroke={renkler.sinir} strokeWidth={3} strokeLinecap="round" />
            {hareketAzalt ? (
              <Path testID="kalibrasyon-sonsuzluk-statik" d={yol.d} fill="none" stroke={renkler.birincil} strokeWidth={3} strokeLinecap="round" />
            ) : (
              <AnimatedPath
                d={yol.d}
                fill="none"
                stroke={renkler.birincil}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeDasharray={[izUzunluk, uzunluk - izUzunluk]}
                animatedProps={izProps}
              />
            )}
          </Svg>
          <Animated.View
            style={[
              styles.siluet,
              { borderColor: renkler.metin, backgroundColor: renkler.kartArkaplan },
              hareketAzalt ? { transform: [{ translateX: xs[0] - SILUET_G / 2 }, { translateY: ys[0] - SILUET_Y / 2 }] } : siluetStili,
            ]}
          >
            <View style={[styles.siluetKamera, { backgroundColor: renkler.metin }]} />
          </Animated.View>
        </View>

        <Text style={[styles.metin, { color: renkler.metin }]}>{m.sallayin}</Text>
        {alan && (
          <View testID="kalibrasyon-metal-ipucu" style={styles.ipucu}>
            <View style={[styles.cipKucuk, { backgroundColor: renkler.durum.uyari + '20' }]}>
              <FontAwesome5 name="magnet" size={12} color={renkler.metin} />
            </View>
            <Text style={[styles.ipucuMetni, { color: renkler.metinIkincil }]}>{m.metal}</Text>
          </View>
        )}
      </View>

      <View style={styles.dogruluk} importantForAccessibility="no-hide-descendants">
        <Text style={[styles.dogrulukEtiket, { color: renkler.metinIkincil }]}>{m.dogruluk}</Text>
        <View style={[styles.cubukIz, { backgroundColor: renkler.sinir }]}>
          <Animated.View testID="kalibrasyon-dogruluk-cubugu" style={[styles.cubuk, cubukStili]} />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => {
          oturum.bitti = true;
          setEvre('gizli');
        }}
        accessibilityRole="button"
        accessibilityLabel={m.simdiDegil}
        style={[styles.ikincil, { backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }]}
      >
        <Text style={[styles.ikincilMetin, { color: renkler.metin }]}>{m.simdiDegil}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  kart: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    alignItems: 'stretch',
  },
  tesekkur: { flexDirection: 'row', alignItems: 'center' },
  tesekkurMetni: { flex: 1, fontSize: 15, fontWeight: '600', marginLeft: 12 },
  cip: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cipKucuk: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  baslik: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  // Siluet SVG yolunun koordinatında (`left: 0` + translateX) → aynalanmaz.
  cizim: { ...SOLDAN_SAGA, width: CIZIM_G, height: CIZIM_Y, alignSelf: 'center', marginVertical: 12 },
  siluet: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SILUET_G,
    height: SILUET_Y,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
  },
  siluetKamera: { width: 4, height: 2, borderRadius: 1, marginTop: 2 },
  metin: { fontSize: 15, lineHeight: 21, textAlign: 'center' },
  ipucu: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  ipucuMetni: { fontSize: 13, lineHeight: 18, flexShrink: 1 },
  dogruluk: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  dogrulukEtiket: { fontSize: 12, fontWeight: '600', marginRight: 10 },
  cubukIz: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  cubuk: { height: 8, borderRadius: 4 },
  ikincil: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  ikincilMetin: { fontSize: 14, fontWeight: '600' },
});
