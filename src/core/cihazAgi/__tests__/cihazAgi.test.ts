import fs from 'fs';
import path from 'path';
import { base64Coz, base64UrlCoz, coz, sifrele, kanalAad, esleIstekAad, esleYanitAad, kararliPort } from '../kanal';
import { eslesmeQrCoz, eslesmeYanitiniCoz, tvQrSurumu } from '../eslesme';
import { YUK_AZAMI_BAYT, baytUzunlugu, yukuYaz } from '../yuk';
import { ozelIpv4Mu } from '../../tv/eslemeBaglantisi';

/** BAĞIMSIZ Python (cryptography) ile üretilmiş ortak fikstür; TV `CihazKanaliTest` aynı dosyayı okur. */
interface Vaka { iv: string; aad: string; duz: string; ct: string }
const f: {
    anahtar: string;
    sir: string;
    tvKimlik: string;
    uye: string;
    kanal: Vaka;
    esleIstek: Vaka;
    esleYanit: Vaka;
    redler: (Vaka & { neden: string })[];
} = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../../../tv/app/src/test/resources/esitleme-ornekleri.json'), 'utf8'),
);

describe('cihaz ağı kanalı (AES-256-GCM)', () => {
    const anahtar = base64Coz(f.anahtar);
    const sir = base64UrlCoz(f.sir);

    it('AAD biçimi fikstürle aynı', () => {
        expect(kanalAad(f.tvKimlik, f.uye, 7)).toBe(f.kanal.aad);
        expect(esleIstekAad(f.tvKimlik)).toBe(f.esleIstek.aad);
        expect(esleYanitAad(f.tvKimlik, 'a1b2c3d4e5f60718')).toBe(f.esleYanit.aad);
    });

    it.each([
        ['kanal', anahtar, f.kanal],
        ['eşleştirme isteği', sir, f.esleIstek],
        ['eşleştirme yanıtı', sir, f.esleYanit],
    ] as const)('%s: şifreleme bağımsız uygulamayla bayt bayt aynı, çözme geri verir', (_ad, k, v) => {
        expect(sifrele(k, base64Coz(v.iv), v.aad, v.duz)).toBe(v.ct);
        expect(coz(k, v.iv, v.aad, v.ct)).toBe(v.duz);
    });

    it.each(f.redler)('$neden → reddedilir (fırlatmaz)', (v) => {
        expect(coz(anahtar, v.iv, v.aad, v.ct)).toBeNull();
    });

    it('yanlış anahtar ve bozuk base64 reddedilir', () => {
        expect(coz(sir, f.kanal.iv, f.kanal.aad, f.kanal.ct)).toBeNull();
        expect(coz(anahtar, '!!!', f.kanal.aad, f.kanal.ct)).toBeNull();
    });
});

describe('kararlı port (TV ↔ telefon ikizi)', () => {
    const p = (f as unknown as { kararliPort: Record<string, number> }).kararliPort;
    it.each(Object.entries(p))('%s → %d', (k, port) => expect(kararliPort(k)).toBe(port));
});

describe('özel IPv4 katı ayrıştırma (denetim D-06)', () => {
    const ip = (f as unknown as { ozelIpv4: { gecerli: string[]; gecersiz: string[] } }).ozelIpv4;
    it.each(ip.gecerli)('%s kabul', (a) => expect(ozelIpv4Mu(a)).toBe(true));
    it.each(ip.gecersiz)('"%s" ret', (a) => expect(ozelIpv4Mu(a)).toBe(false));
});

describe('eşleştirme QR v2', () => {
    const qr = `namazakisi://tv?v=2&a=192.168.1.23&p=47123&i=${f.tvKimlik}&s=${f.sir}&d=Salon%20TV`;

    it('çözer', () => {
        const c = eslesmeQrCoz(qr)!;
        expect(c).toMatchObject({ adres: '192.168.1.23', port: 47123, aliciKimlik: f.tvKimlik, aliciAdi: 'Salon TV' });
        expect(Array.from(c.sir)).toEqual(Array.from(base64UrlCoz(f.sir)));
    });

    it.each([
        ['v1 QR', 'namazakisi://tv?v=1&a=192.168.1.23&p=47123&k=0123456789abcdef'],
        ['internet adresi', qr.replace('192.168.1.23', '8.8.8.8')],
        ['kısa sır', qr.replace(f.sir, f.sir.slice(0, 20))],
        ['büyük harf kimlik', qr.replace(f.tvKimlik, f.tvKimlik.toUpperCase())],
    ])('%s reddedilir', (_a, metin) => {
        expect(eslesmeQrCoz(metin)).toBeNull();
    });

    it('sürüm ayrımı (eski QR için yön göstermek)', () => {
        expect(tvQrSurumu(qr)).toBe(2);
        expect(tvQrSurumu('namazakisi://tv?v=1&a=x')).toBe(1);
        expect(tvQrSurumu('https://x')).toBeNull();
    });

    it('ad yoksa / denetim karakterli ise güvenli ad', () => {
        expect(eslesmeQrCoz(qr.replace('&d=Salon%20TV', ''))!.aliciAdi).toBe('Televizyon');
        expect(eslesmeQrCoz(qr.replace('Salon%20TV', 'A%07B'))!.aliciAdi).toBe('AB');
    });

    it('fikstürdeki eşleştirme yanıtı çözülür', () => {
        const duz = coz(base64UrlCoz(f.sir), f.esleYanit.iv, f.esleYanit.aad, f.esleYanit.ct);
        expect(eslesmeYanitiniCoz(duz)).toEqual({ durum: 'onay', uye: f.uye, anahtar: f.anahtar, aliciAdi: 'Salon TV' });
        expect(eslesmeYanitiniCoz('{"durum":"bekliyor"}')).toEqual({ durum: 'bekliyor' });
        expect(eslesmeYanitiniCoz('bozuk')).toBeNull();
    });
});

