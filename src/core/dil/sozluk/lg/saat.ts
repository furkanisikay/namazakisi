import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Ku ssimu',
    telefonAciklama: 'Alaamu ya Subuhi n’okuzuukusa kwa Tahajjud bivugira ku ssimu yo.',
    saatBaslik: 'Ku ssaawa y’omukono, mu kasirise',
    saatAciklama:
      'Omukono gwo gwokka gwe gukankana, n’olwekyo oyo eyeebase okumpi naawe tazuukuka. Bw’otogiggyako ku ssaawa, essimu yo evuga ng’ey’okwekuuma oluvannyuma lw’eddakiika {dk}. Namaz Akışı bw’eba teri ku ssaawa yo oba nga terongooseddwa, essimu yo evuga ng’erwawo eddakiika {dk} buli nkya.',
    saatAciklamaIos:
      'Omukono gwo gwokka gwe gukankana, n’olwekyo oyo eyeebase okumpi naawe tazuukuka. Bw’otogiggyako ku ssaawa, iPhone yo evuga ng’ey’okwekuuma oluvannyuma lw’eddakiika {dk}.',
    ikisiBaslik: 'Ku byombi',
    ikisiAciklama: 'Essaawa y’omukono n’essimu bivugira wamu; okugiggyako ku ssaawa kusirisa n’essimu.',
    ikisiAciklamaIos: 'Essaawa y’omukono ne iPhone bivugira wamu; okugiggyako ku ssaawa kusirisa ne iPhone.',
  },
  anons: {
    otomatikBaslik: 'Ku ssimu, ku ssaawa y’omukono ng’essimu teriiwo',
    otomatikAciklama:
      'Essimu yo bw’eba naawe, essimu yo y’esoma mu ddoboozi era essaawa yo esirika mu bugenderevu (byombi bireme kusoma sentensi y’emu). Essimu yo bw’eba teriiwo, essaawa yo y’esoma mu ddoboozi.',
    saatBaslik: 'Ku ssaawa y’omukono yokka',
    saatAciklama:
      'Essaawa yo bulijjo esoma mu ddoboozi era essimu yo esirika. Essaawa yo bw’eba ecaajingibwa, nga teyungiddwa ku ssimu yo oba nga terina Namaz Akışı, tewali kisomebwa mu ddoboozi; bw’oba tokyagala, kozesa ekisooka.',
    telefonBaslik: 'Ku ssimu yokka',
    telefonAciklama: 'Essaawa yo teyogera n’akatono.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Namaz Akışı bw’eba eteereddwa ku Apple Watch yo, egabana omulimu ne iPhone yo. Wano olonda okuzuukusa wekuvugira.',
    giris:
      'Namaz Akışı bw’eba eteereddwa ku ssaawa yo, egabana omulimu n’essimu yo. Wano olonda okuzuukusa wekuvugira n’ebirangiriro we bisomerwa mu ddoboozi.',
    uyandirmaBaslik: 'Okuzuukusa kuvugire wa?',
    uyandirmaNotu:
      'Okuzuukusa ye alaamu entuufu gy’oteekako ku Subuhi mu kijjukizo “Nga ekiseera tekinnaggwaako” n’okuzuukusa kwa Tahajjud kw’oteekako mu Sswala ez’ennyongeza.',
    uyandirmaNotuIos:
      'watchOS esobola okuteekawo alaamu ey’akasirise app y’essaawa bw’eba ng’egguddwa: ggulawo Namaz Akışı ku ssaawa yo omulundi gumu buli lunaku, okuzuukusa okuddako ne kuteekebwawo olwo. Essaawa bw’eba ecaajingibwa oba app nga tegguddwawo, ekyokwekuuma kya iPhone yo kye kivuga.',
    uyandirmaNotuAndroid: 'Essaawa yo tevuga ng’ecaajingibwa; essimu yo y’evuga mu kifo kyayo.',
    muhafizAyarlari: 'Ggulawo entegeka za “Nga ekiseera tekinnaggwaako”',
    nafileAyarlari: 'Ggulawo entegeka z’Esswala ez’ennyongeza',
    bilektenBaslik: 'By’osobola okukola ng’oyita ku mukono',
    bilektenIos: [
      'iPhone yo bw’eba teriiwo, ebijjukizo bivugira ku ssaawa yo; tebivugira ku byombi.',
      'Oteeka obubonero ku sswala z’osaaze ng’oyita ku mukono; iPhone yo ezitereka.',
      'Obala tasbiih ne Digital Crown era ozuula Kibula ku ssaawa yo.',
    ],
    anonsBaslik: 'Okusoma mu ddoboozi kubeere wa?',
    anonsNotu:
      'Ebijjukizo ebiteereddwako okusoma mu ddoboozi byokka bye bisomebwa. Ebyuma byombi tebisoma sentensi y’emu wamu. Essaawa yo era esirika ng’oli ku muzikiti oba nga Engeri y’esswala eri ku. Essaawa yo bw’eba terina sipiika, ekyuma ekisoma ebiwandiiko oba eddoboozi mu lulimi lwa app, ekankana bukankanyi. Osobola okugezesa eddoboozi ly’essaawa amangu ago ne “Gezesa eddoboozi” mu app ya Namaz Akışı ku ssaawa.',
    bilekten: [
      'Osobola okuteeka n’okuggyako Engeri y’esswala ne pesa ku ssaawa (okutuusa ekiseera ky’esswala lwe kiggwaako, eddakiika 30 ezisinga).',
      'Ku muzikiti, essaawa yo eraga embeera; oddamu “Kino si muzikiti” ne “Oli ku muzikiti?” ng’oyita ku mukono.',
      'Empapula ezitagya ku ssaawa (Olukalala lwa Qadha, Ndi ku muzikiti, entegeka) zigguka ku ssimu yo ne “Ggulawo ku ssimu”.',
    ],
    namazModuNotu: 'Okuteeka Engeri y’esswala ku ssaawa, sooka ogiteeke ku ssimu yo omulundi gumu.',
    namazModuAyarlari: 'Ggulawo entegeka z’Engeri y’esswala',
  },
  sayfa: {
    akilliSaat: 'Essaawa ey’omukono ey’amagezi',
    appleWatchOzet: 'Okuzuukusa we kuvugira',
    saatOzet: 'Okuzuukusa we kuvugira ne we kusomerwa mu ddoboozi',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Okubala mu butereevu',
    geriSayim: 'Okubala ekiseera',
    gelismisErisim: 'Eby’omulembe. Automation n’app eziteeka akabonero Nsaaze',
    gelismis: 'Eby’omulembe',
    otomasyonlar: 'Automation',
    otomasyonBaslik: 'Kozesa ne automation',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'App eziteeka akabonero Nsaaze',
    kildimOzet: 'App z’okkirizza',
  },
};
