/**
 * AnimasyonluYildiz — tek bir günün yıldızı: açılış girişi (opacity 0→1,
 * tier'e göre süre) + `YildizIcerigi` (Faz 1'in STATİK yıldız görseli,
 * değişmeden buraya taşındı — önceden `GokPaneli.tsx` içindeydi).
 *
 * ÖLÇEK ANİMASYONU KULLANILMAZ — task-2-brief.md'nin sunduğu iki seçenekten
 * "(b) Ölçekten vazgeç" seçildi (gerekçe: task-2-report.md). Kademe farkı
 * (5/5 "belirgin daha vurgulu") iki şeyle korunur: (1) süre — 380/300/240 ms,
 * (2) İÇERİK zenginliği — 5/5 zaten hüzmeler + çift hâle + beyaz çekirdek
 * render ediyor (`YildizIcerigi`), hedef-tuttu yalnız bir halka, diğerleri
 * hiçbiri; bu ikisi birlikte 5/5'in girişini doğal olarak daha "ağır" kılıyor.
 * ("Hâle opaklığının aşırı-atışı" fikri değerlendirildi ve REDDEDİLDİ: hâle
 * daireleri bu G'nin İÇİNDE, yani G'nin kendi opacity'siyle ÇARPIMSAL —
 * G henüz %30 opaklıktayken hâlenin KENDİ opacity'sini 1'e "pop" ettirmek
 * görünür sonucu değiştirmez, G'nin o anki opaklığıyla sınırlı kalır. Gerçek
 * bir "overshoot" bağımsız bir animasyon katmanı ister, bu da G matrisi kadar
 * karmaşıklık ekler — sıfır-riskli olma amacını boşa çıkarırdı.)
 */
import React, { useEffect, useState } from 'react';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Circle, G, Line } from 'react-native-svg';
import { GunDurumu, IzgaraGunu } from '../../../core/seri/aylikIzgara';
import { gunTamMi } from '../../../core/seri/gunTamMi';
import { besTeBesMi } from '../../../core/seri/zincir';
import { GOK_TONLARI, GOK_ZAMANLAMA } from './sabitler';

const AnimatedG = Animated.createAnimatedComponent(G);

/** Beş ışın, sabah tepede saat yönünde (spec §1). */
const ISIN_ACILARI = [-90, -18, 54, 126, 198];

// Işının altına konan sahte-parlama çizgisinin başladığı iç yarıçap (cihaz
// doğrulaması). Merkezden (0) başlarsa beş ışın merkezde üst üste binip opak
// bir kütle oluşturuyordu — referansta bu bir `drop-shadow` filtresiydi,
// merkeze hiç yığılmıyordu. Işının dış yarısına kaydırarak taklit ediliyor.
const ISIN_PARLAMA_IC_YARICAP = 6;

function derece(a: number): number {
  return (a * Math.PI) / 180;
}

interface YildizIcerigiProps {
  durum: GunDurumu;
  tamGunEsigi: number;
  birincil: string;
}

/** Tek bir günün yıldız görselini üretir — koordinatlar (0,0) merkezli,
 * konumlama/ölçek dış `<G transform>` tarafından uygulanır. Faz 1'den
 * DEĞİŞTİRİLMEDEN taşındı (önceden `GokPaneli.tsx` içindeydi). */
