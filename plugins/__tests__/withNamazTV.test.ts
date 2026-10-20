/**
 * Apple TV panosu eklentisi. Expo'nun şablon projesi (`node_modules/expo/template.tgz`)
 * üzerinde kurulan tvOS hedefini denetler; gerçek derleme macOS CI'dadır
 * (`ios-siri-derleme.yml > tv-derleme`, `NAMAZ_IOS_TV=1`).
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const eklenti = require('../withNamazTV');
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

const ayarlar = (proje: any, hedef: any) =>
    proje
        .pbxXCConfigurationList()[hedef.buildConfigurationList]
        .buildConfigurations.map((c: { value: string }) => proje.pbxXCBuildConfigurationSection()[c.value].buildSettings);

describe('withNamazTV — bayrak', () => {
    it('varsayılan KAPALI; seçenek açar; ortam değişkeni ezer; diğer bayraklar açmaz', () => {
        expect(eklenti.etkinMi(undefined, {})).toBe(false);
        expect(eklenti.etkinMi({ etkin: true }, {})).toBe(true);
        expect(eklenti.etkinMi({ etkin: false }, { NAMAZ_IOS_TV: '1' })).toBe(true);
        expect(eklenti.etkinMi({ etkin: true }, { NAMAZ_IOS_TV: '0' })).toBe(false);
        expect(eklenti.etkinMi(undefined, { NAMAZ_IOS_WIDGET: '1', NAMAZ_IOS_SAAT: '1' })).toBe(false);
    });

    it('kapalıyken yapılandırmaya HİÇ dokunmaz', () => {
        const onceki = process.env.NAMAZ_IOS_TV;
        delete process.env.NAMAZ_IOS_TV;
        const config = { ios: { bundleIdentifier: 'com.ornek' } };
        expect(eklenti(config, { etkin: false })).toBe(config);
        if (onceki !== undefined) process.env.NAMAZ_IOS_TV = onceki;
    });

    it("app.json'da eklenti KAPALI kayıtlı", () => {
        const app = JSON.parse(fs.readFileSync(path.join(KOK, 'app.json'), 'utf8'));
        const kayit = app.expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === './plugins/withNamazTV');
        expect(kayit).toEqual(['./plugins/withNamazTV', { etkin: false }]);
    });
});

describe('withNamazTV — Xcode hedefi', () => {
    const kur = () => {
        const proje = sablonProjesi();
        const anaUuid = proje.getFirstTarget().uuid;
        eklenti.tvHedefiniEkle(proje, { anaKimlik: 'com.ornek', kaynaklar: ['NamazTVUygulamasi.swift', 'TvPano.swift'] });
        return { proje, anaUuid };
    };

    it('tvOS uygulama hedefi: appletvos, aile 3, ana kimlik (universal purchase), kaynak + iller.json', () => {
        const { proje } = kur();
        const hedef = proje.pbxTargetByName(eklenti.TV_HEDEFI);
        expect(hedef.productType).toBe('"com.apple.product-type.application"');
        for (const a of ayarlar(proje, hedef)) {
            expect(a.SDKROOT).toBe('appletvos');
            expect(a.TARGETED_DEVICE_FAMILY).toBe('3');
            expect(a.PRODUCT_BUNDLE_IDENTIFIER).toBe('"com.ornek"');
            expect(a.DEVELOPMENT_TEAM).toBeUndefined();
        }
        const dosyalar = Object.values(proje.pbxBuildFileSection()).filter((x) => typeof x === 'string') as string[];
        expect(dosyalar).toEqual(expect.arrayContaining(['TvPano.swift in Sources', 'iller.json in Resources']));
    });

    it('ana hedef DEĞİŞMEZ: ilk application hedefi ana kalır, bağımlılık/gömme yok', () => {
        const { proje, anaUuid } = kur();
        expect(proje.getFirstTarget().uuid).toBe(anaUuid);
        const ana = proje.pbxNativeTargetSection()[anaUuid];
        expect(ana.dependencies).toEqual([]);
        expect(ana.buildPhases.map((f: { comment: string }) => f.comment)).not.toContain('Embed Watch Content');
    });

    it('idempotent: ikinci çağrı hedef eklemez', () => {
        const { proje } = kur();
        const sayi = proje.hash.project.objects.PBXProject[proje.hash.project.rootObject].targets.length;
        expect(eklenti.tvHedefiniEkle(proje, { anaKimlik: 'com.ornek', kaynaklar: [] })).toBeNull();
        expect(proje.hash.project.objects.PBXProject[proje.hash.project.rootObject].targets.length).toBe(sayi);
    });

    it('dosyaları yazar: Swift kaynakları, iller.json, Info.plist (sürüm ana uygulamayla aynı)', () => {
        const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'namaz-tv-'));
        const adlar = eklenti.tvDosyalariniYaz(gecici, '1.2.3', '45');
        expect(adlar).toEqual(expect.arrayContaining(['NamazTVUygulamasi.swift', 'TvPano.swift', 'TvVakitHesabi.swift']));
        const dizin = path.join(gecici, eklenti.TV_HEDEFI);
        expect(JSON.parse(fs.readFileSync(path.join(dizin, 'iller.json'), 'utf8'))).toHaveLength(81);
        const plist = fs.readFileSync(path.join(dizin, 'Info.plist'), 'utf8');
        expect(plist).toContain('<string>1.2.3</string>');
        expect(plist).toContain('<string>45</string>');
        fs.rmSync(gecici, { recursive: true, force: true });
    });
});
