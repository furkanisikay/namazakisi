import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: doğrudan, kısa "Hãy …"; secde yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'còn lại', girisindenItibaren: 'đã qua' },
  cip: { vakit: 'Tên giờ Salah', sure: 'Số phút', yon: 'còn lại / đã qua', cuma: 'Jumu’ah', yatsi: '‘Isha’' },
  sablon: {
    muhafizCikis: [
      'Giờ {vakit} sắp kết thúc, còn {süre} phút.',
      'Đừng để lỡ {vakit}, còn {süre} phút.',
      'Thời gian đang ngắn lại, còn {süre} phút nữa là hết giờ {vakit}.',
    ],
    muhafizGiris: [
      'Đã vào giờ {vakit}, đã qua {süre} phút.',
      'Đừng trì hoãn {vakit}, đã qua {süre} phút.',
      'Thời gian đang trôi, hãy hành lễ {vakit}, đã {süre} phút rồi.',
    ],
    nafile: [
      'Giờ {vakit}, {süre} phút {yön}. Thời điểm tốt cho hai rak’at.',
      'Đang trong giờ {vakit}. Cơ hội tốt để hành lễ hai rak’at.',
      '{vakit}, {süre} phút {yön}.',
    ],
    cuma: [
      'Còn {süre} phút nữa đến Jumu’ah. Hãy chuẩn bị và đến Masjid.',
      'Jumu’ah sắp đến, còn {süre} phút.',
      'Hãy kịp nghe khutbah, còn {süre} phút nữa đến Jumu’ah.',
    ],
    camiyeGit: [
      'Còn {süre} phút nữa đến {vakit}. Hãy đến Masjid.',
      'Đã đến lúc đi Masjid, còn {süre} phút nữa đến {vakit}.',
      'Hãy đến Masjid cho {vakit}.',
    ],
    yatis: ['Hãy hành lễ ‘Isha’ trước khi đi ngủ.', 'Vẫn đang trong giờ ‘Isha’, hãy hành lễ trước khi ngủ.', 'Đừng ngủ trước khi hành lễ ‘Isha’.'],
    takvim: [
      'Một sự kiện trong lịch của bạn rơi vào giờ {vakit}.',
      'Giờ {vakit} trùng với một sự kiện; đừng quên hành lễ trước.',
      'Sau {süre} phút, giờ {vakit} trùng với sự kiện của bạn; đừng quên Salah.',
    ],
  },
  otomatik: {
    cuma: 'Còn {sure} nữa đến Zhuhr của Jumu’ah. Hãy chuẩn bị và đến Masjid.',
    camiyeGiris: 'Còn {sure} nữa đến {vakit}.',
    camiyeHazirlan: 'Hãy chuẩn bị và đến Masjid.',
    camiyeYola: 'Hãy đến Masjid.',
    takvimGiris: 'Một sự kiện trong lịch của bạn rơi vào giờ {vakit}.',
    takvimOnce: 'Đừng quên hành lễ trước sự kiện.',
    takvimKaplar: 'Đừng quên tạm nghỉ để hành lễ.',
    yatsi: 'Hãy hành lễ ‘Isha’ trước khi đi ngủ.',
    muhasebeTek: 'Hôm nay {vakit} có vẻ chưa được đánh dấu.',
    muhasebeCoklu: cogul({ other: 'Hôm nay có {n} lần Salah có vẻ chưa được đánh dấu.' }),
    geceCapasi: 'Giờ yên tĩnh bắt đầu sau {süre} phút. Hãy hành lễ {vakit} trước khi đi ngủ.',
    kuslukSuruyor: 'Đang trong giờ Duha.',
    kuslukGirdi: 'Đã vào giờ Duha. Thời điểm tốt cho hai rak’at.',
    kuslukBitiyor: cogul({ other: 'Giờ Duha còn {n} phút.' }),
    evvabinSuruyor: 'Vẫn còn thời gian cho Awwabin.',
    evvabinGirdi: 'Giờ Awwabin. Thời điểm tốt cho hai rak’at.',
    evvabinKalan: cogul({ other: 'Còn {n} phút cho Awwabin.' }),
    teheccudSonUcte: 'Giờ Tahajjud. Một phần ba cuối đêm đã bắt đầu.',
    teheccudKalan: cogul({ other: 'Giờ Tahajjud. Còn {n} phút đến Fajr.' }),
  },
};
