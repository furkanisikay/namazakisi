import {
    android16Qpr2EnAz,
    androidApiEnAz,
    androidSurumAdi,
    androidTamSurumCoz,
    iosEnAz,
    isletimSistemiSurumu,
} from '../surum';

describe('isletimSistemiSurumu', () => {
    it('iOS dize sürümünü ayrıştırır', () => {
        expect(isletimSistemiSurumu('ios', '26.0.1')).toEqual({ platform: 'ios', ana: 26, alt: 0, tam: '26.0.1' });
        expect(isletimSistemiSurumu('ios', '18.5')).toMatchObject({ ana: 18, alt: 5 });
        expect(isletimSistemiSurumu('ios', 17)).toMatchObject({ ana: 17, alt: 0 });
    });

    it('Android API düzeyini kullanıcının tanıdığı ada çevirir', () => {
        expect(isletimSistemiSurumu('android', 34)).toEqual({ platform: 'android', ana: 34, alt: 0, tam: '14' });
        expect(androidSurumAdi(36)).toBe('16');
        expect(androidSurumAdi(99)).toBe('API 99');
    });

    it('Android 16 tam sürümünden QPR alt düzeyini alır (ana uyuşmazsa yok sayar)', () => {
        expect(isletimSistemiSurumu('android', 36, 3600001)?.alt).toBe(1);
        expect(isletimSistemiSurumu('android', 36, 3500001)?.alt).toBe(0);
        expect(androidTamSurumCoz(3600001)).toEqual({ ana: 36, alt: 1 });
        expect(androidTamSurumCoz(36)).toBeNull();
        expect(androidTamSurumCoz(null)).toBeNull();
    });

    it('okunamayan değer ya da bilinmeyen platform → null', () => {
        expect(isletimSistemiSurumu('ios', undefined)).toBeNull();
        expect(isletimSistemiSurumu('ios', 'beta')).toBeNull();
        expect(isletimSistemiSurumu('android', 'x')).toBeNull();
        expect(isletimSistemiSurumu('android', 0)).toBeNull();
        expect(isletimSistemiSurumu('web', 1)).toBeNull();
    });
});

describe('sürüm kapıları — üç değerli (null = sus)', () => {
    const ios18 = isletimSistemiSurumu('ios', '18.2');
    const ios26 = isletimSistemiSurumu('ios', '26.0');
    const a34 = isletimSistemiSurumu('android', 34);
    it('iosEnAz', () => {
        expect(iosEnAz(ios18, 26)).toBe(false);
        expect(iosEnAz(ios26, 26)).toBe(true);
        expect(iosEnAz(a34, 26)).toBeNull();
        expect(iosEnAz(null, 26)).toBeNull();
    });
    it('androidApiEnAz', () => {
        expect(androidApiEnAz(a34, 35)).toBe(false);
        expect(androidApiEnAz(a34, 34)).toBe(true);
        expect(androidApiEnAz(ios26, 34)).toBeNull();
    });
    it('android16Qpr2EnAz: API 36 alt düzey bilinmiyorsa sus', () => {
        expect(android16Qpr2EnAz(isletimSistemiSurumu('android', 35))).toBe(false);
        expect(android16Qpr2EnAz(isletimSistemiSurumu('android', 36))).toBeNull();
        expect(android16Qpr2EnAz(isletimSistemiSurumu('android', 36, 3600001))).toBe(true);
        expect(android16Qpr2EnAz(isletimSistemiSurumu('android', 37))).toBe(true);
        expect(android16Qpr2EnAz(ios26)).toBeNull();
    });
});
