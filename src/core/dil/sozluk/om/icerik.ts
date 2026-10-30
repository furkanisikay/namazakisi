import type { Sozluk } from '../tr';

/** Kendi sözlerimiz (ayet/hadis çevirisi değil); ibadete çağrı tekil emir. */
export const icerik: Sozluk['icerik'] = {
  ayetKunyesi: "Qur'aana {ref} · {yayimci}, QuranEnc {surum}",
  vakitGirdi: {
    uykudan: "Salaanni hirriba caala. Gara milkaa'inaatti kottu.",
    araVer: 'Hojii addunyaa irraa yeroo gabaabaaf boqodhu, fuula Gooftaa keetii dura dhaabadhu.',
    yorgunluk: 'Dadhabbii guyyaa of irraa buusuufi nagaa argachuuf Asriin si eeggata.',
    sukur: 'Maghribni galata guyyaati. Fuula Gooftaa keetii dura dhaabachuuf ariifadhu.',
    aksamKisa: 'Yeroon Maghribaa gabaabaadha; gaheera, osoo hin tursiin salaati.',
    geceKaranligi: "Dukkana halkanii keessatti Gooftaa kee wajjin kophaa ta'i. Ishaa'iin qoricha lubbuuti.",
    davet: "Guyyaa jaalala Rabbiitiin xumuruuf gara Ishaa'ii afeeramteetta.",
  },
};
