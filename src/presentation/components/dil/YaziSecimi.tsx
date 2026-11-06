/**
 * Alfabe seçimi (Ayarlar > Dil > "Alfabe") — yalnız iki alfabeyle yazılan dilde (Özbekçe,
 * Kazakça; `core/dil/yazi`) çizilir. Seçenekler: otomatik (ülkeye göre; ülke istisnası yoksa
 * dilin varsayılanı: Özbekçede Latin, Kazakçada Kiril), Latin ve Kiril. `RakamSecimi`'nin ikizi;
 * görsel dil aynı (başlık + açıklama + radyo kartları).
 *
 * Seçim metni DEĞİŞTİRİR (sözlük harf çevirisiyle yeniden kurulur): kayıt `yaziKaydet`
 * thunk'ından geçer, planlanmış bildirim/sesli okuma/widget metni yeni alfabeyle yeniden kurulur.
 * Seçenek açıklaması dilin kendi adıdır, iki alfabede (sözlükte değil burada: seçili alfabeden
 * bağımsız, her seçenek KENDİ alfabesiyle görünmeli).
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRenkler } from '../../../core/theme';
import { useMetin } from '../../hooks/useMetin';
import { useAppDispatch } from '../../store/hooks';
import { yaziKaydet } from '../../store/dilSlice';
import { SecenekListesi, type Secenek } from '../ortak/SecenekListesi';
import { kirildenLatine, YAZI_SECENEKLERI, yaziSecilebilir, type YaziSistemi } from '../../../core/dil/yazi';
import type { DilKodu } from '../../../core/dil/diller';
import { DilServisi } from '../../../domain/services/DilServisi';
import { Logger } from '../../../core/utils/Logger';

const OTOMATIK = 'otomatik';
type Deger = YaziSistemi | typeof OTOMATIK;

/** Dilin kendi adı, Kiril (kaynak) yazıyla; Latin biçimi harf çevirisinden. */
const KIRIL_ORNEK: Partial<Record<DilKodu, string>> = { uz: 'Ўзбекча', kk: 'Қазақша' };

export const YaziSecimi: React.FC<{ kod: DilKodu }> = ({ kod }) => {
  const renkler = useRenkler();
  const m = useMetin().dilAyar.yazi;
  const dispatch = useAppDispatch();
  const secimli = yaziSecilebilir(kod);
  const [secili, setSecili] = useState<Deger | null>(null);

  useEffect(() => {
    if (!secimli) return undefined;
    let iptal = false;
    void DilServisi.yaziSecimi().then((v) => {
      if (!iptal) setSecili(v ?? OTOMATIK);
    });
    return () => {
      iptal = true;
    };
  }, [secimli, kod]);

  const secenekler = useMemo<Secenek<Deger>[]>(() => {
    const kiril = KIRIL_ORNEK[kod] ?? '';
    const ornek: Record<YaziSistemi, string> = { cyrl: kiril, latn: kirildenLatine(kod, kiril) };
    const etiket: Record<YaziSistemi, string> = { latn: m.latin, cyrl: m.kiril };
    return [
      { deger: OTOMATIK, etiket: m.otomatik, aciklama: m.otomatikAciklama },
      ...(YAZI_SECENEKLERI[kod] ?? []).map((y) => ({ deger: y, etiket: etiket[y], aciklama: ornek[y] })),
    ];
  }, [m, kod]);

  const sec = useCallback(
    (deger: Deger) => {
      setSecili(deger);
      dispatch(yaziKaydet(deger === OTOMATIK ? null : deger))
        .unwrap()
        .catch((e: unknown) => Logger.warn('YaziSecimi', 'Alfabe seçimi kaydedilemedi', e));
    },
    [dispatch]
  );

  if (!secimli || secili === null) return null;
  return (
    <View style={{ marginTop: 24 }} testID="yazi-secimi">
      <Text style={{ fontSize: 17, fontWeight: '700', color: renkler.metin, marginBottom: 4 }} accessibilityRole="header">
        {m.baslik}
      </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: renkler.metinIkincil, marginBottom: 12 }}>{m.aciklama}</Text>
      <SecenekListesi erisimEtiketi={m.baslik} secenekler={secenekler} secili={secili} onSec={sec} />
    </View>
  );
};
