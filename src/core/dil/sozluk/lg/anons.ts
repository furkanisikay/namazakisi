import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: yalın tekil emir, kısa; secde karşılığı yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'zisigadde', girisindenItibaren: 'ziyise' },
  cip: { vakit: 'Erinnya ly’esswala', sure: 'Eddakiika', yon: 'zisigadde / ziyise', cuma: 'Ejjuma', yatsi: 'Ishai' },
  sablon: {
    muhafizCikis: [
      'Ekiseera kya {vakit} kiggwaako, esigadde eddakiika {süre}.',
      'Tosubwa {vakit}, esigadde eddakiika {süre}.',
      'Ekiseera kiyita, esigadde eddakiika {süre} {vakit} eggwaako.',
    ],
    muhafizGiris: [
      'Ekiseera kya {vakit} kituuse, ziyise eddakiika {süre}.',
      'Tolwisa {vakit}, ziyise eddakiika {süre}.',
      'Ekiseera kigenda, yimirira osaale {vakit}, ziyise eddakiika {süre}.',
    ],
    nafile: [
      'Ekiseera kya {vakit}, eddakiika {süre} {yön}. Kiseera kirungi eky’okusaala raaka bbiri.',
      'Ekiseera kya {vakit} kikyagenda. Mukisa mulungi okusaala raaka bbiri.',
      'Eddakiika {süre} {yön} eza {vakit}.',
    ],
    cuma: [
      'Esigadde eddakiika {süre} Ejjuma etuuke. Weetegeke ogende ku muzikiti.',
      'Ejjuma esembera, esigadde eddakiika {süre}.',
      'Tuuka ku khutuba, esigadde eddakiika {süre} Ejjuma etuuke.',
    ],
    camiyeGit: [
      'Esigadde eddakiika {süre} {vakit} etuuke. Genda ku muzikiti.',
      'Kye kiseera okugenda ku muzikiti, eddakiika {süre} {vakit} etuuke.',
      'Genda ku muzikiti olwa {vakit}.',
    ],
    yatis: ['Saala Ishai nga tonnagenda kwebaka.', 'Ekiseera kya Ishai kikyagenda, yimirira osaale nga tonnebaka.', 'Toyebaka nga tonnasaala Ishai.'],
    takvim: [
      'Omukolo mu kalenda yo gugwa mu kiseera kya {vakit}.',
      'Ekiseera kya {vakit} kitomeragana n’omukolo; tewerabira kusooka kusaala.',
      'Mu ddakiika {süre} ekiseera kya {vakit} kitomeragana n’omukolo gwo; tewerabira sswala yo.',
    ],
  },
  otomatik: {
    cuma: 'Esigadde {sure} Dhuhur etuuke olw’Ejjuma. Weetegeke ogende ku muzikiti.',
    camiyeGiris: 'Esigadde {sure} {vakit} etuuke.',
    camiyeHazirlan: 'Weetegeke ogende ku muzikiti.',
    camiyeYola: 'Genda ku muzikiti.',
    takvimGiris: 'Omukolo mu kalenda yo gugwa mu kiseera kya {vakit}.',
    takvimOnce: 'Tewerabira kusaala ng’omukolo tegunnatandika.',
    takvimKaplar: 'Tewerabira kuwummulamu osaale.',
    yatsi: 'Saala Ishai nga tonnagenda kwebaka.',
    muhasebeTek: '{vakit} erabika nga teteereddwako kabonero leero.',
    muhasebeCoklu: cogul({ one: 'Esswala {n} erabika nga teteereddwako kabonero leero.', other: 'Esswala {n} zirabika nga teziteereddwako kabonero leero.' }),
    geceCapasi: 'Essaawa ez’akasirise zitandika mu ddakiika {süre}. Saala {vakit} nga tonnagenda kwebaka.',
    kuslukSuruyor: 'Ekiseera kya Dhuha kikyagenda.',
    kuslukGirdi: 'Ekiseera kya Dhuha kituuse. Kiseera kirungi eky’okusaala raaka bbiri.',
    kuslukBitiyor: cogul({ one: 'Ekiseera kya Dhuha kisigazza eddakiika {n}.', other: 'Ekiseera kya Dhuha kisigazza eddakiika {n}.' }),
    evvabinSuruyor: 'Wakyaliwo ekiseera kya Awwabin.',
    evvabinGirdi: 'Ekiseera kya Awwabin. Kiseera kirungi eky’okusaala raaka bbiri.',
    evvabinKalan: cogul({ one: 'Awwabin esigazza eddakiika {n}.', other: 'Awwabin esigazza eddakiika {n}.' }),
    teheccudSonUcte: 'Ekiseera kya Tahajjud. Ekitundu ekisembayo eky’ekiro kitandise.',
    teheccudKalan: cogul({ one: 'Ekiseera kya Tahajjud. Esigaddeyo eddakiika {n} Subuhi etuuke.', other: 'Ekiseera kya Tahajjud. Esigaddeyo eddakiika {n} Subuhi etuuke.' }),
  },
};
