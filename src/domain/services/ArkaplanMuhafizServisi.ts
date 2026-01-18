/**
 * Arka Plan Muhafiz Servisi
 * Uygulama kapali/arkaplanda olsa bile calisacak zamanlanmis bildirimler olusturur
 * 
 * Bu servis setInterval yerine Expo Notifications'in zamanlanmis bildirim
 * ozelligini kullanarak sistem seviyesinde bildirim gonderir.
 */

import * as Notifications from 'expo-notifications';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEYTANLA_MUCADELE_ICERIGI } from '../../core/data/SeytanlaMucadeleIcerigi';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { MUHAFIZ_KATEGORISI } from './BildirimServisi';

/**
 * Vakit tipi (Turkce)
 */
type VakitAdi = 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

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
 */
export interface ArkaplanMuhafizAyarlari {
    aktif: boolean;
    koordinatlar: {
        lat: number;
        lng: number;
    };
    esikler: {
        seviye1: number; // baslangic dk (orn: 45)
        seviye1Siklik: number; // siklik dk (orn: 15)
        seviye2: number; // baslangic dk (orn: 30)
        seviye2Siklik: number; // ciklik dk (orn: 10)
        seviye3: number; // baslangic dk (orn: 15)
        seviye3Siklik: number; // siklik dk (orn: 5)
        seviye4: number; // baslangic dk (orn: 5)
        seviye4Siklik: number; // siklik dk (orn: 1)
    };
}

/**
 * Bildirim ID onek sabitleri
 */
