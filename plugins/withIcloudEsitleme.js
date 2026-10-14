/**
 * Expo Config Plugin — iCloud cihazlar arası eşitleme (issue #288).
 *
 * VARSAYILAN KAPALI ve app.json'a EKLENMEDİ: iCloud anahtar-değer deposu
 * `com.apple.developer.ubiquity-kvstore-identifier` entitlement'ını ister; bu da
 * App ID'de iCloud capability'si + yenilenmiş imza profili demektir. EAS
 * `--non-interactive` iOS build'i profili Apple oturumu olmadan yenileyemez →
 * entitlement habersiz eklenirse iOS yayın hattı kırılır.
 *
 * Sahip etkinleştirmek için (sırayla):
 *   1. developer.apple.com > Identifiers > com.furkanisikay.namazakisi > iCloud
 *      (Key-value storage) capability'sini açın.
 *   2. `eas credentials -p ios` ile imza profilini etkileşimli yenileyin.
 *   3. app.json > plugins'e `["./plugins/withIcloudEsitleme", { "etkin": true }]` ekleyin.
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
