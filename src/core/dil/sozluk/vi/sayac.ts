import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Đếm ngược giờ Salah',
    kanalAciklama: 'Thông báo đếm ngược trước khi giờ Salah kết thúc',
    baslik: '⏱️ Salah {ad}',
    govde: 'Giờ {ad} sắp kết thúc.',
  },
  canli: {
    vakitGovde: 'Thời gian còn lại đến hết giờ {ad}',
    cumaBaslik: '🕌 Salah Jumu’ah',
    cumaGovde: 'Thời gian còn lại đến Zhuhr (bài khutbah)',
    nafileGovde: 'Thời gian còn lại đến hết giờ {ad}',
  },
  iftar: {
    kanal: 'Đếm ngược xả chay',
    kanalAciklama: 'Thông báo đếm ngược đến giờ xả chay (Iftar)',
    baslik: '🌙 Đếm ngược xả chay',
    govde: 'Đừng xả chay trước khi nghe Azan.',
    girdiBaslik: '🌙 Đã đến giờ xả chay',
    girdiGovde: 'Bữa Iftar an lành.',
    girdiUzun: 'Bữa Iftar an lành.\n\n⚠️ Đừng xả chay trước khi nghe Azan. Hãy nhớ đến chúng tôi trong lời cầu nguyện của bạn :)',
  },
  sahur: {
    kanal: 'Đếm ngược Suhur',
    kanalAciklama: 'Thông báo đếm ngược đến khi hết giờ Suhur (Fajr)',
    baslik: '🌙 Đếm ngược Suhur',
    govde: 'Bạn vẫn có thể ăn uống; sắp bắt đầu nhịn chay.',
    girdiBaslik: '🌙 Đã hết giờ Suhur',
    girdiGovde: 'Đã đến lúc định tâm (niyyah).',
    girdiUzun: 'Đã vào giờ Fajr; đừng quên định tâm (niyyah).\n\n⚠️ Bây giờ bạn có thể hành lễ Fajr. Hãy nhớ đến chúng tôi trong lời cầu nguyện của bạn :)',
  },
  seri: {
    kanal: 'Đếm ngược chuỗi ngày',
    kanalAciklama: 'Đếm ngược đến khi kết thúc ngày của chuỗi',
    baslik: '🔥 Chuỗi ngày của bạn đang gặp nguy',
    govde: 'Salah hôm nay chưa đủ; đừng để mất chuỗi ngày.',
    girdiBaslik: '🔥 Ngày của chuỗi đã kết thúc',
    girdiGovde: 'Một ngày mới đã bắt đầu.',
  },
};
