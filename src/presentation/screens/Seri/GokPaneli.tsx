/**
 * GokPaneli — ayın takımyıldızı (Faz 1: STATİK, animasyon yok).
 *
 * Ayın tamamı TEK bir `<Svg>` içinde çizilir (35 ayrı bileşen DEĞİL) — hücre
 * merkezleri `gokYerlesimi` ile panel genişliğinden HESAPLANIR, ölçülmez.
 * Panel genişliği yalnız BİR KEZ `onLayout` ile alınır; genişlik gelmeden
 * (0 iken) Svg hiç çizilmez.
 *
 * Görsel referans BAĞLAYICIDIR:
 * `docs/tasarim/2026-07-29-seri-sekmesi-takimyildizi-referans.html`
 * (`yildiz()`, `cizgileriCiz()`). Referansın yıldızı kendi -24..24 (48
 * birimlik) viewBox'ında, 34px'lik sabit bir kutuda çiziliyor; burada aynı
 * ham sayısal sabitler `<G transform="translate(merkez) scale(olcek)">` ile
 * yeniden kullanılıyor — `olcek = (hucreGenislik * YILDIZ_OLCEK_PAYI) / 48`
 * referanstaki 48-birim viewBox'ı responsive hücre genişliğine ölçekler.
 *
 * Katman sırası (alttan üste, spec §1 "Gök paneli" + brief):
 *   1. gök zemini (Defs + RadialGradient×2 + LinearGradient)
 *   2. zincir bağları (Path, `bagYolu`'ndan)
 *   3. yıldızlar (durum tablosuna göre, spec §1)
 *   4. gün numaraları (aynı tuvalde Text, dy ile elle hizalanmış)
 *
 * PARLAMA: `filter`/`FeGaussianBlur` KULLANILMAZ (Android'de yaklaşık ve
 * sınırlı — deprecated RenderScript, yarıçap 25'e sabit). Hâle `RadialGradient`
 * dolgulu daire ile kurulur (merkezde renk -> kenarda şeffaf); ışın parlaması
 * parlak ince çizginin ALTINA kalın + düşük opaklıklı ikinci çizgi ile.
 *
 * 5/5 (`tam`) ile hedef-tuttu arasındaki fark CİNS farkıdır — 5/5'te
 * hüzmeler + çift halka + beyaz-sıcak çekirdek + güçlü hâle; hedef-tuttu'da
 * yalnız halka VAR, IŞIMA YOK. İkisini yaklaştırmak tasarımın ana fikrini
 * yok eder (spec §1).
 */
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text as RnText, LayoutChangeEvent } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Line,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { useRenkler } from '../../../core/theme';
import { GOK_TONLARI } from './sabitler';
import { gokYerlesimi, bagYolu, GokOlculeri, Nokta } from '../../../core/seri/gokGeometrisi';
import { IzgaraGunu, GunDurumu } from '../../../core/seri/aylikIzgara';
import { ZincirBagi } from '../../../core/seri/zincir';
import { gokErisimEtiketi } from '../../../core/seri/gokErisimEtiketi';
import { gunTamMi } from '../../../core/seri/gunTamMi';

export interface GokPaneliProps {
  /** `aylikIzgaraOlustur` çıktısı — 28/35/42 hücre. */
  izgara: IzgaraGunu[];
  /** `zincirBaglari` çıktısı. */
  zincirler: ZincirBagi[];
  /** Görüntülenen ayın adı (ör. "Temmuz 2026"). */
  ayAdi: string;
  /** `namazGunuHesapla`'dan gelen ISO tarih — "gelecek" işaretlemesi ve
   * bugünün karesi bu değere göre belirlenir. */
  bugun: string;
  /** Tam gün eşiği (`seriSlice.ayarlar.tamGunEsigi`). */
  tamGunEsigi: number;
  /** Motorun güncel seri sayısı — yalnız erişim etiketinde kullanılır. */
  mevcutSeri: number;
}

// ── Geometri sabitleri ───────────────────────────────────────────────────
const SUTUN_SAYISI = 7;
const PANEL_UST_PAY = 14;
const PANEL_YATAY_PAY = 10;
const SATIR_ARALIGI = 16;
const PANEL_KOSE_YARICAPI = 16;

// Yıldızın referanstaki 48 birimlik (-24..24) viewBox'ı hücrenin bu oranını
// kaplar (referansta 34px'lik yıldız kutusu ~47px'lik hücre içinde, ~%72
// dolulukla; burada nefes payı biraz daha cömert bırakıldı — kesin px
// eşleşmesi bu fazın kapsamı dışında, bkz. global-constraints.md).
const YILDIZ_OLCEK_PAYI = 0.8;

