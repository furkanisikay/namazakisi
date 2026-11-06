import type { Sozluk } from '../tr';

/**
 * Bulgaristan Müslümanlarının (Türk, Pomak) Bulgarca kalıpları, çeviri değil: namaz sonrası
 * "Аллах да приеме" (meal 2:127 "Приеми от нас" fiilinden; birebir kaynakta görülmedi), Türkçe
 * kökenli "Кабул олсун" (Balkan emsali, bs "Kabul olsun"). Selamlar Başmüftülük tebrik başlıklarının
 * adlarıyla (Рамазан Байрам, нощта Кадир, нощта Берат, Мирадж кандили) ve "благословен/а"
 * kalıbıyla. Övgü, "!" ve kılınmadıya yargı yok. Yerli okuyucu gözden geçirmeli.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Нека бъде за добро.',
  kabulDualari: ['Аллах да приеме', 'Нека Аллах да приеме', 'Аллах да приеме', 'Кабул олсун'],
  kabulDuasi: 'Аллах да приеме',
  ekSabah: 'Благословена утрин',
  ekYatsi: 'Благословена нощ',
  tamGunAna: 'Аллах да приеме',
  tamGunAlt: 'Днес изпълнихте и петте намаза.',
  kazaKabul: 'От вашия дневник е отписан един каза намаз ({vakit}). {dua}.',
  kandilGeceleri: {
    regaib: 'Благословена нощ Регаиб',
    mirac: 'Благословена нощ Мирадж',
    berat: 'Благословена нощ Берат',
    mevlid: 'Благословен Мевлид',
  },
  selamlar: {
    sahur: 'Благословен сахур',
    bayram: 'Честит Байрам',
    iftar: 'Благословен ифтар',
    kadir: 'Благословена нощ Кадир',
    arefe: 'Благословен ден Арефе',
    hicriYilbasi: 'Благословена нова хиджри година',
    cuma: 'Благословена Джума',
    ramazan: 'Благословен Рамазан',
    sabah: 'Благословена утрин',
  },
};
