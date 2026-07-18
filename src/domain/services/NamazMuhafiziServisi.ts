import { NamazVaktiHesaplayiciServisi } from './NamazVaktiHesaplayiciServisi';
import { uygunIcerikleriBul, icerikMetniOlustur, MucadeleIcerigi } from '../../core/data/SeytanlaMucadeleIcerigi';
import { Logger } from '../../core/utils/Logger';
import { bugunuAl, dunuAl } from '../../core/utils/TarihYardimcisi';
import { kilinanVakitleriAl } from '../../data/local/LocalNamazServisi';
import type { VakitAdi } from '../../core/types';
import type { MuhafizMatrisi, MuhafizVakti } from '../../core/muhafiz/matrisTipleri';
import { aktifSeviyeyiBul } from '../../core/muhafiz/aktifSeviye';
import { kademeSeviyeNo, seviyeTetiklenirMi } from '../../core/muhafiz/motorAdaptoru';
import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';

/**
 * Faz 3: on plan banner'i da vakit x seviye MATRISINDEN okur.
 * Cagiran taraf matrisi `muhafizMatrisiniCoz(state.muhafiz)` ile uretir.
 */
export type MuhafizYapilandirmasi = MuhafizMatrisi;

/** Eski global varsayilanlarin matris karsiligi (yapilandirilmadan once/`sifirla` sonrasi). */
const VARSAYILAN_MATRIS: MuhafizMatrisi = eskidenMatriseGoc({
    esikler: { seviye1: 45, seviye2: 30, seviye3: 15, seviye4: 5 },
    sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
});

type BildirimCallback = (mesaj: string, seviye: 0 | 1 | 2 | 3 | 4) => void;

