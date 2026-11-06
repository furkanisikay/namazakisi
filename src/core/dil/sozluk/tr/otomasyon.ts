/**
 * Otomasyon anahtar kelimeleri (Samsung Rutinler "Bildirim alındığında"). Türkçe değerler
 * DEĞİŞMEZ: kullanıcıların kurduğu rutinler bu metne bağlıdır. Dil değişince kelime de
 * değişir; rehber ekranı bunu söyler.
 */
export const otomasyon = {
  vakitGirdiEki: 'vakti girdi',
  vakitGirdiBasligi: '{ad} vakti girdi',
  herhangiVakit: 'Herhangi bir vakit girdiğinde',
  yalnizVakit: 'Yalnız {ad} vakti girdiğinde',
  camide: 'Camide olduğunuz algılandığında (Camideyim açıkken)',
} as const;
