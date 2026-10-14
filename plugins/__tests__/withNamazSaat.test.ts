/**
 * Apple Watch eklentisi (issue #285).
 *
 * `npm run verify` Xcode'u GÖRMEZ ve `ios/` git'te değildir; bu test Expo'nun kendi
 * şablon projesi (`node_modules/expo/template.tgz`) üzerinde eklentinin kurduğu iki
 * watchOS hedefini, bağımlılıkları ve gömme fazlarını denetler. Gerçek derleme macOS
 * CI'dadır (`ios-siri-derleme.yml`, `NAMAZ_IOS_SAAT=1`).
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const eklenti = require('../withNamazSaat');
const widgetEklentisi = require('../withNamazWidget');
const xcode = require('xcode');

const KOK = path.join(__dirname, '../..');

function sablonProjesi() {
    const icerik = execFileSync(
        'tar',
        ['-xzf', path.join(KOK, 'node_modules/expo/template.tgz'), '-O', 'package/ios/HelloWorld.xcodeproj/project.pbxproj'],
        { encoding: 'utf8' }
    );
    const proje = xcode.project('/yok/project.pbxproj');
    proje.hash = require('xcode/lib/parser/pbxproj').parse(icerik);
    return proje;
}

const anaHedefUuid = (proje: any): string => proje.getFirstTarget().uuid;
const nesneler = (proje: any) => proje.hash.project.objects;
const ayarlar = (proje: any, hedef: any) =>
    proje
        .pbxXCConfigurationList()[hedef.buildConfigurationList]
        .buildConfigurations.map((c: { value: string }) => proje.pbxXCBuildConfigurationSection()[c.value].buildSettings);

const kur = (proje = sablonProjesi()) => {
    eklenti.saatHedefleriniEkle(proje, {
        anaHedefUuid: anaHedefUuid(proje),
        anaKimlik: 'com.ornek',
        saatKaynaklari: ['AnaEkran.swift', 'SaatYuku.swift'],
        widgetKaynaklari: ['SaatKomplikasyonu.swift', 'SaatYuku.swift'],
    });
    return proje;
};

describe('withNamazSaat — bayrak', () => {
    it('varsayılan KAPALI; seçenek açar; ortam değişkeni ezer', () => {
        expect(eklenti.etkinMi(undefined, {})).toBe(false);
        expect(eklenti.etkinMi({ etkin: false }, {})).toBe(false);
        expect(eklenti.etkinMi({ etkin: true }, {})).toBe(true);
        expect(eklenti.etkinMi({ etkin: false }, { NAMAZ_IOS_SAAT: '1' })).toBe(true);
        expect(eklenti.etkinMi({ etkin: true }, { NAMAZ_IOS_SAAT: '0' })).toBe(false);
        // Widget bayrağı saati AÇMAZ (bağımsız bayraklar).
        expect(eklenti.etkinMi(undefined, { NAMAZ_IOS_WIDGET: '1' })).toBe(false);
    });

    it('kapalıyken yapılandırmaya HİÇ dokunmaz (TestFlight hattı birebir)', () => {
        const onceki = process.env.NAMAZ_IOS_SAAT;
        delete process.env.NAMAZ_IOS_SAAT;
        const config = { ios: { bundleIdentifier: 'com.ornek' }, extra: { eas: { projectId: 'x' } } };
        const sonuc = eklenti(config, { etkin: false });
        expect(sonuc).toBe(config);
        expect(sonuc).toEqual({ ios: { bundleIdentifier: 'com.ornek' }, extra: { eas: { projectId: 'x' } } });
        if (onceki !== undefined) process.env.NAMAZ_IOS_SAAT = onceki;
    });

    it('app.json\'da eklenti KAPALI kayıtlı (varsayılan build saat hedefini taşımaz)', () => {
        const app = JSON.parse(fs.readFileSync(path.join(KOK, 'app.json'), 'utf8'));
        const kayit = app.expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === './plugins/withNamazSaat');
        expect(kayit).toEqual(['./plugins/withNamazSaat', { etkin: false }]);
    });
});

describe('withNamazSaat — EAS hedef bildirimi', () => {
    it('iki hedef App Group yetkisiyle; uzantının ebeveyni SAAT uygulaması; widget kaydı korunur; tekrar eklemez', () => {
        const config = { extra: { eas: { projectId: 'p' } } };
        widgetEklentisi.easUzantisiniBildir(config, 'com.ornek.widget');
        eklenti.easHedefleriniBildir(config, 'com.ornek');
        eklenti.easHedefleriniBildir(config, 'com.ornek');
        const liste = (config as any).extra.eas.build.experimental.ios.appExtensions;
        expect(liste.map((u: { targetName: string }) => u.targetName)).toEqual(['NamazWidget', 'NamazSaat', 'NamazSaatWidget']);
        const yetki = { 'com.apple.security.application-groups': ['group.com.furkanisikay.namazakisi'] };
        expect(liste[1]).toEqual({
            targetName: 'NamazSaat',
            bundleIdentifier: 'com.ornek.watchkitapp',
            parentBundleIdentifier: 'com.ornek',
            entitlements: yetki,
        });
        expect(liste[2]).toEqual({
            targetName: 'NamazSaatWidget',
            bundleIdentifier: 'com.ornek.watchkitapp.widget',
            parentBundleIdentifier: 'com.ornek.watchkitapp',
            entitlements: yetki,
        });
        expect((config as any).extra.eas.projectId).toBe('p');
    });

    it('Info.plist: tek hedefli saat uygulaması telefona bağlı; uzantı WidgetKit; sürüm ana uygulamayla aynı', () => {
        const saat = eklenti.saatInfoPlist('0.31.0', '1760000000', 'com.ornek');
        expect(saat).toContain('<key>WKApplication</key>\n  <true/>');
        expect(saat).toContain('<key>WKCompanionAppBundleIdentifier</key>\n  <string>com.ornek</string>');
        expect(saat).toContain('<key>WKRunsIndependentlyOfCompanionApp</key>\n  <false/>');
        expect(saat).toContain('<string>0.31.0</string>');
        expect(saat).toContain('<string>1760000000</string>');
        const uzanti = eklenti.widgetInfoPlist('0.31.0', '1760000000');
        expect(uzanti).toContain('com.apple.widgetkit-extension');
        expect(uzanti).not.toContain('WKApplication');
    });
});

describe('withNamazSaat — kaynak kopyalama', () => {
    it('saat ve uzantı ORTAK saf dosyaları + pod kopyalarını alır; test koşucusu hiçbir hedefe girmez', () => {
        const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'namaz-saat-'));
        try {
            const saat = eklenti.kaynaklariKopyala(path.join(gecici, 'NamazSaat'), [
                path.join(KOK, 'targets/saat'),
                path.join(KOK, 'targets/saat/ortak'),
            ]);
            const uzanti = eklenti.kaynaklariKopyala(path.join(gecici, 'NamazSaatWidget'), [
                path.join(KOK, 'targets/saat-widget'),
                path.join(KOK, 'targets/saat/ortak'),
            ]);
            for (const ortak of ['SaatYuku.swift', 'SaatDeposu.swift', 'Tesbihat.swift', 'VakitKarari.swift', 'WidgetKarari.swift', 'SaatIletisi.swift']) {
                expect(saat).toContain(ortak);
                expect(uzanti).toContain(ortak);
            }
            expect(saat).toContain('NamazSaatUygulamasi.swift');
            expect(saat).not.toContain('SaatKomplikasyonu.swift');
            expect(uzanti).toContain('SaatKomplikasyonu.swift');
            expect(uzanti).not.toContain('AnaEkran.swift');
            expect([...saat, ...uzanti]).not.toContain('main.swift');
            // Telefon koprusu (WatchConnectivity iOS delegesi) saat hedeflerine GIRMEZ.
            expect([...saat, ...uzanti]).not.toContain('SaatKoprusu.swift');
        } finally {
            fs.rmSync(gecici, { recursive: true, force: true });
        }
    });
});

describe('withNamazSaat — Xcode hedefleri (Expo şablonu üzerinde)', () => {
    it('saat uygulaması: watchOS SDK, tek hedefli `application`, ikon kataloğu, App Group yetkisi', () => {
        const proje = kur();
        const hedef = proje.pbxTargetByName('NamazSaat');
        expect(hedef.productType).toBe('"com.apple.product-type.application"');
        for (const a of ayarlar(proje, hedef)) {
            expect(a.SDKROOT).toBe('watchos');
            expect(a.WATCHOS_DEPLOYMENT_TARGET).toBe('10.0');
            expect(a.TARGETED_DEVICE_FAMILY).toBe('4');
            expect(a.PRODUCT_BUNDLE_IDENTIFIER).toBe('"com.ornek.watchkitapp"');
            expect(a.ASSETCATALOG_COMPILER_APPICON_NAME).toBe('AppIcon');
            expect(a.CODE_SIGN_ENTITLEMENTS).toBe('"NamazSaat/NamazSaat.entitlements"');
            expect(a.SKIP_INSTALL).toBe('YES');
            expect(a.DEVELOPMENT_TEAM).toBeUndefined();
        }
        const fazlar = hedef.buildPhases.map((f: { comment: string }) => f.comment);
        expect(fazlar).toEqual(['Sources', 'Frameworks', 'Resources', 'Embed Foundation Extensions']);
        const kaynak = nesneler(proje).PBXResourcesBuildPhase[hedef.buildPhases[2].value];
        expect(kaynak.files.map((f: { comment: string }) => f.comment)).toEqual(['Assets.xcassets in Resources']);
    });

    it('komplikasyon uzantısı: watchOS app-extension, saat uygulamasına gömülür ve ona bağımlıdır', () => {
        const proje = kur();
        const uzanti = proje.pbxTargetByName('NamazSaatWidget');
        expect(uzanti.productType).toBe('"com.apple.product-type.app-extension"');
        for (const a of ayarlar(proje, uzanti)) {
            expect(a.SDKROOT).toBe('watchos');
            expect(a.APPLICATION_EXTENSION_API_ONLY).toBe('YES');
            expect(a.PRODUCT_BUNDLE_IDENTIFIER).toBe('"com.ornek.watchkitapp.widget"');
        }
        const saat = proje.pbxTargetByName('NamazSaat');
        const gomme = nesneler(proje).PBXCopyFilesBuildPhase[saat.buildPhases[3].value];
        expect(gomme.dstSubfolderSpec).toBe(13);
        expect(gomme.files[0].comment).toBe('NamazSaatWidget.appex in Embed Foundation Extensions');
        const bag = nesneler(proje).PBXTargetDependency[saat.dependencies[0].value];
        expect(nesneler(proje).PBXNativeTarget[bag.target].name).toBe('NamazSaatWidget');
    });

    it('ana uygulama saati Watch klasörüne, betik fazlarından ÖNCE gömer; ana hedef hâlâ İLK application', () => {
        const proje = kur();
        const ana = proje.getFirstTarget().firstTarget;
        expect(ana.name).toBe('HelloWorld');
        // Expo `getApplicationNativeTarget` ilk `application` hedefini ana sayar.
        expect(proje.getTarget('com.apple.product-type.application').target.name).toBe('HelloWorld');
        const fazlar = ana.buildPhases.map((f: { comment: string }) => f.comment);
        const gomme = fazlar.indexOf('Embed Watch Content');
        expect(gomme).toBe(fazlar.indexOf('Resources') + 1);
        expect(gomme).toBeLessThan(fazlar.indexOf('Bundle React Native code and images'));
        const faz = nesneler(proje).PBXCopyFilesBuildPhase[ana.buildPhases[gomme].value];
        expect(faz.dstSubfolderSpec).toBe(16);
        expect(faz.dstPath).toBe('"$(CONTENTS_FOLDER_PATH)/Watch"');
        expect(faz.files[0].comment).toBe('NamazSaat.app in Embed Watch Content');
        const bag = nesneler(proje).PBXTargetDependency[ana.dependencies[0].value];
        expect(nesneler(proje).PBXNativeTarget[bag.target].name).toBe('NamazSaat');
    });

    it('iPhone widget eklentisiyle birlikte: iki gömme fazı + iki bağımlılık, dört hedef', () => {
        const proje = sablonProjesi();
        widgetEklentisi.uzantiHedefiniEkle(proje, {
            anaHedefUuid: anaHedefUuid(proje),
            kimlik: 'com.ornek.widget',
            kaynaklar: ['NamazWidgetPaketi.swift'],
        });
        kur(proje);
        const ana = proje.getFirstTarget().firstTarget;
        const fazlar = ana.buildPhases.map((f: { comment: string }) => f.comment);
        expect(fazlar).toContain('Embed Foundation Extensions');
        expect(fazlar).toContain('Embed Watch Content');
        expect(ana.dependencies).toHaveLength(2);
        expect(proje.getFirstProject().firstProject.targets).toHaveLength(4);
    });

    it('yeniden prebuild idempotenttir ve proje dosyası geri ayrıştırılabilir', () => {
        const proje = kur();
        kur(proje);
        expect(proje.getFirstProject().firstProject.targets).toHaveLength(3);
        const yazilan = proje.writeSync();
        const tekrar = require('xcode/lib/parser/pbxproj').parse(yazilan);
        const adlar = Object.values(tekrar.project.objects.PBXNativeTarget)
            .map((t: any) => t?.name)
            .filter(Boolean);
        expect(adlar.filter((a: string) => a === 'NamazSaat')).toHaveLength(1);
        expect(adlar.filter((a: string) => a === 'NamazSaatWidget')).toHaveLength(1);
        expect(yazilan).toContain('dstPath = "$(CONTENTS_FOLDER_PATH)/Watch";');
    });
});
