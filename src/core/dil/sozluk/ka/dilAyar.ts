// ÇEVİRİ: ka — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'ენა · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Თურქული', en: 'Ინგლისური', id: 'Ინდონეზიური', de: 'Გერმანული', fr: 'Ფრანგული', bs: 'Ბოსნიური', ru: 'Რუსული', ms: 'Მალაიური', ar: 'Არაბული', ur: 'Ურდუ', es: 'Ესპანური', nl: 'Ნიდერლანდური', sq: 'Ალბანური', hi: 'Ჰინდი', bn: 'Ბენგალური', fa: 'Სპარსული', ps: 'Პუშტუ', ckb: 'Ცენტრალური ქურთული', ug: 'Უიღურული', az: 'Აზერბაიჯანული', uz: 'Უზბეკური', kk: 'Ყაზახური', ky: 'Ყირგიზული', tg: 'Ტაჯიკური', sw: 'Სუაჰილი', ha: 'Ჰაუსა', am: 'Ამჰარული', om: 'Ორომო', so: 'Სომალიური', ff: 'Ფულა', yo: 'Იორუბა', zh: 'Გამარტივებული ჩინური', ta: 'Ტამილური', ml: 'Მალაიალამური', th: 'Ტაილანდური', ko: 'Კორეული', vi: 'Ვიეტნამური', pt: 'Პორტუგალიური', it: 'Იტალიური', sv: 'Შვედური', uk: 'Უკრაინული', ro: 'Რუმინული', hr: 'Ხორვატული', sr: 'Სერბული', el: 'Ბერძნული', ku: 'Ქურთული (Kurmancî)', tk: 'Თურქმენული', tt: 'Თათრული', sd: 'Სინდჰური', pl: 'Პოლონური', ja: 'Იაპონური', gu: 'Გუჯარათი', bg: 'Ბულგარული', mk: 'Მაკედონური', fil: 'Ფილიპინური', te: 'Ტელუგუ', kn: 'Კანადა', mr: 'Მარათჰი', pa: 'Პენჯაბური (არაბული, პაკისტანი)', as: 'Ასამური', ne: 'Ნეპალური', si: 'Სინჰალური', km: 'Ქმერული', he: 'Ებრაული', ka: 'ქართული', lt: 'Ლიეტუვური', mg: 'Მალაგასიური', lg: 'Განდა', rw: 'Კინიარუანდა', rn: 'Რუნდი', ln: 'Ლინგალა', dag: 'Dagbani', mos: 'Მოსი', aa: 'Აფარი', mdh: 'Maguindanao', ak: 'Აკანი', ceb: 'Სებუანო', nqo: 'Ნკო' },
  cihazDili: 'Device language',
  cihazDiliKullaniliyor: 'Currently {ad}',
  cihazDiliDesteklenmiyor: "Your device language isn't available yet; Turkish is used.",
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta translations are being reviewed; some text may be imperfect.',
    vakit: "The language doesn't change how prayer times are calculated.",
    nass: 'In languages other than Turkish, only Quran translations are shown; hadith texts come from a Turkish source, so they are not shown.',
  },
  ozelAnons: {
    baslik: 'Read-aloud texts you wrote',
    govde: cogul({
      one: '{n} read-aloud text you wrote is still in the previous language. Replace it with the ready-made text in the new language?',
      other: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
    }),
    degistir: 'Replace with ready-made text',
    koru: 'Keep as is',
    degisti: cogul({ one: '{n} text replaced.', other: '{n} texts replaced.' }),
  },
  vakitAdlari: {
    baslik: 'Prayer names',
    aciklama: 'Choose how prayer times are named.',
    otomatik: 'By country',
    otomatikAciklama: 'Uses the names common in the country of your location.',
    takimlar: { temel: 'Arabic names', diyanetDe: 'Diyanet (German)', turkce: 'Turkish names', magrip: 'Maghrebi spelling', cezayir: 'Algerian spelling', afgan: 'Afghan names' },
  },
  yazi: {
    baslik: 'Alphabet',
    aciklama: 'Choose which alphabet text is written in.',
    otomatik: 'By country',
    otomatikAciklama: 'Uses the alphabet common in the country of your location.',
    latin: 'Latin alphabet',
    kiril: 'Cyrillic alphabet',
  },
  kaydedilemedi: "The language couldn't be saved. Try again.",
  sihirbazBaglantisi: 'ენა · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
