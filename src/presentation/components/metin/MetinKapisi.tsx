/**
 * Metin kapısı — RN `Text`'in çizim katmanında TEK dönüşüm yeri (sahip kararı 2026-10-26).
 *
 * Uygulamada merkezi bir sayı biçimleyicisi yok (onlarca dosyada `padStart(2…)`), bu yüzden
 * rakam sistemi ve Urduca yazı tipi metnin YAZILDIĞI yerde değil ÇİZİLDİĞİ yerde uygulanır:
 *
 *  - Yerel rakamlı dil (`core/dil/rakam`: Arapça ٠١٢٣, Bengalce ০১২৩) ve yerel rakam seçiliyken:
 *    `Text` çocuklarındaki dize/sayıların Batı rakamları o dilin rakamına çevrilir. Sözlük ve
 *    kod her zaman Batı rakamıyla yazar.
 *  - Urduca: açık `fontFamily`'si olmayan metne Noto Nastaliq Urdu (kalın ağırlıkta kalın
 *    dosya) verilir; sabit `lineHeight` en az 1.8 × `fontSize`'a çıkarılır (Nestalik'in
 *    iniş/çıkışları kırpılmasın; satır yüksekliği verilmemişse yazı tipinin kendi ölçüsü
 *    2.5 em'dir). `adjustsFontSizeToFit` küçültmesi en çok 0.85'e iner. Yazı tipi
 *    yüklenene kadar sistem yazı tipi kalır.
 *  - Üst işaretli yazılar (Hintçe Devanagari, Bengalce): sabit `lineHeight` en az
 *    `UST_ISARETLI_SATIR_ORANI` × `fontSize`'a çıkarılır. Ünlü işaretleri (ি, ि) üst çizginin
 *    üstüne çıkar; Tailwind'in `text-4xl`'i (36/40) iOS'ta onları keser ("মাগরিব" → "মাগারব").
 *
 * NASIL TAKILIR: RN 0.86'da `Text` düz bir fonksiyon bileşenidir (`forwardRef` değil, `render`
 * yok) → yamanamaz. Bunun yerine NativeWind'in JSX katmanı kullanılır: her `<Text>` öğesi
 * oluşturulurken css-interop `interopComponents.get(Text)` ile sarmalayıcısını seçer. Kapı
 * gerekirken (etkin dil yerel rakamlı — `ar`, `bn` — ya da `ur`, `hi`) bu kayıt bizim sarmalayıcımıza (css-interop'un kendi
 * `cssInterop`'uyla sarılmış `MetinKapisi`) çevrilir: `className` önce çözülür, kapı ÇÖZÜLMÜŞ
 * stili görür (`text-lg`'nin satır yüksekliği dahil), sonra ham `Text`'i çizer. Diğer dillerde
 * kayıt css-interop'un özgün sarmalayıcısıdır: Türkçede SIFIR ek maliyet.
 *
 * Kapsam: JSX ile yazılmış `<Text>` (uygulama ve Metro'nun derlediği kütüphane JSX'i).
 * `Animated.Text`, `TextInput` ve native yüzeyler (widget, bildirim, saat, TV) kapsam DIŞI.
 *
 * Dönüşmemesi gereken metin `rakamKoru` ile işaretlenir (kapı ona hiç dokunmaz): sürüm
 * numarası, eşleştirme kodu, zaten Arapça olan ayet metni, URL/e-posta.
 */
import * as React from 'react';
import { useEffect, useSyncExternalStore } from 'react';
import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { useFonts } from 'expo-font';
import { cssInterop } from 'nativewind';
import { aktifDil, aktifRakamSistemi, dilDegisiminiDinle } from '../../../core/dil/aktifDil';
import { rakamlariCevir, rakamSecilebilir, type RakamSistemi } from '../../../core/dil/rakam';
import type { DilKodu } from '../../../core/dil/diller';
import { Logger } from '../../../core/utils/Logger';

declare module 'react-native' {
  interface TextProps {
    /**
     * Metin kapısı bu metne dokunmaz: rakam dönüşümü ve Urduca yazı tipi uygulanmaz.
     * Sürüm numarası, eşleştirme kodu, Arapça ayet metni, URL/e-posta için.
     */
    rakamKoru?: boolean;
  }
}

/** Paketteki Urduca Nestalik yazı tipi (OFL 1.1, `assets/fonts/OFL.txt`). */
export const NASTALIK_AILESI = 'NotoNastaliqUrdu';
export const NASTALIK_KALIN = 'NotoNastaliqUrdu-Bold';
/** Nestalik'te sabit satır yüksekliğinin alt sınırı (× fontSize). */
export const NASTALIK_SATIR_ORANI = 1.8;
/** Urducada `adjustsFontSizeToFit` küçültmesinin alt sınırı. */
export const NASTALIK_EN_KUCUK_OLCEK = 0.85;
const VARSAYILAN_PUNTO = 14;
/** Üst işaretli yazıda sabit satır yüksekliğinin alt sınırı (× fontSize). */
export const UST_ISARETLI_SATIR_ORANI = 1.5;
/** Ünlü işareti üst çizginin üstüne çıkan yazıyla yazılan diller. */
const UST_ISARETLI_DILLER: ReadonlySet<DilKodu> = new Set<DilKodu>(['hi', 'bn']);

