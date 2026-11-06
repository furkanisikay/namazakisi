/**
 * TakvimAyarlari ekranı ve alt bileşenleri arasında paylaşılan sabitler/yardımcılar.
 */
import type { TakvimVakitAdi } from '../../store/takvimSlice';
import { aktifDil, bicim, canli, dillerArasiDizin, sozluk } from '../../../core/dil/aktifDil';
import type { DilKodu } from '../../../core/dil/diller';

/** Vaktin görünen adı (etkin dilde; kimlik `TakvimVakitAdi`). */
export const VAKIT_GORUNTU_ADLARI: Readonly<Record<TakvimVakitAdi, string>> = canli((s) => s.vakit.adlar);

export const VAKIT_SIRASI: TakvimVakitAdi[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/**
 * Etkinlik başlığı ("Öğle Namazı" / "Dhuhr prayer") — `TakvimServisi`'nin cihaz takvimine
 * yazdığıyla AYNI şablon (`takvim.etkinlikBasligi`).
 */
export const vakitEtkinlikBasligi = (vakit: TakvimVakitAdi, kod: DilKodu = aktifDil()): string => {
    const s = sozluk(kod);
    return bicim(s.takvim.etkinlikBasligi, { ad: s.vakit.adlar[vakit] });
};

/**
 * Temizlik süzgeci: vaktin BÜTÜN dillerdeki başlıkları (dil değiştiren kullanıcının eski etkinlikleri);
 * iki alfabeli dilde (Özbekçe, Kazakça) her alfabedeki başlık (alfabe değiştiren kullanıcının eski etkinlikleri).
 * Bütün diller paketlemede hesaplanan dizinden gelir (78 sözlüğü açmaz); etkin dilin başlığı ayrıca
 * eklenir (kullanıcının seçtiği vakit adı takımı dizinde yoktur).
 */
export const vakitTemizleBasliklari = (vakit: TakvimVakitAdi): string[] => [
    ...new Set([...dillerArasiDizin().takvim[vakit], vakitEtkinlikBasligi(vakit)]),
];

export function saatFormatla(tarih: Date): string {
    return `${tarih.getHours().toString().padStart(2, '0')}:${tarih.getMinutes().toString().padStart(2, '0')}`;
}
