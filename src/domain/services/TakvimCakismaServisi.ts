/**
 * Takvim çakışması uyarısı (issue #291; ortak hatırlatma yüzeyleri plan §5.4) —
 * cuma/yatış/camiye-git desenleri.
 *
 * Plan SAF üreticiden gelir (`core/bildirim/takvimCakismaPlani.ts`); bildirim
 * defteri (issue #298) aynı listeyi sayar. Pencere sonludur (Android 7 / iOS 3
 * gün) ve takvim dışarıdan değişir → TAZELENMEK ZORUNDA. Çağıranlar:
 *   - `takvimCakismaSlice` ayar thunk'ı
 *   - `App.tsx` açılış zinciri
 *   - `KonumDegisikligiServisi.konumDegistiUygula` (vakitler şehirle kayar; özel
 *     gün değişimi de `OzelGunDegisikligiServisi` üzerinden buradan geçer)
 *   - `ArkaplanGorevServisi` 15 dk görevi (muhafız erken dönüşlerinden ÖNCE) —
 *     takvime sonradan eklenen toplantıyı yakalayan asıl yol budur
 *   - yedekten geri yükleme (`yedeklemeSlice`)
 *   - KILINMIŞLIK: `baslat` → `LocalNamazServisi` adlı yuva `takvimCakisma`;
 *     kılınan vaktin uyarıları (ilk tetik + `_<k>` tekrarları; bekleyen + gösterilen +
 *     sesli anons + gerçek alarm) TAKVİM OKUMADAN, kimlik KÖKÜYLE iptal edilir.
 *
 * TESLİM muhafızla AYNI katmandan, AYRI örnekle (`takvimCakismaTeslimcisiniAl`): kanal
 * çipleri, sesli anons, ses, titreşim, gerçek alarm aynı koddan. Kategori YOK (muhafızın
 * "Kıldım"ı FARZ yazardı), yük muhafız yükü değil, gerçek alarm BİLGİ türü (yalnız "Kapat").
 *
 * STORE'A BAĞLI DEĞİLDİR (arka planda Redux yok). Koordinat verilmezse ham
 * konum kaydından okunur. İzin burada İSTENMEZ: yoksa kurulu plan TEMİZLENİR
 * (kullanıcı izni geri aldıysa takvimden türeyen bildirim, anons ve alarm da kalmamalı).
 * Turlar SIRAYA dizilir (`surenPlanlama`): konum yayması ve açılış zinciri `Promise.all`
 * ile paralel tetikleyebilir; "temizle → planla" iç içe girerse yeni plan silinirdi.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BILDIRIM_SABITLERI, DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { bugunuAl, dunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import type { VakitAdi } from '../../core/types';
import {
    CAKISMA_VAKITLERI,
    TAKVIM_CAKISMA_ID_ONEKI,
    TAKVIM_CAKISMA_PLAN_GUN_SAYISI,
    takvimCakismaKimligi,
    takvimCakismaKimligiMi,
    takvimCakismaKokuneAitMi,
    takvimCakismaPlaniOlustur,
    type TakvimCakismaPlanKaydi,
} from '../../core/bildirim/takvimCakismaPlani';
import type { TakvimCakismaAyarlari } from '../../core/takvimCakisma/takvimCakismaAyarlari';
import { ANDROID_TAKVIM_CAKISMA_PAYI, IOS_ALARMKIT_TAKVIM_PAYI } from '../../core/bildirim/butceSabitleri';
import { onekSahipligi } from '../../core/muhafiz/teslimSahipligi';
import { LocalTakvimCakismaServisi } from '../../data/local/LocalTakvimCakismaServisi';
import {
    kayitDegistiDinleyicisiEkle,
    kilinanVakitleriAl,
    localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { cakismaEtkinlikleriniOku, okumaAraligi } from './TakvimEtkinlikOkuyucu';
import type { MuhafizTeslimcisi } from './MuhafizTeslimcisi';

export interface TakvimCakismaKoordinat {
    lat: number;
    lng: number;
}

const DINLEYICI_ADI = 'takvimCakisma';

const NAMAZDAN_VAKTE: Partial<Record<string, VakitAdi>> = {
    [NamazAdi.Sabah]: 'imsak',
    [NamazAdi.Ogle]: 'ogle',
    [NamazAdi.Ikindi]: 'ikindi',
    [NamazAdi.Aksam]: 'aksam',
    [NamazAdi.Yatsi]: 'yatsi',
};

const koordinatGecerli = (k: TakvimCakismaKoordinat | null | undefined): k is TakvimCakismaKoordinat =>
    !!k && Number.isFinite(k.lat) && Number.isFinite(k.lng) && !(k.lat === 0 && k.lng === 0);

/** Platforma göre plan ufku. */
export const takvimCakismaPlanGunSayisi = (): number =>
    Platform.OS === 'ios' ? TAKVIM_CAKISMA_PLAN_GUN_SAYISI.ios : TAKVIM_CAKISMA_PLAN_GUN_SAYISI.android;