const BILDIRIM_ONEK = {
    MUHAFIZ: 'muhafiz_',
    VAKIT: '_vakit_',
    SEVIYE: '_seviye_',
    DAKIKA: '_dk_',
};

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

        console.log('[ArkaplanMuhafiz] Yapılandırma alındı:', JSON.stringify(ayarlar.esikler));

        // Once tum eski muhafiz bildirimlerini temizle
        await this.tumMuhafizBildirimleriniTemizle();

        // Ayarlar aktif degilse sadece temizle ve cik
        if (!ayarlar.aktif) {
            console.log('[ArkaplanMuhafiz] Muhafiz devre disi, bildirimler temizlendi');
            return;
        }

        // Bugunun vakit zamanlarini al
        const vakitler = this.bugunVakitleriniHesapla();
        const simdi = new Date();

        // Kilinmis vakitleri al (bugun VE dun icin - gece yarisi gecisleri)
        const kilinanVakitlerBugun = await this.tarihIcinKilinanVakitleriAl(this.bugunTarihiAl());
        const kilinanVakitlerDun = await this.tarihIcinKilinanVakitleriAl(this.dunTarihiAl());

        // Kolay erisim icin tarihe gore map olustur
        const kilinanVakitlerMap: Record<string, VakitAdi[]> = {
            [this.bugunTarihiAl()]: kilinanVakitlerBugun,
            [this.dunTarihiAl()]: kilinanVakitlerDun,
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
                console.log(`[ArkaplanMuhafiz] ${v.vakit} (${v.tarih}) zaten kilinmis, atlaniyor`);
                return false;
            }

            return true;
        });

        if (gelecekVakitler.length === 0) {
            console.log('[ArkaplanMuhafiz] Gelecek veya kilinmamis vakit bulunamadi');
            return;
        }

        for (const vakit of gelecekVakitler) {
            await this.vakitIcinBildirimPlanla(vakit);
        }

        console.log(`[ArkaplanMuhafiz] Toplam ${gelecekVakitler.length} vakit icin bildirimler planlandi`);
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
     * Belirli bir vakit icin tum seviye bildirimlerini planla
     * Ayni dakikaya dusen bildirimleri gruplayip sadece en yuksek seviyeli olani planlar
     */
    private async vakitIcinBildirimPlanla(vakit: VakitZamani): Promise<void> {
        if (!this.ayarlar) return;

        const simdi = new Date();
        const cikisSuresi = vakit.cikis.getTime();

        // Vakit zaten gecmisse planlamaya gerek yok
        if (cikisSuresi <= simdi.getTime()) {
            return;
        }

        const esikler = this.ayarlar.esikler;
        const dakikaGruplari: Map<number, { seviye: number, dakika: number, baslik: string }> = new Map();

        // En genis araliktan (Seviye 1) baslayarak en dar araliga (Seviye 4) kadar tum dakikalari tara
        // Maksimum kontrol edilecek dakika: Seviye 1 baslangic dakikasi
        const maxDakika = Math.max(esikler.seviye1, esikler.seviye2, esikler.seviye3, esikler.seviye4);

        // Vaktin cikmasina kac dakika kaldi? (Su andan itibaren)
        const suankiKalanDakika = Math.floor((cikisSuresi - simdi.getTime()) / (60 * 1000));

        // Kontrol edilecek baslangic noktasi: min(suankiKalanDk, maxDk)
        // Yani eger vakte 2 saat varsa, 2 saatten degil 45 dk'dan (maxDk) basla.
        // Eger vakte 10 dk varsa, 10 dk'dan basla.
        const baslangicDk = Math.min(suankiKalanDakika, maxDakika);

        // 1 dakikaya kadar geri say
        for (let k = baslangicDk; k > 0; k--) {
            let aktifSeviye = 0;
            let aktifBaslik = '';
            let aktifSiklik = 0;

            // Hangi seviye araligindayiz? (Kucukten buyuge kontrol et ki overwrite etsin)
            // Seviye 1
            if (k <= esikler.seviye1) {
                aktifSeviye = 1;
                aktifBaslik = '⏰ Namaz Hatırlatıcı';
                aktifSiklik = esikler.seviye1Siklik;
            }
            // Seviye 2
            if (k <= esikler.seviye2) {
                aktifSeviye = 2;
                aktifBaslik = '⚠️ Vakit Daralıyor';
                aktifSiklik = esikler.seviye2Siklik;
            }
            // Seviye 3
            if (k <= esikler.seviye3) {
                aktifSeviye = 3;
                aktifBaslik = '🔥 Şeytanla Mücadele!';
                aktifSiklik = esikler.seviye3Siklik;
            }
            // Seviye 4
            if (k <= esikler.seviye4) {
                aktifSeviye = 4;
                aktifBaslik = '🚨 VAKİT ÇIKIYOR!';
                aktifSiklik = esikler.seviye4Siklik;
            }

            // Eger bir seviye aktifse ve sıklık kuralına uyuyorsa
            // Tam esik degerindeyse VEYA (esik - k) % siklik == 0 ise
            // Ornek: Esik 45, Siklik 15. k=45 (0%15=0) OK, k=30 (15%15=0) OK, k=15 OK.
            if (aktifSeviye > 0) {
                // Her seviyenin kendi baslangicina gore goreceli mod aliyoruz ki
                // seviye gecislerinde (orn 30'da) mutlaka bildirim olsun.
                // Baslangic noktasinda (k == seviyeBaslangic) kesin bildirim at.
                // Digerlerinde modulus kontrol et.

                // İlgili seviyenin başlangıç dakikasını bul
                let seviyeBaslangic = 0;
                switch (aktifSeviye) {
                    case 1: seviyeBaslangic = esikler.seviye1; break;
                    case 2: seviyeBaslangic = esikler.seviye2; break;
                    case 3: seviyeBaslangic = esikler.seviye3; break;
                    case 4: seviyeBaslangic = esikler.seviye4; break;
                }

                const fark = seviyeBaslangic - k;

                // Fark negatif olamaz cunku yukarida if (k <= esikler...) kontrolu yaptik
                // Sıklık undefined/0 ise Infinity olur, mod NaN olur
                if (aktifSiklik > 0 && fark % aktifSiklik === 0) {
                    // Bu dakikaya bildirim ekle
                    // UTC zamani hesapla
                    const bildirimZamani = new Date(cikisSuresi - k * 60 * 1000);

                    // Zaten gecmisse ekleme
                    if (bildirimZamani.getTime() > simdi.getTime()) {
                        // Dakika bazinda map'e at (cakisma varsa ust seviye override eder mi? 
                        // Donguyu genisten dara yaptigimiz icin (yukarida if'ler override ediyor),
                        // su anki aktifSeviye zaten o dakika icin gecerli en yuksek seviye.
                        dakikaGruplari.set(k, {
                            seviye: aktifSeviye,
                            dakika: k,
                            baslik: aktifBaslik
                        });
                    } else {
                        // console.log(`[ArkaplanMuhafiz] Zaman geçmiş: ${k}dk`);
                    }
                }
            }
        }

        // Gruplanan bildirimleri planla
        for (const [kalanDk, veri] of dakikaGruplari) {
            const bildirimZamani = new Date(cikisSuresi - kalanDk * 60 * 1000);
            const mesaj = this.bildirimMesajiOlustur(vakit.vakit, veri.seviye, veri.dakika);
            // ID'ye dakikayi da ekleyelim ki uniqueness bozulmasin
            // Vakit tarihini kullan (yatsi icin onceki gun olabilir)
            const bildirimId = this.bildirimIdOlustur(vakit.vakit, veri.seviye, vakit.tarih) + BILDIRIM_ONEK.DAKIKA + kalanDk;

            await this.tekBildirimPlanla(
                bildirimId,
                veri.baslik,
                mesaj,
                bildirimZamani,
                veri.seviye,
                vakit.vakit,
                vakit.tarih
            );
        }

        console.log(`[ArkaplanMuhafiz] ${vakit.vakit} (${vakit.tarih}) icin ${dakikaGruplari.size} bildirim planlandi`);
    }

    /**
     * Tek bir bildirim planla
     * @param id Bildirim ID'si
     * @param baslik Bildirim basligi
     * @param mesaj Bildirim mesaji
     * @param zaman Bildirim zamani
     * @param seviye Bildirim seviyesi (1-4)
     * @param vakit Vakit adi (imsak, ogle, ikindi, aksam, yatsi)
     * @param tarih Vakit tarihi (YYYY-MM-DD)
     */
    private async tekBildirimPlanla(
        id: string,
        baslik: string,
        mesaj: string,
        zaman: Date,
        seviye: number,
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
                    priority: seviye >= 3
                        ? Notifications.AndroidNotificationPriority.MAX
                        : Notifications.AndroidNotificationPriority.HIGH,
                    categoryIdentifier: MUHAFIZ_KATEGORISI,
                    data: {
                        tip: 'muhafiz',
                        seviye: seviye,
                        vakit: vakit,
                        tarih: tarih,
                    },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: zaman,
                },
            });

            console.log(`[ArkaplanMuhafiz] Bildirim planlandi: ${id} - ${zaman.toLocaleTimeString()}`);
        } catch (error) {
            console.error(`[ArkaplanMuhafiz] Bildirim planlanamadi: ${id}`, error);
        }
    }

    /**
     * Bildirim mesaji olustur
     */
    private bildirimMesajiOlustur(vakit: VakitAdi, seviye: number, kalanDakika: number): string {
        const vakitAdlari: Record<VakitAdi, string> = {
            imsak: 'Sabah',
            gunes: 'Güneş',
            ogle: 'Öğle',
            ikindi: 'İkindi',
            aksam: 'Akşam',
            yatsi: 'Yatsı',
        };

        const vakitAdi = vakitAdlari[vakit];

        switch (seviye) {
            case 1:
                return `${vakitAdi} namazının vakti bitmesine ${kalanDakika} dakika kaldı.`;
            case 2:
                return `Vakit daralıyor! ${vakitAdi} namazını sona bırakma. (${kalanDakika} dk kaldı)`;
            case 3:
                // Seytanla mucadele icerigi
                const icerikler = SEYTANLA_MUCADELE_ICERIGI.filter(i => i.siddetSeviyesi === 3);
                if (icerikler.length > 0) {
                    const rastgele = Math.floor(Math.random() * icerikler.length);
                    return icerikler[rastgele].metin;
                }
                return `Şeytana uyma, ${vakitAdi} namazını kıl! (${kalanDakika} dk kaldı)`;
            case 4:
                return `VAKİT ÇIKIYOR! Hemen secdeye kapan! ${vakitAdi} namazına ${kalanDakika} dakika kaldı!`;
            default:
                return `${vakitAdi} namazına ${kalanDakika} dakika kaldı.`;
        }
    }

    /**
     * Bildirim ID'si olustur
     * @param vakit Vakit adi
     * @param seviye Bildirim seviyesi
     * @param tarih Vaktin ait oldugu tarih (YYYY-MM-DD)
     */
    private bildirimIdOlustur(vakit: VakitAdi, seviye: number, tarih: string): string {
        return `${BILDIRIM_ONEK.MUHAFIZ}${tarih}${BILDIRIM_ONEK.VAKIT}${vakit}${BILDIRIM_ONEK.SEVIYE}${seviye}`;
    }

    /**
     * Belirli bir vakit icin tum bildirimleri iptal et
     * (Namaz kilindigi zaman cagirilir)
     */
    public async vakitBildirimleriniIptalEt(vakit: VakitAdi): Promise<void> {
        // Hem bugun hem de dun icin iptal et (gece yarisi gecisleri icin)
        const bugun = this.bugunTarihiAl();
        const dun = this.dunTarihiAl();
        const tarihler = [bugun, dun];

        // Tum dakika ID'lerini de kapsayacak sekilde bildirimleri iptal et
        const tumBildirimler = await Notifications.getAllScheduledNotificationsAsync();

        for (const bildirim of tumBildirimler) {
            // Bu vakite ait muhafiz bildirimi mi kontrol et
            for (const tarih of tarihler) {
                const bildirimOneki = `${BILDIRIM_ONEK.MUHAFIZ}${tarih}${BILDIRIM_ONEK.VAKIT}${vakit}`;
                if (bildirim.identifier.startsWith(bildirimOneki)) {
                    try {
                        await Notifications.cancelScheduledNotificationAsync(bildirim.identifier);
                        console.log(`[ArkaplanMuhafiz] Bildirim iptal edildi: ${bildirim.identifier}`);
                    } catch (error) {
                        // Bildirim bulunamazsa hata verme
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
     */
    public async tumMuhafizBildirimleriniTemizle(): Promise<void> {
        try {
            const tumBildirimler = await Notifications.getAllScheduledNotificationsAsync();

            for (const bildirim of tumBildirimler) {
                if (bildirim.identifier.startsWith(BILDIRIM_ONEK.MUHAFIZ)) {
                    await Notifications.cancelScheduledNotificationAsync(bildirim.identifier);
                }
            }

            console.log('[ArkaplanMuhafiz] Tum muhafiz bildirimleri temizlendi');
        } catch (error) {
            console.error('[ArkaplanMuhafiz] Bildirimler temizlenirken hata:', error);
        }
    }

    // ============================================================
    // TARIH YARDIMCI METOTLARI
    // ============================================================

    /**
     * Bugunun tarih string'ini dondurur (YYYY-MM-DD)
     * @returns Bugunun tarihi
     */
    private bugunTarihiAl(): string {
        const bugun = new Date();
        const yil = bugun.getFullYear();
        const ay = String(bugun.getMonth() + 1).padStart(2, '0');
        const gun = String(bugun.getDate()).padStart(2, '0');
        return `${yil}-${ay}-${gun}`;
    }

    /**
     * Dunun tarih string'ini dondurur (YYYY-MM-DD)
     * @returns Dunun tarihi
     */
    private dunTarihiAl(): string {
        const dun = new Date();
        dun.setDate(dun.getDate() - 1);
        const yil = dun.getFullYear();
        const ay = String(dun.getMonth() + 1).padStart(2, '0');
        const gun = String(dun.getDate()).padStart(2, '0');
        return `${yil}-${ay}-${gun}`;
    }

    /**
     * Vakit icin dogru kayit tarihini belirler
     * Gece yarisi sonrasi (imsak oncesi) yatsi icin dunu dondurur
     * @param vakit Kontrol edilecek vakit
     * @param simdi Referans zaman
     * @returns Dogru tarih string'i
     */
    private vakitIcinDogruTarihiAl(vakit: VakitAdi, simdi: Date): string {
        if (!this.ayarlar) return this.bugunTarihiAl();

        // Yatsi vakti ve imsak oncesi mi?
        if (vakit === 'yatsi') {
            const { lat, lng } = this.ayarlar.koordinatlar;
            const coordinates = new Coordinates(lat, lng);
            const params = CalculationMethod.Turkey();
            const bugunPrayerTimes = new PrayerTimes(coordinates, simdi, params);

            // Eger su an imsak vaktinden onceyse, bu yatsi dune aittir
            if (simdi < bugunPrayerTimes.fajr) {
                return this.dunTarihiAl();
            }
        }

        return this.bugunTarihiAl();
    }

    // ============================================================
    // KILINAN VAKIT YONETIMI
    // ============================================================

    /**
     * Belirli bir tarih icin kilinan vakitleri al
     * @param tarih YYYY-MM-DD formatinda tarih
     * @returns Kilinan vakitler listesi
     */
    private async tarihIcinKilinanVakitleriAl(tarih: string): Promise<VakitAdi[]> {
        try {
            const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${tarih}`;
            const veri = await AsyncStorage.getItem(anahtar);
            return veri ? JSON.parse(veri) : [];
        } catch (error) {
            console.error('[ArkaplanMuhafiz] Kilinan vakitler alinamadi:', error);
            return [];
        }
    }

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

            console.log(`[ArkaplanMuhafiz] Vakit kaydedildi: ${vakit} (${tarih})`);
        } catch (error) {
            console.error('[ArkaplanMuhafiz] Kilinan vakit kaydedilemedi:', error);
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

            console.log(`[ArkaplanMuhafiz] Vakit kilindisi geri alindi: ${vakit} (${tarih})`);

            // Eger ayarlar varsa bildirimleri yeniden planla
            if (this.ayarlar) {
                await this.yapilandirVePlanla(this.ayarlar);
            }
        } catch (error) {
            console.error('[ArkaplanMuhafiz] Vakit kilindisi geri alinamadi:', error);
        }
    }

    /**
     * Bugun kilinan vakitleri al (geriye uyumluluk icin)
     * @returns Bugun kilinan vakitler listesi
     */
    public async bugunKilinanVakitleriAl(): Promise<VakitAdi[]> {
        return this.tarihIcinKilinanVakitleriAl(this.bugunTarihiAl());
    }

    /**
     * Planlanan bildirimleri listele (debug icin)
     */
    public async planlanmisBildirimleriListele(): Promise<void> {
        const bildirimler = await Notifications.getAllScheduledNotificationsAsync();
        console.log('[ArkaplanMuhafiz] Planlanan bildirimler:');

        for (const bildirim of bildirimler) {
            if (bildirim.identifier.startsWith(BILDIRIM_ONEK.MUHAFIZ)) {
                console.log(`  - ${bildirim.identifier}: ${bildirim.content.title}`);
            }
        }
    }
}
