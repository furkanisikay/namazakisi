/**
 * `modules/expo-sistem-durumu` köprü mock'u. Gerçek köprü native tarafa dokunur;
 * jest'te yoktur, global `moduleNameMapper` ile burası devreye girer.
 *
 * VARSAYILAN: modül YOK — her durum "bilinmiyor", dinleyici hiç çağrılmaz. Davranış
 * ölçen testler mock'u `require(...)` ile alıp kurar (`jest.requireMock` DEĞİL):
 *
 *   const kopru = require('../../../../modules/expo-sistem-durumu/src');
 *   kopru.sistemModuluVarMi.mockReturnValue(true);
 *   kopru.hamSistemDurumuAl.mockResolvedValue({ gucTasarrufu: true });
 */
const sistemModuluVarMi = jest.fn().mockReturnValue(false);
const hamSistemDurumuAl = jest.fn().mockResolvedValue(null);
const sistemDurumunuDinle = jest.fn().mockImplementation(() => ({ remove: jest.fn() }));

module.exports = { sistemModuluVarMi, hamSistemDurumuAl, sistemDurumunuDinle };
