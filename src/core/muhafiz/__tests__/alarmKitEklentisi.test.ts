/**
 * iOS gerçek alarm (AlarmKit, issue #74) yapılandırma nöbetçisi.
 *
 * `ios/` git'te değildir (CNG) ve Swift yerelde derlenmez → yanlışlıkla düşen bir
 * eklenti satırı ya da silinen bir intent dosyası ancak iOS build'inde (ya da hiç)
 * fark edilirdi: alarm kurulmaz, düğmeye basınca hiçbir şey olmaz.
 */
import * as fs from 'fs';
import * as path from 'path';

const KOK = path.join(__dirname, '../../../..');

describe('withMuhafizAlarmKit eklentisi', () => {
    it("app.json eklentiyi listeler (Siri eklentisinden sonra)", () => {
        const app = JSON.parse(fs.readFileSync(path.join(KOK, 'app.json'), 'utf8'));
        const eklentiler: unknown[] = app.expo.plugins;
        const siri = eklentiler.indexOf('./plugins/withSiriKisayollari');
        const alarm = eklentiler.indexOf('./plugins/withMuhafizAlarmKit');
        expect(alarm).toBeGreaterThan(-1);
        expect(alarm).toBeGreaterThan(siri);
    });

    it('ana hedefe kopyalanan Swift dosyaları: planlayıcı + alarm düğmesi intent\'leri', () => {
        const dosyalar = fs.readdirSync(path.join(KOK, 'targets/muhafiz-alarmkit')).filter((d) => d.endsWith('.swift'));
        expect(dosyalar.sort()).toEqual(['NamazAlarmNiyetleri.swift', 'NamazAlarmPlanlayici.swift']);
        const planlayici = fs.readFileSync(path.join(KOK, 'targets/muhafiz-alarmkit/NamazAlarmPlanlayici.swift'), 'utf8');
        // Pod sınıfı Objective-C çalışma zamanında BU adla bulur (ExpoMuhafizAlarmKitModule).
        expect(planlayici).toContain('@objc(NamazAlarmPlanlayici)');
        const modul = fs.readFileSync(path.join(KOK, 'modules/expo-muhafiz-alarmkit/ios/ExpoMuhafizAlarmKitModule.swift'), 'utf8');
        expect(modul).toContain('NSClassFromString("NamazAlarmPlanlayici")');
        // Her AlarmKit dokunuşu iOS 26 kapısının ardında (dağıtım hedefi 15.1).
        const niyetler = fs.readFileSync(path.join(KOK, 'targets/muhafiz-alarmkit/NamazAlarmNiyetleri.swift'), 'utf8');
        expect(niyetler.match(/struct \w+: LiveActivityIntent/g)?.length).toBe(3);
        expect(niyetler.match(/@available\(iOS 26\.0, \*\)/g)?.length).toBe(3);
    });

    it('izin açıklaması kibar "siz" dilinde ve boş değil (boşsa AlarmKit HİÇ alarm kurmaz)', () => {
        const eklenti = require(path.join(KOK, 'plugins/withMuhafizAlarmKit.js')) as { ALARMKIT_ACIKLAMASI?: string };
        expect(typeof eklenti).toBe('function');
        expect(eklenti.ALARMKIT_ACIKLAMASI?.length ?? 0).toBeGreaterThan(20);
        expect(eklenti.ALARMKIT_ACIKLAMASI).not.toMatch(/\b(sen|senin)\b/i);
    });
});
