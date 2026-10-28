import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Përparimi',
  kilma: {
    baslik: 'Shkalla e faljes',
    haftalik: 'Javore',
    aylik: 'Mujore',
    donemErisim: 'Periudha e shkallës së faljes',
    hesaplaniyor: 'Shkalla juaj e faljes po llogaritet',
    bosBaslik: 'Ende pa regjistrime',
    bosAciklama: 'Shfaqet këtu ndërsa shënoni namazet tuaja.',
    yuzde: '{n}%',
    kilinan: 'Të falura',
    oran: 'Shkalla',
    enIyiGun: 'Dita më e mirë',
    haftaHedefi: 'Synimi i kësaj jave',
    hedefAlt: cogul({ one: 'Sipas synimit të serisë: {n} namaz në ditë', other: 'Sipas synimit të serisë: {n} namaze në ditë' }),
    kilinanNamaz: 'Namaze të falura',
    hedefeUlasan: 'Ditë në synim',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Ditë me namaz',
    vakitVakit: 'Sipas vakteve',
    yuzdeErisim: '{ad}: {n} përqind',
  },
  rozetler: {
    baslik: 'Niveli dhe distinktivët',
    seviye: 'Niveli {n}',
    puan: 'Pikë',
    kalanErisim: cogul({ one: '{n} pikë deri te niveli {rank}', other: '{n} pikë deri te niveli {rank}' }),
    enYuksek: 'Jeni në nivelin më të lartë',
    kalan: cogul({ one: '{n} pikë deri te {rank}', other: '{n} pikë deri te {rank}' }),
    kilinanErisim: cogul({ one: '{n} namaz i falur', other: '{n} namaze të falura' }),
    namaz: cogul({ one: 'namaz', other: 'namaze' }),
    rozetErisim: '{n} nga {toplam} distinktivë të fituar',
    rozet: cogul({ one: 'distinktiv', other: 'distinktivë' }),
  },
};
