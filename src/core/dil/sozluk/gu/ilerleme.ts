import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'પ્રગતિ',
  kilma: {
    baslik: 'નમાઝનો દર',
    haftalik: 'સાપ્તાહિક',
    aylik: 'માસિક',
    donemErisim: 'નમાઝના દરનો સમયગાળો',
    hesaplaniyor: 'તમારો નમાઝનો દર ગણાય છે',
    bosBaslik: 'હજુ કોઈ નોંધ નથી',
    bosAciklama: 'તમે નમાઝો નોંધશો તેમ અહીં દેખાશે.',
    yuzde: '{n}%',
    kilinan: 'પઢેલી',
    oran: 'દર',
    enIyiGun: 'શ્રેષ્ઠ દિવસ',
    haftaHedefi: 'આ અઠવાડિયાનું લક્ષ્ય',
    hedefAlt: cogul({ one: 'તમારા સિલસિલાના લક્ષ્ય મુજબ: દિવસની {n} નમાઝ', other: 'તમારા સિલસિલાના લક્ષ્ય મુજબ: દિવસની {n} નમાઝ' }),
    kilinanNamaz: 'પઢેલી નમાઝો',
    hedefeUlasan: 'લક્ષ્ય પૂરું થયું હોય તેવા દિવસ',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'નમાઝ પઢી હોય તેવા દિવસ',
    vakitVakit: 'દરેક નમાઝ મુજબ',
    yuzdeErisim: '{ad}: {n} ટકા',
  },
  rozetler: {
    baslik: 'સ્તર અને બેજ',
    seviye: 'સ્તર {n}',
    puan: 'પોઇન્ટ',
    kalanErisim: cogul({ one: '{rank} સ્તર સુધી {n} પોઇન્ટ બાકી', other: '{rank} સ્તર સુધી {n} પોઇન્ટ બાકી' }),
    enYuksek: 'તમે સૌથી ઊંચા સ્તરે છો',
    kalan: cogul({ one: '{rank} સુધી {n} પોઇન્ટ', other: '{rank} સુધી {n} પોઇન્ટ' }),
    kilinanErisim: cogul({ one: '{n} નમાઝ પઢી', other: '{n} નમાઝો પઢી' }),
    namaz: cogul({ one: 'નમાઝ', other: 'નમાઝો' }),
    rozetErisim: '{toplam}માંથી {n} બેજ મેળવ્યા',
    rozet: cogul({ one: 'બેજ', other: 'બેજ' }),
  },
};
