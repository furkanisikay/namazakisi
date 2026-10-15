/**
 * Expo Config Plugin — Apple Watch uygulamasi + komplikasyonlar (issue #285).
 *
 * IKI yeni hedef kurar:
 *   - `NamazSaat` (watchOS SwiftUI uygulamasi, tek hedef; paket kimligi `<ana>.watchkitapp`)
 *     → ana uygulamaya "Embed Watch Content" fazi ile gomulur (`$(CONTENTS_FOLDER_PATH)/Watch`).
 *   - `NamazSaatWidget` (komplikasyonlar, watchOS WidgetKit uzantisi; `<ana>.watchkitapp.widget`)
 *     → saat uygulamasina "Embed Foundation Extensions" ile gomulur.
 * Kaynak: `targets/saat/` (yalniz saat uygulamasi), `targets/saat-widget/` (yalniz uzanti),
 * `targets/saat/ortak/` (ikisi; saf) + pod'dan kopyalanan saf dosyalar (`VakitKarari`,
 * `WidgetKarari`, `SaatIletisi` — iPhone widget'iyla AYNI karar, telefonla AYNI ileti
 * sozlesmesi). `targets/saat/test/` hicbir hedefe girmez (Linux `swiftc` test kosucusu).
 *
 * Saat YALNIZ GOSTERIR (Wear OS ilkesi): vakitler telefonda hesaplanir, Wear yukunun
 * aynisi WatchConnectivity ile gelir; telefon tarafi `modules/expo-siri-kisayollari`
 * (`SaatKoprusu`) — o kod ana uygulamanin Info.plist'indeki `NamazSaatUygulamasi`
 * anahtarini gormeden HIC calismaz (bu eklenti yazar).
 *
 * BAYRAK: `app.json` → `["./plugins/withNamazSaat", { "etkin": false }]`. VARSAYILAN
 * KAPALI: iki yeni paket kimligi + App Group ister ve EAS'in etkilesimsiz iOS build'i
 * bunlarin imza bilgisini OLUSTURAMAZ (widget uzantisiyla ayni sebep; sahibin tek
 * seferlik adimlari AGENTS.md "Apple Watch" bolumunde). Kapaliyken eklenti HICBIR SEY
 * yapmaz → TestFlight hatti birebir eskisi gibi kalir.
 *
 * `NAMAZ_IOS_SAAT=1` bayragi ezer (`0` kapatir): imzasiz simulator derlemesi
 * (`ios-siri-derleme.yml`) saat hedefini de derlesin diye. EAS'te bu degisken YOKTUR.
 *
 * Team ID YAZILMAZ (`DEVELOPMENT_TEAM`): EAS kimlik bilgileri her hedefe kendisi atar.
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
const SAAT_KAYNAGI = path.join(KOK, 'targets', 'saat');
const ORTAK_KAYNAK = path.join(SAAT_KAYNAGI, 'ortak');
const WIDGET_KAYNAGI = path.join(KOK, 'targets', 'saat-widget');
const POD_KAYNAGI = path.join(KOK, 'modules', 'expo-siri-kisayollari', 'ios');
/** Pod'dan saat hedeflerine kopyalanan SAF dosyalar (yalniz Foundation). */
const POD_KOPYALARI = ['VakitKarari.swift', 'WidgetKarari.swift', 'SaatIletisi.swift'];

const SAAT_HEDEFI = 'NamazSaat';
const WIDGET_HEDEFI = 'NamazSaatWidget';
const APP_GROUP = 'group.com.furkanisikay.namazakisi';
const GRUP_ANAHTARI = 'com.apple.security.application-groups';
/** watchOS 10: `containerBackground`, `onChange(of:)` iki parametreli, `.topBarTrailing`. */
const WATCHOS_DAGITIM_HEDEFI = '10.0';
/** Ana uygulamanin Info.plist anahtari — `SaatKoprusu.plistAnahtari` ile AYNI. */
const PLIST_ANAHTARI = 'NamazSaatUygulamasi';
const IKON_ADI = 'ikon-1024.png';

