/**
 * Expo Config Plugin — iOS widget uzantisi + canli etkinlik (issue #295, #282 iOS ikizi).
 *
 * TEK WidgetKit uzantisi (`NamazWidget`, paket kimligi `<ana>.widget`):
 *   - vakit widget'i: kilit ekrani aksesuarlari (dairesel / dikdortgen / satir ici),
 *     StandBy ve ana ekran (kucuk / orta),
 *   - canli etkinlik (Live Activity): Dinamik Ada + kilit ekrani geri sayimi.
 * Kaynak: `targets/widget/` (yalniz bu uzanti) + `targets/widget/ortak/` (uzanti VE ana
 * hedef: "Kildim" dugmesinin `LiveActivityIntent`'i) + pod'dan kopyalanan saf dosyalar
 * (`VakitKarari`, `SiriDeposu`, `WidgetKarari`, `CanliEtkinlikNitelikleri`: uzanti pod'a
 * baglanmaz, ayni kod iki ikilide derlenir).
 *
 * BAYRAK: `app.json` → `["./plugins/withNamazWidget", { "etkin": false }]`. VARSAYILAN
 * KAPALI cunku yeni hedef yeni bir paket kimligi + App Group ister ve EAS'in etkilesimsiz
 * (`--non-interactive`) iOS build'i bunlarin imza bilgisini OLUSTURAMAZ (dagitim
 * sertifikasi yeni kimlige yalniz etkilesimli modda atanir; App Group kimligi yalniz
 * Apple ID oturumuyla baglanir). Sahibin tek seferlik adimlari AGENTS.md'de
 * ("iOS widget uzantisi" bolumu). Kapaliyken eklenti HICBIR SEY yapmaz → TestFlight
 * hatti birebir eskisi gibi kalir.
 *
 * `NAMAZ_IOS_WIDGET=1` ortam degiskeni bayragi ezer (`0` kapatir): imzasiz simulator
 * derlemesi (`ios-siri-derleme.yml`) uzantiyi da derlesin diye. EAS sunucusunda bu
 * degisken YOKTUR → orada daima `app.json` gecerlidir.
 *
 * NEDEN @bacons/apple-targets DEGIL: 4.x surumu Xcode projesi icin kendi (alfa) ayristirici
 * temel mod'unu kaydeder ve `withSiriKisayollari`'nin `xcode` kutuphanesiyle yazdigi ayni
 * proje dosyasina ikinci bir yazici olarak girer; ayrica `ios.appleTeamId` ister (repoda
 * yok, EAS kimlik bilgileri yonetir) ve bayrakla kapatmayi zorlastirir. Tek uzanti icin
 * gereken nesneler (hedef, derleme ayarlari, gomme fazi, bagimlilik) burada acikca kurulur.
 */
const fs = require('fs');
const path = require('path');

// Global eas-cli baglaminda @expo/config-plugins bulunamayabilir → eklenti no-op
// (withPlayStoreDependency / withSiriKisayollari ile ayni amac). Ust duzey `return`
// KULLANILMAZ: jest (babel) modulu ayristiramaz, eklenti test edilemezdi.
let eklentiAraclari = null;
try {
  eklentiAraclari = require('@expo/config-plugins');
} catch {
  eklentiAraclari = null;
}

const KOK = path.join(__dirname, '..');
const UZANTI_KAYNAGI = path.join(KOK, 'targets', 'widget');
const ORTAK_KAYNAK = path.join(UZANTI_KAYNAGI, 'ortak');
const POD_KAYNAGI = path.join(KOK, 'modules', 'expo-siri-kisayollari', 'ios');
/** Pod'dan uzantiya kopyalanan SAF dosyalar (pod'a baglanmadan ayni kod). */
const POD_KOPYALARI = ['VakitKarari.swift', 'SiriDeposu.swift', 'WidgetKarari.swift', 'CanliEtkinlikNitelikleri.swift'];
/**
 * Muhafiz gercek alarmi (AlarmKit, issue #74) meta veri tipi: ana hedef zaten derler
 * (`withMuhafizAlarmKit`), uzanti da `ActivityConfiguration(for: AlarmAttributes<NamazAlarmVerisi>.self)`
 * icin AYNI tipi derler (ActivityKit eslesmesi tip adi + Codable sekliyle).
 */
