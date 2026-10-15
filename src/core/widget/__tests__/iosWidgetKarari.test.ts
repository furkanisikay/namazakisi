/**
 * iOS widget görünüm kararı (issue #295) — Swift ile ORTAK fikstür.
 *
 * `modules/expo-siri-kisayollari/test/widget-ios-ornek.json` hem bu test hem Swift
 * test koşucusu (`test/main.swift`, macOS CI'da `swiftc`) tarafından okunur. Widget
 * uzantısı ile uygulama aynı vakti farklı gösterirse kullanıcı kilit ekranında
 * "Öğle" görür, uygulamada başka vakit.
 */
import fs from 'fs';
import path from 'path';
import type { WidgetVakitAni } from '../widgetYuku';
import {
  iosGunVakitleri,
  iosWidgetGorunumu,
  iosWidgetSinirlari,
  IOS_WIDGET_AZAMI_SINIR,
  type IosBekleyenKildim,
} from '../iosWidgetKarari';

const KOK = path.join(__dirname, '../../../..');
const vakitler = (
  JSON.parse(fs.readFileSync(path.join(KOK, 'android/app/src/test/resources/widget-ornek.json'), 'utf8')) as {
    vakitler: WidgetVakitAni[];
  }
).vakitler;

interface Ozet {
  vakit: string;
  tarih: string;
}
interface Durum {
  ad: string;
  simdiMs: number;
  kilinanlar: Record<string, string[]>;
  bekleyenler: IosBekleyenKildim[];
  azamiSinir: number;
  beklenen: {
    aktif: Ozet | null;
    bitisMs: number | null;
    kilindi: boolean;
    sonraki: Ozet | null;
    gunTarihi: string | null;
    sinirlar: number[];
  };
}

const ornek = JSON.parse(
  fs.readFileSync(path.join(KOK, 'modules/expo-siri-kisayollari/test/widget-ios-ornek.json'), 'utf8')
) as { durumlar: Durum[]; gunler: { tarih: string; beklenen: string[] }[] };

const ozet = (v: WidgetVakitAni | null): Ozet | null => (v ? { vakit: v.vakit, tarih: v.tarih } : null);

describe('iOS widget görünüm kararı — Swift ile ortak fikstür', () => {
  it.each(ornek.durumlar.map((d) => [d.ad, d] as const))('%s', (_ad, d) => {
    const g = iosWidgetGorunumu(vakitler, d.kilinanlar, d.bekleyenler, d.simdiMs);
    expect({
      aktif: ozet(g.aktif),
      bitisMs: g.bitisMs,
      kilindi: g.kilindi,
      sonraki: ozet(g.sonraki),
      gunTarihi: g.gunTarihi,
      sinirlar: iosWidgetSinirlari(vakitler, d.simdiMs, d.azamiSinir),
    }).toEqual(d.beklenen);
  });

  it.each(ornek.gunler.map((g) => [g.tarih, g] as const))('gün vakitleri %s', (_t, g) => {
    expect(iosGunVakitleri(vakitler, g.tarih).map((v) => v.vakit)).toEqual(g.beklenen);
  });

  it('sınır listesi varsayılan olarak ~2 günle sınırlıdır ve dakikalık girdi üretmez', () => {
    const sinirlar = iosWidgetSinirlari(vakitler, vakitler[0].ms - 1);
    expect(sinirlar).toHaveLength(IOS_WIDGET_AZAMI_SINIR);
    // Her sınır gerçek bir vakit girişidir.
    for (const s of sinirlar) expect(vakitler.some((v) => v.ms === s)).toBe(true);
  });

  it('sırasız veride aynı sonuç', () => {
    const d = ornek.durumlar[0];
    expect(iosWidgetGorunumu([...vakitler].reverse(), {}, [], d.simdiMs)).toEqual(
      iosWidgetGorunumu(vakitler, {}, [], d.simdiMs)
    );
  });
});
