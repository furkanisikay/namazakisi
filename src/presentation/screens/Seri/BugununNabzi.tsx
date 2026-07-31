/**
 * BugununNabzi — bugünün karesinin sürekli "nabız" animasyonu (büyüyüp
 * soluma, task-3-brief.md §3b).
 *
 * TEK öğe olduğu için Svg PROP animasyonu (`Animated.createAnimatedComponent(Rect)`)
 * TERCİH EDİLDİ — `Parilti` gibi ayrı bir Animated.View overlay katmanı DEĞİL:
 * parıltının Svg-prop'tan kaçınma gerekçesi (19-20 sonsuz animasyonun her
 * karede TÜM Svg ağacını geçersiz kılması) burada geçerli değil — ayda en
 * fazla BİR "bugün" karesi vardır, tek bir ek sonsuz animasyonun invalidate
 * maliyeti ölçülemeyecek kadar küçüktür; ayrı bir overlay katmanı kurmak
 * (konum hesabı + `HEADER_YUKSEKLIK` ofseti dahil) karşılığında gereksiz
 * karmaşıklık ekler. Gerekçe rapora yazılmıştır (task-3-report.md).
 *
 * `useAnimatedProps`/`useSharedValue` bir `.map()` içinde çağrılamadığı için
 * (React Hooks kuralı — bkz. `GokPaneli.tsx` doc-block) bu tek öğe de kendi
 * child bileşenine çıkarıldı, `AnimasyonluBag`/`AnimasyonluYildiz` ile aynı
 * gerekçeyle.
 *
 * Azaltılmış hareket açıkken (veya animasyon henüz kurulmadan ÖNCE, ilk
 * render turunda) `ilerleme` her zaman 0 — bu durumda x/y/width/height/rx/
 * opacity Faz 1'deki STATİK "bugün" karesiyle BİREBİR aynı değerleri üretir
 * (kenar=kenar, opacity=`NABIZ_TABAN_OPAKLIK`=0.4) — global-constraints.md
 * "Faz 1'in görsel sonucu DEĞİŞMEZ" kuralı böyle sağlanır.
 */
import React, { useEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Rect } from 'react-native-svg';
import { GOK_ZAMANLAMA } from './sabitler';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * Büyüme/opaklık oranları — referans bağlayıcı (`@keyframes nabiz`,
 * `docs/tasarim/2026-07-29-seri-sekmesi-takimyildizi-referans.html`):
 * `scale(1) → scale(1.07)`, `opacity .34 → .72` (inceleme bulgusu — önceki
 * değer 1.14 referansın İKİ KATIYDI, düzeltildi).
 *
 * `NABIZ_TABAN_OPAKLIK` istisna: referans 0.34 kullanıyor, burada BİLİNÇLİ
 * olarak 0.4'te bırakıldı — Faz 1'deki STATİK "bugün" karesiyle (eski
 * `GokPaneli.tsx`'teki statik `<Rect opacity={0.4}>`) BİREBİR aynı olmalı
 * (global-constraints.md "Faz 1'in görsel sonucu DEĞİŞMEZ"); bu değer
 * değişirse reduced-motion/animasyon-öncesi görünüm Faz 1'den SAPAR. Tepe
 * değeri (0.72) referansa uyar, çünkü tepe için Faz 1'de karşılaştırılacak
 * bir statik değer yok — referansı olduğu gibi taşımak serbest.
 */
const NABIZ_BUYUME_ORANI = 1.07;
const NABIZ_TABAN_OPAKLIK = 0.4;
const NABIZ_TEPE_OPAKLIK = 0.72;

export interface BugununNabziProps {
  merkezX: number;
  merkezY: number;
  /** Faz 1'deki statik kare kenarı (`bugunKenar`). */
  kenar: number;
  /** Köşe yarıçapı oranı (`BUGUN_CERCEVE_KOSE_ORANI`). */
  koseOrani: number;
  /** `renkler.birincil`. */
  renk: string;
}

export const BugununNabzi: React.FC<BugununNabziProps> = ({ merkezX, merkezY, kenar, koseOrani, renk }) => {
  const azaltilmisHareket = useReducedMotion();
  const ilerleme = useSharedValue(0);

  useEffect(() => {
    if (azaltilmisHareket) {
      return;
    }
    ilerleme.value = withRepeat(withTiming(1, { duration: GOK_ZAMANLAMA.NABIZ_SURE_MS }), -1, true);
    // Yalnız mount'ta BİR KEZ kurulur — sonsuz döngü kendi kendine sürer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const t = ilerleme.value;
    const genislik = kenar * (1 + (NABIZ_BUYUME_ORANI - 1) * t);
    return {
      x: merkezX - genislik / 2,
      y: merkezY - genislik / 2,
      width: genislik,
      height: genislik,
      rx: genislik * koseOrani,
      opacity: NABIZ_TABAN_OPAKLIK + (NABIZ_TEPE_OPAKLIK - NABIZ_TABAN_OPAKLIK) * t,
    };
  });

  return <AnimatedRect fill="none" stroke={renk} strokeWidth={1.4} animatedProps={animatedProps} />;
};
