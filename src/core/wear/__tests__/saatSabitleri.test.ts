/**
 * Saat (Wear OS) ile telefonun PAYLAŞTIĞI sabitlerin nöbetçisi.
 *
 * Saatin ana ekranı vaktin son dakikalarını acil renge çevirir; eşik telefondaki
 * muhafızın acil tonu eşiğiyle AYNI olmalı (`ACIL_TON_UST_DK`), yoksa telefon "acil"
 * derken saat sakin görünür. Kotlin tarafı JS'i import edemediği için dosya okunur
 * (`anahtarKelimeler.test.ts` deseni).
 */
import * as fs from 'fs';
import * as path from 'path';
import { ACIL_TON_UST_DK } from '../../muhafiz/motorAdaptoru';

const KOK = path.resolve(__dirname, '../../../..');
const PALET = 'wear/app/src/main/java/com/furkanisikay/namazakisi/saat/cekirdek/SaatPaleti.kt';

describe('saat sabitleri telefonla aynı', () => {
  it('acil eşik (dk) = ACIL_TON_UST_DK', () => {
    const kaynak = fs.readFileSync(path.join(KOK, PALET), 'utf8');
    const eslesme = kaynak.match(/const val ACIL_ESIK_DK = (\d+)/);
    expect(eslesme).not.toBeNull();
    expect(Number(eslesme![1])).toBe(ACIL_TON_UST_DK);
  });
});