function etkinMi(secenekler, ortam = process.env) {
  const deger = ortam.NAMAZ_IOS_SAAT;
  if (deger === '1' || deger === 'true') return true;
  if (deger === '0' || deger === 'false') return false;
  return Boolean(secenekler && secenekler.etkin === true);
}

const saatKimligi = (anaKimlik) => `${anaKimlik}.watchkitapp`;
const widgetKimligi = (anaKimlik) => `${saatKimligi(anaKimlik)}.widget`;

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

const PLIST_BASI = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
`;
const PLIST_SONU = `</dict>
</plist>
`;

function ortakAnahtarlar(surum, derleme) {
  return `  <key>CFBundleDevelopmentRegion</key>
  <string>$(DEVELOPMENT_LANGUAGE)</string>
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
`;
}

/**
 * Saat uygulamasinin Info.plist'i. Surum ana uygulamayla AYNI olmali (App Store
 * dogrulamasi). `WKApplication` = tek hedefli SwiftUI saat uygulamasi; telefon
 * uygulamasina baglidir (veri telefondan gelir).
 */
function saatInfoPlist(surum, derleme, anaKimlik) {
  return `${PLIST_BASI}${ortakAnahtarlar(surum, derleme)}  <key>WKApplication</key>
  <true/>
  <key>WKCompanionAppBundleIdentifier</key>
  <string>${xmlKacir(anaKimlik)}</string>
  <key>WKRunsIndependentlyOfCompanionApp</key>
  <false/>
${PLIST_SONU}`;
}

function widgetInfoPlist(surum, derleme) {
  return `${PLIST_BASI}${ortakAnahtarlar(surum, derleme)}  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
${PLIST_SONU}`;
}

function entitlementsIcerigi() {
  return `${PLIST_BASI}  <key>${GRUP_ANAHTARI}</key>
  <array>
    <string>${APP_GROUP}</string>
  </array>
${PLIST_SONU}`;
}

/** watchOS tek boyutlu (1024) uygulama ikonu katalogu (Xcode 14+). */
function ikonKataloguIcerigi() {
  return JSON.stringify(
    {
      images: [{ filename: IKON_ADI, idiom: 'universal', platform: 'watchos', size: '1024x1024' }],
      info: { author: 'xcode', version: 1 },
    },
    null,
    2
  );
}

/**
 * EAS'in build BASLAMADAN iki hedefin kimlik bilgilerini bilmesi icin. Saat uzantisinin
 * ebeveyni SAAT uygulamasidir (telefon degil). Baska eklentilerin (widget) kayitlarina
 * dokunulmaz; tekrar cagrida cogaltilmaz.
 */
function easHedefleriniBildir(config, anaKimlik) {
  config.extra = config.extra || {};
  config.extra.eas = config.extra.eas || {};
  config.extra.eas.build = config.extra.eas.build || {};
  config.extra.eas.build.experimental = config.extra.eas.build.experimental || {};
  const ios = (config.extra.eas.build.experimental.ios = config.extra.eas.build.experimental.ios || {});
  const bizim = [SAAT_HEDEFI, WIDGET_HEDEFI];
  const liste = Array.isArray(ios.appExtensions)
    ? ios.appExtensions.filter((u) => !bizim.includes(u.targetName))
    : [];
  const yetki = { [GRUP_ANAHTARI]: [APP_GROUP] };
  liste.push({
    targetName: SAAT_HEDEFI,
    bundleIdentifier: saatKimligi(anaKimlik),
    parentBundleIdentifier: anaKimlik,
    entitlements: yetki,
  });
  liste.push({
    targetName: WIDGET_HEDEFI,
    bundleIdentifier: widgetKimligi(anaKimlik),
    parentBundleIdentifier: saatKimligi(anaKimlik),
    entitlements: yetki,
  });
  ios.appExtensions = liste;
  return config;
}

const tirnak = (s) => `"${String(s).replace(/"/g, '\\"')}"`;

/** Bir nesneyi bolume (yorumuyla) ekler — `xcode` yazicisi yorumu `<uuid>_comment`'ten okur. */
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

