import { NamazVaktiHesaplayiciServisi } from './NamazVaktiHesaplayiciServisi';
import { uygunIcerikleriBul, icerikMetniOlustur } from '../../core/data/SeytanlaMucadeleIcerigi';
import { Logger } from '../../core/utils/Logger';
import { bugunuAl, dunuAl } from '../../core/utils/TarihYardimcisi';
import { kilinanVakitleriAl } from '../../data/local/LocalNamazServisi';
import type { VakitAdi } from '../../core/types';
import type { MuhafizMatrisi, MuhafizVakti, SeviyeAyari } from '../../core/muhafiz/matrisTipleri';
import { aktifSeviyeyiBul } from '../../core/muhafiz/aktifSeviye';
import { kademeSeviyeNo, seviyeTetiklenirMi, sesliAnonsGerekliMi, type SeviyeNo } from '../../core/muhafiz/motorAdaptoru';
import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';
import { anonsMetniniCoz } from '../../core/muhafiz/anonsMetni';
import { muhafizBildirimIdOlustur, muhafizVaktiTarihiniSec } from '../../core/muhafiz/anonsKimligi';
import { VARSAYILAN_PENCERE_YONU, olcuDkHesapla, type PencereYonu } from '../../core/muhafiz/pencereTipleri';
import { pencereUzunluguDkHesapla } from '../../core/muhafiz/pencereUzunlugu';
import { GIRIS_ICERIK_HAVUZU } from '../../core/utils/muhafizMetinYardimcisi';
import { planlaAnons } from '../../../modules/expo-countdown-notification/src';

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

/**
 * On plan banner geri cagrisi.
 *
 * `bildirimSesi` = TETIKLEYEN ADIMIN secili sesi ('varsayilan' | 'content://...').
 * Ekran bunu calmali: aksi halde AYNI adim uygulama KAPALIYKEN kullanicinin
 * sectigi sesle (kanal sesi), ACIKKEN paketlenmis varsayilan canla duyulurdu.
 * Banner temizleme cagrisinda (seviye 0) verilmez.
 */
type BildirimCallback = (
    mesaj: string,
    seviye: 0 | 1 | 2 | 3 | 4,
    bildirimSesi?: string
) => void;

/**
 * On plan anonsu banner'la es zamanli duyulsun diye birakilan kucuk pay.
 * (Native taraf "hemen konus" sunmaz; en yakin zamana alarm kurulur.)
 */
