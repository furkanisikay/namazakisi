/**
 * Otomasyon rehberinin yazdığı native etiketler Android kaynaklarıyla birebir aynı olmalı:
 * her `values-*` dizini (kısayol + eklenti etiketi taşıyan) tabloda kendi dil koduyla bulunur.
 */
import * as fs from 'fs';
import * as path from 'path';

import { NATIVE_ETIKETLER, nativeEtiketleri, type NativeEtiket } from '../nativeEtiketler';

const RES = path.join(__dirname, '../../../../android/app/src/main/res');
const ANAHTARLAR: Record<keyof NativeEtiket, string> = {
  kisayol: 'kisayol_kildim_uzun',
  olay: 'otomasyon_olay_etiket',
  kosul: 'otomasyon_kosul_etiket',
  eylem: 'otomasyon_eylem_etiket',
};

const coz = (s: string) =>
  s.replace(/\\(['"])/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function kaynakEtiketleri(dizin: string): Partial<NativeEtiket> {
  const sonuc: Partial<NativeEtiket> = {};
  for (const dosya of ['strings.xml', 'otomasyon.xml']) {
    const yol = path.join(RES, dizin, dosya);
    if (!fs.existsSync(yol)) continue;
    const xml = fs.readFileSync(yol, 'utf8');
    for (const [alan, ad] of Object.entries(ANAHTARLAR) as Array<[keyof NativeEtiket, string]>) {
      const m = xml.match(new RegExp(`<string name="${ad}">([^<]*)</string>`));
      if (m) sonuc[alan] = coz(m[1]);
    }
  }
  return sonuc;
}

const dilKodu = (dizin: string) => {
  const q = dizin.slice('values-'.length) || 'tr';
  return q === 'in' ? 'id' : q.replace(/^b\+/, '');
};

const dizinler = fs
  .readdirSync(RES)
  .filter((d) => d === 'values' || d.startsWith('values-'))
  .filter((d) => Object.keys(kaynakEtiketleri(d)).length === 4);

it('her dil dizininin kısayol ve eklenti etiketleri tabloda birebir', () => {
  expect(dizinler.length).toBeGreaterThan(10);
  for (const d of dizinler) {
    const kod = dilKodu(d);
    expect([d, (NATIVE_ETIKETLER as Record<string, NativeEtiket>)[kod]]).toEqual([d, kaynakEtiketleri(d)]);
  }
});

it('tabloda kaynağı olmayan dil yok', () => {
  const kaynakDiller = new Set(dizinler.map(dilKodu));
  expect(Object.keys(NATIVE_ETIKETLER).filter((k) => !kaynakDiller.has(k))).toEqual([]);
});

it('cihaz yerel ayarı çözülür; Endonezce eski kodla, bilinmeyen dil Türkçeye düşer', () => {
  expect(nativeEtiketleri('in_ID')).toBe(NATIVE_ETIKETLER.id);
  expect(nativeEtiketleri('ckb-IQ')).toBe(NATIVE_ETIKETLER.ckb);
  expect(nativeEtiketleri('de-DE')).toBe(NATIVE_ETIKETLER.de);
  expect(nativeEtiketleri('zh_CN_#Hans')).toBe(NATIVE_ETIKETLER.zh);
  expect(nativeEtiketleri('ja_JP')).toBe(NATIVE_ETIKETLER.tr);
  expect(nativeEtiketleri(null)).toBe(NATIVE_ETIKETLER.tr);
});
