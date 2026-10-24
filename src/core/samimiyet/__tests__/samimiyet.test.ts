import {
    KABUL_DUALARI,
    KABUL_DUASI,
    TAM_GUN_METNI,
    KURULUM_BITTI_SELAMI,
    TESBIHAT_TAMAM_METNI,
    kabulCumlesi,
    kabulDuasi,
    kabulDualari,
    kabulEkSelami,
    kazaKabulMetni,
} from '../kabulDuasi';
import { OZEL_GUNLER, RAMAZAN_ARALIKLARI, TABLO_SON_GUNU, ozelGunBul, ramazanGunuMu } from '../ozelGunler';
import { SELAMLAR, gunSelami } from '../selam';
import { aktifDiliKur, aktifDilSifirla } from '../../dil/aktifDil';

const FARZLAR = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;

describe('kabulDuasi — deterministik dönüşüm', () => {
    it('aynı gün ve vakit her çağrıda aynı metni verir', () => {
        expect(kabulDuasi('2026-10-22', 'ogle')).toBe(kabulDuasi('2026-10-22', 'ogle'));
    });

    it('VakitAdi ile görünen NamazAdi aynı sonucu verir (Sabah = imsak, Cuma = öğle)', () => {
        expect(kabulDuasi('2026-10-22', 'Sabah')).toBe(kabulDuasi('2026-10-22', 'imsak'));
        expect(kabulDuasi('2026-10-23', 'Cuma')).toBe(kabulDuasi('2026-10-23', 'Öğle'));
        expect(kabulDuasi('2026-10-22', 'İkindi')).toBe(kabulDuasi('2026-10-22', 'ikindi'));
    });

    it('aynı gün art arda iki vakit ASLA aynı kalıbı almaz (bayatlamaz)', () => {
        for (let g = 1; g <= 28; g++) {
            const tarih = `2026-02-${String(g).padStart(2, '0')}`;
            for (let i = 1; i < FARZLAR.length; i++) {
                expect(kabulDuasi(tarih, FARZLAR[i])).not.toBe(kabulDuasi(tarih, FARZLAR[i - 1]));
            }
        }
    });

    it('baskın kalıp "Allah kabul etsin" (bir haftada yarısı), diğerleri de görünür', () => {
        const sayac: Record<string, number> = {};
        for (let g = 1; g <= 28; g++) {
            for (const v of FARZLAR) {
                const d = kabulDuasi(`2026-02-${String(g).padStart(2, '0')}`, v);
                sayac[d] = (sayac[d] ?? 0) + 1;
            }
        }
        expect(sayac['Allah kabul etsin']).toBe(70);
        expect(sayac['Kabul olsun']).toBe(35);
        expect(sayac['Rabbim kabul etsin']).toBe(35);
    });

    it('gün sırası UTC — saat diliminden bağımsız (TZ=UTC ve TZ=Europe/Istanbul aynı)', () => {
        // 2026-10-22: 1970'ten 20748. gün; öğle sırası 1 → (20748 + 1) % 4 = 1 → "Kabul olsun"
        expect(kabulDuasi('2026-10-22', 'ogle')).toBe('Kabul olsun');
        expect(kabulDuasi('2026-10-22', 'imsak')).toBe('Allah kabul etsin');
    });

    it('geçersiz tarih/vakit fırlatmaz', () => {
        expect(KABUL_DUALARI).toContain(kabulDuasi('bozuk', 'gunes'));
    });

    it('ek selam yalnız sabah ve yatsıda', () => {
        expect(kabulEkSelami('imsak')).toBe('Hayırlı sabahlar');
        expect(kabulEkSelami('Yatsı')).toBe('Hayırlı geceler');
        expect(kabulEkSelami('ogle')).toBeNull();
        expect(kabulEkSelami('gunes')).toBeNull();
        expect(kabulCumlesi('2026-10-22', 'imsak')).toBe('Allah kabul etsin. Hayırlı sabahlar.');
        expect(kabulCumlesi('2026-10-22', 'ogle')).toBe('Kabul olsun.');
    });
});

