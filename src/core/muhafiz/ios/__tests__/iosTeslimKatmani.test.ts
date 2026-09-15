/**
 * SAF iOS TESLIM KATMANI — yetenekler, teslim karari, 64 bildirim butcesi.
 *
 * Bu suite PLATFORM MOCK'LAMAZ ve mock'lamamalidir: olculen modullerin tamami
 * saftir, platformu PARAMETRE olarak alir. Global `Platform.OS` okusalardi bu
 * repoda varsayilan deger **'ios'** oldugu icin Android dali testlerde hic
 * calismaz ve sessizce kapsam disinda kalirdi.
 */
import * as fs from 'fs';
import * as path from 'path';

import {
    ANDROID_YETENEKLERI,
    iosYetenekleri,
    yetenekleriSec,
} from '../platformYetenekleri';
import {
    IOS_BILDIRIM_SESI,
    iosSesiCoz,
    iosTesliminiCoz,
    kesintiSeviyesiSec,
} from '../teslimPlani';
import {
    IOS_BEKLEYEN_TAVANI,
    IOS_GUVENLIK_PAYI,
    IOS_PLAN_GUN_SAYISI,
    butceyeSigdir,
    kullanilabilirSlotHesapla,
} from '../bildirimButcesi';
import type { UyariPlani } from '../../motorAdaptoru';

/** Testte kullanilacak asgari `UyariPlani`. */
function uyari(kismi: Partial<UyariPlani> = {}): UyariPlani {
    return {
        seviye: 1,
        kalanDk: 10,
        olcuDk: 10,
        kanallar: { bildirim: true },
        bildirimSesi: 'varsayilan',
        sesliAnons: false,
        anonsMetni: '',
        ...kismi,
    } as UyariPlani;
}

describe('SAFLIK NOBETCISI — ios/ altinda react-native/expo import edilmez', () => {
    const dizin = path.join(__dirname, '..');

    test('hicbir kaynak dosya platform modulu import etmiyor', () => {
        const dosyalar = fs
            .readdirSync(dizin)
            .filter((d) => d.endsWith('.ts') && !d.endsWith('.d.ts'));

        expect(dosyalar.length).toBeGreaterThan(0);

        const ihlaller: string[] = [];
        for (const dosya of dosyalar) {
            const icerik = fs.readFileSync(path.join(dizin, dosya), 'utf8');
            // Yalniz GERCEK import satirlarina bak; yorumlarda gecen ad serbest.
            for (const satir of icerik.split('\n')) {
                const kirpik = satir.trim();
                if (!kirpik.startsWith('import ') && !kirpik.startsWith('} from ')) continue;
                // `modules/` DE YAKALANMALI (delik kapatildi): saf bir dosya
                // `../../../../modules/expo-muhafiz-anons/src` import ederse
                // test yesil kalir ama dosya artik saf DEGILDIR ve
                // `expo-modules-core` uzerinden jest'i patlatir.
                if (
                    /from '(react-native|expo-[^']*|@react-native[^']*)'/.test(kirpik) ||
                    /from '[^']*modules\/[^']*'/.test(kirpik)
                ) {
                    ihlaller.push(`${dosya}: ${kirpik}`);
                }
            }
        }

        expect(ihlaller).toEqual([]);
    });
});

describe('platformYetenekleri', () => {
    test('Android: hicbir yetenek kisitli degil', () => {
        expect(ANDROID_YETENEKLERI).toEqual({
            platform: 'android',
            sesSecici: true,
            serbestAnonsMetni: true,
            titresimSecimi: true,
            sessizligiDelebilir: true,
        });
    });

    test('iOS Faz 1/2: ses secici, serbest anons metni, titresim secimi ve sessizligi delme KAPALI', () => {
        expect(iosYetenekleri(false)).toEqual({
            platform: 'ios',
            sesSecici: false,
            serbestAnonsMetni: false,
            titresimSecimi: false,
            sessizligiDelebilir: false,
        });
    });

    test('iOS Faz 3: AlarmKit varsa YALNIZ sessizligi delme acilir', () => {
        const yetenek = iosYetenekleri(true);
        expect(yetenek.sessizligiDelebilir).toBe(true);
        // Digerleri AlarmKit'ten bagimsizdir — acilmamali.
        expect(yetenek.sesSecici).toBe(false);
        expect(yetenek.serbestAnonsMetni).toBe(false);
        expect(yetenek.titresimSecimi).toBe(false);
    });

    test('yetenekleriSec platform adindan dogru nesneyi verir', () => {
        expect(yetenekleriSec('android')).toBe(ANDROID_YETENEKLERI);
        expect(yetenekleriSec('ios').platform).toBe('ios');
    });
});

describe('kesintiSeviyesiSec — Odak (Focus) delme kurali', () => {
    test('seviye 1 (nazik) Odak DELMEZ', () => {
        expect(kesintiSeviyesiSec(1)).toBe('active');
    });

    test('seviye 2, 3 ve 4 Odak DELER', () => {
        expect(kesintiSeviyesiSec(2)).toBe('timeSensitive');
        expect(kesintiSeviyesiSec(3)).toBe('timeSensitive');
        expect(kesintiSeviyesiSec(4)).toBe('timeSensitive');
    });
});

