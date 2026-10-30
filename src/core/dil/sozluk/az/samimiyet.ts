import type { Sozluk } from '../tr';

/**
 * Azərbaycan müsəlmanlarının namazdan sonra və bayramlarda işlətdiyi ənənəvi ifadələr (tərcümə deyil):
 * "Allah qəbul etsin", "Qəbul olsun", "Namazınız qəbul olsun". Tərif, "!" və qılınmamışa hökm yoxdur.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Xeyirli olsun.',
  kabulDualari: ['Allah qəbul etsin', 'Qəbul olsun', 'Allah qəbul etsin', 'Namazınız qəbul olsun'],
  kabulDuasi: 'Allah qəbul etsin',
  ekSabah: 'Sabahınız xeyir',
  ekYatsi: 'Gecəniz xeyrə qalsın',
  tamGunAna: 'Allah qəbul etsin',
  tamGunAlt: 'Bu gün beş vaxt namazı tamamladınız.',
  kazaKabul: 'Dəftərinizdən bir {vakit} qəzası çıxıldı. {dua}.',
  kandilGeceleri: {
    regaib: 'Rəğaib gecəniz mübarək olsun',
    mirac: 'Merac gecəniz mübarək olsun',
    berat: 'Bərat gecəniz mübarək olsun',
    mevlid: 'Mövlud gecəniz mübarək olsun',
  },
  selamlar: {
    sahur: 'Sahurunuz xeyirli olsun',
    bayram: 'Bayramınız mübarək olsun',
    iftar: 'İftarınız xeyirli olsun',
    kadir: 'Qədr gecəniz mübarək olsun',
    arefe: 'Ərəfəniz mübarək olsun',
    hicriYilbasi: 'Hicri yeni iliniz mübarək olsun',
    cuma: 'Cüməniz mübarək olsun',
    ramazan: 'Ramazan ayınız mübarək olsun',
    sabah: 'Sabahınız xeyir',
  },
};
