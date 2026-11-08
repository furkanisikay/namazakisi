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
 *  - Yerellestirme (W5): `targets/siri-kisayollari/<dil>.lproj/` altindaki `.strings`
 *    dosyalari (`Localizable` = intent basligi/aciklamasi/parametresi, `AppShortcuts` =
 *    Siri ifadeleri) ana hedefin Resources fazina
 *    eklenir; App Intents metinleri CIHAZ diliyle cozulur. `tr.lproj` ZORUNLUDUR: yalniz
 *    `en.lproj` olsaydi Turkce cihaz da (eslesen yerellestirme yok) Ingilizceye duserdi.
 *    Dosyalar Expo `locales` ile ayni yere (`<Proje>/Supporting/<dil>.lproj`) yazilir;
 *    `InfoPlist.strings` (izin metinleri + hizli eylem basliklari) BURADA DEGIL, Expo'nun
 *    `app.json > locales` dosyasindadir (`locales/<dil>.json`) — ayni adla iki kaynak ezisir.
 *  - AppIntents.framework hedefe ZAYIF (Weak) baglanir: dagitim hedefi 15.1,
 *    AppIntents iOS 16'dadir (bkz. `appIntentsZayifBagla`).
 *  - Duvar kagidi yazi tipleri (`FONT_KAYNAKLARI`) ana hedefin Resources fazina ve Info.plist
 *    `UIAppFonts`'a girer (bkz. `fontlariEkle`).
 */
const fs = require('fs');
const path = require('path');

/**
 * Ana uygulamanin paketledigi yazi tipleri (ad → kaynak). TEK KAYNAK `assets/fonts/` (git'te kopya
 * YOK; prebuild `ios/<Proje>/`'ye kopyalar). "Gunun ayeti gorseli" intent'i ana uygulama
 * surecinde cogu zaman JS hic calismadan (Kisayollar otomasyonu) cizer: `expo-font`'un calisma
 * aninda yukledigi font orada yoktur → Resources + `UIAppFonts`. expo-font ayni dosyayi yeniden
 * kaydederken `alreadyRegistered`/`duplicatedName` hatasini yutar (`useFonts` bozulmaz).
 *   - Amiri Quran (OFL 1.1, `assets/fonts/OFL.txt`): duvar kagidinda Arapca (`duvar.arapca` ya da
 *     meali olmayan dil).
 *   - Amiri (OFL 1.1): "Zarif" yazi tipi.
 * PostScript adlari Swift'te `DuvarYazitipleri` (intent dosyasi) ile AYNI.
 */
const FONT_KAYNAKLARI = {
  'AmiriQuran-Regular.ttf': path.join(__dirname, '..', 'assets', 'fonts', 'AmiriQuran-Regular.ttf'),
  'Amiri-Regular.ttf': path.join(__dirname, '..', 'assets', 'fonts', 'Amiri-Regular.ttf'),
};
const ANA_FONTLAR = Object.keys(FONT_KAYNAKLARI);

/** Info.plist `UIAppFonts`'a eksik fontlari ekler (mevcut liste korunur, tekrar eklenmez). */
function fontlariPlisteEkle(infoPlist) {
  const mevcut = Array.isArray(infoPlist.UIAppFonts) ? infoPlist.UIAppFonts : [];
  infoPlist.UIAppFonts = [...mevcut, ...ANA_FONTLAR.filter((ad) => !mevcut.includes(ad))];
  return infoPlist;
}

// Global eas-cli baglaminda @expo/config-plugins bulunamayabilir → eklenti no-op
// (withNamazWidget ile ayni desen; ust duzey `return` Babel/jest'te sozdizimi hatasidir).
let eklentiAraclari = null;
try {
  eklentiAraclari = require('@expo/config-plugins');
} catch {
  eklentiAraclari = null;
}
const IOSConfig = eklentiAraclari ? eklentiAraclari.IOSConfig : null;

const KAYNAK_DIZINI = path.join(__dirname, '..', 'targets', 'siri-kisayollari');
const GELISTIRME_BOLGESI = 'tr';
/**
 * Varsayilan dil listesi: yalniz gelistirme dili → HIC `.lproj` eklenmez (proje eskisiyle ayni).
 * `.lproj` dosyalari uygulamayi iOS gozunde cok dilli yapar (Ayarlar'da dil secici, Siri ve
 * Kisayollar cihaz dilinde) → bir dil ANCAK JS seciciyle AYNI ANDA acilir (yarim dil yok):
 * `app.json > plugins > ["./plugins/withSiriKisayollari", { "diller": ["tr", "en"] }]`.
 * Nobetci: `plugins/__tests__/siriYerellestirme.test.ts` (liste = `DILLER.secilebilir`).
 */
const VARSAYILAN_DILLER = ['tr'];

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

function gelistirmeBolgesiniAyarla(proje, diller) {
  const { firstProject } = proje.getFirstProject();
  firstProject.developmentRegion = GELISTIRME_BOLGESI;
  const bolgeler = Array.isArray(firstProject.knownRegions) ? firstProject.knownRegions : [];
  if (!bolgeler.includes(GELISTIRME_BOLGESI)) bolgeler.unshift(GELISTIRME_BOLGESI);
  for (const dil of diller.length > 1 ? diller : []) {
    if (!bolgeler.includes(dil)) bolgeler.push(dil);
  }
  firstProject.knownRegions = bolgeler;
}

