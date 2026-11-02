import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kuşluk = ચાશ્ત (HadeethEnc gu "ચાશ્તની નમાઝ"); evvâbîn અવ્વાબીન ve işrak ઇશરાક DOĞRULANMADI. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'ચાશ્ત', evvabin: 'અવ્વાબીન', teheccud: 'તહજ્જુદ' },
  kucuk: { kusluk: 'ચાશ્ત', evvabin: 'અવ્વાબીન', teheccud: 'તહજ્જુદ' },
  aciklamalar: {
    kusluk:
      'સૂર્યોદયના આશરે 45 મિનિટ પછી શરૂ થાય છે અને ઝોહરના 10 મિનિટ પહેલાં સુધી રહે છે. ઇશરાક તેનો સૌથી વહેલો સમય છે; દિવસનો પહેલો ચોથો ભાગ વીત્યા પછીનો સમય સૌથી અફઝલ છે.',
    evvabin: 'મગરિબ પછી, ઈશાનો સમય થાય ત્યાં સુધી પઢાય છે.',
    teheccud: 'ઈશા પછી સૂઈને જાગ્યા બાદ, ફજરનો સમય થાય ત્યાં સુધી પઢાય છે. તેનો સૌથી અફઝલ સમય રાતનો છેલ્લો ત્રીજો ભાગ છે.',
  },
  bilgiBugun: '{aciklama}\n\nઆજે: {bas} – {son}',
  enFaziletli: ' · {saat} પછી સૌથી અફઝલ',
  sonUcteBir: ' · છેલ્લો ત્રીજો ભાગ {saat}',
  durumAktif: 'સમય શરૂ થયો · {saat} વાગ્યે પૂરો',
  durumNafile: 'નફિલ · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'ચાશ્તનો સમય',
    kuslukSuruyor: 'ચાશ્તનો સમય ચાલુ છે; {son} સુધી પઢી શકો છો.',
    kuslukGirdi: 'ચાશ્તનો સમય શરૂ થયો. બે રકઅત માટે સારો સમય છે; {son} સુધી રહેશે.',
    kuslukBitiyor: cogul({
      one: 'ચાશ્તના સમયમાં {n} મિનિટ બાકી છે. બે રકઅત માટે સારો સમય છે; {son} સુધી રહેશે.',
      other: 'ચાશ્તના સમયમાં {n} મિનિટ બાકી છે. બે રકઅત માટે સારો સમય છે; {son} સુધી રહેશે.',
    }),
    evvabinBaslik: 'અવ્વાબીન',
    evvabinSuruyor: 'અવ્વાબીન માટે હજુ સમય છે. ઈશા {son} વાગ્યે શરૂ થશે.',
    evvabinGirdi: 'મગરિબ પછી અવ્વાબીન માટે સારો સમય છે. ઈશા {son} વાગ્યે શરૂ થશે.',
    evvabinKalan: cogul({ one: 'અવ્વાબીન માટે {n} મિનિટ બાકી છે. ઈશા {son} વાગ્યે શરૂ થશે.', other: 'અવ્વાબીન માટે {n} મિનિટ બાકી છે. ઈશા {son} વાગ્યે શરૂ થશે.' }),
    teheccudBaslik: 'તહજ્જુદનો સમય',
    uyandirSonUcte: 'ઊઠો; રાતનો છેલ્લો ત્રીજો ભાગ શરૂ થયો. ફજર {son} વાગ્યે શરૂ થશે.',
    uyandirKalan: cogul({ one: 'ઊઠો; ફજર સુધી {n} મિનિટ બાકી છે. ફજર {son} વાગ્યે શરૂ થશે.', other: 'ઊઠો; ફજર સુધી {n} મિનિટ બાકી છે. ફજર {son} વાગ્યે શરૂ થશે.' }),
    sonUcteBaslik: 'રાતનો છેલ્લો ત્રીજો ભાગ',
    sonUcteGovde: 'તહજ્જુદ માટે સૌથી બરકતવાળા કલાકો. ફજર {son} વાગ્યે શરૂ થશે.',
    teheccudKalan: cogul({ one: 'ફજર સુધી {n} મિનિટ બાકી છે. તહજ્જુદ માટે સારો સમય છે.', other: 'ફજર સુધી {n} મિનિટ બાકી છે. તહજ્જુદ માટે સારો સમય છે.' }),
  },
  uyandirmaKanali: 'તહજ્જુદ માટે જગાડવું',
  uyandirmaKanaliAciklama: 'રાતની નમાઝ માટે જગાડે છે; સાઇલન્ટ મોડમાં પણ વાગે છે',
};
