/**
 * NOBETCI — KAYNAK DOSYALARI: GIT'TE IZLENIYOR MU, ADLARI ASCII MI?
 *
 * Iki ayri YASANMIS build hatasini birden kapatir. Ikisinin de ortak ozelligi
 * su: YERELDE HIC GORUNMEZLER. `npm run verify`, `npx expo export` ve EAS'in
 * kendi komutu `expo export:embed` ucu de TEMIZ GECER; hata yalnizca EAS
 * derleyicisinde ortaya cikar.
 *
 * OLAY 1 — `.gitignore` kalibi fazla genis (v0.26.0 AAB build'i):
 * iOS native dizini icin `ios/` yazildi. Basinda egik cizgi OLMAYAN kalip HER
 * DERINLIKTEKI `ios` dizinini eslestirir → `src/core/muhafiz/ios/` (saf iOS
 * teslim katmani) da yutuldu. EAS Build proje arsivini `.gitignore`'a gore
 * olusturur (dosya git'te IZLENSE bile) → dizin arsive hic girmedi ve build
 * `EAGER_BUNDLE` fazinda "Unable to resolve module
 * ../../core/muhafiz/ios/platformYetenekleri" ile dustu. Ayrica o dizine
 * sonradan eklenen bir test dosyasi `git add -A` ile SESSIZCE atlandi.
 *
 * OLAY 2 — dosya adinda ASCII disi karakter (ilk iOS build'i, 2026-09-15):
 * ekran dosyasinin adi `GorünumAyarlariSayfasi.tsx` idi. EAS'in macOS
 * derleyicisinde Metro `Unable to resolve module ./GorünumAyarlariSayfasi` ile
 * patladi. Sebep: macOS dosya adlarini Unicode NFD (ayrisik: `u` + birlesik
 * umlaut) biciminde ele alir, Windows ve git NFC (birlesik) saklar; Metro
 * import dizesini (NFC) dosya adiyla (NFD) karsilastirinca esleme tutmaz.
 * Linux byte-seffaftir → ANDROID CI'da hic gorunmez.
 *
 * KURAL: kaynak dosya ve dizin adlari SALT ASCII olmali. Kod icindeki Turkce
 * tanimlayicilar ve kullaniciya gorunen metinler serbesttir — onlar YOL degil.
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJE_KOKU = path.resolve(__dirname, '../../../..');

/** Taranacak kaynak agaclari (test dosyalari dahil — onlar da kaynaktir). */
const TARANAN_DIZINLER = ['src', 'modules'];

const UZANTILAR = new Set(['.ts', '.tsx', '.js', '.jsx']);

/**
 * NUL ayraci.
 *
 * `git ls-files -z` ciktisini bununla boleriz. `-z` ZORUNLUDUR: onsuz git,
 * ASCII olmayan yollari kacisli ve tirnakli yazar ve tam da yakalamak
 * istedigimiz dosyalar "yok" gibi gorunur (bu tuzaga bir kez dusuldu).
 *
 * Deger `String.fromCharCode(0)` ile uretilir, kaynaga HAM kontrol karakteri
 * gomulmez: ham bayt editorleri ve diff'leri bozar, git dosyayi "binary" sayar.
 */
const NUL = String.fromCharCode(0);

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

/** `git ls-files -z` ciktisini yol listesine cevirir. */
function izlenenYollar(...argumanlar: string[]): string[] {
    return execFileSync('git', ['ls-files', '-z', ...argumanlar], {
        cwd: PROJE_KOKU,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
    })
        .split(NUL)
        .map((satir) => satir.trim())
        .filter(Boolean);
}

describe('Dosya adlari ASCII (macOS NFD/NFC tuzagi)', () => {
    test('hicbir izlenen dosyanin YOLUNDA ASCII disi karakter yok', () => {
        const yollar = izlenenYollar();

        // Tarama gercekten calisti mi? (yol hatasinda test bos gecip yalan soylemesin)
        expect(yollar.length).toBeGreaterThan(100);

        const asciiDisi = yollar.filter((y) =>
            Array.from(y).some((karakter) => karakter.charCodeAt(0) > 127)
        );
        expect(asciiDisi).toEqual([]);
    });
});

describe('Kaynak dosyalari git tarafindan izleniyor', () => {
    test('diskteki her kaynak dosyasi `git ls-files` ciktisinda VAR', () => {
        const izlenen = new Set(izlenenYollar(...TARANAN_DIZINLER));

        const diskte = TARANAN_DIZINLER.flatMap((d) => diskteki(d));
        expect(diskte.length).toBeGreaterThan(100);

        const izlenmeyen = diskte.filter((y) => !izlenen.has(y));
        expect(izlenmeyen).toEqual([]);
    });

    test('saf iOS teslim katmani izleniyor (OLAY 1 nobetcisi)', () => {
        const izlenen = izlenenYollar('src/core/muhafiz/ios');

        // Kritik: bu dizin `.gitignore`'daki kok `/ios/` kalibina TAKILMAMALI.
        expect(izlenen).toEqual(
            expect.arrayContaining([
                'src/core/muhafiz/ios/platformYetenekleri.ts',
                'src/core/muhafiz/ios/teslimPlani.ts',
                'src/core/muhafiz/ios/bildirimButcesi.ts',
            ])
        );
    });
});
