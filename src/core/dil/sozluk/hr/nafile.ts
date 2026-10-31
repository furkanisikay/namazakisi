import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafila = "nafila"; duha, evvabin, tehedžud bošnjačka zajednica yazımıyla (Hırvatça kaynakta DOĞRULANMADI). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Evvabin', teheccud: 'Tehedžud' },
  kucuk: { kusluk: 'duha', evvabin: 'evvabin', teheccud: 'tehedžud' },
  aciklamalar: {
    kusluk:
      'Počinje otprilike 45 minuta nakon izlaska Sunca i traje do 10 minuta prije podne-namaza. Išrak je njegovo najranije vrijeme; najvrjednije je nakon što prođe prva četvrtina dana.',
    evvabin: 'Klanja se nakon akšama, do nastupa jacije.',
    teheccud: 'Klanja se nakon jacije, kad se zaspi pa probudi, sve do sabaha. Najvrjednije je vrijeme posljednja trećina noći.',
  },
  bilgiBugun: '{aciklama}\n\nDanas: {bas} – {son}',
  enFaziletli: ' · najvrjednije nakon {saat}',
  sonUcteBir: ' · posljednja trećina {saat}',
  durumAktif: 'Vrijeme je nastupilo · do {saat}',
  durumNafile: 'Nafila · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Vrijeme duhe',
    kuslukSuruyor: 'Vrijeme duhe traje; možete klanjati do {son}.',
    kuslukGirdi: 'Nastupilo je vrijeme duhe. Lijep trenutak za dva rekata; traje do {son}.',
    kuslukBitiyor: cogul({
      one: 'Do kraja vremena duhe preostala je {n} minuta. Lijep trenutak za dva rekata; traje do {son}.',
      few: 'Do kraja vremena duhe preostale su {n} minute. Lijep trenutak za dva rekata; traje do {son}.',
      other: 'Do kraja vremena duhe preostalo je {n} minuta. Lijep trenutak za dva rekata; traje do {son}.',
    }),
    evvabinBaslik: 'Evvabin',
    evvabinSuruyor: 'Još ima vremena za evvabin. Jacija nastupa u {son}.',
    evvabinGirdi: 'Nakon akšama, lijep trenutak za evvabin. Jacija nastupa u {son}.',
    evvabinKalan: cogul({
      one: 'Za evvabin je preostala {n} minuta. Jacija nastupa u {son}.',
      few: 'Za evvabin su preostale {n} minute. Jacija nastupa u {son}.',
      other: 'Za evvabin je preostalo {n} minuta. Jacija nastupa u {son}.',
    }),
    teheccudBaslik: 'Vrijeme tehedžuda',
    uyandirSonUcte: 'Ustanite; nastupila je posljednja trećina noći. Sabah nastupa u {son}.',
    uyandirKalan: cogul({
      one: 'Ustanite; do sabaha je preostala {n} minuta. Sabah nastupa u {son}.',
      few: 'Ustanite; do sabaha su preostale {n} minute. Sabah nastupa u {son}.',
      other: 'Ustanite; do sabaha je preostalo {n} minuta. Sabah nastupa u {son}.',
    }),
    sonUcteBaslik: 'Posljednja trećina noći',
    sonUcteGovde: 'Najblagoslovljeniji sati za tehedžud. Sabah nastupa u {son}.',
    teheccudKalan: cogul({
      one: 'Do sabaha je preostala {n} minuta. Dobro vrijeme za tehedžud.',
      few: 'Do sabaha su preostale {n} minute. Dobro vrijeme za tehedžud.',
      other: 'Do sabaha je preostalo {n} minuta. Dobro vrijeme za tehedžud.',
    }),
  },
  uyandirmaKanali: 'Buđenje za tehedžud',
  uyandirmaKanaliAciklama: 'Budi vas za noćni namaz; oglašava se i u nečujnom načinu',
};