describe('iosSesiCoz', () => {
    test("Android'in content:// URI'si iOS'ta cozulemez -> paket sesine duser", () => {
        expect(iosSesiCoz('content://media/internal/audio/media/42')).toBe(IOS_BILDIRIM_SESI);
    });

    test('varsayilan ve tanimsiz deger paket sesine duser', () => {
        expect(iosSesiCoz('varsayilan')).toBe(IOS_BILDIRIM_SESI);
        expect(iosSesiCoz(undefined)).toBe(IOS_BILDIRIM_SESI);
    });
});

describe('iosTesliminiCoz', () => {
    test('Faz 1: acil adim bile BILDIRIM olarak teslim edilir (AlarmKit yok)', () => {
        const teslim = iosTesliminiCoz(
            uyari({ seviye: 4, acilKanal: true }),
            iosYetenekleri(false)
        );
        expect(teslim.tur).toBe('bildirim');
        expect(teslim.kesintiSeviyesi).toBe('timeSensitive');
    });

    test('Faz 3: AlarmKit varsa acil adim ALARM olur', () => {
        const teslim = iosTesliminiCoz(
            uyari({ seviye: 4, acilKanal: true }),
            iosYetenekleri(true)
        );
        expect(teslim.tur).toBe('alarm');
    });

    test('AlarmKit olsa bile acil OLMAYAN adim alarm YAPILMAZ', () => {
        const teslim = iosTesliminiCoz(
            uyari({ seviye: 2, acilKanal: false }),
            iosYetenekleri(true)
        );
        expect(teslim.tur).toBe('bildirim');
    });
});

describe('bildirimButcesi — 64 bekleyen siniri', () => {
    test('sabitler: tavan 64, pay 4, iOS penceresi 2 gun', () => {
        expect(IOS_BEKLEYEN_TAVANI).toBe(64);
        expect(IOS_GUVENLIK_PAYI).toBe(4);
        expect(IOS_PLAN_GUN_SAYISI).toBe(2);
    });

    test('slot = tavan - muhafiz disi bekleyen - guvenlik payi', () => {
        expect(kullanilabilirSlotHesapla(0)).toBe(60);
        expect(kullanilabilirSlotHesapla(16)).toBe(44);
    });

    test('tavan asilmissa slot NEGATIF degil sifir olur', () => {
        expect(kullanilabilirSlotHesapla(100)).toBe(0);
    });

    test('kesme KRONOLOJIKtir — en yakin olanlar tutulur (sistemle ayni olcut)', () => {
        const adaylar = [
            { zamanMs: 500, tur: 'bildirim' as const },
            { zamanMs: 100, tur: 'bildirim' as const },
            { zamanMs: 300, tur: 'bildirim' as const },
        ];
        const sonuc = butceyeSigdir(adaylar, 2);
        expect(sonuc.tutulan.map((a) => a.zamanMs)).toEqual([100, 300]);
        expect(sonuc.kesilen.map((a) => a.zamanMs)).toEqual([500]);
    });

    test("'alarm' turu butceyi YEMEZ (AlarmKit 64 sinirina tabi degil)", () => {
        const adaylar = [
            { zamanMs: 100, tur: 'alarm' as const },
            { zamanMs: 200, tur: 'bildirim' as const },
            { zamanMs: 300, tur: 'alarm' as const },
            { zamanMs: 400, tur: 'bildirim' as const },
        ];
        const sonuc = butceyeSigdir(adaylar, 1);
        // Iki alarm kosulsuz + en yakin tek bildirim
        expect(sonuc.tutulan.map((a) => a.zamanMs)).toEqual([100, 200, 300]);
        expect(sonuc.kesilen.map((a) => a.zamanMs)).toEqual([400]);
        expect(sonuc.sayilanAday).toBe(2);
    });

    test('slot yeterliyse hicbir sey kesilmez', () => {
        const adaylar = [
            { zamanMs: 1, tur: 'bildirim' as const },
            { zamanMs: 2, tur: 'bildirim' as const },
        ];
        expect(butceyeSigdir(adaylar, 60).kesilen).toEqual([]);
    });

    test('girdi dizisi DEGISTIRILMEZ (saflik)', () => {
        const adaylar = [
            { zamanMs: 300, tur: 'bildirim' as const },
            { zamanMs: 100, tur: 'bildirim' as const },
        ];
        const kopya = JSON.parse(JSON.stringify(adaylar));
        butceyeSigdir(adaylar, 1);
        expect(adaylar).toEqual(kopya);
    });

    test('yogun preset gercegi: 35 uyari/gun x 2 gun, 44 slot -> ilk gun TAM sigar', () => {
        // Gun 1 = 0..34 dk, Gun 2 = 1000..1034 dk (kronolojik olarak sonra)
        const adaylar = [
            ...Array.from({ length: 35 }, (_, i) => ({ zamanMs: i, tur: 'bildirim' as const })),
            ...Array.from({ length: 35 }, (_, i) => ({
                zamanMs: 1000 + i,
                tur: 'bildirim' as const,
            })),
        ];
        const sonuc = butceyeSigdir(adaylar, kullanilabilirSlotHesapla(16)); // 44 slot
        expect(sonuc.tutulan).toHaveLength(44);
        expect(sonuc.kesilen).toHaveLength(26);
        // Ilk gunun 35 uyarisinin TAMAMI korunmali — kesme ikinci gunden baslar.
        const ilkGun = sonuc.tutulan.filter((a) => a.zamanMs < 1000);
        expect(ilkGun).toHaveLength(35);
    });
});
