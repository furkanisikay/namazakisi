import type { Sozluk } from '../tr';

/** İbadete çağrı: "vi" + kısa çoğul emir; vakit adı + "-namaz" (IZH yazımı: "džuma-namaz"). */
export const icerik: Sozluk['icerik'] = {
  ayetKunyesi: "Kur'an {ref} · {yayimci}, QuranEnc {surum}",
  vakitGirdi: {
    uykudan: 'Namaz je bolji od sna. Dođite k spasu.',
    araVer: 'Nakratko prekinite svjetovne poslove i stanite pred svoga Gospodara.',
    yorgunluk: 'Ikindija-namaz vas čeka da se oslobodite umora dana i pronađete mir.',
    sukur: 'Akšam-namaz zahvala je za protekli dan. Požurite stati pred svoga Gospodara.',
    aksamKisa: 'Vrijeme akšama je kratko; nastupilo je, klanjajte bez odgađanja.',
    geceKaranligi: 'U tami noći ostanite nasamo sa svojim Gospodarom. Jacija-namaz lijek je za dušu.',
    davet: 'Pozvani ste na jacija-namaz kako biste dan završili tražeći Allahovo zadovoljstvo.',
  },
};
