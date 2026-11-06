import type { Sozluk } from '../tr';

/** Çağrı metinleri isim cümlesidir (Arapçada emir cinsiyetlidir). "الصلاة خير من النوم" ve "حيّ على الفلاح" ezan lafzıdır. */
export const icerik: Sozluk['icerik'] = {
  ayetKunyesi: 'القرآن الكريم {ref} · {yayimci}، QuranEnc {surum}',
  vakitGirdi: {
    uykudan: 'الصلاة خير من النوم. حيّ على الفلاح.',
    araVer: 'استراحة قصيرة من شواغل الدنيا، ووقوف بين يدي الله.',
    yorgunluk: 'صلاة العصر راحة من تعب النهار وسكينة للقلب.',
    sukur: 'صلاة المغرب شكرٌ على اليوم، والمبادرة إليها أولى.',
    aksamKisa: 'وقت المغرب قصير وقد دخل. الصلاة دون تأخير.',
    geceKaranligi: 'في ظلمة الليل خلوة مع الله. صلاة العشاء دواء للروح.',
    davet: 'صلاة العشاء دعوة لختام اليوم ابتغاء مرضاة الله.',
  },
};
