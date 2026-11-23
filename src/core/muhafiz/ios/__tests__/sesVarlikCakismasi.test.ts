/**
 * NOBETCI — `expo-notifications.sounds` ANDROID KAYNAK CAKISMASI URETMEZ.
 *
 * Dizi PLATFORM ORTAKTIR: `withNotificationsAndroid > setNotificationSounds`
 * icindeki HER dosyayi basename'iyle `android/app/src/main/res/raw/` altina
 * kopyalar. Android kaynak adlari UZANTISIZ turetilir → `bildirim.mp3` ve
 * `bildirim.wav` ikisi de `R.raw.bildirim` olur ve AAPT2 "Duplicate resources"
 * ile Android derlemesini DURDURUR (`android-build.yml` prebuild calistirir).
 *
 * Bu hata `npm run verify`'da GORUNMEZ (AGENTS.md: config degisikliginin build'i
 * kirip kirmadigini verify gostermez) — ancak APK/AAB build'inde cikar ve
 * release'i dusurur. Bu yuzden kural teste baglandi.
 */
import * as fs from 'fs';
import * as path from 'path';

import { IOS_ALARM_SESI, IOS_BILDIRIM_SESI } from '../teslimPlani';
import { PAKET_SESLERI } from '../paketSesleri';

const PROJE_KOKU = path.resolve(__dirname, '../../../../..');

function sesListesi(): string[] {
    const app = JSON.parse(fs.readFileSync(path.join(PROJE_KOKU, 'app.json'), 'utf8'));
    const eklenti = app.expo.plugins.find(
        (p: unknown) => Array.isArray(p) && p[0] === 'expo-notifications'
    );
    return eklenti[1].sounds as string[];
}

describe('expo-notifications sounds — Android kaynak adi cakismasi', () => {
    test('hicbir iki ses dosyasi AYNI govde adini paylasmaz', () => {
        const govdeler = sesListesi().map((s) => path.basename(s, path.extname(s)));
        const tekrar = govdeler.filter((g, i) => govdeler.indexOf(g) !== i);
        expect(tekrar).toEqual([]);
    });

    test('govde adlari Android kaynak adi kurallarina uyar (a-z0-9_)', () => {
        for (const yol of sesListesi()) {
            const govde = path.basename(yol, path.extname(yol));
            // Tire GECERSIZDIR; buyuk harf de kaynak adinda kullanilamaz.
            expect(govde).toMatch(/^[a-z][a-z0-9_]*$/);
        }
    });

    test('listedeki her dosya gercekten VAR', () => {
        for (const yol of sesListesi()) {
            expect(fs.existsSync(path.join(PROJE_KOKU, yol))).toBe(true);
        }
    });

    test('iOS varsayilan sesi listede kayitli ve .wav', () => {
        const adlar = sesListesi().map((s) => path.basename(s));
        expect(adlar).toContain(IOS_BILDIRIM_SESI);
        expect(IOS_BILDIRIM_SESI.endsWith('.wav')).toBe(true);
    });

    test('iPhone ses listesindeki HER paket sesi app.json\'da kayitli ve .wav (yoksa iOS sistemin sesini calar)', () => {
        const adlar = sesListesi().map((s) => path.basename(s));
        for (const p of PAKET_SESLERI) {
            expect({ ad: p.ad, kayitli: adlar.includes(p.dosya) }).toEqual({ ad: p.ad, kayitli: true });
            expect(p.dosya.endsWith('.wav')).toBe(true);
        }
    });

    test('iOS bildirim sesleri 30 sn\'den KISA (uzun sesin yerine iOS sistemin sesini calar)', () => {
        const iosSesleri = [IOS_BILDIRIM_SESI, IOS_ALARM_SESI, ...PAKET_SESLERI.map((p) => p.dosya)];
        for (const ad of iosSesleri) {
            const veri = fs.readFileSync(path.join(PROJE_KOKU, 'assets/sounds', ad));
            // RIFF/WAVE: byteRate fmt parcasinda (ofset 28), sure = data boyutu / byteRate.
            expect(veri.toString('ascii', 0, 4)).toBe('RIFF');
            const byteRate = veri.readUInt32LE(28);
            const data = veri.indexOf(Buffer.from('data'));
            const saniye = veri.readUInt32LE(data + 4) / byteRate;
            expect({ ad, kisa: saniye > 0 && saniye < 30 }).toEqual({ ad, kisa: true });
        }
    });
});
