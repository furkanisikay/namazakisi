import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Teheccüd QE 17:79 "Tahadjoud"; Duha ve Awwabin Arapça özel ad (kaynakta Malgaşça karşılık yok). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahadjoud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahadjoud' },
  aciklamalar: {
    kusluk:
      "Manomboka eo amin'ny 45 minitra eo ho eo aorian'ny fiposahan'ny masoandro ary maharitra hatramin'ny 10 minitra alohan'ny Zohr. Ny Ishraq no fotoana voalohany indrindra; ny tsara indrindra dia rehefa lasa ny ampahefatry ny andro voalohany.",
    evvabin: "Atao aorian'ny Maghrib, hatramin'ny fotoanan'ny Isha.",
    teheccud: "Atao rehefa avy natory ary nifoha taorian'ny Isha, hatramin'ny fotoanan'ny Fajr. Ny ampahatelony farany amin'ny alina no fotoana tsara indrindra.",
  },
  bilgiBugun: '{aciklama}\n\nAndroany: {bas} – {son}',
  enFaziletli: " · tsara indrindra aorian'ny {saat}",
  sonUcteBir: ' · ampahatelony farany {saat}',
  durumAktif: 'Tonga ny fotoana · mifarana {saat}',
  durumNafile: 'Fanampiny · {bas}–{son}',
  bildirim: {
    kuslukBaslik: "Fotoanan'ny Duha",
    kuslukSuruyor: "Mitohy ny fotoanan'ny Duha; afaka mivavaka hatramin'ny {son} ianao.",
    kuslukGirdi: "Tonga ny fotoanan'ny Duha. Fotoana tsara ho an'ny rakat roa; maharitra hatramin'ny {son}.",
    kuslukBitiyor: cogul({
      one: "{n} minitra sisa amin'ny fotoanan'ny Duha. Fotoana tsara ho an'ny rakat roa; maharitra hatramin'ny {son}.",
      other: "{n} minitra sisa amin'ny fotoanan'ny Duha. Fotoana tsara ho an'ny rakat roa; maharitra hatramin'ny {son}.",
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: "Mbola misy fotoana ho an'ny Awwabin. Manomboka amin'ny {son} ny Isha.",
    evvabinGirdi: "Aorian'ny Maghrib, fotoana tsara ho an'ny Awwabin. Manomboka amin'ny {son} ny Isha.",
    evvabinKalan: cogul({
      one: "{n} minitra sisa ho an'ny Awwabin. Manomboka amin'ny {son} ny Isha.",
      other: "{n} minitra sisa ho an'ny Awwabin. Manomboka amin'ny {son} ny Isha.",
    }),
    teheccudBaslik: "Fotoanan'ny Tahadjoud",
    uyandirSonUcte: "Mifohaza; tonga ny ampahatelony farany amin'ny alina. Manomboka amin'ny {son} ny Fajr.",
    uyandirKalan: cogul({
      one: "Mifohaza; {n} minitra sisa mankany amin'ny Fajr. Manomboka amin'ny {son} ny Fajr.",
      other: "Mifohaza; {n} minitra sisa mankany amin'ny Fajr. Manomboka amin'ny {son} ny Fajr.",
    }),
    sonUcteBaslik: "Ny ampahatelony farany amin'ny alina",
    sonUcteGovde: "Ny ora feno fitahiana indrindra ho an'ny Tahadjoud. Manomboka amin'ny {son} ny Fajr.",
    teheccudKalan: cogul({
      one: "{n} minitra sisa mankany amin'ny Fajr. Fotoana tsara ho an'ny Tahadjoud.",
      other: "{n} minitra sisa mankany amin'ny Fajr. Fotoana tsara ho an'ny Tahadjoud.",
    }),
  },
  uyandirmaKanali: "Fanairana ho an'ny Tahadjoud",
  uyandirmaKanaliAciklama: "Mamoha anao ho amin'ny soalat amin'ny alina; maneno na dia amin'ny fomba mangina aza",
};
