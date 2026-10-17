import {
    ANDROID_DIGER_PAYI,
    ANDROID_MUHAFIZ_PAYI,
    ANDROID_TOPLAM_TAVANI,
    IOS_ALARMKIT_MUHAFIZ_PAYI,
    IOS_ALARMKIT_NAFILE_PAYI,
    IOS_ALARMKIT_PAYLARI,
    IOS_ALARMKIT_TAVANI,
} from '../butceSabitleri';

describe('bütçe sabitleri — pay nöbetçileri (ortak hatırlatma yüzeyleri K1 = B, K2)', () => {
    it('K1 = B: muhafızın Android payı 360 KALIR (ek yüzey payları ondan düşülmez)', () => {
        expect(ANDROID_MUHAFIZ_PAYI).toBe(360);
        expect(ANDROID_MUHAFIZ_PAYI + ANDROID_DIGER_PAYI).toBe(ANDROID_TOPLAM_TAVANI);
    });

    it('K2: iOS AlarmKit payları açık sabit ve toplamı tavanı AŞMAZ', () => {
        expect(IOS_ALARMKIT_MUHAFIZ_PAYI).toBe(16);
        expect(IOS_ALARMKIT_NAFILE_PAYI).toBe(4);
        expect(IOS_ALARMKIT_PAYLARI.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(IOS_ALARMKIT_TAVANI);
        expect(IOS_ALARMKIT_PAYLARI.every((p) => Number.isInteger(p) && p >= 1)).toBe(true);
    });
});
