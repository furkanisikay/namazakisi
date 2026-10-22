/**
 * BugununNabzi — bugünün karesinin "nabız" animasyonu (büyüyüp soluma, task-3-brief.md
 * §3b). SONLUDUR: bir nefes alıp statik kareye döner; kaydırmada hemen durur.
 *
 * SVG'NİN DIŞINDA, AYRI BİR Animated.View katmanıdır (İlerleme takılması kök
 * nedeni — düzeltildi). Önceden ana `<Svg>`'nin İÇİNDE bir `AnimatedRect`'ti
 * ve "tek öğe, maliyeti ölçülemeyecek kadar küçük" diye gerekçelendirilmişti;
 * gerekçe yanlıştı: react-native-svg Android'de (`SvgView.java`) herhangi bir
 * alt düğümün prop güncellemesi `RenderableViewManager.onAfterUpdateTransaction
 * → invalidateSvgView` ile `SvgView.invalidate()`'i çağırır, bu da önbellek
 * bitmap'ini (`mBitmap`) ATAR; sonraki `onDraw` `drawOutput()` ile panel
 * boyutunda YENİ bir ARGB_8888 bitmap ayırıp TÜM ağacı (~1.000 düğüm) yeniden
 * çizer. Tek bir sonsuz animasyon = saniyede ~60 tam yeniden rasterleme + 60
 * büyük bitmap ayırma (GC baskısı) — kaydırmanın kare bütçesiyle UI thread'inde
 * yarışıyordu ("çizilirken bir şey oluyor"). Artık animasyon yalnız bu View'in
 * `opacity` + `scale` özelliklerindedir (kompozitör; ana Svg'ye dokunmaz) ve
 * ana Svg açılıştan sonra hiç geçersiz kılınmaz, bitmap'i önbellekte kalır.
 *
 * GÖRÜNÜM BİREBİR KORUNUR: SVG `Rect` konturu kenarın ORTASINA çizilir (yarısı
 * dışarı taşar), RN `borderWidth` ise İÇERİ çizer → kutu kontur kalınlığı kadar
 * büyütülüp yarım kontur kadar dışa kaydırılır; köşe yarıçapı da aynı hesapla.
 * Büyüme artık geometri değil `scale` olduğu için tepe noktasında kontur
 * 1,4 → 1,5 px'e kalınlaşır (algılanamaz). Katman sırası `GokPaneli`'de
 * korunur: zemin Svg'si → nabız → içerik Svg'si (yıldız/bağ/gün numarası
 * nabzın ÜSTÜNDE kalır, önceki sırayla aynı).
 *
 * Azaltılmış hareket açıkken (veya animasyon henüz kurulmadan ÖNCE) `ilerleme`
 * 0 → Faz 1'deki STATİK "bugün" karesi (opacity `NABIZ_TABAN_OPAKLIK`=0.4,
 * ölçek 1) — global-constraints.md "Faz 1'in görsel sonucu DEĞİŞMEZ".
 */
import React, { useEffect, useRef } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { GOK_ZAMANLAMA } from './sabitler';
import { useGokDurdurmaSayaci } from './gokHareketi';

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
export const NABIZ_BUYUME_ORANI = 1.07;
export const NABIZ_TABAN_OPAKLIK = 0.4;
export const NABIZ_TEPE_OPAKLIK = 0.72;
/** Kontur kalınlığı (px) — önceki SVG `strokeWidth` ile aynı. */
export const NABIZ_KONTUR = 1.4;

export interface BugununNabziProps {
  /** Panel-göreceli piksel merkezi — `HEADER_YUKSEKLIK` çağıran tarafından
   * zaten eklenmiş olmalı (`Parilti` ile aynı sözleşme). */
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
    // SONLU: bir nefes, dinlenme hâlinde (Faz 1 statik kare) durur — "boşta sıfır hareket".
    ilerleme.value = withRepeat(
      withTiming(1, { duration: GOK_ZAMANLAMA.NABIZ_SURE_MS }),
      GOK_ZAMANLAMA.NABIZ_YARIM_DONGU,
      true,
    );
    // Yalnız mount'ta BİR KEZ kurulur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kaydırma başladı → durur ve statik kareye döner.
  const durdurma = useGokDurdurmaSayaci();
  const ilkDurdurma = useRef(durdurma);
  useEffect(() => {
    if (durdurma === ilkDurdurma.current) return;
    cancelAnimation(ilerleme);
    ilerleme.value = 0;
  }, [durdurma, ilerleme]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = ilerleme.value;
    return {
      opacity: NABIZ_TABAN_OPAKLIK + (NABIZ_TEPE_OPAKLIK - NABIZ_TABAN_OPAKLIK) * t,
      transform: [{ scale: 1 + (NABIZ_BUYUME_ORANI - 1) * t }],
    };
  });

  // SVG konturu kenarın ortasında → RN kutusu kontur kadar büyük, yarım kontur dışarıda.
  const kutu = kenar + NABIZ_KONTUR;
  return (
    <Animated.View
      testID="seri-bugun-nabzi"
      pointerEvents="none"
      renderToHardwareTextureAndroid
      style={[
        {
          position: 'absolute',
          left: merkezX - kutu / 2,
          top: merkezY - kutu / 2,
          width: kutu,
          height: kutu,
          borderRadius: kenar * koseOrani + NABIZ_KONTUR / 2,
          borderWidth: NABIZ_KONTUR,
          borderColor: renk,
        },
        animatedStyle,
      ]}
    />
  );
};
