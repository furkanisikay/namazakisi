import type { Sozluk } from '../tr';

/**
 * Gürcü Müslümanların kalıpları (çeviri değil). "Allah kabul etsin" = "ალლაჰმა მიიღოს": QE 2:127
 * "მიიღე" kökü + istek kipi (türetildi, DOĞRULANMADI). Sabah/gece selamı Gürcücenin gündelik
 * "დილა მშვიდობისა" / "ღამე მშვიდობისა" kalıbı. Bayram adı ka.wikipedia "ბაირამი" çizgisinde;
 * kandil adları Arapça kökenli yazımla (DOĞRULANMADI). Yerli okuyucu baksın.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'კურთხეული იყოს.',
  kabulDualari: ['ალლაჰმა მიიღოს', 'მიღებული იყოს', 'ალლაჰმა მიიღოს', 'ჩვენმა უფალმა მიიღოს'],
  kabulDuasi: 'ალლაჰმა მიიღოს',
  ekSabah: 'დილა მშვიდობისა',
  ekYatsi: 'ღამე მშვიდობისა',
  tamGunAna: 'ალლაჰმა მიიღოს',
  tamGunAlt: 'დღეს ხუთივე ლოცვა შეასრულეთ.',
  kazaKabul: 'თქვენი ჟურნალიდან ჩამოიწერა ერთი ყადა: {vakit}. {dua}.',
  kandilGeceleri: {
    regaib: 'რაღაიბის კურთხეული ღამე',
    mirac: 'ისრასა და მირაჯის კურთხეული ღამე',
    berat: 'ბარაათის კურთხეული ღამე',
    mevlid: 'კურთხეული მავლიდი',
  },
  selamlar: {
    sahur: 'კურთხეული სუჰური',
    bayram: 'გილოცავთ ბაირამს',
    iftar: 'კურთხეული იფთარი',
    kadir: 'ალ-ყადრის კურთხეული ღამე',
    arefe: 'ბაირამის კურთხეული წინადღე',
    hicriYilbasi: 'გილოცავთ ჰიჯრის ახალ წელს',
    cuma: 'კურთხეული პარასკევი',
    ramazan: 'გილოცავთ რამადანს',
    sabah: 'დილა მშვიდობისა',
  },
};
