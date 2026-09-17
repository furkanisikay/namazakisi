/**
 * iOS anons klibi — dosya adi sozlesmesi ve ihtiyac cikarimi.
 *
 * Suite PLATFORM MOCK'LAMAZ: modul saftir, `Platform.OS` okumaz.
 */
import {
    ANONS_KLIP_ONEKI,
    ANONS_KLIP_UZANTISI,
    ANONS_METIN_UST_SINIRI,
    anonsKlibiMi,
    anonsKlipAdi,
    anonsSentezlenebilirMi,
    klipIhtiyaciCikar,
} from '../anonsKlibi';

/** Testlerde kullanilan sahte ses tanimlayicisi (compact Turkce). */
const SES = 'com.apple.voice.compact.tr-TR.Yelda';
const SES_GELISMIS = 'com.apple.voice.enhanced.tr-TR.Yelda';

const ad = (metin: string, ses: string = SES) =>
    anonsKlipAdi({ cozulmusMetin: metin, sesTanimlayici: ses });

describe('anonsKlipAdi', () => {
    test('ayni metin + ayni ses = ayni ad (deterministik)', () => {
        const metin = 'Yatsı namazını kaçırma, 15 dakika kaldı.';
        expect(ad(metin)).toBe(ad(metin));
    });

    test('farkli metin farkli ad verir', () => {
        expect(ad('Yatsı namazını kaçırma, 15 dakika kaldı.')).not.toBe(
            ad('Yatsı namazını kaçırma, 5 dakika kaldı.')
        );
    });

    test('DAKIKA adin bir parcasidir — {süre} cozulmus gelmeli', () => {
        // Cozulmemis sablon verilirse tum tetikler tek klibi paylasir ve anons
        // YANLIS dakikayi soyler. Farkli dakika => farkli dosya olmali.
        const adlar = [5, 10, 15, 25].map((dk) =>
            ad(`Akşam namazını kaçırma, ${dk} dakika kaldı.`)
        );
        expect(new Set(adlar).size).toBe(4);
    });

    test('NOBETCI: SES DEGISINCE ad da degisir', () => {
        // Kullanici Ayarlar'dan gelismis Turkce sesi indirince tanimlayici
        // degisir. Hash'e girmezse ad ayni kalir, `varMi` true doner ve
        // kullanici yeni sesi indirmis olmasina ragmen sonsuza kadar eski
        // robotik klipleri duyar.
        const metin = 'Yatsı vakti çıkıyor, 10 dakika kaldı.';
        expect(ad(metin, SES)).not.toBe(ad(metin, SES_GELISMIS));
    });

    test('ad SALT ASCII ve dosya sistemi icin guvenli', () => {
        const dosya = ad('İkindi vakti çıkıyor, 3 dakika kaldı — acele et!');
        expect(dosya).toMatch(/^muhafiz_anons_[0-9a-f]{8}\.caf$/);
        expect(Array.from(dosya).every((k) => k.charCodeAt(0) < 128)).toBe(true);
    });

    test('onek ve uzanti sabitlerle tutarli', () => {
        expect(ad('deneme').startsWith(ANONS_KLIP_ONEKI)).toBe(true);
        expect(ad('deneme').endsWith(ANONS_KLIP_UZANTISI)).toBe(true);
    });
});

describe('klipIhtiyaciCikar', () => {
    test('ayni metin birden cok gecse TEK klip uretilir', () => {
        const ihtiyac = klipIhtiyaciCikar(
            ['Vakit daralıyor.', 'Vakit daralıyor.', 'Vakit daralıyor.'],
            SES
        );
        expect(ihtiyac).toHaveLength(1);
        expect(ihtiyac[0].metin).toBe('Vakit daralıyor.');
    });

    test('farkli metinler ayri kliplerdir ve SIRA korunur', () => {
        const ihtiyac = klipIhtiyaciCikar(['Bir.', 'İki.', 'Üç.'], SES);
        expect(ihtiyac.map((i) => i.metin)).toEqual(['Bir.', 'İki.', 'Üç.']);
    });

    test('sentezlenemeyecek metinler ELENIR (cagiran varsayilan sese duser)', () => {
        const ihtiyac = klipIhtiyaciCikar(
            ['', '   ', 'a'.repeat(ANONS_METIN_UST_SINIRI + 1), 'Geçerli metin.'],
            SES
        );
        expect(ihtiyac.map((i) => i.metin)).toEqual(['Geçerli metin.']);
    });

    test('her ihtiyacin adi anonsKlipAdi ile ayni (tek kaynak)', () => {
        const [ihtiyac] = klipIhtiyaciCikar(['Tek metin.'], SES);
        expect(ihtiyac.ad).toBe(ad('Tek metin.'));
    });

    test('bos girdi bos liste verir', () => {
        expect(klipIhtiyaciCikar([], SES)).toEqual([]);
    });
});

describe('anonsKlibiMi — GC yalniz KENDI dosyalarimizi silsin', () => {
    test('kendi klibimizi taniyor', () => {
        expect(anonsKlibiMi(ad('bir metin'))).toBe(true);
    });

    test('yabanci dosyalara DOKUNMAZ', () => {
        expect(anonsKlibiMi('bildirim_ios.wav')).toBe(false);
        expect(anonsKlibiMi('kullanicinin_zil_sesi.caf')).toBe(false);
        expect(anonsKlibiMi('muhafiz_anons_abc.wav')).toBe(false); // yanlis uzanti
        expect(anonsKlibiMi('anons_12345678.caf')).toBe(false); // yanlis onek
    });
});

describe('anonsSentezlenebilirMi', () => {
    test('normal metin sentezlenir', () => {
        expect(anonsSentezlenebilirMi('Yatsı vakti çıkıyor, 10 dakika kaldı.')).toBe(true);
    });

    test('bos / yalniz bosluk metin sentezlenmez', () => {
        expect(anonsSentezlenebilirMi('')).toBe(false);
        expect(anonsSentezlenebilirMi('   ')).toBe(false);
        expect(anonsSentezlenebilirMi(undefined)).toBe(false);
    });

    test('30 sn sinirini asacak kadar uzun metin ELENIR (sessizce calmamaktansa)', () => {
        // iOS uzun sesi KIRPMAZ — dosyayi hic calmaz ve SISTEM varsayilan sesine
        // duser. Once biz eliyoruz ki kendi varsayilan sesimize duselim.
        expect(anonsSentezlenebilirMi('a'.repeat(ANONS_METIN_UST_SINIRI + 1))).toBe(false);
        expect(anonsSentezlenebilirMi('a'.repeat(ANONS_METIN_UST_SINIRI))).toBe(true);
    });
});
