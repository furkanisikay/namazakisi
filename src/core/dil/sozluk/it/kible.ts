import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'È in direzione della qibla',
    arkada: 'La qibla è alle sue spalle, si giri',
    sagda: 'La qibla è {derece}° alla sua destra',
    solda: 'La qibla è {derece}° alla sua sinistra',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'O' },
  sekme: {
    pusula: 'Bussola',
    pusulaErisim: 'Modalità bussola',
    pusulaAciklama: 'Quando il simbolo della Kaaba arriva alla tacca in alto, è in direzione della qibla.',
    kamera: 'Fotocamera',
    kameraErisim: 'Modalità fotocamera',
    kameraAciklama: 'Tenga il telefono in verticale; il simbolo della Kaaba compare in direzione della qibla.',
  },
  sayfa: {
    baslatiliyor: 'Avvio della bussola…',
    izinKapali: 'L’autorizzazione alla posizione è disattivata; per trovare la direzione serve la sua posizione.',
  },
  hata: {
    izinGerekli: 'Per trovare la direzione della qibla serve l’autorizzazione alla posizione.',
    konumServisi: 'Impossibile accedere ai servizi di localizzazione. Controlli le impostazioni di posizione del dispositivo.',
    baslatilamadi: 'Non è stato possibile avviare il servizio della qibla.',
  },
  pusula: {
    ufuk: 'orizzonte',
    konumAliniyor: 'Rilevamento della posizione…',
    hazirlaniyor: 'Preparazione della bussola…',
    kuzeydenAci: 'Qibla a {derece}° da nord',
    kabeUzakta: 'La Kaaba è a {mesafe}',
    kuzeydenSaatYonu: 'Da nord in senso orario',
    kuzeyden: '{derece}° da nord',
    kabeUzaktaKuzeyden: 'La Kaaba è a {mesafe}, {derece}° da nord',
    pusulaErisim: 'Bussola della qibla. {cumle}',
    pusulaYok: 'Questo dispositivo non ha la bussola; mostriamo la direzione rispetto al nord.',
    kayiyorsa: 'Se la direzione si sposta, muova il telefono in aria disegnando un 8.',
    kamerayla: 'Vedere con la fotocamera',
  },
  kamera: {
    pusulayiKullanin: 'Usare la bussola',
    kullanilamiyorBaslik: 'La vista fotocamera non è disponibile su questo telefono',
    kullanilamiyorMetin:
      'I sensori del telefono non danno una direzione affidabile in verticale. La bussola continua a mostrare la direzione corretta.',
    izinBaslik: 'Vedere la qibla con la fotocamera',
    izinMetin:
      'Tenendo il telefono in verticale e guardandosi intorno, il simbolo della Kaaba compare in direzione della qibla. Per questo serve l’autorizzazione alla fotocamera; l’immagine non viene registrata e non lascia il telefono.',
    kamerayiAcin: 'Aprire la fotocamera',
    izinKapaliBaslik: 'Autorizzazione alla fotocamera disattivata',
    izinKapaliMetin: 'Per la vista con fotocamera può attivare l’autorizzazione nelle Impostazioni. La bussola funziona anche senza.',
    ayarlariAcin: 'Aprire le impostazioni',
    acilamadiBaslik: 'Impossibile aprire la fotocamera',
    acilamadiMetin: 'La fotocamera non è disponibile in questo momento. Può trovare la direzione della qibla con la bussola.',
    hesaplaniyor: 'Calcolo della direzione…',
    dikTutun: 'Tenga il telefono in verticale',
  },
  kalibrasyon: {
    tesekkurErisim: 'Grazie, ora la direzione è più precisa',
    tesekkur: 'Grazie, ora la direzione è più precisa ✓',
    baslik: 'Calibri la bussola',
    sallayin: 'Muova il telefono in aria disegnando un 8.',
    metal: 'Si allontani da oggetti metallici e custodie magnetiche.',
    dogruluk: 'Precisione',
    simdiDegil: 'Non ora',
  },
};
