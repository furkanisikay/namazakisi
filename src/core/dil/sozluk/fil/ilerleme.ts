import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Pag-unlad',
  kilma: {
    baslik: 'Antas ng pagdarasal',
    haftalik: 'Lingguhan',
    aylik: 'Buwanan',
    donemErisim: 'Panahon ng antas ng pagdarasal',
    hesaplaniyor: 'Kinakalkula ang antas ng inyong pagdarasal',
    bosBaslik: 'Wala pang tala',
    bosAciklama: 'Lalabas dito habang minamarkahan ninyo ang inyong mga dasal.',
    yuzde: '{n}%',
    kilinan: 'Naidasal',
    oran: 'Antas',
    enIyiGun: 'Pinakamahusay na araw',
    haftaHedefi: 'Layunin ngayong linggo',
    hedefAlt: cogul({ one: 'Batay sa layunin ng sunod-sunod: {n} dasal bawat araw', other: 'Batay sa layunin ng sunod-sunod: {n} dasal bawat araw' }),
    kilinanNamaz: 'Mga naidasal',
    hedefeUlasan: 'Mga araw na naabot ang layunin',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Mga araw na may dasal',
    vakitVakit: 'Ayon sa dasal',
    yuzdeErisim: '{ad}: {n} porsiyento',
  },
  rozetler: {
    baslik: 'Antas at mga badge',
    seviye: 'Antas {n}',
    puan: 'Mga puntos',
    kalanErisim: cogul({ one: '{n} puntos pa bago ang antas na {rank}', other: '{n} puntos pa bago ang antas na {rank}' }),
    enYuksek: 'Nasa pinakamataas na antas na kayo',
    kalan: cogul({ one: '{n} puntos pa bago ang {rank}', other: '{n} puntos pa bago ang {rank}' }),
    kilinanErisim: cogul({ one: '{n} dasal ang naidasal', other: '{n} dasal ang naidasal' }),
    namaz: cogul({ one: 'dasal', other: 'dasal' }),
    rozetErisim: '{n} sa {toplam} badge ang nakuha',
    rozet: cogul({ one: 'badge', other: 'badge' }),
  },
};
