/**
 * Nobetci: "ozellik turu" ekran goruntusu tohumu (scripts/ozellik-tohum-verisi.js).
 *
 * Betik TS'yi yukleyemedigi icin anahtar adlarini ve ayar sekillerini ELLE
 * yazar. Ayrisirsa zarar SESSIZDIR: uygulama bozuk/eksik kaydi varsayilana
 * dusurur (nafile kapali, yatis kapali...) ve ekran goruntuleri bos ekran
 * gosterir — hat yine "basarili" der. Bu test her degerin uygulamanin KENDI
 * okuma yolundan DEGISMEDEN gectigini dogrular.
 */
import * as fs from 'fs';
import * as path from 'path';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { camideyimAyarlariniNormalize } from '../../cami/camideyimAyarlari';
import { DEPOLAMA_ANAHTARLARI } from '../../constants/UygulamaSabitleri';
import { LocalNafileServisi } from '../../../data/local/LocalNafileServisi';
import { LocalYatisHatirlatmaServisi } from '../../../data/local/LocalYatisHatirlatmaServisi';
import { LocalCamiyeGitServisi } from '../../../data/local/LocalCamiyeGitServisi';
import { LocalCumaHatirlatmaServisi } from '../../../data/local/LocalCumaHatirlatmaServisi';
import { LocalSadeGorunumServisi } from '../../../data/local/LocalSadeGorunumServisi';
import { LocalKazaOneriServisi } from '../../../data/local/LocalKazaOneriServisi';
import {
    matrisGecerliMi,
    muhafizMatrisiniCoz,
    vakitUyariPlaniOlustur,
    type MatrisKaynagi,
} from '../../muhafiz/motorAdaptoru';
import { MUHAFIZ_VAKITLERI, type MuhafizMatrisi } from '../../muhafiz/matrisTipleri';

const { ozellikTohumVerisi, VARYANTLAR } = require('../../../../scripts/ozellik-tohum-verisi');
const { tohumVerisi } = require('../../../../scripts/magaza-tohum-verisi');

const yaz = async (depo: Record<string, string>) => {
    await AsyncStorage.clear();
    await AsyncStorage.multiSet(Object.entries(depo));
};

