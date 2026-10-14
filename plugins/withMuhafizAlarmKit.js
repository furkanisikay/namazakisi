/**
 * Expo Config Plugin — muhafız GERÇEK ALARMI, iOS 26 AlarmKit (issue #74).
 *
 * `withSiriKisayollari` deseninin ikizi (oradaki gerekçeler aynen geçerli):
 *  - `targets/muhafiz-alarmkit/` altındaki Swift dosyalarını prebuild'de ANA UYGULAMA
 *    HEDEFİNE kopyalar + bağlar. Alarm düğmeleri App Intents'tir (`LiveActivityIntent`);
 *    intent metadata'sı yalnız intent'i derleyen hedef için çıkarılır, pod içindeki
 *    intent'i sistem çalıştıramaz. `ios/` git'te DEĞİLDİR (CNG).
 *  - AlarmKit (iOS 26), ActivityKit (16.1) ve AppIntents (16) ana hedefe ZAYIF (Weak)
 *    bağlanır: dağıtım hedefi 15.1, güçlü bağ eski sistemde açılışta "Library not
 *    loaded" ile çökertirdi. AppIntents'i Siri eklentisi de ekler; `addFramework`
 *    zaten varsa no-op'tur (sıra bağımsız).
 *  - `NSAlarmKitUsageDescription` Info.plist'e yazılır (anahtar yoksa AlarmKit HİÇ alarm
 *    kurmaz). app.json'daki `ios.infoPlist` bloğuna değil buraya konması bilinçli: aynı
 *    blok başka eklentilerce de genişletiliyor; değer zaten varsa EZİLMEZ.
 *  - `NSSupportsLiveActivities = true` KOŞULSUZ yazılır (yoksa): AlarmKit alarmı telefon
 *    kullanılırken Dinamik Ada / kilit ekranında bir canlı etkinlik olarak sunulur
 *    (ActivityKit). Widget uzantısından BAĞIMSIZDIR — uzantı bayrağı kapalı build'de de
 *    gerçek alarm kurulur. "Bu build canlı etkinlik ÇİZER mi?" sinyali artık bu anahtar
 *    DEĞİL, `withNamazWidget`'ın yazdığı `NamazAkisiCanliEtkinlikUzantisi`dir
 *    (`CanliEtkinlikKoprusu.destekleniyor`); aksi halde uzantısız build görünümü
 *    olmayan etkinlik başlatırdı.
 */
const fs = require('fs');
const path = require('path');

// Global eas-cli bağlamında @expo/config-plugins bulunamayabilir → eklenti no-op olur.
// (Üst düzey `return` KULLANILMAZ: Node kabul eder ama Babel/jest ayrıştıramaz.)
let eklentiApi = null;
try {
  eklentiApi = require('@expo/config-plugins');
} catch {
  eklentiApi = null;
}

const KAYNAK_DIZINI = path.join(__dirname, '..', 'targets', 'muhafiz-alarmkit');

/** Sistem izin penceresinde görünen açıklama (kibar "siz"). */
const ALARMKIT_ACIKLAMASI =
  'Namaz hatırlatmasında "gerçek alarm" seçtiğiniz adımlar, telefonunuz sessizdeyken veya Odak açıkken de duyulsun diye alarm olarak kurulur.';

/** Zayıf bağlanacak çerçeveler (dağıtım hedefinden yeni olanlar). */
const ZAYIF_CERCEVELER = ['AlarmKit.framework', 'ActivityKit.framework', 'AppIntents.framework'];

function swiftDosyalari() {
  return fs
    .readdirSync(KAYNAK_DIZINI)
    .filter((ad) => ad.endsWith('.swift'))
    .sort();
}

function kaynaklariEkle(proje, modRequest) {
  const { IOSConfig } = eklentiApi;
  const projeAdi = IOSConfig.XcodeUtils.getProjectName(modRequest.projectRoot);
  let sonuc = proje;
  for (const ad of swiftDosyalari()) {
    sonuc = IOSConfig.XcodeProjectFile.createBuildSourceFile({
      project: sonuc,
      nativeProjectRoot: modRequest.platformProjectRoot,
      filePath: path.join(projeAdi, ad),
      fileContents: fs.readFileSync(path.join(KAYNAK_DIZINI, ad), 'utf8'),
      overwrite: true,
    });
  }
  return { proje: sonuc, projeAdi };
}

function cerceveleriZayifBagla(proje, projeAdi) {
  const { IOSConfig } = eklentiApi;
  const { uuid } = IOSConfig.XcodeUtils.getApplicationNativeTarget({ project: proje, projectName: projeAdi });
  for (const ad of ZAYIF_CERCEVELER) {
    proje.addFramework(ad, { weak: true, target: uuid });
  }
}

/** Info.plist'e AlarmKit'in istediği anahtarları yazar; var olan değeri EZMEZ (saf, test edilir). */
function infoPlistiDuzenle(plist) {
  if (!plist.NSAlarmKitUsageDescription) {
    plist.NSAlarmKitUsageDescription = ALARMKIT_ACIKLAMASI;
  }
  if (plist.NSSupportsLiveActivities === undefined) {
    plist.NSSupportsLiveActivities = true;
  }
  return plist;
}

function withMuhafizAlarmKit(config) {
  if (!eklentiApi) return config;
  const { withInfoPlist, withXcodeProject } = eklentiApi;
  config = withInfoPlist(config, (mod) => {
    mod.modResults = infoPlistiDuzenle(mod.modResults);
    return mod;
  });
  return withXcodeProject(config, (mod) => {
    const { proje, projeAdi } = kaynaklariEkle(mod.modResults, mod.modRequest);
    cerceveleriZayifBagla(proje, projeAdi);
    mod.modResults = proje;
    return mod;
  });
}

module.exports = withMuhafizAlarmKit;
module.exports.ALARMKIT_ACIKLAMASI = ALARMKIT_ACIKLAMASI;
module.exports.infoPlistiDuzenle = infoPlistiDuzenle;
