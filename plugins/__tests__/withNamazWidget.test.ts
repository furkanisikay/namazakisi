/**
 * iOS widget uzantısı eklentisi (issue #295).
 *
 * `npm run verify` Xcode'u GÖRMEZ ve `ios/` git'te değildir; bu test Expo'nun kendi
 * şablon projesi (`node_modules/expo/template.tgz`) üzerinde eklentinin kurduğu hedefi,
 * bağımlılığı ve gömme fazını denetler. Gerçek derleme macOS CI'dadır
 * (`ios-siri-derleme.yml`, `NAMAZ_IOS_WIDGET=1`).
 */
import { execFileSync } from 'child_process';
import path from 'path';

const eklenti = require('../withNamazWidget');
const xcode = require('xcode');

const KOK = path.join(__dirname, '../..');

function sablonProjesi() {
  const icerik = execFileSync(
    'tar',
    // Goreli yol + cwd: Windows'ta GNU tar `D:\...` yolunu uzak makine sanar.
    ['-xzf', 'node_modules/expo/template.tgz', '-O', 'package/ios/HelloWorld.xcodeproj/project.pbxproj'],
    { encoding: 'utf8', cwd: KOK }
  );
  const proje = xcode.project('/yok/project.pbxproj');
  proje.hash = require('xcode/lib/parser/pbxproj').parse(icerik);
  return proje;
}

const anaHedefUuid = (proje: any): string => proje.getFirstTarget().uuid;

describe('withNamazWidget — bayrak', () => {
  it('varsayılan KAPALI; seçenek açar; ortam değişkeni ezer', () => {
    expect(eklenti.etkinMi(undefined, {})).toBe(false);
    expect(eklenti.etkinMi({ etkin: false }, {})).toBe(false);
    expect(eklenti.etkinMi({ etkin: true }, {})).toBe(true);
    expect(eklenti.etkinMi({ etkin: false }, { NAMAZ_IOS_WIDGET: '1' })).toBe(true);
    expect(eklenti.etkinMi({ etkin: true }, { NAMAZ_IOS_WIDGET: '0' })).toBe(false);
  });

  it('kapalıyken yapılandırmaya HİÇ dokunmaz (TestFlight hattı birebir)', () => {
    const onceki = process.env.NAMAZ_IOS_WIDGET;
    delete process.env.NAMAZ_IOS_WIDGET;
    const config = { ios: { bundleIdentifier: 'com.ornek' }, extra: { eas: { projectId: 'x' } } };
    const sonuc = eklenti(config, { etkin: false });
    expect(sonuc).toBe(config);
    expect(sonuc).toEqual({ ios: { bundleIdentifier: 'com.ornek' }, extra: { eas: { projectId: 'x' } } });
    if (onceki !== undefined) process.env.NAMAZ_IOS_WIDGET = onceki;
  });
});

describe('withNamazWidget — EAS uzantı bildirimi', () => {
  it('uzantıyı App Group yetkisiyle bildirir, projectId korunur, tekrar eklemez', () => {
    const config = { extra: { eas: { projectId: 'p' } } };
    eklenti.easUzantisiniBildir(config, 'com.ornek.widget');
    eklenti.easUzantisiniBildir(config, 'com.ornek.widget');
    expect(config.extra.eas).toEqual({
      projectId: 'p',
      build: {
        experimental: {
          ios: {
            appExtensions: [
              {
                targetName: 'NamazWidget',
                bundleIdentifier: 'com.ornek.widget',
                entitlements: { 'com.apple.security.application-groups': ['group.com.furkanisikay.namazakisi'] },
              },
            ],
          },
        },
      },
    });
  });

  it('Info.plist sürümü ana uygulamayla aynı yazılır ve WidgetKit uzantı noktası taşır', () => {
    const plist = eklenti.infoPlistIcerigi('0.30.2', '1760000000');
    expect(plist).toContain('<string>0.30.2</string>');
    expect(plist).toContain('<string>1760000000</string>');
    expect(plist).toContain('com.apple.widgetkit-extension');
  });

  it('Info.plist günün ayeti fontunu UIAppFonts ile kaydeder (yoksa Arapça sistem fontuna düşer)', () => {
    const plist: string = eklenti.infoPlistIcerigi('1.0.0', '1');
    expect(plist).toMatch(/<key>UIAppFonts<\/key>\s*<array>\s*<string>AmiriQuran-Regular\.ttf<\/string>\s*<\/array>/);
  });
});

describe('withNamazWidget — uzantı kaynakları', () => {
  it('AlarmKit meta veri tipi uzantıya da kopyalanır (alarmın canlı etkinlik sunumu, issue #74)', () => {
    const fs = require('fs');
    const os = require('os');
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'namaz-widget-'));
    try {
      const adlar: string[] = eklenti.uzantiDosyalariniYaz(dizin, '1.0.0', '1');
      expect(adlar).toContain('NamazAlarmVerisi.swift');
      expect(adlar).toContain('AlarmCanliEtkinlikWidget.swift');
      expect(fs.existsSync(path.join(dizin, 'NamazWidget', 'NamazAlarmVerisi.swift'))).toBe(true);
      // Günün ayeti: widget kaynağı derlenir, font kopyalanır ama Sources listesine GİRMEZ.
      expect(adlar).toContain('GununAyetiWidget.swift');
      expect(adlar.filter((ad) => !ad.endsWith('.swift'))).toEqual([]);
      for (const ad of eklenti.UZANTI_FONTLARI as string[]) {
        expect(fs.existsSync(path.join(dizin, 'NamazWidget', ad))).toBe(true);
      }
    } finally {
      fs.rmSync(dizin, { recursive: true, force: true });
    }
  });
});

