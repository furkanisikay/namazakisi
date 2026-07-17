import type { VakitAdi } from '../types';

export type MuhafizVakti = Exclude<VakitAdi, 'gunes'>;
export type SeviyeKademe = 'nazik' | 'uyari' | 'sert' | 'acil';
export type UyariModu = 'sessiz' | 'bildirim' | 'sesli' | 'ikisi';
export type Siklik = 'birkez' | { herDk: number };

export interface SeviyeAyari {
  kademe: SeviyeKademe;
  mod: UyariModu;
  esikDk: number;
  siklik: Siklik;
  bildirimSesi: string;
  anonsMetni: string;
}

export interface VakitMuhafizAyari {
  seviyeler: SeviyeAyari[]; // her zaman 4, SEVIYE_KADEMELERI sırası
}

export type MuhafizMatrisi = Record<MuhafizVakti, VakitMuhafizAyari>;

export const MUHAFIZ_VAKITLERI: MuhafizVakti[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];
export const SEVIYE_KADEMELERI: SeviyeKademe[] = ['nazik', 'uyari', 'sert', 'acil'];

export const SES_PALETI: { id: string; ad: string }[] = [
  { id: 'can', ad: 'Çan' },
  { id: 'melodi', ad: 'Melodi' },
  { id: 'alarm', ad: 'Alarm' },
];
export const VARSAYILAN_SES = 'can';
