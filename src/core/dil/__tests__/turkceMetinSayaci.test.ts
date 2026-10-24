/**
 * Dil çıkarımı CIRCIRI: dosya başına Türkçe sabit metin sayısı kayıtlı tavanı AŞAMAZ.
 *
 * Yeni ekran metni sözlüğe (`src/core/dil/sozluk/tr`) yazılır; doğrudan Türkçe dize
 * eklemek bu testi kırar. Metin çıkarınca tavanı indirin:
 *   node scripts/dil/turkceMetinSay.js --yaz
 * (tavan yalnız düşer; artan dosya için betik eski değeri korur, test kırık kalır).
 */
import * as fs from 'fs';

const { sayim, TAVAN } = require('../../../../scripts/dil/turkceMetinSay');

const tavan: { toplam: number; dosyalar: Record<string, number> } = JSON.parse(fs.readFileSync(TAVAN, 'utf8'));

it('hiçbir dosya Türkçe sabit metin tavanını aşmaz (yeni metin sözlüğe)', () => {
  const simdi: Record<string, number> = sayim();
  const asan = Object.entries(simdi)
    .filter(([dosya, n]) => n > (tavan.dosyalar[dosya] ?? 0))
    .map(([dosya, n]) => `${dosya}: ${n} > ${tavan.dosyalar[dosya] ?? 0}`);
  expect(asan).toEqual([]);
});

it('tavan güncel: çıkarılan metin tavana işlenmiş (betikle --yaz)', () => {
  const simdi: Record<string, number> = sayim();
  const dusen = Object.entries(tavan.dosyalar)
    .filter(([dosya, n]) => (simdi[dosya] ?? 0) < n)
    .map(([dosya, n]) => `${dosya}: ${simdi[dosya] ?? 0} < ${n}`);
  expect(dusen).toEqual([]);
});
