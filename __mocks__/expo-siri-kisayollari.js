/**
 * `modules/expo-siri-kisayollari` köprü mock'u (issue #279).
 *
 * Gerçek köprü `expo-modules-core` üzerinden native tarafa dokunur; jest'te yoktur.
 * Global `moduleNameMapper` ile burası devreye girer → `WidgetServisi`,
 * `KildimKuyruguServisi` ve `IosMuhafizTeslimcisi`'ni DOLAYLI yükleyen suite'ler
 * ayakta kalır.
 *
 * VARSAYILAN: modül YOK. Jest'in varsayılan `Platform.OS` değeri 'ios' olsa da hiçbir
 * test istemeden iOS Siri yoluna girmez. Ölçen testler mock'u AÇIKÇA kurar ve ona
 * `require(...)` ile ulaşır (`jest.requireMock` başka örnek döndürür — AGENTS.md):
 *
 *   const kopru = require('../../../../modules/expo-siri-kisayollari/src');
 *   kopru.siriOdakDurumuAl.mockResolvedValue('{"sessiz":true,"ms":0}');
 */
const siriVeriYazici = jest.fn().mockReturnValue(null);
const siriKildimKuyrugu = jest.fn().mockReturnValue(null);
const siriOdakDurumuAl = jest.fn().mockResolvedValue(null);
const siriEkranIstegiAl = jest.fn().mockResolvedValue(null);
const siriDegisikliginiDinle = jest.fn().mockReturnValue(() => undefined);
// #295 canlı etkinlik: varsayılan DESTEKLENMİYOR (widget bayrağı kapalı build gibi).
const canliEtkinlikDestekli = jest.fn().mockReturnValue(false);
const canliEtkinlikIzniAcik = jest.fn().mockResolvedValue(null);
const canliEtkinlikEsitle = jest.fn().mockResolvedValue('desteklenmiyor');
// #285 Apple Watch: varsayılan YOK (saat bayrağı kapalı build gibi).
const saatUygulamasiDestekli = jest.fn().mockReturnValue(false);
const saatKoprusu = jest.fn().mockReturnValue(null);

module.exports = {
  saatUygulamasiDestekli,
  saatKoprusu,
  siriVeriYazici,
  siriKildimKuyrugu,
  siriOdakDurumuAl,
  siriEkranIstegiAl,
  siriDegisikliginiDinle,
  canliEtkinlikDestekli,
  canliEtkinlikIzniAcik,
  canliEtkinlikEsitle,
};