// Zincir bağının satır-sarması eğrisinde kontrol noktası uzaklığı, hücre
// genişliğine oranla (referans ~47px hücrede 13/11px -> ~0.28/0.24).
const BOSLUK_TAM_ORANI = 0.28;
const BOSLUK_NORMAL_ORANI = 0.24;

// Bugünün karesi.
const BUGUN_CERCEVE_INSET_ORANI = 0.06;
const BUGUN_CERCEVE_KOSE_ORANI = 0.2;

// Gün numarası.
const GUN_NUMARASI_FONT_ORANI = 0.18;
const GUN_NUMARASI_ALT_PAY_ORANI = 0.08;

/** Beş ışın, sabah tepede saat yönünde (spec §1). */
const ISIN_ACILARI = [-90, -18, 54, 126, 198];

/** Haftanın günleri, pazartesiden başlar (ızgara pazartesi başlıyor). */
const GUN_HARFLERI = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];

function derece(a: number): number {
  return (a * Math.PI) / 180;
}

interface YildizIcerigiProps {
  durum: GunDurumu;
  tamGunEsigi: number;
  birincil: string;
}

/** Tek bir günün yıldız görselini üretir — koordinatlar (0,0) merkezli,
 * konumlama/ölçek dış `<G transform>` tarafından uygulanır. */
const YildizIcerigi: React.FC<YildizIcerigiProps> = ({ durum, tamGunEsigi, birincil }) => {
  if (durum.tip === 'gelecek') {
    return <Circle cx={0} cy={0} r={1.4} fill={GOK_TONLARI.NOKTA_GELECEK} />;
  }

  if (durum.tip === 'dondurulmus') {
    return (
      <>
        <Circle
          cx={0}
          cy={0}
          r={8.5}
          fill="none"
          stroke={GOK_TONLARI.DONDURULMUS}
          strokeWidth={1.5}
          strokeDasharray="2 3.2"
          opacity={0.85}
        />
        <Circle cx={0} cy={0} r={2.4} fill={GOK_TONLARI.DONDURULMUS} opacity={0.9} />
      </>
    );
  }

  const kilinanSayisi = durum.vakitler.filter(Boolean).length;
  const tam = kilinanSayisi === 5;
  const hedefTuttu = gunTamMi(kilinanSayisi, tamGunEsigi);

  return (
    <>
      {tam && (
        <>
          {/* Hâle: RadialGradient dolgulu daireler — filter/blur DEĞİL (spec §3.2). */}
          <Circle cx={0} cy={0} r={17} fill="url(#disBloom)" />
          <Circle cx={0} cy={0} r={9} fill="url(#icBloom)" />
          {ISIN_ACILARI.map((aci, i) => {
            const rad = derece(aci);
            return (
              <Line
                key={`huzme-${i}`}
                x1={Math.cos(rad) * 4}
                y1={Math.sin(rad) * 4}
                x2={Math.cos(rad) * 19}
                y2={Math.sin(rad) * 19}
                stroke={GOK_TONLARI.ISIK}
                strokeWidth={0.7}
                strokeLinecap="round"
                opacity={0.55}
              />
            );
          })}
        </>
      )}

      {ISIN_ACILARI.map((aci, i) => {
        const rad = derece(aci);
        const acik = durum.vakitler[i];
        const uzunluk = acik ? (tam ? 14 : 11) : 7;
        const x2 = Math.cos(rad) * uzunluk;
        const y2 = Math.sin(rad) * uzunluk;
        return (
          <React.Fragment key={`isin-${i}`}>
            {/* Işın parlaması: parlak çizginin ALTINA kalın + düşük opaklıklı ikinci çizgi. */}
            {acik && (
              <Line
                x1={0}
                y1={0}
                x2={x2}
                y2={y2}
                stroke={birincil}
                strokeWidth={tam ? 4.4 : 3}
                strokeLinecap="round"
                opacity={tam ? 0.25 : 0.15}
              />
            )}
            <Line
              x1={0}
              y1={0}
              x2={x2}
              y2={y2}
              stroke={acik ? GOK_TONLARI.ISIK : GOK_TONLARI.ISIN_SONUK}
              strokeWidth={acik ? (tam ? 2.2 : 1.5) : 1.1}
              strokeLinecap="round"
              opacity={acik ? (tam ? 1 : 0.72) : 0.85}
            />
          </React.Fragment>
        );
      })}

      <Circle
        cx={0}
        cy={0}
        r={kilinanSayisi === 0 ? 2.1 : tam ? 4.2 : 2.2}
        fill={
          kilinanSayisi === 0
            ? GOK_TONLARI.CEKIRDEK_KILINMAMIS
            : tam
              ? GOK_TONLARI.BEYAZ_CEKIRDEK
              : GOK_TONLARI.ISIK
        }
      />

      {tam && (
        <>
          <Circle cx={0} cy={0} r={16} fill="none" stroke={GOK_TONLARI.ISIK} strokeWidth={0.7} opacity={0.45} />
          <Circle cx={0} cy={0} r={19} fill="none" stroke={birincil} strokeWidth={0.6} opacity={0.3} />
        </>
      )}
      {!tam && hedefTuttu && (
        <Circle cx={0} cy={0} r={15} fill="none" stroke={GOK_TONLARI.ISIK} strokeWidth={0.7} opacity={0.3} />
      )}
    </>
  );
};

