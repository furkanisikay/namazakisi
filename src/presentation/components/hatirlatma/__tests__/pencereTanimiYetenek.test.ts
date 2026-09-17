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
    type PencereTanimi,
} from '../pencereTanimi';
import {
    ANDROID_YETENEKLERI,
    iosYetenekleri,
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

    test('Faz 3: AlarmKit varsa sessizligi delme yetenegi tanima yansir', () => {
        const tanim = vakitPencereTanimi('yatsi', 'cikisaDogru', 120, iosYetenekleri(true));
        expect(tanim.yetenekler.sessizligiDelebilir).toBe(true);
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
