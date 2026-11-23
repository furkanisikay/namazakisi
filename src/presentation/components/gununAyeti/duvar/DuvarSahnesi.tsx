/**
 * Duvar kâğıdının ZEMİNİ ve SÜSÜ: vakit göğü (`GOK_SAHNELERI` verisinden), düz zemin ya da
 * kullanıcının fotoğrafı; üstüne süs (mihrap, yıldız, girih). Yazı ayrı katmandır
 * (`DuvarYazisi`); gök cismi yazı kutusuna ve kilit ekranının saat alanına değmeyen ilk adaya konur
 * (`cisimKonumuSec`). Mihrap kemeri saat alanında `saatSolmasi` ile solar (dikey geçiş maskesi),
 * kemerin yıldızı saat alanına değiyorsa çizilmez (`saateDegiyor`).
 *
 * Sahne fiziksel bir resimdir: sağdan sola arayüzde aynalanmaz (`SOLDAN_SAGA`).
 */
import * as React from 'react';
import { Image, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Mask, Path, Pattern, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { GOK_SAHNELERI, cisimKonumuSec, saateDegiyor, type GokSahnesi, type SaatAlani } from '../../../../core/icerik/duvarTasarimi';
import {
  PERDE_GEOMETRISI,
  SUS_GEOMETRISI,
  besKoseliYildiz,
  duvarRenkleri,
  fotoYerlesimi,
  gokMu,
  saatSolmasiDuraklari,
  susCarpani,
  type DuvarRenkleri,
} from '../../../../core/icerik/duvarCizimi';
import type { DuvarKagidiAyari } from '../../../../core/icerik/gununAyetiYuku';
import { SOLDAN_SAGA } from '../../common/yon';

/** Yazı kutusu (ekran kesri): x1, y1, x2, y2. */
export type YaziKutusu = readonly [number, number, number, number];

export interface FotoKaynagi {
  uri: string;
  genislik: number;
  yukseklik: number;
}

interface Props {
  genislik: number;
  yukseklik: number;
  ayar: DuvarKagidiAyari;
  /** Yazının kutusu; `null` = yazı yok (küçük tema karesi). */
  kutu: YaziKutusu | null;
  /** Fotoğraf zemini için çözülmüş dosya; yoksa gece zeminine düşer (native ile aynı). */
  foto?: FotoKaynagi | null;
  /** Süs çizilsin mi (küçük tema karelerinde hayır). */
  susGoster?: boolean;
  /** Ayrı tanımlar (aynı ekranda birden çok sahne varsa çakışmasın). */
  kimlik: string;
  /** Kilit ekranının saat alanı (`etkinSaatAlani`); `null` = saat yok (ana ekran, küçük kareler). */
  saatAlani?: SaatAlani | null;
}

const yuzde = (v: number) => Math.min(1, Math.max(0, v));

function GokKatmani({
  sahne,
  g,
  y,
  kutu,
  kimlik,
  saatAlani,
}: {
  sahne: GokSahnesi;
  g: number;
  y: number;
  kutu: YaziKutusu | null;
  kimlik: string;
  saatAlani: SaatAlani | null;
}) {
  const konum = sahne.cisim ? cisimKonumuSec(sahne.cisim, kutu, y / Math.max(1, g), saatAlani) : null;
  const c = sahne.cisim;
  const cx = konum ? konum[0] * g : 0;
  const cy = konum ? konum[1] * y : 0;
  return (
    <>
      <Defs>
        <LinearGradient id={`${kimlik}-gok`} x1="0" y1="0" x2="0" y2="1">
          {sahne.gradyan.map((d) => (
            <Stop key={d.konum} offset={d.konum} stopColor={d.renk} />
          ))}
        </LinearGradient>
        {c && konum && c.isimaR ? (
          <RadialGradient id={`${kimlik}-isima`} cx={cx} cy={cy} r={c.isimaR * g} gradientUnits="userSpaceOnUse">
            <Stop offset={0} stopColor={c.isimaRenk ?? c.renk} stopOpacity={c.isimaOpaklik ?? 1} />
            <Stop offset={1} stopColor={c.isimaRenk ?? c.renk} stopOpacity={0} />
          </RadialGradient>
        ) : null}
        {c && konum && c.tur === 'hilal' ? (
          <Mask id={`${kimlik}-hilal`} maskUnits="userSpaceOnUse" x={0} y={0} width={g} height={y}>
            <Rect x={0} y={0} width={g} height={y} fill="#000000" />
            <Circle cx={cx} cy={cy} r={c.r * g} fill="#FFFFFF" />
            <Circle cx={cx + (c.kesX ?? 0) * g} cy={cy + (c.kesY ?? 0) * y} r={(c.kesR ?? 0) * g} fill="#000000" />
          </Mask>
        ) : null}
      </Defs>
      <Rect x={0} y={0} width={g} height={y} fill={`url(#${kimlik}-gok)`} />
      {sahne.yildizlar.map((s, i) => (
        <Circle key={i} cx={s.x * g} cy={s.y * y} r={Math.max(0.4, s.r * g)} fill="#FFFFFF" opacity={s.opaklik} />
      ))}
      {c && konum ? (
        <>
          {c.isimaR ? <Circle cx={cx} cy={cy} r={c.isimaR * g} fill={`url(#${kimlik}-isima)`} /> : null}
          {sahne.huzmeler.map((h, i) => (
            <Line key={i} x1={cx} y1={cy} x2={h.x * g} y2={h.y * y} stroke={h.renk} strokeOpacity={h.opaklik} strokeWidth={h.kalinlik * g} />
          ))}
          {c.tur === 'gunes' ? (
            <Circle cx={cx} cy={cy} r={c.r * g} fill={c.renk} opacity={c.opaklik} />
          ) : (
            <Circle cx={cx} cy={cy} r={c.r * g} fill={c.renk} opacity={c.opaklik} mask={`url(#${kimlik}-hilal)`} />
          )}
        </>
      ) : null}
      {sahne.ufuk.map((u, i) => (
        <Polygon key={i} points={u.noktalar.map(([px, py]) => `${px * g},${py * y}`).join(' ')} fill={u.renk} opacity={u.opaklik} />
      ))}
    </>
  );
}

function SusKatmani({
  ayar,
  renk,
  g,
  y,
  kutu,
  kimlik,
  saatAlani,
}: {
  ayar: DuvarKagidiAyari;
  renk: DuvarRenkleri;
  g: number;
  y: number;
  kutu: YaziKutusu | null;
  kimlik: string;
  saatAlani: SaatAlani | null;
}) {
  const carpan = susCarpani(ayar.sus.belirginlik);
  const tur = ayar.sus.tur;
  if (tur === 'yok' || carpan <= 0) return null;
  if (tur === 'girih') {
    const k = SUS_GEOMETRISI.girih;
    const karo = k.karo * g;
    return (
      <>
        <Defs>
          <Pattern id={`${kimlik}-girih`} x={0} y={0} width={karo} height={karo} patternUnits="userSpaceOnUse">
            <G scale={karo / 48}>
              <Path d={k.yol} fill="none" stroke={renk.metin} strokeWidth={k.yildizKalinlik} />
              <Circle cx={24} cy={24} r={k.daireR} fill="none" stroke={renk.metin} strokeWidth={k.daireKalinlik} />
            </G>
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width={g} height={y} fill={`url(#${kimlik}-girih)`} opacity={yuzde(k.opaklik * carpan)} />
      </>
    );
  }
  if (tur === 'yildiz') {
    const k = SUS_GEOMETRISI.yildiz;
    const b = k.birim * g;
    const [ox, oy] = ayar.zemin === 'gece' ? k.konum.gece : ayar.zemin === 'kagit' ? k.konum.kagit : ayar.zemin === 'palet' ? k.konum.palet : k.konum.diger;
    const cx = ox * g;
    const cy = oy * y;
    const ortak = { fill: 'none', stroke: renk.sus, strokeWidth: k.kalinlik * b, strokeLinejoin: 'round' as const };
    return (
      <G opacity={yuzde(renk.susOpaklik * carpan)}>
        <Rect x={cx - k.yariKenar * b} y={cy - k.yariKenar * b} width={2 * k.yariKenar * b} height={2 * k.yariKenar * b} {...ortak} />
        <Polygon points={`${cx},${cy - k.kosegen * b} ${cx + k.kosegen * b},${cy} ${cx},${cy + k.kosegen * b} ${cx - k.kosegen * b},${cy}`} {...ortak} />
        <Circle cx={cx} cy={cy} r={k.daireR * b} {...ortak} />
      </G>
    );
  }
  // Mihrap: yazı kutusunu çevreleyen kemer (kutu yoksa çizilmez).
  if (!kutu) return null;
  const m = SUS_GEOMETRISI.mihrap;
  const ust = kutu[1] * y;
  const kemer = (k: { yanPay: number; merkezAlti: number; r: number }) => {
    const sol = k.yanPay * g;
    const sag = g - k.yanPay * g;
    const my = ust + k.merkezAlti * g;
    return `M${sol} ${y} V${my} A${k.r * g} ${k.r * g} 0 0 1 ${sag} ${my} V${y}`;
  };
  // Kemer saat alanına girerken solar: maske, `saatSolmasi`'nı kırılma noktalarında örnekleyen dikey geçiştir.
  const duraklar = saatSolmasiDuraklari(saatAlani);
  const yildizY = ust - m.yildiz.merkezUstu * g;
  // Kapsam çokgenin GERÇEK dikey aralığı (tepe köşe → en alt köşe; native ile aynı), sınır dairesi değil.
  const kose = besKoseliYildiz(g / 2, yildizY, m.yildiz.disR * g, m.yildiz.icR * g)
    .split(' ')
    .map((n) => Number(n.split(',')[1]));
  const yildizVar = y > 0 && !saateDegiyor(Math.min(...kose) / y, Math.max(...kose) / y, saatAlani);
  return (
    <>
      {duraklar ? (
        <Defs>
          <LinearGradient id={`${kimlik}-solma`} x1={0} y1={0} x2={0} y2={y} gradientUnits="userSpaceOnUse">
            {duraklar.map((d) => (
              <Stop key={d.konum} offset={d.konum} stopColor="#FFFFFF" stopOpacity={d.opaklik} />
            ))}
          </LinearGradient>
          <Mask id={`${kimlik}-saat`} maskUnits="userSpaceOnUse" x={0} y={0} width={g} height={y}>
            <Rect x={0} y={0} width={g} height={y} fill={`url(#${kimlik}-solma)`} />
          </Mask>
        </Defs>
      ) : null}
      <G mask={duraklar ? `url(#${kimlik}-saat)` : undefined} testID="duvar-mihrap-kemer">
        <Path d={kemer(m.dis)} fill="none" stroke={renk.metin} strokeOpacity={yuzde(m.dis.opaklik * carpan)} strokeWidth={m.dis.kalinlik * g} />
        <Path d={kemer(m.ic)} fill="none" stroke={renk.metin} strokeOpacity={yuzde(m.ic.opaklik * carpan)} strokeWidth={m.ic.kalinlik * g} />
      </G>
      {yildizVar ? (
        <Polygon
          testID="duvar-mihrap-yildiz"
          points={besKoseliYildiz(g / 2, yildizY, m.yildiz.disR * g, m.yildiz.icR * g)}
          fill={renk.metin}
          opacity={yuzde(m.yildiz.opaklik * carpan)}
        />
      ) : null}
    </>
  );
}

export const DuvarSahnesi: React.FC<Props> = React.memo(({ genislik: g, yukseklik: y, ayar, kutu, foto, susGoster = true, kimlik, saatAlani = null }) => {
  // Fotoğraf dosyası yoksa (silinmiş, başka cihazdan) native gibi gece zeminine düşülür.
  const etkin: DuvarKagidiAyari = ayar.zemin === 'foto' && !foto ? { ...ayar, zemin: 'gece' } : ayar;
  const renk = duvarRenkleri(etkin);
  const fotoYeri = etkin.zemin === 'foto' && foto ? fotoYerlesimi(g, y, foto.genislik, foto.yukseklik, etkin.foto) : null;
  const pay = PERDE_GEOMETRISI.pay * g;
  return (
    <View style={[SOLDAN_SAGA, { width: g, height: y, overflow: 'hidden', backgroundColor: renk.zemin ?? '#000000' }]} pointerEvents="none">
      {fotoYeri && foto ? (
        <>
          <Image
            source={{ uri: foto.uri }}
            blurRadius={etkin.foto.bulaniklik * 0.04 * Math.min(g, y)}
            style={{ position: 'absolute', left: fotoYeri.sol, top: fotoYeri.ust, width: fotoYeri.genislik, height: fotoYeri.yukseklik }}
          />
          <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#000000', opacity: etkin.foto.karartma }} />
        </>
      ) : null}
      <Svg width={g} height={y} style={{ position: 'absolute', left: 0, top: 0 }}>
        {gokMu(etkin.zemin) ? <GokKatmani sahne={GOK_SAHNELERI[etkin.zemin]} g={g} y={y} kutu={kutu} kimlik={kimlik} saatAlani={saatAlani} /> : null}
        {susGoster ? <SusKatmani ayar={etkin} renk={renk} g={g} y={y} kutu={kutu} kimlik={kimlik} saatAlani={saatAlani} /> : null}
        {renk.perde && kutu ? (
          <Rect
            x={kutu[0] * g - pay}
            y={kutu[1] * y - pay}
            width={(kutu[2] - kutu[0]) * g + 2 * pay}
            height={(kutu[3] - kutu[1]) * y + 2 * pay}
            rx={PERDE_GEOMETRISI.yaricap * g}
            fill={renk.perde.renk}
            opacity={renk.perde.opaklik}
          />
        ) : null}
      </Svg>
    </View>
  );
});
DuvarSahnesi.displayName = 'DuvarSahnesi';
