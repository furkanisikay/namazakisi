/**
 * Dışa açık (`android:exported="true"`) bileşen envanteri (güvenlik denetimi 2026-11).
 *
 * Dışa açık her bileşen cihazdaki BAŞKA bir uygulamanın çağırabildiği bir giriş kapısıdır.
 * Liste bilinçli tutulur: yeni bir bileşen ancak çağıranı doğruluyorsa (güven listesi,
 * belirteç, sistem `BIND_*` izni) ya da hiç dış girdi okumuyorsa buraya eklenir.
 * Ayrıntı: `docs/ajan/android-native.md > Dışa açık bileşenler`.
 */
import * as fs from 'fs';
import * as path from 'path';

const manifest = fs.readFileSync(
  path.join(__dirname, '..', '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
  'utf8',
);

/** `<activity|service|receiver|provider …>` açılış etiketleri (yorumlar ayıklanmış). */
const bilesenler = [...manifest.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(activity|service|receiver|provider)\b([^>]*)>/g)].map(
  (m) => ({
    tur: m[1],
    ad: /android:name="([^"]+)"/.exec(m[2])?.[1] ?? '',
    exported: /android:exported="([^"]+)"/.exec(m[2])?.[1],
    izin: /android:permission="([^"]+)"/.exec(m[2])?.[1],
    kaldirildi: /tools:node="remove"/.test(m[2]),
  }),
);

const DISA_ACIK = [
  '.MainActivity',
  // Widget sağlayıcıları: sistem (AppWidgetManager) çağırır.
  '.widget.NamazWidget',
  '.widget.NamazGenisBoyutWidget',
  '.widget.NamazKapakWidget',
  '.widget.NamazKlasikWidget',
  '.widget.NamazKlasikGenisWidget',
  '.widget.GununAyetiWidget',
  '.widget.WidgetYapilandirmaActivity',
  // Sistem BIND_QUICK_SETTINGS_TILE izniyle bağlanır.
  '.kildim.KildimKutusuServisi',
  // Güven listesi (KildimGuvenKurallari) çağıranı sınıflandırır.
  '.kildim.KildimKisayolActivity',
  // Locale/Tasker eklentisi: callingPackage + paket başına belirteç.
  '.otomasyon.OtomasyonEylemActivity',
  '.otomasyon.OtomasyonKosulActivity',
  '.otomasyon.OtomasyonOlayActivity',
  '.otomasyon.OtomasyonEylemAlici',
  '.otomasyon.OtomasyonKosulAlici',
  // Play hizmetleri bağlanır (WearableListenerService çağıranı doğrular).
  '.wear.WearDinleyiciServisi',
  // Car App Library: host doğrulaması createHostValidator'da.
  '.arac.NamazAracServisi',
].sort();

it('her bileşen exported niteliğini açıkça bildirir', () => {
  expect(bilesenler.filter((b) => !b.kaldirildi && b.exported === undefined).map((b) => b.ad)).toEqual([]);
});

it('dışa açık bileşenler bilinçli listeyle birebir aynıdır', () => {
  expect(bilesenler.filter((b) => b.exported === 'true').map((b) => b.ad).sort()).toEqual(DISA_ACIK);
});

it('yalnız sistemin ve kendi PendingIntent\'imizin çağırdığı alıcılar dışa kapalıdır', () => {
  const kapali = (ad: string) => bilesenler.find((b) => b.ad === ad)?.exported;
  expect(kapali('.widget.NamazWidgetAlarmAlici')).toBe('false');
  expect(kapali('.alarm.MuhafizAlarmAlici')).toBe('false');
  expect(kapali('.widget.WidgetKildimAlici')).toBe('false');
  expect(kapali('.kildim.SayacKildimAlici')).toBe('false');
});

it('hızlı ayarlar kutusu yalnız sistem izniyle bağlanabilir', () => {
  expect(bilesenler.find((b) => b.ad === '.kildim.KildimKutusuServisi')?.izin).toBe('android.permission.BIND_QUICK_SETTINGS_TILE');
});

it('yedekleme kapalı kalır (adb/bulut yedeği belirteçleri taşımasın)', () => {
  expect(manifest).toContain('android:allowBackup="false"');
});
