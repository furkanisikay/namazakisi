/**
 * GokPaneli — ayın takımyıldızı.
 *
 * Faz 2: açılış animasyonu eklendi — zincir bağları sırayla örülür
 * (`AnimasyonluBag`, `strokeDashoffset`), yıldızlar kademeli girer
 * (`AnimasyonluYildiz`, opacity). Zamanlama `acilisCizelgesi` (SAF, core) ile
 * hesaplanır; `GokPaneli` yalnız `oynatildiRef`'i (bir kez oynatma sentinel'i,
 * spec 2c) yönetir ve çocuklara geçirir. `useAnimatedProps`/`useSharedValue`
 * `.map()` içinde çağrılamadığı için (React Hooks kuralı) her bağ/yıldız
 * kendi child bileşenine çıkarıldı — bkz. o dosyaların doc-block'ları.
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
 *   1. gök zemini (Defs + RadialGradient×2 + LinearGradient) — HEADER dahil
 *      panelin TÜM yüksekliğini kaplar
 *   2. zincir bağları (Path, `bagYolu`'ndan)
 *   3. yıldızlar (durum tablosuna göre, spec §1)
 *   4. gün numaraları (aynı tuvalde Text, dy ile elle hizalanmış)
 *   5. ay adı + gün harfleri (aynı tuvalde Text, header payında)
 *
 * Ay adı/gün harfleri (5. katman) BİLİNÇLİ olarak aynı Svg'nin İÇİNDE, koyu
 * zeminin üstünde çizilir — panelin DIŞINDA (RN View/Text ile) ayrı bir
 * header denenmişti ve açık temada okunamıyordu (kontrast tuzağı: `#E8EDF8`
 * neredeyse beyaz zeminde ~1:1 kontrast). Referansta da `.gok-ust`/
 * `.gun-adlari` `.gok`'un koyu zemininin İÇİNDEDİR.
 *
 * PARLAMA: `filter`/`FeGaussianBlur` KULLANILMAZ (Android'de yaklaşık ve
 * sınırlı — deprecated RenderScript, yarıçap 25'e sabit). Hâle `RadialGradient`
 * dolgulu daire ile kurulur (merkezde renk -> kenarda şeffaf); ışın parlaması
 * parlak ince çizginin ALTINA kalın + düşük opaklıklı ikinci çizgi ile.
 *
 * CİHAZ DOĞRULAMASI (2026-07-29) — yıldız anatomisi referanstan sapmıştı,
 * dört düzeltme uygulandı (bkz. `.superpowers/sdd/2026-07-29-seri-faz1/
 * cihaz-fix-report.md`): (1) halka çemberleri artık EN ALTTA (bloom/hüzme/
 * ışından ÖNCE) ve tek katman — dış aksan halkası kaldırıldı, kalan halka
 * düşük opaklıkta; önceden EN ÜSTTE çizilip ışınları/hüzmeleri kesen bir
 * "jeton konturu" gibi okunuyordu. (2) ışının altındaki sahte-parlama çizgisi
 * artık MERKEZDEN DEĞİL, ışının dış yarısından (`ISIN_PARLAMA_IC_YARICAP`)
 * başlıyor — merkezden başlarsa beş ışın orada üst üste binip opak bir kütle
 * oluşturuyordu. (3) `RadialGradient` durakları merkeze yoğunlaşıp kenara
 * doğru ERKEN sönümlenecek şekilde üç-duraklı yapıldı (doğrusal iki-durak
 * geniş bir alanı görünür opaklıkta bırakıp doygun bir disk gibi okunuyordu).
 *
 * 5/5 (`tam`) ile hedef-tuttu arasındaki fark CİNS farkıdır — 5/5'te
 * hüzmeler + yumuşak halka + beyaz-sıcak çekirdek + hâle; hedef-tuttu'da
 * yalnız halka VAR, IŞIMA YOK. İkisini yaklaştırmak tasarımın ana fikrini
 * yok eder (spec §1).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect, G, Text as SvgText } from 'react-native-svg';
import { useRenkler } from '../../../core/theme';
import { GOK_TONLARI, GOK_ZAMANLAMA } from './sabitler';
import { gokYerlesimi, bagYolu, GokOlculeri, Nokta, SUTUN_SAYISI } from '../../../core/seri/gokGeometrisi';
import { IzgaraGunu } from '../../../core/seri/aylikIzgara';
import { ZincirBagi } from '../../../core/seri/zincir';
import { gokErisimEtiketi } from '../../../core/seri/gokErisimEtiketi';
import { acilisCizelgesi } from '../../../core/seri/acilisCizelgesi';
import { AnimasyonluBag } from './AnimasyonluBag';
import { AnimasyonluYildiz } from './AnimasyonluYildiz';

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
// SUTUN_SAYISI artık `core/seri/gokGeometrisi.ts`'den import edilir (tek
// kaynak — önceden burada, zincir.ts'te ve gokGeometrisi.ts'te ayrı ayrı
// tanımlıydı, inceleme bulgusu).
const PANEL_UST_PAY = 14;
const PANEL_YATAY_PAY = 10;
const SATIR_ARALIGI = 16;
const PANEL_KOSE_YARICAPI = 16;

// Ay adı + gün harfleri satırları için ayrılan pay — KOYU PANELİN İÇİNDE
// (aynı Svg'de) çizilir. İnceleme bulgusu: bu iki satır önceden panelin
// DIŞINDA, tema arkaplanı üzerindeydi — açık temada #E8EDF8/#6E7897 neredeyse
// beyaz zeminde okunamıyordu (AGENTS.md'de kayıtlı kontrast tuzağı; referansta
// `.gok-ust`/`.gun-adlari` `.gok`'un koyu zemininin İÇİNDEDİR). Izgara
// katmanı (zincir/yıldız/gün-no) bu kadar aşağı kaydırılır.
const HEADER_YUKSEKLIK = 46;

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

/** Haftanın günleri, pazartesiden başlar (ızgara pazartesi başlıyor). */
const GUN_HARFLERI = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];

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

  // Açılış animasyonu bir kez oynatma sentinel'i (spec 2c). `AnimasyonluBag`/
  // `AnimasyonluYildiz` kendi mount anında bu ref'i okur (lazy state
  // initializer, RENDER sırasında). DİKKAT: bu ref `GokPaneli`'nin KENDİ
  // mount'unda (`useEffect(..., [])`) DEĞİL, `panelGenislik` ilk kez pozitif
  // olduğu commit'te işaretlenir — `Svg` (ve dolayısıyla tüm bağ/yıldız
  // çocukları) yalnız `panelGenislik > 0` iken doğar (`onLayout` asenkron
  // gelir), GokPaneli'nin kendisi ise `panelGenislik` HÂLÂ 0'ken zaten mount
  // olmuş olur. Ref'i erken (GokPaneli'nin kendi mount'unda) işaretlemek,
  // gerçek çocuklar doğduğunda ref'i ÇOKTAN `true` bulmalarına ve HİÇBİRİNİN
  // animasyon oynatmamasına yol açıyordu (jest'te yakalandı — GokPaneli.test.tsx
  // "oynatıldı nöbetçisi"). React aynı commit'te ÖNCE çocukların, SONRA
  // ebeveynin effect'ini çalıştırır — bu yüzden `panelGenislik` bağımlılığı
  // bu ref'in `true`ya dönüşünü, çocukların o commit'teki RENDER'ından (ki ref
  // hâlâ `false` görürler) ve kendi effect'lerinden (withTiming/withDelay
  // kurulumu) SONRAYA erteler; sonraki bir commit'te (veri değişimiyle) yeni
  // doğan bir çocuk ise ref'i çoktan `true` bulup nihai durumda doğar.
  const oynatildiRef = useRef(false);
  useEffect(() => {
    if (panelGenislik > 0) {
      oynatildiRef.current = true;
    }
  }, [panelGenislik]);

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

  // Açılış zaman çizelgesi — SAF (core/seri/acilisCizelgesi), zamanlama
  // sabitleri burada (sunum katmanı) enjekte edilir (bkz. dosya doc-block'u).
  const cizelge = useMemo(
    () =>
      acilisCizelgesi(izgara, zincirler, {
        cizgiOnce: GOK_ZAMANLAMA.CIZGI_ONCE_MS,
        segNormal: GOK_ZAMANLAMA.SEG_NORMAL_MS,
        segVurgu: GOK_ZAMANLAMA.SEG_VURGU_MS,
        kopukBosluk: GOK_ZAMANLAMA.KOPUK_BOSLUK_MS,
      }),
    [izgara, zincirler]
  );

  const olcek = (yerlesim.hucreGenislik * YILDIZ_OLCEK_PAYI) / 48;
  const govdeYukseklik = HEADER_YUKSEKLIK + yerlesim.toplamYukseklik;
  const bugunInset = yerlesim.hucreGenislik * BUGUN_CERCEVE_INSET_ORANI;
  const bugunKenar = yerlesim.hucreGenislik - 2 * bugunInset;

  return (
    <View
      testID="gok-paneli-govde"
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={erisimEtiketi}
      style={
        panelGenislik > 0
          ? { height: govdeYukseklik, borderRadius: PANEL_KOSE_YARICAPI, overflow: 'hidden' }
          : { borderRadius: PANEL_KOSE_YARICAPI, overflow: 'hidden' }
      }
    >
      {panelGenislik > 0 && (
        <Svg width={panelGenislik} height={govdeYukseklik}>
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
            {/* Yıldız hâlesi — merkezde renk, kenarda şeffaf (blur DEĞİL, spec §3.2).
                Üç duraklı: merkeze yoğunlaşıp kenara doğru ERKEN sönümlenir —
                iki-duraklı doğrusal geçiş (0.5 -> 0) geniş bir alanı görünür
                opaklıkta bırakıp doygun bir disk gibi okunuyordu (cihaz
                doğrulaması: özellikle `disBloom`'un yeşil/palet rengi). */}
            <RadialGradient id="disBloom">
              <Stop offset="0" stopColor={renkler.birincil} stopOpacity={0.35} />
              <Stop offset="0.55" stopColor={renkler.birincil} stopOpacity={0.1} />
              <Stop offset="1" stopColor={renkler.birincil} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="icBloom">
              <Stop offset="0" stopColor={GOK_TONLARI.ISIK} stopOpacity={0.5} />
              <Stop offset="0.55" stopColor={GOK_TONLARI.ISIK} stopOpacity={0.14} />
              <Stop offset="1" stopColor={GOK_TONLARI.ISIK} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* 1) Gök zemini — HEADER dahil TÜM panel yüksekliğini kaplar. İnceleme
              bulgusu: ay adı/gün harfleri önceden bu zeminin DIŞINDAYDI (tema
              arkaplanı üzerinde), açık temada okunamıyordu. Artık aynı koyu
              zeminin üstüne çiziliyorlar (aşağıda, 5. katman). */}
          <Rect x={0} y={0} width={panelGenislik} height={govdeYukseklik} fill="url(#zeminTaban)" />
          <Rect x={0} y={0} width={panelGenislik} height={govdeYukseklik} fill="url(#zeminSolUst)" />
          <Rect x={0} y={0} width={panelGenislik} height={govdeYukseklik} fill="url(#zeminSagAlt)" />

          {/* Izgara katmanları (zincir/yıldız/gün-no) HEADER_YUKSEKLIK kadar aşağı
              kaydırılır — header için ayrılan payın altına düşerler. */}
          <G transform={`translate(0 ${HEADER_YUKSEKLIK})`}>
            {/* 2) Zincir bağları — stil (brief'ten birebir): ikisiTam kalın (1.9) ve
                parlak (0.62); normal ince (0.9/0.3); satır sarması ince (0.9/0.16).
                `bosluk` HER İKİ dalda da geçiliyor: uçlar yıldızın halka/bloom
                bölgesinin dışında kalacak şekilde merkezden içeri çekilir
                (inceleme bulgusu: düz bağda önceden 0 geçiliyordu, bağ 5/5
                yıldızının içinden geçiyordu). */}
            {zincirler.map((bag) => {
              const a: Nokta = yerlesim.merkez(bag.indeks);
              const b: Nokta = yerlesim.merkez(bag.indeks + 1);
              const bosluk = yerlesim.hucreGenislik * (bag.ikisiTam ? BOSLUK_TAM_ORANI : BOSLUK_NORMAL_ORANI);

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
                yol = bagYolu(a, b, true, seritY, bosluk);
                kalinlik = 0.9;
                opaklik = 0.16;
              } else {
                yol = bagYolu(a, b, false, 0, bosluk);
                kalinlik = bag.ikisiTam ? 1.9 : 0.9;
                opaklik = bag.ikisiTam ? 0.62 : 0.3;
              }

              return (
                <AnimasyonluBag
                  key={`bag-${bag.indeks}`}
                  yol={yol}
                  kalinlik={kalinlik}
                  opaklik={opaklik}
                  zaman={cizelge.bagZamani.get(bag.indeks)}
                  oynatildiRef={oynatildiRef}
                />
              );
            })}

            {/* 3) Yıldızlar. Bugünün karesi BİLEREK yıldızın kendi ölçekli `<G>`'sinin
                DIŞINDA, hücrenin gerçek (ölçeklenmemiş) boyutuna göre çizilir —
                önceden yıldızın `scale(olcek)` (%80) uygulanan iç koordinat
                sisteminde çizildiği için referanstaki hücre-inset kareden ~%20
                küçük kalıyordu (inceleme bulgusu). */}
            {izgara.map((gun, i) => {
              const merkez = yerlesim.merkez(i);
              return (
                <React.Fragment key={gun.tarih}>
                  {gun.tarih === bugun && (
                    <Rect
                      x={merkez.x - bugunKenar / 2}
                      y={merkez.y - bugunKenar / 2}
                      width={bugunKenar}
                      height={bugunKenar}
                      rx={bugunKenar * BUGUN_CERCEVE_KOSE_ORANI}
                      fill="none"
                      stroke={renkler.birincil}
                      strokeWidth={1.4}
                      opacity={0.4}
                    />
                  )}
                  <AnimasyonluYildiz
                    gun={gun}
                    transform={`translate(${merkez.x} ${merkez.y}) scale(${olcek})`}
                    tamGunEsigi={tamGunEsigi}
                    birincil={renkler.birincil}
                    gecikme={cizelge.yildizGecikme[i]}
                    oynatildiRef={oynatildiRef}
                  />
                </React.Fragment>
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
          </G>

          {/* 5) Ay adı + gün harfleri — koyu zeminin İÇİNDE (aynı tuval, üstteki
              header payında). Gün harfleri ızgaranın sütun merkezleriyle (satır 0)
              birebir hizalanır (`yerlesim.merkez(i).x`, i=0..6). */}
          <SvgText
            x={PANEL_YATAY_PAY}
            y={20}
            fontSize={13}
            fontWeight="600"
            fill={GOK_TONLARI.AY_ADI}
          >
            {ayAdi}
          </SvgText>
          {GUN_HARFLERI.map((harf, i) => (
            <SvgText
              key={`gun-adi-${i}`}
              x={yerlesim.merkez(i).x}
              y={40}
              fontSize={9.5}
              fill={GOK_TONLARI.GUN_ADI}
              textAnchor="middle"
            >
              {harf}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
};
