import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Fon no so',
    telefonAciklama: 'Fajr alaam ne Tahajud nyanee bɔ wɔ wo fon so.',
    saatBaslik: 'Wɔɔkye no so, komm',
    saatAciklama:
      'Wo nsa nko ara na ɛwosow, enti obi a ɔda wo nkyɛn no nnyane. Sɛ wonnum no wɔ wɔɔkye no so a, wo fon bɛbɔ sima {dk} akyi sɛ ɔboafoɔ. Sɛ Namaz Akışı nni wo wɔɔkye so anaa ɛnyɛ foforo a, wo fon bɛbɔ sima {dk} akyi anɔpa biara.',
    saatAciklamaIos:
      'Wo nsa nko ara na ɛwosow, enti obi a ɔda wo nkyɛn no nnyane. Sɛ wonnum no wɔ wɔɔkye no so a, wo iPhone bɛbɔ sima {dk} akyi sɛ ɔboafoɔ.',
    ikisiBaslik: 'Mmienu no nyinaa so',
    ikisiAciklama: 'Wɔɔkye ne fon bɔ bom; sɛ wodum no wɔ wɔɔkye no so a, fon no nso yɛ komm.',
    ikisiAciklamaIos: 'Wɔɔkye ne iPhone bɔ bom; sɛ wodum no wɔ wɔɔkye no so a, iPhone no nso yɛ komm.',
  },
  anons: {
    otomatikBaslik: 'Fon no so, wɔɔkye no so sɛ fon no nni hɔ a',
    otomatikAciklama:
      'Sɛ wo fon ka wo ho a, wo fon na ɛkenkan na wo wɔɔkye yɛ komm (sɛdeɛ afidie mmienu no nkenkan asɛm koro). Sɛ wo fon nni wo nkyɛn a, wo wɔɔkye na ɛkenkan.',
    saatBaslik: 'Wɔɔkye no so nko ara',
    saatAciklama:
      'Wo wɔɔkye na ɛkenkan daa na wo fon yɛ komm. Sɛ wo wɔɔkye regye ahoɔden, ɛne wo fon nni nkitahodie anaa Namaz Akışı nni so a, wɔnkenkan hwee; sɛ wompɛ saa a, fa deɛ edi kan no.',
    telefonBaslik: 'Fon no so nko ara',
    telefonAciklama: 'Wo wɔɔkye nkasa da.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Sɛ Namaz Akışı wɔ wo Apple Watch so a, ɛne wo iPhone kyɛ adwuma no. Ha na wopaw baabi a nyanee no bɛbɔ.',
    giris:
      'Sɛ Namaz Akışı wɔ wo wɔɔkye so a, ɛne wo fon kyɛ adwuma no. Ha na wopaw baabi a nyanee no bɛbɔ ne baabi a wɔbɛkenkan amaneɛbɔ.',
    uyandirmaBaslik: 'Ɛhe na nyanee no mmɔ?',
    uyandirmaNotu:
      'Nyanee no ne alaam ankasa a wobue ma Fajr wɔ "Ansa na berɛ aba awieɛ" nkaeɛ mu ne Tahajud nyanee a wobue wɔ Naafila Nyamefrɛ mu.',
    uyandirmaNotuIos:
      'watchOS tumi hyɛ alaam komm bi berɛ a wɔɔkye app no abue nko ara: bue Namaz Akışı wɔ wo wɔɔkye so prɛko da biara na ɛbɛhyɛ nyanee a ɛdi hɔ no. Sɛ wɔɔkye no regye ahoɔden anaa wommuee app no a, wo iPhone ɔboafoɔ alaam bɛbɔ.',
    uyandirmaNotuAndroid: 'Wo wɔɔkye mmɔ berɛ a ɛregye ahoɔden; wo fon na ɛbɔ.',
    muhafizAyarlari: 'Bue "Ansa na berɛ aba awieɛ" nhyehyɛe',
    nafileAyarlari: 'Bue Naafila Nyamefrɛ nhyehyɛe',
    bilektenBaslik: 'Deɛ wobɛtumi ayɛ afiri wo nsa so',
    bilektenIos: [
      'Sɛ wo iPhone nni wo nkyɛn a, nkaeɛ bɔ wɔ wo wɔɔkye so; ɛmmɔ mmienu no nyinaa so.',
      'Wokyerɛ Nyamefrɛ a woayɛ firi wo nsa so; wo iPhone kyerɛw.',
      'Wode Digital Crown kan tasbih na wohwehwɛ Qibla wɔ wo wɔɔkye so.',
    ],
    anonsBaslik: 'Ɛhe na wɔnkenkan?',
    anonsNotu:
      'Nkaeɛ a wɔabue ne nne kenkan nko ara na wɔkenkan. Afidie mmienu no nkenkan asɛm koro bom. Wo wɔɔkye nso yɛ komm berɛ a wowɔ masjid anaa Nyamefrɛ tebea abue. Sɛ wo wɔɔkye nni kasafidie, nne kenkan mfidie anaa nne wɔ app no kasa mu a, ɛwosow nko ara. Wobɛtumi asɔ wɔɔkye no nnyegyeeɛ ahwɛ ntɛm ara wɔ Namaz Akışı wɔɔkye app mu "Sɔ nnyegyeeɛ no hwɛ".',
    bilekten: [
      'Wobɛtumi de wɔɔkye no bɔtɔm abue na ato Nyamefrɛ tebea mu (kosi Nyamefrɛ berɛ awieɛ, sima 30 pɛ).',
      'Wɔ masjid no, wo wɔɔkye kyerɛ tebea no; wo nsa so na wobua "Ɛha nyɛ masjid" ne "Wowɔ masjid?".',
      'Skrin a ɛnfata wɔɔkye no so (Qada Nwoma, Mewɔ masjid, nhyehyɛe) bue wɔ wo fon so ne "Bue wɔ fon so".',
    ],
    namazModuNotu: 'Sɛ wopɛ sɛ wobue Nyamefrɛ tebea firi wɔɔkye no so a, di kan bue no prɛko wɔ wo fon so.',
    namazModuAyarlari: 'Bue Nyamefrɛ tebea nhyehyɛe',
  },
  sayfa: {
    akilliSaat: 'Wɔɔkye',
    appleWatchOzet: 'Baabi a nyanee no bɔ',
    saatOzet: 'Baabi a nyanee no bɔ ne baabi a wɔkenkan',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Berɛ a aka a ɛkɔ so',
    geriSayim: 'Berɛ a aka',
    gelismisErisim: 'Nea ɛkɔ akyiri. Otomeehyɛn ne app a ɛkyerɛ Mayɛ Nyamefrɛ',
    gelismis: 'Nea ɛkɔ akyiri',
    otomasyonlar: 'Otomeehyɛn',
    otomasyonBaslik: 'Fa di dwuma wɔ otomeehyɛn mu',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'App a ɛkyerɛ Mayɛ Nyamefrɛ',
    kildimOzet: 'App a woama kwan',
  },
};
