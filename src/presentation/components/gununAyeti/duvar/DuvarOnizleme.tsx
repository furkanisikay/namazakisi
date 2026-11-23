/**
 * Bir ekranın (kilit/ana) duvar kâğıdı önizlemesi: sahne + yazı. Yerleşim native çiziciyle AYNI
 * kuralla (`DuvarKagidiCizici.duzenBul`): blok ölçülür, `yaziYerlesimi` ile istenen merkeze en yakın
 * izinli banda (`izinliBantlar`: kilit ekranında ayardaki saat alanına göre) oturur; sığmazsa
 * yazı boyu `KUCULTME_ADIMLARI` ile küçültülüp satırlar YENİDEN kırılır,
 * en küçükte de sığmazsa Arapça düşer ve küçültme baştan denenir; yine sığmazsa son blok en geniş
 * bandın üstüne yaslanır. Ölçüm görünmeyen bir kopyada yapılır (görünen yazı denemeler sırasında
 * yanıp sönmez). Ayar sayfasındaki küçük önizlemeler ve düzenleyicinin tuvali aynı bileşendir.
 */
import * as React from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import type { GununAyetiGorunumu } from '../../../../core/icerik/gununAyeti';
import { izinliBantlar, yaziYerlesimi, type DuvarEkrani, type DuvarPlatformu } from '../../../../core/icerik/duvarTasarimi';
import { duvarRenkleri, etkinSaatAlani, istenenMerkez, KUCULTME_ADIMLARI } from '../../../../core/icerik/duvarCizimi';
import type { DuvarKagidiAyari } from '../../../../core/icerik/gununAyetiYuku';
import { SOLDAN_SAGA } from '../../common/yon';
import { DuvarSahnesi, type FotoKaynagi, type YaziKutusu } from './DuvarSahnesi';
import { DuvarYazisi, yaziYanPayi } from './DuvarYazisi';

export interface DuvarOnizlemeProps {
  genislik: number;
  yukseklik: number;
  ayar: DuvarKagidiAyari;
  ayet: GununAyetiGorunumu;
  ekran: DuvarEkrani;
  platform: DuvarPlatformu;
  foto: FotoKaynagi | null;
  yaziTipleri: { arapca?: string; klasik?: string; zarif?: string };
  kimlik: string;
  /** Yerleşen blok yüksekliği (ekran kesri) değişince. */
  onBlokYuksekligi?: (kesir: number) => void;
  /** Sahnenin üstüne çizilen katman (düzenleyicinin saat hayaleti, kılavuzlar). */
  children?: React.ReactNode;
}

interface Aday {
  carpan: number;
  arapca: boolean;
}
const adayAdi = (a: Aday) => `${a.carpan}|${a.arapca ? 1 : 0}`;

