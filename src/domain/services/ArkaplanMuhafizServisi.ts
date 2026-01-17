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

        // Cikis suresi henuz gecmemis (gelecekte olan) tum vakitler icin planlama yap
        // Sadece bir sonraki vakit degil, gunun geri kalani icin planlama yapiyoruz
        // Cunku background fetch her zaman calismayabilir
        const gelecekVakitler = vakitler.filter(v => v.cikis.getTime() > simdi.getTime());

        if (gelecekVakitler.length === 0) {
            console.log('[ArkaplanMuhafiz] Gelecek vakit bulunamadi');
            return;
        }

        for (const vakit of gelecekVakitler) {
            await this.vakitIcinBildirimPlanla(vakit);
        }

        console.log(`[ArkaplanMuhafiz] Toplam ${gelecekVakitler.length} vakit icin bildirimler planlandi`);
    }

    /**
     * Bugun icin tum namaz vakitlerini hesapla
     */
    private bugunVakitleriniHesapla(): VakitZamani[] {
        if (!this.ayarlar) return [];

        const { lat, lng } = this.ayarlar.koordinatlar;
        const coordinates = new Coordinates(lat, lng);
        const params = CalculationMethod.Turkey();
        const bugun = new Date();
        const prayerTimes = new PrayerTimes(coordinates, bugun, params);

        // Yarin icin de hesapla (gece yarisi gecisleri icin)
        const yarin = new Date();
        yarin.setDate(yarin.getDate() + 1);
        const yarinPrayerTimes = new PrayerTimes(coordinates, yarin, params);

        const vakitler: VakitZamani[] = [
            {
                vakit: 'imsak',
                giris: prayerTimes.fajr,
                cikis: prayerTimes.sunrise,
            },
            {
                vakit: 'ogle',
                giris: prayerTimes.dhuhr,
                cikis: prayerTimes.asr,
            },
            {
                vakit: 'ikindi',
                giris: prayerTimes.asr,
                cikis: prayerTimes.maghrib,
            },
            {
                vakit: 'aksam',
                giris: prayerTimes.maghrib,
                cikis: prayerTimes.isha,
            },
            {
                vakit: 'yatsi',
                giris: prayerTimes.isha,
                cikis: yarinPrayerTimes.fajr, // Yarinin imsak vaktine kadar
            },
        ];

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
            const bildirimId = this.bildirimIdOlustur(vakit.vakit, veri.seviye) + BILDIRIM_ONEK.DAKIKA + kalanDk;

            await this.tekBildirimPlanla(bildirimId, veri.baslik, mesaj, bildirimZamani, veri.seviye);
        }

        console.log(`[ArkaplanMuhafiz] ${vakit.vakit} icin ${dakikaGruplari.size} bildirim planlandi`);
    }

    /**
     * Tek bir bildirim planla
     */
    private async tekBildirimPlanla(
        id: string,
        baslik: string,
        mesaj: string,
        zaman: Date,
        seviye: number
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
                    data: {
                        tip: 'muhafiz',
                        seviye: seviye,
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
     */
    private bildirimIdOlustur(vakit: VakitAdi, seviye: number): string {
        const bugun = new Date().toISOString().split('T')[0];
        return `${BILDIRIM_ONEK.MUHAFIZ}${bugun}${BILDIRIM_ONEK.VAKIT}${vakit}${BILDIRIM_ONEK.SEVIYE}${seviye}`;
    }

    /**
     * Belirli bir vakit icin tum bildirimleri iptal et
     * (Namaz kilindigi zaman cagirilir)
     */
    public async vakitBildirimleriniIptalEt(vakit: VakitAdi): Promise<void> {
        const bugun = new Date().toISOString().split('T')[0];

        for (let seviye = 1; seviye <= 4; seviye++) {
            const bildirimId = `${BILDIRIM_ONEK.MUHAFIZ}${bugun}${BILDIRIM_ONEK.VAKIT}${vakit}${BILDIRIM_ONEK.SEVIYE}${seviye}`;
            try {
                await Notifications.cancelScheduledNotificationAsync(bildirimId);
                console.log(`[ArkaplanMuhafiz] Bildirim iptal edildi: ${bildirimId}`);
            } catch (error) {
                // Bildirim bulunamazsa hata verme
            }
        }

        // Iptal edilen vakti kaydet
        await this.kilinanVaktiKaydet(vakit);
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

    /**
     * Kilinan vakti async storage'a kaydet
     */
    private async kilinanVaktiKaydet(vakit: VakitAdi): Promise<void> {
        try {
            const bugun = new Date().toISOString().split('T')[0];
            const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${bugun}`;

            const mevcutVeri = await AsyncStorage.getItem(anahtar);
            const kilinanlar: string[] = mevcutVeri ? JSON.parse(mevcutVeri) : [];

            if (!kilinanlar.includes(vakit)) {
                kilinanlar.push(vakit);
                await AsyncStorage.setItem(anahtar, JSON.stringify(kilinanlar));
            }
        } catch (error) {
            console.error('[ArkaplanMuhafiz] Kilinan vakit kaydedilemedi:', error);
        }
    }

    /**
     * Bugun kilinan vakitleri al
     */
    public async bugunKilinanVakitleriAl(): Promise<VakitAdi[]> {
        try {
            const bugun = new Date().toISOString().split('T')[0];
            const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${bugun}`;

            const veri = await AsyncStorage.getItem(anahtar);
            return veri ? JSON.parse(veri) : [];
        } catch (error) {
            return [];
        }
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
