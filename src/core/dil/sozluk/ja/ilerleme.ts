import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: '進捗',
  kilma: {
    baslik: '礼拝率',
    haftalik: '週間',
    aylik: '月間',
    donemErisim: '礼拝率の期間',
    hesaplaniyor: '礼拝率を計算中',
    bosBaslik: 'まだ記録がありません',
    bosAciklama: '礼拝を記録すると、ここに表示されます。',
    yuzde: '{n}%',
    kilinan: '礼拝済み',
    oran: '割合',
    enIyiGun: '最も良かった日',
    haftaHedefi: '今週の目標',
    hedefAlt: cogul({ other: '連続記録の目標に基づく：1日{n}回の礼拝' }),
    kilinanNamaz: '礼拝した回数',
    hedefeUlasan: '目標を達成した日',
    ayYil: '{yil}年{ay}',
    namazKilinanGun: '礼拝した日',
    vakitVakit: '礼拝ごと',
    yuzdeErisim: '{ad}：{n}パーセント',
  },
  rozetler: {
    baslik: 'レベルとバッジ',
    seviye: 'レベル{n}',
    puan: 'ポイント',
    kalanErisim: cogul({ other: '{rank}レベルまであと{n}ポイント' }),
    enYuksek: '最高レベルに到達しています',
    kalan: cogul({ other: '{rank}まであと{n}ポイント' }),
    kilinanErisim: cogul({ other: '{n}回礼拝しました' }),
    namaz: cogul({ other: '回の礼拝' }),
    rozetErisim: '{toplam}個中{n}個のバッジを獲得',
    rozet: cogul({ other: '個のバッジ' }),
  },
};
