/**
 * İlerleme sekmesi — "Kılma oranı" bölümü (eski İstatistik ekranının Haftalık/Aylık
 * içeriği). Sade tasarım Dalga 4:
 *   - İç sekme çubuğu YOK; tek basit seçici (Haftalık · Aylık). "Günlük" kaldırıldı —
 *     Bugün sekmesi bunu zaten gösterir.
 *   - Sabit hedefler ("35 namaz", "%80", "7 gün") kalktı; hedef seri tam gün eşiğinden
 *     türer (`haftalikHedefHesapla`).
 *   - Sabit renkler tema tokenına bağlandı; sayı/metin daima `metin` rengi, renk yalnız
 *     dekoratif (çubuk, ikon çipi) — kontrast tuzağı (AGENTS.md).
 * "Aylık" etiketi ekrandakiyle birebir: mağaza betikleri (Maestro, simülatör) onu arar.
 */
import React from 'react';
import { Animated, Easing, View, Text } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { NAMAZ_ISIMLERI, namazAdiGoster } from '../../../core/constants/UygulamaSabitleri';
import { haftalikHedefHesapla } from '../../../core/seri/haftalikHedef';
import type { AylikIstatistik, HaftalikIstatistik } from '../../../core/types';
import { BolumBasligi } from '../../components/ortak/BolumBasligi';
import { SecenekListesi } from '../../components/ortak/SecenekListesi';
import { BosDurum, Yukleniyor } from '../../components/ortak/BosDurum';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { useMetin } from '../../hooks/useMetin';
import { bicim, sayili } from '../../../core/dil/aktifDil';
import { ayAdiniAl, gunKisaAdiniAl } from '../../../core/utils/TarihYardimcisi';
import type { Sozluk } from '../../../core/dil/sozluk/tr';
import type { GunlukIstatistik } from '../../../core/types';

/**
 * Gün/ay adı ÇİZİM ANINDA tarihten/ay numarasından, etkin dilde (slice'taki `gunAdi`/`ayAdi`
 * yükleme anının dilinde saklanır, dil değişince bayatlar). Ölçülemeyen değerde saklı ada düşer.
 */
const gunAdi = (g: GunlukIstatistik): string => gunKisaAdiniAl(g.tarih) ?? g.gunAdi;
const ayAdi = (i: AylikIstatistik): string => (Number.isInteger(i.ay) ? ayAdiniAl(i.ay) ?? i.ayAdi : i.ayAdi);

/**
 * Görsel anlatı (sahip kararı 2026-10-19): çubuklar dönem açılınca BİR KEZ tabandan
 * büyür (`scaleY`/`scaleX` + `transformOrigin` — yükseklik/genişlik animasyonu DEĞİL,
 * native driver). Döngü yok; "Animasyonları azalt"ta son karede doğar.
 */
