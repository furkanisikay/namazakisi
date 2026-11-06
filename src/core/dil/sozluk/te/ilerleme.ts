import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'పురోగతి',
  kilma: {
    baslik: 'నమాజ్ శాతం',
    haftalik: 'వారం',
    aylik: 'నెల',
    donemErisim: 'నమాజ్ శాతం వ్యవధి',
    hesaplaniyor: 'మీ నమాజ్ శాతం లెక్కిస్తోంది',
    bosBaslik: 'ఇంకా రికార్డులు లేవు',
    bosAciklama: 'మీరు నమాజ్‌లను గుర్తించిన కొద్దీ ఇక్కడ కనిపిస్తుంది.',
    yuzde: '{n}%',
    kilinan: 'ఆచరించినవి',
    oran: 'శాతం',
    enIyiGun: 'ఉత్తమ రోజు',
    haftaHedefi: 'ఈ వారం లక్ష్యం',
    hedefAlt: cogul({ one: 'మీ వరుస లక్ష్యం ఆధారంగా: రోజుకు {n} నమాజ్', other: 'మీ వరుస లక్ష్యం ఆధారంగా: రోజుకు {n} నమాజ్‌లు' }),
    kilinanNamaz: 'ఆచరించిన నమాజ్‌లు',
    hedefeUlasan: 'లక్ష్యం చేరిన రోజులు',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'నమాజ్ ఆచరించిన రోజులు',
    vakitVakit: 'నమాజ్ వారీగా',
    yuzdeErisim: '{ad}: {n} శాతం',
  },
  rozetler: {
    baslik: 'స్థాయి, బ్యాడ్జ్‌లు',
    seviye: 'స్థాయి {n}',
    puan: 'పాయింట్లు',
    kalanErisim: cogul({ one: '{rank} స్థాయికి {n} పాయింట్', other: '{rank} స్థాయికి {n} పాయింట్లు' }),
    enYuksek: 'మీరు అత్యున్నత స్థాయిలో ఉన్నారు',
    kalan: cogul({ one: '{rank} వరకు {n} పాయింట్', other: '{rank} వరకు {n} పాయింట్లు' }),
    kilinanErisim: cogul({ one: '{n} నమాజ్ ఆచరించబడింది', other: '{n} నమాజ్‌లు ఆచరించబడ్డాయి' }),
    namaz: cogul({ one: 'నమాజ్', other: 'నమాజ్‌లు' }),
    rozetErisim: '{toplam}లో {n} బ్యాడ్జ్‌లు పొందారు',
    rozet: cogul({ one: 'బ్యాడ్జ్', other: 'బ్యాడ్జ్‌లు' }),
  },
};