describe('yük', () => {
    const durum = {
        ad: 'Kadıköy, İstanbul',
        konum: { lat: 40.990312345, lng: 29.0291 },
        kilinan: { '2026-10-21': ['imsak' as const], '2026-10-20': ['ogle' as const, 'imsak' as const] },
        ozelGun: false,
        tvHatirlat: true,
        durumumSayilsin: true,
        cuma: { aktif: true, cikisDk: 25 },
        ramazan: false,
    };

    it('kararlı: gün ve vakit sırası girdiden bağımsız, zaman damgası yok', () => {
        const a = yukuYaz({ v: 2, durum });
        const b = yukuYaz({ v: 2, durum: { ...durum, kilinan: { '2026-10-20': ['imsak', 'ogle'], '2026-10-21': ['imsak'] } } });
        expect(a).toBe(b);
        expect(a).not.toMatch(/zaman|ts|Ms"/);
        expect(JSON.parse(a).durum.konum).toEqual({ lat: 40.99, lng: 29.03 });
    });

    it('NÖBETÇİ: en kötü durum yükü ≤ 1 KB (alıcı sınırı 8 KB)', () => {
        const dolu = {
            ...durum,
            ad: 'Ş'.repeat(80),
            kilinan: { '2026-10-20': ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const, '2026-10-21': ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const },
        };
        const metin = yukuYaz({ v: 2, durum: { ...dolu, kilinan: { ...dolu.kilinan } as never } });
        expect(baytUzunlugu(metin)).toBeLessThanOrEqual(YUK_AZAMI_BAYT);
    });

    it('hesap özetiyle (en uzun: Ramazan + akşam açısı) yük tavanın altında ve anahtar sırası sabit', () => {
        const hesap = {
            y: 'diger' as const, f: 17.7, i: 14, ia: 0, ma: 4.5, a: 'sani' as const, k: 'yedide' as const,
            o: [-30, -30, -30, -30, -30, -30] as [number, number, number, number, number, number],
            r: 'yukari' as const,
            rmz: { b: '2027-02-08', s: '2027-03-08', dk: 30 },
        };
        const durum = {
            ad: 'Uzun bir konum adı, uzun bir ilçe adı, uzun bir il adı ......',
            konum: { lat: -33.8688, lng: 151.2093 },
            kilinan: { '2026-10-20': ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'], '2026-10-21': ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] },
            ozelGun: true, tvHatirlat: true, durumumSayilsin: true, cuma: { aktif: true, cikisDk: 240 }, ramazan: true,
        } as never as Parameters<typeof yukuYaz>[0]['durum'];
        const metin = yukuYaz({ v: 2, durum: { ...durum!, hesap } });
        expect(baytUzunlugu(metin)).toBeLessThanOrEqual(YUK_AZAMI_BAYT);
        const tersSira = { rmz: hesap.rmz, r: hesap.r, o: hesap.o, k: hesap.k, a: hesap.a, ma: hesap.ma, ia: hesap.ia, i: hesap.i, f: hesap.f, y: hesap.y };
        expect(yukuYaz({ v: 2, durum: { ...durum!, hesap: tersSira } })).toBe(metin);
        expect(metin).toContain('"hesap":{"y":"diger","f":17.7,"i":14,"ia":0,"ma":4.5,"a":"sani","k":"yedide","o":[-30,-30,-30,-30,-30,-30],"r":"yukari","rmz":{"b":"2027-02-08","s":"2027-03-08","dk":30}}');
    });

    it('fikstürdeki düz yük, telefonun yazdığıyla BİREBİR aynı (TV aynı metni çözer)', () => {
        expect(
            yukuYaz({
                v: 2,
                durum: {
                    ad: 'Kadıköy, İstanbul',
                    konum: { lat: 40.9903, lng: 29.0291 },
                    kilinan: { '2026-10-20': ['ogle', 'imsak'], '2026-10-21': ['imsak'] },
                    ozelGun: false,
                    tvHatirlat: true,
                    durumumSayilsin: true,
                    cuma: { aktif: true, cikisDk: 25 },
                    ramazan: false,
                },
            }),
        ).toBe(f.kanal.duz);
    });

    it('olay günlüğü ve silme işareti taşınır', () => {
        const olay = {
            id: 'aaaaaaaaaaaaaaaa:1',
            cihaz: 'aaaaaaaaaaaaaaaa',
            seq: 1,
            hlc: '000000000000001-0000-aaaaaaaaaaaaaaaa',
            tur: 'kildim' as const,
            tarih: '2026-10-21',
            vakit: 'ogle' as const,
        };
        const o = JSON.parse(yukuYaz({ v: 2, olaylar: [olay], sil: true }));
        expect(o).toEqual({ v: 2, olaylar: [olay], sil: true });
    });

    it('baytUzunlugu UTF-8 sayar', () => {
        expect(baytUzunlugu('aİ€😀')).toBe(1 + 2 + 3 + 4);
    });
});
