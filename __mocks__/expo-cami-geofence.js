/**
 * `modules/expo-cami-geofence` köprü mock'u (Camideyim #297 + Namaz modu #277).
 *
 * Gerçek köprü `expo-modules-core` üzerinden native tarafa dokunur; jest'te yoktur.
 * Global `moduleNameMapper` ile burası devreye girer → köprüyü DOLAYLI yükleyen
 * suite'ler (App zinciri, muhafız teslimcisi, ayar ekranları) ayakta kalır.
 *
 * VARSAYILAN: modül YOK (`camiModuluVarMi` false) — her çağrı köprüsüz build'deki
 * gibi güvenli varsayılan döner. Davranış ölçen testler mock'u açıkça kurar:
 *
 *   const kopru = require('../../../modules/expo-cami-geofence/src');
 *   kopru.camiModuluVarMi.mockReturnValue(true);
 *   kopru.durumAl.mockResolvedValue({ ... });
 *
 * Köprünün KENDİ testi gerçek dosyayı `.../src/index` yoluyla yükler (bu eşleme
 * yalnız `.../src` ile biten yolu yakalar).
 */
const camiModuluVarMi = jest.fn().mockReturnValue(false);
const durumAl = jest.fn().mockResolvedValue(null);
const sessizBitisMs = jest.fn().mockResolvedValue(0);
const ayarlariAl = jest.fn().mockResolvedValue(null);
const ayarlariYaz = jest.fn().mockResolvedValue('yok');
const pencereleriYaz = jest.fn().mockResolvedValue(undefined);
const izlemeyiTazele = jest.fn().mockResolvedValue('yok');
const yakinCamiler = jest.fn().mockResolvedValue([]);
const gunlukAl = jest.fn().mockResolvedValue([]);
const gunluguTemizle = jest.fn().mockResolvedValue(undefined);
const camidenCik = jest.fn().mockResolvedValue(undefined);
const kildimBekleyenleriAl = jest.fn().mockResolvedValue([]);
const kildimTamamlandi = jest.fn().mockResolvedValue(undefined);
const kildimBasarisiz = jest.fn().mockResolvedValue(undefined);
const namazModuDurumu = jest.fn().mockResolvedValue(null);
const namazModuAyarlariniYaz = jest.fn().mockResolvedValue('yok');
const namazModuPlaniniYaz = jest.fn().mockResolvedValue(undefined);
const namazModuKildim = jest.fn().mockResolvedValue(undefined);
const namazModuAktifTurlari = jest.fn().mockResolvedValue([]);
const erisimAyariniAc = jest.fn().mockResolvedValue(false);
const modAyarlariniAc = jest.fn().mockResolvedValue(false);
const camiOlayiniDinle = jest.fn().mockReturnValue({ remove: jest.fn() });

module.exports = {
  camiModuluVarMi,
  durumAl,
  sessizBitisMs,
  ayarlariAl,
  ayarlariYaz,
  pencereleriYaz,
  izlemeyiTazele,
  yakinCamiler,
  gunlukAl,
  gunluguTemizle,
  camidenCik,
  kildimBekleyenleriAl,
  kildimTamamlandi,
  kildimBasarisiz,
  namazModuDurumu,
  namazModuAyarlariniYaz,
  namazModuPlaniniYaz,
  namazModuKildim,
  namazModuAktifTurlari,
  erisimAyariniAc,
  modAyarlariniAc,
  camiOlayiniDinle,
};
