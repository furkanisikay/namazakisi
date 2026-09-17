/**
 * `modules/expo-muhafiz-anons` kopru mock'u.
 *
 * Gercek kopru `expo-modules-core` uzerinden native tarafa dokunur → jest
 * ortaminda YOKTUR ve import eden HER suite hic calismadan patar (AGENTS.md
 * `requireNativeModule` tuzagi). Global `moduleNameMapper` ile burasi devreye
 * girer; boylece `IosMuhafizTeslimcisi`'ni DOLAYLI yukleyen suite'ler de ayakta
 * kalir ve her dosyada ayri ayri `jest.mock` yazmak gerekmez.
 *
 * VARSAYILAN DAVRANIS BILINCLI OLARAK "TURKCE SES YOK":
 * `trSesTanimlayici` null doner, `klipVarMi` false. Yani hicbir test istemeden
 * sentez yoluna girmez ve varsayilan bildirim sesi beklenir. Sentez davranisini
 * olcen testler mock'u ACIKCA kurar:
 *
 *   const kopru = require('../../../../modules/expo-muhafiz-anons/src');
 *   kopru.trSesTanimlayici.mockResolvedValue('com.apple.voice.compact.tr-TR.Yelda');
 *   kopru.klipVarMi.mockResolvedValue(true);
 */
const trSesTanimlayici = jest.fn().mockResolvedValue(null);
const klipVarMi = jest.fn().mockResolvedValue(false);
const klipSentezle = jest.fn().mockResolvedValue(false);
const kullanilmayanKlipleriSil = jest.fn().mockResolvedValue(0);
const anonsuKonus = jest.fn().mockResolvedValue(false);
const anonsuSustur = jest.fn().mockResolvedValue(undefined);
// Varsayilan: modul YOK → onizleme ve TTS uyarisi Android yolunda kalir.
const anonsModuluVarMi = jest.fn().mockReturnValue(false);

module.exports = {
  anonsModuluVarMi,
  trSesTanimlayici,
  klipVarMi,
  klipSentezle,
  kullanilmayanKlipleriSil,
  anonsuKonus,
  anonsuSustur,
};
