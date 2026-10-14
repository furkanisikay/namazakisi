/**
 * `modules/expo-icloud-esitleme` kopru mock'u (issue #288).
 *
 * Varsayilan: modul YOK → iCloud saglayicisi "yapilandirilmamis" sayilir ve hicbir
 * ekran testi onu gostermez. iCloud yolunu olcen test fonksiyonlari `require(...)` ile
 * alip kurar (AGENTS.md: moduleNameMapper mock'una `jest.requireMock` ile DEGIL).
 */
const icloudModuluVarMi = jest.fn().mockReturnValue(false);
const icloudHesapVarMi = jest.fn().mockResolvedValue(false);
const icloudOku = jest.fn().mockResolvedValue(null);
const icloudYaz = jest.fn().mockResolvedValue(true);
const icloudSil = jest.fn().mockResolvedValue(true);

module.exports = {
  icloudModuluVarMi,
  icloudHesapVarMi,
  icloudOku,
  icloudYaz,
  icloudSil,
};
