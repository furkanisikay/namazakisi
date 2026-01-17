/**
 * Tema ve renk paleti tanimlari
 * Kullanici tercihine gore degisebilen renk sistemini icerir
 */

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
    };
  };
}

// Kullanilabilir renk paletleri
export const RENK_PALETLERI: RenkPaleti[] = [
  {
    id: 'zumrut',
    ad: 'Zümrüt',
    birincil: '#4CAF50',
    birincilKoyu: '#388E3C',
    birincilAcik: '#C8E6C9',
    vurgu: '#00BFA5',
  },
  {
    id: 'okyanus',
    ad: 'Okyanus',
    birincil: '#2196F3',
    birincilKoyu: '#1565C0',
    birincilAcik: '#BBDEFB',
    vurgu: '#00ACC1',
  },
  {
    id: 'lavanta',
    ad: 'Lavanta',
    birincil: '#7C4DFF',
    birincilKoyu: '#651FFF',
    birincilAcik: '#E8DEF8',
    vurgu: '#E040FB',
  },
  {
    id: 'gunes',
    ad: 'Güneş',
    birincil: '#FF9800',
    birincilKoyu: '#F57C00',
    birincilAcik: '#FFE0B2',
    vurgu: '#FFC107',
  },
  {
    id: 'mercan',
    ad: 'Mercan',
    birincil: '#FF5722',
    birincilKoyu: '#E64A19',
    birincilAcik: '#FFCCBC',
    vurgu: '#FF4081',
  },
  {
    id: 'gece',
    ad: 'Gece',
    birincil: '#37474F',
    birincilKoyu: '#263238',
    birincilAcik: '#CFD8DC',
    vurgu: '#546E7A',
  },
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

