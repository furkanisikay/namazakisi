import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Pag-uswag',
  kilma: {
    baslik: 'Porsiyento sa Salah',
    haftalik: 'Sinemana',
    aylik: 'Binulan',
    donemErisim: 'Panahon sa porsiyento sa Salah',
    hesaplaniyor: 'Gikuwenta ang inyong porsiyento sa Salah',
    bosBaslik: 'Wala pay rekord',
    bosAciklama: 'Makita dinhi samtang markahan ninyo ang inyong mga Salah.',
    yuzde: '{n}%',
    kilinan: 'Nahimo',
    oran: 'Porsiyento',
    enIyiGun: 'Labing maayong adlaw',
    haftaHedefi: 'Tumong karong semanaha',
    hedefAlt: cogul({ one: 'Sumala sa tumong sa sunod-sunod: {n} ka Salah kada adlaw', other: 'Sumala sa tumong sa sunod-sunod: {n} ka Salah kada adlaw' }),
    kilinanNamaz: 'Nahimo nga Salah',
    hedefeUlasan: 'Mga adlaw nga naabot ang tumong',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Mga adlaw nga adunay Salah',
    vakitVakit: 'Matag Salah',
    yuzdeErisim: '{ad}: {n} porsiyento',
  },
  rozetler: {
    baslik: 'Lebel ug mga badge',
    seviye: 'Lebel {n}',
    puan: 'Puntos',
    kalanErisim: cogul({ one: '{n} ka puntos pa ngadto sa lebel nga {rank}', other: '{n} ka puntos pa ngadto sa lebel nga {rank}' }),
    enYuksek: 'Anaa na kamo sa labing taas nga lebel',
    kalan: cogul({ one: '{n} ka puntos pa ngadto sa {rank}', other: '{n} ka puntos pa ngadto sa {rank}' }),
    kilinanErisim: cogul({ one: '{n} ka Salah ang nahimo', other: '{n} ka Salah ang nahimo' }),
    namaz: cogul({ one: 'Salah', other: 'Salah' }),
    rozetErisim: '{n} sa {toplam} ka badge ang naangkon',
    rozet: cogul({ one: 'badge', other: 'badge' }),
  },
};