/**
 * TAKVİM ÇAKIŞMASI TESLİMCİSİ — muhafızla AYNI teslim katmanı, AYRI örnek (plan §3.2; camiye
 * gitme deseni). Ayrı ÖRNEK şart: muhafızın tur başı bütçe sayacı ve iOS slot ölçümü bu turla
 * karışmamalı.
 * - Android: kanal hazırlığı KİMLİK (çöp toplama muhafızın işidir; kanalları
 *   `MuhafizKanalServisi.ekKanallariHazirla` oluşturur, `ekHatirlatmaKaynaklari` korur),
 *   önceki turun anons/alarmları yalnız `takvim_cakisma_` önekiyle silinir, pay
 *   `ANDROID_TAKVIM_CAKISMA_PAYI` (asıl kesme üreticide; teslimcideki sayaç emniyet ağı).
 * - iOS: bütçe ölçümü "kendi dışındaki" bekleyenleri sayar (ortak 64 defteri), anons sesi
 *   matrissiz hazırlanır, AlarmKit payı `IOS_ALARMKIT_TAKVIM_PAYI`.
 *
 * Seçim ENJEKTE EDİLEBİLİR (jest varsayılan platformu iOS'tur — AGENTS.md).
 */
let _teslimci: MuhafizTeslimcisi | null = null;

export function takvimCakismaTeslimcisiniAl(): MuhafizTeslimcisi {
    if (_teslimci) return _teslimci;
    if (Platform.OS === 'ios') {
        const { IosMuhafizTeslimcisi } =
            require('./IosMuhafizTeslimcisi') as typeof import('./IosMuhafizTeslimcisi');
        _teslimci = new IosMuhafizTeslimcisi({
            sahiplik: onekSahipligi(TAKVIM_CAKISMA_ID_ONEKI),
            matrissizAnons: true,
            alarmDestegi: true,
            alarmKitPayi: IOS_ALARMKIT_TAKVIM_PAYI,
        });
    } else {
        const { AndroidMuhafizTeslimcisi } =
            require('./AndroidMuhafizTeslimcisi') as typeof import('./AndroidMuhafizTeslimcisi');
        _teslimci = new AndroidMuhafizTeslimcisi({
            alarmButcesi: ANDROID_TAKVIM_CAKISMA_PAYI,
            kanalHazirligi: async (m) => m,
            sahiplik: onekSahipligi(TAKVIM_CAKISMA_ID_ONEKI),
            // Gerçek alarm STANDART yetenek; alarm KANALLARINI muhafız toplar.
            alarmDestegi: true,
            alarmKanalTemizligi: false,
        });
    }
    return _teslimci;
}

/** Test / özel senaryo: teslimciyi ayarla (`null` → platformdan yeniden türet). */
export function takvimCakismaTeslimcisiniAyarla(teslimci: MuhafizTeslimcisi | null): void {
    _teslimci = teslimci;
}

/** Native önekli anons iptali — tembel yüklenir (köprü grafiği testlere sızmasın). */
function anonslariOnekleIptalEt(onek: string): void {
    if (Platform.OS !== 'android') return;
    try {
        const { iptalEtOnekliAnonslar } =
            require('../../../modules/expo-countdown-notification/src') as typeof import('../../../modules/expo-countdown-notification/src');
        iptalEtOnekliAnonslar(onek);
    } catch (e) {
        Logger.error('TakvimCakisma', 'Anons alarmlari iptal edilemedi', e);
    }
}

