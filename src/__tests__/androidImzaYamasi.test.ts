/**
 * GitHub Release APK'sının imza zinciri (güvenlik denetimi 2026-11): depodaki `release` derleme
 * türü herkese açık `debug.keystore` ile imzalar. CI yaması onu yayın anahtarına ÇEVİRMELİ ve
 * debug anahtarıyla imzalı APK hiçbir koşulda sürüme eklenmemeli.
 */
import * as fs from 'fs';
import * as path from 'path';

const { imzaYamasiUygula, releaseImzaAdlari } = require('../../scripts/android-imza-yamasi.js') as {
  imzaYamasiUygula: (icerik: string) => string;
  releaseImzaAdlari: (icerik: string) => string[];
};

const kok = path.join(__dirname, '..', '..');
const oku = (...parca: string[]) => fs.readFileSync(path.join(kok, ...parca), 'utf8');
const gradle = oku('android', 'app', 'build.gradle');

describe('android-imza-yamasi', () => {
  it('depodaki build.gradle: release bugün debug anahtarıyla imzalar (yamanın var olma nedeni)', () => {
    expect(releaseImzaAdlari(gradle)).toEqual(['debug']);
  });

  it('yama release derlemesini YALNIZ yayın anahtarına bağlar', () => {
    const yamali = imzaYamasiUygula(gradle);
    expect(releaseImzaAdlari(yamali)).toEqual(['release']);
    expect(yamali).toContain("storeFile file(project.property('RELEASE_STORE_FILE'))");
    // Debug derlemesi ve debug imza tanımı yerinde kalır.
    expect(yamali).toMatch(/debug\s*\{\s*signingConfig signingConfigs\.debug/);
    expect(yamali).toContain("storeFile file('debug.keystore')");
  });

  it('eski yama biçimi (satır EKLEMEK) debug imzayı bırakır — son atama kazanır', () => {
    const eski = gradle.replace(/(buildTypes\s*\{[\s\S]*?release\s*\{)/, '$1\n            signingConfig signingConfigs.release');
    expect(releaseImzaAdlari(eski)).toEqual(['release', 'debug']);
  });

  it('şablon değişmişse sessizce geçmez, fırlatır', () => {
    expect(() => imzaYamasiUygula(gradle.replace(/signingConfig signingConfigs\.debug/g, ''))).toThrow();
    expect(() => imzaYamasiUygula('android { buildTypes { release { } } }')).toThrow();
  });

  it('yama iki kez uygulanamaz (zaten yamalı dosya hata verir)', () => {
    expect(() => imzaYamasiUygula(imzaYamasiUygula(gradle))).toThrow();
  });
});

describe('android-build.yml imza kapıları', () => {
  const is = oku('.github', 'workflows', 'android-build.yml');

  it('yamayı betikten uygular; satır ekleyen eski gömülü yama geri gelmez', () => {
    expect(is).toContain('node scripts/android-imza-yamasi.js android/app/build.gradle');
    expect(is).not.toContain('update_signing.js');
    expect(is).not.toMatch(/debug signing kullanilacak/i);
  });

  it('APK yalnız imza denetiminden geçerse sürüme eklenir', () => {
    expect(is).toContain('bash scripts/apk-imza-denetimi.sh "$APK" android/app/debug.keystore');
    expect(is).toContain("files: ${{ steps.imza.outputs.yayinla == 'true' && steps.rename.outputs.apk_name || '' }}");
    expect(is).not.toMatch(/^\s*files: \$\{\{ steps\.rename\.outputs\.apk_name \}\}\s*$/m);
  });

  it('imza sırları run: metnine gömülmez (env ile geçer)', () => {
    const satirlar = is.split('\n');
    const gomulu = satirlar.filter(
      (s) => /\$\{\{\s*secrets\.ANDROID_(KEYSTORE|KEY)_/.test(s) && !/^\s*[A-Z0-9_]+:\s*\$\{\{\s*secrets\.[A-Z0-9_]+\s*\}\}\s*$/.test(s),
    );
    expect(gomulu).toEqual([]);
  });
});

describe('iş akışlarında üçüncü taraf action sabitlemesi', () => {
  const dizin = path.join(kok, '.github', 'workflows');
  const kullanimlar = fs
    .readdirSync(dizin)
    .filter((d) => d.endsWith('.yml'))
    .flatMap((d) =>
      fs
        .readFileSync(path.join(dizin, d), 'utf8')
        .split('\n')
        .map((s) => /^\s*(?:-\s*)?uses:\s*(\S+)/.exec(s)?.[1])
        .filter((u): u is string => !!u)
        .map((u) => ({ dosya: d, uses: u })),
    );

  it('GitHub dışındaki her action tam commit SHA ile çağrılır (etiket taşınabilir)', () => {
    const ucuncuTaraf = kullanimlar.filter(({ uses }) => !/^(actions|github)\//.test(uses) && !uses.startsWith('./'));
    expect(ucuncuTaraf.length).toBeGreaterThan(0);
    expect(ucuncuTaraf.filter(({ uses }) => !/@[0-9a-f]{40}$/.test(uses))).toEqual([]);
  });
});