const ALARMKIT_KAYNAGI = path.join(KOK, 'targets', 'muhafiz-alarmkit');
const ALARMKIT_KOPYALARI = ['NamazAlarmVerisi.swift'];
/**
 * Bu uzantinin canli etkinlik CIZDIGINI soyleyen Info.plist anahtari. `NSSupportsLiveActivities`
 * artik sinyal degil: AlarmKit icin uzantidan bagimsiz yazilir (`withMuhafizAlarmKit`).
 * Okuyan: `CanliEtkinlikKoprusu.destekleniyor` (Swift).
 */
const CANLI_ETKINLIK_ANAHTARI = 'NamazAkisiCanliEtkinlikUzantisi';

const HEDEF_ADI = 'NamazWidget';
const APP_GROUP = 'group.com.furkanisikay.namazakisi';
const GRUP_ANAHTARI = 'com.apple.security.application-groups';
/** ActivityKit `ActivityContent`/`staleDate` ve kilit ekrani aksesuarlari. */
const UZANTI_DAGITIM_HEDEFI = '16.2';
const DERLEME_KOSULU = 'NAMAZ_WIDGET_UZANTISI';

/** Bayrak: ortam degiskeni (`1`/`0`) ezer, yoksa eklenti secenegi. Varsayilan KAPALI. */
function etkinMi(secenekler, ortam = process.env) {
  const deger = ortam.NAMAZ_IOS_WIDGET;
  if (deger === '1' || deger === 'true') return true;
  if (deger === '0' || deger === 'false') return false;
  return Boolean(secenekler && secenekler.etkin === true);
}

const uzantiKimligi = (anaKimlik) => `${anaKimlik}.widget`;

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

/** Uzantinin Info.plist'i. Surum ana uygulamayla AYNI olmali (App Store dogrulamasi). */
function infoPlistIcerigi(surum, derleme) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
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
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
</dict>
</plist>
`;
}

function entitlementsIcerigi() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>${GRUP_ANAHTARI}</key>
  <array>
    <string>${APP_GROUP}</string>
  </array>
</dict>
</plist>
`;
}

