import type { Sozluk } from '../tr';

/**
 * Sırpça (Kiril, ekavyen): gün ve ay adları küçük harf. Uzun tarih CLDR'ye uyar, tarih içinde
 * ay adı YALIN ("31. октобар 2026.", sahip kararı; işletim sistemiyle tutarlı); `aylarYalin`
 * takvim başlığıdır ve CLDR bağımsız biçimi gibi küçük harflidir ("октобар 2026."; `ayAdiniAl`
 * cümle içi tarihte de kullanılır: "до 31. октобар"). Tarih sonda nokta taşır.
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'],
  gunlerKisa: ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
  aylar: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
  aylarYalin: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
  aylarKisa: ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
  haftaHarfleri: ['По', 'Ут', 'Ср', 'Че', 'Пе', 'Су', 'Не'],
  uzun: '{gun}. {ay} {yil}.',
  gunAdiYil: '{gunAdi}, {yil}',
};
