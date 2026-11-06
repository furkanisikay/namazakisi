import type { Sozluk } from '../tr';

/**
 * Në shqip emrat e muajve shkruhen me shkronjë të vogël brenda datës ("18 janar 2026");
 * `aylarYalin` (titulli i kalendarit) dhe listat fillojnë me të madhe.
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['E diel', 'E hënë', 'E martë', 'E mërkurë', 'E enjte', 'E premte', 'E shtunë'],
  gunlerKisa: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
  aylar: ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'],
  aylarYalin: ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'],
  aylarKisa: ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor', 'Gus', 'Sht', 'Tet', 'Nën', 'Dhj'],
  haftaHarfleri: ['Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh', 'Di'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
