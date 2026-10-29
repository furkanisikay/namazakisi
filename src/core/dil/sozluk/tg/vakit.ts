import type { Sozluk } from '../tr';

/**
 * Tacikçe vakit adları (Tacikistan cami çizelgeleri): Бомдод · Тулӯъ · Пешин · Аср · Шом · Хуфтан;
 * cuma Ҷумъа. Cümle içinde vakit adı küçük harfle yazılır (`kucuk`: "намози пешин"); `buyuk`
 * elle büyük harf (Ҷ, Ӯ, Ҳ dahil). Çizelge satırı (`imsakVakti`) fecir/sabah adıdır: Бомдод.
 * İzafette ъ düşer: "тулӯи офтоб".
 * Terimler: Kıldım = "Хондам" · Kılındı = "Хонда шуд" · kaza қазо (намози қазо) · nafile нафл ·
 * kıble қибла · kerahat вақти макрӯҳ · teheccüd таҳаҷҷуд · kuşluk чошт · evvâbîn авобин ·
 * vitir витр · seri силсила · toparlanma барқарорсозӣ · Namaz Muhafızı Нигаҳбони намоз ·
 * hesap yöntemi усули ҳисоб · ezan азон · kasr/cem қаср/ҷамъ · seferîlik мусофирӣ ·
 * Hanefî/Şâfiî ҳанафӣ/шофеӣ · Allah kabul etsin "Худо қабул кунад" · cami масҷид ·
 * sesli okuma хониши овозӣ · bildirim огоҳинома · ayarlar танзимот · hatırlatma ёдоварӣ.
 * Yönetim metni "Шумо" + kibar emir ("интихоб кунед"); ibadete çağrı "ту" + emir ("намоз бихон").
 * Rusçaya özgü ц, щ, ы, ь yalnız alıntıda (ay adları ICU tg biçimiyle ь'siz: "январ").
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Бомдод', gunes: 'Тулӯъ', ogle: 'Пешин', ikindi: 'Аср', aksam: 'Шом', yatsi: 'Хуфтан' },
  buyuk: { imsak: 'БОМДОД', gunes: 'ТУЛӮЪ', ogle: 'ПЕШИН', ikindi: 'АСР', aksam: 'ШОМ', yatsi: 'ХУФТАН' },
  kucuk: { imsak: 'бомдод', gunes: 'тулӯъ', ogle: 'пешин', ikindi: 'аср', aksam: 'шом', yatsi: 'хуфтан' },
  imsakVakti: 'Бомдод',
  cuma: 'Ҷумъа',
  cumaKucuk: 'ҷумъа',
  gunesDogusu: 'Тулӯи офтоб',
  gunesDogusuKucuk: 'тулӯи офтоб',
  durum: { kilindi: 'Хонда шуд', vaktiGeldi: 'Вақташ расид', girmedi: 'Ҳанӯз нарасидааст', gecti: 'Хонда нашуд' },
  durumKucuk: { kilindi: 'хонда шуд', vaktiGeldi: 'вақташ расид', girmedi: 'ҳанӯз нарасидааст', gecti: 'хонда нашуд' },
  eylem: { kildim: 'Хондам', kilindi: 'Хонда шуд' },
  kerahatVakti: 'Вақти макрӯҳ',
  isaretle: 'Ҳамчун хондашуда қайд кардан',
  geriAlEtiketi: '{durum}, барои бекор кардан пахш кунед',
  geriAlindi: 'Қайд бекор шуд',
};