/** EAS'in build BASLAMADAN uzantinin kimlik bilgilerini bilmesi icin (EAS belgesi). */
function easUzantisiniBildir(config, kimlik) {
  config.extra = config.extra || {};
  config.extra.eas = config.extra.eas || {};
  config.extra.eas.build = config.extra.eas.build || {};
  config.extra.eas.build.experimental = config.extra.eas.build.experimental || {};
  const ios = (config.extra.eas.build.experimental.ios = config.extra.eas.build.experimental.ios || {});
  const liste = Array.isArray(ios.appExtensions) ? ios.appExtensions.filter((u) => u.targetName !== HEDEF_ADI) : [];
  liste.push({ targetName: HEDEF_ADI, bundleIdentifier: kimlik, entitlements: { [GRUP_ANAHTARI]: [APP_GROUP] } });
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

/** Ana hedefin derleme ayarlarindan bir deger (Release). */
function anaAyar(proje, anaHedef, anahtar) {
  const liste = proje.pbxXCConfigurationList()[anaHedef.buildConfigurationList];
  const yapilandirmalar = proje.pbxXCBuildConfigurationSection();
  for (const y of liste ? liste.buildConfigurations : []) {
    const ayarlar = yapilandirmalar[y.value] && yapilandirmalar[y.value].buildSettings;
    if (ayarlar && ayarlar[anahtar] !== undefined) return ayarlar[anahtar];
  }
  return undefined;
}

/**
 * Uzanti hedefini kurar: dosya referanslari + grup, Sources/Frameworks/Resources fazlari,
 * derleme ayarlari, urun (.appex), ana hedefe BAGIMLILIK ve "Embed Foundation Extensions"
 * gomme fazi. Hedef zaten varsa (yeniden prebuild) hicbir sey eklenmez.
 */
function uzantiHedefiniEkle(proje, { anaHedefUuid, kimlik, kaynaklar }) {
  if (proje.pbxTargetByName(HEDEF_ADI) || proje.pbxTargetByName(tirnak(HEDEF_ADI))) return;
  const nesneler = proje.hash.project.objects;
  const anaHedef = nesneler.PBXNativeTarget[anaHedefUuid];

  // 1) Dosya referanslari + grup (yollar grup dizinine goreli).
  const grupCocuklari = [];
  const kaynakDosyalari = [];
  const dosyaRefEkle = (ad, tur) => {
    const uuid = proje.generateUuid();
    nesneEkle(
      proje,
      'PBXFileReference',
      uuid,
      { isa: 'PBXFileReference', lastKnownFileType: tur, path: tirnak(ad), sourceTree: '"<group>"' },
      ad
    );
    grupCocuklari.push({ value: uuid, comment: ad });
    return uuid;
  };
  for (const ad of kaynaklar) {
    const ref = dosyaRefEkle(ad, 'sourcecode.swift');
    const yapi = proje.generateUuid();
    nesneEkle(proje, 'PBXBuildFile', yapi, { isa: 'PBXBuildFile', fileRef: ref, fileRef_comment: ad }, `${ad} in Sources`);
    kaynakDosyalari.push({ value: yapi, comment: `${ad} in Sources` });
  }
  dosyaRefEkle('Info.plist', 'text.plist.xml');
  dosyaRefEkle(`${HEDEF_ADI}.entitlements`, 'text.plist.entitlements');

  const grupUuid = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXGroup',
    grupUuid,
    { isa: 'PBXGroup', children: grupCocuklari, path: HEDEF_ADI, sourceTree: '"<group>"' },
    HEDEF_ADI
  );
  const { firstProject } = proje.getFirstProject();
  nesneler.PBXGroup[firstProject.mainGroup].children.push({ value: grupUuid, comment: HEDEF_ADI });

  // 2) Urun.
  const urunAdi = `${HEDEF_ADI}.appex`;
  const urunUuid = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXFileReference',
    urunUuid,
    {
      isa: 'PBXFileReference',
      explicitFileType: '"wrapper.app-extension"',
      includeInIndex: 0,
      path: urunAdi,
      sourceTree: 'BUILT_PRODUCTS_DIR',
    },
    urunAdi
  );
  nesneler.PBXGroup[firstProject.productRefGroup].children.push({ value: urunUuid, comment: urunAdi });

  // 3) Derleme ayarlari (Debug + Release). Surumler ana uygulamanin Info.plist'iyle ayni.
  const cihazAilesi = anaAyar(proje, anaHedef, 'TARGETED_DEVICE_FAMILY') || '"1"';
  const ortak = {
    APPLICATION_EXTENSION_API_ONLY: 'YES',
    CLANG_ENABLE_MODULES: 'YES',
    CODE_SIGN_ENTITLEMENTS: tirnak(`${HEDEF_ADI}/${HEDEF_ADI}.entitlements`),
    GENERATE_INFOPLIST_FILE: 'NO',
    INFOPLIST_FILE: tirnak(`${HEDEF_ADI}/Info.plist`),
    IPHONEOS_DEPLOYMENT_TARGET: UZANTI_DAGITIM_HEDEFI,
    LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
    PRODUCT_BUNDLE_IDENTIFIER: tirnak(kimlik),
    PRODUCT_NAME: '"$(TARGET_NAME)"',
    SKIP_INSTALL: 'YES',
    SWIFT_EMIT_LOC_STRINGS: 'YES',
    SWIFT_VERSION: '5.0',
    TARGETED_DEVICE_FAMILY: cihazAilesi,
    // AlarmKit iOS 26'dir, uzanti 16.2: `import AlarmKit` otomatik baglamada GUCLU bag
    // uretir → eski sistemde uzanti "Library not loaded" ile yuklenmezdi. ZAYIF bag
    // (ana hedefteki `addFramework(weak)` ile ayni etki; uzantinin cerceve fazi bos).
    OTHER_LDFLAGS: tirnak('$(inherited) -weak_framework AlarmKit'),
  };
  const yapilandirmaUuidleri = [];
  for (const ad of ['Debug', 'Release']) {
    const uuid = proje.generateUuid();
    const ayarlar = {
      ...ortak,
      SWIFT_ACTIVE_COMPILATION_CONDITIONS:
        ad === 'Debug' ? tirnak(`DEBUG ${DERLEME_KOSULU}`) : DERLEME_KOSULU,
      DEBUG_INFORMATION_FORMAT: ad === 'Debug' ? 'dwarf' : tirnak('dwarf-with-dsym'),
      SWIFT_OPTIMIZATION_LEVEL: ad === 'Debug' ? tirnak('-Onone') : tirnak('-O'),
    };
    nesneEkle(proje, 'XCBuildConfiguration', uuid, { isa: 'XCBuildConfiguration', buildSettings: ayarlar, name: ad }, ad);
    yapilandirmaUuidleri.push({ value: uuid, comment: ad });
  }
  const listeUuid = proje.generateUuid();
  const listeYorumu = `Build configuration list for PBXNativeTarget "${HEDEF_ADI}"`;
  nesneEkle(
    proje,
    'XCConfigurationList',
    listeUuid,
    {
      isa: 'XCConfigurationList',
      buildConfigurations: yapilandirmaUuidleri,
      defaultConfigurationIsVisible: 0,
      defaultConfigurationName: 'Release',
    },
    listeYorumu
  );

  // 4) Hedef.
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
        fazEkle(proje, 'PBXResourcesBuildPhase', 'Resources', []),
      ],
      buildRules: [],
      dependencies: [],
      name: HEDEF_ADI,
      productName: HEDEF_ADI,
      productReference: urunUuid,
      productReference_comment: urunAdi,
      productType: '"com.apple.product-type.app-extension"',
    },
    HEDEF_ADI
  );
  firstProject.targets.push({ value: hedefUuid, comment: HEDEF_ADI });
  const nitelikler = (firstProject.attributes.TargetAttributes = firstProject.attributes.TargetAttributes || {});
  nitelikler[hedefUuid] = { CreatedOnToolsVersion: '16.0' };

  // 5) Ana hedef → uzanti bagimliligi (bolumler sablonda yoksa olusturulur).
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
      remoteInfo: HEDEF_ADI,
    },
    'PBXContainerItemProxy'
  );
  const bagimlilik = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXTargetDependency',
    bagimlilik,
    { isa: 'PBXTargetDependency', target: hedefUuid, target_comment: HEDEF_ADI, targetProxy: vekil, targetProxy_comment: 'PBXContainerItemProxy' },
    'PBXTargetDependency'
  );
  anaHedef.dependencies = anaHedef.dependencies || [];
  anaHedef.dependencies.push({ value: bagimlilik, comment: 'PBXTargetDependency' });

  // 6) Gomme fazi. Betik fazlarindan ("Bundle React Native code", "[CP] ...") ONCE durmali:
  //    sonda kalirsa Xcode 15+ "Cycle inside <hedef>" hatasi verebilir.
  const gomuluDosya = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXBuildFile',
    gomuluDosya,
    {
      isa: 'PBXBuildFile',
      fileRef: urunUuid,
      fileRef_comment: urunAdi,
      settings: { ATTRIBUTES: ['RemoveHeadersOnCopy'] },
    },
    `${urunAdi} in Embed Foundation Extensions`
  );
  const gommeYorumu = 'Embed Foundation Extensions';
  const gommeUuid = proje.generateUuid();
  nesneEkle(
    proje,
    'PBXCopyFilesBuildPhase',
    gommeUuid,
    {
      isa: 'PBXCopyFilesBuildPhase',
      buildActionMask: 2147483647,
      dstPath: '""',
      dstSubfolderSpec: 13,
      files: [{ value: gomuluDosya, comment: `${urunAdi} in Embed Foundation Extensions` }],
      name: tirnak(gommeYorumu),
      runOnlyForDeploymentPostprocessing: 0,
    },
    gommeYorumu
  );
  const fazlar = anaHedef.buildPhases;
  const kaynakIndeksi = fazlar.findIndex((f) => f.comment === 'Resources');
  const yer = kaynakIndeksi >= 0 ? kaynakIndeksi + 1 : fazlar.length;
  fazlar.splice(yer, 0, { value: gommeUuid, comment: gommeYorumu });
}

