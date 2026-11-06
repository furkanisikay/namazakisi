import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile adları harf çevirisi (IslamHouse Vietnamca "Salah tự nguyện", meal 17:79 "Tahajjud"). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Bắt đầu khoảng 45 phút sau khi mặt trời mọc và kéo dài đến 10 phút trước Zhuhr. Ishraq là thời điểm sớm nhất; tốt nhất là sau khi đã qua một phần tư ngày.',
    evvabin: 'Hành lễ sau Maghrib, cho đến giờ ‘Isha’.',
    teheccud: 'Hành lễ sau khi đã ngủ và thức dậy sau ‘Isha’, cho đến giờ Fajr. Thời điểm tốt nhất là một phần ba cuối đêm.',
  },
  bilgiBugun: '{aciklama}\n\nHôm nay: {bas} – {son}',
  enFaziletli: ' · tốt nhất sau {saat}',
  sonUcteBir: ' · một phần ba cuối {saat}',
  durumAktif: 'Đã vào giờ · kết thúc {saat}',
  durumNafile: 'Tự nguyện · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Giờ Duha',
    kuslukSuruyor: 'Đang trong giờ Duha; bạn có thể hành lễ đến {son}.',
    kuslukGirdi: 'Đã vào giờ Duha. Thời điểm tốt cho hai rak’at; kéo dài đến {son}.',
    kuslukBitiyor: cogul({
      other: 'Giờ Duha còn {n} phút. Thời điểm tốt cho hai rak’at; kéo dài đến {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Vẫn còn thời gian cho Awwabin. ‘Isha’ bắt đầu lúc {son}.',
    evvabinGirdi: 'Sau Maghrib, thời điểm tốt cho Awwabin. ‘Isha’ bắt đầu lúc {son}.',
    evvabinKalan: cogul({ other: 'Còn {n} phút cho Awwabin. ‘Isha’ bắt đầu lúc {son}.' }),
    teheccudBaslik: 'Giờ Tahajjud',
    uyandirSonUcte: 'Hãy thức dậy; một phần ba cuối đêm đã bắt đầu. Fajr bắt đầu lúc {son}.',
    uyandirKalan: cogul({ other: 'Hãy thức dậy; còn {n} phút đến Fajr. Fajr bắt đầu lúc {son}.' }),
    sonUcteBaslik: 'Một phần ba cuối đêm',
    sonUcteGovde: 'Những giờ phúc lành nhất cho Tahajjud. Fajr bắt đầu lúc {son}.',
    teheccudKalan: cogul({ other: 'Còn {n} phút đến Fajr. Thời điểm tốt cho Tahajjud.' }),
  },
  uyandirmaKanali: 'Đánh thức Tahajjud',
  uyandirmaKanaliAciklama: 'Đánh thức bạn cho Salah ban đêm; đổ chuông cả khi ở chế độ im lặng',
};
