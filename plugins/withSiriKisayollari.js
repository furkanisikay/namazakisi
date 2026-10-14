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
 *    surecte calisir, ayni depoyu paylasir. Widget uzantisi (#295) AYRI bir surectir;
 *    App Group'u ve uzanti hedefini `plugins/withNamazWidget.js` kurar (bayrakli).
 *  SDK yukseltmesinden sonra `expo-app-intents`'e gecis degerlendirilmeli (AGENTS.md).
 *
 * Ayrica:
 *  - Gelistirme bolgesi `tr`: App Shortcuts ifadeleri koddaki gelistirme dilinde
 *    sayilir; `en` kalsaydi Turkce ifadeler Ingilizce sanilir ve Turkce Siri
 *    eslestiremezdi.
 *  - AppIntents.framework hedefe ZAYIF (Weak) baglanir: dagitim hedefi 15.1,
 *    AppIntents iOS 16'dadir (bkz. `appIntentsZayifBagla`).
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

/**
 * AppIntents.framework'u ana hedefin "Link Binary With Libraries" fazina ISTEGE BAGLI
 * (Weak) ekler. Iki sebebi var: (1) dagitim hedefi iOS 15.1, framework iOS 16'da →
 * guclu bag iOS 15'te acilista "Library not loaded" ile cokertirdi; (2) Xcode'un
 * metadata cikarimi ("Extract App Intents Metadata") hedefin AppIntents bagimliligini
 * gormezse "Metadata extraction skipped" deyip `Metadata.appintents` URETMEZ.
 */
function appIntentsZayifBagla(proje, projeAdi) {
  const { uuid } = IOSConfig.XcodeUtils.getApplicationNativeTarget({ project: proje, projectName: projeAdi });
  // `addFramework` zaten varsa (yeniden prebuild) `false` doner; idempotent.
  proje.addFramework('AppIntents.framework', { weak: true, target: uuid });
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
