/**
 * Kamera görünümü: Kâbe yönünü dünya uzayından ekran uzayına iğne deliği modeliyle
 * izdüşürür — SAF.
 *
 * Kamera arka yüzdedir, cihazın −z yönüne bakar; ekranın x'i cihazın x'i, ekranın
 * yukarısı cihazın y'sidir (yalnız DİKEY ekran yönü; uygulama telefonda dikeye kilitli).
 * Kâbe ufuk çizgisinde kabul edilir (yükseklik 0): binlerce km ötedeki hedef için yerin
 * eğriliği gösterilecek yükseklik farkını sıfıra indirir.
 *
 * Görüş açısı (FOV) cihaza göre birkaç derece değişir ve okunamaz; yaklaşık sabit
 * kullanılır. Bu yalnız işaretin MERKEZ DIŞINDAKİ konumunu birkaç piksel kaydırır —
 * hizalanma kararı (işaret ekranın ortasında mı) FOV'dan bağımsızdır, çünkü yön farkı
 * doğrudan açıdan hesaplanır.
 */
import type { DunyaTabani, Vektor3 } from './cihazYonelimi';

/** Önizlemenin uzun kenarının görüş açısı (derece) ve doğal en-boy oranı (uzun/kısa). */
export interface KameraOptigi {
  uzunKenarFovDerece: number;
  oran: number;
}

/**
 * Platform başına yaklaşık arka (geniş) kamera optiği. ~26 mm eşdeğer odak, 4:3 sensör →
 * uzun kenarda ≈ 66°. expo-camera Android önizlemesi varsayılan 4:3, iOS 16:9 video
 * önizlemesi (uzun kenar aynı, kısa kenar kırpılı).
 */
export const KAMERA_OPTIGI: Record<'android' | 'ios', KameraOptigi> = {
  android: { uzunKenarFovDerece: 66, oran: 4 / 3 },
  ios: { uzunKenarFovDerece: 66, oran: 16 / 9 },
};

/**
 * "Kapla" (cover) ölçeklemesinde piksel cinsinden odak uzaklığı. Önizleme alanı
 * önizlemeden daha uzunsa yükseklik eşleşir, yanlar kırpılır; daha basıksa genişlik
 * eşleşir, üst-alt kırpılır. Her iki durumda da f, ölçeklenmiş önizlemenin uzun kenarından.
 */
export function odakUzakligiPx(genislik: number, yukseklik: number, optik: KameraOptigi): number {
  if (!(genislik > 0) || !(yukseklik > 0)) return 0;
  // Dikey önizlemenin doğal boyutu: 1 × oran (genişlik × yükseklik).
  const olcek = Math.max(genislik / 1, yukseklik / optik.oran);
  const uzunKenarPx = optik.oran * olcek;
  return uzunKenarPx / 2 / Math.tan((optik.uzunKenarFovDerece * Math.PI) / 360);
}

export type Izdusum =
  | { tur: 'ekranda'; x: number; y: number; derinlik: number }
  | { tur: 'disarida'; yon: 'sag' | 'sol'; kenarAcisi: number };

/** Ekran kenarından içerde tutulan pay (px): işaret yarım görünmesin. */
export const KENAR_PAYI = 28;

/**
 * Kâbe'nin ekrandaki yeri. `kibleManyetik` = kıble azimutu − manyetik sapma (taban
 * manyetik kuzeye göredir). `fark` = kıble − bakış yönü (işaretli); dışarıdaysa hangi
 * yana dönüleceği ondan seçilir (arkadayken bile doğru yan).
 */
export function kabeyiIzdusur(girdi: {
  taban: DunyaTabani;
  kibleManyetik: number;
  fark: number;
  genislik: number;
  yukseklik: number;
  optik: KameraOptigi;
}): Izdusum {
  const { taban, kibleManyetik, fark, genislik, yukseklik, optik } = girdi;
  const r = (kibleManyetik * Math.PI) / 180;
  const s = Math.sin(r);
  const c = Math.cos(r);
  const t: Vektor3 = {
    x: s * taban.dogu.x + c * taban.kuzey.x,
    y: s * taban.dogu.y + c * taban.kuzey.y,
    z: s * taban.dogu.z + c * taban.kuzey.z,
  };
  const derinlik = -t.z;
  const yan: 'sag' | 'sol' = fark >= 0 ? 'sag' : 'sol';
  const f = odakUzakligiPx(genislik, yukseklik, optik);
  if (derinlik > 0.05 && f > 0) {
    const x = genislik / 2 + (f * t.x) / derinlik;
    const y = yukseklik / 2 - (f * t.y) / derinlik;
    if (x >= KENAR_PAYI && x <= genislik - KENAR_PAYI && y >= KENAR_PAYI && y <= yukseklik - KENAR_PAYI) {
      return { tur: 'ekranda', x, y, derinlik };
    }
    // Ekranın üstünde/altında ama yatayda içerde: telefonu eğmek yeter, dönmek değil.
    // Yine de ok yanı gösterir; kenar açısı okun eğimini taşır.
    return { tur: 'disarida', yon: yan, kenarAcisi: (Math.atan2(-(y - yukseklik / 2), x - genislik / 2) * 180) / Math.PI };
  }
  return { tur: 'disarida', yon: yan, kenarAcisi: yan === 'sag' ? 0 : 180 };
}
