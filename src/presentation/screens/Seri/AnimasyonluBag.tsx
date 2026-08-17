/**
 * AnimasyonluBag — bir zincir bağının (Path) açılış çizim animasyonu.
 *
 * `useAnimatedProps`/`useSharedValue` map içinde çağrılamaz (React Hooks
 * kuralı) — bu yüzden her bağ `GokPaneli`'nin `.map()`'inden kendi child
 * bileşenine çıkarıldı (task-2-brief.md "Hook döngüde çağrılamaz").
 *
 * `strokeDasharray` STATİK prop olarak verilir, yalnız `strokeDashoffset`
 * `animatedProps` ile animasyonlanır — react-native-svg'nin
 * `extractStroke.ts`'i `strokeDasharray` yoksa `strokeDashoffset`'i `null`'a
 * düşürür (`o.strokeDashoffset = strokeDasharray && strokeDashoffset ? ... :
 * null`); dasharray'i de animasyonlamak bu extraction'ı atlatır.
 *
 * Pay (`DASHARRAY_PAY_ORANI` = 1.05): `yolUzunlugu` kübik yolu 16 adımlı
 * çokgenle ALTTAN tahmin eder (hata < %1, bkz. gokGeometrisi.ts) — dasharray
 * tam bu değere eşitlenirse satır-sarması yaylarının ucunda çizilmemiş minik
 * bir kuyruk kalır. Pay sıfır maliyetli bir sigorta (yolun gerçek bitiş
 * noktasının biraz ötesine kadar dash uzanır, ama yol zaten orada bittiği
 * için görsel fark yaratmaz).
 */
import React, { useEffect, useMemo, useState } from 'react';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';
import { yolUzunlugu } from '../../../core/seri/gokGeometrisi';
import { BagZamani } from '../../../core/seri/acilisCizelgesi';
import { GOK_TONLARI } from './sabitler';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** bkz. dosya başı yorumu — `yolUzunlugu`'nun alttan tahmininin telafisi. */
const DASHARRAY_PAY_ORANI = 1.05;

export interface AnimasyonluBagProps {
  yol: string;
  kalinlik: number;
  opaklik: number;
  /** `acilisCizelgesi().bagZamani`'ndan bu bağın zamanlaması. Zincirdeki her
   * bağ için tanımlıdır — kopuk çiftler zaten `zincirler`/`bagZamani`'nde
   * yer almaz; yine de savunmacı olarak `undefined` kabul edilir. */
  zaman: BagZamani | undefined;
  /** `GokPaneli`'nin ömür boyu ref'i — `true` iken bu bağ İLK KEZ mount
   * oluyorsa (veri değişimiyle sonradan beliren bir bağ) animasyon
   * OYNATILMAZ, NİHAİ (dashoffset 0) durumda doğar. */
  oynatildiRef: React.MutableRefObject<boolean>;
}

export const AnimasyonluBag: React.FC<AnimasyonluBagProps> = ({ yol, kalinlik, opaklik, zaman, oynatildiRef }) => {
  const azaltilmisHareket = useReducedMotion();
  // Bu bağ İLK oynatım penceresinde mi mount oldu? Yalnız mount anında
  // (lazy initializer, render sırasında) okunur — `GokPaneli`'nin kendi mount
  // effect'i bundan SONRA (commit sonrası) çalışıp ref'i true yapar; ilk
  // render turundaki tüm bağlar burada hâlâ `false` görüp oynatır, veri
  // değişimiyle SONRADAN mount olan bağlar `true` görüp nihai durumda doğar
  // (task-2-brief.md §2c).
  const [ilkOynatimPenceresinde] = useState(() => !oynatildiRef.current);
  const oynatilacakMi = ilkOynatimPenceresinde && !azaltilmisHareket && !!zaman;

  const uzunluk = useMemo(() => yolUzunlugu(yol) * DASHARRAY_PAY_ORANI, [yol]);

  const dashoffset = useSharedValue(oynatilacakMi ? uzunluk : 0);

  useEffect(() => {
    if (!oynatilacakMi || !zaman) {
      return;
    }
    dashoffset.value = withDelay(zaman.gecikme, withTiming(0, { duration: zaman.sure }));
    // Yalnız mount'ta BİR KEZ oynatılır — `zaman`/`oynatilacakMi` sonradan
    // değişse de (veri güncellemesi) yeniden tetiklenmemeli (spec 2c).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: dashoffset.value }));

  return (
    <AnimatedPath
      d={yol}
      fill="none"
      stroke={GOK_TONLARI.ISIK}
      strokeWidth={kalinlik}
      strokeOpacity={opaklik}
      strokeLinecap="round"
      strokeDasharray={uzunluk}
      animatedProps={animatedProps}
    />
  );
};
