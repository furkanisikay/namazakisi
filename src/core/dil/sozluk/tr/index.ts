/**
 * KAYNAK sözlük. Yeni metin önce buraya eklenir; `Sozluk` tipi buradan türediği için
 * diğer dillerde aynı anahtar yoksa `tsc` hata verir.
 */
import type { Genislet } from '../../tipler';
import { ortak } from './ortak';
import { kurulum } from './kurulum';
import { hatirlatma } from './hatirlatma';
import { samimiyet } from './samimiyet';
import { vakit } from './vakit';
import { tarih } from './tarih';
import { sure } from './sure';
import { anaEkran } from './anaEkran';
import { hesap } from './hesap';
import { seferilik } from './seferilik';
import { kaza } from './kaza';
import { seri } from './seri';
import { sade } from './sade';
import { muhafiz } from './muhafiz';
import { icerik } from './icerik';
import { otomasyon } from './otomasyon';
import { bildirim } from './bildirim';
import { nafile } from './nafile';
import { sayac } from './sayac';
import { nowBar } from './nowBar';

export const tr = { ortak, vakit, tarih, sure, anaEkran, hesap, seferilik, kaza, seri, sade, muhafiz, icerik, otomasyon, bildirim, nafile, sayac, nowBar, kurulum, hatirlatma, samimiyet } as const;

export type Sozluk = Genislet<typeof tr>;
