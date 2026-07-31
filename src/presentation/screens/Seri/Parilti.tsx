/**
 * Parilti — 5/5 (tam) günlerin sürekli "nefes alan" parıltısı (task-3-brief.md §3a).
 *
 * Svg prop'u DEĞİL, panelin üstüne konan AYRI bir Animated.View katmanı.
 * Gerekçe mimari bir gerçek, spekülasyon değil: `VirtualView.java`'da herhangi
 * bir sanal düğümün `invalidate()`'i `clearParentCache()` zinciriyle
 * `SvgView`'a taşınır ve `SvgView.onDraw` TÜM ağacı yeniden çizer — 19-20
 * sonsuz animasyonun her karede ~900 düğümlük tuvali geçersiz kılması cihazda
 * ölçülmüş bir risk (AGENTS.md "Seri sekmesi / react-native-svg" bölümü).
 *
 * İÇİ DÜZ RENKLİ DAİRE DEĞİL — Faz 1'in kendi dersi (AGENTS.md, hâlenin
 * RadialGradient'le kurulma nedeni: "düz düşük-opaklık daire sert kenarlı
 * görünür; CSS blur'ün yumuşaklığı böyle taşınmaz") burada da geçerli. Bu
 * yüzden animasyonlanan Animated.View'in İÇİNDE statik mini bir `<Svg>` + tek
 * `RadialGradient` dolgulu daire var; animasyon YALNIZ dış View'in
 * opacity'sinde kalır (kompozitör katmanı), ana Svg ağacına dokunmaz.
 *
 * KONUMLANDIRMA: `sol`/`ust` çağıran tarafından (GokPaneli) panelin piksel
 * uzayında (Svg'nin DIŞINDaki katman) hesaplanır — `ust` hesabına
 * `HEADER_YUKSEKLIK` eklenmelidir (ızgara katmanı Svg içinde o kadar aşağı
 * kaydırılmıştır, ama `gokYerlesimi().merkez(i)` header'sız koordinat verir).
 *
 * FAZ FARKI ZORUNLU (`indeks` ile): süre `PARILTI_FAZ_CARPANI_SURE`, gecikme
 * `PARILTI_FAZ_CARPANI_GECIKME` ile üretilir — `Math.random` KULLANILMAZ
 * (deterministik olmalı, testte doğrulanabilir).
 *
 * Azaltılmış hareket açıkken HİÇ RENDER EDİLMEZ (`null` döner) — Faz 1'de bu
 * katman hiç yoktu, "nihai hâl" onun tamamen yokluğudur (global-constraints.md
 * "Faz 1'in görsel sonucu DEĞİŞMEZ").
 */
import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { GOK_ZAMANLAMA } from './sabitler';

/** Parıltının taban (soluk) ve tepe (parlak) opaklığı — dekoratif ayar,
 * zamanlama sabiti DEĞİL (GOK_ZAMANLAMA yalnız süre/gecikme taşır, spec). */
const PARILTI_TABAN_OPAKLIK = 0.25;
const PARILTI_TEPE_OPAKLIK = 0.9;

export interface PariltiProps {
  /** Panel-göreceli piksel konumu — `HEADER_YUKSEKLIK` çağıran tarafından
   * zaten eklenmiş olmalı (bkz. dosya başı yorumu). */
  sol: number;
  ust: number;
  /** Overlay'in kare boyutu (px). */
  boyut: number;
  /** `renkler.birincil`. */
  renk: string;
  /** Yıldız ızgara indeksi — faz farkını (senkron yanıp sönmeyi kırmak) üretmek için. */
  indeks: number;
  /** `acilisCizelgesi().toplam` — açılış zinciri bitene kadar parıltı başlamaz. */
  cizelgeToplam: number;
}

export const Parilti: React.FC<PariltiProps> = ({ sol, ust, boyut, renk, indeks, cizelgeToplam }) => {
  const azaltilmisHareket = useReducedMotion();
  const opacity = useSharedValue(PARILTI_TABAN_OPAKLIK);

  useEffect(() => {
    if (azaltilmisHareket) {
      return;
    }
    const sure =
      GOK_ZAMANLAMA.PARILTI_SURE_TABAN_MS +
      ((indeks * GOK_ZAMANLAMA.PARILTI_FAZ_CARPANI_SURE) % GOK_ZAMANLAMA.PARILTI_SURE_FAZ_ARALIGI_MS);
    const gecikme =
      cizelgeToplam +
      GOK_ZAMANLAMA.PARILTI_GECIKME_SONRASI_MS +
      ((indeks * GOK_ZAMANLAMA.PARILTI_FAZ_CARPANI_GECIKME) % GOK_ZAMANLAMA.PARILTI_GECIKME_FAZ_ARALIGI_MS);
    opacity.value = withDelay(gecikme, withRepeat(withTiming(PARILTI_TEPE_OPAKLIK, { duration: sure }), -1, true));
    // Yalnız mount'ta BİR KEZ kurulur — sonsuz döngü (`withRepeat(-1, true)`)
    // kendi kendine sürer, `indeks`/`cizelgeToplam` sonradan değişse de
    // yeniden tetiklenmemeli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (azaltilmisHareket) {
    return null;
  }

  return (
    <Animated.View
      testID="seri-parilti"
      pointerEvents="none"
      style={[{ position: 'absolute', left: sol, top: ust, width: boyut, height: boyut }, animatedStyle]}
    >
      <Svg width={boyut} height={boyut}>
        <Defs>
          <RadialGradient id="pariltiGradyan" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={renk} stopOpacity={0.5} />
            <Stop offset="0.55" stopColor={renk} stopOpacity={0.16} />
            <Stop offset="1" stopColor={renk} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={boyut / 2} cy={boyut / 2} r={boyut / 2} fill="url(#pariltiGradyan)" />
      </Svg>
    </Animated.View>
  );
};
