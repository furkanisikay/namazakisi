import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Evvabin', teheccud: 'Tehedžud' },
  kucuk: { kusluk: 'duha', evvabin: 'evvabin', teheccud: 'tehedžud' },
  aciklamalar: {
    kusluk:
      'Počinje otprilike 45 minuta nakon izlaska sunca i traje do 10 minuta prije podne-namaza. Išrak je njegovo najranije vrijeme; najvrednije je nakon što prođe prva četvrtina dana.',
    evvabin: 'Klanja se nakon akšam-namaza, do nastupa jacije.',
    teheccud: 'Klanja se nakon jacije, kada se zaspi pa ustane, sve do zore. Najvrednije vrijeme je posljednja trećina noći.',
  },
  bilgiBugun: '{aciklama}\n\nDanas: {bas} – {son}',
  enFaziletli: ' · najvrednije nakon {saat}',
  sonUcteBir: ' · posljednja trećina {saat}',
  durumAktif: 'Vrijeme je nastupilo · do {saat}',
  durumNafile: 'Nafila · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Vrijeme duhe',
    kuslukSuruyor: 'Vrijeme duhe traje; možete klanjati do {son}.',
    kuslukGirdi: 'Nastupilo je vrijeme duhe. Lijep trenutak za dva rekata; traje do {son}.',
    kuslukBitiyor: cogul({
      one: 'Do kraja vremena duhe ostala je {n} minuta. Lijep trenutak za dva rekata; traje do {son}.',
      few: 'Do kraja vremena duhe ostale su {n} minute. Lijep trenutak za dva rekata; traje do {son}.',
      other: 'Do kraja vremena duhe ostalo je {n} minuta. Lijep trenutak za dva rekata; traje do {son}.',
    }),
    evvabinBaslik: 'Evvabin',
    evvabinSuruyor: 'Još ima vremena za evvabin. Jacija nastupa u {son}.',
    evvabinGirdi: 'Nakon akšam-namaza, lijep trenutak za evvabin. Jacija nastupa u {son}.',
    evvabinKalan: cogul({
      one: 'Za evvabin je ostala {n} minuta. Jacija nastupa u {son}.',
      few: 'Za evvabin su ostale {n} minute. Jacija nastupa u {son}.',
      other: 'Za evvabin je ostalo {n} minuta. Jacija nastupa u {son}.',
    }),
    teheccudBaslik: 'Vrijeme tehedžuda',
    uyandirSonUcte: 'Ustanite; nastupila je posljednja trećina noći. Zora nastupa u {son}.',
    uyandirKalan: cogul({
      one: 'Ustanite; do zore je ostala {n} minuta. Zora nastupa u {son}.',
      few: 'Ustanite; do zore su ostale {n} minute. Zora nastupa u {son}.',
      other: 'Ustanite; do zore je ostalo {n} minuta. Zora nastupa u {son}.',
    }),
    sonUcteBaslik: 'Posljednja trećina noći',
    sonUcteGovde: 'Najberićetniji sati za tehedžud. Zora nastupa u {son}.',
    teheccudKalan: cogul({
      one: 'Do zore je ostala {n} minuta. Lijepo vrijeme za tehedžud.',
      few: 'Do zore su ostale {n} minute. Lijepo vrijeme za tehedžud.',
      other: 'Do zore je ostalo {n} minuta. Lijepo vrijeme za tehedžud.',
    }),
  },
  uyandirmaKanali: 'Buđenje za tehedžud',
  uyandirmaKanaliAciklama: 'Budi Vas za noćni namaz; zvoni i u nečujnom načinu',
};
