import { cogul } from '../../tipler';

/**
 * Hatırlatma bildirimleri (cuma, camiye gitme, takvim çakışması, yatış/muhasebe, gün sonu).
 * İbadete çağrı olanlar "sen" + emir (cuma, camiye, takvim, yatsı); işaretleme/muhasebe "siz".
 * Başlık önden okunur: vakit adı + süre ilk 16 karakterde (issue #287).
 */
export const bildirim = {
  cuma: {
    baslik: 'Cuma · {sure} kaldı · namaz yaklaşıyor',
    govdeIlk: 'Öğle vaktine {sure} kaldı. Hazırlan, camiye yola çık.',
    govde: 'Öğle vaktine {sure} kaldı. Camiye yola çık.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · ezana {dk} dk · camiye hazırlan',
    hazirlanGovde: '{ad} namazına camide yetişmek için hazırlan, {sonra} dk sonra yola çık — ezana {dk} dk.',
    yolaCikBaslik: '{ad} · ezana {dk} dk · camiye yola çık',
    yolaCikGovde: '{ad} namazına camide yetişmek için yola çık — ezana {dk} dk.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Takvimindeki {n} etkinlik art arda', other: 'Takvimindeki {n} etkinlik art arda' }),
    etkinlikBir: 'Takvimindeki bir etkinlik',
    sonAnIkindi: 'ikindi için son uygun an {saat} (sonrası kerahat)',
    sonAnVakit: '{kucuk} vaktinin çıkışı {saat}',
    onceBaslik: '{ad} · etkinlik {saat} · önce kıl',
    onceGovde: '{etkinlik} {aralik} arası sürüyor; {sonAn}. Etkinlik başlamadan {kucuk} namazını kıl.',
    kaplarBaslik: '{ad} · etkinlik vakti kaplıyor',
    kaplarGovde:
      '{etkinlik} {aralik} arası sürüyor ve {kucuk} vaktini ({giris}–{son}) kaplıyor. Kısa bir ara verip {kucuk} namazını kılmayı şimdiden planla.',
  },
  yatis: {
    yatsiBaslik: '{ad} · yatmadan önce kıl 🌙',
    yatsiGovde: '{ad} vakti hâlâ sürüyor; uykuya dalmadan namaza dur.',
    ozet: 'Bugün {kilinan}/5 · {liste} işaretlenmemiş',
    tekOto: 'Kıldıysanız işaretleyin. {oto}',
    tekKaza: 'Kıldıysanız işaretleyin; kılamadıysanız kaza defterinize ekleyin.',
    tekSuruyor: 'Kıldıysanız işaretleyin. Vakit hâlâ sürüyor.',
    cokluOto: 'Kıldıklarınızı işaretlemek için uygulamayı açıp inceleyin. {oto}',
    coklu: 'Kıldıklarınızı işaretlemek için uygulamayı açıp inceleyin.',
    otoSor: "İşaretlemezseniz bu gün Kaza Defteri'nde size sorulacak.",
    otoEkle: 'İşaretlemezseniz namaz günü bitince kazaya eklenecek.',
  },
  gunSonu: {
    baslik: 'Günü tamamlamadınız · seri',
    govde: 'Kıldığınız namazları gün bitmeden işaretlerseniz seriniz sürer.',
  },
} as const;
