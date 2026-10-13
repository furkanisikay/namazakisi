/**
 * Bildirim defterinin DİSKTEN okunan girdileri + cihaz ölçümü (issue #298).
 *
 * Rehber ekranı muhafız ve nafile ayarlarını CANLI store'dan alır (kullanıcı o
 * ekranda onları değiştiriyor); geri kalan kaynaklar burada HAM depolamadan
 * okunur. Neden store değil: `vakitBildirim` slice'ı açılışta yüklenmez
 * (AGENTS.md hidrasyon dersi) — initialState'i gerçek veri saymak defteri
 * sessizce eksik sayardı.
 *
 * Asla fırlatmaz: okunamayan kaynak `null` döner, defter onu sıfır sayar.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { bugunuAl, dunuAl } from '../../core/utils/TarihYardimcisi';
import type { VakitAdi } from '../../core/types';
import type { DefterGirdisi } from '../../core/bildirim/bildirimDefteri';
import { LocalVakitBildirimServisi } from '../../data/local/LocalVakitBildirimServisi';
import { LocalCumaHatirlatmaServisi } from '../../data/local/LocalCumaHatirlatmaServisi';
import { LocalYatisHatirlatmaServisi } from '../../data/local/LocalYatisHatirlatmaServisi';
import { LocalCamiyeGitServisi } from '../../data/local/LocalCamiyeGitServisi';
import { localSeriAyarlariniGetir } from '../../data/local/LocalSeriServisi';
import { kilinanVakitleriAl } from '../../data/local/LocalNamazServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { LocalTakvimCakismaServisi } from '../../data/local/LocalTakvimCakismaServisi';
import { TAKVIM_CAKISMA_PLAN_GUN_SAYISI } from '../../core/bildirim/takvimCakismaPlani';
import { cakismaEtkinlikleriniOku, okumaAraligi } from './TakvimEtkinlikOkuyucu';

/** Defterin muhafız/nafile/konum DIŞINDAKİ girdileri. */
export type DefterDisGirdisi = Pick<
    DefterGirdisi,
    'vakitBildirimi' | 'cuma' | 'camiyeGit' | 'gunSonu' | 'yatis' | 'takvimCakisma' | 'kilinan' | 'ozelGundeMi'
>;

const guvenli = async <T>(ad: string, is: () => Promise<T>): Promise<T | null> => {
    try {
        return await is();
    } catch (e) {
        Logger.warn('BildirimDefteri', `${ad} okunamadi`, e);
        return null;
    }
};

export async function defterDisGirdisiniOku(): Promise<DefterDisGirdisi> {
    const bugun = bugunuAl();
    const dun = dunuAl();
    const [vakitBildirimi, cuma, camiyeGit, seri, kilinanBugun, kilinanDun, ozelGundeMi, yatis] = await Promise.all([
        guvenli('vakit bildirimi', () => LocalVakitBildirimServisi.getAyarlar()),
        guvenli('cuma', () => LocalCumaHatirlatmaServisi.getAyarlar()),
        guvenli('camiye git', () => LocalCamiyeGitServisi.getAyarlar()),
        guvenli('seri', async () => {
            const yanit = await localSeriAyarlariniGetir();
            return yanit.basarili && yanit.veri ? yanit.veri : null;
        }),
        guvenli('kilinan (bugun)', () => kilinanVakitleriAl(bugun)),
        guvenli('kilinan (dun)', () => kilinanVakitleriAl(dun)),
        guvenli('ozel gun', () => ozelGunSuzgeciniOku()),
        guvenli('yatis', () => LocalYatisHatirlatmaServisi.getAyarlar()),
    ]);
    // Takvim çakışması (issue #291): yalnız AÇIKKEN takvim okunur; servisle AYNI
    // okuyucu + süzgeç. İzin yoksa servis de hiçbir şey kurmaz → null.
    const takvimCakisma = await guvenli('takvim cakismasi', async () => {
        const ayarlar = await LocalTakvimCakismaServisi.getAyarlar();
        if (!ayarlar.aktif) return null;
        const simdi = new Date();
        const gunSayisi = TAKVIM_CAKISMA_PLAN_GUN_SAYISI[Platform.OS === 'ios' ? 'ios' : 'android'];
        const { baslangic, bitis } = okumaAraligi(simdi, gunSayisi);
        const okuma = await cakismaEtkinlikleriniOku(baslangic, bitis);
        return okuma.durum === 'tamam' ? { ayarlar, etkinlikler: okuma.etkinlikler } : null;
    });
    const kilinan: Record<string, readonly VakitAdi[]> = {
        [bugun]: kilinanBugun ?? [],
        [dun]: kilinanDun ?? [],
    };
    return {
        vakitBildirimi,
        cuma,
        camiyeGit,
        gunSonu: seri,
        yatis,
        takvimCakisma,
        kilinan,
        ozelGundeMi: ozelGundeMi ?? undefined,
    };
}

export interface BekleyenOlcumu {
    /** expo-notifications bekleyen tetikleri */
    bildirim: number;
    /** notifee bekleyen tetikleri (Android sayaçlar) */
    notifee: number;
    /** native sesli anons alarmları (Android) */
    anons: number;
    toplam: number;
}

/**
 * Cihazda ŞU AN bekleyenleri ölçer (Fable: "defter üç listeyi birleştirir").
 * Ekran sayıyı defterden gösterir; ölçüm yalnız TANI içindir — ikisi
 * ayrışırsa bir plan üreticisi servisinden kopmuş demektir ve loga yazılır.
 *
 * notifee ve native köprü TEMBEL yüklenir (AGENTS.md: Ayarlar'ı render eden
 * testler köprü mock'lamak zorunda kalmasın). `null` = ölçülemedi.
 */
export async function bekleyenleriOlc(): Promise<BekleyenOlcumu | null> {
    try {
        const bildirim = (await Notifications.getAllScheduledNotificationsAsync()).length;
        let notifeeSayisi = 0;
        let anons = 0;
        if (Platform.OS === 'android') {
            try {
                const notifee = (require('@notifee/react-native') as typeof import('@notifee/react-native')).default;
                notifeeSayisi = (await notifee.getTriggerNotificationIds()).length;
            } catch {
                notifeeSayisi = 0;
            }
            try {
                const kopru = require('../../../modules/expo-countdown-notification/src') as typeof import('../../../modules/expo-countdown-notification/src');
                anons = (await kopru.bekleyenAnonsSayisi()) ?? 0;
            } catch {
                anons = 0;
            }
        }
        return { bildirim, notifee: notifeeSayisi, anons, toplam: bildirim + notifeeSayisi + anons };
    } catch (e) {
        Logger.warn('BildirimDefteri', 'Bekleyen bildirimler olculemedi', e);
        return null;
    }
}
