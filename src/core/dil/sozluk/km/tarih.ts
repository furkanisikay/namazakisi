import type { Sozluk } from '../tr';

/** Khmerce gün/ay adları (CLDR km). Yıl miladî ve Batı rakamıyla yazılır. Hafta harflerinde çakışan CLDR dar biçimleri (អ/ព/ស) ikinci harfle ayrıldı. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'],
  gunlerKisa: ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'],
  aylar: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
  aylarYalin: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
  aylarKisa: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
  haftaHarfleri: ['ច', 'អ', 'ពុ', 'ព្រ', 'សុ', 'សៅ', 'អា'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi} {yil}',
};
