/**
 * Telefonlarda konuşma sesi (TTS) olmayan arayüz dilleri. Bu dillerde cihaz sesi bulamayınca kullanıcıya
 * "ses indirin" DENMEZ (indirilecek ses yok); bilgi satırı "bu dilde ses yok" der, indirme düğmesi çıkmaz.
 * Liste yalnız uyarının metnini seçer: ses gerçekten kuruluysa (`useTurkceTtsDestegi` true) hiçbir şey
 * gösterilmez, yani yanlış giren bir dil zarar vermez. Kaynak: Google TTS (Android) ve iOS ses listelerinde
 * yok — dalga 11 (tk tt sd mk), dalga 12 (as pa) ve dalga 13 terim araştırmaları (2026-11-04). Kurmancî
 * belirsiz olduğu için girmez. Ses eklenen dil buradan çıkarılır.
 */
import type { DilKodu } from './diller';

export const SESI_OLMAYAN_DILLER: ReadonlySet<DilKodu> = new Set<DilKodu>([
  'tk', 'tt', 'sd', 'mk', 'as', 'pa',
  'ka', 'mg', 'lg', 'rw', 'rn', 'ln', 'dag', 'mos', 'aa', 'mdh', 'ak', 'ceb', 'nqo',
]);

/** Telefonlarda bu dil için konuşma sesi bulunmuyor mu? */
export function sesliOkumaSesiYok(dil: DilKodu): boolean {
  return SESI_OLMAYAN_DILLER.has(dil);
}
