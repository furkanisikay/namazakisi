import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Ìtẹ̀síwájú',
  kilma: {
    baslik: 'Ìwọ̀n ìrun kíkí',
    haftalik: 'Ọ̀sọ̀ọ̀sẹ̀',
    aylik: 'Oṣooṣù',
    donemErisim: 'Sáà ìwọ̀n ìrun kíkí',
    hesaplaniyor: 'À ń ṣírò ìwọ̀n ìrun kíkí yín',
    bosBaslik: 'Kò sí àkọsílẹ̀ kankan síbẹ̀',
    bosAciklama: 'Yóò hàn níbí bí ẹ ṣe ń sàmì sí àwọn ìrun yín.',
    yuzde: '{n}%',
    kilinan: 'Tí a kí',
    oran: 'Ìwọ̀n',
    enIyiGun: 'Ọjọ́ tó dára jùlọ',
    haftaHedefi: 'Àfojúsùn ọ̀sẹ̀ yìí',
    hedefAlt: cogul({ other: 'Gẹ́gẹ́ bí àfojúsùn ìtẹ̀léra yín: ìrun {n} lójúmọ́' }),
    kilinanNamaz: 'Àwọn ìrun tí a kí',
    hedefeUlasan: 'Ọjọ́ tí àfojúsùn tẹ̀ wá lọ́wọ́',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Ọjọ́ tí a kírun',
    vakitVakit: 'Ní ìrun kọ̀ọ̀kan',
    yuzdeErisim: '{ad}: ìdá {n} nínú ọgọ́rùn-ún',
  },
  rozetler: {
    baslik: 'Ìpele àti àmì-ẹ̀yẹ',
    seviye: 'Ìpele {n}',
    puan: 'Máàkì',
    kalanErisim: cogul({ other: 'Máàkì {n} ló kù sí ìpele {rank}' }),
    enYuksek: 'Ẹ ti dé ìpele tó ga jùlọ',
    kalan: cogul({ other: 'Máàkì {n} sí {rank}' }),
    kilinanErisim: cogul({ other: 'Ìrun {n} tí a kí' }),
    namaz: cogul({ other: 'ìrun' }),
    rozetErisim: 'A ti gba àmì-ẹ̀yẹ {n} nínú {toplam}',
    rozet: cogul({ other: 'àmì-ẹ̀yẹ' }),
  },
};
