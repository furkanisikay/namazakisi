const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Cami verisi (`assets/camiler/tr.bin`) iPhone'da JS'ten okunur ("Namazda sessiz"
// rehberi). Metro `bin`'i varsayılan olarak varlık saymaz; require yalnız
// `camiVeriDosyasi.ios.ts`'te olduğu için dosya Android paketine GİRMEZ.
config.resolver.assetExts = [...config.resolver.assetExts, "bin"];

module.exports = withNativeWind(config, { input: "./global.css" });