export class NamazMuhafiziServisi {
    private static instance: NamazMuhafiziServisi;
    private matris: MuhafizMatrisi = VARSAYILAN_MATRIS;
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
        Logger.info('NamazMuhafiziServisi', 'Namaz Muhafızı göreve başladı.');
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
        this.matris = VARSAYILAN_MATRIS;
        this.onBildirim = null;
    }

    public yapilandir(matris: MuhafizYapilandirmasi) {
        this.matris = matris;
    }

    public namazKilindiIsaretle(vakit: string) {
        // Bugünün tarihiyle vakti işaretle (basit implementation)
        // Gerçekte tarih kontrolü yapılmalı
        const bugun = new Date().toDateString();
        this.kilinanVakitler[`${bugun}_${vakit}`] = true;
        Logger.info('NamazMuhafiziServisi', `${vakit} namazı kılındı olarak işaretlendi. Muhafız bu vakit için dinlenmeye çekiliyor.`);
    }

    /**
     * Namaz "kılınmadı" işaretlenince bellek-içi kılınmışlık kaydını temizler; aksi
     * halde muhafız o vakit için bir daha uyarı vermez (#101 review). `namazKilindiIsaretle`
     * ile birebir aynı anahtar formatı: `${Date.toDateString()}_${vakit}` (küçük harf vakit).
     */
    public namazKilindiTemizle(vakit: string) {
        const bugun = new Date().toDateString();
        delete this.kilinanVakitler[`${bugun}_${vakit}`];
        delete this.temizlenenVakitler[`${bugun}_${vakit}`];
        Logger.info('NamazMuhafiziServisi', `${vakit} namazı kılınmadı olarak işaretlendi; muhafız yeniden devrede.`);
    }

    /**
     * Açılışta diskteki kalıcı kılınmışlık kaydını (kilinanVakitleriAl) bellek-içi
     * kilinanVakitler map'ine yükler. Aksi halde uygulama yeniden açıldığında map BOŞ
     * olur ve zaten kılınmış namaz için vakte kısa süre kala (seviye >= 3) çan sesi
     * çalardı (#92). baslat()'tan ÖNCE await edilmeli ki ilk senkron kontrolEt() dolu
     * map ile çalışsın (yarış yok).
     *
     * Bugün VE dün okunur: imsak öncesi gece yarısı geçişinde dünün yatsısı hâlâ aktiftir.
     * Map anahtarı kontrolEt()/namazKilindiIsaretle() ile birebir aynı format olmalı:
     * `${Date.toDateString()}_${vakit}`.
     */
    public async acilistaKilinanlariYukle(): Promise<void> {
        try {
            const bugunTarih = new Date();
            const dunTarih = new Date();
            dunTarih.setDate(dunTarih.getDate() - 1);

            const [kilinanBugun, kilinanDun] = await Promise.all([
                kilinanVakitleriAl(bugunuAl()),
                kilinanVakitleriAl(dunuAl()),
            ]);

            for (const vakit of kilinanBugun) {
                this.kilinanVakitler[`${bugunTarih.toDateString()}_${vakit}`] = true;
            }
            for (const vakit of kilinanDun) {
                this.kilinanVakitler[`${dunTarih.toDateString()}_${vakit}`] = true;
                // Gece yarısı geçişi: imsak öncesinde dünün yatsısı hâlâ aktiftir ve
                // kontrolEt() onu BUGÜNÜN tarih anahtarıyla kontrol eder. Bu yüzden dünün
                // yatsısını bugünün anahtarıyla da işaretle (gündüz zararsız: vakit aktif değil).
                if (vakit === 'yatsi') {
                    this.kilinanVakitler[`${bugunTarih.toDateString()}_${vakit}`] = true;
                }
            }
        } catch (error) {
            // Disk okunamazsa sessizce devam et (muhafız çalışmaya devam etsin)
            Logger.error('NamazMuhafiziServisi', 'Açılışta kılınan vakitler yüklenemedi:', error);
        }
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

        // Seviye kontrolü — o VAKTİN kendi matris satırından (Faz 3).
        // 'gunes' muhafızda planlanmaz -> matriste satırı yoktur.
        const vakitAyari = this.matris[vakit as MuhafizVakti];
        if (!vakitAyari) return;

        // Sessiz (mod='sessiz') seviye pencere sağlamaz; o aralıkta bir üst
        // (daha nazik) seviye aktifse onun sıklığı işler.
        const kazanan = aktifSeviyeyiBul(vakitAyari, kalanDk);
        if (!kazanan) return;

        // Sıklık kontrolü: seviyenin KENDİ eşiğine göreceli ((eşik - kalan) % herDk),
        // arka plan planlamasıyla birebir aynı kural -> banner ve bildirim aynı
        // dakikalarda konuşur. 'birkez' yalnız tam eşik anında tetiklenir.
        if (!seviyeTetiklenirMi(kazanan, kalanDk)) return;

        const aktifSeviye = kademeSeviyeNo(kazanan.kademe);
        if (this.onBildirim) {
            this.onBildirim(this.seviyeMesajiOlustur(vakit, aktifSeviye, kalanDk), aktifSeviye);
        }
    }

    /**
     * Banner metni. Seviye 3 havuzdan (vakte özgü), diğerleri sabit şablon.
     * DİL: muhafız "sen" dili istisnası (AGENTS.md) — ibadete çağrı, arayüz değil.
     */
    private seviyeMesajiOlustur(vakit: VakitAdi, seviye: 1 | 2 | 3 | 4, kalanDk: number): string {
        switch (seviye) {
            case 4: return `VAKİT ÇIKIYOR! Hemen namaza dur! (${kalanDk} dk kaldı)`;
            case 3: return this.getRandomIcerik(vakit, 3);
            case 2: return `Vakit daralıyor, namazı sona bırakma. (${kalanDk} dk kaldı)`;
            case 1: return `Namaz vaktinin bitmesine ${kalanDk} dakika kaldı.`;
        }
    }

    /**
     * Havuzdan (vakit, seviye) icin rastgele icerik. Vakte ozgu nass yalniz kendi
     * vaktinde cikar; nass ise kunye de eklenir. Havuz bossa yedek metin.
     */
    private getRandomIcerik(vakit: VakitAdi, seviye: 1 | 2 | 3 | 4): string {
        const uygunIcerikler = uygunIcerikleriBul(vakit, seviye);
        if (uygunIcerikler.length === 0) return "Şeytana uyma, namazı kıl.";

        const random = Math.floor(Math.random() * uygunIcerikler.length);
        return icerikMetniOlustur(uygunIcerikler[random]);
    }
}