describe('withNamazWidget — Xcode hedefi (Expo şablonu üzerinde)', () => {
  const kur = () => {
    const proje = sablonProjesi();
    eklenti.uzantiHedefiniEkle(proje, {
      anaHedefUuid: anaHedefUuid(proje),
      kimlik: 'com.ornek.widget',
      kaynaklar: ['NamazWidgetPaketi.swift', 'VakitKarari.swift'],
      paketKaynaklari: eklenti.UZANTI_FONTLARI,
    });
    return proje;
  };

  it('günün ayeti fontu uzantının Resources fazındadır (Sources\'ta değil)', () => {
    const proje = kur();
    const hedef = proje.pbxTargetByName('NamazWidget');
    const nesneler = proje.hash.project.objects;
    const kaynakFazi = hedef.buildPhases.find((f: { comment: string }) => f.comment === 'Resources');
    expect(nesneler.PBXResourcesBuildPhase[kaynakFazi.value].files.map((f: { comment: string }) => f.comment)).toEqual([
      'AmiriQuran-Regular.ttf in Resources',
    ]);
  });

  it('uzantı hedefi, ayarları ve kaynakları kurulur', () => {
    const proje = kur();
    const hedef = proje.pbxTargetByName('NamazWidget');
    expect(hedef.productType).toBe('"com.apple.product-type.app-extension"');
    const liste = proje.pbxXCConfigurationList()[hedef.buildConfigurationList];
    const ayarlar = liste.buildConfigurations.map((c: { value: string }) => proje.pbxXCBuildConfigurationSection()[c.value].buildSettings);
    for (const a of ayarlar) {
      expect(a.PRODUCT_BUNDLE_IDENTIFIER).toBe('"com.ornek.widget"');
      expect(a.IPHONEOS_DEPLOYMENT_TARGET).toBe('16.2');
      expect(a.APPLICATION_EXTENSION_API_ONLY).toBe('YES');
      expect(String(a.SWIFT_ACTIVE_COMPILATION_CONDITIONS)).toContain('NAMAZ_WIDGET_UZANTISI');
      expect(a.CODE_SIGN_ENTITLEMENTS).toBe('"NamazWidget/NamazWidget.entitlements"');
      // AlarmKit (iOS 26) 16.2 hedefli uzantıda ZAYIF bağlanır (eski sistemde yüklenebilsin).
      expect(String(a.OTHER_LDFLAGS)).toContain('-weak_framework AlarmKit');
    }
    const kaynakFazi = proje.hash.project.objects.PBXSourcesBuildPhase[hedef.buildPhases[0].value];
    expect(kaynakFazi.files.map((f: { comment: string }) => f.comment)).toEqual([
      'NamazWidgetPaketi.swift in Sources',
      'VakitKarari.swift in Sources',
    ]);
  });

  it('ana hedef uzantıya bağımlıdır ve onu betik fazlarından ÖNCE gömer', () => {
    const proje = kur();
    const ana = proje.getFirstTarget().firstTarget;
    const fazlar = ana.buildPhases.map((f: { comment: string }) => f.comment);
    const gomme = fazlar.indexOf('Embed Foundation Extensions');
    expect(gomme).toBe(fazlar.indexOf('Resources') + 1);
    expect(gomme).toBeLessThan(fazlar.indexOf('Bundle React Native code and images'));
    const faz = proje.hash.project.objects.PBXCopyFilesBuildPhase[ana.buildPhases[gomme].value];
    expect(faz.dstSubfolderSpec).toBe(13);
    expect(ana.dependencies).toHaveLength(1);
    const bag = proje.hash.project.objects.PBXTargetDependency[ana.dependencies[0].value];
    expect(proje.hash.project.objects.PBXNativeTarget[bag.target].name).toBe('NamazWidget');
  });

  it('yeniden prebuild idempotenttir ve proje dosyası geri ayrıştırılabilir', () => {
    const proje = kur();
    eklenti.uzantiHedefiniEkle(proje, {
      anaHedefUuid: anaHedefUuid(proje),
      kimlik: 'com.ornek.widget',
      kaynaklar: ['NamazWidgetPaketi.swift'],
    });
    expect(proje.getFirstProject().firstProject.targets).toHaveLength(2);
    const yazilan = proje.writeSync();
    const tekrar = require('xcode/lib/parser/pbxproj').parse(yazilan);
    expect(Object.values(tekrar.project.objects.PBXNativeTarget).filter((t: any) => t?.name === 'NamazWidget')).toHaveLength(1);
  });
});
