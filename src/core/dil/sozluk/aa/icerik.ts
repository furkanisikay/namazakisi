import type { Sozluk } from '../tr';

/** Bizim sözlerimiz (çeviri değil): ibadete çağrı, çoğul kısa emir; "!" ve övgü yok. */
export const icerik: Sozluk['icerik'] = {
  ayetKunyesi: 'Qhuraan {ref} · {yayimci}, QuranEnc {surum}',
  vakitGirdi: {
    uykudan: 'Salat xiinok meqe. Naggoowuh amaata.',
    araVer: 'Addunyah taamak dago caba, sinni Rabbih foocal soola.',
    yorgunluk: 'Ayroh taama lakal nagay geytaanamkeh, Qasri salat sin qambaalta.',
    sukur: 'Magrib salat ayroh galata. Sinni Rabbih foocal soolaanamah sissikka.',
    aksamKisa: 'Magrib wakti dago; wakti cule, sissikak salat aba.',
    geceKaranligi: 'Barti dite addal sinni Rabbih foocal soola. Qisha salat nafsih dawa.',
    davet: 'Ayro Allah faxxa innal duudusaanamkeh, Qisha salaatah sin seeca.',
  },
};
