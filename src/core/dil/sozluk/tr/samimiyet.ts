/**
 * Samimiyet anları (`core/samimiyet`). ÇEVİRİ DEĞİL: her dil kendi geleneksel kalıbını
 * taşır; övgü, "!" ve kılınmadıya yargı yok (docs/ajan/ana-ekran-ve-ayarlar.md > Samimiyet).
 */
export const samimiyet = {
  kurulumBittiSelami: 'Hayırlı olsun.',
  /** Dört yuva, deterministik dönüşüm; baskın kalıp iki kez. Sıra değişirse test değişir. */
  kabulDualari: ['Allah kabul etsin', 'Kabul olsun', 'Allah kabul etsin', 'Rabbim kabul etsin'],
  /** Tek kalıplı yüzeyler (bildirim, tesbihat, kaza). */
  kabulDuasi: 'Allah kabul etsin',
  ekSabah: 'Hayırlı sabahlar',
  ekYatsi: 'Hayırlı geceler',
  tamGunAna: 'Allah kabul etsin',
  tamGunAlt: 'Bugün beş vakti tamamladınız.',
  kazaKabul: 'Bir {vakit} kazası defterinizden düşüldü. {dua}.',
  selamlar: {
    sahur: 'Hayırlı sahurlar',
    bayram: 'Bayramınız mübarek olsun',
    iftar: 'Hayırlı iftarlar',
    kadir: 'Kadir Geceniz mübarek olsun',
    kandil: 'Kandiliniz mübarek olsun',
    arefe: 'Hayırlı arefeler',
    hicriYilbasi: 'Hicri yılbaşınız mübarek olsun',
    cuma: 'Hayırlı cumalar',
    ramazan: 'Hayırlı Ramazanlar',
    sabah: 'Hayırlı sabahlar',
  },
} as const;
