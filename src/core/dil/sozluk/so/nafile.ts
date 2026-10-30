import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duxaa', evvabin: 'Awaabiin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duxaa', evvabin: 'Awaabiin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Wuxuu bilaabmaa qiyaastii 45 daqiiqo kadib qorrax soo baxa, wuxuuna socdaa ilaa 10 daqiiqo ka hor Duhur. Ishraaq waa waqtigiisa ugu horreeya; kan ugu fadliga badan waa marka rubuca hore ee maalintu dhaafo.',
    evvabin: 'Waxaa la tukadaa Maghrib kadib, ilaa waqtiga Cishe.',
    teheccud: 'Waxaa la tukadaa Cishe kadib marka la seexdo oo la tooso, ilaa waqtiga Subax. Waqtigiisa ugu fadliga badan waa saddex meelood meel ee ugu dambeysa habeenka.',
  },
  bilgiBugun: '{aciklama}\n\nMaanta: {bas} – {son}',
  enFaziletli: ' · ugu fadliga badan {saat} kadib',
  sonUcteBir: ' · saddexda dambe {saat}',
  durumAktif: 'Waqtigii waa galay · wuxuu dhammaanayaa {saat}',
  durumNafile: 'Sunno · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Waqtiga Duxaa',
    kuslukSuruyor: 'Waqtiga Duxaa wuu socdaa; waad tukan kartaa ilaa {son}.',
    kuslukGirdi: 'Waqtiga Duxaa waa galay. Waa xilli wanaagsan oo laba rakco ah; wuxuu socdaa ilaa {son}.',
    kuslukBitiyor: cogul({
      one: '{n} daqiiqo ayaa ka hartay waqtiga Duxaa. Waa xilli wanaagsan oo laba rakco ah; wuxuu socdaa ilaa {son}.',
      other: '{n} daqiiqo ayaa ka hartay waqtiga Duxaa. Waa xilli wanaagsan oo laba rakco ah; wuxuu socdaa ilaa {son}.',
    }),
    evvabinBaslik: 'Awaabiin',
    evvabinSuruyor: 'Weli waqti ayaa u haray Awaabiin. Cishe wuxuu galayaa {son}.',
    evvabinGirdi: 'Maghrib kadib, waa xilli wanaagsan oo Awaabiin ah. Cishe wuxuu galayaa {son}.',
    evvabinKalan: cogul({ one: '{n} daqiiqo ayaa u hartay Awaabiin. Cishe wuxuu galayaa {son}.', other: '{n} daqiiqo ayaa u hartay Awaabiin. Cishe wuxuu galayaa {son}.' }),
    teheccudBaslik: 'Waqtiga Tahajjud',
    uyandirSonUcte: 'Kac; saddex meelood meel ee ugu dambeysa habeenka waa bilaabatay. Subax wuxuu galayaa {son}.',
    uyandirKalan: cogul({ one: 'Kac; {n} daqiiqo ayaa u hartay Subax. Subax wuxuu galayaa {son}.', other: 'Kac; {n} daqiiqo ayaa u hartay Subax. Subax wuxuu galayaa {son}.' }),
    sonUcteBaslik: 'Saddexda dambe ee habeenka',
    sonUcteGovde: 'Saacadaha ugu barakada badan ee Tahajjud. Subax wuxuu galayaa {son}.',
    teheccudKalan: cogul({ one: '{n} daqiiqo ayaa u hartay Subax. Waa waqti wanaagsan oo Tahajjud ah.', other: '{n} daqiiqo ayaa u hartay Subax. Waa waqti wanaagsan oo Tahajjud ah.' }),
  },
  uyandirmaKanali: 'Toosinta Tahajjud',
  uyandirmaKanaliAciklama: 'Wuxuu kuu toosiyaa salaadda habeenka; wuu dhawaaqaa xitaa qaabka aamusnaanta',
};
