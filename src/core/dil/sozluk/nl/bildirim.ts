import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Gebeden', kazayaEkle: 'Naar qada', inceleyin: 'Bekijken' },
  kanal: {
    genel: 'Algemene meldingen',
    muhafiz: 'Gebedswachter',
    muhafizAciklama: 'Herinneringen aan gebedstijden',
    acil: 'Dringende gebedsherinnering',
    acilAciklama: 'De gebedstijd loopt bijna af - dringende herinneringen',
    vakit: 'Gebedstijden',
    vakitAciklama: 'Herinneringen die worden verstuurd wanneer een gebedstijd begint',
    muhafizSes: 'Gebedswachter · {ses}',
    acilSes: 'Dringende herinnering · {ses}',
    acilSesAciklama: 'De gebedstijd loopt bijna af — dringende herinneringen',
    titresimli: '{kanal} · Met trillen',
    alarm: 'Gebedsalarm',
    alarmSes: 'Gebedsalarm · {ses}',
    uygulamaSesi: 'Geluid van de app',
    seciliSes: 'Door u gekozen geluid',
  },
  cuma: {
    baslik: "Djoemoe'a · {sure} · het gebed is nabij",
    govdeIlk: 'Nog {sure} tot Dhuhr. Maak u klaar en ga naar de moskee.',
    govde: 'Nog {sure} tot Dhuhr. Ga naar de moskee.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} min tot adhan · maak u klaar',
    hazirlanGovde: 'Maak u klaar om {ad} in de moskee te halen; vertrek over {sonra} min — adhan over {dk} min.',
    yolaCikBaslik: '{ad} · {dk} min tot adhan · ga naar de moskee',
    yolaCikGovde: 'Ga naar de moskee om {ad} te halen — adhan over {dk} min.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} afspraak in uw agenda', other: '{n} opeenvolgende afspraken in uw agenda' }),
    etkinlikBir: 'Een afspraak in uw agenda',
    sonAnIkindi: 'het laatste geschikte moment voor Asr is {saat} (daarna makruh)',
    sonAnVakit: 'de tijd van {kucuk} eindigt om {saat}',
    onceBaslik: '{ad} · afspraak om {saat} · bid eerst',
    onceGovde: '{etkinlik} duurt van {aralik}; {sonAn}. Bid {kucuk} voordat de afspraak begint.',
    kaplarBaslik: '{ad} · een afspraak overlapt de gebedstijd',
    kaplarGovde:
      '{etkinlik} duurt van {aralik} en overlapt de tijd van {kucuk} ({giris}–{son}). Plan nu al een korte pauze om {kucuk} te bidden.',
  },
  yatis: {
    yatsiBaslik: '{ad} · bid voor het slapengaan 🌙',
    yatsiGovde: 'De tijd van {ad} loopt nog; sta op voor het gebed voordat u in slaap valt.',
    ozet: 'Vandaag {kilinan}/5 · {liste} niet gemarkeerd',
    tekOto: 'Hebt u het gebeden, markeer het dan. {oto}',
    tekKaza: 'Hebt u het gebeden, markeer het dan; zo niet, voeg het toe aan uw inhaallogboek.',
    tekSuruyor: 'Hebt u het gebeden, markeer het dan. De gebedstijd loopt nog.',
    cokluOto: 'Open de app om de gebeden die u hebt verricht te bekijken en te markeren. {oto}',
    coklu: 'Open de app om de gebeden die u hebt verricht te bekijken en te markeren.',
    otoSor: 'Als u niet markeert, wordt u in het inhaallogboek naar deze dag gevraagd.',
    otoEkle: 'Als u niet markeert, worden ze aan de inhaalgebeden toegevoegd wanneer de gebedsdag eindigt.',
  },
  gunSonu: {
    baslik: 'Vandaag is niet compleet · reeks',
    govde: 'Als u de verrichte gebeden markeert voordat de dag eindigt, loopt uw reeks door.',
  },
};
