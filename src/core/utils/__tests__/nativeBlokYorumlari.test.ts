/**
 * NOBETCI — SWIFT / KOTLIN BLOK YORUMLARI ICINDE `/*` YOK.
 *
 * YASANMIS (iOS simulator Release derlemesi, issue #279): Swift ve Kotlin'de
 * blok yorumlari IC ICE GECER — yorum icinde yazilan her `/*` yeni bir seviye
 * acar ve kapanis `*\/` ancak o seviyeyi kapatir. Belge yorumuna yazilan
 * `targets/siri-kisayollari/*.swift` yolu yorumu dosya sonuna kadar acik birakti
 * → `error: unterminated '/*' comment`, `xcodebuild` exit 65.
 *
 * Yerelde HIC GORUNMEZ: Swift yalniz macOS CI'da derlenir, `npm run verify`
 * dokunmaz. Kural: Swift/Kotlin blok yorumunda glob/yol yazarken `/*` yazma
 * ("`dizin/` altindaki dosyalar" deyin ya da `//` satir yorumu kullan).
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJE_KOKU = path.resolve(__dirname, '../../../..');
const NUL = String.fromCharCode(0);

/**
 * Ic ice blok yorum sorunlarini dondurur. Dize ve satir yorumlari atlanir;
 * Kotlin karakter sabitleri (`'"'`) dize sanilmasin diye ayrica atlanir.
 */
function icIceYorumSorunlari(kaynak: string, kotlinMi: boolean): string[] {
    const sorunlar: string[] = [];
    let i = 0;
    let derinlik = 0;
    let satir = 1;
    let baslangicSatiri = 0;
    const n = kaynak.length;
    while (i < n) {
        const ikili = kaynak.slice(i, i + 2);
        const karakter = kaynak[i];
        if (karakter === '\n') satir++;
        if (derinlik === 0) {
            if (ikili === '//') {
                const son = kaynak.indexOf('\n', i);
                i = son < 0 ? n : son;
                continue;
            }
            if (kaynak.startsWith('"""', i)) {
                const son = kaynak.indexOf('"""', i + 3);
                const bitis = son < 0 ? n : son + 3;
                satir += (kaynak.slice(i, bitis).match(/\n/g) ?? []).length;
                i = bitis;
                continue;
            }
            if (karakter === '"' || (kotlinMi && karakter === "'")) {
                let j = i + 1;
                while (j < n && kaynak[j] !== karakter && kaynak[j] !== '\n') {
                    j += kaynak[j] === '\\' ? 2 : 1;
                }
                i = j + 1;
                continue;
            }
            if (ikili === '/*') {
                derinlik = 1;
                baslangicSatiri = satir;
                i += 2;
                continue;
            }
        } else {
            if (ikili === '/*') {
                derinlik++;
                sorunlar.push(`${satir}. satir: yorum icinde '/*' (yorum ${baslangicSatiri}. satirda basladi)`);
                i += 2;
                continue;
            }
            if (ikili === '*/') {
                derinlik--;
                i += 2;
                continue;
            }
        }
        i++;
    }
    if (derinlik > 0) sorunlar.push(`kapanmamis blok yorum (${baslangicSatiri}. satir)`);
    return sorunlar;
}

function izlenenNativeDosyalar(): string[] {
    return execFileSync('git', ['ls-files', '-z', '--', '*.swift', '*.kt'], {
        cwd: PROJE_KOKU,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
    })
        .split(NUL)
        .map((y) => y.trim())
        .filter(Boolean);
}

describe('icIceYorumSorunlari', () => {
    test('yorum icindeki glob yolu yakalanir (yasanmis hata)', () => {
        const kaynak = '/**\n * (`targets/siri-kisayollari/*.swift` kopyalar).\n */\nclass A {}\n';
        expect(icIceYorumSorunlari(kaynak, false)).toEqual([
            "2. satir: yorum icinde '/*' (yorum 1. satirda basladi)",
            'kapanmamis blok yorum (1. satir)',
        ]);
    });

    test('dize ve satir yorumundaki `/*` sorun sayilmaz', () => {
        const kaynak = 'let a = "x/*y"\n// z/*\n/** temiz */\nval c = \'"\'\nval d = "/*"\n';
        expect(icIceYorumSorunlari(kaynak, true)).toEqual([]);
    });
});

describe('Izlenen Swift/Kotlin dosyalari', () => {
    test('hicbir blok yorumda ic ice `/*` yok', () => {
        const dosyalar = izlenenNativeDosyalar();
        // Tarama gercekten calisti mi?
        expect(dosyalar.length).toBeGreaterThan(20);

        const sorunlu = dosyalar.flatMap((yol) => {
            const icerik = fs.readFileSync(path.join(PROJE_KOKU, yol), 'utf8');
            return icIceYorumSorunlari(icerik, yol.endsWith('.kt')).map((s) => `${yol}: ${s}`);
        });
        expect(sorunlu).toEqual([]);
    });
});
