import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Vaxt sayğacı',
    kanalAciklama: 'Vaxt çıxmazdan əvvəl geri sayım bildirişi',
    baslik: '⏱️ {ad} namazı',
    govde: '{ad} namazının vaxtı çıxmaq üzrədir.',
  },
  canli: {
    vakitGovde: '{ad} vaxtının çıxmasına qalan vaxt',
    cumaBaslik: '🕌 Cümə namazı',
    cumaGovde: 'Zöhr vaxtına (xütbəyə) qalan vaxt',
    nafileGovde: '{ad} vaxtının bitməsinə qalan vaxt',
  },
  iftar: {
    kanal: 'İftar sayğacı',
    kanalAciklama: 'İftar vaxtına geri sayım bildirişi',
    baslik: '🌙 İftar sayğacı',
    govde: 'Azanı eşitmədən orucunuzu açmayın.',
    girdiBaslik: '🌙 İftar vaxtı',
    girdiGovde: 'İftarınız xeyirli olsun.',
    girdiUzun: 'İftarınız xeyirli olsun.\n\n⚠️ Azanı eşitmədən orucunuzu açmayın. Dualarınızda bizi də unutmayın :)',
  },
  sahur: {
    kanal: 'Sahur sayğacı',
    kanalAciklama: 'Sahurun bitməsinə (sübh vaxtına) geri sayım bildirişi',
    baslik: '🌙 Sahur sayğacı',
    govde: 'Yeyib-içməyə davam edə bilərsiniz, sübh yaxınlaşır.',
    girdiBaslik: '🌙 Sahur vaxtı bitdi',
    girdiGovde: 'Niyyət etmə vaxtıdır.',
    girdiUzun: 'Sübh vaxtı daxil oldu, niyyət etməyi unutmayın.\n\n⚠️ Sübh namazınızı qıla bilərsiniz. Dualarınızda bizi də unutmayın :)',
  },
  seri: {
    kanal: 'Seriya sayğacı',
    kanalAciklama: 'Seriya gününün bitməsinə geri sayım',
    baslik: '🔥 Seriyan təhlükədədir',
    govde: 'Bu günkü namazların tamamlanmayıb, seriyanı itirmə.',
    girdiBaslik: '🔥 Seriya günü bitdi',
    girdiGovde: 'Yeni gün başladı.',
  },
};