function useGirisBuyumesi(): Animated.Value {
  const azalt = useHareketAzalt();
  const deger = React.useRef(new Animated.Value(azalt ? 1 : 0)).current;
  React.useEffect(() => {
    if (azalt) {
      deger.setValue(1);
      return;
    }
    const a = Animated.timing(deger, { toValue: 1, duration: 600, delay: 80, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [azalt, deger]);
  return deger;
}

export type KilmaOraniDonemi = 'haftalik' | 'aylik';

type Renkler = ReturnType<typeof useRenkler>;
type Metin = Sozluk['ilerleme']['kilma'];

interface KilmaOraniBolumuProps {
  donem: KilmaOraniDonemi;
  onDonemSec: (d: KilmaOraniDonemi) => void;
  haftalik: HaftalikIstatistik | null | undefined;
  aylik: AylikIstatistik | null | undefined;
  yukleniyor: boolean;
  tamGunEsigi: number;
}

export const KilmaOraniBolumu: React.FC<KilmaOraniBolumuProps> = ({
  donem,
  onDonemSec,
  haftalik,
  aylik,
  yukleniyor,
  tamGunEsigi,
}) => {
  const renkler = useRenkler();
  const m = useMetin().ilerleme.kilma;
  const veri = donem === 'haftalik' ? haftalik : aylik;
  const donemler = React.useMemo(
    () => [
      { deger: 'haftalik' as const, etiket: m.haftalik },
      { deger: 'aylik' as const, etiket: m.aylik },
    ],
    [m]
  );

  return (
    <View testID="kilma-orani-bolumu">
      <BolumBasligi metin={m.baslik} ikon="chart-bar" />
      <SecenekListesi
        gorunum="cip"
        secenekler={donemler}
        secili={donem}
        onSec={onDonemSec}
        erisimEtiketi={m.donemErisim}
      />
      <View style={{ marginTop: 12 }}>
        {!veri && yukleniyor ? (
          <Yukleniyor metin={m.hesaplaniyor} />
        ) : !veri ? (
          <BosDurum ikon="chart-bar" baslik={m.bosBaslik} aciklama={m.bosAciklama} />
        ) : donem === 'haftalik' ? (
          <HaftalikIcerik istatistik={veri as HaftalikIstatistik} renkler={renkler} tamGunEsigi={tamGunEsigi} m={m} />
        ) : (
          <AylikIcerik istatistik={veri as AylikIstatistik} renkler={renkler} m={m} />
        )}
      </View>
    </View>
  );
};

const Kart: React.FC<{ renkler: Renkler; children: React.ReactNode; style?: object }> = ({ renkler, children, style }) => (
  <View style={[{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, padding: 16, marginBottom: 12 }, style]}>{children}</View>
);

const OzetKutusu: React.FC<{ renkler: Renkler; ikon: string; renk: string; deger: string; etiket: string }> = ({
  renkler,
  ikon,
  renk,
  deger,
  etiket,
}) => (
  <View
    accessible
    accessibilityLabel={`${etiket}: ${deger}`}
    style={{ flex: 1, alignItems: 'center', padding: 12, borderRadius: 16, marginHorizontal: 4, backgroundColor: renkler.kartArkaplan }}
  >
    <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: renk + '20' }}>
      <FontAwesome5 name={ikon} size={14} color={renk} solid />
    </View>
    <Text style={{ fontSize: 20, fontWeight: '700', color: renkler.metin, marginTop: 6 }}>{deger}</Text>
    <Text style={{ fontSize: 12, color: renkler.metinIkincil, textAlign: 'center' }}>{etiket}</Text>
  </View>
);

const Cubuk: React.FC<{ renkler: Renkler; baslik: string; mevcut: number; hedef: number; renk: string }> = ({
  renkler,
  baslik,
  mevcut,
  hedef,
  renk,
}) => {
  const yuzde = hedef > 0 ? Math.min((mevcut / hedef) * 100, 100) : 0;
  const buyume = useGirisBuyumesi();
  return (
    <View style={{ marginBottom: 14 }} accessible accessibilityLabel={`${baslik}: ${mevcut} / ${hedef}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: renkler.metin }}>{baslik}</Text>
        <Text style={{ fontSize: 14, color: renkler.metinIkincil }}>
          {mevcut} / {hedef}
        </Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: renkler.sinir }}>
        <Animated.View style={{ height: '100%', borderRadius: 3, width: `${yuzde}%`, backgroundColor: renk, transformOrigin: 'left', transform: [{ scaleX: buyume }] }} />
      </View>
    </View>
  );
};

const HaftalikIcerik: React.FC<{ istatistik: HaftalikIstatistik; renkler: Renkler; tamGunEsigi: number; m: Metin }> = ({
  istatistik,
  renkler,
  tamGunEsigi,
  m,
}) => {
  const hedef = haftalikHedefHesapla(istatistik.gunlukVeriler, tamGunEsigi);
  const buyume = useGirisBuyumesi();
  return (
    <View>
      <Kart renkler={renkler}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 128 }}>
          {istatistik.gunlukVeriler?.map((gun) => {
            const yuzde = gun.tamamlanmaYuzdesi || 0;
            // Çubuk dekoratiftir; sayı yanında metin olarak da yazılı (renk tek başına bilgi değil).
            const barRenk = gun.tamamlananNamaz >= hedef.esik ? renkler.birincil : yuzde > 0 ? renkler.durum.uyari : renkler.sinir;
            return (
              <View
                key={gun.tarih}
                style={{ alignItems: 'center', flex: 1 }}
                accessible
                accessibilityLabel={`${gunAdi(gun)}: ${gun.tamamlananNamaz} / ${gun.toplamNamaz}`}
              >
                <View style={{ width: 24, height: 80, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden', backgroundColor: renkler.sinir }}>
                  <Animated.View style={{ width: '100%', borderRadius: 6, height: `${yuzde}%`, backgroundColor: barRenk, transformOrigin: 'bottom', transform: [{ scaleY: buyume }] }} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', marginTop: 4, color: renkler.metin }}>{gunAdi(gun)}</Text>
                <Text style={{ fontSize: 12, color: renkler.metinIkincil }}>
                  {gun.tamamlananNamaz}/{gun.toplamNamaz}
                </Text>
              </View>
            );
          })}
        </View>
      </Kart>

      <View style={{ flexDirection: 'row', marginHorizontal: -4, marginBottom: 12 }}>
        <OzetKutusu renkler={renkler} ikon="check" renk={renkler.birincil} deger={String(istatistik.tamamlananNamaz)} etiket={m.kilinan} />
        <OzetKutusu renkler={renkler} ikon="chart-line" renk={renkler.durum.bilgi} deger={bicim(m.yuzde, { n: istatistik.tamamlanmaYuzdesi })} etiket={m.oran} />
        <OzetKutusu
          renkler={renkler}
          ikon="star"
          renk={renkler.durum.uyari}
          deger={istatistik.enIyiGun ? gunAdi(istatistik.enIyiGun) || '-' : '-'}
          etiket={m.enIyiGun}
        />
      </View>

      <Kart renkler={renkler}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: renkler.metin, marginBottom: 4 }}>{m.haftaHedefi}</Text>
        <Text style={{ fontSize: 14, color: renkler.metinIkincil, marginBottom: 12 }}>
          {sayili(m.hedefAlt, hedef.esik)}
        </Text>
        <Cubuk renkler={renkler} baslik={m.kilinanNamaz} mevcut={hedef.kilinan} hedef={hedef.namazHedefi} renk={renkler.birincil} />
        <Cubuk renkler={renkler} baslik={m.hedefeUlasan} mevcut={hedef.esigiGecenGun} hedef={7} renk={renkler.durum.bilgi} />
      </Kart>
    </View>
  );
};

const AylikIcerik: React.FC<{ istatistik: AylikIstatistik; renkler: Renkler; m: Metin }> = ({ istatistik, renkler, m }) => {
  const buyume = useGirisBuyumesi();
  return (
  <View>
    <Kart renkler={renkler}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: renkler.metin }}>
          {bicim(m.ayYil, { ay: ayAdi(istatistik), yil: istatistik.yil })}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
        <OzetKutusu renkler={renkler} ikon="calendar-check" renk={renkler.birincil} deger={String(istatistik.aktifGunSayisi)} etiket={m.namazKilinanGun} />
        <OzetKutusu renkler={renkler} ikon="mosque" renk={renkler.durum.bilgi} deger={String(istatistik.tamamlananNamaz)} etiket={m.kilinan} />
        <OzetKutusu renkler={renkler} ikon="chart-line" renk={renkler.durum.uyari} deger={bicim(m.yuzde, { n: istatistik.tamamlanmaYuzdesi })} etiket={m.oran} />
      </View>
    </Kart>

    <Kart renkler={renkler}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: renkler.metin, marginBottom: 12 }}>{m.vakitVakit}</Text>
      {NAMAZ_ISIMLERI.map((namazAdi) => {
        const yuzde = istatistik.namazBazindaYuzdeler?.[namazAdi] || 0;
        return (
          <View
            key={namazAdi}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
            accessible
            accessibilityLabel={bicim(m.yuzdeErisim, { ad: namazAdiGoster(namazAdi), n: yuzde })}
          >
            {/* Tek satır, sığmazsa küçülür: dar sütunda uzun ad ("Alansaraa", "Magharibi") sözcük ortasından bölünüyordu. */}
            <Text
              style={{ width: 64, fontSize: 14, fontWeight: '600', color: renkler.metin }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {namazAdiGoster(namazAdi)}
            </Text>
            <View style={{ flex: 1, height: 8, borderRadius: 4, marginHorizontal: 12, overflow: 'hidden', backgroundColor: renkler.sinir }}>
              <Animated.View style={{ height: '100%', borderRadius: 4, width: `${yuzde}%`, backgroundColor: renkler.birincil, transformOrigin: 'left', transform: [{ scaleX: buyume }] }} />
            </View>
            <Text style={{ width: 44, fontSize: 14, fontWeight: '700', textAlign: 'right', color: renkler.metin }}>{bicim(m.yuzde, { n: yuzde })}</Text>
          </View>
        );
      })}
    </Kart>
  </View>
  );
};
