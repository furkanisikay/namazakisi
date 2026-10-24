/**
 * KAYNAK sözlük. Yeni metin önce buraya eklenir; `Sozluk` tipi buradan türediği için
 * diğer dillerde aynı anahtar yoksa `tsc` hata verir.
 */
import type { Genislet } from '../../tipler';
import { ortak } from './ortak';

export const tr = { ortak } as const;

export type Sozluk = Genislet<typeof tr>;
