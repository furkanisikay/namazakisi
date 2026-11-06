/**
 * Geri sayım bildirimleri (vakit, canlı sayaç/Now Bar, iftar, sahur, seri). `⏱️ {time}` satırını
 * kod ekler (native şablon); buradaki metinler o satırın üstüdür.
 */
export const sayac = {
  vakit: {
    kanal: 'Vakit Sayacı',
    kanalAciklama: 'Vakit çıkmadan önce geri sayım bildirimi',
    baslik: '⏱️ {ad} Namazı',
    govde: '{ad} namazı vakti çıkmak üzere!',
  },
  canli: {
    vakitGovde: '{ad} vaktinin çıkmasına kalan süre',
    cumaBaslik: '🕌 Cuma Namazı',
    cumaGovde: 'Öğle vaktine (hutbeye) kalan süre',
    nafileGovde: '{ad} vaktinin bitişine kalan süre',
  },
  iftar: {
    kanal: 'İftar Sayacı',
    kanalAciklama: 'İftar vaktine geri sayım bildirimi',
    baslik: '🌙 İftar Sayacı',
    govde: 'Ezanı duymadan orucunuzu açmayınız!',
    girdiBaslik: '🌙 İftar Vakti!',
    girdiGovde: 'Hayırlı iftarlar!',
    girdiUzun: 'Hayırlı iftarlar!\n\n⚠️ Ezanı duymadan orucunuzu açmayınız! Duanızda bize de yer vermeyi unutmayın :)',
  },
  sahur: {
    kanal: 'Sahur Sayacı',
    kanalAciklama: 'İmsak (Sahur bitiş) vaktine geri sayım bildirimi',
    baslik: '🌙 Sahur Sayacı',
    govde: 'Yemeye içmeye devam, imsak yaklaşıyor!',
    girdiBaslik: '🌙 Sahur Vakti Bitti!',
    girdiGovde: 'Niyet etme vakti geldi.',
    girdiUzun: 'İmsak vakti girdi, niyet etmeyi unutmayınız!\n\n⚠️ Sabah namazınızı eda edebilirsiniz. Duanızda bize de yer vermeyi unutmayın :)',
  },
  seri: {
    kanal: 'Seri Sayacı',
    kanalAciklama: 'Seri gününün bitmesine geri sayım',
    baslik: '🔥 Serin Tehlikede',
    govde: 'Bugünkü namazların eksik, serini kaybetme.',
    girdiBaslik: '🔥 Seri Günü Bitti',
    girdiGovde: 'Yeni gün başladı.',
  },
} as const;