/** Uzanti dizinini (ios/NamazWidget) diske yazar; kaynak adlarini dondurur. */
function uzantiDosyalariniYaz(platformKoku, surum, derleme) {
  const hedefDizin = path.join(platformKoku, HEDEF_ADI);
  fs.mkdirSync(hedefDizin, { recursive: true });
  const adlar = [];
  const kopyala = (dizin, ad) => {
    fs.copyFileSync(path.join(dizin, ad), path.join(hedefDizin, ad));
    adlar.push(ad);
  };
  for (const ad of swiftDosyalari(UZANTI_KAYNAGI)) kopyala(UZANTI_KAYNAGI, ad);
  for (const ad of swiftDosyalari(ORTAK_KAYNAK)) kopyala(ORTAK_KAYNAK, ad);
  for (const ad of POD_KOPYALARI) kopyala(POD_KAYNAGI, ad);
  for (const ad of ALARMKIT_KOPYALARI) kopyala(ALARMKIT_KAYNAGI, ad);
  fs.writeFileSync(path.join(hedefDizin, 'Info.plist'), infoPlistIcerigi(surum, derleme));
  fs.writeFileSync(path.join(hedefDizin, `${HEDEF_ADI}.entitlements`), entitlementsIcerigi());
  // Ayni ad iki kaynakta olmamali (sessizce ezilirdi).
  if (new Set(adlar).size !== adlar.length) {
    throw new Error(`[withNamazWidget] Uzanti kaynaklarinda ayni adli dosya var: ${adlar.join(', ')}`);
  }
  return adlar.sort();
}

