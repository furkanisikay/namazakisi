/**
 * Hesap yöntemi — vakitlerin hangi takvime göre hesaplandığı ve camiye göre ince ayar.
 *
 * Varsayılan: Türkiye'de Diyanet (değişmez); yurt dışında ülkenin resmî/yaygın takvimi
 * (bkz. `core/vakit/ulkeProfilleri.ts`). Seçim kendiliğinden DEĞİŞMEZ; kaydedince
 * vakitler konum değişimiyle aynı yoldan tüm yüzeylere yayılır (`hesapAyariniKaydet`).
 * İkindi ayrı bir ayardır; mezhep ayarından TÜRETİLMEZ.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hesapAyariniKaydet, hesapAyariniYukle } from '../store/hesapSlice';
import {
  HESAP_PROFILLERI,
  hesapParametreleriOlustur,
  yuksekEnlemMi,
  type HesapAyari,
  type HesapProfiliKimligi,
  type IkindiYontemi,
  type VakitOfsetAnahtari,
} from '../../core/vakit/hesapProfilleri';
import { ulkeVarsayilani } from '../../core/vakit/ulkeProfilleri';
import { aciOzeti, GUVEN_METNI, IKINDI_ACIKLAMASI, IKINDI_ADLARI, PROFIL_ADLARI } from '../../core/vakit/profilAdlari';
import { kayitliUlkeKodu } from '../../core/konum/ulkeTespiti';
import { ulkeAdi } from '../../core/konum/ulkeAdlari';
import { BolumBasligi } from '../components/ortak/BolumBasligi';
import { SecenekListesi, type Secenek } from '../components/ortak/SecenekListesi';
import { NotSatiri } from '../components/ortak/NotSatiri';
import { useMetin } from '../hooks/useMetin';
import { aktifDil, bicim } from '../../core/dil/aktifDil';

/** Ofset anahtarları vakit sözlüğünün (`vakit.adlar`) anahtarlarıyla aynıdır; ad etkin dilden. */
const OFSET_VAKITLERI: readonly VakitOfsetAnahtari[] = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];

const OFSET_SINIRI = 30;

/** Listede gösterilecek profiller: önerilen en üstte, sonra Diyanet ve MWL, Caferî en sonda. */
function profilSirasi(onerilen: HesapProfiliKimligi): HesapProfiliKimligi[] {
  const tumu = Object.keys(HESAP_PROFILLERI) as HesapProfiliKimligi[];
  const bas = [onerilen, 'diyanet', 'mwl'].filter((p, i, a) => a.indexOf(p) === i) as HesapProfiliKimligi[];
  const orta = tumu
    .filter((p) => !bas.includes(p) && p !== 'caferi')
    .sort((a, b) => PROFIL_ADLARI[a].localeCompare(PROFIL_ADLARI[b], aktifDil()));
  return [...bas, ...orta, 'caferi'];
}

function DakikaAdimlayici({
  ad,
  deger,
  onDegistir,
}: {
  ad: string;
  deger: number;
  onDegistir: (yeni: number) => void;
}) {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.hesap.sayfa;
  const metin = `${deger > 0 ? '+' : ''}${deger} ${s.sure.kisa.dk}`;
  const dugme = (yon: -1 | 1) => {
    const kapali = yon < 0 ? deger <= -OFSET_SINIRI : deger >= OFSET_SINIRI;
    return (
      <TouchableOpacity
        onPress={() => onDegistir(deger + yon)}
        disabled={kapali}
        className="w-11 h-11 rounded-xl items-center justify-center"
        style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, opacity: kapali ? 0.4 : 1 }}
        accessibilityRole="button"
        accessibilityLabel={bicim(yon < 0 ? m.erkeneAl : m.geciktir, { ad })}
        accessibilityState={{ disabled: kapali }}
      >
        <FontAwesome5 name={yon < 0 ? 'minus' : 'plus'} size={14} color={renkler.metin} />
      </TouchableOpacity>
    );
  };
  return (
    <View className="flex-row items-center py-1.5 pl-4 pr-2">
      <Text className="flex-1 text-base" style={{ color: renkler.metin }}>
        {ad}
      </Text>
      {dugme(-1)}
      <Text
        className="text-base font-bold text-center"
        style={{ width: 64, color: deger === 0 ? renkler.metin : renkler.birincil }}
        accessibilityLabel={bicim(m.duzeltmeErisim, { ad, deger: metin })}
      >
        {metin}
      </Text>
      {dugme(1)}
    </View>
  );
}

