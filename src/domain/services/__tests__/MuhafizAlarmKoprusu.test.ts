/**
 * Gerçek alarm köprüsü (issue #74) — HİÇBİR yöntem fırlatmaz; köprü yoksa güvenli
 * varsayılan (`false` / `null` / no-op). `null` izin = bilinmiyor (ekran uyarı göstermez).
 */
import { NativeModules, Platform } from 'react-native';
import {
    alarmKoprusuVarMi,
    alarmPlanla,
    onekliAlarmlariIptalEt,
    tamEkranIzniVarMi,
    bekleyenAlarmSayisi,
    vakitAlarmlariniSustur,
} from '../MuhafizAlarmKoprusu';
import type { AlarmYuku } from '../../../core/muhafiz/alarmYuku';

const YUK = { kimlik: 'muhafiz_2026-01-01_vakit_ogle_seviye_1_dk_30', tetikMs: 123 } as AlarmYuku;

const modulKur = (m: Record<string, jest.Mock> | undefined) => {
    (NativeModules as Record<string, unknown>).MuhafizAlarm = m;
};

afterEach(() => {
    modulKur(undefined);
    jest.restoreAllMocks();
});

describe('MuhafizAlarmKoprusu', () => {
    test('iOS ya da köprü yokken: kurulamaz, izin bilinmiyor', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        modulKur({ planla: jest.fn().mockResolvedValue(true) });
        expect(alarmKoprusuVarMi()).toBe(false);
        expect(await alarmPlanla(YUK)).toBe(false);
        expect(await tamEkranIzniVarMi()).toBeNull();
        expect(await bekleyenAlarmSayisi()).toBe(0);
    });

    test('Android: yük JSON metni olarak gider; hata false olur (fırlatmaz)', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const planla = jest.fn().mockResolvedValue(true);
        modulKur({ planla, onekliIptalEt: jest.fn().mockRejectedValue(new Error('yok')) });
        expect(await alarmPlanla(YUK)).toBe(true);
        expect(planla).toHaveBeenCalledWith(YUK.kimlik, YUK.tetikMs, JSON.stringify(YUK));

        planla.mockRejectedValueOnce(new Error('SecurityException'));
        expect(await alarmPlanla(YUK)).toBe(false);
        await expect(onekliAlarmlariIptalEt('muhafiz_')).resolves.toBeUndefined();
    });

    test('Android: tam ekran izni boolean değilse bilinmiyor (null)', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        modulKur({ tamEkranIzniVarMi: jest.fn().mockResolvedValue(false) });
        expect(await tamEkranIzniVarMi()).toBe(false);
        modulKur({ tamEkranIzniVarMi: jest.fn().mockResolvedValue('x') });
        expect(await tamEkranIzniVarMi()).toBeNull();
    });

    test('Android: "Kıldım" çalan alarmı da susturan yöntemi kullanır; eski ikilide önekli iptale düşer', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const sustur = jest.fn().mockResolvedValue(1);
        const onekliIptalEt = jest.fn().mockResolvedValue(0);
        modulKur({ vakitAlarmlariniSustur: sustur, onekliIptalEt });
        await vakitAlarmlariniSustur('muhafiz_2026-01-01_vakit_ogle');
        expect(sustur).toHaveBeenCalledWith('muhafiz_2026-01-01_vakit_ogle');
        expect(onekliIptalEt).not.toHaveBeenCalled();

        modulKur({ onekliIptalEt });
        await vakitAlarmlariniSustur('muhafiz_2026-01-01_vakit_ogle');
        expect(onekliIptalEt).toHaveBeenCalledWith('muhafiz_2026-01-01_vakit_ogle');

        // Boş önek hiçbir şeyi susturmaz; hata fırlatmaz.
        sustur.mockClear();
        modulKur({ vakitAlarmlariniSustur: sustur.mockRejectedValue(new Error('x')) });
        await expect(vakitAlarmlariniSustur('')).resolves.toBeUndefined();
        expect(sustur).not.toHaveBeenCalled();
        await expect(vakitAlarmlariniSustur('muhafiz_')).resolves.toBeUndefined();
    });
});