/**
 * Dün ve bugünün kılınmış vakitleri: namaz kaydı ∪ muhafız kılınmışlığı
 * (yatış hatırlatmasıyla aynı birleşim). Daha ilerisi henüz kılınmış olamaz.
 */
export async function yakinKilinanlariOku(): Promise<Record<string, VakitAdi[]>> {
    const bugun = bugunuAl();
    const dun = dunuAl();
    const sonuc: Record<string, VakitAdi[]> = {};
    try {
        const yanit = await localTarihAraligindakiNamazlariGetir(dun, gunEkle(bugun, 1));
        for (const gun of yanit.veri ?? []) {
            sonuc[gun.tarih] = gun.namazlar
                .filter((n) => n.tamamlandi)
                .map((n) => NAMAZDAN_VAKTE[n.namazAdi])
                .filter((v): v is VakitAdi => !!v);
        }
    } catch (e) {
        Logger.warn('TakvimCakisma', 'Namaz kayitlari okunamadi', e);
    }
    for (const tarih of [dun, bugun]) {
        const muhafiz = await kilinanVakitleriAl(tarih).catch(() => [] as VakitAdi[]);
        sonuc[tarih] = [...new Set([...(sonuc[tarih] ?? []), ...muhafiz])];
    }
    return sonuc;
}

export class TakvimCakismaServisi {
    private static instance: TakvimCakismaServisi;
    /** Süren planlama — turlar SIRAYA dizilir (cuma servisiyle aynı gerekçe). */
    private surenPlanlama: Promise<void> | null = null;

    public static getInstance(): TakvimCakismaServisi {
        if (!TakvimCakismaServisi.instance) {
            TakvimCakismaServisi.instance = new TakvimCakismaServisi();
        }
        return TakvimCakismaServisi.instance;
    }

    /**
     * Kılınmışlık değişince o vaktin uyarılarını iptal et (idempotent — adlı yuva).
     * Takvim OKUNMAZ: kimlik kökü tarih + vakitten kurulur, iş ucuzdur.
     */
    public baslat(): void {
        kayitDegistiDinleyicisiEkle(DINLEYICI_ADI, () => {
            this.kilinanlarinUyarilariniIptalEt().catch(() => undefined);
        });
    }

    /**
     * Planı yeniler. ASLA fırlatmaz.
     * @param koordinat Verilmezse ham konum kaydından okunur.
     */
    public async hatirlatmalariGuncelle(
        koordinat?: TakvimCakismaKoordinat | null,
        simdi: Date = new Date()
    ): Promise<void> {
        const onceki = this.surenPlanlama ?? Promise.resolve();
        const bu = onceki
            .catch(() => { /* onceki turun hatasi bu turu dusurmez */ })
            .then(() => this.planlamayiCalistir(koordinat, simdi));
        this.surenPlanlama = bu;
        try {
            await bu;
        } catch (e) {
            Logger.error('TakvimCakisma', 'Planlama basarisiz', e);
        } finally {
            if (this.surenPlanlama === bu) this.surenPlanlama = null;
        }
    }

