import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Tiến độ',
  kilma: {
    baslik: 'Tỷ lệ hành lễ',
    haftalik: 'Hằng tuần',
    aylik: 'Hằng tháng',
    donemErisim: 'Kỳ tính tỷ lệ hành lễ',
    hesaplaniyor: 'Đang tính tỷ lệ hành lễ của bạn',
    bosBaslik: 'Chưa có dữ liệu',
    bosAciklama: 'Sẽ hiện ở đây khi bạn đánh dấu các lần Salah.',
    yuzde: '{n}%',
    kilinan: 'Đã hành lễ',
    oran: 'Tỷ lệ',
    enIyiGun: 'Ngày tốt nhất',
    haftaHedefi: 'Mục tiêu tuần này',
    hedefAlt: cogul({ other: 'Theo mục tiêu chuỗi ngày: {n} lần Salah mỗi ngày' }),
    kilinanNamaz: 'Số lần đã hành lễ',
    hedefeUlasan: 'Ngày đạt mục tiêu',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Ngày có hành lễ',
    vakitVakit: 'Theo từng giờ Salah',
    yuzdeErisim: '{ad}: {n} phần trăm',
  },
  rozetler: {
    baslik: 'Cấp độ và huy hiệu',
    seviye: 'Cấp {n}',
    puan: 'Điểm',
    kalanErisim: cogul({ other: 'Còn {n} điểm nữa để đạt cấp {rank}' }),
    enYuksek: 'Bạn đang ở cấp cao nhất',
    kalan: cogul({ other: 'Còn {n} điểm đến {rank}' }),
    kilinanErisim: cogul({ other: 'Đã hành lễ {n} lần' }),
    namaz: cogul({ other: 'lần Salah' }),
    rozetErisim: 'Đã đạt {n} trên {toplam} huy hiệu',
    rozet: cogul({ other: 'huy hiệu' }),
  },
};
