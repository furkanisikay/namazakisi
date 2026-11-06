import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ પઢી લીધી', kazayaEkle: 'કઝામાં ઉમેરો', inceleyin: 'જુઓ' },
  kanal: {
    genel: 'સામાન્ય નોટિફિકેશન',
    muhafiz: 'નમાઝ મુહાફિઝ',
    muhafizAciklama: 'નમાઝના સમયનાં રિમાઇન્ડર',
    acil: 'તાકીદનું નમાઝ રિમાઇન્ડર',
    acilAciklama: 'નમાઝનો સમય પૂરો થવાનો છે - તાકીદનાં રિમાઇન્ડર',
    vakit: 'નમાઝના સમય',
    vakitAciklama: 'નમાઝનો સમય શરૂ થાય ત્યારે મોકલાતાં રિમાઇન્ડર',
    muhafizSes: 'નમાઝ મુહાફિઝ · {ses}',
    acilSes: 'તાકીદનું રિમાઇન્ડર · {ses}',
    acilSesAciklama: 'નમાઝનો સમય પૂરો થવાનો છે — તાકીદનાં રિમાઇન્ડર',
    titresimli: '{kanal} · વાઇબ્રેશન સાથે',
    alarm: 'નમાઝ અલાર્મ',
    alarmSes: 'નમાઝ અલાર્મ · {ses}',
    uygulamaSesi: 'ઍપનો અવાજ',
    seciliSes: 'તમે પસંદ કરેલો અવાજ',
  },
  cuma: {
    baslik: 'જુમ્મા · {sure} બાકી · નમાઝ નજીક છે',
    govdeIlk: 'ઝોહર સુધી {sure} બાકી છે. તૈયાર થાઓ અને મસ્જિદ તરફ જાઓ.',
    govde: 'ઝોહર સુધી {sure} બાકી છે. મસ્જિદ તરફ જાઓ.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · અઝાનમાં {dk} મિ · મસ્જિદ માટે તૈયાર થાઓ',
    hazirlanGovde: 'મસ્જિદમાં {ad}ની જમાઅત પકડવા તૈયાર થાઓ; {sonra} મિનિટમાં નીકળો — અઝાન {dk} મિનિટમાં.',
    yolaCikBaslik: '{ad} · અઝાનમાં {dk} મિ · મસ્જિદ તરફ નીકળો',
    yolaCikGovde: 'મસ્જિદમાં {ad}ની જમાઅત પકડવા નીકળો — અઝાન {dk} મિનિટમાં.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'તમારા કૅલેન્ડરની {n} ઇવેન્ટ', other: 'તમારા કૅલેન્ડરની {n} સળંગ ઇવેન્ટ' }),
    etkinlikBir: 'તમારા કૅલેન્ડરની એક ઇવેન્ટ',
    sonAnIkindi: 'અસર માટેનો છેલ્લો યોગ્ય સમય {saat} છે (પછી મકરૂહ)',
    sonAnVakit: '{kucuk}નો સમય {saat} વાગ્યે પૂરો થાય છે',
    onceBaslik: '{ad} · {saat} વાગ્યે ઇવેન્ટ · પહેલાં નમાઝ પઢો',
    onceGovde: '{etkinlik} {aralik} ચાલે છે; {sonAn}. ઇવેન્ટ શરૂ થાય તે પહેલાં {kucuk} પઢો.',
    kaplarBaslik: '{ad} · એક ઇવેન્ટ નમાઝના સમયને ઢાંકે છે',
    kaplarGovde:
      '{etkinlik} {aralik} ચાલે છે અને {kucuk}નો સમય ({giris}–{son}) ઢાંકે છે. થોડો વિરામ લઈને {kucuk} પઢવાનું અત્યારે જ ગોઠવો.',
  },
  yatis: {
    yatsiBaslik: '{ad} · સૂતાં પહેલાં પઢો 🌙',
    yatsiGovde: '{ad}નો સમય હજુ ચાલુ છે; ઊંઘ આવે તે પહેલાં નમાઝ માટે ઊભા થાઓ.',
    ozet: 'આજે {kilinan}/5 · {liste} નોંધાઈ નથી',
    tekOto: 'જો પઢી હોય, તો નોંધો. {oto}',
    tekKaza: 'જો પઢી હોય, તો નોંધો; ન પઢી શક્યા હો, તો તેને કઝા નોંધપોથીમાં ઉમેરો.',
    tekSuruyor: 'જો પઢી હોય, તો નોંધો. નમાઝનો સમય હજુ ચાલુ છે.',
    cokluOto: 'ઍપ ખોલીને પઢેલી નમાઝો જુઓ અને નોંધો. {oto}',
    coklu: 'ઍપ ખોલીને પઢેલી નમાઝો જુઓ અને નોંધો.',
    otoSor: 'જો તમે ન નોંધો, તો કઝા નોંધપોથીમાં આ દિવસ વિશે તમને પૂછવામાં આવશે.',
    otoEkle: 'જો તમે ન નોંધો, તો નમાઝનો દિવસ પૂરો થતાં તે કઝામાં ઉમેરાશે.',
  },
  gunSonu: {
    baslik: 'આજનો દિવસ અધૂરો છે · સિલસિલો',
    govde: 'દિવસ પૂરો થાય તે પહેલાં પઢેલી નમાઝો નોંધશો, તો તમારો સિલસિલો ચાલુ રહેશે.',
  },
};
