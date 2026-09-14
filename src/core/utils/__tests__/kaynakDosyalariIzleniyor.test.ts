/**
 * NOBETCI — KAYNAK DOSYALARI GIT'TE IZLENIYOR MU?
 *
 * YASANMIS OLAY (v0.26.0 AAB build'i patladi): `.gitignore`'a iOS native dizini
 * icin `ios/` eklendi. Basinda egik cizgi OLMAYAN kalip HER DERINLIKTEKI `ios`
 * dizinini eslestirir → `src/core/muhafiz/ios/` (saf iOS teslim katmani) da
 * yutuldu. Iki sonucu oldu:
 *
 *   1. EAS Build proje arsivini `.gitignore`'a gore olusturur → o dizin arsive
 *      HIC GIRMEDI ve build `EAGER_BUNDLE` fazinda
 *      "Unable to resolve module ../../core/muhafiz/ios/platformYetenekleri"
 *      ile dustu. Yerelde her sey calisiyordu (dosyalar diskte duruyor) ve
 *      `npm run verify` YESILDI — bu yuzden hic fark edilmedi.
 *   2. O dizine sonradan eklenen bir test dosyasi `git add -A` ile SESSIZCE
 *      atlandi; commit'e hic girmedi.
 *
 * Bu test her iki hatayi da yakalar: diskte olup git'te OLMAYAN her kaynak
 * dosyasini raporlar. Unutulan `git add` de ayni agdan gecer.
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJE_KOKU = path.resolve(__dirname, '../../../..');

/** Taranacak kaynak agaclari (test dosyalari dahil — onlar da kaynaktir). */
const TARANAN_DIZINLER = ['src', 'modules'];

const UZANTILAR = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Kaynak SAYILMAYAN yollar (derleme ciktisi / bagimlilik). */
function atlanirMi(goreliYol: string): boolean {
    const p = goreliYol.replace(/\\/g, '/');
    return p.includes('/node_modules/') || p.includes('/build/') || p.includes('/.gradle/');
}

function diskteki(dizin: string, toplam: string[] = []): string[] {
    const tam = path.join(PROJE_KOKU, dizin);
    if (!fs.existsSync(tam)) return toplam;
    for (const giris of fs.readdirSync(tam, { withFileTypes: true })) {
        const goreli = `${dizin}/${giris.name}`;
        if (atlanirMi(goreli)) continue;
        if (giris.isDirectory()) diskteki(goreli, toplam);
        else if (UZANTILAR.has(path.extname(giris.name))) toplam.push(goreli);
    }
    return toplam;
}

describe('Kaynak dosyalari git tarafindan izleniyor', () => {
    test('diskteki her kaynak dosyasi `git ls-files` ciktisinda VAR', () => {
        // `-z` ZORUNLU: `git ls-files` varsayilan olarak ASCII OLMAYAN yollari
        // kacisli ve tirnakli yazar, dolayisiyla Turkce karakter iceren dosya
        // adlari (ornek: GorünumAyarlariSayfasi.tsx) "izlenmiyor" sanilir —
        // yanlis pozitif. NUL ayraci hem kacisi hem de bosluklu yol sorununu
        // ortadan kaldirir.
        const izlenen = new Set(
            execFileSync('git', ['ls-files', '-z', ...TARANAN_DIZINLER], {
                cwd: PROJE_KOKU,
                encoding: 'utf8',
                maxBuffer: 32 * 1024 * 1024,
            })
                .split('\0')
                .map((satir) => satir.trim())
                .filter(Boolean)
        );

        const diskte = TARANAN_DIZINLER.flatMap((d) => diskteki(d));
        // Tarama gercekten calisti mi? (yol hatasinda test bos gecip yalan soylemesin)
        expect(diskte.length).toBeGreaterThan(100);

        const izlenmeyen = diskte.filter((y) => !izlenen.has(y));
        expect(izlenmeyen).toEqual([]);
    });

    test('saf iOS teslim katmani izleniyor (yasanmis olayin nobetcisi)', () => {
        const izlenen = execFileSync('git', ['ls-files', '-z', 'src/core/muhafiz/ios'], {
            cwd: PROJE_KOKU,
            encoding: 'utf8',
        })
            .split('\0')
            .filter(Boolean);

        // Kritik: bu dizin `.gitignore`'daki kok `ios/` kalibina TAKILMAMALI.
        expect(izlenen).toEqual(
            expect.arrayContaining([
                'src/core/muhafiz/ios/platformYetenekleri.ts',
                'src/core/muhafiz/ios/teslimPlani.ts',
                'src/core/muhafiz/ios/bildirimButcesi.ts',
            ])
        );
    });
});
