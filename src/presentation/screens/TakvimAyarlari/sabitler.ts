/**
 * TakvimAyarlari ekranı ve alt bileşenleri arasında paylaşılan sabitler/yardımcılar.
 */
import type { TakvimVakitAdi } from '../../store/takvimSlice';

export const VAKIT_GORUNTU_ADLARI: Record<TakvimVakitAdi, string> = {
    imsak:  'Sabah',
    ogle:   'Öğle',
    ikindi: 'İkindi',
    aksam:  'Akşam',
    yatsi:  'Yatsı',
};

export const VAKIT_SIRASI: TakvimVakitAdi[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

// Event title → temizle filtresi için
export const VAKIT_TEMIZLE_BASLIK: Record<TakvimVakitAdi, string> = {
    imsak:  'Sabah Namazı',
    ogle:   'Öğle Namazı',
    ikindi: 'İkindi Namazı',
    aksam:  'Akşam Namazı',
    yatsi:  'Yatsı Namazı',
};

export function saatFormatla(tarih: Date): string {
    return `${tarih.getHours().toString().padStart(2, '0')}:${tarih.getMinutes().toString().padStart(2, '0')}`;
}
