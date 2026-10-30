import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Taleefanka',
    telefonAciklama: 'Alaarmiga Subax iyo toosinta Tahajjud waxay ka dhawaaqaan taleefankaaga.',
    saatBaslik: 'Saacadda, si aamusan',
    saatAciklama:
      'Kaliya curcurkaaga ayaa gariira, sidaas darteed qofka kuu dhow jiifa ma toosayo. Haddii aadan ka damin saacadda, taleefankaagu wuxuu u dhawaaqayaa kayd ahaan {dk} daqiiqo kadib. Haddii Namaz Akışı uusan ku jirin saacaddaada ama uusan cusbayn, taleefankaagu subax kasta wuxuu dhawaaqayaa {dk} daqiiqo daahid ah.',
    saatAciklamaIos:
      'Kaliya curcurkaaga ayaa gariira, sidaas darteed qofka kuu dhow jiifa ma toosayo. Haddii aadan ka damin saacadda, iPhone-kaagu wuxuu u dhawaaqayaa kayd ahaan {dk} daqiiqo kadib.',
    ikisiBaslik: 'Labadaba',
    ikisiAciklama: 'Saacadda iyo taleefanku way wada dhawaaqaan; ka damintiisa saacadda waxay sidoo kale aamusisaa taleefanka.',
    ikisiAciklamaIos: 'Saacadda iyo iPhone-ku way wada dhawaaqaan; ka damintiisa saacadda waxay sidoo kale aamusisaa iPhone-ka.',
  },
  anons: {
    otomatikBaslik: 'Taleefanka, saacadda marka uu fog yahay',
    otomatikAciklama:
      'Marka taleefankaagu kula jiro, taleefankaaga ayaa kor u akhriya, saacaddaaduna si ula kac ah ayay u aamustaa (si labada qalab aysan isku jumlad u akhriyin). Marka taleefankaagu fog yahay, saacaddaada ayaa kor u akhrisa.',
    saatBaslik: 'Saacadda oo kaliya',
    saatAciklama:
      'Saacaddaadu had iyo jeer way kor u akhrisaa, taleefankaaguna wuu aamusaa. Inta saacaddaadu dallacayso, aysan ku xirnayn taleefankaaga ama aysan lahayn Namaz Akışı, waxba kor looma akhriyo; haddii aadan taas rabin, isticmaal doorashada koowaad.',
    telefonBaslik: 'Taleefanka oo kaliya',
    telefonAciklama: 'Saacaddaadu marnaba ma hadasho.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Haddii Namaz Akışı lagu rakibay Apple Watch-kaaga, shaqada ayuu la qaybsadaa iPhone-kaaga. Halkan ayaad ka dooranaysaa meesha toosintu ka dhawaaqdo.',
    giris:
      'Haddii Namaz Akışı lagu rakibay saacaddaada, shaqada ayuu la qaybsadaa taleefankaaga. Halkan ayaad ka dooranaysaa meesha toosintu ka dhawaaqdo iyo meesha ogeysiisyada kor loogu akhriyo.',
    uyandirmaBaslik: 'Xaggee ayay toosintu ka dhawaaqdaa?',
    uyandirmaNotu:
      'Toosintu waa alaarmiga dhabta ah ee aad u shiddo Subax xusuusinta "Ka hor dhammaadka waqtiga" iyo toosinta Tahajjud ee aad ka shiddo salaadaha sunnada.',
    uyandirmaNotuIos:
      'watchOS wuxuu dejin karaa alaarm aamusan oo kaliya inta barnaamijka saacaddu furan yahay: maalintii hal mar ka fur Namaz Akışı saacaddaada, toosinta xigtana markaas ayaa la dejiyaa. Inta saacaddu dallacayso ama haddii barnaamijka aan la furin, kaydka iPhone-kaaga ayaa dhawaaqa.',
    uyandirmaNotuAndroid: 'Saacaddaadu ma dhawaaqdo inta ay dallacayso; taleefankaaga ayaa beddelkeeda dhawaaqa.',
    muhafizAyarlari: 'Fur dejinta "Ka hor dhammaadka waqtiga"',
    nafileAyarlari: 'Fur dejinta salaadaha sunnada',
    bilektenBaslik: 'Waxa aad ka samayn karto curcurkaaga',
    bilektenIos: [
      'Marka iPhone-kaagu fog yahay, xusuusinta waxay ka dhawaaqdaa saacaddaada; labadaba kama dhawaaqdo.',
      'Salaadaha aad tukatay waxaad ka calaamadeysaa curcurkaaga; iPhone-kaaga ayaa diiwaangeliya.',
      'Tasbiixa waxaad ku tirisaa Digital Crown, Qiblada waxaad ka heshaa saacaddaada.',
    ],
    anonsBaslik: 'Xaggee ayaa kor loogu akhriyaa?',
    anonsNotu:
      'Kaliya xusuusinta akhrinta codka loo shiday ayaa la akhriyaa. Labada qalab isku jumlad isku mar ma akhriyaan. Saacaddaadu sidoo kale way aamustaa inta aad masjidka joogto ama qaabka Salaaddu shidan yahay. Haddii saacaddaadu aysan lahayn sameecad, mishiin qoraal-ilaa-cod ama cod luqadda barnaamijka ah, way gariiraysaa oo kaliya. Codka saacadda isla markiiba waxaad ku tijaabin kartaa "Tijaabi codka" ee barnaamijka saacadda Namaz Akışı.',
    bilekten: [
      'Qaabka Salaadda waxaad ku shidi kartaa oo ku damin kartaa badhanka saacadda (ilaa dhammaadka waqtiga salaadda, ugu badnaan 30 daqiiqo).',
      'Masjidka, saacaddaadu waxay muujisaa xaaladda; "Kani masjid ma aha" iyo "Masjidka ma joogtaa?" waxaad uga jawaabtaa curcurkaaga.',
      'Shaashadaha aan saacadda ku filnayn (Buugga qadaa, Masjidka ayaan joogaa, dejinta) waxay ka furmaan taleefankaaga "Ka fur taleefanka".',
    ],
    namazModuNotu: 'Si aad saacadda uga shiddo qaabka Salaadda, marka hore hal mar ka shid taleefankaaga.',
    namazModuAyarlari: 'Fur dejinta qaabka Salaadda',
  },
  sayfa: {
    akilliSaat: 'Saacad casri ah',
    appleWatchOzet: 'Meesha toosintu ka dhawaaqdo',
    saatOzet: 'Meesha toosintu ka dhawaaqdo iyo kor u akhrinta',
    canliEtkinlikler: 'Hawlaha tooska ah',
    canliSayaclar: 'Tirinta tooska ah',
    geriSayim: 'Tirin',
    gelismisErisim: 'Horumarsan. Otomaatigyada iyo barnaamijyada calaamadeeya Waan tukaday',
    gelismis: 'Horumarsan',
    otomasyonlar: 'Otomaatigyada',
    otomasyonBaslik: 'U isticmaal otomaatigyada',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Barnaamijyada calaamadeeya Waan tukaday',
    kildimOzet: 'Barnaamijyada aad oggolaatay',
  },
};
