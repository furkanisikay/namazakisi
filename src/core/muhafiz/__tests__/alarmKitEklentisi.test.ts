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
        expect(dosyalar.sort()).toEqual(['NamazAlarmNiyetleri.swift', 'NamazAlarmPlanlayici.swift', 'NamazAlarmVerisi.swift']);
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

    it('Info.plist: kullanım açıklaması + NSSupportsLiveActivities KOŞULSUZ (widget bayrağından bağımsız); var olan EZİLMEZ', () => {
        const eklenti = require(path.join(KOK, 'plugins/withMuhafizAlarmKit.js')) as {
            infoPlistiDuzenle: (p: Record<string, unknown>) => Record<string, unknown>;
            ALARMKIT_ACIKLAMASI: string;
        };
        expect(eklenti.infoPlistiDuzenle({})).toEqual({
            NSAlarmKitUsageDescription: eklenti.ALARMKIT_ACIKLAMASI,
            NSSupportsLiveActivities: true,
        });
        expect(eklenti.infoPlistiDuzenle({ NSAlarmKitUsageDescription: 'x', NSSupportsLiveActivities: true })).toEqual({
            NSAlarmKitUsageDescription: 'x',
            NSSupportsLiveActivities: true,
        });
    });

    it('canlı etkinlik köprüsü uzantı sinyalini NSSupportsLiveActivities\'ten DEĞİL ayrı anahtardan okur', () => {
        // AlarmKit anahtarı koşulsuz yazdığı için eski sinyal uzantısız build'de görünümsüz etkinlik başlatırdı.
        const kopru = fs.readFileSync(path.join(KOK, 'modules/expo-siri-kisayollari/ios/CanliEtkinlikKoprusu.swift'), 'utf8');
        const widget = require(path.join(KOK, 'plugins/withNamazWidget.js')) as { CANLI_ETKINLIK_ANAHTARI: string };
        expect(kopru).toContain(`forInfoDictionaryKey: "${widget.CANLI_ETKINLIK_ANAHTARI}"`);
        expect(kopru).not.toContain('forInfoDictionaryKey: "NSSupportsLiveActivities"');
    });

    it('widget uzantısı alarmın canlı etkinliğini AYNI meta veri tipiyle tanımlar', () => {
        const widget = require(path.join(KOK, 'plugins/withNamazWidget.js')) as { ALARMKIT_KOPYALARI: string[] };
        expect(widget.ALARMKIT_KOPYALARI).toEqual(['NamazAlarmVerisi.swift']);
        const gorunum = fs.readFileSync(path.join(KOK, 'targets/widget/AlarmCanliEtkinlikWidget.swift'), 'utf8');
        expect(gorunum).toContain('ActivityConfiguration(for: AlarmAttributes<NamazAlarmVerisi>.self)');
        const paket = fs.readFileSync(path.join(KOK, 'targets/widget/NamazWidgetPaketi.swift'), 'utf8');
        expect(paket).toContain('NamazAlarmCanliEtkinlikWidget()');
        // Planlayıcı tipi kendisi TANIMLAMAZ (iki tanım uzantıda çakışırdı; tek kaynak).
        const planlayici = fs.readFileSync(path.join(KOK, 'targets/muhafiz-alarmkit/NamazAlarmPlanlayici.swift'), 'utf8');
        expect(planlayici).not.toContain('struct NamazAlarmVerisi');
    });

    it('ERTELE YOK: planlayıcı ikincil düğmeye ertele niyeti KOYMAZ; eski niyet (göç) yalnız susturur', () => {
        const planlayici = fs.readFileSync(path.join(KOK, 'targets/muhafiz-alarmkit/NamazAlarmPlanlayici.swift'), 'utf8');
        expect(planlayici).not.toContain('NamazAlarmErteleIntent');
        expect(planlayici).not.toMatch(/func ertele\(/);
        const niyetler = fs.readFileSync(path.join(KOK, 'targets/muhafiz-alarmkit/NamazAlarmNiyetleri.swift'), 'utf8');
        const eski = niyetler.slice(niyetler.indexOf('struct NamazAlarmErteleIntent'));
        expect(eski.slice(eski.indexOf('func perform'), eski.indexOf('return .result()'))).toContain(
            'NamazAlarmCekirdegi.kapat(kimlik)'
        );
    });

    it('kilit ekranında "Kıldım" kilit açtırır; Durdur (ve eski Ertele) kilitliyken çalışır (Android M4 ikizi)', () => {
        const niyetler = fs.readFileSync(path.join(KOK, 'targets/muhafiz-alarmkit/NamazAlarmNiyetleri.swift'), 'utf8');
        const blok = (ad: string) => niyetler.slice(niyetler.indexOf(`struct ${ad}`), niyetler.indexOf('func perform', niyetler.indexOf(`struct ${ad}`)));
        expect(blok('NamazAlarmKildimIntent')).toContain('authenticationPolicy: IntentAuthenticationPolicy = .requiresAuthentication');
        expect(blok('NamazAlarmDurdurIntent')).not.toContain('authenticationPolicy');
        expect(blok('NamazAlarmErteleIntent')).not.toContain('authenticationPolicy');
    });

    it('izin açıklaması kibar "siz" dilinde ve boş değil (boşsa AlarmKit HİÇ alarm kurmaz)', () => {
        const eklenti = require(path.join(KOK, 'plugins/withMuhafizAlarmKit.js')) as { ALARMKIT_ACIKLAMASI?: string };
        expect(typeof eklenti).toBe('function');
        expect(eklenti.ALARMKIT_ACIKLAMASI?.length ?? 0).toBeGreaterThan(20);
        expect(eklenti.ALARMKIT_ACIKLAMASI).not.toMatch(/\b(sen|senin)\b/i);
    });
});
