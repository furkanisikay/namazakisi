import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Lakkoofsa duubaa salaataa',
    kanalAciklama: 'Beeksisa lakkoofsa duubaa yeroon salaataa osoo hin xumuramin dura',
    baslik: '⏱️ Salaata {ad}',
    govde: 'Yeroon {ad} xumuramuuf jira.',
  },
  canli: {
    vakitGovde: 'Hanga yeroon {ad} xumuramutti yeroo hafe',
    cumaBaslik: '🕌 Salaata Jimaataa',
    cumaGovde: 'Hanga Zuhriitti (khutbaa) yeroo hafe',
    nafileGovde: 'Hanga yeroon {ad} xumuramutti yeroo hafe',
  },
  iftar: {
    kanal: 'Lakkoofsa duubaa afursaa',
    kanalAciklama: 'Beeksisa lakkoofsa duubaa hanga yeroo afursaatti',
    baslik: '🌙 Lakkoofsa duubaa afursaa',
    govde: "Osoo azaana hin dhaga'in soomana keessan hin cabsinaa.",
    girdiBaslik: '🌙 Yeroon afursaa gaheera',
    girdiGovde: 'Afursaa eebbifamaa.',
    girdiUzun: "Afursaa eebbifamaa.\n\n⚠️ Osoo azaana hin dhaga'in soomana keessan hin cabsinaa. Kadhannaa keessan keessatti nu yaadadhaa :)",
  },
  sahur: {
    kanal: 'Lakkoofsa duubaa suhuuraa',
    kanalAciklama: 'Beeksisa lakkoofsa duubaa hanga dhuma suhuuraatti (Subhii)',
    baslik: '🌙 Lakkoofsa duubaa suhuuraa',
    govde: 'Ammallee nyaachuufi dhuguu dandeessu; soomanni dhiyootti jalqaba.',
    girdiBaslik: '🌙 Yeroon suhuuraa xumurameera',
    girdiGovde: 'Yeroon niyyaa gochuu gaheera.',
    girdiUzun: 'Yeroon Subhii gaheera; niyyaa gochuu hin dagatinaa.\n\n⚠️ Amma Subhii salaatuu dandeessu. Kadhannaa keessan keessatti nu yaadadhaa :)',
  },
  seri: {
    kanal: 'Lakkoofsa duubaa walitti fufiinsaa',
    kanalAciklama: 'Lakkoofsa duubaa hanga dhuma guyyaa walitti fufiinsaatti',
    baslik: '🔥 Walitti fufiinsi keessan balaa keessa jira',
    govde: "Salaanni har'aa hin guutamne; walitti fufiinsa keessan hin dhabinaa.",
    girdiBaslik: '🔥 Guyyaan walitti fufiinsaa xumurameera',
    girdiGovde: 'Guyyaan haaraan jalqabeera.',
  },
};
