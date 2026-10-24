#!/usr/bin/env node
/**
 * Bildirim ve içerik havuzlarında geçen ayetlerin meallerini QuranEnc'ten indirip
 * `src/core/data/ayetMealleri.ts`'e yazar. QuranEnc koşulları: metin DEĞİŞTİRİLMEZ ve
 * KESİLMEZ, yayımcı + kaynak + sürüm belirtilir, en son sürüme güncellenir → bu betik
 * yeniden koşulunca sürüm ve metin tazelenir.
 *
 * Kullanım: node scripts/icerik/ayet-mealleri-uret.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

/** Dil → QuranEnc çeviri anahtarı (Türkçe havuz kendi doğrulanmış metnini taşır). */
const MEALLER = { en: 'english_saheeh' };

/** Havuzlarda geçen ayetler: [sûre, ayet]. Yeni ayet eklerken buraya ekleyip betiği koş. */
const AYETLER = [
  [2, 153], [2, 238], [4, 103], [11, 114], [29, 45], [62, 9],
];

const KOK = path.resolve(__dirname, '..', '..');
const HEDEF = path.join(KOK, 'src', 'core', 'data', 'ayetMealleri.ts');

async function json(url) {
  const yanit = await fetch(url);
  if (!yanit.ok) throw new Error(`${url} → ${yanit.status}`);
  return yanit.json();
}

async function main() {
  const veri = {};
  for (const [dil, anahtar] of Object.entries(MEALLER)) {
    const liste = await json(`https://quranenc.com/api/v1/translations/list/${dil}`);
    const kunye = liste.translations.find((t) => t.key === anahtar);
    if (!kunye) throw new Error(`${anahtar} QuranEnc listesinde yok`);
    const ayetler = {};
    for (const [sure, ayet] of AYETLER) {
      const { result } = await json(`https://quranenc.com/api/v1/translation/aya/${anahtar}/${sure}/${ayet}`);
      ayetler[`${sure}:${ayet}`] = result.translation;
    }
    veri[dil] = { anahtar, surum: kunye.version, baslik: kunye.title, ayetler };
  }
  const govde = `/**
 * ÜRETİLMİŞ DOSYA — elle düzenleme; \`node scripts/icerik/ayet-mealleri-uret.js\`.
 * Kaynak: QuranEnc (quranenc.com). Metinler değiştirilmeden ve kesilmeden alınır;
 * ekranda yayımcı ve sürümle birlikte gösterilir (\`ayetKunyesi\`).
 */
export interface MealKaynagi {
  /** QuranEnc çeviri anahtarı. */
  anahtar: string;
  surum: string;
  baslik: string;
  /** "sûre:ayet" → meal (birebir). */
  ayetler: Readonly<Record<string, string>>;
}

export const AYET_MEALLERI: Readonly<Record<string, MealKaynagi>> = ${JSON.stringify(veri, null, 2)};
`;
  fs.writeFileSync(HEDEF, govde);
  console.log(`${HEDEF} yazıldı (${Object.keys(veri).join(', ')})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
