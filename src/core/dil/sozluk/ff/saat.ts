import type { Sozluk } from '../tr';

/** Apple adları (Apple Watch, iPhone, Digital Crown, Live Activities, watchOS) ve otomasyon uygulamaları aynen. */
export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'E talifon',
    telefonAciklama: 'Alarm subaka e finninde tahajjudi hino sowtoo e talifon mon.',
    saatBaslik: 'E montoro, e deƴƴere',
    saatAciklama:
      'Jungo mon tan dillata, ɗum noon mo ɗaanii takko mon finnataa. So on ñifaali ɗum e montoro, talifon mon sowtoto wa ballal caggal {dk} hojomaaji. So Namaz Akışı alaa e montoro mon walla hesɗitinaaka, talifon mon sowtoto {dk} hojomaaji caggal bimmbi kala.',
    saatAciklamaIos:
      'Jungo mon tan dillata, ɗum noon mo ɗaanii takko mon finnataa. So on ñifaali ɗum e montoro, iPhone mon sowtoto wa ballal caggal {dk} hojomaaji.',
    ikisiBaslik: 'E ɗiɗi ɗin fow',
    ikisiAciklama: 'Montoro e talifon hino sowtoo e nder sahaa gooto; ñifde ɗum e montoro hino deƴƴina talifon kadi.',
    ikisiAciklamaIos: 'Montoro e iPhone hino sowtoo e nder sahaa gooto; ñifde ɗum e montoro hino deƴƴina iPhone kadi.',
  },
  anons: {
    otomatikBaslik: 'E talifon, e montoro so talifon woɗɗii',
    otomatikAciklama:
      'So talifon mon hino wondi e mon, talifon mon janngata e hito, montoro mon deƴƴa e faandaare (ngam kaɓirɗe ɗiɗi ɗin wota njanngu konngol gootol). So talifon mon woɗɗii, montoro mon janngata e hito.',
    saatBaslik: 'E montoro tan',
    saatAciklama:
      'Montoro mon janngan e hito sahaa kala, talifon mon deƴƴa. So montoro mon hino sarsee, jokkondiraaki e talifon mon walla alaa Namaz Akışı, hay huunde janngetaake; so on njiɗaa ɗum, huutoree suɓaade arande.',
    telefonBaslik: 'E talifon tan',
    telefonAciklama: 'Montoro mon wowlataa abada.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'So Namaz Akışı hino aafaa e Apple Watch mon, hino senndoo golle e iPhone mon. Ɗoo hiɗon suɓa ɗo finninde ndee sowtotoo.',
    giris:
      'So Namaz Akışı hino aafaa e montoro mon, hino senndoo golle e talifon mon. Ɗoo hiɗon suɓa ɗo finninde ndee sowtotoo e ɗo tintine njanngetee e hito.',
    uyandirmaBaslik: 'Honto finninde ndee sowtoto?',
    uyandirmaNotu:
      'Finninde ndee ko alarm goonga ngam subaka ko on huɓɓini e siftinoore "Adii waqutu gasde" e finninde tahajjudi ko on huɓɓini e Juulɗe sunna.',
    uyandirmaNotuIos:
      'watchOS waawaa teeltude alarm deƴƴo si wonaa so jaaɓngal montoro hino udditii: udditee Namaz Akışı e montoro mon laawol go’o ñalawma kala, finninde aroore teeltoto tuma ɗuum. So montoro hino sarsee walla jaaɓngal ngal udditaaki, alarm ballal iPhone mon sowtoto.',
    uyandirmaNotuAndroid: 'Montoro mon sowtotaako so hino sarsee; talifon mon sowtoto e nokku mum.',
    muhafizAyarlari: 'Udditee teelte "Adii waqutu gasde"',
    nafileAyarlari: 'Udditee teelte Juulɗe sunna',
    bilektenBaslik: 'Ko on mbaawi waɗude e jungo mon',
    bilektenIos: [
      'So iPhone mon woɗɗii, siftinooje hino sowtoo e montoro mon; ɗe sowtotaako e ɗiɗi ɗin fow.',
      'Hiɗon maandina juulɗe ɗe on juulii e jungo mon; iPhone mon winndata ɗe.',
      'Hiɗon limta tasbiihu e Digital Crown, hiɗon heɓa qibla e montoro mon.',
    ],
    anonsBaslik: 'Honto janngugol e hito waɗotoo?',
    anonsNotu:
      'Siftinooje ɗe janngugol e hito huɓɓinaa tan njanngetee. Kaɓirɗe ɗiɗi ɗin njanngataa konngol gootol e nder sahaa gooto. Montoro mon kadi deƴƴoto so hiɗon e juulirde walla Mode juulde huɓɓinaa. So montoro mon alaa kaakaawal sowto, masiŋ janngugol binndi walla hito e ɗemngal jaaɓngal ngal, ɗum dillata tan. Hiɗon mbaawi etude sowto montoro ngon jooni e "Etee sowto" e jaaɓngal montoro Namaz Akışı.',
    bilekten: [
      'Hiɗon mbaawi huɓɓinde e ñifde Mode juulde e butoŋ montoro (haa waqutu juulde gasa, ɓuri 30 hojomaaji).',
      'E juulirde, montoro mon hollay ko woni; hiɗon njaabtoo "Ɗoo wonaa juulirde" e "Hiɗon e juulirde?" e jungo mon.',
      'Yaynirɗe ɗe poottaaki e montoro (Deftere qadaa, E juulirde, teelte) hino udditoo e talifon mon e "Uddit e talifon".',
    ],
    namazModuNotu: 'Ngam huɓɓinde Mode juulde e montoro, huɓɓinee ɗum laawol go’o e talifon mon adii.',
    namazModuAyarlari: 'Udditee teelte Mode juulde',
  },
  sayfa: {
    akilliSaat: 'Montoro ƴoƴƴo',
    appleWatchOzet: 'Ɗo finninde ndee sowtotoo',
    saatOzet: 'Ɗo finninde ndee sowtotoo e ɗo janngugol e hito waɗotoo',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Saa’i heddiiɗo wuurɗo',
    geriSayim: 'Saa’i heddiiɗo',
    gelismisErisim: 'Teelte ɓurɗe. Golle hoore-mum e jaaɓe maandinooje "Mi juulii"',
    gelismis: 'Teelte ɓurɗe',
    otomasyonlar: 'Golle hoore-mum',
    otomasyonBaslik: 'Huutoree e golle hoore-mum',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Jaaɓe maandinooje "Mi juulii"',
    kildimOzet: 'Jaaɓe ɗe on jamiri',
  },
};
