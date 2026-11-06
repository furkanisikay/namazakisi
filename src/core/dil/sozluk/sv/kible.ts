import type { Sozluk } from '../tr';

/** Kıble "Qibla" (sv.wikipedia; meal "böneriktning" — açıklamalarda kullanılır). Pusula harfleri N Ö S V. */
export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Du är vänd mot Qibla',
    arkada: 'Qibla är bakom dig, vänd dig om',
    sagda: 'Qibla är {derece}° till höger om dig',
    solda: 'Qibla är {derece}° till vänster om dig',
  },
  harf: { kuzey: 'N', dogu: 'Ö', guney: 'S', bati: 'V' },
  sekme: {
    pusula: 'Kompass',
    pusulaErisim: 'Kompassläge',
    pusulaAciklama: 'När Kaba-märket når skåran upptill är du vänd mot Qibla.',
    kamera: 'Kamera',
    kameraErisim: 'Kameraläge',
    kameraAciklama: 'Håll telefonen upprätt; Kaba-märket visas i böneriktningen.',
  },
  sayfa: {
    baslatiliyor: 'Startar kompassen…',
    izinKapali: 'Platsbehörigheten är avstängd; din plats behövs för att hitta riktningen.',
  },
  hata: {
    izinGerekli: 'Platsbehörighet behövs för att hitta böneriktningen.',
    konumServisi: 'Platstjänsterna kan inte nås. Kontrollera enhetens platsinställningar.',
    baslatilamadi: 'Qibla-tjänsten kunde inte starta.',
  },
  pusula: {
    ufuk: 'horisont',
    konumAliniyor: 'Hämtar din plats…',
    hazirlaniyor: 'Förbereder kompassen…',
    kuzeydenAci: 'Qibla är {derece}° från norr',
    kabeUzakta: 'Kaba är {mesafe} bort',
    kuzeydenSaatYonu: 'Medurs från norr',
    kuzeyden: '{derece}° från norr',
    kabeUzaktaKuzeyden: 'Kaba är {mesafe} bort, {derece}° från norr',
    pusulaErisim: 'Qibla-kompass. {cumle}',
    pusulaYok: 'Den här enheten har ingen kompass; vi visar riktningen i förhållande till norr.',
    kayiyorsa: 'Om riktningen glider, rör telefonen i en åtta i luften.',
    kamerayla: 'Visa med kameran',
  },
  kamera: {
    pusulayiKullanin: 'Använd kompassen',
    kullanilamiyorBaslik: 'Kameravyn är inte tillgänglig på den här telefonen',
    kullanilamiyorMetin:
      'Telefonens sensorer ger ingen tillförlitlig riktning när den hålls upprätt. Kompassen visar ändå riktningen korrekt.',
    izinBaslik: 'Se Qibla med kameran',
    izinMetin:
      'Håll telefonen upprätt och se dig omkring; Kaba-märket visas i böneriktningen. Det kräver kamerabehörighet; bilden spelas inte in och lämnar aldrig telefonen.',
    kamerayiAcin: 'Slå på kameran',
    izinKapaliBaslik: 'Kamerabehörigheten är avstängd',
    izinKapaliMetin: 'Du kan tillåta kameraåtkomst i Inställningar för kameravyn. Kompassen fungerar utan den.',
    ayarlariAcin: 'Öppna Inställningar',
    acilamadiBaslik: 'Kameran kunde inte öppnas',
    acilamadiMetin: 'Kameran är inte tillgänglig just nu. Du kan hitta Qibla med kompassen.',
    hesaplaniyor: 'Hittar riktningen…',
    dikTutun: 'Håll telefonen upprätt',
  },
  kalibrasyon: {
    tesekkurErisim: 'Tack, riktningen är nu mer exakt',
    tesekkur: 'Tack, riktningen är nu mer exakt ✓',
    baslik: 'Kalibrera kompassen',
    sallayin: 'Rör telefonen i en åtta i luften.',
    metal: 'Gå bort från metallföremål och magnetiska fodral.',
    dogruluk: 'Noggrannhet',
    simdiDegil: 'Inte nu',
  },
};
