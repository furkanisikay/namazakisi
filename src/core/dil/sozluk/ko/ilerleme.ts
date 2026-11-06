import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: '진행 상황',
  kilma: {
    baslik: '예배 비율',
    haftalik: '주간',
    aylik: '월간',
    donemErisim: '예배 비율 기간',
    hesaplaniyor: '예배 비율 계산 중',
    bosBaslik: '아직 기록이 없습니다',
    bosAciklama: '예배를 표시하면 여기에 나타납니다.',
    yuzde: '{n}%',
    kilinan: '드린 예배',
    oran: '비율',
    enIyiGun: '가장 좋은 날',
    haftaHedefi: '이번 주 목표',
    hedefAlt: cogul({ other: '연속 기록 목표 기준: 하루 {n}번 예배' }),
    kilinanNamaz: '드린 예배',
    hedefeUlasan: '목표 달성일',
    ayYil: '{yil}년 {ay}',
    namazKilinanGun: '예배를 드린 날',
    vakitVakit: '예배별',
    yuzdeErisim: '{ad}: {n}퍼센트',
  },
  rozetler: {
    baslik: '레벨과 배지',
    seviye: '레벨 {n}',
    puan: '점수',
    kalanErisim: cogul({ other: '{rank} 레벨까지 {n}점' }),
    enYuksek: '최고 레벨입니다',
    kalan: cogul({ other: '{rank}까지 {n}점' }),
    kilinanErisim: cogul({ other: '예배 {n}번 드림' }),
    namaz: cogul({ other: '예배' }),
    rozetErisim: '배지 {toplam}개 중 {n}개 획득',
    rozet: cogul({ other: '배지' }),
  },
};