/** Kapı gereken diller: yerel rakamlı diller (Arapça, Bengalce; `core/dil/rakam`), Urduca (yazı tipi), üst işaretli yazılar. */
export const kapiGerekli = (dil: DilKodu): boolean =>
  rakamSecilebilir(dil) || dil === 'ur' || UST_ISARETLI_DILLER.has(dil);

let nastalikHazir = false;
const yaziTipiDinleyicileri = new Set<() => void>();

/** Nestalik yüklendi mi (`NastalikYukleyici` kurar). Değişince kapılar yeniden çizer. */
export function nastalikYuklendiKur(hazir: boolean): void {
  if (hazir === nastalikHazir) return;
  nastalikHazir = hazir;
  for (const fn of [...yaziTipiDinleyicileri]) fn();
}

interface KapiDurumu {
  readonly rakam: RakamSistemi;
  readonly urduca: boolean;
  readonly nastalik: boolean;
  readonly ustIsaretli: boolean;
}

let durumOnbellek: KapiDurumu = { rakam: 'latn', urduca: false, nastalik: false, ustIsaretli: false };

/** `useSyncExternalStore` anlık görüntüsü: değerler değişmedikçe AYNI nesne. */
function kapiDurumu(): KapiDurumu {
  const dil = aktifDil();
  const rakam = rakamSecilebilir(dil) ? aktifRakamSistemi() : 'latn';
  const urduca = dil === 'ur';
  const nastalik = urduca && nastalikHazir;
  const ustIsaretli = UST_ISARETLI_DILLER.has(dil);
  const d = durumOnbellek;
  if (d.rakam !== rakam || d.urduca !== urduca || d.nastalik !== nastalik || d.ustIsaretli !== ustIsaretli) {
    durumOnbellek = { rakam, urduca, nastalik, ustIsaretli };
  }
  return durumOnbellek;
}

function abone(fn: () => void): () => void {
  const birak = dilDegisiminiDinle(fn);
  yaziTipiDinleyicileri.add(fn);
  return () => {
    birak();
    yaziTipiDinleyicileri.delete(fn);
  };
}

/**
 * Çocuklardaki dize/sayıları çevirir. `Fragment`'in içine iner (çocukları bu `Text`'in metnidir);
 * diğer öğelere dokunmaz (iç `<Text>` kendi kapısından geçer).
 */
function cocuklariCevir(cocuk: React.ReactNode, sistem: RakamSistemi): React.ReactNode {
  if (typeof cocuk === 'string') return rakamlariCevir(cocuk, sistem);
  if (typeof cocuk === 'number') return rakamlariCevir(String(cocuk), sistem);
  if (Array.isArray(cocuk)) return cocuk.map((c: React.ReactNode) => cocuklariCevir(c, sistem));
  if (React.isValidElement<{ children?: React.ReactNode }>(cocuk) && cocuk.type === React.Fragment) {
    return React.cloneElement(cocuk, undefined, cocuklariCevir(cocuk.props.children, sistem));
  }
  return cocuk;
}

const kalinMi = (w: TextStyle['fontWeight']): boolean =>
  w === 'bold' || w === '600' || w === '700' || w === '800' || w === '900' || (typeof w === 'number' && w >= 600);

/** Urduca stil eki: Nestalik ailesi + kırpılmayan satır yüksekliği. Açık aile varsa `null`. */
export function nastalikStili(stil: StyleProp<TextStyle>): TextStyle | null {
  const duz = StyleSheet.flatten(stil) ?? {};
  if (duz.fontFamily) return null;
  // Kalın dosya ayrı ailedir: ağırlığı 'normal'e çekmezsek sistem sahte kalın üretmeye çalışır.
  const ek: TextStyle = { fontFamily: kalinMi(duz.fontWeight) ? NASTALIK_KALIN : NASTALIK_AILESI, fontWeight: 'normal' };
  if (typeof duz.lineHeight === 'number') {
    const punto = typeof duz.fontSize === 'number' ? duz.fontSize : VARSAYILAN_PUNTO;
    ek.lineHeight = Math.max(duz.lineHeight, Math.ceil(punto * NASTALIK_SATIR_ORANI));
  }
  return ek;
}

