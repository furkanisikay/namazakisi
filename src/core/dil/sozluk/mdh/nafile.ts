import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile "sunnat" (QE 17:79 "ka sunnat sa leka"), teheccüd "Tahajjud" (17:79); Duha ve Awwabin Arapça ad. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Pedpamula sa 45 minutu sa ulyan nu kasebang nu senang taman sa 10 minutu sa unaan nu Dhuhur. Su Ishraq i paganay a waktu nin; su pinakamapya na sa ulyan nu kalipus nu paganay a kwartu nu gay.',
    evvabin: 'Pedsambayangan sa ulyan nu Maghrib, taman sa waktu nu Isha.',
    teheccud: 'Pedsambayangan sa ulyan nu katulug endu kabangun sa ulyan nu Isha, taman sa waktu nu Subuh. Su pinakamapya a waktu nin na su ulyanan a ikatelu nu magabi.',
  },
  bilgiBugun: '{aciklama}\n\nSaguna a gay: {bas} – {son}',
  enFaziletli: ' · pinakamapya sa ulyan nu {saat}',
  sonUcteBir: ' · ulyanan a ikatelu {saat}',
  durumAktif: 'Nakawma su waktu · malipus sa {saat}',
  durumNafile: 'Sunnat · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Waktu nu Duha',
    kuslukSuruyor: 'Waktu pan nu Duha; makasambayang kanu taman sa {son}.',
    kuslukGirdi: 'Nakawma su waktu nu Duha. Mapya a waktu para sa dua a rakaat; taman sa {son}.',
    kuslukBitiyor: cogul({
      one: '{n} minutu pan i nasama sa waktu nu Duha. Mapya a waktu para sa dua a rakaat; taman sa {son}.',
      other: '{n} minutu pan i nasama sa waktu nu Duha. Mapya a waktu para sa dua a rakaat; taman sa {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Aden pan timpu para sa Awwabin. Makawma su Isha sa {son}.',
    evvabinGirdi: 'Sa ulyan nu Maghrib, mapya a waktu para sa Awwabin. Makawma su Isha sa {son}.',
    evvabinKalan: cogul({
      one: '{n} minutu pan i nasama para sa Awwabin. Makawma su Isha sa {son}.',
      other: '{n} minutu pan i nasama para sa Awwabin. Makawma su Isha sa {son}.',
    }),
    teheccudBaslik: 'Waktu nu Tahajjud',
    uyandirSonUcte: 'Bangun kanu; nakawma su ulyanan a ikatelu nu magabi. Makawma su Subuh sa {son}.',
    uyandirKalan: cogul({
      one: 'Bangun kanu; {n} minutu pan taman sa Subuh. Makawma su Subuh sa {son}.',
      other: 'Bangun kanu; {n} minutu pan taman sa Subuh. Makawma su Subuh sa {son}.',
    }),
    sonUcteBaslik: 'Su ulyanan a ikatelu nu magabi',
    sonUcteGovde: 'Su pinakamabarakat a manga oras para sa Tahajjud. Makawma su Subuh sa {son}.',
    teheccudKalan: cogul({
      one: '{n} minutu pan taman sa Subuh. Mapya a waktu para sa Tahajjud.',
      other: '{n} minutu pan taman sa Subuh. Mapya a waktu para sa Tahajjud.',
    }),
  },
  uyandirmaKanali: 'Kapabangun sa Tahajjud',
  uyandirmaKanaliAciklama: 'Pabangunen kanu para sa sambayang sa magabi; pedtunog apiya naka-silent',
};
