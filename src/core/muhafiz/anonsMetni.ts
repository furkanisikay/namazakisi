import type { MuhafizVakti } from './matrisTipleri';

export const VAKIT_ADLARI_ANONS: Record<MuhafizVakti, string> = {
  imsak: 'Sabah', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı',
};

// Şablonlar vakit-agnostik ve "sen" dili (AGENTS.md muhafız istisnası).
export const ANONS_SABLONLARI: string[] = [
  '{vakit} vakti çıkıyor, son {süre} dakika.',
  '{vakit} namazını kaçırma, {süre} dakika kaldı.',
  'Vakit daralıyor, {vakit} namazına {süre} dakika.',
];

export function anonsMetniniCoz(sablon: string, vakit: MuhafizVakti, kalanDk: number): string {
  return sablon
    .split('{vakit}').join(VAKIT_ADLARI_ANONS[vakit])
    .split('{süre}').join(String(kalanDk));
}
