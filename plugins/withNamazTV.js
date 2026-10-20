/**
 * Expo Config Plugin — Apple TV vakit panosu (Android TV `tv/` panosunun tvOS ikizi).
 *
 * TEK yeni hedef kurar: `NamazTV` (tvOS SwiftUI uygulamasi). Telefona GOMULMEZ (tvOS
 * uygulamasi bagimsiz bir urundur) ve ana hedefe bagimli DEGILDIR → EAS'in iOS build'i
 * (ana sema) onu hic derlemez. Kaynak: `targets/tv/` (uygulama) + `targets/tv/ortak/`
 * (saf cekirdek: adhan JS'in Turkey yolunun Swift tasimasi, pano durumu, bicim) +
 * `tv/app/src/main/assets/iller.json` (Android TV ile AYNI dosya, tek kaynak
 * `scripts/tv/tv-verisi-uret.js`). `targets/tv/test/` hicbir hedefe girmez (Linux/macOS
 * `swiftc` test kosucusu; telefonun adhan fiksturuyle epoch ms birebir).
 *
 * PAKET KIMLIGI: ana uygulamayla AYNI (`com.furkanisikay.namazakisi`) — App Store "universal
 * purchase": tek kayit, tek sayfa (Android TV'nin ayni applicationId kararinin ikizi). Bu,
 * App Store Connect kaydina tvOS platformu eklenmesini ve ayri bir tvOS arsivi/yuklemesini
 * gerektirir (EAS bu hedefi arsivlemez) — sahibin adimlari `docs/ajan/ios.md`.
 *
 * BAYRAK: `app.json` → `["./plugins/withNamazTV", { "etkin": false }]`. VARSAYILAN KAPALI:
 * kapaliyken eklenti HICBIR SEY yapmaz → TestFlight hatti birebir eskisi. `NAMAZ_IOS_TV=1`
 * bayragi ezer (`0` kapatir): imzasiz simulator derlemesi ve ekran goruntusu hatti icindir;
 * EAS'te bu degisken YOKTUR.
 *
 * Team ID YAZILMAZ (`DEVELOPMENT_TEAM`).
 */
const fs = require('fs');
const path = require('path');

// Global eas-cli baglaminda @expo/config-plugins bulunamayabilir → eklenti no-op.
// Ust duzey `return` KULLANILMAZ: jest (babel) modulu ayristiramaz.
let eklentiAraclari = null;
try {
  eklentiAraclari = require('@expo/config-plugins');
} catch {
  eklentiAraclari = null;
}

const KOK = path.join(__dirname, '..');
const TV_KAYNAGI = path.join(KOK, 'targets', 'tv');
const ORTAK_KAYNAK = path.join(TV_KAYNAGI, 'ortak');
const ILLER = path.join(KOK, 'tv', 'app', 'src', 'main', 'assets', 'iller.json');

const TV_HEDEFI = 'NamazTV';
/** tvOS 17: `TimelineView`, `LazyVGrid`, `.monospacedDigit()` Font, iki parametreli `onChange`. */
const TVOS_DAGITIM_HEDEFI = '17.0';

function etkinMi(secenekler, ortam = process.env) {
  const deger = ortam.NAMAZ_IOS_TV;
  if (deger === '1' || deger === 'true') return true;
  if (deger === '0' || deger === 'false') return false;
  return Boolean(secenekler && secenekler.etkin === true);
}

function swiftDosyalari(dizin) {
  if (!fs.existsSync(dizin)) return [];
  return fs
    .readdirSync(dizin)
    .filter((ad) => ad.endsWith('.swift'))
    .sort();
}

function xmlKacir(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** tvOS uygulamasinin Info.plist'i. Surum ana uygulamayla AYNI tutulur. */
function tvInfoPlist(surum, derleme) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>tr</string>
  <key>CFBundleDisplayName</key>
  <string>Namaz Akışı</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleShortVersionString</key>
  <string>${xmlKacir(surum)}</string>
  <key>CFBundleVersion</key>
  <string>${xmlKacir(derleme)}</string>
  <key>ITSAppUsesNonExemptEncryption</key>
  <false/>
  <key>UILaunchScreen</key>
  <dict/>
  <key>UIRequiredDeviceCapabilities</key>
  <array>
    <string>arm64</string>
  </array>
  <key>UIUserInterfaceStyle</key>
  <string>Dark</string>
</dict>
</plist>
`;
}

const tirnak = (s) => `"${String(s).replace(/"/g, '\\"')}"`;

