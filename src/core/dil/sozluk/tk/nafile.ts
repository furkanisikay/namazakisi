import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Nafile namazlaryň atlary arap sözünden türkmen ýazuwyna geçirildi (çeşme bilen tassyklanmady): Duha, Ewwabin, Tehejjüd.
 * Wagt orun tutujysyna (`{son}`, `{saat}`) goşulma ýelmenmeýär: çekim sana görä üýtgeýär ("5:30-da", "5:20-de"),
 * şonuň üçin "sagat {son} bolanda", "{son} bolýança" kalyby.
 */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Ewwabin', teheccud: 'Tehejjüd' },
  kucuk: { kusluk: 'duha', evvabin: 'ewwabin', teheccud: 'tehejjüd' },
  aciklamalar: {
    kusluk:
      'Gün dogandan takmynan 45 minut soň başlaýar we öýle wagtynyň girmegine 10 minut galýança dowam edýär. Işrak onuň iň irki wagtydyr; iň fazyletlisi günüň ilkinji çärýeginden soňdur.',
    evvabin: 'Agşamdan soň, ýassy wagty girýänçä okalýar.',
    teheccud: 'Ýassydan soň ýatyp turandan soň, ertir wagty girýänçä okalýar. Iň fazyletli wagty gijäniň soňky üçden biridir.',
  },
  bilgiBugun: '{aciklama}\n\nŞu gün: {bas} – {son}',
  enFaziletli: ' · iň fazyletlisi {saat} bolandan soň',
  sonUcteBir: ' · soňky üçden bir {saat}',
  durumAktif: 'Wagt girdi · gutarýan wagty {saat}',
  durumNafile: 'Nafile · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duha wagty',
    kuslukSuruyor: 'Duha wagty dowam edýär; sagat {son} bolýança okap bilersiň.',
    kuslukGirdi: 'Duha wagty girdi. Iki rekagat üçin gowy pursat; sagat {son} bolýança dowam edýär.',
    kuslukBitiyor: cogul({
      one: 'Duha wagtynyň gutarmagyna {n} minut galdy. Iki rekagat üçin gowy pursat; sagat {son} bolýança dowam edýär.',
      other: 'Duha wagtynyň gutarmagyna {n} minut galdy. Iki rekagat üçin gowy pursat; sagat {son} bolýança dowam edýär.',
    }),
    evvabinBaslik: 'Ewwabin',
    evvabinSuruyor: 'Ewwabin üçin entek wagt bar. Ýassy sagat {son} bolanda girýär.',
    evvabinGirdi: 'Agşamdan soň Ewwabin üçin gowy pursat. Ýassy sagat {son} bolanda girýär.',
    evvabinKalan: cogul({
      one: 'Ewwabin üçin {n} minut galdy. Ýassy sagat {son} bolanda girýär.',
      other: 'Ewwabin üçin {n} minut galdy. Ýassy sagat {son} bolanda girýär.',
    }),
    teheccudBaslik: 'Tehejjüd wagty',
    uyandirSonUcte: 'Tur; gijäniň soňky üçden biri başlandy. Ertir namazy sagat {son} bolanda girýär.',
    uyandirKalan: cogul({
      one: 'Tur; ertir namazyna {n} minut galdy. Ertir namazy sagat {son} bolanda girýär.',
      other: 'Tur; ertir namazyna {n} minut galdy. Ertir namazy sagat {son} bolanda girýär.',
    }),
    sonUcteBaslik: 'Gijäniň soňky üçden biri',
    sonUcteGovde: 'Tehejjüd üçin iň bereketli sagatlar. Ertir namazy sagat {son} bolanda girýär.',
    teheccudKalan: cogul({
      one: 'Ertir namazyna {n} minut galdy. Tehejjüd üçin gowy wagt.',
      other: 'Ertir namazyna {n} minut galdy. Tehejjüd üçin gowy wagt.',
    }),
  },
  uyandirmaKanali: 'Tehejjüd oýarmasy',
  uyandirmaKanaliAciklama: 'Gijeki namaz üçin oýarýar; sessiz tertipde-de jyňňyrdaýar',
};
