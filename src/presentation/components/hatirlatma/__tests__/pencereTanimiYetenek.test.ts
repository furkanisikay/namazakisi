/**
 * `PencereTanimi` YETENEK KAPILARI + ANDROID REGRESYON NOBETCISI.
 *
 * Iki sey olculur:
 *   1. `yetenekler` VERILMEDEN cagrilan `vakitPencereTanimi` ciktisinin,
 *      ANDROID_YETENEKLERI ile cagrilan ciktiyla BIREBIR ayni olmasi —
 *      yani iOS portu Android ekranini bir bayt degistirmedi.
 *   2. iOS yetenekleriyle cagrildiginda dogru kapilarin kapanmasi.
 *
 * Suite PLATFORM MOCK'LAMAZ: `vakitPencereTanimi` platformu PARAMETRE alir,
 * global okumaz. (Global okusaydi bu repoda varsayilan `Platform.OS` **'ios'**
 * oldugu icin Android dali testlerde hic calismazdi.)
 */
import {
    vakitPencereTanimi,
    cumaPencereTanimi,
    nafilePencereTanimi,
    ekHatirlatmaPencereTanimi,
    STANDART_YETENEKLER,
    type PencereTanimi,
} from '../pencereTanimi';
import {
    ANDROID_YETENEKLERI,
    iosYetenekleri,
    type PlatformYetenekleri,
} from '../../../../core/muhafiz/ios/platformYetenekleri';
import { MUHAFIZ_VAKITLERI } from '../../../../core/muhafiz/matrisTipleri';
import type { MuhafizVakti } from '../../../../core/muhafiz/matrisTipleri';
import type { PencereYonu } from '../../../../core/muhafiz/pencereTipleri';

const YONLER: PencereYonu[] = ['cikisaDogru', 'girisindenItibaren'];

describe('ANDROID REGRESYON — yetenek parametresi ciktiyi DEGISTIRMEZ', () => {
    test('her vakit ve her yon icin varsayilan cikti == ANDROID_YETENEKLERI ciktisi', () => {
        for (const vakit of MUHAFIZ_VAKITLERI as MuhafizVakti[]) {
            for (const yon of YONLER) {
                const varsayilan = vakitPencereTanimi(vakit, yon, 120);
                const acikAndroid = vakitPencereTanimi(vakit, yon, 120, ANDROID_YETENEKLERI);
                expect(varsayilan).toEqual(acikAndroid);
            }
        }
    });

    test("Android'de tum duzenleme kapilari ACIK", () => {
        const tanim = vakitPencereTanimi('yatsi', 'cikisaDogru', 120);
        expect(tanim.sesSecimiVar).toBe(true);
        expect(tanim.anonsMetniDuzenlenebilir).toBe(true);
        expect(tanim.titresimSecilebilir).toBe(true);
        expect(tanim.kanalSecimiVar).toBe(true);
    });
});

describe('iOS kapilari', () => {
    const iosTanim = (): PencereTanimi =>
        vakitPencereTanimi('yatsi', 'cikisaDogru', 120, iosYetenekleri(false));

    test('ses secimi KAPALI — iOS`ta sistem ses secicisi yok', () => {
        expect(iosTanim().sesSecimiVar).toBe(false);
    });

    test('anons metni DUZENLENEBILIR — metin planlamada ses dosyasina cevrilir (Faz 2)', () => {
        expect(iosTanim().anonsMetniDuzenlenebilir).toBe(true);
    });

    test('titresim secilemez — haptik sistem ayarina bagli', () => {
        expect(iosTanim().titresimSecilebilir).toBe(false);
    });

    test('KANAL secimi ACIK KALIR — bildirim/sesli ekseni iOS`ta da anlamli', () => {
        // Sesli kanal iOS'ta "on-kayitli klip" demek; adim yine de secilebilmeli.
        expect(iosTanim().kanalSecimiVar).toBe(true);
    });

    test('yetenek nesnesi tanimda TASINIR (AdimNotlari onu okur)', () => {
        expect(iosTanim().yetenekler.platform).toBe('ios');
        expect(iosTanim().yetenekler.sessizligiDelebilir).toBe(false);
    });

    test('AlarmKit varsa gercek alarm yetenegi tanima yansir (bildirim sessizligi delmez)', () => {
        const tanim = vakitPencereTanimi('yatsi', 'cikisaDogru', 120, iosYetenekleri(true));
        expect(tanim.yetenekler.gercekAlarm).toBe(true);
        expect(tanim.yetenekler.sessizligiDelebilir).toBe(false);
        // Diger kapilar AlarmKit'ten bagimsiz — acilmamali.
        expect(tanim.sesSecimiVar).toBe(false);
        expect(tanim.anonsMetniDuzenlenebilir).toBe(true);
    });
});

describe('cumaPencereTanimi', () => {
    const cuma = () =>
        cumaPencereTanimi({
            esikSinirlari: { min: 15, max: 180 },
            esikAdimDk: 5,
            tekrarMinDk: 5,
            tekrarMaxDk: 60,
            varsayilanTekrarDk: 15,
        });

    test('yeni alanlar cuma icin de tanimli (tip guvenligi degil, davranis)', () => {
        expect(cuma().anonsMetniDuzenlenebilir).toBe(false);
        expect(cuma().titresimSecilebilir).toBe(false);
        expect(cuma().yetenekler).toBe(ANDROID_YETENEKLERI);
    });

    test('cuma kimligi ogle namazidir (AGENTS.md: "Cuma" salt gorunum)', () => {
        expect(cuma().vakit).toBe('ogle');
    });
});

