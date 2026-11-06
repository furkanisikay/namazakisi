import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'പുരോഗതി',
  kilma: {
    baslik: 'നമസ്കാര നിരക്ക്',
    haftalik: 'ആഴ്ചതോറും',
    aylik: 'മാസംതോറും',
    donemErisim: 'നമസ്കാര നിരക്കിന്റെ കാലയളവ്',
    hesaplaniyor: 'നിങ്ങളുടെ നമസ്കാര നിരക്ക് കണക്കാക്കുന്നു',
    bosBaslik: 'ഇതുവരെ രേഖകളില്ല',
    bosAciklama: 'നമസ്കാരങ്ങൾ അടയാളപ്പെടുത്തുന്നതനുസരിച്ച് ഇവിടെ കാണാം.',
    yuzde: '{n}%',
    kilinan: 'നമസ്കരിച്ചത്',
    oran: 'നിരക്ക്',
    enIyiGun: 'മികച്ച ദിവസം',
    haftaHedefi: 'ഈ ആഴ്ചയിലെ ലക്ഷ്യം',
    hedefAlt: cogul({
      one: 'നിങ്ങളുടെ തുടർച്ചാ ലക്ഷ്യം അടിസ്ഥാനമാക്കി: ദിവസം {n} നമസ്കാരം',
      other: 'നിങ്ങളുടെ തുടർച്ചാ ലക്ഷ്യം അടിസ്ഥാനമാക്കി: ദിവസം {n} നമസ്കാരങ്ങൾ',
    }),
    kilinanNamaz: 'നമസ്കരിച്ചവ',
    hedefeUlasan: 'ലക്ഷ്യം നേടിയ ദിവസങ്ങൾ',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'നമസ്കരിച്ച ദിവസങ്ങൾ',
    vakitVakit: 'നമസ്കാരം തിരിച്ച്',
    yuzdeErisim: '{ad}: {n} ശതമാനം',
  },
  rozetler: {
    baslik: 'നിലയും ബാഡ്ജുകളും',
    seviye: 'നില {n}',
    puan: 'പോയിന്റുകൾ',
    kalanErisim: cogul({ one: '{rank} നിലയിലേക്ക് {n} പോയിന്റ്', other: '{rank} നിലയിലേക്ക് {n} പോയിന്റുകൾ' }),
    enYuksek: 'നിങ്ങൾ ഏറ്റവും ഉയർന്ന നിലയിലാണ്',
    kalan: cogul({ one: '{rank}-ലേക്ക് {n} പോയിന്റ്', other: '{rank}-ലേക്ക് {n} പോയിന്റുകൾ' }),
    kilinanErisim: cogul({ one: '{n} നമസ്കാരം നിർവഹിച്ചു', other: '{n} നമസ്കാരങ്ങൾ നിർവഹിച്ചു' }),
    namaz: cogul({ one: 'നമസ്കാരം', other: 'നമസ്കാരങ്ങൾ' }),
    rozetErisim: '{toplam} ബാഡ്ജുകളിൽ {n} എണ്ണം നേടി',
    rozet: cogul({ one: 'ബാഡ്ജ്', other: 'ബാഡ്ജുകൾ' }),
  },
};
