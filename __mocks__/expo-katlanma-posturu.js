/**
 * `modules/expo-katlanma-posturu` köprü mock'u (masaüstü postürü, issue #283).
 *
 * Gerçek köprü `expo-modules-core` üzerinden native tarafa dokunur; jest'te yoktur.
 * Global `moduleNameMapper` ile burası devreye girer.
 *
 * VARSAYILAN: modül YOK — postür "düz", dinleyici hiç çağrılmaz. Davranış ölçen
 * testler mock'u `require(...)` ile alıp kurar (`jest.requireMock` DEĞİL — AGENTS.md):
 *
 *   const kopru = require('../../../modules/expo-katlanma-posturu/src');
 *   kopru.sonPostur.mockReturnValue({ durum: 'yariAcik', yon: 'yatay', ... });
 *   kopru.posturDinle.mockImplementation((cb) => { yayinla = cb; return { remove } });
 */
const katlanmaModuluVarMi = jest.fn().mockReturnValue(false);
const sonPostur = jest.fn().mockReturnValue(null);
const menteseVarMi = jest.fn().mockReturnValue(null);
const posturDinle = jest.fn().mockImplementation(() => ({ remove: jest.fn() }));

module.exports = {
    katlanmaModuluVarMi,
    sonPostur,
    posturDinle,
    menteseVarMi,
};