/**
 * Bir watchOS hedefi kurar: dosya referanslari + grup, Sources/Frameworks/Resources,
 * derleme ayarlari (Debug + Release) ve urun. Hedef uuid'i ve urun bilgisini doner.
 */
function hedefKur(proje, { ad, urunTuru, urunUzantisi, dosyaTuru, kaynaklar, katalog, ayarlar, kosul }) {
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

  const kaynakDosyalari = kaynaklar.map((dosya) => yapiDosyasi(dosyaRefEkle(dosya, 'sourcecode.swift'), dosya, 'Sources'));
  const kaynakVarliklari = katalog ? [yapiDosyasi(dosyaRefEkle(katalog, 'folder.assetcatalog'), katalog, 'Resources')] : [];
  dosyaRefEkle('Info.plist', 'text.plist.xml');
  dosyaRefEkle(`${ad}.entitlements`, 'text.plist.entitlements');

  const grupUuid = proje.generateUuid();
  nesneEkle(proje, 'PBXGroup', grupUuid, { isa: 'PBXGroup', children: grupCocuklari, path: ad, sourceTree: '"<group>"' }, ad);
  nesneler.PBXGroup[firstProject.mainGroup].children.push({ value: grupUuid, comment: ad });

  const urunAdi = `${ad}.${urunUzantisi}`;
  const urunUuid = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXFileReference',
    urunUuid,
    { isa: 'PBXFileReference', explicitFileType: tirnak(dosyaTuru), includeInIndex: 0, path: urunAdi, sourceTree: 'BUILT_PRODUCTS_DIR' },
    urunAdi
  );
  nesneler.PBXGroup[firstProject.productRefGroup].children.push({ value: urunUuid, comment: urunAdi });

  const yapilandirmalar = [];
  for (const yapilandirma of ['Debug', 'Release']) {
    const uuid = proje.generateUuid();
    const ayar = {
      CLANG_ENABLE_MODULES: 'YES',
      CODE_SIGN_ENTITLEMENTS: tirnak(`${ad}/${ad}.entitlements`),
      GENERATE_INFOPLIST_FILE: 'NO',
      INFOPLIST_FILE: tirnak(`${ad}/Info.plist`),
      PRODUCT_NAME: '"$(TARGET_NAME)"',
      SDKROOT: 'watchos',
      SKIP_INSTALL: 'YES',
      SWIFT_EMIT_LOC_STRINGS: 'YES',
      SWIFT_VERSION: '5.0',
      TARGETED_DEVICE_FAMILY: '4',
      WATCHOS_DEPLOYMENT_TARGET: WATCHOS_DAGITIM_HEDEFI,
      ...ayarlar,
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: yapilandirma === 'Debug' ? tirnak(`DEBUG ${kosul}`) : kosul,
      DEBUG_INFORMATION_FORMAT: yapilandirma === 'Debug' ? 'dwarf' : tirnak('dwarf-with-dsym'),
      SWIFT_OPTIMIZATION_LEVEL: yapilandirma === 'Debug' ? tirnak('-Onone') : tirnak('-O'),
    };
    nesneEkle(proje, 'XCBuildConfiguration', uuid, { isa: 'XCBuildConfiguration', buildSettings: ayar, name: yapilandirma }, yapilandirma);
    yapilandirmalar.push({ value: uuid, comment: yapilandirma });
  }
  const listeUuid = proje.generateUuid();
  const listeYorumu = `Build configuration list for PBXNativeTarget "${ad}"`;
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
        fazEkle(proje, 'PBXResourcesBuildPhase', 'Resources', kaynakVarliklari),
      ],
      buildRules: [],
      dependencies: [],
      name: ad,
      productName: ad,
      productReference: urunUuid,
      productReference_comment: urunAdi,
      productType: tirnak(urunTuru),
    },
    ad
  );
  // Sona eklenir: Expo `getApplicationNativeTarget` / `findFirstNativeTarget` ILK
  // `application` hedefini ana uygulama sayar — saat de `application` turundedir.
  firstProject.targets.push({ value: hedefUuid, comment: ad });
  const nitelikler = (firstProject.attributes.TargetAttributes = firstProject.attributes.TargetAttributes || {});
  nitelikler[hedefUuid] = { CreatedOnToolsVersion: '16.0' };
  return { hedefUuid, urunUuid, urunAdi };
}