export const DuvarOnizleme: React.FC<DuvarOnizlemeProps> = ({
  genislik: g,
  yukseklik: y,
  ayar,
  ayet,
  ekran,
  platform,
  foto,
  yaziTipleri,
  kimlik,
  onBlokYuksekligi,
  children,
}) => {
  const etkin: DuvarKagidiAyari = ayar.zemin === 'foto' && !foto ? { ...ayar, zemin: 'gece' } : ayar;
  const renk = duvarRenkleri(etkin);
  const merkez = istenenMerkez(ayar, ekran, platform);
  const bantlar = izinliBantlar(platform, ekran, ayar.saatAlani);
  const saatAlani = etkinSaatAlani(ayar, ekran, platform);
  const ilkArapca = ayar.arapca || !ayet.meal;

  // Native sırası: önce seçili Arapça ile her küçültme adımı, sonra (mealliyse) Arapçasız aynı dizi.
  const adaylar = React.useMemo<Aday[]>(() => {
    const ilk = KUCULTME_ADIMLARI.map((carpan) => ({ carpan, arapca: ilkArapca }));
    return ilkArapca && ayet.meal ? [...ilk, ...KUCULTME_ADIMLARI.map((carpan) => ({ carpan, arapca: false }))] : ilk;
  }, [ilkArapca, ayet.meal]);

  // Blok yüksekliği yalnız yazının kırılışına bağlıdır (merkez/ekran/yükseklik DEĞİL): ölçüler bu
  // anahtarla saklanır, yerleşim her çizimde ölçülerden hesaplanır (sürüklemede yeniden ölçüm yok).
  const metinAnahtari = [g, ayar.yazi.olcek, ayar.yazi.tip, ayar.sus.tur, ayet.ar, ayet.meal, ayet.kisaKunye, yaziTipleri.arapca, yaziTipleri.klasik, yaziTipleri.zarif].join('|');
  const [olcumler, setOlcumler] = React.useState<{ anahtar: string; h: Record<string, number> }>({ anahtar: metinAnahtari, h: {} });
  const olculen = olcumler.anahtar === metinAnahtari ? olcumler.h : {};

  let secim: { aday: Aday; h: number; ust: number } | null = null;
  let olculecek: Aday | null = null;
  if (y > 0) {
    for (const aday of adaylar) {
      const h = olculen[adayAdi(aday)];
      if (h === undefined) {
        olculecek = aday;
        break;
      }
      const yer = yaziYerlesimi(merkez, h / y, bantlar);
      if (yer) {
        secim = { aday, h, ust: yer.ust };
        break;
      }
    }
    if (!secim && !olculecek) {
      const son = adaylar[adaylar.length - 1];
      const enGenis = bantlar.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));
      secim = { aday: son, h: olculen[adayAdi(son)], ust: enGenis[0] };
    }
  }
  // Ölçüm sürerken (yazı değişti) son yerleşen blok görünür kalır.
  const sonSecim = React.useRef(secim);
  if (secim) sonSecim.current = secim;
  const gorunen = secim ?? sonSecim.current;

  const olc = React.useCallback(
    (aday: Aday, anahtar: string) => (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      setOlcumler((o) => {
        const temel = o.anahtar === anahtar ? o.h : {};
        return temel[adayAdi(aday)] === h ? o : { anahtar, h: { ...temel, [adayAdi(aday)]: h } };
      });
    },
    []
  );

  const yerlesenBlok = secim && y > 0 ? secim.h / y : null;
  React.useEffect(() => {
    if (yerlesenBlok !== null) onBlokYuksekligi?.(yerlesenBlok);
  }, [yerlesenBlok, onBlokYuksekligi]);

  const pay = yaziYanPayi(ayar);
  const kutu: YaziKutusu | null = gorunen && y > 0 ? [pay, gorunen.ust, 1 - pay, gorunen.ust + gorunen.h / y] : null;
  const yaziOrtak = { ayet, ayar: etkin, genislik: g, renk, yaziTipleri };

  return (
    <View style={[SOLDAN_SAGA, { width: g, height: y, overflow: 'hidden' }]}>
      <DuvarSahnesi genislik={g} yukseklik={y} ayar={ayar} kutu={kutu} foto={foto} kimlik={kimlik} saatAlani={saatAlani} />
      {/* Ölçüm kopyası: görünmez; her aday için yeniden kurulur (anahtar), böylece onLayout hep gelir. */}
      {olculecek ? (
        <View
          key={`${metinAnahtari}#${adayAdi(olculecek)}`}
          pointerEvents="none"
          style={{ position: 'absolute', left: pay * g, top: 0, opacity: 0 }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <DuvarYazisi {...yaziOrtak} carpan={olculecek.carpan} arapca={olculecek.arapca} onLayout={olc(olculecek, metinAnahtari)} testID="duvar-yazi-olcum" />
        </View>
      ) : null}
      {gorunen ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: pay * g, top: gorunen.ust * y }}>
          <DuvarYazisi {...yaziOrtak} carpan={gorunen.aday.carpan} arapca={gorunen.aday.arapca} />
        </View>
      ) : null}
      {children}
    </View>
  );
};
