import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Bildirişlər ibadətə çağırışdır ("sən" + əmr); izahlar "siz". Saatdan sonra "-dək" (ahəngə tabe deyil). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Əvvabin', teheccud: 'Təhəccüd' },
  kucuk: { kusluk: 'duha', evvabin: 'əvvabin', teheccud: 'təhəccüd' },
  aciklamalar: {
    kusluk:
      'Günəş çıxdıqdan təxminən 45 dəqiqə sonra başlayır, zöhr vaxtına 10 dəqiqə qalanadək davam edir. İşraq duha vaxtının ilk anıdır; ən fəzilətlisi günün ilk dörddə biri keçdikdən sonradır.',
    evvabin: 'Məğrib namazından sonra, işa vaxtına qədər qılınır.',
    teheccud: 'İşadan sonra yatıb qalxdıqdan sonra, sübh vaxtına qədər qılınır. Ən fəzilətli vaxtı gecənin son üçdə biridir.',
  },
  bilgiBugun: '{aciklama}\n\nBu gün: {bas} – {son}',
  enFaziletli: ' · ən fəzilətli vaxtın başlanğıcı {saat}',
  sonUcteBir: ' · son üçdə bir {saat}',
  durumAktif: 'Vaxt daxil olub · bitir {saat}',
  durumNafile: 'Nafilə · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duha vaxtı',
    kuslukSuruyor: 'Duha vaxtı davam edir; saat {son}-dək qıla bilərsən.',
    kuslukGirdi: 'Duha vaxtı daxil oldu. İki rükət üçün gözəl məqamdır; vaxt saat {son}-dək davam edir.',
    kuslukBitiyor: cogul({
      one: 'Duha vaxtının bitməsinə {n} dəqiqə qalıb. İki rükət üçün gözəl məqamdır; vaxt saat {son}-dək davam edir.',
      other: 'Duha vaxtının bitməsinə {n} dəqiqə qalıb. İki rükət üçün gözəl məqamdır; vaxt saat {son}-dək davam edir.',
    }),
    evvabinBaslik: 'Əvvabin',
    evvabinSuruyor: 'Əvvabin üçün vaxt davam edir. İşa vaxtı {son}.',
    evvabinGirdi: 'Məğrib namazından sonra əvvabin üçün gözəl məqamdır. İşa vaxtı {son}.',
    evvabinKalan: cogul({ one: 'Əvvabin üçün {n} dəqiqə qalıb. İşa vaxtı {son}.', other: 'Əvvabin üçün {n} dəqiqə qalıb. İşa vaxtı {son}.' }),
    teheccudBaslik: 'Təhəccüd vaxtı',
    uyandirSonUcte: 'Qalx; gecənin son üçdə biri daxil oldu. Sübh vaxtı {son}.',
    uyandirKalan: cogul({ one: 'Qalx; sübhə {n} dəqiqə qalıb. Sübh vaxtı {son}.', other: 'Qalx; sübhə {n} dəqiqə qalıb. Sübh vaxtı {son}.' }),
    sonUcteBaslik: 'Gecənin son üçdə biri',
    sonUcteGovde: 'Təhəccüd üçün ən bərəkətli saatlar. Sübh vaxtı {son}.',
    teheccudKalan: cogul({ one: 'Sübhə {n} dəqiqə qalıb. Təhəccüd üçün gözəl vaxtdır.', other: 'Sübhə {n} dəqiqə qalıb. Təhəccüd üçün gözəl vaxtdır.' }),
  },
  uyandirmaKanali: 'Təhəccüd üçün oyatma',
  uyandirmaKanaliAciklama: 'Gecə namazı üçün oyadır; səssiz rejimdə də çalır',
};