/** `kaynak` hedefi `hedef`e bagimli olur (bolumler sablonda yoksa olusturulur). */
function bagimlilikEkle(proje, kaynakHedef, hedefUuid, hedefAdi) {
  const vekil = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXContainerItemProxy',
    vekil,
    {
      isa: 'PBXContainerItemProxy',
      containerPortal: proje.hash.project.rootObject,
      containerPortal_comment: 'Project object',
      proxyType: 1,
      remoteGlobalIDString: hedefUuid,
      remoteInfo: hedefAdi,
    },
    'PBXContainerItemProxy'
  );
  const bagimlilik = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXTargetDependency',
    bagimlilik,
    { isa: 'PBXTargetDependency', target: hedefUuid, target_comment: hedefAdi, targetProxy: vekil, targetProxy_comment: 'PBXContainerItemProxy' },
    'PBXTargetDependency'
  );
  kaynakHedef.dependencies = kaynakHedef.dependencies || [];
  kaynakHedef.dependencies.push({ value: bagimlilik, comment: 'PBXTargetDependency' });
}

/**
 * Gomme fazi: `Resources`'tan HEMEN SONRA, betik fazlarindan ONCE (sonda kalirsa Xcode
 * 15+ "Cycle inside <hedef>" hatasi verebilir — widget eklentisiyle ayni ders).
 */
function gommeFaziEkle(proje, kaynakHedef, { urunUuid, urunAdi, fazAdi, dstPath, dstSubfolderSpec }) {
  const gomulu = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXBuildFile',
    gomulu,
    { isa: 'PBXBuildFile', fileRef: urunUuid, fileRef_comment: urunAdi, settings: { ATTRIBUTES: ['RemoveHeadersOnCopy'] } },
    `${urunAdi} in ${fazAdi}`
  );
  const fazUuid = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXCopyFilesBuildPhase',
    fazUuid,
    {
      isa: 'PBXCopyFilesBuildPhase',
      buildActionMask: 2147483647,
      dstPath,
      dstSubfolderSpec,
      files: [{ value: gomulu, comment: `${urunAdi} in ${fazAdi}` }],
      name: tirnak(fazAdi),
      runOnlyForDeploymentPostprocessing: 0,
    },
    fazAdi
  );
  const fazlar = kaynakHedef.buildPhases;
  const kaynakIndeksi = fazlar.findIndex((f) => f.comment === 'Resources');
  const yer = kaynakIndeksi >= 0 ? kaynakIndeksi + 1 : fazlar.length;
  fazlar.splice(yer, 0, { value: fazUuid, comment: fazAdi });
}

/**
 * Iki hedefi kurar ve gomer. Saat hedefi zaten varsa (yeniden prebuild) hicbir sey
 * eklenmez (idempotent).
 */
