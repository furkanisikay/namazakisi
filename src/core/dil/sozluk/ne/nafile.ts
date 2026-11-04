import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile: चाश्त (HE ne; इशराक ilk vakti) · अव्वाबीन (doğrulanmadı) · तहज्जुद (QE 17:79). Çağrı "तपाईं" + ‑नुहोस् ("उठ्नुहोस्"). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'चाश्त', evvabin: 'अव्वाबीन', teheccud: 'तहज्जुद' },
  kucuk: { kusluk: 'चाश्त', evvabin: 'अव्वाबीन', teheccud: 'तहज्जुद' },
  aciklamalar: {
    kusluk:
      'सूर्योदयको करिब 45 मिनेटपछि सुरु हुन्छ र जुहरभन्दा 10 मिनेटअघिसम्म रहन्छ। इशराक यसको पहिलो समय हो; सबैभन्दा उत्तम समय दिनको पहिलो चौथाइ बितेपछि हो।',
    evvabin: 'मगरिबपछि इशाको समयसम्म पढिन्छ।',
    teheccud: 'इशापछि सुतेर उठेपछि फज्रको समयसम्म पढिन्छ। यसको सबैभन्दा उत्तम समय रातको अन्तिम तिहाइ हो।',
  },
  bilgiBugun: '{aciklama}\n\nआज: {bas} – {son}',
  enFaziletli: ' · सबैभन्दा उत्तम {saat} पछि',
  sonUcteBir: ' · अन्तिम तिहाइ {saat}',
  durumAktif: 'समय भयो · {saat} मा सकिन्छ',
  durumNafile: 'नफिल · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'चाश्तको समय',
    kuslukSuruyor: 'चाश्तको समय चलिरहेको छ; {son} सम्म पढ्न सकिन्छ।',
    kuslukGirdi: 'चाश्तको समय भयो। दुई रकातका लागि राम्रो अवसर; समय {son} सम्म छ।',
    kuslukBitiyor: cogul({
      one: 'चाश्तको समय सकिन {n} मिनेट बाँकी छ। दुई रकातका लागि राम्रो अवसर; समय {son} सम्म छ।',
      other: 'चाश्तको समय सकिन {n} मिनेट बाँकी छ। दुई रकातका लागि राम्रो अवसर; समय {son} सम्म छ।',
    }),
    evvabinBaslik: 'अव्वाबीन',
    evvabinSuruyor: 'अव्वाबीनका लागि अझै समय छ। इशाको समय {son} मा।',
    evvabinGirdi: 'मगरिबपछि अव्वाबीनका लागि राम्रो अवसर। इशाको समय {son} मा।',
    evvabinKalan: cogul({
      one: 'अव्वाबीनका लागि {n} मिनेट बाँकी छ। इशाको समय {son} मा।',
      other: 'अव्वाबीनका लागि {n} मिनेट बाँकी छ। इशाको समय {son} मा।',
    }),
    teheccudBaslik: 'तहज्जुदको समय',
    uyandirSonUcte: 'उठ्नुहोस्; रातको अन्तिम तिहाइ सुरु भयो। फज्रको समय {son} मा।',
    uyandirKalan: cogul({
      one: 'उठ्नुहोस्; फज्रमा {n} मिनेट बाँकी छ। फज्रको समय {son} मा।',
      other: 'उठ्नुहोस्; फज्रमा {n} मिनेट बाँकी छ। फज्रको समय {son} मा।',
    }),
    sonUcteBaslik: 'रातको अन्तिम तिहाइ',
    sonUcteGovde: 'तहज्जुदका लागि सबैभन्दा उत्तम घडी। फज्रको समय {son} मा।',
    teheccudKalan: cogul({
      one: 'फज्रमा {n} मिनेट बाँकी छ। तहज्जुदका लागि राम्रो समय।',
      other: 'फज्रमा {n} मिनेट बाँकी छ। तहज्जुदका लागि राम्रो समय।',
    }),
  },
  uyandirmaKanali: 'तहज्जुदका लागि ब्युँझाउने',
  uyandirmaKanaliAciklama: 'रातको नमाजका लागि ब्युँझाउँछ; साइलेन्ट मोडमा पनि बज्छ',
};