export const YildizIcerigi: React.FC<YildizIcerigiProps> = ({ durum, tamGunEsigi, birincil }) => {
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
  // 5/5 kuralı `core/seri/zincir.ts > besTeBesMi`'de PAYLAŞILAN — burada
  // KOPYALANMAZ (inceleme bulgusu, önceden üç yerde ayrı ayrı tanımlıydı).
  const tam = besTeBesMi(durum);
  const hedefTuttu = gunTamMi(kilinanSayisi, tamGunEsigi);

  return (
    <>
      {/* Hâle halkaları EN ALTTA (bloom/hüzme/ışından ÖNCE) — böylece üstlerine
          boyanan katmanların kenarı gibi okunur, KONTUR gibi değil (cihaz
          doğrulaması: önceden EN ÜSTTE çizilip ışınları/hüzmeleri kesen bir
          jeton konturu gibi duruyordu). Dış aksan halkası (birincil renkli,
          eski r19) KALDIRILDI — disBloom zaten aynı bölgeyi kaplıyordu, ikisi
          üst üste "çift kontur" hissi veriyordu; kalan tek halka da opaklığı
          düşürülerek yumuşatıldı. */}
      {tam && <Circle cx={0} cy={0} r={16} fill="none" stroke={GOK_TONLARI.ISIK} strokeWidth={0.7} opacity={0.22} />}
      {!tam && hedefTuttu && (
        <Circle cx={0} cy={0} r={15} fill="none" stroke={GOK_TONLARI.ISIK} strokeWidth={0.7} opacity={0.22} />
      )}

      {tam && (
        <>
          {/* Hâle: RadialGradient dolgulu daireler — filter/blur DEĞİL (spec §3.2).
              Yarıçap genişletildi (17->21 / 9->11) ve Defs'teki duraklar merkeze
              yoğunlaşıp kenara doğru ERKEN sönümlenecek şekilde üç-duraklı
              yapıldı (cihaz doğrulaması: iki-duraklı doğrusal geçiş geniş bir
              alanı görünür opaklıkta bırakıp doygun bir disk gibi okunuyordu). */}
          <Circle cx={0} cy={0} r={21} fill="url(#disBloom)" />
          <Circle cx={0} cy={0} r={11} fill="url(#icBloom)" />
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
            {/* Işın parlaması: parlak çizginin ALTINA kalın + düşük opaklıklı ikinci
                çizgi — ama MERKEZDEN DEĞİL, ışının dış yarısından başlar
                (`ISIN_PARLAMA_IC_YARICAP`). Merkezden başlasaydı beş ışının
                parlaması orada üst üste binip opak bir kütle oluşturuyordu
                (cihaz doğrulaması). */}
            {acik && (
              <Line
                x1={Math.cos(rad) * ISIN_PARLAMA_IC_YARICAP}
                y1={Math.sin(rad) * ISIN_PARLAMA_IC_YARICAP}
                x2={x2}
                y2={y2}
                stroke={birincil}
                strokeWidth={tam ? 3.2 : 2.2}
                strokeLinecap="round"
                opacity={tam ? 0.22 : 0.14}
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

      {/* Kısmi (0<kılınan<5) çekirdeğin ince ışıması — referans "drop-shadow(0 0 2px VURGU)"
          kullanıyordu; filter YOK (spec §3.2), yerine küçük düşük-opaklıklı bir glow dairesi
          çekirdeğin ALTINA konur (inceleme bulgusu: bu karşılıksız kalmıştı). */}
      {!tam && kilinanSayisi > 0 && <Circle cx={0} cy={0} r={4.5} fill={birincil} opacity={0.35} />}
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
    </>
  );
};

export interface AnimasyonluYildizProps {
  gun: IzgaraGunu;
  /** `translate(merkezX merkezY) scale(olcek)` — Faz 1'deki STATİK yerleşim
   * dizesi, değişmeden buraya taşındı; animasyonlanmaz. */
  transform: string;
  tamGunEsigi: number;
  birincil: string;
  /** `acilisCizelgesi().yildizGecikme[i]`. */
  gecikme: number;
  /** `GokPaneli`'nin ömür boyu ref'i — bkz. `AnimasyonluBag`'daki açıklama. */
  oynatildiRef: React.MutableRefObject<boolean>;
}

export const AnimasyonluYildiz: React.FC<AnimasyonluYildizProps> = ({
  gun,
  transform,
  tamGunEsigi,
  birincil,
  gecikme,
  oynatildiRef,
}) => {
  const azaltilmisHareket = useReducedMotion();
  const [ilkOynatimPenceresinde] = useState(() => !oynatildiRef.current);
  const oynatilacakMi = ilkOynatimPenceresinde && !azaltilmisHareket;

  const baseOpacity = gun.digerAy ? 0.42 : 1;
  const kilinanSayisi = gun.durum.tip === 'kilindi' ? gun.durum.vakitler.filter(Boolean).length : 0;
  const tam = besTeBesMi(gun.durum);
  const hedefTuttu = !tam && gun.durum.tip === 'kilindi' && gunTamMi(kilinanSayisi, tamGunEsigi);
  const sure = tam ? GOK_ZAMANLAMA.GIRIS_TAM_MS : hedefTuttu ? GOK_ZAMANLAMA.GIRIS_HEDEF_MS : GOK_ZAMANLAMA.GIRIS_SADE_MS;

  const opacity = useSharedValue(oynatilacakMi ? 0 : baseOpacity);

  useEffect(() => {
    if (!oynatilacakMi) {
      return;
    }
    opacity.value = withDelay(gecikme, withTiming(baseOpacity, { duration: sure }));
    // Yalnız mount'ta BİR KEZ oynatılır (spec 2c) — bkz. AnimasyonluBag'daki
    // aynı gerekçe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedProps = useAnimatedProps(() => ({ opacity: opacity.value }));

  return (
    <AnimatedG transform={transform} animatedProps={animatedProps}>
      <YildizIcerigi durum={gun.durum} tamGunEsigi={tamGunEsigi} birincil={birincil} />
    </AnimatedG>
  );
};
