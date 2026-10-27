import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Progrès',
  kilma: {
    baslik: 'Taux de prière',
    haftalik: 'Semaine',
    aylik: 'Mois',
    donemErisim: 'Période du taux de prière',
    hesaplaniyor: 'Calcul de votre taux de prière',
    bosBaslik: 'Aucun enregistrement',
    bosAciklama: 'S’affiche ici à mesure que vous marquez vos prières.',
    yuzde: '{n} %',
    kilinan: 'Accomplies',
    oran: 'Taux',
    enIyiGun: 'Meilleur jour',
    haftaHedefi: 'Objectif de la semaine',
    hedefAlt: cogul({
      one: 'Selon votre objectif de série : {n} prière par jour',
      many: 'Selon votre objectif de série : {n} de prières par jour',
      other: 'Selon votre objectif de série : {n} prières par jour',
    }),
    kilinanNamaz: 'Prières accomplies',
    hedefeUlasan: 'Jours à l’objectif',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Jours avec prière',
    vakitVakit: 'Par prière',
    yuzdeErisim: '{ad} : {n} pour cent',
  },
  rozetler: {
    baslik: 'Niveau et badges',
    seviye: 'Niveau {n}',
    puan: 'Points',
    kalanErisim: cogul({
      one: '{n} point avant le niveau {rank}',
      many: '{n} de points avant le niveau {rank}',
      other: '{n} points avant le niveau {rank}',
    }),
    enYuksek: 'Vous êtes au niveau le plus élevé',
    kalan: cogul({ one: '{n} point avant {rank}', many: '{n} de points avant {rank}', other: '{n} points avant {rank}' }),
    kilinanErisim: cogul({ one: '{n} prière accomplie', many: '{n} de prières accomplies', other: '{n} prières accomplies' }),
    namaz: cogul({ one: 'prière', many: 'de prières', other: 'prières' }),
    rozetErisim: '{n} badges obtenus sur {toplam}',
    rozet: cogul({ one: 'badge', many: 'de badges', other: 'badges' }),
  },
};
