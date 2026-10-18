/**
 * `modules/expo-google-yetki` kopru mock'u (issue #288, Google Drive yetkisi).
 *
 * Varsayilan: modul YOK → Drive saglayicisi "yapilandirilmamis" sayilir ve hicbir ekran
 * testi onu gostermez. Drive yolunu olcen testler saglayiciya kendi `yetki` kaynagini
 * enjekte eder ya da bu fonksiyonlari `require(...)` ile alip kurar (AGENTS.md:
 * moduleNameMapper mock'una `jest.requireMock` ile DEGIL).
 */
const googleYetkisiKullanilabilirMi = jest.fn().mockReturnValue(false);
const googleYetkiAl = jest.fn().mockResolvedValue({ durum: 'hata', mesaj: 'kopru yok' });
const googleBelirteciTemizle = jest.fn().mockResolvedValue(false);
const googleErisimiGeriAl = jest.fn().mockResolvedValue(false);
const yetkiSonucunuCoz = jest.fn((ham) => ham);

module.exports = {
  googleYetkisiKullanilabilirMi,
  googleYetkiAl,
  googleBelirteciTemizle,
  googleErisimiGeriAl,
  yetkiSonucunuCoz,
};
