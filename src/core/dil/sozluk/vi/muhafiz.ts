import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı: kısa, doğrudan emir "Hãy …", zamir yok ya da "bạn"; mealdeki "Ngươi" ve
 * "Vui lòng" YOK. "Secdeye kapan" karşılığı yazılmaz → "hành lễ Salah" (namaza dur). Başlıkta
 * süre "{dk} phút" (bileklikte ilk 16 karakter: "Zhuhr · 30 phút").
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · đã {dk} phút · đến giờ Salah ⏰',
    giris2: '{ad} · đã {dk} phút · đừng trì hoãn Salah ⚠️',
    giris3: '{ad} · đã {dk} phút · Salah đang chờ bạn 🔥',
    giris4: '{ad} · đã {dk} phút · HÃY HÀNH LỄ SALAH 🚨',
    erken3: '{ad} · còn {dk} phút · Salah đang chờ bạn 🔥',
    erken4: '{ad} · còn {dk} phút · HÃY HÀNH LỄ SALAH 🚨',
    cikis1: '{ad} · còn {dk} phút ⏰',
    cikis2: '{ad} · {dk} phút · thời gian đang ngắn lại ⚠️',
    cikis3: '{ad} · {dk} phút · thời gian sắp trôi qua 🔥',
    cikis4: '{ad} · {dk} phút · SẮP HẾT GIỜ 🚨',
  },
  girisHavuzu: {
    s1: ['Đã đến giờ Salah; hãy hành lễ khi còn có cơ hội.', 'Hãy hành lễ khi thời gian còn rộng; đừng để đến sau.'],
    s2: ['Càng trì hoãn càng nặng nề; đừng để Salah đến phút cuối.', 'Thời gian đang trôi — hãy hành lễ ngay.'],
    s3: [
      'Càng trì hoãn, bạn càng gần với việc lỡ giờ; hãy hành lễ ngay.',
      'Đừng nói “để lát nữa”; bạn có thể hành lễ ngay bây giờ.',
      'Hãy đứng dậy ngay, đừng để vài phút nữa phải nói “giá như”.',
    ],
    s4: ['Đừng trì hoãn Salah thêm nữa — hãy hành lễ ngay.', 'Hãy gác lại việc đang làm và hành lễ Salah.'],
  },
  govde: {
    s1: 'Thời gian bắt đầu ngắn lại; hãy hành lễ khi còn có cơ hội.',
    s2: 'Đừng để Salah đến phút cuối; bây giờ là lúc tốt để hành lễ.',
    s3: 'Sắp hết giờ; bạn vẫn có thể hành lễ ngay bây giờ.',
    s4: 'Nếu đã hành lễ, hãy chạm “Tôi đã hành lễ”; nếu chưa, hãy hành lễ ngay.',
  },
  serit: {
    giris4: 'ĐỪNG TRÌ HOÃN SALAH. Hãy hành lễ ngay. (đã qua {dk} phút)',
    giris2: 'Thời gian đang trôi; đừng để Salah đến phút cuối. (đã qua {dk} phút)',
    giris1: cogul({ other: 'Đã {n} phút kể từ khi vào giờ Salah.' }),
    erken4: 'Đừng trì hoãn Salah; hãy hành lễ ngay. (còn {dk} phút)',
    cikis4: 'SẮP HẾT GIỜ. Hãy hành lễ ngay. (còn {dk} phút)',
    cikis2: 'Thời gian đang ngắn lại; đừng để Salah đến phút cuối. (còn {dk} phút)',
    cikis1: cogul({ other: 'Còn {n} phút nữa là hết giờ Salah.' }),
  },
  geceCapasi: {
    baslik: '{ad} · hãy hành lễ trước khi ngủ ⏰',
    govde: 'Giờ yên tĩnh bắt đầu sau {dk} phút; hãy hành lễ ‘Isha’ trước khi đi ngủ.',
  },
  icerik: {
    firsat: 'Thời gian bắt đầu ngắn lại; hãy hành lễ khi còn có cơ hội.',
    sonaBirakma: 'Đừng để Salah đến phút cuối; bây giờ là lúc tốt để hành lễ.',
    fisilti: 'Đừng nói “để lát nữa”; sắp hết giờ, bạn có thể hành lễ ngay bây giờ.',
    omur: 'Thời gian đang trôi; bạn vẫn còn cơ hội hành lễ Salah này đúng giờ.',
    keske: 'Hãy đứng dậy ngay, đừng để vài phút nữa phải nói “giá như”.',
    namazaDur: 'Nếu đã hành lễ, hãy chạm “Tôi đã hành lễ”; nếu chưa, hãy hành lễ ngay.',
    sonDakika: 'Những phút cuối cùng. Hãy gác lại việc đang làm và hành lễ Salah.',
  },
};