describe('ozellik turu tohumu', () => {
    it('magaza tohumunu DEGISTIRMEZ (magaza kareleri birebir ayni kalir)', () => {
        const once = tohumVerisi();
        ozellikTohumVerisi({ varyant: 'butce', tema: 'koyu' });
        const sonra = tohumVerisi();
        // Zaman damgali alanlar disinda ayni anahtar kumesi.
        expect(Object.keys(sonra).sort()).toEqual(Object.keys(once).sort());
        expect(sonra.muhafiz_ayarlari).toBe(once.muhafiz_ayarlari);
    });

    it('anahtar adlari uygulamanin depolama anahtarlariyla ayni', () => {
        const depo = ozellikTohumVerisi({ varyant: 'sade' });
        for (const anahtar of [
            DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI,
            DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI,
            DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI,
            DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI,
            DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI,
            DEPOLAMA_ANAHTARLARI.SADE_GORUNUM_AYARLARI,
            DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI,
            DEPOLAMA_ANAHTARLARI.KAZA_DURUMU,
        ]) {
            expect(depo[anahtar]).toBeDefined();
        }
    });

    it.each(VARYANTLAR as string[])('%s: her ayar okuma yolundan DEGISMEDEN ve ACIK gecer', async (varyant) => {
        const depo = ozellikTohumVerisi({ varyant });
        await yaz(depo);
        const ham = (anahtar: string) => JSON.parse(depo[anahtar]);

        const nafile = await LocalNafileServisi.getAyarlar();
        expect(nafile).toEqual(ham(DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI));
        expect(nafile.gostergeAktif).toBe(true);

        const yatis = await LocalYatisHatirlatmaServisi.getAyarlar();
        expect(yatis).toEqual(ham(DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI));
        expect(yatis.aktif).toBe(true);

        const camiyeGit = await LocalCamiyeGitServisi.getAyarlar();
        expect(camiyeGit).toEqual(ham(DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI));
        expect(camiyeGit.aktif).toBe(true);

        const cuma = await LocalCumaHatirlatmaServisi.getAyarlar();
        expect(cuma).toEqual(ham(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI));
        expect(cuma.aktif).toBe(true);

        expect(await LocalKazaOneriServisi.ayarlariGetir()).toEqual({ farzSonrasiOner: varyant !== 'kildim' });
        expect((await LocalSadeGorunumServisi.getAyarlar()).aktif).toBe(varyant === 'sade');
    });

    it('ses varyanti: vakit bildirimi acik + sabah sesi uygulamanin okuma yolundan DEGISMEDEN gecer', async () => {
        const { LocalVakitBildirimServisi } = require('../../../data/local/LocalVakitBildirimServisi');
        const depo = ozellikTohumVerisi({ varyant: 'ses' });
        await yaz(depo);
        expect(depo[DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_SESLERI]).toBeDefined();
        expect(await LocalVakitBildirimServisi.getAyarlar()).toEqual(
            JSON.parse(depo[DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_AYARLARI])
        );
        expect(await LocalVakitBildirimServisi.getSesler()).toEqual(
            JSON.parse(depo[DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_SESLERI])
        );
    });

    it('esitleme varyanti: durum ve tercihler uygulamanin normalize yolundan DEGISMEDEN gecer', () => {
        const { esitlemeDurumunuNormalizeEt } = require('../../esitleme/esitlemeTipleri');
        const { esitlemeTercihleriniNormalizeEt } = require('../../esitleme/esitlemePolitikasi');
        const depo = ozellikTohumVerisi({ varyant: 'esitleme' });
        const durum = JSON.parse(depo[DEPOLAMA_ANAHTARLARI.ESITLEME_DURUMU]);
        const tercih = JSON.parse(depo[DEPOLAMA_ANAHTARLARI.ESITLEME_TERCIHLERI]);
        expect(esitlemeDurumunuNormalizeEt(durum)).toEqual(durum);
        expect(esitlemeTercihleriniNormalizeEt(tercih)).toEqual(tercih);
    });

    it('tema tercihi acikca yazilir', () => {
        expect(JSON.parse(ozellikTohumVerisi({ tema: 'koyu' }).tema_tercihleri).mod).toBe('koyu');
        expect(JSON.parse(ozellikTohumVerisi().tema_tercihleri).mod).toBe('acik');
        expect(() => ozellikTohumVerisi({ varyant: 'yok' })).toThrow();
    });

    describe('butce varyanti', () => {
        const ayar = JSON.parse(ozellikTohumVerisi({ varyant: 'butce' }).muhafiz_ayarlari);
        const matris = ayar.matris as MuhafizMatrisi;

        it('matris gecerli ve goc gerektirmez (yukleme onu degistirmez)', () => {
            expect(matrisGecerliMi(matris)).toBe(true);
            expect(muhafizMatrisiniCoz({ matris, yogunluk: ayar.yogunluk } as MatrisKaynagi)).toBe(matris);
            expect(ayar.sesliOnayi).toBe(true);
            // Alarm onay modali karesi rizanin YOKLUGUNA baglidir.
            expect(ayar.alarmOnayi).toBeUndefined();
        });

        it('her vakit tam pencerede ~59 uyari uretir (seyreltilmez)', () => {
            for (const vakit of MUHAFIZ_VAKITLERI) {
                const plan = vakitUyariPlaniOlustur(matris[vakit], Number.MAX_SAFE_INTEGER, { pencereUzunluguDk: 90 });
                expect(plan.length).toBeGreaterThanOrEqual(55);
            }
        });
    });
});

describe('ozellik turu tohumu — Camideyim (native SharedPreferences)', () => {
    const { camideyimNativeAyarlari, camideyimTercihXml } = require('../../../../scripts/ozellik-tohum-verisi');

    it('Camideyim ACIK tohumlanir ve uygulamanin normalize yolundan DEGISMEDEN gecer', () => {
        const ham = camideyimNativeAyarlari();
        expect(ham.aktif).toBe(true);
        expect(camideyimAyarlariniNormalize(ham)).toEqual(ham);
    });

    it('XML: CamiDepo dosya/anahtar adlari tutar ve kacislanmis JSON geri cozulur', () => {
        const kok = path.join(__dirname, '../../../..');
        const kt = fs.readFileSync(
            path.join(kok, 'modules/expo-cami-geofence/android/src/main/java/expo/modules/camigeofence/CamiDepo.kt'),
            'utf8'
        );
        expect(kt).toContain('private const val DOSYA = "namazakisi_cami"');
        expect(kt).toContain('private const val AYARLAR = "ayarlar"');
        expect(fs.readFileSync(path.join(kok, 'scripts/android-ozellik-hatti.sh'), 'utf8')).toContain('shared_prefs/namazakisi_cami.xml');
        const xml: string = camideyimTercihXml();
        const m = xml.match(/<string name="ayarlar">([^<]*)<\/string>/);
        expect(m).not.toBeNull();
        const cozulmus = m![1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        expect(JSON.parse(cozulmus)).toEqual(camideyimNativeAyarlari());
    });
});
