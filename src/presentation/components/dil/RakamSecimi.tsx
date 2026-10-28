/**
 * Rakam sistemi seçimi (Ayarlar > Dil > "Rakamlar") — yalnız yerel rakamı olan dilde (Arapça,
 * Bengalce; `core/dil/rakam`) çizilir. Seçenekler: otomatik (ülkeye göre: Arapçada Mağrip Batı,
 * diğerleri Doğu Arap; Bengalcede her ülkede Bengalce), dilin yerel rakamı (sözlükte
 * `rakam.dogu` etiketi) ve Batı.
 * Görsel dil `VakitAdlariSecimi` ile aynı (başlık + açıklama + radyo kartları).
 *
 * Örnek rakamlar sözlükte değil burada üretilir ve metin kapısından KORUNUR: "0123" seçeneği
 * yerel rakam etkinken de Batı rakamıyla görünmeli.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRenkler } from '../../../core/theme';
import { useMetin } from '../../hooks/useMetin';
import { SecenekListesi, type Secenek } from '../ortak/SecenekListesi';
import { dilYerelRakami, rakamlariCevir, type RakamSistemi } from '../../../core/dil/rakam';
import type { DilKodu } from '../../../core/dil/diller';
import { DilServisi } from '../../../domain/services/DilServisi';
import { Logger } from '../../../core/utils/Logger';

const OTOMATIK = 'otomatik';
type Deger = RakamSistemi | typeof OTOMATIK;

const ORNEK = '0123456789';

export const RakamSecimi: React.FC<{ kod: DilKodu }> = ({ kod }) => {
  const renkler = useRenkler();
  const m = useMetin().rakam;
  const yerel = dilYerelRakami(kod);
  const secimli = yerel !== null;
  const [secili, setSecili] = useState<Deger | null>(null);

  useEffect(() => {
    if (!secimli) return undefined;
    let iptal = false;
    void DilServisi.rakamSecimi().then((v) => {
      if (!iptal) setSecili(v ?? OTOMATIK);
    });
    return () => {
      iptal = true;
    };
  }, [secimli, kod]);

  const secenekler = useMemo<Secenek<Deger>[]>(
    () => [
      { deger: OTOMATIK, etiket: m.otomatik, aciklama: m.otomatikAciklama },
      ...(yerel ? [{ deger: yerel, etiket: m.dogu, aciklama: rakamlariCevir(ORNEK, yerel), aciklamaRakamKoru: true }] : []),
      { deger: 'latn', etiket: m.bati, aciklama: ORNEK, aciklamaRakamKoru: true },
    ],
    [m, yerel]
  );

  const sec = useCallback((deger: Deger) => {
    setSecili(deger);
    DilServisi.rakamKaydet(deger === OTOMATIK ? null : deger).catch((e: unknown) =>
      Logger.warn('RakamSecimi', 'Rakam seçimi kaydedilemedi', e)
    );
  }, []);

  if (!secimli || secili === null) return null;
  return (
    <View style={{ marginTop: 24 }} testID="rakam-secimi">
      <Text style={{ fontSize: 17, fontWeight: '700', color: renkler.metin, marginBottom: 4 }} accessibilityRole="header">
        {m.baslik}
      </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: renkler.metinIkincil, marginBottom: 12 }}>{m.aciklama}</Text>
      <SecenekListesi erisimEtiketi={m.baslik} secenekler={secenekler} secili={secili} onSec={sec} />
    </View>
  );
};
