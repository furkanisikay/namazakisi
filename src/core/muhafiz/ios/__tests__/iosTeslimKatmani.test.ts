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
    IOS_ALARM_SESI,
    IOS_BILDIRIM_SESI,
    iosSesiCoz,
    iosTesliminiCoz,
    kesintiSeviyesiSec,
} from '../teslimPlani';
import {
    IOS_BEKLEYEN_TAVANI,
    IOS_GUVENLIK_PAYI,
    IOS_YEDEK_REZERVI,
    butceyeSigdir,
    kullanilabilirSlotHesapla,
    yedekKapasitesiHesapla,
    yedekSigarMi,
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
            sistemSesSecici: true,
            serbestAnonsMetni: true,
            titresimSecimi: true,
            sessizligiDelebilir: true,
            gercekAlarm: true,
        });
    });

    /**
     * Faz 2: anons metni iOS'ta da SERBEST — metin planlamada cihazda ses
     * dosyasina cevrilir (calisma aninda TTS gerekmez).
     */
    test('iOS: anons metni ve ses SECIMI acik (uygulamanin listesi, sistem secici yok); titresim ve sessizligi delme KAPALI', () => {
        expect(iosYetenekleri(false)).toEqual({
            platform: 'ios',
            sesSecici: true,
            sistemSesSecici: false,
            serbestAnonsMetni: true,
            titresimSecimi: false,
            sessizligiDelebilir: false,
            gercekAlarm: false,
        });
    });

    test('iOS AlarmKit (issue #74): YALNIZ gercek alarm acilir — bildirim sessizligi yine delmez', () => {
        const yetenek = iosYetenekleri(true);
        expect(yetenek.gercekAlarm).toBe(true);
        // Acil tonlu BILDIRIM sessiz anahtarini AlarmKit varken de delmez.
        expect(yetenek.sessizligiDelebilir).toBe(false);
        // Digerleri AlarmKit'ten bagimsizdir — acilmamali.
        expect(yetenek.sesSecici).toBe(true);
        expect(yetenek.sistemSesSecici).toBe(false);
        expect(yetenek.serbestAnonsMetni).toBe(true);
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

    test('uygulamanin sesi (paket:) paketteki DOSYAYA cozulur', () => {
        expect(iosSesiCoz('paket:zil')).toBe('zil_ios.wav');
        expect(iosSesiCoz('paket:ikiton')).toBe('ikiton_ios.wav');
        expect(iosSesiCoz('paket:damla')).toBe('damla_ios.wav');
        expect(iosSesiCoz('paket:sabah')).toBe('sabah_ios.wav');
    });

    test('eklenen dosya (dosya:) Library/Sounds adina cozulur', () => {
        expect(iosSesiCoz('dosya:kullanici_ses_0123abcd.caf')).toBe('kullanici_ses_0123abcd.caf');
    });

    test('bilinmeyen paket sesi ve BOZUK/tehlikeli dosya adi varsayilana duser (yol enjeksiyonu yok)', () => {
        expect(iosSesiCoz('paket:yok')).toBe(IOS_BILDIRIM_SESI);
        expect(iosSesiCoz('dosya:../Preferences/x.caf')).toBe(IOS_BILDIRIM_SESI);
        expect(iosSesiCoz('dosya:muhafiz_anons_0123abcd.caf')).toBe(IOS_BILDIRIM_SESI);
        expect(iosSesiCoz('dosya:kullanici_ses_0123ABCD.caf')).toBe(IOS_BILDIRIM_SESI);
        expect(iosSesiCoz('dosya:kullanici_ses_0123abcd.wav')).toBe(IOS_BILDIRIM_SESI);
    });

    test('gercek alarm adimi secilen sesi DEGIL uzun alarm sesini calar', () => {
        const plan = iosTesliminiCoz(
            { seviye: 1, alarm: true, bildirimSesi: 'paket:zil' } as never,
            iosYetenekleri(false)
        );
        expect(plan.ses).toBe(IOS_ALARM_SESI);
    });

    test('bildirim adimi secilen paket sesini calar', () => {
        const plan = iosTesliminiCoz({ seviye: 2, bildirimSesi: 'paket:sabah' } as never, iosYetenekleri(false));
        expect(plan).toEqual({ tur: 'bildirim', kesintiSeviyesi: 'timeSensitive', ses: 'sabah_ios.wav' });
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

    test('AlarmKit varken ACIL TON alarma CEVRILMEZ (her dakika tam ekran alarm olurdu)', () => {
        const teslim = iosTesliminiCoz(
            uyari({ seviye: 4, acilKanal: true }),
            iosYetenekleri(true)
        );
        expect(teslim.tur).toBe('bildirim');
        expect(teslim.kesintiSeviyesi).toBe('timeSensitive');
    });

    test('AlarmKit varken GERCEK ALARM tetigi alarm olur; yokken uzun sesli bildirim', () => {
        expect(iosTesliminiCoz(uyari({ seviye: 1, alarm: true }), iosYetenekleri(true)).tur).toBe('alarm');
        expect(iosTesliminiCoz(uyari({ seviye: 1, alarm: true }), iosYetenekleri(false)).tur).toBe('bildirim');
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
    test('sabitler: tavan 64, pay 4, yedek rezervi 8', () => {
        expect(IOS_BEKLEYEN_TAVANI).toBe(64);
        expect(IOS_GUVENLIK_PAYI).toBe(4);
        expect(IOS_YEDEK_REZERVI).toBe(8);
    });

    test('butce artigi: bugunun planindan SONRA kalan slot, rezerv bos kalir', () => {
        // 60 slot, bugun 30 → yedege 60 − 30 − 8 = 22
        expect(yedekKapasitesiHesapla(60, 30)).toBe(22);
        // Bugun slotu tuketiyorsa (ya da asiyorsa) yedek YOK — bugun onceliklidir.
        expect(yedekKapasitesiHesapla(60, 55)).toBe(0);
        expect(yedekKapasitesiHesapla(60, 90)).toBe(0);
        expect(yedekKapasitesiHesapla(0, 0)).toBe(0);
    });

    test('teslim sayaci kapali formla AYNI sayiyi verir (defter = teslimci)', () => {
        for (const [slot, bugun] of [[60, 30], [60, 52], [60, 53], [44, 10], [3, 0]] as const) {
            let kalan = Math.max(0, slot - bugun);
            let kurulan = 0;
            while (yedekSigarMi(kalan)) {
                kalan--;
                kurulan++;
            }
            expect(kurulan).toBe(yedekKapasitesiHesapla(slot, bugun));
        }
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
