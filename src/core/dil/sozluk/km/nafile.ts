import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Teheccüd សឡាតតះជុត (meal `khmer_cambodia` 17:79). Kuşluk (Duha) ve evvâbîn Khmer kaynakta bulunamadı: Arapça addan yazıldı (DOĞRULANMADI). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'ឌូហា', evvabin: 'អាវវ៉ាប៊ីន', teheccud: 'តះជុត' },
  kucuk: { kusluk: 'ឌូហា', evvabin: 'អាវវ៉ាប៊ីន', teheccud: 'តះជុត' },
  aciklamalar: {
    kusluk:
      'ចាប់ផ្ដើមប្រហែល 45 នាទីក្រោយថ្ងៃរះ ហើយបន្តរហូតដល់ 10 នាទីមុនហ្ស៊ូហូរ។ អ៊ីស្រ៉ក់ជាពេលដំបូងបំផុត ពេលប្រសើរបំផុតគឺក្រោយមួយភាគបួននៃថ្ងៃបានកន្លងផុត។',
    evvabin: 'ធ្វើក្រោយម៉ាហ្គ្រិប រហូតដល់ពេលអ៊ីស្ហា។',
    teheccud: 'ធ្វើក្រោយអ៊ីស្ហា បន្ទាប់ពីគេង ហើយភ្ញាក់ឡើង រហូតដល់ពេលស៊ូពុស។ ពេលប្រសើរបំផុតគឺមួយភាគបីចុងក្រោយនៃយប់។',
  },
  bilgiBugun: '{aciklama}\n\nថ្ងៃនេះ៖ {bas} – {son}',
  enFaziletli: ' · ប្រសើរបំផុតក្រោយ {saat}',
  sonUcteBir: ' · មួយភាគបីចុងក្រោយ {saat}',
  durumAktif: 'បានចូលពេលហើយ · ផុតនៅ {saat}',
  durumNafile: 'សឡាតបន្ថែម · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'ពេលឌូហា',
    kuslukSuruyor: 'ពេលឌូហាកំពុងបន្ត អាចសឡាតរហូតដល់ {son}។',
    kuslukGirdi: 'ពេលឌូហាបានចូលហើយ។ ជាពេលល្អសម្រាប់ពីររ៉ក្អាត់ វាបន្តរហូតដល់ {son}។',
    kuslukBitiyor: cogul({
      other: 'ពេលឌូហានៅសល់ {n} នាទី។ ជាពេលល្អសម្រាប់ពីររ៉ក្អាត់ វាបន្តរហូតដល់ {son}។',
    }),
    evvabinBaslik: 'អាវវ៉ាប៊ីន',
    evvabinSuruyor: 'នៅមានពេលសម្រាប់អាវវ៉ាប៊ីន។ អ៊ីស្ហាចូលនៅ {son}។',
    evvabinGirdi: 'ក្រោយម៉ាហ្គ្រិប ជាពេលល្អសម្រាប់អាវវ៉ាប៊ីន។ អ៊ីស្ហាចូលនៅ {son}។',
    evvabinKalan: cogul({ other: 'នៅសល់ {n} នាទីសម្រាប់អាវវ៉ាប៊ីន។ អ៊ីស្ហាចូលនៅ {son}។' }),
    teheccudBaslik: 'ពេលតះជុត',
    uyandirSonUcte: 'ក្រោកឡើង មួយភាគបីចុងក្រោយនៃយប់បានចាប់ផ្ដើមហើយ។ ស៊ូពុសចូលនៅ {son}។',
    uyandirKalan: cogul({ other: 'ក្រោកឡើង នៅសល់ {n} នាទីទៀតដល់ស៊ូពុស។ ស៊ូពុសចូលនៅ {son}។' }),
    sonUcteBaslik: 'មួយភាគបីចុងក្រោយនៃយប់',
    sonUcteGovde: 'ម៉ោងដែលមានពរជ័យបំផុតសម្រាប់តះជុត។ ស៊ូពុសចូលនៅ {son}។',
    teheccudKalan: cogul({ other: 'នៅសល់ {n} នាទីទៀតដល់ស៊ូពុស។ ជាពេលល្អសម្រាប់តះជុត។' }),
  },
  uyandirmaKanali: 'ដាស់សម្រាប់តះជុត',
  uyandirmaKanaliAciklama: 'ដាស់អ្នកសម្រាប់សឡាតពេលយប់ រោទ៍សូម្បីតែក្នុងមុខងារស្ងាត់',
};
