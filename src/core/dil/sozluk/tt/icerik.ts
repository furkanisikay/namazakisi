import type { Sozluk } from '../tr';

/** Vakit girdi bildirimi ibadete çağrıdır: "син" + emir kipi (AGENTS.md hitap kuralı, Türk dilleri emsali). */
export const icerik: Sozluk['icerik'] = {
  ayetKunyesi: 'Коръән {ref} · {yayimci}, QuranEnc {surum}',
  vakitGirdi: {
    uykudan: 'Намаз йокыдан хәерлерәк. Котылуга ашык.',
    araVer: 'Дөнья эшләреңә кыска тәнәфес ясап, Раббың каршында намазга бас.',
    yorgunluk: 'Көн арганлыгын басып, тынычлык табу өчен икенде намазы сине көтә.',
    sukur: 'Ахшам намазы — көннең шөкере. Раббың каршына барырга ашык.',
    aksamKisa: 'Ахшамның вакыты кыска; вакыт керде, кичектермичә укы.',
    geceKaranligi: 'Төн караңгылыгында Раббың белән ялгыз кал. Ястү намазы — җанның дәвасы.',
    davet: 'Көнне Аллаһның ризалыгы белән тәмамлау өчен ястү намазына чакырыласың.',
  },
};
