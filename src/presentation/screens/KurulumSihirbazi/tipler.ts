/**
 * KurulumSihirbazi ekranı ve adım bileşenleri arasında paylaşılan tipler.
 */

/** Beş adım (sade tasarım, Dalga 2). Sıra = ekrandaki "Adım N / 5". */
export const KURULUM_ADIMLARI = ['hosgeldiniz', 'konum', 'bildirim', 'duzey', 'hazir'] as const;
export type KurulumAdimi = (typeof KURULUM_ADIMLARI)[number];

/** Konum adımının durumu. `manuel` = il listesi açık (izin yok ya da kullanıcı seçti). */
export type KonumDurumu = 'bekliyor' | 'aliniyor' | 'alindi' | 'manuel';