function withNamazWidget(config, secenekler) {
  if (!eklentiAraclari || !etkinMi(secenekler)) return config;
  const { withXcodeProject, withEntitlementsPlist, withInfoPlist, IOSConfig } = eklentiAraclari;
  const anaKimlik = config.ios && config.ios.bundleIdentifier;
  if (!anaKimlik) throw new Error('[withNamazWidget] ios.bundleIdentifier gerekli');
  const kimlik = uzantiKimligi(anaKimlik);

  config = easUzantisiniBildir(config, kimlik);

  // Ana uygulama: App Group (widget ile ortak depo) + canli etkinlik destegi.
  config = withEntitlementsPlist(config, (mod) => {
    const mevcut = Array.isArray(mod.modResults[GRUP_ANAHTARI]) ? mod.modResults[GRUP_ANAHTARI] : [];
    if (!mevcut.includes(APP_GROUP)) mod.modResults[GRUP_ANAHTARI] = [...mevcut, APP_GROUP];
    return mod;
  });
  config = withInfoPlist(config, (mod) => {
    mod.modResults.NSSupportsLiveActivities = true;
    mod.modResults[CANLI_ETKINLIK_ANAHTARI] = true;
    return mod;
  });

  config = withXcodeProject(config, (mod) => {
    const proje = mod.modResults;
    const { projectRoot, platformProjectRoot } = mod.modRequest;
    const projeAdi = IOSConfig.XcodeUtils.getProjectName(projectRoot);
    const derleme = (mod.ios && mod.ios.buildNumber) || '1';
    const kaynaklar = uzantiDosyalariniYaz(platformProjectRoot, mod.version || '1.0.0', derleme);

    // Ortak "Kildim" intent'i ANA hedefe de (metadata + uygulama surecinde calisma).
    let sonuc = proje;
    for (const ad of swiftDosyalari(ORTAK_KAYNAK)) {
      sonuc = IOSConfig.XcodeProjectFile.createBuildSourceFile({
        project: sonuc,
        nativeProjectRoot: platformProjectRoot,
        filePath: path.join(projeAdi, ad),
        fileContents: fs.readFileSync(path.join(ORTAK_KAYNAK, ad), 'utf8'),
        overwrite: true,
      });
    }
    const { uuid: anaHedefUuid } = IOSConfig.XcodeUtils.getApplicationNativeTarget({
      project: sonuc,
      projectName: projeAdi,
    });
    // ActivityKit iOS 16.1'de; ana hedefin dagitim hedefi 15.1 → ZAYIF bag (AppIntents deseni).
    sonuc.addFramework('ActivityKit.framework', { weak: true, target: anaHedefUuid });
    uzantiHedefiniEkle(sonuc, { anaHedefUuid, kimlik, kaynaklar });
    mod.modResults = sonuc;
    return mod;
  });
  return config;
}

module.exports = withNamazWidget;
module.exports.etkinMi = etkinMi;
module.exports.easUzantisiniBildir = easUzantisiniBildir;
module.exports.infoPlistIcerigi = infoPlistIcerigi;
module.exports.uzantiHedefiniEkle = uzantiHedefiniEkle;
module.exports.HEDEF_ADI = HEDEF_ADI;
module.exports.APP_GROUP = APP_GROUP;
module.exports.CANLI_ETKINLIK_ANAHTARI = CANLI_ETKINLIK_ANAHTARI;
module.exports.ALARMKIT_KOPYALARI = ALARMKIT_KOPYALARI;
module.exports.uzantiDosyalariniYaz = uzantiDosyalariniYaz;
