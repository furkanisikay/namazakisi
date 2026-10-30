import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Muda uliobaki wa Swala',
    kanalAciklama: 'Arifa ya muda uliobaki kabla wakati wa Swala haujaisha',
    baslik: '⏱️ Swala ya {ad}',
    govde: 'Wakati wa {ad} unakaribia kuisha.',
  },
  canli: {
    vakitGovde: 'Muda uliobaki hadi {ad} iishe',
    cumaBaslik: '🕌 Swala ya Ijumaa',
    cumaGovde: 'Muda uliobaki hadi Adhuhuri (khutba)',
    nafileGovde: 'Muda uliobaki hadi {ad} iishe',
  },
  iftar: {
    kanal: 'Muda uliobaki wa futari',
    kanalAciklama: 'Arifa ya muda uliobaki hadi wakati wa futari',
    baslik: '🌙 Muda hadi futari',
    govde: 'Usifungue swaumu kabla ya kusikia Adhana.',
    girdiBaslik: '🌙 Wakati wa futari',
    girdiGovde: 'Futari yenye baraka.',
    girdiUzun: 'Futari yenye baraka.\n\n⚠️ Usifungue swaumu kabla ya kusikia Adhana. Tukumbuke katika dua zako :)',
  },
  sahur: {
    kanal: 'Muda uliobaki wa daku',
    kanalAciklama: 'Arifa ya muda uliobaki hadi mwisho wa daku (Alfajiri)',
    baslik: '🌙 Muda hadi mwisho wa daku',
    govde: 'Bado unaweza kula na kunywa; swaumu inaanza karibuni.',
    girdiBaslik: '🌙 Wakati wa daku umekwisha',
    girdiGovde: 'Ni wakati wa kutia nia.',
    girdiUzun: 'Wakati wa Alfajiri umeingia; usisahau kutia nia.\n\n⚠️ Sasa unaweza kuswali Alfajiri. Tukumbuke katika dua zako :)',
  },
  seri: {
    kanal: 'Muda uliobaki wa mfululizo',
    kanalAciklama: 'Muda uliobaki hadi mwisho wa siku ya mfululizo',
    baslik: '🔥 Mfululizo wako uko hatarini',
    govde: 'Swala za leo hazijakamilika; usipoteze mfululizo wako.',
    girdiBaslik: '🔥 Siku ya mfululizo imekwisha',
    girdiGovde: 'Siku mpya imeanza.',
  },
};
