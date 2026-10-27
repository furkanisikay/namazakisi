/**
 * Günün ayeti görseli — paylaşım kartı ve iPhone duvar kâğıdı (elle kaydetme) aynı yerden.
 *
 * Ekranda görünmez: sayfa onu ekran dışına koyar, `captureRef` ile PNG'ye çevirip
 * `expo-sharing` ile paylaşım menüsüne verir (`ayetGorseliniPaylas`). Künye ve meal kaynağı
 * her görselde ZORUNLU (QuranEnc atıf şartı).
 *
 * - `kart`: tema zemininde; Arapça (Amiri Quran) + meal + künye.
 * - `duvar`: telefon oranında, HER ZAMAN koyu zemin; meal ekranın %36–%80 bandında (saat ve
 *   parmak izi alanı dışı), Arapça YOK. iOS Kısayollar eyleminin (`GununAyetiGorseliIntent`)
 *   çizdiği görselle aynı düzen.
 */
import * as React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { KOYU_TEMA, useRenkler } from '../../../core/theme';
import type { GununAyetiGorunumu } from '../../../core/icerik/gununAyeti';
import { useMetin } from '../../hooks/useMetin';
import { sagaYasliMetin } from '../common/yon';

/** Paketteki Arapça yazı tipi (OFL 1.1, `assets/fonts/OFL.txt`). */
export const ARAPCA_YAZI_TIPI = 'AmiriQuran';

/** Yazı tipi yüklendiyse adı, yüklenmediyse `undefined` (sistem yazı tipine düşer). */
export function useArapcaYaziTipi(): string | undefined {
  const [yuklendi] = useFonts({ [ARAPCA_YAZI_TIPI]: require('../../../../assets/fonts/AmiriQuran-Regular.ttf') });
  return yuklendi ? ARAPCA_YAZI_TIPI : undefined;
}

export type AyetGorseliTuru = 'kart' | 'duvar';

/** Kartın çizim genişliği (dp); yakalama `width` ile piksele ölçeklenir. */
export const KART_GENISLIGI = 360;

interface Props {
  ayet: GununAyetiGorunumu;
  tur: AyetGorseliTuru;
  yaziTipi?: string;
}

export const AyetGorseli = React.forwardRef<View, Props>(({ ayet, tur, yaziTipi }, ref) => {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.gununAyeti;

  if (tur === 'duvar') {
    const koyu = KOYU_TEMA.renkler;
    const { width, height } = Dimensions.get('screen');
    const genislik = KART_GENISLIGI;
    const yukseklik = Math.round((genislik * height) / Math.max(width, 1));
    return (
      <View ref={ref} collapsable={false} style={{ width: genislik, height: yukseklik, backgroundColor: koyu.arkaplan }}>
        <View
          style={{
            position: 'absolute',
            top: yukseklik * 0.36,
            height: yukseklik * 0.44,
            left: 28,
            right: 28,
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: koyu.metinIkincil }}>{m.etiket}</Text>
          <Text style={{ fontSize: 19, lineHeight: 28, marginTop: 12, color: koyu.metin }}>{ayet.meal ?? ayet.kisaKunye}</Text>
          <Text style={{ fontSize: 12, marginTop: 14, color: koyu.metinIkincil }}>
            {ayet.mealKaynagi ? `${ayet.kisaKunye} · ${ayet.mealKaynagi}` : ayet.kisaKunye}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{ width: KART_GENISLIGI, padding: 24, backgroundColor: renkler.kartArkaplan, borderRadius: 24 }}
    >
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: renkler.birincil }}>{m.etiket}</Text>
      {/* rakamKoru: Tanzil metni birebir; metin kapısı (rakam, Urduca yazı tipi) dokunmaz. */}
      <Text
        rakamKoru
        style={{
          fontFamily: yaziTipi,
          fontSize: 24,
          lineHeight: 46,
          marginTop: 14,
          // Her arayüz dilinde sağa yaslı (sağdan solada 'right' sola çevrilir; bkz. yon.ts).
          ...sagaYasliMetin(),
          writingDirection: 'rtl',
          color: renkler.metin,
        }}
      >
        {ayet.ar}
      </Text>
      {ayet.meal ? <Text style={{ fontSize: 16, lineHeight: 24, marginTop: 12, color: renkler.metin }}>{ayet.meal}</Text> : null}
      <Text style={{ fontSize: 12, lineHeight: 17, marginTop: 14, color: renkler.metinIkincil }}>{ayet.tamKunye}</Text>
      <Text style={{ fontSize: 12, fontWeight: '700', marginTop: 10, color: renkler.birincil }}>{s.ortak.marka}</Text>
    </View>
  );
});
AyetGorseli.displayName = 'AyetGorseli';

/** Görseli PNG olarak yakalar ve paylaşım menüsünü açar; açılamazsa `false`. */
export async function ayetGorseliniPaylas(gorunum: View | null, baslik: string): Promise<boolean> {
  if (!gorunum) return false;
  const { captureRef } = require('react-native-view-shot') as typeof import('react-native-view-shot');
  const Sharing = require('expo-sharing') as typeof import('expo-sharing');
  if (!(await Sharing.isAvailableAsync())) return false;
  // Boyut verilmez: cihazın piksel yoğunluğunda yakalanır (360 dp ≈ 1080 px).
  const uri = await captureRef(gorunum, { format: 'png', quality: 1, result: 'tmpfile' });
  await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: baslik, UTI: 'public.png' });
  return true;
}