/**
 * YETENEK STANDARDI (sahip kararı): hatırlatma yapısı her yerde aynıdır. Teslimciden
 * geçen her yüzey (muhafız vakitleri + nafile) STANDART yetenekleri AYNI değerle taşır;
 * bir farklılık ancak gerekçesi kodda yazılı istisnadır (aşağıdaki liste o istisnaların
 * TAM listesidir — yeni bir fark eklenirse bu test kırılır ve gerekçe istenir).
 */
describe('YETENEK STANDARDI', () => {
    const nafile = (yetenekler: PlatformYetenekleri = ANDROID_YETENEKLERI) =>
        nafilePencereTanimi({
            kaynak: 'nafile:kusluk',
            baslik: 'Kuşluk',
            baslikKucuk: 'kuşluk',
            ikon: 'sun',
            yon: 'girisindenItibaren',
            adimSayisi: 1,
            yetenekler,
        });
    const ANAHTARLAR = Object.keys(STANDART_YETENEKLER) as (keyof typeof STANDART_YETENEKLER)[];
    /** Nafilenin kodda gerekçelenen istisnaları (ton ayrıca: `tonSecilebilir`). */
    const NAFILE_ISTISNALARI = new Set<string>(['anonsMetniDuzenlenebilir']);

    test.each([
        ['Android', ANDROID_YETENEKLERI],
        ['iOS', iosYetenekleri(false)],
    ] as const)('%s: muhafız vakti ve nafile AYNI yetenekleri taşır (istisna listesi dışında)', (_ad, y) => {
        const muhafiz = vakitPencereTanimi('ogle', 'cikisaDogru', 120, y);
        const n = nafile(y);
        for (const anahtar of ANAHTARLAR) {
            if (NAFILE_ISTISNALARI.has(anahtar)) continue;
            expect([anahtar, n[anahtar]]).toEqual([anahtar, muhafiz[anahtar]]);
        }
    });

    test('Android: muhafızda HER standart yetenek açık; nafilede de (gerekçeli istisna hariç)', () => {
        const muhafiz = vakitPencereTanimi('ogle');
        for (const anahtar of ANAHTARLAR) expect([anahtar, muhafiz[anahtar]]).toEqual([anahtar, true]);
        const n = nafile();
        for (const anahtar of ANAHTARLAR) {
            if (NAFILE_ISTISNALARI.has(anahtar)) continue;
            expect([anahtar, n[anahtar]]).toEqual([anahtar, true]);
        }
        expect(n.tonSecilebilir).toBe(false);
    });
});

/**
 * EK HATIRLATMA YÜZEYLERİ (plan §3.3): teslimciden geçen yüzeyde istisna YALNIZ yön, ton
 * ve anons metni olabilir; yön sabitse gerekçesi ekranda yazılır (sessiz istisna yok).
 */
describe('YETENEK STANDARDI — ek hatırlatma yüzeyi', () => {
    const ek = (yetenekler: PlatformYetenekleri = ANDROID_YETENEKLERI) =>
        ekHatirlatmaPencereTanimi({
            kaynak: 'cuma',
            baslik: 'Cuma namazı',
            baslikKucuk: 'cuma namazı',
            ikon: 'mosque',
            vakit: 'ogle',
            yonSabitGerekcesi: 'Hatırlatma öğle vaktinden ÖNCE gelir.',
            adimSayisi: 1,
            maksAdim: 3,
            esikSinirlari: { min: 15, max: 180 },
            esikAdimDk: 15,
            tekrarMinDk: 5,
            tekrarMaxDk: 60,
            varsayilanTekrarDk: 15,
            yetenekler,
        });
    const EK_ISTISNALARI = new Set<string>(['yonSecilebilir', 'anonsMetniDuzenlenebilir']);
    const ANAHTARLAR = Object.keys(STANDART_YETENEKLER) as (keyof typeof STANDART_YETENEKLER)[];

    test.each([
        ['Android', ANDROID_YETENEKLERI],
        ['iOS', iosYetenekleri(false)],
    ] as const)('%s: muhafız vaktiyle AYNI yetenekler (yalnız yön/ton/anons istisna)', (_ad, y) => {
        const muhafiz = vakitPencereTanimi('ogle', 'cikisaDogru', 120, y);
        const t = ek(y);
        for (const anahtar of ANAHTARLAR) {
            if (EK_ISTISNALARI.has(anahtar)) continue;
            expect([anahtar, t[anahtar]]).toEqual([anahtar, muhafiz[anahtar]]);
        }
        expect(t.tonSecilebilir).toBe(false);
        expect(t.onPlanBanneriVar).toBe(false);
    });

    test('yön sabitse gerekçe DOLU olmalı — teslimciden geçen her tanımda', () => {
        const tanimlar: PencereTanimi[] = [
            ek(),
            vakitPencereTanimi('ogle'),
            nafilePencereTanimi({ kaynak: 'nafile:kusluk', baslik: 'K', baslikKucuk: 'k', ikon: 'sun', yon: 'girisindenItibaren', adimSayisi: 1 }),
        ];
        for (const t of tanimlar) {
            if (!t.yonSecilebilir) expect([t.kaynak, (t.yonSabitGerekcesi ?? '').length > 0]).toEqual([t.kaynak, true]);
        }
    });
});

