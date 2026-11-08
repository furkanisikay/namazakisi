/**
 * Bir ekranın (kilit/ana) duvar kâğıdı önizlemesi: sahne + yazı. Yazının yeri sözleşmeden
 * (`duvarYazisiYeri` → `yaziYerlesimi` + `IZINLI_BANTLAR`): blok yüksekliği ölçülür, istenen
 * merkeze en yakın izinli banda oturur; hiçbir banda sığmıyorsa sığacak kadar küçülür.
 * Ayar sayfasındaki küçük önizlemeler ve düzenleyicinin tuvali aynı bileşendir.
 */
import * as React from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import type { GununAyetiGorunumu } from '../../../../core/icerik/gununAyeti';
import type { DuvarEkrani, DuvarPlatformu } from '../../../../core/icerik/duvarTasarimi';
import { duvarRenkleri, duvarYazisiYeri, istenenMerkez } from '../../../../core/icerik/duvarCizimi';
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
  /** Ölçülen blok yüksekliği (ekran kesri) değişince. */
  onBlokYuksekligi?: (kesir: number) => void;
  /** Sahnenin üstüne çizilen katman (düzenleyicinin saat hayaleti, kılavuzlar). */
  children?: React.ReactNode;
}

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
  const [blokPx, setBlokPx] = React.useState(0);
  const etkin: DuvarKagidiAyari = ayar.zemin === 'foto' && !foto ? { ...ayar, zemin: 'gece' } : ayar;
  const renk = duvarRenkleri(etkin);
  const blok = y > 0 ? blokPx / y : 0;
  const yer = duvarYazisiYeri(istenenMerkez(ayar, ekran, platform), blok, platform, ekran);
  const pay = yaziYanPayi(ayar);
  const kucukBlok = blok * yer.kucultme;
  const kutu: YaziKutusu | null = blokPx > 0 ? [pay, yer.ust, 1 - pay, yer.ust + kucukBlok] : null;
  const olc = React.useCallback(
    (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      setBlokPx(h);
      if (y > 0) onBlokYuksekligi?.(h / y);
    },
    [onBlokYuksekligi, y]
  );
  // Ölçekte merkez korunur: küçültülmüş bloğun üstü bandın üstüne gelsin diye kaydırılır.
  const ustPx = yer.ust * y - (blokPx * (1 - yer.kucultme)) / 2;

  return (
    <View style={[SOLDAN_SAGA, { width: g, height: y, overflow: 'hidden' }]}>
      <DuvarSahnesi genislik={g} yukseklik={y} ayar={ayar} kutu={kutu} foto={foto} kimlik={kimlik} />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: pay * g,
          top: ustPx,
          opacity: blokPx > 0 ? 1 : 0,
          transform: [{ scale: yer.kucultme }],
        }}
      >
        <DuvarYazisi ayet={ayet} ayar={etkin} genislik={g} renk={renk} yaziTipleri={yaziTipleri} onLayout={olc} />
      </View>
      {children}
    </View>
  );
};
