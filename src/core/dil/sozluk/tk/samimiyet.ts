import type { Sozluk } from '../tr';

/**
 * Türkmen musulmanlarynyň namazdan soň we baýramlarda aýdýan adaty sözleri (terjime däl):
 * "Alla kabul etsin", "Kabul bolsun", "Namazyňyz kabul bolsun"; baýramda "… gutly bolsun".
 * Öwgi, "!" we okalmadyk namaza höküm ýok. Ýerli okyjy barlamaly (çeşme bilen tassyklanmady).
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Haýyrly bolsun.',
  kabulDualari: ['Alla kabul etsin', 'Kabul bolsun', 'Alla kabul etsin', 'Namazyňyz kabul bolsun'],
  kabulDuasi: 'Alla kabul etsin',
  ekSabah: 'Ertiriňiz haýyrly bolsun',
  ekYatsi: 'Gijäňiz rahat bolsun',
  tamGunAna: 'Alla kabul etsin',
  tamGunAlt: 'Şu gün bäş wagt namazy tamamladyňyz.',
  kazaKabul: 'Depderiňizden bir {vakit} kazasy aýryldy. {dua}.',
  kandilGeceleri: {
    regaib: 'Regaýyp gijäňiz mübärek bolsun',
    mirac: 'Miraj gijäňiz mübärek bolsun',
    berat: 'Berat gijäňiz mübärek bolsun',
    mevlid: 'Mewlit gijäňiz mübärek bolsun',
  },
  selamlar: {
    sahur: 'Selälligiňiz haýyrly bolsun',
    bayram: 'Baýramyňyz gutly bolsun',
    iftar: 'Agzyaçaryňyz haýyrly bolsun',
    kadir: 'Gadyr gijäňiz mübärek bolsun',
    arefe: 'Arapa güniňiz mübärek bolsun',
    hicriYilbasi: 'Hijri täze ýylyňyz mübärek bolsun',
    cuma: 'Juma güniňiz mübärek bolsun',
    ramazan: 'Oraza aýyňyz mübärek bolsun',
    sabah: 'Ertiriňiz haýyrly bolsun',
  },
};