/** Üst işaretli yazı eki: sabit satır yüksekliği dar ise genişletir; gerek yoksa `null`. */
export function ustIsaretliStili(stil: StyleProp<TextStyle>): TextStyle | null {
  const duz = StyleSheet.flatten(stil) ?? {};
  if (typeof duz.lineHeight !== 'number') return null;
  const punto = typeof duz.fontSize === 'number' ? duz.fontSize : VARSAYILAN_PUNTO;
  const alt = Math.ceil(punto * UST_ISARETLI_SATIR_ORANI);
  return duz.lineHeight < alt ? { lineHeight: alt } : null;
}

type KapiProps = TextProps & { ref?: React.Ref<React.ComponentRef<typeof Text>> };

/**
 * Kapının kendisi. Ham `Text`'i `cssInterop: false` ile çizer: NativeWind'in babel eklentisi
 * JSX'i de `React.createElement`'i de css-interop'a yönlendirir; bayrak olmadan kayıt yeniden
 * kapıyı seçer (sonsuz döngü).
 */
export const MetinKapisi = React.forwardRef<React.ComponentRef<typeof Text>, KapiProps>(function MetinKapisi(
  { rakamKoru, children, style, adjustsFontSizeToFit, minimumFontScale, ...kalan },
  ref
) {
  const durum = useSyncExternalStore(abone, kapiDurumu);
  const ortak = { ...kalan, ref, adjustsFontSizeToFit, cssInterop: false };
  if (rakamKoru || (!durum.urduca && !durum.ustIsaretli && durum.rakam === 'latn')) {
    return React.createElement(Text, { ...ortak, style, minimumFontScale }, children);
  }
  const ek = durum.nastalik ? nastalikStili(style) : durum.ustIsaretli ? ustIsaretliStili(style) : null;
  const olcek =
    durum.urduca && adjustsFontSizeToFit ? Math.max(minimumFontScale ?? 0, NASTALIK_EN_KUCUK_OLCEK) : minimumFontScale;
  return React.createElement(
    Text,
    { ...ortak, style: ek ? [style, ek] : style, minimumFontScale: olcek },
    durum.rakam === 'latn' ? children : cocuklariCevir(children, durum.rakam)
  );
});

let kurulum: (() => void) | null = null;

/**
 * Kapıyı NativeWind'in bileşen kaydına takar; etkin dil değişince kaydı açar/kapatır. Uygulama
 * girişinde (App.tsx) BİR KEZ çağrılır; paylaşılan modülden çağırma (ekran testleri `className`'i
 * ham prop olarak görmeye devam etsin). css-interop iç yapısı değişirse kapı sessizce devre dışı
 * kalır (rakamlar Batı, sistem yazı tipi) ve uyarı yazılır. Kaldıran fonksiyon döner (testler).
 */
export function metinKapisiniKur(): () => void {
  if (kurulum) return kurulum;
  let harita: Map<unknown, unknown>;
  try {
    // Üretimde css-interop RN bileşenlerini İLK JSX çağrısında kaydeder; kapıdan önce kaydedilsin
    // ki sonradan özgün sarmalayıcıyla üzerine yazılmasın (css-interop testte bunu atlar).
    if (process.env.NODE_ENV !== 'test') require('react-native-css-interop/dist/runtime/components');
    harita = (require('react-native-css-interop/dist/runtime/native/api') as { interopComponents: Map<unknown, unknown> })
      .interopComponents;
    if (!(harita instanceof Map)) throw new Error('interopComponents bulunamadı');
  } catch (e) {
    Logger.warn('MetinKapisi', 'Metin kapısı takılamadı; rakam ve yazı tipi dönüşümü kapalı', e);
    return () => undefined;
  }
  const ozgun = harita.get(Text);
  const sarmal = cssInterop(MetinKapisi, { className: 'style' });
  const uygula = () => {
    if (kapiGerekli(aktifDil())) harita.set(Text, sarmal);
    else if (ozgun) harita.set(Text, ozgun);
    else harita.delete(Text);
  };
  uygula();
  const birak = dilDegisiminiDinle(uygula);
  kurulum = () => {
    birak();
    if (ozgun) harita.set(Text, ozgun);
    else harita.delete(Text);
    harita.delete(MetinKapisi);
    kurulum = null;
  };
  return kurulum;
}

/**
 * Urduca etkinken Nestalik dosyalarını çalışma anında yükler (Amiri ile aynı yol, `useFonts`;
 * config plugin değil). Yalnız Urducada çizilir: diğer dillerde ~1 MB yüklenmez.
 */
export const NastalikYukleyici: React.FC = () => {
  const [yuklendi] = useFonts({
    [NASTALIK_AILESI]: require('../../../../assets/fonts/NotoNastaliqUrdu-Regular.ttf'),
    [NASTALIK_KALIN]: require('../../../../assets/fonts/NotoNastaliqUrdu-Bold.ttf'),
  });
  useEffect(() => {
    nastalikYuklendiKur(yuklendi);
  }, [yuklendi]);
  return null;
};
