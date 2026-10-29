import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'İrəliləyiş',
  kilma: {
    baslik: 'Qılma nisbəti',
    haftalik: 'Həftəlik',
    aylik: 'Aylıq',
    donemErisim: 'Qılma nisbətinin dövrü',
    hesaplaniyor: 'Qılma nisbətiniz hesablanır',
    bosBaslik: 'Hələ qeyd yoxdur',
    bosAciklama: 'Namazlarınızı qeyd etdikcə burada görünəcək.',
    /** CLDR (az): "12%". */
    yuzde: '{n}%',
    kilinan: 'Qılınan',
    oran: 'Nisbət',
    enIyiGun: 'Ən yaxşı gün',
    haftaHedefi: 'Bu həftənin hədəfi',
    hedefAlt: cogul({ one: 'Seriya hədəfinizə görə: gündə {n} vaxt', other: 'Seriya hədəfinizə görə: gündə {n} vaxt' }),
    kilinanNamaz: 'Qılınan namaz',
    hedefeUlasan: 'Hədəfə çatılan gün',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Namaz qılınan gün',
    vakitVakit: 'Vaxtlar üzrə',
    yuzdeErisim: '{ad}: {n} faiz',
  },
  rozetler: {
    baslik: 'Səviyyə və nişanlar',
    seviye: 'Səviyyə {n}',
    puan: 'Xal',
    kalanErisim: cogul({ one: '{rank} səviyyəsinə {n} xal qalıb', other: '{rank} səviyyəsinə {n} xal qalıb' }),
    enYuksek: 'Ən yüksək səviyyədəsiniz',
    kalan: cogul({ one: '{rank} üçün {n} xal qalıb', other: '{rank} üçün {n} xal qalıb' }),
    kilinanErisim: cogul({ one: '{n} namaz qılındı', other: '{n} namaz qılındı' }),
    namaz: cogul({ one: 'namaz', other: 'namaz' }),
    rozetErisim: '{toplam} nişandan {n} qazanıldı',
    rozet: cogul({ one: 'nişan', other: 'nişan' }),
  },
};
