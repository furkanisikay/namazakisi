import type { Sozluk } from '../tr';

/** Vakit girdi bildirimi ibadete çağrıdır: "сен" + emir kipi (AGENTS.md hitap kuralı). */
export const icerik: Sozluk['icerik'] = {
  ayetKunyesi: 'Құран {ref} · {yayimci}, QuranEnc {surum}',
  vakitGirdi: {
    uykudan: 'Намаз ұйқыдан қайырлы. Құтылуға асық.',
    araVer: 'Дүние істеріне қысқа үзіліс жасап, Раббыңның алдында намазға тұр.',
    yorgunluk: 'Күннің шаршауын басып, тыныштық табу үшін екінті намазы сені күтуде.',
    sukur: 'Ақшам намазы — күннің шүкірі. Раббыңның алдына баруға асық.',
    aksamKisa: 'Ақшамның уақыты қысқа; уақыт кірді, кешіктірмей оқы.',
    geceKaranligi: 'Түннің қараңғысында Раббыңмен оңаша қал. Құптан намазы — жанның дауасы.',
    davet: 'Күнді Алланың ризалығымен аяқтау үшін құптан намазына шақырыласың.',
  },
};
