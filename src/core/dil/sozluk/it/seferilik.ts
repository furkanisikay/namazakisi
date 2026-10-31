import type { Sozluk } from '../tr';

/** Bilgilendirme, hüküm kipi yok. Kasr "accorciamento" (meal 4:101 "accorcerete la preghiera"), cem "unione". */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafita', safii: 'Shafiita' },
  kaynaklar: {
    vatan: 'Patria d’origine, patria di residenza e patria di soggiorno ai fini dello stato di viaggiatore',
    cem: 'Si possono compiere le preghiere unendole (jam’)?',
    baslangic: 'Come si stabilisce l’inizio del viaggio?',
    ziyaret: 'Chi va nella località dove vivono i genitori è considerato viaggiatore?',
  },
  bilgiNotu:
    'Non è un parere giuridico, è un’informazione. Essere o meno considerati viaggiatori dipende dallo scopo, dalla durata e dall’intenzione del viaggio.',
  baslik: 'Sembra che lei sia in viaggio',
  mesafeSatiri: 'Si trova a circa {km} km in linea d’aria dal suo luogo di residenza. Informazioni riportate dalla Diyanet secondo la scuola {mezhep}:',
  maddeler: {
    hanefi: [
      'Nella scuola hanafita la distanza di viaggio è di circa 90 km. Chi intende restare nel luogo di destinazione meno di 15 giorni è considerato viaggiatore.',
      'Il viaggiatore compie le preghiere obbligatorie di quattro unità in due unità (qasr, accorciamento).',
      'Nella scuola hanafita l’unione di due preghiere (jam’) avviene solo durante il hajj, ad Arafat e a Muzdalifa. La Diyanet precisa anche che in caso di motivi seri, come il viaggio, si può seguire il parere delle altre scuole.',
    ],
    safii: [
      'Anche nella scuola shafiita la distanza di viaggio è di circa 90 km. Se nel luogo di destinazione si resta meno di 4 giorni, esclusi quelli di arrivo e di partenza, le norme del viaggio continuano ad applicarsi.',
      'Il viaggiatore compie le preghiere obbligatorie di quattro unità in due unità (qasr, accorciamento).',
      'Nella scuola shafiita il viaggio è tra i motivi validi per unire (jam’) lo Zuhr con l’Asr e il Maghrib con l’Isha.',
    ],
  },
  ozetAcik: 'Attivo · {mezhep}',
  ozetKapali: 'Disattivato',
  baglantiAcilamadi: 'Impossibile aprire il collegamento. Controlli la connessione a internet.',
  ikametGuncellendi: 'Il luogo di residenza è stato aggiornato',
  ikametKaydedilemedi: 'Non è stato possibile salvare il luogo di residenza',
  kartiKapatin: 'Chiudere la scheda informativa sul viaggio',
  burasiEvimErisim: 'Questa è casa mia, salvarla come luogo di residenza',
  burasiEvim: 'Questa è casa mia',
  diyanetteOkuyunErisim: 'Leggere la fatwa della Diyanet nel browser',
  diyanetteOkuyun: 'Leggere sul sito Diyanet',
  sayfa: {
    kayitliKonum: 'Posizione salvata',
    henuzKaydedilmedi: 'Non ancora salvato — la prima posizione vale come luogo di residenza',
    buradasiniz: 'Ora si trova qui',
    uzaktasiniz: 'Ora si trova a circa {km} km in linea d’aria',
    konumBilinmiyor: 'La sua posizione non è ancora nota; scelga prima una posizione',
    giris:
      'Quando si allontana di circa {km} km dal luogo di residenza, nella schermata principale compare una breve scheda informativa che riassume le fatwa della Diyanet. La scheda compare una volta per viaggio e non invia notifiche.',
    bilgiKarti: 'Scheda informativa',
    kartBaslik: 'Scheda informativa sul viaggio',
    gosterilir: 'Mostrata nella schermata principale',
    gosterilmez: 'Non mostrata',
    mezhepNotu: 'Il contenuto della scheda dipende dalla sua scuola giuridica; può sceglierla in Impostazioni › Orari di preghiera.',
    ikametYeri: 'Luogo di residenza',
    ikametYapErisim: 'Salvare la posizione attuale come luogo di residenza',
    ikametYap: 'Usare la posizione attuale come residenza',
    kaynaklar: 'Fonti (Alto consiglio per gli affari religiosi della Diyanet)',
    kaynakErisim: '{etiket}. Si apre nel browser',
    fetvaHatti: 'Per le sue domande può chiamare la linea fatwa 190 della Diyanet.',
  },
};
