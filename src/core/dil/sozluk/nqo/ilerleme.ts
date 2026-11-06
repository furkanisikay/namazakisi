import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'ߢߍߕߊ',
  kilma: {
    baslik: 'ߛߊߟߌ ߞߍ߫ ߤߊߞߍ',
    haftalik: 'ߞߎ߲߬ߢߐ߮ ߏ߬ ߞߎ߲߬ߢߐ߮',
    aylik: 'ߞߊߙߏ ߏ߬ ߞߊߙߏ',
    donemErisim: 'ߛߊߟߌ ߞߍ߫ ߤߊߞߍ ߥߊ߯ߕߌ߫',
    hesaplaniyor: 'ߊߟߎ߫ ߟߊ߫ ߛߊߟߌ ߞߍ߫ ߤߊߞߍ ߖߊ߬ߕߋ߬ ߓߍ߫ ߓߐ߫',
    bosBaslik: 'ߛߓߍߟߌ ߛߌ߫ ߕߍ߫ ߦߋ߲߬ ߝߟߐ',
    bosAciklama: 'ߊ߬ ߓߍ߫ ߓߐ߫ ߦߊ߲߬ ߣߌ߫ ߊߟߎ߫ ߦߋ߫ ߊߟߎ߫ ߟߊ߫ ߛߊߟߌ ߟߎ߬ ߛߓߍ߫.',
    yuzde: '{n}%',
    kilinan: 'ߞߍߣߍ߲',
    oran: 'ߤߊߞߍ',
    enIyiGun: 'ߟߏ߲ ߢߎߡߊ߲ߓߊ',
    haftaHedefi: 'ߞߎ߲߬ߢߐ߮ ߣߌ߲߬ ߟߊߢߌߣߌ',
    hedefAlt: cogul({ other: 'ߞߊ߬ ߞߍߢߍ ߣߌ߫ ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߟߊߢߌߣߌ ߦߋ߫: ߛߊߟߌ {n} ߟߏ߲ ߏ߬ ߟߏ߲' }),
    kilinanNamaz: 'ߛߊߟߌ ߞߍߣߍ߲ ߟߎ߬',
    hedefeUlasan: 'ߟߏ߲ ߡߌ߲ߠߎ ߛߋߙߊ ߟߊߢߌߣߌ ߡߊ߬',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'ߛߊߟߌ ߞߍ߫ ߟߏ߲ ߟߎ߬',
    vakitVakit: 'ߥߊ߯ߕߌ߫ ߏ߬ ߥߊ߯ߕߌ߫',
    yuzdeErisim: '{ad}: ߞߍߡߍ ߟߊ߫ {n}',
  },
  rozetler: {
    baslik: 'ߘߊߞߎ߲ ߣߌ߫ ߕߊ߯ߡߊߛߌߦߍ߲ ߟߎ߬',
    seviye: 'ߘߊߞߎ߲ {n}',
    puan: 'ߖߊ߬ߕߋ߬',
    kalanErisim: cogul({ other: 'ߖߊ߬ߕߋ߬ {n} ߞߊ߬ ߛߋ߫ ߘߊߞߎ߲ {rank} ߡߊ߬' }),
    enYuksek: 'ߊߟߎ߫ ߓߍ߫ ߘߊߞߎ߲ ߛߊ߲ߝߍߟߊߓߊ ߟߊ߫',
    kalan: cogul({ other: 'ߖߊ߬ߕߋ߬ {n} ߞߊ߬ ߛߋ߫ {rank} ߡߊ߬' }),
    kilinanErisim: cogul({ other: 'ߛߊߟߌ {n} ߞߍߣߍ߲' }),
    namaz: cogul({ other: 'ߛߊߟߌ' }),
    rozetErisim: 'ߕߊ߯ߡߊߛߌߦߍ߲ {n} ߛߐ߬ߘߐ߬ߣߍ߲ {toplam} ߟߊ߫',
    rozet: cogul({ other: 'ߕߊ߯ߡߊߛߌߦߍ߲' }),
  },
};