function saatHedefleriniEkle(proje, { anaHedefUuid, anaKimlik, saatKaynaklari, widgetKaynaklari }) {
  if (proje.pbxTargetByName(SAAT_HEDEFI) || proje.pbxTargetByName(tirnak(SAAT_HEDEFI))) return;
  const nesneler = proje.hash.project.objects;
  const anaHedef = nesneler.PBXNativeTarget[anaHedefUuid];

  const widget = hedefKur(proje, {
    ad: WIDGET_HEDEFI,
    urunTuru: 'com.apple.product-type.app-extension',
    urunUzantisi: 'appex',
    dosyaTuru: 'wrapper.app-extension',
    kaynaklar: widgetKaynaklari,
    kosul: 'NAMAZ_SAAT_WIDGET',
    ayarlar: {
      APPLICATION_EXTENSION_API_ONLY: 'YES',
      LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
      PRODUCT_BUNDLE_IDENTIFIER: tirnak(widgetKimligi(anaKimlik)),
    },
  });

  const saat = hedefKur(proje, {
    ad: SAAT_HEDEFI,
    // Tek hedefli SwiftUI saat uygulamasi (Xcode 14+): `application` + SDKROOT watchos.
    urunTuru: 'com.apple.product-type.application',
    urunUzantisi: 'app',
    dosyaTuru: 'wrapper.application',
    kaynaklar: saatKaynaklari,
    katalog: 'Assets.xcassets',
    kosul: 'NAMAZ_SAAT_UYGULAMASI',
    ayarlar: {
      ASSETCATALOG_COMPILER_APPICON_NAME: 'AppIcon',
      LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks"',
      PRODUCT_BUNDLE_IDENTIFIER: tirnak(saatKimligi(anaKimlik)),
    },
  });
  const saatHedefi = nesneler.PBXNativeTarget[saat.hedefUuid];

  // Komplikasyon uzantisi saat uygulamasinin icinde.
  bagimlilikEkle(proje, saatHedefi, widget.hedefUuid, WIDGET_HEDEFI);
  gommeFaziEkle(proje, saatHedefi, {
    urunUuid: widget.urunUuid,
    urunAdi: widget.urunAdi,
    fazAdi: 'Embed Foundation Extensions',
    dstPath: '""',
    dstSubfolderSpec: 13,
  });

  // Saat uygulamasi telefon uygulamasinin icinde (`<App>.app/Watch/NamazSaat.app`).
  bagimlilikEkle(proje, anaHedef, saat.hedefUuid, SAAT_HEDEFI);
  gommeFaziEkle(proje, anaHedef, {
    urunUuid: saat.urunUuid,
    urunAdi: saat.urunAdi,
    fazAdi: 'Embed Watch Content',
    dstPath: tirnak('$(CONTENTS_FOLDER_PATH)/Watch'),
    dstSubfolderSpec: 16,
  });
}

/** Hedef dizinine Swift kaynaklarini kopyalar; ayni ad iki kaynakta olmamali. */
function kaynaklariKopyala(hedefDizin, kaynakDizinleri) {
  fs.mkdirSync(hedefDizin, { recursive: true });
  const adlar = [];
  for (const dizin of kaynakDizinleri) {
    for (const ad of swiftDosyalari(dizin)) {
      fs.copyFileSync(path.join(dizin, ad), path.join(hedefDizin, ad));
      adlar.push(ad);
    }
  }
  for (const ad of POD_KOPYALARI) {
    fs.copyFileSync(path.join(POD_KAYNAGI, ad), path.join(hedefDizin, ad));
    adlar.push(ad);
  }
  if (new Set(adlar).size !== adlar.length) {
    throw new Error(`[withNamazSaat] Kaynaklarda ayni adli dosya var: ${adlar.join(', ')}`);
  }
  return adlar.sort();
}

/**
 * Saat ikonu: uygulama ikonundan 1024 px, saydamligi ALINMIS PNG (App Store saydam
 * ikonu reddeder). Expo'nun iOS ikon eklentisiyle ayni arac (`@expo/image-utils`);
 * bulunamazsa ham dosya kopyalanir ve uyari yazilir.
 */
async function ikonuYaz(projectRoot, ikonYolu, hedefDosya) {
  try {
    const { generateImageAsync } = require('@expo/image-utils');
    const { source } = await generateImageAsync(
      { projectRoot, cacheType: 'namaz-saat-ikonu' },
      {
        src: ikonYolu,
        name: IKON_ADI,
        width: 1024,
        height: 1024,
        resizeMode: 'cover',
        backgroundColor: '#ffffff',
        removeTransparency: true,
      }
    );
    fs.writeFileSync(hedefDosya, source);
  } catch (hata) {
    console.warn(`[withNamazSaat] Saat ikonu uretilemedi, ham dosya kopyalaniyor: ${hata && hata.message}`);
    fs.copyFileSync(ikonYolu, hedefDosya);
  }
}

