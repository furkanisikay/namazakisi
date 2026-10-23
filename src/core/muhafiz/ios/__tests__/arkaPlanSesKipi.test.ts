/**
 * iOS `UIBackgroundModes` içinde `audio` OLMAMALI (App Review 2.5.4, 0.53.1 reddi).
 *
 * Uygulama arka planda kalıcı ses çalmaz: önizleme sesleri yalnız ön planda
 * (`shouldPlayInBackground: false`), sesli anons bildirim sesi olarak gelir, gerçek
 * alarm AlarmKit'tir. `audio` kipini bizim kodumuz değil `expo-audio` eklentisi ekler
 * (`enableBackgroundPlayback` varsayılanı true) → app.json'da açıkça kapatılır.
 * Eklenti gerçek yapılandırmayla koşturulup Info.plist sonucu ölçülür.
 */
import * as fs from 'fs';
import * as path from 'path';

const KOK = path.join(__dirname, '../../../../..');

/** moduleNameMapper `expo-audio`'yu sahte modüle eşlediği için eklenti dosya yoluyla yüklenir. */
type InfoPlistModu = (girdi: object) => Promise<{ modResults: { UIBackgroundModes?: string[] } }>;
type Eklenti = (yapi: object, secenek: object) => { mods?: { ios?: { infoPlist?: InfoPlistModu } } };

function eklentiyiYukle(): Eklenti {
    const m = require(path.join(KOK, 'node_modules/expo-audio/plugin/build/withAudio.js'));
    return m.default ?? m;
}

describe('iOS arka plan ses kipi (2.5.4)', () => {
    const app = JSON.parse(fs.readFileSync(path.join(KOK, 'app.json'), 'utf8'));

    it('app.json kök UIBackgroundModes audio içermez', () => {
        expect(app.expo.ios.infoPlist.UIBackgroundModes).not.toContain('audio');
    });

    it('expo-audio eklentisi audio kipini EKLEMEZ (gerçek eklenti koşturulur)', async () => {
        const giris = (app.expo.plugins as unknown[]).find(
            (e) => Array.isArray(e) && e[0] === 'expo-audio'
        ) as [string, Record<string, unknown>];
        expect(giris).toBeDefined();
        const eklenti = eklentiyiYukle();
        const yapi = eklenti({ name: 'x', slug: 'x' }, giris[1]);
        const mod = yapi.mods?.ios?.infoPlist;
        const sonuc = mod
            ? await mod({ ...yapi, modResults: { UIBackgroundModes: ['fetch'] }, modRequest: { platform: 'ios' } })
            : { modResults: { UIBackgroundModes: ['fetch'] } };
        expect(sonuc.modResults.UIBackgroundModes ?? []).not.toContain('audio');
    });

    it('nöbetçinin kendisi çalışıyor: seçenek kapatılmazsa eklenti audio ekler', async () => {
        const eklenti = eklentiyiYukle();
        const yapi = eklenti({ name: 'x', slug: 'x' }, {});
        const sonuc = await yapi.mods!.ios!.infoPlist!({
            ...yapi,
            modResults: { UIBackgroundModes: ['fetch'] },
            modRequest: { platform: 'ios' },
        });
        expect(sonuc.modResults.UIBackgroundModes).toContain('audio');
    });
});
