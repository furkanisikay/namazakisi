import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile adı QE 17:79 "Naafila", teheccüd "Tahajud"; Duha ve Awwabin Latin Arapça yazım (türetildi). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajud' },
  aciklamalar: {
    kusluk:
      'Ɛhyɛ ase bɛyɛ sima 45 wɔ awia apue akyi, na ɛkɔ kosi sima 10 ansa na Dhuhr adu. Ishraq ne ne berɛ a edi kan; ne berɛ pa ara ne sɛ ɛda no nkyɛmu nan mu baako atwam.',
    evvabin: 'Wɔyɛ no Maghrib akyi, kosi Isha berɛ.',
    teheccud: 'Wɔyɛ no sɛ woda Isha akyi na wosɔre a, kosi Fajr berɛ. Ne berɛ pa ara ne anadwo nkyɛmu mmiɛnsa mu baako a ɛtwa toɔ.',
  },
  bilgiBugun: '{aciklama}\n\nƐnnɛ: {bas} – {son}',
  enFaziletli: ' · ne berɛ pa ara {saat} akyi',
  sonUcteBir: ' · nkyɛmu a ɛtwa toɔ {saat}',
  durumAktif: 'Berɛ adu · ɛba awieɛ {saat}',
  durumNafile: 'Naafila · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duha berɛ',
    kuslukSuruyor: 'Duha berɛ da so wɔ hɔ; wobɛtumi ayɛ kosi {son}.',
    kuslukGirdi: 'Duha berɛ adu. Ɛyɛ berɛ pa ma raka mmienu; ɛkɔ kosi {son}.',
    kuslukBitiyor: cogul({
      one: 'Sima {n} na aka ma Duha berɛ. Ɛyɛ berɛ pa ma raka mmienu; ɛkɔ kosi {son}.',
      other: 'Sima {n} na aka ma Duha berɛ. Ɛyɛ berɛ pa ma raka mmienu; ɛkɔ kosi {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Berɛ da so wɔ hɔ ma Awwabin. Isha hyɛ ase {son}.',
    evvabinGirdi: 'Maghrib akyi yɛ berɛ pa ma Awwabin. Isha hyɛ ase {son}.',
    evvabinKalan: cogul({ one: 'Sima {n} na aka ma Awwabin. Isha hyɛ ase {son}.', other: 'Sima {n} na aka ma Awwabin. Isha hyɛ ase {son}.' }),
    teheccudBaslik: 'Tahajud berɛ',
    uyandirSonUcte: 'Sɔre; anadwo nkyɛmu a ɛtwa toɔ no adu. Fajr hyɛ ase {son}.',
    uyandirKalan: cogul({ one: 'Sɔre; sima {n} na aka ma Fajr. Fajr hyɛ ase {son}.', other: 'Sɔre; sima {n} na aka ma Fajr. Fajr hyɛ ase {son}.' }),
    sonUcteBaslik: 'Anadwo nkyɛmu a ɛtwa toɔ',
    sonUcteGovde: 'Ɛyɛ nnɔnhwere a nhyira wɔ mu sen biara ma Tahajud. Fajr hyɛ ase {son}.',
    teheccudKalan: cogul({ one: 'Sima {n} na aka ma Fajr. Ɛyɛ berɛ pa ma Tahajud.', other: 'Sima {n} na aka ma Fajr. Ɛyɛ berɛ pa ma Tahajud.' }),
  },
  uyandirmaKanali: 'Tahajud nyanee',
  uyandirmaKanaliAciklama: 'Ɛnyane wo ma anadwo Nyamefrɛ; ɛbɔ ɛmpo sɛ fon no yɛ komm a',
};
