/**
 * KurulumSihirbazi ekranı ve adım bileşenleri arasında paylaşılan tipler.
 */
export type BildirimAyarlari = {
  imsak: boolean;
  ogle: boolean;
  ikindi: boolean;
  aksam: boolean;
  yatsi: boolean;
};

export type MuhafizYogunluk = 'hafif' | 'normal' | 'yogun' | 'ozel';
export type KonumDurumu = 'bekliyor' | 'gpsAliniyor' | 'gpsBasarili' | 'gpsReddedildi';
