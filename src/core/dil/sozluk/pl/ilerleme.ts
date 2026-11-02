import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Postępy',
  kilma: {
    baslik: 'Odsetek modlitw',
    haftalik: 'Tydzień',
    aylik: 'Miesiąc',
    donemErisim: 'Okres odsetka modlitw',
    hesaplaniyor: 'Obliczanie odsetka modlitw',
    bosBaslik: 'Brak zapisów',
    bosAciklama: 'Pojawi się tutaj, gdy zaczniesz oznaczać modlitwy.',
    yuzde: '{n}%',
    kilinan: 'Odprawione',
    oran: 'Odsetek',
    enIyiGun: 'Najlepszy dzień',
    haftaHedefi: 'Cel na ten tydzień',
    hedefAlt: cogul({
      one: 'Według celu serii: {n} modlitwa dziennie',
      few: 'Według celu serii: {n} modlitwy dziennie',
      many: 'Według celu serii: {n} modlitw dziennie',
      other: 'Według celu serii: {n} modlitwy dziennie',
    }),
    kilinanNamaz: 'Odprawione modlitwy',
    hedefeUlasan: 'Dni z osiągniętym celem',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Dni z modlitwą',
    vakitVakit: 'Według modlitw',
    yuzdeErisim: '{ad}: {n} procent',
  },
  rozetler: {
    baslik: 'Poziom i odznaki',
    seviye: 'Poziom {n}',
    puan: 'Punkty',
    kalanErisim: cogul({
      one: '{n} punkt do poziomu {rank}',
      few: '{n} punkty do poziomu {rank}',
      many: '{n} punktów do poziomu {rank}',
      other: '{n} punktu do poziomu {rank}',
    }),
    enYuksek: 'To najwyższy poziom',
    kalan: cogul({ one: '{n} punkt do: {rank}', few: '{n} punkty do: {rank}', many: '{n} punktów do: {rank}', other: '{n} punktu do: {rank}' }),
    kilinanErisim: cogul({
      one: '{n} odprawiona modlitwa',
      few: '{n} odprawione modlitwy',
      many: '{n} odprawionych modlitw',
      other: '{n} odprawionej modlitwy',
    }),
    namaz: cogul({ one: 'modlitwa', few: 'modlitwy', many: 'modlitw', other: 'modlitwy' }),
    rozetErisim: 'Zdobyte odznaki: {n} z {toplam}',
    rozet: cogul({ one: 'odznaka', few: 'odznaki', many: 'odznak', other: 'odznaki' }),
  },
};
