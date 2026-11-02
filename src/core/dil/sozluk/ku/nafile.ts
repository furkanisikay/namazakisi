import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Ewwabîn', teheccud: 'Teheccud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Ewwabîn', teheccud: 'Teheccud' },
  aciklamalar: {
    kusluk:
      'Nêzîkî 45 deqîqe piştî hilatina rojê dest pê dike û heta 10 deqîqe berî Nîvro dimîne. Îşraq dema wê ya herî zû ye; ya herî bi fezîlet piştî derbasbûna çaryeka yekem a rojê ye.',
    evvabin: 'Piştî Êvarê, heta dema Eşayê tê kirin.',
    teheccud: 'Piştî Eşayê, piştî xew û şiyarbûnê, heta dema Sibê tê kirin. Dema wê ya herî bi fezîlet sêyeka dawî ya şevê ye.',
  },
  bilgiBugun: '{aciklama}\n\nÎro: {bas} – {son}',
  enFaziletli: ' · ya herî bi fezîlet piştî {saat}',
  sonUcteBir: ' · sêyeka dawî {saat}',
  durumAktif: 'Dem dest pê kir · diqede {saat}',
  durumNafile: 'Nafile · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Dema Duha',
    kuslukSuruyor: 'Dema Duha didome; hûn dikarin heta {son} bikin.',
    kuslukGirdi: 'Dema Duha dest pê kir. Ji bo du riketan demeke baş e; heta {son} didome.',
    kuslukBitiyor: cogul({
      one: 'Ji dema Duha {n} deqîqe ma. Ji bo du riketan demeke baş e; heta {son} didome.',
      other: 'Ji dema Duha {n} deqîqe man. Ji bo du riketan demeke baş e; heta {son} didome.',
    }),
    evvabinBaslik: 'Ewwabîn',
    evvabinSuruyor: 'Ji bo Ewwabînê hîn dem heye. Eşa di {son} de dest pê dike.',
    evvabinGirdi: 'Piştî Êvarê, ji bo Ewwabînê demeke baş e. Eşa di {son} de dest pê dike.',
    evvabinKalan: cogul({
      one: 'Ji bo Ewwabînê {n} deqîqe ma. Eşa di {son} de dest pê dike.',
      other: 'Ji bo Ewwabînê {n} deqîqe man. Eşa di {son} de dest pê dike.',
    }),
    teheccudBaslik: 'Dema Teheccudê',
    uyandirSonUcte: 'Rabe; sêyeka dawî ya şevê dest pê kir. Sibe di {son} de dest pê dike.',
    uyandirKalan: cogul({
      one: 'Rabe; heta Sibê {n} deqîqe ma. Sibe di {son} de dest pê dike.',
      other: 'Rabe; heta Sibê {n} deqîqe man. Sibe di {son} de dest pê dike.',
    }),
    sonUcteBaslik: 'Sêyeka dawî ya şevê',
    sonUcteGovde: 'Ji bo Teheccudê demên herî bi bereket. Sibe di {son} de dest pê dike.',
    teheccudKalan: cogul({
      one: 'Heta Sibê {n} deqîqe ma. Ji bo Teheccudê demeke baş e.',
      other: 'Heta Sibê {n} deqîqe man. Ji bo Teheccudê demeke baş e.',
    }),
  },
  uyandirmaKanali: 'Şiyarkirina Teheccudê',
  uyandirmaKanaliAciklama: 'Ji bo nimêja şevê we şiyar dike; di moda bêdeng de jî lê dide',
};