function nesneEkle(proje, bolum, uuid, nesne, yorum) {
  const nesneler = proje.hash.project.objects;
  if (!nesneler[bolum]) nesneler[bolum] = {};
  nesneler[bolum][uuid] = nesne;
  if (yorum !== undefined) nesneler[bolum][`${uuid}_comment`] = yorum;
}

function fazEkle(proje, tur, yorum, dosyalar) {
  const uuid = proje.generateUuid();
  nesneEkle(
    proje,
    tur,
    uuid,
    { isa: tur, buildActionMask: 2147483647, files: dosyalar, runOnlyForDeploymentPostprocessing: 0 },
    yorum
  );
  return { value: uuid, comment: yorum };
}

/** tvOS hedefini kurar. Zaten varsa (yeniden prebuild) hicbir sey eklenmez (idempotent). */
function tvHedefiniEkle(proje, { anaKimlik, kaynaklar }) {
  if (proje.pbxTargetByName(TV_HEDEFI) || proje.pbxTargetByName(tirnak(TV_HEDEFI))) return null;
  const nesneler = proje.hash.project.objects;
  const { firstProject } = proje.getFirstProject();

  const grupCocuklari = [];
  const dosyaRefEkle = (dosya, tur) => {
    const uuid = proje.generateUuid();
    nesneEkle(
      proje,
      'PBXFileReference',
      uuid,
      { isa: 'PBXFileReference', lastKnownFileType: tur, path: tirnak(dosya), sourceTree: '"<group>"' },
      dosya
    );
    grupCocuklari.push({ value: uuid, comment: dosya });
    return uuid;
  };
  const yapiDosyasi = (ref, dosya, fazAdi) => {
    const yapi = proje.generateUuid();
    nesneEkle(proje, 'PBXBuildFile', yapi, { isa: 'PBXBuildFile', fileRef: ref, fileRef_comment: dosya }, `${dosya} in ${fazAdi}`);
    return { value: yapi, comment: `${dosya} in ${fazAdi}` };
  };

  const kaynakDosyalari = kaynaklar.map((d) => yapiDosyasi(dosyaRefEkle(d, 'sourcecode.swift'), d, 'Sources'));
  const varliklar = [yapiDosyasi(dosyaRefEkle('iller.json', 'text.json'), 'iller.json', 'Resources')];
  dosyaRefEkle('Info.plist', 'text.plist.xml');

  const grupUuid = proje.generateUuid();
  nesneEkle(proje, 'PBXGroup', grupUuid, { isa: 'PBXGroup', children: grupCocuklari, path: TV_HEDEFI, sourceTree: '"<group>"' }, TV_HEDEFI);
  nesneler.PBXGroup[firstProject.mainGroup].children.push({ value: grupUuid, comment: TV_HEDEFI });

  const urunAdi = `${TV_HEDEFI}.app`;
  const urunUuid = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXFileReference',
    urunUuid,
    { isa: 'PBXFileReference', explicitFileType: tirnak('wrapper.application'), includeInIndex: 0, path: urunAdi, sourceTree: 'BUILT_PRODUCTS_DIR' },
    urunAdi
  );
  nesneler.PBXGroup[firstProject.productRefGroup].children.push({ value: urunUuid, comment: urunAdi });

  const yapilandirmalar = [];
  for (const yapilandirma of ['Debug', 'Release']) {
    const uuid = proje.generateUuid();
    const ayar = {
      CLANG_ENABLE_MODULES: 'YES',
      GENERATE_INFOPLIST_FILE: 'NO',
      INFOPLIST_FILE: tirnak(`${TV_HEDEFI}/Info.plist`),
      LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks"',
      PRODUCT_BUNDLE_IDENTIFIER: tirnak(anaKimlik),
      PRODUCT_NAME: '"$(TARGET_NAME)"',
      SDKROOT: 'appletvos',
      SWIFT_EMIT_LOC_STRINGS: 'YES',
      SWIFT_VERSION: '5.0',
      TARGETED_DEVICE_FAMILY: '3',
      TVOS_DEPLOYMENT_TARGET: TVOS_DAGITIM_HEDEFI,
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: yapilandirma === 'Debug' ? tirnak('DEBUG NAMAZ_TV') : 'NAMAZ_TV',
      DEBUG_INFORMATION_FORMAT: yapilandirma === 'Debug' ? 'dwarf' : tirnak('dwarf-with-dsym'),
      SWIFT_OPTIMIZATION_LEVEL: yapilandirma === 'Debug' ? tirnak('-Onone') : tirnak('-O'),
    };
    nesneEkle(proje, 'XCBuildConfiguration', uuid, { isa: 'XCBuildConfiguration', buildSettings: ayar, name: yapilandirma }, yapilandirma);
    yapilandirmalar.push({ value: uuid, comment: yapilandirma });
  }
  const listeUuid = proje.generateUuid();
  const listeYorumu = `Build configuration list for PBXNativeTarget "${TV_HEDEFI}"`;
  nesneEkle(
    proje,
    'XCConfigurationList',
    listeUuid,
    { isa: 'XCConfigurationList', buildConfigurations: yapilandirmalar, defaultConfigurationIsVisible: 0, defaultConfigurationName: 'Release' },
    listeYorumu
  );

  const hedefUuid = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXNativeTarget',
    hedefUuid,
    {
      isa: 'PBXNativeTarget',
      buildConfigurationList: listeUuid,
      buildConfigurationList_comment: listeYorumu,
      buildPhases: [
        fazEkle(proje, 'PBXSourcesBuildPhase', 'Sources', kaynakDosyalari),
        fazEkle(proje, 'PBXFrameworksBuildPhase', 'Frameworks', []),
        fazEkle(proje, 'PBXResourcesBuildPhase', 'Resources', varliklar),
      ],
      buildRules: [],
      dependencies: [],
      name: TV_HEDEFI,
      productName: TV_HEDEFI,
      productReference: urunUuid,
      productReference_comment: urunAdi,
      productType: tirnak('com.apple.product-type.application'),
    },
    TV_HEDEFI
  );
  // Sona eklenir: Expo `getApplicationNativeTarget` ILK `application` hedefini ana sayar.
  firstProject.targets.push({ value: hedefUuid, comment: TV_HEDEFI });
  const nitelikler = (firstProject.attributes.TargetAttributes = firstProject.attributes.TargetAttributes || {});
  nitelikler[hedefUuid] = { CreatedOnToolsVersion: '16.0' };
  return hedefUuid;
}

