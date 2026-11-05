import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Nyamefrɛ berɛ a aka',
    kanalAciklama: 'Amaneɛbɔ a ɛkyerɛ berɛ a aka ansa na Nyamefrɛ berɛ aba awieɛ',
    baslik: '⏱️ {ad} Nyamefrɛ',
    govde: '{ad} berɛ rebɛba awieɛ.',
  },
  canli: {
    vakitGovde: 'Berɛ a aka ansa na {ad} aba awieɛ',
    cumaBaslik: '🕌 Efiada Nyamefrɛ',
    cumaGovde: 'Berɛ a aka ansa na Dhuhr (khutbah) adu',
    nafileGovde: 'Berɛ a aka ansa na {ad} aba awieɛ',
  },
  iftar: {
    kanal: 'Iftar berɛ a aka',
    kanalAciklama: 'Amaneɛbɔ a ɛkyerɛ berɛ a aka kosi Iftar berɛ',
    baslik: '🌙 Iftar berɛ a aka',
    govde: 'Mmu wo akyiriwia ansa na wote Azaan.',
    girdiBaslik: '🌙 Iftar berɛ adu',
    girdiGovde: 'Iftar a nhyira wɔ mu.',
    girdiUzun: 'Iftar a nhyira wɔ mu.\n\n⚠️ Mmu wo akyiriwia ansa na wote Azaan. Kae yɛn wɔ wo mpaebɔ mu :)',
  },
  sahur: {
    kanal: 'Suhur berɛ a aka',
    kanalAciklama: 'Amaneɛbɔ a ɛkyerɛ berɛ a aka kosi Suhur awieɛ (Fajr)',
    baslik: '🌙 Suhur berɛ a aka',
    govde: 'Wobɛtumi adi na woanom; akyiriwia rebɛhyɛ ase.',
    girdiBaslik: '🌙 Suhur berɛ aba awieɛ',
    girdiGovde: 'Berɛ adu sɛ woyɛ wo niyya.',
    girdiUzun: 'Fajr berɛ adu; mma wo werɛ mfi wo niyya.\n\n⚠️ Afei wobɛtumi ayɛ Fajr Nyamefrɛ. Kae yɛn wɔ wo mpaebɔ mu :)',
  },
  seri: {
    kanal: 'Toatoaso berɛ a aka',
    kanalAciklama: 'Berɛ a aka ansa na toatoaso da no aba awieɛ',
    baslik: '🔥 Wo toatoaso wɔ asiane mu',
    govde: 'Ɛnnɛ Nyamefrɛ no nnya nwieeɛ; mma wo toatoaso nsɛe.',
    girdiBaslik: '🔥 Toatoaso da no aba awieɛ',
    girdiGovde: 'Da foforo ahyɛ ase.',
  },
};