    private async planlamayiCalistir(
        verilenKoordinat: TakvimCakismaKoordinat | null | undefined,
        simdi: Date
    ): Promise<void> {
        // Özel sesler DOĞRULANIR (Android; cuma ile aynı gerekçe — kanal id paritesi).
        const ayarlar = await this.sesleriDogrula(await LocalTakvimCakismaServisi.getAyarlar());
        if (!ayarlar.aktif) {
            await this.tumunuTemizle();
            return;
        }
        const koordinat = verilenKoordinat === undefined ? await this.koordinatOku() : verilenKoordinat;
        // Konum geçici olarak okunamazsa KURULU planı koru (cuma deseni).
        if (!koordinatGecerli(koordinat)) {
            Logger.warn('TakvimCakisma', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        const gunSayisi = takvimCakismaPlanGunSayisi();
        const { baslangic, bitis } = okumaAraligi(simdi, gunSayisi);
        const okuma = await cakismaEtkinlikleriniOku(baslangic, bitis);
        if (okuma.durum === 'izinYok') {
            // İzin geri alındı: takvimden türemiş eski uyarılar (anons + alarm dahil) da gitmeli.
            Logger.warn('TakvimCakisma', 'Takvim izni yok, plan temizlendi');
            await this.tumunuTemizle();
            return;
        }
        if (okuma.durum === 'hata') {
            Logger.warn('TakvimCakisma', 'Takvim okunamadi, mevcut plan korunuyor');
            return;
        }

        // Kanallar planlamadan ÖNCE (Android 8+ var olmayan kanala gideni göstermez).
        await this.kanallariHazirla(ayarlar);

        const [kilinanlar, ozelGundeMi] = await Promise.all([yakinKilinanlariOku(), ozelGunSuzgeciniOku()]);
        const plan = takvimCakismaPlaniOlustur({
            koordinat,
            ayarlar,
            simdi,
            gunSayisi,
            etkinlikler: okuma.etkinlikler,
            kilinanlar: (gun) => kilinanlar[gun] ?? [],
            gunAtlanirMi: ozelGundeMi,
            ...(Platform.OS === 'ios' ? {} : { alarmButcesi: ANDROID_TAKVIM_CAKISMA_PAYI }),
        });

        await this.bekleyenleriTemizle();
        const teslimci = takvimCakismaTeslimcisiniAl();
        try {
            // Önceki turun gerçek alarmları (expo listesinde YOK) `takvim_cakisma_` önekiyle silinir.
            await teslimci.hazirla();
            // KRONOLOJİK sıra: iOS bütçesi sayaçla keser, ters sıra yakın uyarıları atardı.
            for (const kayit of plan) {
                await this.tekUyariPlanla(teslimci, kayit);
            }
        } finally {
            await teslimci.tamamla?.();
        }
    }

    /** Tek uyarıyı teslimciye verir. Biri patlarsa KALANLAR yine kurulur. */
    private async tekUyariPlanla(teslimci: MuhafizTeslimcisi, kayit: TakvimCakismaPlanKaydi): Promise<void> {
        try {
            await teslimci.uyariPlanla({
                id: kayit.id,
                baslik: kayit.baslik,
                mesaj: kayit.govde,
                zaman: kayit.zaman,
                // `anonsMetni` ÇÖZÜLMÜŞ ve ADSIZ cümledir (yer tutucu içermez).
                uyari: kayit.uyari,
                vakit: kayit.vakit,
                muhafizVakti: kayit.vakit,
                tarih: kayit.tarih,
                yon: 'cikisaDogru',
                // Uyarının anlamlı olduğu son an: gerçek alarm geç tetiklenirse çalmaz.
                cikis: kayit.cikis,
                ozel: {
                    // Etkinlik adı veriye YAZILMAZ (yalnız ayar açıksa bildirim metninde görünür).
                    veri: { tip: 'takvim_cakisma', vakit: kayit.vakit, tarih: kayit.tarih },
                    // Kategori YOK: muhafızın "Kıldım" düğmesi FARZ namazı yazardı.
                    kategori: null,
                    // Göçten gelen (varsayılan ses, titreşimsiz) adım bugünkü kanalda kalır.
                    varsayilanKanalId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                    varsayilanSistemSesi: true,
                    // Alarm ekranındaki ad — etkinlik adı DEĞİL (kilit ekranında görünür).
                    alarmAdi: 'Takvim',
                    alarmTuru: 'bilgi',
                },
            });
        } catch (e) {
            Logger.error('TakvimCakisma', `Bildirim planlanamadi: ${kayit.id}`, e);
        }
    }

    /**
     * Dün/bugün kılınmış vakitlerin bekleyen + gösterilen uyarılarını, sesli anonslarını ve
     * gerçek alarmlarını (ÇALAN dahil) kaldırır — kimlik KÖKÜYLE, tekrarlar da kapsanır.
     */
    public async kilinanlarinUyarilariniIptalEt(): Promise<void> {
        const kilinanlar = await yakinKilinanlariOku();
        const kokler: string[] = [];
        for (const [tarih, vakitler] of Object.entries(kilinanlar)) {
            for (const vakit of CAKISMA_VAKITLERI) {
                if (vakitler.includes(vakit)) kokler.push(takvimCakismaKimligi(tarih, vakit));
            }
        }
        if (kokler.length === 0) return;
        const kokeAit = (kimlik: string) => kokler.some((k) => takvimCakismaKokuneAitMi(kimlik, k));
        try {
            const tumu = await Notifications.getAllScheduledNotificationsAsync();
            for (const b of tumu) {
                if (kokeAit(b.identifier)) await Notifications.cancelScheduledNotificationAsync(b.identifier);
            }
        } catch (e) {
            Logger.warn('TakvimCakisma', 'Kilinan: bekleyenler iptal edilemedi', e);
        }
        try {
            const gosterilen = (await Notifications.getPresentedNotificationsAsync?.()) ?? [];
            for (const b of gosterilen) {
                const kimlik = b.request.identifier;
                if (kokeAit(kimlik)) await Notifications.dismissNotificationAsync(kimlik);
            }
        } catch (e) {
            Logger.warn('TakvimCakisma', 'Kilinan: gosterilen bildirimler kaldirilamadi', e);
        }
        const teslimci = takvimCakismaTeslimcisiniAl();
        for (const kok of kokler) {
            anonslariOnekleIptalEt(kok);
            // Gerçek alarmlar (#74): bekleyenler + o an ÇALAN alarm susar.
            try {
                teslimci.vakitYanKanallariniIptalEt?.(kok);
            } catch (e) {
                Logger.warn('TakvimCakisma', 'Kilinan: alarmlar susturulamadi', e);
            }
        }
    }

    /** Bekleyen bildirimler + Android anons alarmları (yalnız `takvim_cakisma_` önekli). */
    private async bekleyenleriTemizle(): Promise<void> {
        try {
            const tumu = await Notifications.getAllScheduledNotificationsAsync();
            for (const b of tumu) {
                if (takvimCakismaKimligiMi(b.identifier)) {
                    await Notifications.cancelScheduledNotificationAsync(b.identifier);
                }
            }
        } catch (e) {
            Logger.error('TakvimCakisma', 'Temizlik hatasi', e);
        }
        anonslariOnekleIptalEt(TAKVIM_CAKISMA_ID_ONEKI);
    }

    /** Kapalı / izinsiz: bekleyenler + anonslar + önceki turun gerçek alarmları. */
    private async tumunuTemizle(): Promise<void> {
        await this.bekleyenleriTemizle();
        const teslimci = takvimCakismaTeslimcisiniAl();
        try {
            await teslimci.hazirla();
        } catch (e) {
            Logger.warn('TakvimCakisma', 'Alarmlar temizlenemedi', e);
        } finally {
            await teslimci.tamamla?.();
        }
    }

    /** `MuhafizKanalServisi.adimSesleriniDogrula` — tembel (köprü grafiği testlere sızmasın). */
    private async sesleriDogrula(ayarlar: TakvimCakismaAyarlari): Promise<TakvimCakismaAyarlari> {
        if (Platform.OS !== 'android') return ayarlar;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            return await MuhafizKanalServisi.adimSesleriniDogrula(ayarlar);
        } catch (e) {
            Logger.error('TakvimCakisma', 'Sesler dogrulanamadi', e);
            return ayarlar;
        }
    }

    /** Ortak muhafız kanal uzayındaki kanalları oluşturur (çöp toplamaz). */
    private async kanallariHazirla(ayarlar: TakvimCakismaAyarlari): Promise<void> {
        if (Platform.OS !== 'android') return;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            await MuhafizKanalServisi.ekKanallariHazirla([{ yon: 'cikisaDogru', seviyeler: ayarlar.adimlar }]);
        } catch (e) {
            Logger.error('TakvimCakisma', 'Kanallar hazirlanamadi', e);
        }
    }

    private async koordinatOku(): Promise<TakvimCakismaKoordinat | null> {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
            if (!ham) return null;
            const k = JSON.parse(ham) as { koordinatlar?: TakvimCakismaKoordinat };
            return koordinatGecerli(k?.koordinatlar) ? k.koordinatlar : null;
        } catch {
            return null;
        }
    }

    /** Yalnız testler için. */
    public __testIcinSifirla(): void {
        this.surenPlanlama = null;
    }
}
