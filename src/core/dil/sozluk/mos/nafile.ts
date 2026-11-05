import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duhaa', evvabin: 'Awaabiin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duhaa', evvabin: 'Awaabiin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'A sɩngda wĩntoogã puk poorẽ wala minit 45, n tãag Zafar taoore minit 10. Ishraaq yaa a wakat sẽn deng fãa; a sõmblem sẽn yɩɩd yaa raarã naas-n-yembr sẽn loog poorẽ.',
    evvabin: 'B pʋʋsda-a Magrib poorẽ, n tãag Sãanfo wakato.',
    teheccud: 'B pʋʋsda-a Sãanfo poorẽ, ned sã n gõ n yik, n tãag Fagir wakato. A wakat sẽn yɩɩd sõma yaa yʋngã tãab-n-yembr sẽn kõnsã.',
  },
  bilgiBugun: '{aciklama}\n\nRũndã: {bas} – {son}',
  enFaziletli: ' · sẽn yɩɩd sõma {saat} poorẽ',
  sonUcteBir: ' · tãab-n-yembr sẽn kõnsã {saat}',
  durumAktif: 'Wakatã ta · na n sa {saat}',
  durumNafile: 'Naafɩla · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duhaa wakato',
    kuslukSuruyor: 'Duhaa wakatã be; y tõe n pʋʋs n tãag {son}.',
    kuslukGirdi: 'Duhaa wakatã ta. Yaa wakat sõng n pʋʋs rakaa a yiibu; a kẽnda n tãag {son}.',
    kuslukBitiyor: cogul({
      one: '{n} minit n kell Duhaa wakatã sẽn na n sa. Yaa wakat sõng n pʋʋs rakaa a yiibu; a kẽnda n tãag {son}.',
      other: '{n} minit n kell Duhaa wakatã sẽn na n sa. Yaa wakat sõng n pʋʋs rakaa a yiibu; a kẽnda n tãag {son}.',
    }),
    evvabinBaslik: 'Awaabiin',
    evvabinSuruyor: 'Wakat nan be Awaabiin yĩnga. Sãanfo sɩngda {son}.',
    evvabinGirdi: 'Magrib poorẽ, yaa wakat sõng Awaabiin yĩnga. Sãanfo sɩngda {son}.',
    evvabinKalan: cogul({ one: '{n} minit n kell Awaabiin yĩnga. Sãanfo sɩngda {son}.', other: '{n} minit n kell Awaabiin yĩnga. Sãanfo sɩngda {son}.' }),
    teheccudBaslik: 'Tahajjud wakato',
    uyandirSonUcte: 'Yik-y; yʋngã tãab-n-yembr sẽn kõnsã sɩnga. Fagir sɩngda {son}.',
    uyandirKalan: cogul({ one: 'Yik-y; {n} minit n kell n tãag Fagir. Fagir sɩngda {son}.', other: 'Yik-y; {n} minit n kell n tãag Fagir. Fagir sɩngda {son}.' }),
    sonUcteBaslik: 'Yʋngã tãab-n-yembr sẽn kõnsã',
    sonUcteGovde: 'Tahajjud wakat sẽn yɩɩd barka. Fagir sɩngda {son}.',
    teheccudKalan: cogul({ one: '{n} minit n kell n tãag Fagir. Yaa wakat sõng Tahajjud yĩnga.', other: '{n} minit n kell n tãag Fagir. Yaa wakat sõng Tahajjud yĩnga.' }),
  },
  uyandirmaKanali: 'Tahajjud yikri',
  uyandirmaKanaliAciklama: 'A yikda-y yʋng pʋʋsg yĩnga; a wiida baa telefõnã sã n ka tar koɛɛg',
};
