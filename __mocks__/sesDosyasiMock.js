/**
 * Ses/varlik dosyasi mock'u (mp3, wav, m4a, ogg).
 *
 * jest.config.js `transform` alanini TAMAMEN override ettigi icin react-native
 * preset'inin varlik donusturucusu devre disi kalir → `require('...mp3')` ham
 * ikili veriyi JS olarak ayristirmaya calisir ve "SyntaxError: Invalid or
 * unexpected token" verir. moduleNameMapper bu dosyaya yonlendirir.
 *
 * Metro gercekte SAYISAL bir varlik kimligi dondurur; sahte deger de sayidir ki
 * `SesKaynagi = number` sozlesmesi testte de gecerli olsun.
 */
module.exports = 1;
