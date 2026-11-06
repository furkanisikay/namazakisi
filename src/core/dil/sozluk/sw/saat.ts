import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Kwenye simu',
    telefonAciklama: 'Kengele ya Alfajiri na kuamshwa kwa Tahajjud hulia kwenye simu yako.',
    saatBaslik: 'Kwenye saa, kimya',
    saatAciklama:
      'Kifundo chako tu ndicho kinachotetemeka, kwa hivyo anayelala kando yako haamshwi. Usipoizima kwenye saa, simu yako inalia kama akiba baada ya dakika {dk}. Ikiwa Namaz Akışı haipo kwenye saa yako au haijasasishwa, simu yako inalia dakika {dk} kwa kuchelewa kila asubuhi.',
    saatAciklamaIos:
      'Kifundo chako tu ndicho kinachotetemeka, kwa hivyo anayelala kando yako haamshwi. Usipoizima kwenye saa, iPhone yako inalia kama akiba baada ya dakika {dk}.',
    ikisiBaslik: 'Kwenye zote mbili',
    ikisiAciklama: 'Saa na simu hulia pamoja; ukiizima kwenye saa, simu pia inanyamaza.',
    ikisiAciklamaIos: 'Saa na iPhone hulia pamoja; ukiizima kwenye saa, iPhone pia inanyamaza.',
  },
  anons: {
    otomatikBaslik: 'Kwenye simu, kwenye saa simu ikiwa mbali',
    otomatikAciklama:
      'Simu yako ikiwa nawe, simu inasoma kwa sauti na saa yako inanyamaza kwa makusudi (ili vifaa viwili visisome sentensi moja). Simu yako ikiwa mbali, saa yako inasoma kwa sauti.',
    saatBaslik: 'Kwenye saa tu',
    saatAciklama:
      'Saa yako husoma kwa sauti kila wakati na simu yako inanyamaza. Saa yako ikiwa inachajiwa, haijaunganishwa na simu yako au haina Namaz Akışı, hakuna kinachosomwa kwa sauti; kama hutaki hivyo, tumia chaguo la kwanza.',
    telefonBaslik: 'Kwenye simu tu',
    telefonAciklama: 'Saa yako haiongei kamwe.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Ikiwa Namaz Akışı imesakinishwa kwenye Apple Watch yako, inagawana kazi na iPhone yako. Hapa unachagua mahali kengele ya kuamsha inapolia.',
    giris:
      'Ikiwa Namaz Akışı imesakinishwa kwenye saa yako, inagawana kazi na simu yako. Hapa unachagua mahali kengele ya kuamsha inapolia na mahali matangazo yanaposomwa kwa sauti.',
    uyandirmaBaslik: 'Kengele ya kuamsha ilie wapi?',
    uyandirmaNotu:
      'Kengele ya kuamsha ni kengele halisi unayowasha kwa Alfajiri katika kikumbusho cha "Kabla wakati haujaisha" na kuamshwa kwa Tahajjud unakowasha katika Swala za Nafila.',
    uyandirmaNotuIos:
      'watchOS inaweza kuweka kengele ya kimya tu programu ya saa ikiwa imefunguliwa: fungua Namaz Akışı kwenye saa yako mara moja kwa siku na kengele inayofuata inawekwa wakati huo. Saa ikiwa inachajiwa au programu haikufunguliwa, kengele ya akiba ya iPhone yako inalia.',
    uyandirmaNotuAndroid: 'Saa yako hailii ikiwa inachajiwa; simu yako inalia badala yake.',
    muhafizAyarlari: 'Fungua mipangilio ya "Kabla wakati haujaisha"',
    nafileAyarlari: 'Fungua mipangilio ya Swala za Nafila',
    bilektenBaslik: 'Unachoweza kufanya ukiwa kwenye kifundo',
    bilektenIos: [
      'iPhone yako ikiwa mbali, vikumbusho vinalia kwenye saa yako; havilii kwenye vyote viwili.',
      'Unaweka alama Swala ulizoswali ukiwa kwenye kifundo; iPhone yako inazihifadhi.',
      'Unahesabu tasbihi kwa Digital Crown na kupata Kibla kwenye saa yako.',
    ],
    anonsBaslik: 'Kusoma kwa sauti kufanyike wapi?',
    anonsNotu:
      'Vikumbusho vilivyowashwa kusoma kwa sauti tu ndivyo vinavyosomwa. Vifaa viwili havisomi sentensi moja pamoja. Saa yako pia inanyamaza ukiwa msikitini au Hali ya Swala ikiwa imewashwa. Ikiwa saa yako haina spika, injini ya kusoma maandishi au sauti ya lugha ya programu, inatetemeka tu. Unaweza kujaribu sauti ya saa mara moja kwa "Jaribu sauti" katika programu ya Namaz Akışı ya saa.',
    bilekten: [
      'Unaweza kuwasha na kuzima Hali ya Swala kwa kitufe kwenye saa (hadi mwisho wa wakati wa Swala, dakika 30 zaidi).',
      'Msikitini, saa yako inaonyesha hali; unajibu "Huu si msikiti" na "Uko msikitini?" ukiwa kwenye kifundo.',
      'Skrini zisizotosha kwenye saa (Daftari la Qadha, Niko msikitini, mipangilio) hufunguka kwenye simu yako kwa "Fungua kwenye simu".',
    ],
    namazModuNotu: 'Ili kuwasha Hali ya Swala kutoka kwenye saa, iwashe kwanza mara moja kwenye simu yako.',
    namazModuAyarlari: 'Fungua mipangilio ya Hali ya Swala',
  },
  sayfa: {
    akilliSaat: 'Saa janja',
    appleWatchOzet: 'Mahali kengele ya kuamsha inapolia',
    saatOzet: 'Mahali kengele ya kuamsha inapolia na kusoma kwa sauti',
    canliEtkinlikler: 'Shughuli za moja kwa moja',
    canliSayaclar: 'Muda uliobaki wa moja kwa moja',
    geriSayim: 'Muda uliobaki',
    gelismisErisim: 'Mipangilio ya juu. Otomatiki na programu zinazoweka alama Nimeswali',
    gelismis: 'Mipangilio ya juu',
    otomasyonlar: 'Otomatiki',
    otomasyonBaslik: 'Tumia na otomatiki',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Programu zinazoweka alama Nimeswali',
    kildimOzet: 'Programu ulizoruhusu',
  },
};
