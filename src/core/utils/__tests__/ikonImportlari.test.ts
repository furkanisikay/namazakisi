/**
 * NÖBETÇİ (denetim 2026-10-21, D-20): `@expo/vector-icons` KÖKÜNDEN import YOK.
 *
 * Kök giriş 19 ikon ailesinin hepsini statik `require` eder → Metro tüm fontları pakete
 * koyar (v0.58.0 APK'sında 20 .ttf, 3,9 MB; kullanılan yalnız FontAwesome5 + MaterialIcons
 * ≈ 0,7 MB). Tek bir kök import bu kazancı sessizce geri alır; alt yol kullanın:
 * `import FontAwesome5 from '@expo/vector-icons/FontAwesome5'`.
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const KOK = path.resolve(__dirname, '..', '..', '..', '..');
const KOK_IMPORT = /from\s+['"]@expo\/vector-icons['"]|require\(\s*['"]@expo\/vector-icons['"]\s*\)/;

describe('ikon import nöbetçisi', () => {
  it('uygulama kaynağında @expo/vector-icons kök import’u yok (testler hariç)', () => {
    const NUL = String.fromCharCode(0);
    const dosyalar = execFileSync('git', ['ls-files', '-z', '--', 'src', 'App.tsx', 'index.ts'], { cwd: KOK })
      .toString('utf8')
      .split(NUL)
      .filter((y) => /\.(ts|tsx|js|jsx)$/.test(y) && !y.includes('__tests__'));
    expect(dosyalar.length).toBeGreaterThan(100);
    const ihlal = dosyalar.filter((y) => KOK_IMPORT.test(fs.readFileSync(path.join(KOK, y), 'utf8')));
    expect(ihlal).toEqual([]);
  });
});