const ON_PLAN_ANONS_GECIKMESI_MS = 1000;

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

        const { vakit, kalanSureMs, giris } = vakitBilgisi;
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

        // FAZ 1 — YÖN. Ölçü artık "çıkışa kalan" olmak zorunda değil: giriş
        // yönünde "girişten geçen dakika"dır. Pencere uzunluğu ARKA PLANLA AYNI
        // kaynaktan (giriş↔çıkış) hesaplanmalı — ayrışırsa banner ile bildirim
        // farklı dakikalara düşer (AGENTS.md'de kayıtlı ders). `giris` yoksa
        // (yapılandırılmamış/eski kayıt) pencere bilinmez ve motor giriş yönünde
        // hiç tetiklenmez; çıkış yönü etkilenmez.
        const yon: PencereYonu = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
        const cikis = vakitBilgisi.saat ?? new Date(Date.now() + kalanSureMs);
        const pencereUzunluguDk = giris ? pencereUzunluguDkHesapla(giris, cikis) : undefined;
        const olcuDk =
            yon === 'girisindenItibaren' && giris
                ? olcuDkHesapla({ kaynak: `vakit:${vakit}`, baslangic: giris, bitis: cikis, yon }, new Date())
                : kalanDk;

        // Sessiz (mod='sessiz') seviye pencere sağlamaz; o aralıkta bir üst
        // (daha nazik) seviye aktifse onun sıklığı işler.
        const kazanan = aktifSeviyeyiBul(vakitAyari, olcuDk);
        if (!kazanan) return;

        // Sıklık kontrolü: seviyenin KENDİ eşiğine göreceli ((eşik - kalan) % herDk),
        // arka plan planlamasıyla birebir aynı kural -> banner ve bildirim aynı
        // dakikalarda konuşur. 'birkez' yalnız tam eşik anında tetiklenir.
        // Kardeş seviyeler ZORUNLU geçilir (Faz 0 plan bütçesi): arka plan planı
        // da aynı listeyi geçer; eksik bırakılırsa segment hesabı ayrışır ve
        // banner ile bildirim farklı dakikalara düşer.
        if (!seviyeTetiklenirMi(kazanan, olcuDk, vakitAyari.seviyeler, { yon, pencereUzunluguDk })) return;

        const aktifSeviye = kademeSeviyeNo(kazanan.kademe);

        // Faz 5: uygulama ACIKKEN de sesli anons konussun.
        this.onPlanAnonsuPlanla(vakit as MuhafizVakti, kazanan, aktifSeviye, kalanDk, kalanSureMs, yon);

        if (this.onBildirim) {
            this.onBildirim(
                this.seviyeMesajiOlustur(vakit, aktifSeviye, olcuDk, yon),
                aktifSeviye,
                kazanan.bildirimSesi
            );
        }
    }

    /**
     * ON PLAN SESLI ANONSU (Faz 5) — ve CIFT KONUSMA'nin nasil onlendigi.
     *
     * Arka plan (`ArkaplanMuhafizServisi`) ayni dakika icin zaten bir TTS alarmi
     * planlar; alarmlar uygulama acikken de tetiklendigi icin naif bir ikinci
     * planlama DOGRUDAN cift konusma demektir. Cozum: ALARMI COGALTMA, DEGISTIR.
     *
     * 1) Id PARITESI — anons id'si arka planla birebir ayni uretici ile kurulur
     *    (`muhafizBildirimIdOlustur`). Native taraf ayni id icin ayni istek kodunu
     *    ve `FLAG_UPDATE_CURRENT`'i kullanir → ikinci `planlaAnons` mevcut alarmi
     *    DEGISTIRIR, yenisini eklemez.
     *
     * 2) SIRA GARANTISI — on plan her zaman arka plan alarmindan ONCE (veya tam
     *    ayni anda) calisir, dolayisiyla degistirilecek alarm daima HENUZ
     *    TETIKLENMEMISTIR:
     *      kalanDk = floor(kalanSureMs / 60000)  ve  kalanSureMs = cikis - simdi
     *      => kalanSureMs >= kalanDk * 60000
     *      => simdi <= cikis - kalanDk * 60000 = alarmin kurulu oldugu an
     *    Yani banner ciktiginda o dakikanin alarmi 0-60 sn sonrasindadir; anonsu
     *    banner ile ayni ana cekmek hem tekillestirir hem de sesi ekranda gorulen
     *    uyariyla es zamanli yapar. `kalanDk` degismedigi icin METIN de aynidir.
     *
     * Ayrica arka plan hic planlayamamissa (ornegin muhafiz uygulama acikken yeni
     * acildi) bu yol anonsu tek basina ayakta tutar.
     *
     * FAZ 1 / B3 — GIRIS YONUNDE ON PLAN ANONS PLANLAMAZ. Yukaridaki (2) sira
     * garantisi giris yonunde TERS doner:
     *      olcuDk = floor((simdi - giris) / 60000)
     *      => simdi >= giris + olcuDk * 60000 = alarmin kurulu oldugu an
     * yani ezilecek alarm ZATEN TETIKLENMISTIR; `planlaAnons(id, simdi + 1sn)`
     * onu gecmise degil 1 sn sonrasina YENIDEN kurar → arka plan dakika basinda,
     * on plan ayni dakika icinde IKINCI kez konusur. Ses arka plan alarmina
     * birakilir (banner cikmaya devam eder): alarm acilis zincirinden (App.tsx),
     * ekran debounce'undan ve `ArkaplanGorevServisi` 15-dk yolundan kurulur ve
     * alarmlar uygulama ACIKKEN de tetiklenir.
     *
     * Native cagri asla banner'i dusurmemeli -> hata yutulup loglanir.
     */
    private onPlanAnonsuPlanla(
        vakit: MuhafizVakti,
        seviye: SeviyeAyari,
        seviyeNo: SeviyeNo,
        kalanDk: number,
        kalanSureMs: number,
        yon: PencereYonu = VARSAYILAN_PENCERE_YONU
    ): void {
        if (yon === 'girisindenItibaren') return;
        if (!sesliAnonsGerekliMi(seviye.mod)) return;
        if (!seviye.anonsMetni || seviye.anonsMetni.trim().length === 0) return;

        try {
            const simdi = new Date();
            const cikis = new Date(simdi.getTime() + kalanSureMs);
            const tarih = muhafizVaktiTarihiniSec(vakit, simdi, cikis, bugunuAl(), dunuAl());
            const id = muhafizBildirimIdOlustur(vakit, seviyeNo, tarih, kalanDk);
            const metin = anonsMetniniCoz(seviye.anonsMetni, vakit, kalanDk);

            planlaAnons(id, simdi.getTime() + ON_PLAN_ANONS_GECIKMESI_MS, metin);
        } catch (error) {
            Logger.error('NamazMuhafiziServisi', 'Ön plan sesli anonsu planlanamadı:', error);
        }
    }

    /**
     * Banner metni. Seviye 3 havuzdan (vakte özgü), diğerleri sabit şablon.
     * DİL: muhafız "sen" dili istisnası (AGENTS.md) — ibadete çağrı, arayüz değil.
     *
     * `olcuDk` SEVİYEYİ KAZANDIRAN ölçüdür; giriş yönünde "girişten geçen dakika"
     * demektir ve çıkış dili ("kaldı", "VAKİT ÇIKIYOR") oraya UYMAZ: vakit yeni
     * girmişken 655 dk varken "vakit çıkıyor" denirdi. Giriş yönünde seviye 3
     * MÜCADELE havuzunu da kullanmaz — o havuz vaktin sonuna kuruludur ve vakte
     * özgü nass taşır (AGENTS.md: terk etme ≠ geciktirme).
     */
    private seviyeMesajiOlustur(
        vakit: VakitAdi,
        seviye: 1 | 2 | 3 | 4,
        olcuDk: number,
        yon: PencereYonu = VARSAYILAN_PENCERE_YONU
    ): string {
        if (yon === 'girisindenItibaren') {
            switch (seviye) {
                case 4: return `NAMAZI GECİKTİRME! Hemen namaza dur! (${olcuDk} dk geçti)`;
                case 3: return this.girisIcerigiSec(3);
                case 2: return `Vakit ilerliyor, namazı sona bırakma. (${olcuDk} dk geçti)`;
                case 1: return `Namaz vakti gireli ${olcuDk} dakika oldu.`;
            }
        }
        switch (seviye) {
            case 4: return `VAKİT ÇIKIYOR! Hemen namaza dur! (${olcuDk} dk kaldı)`;
            case 3: return this.getRandomIcerik(vakit, 3);
            case 2: return `Vakit daralıyor, namazı sona bırakma. (${olcuDk} dk kaldı)`;
            case 1: return `Namaz vaktinin bitmesine ${olcuDk} dakika kaldı.`;
        }
    }

    /** Giriş yönünün NÖTR içerik havuzundan rastgele metin (vakte özgü nass YOK). */
    private girisIcerigiSec(seviye: 1 | 2 | 3 | 4): string {
        const havuz = GIRIS_ICERIK_HAVUZU[seviye];
        return havuz[Math.floor(Math.random() * havuz.length)];
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
