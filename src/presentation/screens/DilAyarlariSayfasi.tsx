/**
 * Dil · Language — Ayarlar > Dil. Başlık header'dan gelir (iki dilli: dili okuyamayan da bulur).
 *
 * Notlar sessiz sapma bırakmaz: beta çeviri, dilin vakit hesabını değiştirmediği ve Türkçe
 * dışında hadis gösterilmediği (`core/icerik/nassDili.ts`) açıkça söylenir.
 */
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRenkler } from '../../core/theme';
import { useAktifDil, useMetin } from '../hooks/useMetin';
import { DilSecici } from '../components/dil/DilSecici';
import { NotSatiri } from '../components/ortak/NotSatiri';
import { DILLER } from '../../core/dil/diller';
import { hadisGosterilir } from '../../core/icerik/nassDili';
import { cihazYerelAyari, DilServisi } from '../../domain/services/DilServisi';

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
        <DilSecici secimVar={secimVar} cihazYerelAyari={cihazYerelAyari()} onDegisti={degisti} testID="dil-secici" />
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
