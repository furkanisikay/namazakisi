/**
 * Tema ve renk paleti tanimlari
 * Kullanici tercihine gore degisebilen renk sistemini icerir
 */

import { metin } from '../dil/aktifDil';
import type { Sozluk } from '../dil/sozluk/tr';

// Renk paleti tipi
export interface RenkPaleti {
  id: string;
  ad: string;
  birincil: string;
  birincilKoyu: string;
  birincilAcik: string;
  vurgu: string;
}

// Tema tipi
export interface Tema {
  mod: 'acik' | 'koyu';
  renkler: {
    arkaplan: string;
    kartArkaplan: string;
    metin: string;
    metinIkincil: string;
    sinir: string;
    durum: {
      basarili: string;
      uyari: string;
      hata: string;
      bilgi: string;
      /**
       * TURUNCU "dikkat" (issue #298 — bildirim sınırına yaklaşma). `uyari`
       * sarı-amberdir ve turuncu DEĞİLDİR (AGENTS.md kontrast tuzağı). Yalnız
       * DEKORATİF kullanım (ikon, çubuk, kenar; ≥3:1) — küçük gövde metninde
       * kullanmayın, metin daima `metin`/`metinIkincil`.
       */
      dikkat: string;
    };
  };
}

// Kullanilabilir renk paletleri
/** Görünen ad etkin dilin sözlüğünden okunur (getter): palet `id`'si kimliktir. */
function palet(p: Omit<RenkPaleti, 'ad'> & { id: keyof Sozluk['genel']['paletler'] }): RenkPaleti {
  return Object.defineProperty({ ...p }, 'ad', {
    get: () => metin().genel.paletler[p.id],
    enumerable: true,
  }) as RenkPaleti;
}

export const RENK_PALETLERI: RenkPaleti[] = [
  palet({
    id: 'zumrut',
    birincil: '#4CAF50',
    birincilKoyu: '#388E3C',
    birincilAcik: '#C8E6C9',
    vurgu: '#00BFA5',
  }),
  palet({
    id: 'okyanus',
    birincil: '#2196F3',
    birincilKoyu: '#1565C0',
    birincilAcik: '#BBDEFB',
    vurgu: '#00ACC1',
  }),
  palet({
    id: 'lavanta',
    birincil: '#7C4DFF',
    birincilKoyu: '#651FFF',
    birincilAcik: '#E8DEF8',
    vurgu: '#E040FB',
  }),
  palet({
    id: 'gunes',
    birincil: '#FF9800',
    birincilKoyu: '#F57C00',
    birincilAcik: '#FFE0B2',
    vurgu: '#FFC107',
  }),
  palet({
    id: 'mercan',
    birincil: '#FF5722',
    birincilKoyu: '#E64A19',
    birincilAcik: '#FFCCBC',
    vurgu: '#FF4081',
  }),
  palet({
    id: 'gece',
    birincil: '#37474F',
    birincilKoyu: '#263238',
    birincilAcik: '#CFD8DC',
    vurgu: '#546E7A',
  }),
];

// Acik tema renkleri
export const ACIK_TEMA: Tema = {
  mod: 'acik',
  renkler: {
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    durum: {
      basarili: '#4CAF50',
      uyari: '#FFC107',
      hata: '#F44336',
      bilgi: '#2196F3',
      dikkat: '#E65100',
    },
  },
};

// Koyu tema renkleri
export const KOYU_TEMA: Tema = {
  mod: 'koyu',
  renkler: {
    arkaplan: '#121212',
    kartArkaplan: '#1E1E1E',
    metin: '#FFFFFF',
    metinIkincil: '#B0B0B0',
    sinir: '#333333',
    durum: {
      basarili: '#66BB6A',
      uyari: '#FFCA28',
      hata: '#EF5350',
      bilgi: '#42A5F5',
      dikkat: '#FFB74D',
    },
  },
};

// Varsayilan palet
export const VARSAYILAN_PALET_ID = 'zumrut';

// Tema modu tipi
export type TemaModu = 'sistem' | 'acik' | 'koyu';

// Kullanici tercihleri tipi
export interface TemaTercihleri {
  mod: TemaModu;
  paletId: string;
}

// Varsayilan tercihler
export const VARSAYILAN_TERCIHLER: TemaTercihleri = {
  mod: 'sistem',
  paletId: VARSAYILAN_PALET_ID,
};

