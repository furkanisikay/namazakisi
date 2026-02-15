import { NamazVaktiHesaplayiciServisi } from './NamazVaktiHesaplayiciServisi';
import { SEYTANLA_MUCADELE_ICERIGI, MucadeleIcerigi } from '../../core/data/SeytanlaMucadeleIcerigi';

export interface MuhafizYapilandirmasi {
    seviye1BaslangicDk: number; // Örn: 45
    seviye1SiklikDk: number;    // Örn: 15
    seviye2BaslangicDk: number; // Örn: 30
    seviye2SiklikDk: number;    // Örn: 10
    seviye3BaslangicDk: number; // Örn: 15 (Şeytanla Mücadele)
    seviye3SiklikDk: number;    // Örn: 5
    seviye4BaslangicDk: number; // Örn: 5 (Alarm)
    seviye4SiklikDk: number;    // Örn: 1
}

const VARSAYILAN_YAPILANDIRMA: MuhafizYapilandirmasi = {
    seviye1BaslangicDk: 45,
    seviye1SiklikDk: 15,
    seviye2BaslangicDk: 30,
    seviye2SiklikDk: 10,
    seviye3BaslangicDk: 15,
    seviye3SiklikDk: 5,
    seviye4BaslangicDk: 5,
    seviye4SiklikDk: 1,
};

type BildirimCallback = (mesaj: string, seviye: 0 | 1 | 2 | 3 | 4) => void;

export class NamazMuhafiziServisi {
    private static instance: NamazMuhafiziServisi;
    private config: MuhafizYapilandirmasi = VARSAYILAN_YAPILANDIRMA;
    private intervalId: NodeJS.Timeout | null = null;
    private hesaplayici: NamazVaktiHesaplayiciServisi;
    private onBildirim: BildirimCallback | null = null;

    // Namaz kılındı mı durumu (vakit bazlı)
    private kilinanVakitler: Record<string, boolean> = {};

    // Temizleme bildirimi gönderilen vakitler (gereksiz tekrar çağrıları önlemek için)
    private temizlenenVakitler: Record<string, boolean> = {};

    private constructor() {
        this.hesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
    }

    public static getInstance(): NamazMuhafiziServisi {
        if (!NamazMuhafiziServisi.instance) {
            NamazMuhafiziServisi.instance = new NamazMuhafiziServisi();
        }
        return NamazMuhafiziServisi.instance;
    }

    public baslat(callback: BildirimCallback) {
        this.onBildirim = callback;
        if (this.intervalId) return;

        // Her dakika kontrol et
        this.intervalId = setInterval(() => this.kontrolEt(), 60 * 1000);
        this.kontrolEt(); // İlk başlatmada hemen kontrol et
        console.log("Namaz Muhafızı göreve başladı.");
    }

    public durdur() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Testler için servisi sıfırlar
     */
    public sifirla() {
        this.durdur();
        this.kilinanVakitler = {};
        this.temizlenenVakitler = {};
        this.config = VARSAYILAN_YAPILANDIRMA;
        this.onBildirim = null;
    }

    public yapilandir(yeniAyarlar: Partial<MuhafizYapilandirmasi>) {
        this.config = { ...this.config, ...yeniAyarlar };
    }

    public namazKilindiIsaretle(vakit: string) {
        // Bugünün tarihiyle vakti işaretle (basit implementation)
        // Gerçekte tarih kontrolü yapılmalı
        const bugun = new Date().toDateString();
        this.kilinanVakitler[`${bugun}_${vakit}`] = true;
        console.log(`${vakit} namazı kılındı olarak işaretlendi. Muhafız bu vakit için dinlenmeye çekiliyor.`);
    }

    private kontrolEt() {
        const vakitBilgisi = this.hesaplayici.getSuankiVakitBilgisi();
        if (!vakitBilgisi) return;

        const { vakit, kalanSureMs } = vakitBilgisi;
        const kalanDk = Math.floor(kalanSureMs / (1000 * 60));

        // Eğer bu vakit zaten kılındıysa banner'ı temizle (sadece bir kez) ve rahatsız etme
        const bugun = new Date().toDateString();
        const vakitAnahtari = `${bugun}_${vakit}`;
        if (this.kilinanVakitler[vakitAnahtari]) {
            // Temizleme bildirimi henüz gönderilmediyse gönder
            if (!this.temizlenenVakitler[vakitAnahtari] && this.onBildirim) {
                this.onBildirim('', 0);
                this.temizlenenVakitler[vakitAnahtari] = true;
            }
            return;
        }

        // Seviye Kontrolü
        let aktifSeviye: 1 | 2 | 3 | 4 | 0 = 0;
        let mesaj = "";

        if (kalanDk <= this.config.seviye4BaslangicDk) {
            aktifSeviye = 4;
            mesaj = `VAKİT ÇIKIYOR! Hemen secdeye kapan! (${kalanDk} dk kaldı)`;
        } else if (kalanDk <= this.config.seviye3BaslangicDk) {
            aktifSeviye = 3;
            mesaj = this.getRandomIcerik(3);
        } else if (kalanDk <= this.config.seviye2BaslangicDk) {
            aktifSeviye = 2;
            mesaj = `Vakit daralıyor, namazı sona bırakma. (${kalanDk} dk kaldı)`;
        } else if (kalanDk <= this.config.seviye1BaslangicDk) {
            aktifSeviye = 1;
            mesaj = `Namaz vaktinin bitmesine ${kalanDk} dakika kaldı.`;
        }

        if (aktifSeviye > 0 && this.onBildirim) {
            // Sıklık kontrolü (basit modülo ile)
            // Gerçekte son bildirim zamanını tutup karşılaştırmak daha sağlıklı olur
            // Ama dakika başı çağırdığımız için modülo iş görür
            const siklik = this.getSiklik(aktifSeviye);

            // Seviye 4, her dakika çalar
            // Diğerleri modüloya bakar
            // Not: Bu basit mantık, tam dk denk gelmezse atlayabilir, ama setInterval 60sn olduğu için genelde çalışır.
            // İyileştirme: LastNotificationTime kontrolü eklenebilir.

            if (kalanDk % siklik === 0 || aktifSeviye === 4) {
                this.onBildirim(mesaj, aktifSeviye as 1 | 2 | 3 | 4);
            }
        }
    }

    private getSiklik(seviye: number): number {
        switch (seviye) {
            case 1: return this.config.seviye1SiklikDk;
            case 2: return this.config.seviye2SiklikDk;
            case 3: return this.config.seviye3SiklikDk;
            case 4: return this.config.seviye4SiklikDk;
            default: return 60;
        }
    }

    private getRandomIcerik(seviye: number): string {
        const uygunIcerikler = SEYTANLA_MUCADELE_ICERIGI.filter(i => i.siddetSeviyesi === seviye);
        if (uygunIcerikler.length === 0) return "Şeytana uyma, namazını kıl.";

        const random = Math.floor(Math.random() * uygunIcerikler.length);
        return uygunIcerikler[random].metin;
    }
}
