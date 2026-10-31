import type { Sozluk } from '../tr';

/** Anahtar kelime kullanıcı tarafından YAZILIR: kesme işareti yok, "è" İtalyan klavyesinde tek tuş. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'è iniziato',
  vakitGirdiBasligi: '{ad} è iniziato',
  herhangiVakit: 'Quando inizia un qualsiasi orario di preghiera',
  yalnizVakit: 'Solo quando inizia {ad}',
  camide: 'Quando viene rilevata la sua presenza in moschea (con «In moschea» attivo)',
};