describe('ozelGunler — Diyanet tablosu nöbetçisi', () => {
    it('tarihler kesin artan ve tekil, hepsi geçerli ISO', () => {
        for (let i = 0; i < OZEL_GUNLER.length; i++) {
            expect(OZEL_GUNLER[i].tarih).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            if (i > 0) expect(OZEL_GUNLER[i].tarih > OZEL_GUNLER[i - 1].tarih).toBe(true);
        }
        expect(OZEL_GUNLER[OZEL_GUNLER.length - 1].tarih <= TABLO_SON_GUNU).toBe(true);
    });

    it('her bayram öncesi arefe, Ramazan bayramı arefesi Ramazan aralığının son günü', () => {
        for (const r of RAMAZAN_ARALIKLARI) {
            const arefe = ozelGunBul(r.bitis);
            expect(arefe?.tur).toBe('arefe');
            expect(arefe?.ad).toBe('Ramazan Bayramı Arefesi');
        }
    });

    it('Diyanet resmî 2026 listesinden örnekler birebir', () => {
        expect(ozelGunBul('2026-12-10')?.ad).toBe('Regaib Kandili');
        expect(ozelGunBul('2026-03-16')?.tur).toBe('kadir');
        expect(ozelGunBul('2026-05-27')?.tur).toBe('kurbanBayrami');
        expect(ramazanGunuMu('2026-02-18')).toBe(false);
        expect(ramazanGunuMu('2026-02-19')).toBe(true);
        expect(ramazanGunuMu('2026-03-20')).toBe(false);
    });

    it('tablo dışındaki gün tahmin edilmez', () => {
        expect(ozelGunBul('2028-03-01')).toBeNull();
        expect(ramazanGunuMu('2028-02-01')).toBe(false);
    });
});

describe('gunSelami — öncelik', () => {
    it('cuma (Diyanet tablosundan bağımsız, her yıl)', () => {
        expect(gunSelami({ tarihIso: '2026-10-23', vakit: 'ogle' })).toBe(SELAMLAR.cuma);
        expect(gunSelami({ tarihIso: '2031-01-03', vakit: 'ikindi' })).toBe(SELAMLAR.cuma);
    });

    it('sıradan gün: sabah vaktinde "Hayırlı sabahlar", diğer vakitlerde yok', () => {
        expect(gunSelami({ tarihIso: '2026-10-22', vakit: 'imsak' })).toBe(SELAMLAR.sabah);
        expect(gunSelami({ tarihIso: '2026-10-22', vakit: 'ogle' })).toBeNull();
        expect(gunSelami({ tarihIso: '2026-10-22', vakit: 'gunes' })).toBeNull();
        expect(gunSelami({ tarihIso: '2026-10-22' })).toBeNull();
    });

    it('kandil ve Kadir Gecesi', () => {
        expect(gunSelami({ tarihIso: '2026-12-10', vakit: 'aksam' })).toBe(SELAMLAR.kandil);
        expect(gunSelami({ tarihIso: '2027-03-05', vakit: 'ogle' })).toBe(SELAMLAR.kadir);
    });

    it('Ramazan: iftar akşam vaktinde, gündüz genel selam; cuma Ramazan genelinden önce', () => {
        expect(gunSelami({ tarihIso: '2027-02-10', vakit: 'aksam' })).toBe(SELAMLAR.iftar);
        expect(gunSelami({ tarihIso: '2027-02-10', vakit: 'ogle' })).toBe(SELAMLAR.ramazan);
        expect(gunSelami({ tarihIso: '2027-02-12', vakit: 'ogle' })).toBe(SELAMLAR.cuma);
        // Kadir Gecesi akşamı iftar önce gelir (iftar anı)
        expect(gunSelami({ tarihIso: '2027-03-05', vakit: 'aksam' })).toBe(SELAMLAR.iftar);
    });

    it('sahur: gece yarısından sonra (takvim günü > namaz günü), yatsı sürerken, Ramazan günü', () => {
        // 1 Ramazan 2027 = 8 Şubat. 7 Şubat yatsısı, takvim 8 Şubat 03:00 → ilk sahur.
        expect(gunSelami({ tarihIso: '2027-02-07', takvimGunuIso: '2027-02-08', vakit: 'yatsi' })).toBe(
            SELAMLAR.sahur
        );
        // gece yarısından önce sahur yok
        expect(gunSelami({ tarihIso: '2027-02-07', takvimGunuIso: '2027-02-07', vakit: 'yatsi' })).toBeNull();
    });

    it('bayram ve arefe', () => {
        expect(gunSelami({ tarihIso: '2027-03-09', vakit: 'imsak' })).toBe(SELAMLAR.bayram);
        expect(gunSelami({ tarihIso: '2027-05-15', vakit: 'ogle' })).toBe(SELAMLAR.arefe);
        // Ramazan arefesinin akşamı son iftardır
        expect(gunSelami({ tarihIso: '2027-03-08', vakit: 'aksam' })).toBe(SELAMLAR.iftar);
    });
});