export const GokPaneli: React.FC<GokPaneliProps> = ({
  izgara,
  zincirler,
  ayAdi,
  bugun,
  tamGunEsigi,
  mevcutSeri,
}) => {
  const renkler = useRenkler();
  const [panelGenislik, setPanelGenislik] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const genislik = e.nativeEvent.layout.width;
    setPanelGenislik((onceki) => (Math.abs(onceki - genislik) < 0.5 ? onceki : genislik));
  }, []);

  const satirSayisi = Math.max(1, Math.ceil(izgara.length / SUTUN_SAYISI));

  const olculer: GokOlculeri = useMemo(
    () => ({
      panelGenislik,
      satirSayisi,
      yatayPay: PANEL_YATAY_PAY,
      ustPay: PANEL_UST_PAY,
      satirAraligi: SATIR_ARALIGI,
    }),
    [panelGenislik, satirSayisi]
  );

  const yerlesim = useMemo(() => gokYerlesimi(olculer), [olculer]);

  const erisimEtiketi = useMemo(
    () => gokErisimEtiketi(izgara, ayAdi, mevcutSeri, tamGunEsigi),
    [izgara, ayAdi, mevcutSeri, tamGunEsigi]
  );

  const olcek = (yerlesim.hucreGenislik * YILDIZ_OLCEK_PAYI) / 48;

  return (
    <View>
      <View className="flex-row items-center justify-between px-1.5 pb-2">
        <RnText style={{ fontSize: 13, fontWeight: '600', color: GOK_TONLARI.AY_ADI }}>{ayAdi}</RnText>
      </View>
      <View className="flex-row px-1.5 mb-0.5">
        {GUN_HARFLERI.map((harf, i) => (
          <RnText
            key={`gun-adi-${i}`}
            className="flex-1 text-center"
            style={{ fontSize: 9.5, color: GOK_TONLARI.GUN_ADI, letterSpacing: 0.5 }}
          >
            {harf}
          </RnText>
        ))}
      </View>

      <View
        testID="gok-paneli-govde"
        onLayout={onLayout}
        accessible
        accessibilityRole="image"
        accessibilityLabel={erisimEtiketi}
        style={
          panelGenislik > 0
            ? { height: yerlesim.toplamYukseklik, borderRadius: PANEL_KOSE_YARICAPI, overflow: 'hidden' }
            : { borderRadius: PANEL_KOSE_YARICAPI, overflow: 'hidden' }
        }
      >
        {panelGenislik > 0 && (
          <Svg width={panelGenislik} height={yerlesim.toplamYukseklik}>
            <Defs>
              {/* Gök zemini — CSS radial-gradient'in RN karşılığı (spec §3.3). */}
              <LinearGradient id="zeminTaban" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={GOK_TONLARI.ZEMIN_ORTA} />
                <Stop offset="1" stopColor={GOK_TONLARI.ZEMIN_KOYU} />
              </LinearGradient>
              <RadialGradient id="zeminSolUst" cx="22%" cy="8%" r="85%">
                <Stop offset="0" stopColor={GOK_TONLARI.ZEMIN_VURGU_SOL_UST} stopOpacity={1} />
                <Stop offset="1" stopColor={GOK_TONLARI.ZEMIN_VURGU_SOL_UST} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="zeminSagAlt" cx="88%" cy="95%" r="75%">
                <Stop offset="0" stopColor={GOK_TONLARI.ZEMIN_VURGU_SAG_ALT} stopOpacity={1} />
                <Stop offset="1" stopColor={GOK_TONLARI.ZEMIN_VURGU_SAG_ALT} stopOpacity={0} />
              </RadialGradient>
              {/* Yıldız hâlesi — merkezde renk, kenarda şeffaf (blur DEĞİL, spec §3.2). */}
              <RadialGradient id="disBloom">
                <Stop offset="0" stopColor={renkler.birincil} stopOpacity={0.5} />
                <Stop offset="1" stopColor={renkler.birincil} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="icBloom">
                <Stop offset="0" stopColor={GOK_TONLARI.ISIK} stopOpacity={0.6} />
                <Stop offset="1" stopColor={GOK_TONLARI.ISIK} stopOpacity={0} />
              </RadialGradient>
            </Defs>

            {/* 1) Gök zemini */}
            <Rect x={0} y={0} width={panelGenislik} height={yerlesim.toplamYukseklik} fill="url(#zeminTaban)" />
            <Rect x={0} y={0} width={panelGenislik} height={yerlesim.toplamYukseklik} fill="url(#zeminSolUst)" />
            <Rect x={0} y={0} width={panelGenislik} height={yerlesim.toplamYukseklik} fill="url(#zeminSagAlt)" />

            {/* 2) Zincir bağları — stil (brief'ten birebir): ikisiTam kalın (1.9) ve
                parlak (0.62); normal ince (0.9/0.3); satır sarması ince (0.9/0.16). */}
            {zincirler.map((bag) => {
              const a: Nokta = yerlesim.merkez(bag.indeks);
              const b: Nokta = yerlesim.merkez(bag.indeks + 1);

              let yol: string;
              let kalinlik: number;
              let opaklik: number;
              if (bag.satirSarmasi) {
                const satirA = Math.floor(bag.indeks / SUTUN_SAYISI);
                const satirB = satirA + 1;
                const altA =
                  olculer.ustPay + (yerlesim.hucreGenislik + olculer.satirAraligi) * satirA + yerlesim.hucreGenislik;
                const ustB = olculer.ustPay + (yerlesim.hucreGenislik + olculer.satirAraligi) * satirB;
                const seritY = (altA + ustB) / 2;
                const bosluk = yerlesim.hucreGenislik * (bag.ikisiTam ? BOSLUK_TAM_ORANI : BOSLUK_NORMAL_ORANI);
                yol = bagYolu(a, b, true, seritY, bosluk);
                kalinlik = 0.9;
                opaklik = 0.16;
              } else {
                yol = bagYolu(a, b, false, 0, 0);
                kalinlik = bag.ikisiTam ? 1.9 : 0.9;
                opaklik = bag.ikisiTam ? 0.62 : 0.3;
              }

              return (
                <Path
                  key={`bag-${bag.indeks}`}
                  d={yol}
                  fill="none"
                  stroke={GOK_TONLARI.ISIK}
                  strokeWidth={kalinlik}
                  strokeOpacity={opaklik}
                  strokeLinecap="round"
                />
              );
            })}

            {/* 3) Yıldızlar */}
            {izgara.map((gun, i) => {
              const merkez = yerlesim.merkez(i);
              return (
                <G
                  key={gun.tarih}
                  transform={`translate(${merkez.x} ${merkez.y}) scale(${olcek})`}
                  opacity={gun.digerAy ? 0.42 : 1}
                >
                  {gun.tarih === bugun && (
                    <Rect
                      x={-24 + BUGUN_CERCEVE_INSET_ORANI * 48}
                      y={-24 + BUGUN_CERCEVE_INSET_ORANI * 48}
                      width={48 - 2 * BUGUN_CERCEVE_INSET_ORANI * 48}
                      height={48 - 2 * BUGUN_CERCEVE_INSET_ORANI * 48}
                      rx={48 * BUGUN_CERCEVE_KOSE_ORANI}
                      fill="none"
                      stroke={renkler.birincil}
                      strokeWidth={1.4}
                      opacity={0.4}
                    />
                  )}
                  <YildizIcerigi durum={gun.durum} tamGunEsigi={tamGunEsigi} birincil={renkler.birincil} />
                </G>
              );
            })}

            {/* 4) Gün numaraları — dikey hizalama dy ile ELLE yapılır (alignmentBaseline
                Android'de atipik/kısmi). y hücrenin alt kenarına yakın hedef noktayı verir,
                dy o noktadan taban çizgisini fontun ~%35'i kadar aşağı iterek metni görsel
                olarak ortalar (SVG text varsayılan olarak taban çizgisine hizalanır). */}
            {izgara.map((gun, i) => {
              const merkez = yerlesim.merkez(i);
              const isGelecek = gun.durum.tip === 'gelecek';
              const opaklik = gun.digerAy ? 0.4 : isGelecek ? 0.45 : 1;
              const fontBoyutu = yerlesim.hucreGenislik * GUN_NUMARASI_FONT_ORANI;
              return (
                <SvgText
                  key={`gun-no-${gun.tarih}`}
                  x={merkez.x}
                  y={merkez.y + yerlesim.hucreGenislik / 2 - yerlesim.hucreGenislik * GUN_NUMARASI_ALT_PAY_ORANI}
                  dy={fontBoyutu * 0.35}
                  fontSize={fontBoyutu}
                  fill={GOK_TONLARI.GUN_NUMARASI}
                  opacity={opaklik}
                  textAnchor="middle"
                >
                  {gun.gunNo}
                </SvgText>
              );
            })}
          </Svg>
        )}
      </View>
    </View>
  );
};
