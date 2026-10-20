/**
 * Expo Config Plugin — iCloud cihazlar arası eşitleme (issue #288).
 *
 * AÇIK (2026-10-20). Entitlement yalnız anahtar-değer deposudur
 * (`com.apple.developer.ubiquity-kvstore-identifier`); App ID'de ICLOUD yeteneği
 * (ICLOUD_VERSION=XCODE_6, kapsayıcısız) gerekir — Apple profile yetenek açıkken
 * `ubiquity-kvstore-identifier = <takım>.*` yazar.
 *
 * TUZAK: EAS'in yetenek eşitlemesi iCloud'u yalnız
 * `com.apple.developer.icloud-container-identifiers` entitlement'ına eşler ve
 * Apple ID ile yapılan her etkileşimli build'de eşleştiremediği iCloud'u App ID'de
 * KAPATIR (profil iCloud'suz çıkar). Bu yüzden etkileşimli build'i
 * `EXPO_NO_CAPABILITY_SYNC=1` ile çalıştırın; CI (`expo-build.yml`) bunu zaten
 * yazar. Yetenek kapandıysa: `ios-ekran-goruntuleri.yml` tur=asc,
 * asc_islem=icloud-ac (`scripts/asc-icloud.js`), sonra EAS'teki ana profil
 * kaydını silip yeniden build alın (ayrıntı: docs/ajan/ios.md).
 *
 * Bayrak açıkken: entitlement eklenir ve `extra.icloudEsitlemeEtkin = true` yazılır
 * (JS `esitlemeYapilandirmasi.icloudEsitlemeEtkinMi` bunu okur; kapalıyken iCloud
 * sağlayıcısı ekranda HİÇ görünmez). Swift köprüsü (`modules/expo-icloud-esitleme`)
 * bayraktan bağımsız derlenir; entitlement yokken depo yalnız yerel davranır.
 */

const KV_ENTITLEMENT = 'com.apple.developer.ubiquity-kvstore-identifier';
const KV_DEGERI = '$(TeamIdentifierPrefix)$(CFBundleIdentifier)';

let withEntitlementsPlist;
try {
  ({ withEntitlementsPlist } = require('@expo/config-plugins'));
} catch {
  withEntitlementsPlist = null;
}

module.exports = function withIcloudEsitleme(config, secenekler = {}) {
  const etkin = secenekler && secenekler.etkin === true;
  if (!etkin) return config;

  config.extra = { ...(config.extra || {}), icloudEsitlemeEtkin: true };
  if (!withEntitlementsPlist) return config;

  return withEntitlementsPlist(config, (yapi) => {
    yapi.modResults[KV_ENTITLEMENT] = KV_DEGERI;
    return yapi;
  });
};