describe('NÖBETÇİ — samimiyet metinlerinde yasaklı ifade yok', () => {
    const tumMetinler = [
        ...KABUL_DUALARI,
        KABUL_DUASI,
        TAM_GUN_METNI.ana,
        TAM_GUN_METNI.alt,
            KURULUM_BITTI_SELAMI,
        TESBIHAT_TAMAM_METNI,
        kazaKabulMetni('öğle'),
        kabulCumlesi('2026-10-22', 'imsak'),
        kabulCumlesi('2026-10-22', 'yatsi'),
        ...Object.values(SELAMLAR),
    ];

    it.each(tumMetinler)('"%s"', (metin) => {
        const kucuk = metin.toLocaleLowerCase('tr-TR');
        // fıkıh: secde başlangıç değildir; terk/küfür hedef değildir
        expect(kucuk).not.toMatch(/secde|terk|küfr|küfür|günah|cehennem/);
        // arayüz kaydı "siz": sen/senin/-sın ekleri yok
        // ("etsin/olsun" 3. tekil kişidir, kapsam dışı)
        expect(kucuk).not.toMatch(/(^|\s)(sen|senin|sana|seni)(\s|[.,]|$)/);
        // abartı/övgü yok
        expect(kucuk).not.toMatch(/tebrik|harika|mükemmel|süper|bravo|helal olsun|aferin/);
        expect(metin).not.toMatch(/!/);
        // büyük harf tuzağı: noktasız I ile yanlış "İ" yok
        expect(metin).not.toMatch(/KINDI|İKINDI/);
    });
});

describe('İngilizce — her dil kendi geleneksel kalıbı', () => {
    beforeEach(() => aktifDiliKur('en'));
    afterEach(() => aktifDilSifirla());

    it('dua dönüşümü deterministik ve yalnız İngilizce kalıplardan', () => {
        const d = kabulDuasi('2026-10-22', 'ogle');
        expect(d).toBe(kabulDuasi('2026-10-22', 'ogle'));
        expect(kabulDualari()).toContain(d);
        expect(KABUL_DUALARI).not.toContain(d);
    });

    it('kandil ve hicrî yılbaşı selamı İngilizcede söylenmez; cuma ve Kadir söylenir', () => {
        // 2026-12-10 Regaib (perşembe, akşam) → İngilizcede selam yok
        expect(gunSelami({ tarihIso: '2026-12-10', vakit: 'aksam' })).toBeNull();
        expect(gunSelami({ tarihIso: '2026-10-23', vakit: 'ogle' })).toBe("Jumu'ah Mubarak");
        expect(gunSelami({ tarihIso: '2027-03-05', vakit: 'ogle' })).toBe('Blessed Laylat al-Qadr');
    });

    it('yasaklı ifade yok (övgü, ünlem, suçlama)', () => {
        const metinler = [
            ...kabulDualari(),
            TAM_GUN_METNI.ana,
            TAM_GUN_METNI.alt,
            kazaKabulMetni('Dhuhr'),
            kabulCumlesi('2026-10-22', 'imsak'),
            ...Object.values(SELAMLAR),
        ];
        for (const m of metinler) {
            expect(m).not.toMatch(/!/);
            expect(m.toLowerCase()).not.toMatch(/congrat|great job|awesome|amazing|well done|sin\b|hell\b|missed/);
        }
        expect(TAM_GUN_METNI.alt).toBe('You completed all five prayers today.');
    });
});
