import type { Sozluk } from '../tr';

/** Saat uygulamasının düğme adları ("Išbandyti garsą", "Atidaryti telefone") Wear `values-lt` ile aynı. */
export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Telefone',
    telefonAciklama: 'Fajr žadintuvas ir Tahadžud žadinimas skamba jūsų telefone.',
    saatBaslik: 'Laikrodyje, tyliai',
    saatAciklama:
      'Vibruoja tik jūsų riešas, šalia miegantis nepabunda. Jei neišjungsite laikrodyje, po {dk} min. atsarginis signalas suskambės telefone. Jei laikrodyje nėra „Namaz Akışı“ arba ji pasenusi, telefonas kiekvieną rytą suskambės {dk} min. vėliau.',
    saatAciklamaIos: 'Vibruoja tik jūsų riešas, šalia miegantis nepabunda. Jei neišjungsite laikrodyje, po {dk} min. atsarginis signalas suskambės iPhone.',
    ikisiBaslik: 'Abiejuose',
    ikisiAciklama: 'Laikrodis ir telefonas skamba kartu; išjungus laikrodyje nutyla ir telefonas.',
    ikisiAciklamaIos: 'Laikrodis ir iPhone skamba kartu; išjungus laikrodyje nutyla ir iPhone.',
  },
  anons: {
    otomatikBaslik: 'Telefone, o jei jis toli – laikrodyje',
    otomatikAciklama:
      'Kai telefonas šalia, skaito telefonas, o laikrodis sąmoningai tyli (kad du įrenginiai neskaitytų to paties sakinio). Kai telefonas toli, skaito laikrodis.',
    saatBaslik: 'Tik laikrodyje',
    saatAciklama:
      'Garsiai visada skaito laikrodis, telefonas tyli. Kai laikrodis kraunamas, neprijungtas prie telefono arba jame nėra „Namaz Akışı“, skaitymo nesigirdės; jei to nenorite, rinkitės pirmąją parinktį.',
    telefonBaslik: 'Tik telefone',
    telefonAciklama: 'Laikrodis niekada nekalba.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Jei „Apple Watch“ įdiegta „Namaz Akışı“, ji dalijasi darbais su jūsų iPhone. Čia pasirenkate, kur skambės žadinimas.',
    giris:
      'Jei laikrodyje įdiegta „Namaz Akışı“, ji dalijasi darbais su jūsų telefonu. Čia pasirenkate, kur skambės žadinimas ir kur bus skaitoma garsiai.',
    uyandirmaBaslik: 'Kur skambės žadinimas?',
    uyandirmaNotu:
      'Žadinimas – tai tikras žadintuvas, kurį įjungėte Fajr maldai priminime „Prieš baigiantis laikui“, ir Tahadžud žadinimas, kurį įjungėte skiltyje „Savanoriškos maldos“.',
    uyandirmaNotuIos:
      '„watchOS“ tylųjį žadintuvą gali nustatyti tik atidarius laikrodžio programą: kartą per dieną atidarykite „Namaz Akışı“ laikrodyje, ir kitas žadinimas bus nustatytas tuo metu. Jei laikrodis kraunamas arba programa neatidaryta, suskamba atsarginis iPhone signalas.',
    uyandirmaNotuAndroid: 'Kraunamas laikrodis neskamba; tada skamba telefonas.',
    muhafizAyarlari: 'Atidaryti „Prieš baigiantis laikui“ nustatymus',
    nafileAyarlari: 'Atidaryti savanoriškų maldų nustatymus',
    bilektenBaslik: 'Ką galite daryti nuo riešo',
    bilektenIos: [
      'Kai iPhone toli, priminimai skamba laikrodyje; abu kartu neskamba.',
      'Atliktą maldą pažymite nuo riešo; iPhone įrašą gauna.',
      'Tasbihą skaičiuojate „Digital Crown“, kiblą randate laikrodyje.',
    ],
    anonsBaslik: 'Kur skaityti garsiai?',
    anonsNotu:
      'Skaitomi tik priminimai, kuriems įjungtas skaitymas garsiai. Du įrenginiai to paties sakinio kartu neskaito. Kai esate mečetėje arba įjungtas Maldos režimas, laikrodis taip pat nekalba. Jei laikrodyje nėra garsiakalbio, teksto skaitymo variklio ar lietuviško balso, laikrodis tik vibruoja. Laikrodžio garsą galite iškart išbandyti „Namaz Akışı“ laikrodžio programoje mygtuku „Išbandyti garsą“.',
    bilekten: [
      'Maldos režimą galite įjungti ir išjungti laikrodžio mygtuku (iki maldos laiko pabaigos, daugiausia 30 minučių).',
      'Kai esate mečetėje, laikrodis rodo būseną; į klausimus „Čia ne mečetė“ ir „Ar esate mečetėje?“ atsakote nuo riešo.',
      'Į laikrodį netelpančius ekranus (praleistų maldų žurnalas, „Esu mečetėje“, nustatymai) atidarote telefone mygtuku „Atidaryti telefone“.',
    ],
    namazModuNotu: 'Kad galėtumėte Maldos režimą įjungti iš laikrodžio, pirmiausia vieną kartą įjunkite jį telefone.',
    namazModuAyarlari: 'Atidaryti Maldos režimo nustatymus',
  },
  sayfa: {
    akilliSaat: 'Išmanusis laikrodis',
    appleWatchOzet: 'Kur skambės žadinimas',
    saatOzet: 'Kur skambės žadinimas ir skaitymas garsiai',
    canliEtkinlikler: 'Tiesioginės veiklos',
    canliSayaclar: 'Tiesioginiai skaitikliai',
    geriSayim: 'Atgalinė atskaita',
    gelismisErisim: 'Išplėstiniai. Automatizavimas ir įgaliotos programos',
    gelismis: 'Išplėstiniai',
    otomasyonlar: 'Automatizavimas',
    otomasyonBaslik: 'Naudoti su automatizavimu',
    otomasyonOzet: '„Samsung“ rutinos, „Tasker“, „MacroDroid“',
    kildimBaslik: 'Įgaliotos programos',
    kildimOzet: 'Programos, kurioms suteikėte leidimą',
  },
};
