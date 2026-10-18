/**
 * Gerçek alarm rıza modalı (issue #74) — iPhone'da ne olacağı AlarmKit durumuna göre
 * SÖYLENİR (sessiz sapma yok): iOS 26 + AlarmKit varsa gerçek alarm, yoksa uzun sesli bildirim.
 */
jest.mock('../../../../core/theme', () => ({ useRenkler: () => ({}) }));
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');

import { alarmOnayMaddeleri, iosAlarmKitVarMi } from '../AlarmOnayModal';

const metin = (m: { metin: string }[]) => m.map((x) => x.metin).join(' ');

describe('alarmOnayMaddeleri', () => {
    it('iOS + AlarmKit yok/bilinmiyor: uzun sesli bildirim ve sessiz anahtar uyarısı', () => {
        for (const durum of ['desteklenmiyor', null] as const) {
            const m = metin(alarmOnayMaddeleri('ios', durum));
            expect(m).toContain('30 saniyelik');
            expect(m).toContain('sessiz anahtarı açıkken ses duyulmaz');
        }
    });

    it('iOS + AlarmKit izin bekliyor: gerçek alarm + izin isteneceği söylenir', () => {
        const m = metin(alarmOnayMaddeleri('ios', 'belirsiz'));
        expect(m).toContain('alarmı çalar');
        expect(m).toContain('alarm izni isteyecek');
        expect(m).not.toContain('30 saniyelik');
    });

    it('iOS + AlarmKit yok: sürüm cümlesi yalnız gerçekten eski sürümde', () => {
        expect(metin(alarmOnayMaddeleri('ios', 'desteklenmiyor', { iosSurum: 18 }))).toContain('bu iPhone iOS 18');
        for (const iosSurum of [26, null]) {
            const m = metin(alarmOnayMaddeleri('ios', 'desteklenmiyor', { iosSurum }));
            expect(m).not.toContain('iOS 26');
            expect(m).not.toMatch(/güncelle/i);
        }
    });

    it('Android: tam ekran izni kapalıysa "tam ekran açılır" vaadi yerine izin şartı', () => {
        expect(metin(alarmOnayMaddeleri('android', null, { tamEkran: false }))).toContain('ayrıca izin vermeniz gerekir');
        expect(metin(alarmOnayMaddeleri('android', null, { tamEkran: true }))).toContain('tam ekran açılır');
    });

    it('iOS + izin reddedilmiş: Ayarlar yönlendirmesi', () => {
        expect(metin(alarmOnayMaddeleri('ios', 'reddedildi'))).toContain('Ayarlar');
    });

    it('iOS maddelerinde ikonlar tekil (liste anahtarı) ve "sen" dili yok', () => {
        for (const durum of ['belirsiz', 'izinli', 'reddedildi', 'desteklenmiyor'] as const) {
            const m = alarmOnayMaddeleri('ios', durum);
            expect(new Set(m.map((x) => x.ikon)).size).toBe(m.length);
            for (const x of m) expect(x.metin).not.toMatch(/\b(sen|senin)\b/i);
        }
    });

    it('Android maddeleri AlarmKit durumundan etkilenmez', () => {
        expect(alarmOnayMaddeleri('android', 'izinli')).toEqual(alarmOnayMaddeleri('android'));
    });

    it('iosAlarmKitVarMi: yalnız iOS 26 durumları', () => {
        expect(iosAlarmKitVarMi('izinli')).toBe(true);
        expect(iosAlarmKitVarMi('reddedildi')).toBe(true);
        expect(iosAlarmKitVarMi('desteklenmiyor')).toBe(false);
        expect(iosAlarmKitVarMi(null)).toBe(false);
    });
});
