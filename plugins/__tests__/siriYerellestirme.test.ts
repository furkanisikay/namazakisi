/**
 * iOS `.lproj` dosyaları uygulamayı işletim sistemi gözünde çok dilli yapar (Ayarlar'da dil
 * seçici, Siri ve Kısayollar cihaz dilinde). Bir dil bu yüzden JS seçicisiyle AYNI ANDA açılır:
 * eklentinin `diller` seçeneği (yoksa yalnız `tr`) = `DILLER` içindeki seçilebilir diller.
 */
import * as fs from 'fs';
import * as path from 'path';
import { DILLER } from '../../src/core/dil/diller';

type Eklenti = string | [string, { diller?: string[] }?];

it('Siri/Kısayollar yerelleştirme dilleri = JS seçicisindeki diller (yarım dil yok)', () => {
  const app = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'app.json'), 'utf8')) as {
    expo: { plugins: Eklenti[] };
  };
  const kayit = app.expo.plugins.find((p) => (Array.isArray(p) ? p[0] : p) === './plugins/withSiriKisayollari');
  expect(kayit).toBeDefined();
  const diller = (Array.isArray(kayit) ? kayit[1]?.diller : undefined) ?? ['tr'];
  const secilebilir = DILLER.filter((d) => d.secilebilir).map((d) => d.kod);
  expect([...diller].sort()).toEqual([...secilebilir].sort());
});

it('açık her dil için .lproj dizini var (tr dahil: yoksa Türkçe cihaz İngilizceye düşer)', () => {
  const kaynak = path.join(__dirname, '..', '..', 'targets', 'siri-kisayollari');
  for (const d of DILLER) {
    expect(fs.existsSync(path.join(kaynak, `${d.kod}.lproj`, 'Localizable.strings'))).toBe(true);
  }
});

it('iOS izin metinleri ve hızlı eylem başlıkları her açık dilde (app.json > locales)', () => {
  const app = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'app.json'), 'utf8')) as {
    expo: { locales?: Record<string, string>; plugins: Eklenti[]; ios: { infoPlist: Record<string, unknown> } };
  };
  const plist = app.expo.ios.infoPlist;
  const eklenti = (ad: string) => {
    const k = app.expo.plugins.find((p) => Array.isArray(p) && p[0] === ad);
    return (Array.isArray(k) ? k[1] : {}) as Record<string, unknown>;
  };
  // Türkçe kaynakta tanımlı her izin metni → Info.plist anahtarı.
  const gerekli = [
    ...Object.keys(plist).filter((k) => /^NS.*UsageDescription$/.test(k)),
    ...(eklenti('expo-location').locationWhenInUsePermission ? ['NSLocationWhenInUseUsageDescription'] : []),
    ...(eklenti('expo-location').locationAlwaysAndWhenInUsePermission ? ['NSLocationAlwaysAndWhenInUseUsageDescription'] : []),
    ...(eklenti('expo-location').locationAlwaysPermission ? ['NSLocationAlwaysUsageDescription'] : []),
    ...(eklenti('expo-camera').cameraPermission ? ['NSCameraUsageDescription'] : []),
    ...(eklenti('expo-calendar').calendarPermission ? ['NSCalendarsUsageDescription', 'NSCalendarsFullAccessUsageDescription'] : []),
    'NSAlarmKitUsageDescription',
    ...((plist.UIApplicationShortcutItems as { UIApplicationShortcutItemTitle: string }[]) ?? []).map((h) => h.UIApplicationShortcutItemTitle),
  ];
  const acik = DILLER.filter((d) => d.secilebilir && d.kod !== 'tr').map((d) => d.kod);
  expect(Object.keys(app.expo.locales ?? {}).sort()).toEqual([...acik].sort());
  for (const dil of acik) {
    const metinler = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', app.expo.locales![dil]), 'utf8')) as Record<string, string>;
    expect(gerekli.filter((k) => !metinler[k]?.trim())).toEqual([]);
  }
});
