const mockAyarlar = jest.fn();
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: { getNotificationSettings: () => mockAyarlar() },
  TriggerType: { TIMESTAMP: 0 },
  AlarmType: { SET_AND_ALLOW_WHILE_IDLE: 1, SET_EXACT_AND_ALLOW_WHILE_IDLE: 3 },
  AndroidNotificationSetting: { NOT_SUPPORTED: -1, DISABLED: 0, ENABLED: 1 },
}));

import { zamanTetigiOlustur } from '../notifeeTetik';

describe('zamanTetigiOlustur', () => {
  it('NÖBETÇİ: tetik daima AlarmManager üzerinden kurulur (WorkManager gecikmesi yok)', async () => {
    mockAyarlar.mockResolvedValue({ android: { alarm: 1 } });
    const t = await zamanTetigiOlustur(1234);
    expect(t).toEqual({ type: 0, timestamp: 1234, alarmManager: { type: 3 } });
  });

  it('Android 12 öncesi (ayar desteklenmiyor) tam alarm kurulur', async () => {
    mockAyarlar.mockResolvedValue({ android: { alarm: -1 } });
    expect((await zamanTetigiOlustur(1)).alarmManager).toEqual({ type: 3 });
  });

  it('tam alarm izni kapalıysa Doze dostu esnek alarma düşer', async () => {
    mockAyarlar.mockResolvedValue({ android: { alarm: 0 } });
    expect((await zamanTetigiOlustur(1)).alarmManager).toEqual({ type: 1 });
  });

  it('izin okunamazsa güvenli tarafta kalır (esnek alarm)', async () => {
    mockAyarlar.mockRejectedValue(new Error('yok'));
    expect((await zamanTetigiOlustur(1)).alarmManager).toEqual({ type: 1 });
  });
});
