/**
 * Duvar kâğıdının YAZI bloğu: (Arapça) + meal + künye + atıf satırı. Ölçüler Android çizicisiyle
 * aynı (`YAZI_OLCULERI`, 412 tasarım genişliği) ve `yazi.olcek` ile çarpılır; yan pay mihrap
 * süsünde kemerin içine daralır. Künye ve meal kaynağı her görselde ZORUNLU (QuranEnc atıf şartı).
 *
 * Hiza fizikseldir (sahne aynalanmaz): "baş" soldan sağa yazıda sol, sağdan sola yazıda sağ.
 */
import * as React from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { useFonts } from 'expo-font';
import Svg, { Polygon, Rect } from 'react-native-svg';
import type { GununAyetiGorunumu } from '../../../../core/icerik/gununAyeti';
import { SUS_GEOMETRISI, YAZI_OLCULERI, YAZI_TASARIM_GENISLIGI, type DuvarRenkleri } from '../../../../core/icerik/duvarCizimi';
import type { DuvarKagidiAyari } from '../../../../core/icerik/gununAyetiYuku';
import type { YaziHizasi, YaziTipi } from '../../../../core/icerik/duvarTasarimi';
import { useMetin } from '../../../hooks/useMetin';
import { surumuKoru } from '../../metin/surumuKoru';
import { sagdanSolaCiziliyor } from '../../common/yon';
import { ARAPCA_YAZI_TIPI } from '../AyetGorseli';

/** Duvar kâğıdı yazı tipleri (OFL 1.1, `assets/fonts/OFL.txt`); yüklenmeyen sistem yazı tipine düşer. */
export function useDuvarYaziTipleri(): { arapca?: string; klasik?: string; zarif?: string } {
  const [yuklendi] = useFonts({
    [ARAPCA_YAZI_TIPI]: require('../../../../../assets/fonts/AmiriQuran-Regular.ttf'),
    NotoSerif: require('../../../../../assets/fonts/NotoSerif-Regular.ttf'),
    Amiri: require('../../../../../assets/fonts/Amiri-Regular.ttf'),
  });
  return yuklendi ? { arapca: ARAPCA_YAZI_TIPI, klasik: 'NotoSerif', zarif: 'Amiri' } : {};
}

export const yaziTipiAdi = (tip: YaziTipi, f: { klasik?: string; zarif?: string }): string | undefined =>
  tip === 'klasik' ? f.klasik : tip === 'zarif' ? f.zarif : undefined;

/** Hizanın fiziksel karşılığı. */
export const fizikselHiza = (hiza: YaziHizasi, sagdanSola: boolean): 'left' | 'center' | 'right' =>
  hiza === 'orta' ? 'center' : (hiza === 'bas') !== sagdanSola ? 'left' : 'right';

/** Yazı bloğunun yan payı (genişlik kesri). */
export const yaziYanPayi = (ayar: Pick<DuvarKagidiAyari, 'sus'>): number =>
  ayar.sus.tur === 'mihrap' ? SUS_GEOMETRISI.mihrap.yaziYanPayi : YAZI_OLCULERI.yanBosluk / YAZI_TASARIM_GENISLIGI;

interface Props {
  ayet: GununAyetiGorunumu;
  ayar: DuvarKagidiAyari;
  /** Sahnenin (ekranın) genişliği. */
  genislik: number;
  renk: DuvarRenkleri;
  yaziTipleri: { arapca?: string; klasik?: string; zarif?: string };
  onLayout?: (e: LayoutChangeEvent) => void;
}

export const DuvarYazisi: React.FC<Props> = ({ ayet, ayar, genislik, renk, yaziTipleri, onLayout }) => {
  const m = useMetin().gununAyeti;
  const s = (genislik / YAZI_TASARIM_GENISLIGI) * ayar.yazi.olcek;
  const arapcaGorunur = ayar.arapca || !ayet.meal;
  const rtl = sagdanSolaCiziliyor();
  const hiza = fizikselHiza(ayar.yazi.hiza, rtl);
  const arapcaHiza = ayar.yazi.hiza === 'orta' ? 'center' : fizikselHiza(ayar.yazi.hiza, true);
  const kucukYildiz = ayar.sus.tur === 'yildiz' && !arapcaGorunur;
  const atif = [ayet.mealKaynagi, arapcaGorunur ? m.arapcaKaynagi : null].filter(Boolean).join(' · ');
  const yildizBoyu = YAZI_OLCULERI.kucukYildiz * s;
  const yildizHizasi = hiza === 'center' ? 'center' : hiza === 'left' ? 'flex-start' : 'flex-end';
  const mealBoyu = (arapcaGorunur ? YAZI_OLCULERI.mealArapcali : YAZI_OLCULERI.meal) * s;

  return (
    <View testID="duvar-yazi" onLayout={onLayout} style={{ width: genislik * (1 - 2 * yaziYanPayi(ayar)) }}>
      {kucukYildiz ? (
        <View style={{ alignItems: yildizHizasi }}>
          <Svg width={yildizBoyu} height={yildizBoyu} viewBox="0 0 24 24">
            <Rect x={5} y={5} width={14} height={14} fill="none" stroke={renk.kunye} strokeOpacity={renk.kunyeOpaklik} strokeWidth={SUS_GEOMETRISI.yildiz.kucukKalinlik} />
            <Polygon points="12,2.1 21.9,12 12,21.9 2.1,12" fill="none" stroke={renk.kunye} strokeOpacity={renk.kunyeOpaklik} strokeWidth={SUS_GEOMETRISI.yildiz.kucukKalinlik} />
          </Svg>
        </View>
      ) : null}
      {arapcaGorunur ? (
        // rakamKoru: Tanzil metni birebir; metin kapısı (rakam, Urduca yazı tipi) dokunmaz.
        <Text
          rakamKoru
          style={{
            fontFamily: yaziTipleri.arapca,
            fontSize: YAZI_OLCULERI.arapca * s,
            lineHeight: YAZI_OLCULERI.arapca * s * 1.75,
            textAlign: arapcaHiza,
            writingDirection: 'rtl',
            color: renk.metin,
          }}
        >
          {ayet.ar}
        </Text>
      ) : null}
      {ayet.meal ? (
        <Text
          style={{
            fontFamily: yaziTipiAdi(ayar.yazi.tip, yaziTipleri),
            fontSize: mealBoyu,
            lineHeight: mealBoyu * 1.4,
            marginTop: arapcaGorunur ? 6 * s : kucukYildiz ? 10 * s : 0,
            textAlign: hiza,
            color: renk.metin,
          }}
        >
          {ayet.meal}
        </Text>
      ) : null}
      <Text
        style={{
          fontSize: YAZI_OLCULERI.kunye * s,
          letterSpacing: YAZI_OLCULERI.kunye * s * 0.04,
          marginTop: (arapcaGorunur ? 14 : 18) * s,
          textAlign: hiza,
          color: renk.kunye,
          opacity: renk.kunyeOpaklik,
        }}
      >
        {ayet.kisaKunye}
      </Text>
      {atif ? (
        <Text
          style={{
            fontSize: YAZI_OLCULERI.atif * Math.max(0.9, ayar.yazi.olcek) * (genislik / YAZI_TASARIM_GENISLIGI),
            marginTop: 6 * s,
            textAlign: hiza,
            color: renk.atif,
            opacity: renk.atifOpaklik,
          }}
        >
          {surumuKoru(atif, ayet.mealSurumu)}
        </Text>
      ) : null}
    </View>
  );
};
