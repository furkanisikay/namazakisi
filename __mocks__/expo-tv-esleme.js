/**
 * `modules/expo-tv-esleme` köprü mock'u (TV eşleştirmesi). VARSAYILAN: modül YOK.
 * Davranış ölçen testler `require(...)` ile alıp kurar (`jest.requireMock` DEĞİL — AGENTS.md).
 */
const tvEslemeModuluVarMi = jest.fn().mockReturnValue(false);
const qrOku = jest.fn().mockResolvedValue(null);
const tvyeGonder = jest.fn().mockResolvedValue('{"ok":true}');

module.exports = { tvEslemeModuluVarMi, qrOku, tvyeGonder };