/** Bir dilin `.strings` dosyalari (sirali → deterministik proje dosyasi). */
function yerellestirmeDosyalari(dil) {
  const dizin = path.join(KAYNAK_DIZINI, `${dil}.lproj`);
  if (!fs.existsSync(dizin)) return [];
  return fs
    .readdirSync(dizin)
    .filter((ad) => ad.endsWith('.strings'))
    .sort();
}

/**
 * `.strings` dosyalarini `ios/<Proje>/Supporting/<dil>.lproj/` altina kopyalar ve ANA
 * hedefin Resources fazina ekler (Expo `Locales.writeStringsFile` deseni). Icerik her
 * prebuild'de yenilenir; proje kaydi idempotenttir (ayni adli dosya grupta varsa eklenmez).
 */
function yerellestirmeleriEkle(proje, modRequest, projeAdi, diller) {
  if (diller.length <= 1) return proje;
  const { uuid } = IOSConfig.XcodeUtils.getApplicationNativeTarget({ project: proje, projectName: projeAdi });
  const destekDizini = path.join(modRequest.platformProjectRoot, projeAdi, 'Supporting');
  let sonuc = proje;
  for (const dil of diller) {
    const dosyalar = yerellestirmeDosyalari(dil);
    if (dosyalar.length === 0) continue;
    const hedefDizin = path.join(destekDizini, `${dil}.lproj`);
    fs.mkdirSync(hedefDizin, { recursive: true });
    const grupAdi = `${projeAdi}/Supporting/${dil}.lproj`;
    const grup = IOSConfig.XcodeUtils.ensureGroupRecursively(sonuc, grupAdi);
    for (const ad of dosyalar) {
      fs.copyFileSync(path.join(KAYNAK_DIZINI, `${dil}.lproj`, ad), path.join(hedefDizin, ad));
      if (grup && grup.children.some((cocuk) => cocuk.comment === ad)) continue;
      sonuc = IOSConfig.XcodeUtils.addResourceFileToGroup({
        filepath: `${dil}.lproj/${ad}`,
        groupName: grupAdi,
        project: sonuc,
        isBuildFile: true,
        verbose: true,
        targetUuid: uuid,
      });
    }
  }
  return sonuc;
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

/**
 * `FONT_KAYNAKLARI`'ni `ios/<Proje>/`'ye kopyalar ve ANA hedefin Resources fazina ekler
 * (Expo `GoogleService-Info.plist` deseni). Dosya her prebuild'de yenilenir; proje kaydi
 * idempotenttir (`hasFile`).
 */
function fontlariEkle(proje, platformProjeKoku, projeAdi) {
  const { uuid } = IOSConfig.XcodeUtils.getApplicationNativeTarget({ project: proje, projectName: projeAdi });
  const hedefDizin = path.join(platformProjeKoku, projeAdi);
  fs.mkdirSync(hedefDizin, { recursive: true });
  let sonuc = proje;
  for (const ad of ANA_FONTLAR) {
    fs.copyFileSync(FONT_KAYNAKLARI[ad], path.join(hedefDizin, ad));
    const dosyaYolu = `${projeAdi}/${ad}`;
    if (sonuc.hasFile(dosyaYolu)) continue;
    sonuc = IOSConfig.XcodeUtils.addResourceFileToGroup({
      filepath: dosyaYolu,
      groupName: projeAdi,
      project: sonuc,
      isBuildFile: true,
      verbose: true,
      targetUuid: uuid,
    });
  }
  return sonuc;
}

function withSiriKisayollari(config, secenekler = {}) {
  if (!eklentiAraclari) return config;
  const { withXcodeProject, withInfoPlist } = eklentiAraclari;
  const diller = Array.isArray(secenekler.diller) && secenekler.diller.length > 0 ? secenekler.diller : VARSAYILAN_DILLER;
  const projeli = withXcodeProject(config, (mod) => {
    const { proje: kaynakli, projeAdi } = kaynaklariEkle(mod.modResults, mod.modRequest);
    const yerelli = yerellestirmeleriEkle(kaynakli, mod.modRequest, projeAdi, diller);
    const proje = fontlariEkle(yerelli, mod.modRequest.platformProjectRoot, projeAdi);
    gelistirmeBolgesiniAyarla(proje, diller);
    appIntentsZayifBagla(proje, projeAdi);
    mod.modResults = proje;
    return mod;
  });
  return withInfoPlist(projeli, (mod) => {
    mod.modResults = fontlariPlisteEkle(mod.modResults);
    return mod;
  });
}

module.exports = withSiriKisayollari;
module.exports.FONT_KAYNAKLARI = FONT_KAYNAKLARI;
module.exports.ANA_FONTLAR = ANA_FONTLAR;
module.exports.fontlariPlisteEkle = fontlariPlisteEkle;
module.exports.fontlariEkle = fontlariEkle;
