/**
 * Dil · Language — Ayarlar > Dil. Başlık header'dan gelir (iki dilli: dili okuyamayan da bulur).
 *
 * Notlar sessiz sapma bırakmaz: beta çeviri, dilin vakit hesabını değiştirmediği ve Türkçe
 * dışında hadis gösterilmediği (`core/icerik/nassDili.ts`) açıkça söylenir. Birden çok yerleşik
 * vakit adlandırması olan dilde (Almanca, Fransızca) vakit adı takımı da buradan seçilir.
 * Yazı yönü yeniden başlatma beklerken (kullanıcı "Sonra" dedi ya da açılışta düzeltilemedi)
 * kalıcı bilgi satırı + "Şimdi yeniden başlatın" düğmesi görünür (sessiz sapma yok).
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRenkler } from '../../core/theme';
import { useAktifDil, useMetin } from '../hooks/useMetin';
import { DilSecici } from '../components/dil/DilSecici';
import { RakamSecimi } from '../components/dil/RakamSecimi';
import { NotSatiri } from '../components/ortak/NotSatiri';
import { SecenekListesi, type Secenek } from '../components/ortak/SecenekListesi';
import { useAppDispatch } from '../store/hooks';
import { vakitTakimiKaydet } from '../store/dilSlice';
import { DILLER, type DilKodu } from '../../core/dil/diller';
import { hamSozluk } from '../../core/dil/aktifDil';
import { TEMEL_TAKIM, VAKIT_TAKIMLARI, type VakitAdlari } from '../../core/dil/vakitTakimlari';
import { hadisGosterilir } from '../../core/icerik/nassDili';
import { cihazYerelAyari, DilServisi } from '../../domain/services/DilServisi';
import { YonServisi } from '../../domain/services/YonServisi';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';

const OTOMATIK = 'otomatik';

/** Seçenek açıklaması: takımın beş farz adı ("Fajr · Dhuhr · Asr · Maghrib · Isha"). */
const ornek = ({ adlar }: Pick<VakitAdlari, 'adlar'>): string =>
  [adlar.imsak, adlar.ogle, adlar.ikindi, adlar.aksam, adlar.yatsi].join(' · ');

/** Etkin dilin vakit adı takımı seçimi; dilin tek takımı varsa hiçbir şey çizmez. */
const VakitAdlariSecimi: React.FC<{ kod: DilKodu }> = ({ kod }) => {
  const renkler = useRenkler();
  const m = useMetin().dilAyar.vakitAdlari;
  const dispatch = useAppDispatch();
  const takimlar = VAKIT_TAKIMLARI[kod];
  const [secili, setSecili] = useState<string | null>(null);

  useEffect(() => {
    if (!takimlar?.length) return undefined;
    let iptal = false;
    void DilServisi.vakitTakimiSecimi().then((v) => {
      if (!iptal) setSecili(v ?? OTOMATIK);
    });
    return () => {
      iptal = true;
    };
  }, [takimlar]);

  const secenekler = useMemo<Secenek<string>[]>(
    () => [
      { deger: OTOMATIK, etiket: m.otomatik, aciklama: m.otomatikAciklama },
      { deger: TEMEL_TAKIM, etiket: m.takimlar.temel, aciklama: ornek(hamSozluk(kod).vakit) },
      ...(takimlar ?? []).map((t) => ({ deger: t.id, etiket: m.takimlar[t.etiket], aciklama: ornek(t.adlar) })),
    ],
    [kod, m, takimlar]
  );

  const sec = useCallback(
    (deger: string) => {
      setSecili(deger);
      void dispatch(vakitTakimiKaydet(deger === OTOMATIK ? null : deger));
    },
    [dispatch]
  );

  if (!takimlar?.length || secili === null) return null;
  return (
    <View style={{ marginTop: 24 }} testID="vakit-adlari-secimi">
      <Text style={{ fontSize: 17, fontWeight: '700', color: renkler.metin, marginBottom: 4 }} accessibilityRole="header">
        {m.baslik}
      </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: renkler.metinIkincil, marginBottom: 12 }}>{m.aciklama}</Text>
      <SecenekListesi erisimEtiketi={m.baslik} secenekler={secenekler} secili={secili} onSec={sec} />
    </View>
  );
};

/**
 * Yazı yönü yeniden başlatma bekliyorsa bilgi satırı + tek düğme. Gerçek kaynak çizilen yön
 * (`YonServisi.bekliyorMu`), slice değil: açılışta denemeler tükenmişse de görünür.
 */
const YonBekliyorSatiri: React.FC = () => {
  const renkler = useRenkler();
  const m = useMetin().yon;
  useAktifDil(); // dil değişince yeniden değerlendir
  const [mesgul, setMesgul] = useState(false);
  const bas = useCallback(() => {
    if (mesgul) return;
    setMesgul(true);
    void YonServisi.yenidenBaslat().then((ok) => {
      if (ok) return;
      setMesgul(false);
      kisaBildirimGoster(m.bekliyor, true);
    });
  }, [mesgul, m]);

  if (!YonServisi.bekliyorMu()) return null;
  return (
    <View
      testID="yon-bekliyor"
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: renkler.bilgi, marginBottom: 16 }}
    >
      <FontAwesome5 name="exchange-alt" size={13} color={renkler.bilgi} solid style={{ marginRight: 8 }} />
      <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: renkler.metin }}>{m.bekliyor}</Text>
      <TouchableOpacity
        onPress={bas}
        disabled={mesgul}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={m.simdiBaslat}
        accessibilityState={{ disabled: mesgul, busy: mesgul }}
        testID="yon-bekliyor-baslat"
        style={{
          marginLeft: 10,
          minHeight: 44,
          paddingHorizontal: 14,
          borderRadius: 16,
          justifyContent: 'center',
          backgroundColor: renkler.birincil,
          opacity: mesgul ? 0.6 : 1,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: renkler.birincilMetin }}>{m.simdiBaslat}</Text>
      </TouchableOpacity>
    </View>
  );
};

export const DilAyarlariSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const m = useMetin().dilAyar;
  const kod = useAktifDil();
  const [secimVar, setSecimVar] = useState<boolean | null>(null);

  useEffect(() => {
    let iptal = false;
    void DilServisi.secimVar().then((v) => {
      if (!iptal) setSecimVar(v);
    });
    return () => {
      iptal = true;
    };
  }, []);

  const degisti = useCallback((secim: string) => setSecimVar(secim !== 'cihaz'), []);
  const beta = DILLER.find((d) => d.kod === kod)?.beta ?? false;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 15, lineHeight: 21, color: renkler.metinIkincil, marginBottom: 16 }}>{m.aciklama}</Text>
        <YonBekliyorSatiri />
        <DilSecici secimVar={secimVar} cihazYerelAyari={cihazYerelAyari()} onDegisti={degisti} testID="dil-secici" />
        <VakitAdlariSecimi kod={kod} />
        <RakamSecimi kod={kod} />
        <View style={{ marginTop: 20, gap: 6 }}>
          {beta ? <NotSatiri metin={m.notlar.beta} /> : null}
          <NotSatiri metin={m.notlar.vakit} ikon="clock" />
          {!hadisGosterilir() ? <NotSatiri metin={m.notlar.nass} ikon="book-open" /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DilAyarlariSayfasi;