async function saatDosyalariniYaz({ projectRoot, platformKoku, ikonYolu, surum, derleme, anaKimlik }) {
  const saatDizini = path.join(platformKoku, SAAT_HEDEFI);
  const widgetDizini = path.join(platformKoku, WIDGET_HEDEFI);
  const saatKaynaklari = kaynaklariKopyala(saatDizini, [SAAT_KAYNAGI, ORTAK_KAYNAK]);
  const widgetKaynaklari = kaynaklariKopyala(widgetDizini, [WIDGET_KAYNAGI, ORTAK_KAYNAK]);

  fs.writeFileSync(path.join(saatDizini, 'Info.plist'), saatInfoPlist(surum, derleme, anaKimlik));
  fs.writeFileSync(path.join(saatDizini, `${SAAT_HEDEFI}.entitlements`), entitlementsIcerigi());
  fs.writeFileSync(path.join(widgetDizini, 'Info.plist'), widgetInfoPlist(surum, derleme));
  fs.writeFileSync(path.join(widgetDizini, `${WIDGET_HEDEFI}.entitlements`), entitlementsIcerigi());

  const katalog = path.join(saatDizini, 'Assets.xcassets');
  const ikonSeti = path.join(katalog, 'AppIcon.appiconset');
  fs.mkdirSync(ikonSeti, { recursive: true });
  fs.writeFileSync(path.join(katalog, 'Contents.json'), JSON.stringify({ info: { author: 'xcode', version: 1 } }, null, 2));
  fs.writeFileSync(path.join(ikonSeti, 'Contents.json'), ikonKataloguIcerigi());
  await ikonuYaz(projectRoot, ikonYolu, path.join(ikonSeti, IKON_ADI));

  return { saatKaynaklari, widgetKaynaklari };
}

function withNamazSaat(config, secenekler) {
  if (!eklentiAraclari || !etkinMi(secenekler)) return config;
  const { withXcodeProject, withInfoPlist, IOSConfig } = eklentiAraclari;
  const anaKimlik = config.ios && config.ios.bundleIdentifier;
  if (!anaKimlik) throw new Error('[withNamazSaat] ios.bundleIdentifier gerekli');

  config = easHedefleriniBildir(config, anaKimlik);

  // Telefon tarafindaki `SaatKoprusu` yalniz bu anahtari gorunce oturum acar.
  config = withInfoPlist(config, (mod) => {
    mod.modResults[PLIST_ANAHTARI] = true;
    return mod;
  });

  config = withXcodeProject(config, async (mod) => {
    const proje = mod.modResults;
    const { projectRoot, platformProjectRoot } = mod.modRequest;
    const projeAdi = IOSConfig.XcodeUtils.getProjectName(projectRoot);
    const ikon = (mod.ios && mod.ios.icon) || mod.icon || './assets/icon.png';
    const { saatKaynaklari, widgetKaynaklari } = await saatDosyalariniYaz({
      projectRoot,
      platformKoku: platformProjectRoot,
      ikonYolu: path.resolve(projectRoot, typeof ikon === 'string' ? ikon : './assets/icon.png'),
      surum: mod.version || '1.0.0',
      derleme: (mod.ios && mod.ios.buildNumber) || '1',
      anaKimlik,
    });
    const { uuid: anaHedefUuid } = IOSConfig.XcodeUtils.getApplicationNativeTarget({ project: proje, projectName: projeAdi });
    saatHedefleriniEkle(proje, { anaHedefUuid, anaKimlik, saatKaynaklari, widgetKaynaklari });
    return mod;
  });
  return config;
}

module.exports = withNamazSaat;
module.exports.etkinMi = etkinMi;
module.exports.easHedefleriniBildir = easHedefleriniBildir;
module.exports.saatInfoPlist = saatInfoPlist;
module.exports.widgetInfoPlist = widgetInfoPlist;
module.exports.saatHedefleriniEkle = saatHedefleriniEkle;
module.exports.kaynaklariKopyala = kaynaklariKopyala;
module.exports.SAAT_HEDEFI = SAAT_HEDEFI;
module.exports.WIDGET_HEDEFI = WIDGET_HEDEFI;
module.exports.PLIST_ANAHTARI = PLIST_ANAHTARI;
