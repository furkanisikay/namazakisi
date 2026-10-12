/**
 * Telefon → saat yük sözleşmesi (issue #269). Kotlin `YukCozucuTest` AYNI örnek
 * dosyayı (`wear/app/src/test/resources/ornek-yuk.json`) okur: iki taraf da bu
 * dosyayı kabul etmek zorundadır → şema tek taraflı değiştirilemez.
 */
import * as fs from 'fs';
import * as path from 'path';
import { WEAR_GUN_SAYISI, WEAR_KERAHAT_DK, WEAR_YUK_SURUMU, wearYukuGecerliMi, wearYukuOlustur } from '../wearYuku';
import { KAZA_SABITLERI } from '../../constants/UygulamaSabitleri';
import { gunEkle } from '../../utils/TarihYardimcisi';

const ORNEK = path.join(__dirname, '../../../../wear/app/src/test/resources/ornek-yuk.json');
const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const BUGUN = '2026-10-12';

describe('wearYukuOlustur', () => {
    const yuk = wearYukuOlustur({
        koordinat: ISTANBUL,
        bugunIso: BUGUN,
        konumAdi: 'Fatih, İstanbul',
        kilinanlar: {
            [gunEkle(BUGUN, -1)]: ['imsak', 'gunes', 'yatsi', 'ogle'],
            [BUGUN]: ['imsak'],
            [gunEkle(BUGUN, 1)]: ['ogle'],
        },
    });

    it('sözleşmeye uyar ve dün + 7 gün içerir', () => {
        expect(wearYukuGecerliMi(yuk)).toBe(true);
        expect(yuk.surum).toBe(WEAR_YUK_SURUMU);
        expect(yuk.gunler).toHaveLength(WEAR_GUN_SAYISI);
        expect(yuk.gunler[0].tarih).toBe(gunEkle(BUGUN, -1));
        expect(yuk.gunler[1].tarih).toBe(BUGUN);
    });

    it('kılınan yalnız dün ve bugün; güneş asla yok; sıra sabit', () => {
        expect(yuk.gunler[0].kilinan).toEqual(['imsak', 'ogle', 'yatsi']);
        expect(yuk.gunler[1].kilinan).toEqual(['imsak']);
        expect(yuk.gunler[2].kilinan).toEqual([]);
    });

    it('vakitler her gün kronolojik', () => {
        for (const g of yuk.gunler) {
            const v = g.vakitler;
            expect([v.imsak, v.gunes, v.ogle, v.ikindi, v.aksam, v.yatsi]).toEqual(
                [...[v.imsak, v.gunes, v.ogle, v.ikindi, v.aksam, v.yatsi]].sort((a, b) => a - b)
            );
        }
    });

    it('NÖBETÇİ: kerahat sabitleri kaza hesabıyla aynı kaynaktan', () => {
        expect(WEAR_KERAHAT_DK.suruk).toBe(KAZA_SABITLERI.MEKRUH_TOLERANS_DK);
        expect(WEAR_KERAHAT_DK.gurub).toBe(KAZA_SABITLERI.MEKRUH_TOLERANS_DK);
        expect(yuk.kerahatDk).toEqual(WEAR_KERAHAT_DK);
    });
});

describe('ORTAK ÖRNEK DOSYA (Kotlin YukCozucuTest ile aynı)', () => {
    const ornek = JSON.parse(fs.readFileSync(ORNEK, 'utf8'));

    it('JS doğrulayıcısı örneği kabul eder ve üretilen yük AYNI anahtar kümesini taşır', () => {
        expect(wearYukuGecerliMi(ornek)).toBe(true);
        const uretilen = wearYukuOlustur({ koordinat: ISTANBUL, bugunIso: BUGUN, konumAdi: 'x', kilinanlar: {} });
        expect(Object.keys(uretilen).sort()).toEqual(Object.keys(ornek).sort());
        expect(Object.keys(uretilen.gunler[0]).sort()).toEqual(Object.keys(ornek.gunler[0]).sort());
        expect(Object.keys(uretilen.gunler[0].vakitler).sort()).toEqual(Object.keys(ornek.gunler[0].vakitler).sort());
        expect(ornek.surum).toBe(WEAR_YUK_SURUMU);
    });

    type GevsekYuk = {
        kerahatDk?: unknown;
        gunler: { kilinan: string[]; vakitler: Record<string, number | undefined> }[];
    };
    it.each<[string, (o: GevsekYuk) => void]>([
        ['güneş kılınmış', (o) => { o.gunler[0].kilinan.push('gunes'); }],
        ['eksik vakit', (o) => { delete o.gunler[0].vakitler.yatsi; }],
        ['NamazAdi değeri', (o) => { o.gunler[0].kilinan.push('Öğle'); }],
        ['kerahat yok', (o) => { delete o.kerahatDk; }],
    ])('bozuk yük reddedilir: %s', (_ad, boz) => {
        const kopya = JSON.parse(JSON.stringify(ornek));
        boz(kopya);
        expect(wearYukuGecerliMi(kopya)).toBe(false);
    });
});
