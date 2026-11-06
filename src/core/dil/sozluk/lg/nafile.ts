import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Dhuha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Dhuha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Etandika nga wayise eddakiika nga 45 oluvannyuma lw’enjuba okuvaayo, n’ekoma eddakiika 10 nga Dhuhur tennatuuka. Ishraq kye kiseera kyayo ekisooka; ekisinga obulungi kiri ng’ekitundu ekisooka eky’emisana kiyise.',
    evvabin: 'Esaalibwa oluvannyuma lwa Magaribi, okutuusa ekiseera kya Ishai.',
    teheccud: 'Esaalibwa ng’omaze okwebaka n’ozuukuka oluvannyuma lwa Ishai, okutuusa ekiseera kya Subuhi. Ekiseera kyayo ekisinga obulungi kye kitundu eky’okusatu ekisembayo eky’ekiro.',
  },
  bilgiBugun: '{aciklama}\n\nLeero: {bas} – {son}',
  enFaziletli: ' · esinga obulungi oluvannyuma lwa {saat}',
  sonUcteBir: ' · ekitundu ekisembayo {saat}',
  durumAktif: 'Ekiseera kituuse · kiggwaako {saat}',
  durumNafile: 'Ennyongeza · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Ekiseera kya Dhuha',
    kuslukSuruyor: 'Ekiseera kya Dhuha kikyagenda; osobola okusaala okutuusa {son}.',
    kuslukGirdi: 'Ekiseera kya Dhuha kituuse. Kiseera kirungi eky’okusaala raaka bbiri; kikoma {son}.',
    kuslukBitiyor: cogul({
      one: 'Ekiseera kya Dhuha kisigazza eddakiika {n}. Kiseera kirungi eky’okusaala raaka bbiri; kikoma {son}.',
      other: 'Ekiseera kya Dhuha kisigazza eddakiika {n}. Kiseera kirungi eky’okusaala raaka bbiri; kikoma {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Wakyaliwo ekiseera kya Awwabin. Ishai etandika {son}.',
    evvabinGirdi: 'Oluvannyuma lwa Magaribi, kiseera kirungi ekya Awwabin. Ishai etandika {son}.',
    evvabinKalan: cogul({ one: 'Awwabin esigazza eddakiika {n}. Ishai etandika {son}.', other: 'Awwabin esigazza eddakiika {n}. Ishai etandika {son}.' }),
    teheccudBaslik: 'Ekiseera kya Tahajjud',
    uyandirSonUcte: 'Golokoka; ekitundu ekisembayo eky’ekiro kitandise. Subuhi etandika {son}.',
    uyandirKalan: cogul({ one: 'Golokoka; esigaddeyo eddakiika {n} Subuhi etuuke. Subuhi etandika {son}.', other: 'Golokoka; esigaddeyo eddakiika {n} Subuhi etuuke. Subuhi etandika {son}.' }),
    sonUcteBaslik: 'Ekitundu ekisembayo eky’ekiro',
    sonUcteGovde: 'Essaawa ezisinga emikisa eza Tahajjud. Subuhi etandika {son}.',
    teheccudKalan: cogul({ one: 'Esigaddeyo eddakiika {n} Subuhi etuuke. Kiseera kirungi ekya Tahajjud.', other: 'Esigaddeyo eddakiika {n} Subuhi etuuke. Kiseera kirungi ekya Tahajjud.' }),
  },
  uyandirmaKanali: 'Okuzuukusa kwa Tahajjud',
  uyandirmaKanaliAciklama: 'Ekuzuukusa olw’esswala ey’ekiro; evuga ne bw’oba ng’essimu esirisiddwa',
};
