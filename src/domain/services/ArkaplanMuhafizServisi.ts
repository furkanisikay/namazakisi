/**
 * Arka Plan Muhafiz Servisi
 * Uygulama kapali/arkaplanda olsa bile calisacak zamanlanmis bildirimler olusturur
 * 
 * Bu servis setInterval yerine Expo Notifications'in zamanlanmis bildirim
 * ozelligini kullanarak sistem seviyesinde bildirim gonderir.
 */

import * as Notifications from 'expo-notifications';
import { bugunuAl, dunuAl } from '../../core/utils/TarihYardimcisi';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uygunIcerikleriBul, icerikMetniOlustur } from '../../core/data/SeytanlaMucadeleIcerigi';
import { DEPOLAMA_ANAHTARLARI, BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { VakitAdi } from '../../core/types';
import { kilinanVakitleriAl } from '../../data/local/LocalNamazServisi';
import { basligiOlustur, bildirimGovdesiOlustur, type MuhafizSeviye } from '../../core/utils/muhafizMetinYardimcisi';
import type { MuhafizMatrisi, MuhafizVakti } from '../../core/muhafiz/matrisTipleri';
import { vakitUyariPlaniOlustur, muhafizKanaliSec, type UyariPlani } from '../../core/muhafiz/motorAdaptoru';
import { anonsMetniniCoz } from '../../core/muhafiz/anonsMetni';
import { muhafizBildirimIdOlustur } from '../../core/muhafiz/anonsKimligi';
import {
    planlaAnons,
    iptalEtAnons,
    iptalEtTumAnonslar,
} from '../../../modules/expo-countdown-notification/src';
import { MuhafizKanalServisi } from './MuhafizKanalServisi';

/**
 * Namaz vakti bilgisi
 */
interface VakitZamani {
    vakit: VakitAdi;
    giris: Date;
    cikis: Date;
    tarih: string; // YYYY-MM-DD formatinda vakit gunu (yatsi icin onceki gun olabilir)
}

/**
 * Muhafiz ayarlari arayuzu
 *
 * Faz 3: global `esikler`/`sikliklar` yerine vakit x seviye MATRISI okunur.
 * Cagiran taraf matrisi `muhafizMatrisiniCoz(state.muhafiz)` ile uretir
 * (matris yoksa/bozuksa eski alanlardan turetilir).
 */
export interface ArkaplanMuhafizAyarlari {
    aktif: boolean;
    koordinatlar: {
        lat: number;
        lng: number;
    };
    /** Her vaktin kendi 4 seviyesi (esik/siklik/mod/ses/anons) */
    matris: MuhafizMatrisi;
}

/**
 * Arka plan muhafiz servisini yoneten sinif
 * Singleton pattern kullanir
 */
export class ArkaplanMuhafizServisi {
    private static instance: ArkaplanMuhafizServisi;
    private ayarlar: ArkaplanMuhafizAyarlari | null = null;

    private constructor() { }

    /**
     * Singleton instance'i dondur
     */
    public static getInstance(): ArkaplanMuhafizServisi {
        if (!ArkaplanMuhafizServisi.instance) {
            ArkaplanMuhafizServisi.instance = new ArkaplanMuhafizServisi();
        }
        return ArkaplanMuhafizServisi.instance;
    }

    /**
     * Servisi yapilandir ve bildirimleri planla
     * @param ayarlar Muhafiz ayarlari
     */
    public async yapilandirVePlanla(ayarlar: ArkaplanMuhafizAyarlari): Promise<void> {
        this.ayarlar = ayarlar;

        Logger.info('ArkaplanMuhafiz', `Muhafiz yapilandiriliyor (aktif: ${ayarlar.aktif})`);

        // Once tum eski muhafiz bildirimlerini temizle
        await this.tumMuhafizBildirimleriniTemizle();

        // Ayarlar aktif degilse sadece temizle ve cik
        if (!ayarlar.aktif) {
            Logger.info('ArkaplanMuhafiz', 'Muhafiz devre disi, bildirimler temizlendi');
            return;
        }

        // Kanal id'leri artik SESIN fonksiyonu (bkz. core/muhafiz/sesKimligi.ts) →
        // planlamadan ONCE gerekli kanallar olusturulmali; var olmayan bir kanala
        // gonderilen bildirim Android 8+'ta hic gosterilmez. Ayni cagri oksuz
        // kalmis eski kanallari da toplar.
        MuhafizKanalServisi.hazirla(ayarlar.matris);

        // Bugunun vakit zamanlarini al
        const vakitler = this.bugunVakitleriniHesapla();
        const simdi = new Date();

        // Kilinmis vakitleri al (bugun VE dun icin - gece yarisi gecisleri)
        const kilinanVakitlerBugun = await kilinanVakitleriAl(bugunuAl());
        const kilinanVakitlerDun = await kilinanVakitleriAl(dunuAl());

        // Kolay erisim icin tarihe gore map olustur
        const kilinanVakitlerMap: Record<string, VakitAdi[]> = {
            [bugunuAl()]: kilinanVakitlerBugun,
            [dunuAl()]: kilinanVakitlerDun,
        };

        // Cikis suresi henuz gecmemis (gelecekte olan) VE kilinmamis vakitler icin planlama yap
        const gelecekVakitler = vakitler.filter(v => {
            // Vakit zamani gecmis mi?
            if (v.cikis.getTime() <= simdi.getTime()) {
                return false;
            }

            // Bu vakit kilinmis mi? (vaktin ait oldugu tarihe gore kontrol et)
            const tarihinKilinanVakitleri = kilinanVakitlerMap[v.tarih] || [];
            if (tarihinKilinanVakitleri.includes(v.vakit)) {

                return false;
            }

            return true;
        });

        if (gelecekVakitler.length === 0) {
            Logger.info('ArkaplanMuhafiz', 'Gelecek veya kilinmamis vakit bulunamadi');
            return;
        }

        for (const vakit of gelecekVakitler) {
            await this.vakitIcinBildirimPlanla(vakit);
        }

        Logger.info('ArkaplanMuhafiz', `Toplam ${gelecekVakitler.length} vakit icin bildirimler planlandi`);
    }

    /**
     * Bugun icin tum namaz vakitlerini hesapla
     * Gece yarisi gecislerini dogru sekilde ele alir
     */
    private bugunVakitleriniHesapla(): VakitZamani[] {
        if (!this.ayarlar) return [];

        const { lat, lng } = this.ayarlar.koordinatlar;
        const coordinates = new Coordinates(lat, lng);
        const params = CalculationMethod.Turkey();
        const simdi = new Date();

        // Bugun ve dun icin hesapla (gece yarisi gecisleri icin)
        const bugunTarih = new Date(simdi);
        const dunTarih = new Date(simdi);
        dunTarih.setDate(dunTarih.getDate() - 1);
        const yarinTarih = new Date(simdi);
        yarinTarih.setDate(yarinTarih.getDate() + 1);

        const bugunPrayerTimes = new PrayerTimes(coordinates, bugunTarih, params);
        const dunPrayerTimes = new PrayerTimes(coordinates, dunTarih, params);
        const yarinPrayerTimes = new PrayerTimes(coordinates, yarinTarih, params);

        // Tarih formatla - yerel saat dilimine gore (UTC degil!)
        const formatDate = (d: Date) => {
            const yil = d.getFullYear();
            const ay = String(d.getMonth() + 1).padStart(2, '0');
            const gun = String(d.getDate()).padStart(2, '0');
            return `${yil}-${ay}-${gun}`;
        };
        const bugunStr = formatDate(bugunTarih);
        const dunStr = formatDate(dunTarih);

        const vakitler: VakitZamani[] = [];

        // Eger su an imsak vaktinden onceyse, dunun yatsi vakti hala aktiftir
        if (simdi < bugunPrayerTimes.fajr) {
            // Dunun yatsisi hala devam ediyor (gece yarisi gecmis ama imsak olmamis)
            vakitler.push({
                vakit: 'yatsi',
                giris: dunPrayerTimes.isha,
                cikis: bugunPrayerTimes.fajr,
                tarih: dunStr, // Dune ait!
            });
        }

        // Bugunun vakitleri
        vakitler.push(
            {
                vakit: 'imsak',
                giris: bugunPrayerTimes.fajr,
                cikis: bugunPrayerTimes.sunrise,
                tarih: bugunStr,
            },
            {
                vakit: 'ogle',
                giris: bugunPrayerTimes.dhuhr,
                cikis: bugunPrayerTimes.asr,
                tarih: bugunStr,
            },
            {
                vakit: 'ikindi',
                giris: bugunPrayerTimes.asr,
                cikis: bugunPrayerTimes.maghrib,
                tarih: bugunStr,
            },
            {
                vakit: 'aksam',
                giris: bugunPrayerTimes.maghrib,
                cikis: bugunPrayerTimes.isha,
                tarih: bugunStr,
            },
            {
                vakit: 'yatsi',
                giris: bugunPrayerTimes.isha,
                cikis: yarinPrayerTimes.fajr, // Yarinin imsak vaktine kadar
                tarih: bugunStr,
            }
        );

        return vakitler;
    }

    /**
     * Belirli bir vakit icin tum seviye bildirimlerini planla.
     *
     * Faz 3: dakika taramasi + seviye/siklik karari SAF `vakitUyariPlaniOlustur`
     * icinde (o vaktin kendi matris satiri okunur). Sessiz (mod='sessiz') seviye
     * pencere saglamaz -> hic planlanmaz; ayni dakikaya birden cok seviye dusemez
     * (en acil kazanir) -> cakisma dogal olarak tekildir.
     */
    private async vakitIcinBildirimPlanla(vakit: VakitZamani): Promise<void> {
        if (!this.ayarlar) return;

        const simdi = new Date();
        const cikisSuresi = vakit.cikis.getTime();

        // Vakit zaten gecmisse planlamaya gerek yok
        if (cikisSuresi <= simdi.getTime()) {
            return;
        }

        // 'gunes' muhafizda planlanmaz -> matriste satiri yoktur.
        const muhafizVakti = vakit.vakit as MuhafizVakti;
        const vakitAyari = this.ayarlar.matris[muhafizVakti];
        if (!vakitAyari) return;

        // Vaktin cikmasina kac dakika kaldi? (Su andan itibaren)
        const suankiKalanDakika = Math.floor((cikisSuresi - simdi.getTime()) / (60 * 1000));
        const plan = vakitUyariPlaniOlustur(vakitAyari, suankiKalanDakika);

        let planlanan = 0;
        for (const uyari of plan) {
            const bildirimZamani = new Date(cikisSuresi - uyari.kalanDk * 60 * 1000);
            // Zaten gecmisse atla (dakika yuvarlamasi sinirda geriye dusebilir)
            if (bildirimZamani.getTime() <= simdi.getTime()) continue;

            const seviye = uyari.seviye as MuhafizSeviye;
            const baslik = basligiOlustur(vakit.vakit, seviye, uyari.kalanDk);
            const mesaj = this.bildirimMesajiOlustur(vakit.vakit, seviye);
            // ID'ye dakikayi da ekleyelim ki uniqueness bozulmasin
            // Vakit tarihini kullan (yatsi icin onceki gun olabilir).
            // ID uretimi PAYLASILAN yardimciya devredildi — on plan (NamazMuhafiziServisi)
            // ayni anonsu ayni id ile yeniden planlar; format sapmasi cift konusma
            // uretir (bkz. core/muhafiz/anonsKimligi.ts).
            const bildirimId = muhafizBildirimIdOlustur(vakit.vakit, uyari.seviye, vakit.tarih, uyari.kalanDk);

            await this.tekBildirimPlanla(
                bildirimId,
                baslik,
                mesaj,
                bildirimZamani,
                uyari,
                vakit.vakit,
                vakit.tarih
            );
            // Faz 4: mod 'sesli'/'ikisi' ise ayni ana bir de TTS anonsu planla.
            // Anons id = bildirim id -> iptal zinciri simetrik kalir.
            this.anonsPlanla(bildirimId, bildirimZamani, uyari, muhafizVakti);
            planlanan++;
        }

        Logger.info('ArkaplanMuhafiz', `${vakit.vakit} (${vakit.tarih}) icin ${planlanan} bildirim planlandi`);
    }

    /**
     * Tek bir bildirim planla
     * @param id Bildirim ID'si
     * @param baslik Bildirim basligi
     * @param mesaj Bildirim mesaji
     * @param zaman Bildirim zamani
     * @param uyari Matristen turetilen uyari (seviye/mod/ses/anons)
     * @param vakit Vakit adi (imsak, ogle, ikindi, aksam, yatsi)
     * @param tarih Vakit tarihi (YYYY-MM-DD)
     */
    private async tekBildirimPlanla(
        id: string,
        baslik: string,
        mesaj: string,
        zaman: Date,
        uyari: UyariPlani,
        vakit: VakitAdi,
        tarih: string
    ): Promise<void> {
        try {
            // Zamanin gecerli oldugundan emin ol
            const simdi = new Date();
            if (zaman.getTime() <= simdi.getTime()) {
                return;
            }

            await Notifications.scheduleNotificationAsync({
                identifier: id,
                content: {
                    title: baslik,
                    body: mesaj,
                    sound: true,
                    priority: uyari.seviye >= 3
                        ? Notifications.AndroidNotificationPriority.MAX
                        : Notifications.AndroidNotificationPriority.HIGH,
                    categoryIdentifier: BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ,
                    data: {
                        tip: 'muhafiz',
                        seviye: uyari.seviye,
                        vakit: vakit,
                        tarih: tarih,
                        // Faz 4 kancasi: TTS bayragi + anons metni + secilen ses veriye tasinir.
                        // (Sesli anonsu native FGS Faz 4'te bu alanlardan okuyacak.)
                        mod: uyari.mod,
                        bildirimSesi: uyari.bildirimSesi,
                        sesliAnons: uyari.sesliAnons,
                        anonsMetni: uyari.anonsMetni,
                    },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: zaman,
                    // Android: ses KANAL ozelligidir → kanal id hucrenin sectigi
                    // sesten TURETILIR (`muhafizKanaliSec`). Aciliyet ayri alandan
                    // (`acilKanal`) gelir; ses artik onem tasimaz.
                    channelId: muhafizKanaliSec(uyari.seviye, uyari.bildirimSesi, uyari.acilKanal),
                },
            });


        } catch (error) {
            Logger.error('ArkaplanMuhafiz', `Bildirim planlanamadi: ${id}`, error);
        }
    }

    /**
     * Sesli anons (native TTS) planla — yalniz mod 'sesli' | 'ikisi' iken.
     *
     * Native taraf Foreground Service KULLANMAZ: exact alarm -> BroadcastReceiver
     * -> `goAsync()` penceresinde konusma. Metin BURADA cozulur ({vakit}/{süre}),
     * native'e hazir cumle gider.
     *
     * Anons kimligi bildirim kimligiyle AYNIdir; boylece bildirim iptal edilirken
     * anons da ayni id ile iptal edilir (bkz. vakitBildirimleriniIptalEt).
     * Native cagri asla planlamayi durdurmamali -> hata yutulup loglanir.
     */
    private anonsPlanla(
        id: string,
        zaman: Date,
        uyari: UyariPlani,
        vakit: MuhafizVakti
    ): void {
        if (!uyari.sesliAnons) return;
        if (!uyari.anonsMetni || uyari.anonsMetni.trim().length === 0) return;

        try {
            const metin = anonsMetniniCoz(uyari.anonsMetni, vakit, uyari.kalanDk);
            planlaAnons(id, zaman.getTime(), metin);
        } catch (error) {
            Logger.error('ArkaplanMuhafiz', `Sesli anons planlanamadi: ${id}`, error);
        }
    }

    /**
     * Bildirim govdesi.
     * Vakit adi ve kalan sure ALMAZ -> ikisi de baslikta (bkz. basligiOlustur).
     *
     * Govde mucadele havuzundan gelir; havuz VAKTE gore filtrelenir (vakte ozgu
     * nass yanlis vakitte cikmasin). Havuzda o (vakit, seviye) icin hicbir sey
     * yoksa yedek metne duser -> govde asla bos kalmaz.
     * Nass ise kunye de eklenir (icerikMetniOlustur).
     */
    private bildirimMesajiOlustur(vakit: VakitAdi, seviye: MuhafizSeviye): string {
        const icerikler = uygunIcerikleriBul(vakit, seviye);
        if (icerikler.length > 0) {
            const rastgele = Math.floor(Math.random() * icerikler.length);
            return icerikMetniOlustur(icerikler[rastgele]);
        }
        return bildirimGovdesiOlustur(seviye);
    }

    /**
     * Belirli bir vakit icin tum bildirimleri iptal et
     * (Namaz kilindigi zaman cagirilir)
     */
    public async vakitBildirimleriniIptalEt(vakit: VakitAdi): Promise<void> {
        // Hem bugun hem de dun icin iptal et (gece yarisi gecisleri icin)
        const bugun = bugunuAl();
        const dun = dunuAl();
        const tarihler = [bugun, dun];

        // Tum dakika ID'lerini de kapsayacak sekilde bildirimleri iptal et
        const tumBildirimler = await Notifications.getAllScheduledNotificationsAsync();

        for (const bildirim of tumBildirimler) {
            // Bu vakite ait muhafiz bildirimi mi kontrol et
            for (const tarih of tarihler) {
                const bildirimOneki = `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${tarih}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}`;
                if (bildirim.identifier.startsWith(bildirimOneki)) {
                    try {
                        await Notifications.cancelScheduledNotificationAsync(bildirim.identifier);

                    } catch {
                        // Bildirim bulunamazsa hata verme
                    }
                    // Bildirimle AYNI id ile planlanan sesli anonsu da iptal et.
                    // (Anonsu olmayan id icin native tarafta no-op.)
                    try {
                        iptalEtAnons(bildirim.identifier);
                    } catch {
                        // Native yoksa/hata verirse bildirim iptali yine de gecerli
                    }
                }
            }
        }

        // Iptal edilen vakti dogru tarihe kaydet
        const now = new Date();
        const kayitTarihi = this.vakitIcinDogruTarihiAl(vakit, now);
        await this.kilinanVaktiKaydetTarihli(vakit, kayitTarihi);
    }

    /**
     * Tum muhafiz bildirimlerini temizle
     *
     * Sesli anonslar AYRI bir alarm zinciridir (expo-notifications listesinde
     * gorunmezler) -> native tarafin kendi kayit defterinden topluca iptal edilir.
     * Muhafiz disinda anons kullanan yok; "tumunu iptal" burada dogru kapsamdir.
     */
    public async tumMuhafizBildirimleriniTemizle(): Promise<void> {
        try {
            iptalEtTumAnonslar();
        } catch (error) {
            Logger.error('ArkaplanMuhafiz', 'Sesli anonslar temizlenemedi:', error);
        }

        try {
            const tumBildirimler = await Notifications.getAllScheduledNotificationsAsync();

            for (const bildirim of tumBildirimler) {
                if (bildirim.identifier.startsWith(BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ)) {
                    await Notifications.cancelScheduledNotificationAsync(bildirim.identifier);
                }
            }

            Logger.info('ArkaplanMuhafiz', 'Tum muhafiz bildirimleri temizlendi');
        } catch (error) {
            Logger.error('ArkaplanMuhafiz', 'Bildirimler temizlenirken hata:', error);
        }
    }

    // ============================================================
    // TARIH YARDIMCI METOTLARI
    // ============================================================

    /**
     * Vakit icin dogru kayit tarihini belirler
     * Gece yarisi sonrasi (imsak oncesi) yatsi icin dunu dondurur
     * @param vakit Kontrol edilecek vakit
     * @param simdi Referans zaman
     * @returns Dogru tarih string'i
     */
    private vakitIcinDogruTarihiAl(vakit: VakitAdi, simdi: Date): string {
        if (!this.ayarlar) return bugunuAl();

        // Yatsi vakti ve imsak oncesi mi?
        if (vakit === 'yatsi') {
            const { lat, lng } = this.ayarlar.koordinatlar;
            const coordinates = new Coordinates(lat, lng);
            const params = CalculationMethod.Turkey();
            const bugunPrayerTimes = new PrayerTimes(coordinates, simdi, params);

            // Eger su an imsak vaktinden onceyse, bu yatsi dune aittir
            if (simdi < bugunPrayerTimes.fajr) {
                return dunuAl();
            }
        }

        return bugunuAl();
    }

    // ============================================================
    // KILINAN VAKIT YONETIMI
    // ============================================================

    /**
     * Kilinan vakti belirtilen tarihe kaydet
     * @param vakit Kaydedilecek vakit
     * @param tarih Kayit tarihi (YYYY-MM-DD)
     */
    private async kilinanVaktiKaydetTarihli(vakit: VakitAdi, tarih: string): Promise<void> {
        try {
            const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${tarih}`;

            const mevcutVeri = await AsyncStorage.getItem(anahtar);
            const kilinanlar: string[] = mevcutVeri ? JSON.parse(mevcutVeri) : [];

            if (!kilinanlar.includes(vakit)) {
                kilinanlar.push(vakit);
                await AsyncStorage.setItem(anahtar, JSON.stringify(kilinanlar));
            }

            Logger.info('ArkaplanMuhafiz', `Vakit kaydedildi: ${vakit} (${tarih})`);
        } catch (error) {
            Logger.error('ArkaplanMuhafiz', 'Kilinan vakit kaydedilemedi:', error);
        }
    }

    /**
     * Kilinan vakti listeden kaldir ve bildirimleri yeniden planla
     * Kullanici "kilmadim" sectiginde cagrilir
     * @param vakit Kaldirilacak vakit
     */
    public async vakitKilindisiniGeriAl(vakit: VakitAdi): Promise<void> {
        // Dogru tarihi bul
        const now = new Date();
        const tarih = this.vakitIcinDogruTarihiAl(vakit, now);

        try {
            const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${tarih}`;

            const mevcutVeri = await AsyncStorage.getItem(anahtar);
            const kilinanlar: string[] = mevcutVeri ? JSON.parse(mevcutVeri) : [];

            // Vakti listeden kaldir
            const yeniListe = kilinanlar.filter(v => v !== vakit);
            await AsyncStorage.setItem(anahtar, JSON.stringify(yeniListe));

            Logger.info('ArkaplanMuhafiz', `Vakit kilindisi geri alindi: ${vakit} (${tarih})`);

            // Eger ayarlar varsa bildirimleri yeniden planla
            if (this.ayarlar) {
                await this.yapilandirVePlanla(this.ayarlar);
            }
        } catch (error) {
            Logger.error('ArkaplanMuhafiz', 'Vakit kilindisi geri alinamadi:', error);
        }
    }

    /**
     * Bugun kilinan vakitleri al (geriye uyumluluk icin)
     * @returns Bugun kilinan vakitler listesi
     */
    public async bugunKilinanVakitleriAl(): Promise<VakitAdi[]> {
        return kilinanVakitleriAl(bugunuAl());
    }

    /**
     * Planlanan bildirimleri listele (debug icin)
     */
    public async planlanmisBildirimleriListele(): Promise<void> {
        const bildirimler = await Notifications.getAllScheduledNotificationsAsync();
        const muhafizBildirimleri = bildirimler.filter(b => b.identifier.startsWith(BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ));
        Logger.info('ArkaplanMuhafiz', `Planlanan muhafiz bildirimleri: ${muhafizBildirimleri.length} adet`);

        for (const bildirim of muhafizBildirimleri) {
            Logger.debug('ArkaplanMuhafiz', `  - ${bildirim.identifier}: ${bildirim.content.title}`);
        }
    }
}
