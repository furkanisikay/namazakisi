import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile karşılığı "salaata dabalataa": QuranEnc `oromo_ababor` 17:79'daki ifade (yalnız sözcük kaynağı). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duhaa', evvabin: 'Awwaabiin', teheccud: 'Tahajjudii' },
  kucuk: { kusluk: 'Duhaa', evvabin: 'Awwaabiin', teheccud: 'Tahajjudii' },
  aciklamalar: {
    kusluk:
      'Baha aduu booda daqiiqaa 45 tti jalqabee hanga Zuhrii dura daqiiqaa 10 itti fufa. Ishraaqni yeroo isaa isa jalqabaati; inni caalu erga kurmaanni guyyaa jalqabaa darbee booda.',
    evvabin: "Maghriba booda, hanga yeroo Ishaa'iitti salaatama.",
    teheccud: "Ishaa'ii booda erga rafanii dammaqanii, hanga yeroo Subhiitti salaatama. Yeroon isaa inni caalu harka sadii keessaa isa dhumaa halkanii ti.",
  },
  bilgiBugun: "{aciklama}\n\nHar'a: {bas} – {son}",
  enFaziletli: ' · {saat} booda caala',
  sonUcteBir: ' · harka sadaffaa dhumaa {saat}',
  durumAktif: 'Yeroon gaheera · {saat}tti xumurama',
  durumNafile: 'Dabalataa · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Yeroo Duhaa',
    kuslukSuruyor: 'Yeroon Duhaa itti fufaa jira; hanga {son}tti salaatuu ni dandeessu.',
    kuslukGirdi: "Yeroon Duhaa gaheera. Raka'aa lamaaf yeroo gaarii dha; hanga {son}tti tura.",
    kuslukBitiyor: cogul({
      one: "Yeroo Duhaa keessaa daqiiqaan {n} hafeera. Raka'aa lamaaf yeroo gaarii dha; hanga {son}tti tura.",
      other: "Yeroo Duhaa keessaa daqiiqaan {n} hafeera. Raka'aa lamaaf yeroo gaarii dha; hanga {son}tti tura.",
    }),
    evvabinBaslik: 'Awwaabiin',
    evvabinSuruyor: "Awwaabiiniif ammallee yeroon jira. Ishaa'iin {son}tti jalqaba.",
    evvabinGirdi: "Maghriba booda, Awwaabiiniif yeroo gaarii dha. Ishaa'iin {son}tti jalqaba.",
    evvabinKalan: cogul({ one: "Awwaabiiniif daqiiqaan {n} hafeera. Ishaa'iin {son}tti jalqaba.", other: "Awwaabiiniif daqiiqaan {n} hafeera. Ishaa'iin {son}tti jalqaba." }),
    teheccudBaslik: 'Yeroo Tahajjudii',
    uyandirSonUcte: "Ka'i; harki sadaffaan dhumaa halkanii jalqabeera. Subhiin {son}tti jalqaba.",
    uyandirKalan: cogul({ one: "Ka'i; hanga Subhiitti daqiiqaan {n} hafeera. Subhiin {son}tti jalqaba.", other: "Ka'i; hanga Subhiitti daqiiqaan {n} hafeera. Subhiin {son}tti jalqaba." }),
    sonUcteBaslik: 'Harka sadaffaa dhumaa halkanii',
    sonUcteGovde: "Sa'aatii Tahajjudiif baay'ee eebbifaman. Subhiin {son}tti jalqaba.",
    teheccudKalan: cogul({ one: 'Hanga Subhiitti daqiiqaan {n} hafeera. Tahajjudiif yeroo gaarii dha.', other: 'Hanga Subhiitti daqiiqaan {n} hafeera. Tahajjudiif yeroo gaarii dha.' }),
  },
  uyandirmaKanali: 'Dammaqsa Tahajjudii',
  uyandirmaKanaliAciklama: 'Salaata halkaniif isin dammaqsa; haala callisaa keessattis ni bilbila',
};
