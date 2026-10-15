/**
 * Nöbetçi: expo-calendar SDK 57'de kök girişteki eski fonksiyonları
 * (getCalendarPermissionsAsync, getEventsAsync…) çağrıldığı anda HATA FIRLATAN
 * taslaklara çevirdi. Kodumuz hatayı yakaladığı için takvim izni verilmiş olsa
 * bile "verilmedi" görünüyordu (v0.31.0 iç test). Eski API yalnız
 * `expo-calendar/legacy` alt yolundan çalışır.
 */
import * as fs from 'fs';
import * as path from 'path';

const KOK = path.resolve(__dirname, '../../../');

const kaynaklariTopla = (dizin: string): string[] =>
    fs.readdirSync(dizin, { withFileTypes: true }).flatMap((g) => {
        const yol = path.join(dizin, g.name);
        if (g.isDirectory()) return g.name === '__tests__' ? [] : kaynaklariTopla(yol);
        return /\.(ts|tsx)$/.test(g.name) ? [yol] : [];
    });

describe('expo-calendar alt yolu', () => {
    it('kaynak kod expo-calendar kök girişini içe aktarmaz (yalnız /legacy)', () => {
        const ihlaller = kaynaklariTopla(KOK).filter((dosya) =>
            /(from|require\(|import\()\s*['"]expo-calendar['"]/.test(fs.readFileSync(dosya, 'utf8')),
        );
        expect(ihlaller.map((d) => path.relative(KOK, d))).toEqual([]);
    });

    it('kök girişteki eski izin fonksiyonu gerçekten fırlatır (varsayım hâlâ geçerli)', async () => {
        // Kök giriş taslakları değiştirirse (ör. yeniden çalışır hâle gelirse) bu test
        // kırılır ve /legacy zorunluluğu yeniden değerlendirilir.
        const kaynak = fs.readFileSync(
            path.join(path.dirname(require.resolve('expo-calendar/package.json')), 'build/legacyWarnings.js'),
            'utf8',
        );
        expect(kaynak).toMatch(/getCalendarPermissionsAsync\(\)\s*\{\s*throw/);
    });
});
