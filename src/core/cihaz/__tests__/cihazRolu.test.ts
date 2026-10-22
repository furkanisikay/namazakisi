import * as fs from 'fs';
import * as path from 'path';
import { cihazRoluCoz, hatirlatmaKurulurMu, rolSorulmaliMi } from '../cihazRolu';

describe('cihazRolu (tek beyin)', () => {
    it('rol bilinmiyorken hatırlatma KURULUR (mevcut kurulum sessizce susmaz)', () => {
        expect(hatirlatmaKurulurMu({}, false)).toBe(true);
        expect(hatirlatmaKurulurMu({ rol: 'ana' }, false)).toBe(true);
    });

    it('ikinci cihaz ve ev ekranı modu hatırlatma KURMAZ', () => {
        expect(hatirlatmaKurulurMu({ rol: 'ikincil' }, false)).toBe(false);
        expect(hatirlatmaKurulurMu({ rol: 'ana' }, true)).toBe(false);
        expect(hatirlatmaKurulurMu({}, true)).toBe(false);
    });

    it('soru yalnız geniş ekranda ve bir kez', () => {
        expect(rolSorulmaliMi({}, 820)).toBe(true);
        expect(rolSorulmaliMi({}, 600)).toBe(true);
        expect(rolSorulmaliMi({}, 412)).toBe(false);
        expect(rolSorulmaliMi({ soruldu: true }, 1032)).toBe(false);
        expect(rolSorulmaliMi({ rol: 'ana' }, 1032)).toBe(false);
        expect(rolSorulmaliMi({}, Number.NaN)).toBe(false);
    });

    it('bozuk kayıt boş ayara düşer', () => {
        expect(cihazRoluCoz(null)).toEqual({});
        expect(cihazRoluCoz('ana')).toEqual({});
        expect(cihazRoluCoz({ rol: 'tablet', soruldu: 'evet' })).toEqual({});
        expect(cihazRoluCoz({ rol: 'ikincil', soruldu: true })).toEqual({ rol: 'ikincil', soruldu: true });
    });
});

/**
 * NÖBETÇİ: konuma bağlı yayma listesindeki (ve arka plan görevinin çağırdığı) HER
 * hatırlatma planlayıcısı kapıyı kendi İÇİNDE sorar. Yeni bir planlayıcı eklenip kapı
 * unutulursa ikinci cihaz telefonla birlikte çalar.
 */
describe('tek beyin kapısı — tüm planlayıcılar', () => {
    const PLANLAYICILAR = [
        'ArkaplanMuhafizServisi',
        'VakitBildirimYoneticiServisi',
        'VakitSayacBildirimServisi',
        'IftarSayacBildirimServisi',
        'SahurSayacBildirimServisi',
        'SeriSayacBildirimServisi',
        'GunSonuHatirlaticiServisi',
        'YatisHatirlatmaServisi',
        'CumaHatirlatmaServisi',
        'CamiyeGitHatirlatmaServisi',
        'TakvimCakismaServisi',
        'NafileHatirlatmaServisi',
        // Saat (Wear OS / Apple Watch) hazır planı + uyandırma: ikinci cihaz saate de göndermez.
        'WearSenkronServisi',
    ];
    const kok = path.resolve(__dirname, '../../../domain/services');

    it.each(PLANLAYICILAR)('%s planlamadan önce hatirlatmaKurulabilirMi sorar', (ad) => {
        const kaynak = fs.readFileSync(path.join(kok, `${ad}.ts`), 'utf8');
        expect(kaynak).toMatch(/import \{ hatirlatmaKurulabilirMi \} from '\.\.\/\.\.\/data\/local\/LocalCihazRoluServisi'/);
        expect(kaynak).toMatch(/await hatirlatmaKurulabilirMi\(\)/);
    });

    it('muhafızda kapı "değişmediyse atla" parmak izinden ÖNCE: ikinci cihaza geçişte plan temizlenir', () => {
        const kaynak = fs.readFileSync(path.join(kok, 'ArkaplanMuhafizServisi.ts'), 'utf8');
        const govde = kaynak.slice(kaynak.indexOf('private async planla('));
        const kapi = govde.indexOf('await hatirlatmaKurulabilirMi()');
        expect(kapi).toBeGreaterThan(-1);
        expect(kapi).toBeLessThan(govde.indexOf('this.parmakIziHesapla('));
        // Kapalı dalı plan kaydını da siler: kapı yeniden açılınca tur "değişmedi" sanıp atlamaz.
        expect(govde.slice(kapi, govde.indexOf('this.parmakIziHesapla('))).toContain('this.planKaydiniSil()');
    });

    it('konum yayma listesindeki her hatırlatma servisi bu listede', () => {
        const yayma = fs.readFileSync(path.join(kok, 'KonumDegisikligiServisi.ts'), 'utf8');
        const kullanilan = new Set(
            [...yayma.matchAll(/(\w+(?:Hatirlatma|Bildirim|Sayac|Muhafiz)\w*Servisi)\.getInstance/g)].map((m) => m[1])
        );
        for (const ad of kullanilan) expect(PLANLAYICILAR).toContain(ad);
    });
});
