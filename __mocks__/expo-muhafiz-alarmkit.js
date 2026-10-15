/**
 * `modules/expo-muhafiz-alarmkit` köprü mock'u (iOS 26 AlarmKit, issue #74).
 *
 * VARSAYILAN: modül YOK → durum "desteklenmiyor", hiçbir alarm kurulmaz. Böylece
 * `IosMuhafizTeslimcisi`'ni DOLAYLI yükleyen suite'ler bugünkü (bildirim) yolda kalır.
 * AlarmKit yolunu ölçen test mock'u açıkça kurar ve sonunda geri alır:
 *
 *   const kopru = require('../../../../modules/expo-muhafiz-alarmkit/src');
 *   kopru.alarmKitDurumu.mockResolvedValue('izinli');
 *   kopru.alarmKitPlanla.mockResolvedValue(true);
 *
 * `jest.requireMock` DEĞİL `require` (moduleNameMapper'lı mock'ta ayrı örnek döner).
 */
const alarmKitModuluVarMi = jest.fn().mockReturnValue(false);
const alarmKitDurumu = jest.fn().mockResolvedValue('desteklenmiyor');
const alarmKitIzniIste = jest.fn().mockResolvedValue('desteklenmiyor');
const alarmKitPlanla = jest.fn().mockResolvedValue(false);
const alarmKitIptalEt = jest.fn().mockResolvedValue(undefined);
const alarmKitKayitlari = jest.fn().mockResolvedValue([]);
const alarmDegisikliginiDinle = jest.fn().mockReturnValue(() => undefined);
const alarmKitNafileKildimleriniAl = jest.fn().mockResolvedValue([]);

module.exports = {
  alarmKitModuluVarMi,
  alarmKitDurumu,
  alarmKitIzniIste,
  alarmKitPlanla,
  alarmKitIptalEt,
  alarmKitKayitlari,
  alarmDegisikliginiDinle,
  alarmKitNafileKildimleriniAl,
};
