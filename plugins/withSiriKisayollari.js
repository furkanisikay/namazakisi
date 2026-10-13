/**
 * Expo Config Plugin — Siri, Kisayollar ve Odak filtresi (App Intents, issue #279).
 *
 * `targets/siri-kisayollari/*.swift` dosyalarini prebuild'de ANA UYGULAMA HEDEFINE
 * ekler (`ios/<Proje>/` altina kopyalar + Xcode projesine baglar). `ios/` git'te
 * DEGILDIR (CNG); dogruluk kaynagi `targets/` altindaki dosyalardir.
 *
 * NEDEN UZANTI DEGIL, NEDEN @bacons/apple-targets DEGIL:
 *  - App Intents metadata'si yalniz intent'i derleyen HEDEF icin cikarilir. Uzantida
 *    (App Intents Extension) `openAppWhenRun` isteyen intent ("Kibleyi ac") uygulamada
 *    da bulunmak zorundadir; @bacons/apple-targets ana hedefe dosya eklemeyi yalnizca
 *    bir alt hedefin `_shared` klasoruyle yapar → ayni intent'ler ve
 *    `AppShortcutsProvider` IKI ikilide birden derlenirdi.
 *  - Uzanti yeni bir paket kimligi + imza profili + App Group ister; EAS'in
 *    etkilesimsiz (`--non-interactive`) iOS build'i bunlari Apple oturumu olmadan
 *    uretemez → yayin hatti kirilirdi.
 *  - Ana hedefte intent'ler ve JS koprusu (`modules/expo-siri-kisayollari`) AYNI
 *    surecte calisir, ayni `UserDefaults`'u paylasir; App Group gerekmez.
 *  SDK yukseltmesinden sonra `expo-app-intents`'e gecis degerlendirilmeli (AGENTS.md).
 *
 * Ayrica:
 *  - Gelistirme bolgesi `tr`: App Shortcuts ifadeleri koddaki gelistirme dilinde
 *    sayilir; `en` kalsaydi Turkce ifadeler Ingilizce sanilir ve Turkce Siri
 *    eslestiremezdi.
 *  - AppIntents ZAYIF baglanir: dagitim hedefi 15.1, AppIntents iOS 16'dadir.
 *    Guclu bagli kalsaydi uygulama iOS 15'te acilista "Library not loaded" ile cokerdi.
 */
const fs = require('fs');
const path = require('path');

let withXcodeProject;
let IOSConfig;
try {
  ({ withXcodeProject, IOSConfig } = require('@expo/config-plugins'));
} catch {
  // Global eas-cli baglaminda @expo/config-plugins bulunamayabilir → no-op
  // (withPlayStoreDependency ile ayni desen).
  module.exports = function withSiriKisayollari(config) {
    return config;
  };
  return;
}

const KAYNAK_DIZINI = path.join(__dirname, '..', 'targets', 'siri-kisayollari');
const GELISTIRME_BOLGESI = 'tr';
const ZAYIF_BAGLANTI = ['"-weak_framework"', '"AppIntents"'];

/** Kopyalanacak Swift dosyalari (sirali → deterministik proje dosyasi). */
function swiftDosyalari() {
  return fs
    .readdirSync(KAYNAK_DIZINI)
    .filter((ad) => ad.endsWith('.swift'))
    .sort();
}

function kaynaklariEkle(proje, modRequest) {
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

function gelistirmeBolgesiniAyarla(proje) {
  const { firstProject } = proje.getFirstProject();
  firstProject.developmentRegion = GELISTIRME_BOLGESI;
  const bolgeler = Array.isArray(firstProject.knownRegions) ? firstProject.knownRegions : [];
  if (!bolgeler.includes(GELISTIRME_BOLGESI)) bolgeler.unshift(GELISTIRME_BOLGESI);
  firstProject.knownRegions = bolgeler;
}

function appIntentsZayifBagla(proje, projeAdi) {
  const { target } = IOSConfig.XcodeUtils.getApplicationNativeTarget({ project: proje, projectName: projeAdi });
  const yapilandirmalar = IOSConfig.XcodeUtils.getBuildConfigurationsForListId(
    proje,
    target.buildConfigurationList
  );
  for (const [, yapilandirma] of yapilandirmalar) {
    const ayarlar = yapilandirma.buildSettings;
    let bayraklar = ayarlar.OTHER_LDFLAGS;
    if (!Array.isArray(bayraklar)) bayraklar = bayraklar ? [bayraklar] : ['"$(inherited)"'];
    if (!bayraklar.includes(ZAYIF_BAGLANTI[1])) bayraklar = [...bayraklar, ...ZAYIF_BAGLANTI];
    ayarlar.OTHER_LDFLAGS = bayraklar;
  }
}

module.exports = function withSiriKisayollari(config) {
  return withXcodeProject(config, (mod) => {
    const { proje, projeAdi } = kaynaklariEkle(mod.modResults, mod.modRequest);
    gelistirmeBolgesiniAyarla(proje);
    appIntentsZayifBagla(proje, projeAdi);
    mod.modResults = proje;
    return mod;
  });
};