export const HesapYontemiSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.hesap.sayfa;
  const dispatch = useAppDispatch();
  const ayar = useAppSelector((s) => s.hesap.ayar);
  const konum = useAppSelector((s) => s.konum);

  useEffect(() => {
    void dispatch(hesapAyariniYukle());
  }, [dispatch]);

  const ulke = kayitliUlkeKodu(konum);
  const onerilen = ulkeVarsayilani(ulke);
  const profil = HESAP_PROFILLERI[ayar.profil] ?? HESAP_PROFILLERI.diyanet;
  const enlem = konum.koordinatlar?.lat;
  const parametre = useMemo(() => hesapParametreleriOlustur({ profil: ayar.profil }, { enlem }), [ayar.profil, enlem]);
  const ikindi: IkindiYontemi = ayar.ikindi ?? profil.ikindi;
  const yerAdi = konum.dunyaSehri?.ad || konum.seciliIlceAdi || konum.seciliIlAdi || konum.gpsAdres?.il || '';

  const kaydet = useCallback(
    (degisiklik: Partial<HesapAyari>) => {
      void dispatch(hesapAyariniKaydet({ ...ayar, ...degisiklik, secildi: true }));
    },
    [dispatch, ayar],
  );

  const profilSecenekleri = useMemo<Secenek<HesapProfiliKimligi>[]>(
    () =>
      profilSirasi(onerilen.profil).map((p) => ({
        deger: p,
        etiket: PROFIL_ADLARI[p],
        aciklama:
          p === onerilen.profil && ulke
            ? bicim(m.onerilen, { ulke: ulkeAdi(ulke, aktifDil()) })
            : aciOzeti(hesapParametreleriOlustur({ profil: p })),
      })),
    // Profil adları canlı görünümdür: dil değişince liste yeniden kurulsun.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onerilen.profil, ulke, s],
  );

  const ikindiSecenekleri = useMemo<Secenek<IkindiYontemi>[]>(
    () => (['evvel', 'sani'] as const).map((i) => ({ deger: i, etiket: IKINDI_ADLARI[i], aciklama: IKINDI_ACIKLAMASI[i] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s],
  );

  const ofsetDegistir = useCallback(
    (anahtar: VakitOfsetAnahtari, yeni: number) => {
      const ofsetler = { ...(ayar.ofsetler ?? {}), [anahtar]: Math.max(-OFSET_SINIRI, Math.min(OFSET_SINIRI, yeni)) };
      if (ofsetler[anahtar] === 0) delete ofsetler[anahtar];
      kaydet({ ofsetler: Object.keys(ofsetler).length ? ofsetler : undefined });
    },
    [ayar.ofsetler, kaydet],
  );

  const kaynagiAc = useCallback(() => {
    // Bağlantı kendi sabit tablomuzdan gelir (dış girdi değil); yine de yalnız https.
    if (/^https:\/\/[a-z0-9.-]+\//.test(profil.kaynakUrl)) Linking.openURL(profil.kaynakUrl).catch(() => undefined);
  }, [profil.kaynakUrl]);

  const guven = ayar.profil === onerilen.profil ? onerilen.guven : ayar.profil === 'diyanet' && ulke === 'TR' ? 'olculdu' : 'kaynakli';
  const yuksekEnlem = ayar.profil !== 'diyanet' && yuksekEnlemMi(enlem);
  const diyanetAvrupa = ayar.profil === 'diyanet' && ulke !== null && ulke !== 'TR' && typeof enlem === 'number' && enlem > 45;
  const ayrac = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {yerAdi ? (
        <Text className="text-sm mb-3" style={{ color: renkler.metinIkincil }}>
          {bicim(m.yerIcin, { yer: yerAdi })}
        </Text>
      ) : null}

      <View style={{ borderRadius: 24, backgroundColor: renkler.kartArkaplan, padding: 18 }} testID="hesap-yontemi-karti">
        <View className="flex-row items-center">
          <View
            className="w-11 h-11 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: `${renkler.birincil}20` }}
          >
            <FontAwesome5 name="mosque" size={18} color={renkler.birincil} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold" style={{ color: renkler.metin }}>
              {PROFIL_ADLARI[ayar.profil]}
            </Text>
            <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
              {aciOzeti(parametre)}
            </Text>
          </View>
        </View>
        <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
          <View
            className="px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: guven === 'genel' ? `${renkler.durum.uyari}25` : `${renkler.durum.basarili}20`,
            }}
          >
            <Text className="text-xs font-bold" style={{ color: renkler.metin }}>
              {GUVEN_METNI[guven]}
            </Text>
          </View>
          <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: renkler.arkaplan }}>
            <Text className="text-xs" style={{ color: renkler.metin }}>
              {bicim(m.ikindiEtiketi, { ad: IKINDI_ADLARI[ikindi] })}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={kaynagiAc}
          className="mt-3 justify-center"
          style={{ minHeight: 44 }}
          accessibilityRole="link"
          accessibilityLabel={m.kaynakErisim}
        >
          <Text className="text-sm font-semibold" style={{ color: renkler.birincil }}>
            {m.kaynagiAcin}
          </Text>
        </TouchableOpacity>
      </View>

      {yuksekEnlem && (
        <NotSatiri
          metin={m.yuksekEnlem}
          style={{ marginTop: 10 }}
        />
      )}
      {diyanetAvrupa && (
        <NotSatiri
          metin={m.diyanetAvrupa}
          style={{ marginTop: 10 }}
        />
      )}

      <View style={{ marginTop: 24 }} testID="hesap-yontemi-listesi">
        <BolumBasligi metin={m.takvim} />
        <SecenekListesi
          secenekler={profilSecenekleri}
          secili={ayar.profil}
          onSec={(p) => kaydet({ profil: p, ikindi: undefined })}
          erisimEtiketi={s.genel.ekranlar.HesapYontemiAyarlari}
        />
        <NotSatiri metin={m.secimDegismez} style={{ marginTop: 10 }} />
      </View>

      <View style={{ marginTop: 24 }} testID="ikindi-secimi">
        <BolumBasligi metin={m.ikindiVakti} />
        <SecenekListesi
          secenekler={ikindiSecenekleri}
          secili={ikindi}
          onSec={(i) => kaydet({ ikindi: i === profil.ikindi ? undefined : i })}
          erisimEtiketi={m.ikindiVakti}
        />
        <NotSatiri metin={m.ikindiNotu} style={{ marginTop: 10 }} />
      </View>

      <View style={{ marginTop: 24 }}>
        <BolumBasligi metin={m.dakikaDuzeltmesi} />
        <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: renkler.kartArkaplan }}>
          {OFSET_VAKITLERI.map((anahtar, i) => (
            <View key={anahtar} style={i ? ayrac : undefined}>
              <DakikaAdimlayici
                ad={s.vakit.adlar[anahtar]}
                deger={ayar.ofsetler?.[anahtar] ?? 0}
                onDegistir={(yeni) => ofsetDegistir(anahtar, yeni)}
              />
            </View>
          ))}
        </View>
        <NotSatiri metin={m.duzeltmeKalici} style={{ marginTop: 10 }} />
      </View>
    </ScrollView>
  );
};

export default HesapYontemiSayfasi;