/** Kaynaklari ve il listesini hedef dizinine kopyalar; ayni ad iki kaynakta olmamali. */
function tvDosyalariniYaz(platformKoku, surum, derleme) {
  const dizin = path.join(platformKoku, TV_HEDEFI);
  fs.mkdirSync(dizin, { recursive: true });
  const adlar = [];
  for (const kaynak of [TV_KAYNAGI, ORTAK_KAYNAK]) {
    for (const ad of swiftDosyalari(kaynak)) {
      fs.copyFileSync(path.join(kaynak, ad), path.join(dizin, ad));
      adlar.push(ad);
    }
  }
  if (new Set(adlar).size !== adlar.length) {
    throw new Error(`[withNamazTV] Kaynaklarda ayni adli dosya var: ${adlar.join(', ')}`);
  }
  fs.copyFileSync(ILLER, path.join(dizin, 'iller.json'));
  fs.writeFileSync(path.join(dizin, 'Info.plist'), tvInfoPlist(surum, derleme));
  return adlar.sort();
}

function withNamazTV(config, secenekler) {
  if (!eklentiAraclari || !etkinMi(secenekler)) return config;
  const { withXcodeProject } = eklentiAraclari;
  const anaKimlik = config.ios && config.ios.bundleIdentifier;
  if (!anaKimlik) throw new Error('[withNamazTV] ios.bundleIdentifier gerekli');

  return withXcodeProject(config, (mod) => {
    const kaynaklar = tvDosyalariniYaz(
      mod.modRequest.platformProjectRoot,
      mod.version || '1.0.0',
      (mod.ios && mod.ios.buildNumber) || '1'
    );
    tvHedefiniEkle(mod.modResults, { anaKimlik, kaynaklar });
    return mod;
  });
}

module.exports = withNamazTV;
module.exports.etkinMi = etkinMi;
module.exports.tvInfoPlist = tvInfoPlist;
module.exports.tvHedefiniEkle = tvHedefiniEkle;
module.exports.tvDosyalariniYaz = tvDosyalariniYaz;
module.exports.TV_HEDEFI = TV_HEDEFI;
