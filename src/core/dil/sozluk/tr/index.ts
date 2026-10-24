/**
 * KAYNAK sözlük. Yeni metin önce buraya eklenir; `Sozluk` tipi buradan türediği için
 * diğer dillerde aynı anahtar yoksa `tsc` hata verir.
 */
import type { Genislet } from '../../tipler';
import { ortak } from './ortak';
import { kurulum } from './kurulum';
import { hatirlatma } from './hatirlatma';
import { samimiyet } from './samimiyet';

export const tr = { ortak, kurulum, hatirlatma, samimiyet } as const;

export type Sozluk = Genislet<typeof tr>;
