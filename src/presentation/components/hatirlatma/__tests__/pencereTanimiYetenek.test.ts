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

/** Karşılaştırma için fonksiyon alanları (çözücüler) çıkarılır; davranışları ayrıca ölçülür. */
const veri = (t: PencereTanimi) =>
    Object.fromEntries(Object.entries(t).filter(([, d]) => typeof d !== 'function'));

describe('ANDROID REGRESYON — yetenek parametresi ciktiyi DEGISTIRMEZ', () => {
    test('her vakit ve her yon icin varsayilan cikti == ANDROID_YETENEKLERI ciktisi', () => {
        for (const vakit of MUHAFIZ_VAKITLERI as MuhafizVakti[]) {
            for (const yon of YONLER) {
                const varsayilan = vakitPencereTanimi(vakit, yon, 120);
                const acikAndroid = vakitPencereTanimi(vakit, yon, 120, ANDROID_YETENEKLERI);
                expect(veri(varsayilan)).toEqual(veri(acikAndroid));
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

describe('cuma (ekHatirlatmaPencereTanimi)', () => {
    const cuma = () =>
        ekHatirlatmaPencereTanimi({
            kaynak: 'cuma',
            yuzey: 'cuma',
            anonsVakitAdi: 'Cuma',
            baslik: 'Cuma namazı',
            baslikKucuk: 'cuma namazı',
            ikon: 'mosque',
            vakit: 'ogle',
            yonSabitGerekcesi: 'Öğleden önce.',
            adimSayisi: 1,
            maksAdim: 3,
            esikSinirlari: { min: 15, max: 180 },
            esikAdimDk: 15,
            tekrarMinDk: 5,
            tekrarMaxDk: 60,
            varsayilanTekrarDk: 15,
        });

    test('sesli okuma metni YAZILIR (birleşik modül — eski K5 istisnası kalktı); yetenek nesnesi varsayılan Android', () => {
        expect(cuma().anonsMetniDuzenlenebilir).toBe(true);
        expect(cuma().bosMetinOtomatik).toBe(true);
        expect(cuma().titresimSecilebilir).toBe(true);
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
    const NAFILE_ISTISNALARI = new Set<string>([]);

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
            yuzey: 'cuma',
            anonsVakitAdi: 'Cuma',
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
    const EK_ISTISNALARI = new Set<string>(['yonSecilebilir']);
    const ANAHTARLAR = Object.keys(STANDART_YETENEKLER) as (keyof typeof STANDART_YETENEKLER)[];

    test.each([
        ['Android', ANDROID_YETENEKLERI],
        ['iOS', iosYetenekleri(false)],
    ] as const)('%s: muhafız vaktiyle AYNI yetenekler (yalnız yön/ton istisna)', (_ad, y) => {
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


/**
 * SESLİ OKUMA METNİ STANDARDI (birleşik hatırlatma modülü §5): her tanımda metin
 * düzenlenebilirliği platform yeteneğine EŞİTTİR, yer tutucular doludur; takvim sözlüğü
 * etkinlik adı taşımaz; boş metnin anlamı yalnız muhafızda "sessiz"dir.
 */
describe('SESLİ OKUMA METNİ — her yüzey', () => {
    const ekYuzey = (yuzey: 'cuma' | 'camiyeGit' | 'yatis' | 'takvim', yetenekler: PlatformYetenekleri) =>
        ekHatirlatmaPencereTanimi({
            kaynak: yuzey,
            yuzey,
            anonsVakitAdi: 'Öğle',
            baslik: 'B',
            baslikKucuk: 'b',
            ikon: 'bell',
            vakit: 'ogle',
            yonSabitGerekcesi: 'Önce.',
            adimSayisi: 1,
            maksAdim: 3,
            esikSinirlari: { min: 5, max: 180 },
            esikAdimDk: 5,
            tekrarMinDk: 5,
            tekrarMaxDk: 60,
            varsayilanTekrarDk: 15,
            yetenekler,
        });

    test.each([
        ['Android', ANDROID_YETENEKLERI],
        ['iOS', iosYetenekleri(false)],
    ] as const)('%s: anonsMetniDuzenlenebilir === yetenekler.serbestAnonsMetni, yer tutucular dolu', (_ad, y) => {
        const tanimlar: PencereTanimi[] = [
            vakitPencereTanimi('ikindi', 'cikisaDogru', 120, y),
            nafilePencereTanimi({ kaynak: 'nafile:kusluk', baslik: 'Kuşluk', baslikKucuk: 'kuşluk', ikon: 'sun', yon: 'girisindenItibaren', adimSayisi: 1, yetenekler: y }),
            ekYuzey('cuma', y),
            ekYuzey('camiyeGit', y),
            ekYuzey('yatis', y),
            ekYuzey('takvim', y),
        ];
        for (const t of tanimlar) {
            expect([t.kaynak, t.anonsMetniDuzenlenebilir]).toEqual([t.kaynak, y.serbestAnonsMetni]);
            expect([t.kaynak, t.anonsYerTutuculari.length > 0]).toEqual([t.kaynak, true]);
        }
    });

    test('boş metin yalnız MUHAFIZDA sessizdir', () => {
        expect(vakitPencereTanimi('ogle').bosMetinOtomatik).toBe(false);
        expect(ekYuzey('cuma', ANDROID_YETENEKLERI).bosMetinOtomatik).toBe(true);
    });

    test('takvim: etkinlik adı için yer tutucu YOK', () => {
        const anahtarlar = ekYuzey('takvim', ANDROID_YETENEKLERI).anonsYerTutuculari.map((y) => y.anahtar);
        expect(anahtarlar).toEqual(['{vakit}', '{süre}']);
    });

    test('önizleme adımın KENDİ metnini okur (plan üreticisiyle aynı); boşsa otomatik cümle', () => {
        const tanim = ekHatirlatmaPencereTanimi({
            kaynak: 'cuma',
            yuzey: 'cuma',
            anonsVakitAdi: 'Cuma',
            baslik: 'Cuma namazı',
            baslikKucuk: 'cuma namazı',
            ikon: 'mosque',
            vakit: 'ogle',
            yonSabitGerekcesi: 'Önce.',
            adimSayisi: 1,
            maksAdim: 3,
            esikSinirlari: { min: 15, max: 180 },
            esikAdimDk: 15,
            tekrarMinDk: 5,
            tekrarMaxDk: 60,
            varsayilanTekrarDk: 15,
            onizlemeMetni: () => ({ baslik: 'b', govde: 'g', anons: 'otomatik' }),
        });
        const adim = { kalanDk: 45, olcuDk: 45, seviye: 1, adimIndeks: 0, kanallar: { sesli: true }, bildirimSesi: 'varsayilan', sesliAnons: true } as const;
        expect(tanim.onizlemeMetni?.({ ...adim, anonsMetni: '{vakit}: {süre} dakika' }, true).anons).toBe('Cuma: 45 dakika');
        expect(tanim.onizlemeMetni?.({ ...adim, anonsMetni: '' }, true).anons).toBe('otomatik');
    });
});
