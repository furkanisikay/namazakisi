import { NamazVaktiHesaplayiciServisi } from './NamazVaktiHesaplayiciServisi';
import { uygunIcerikleriBul, icerikMetniOlustur } from '../../core/data/SeytanlaMucadeleIcerigi';
import { Logger } from '../../core/utils/Logger';
import { bugunuAl, dunuAl } from '../../core/utils/TarihYardimcisi';
import { kilinanVakitleriAl } from '../../data/local/LocalNamazServisi';
import { ozelGunKapisiniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { geceSessizliginiOku } from '../../data/local/LocalGeceSessizligiOkuyucu';
import {
    geceCapasiUyarisi,
    geceSessizligiSusturuyorMu,
    geceSessizliginePencereyiUyarla,
    type GeceSessizligi,
} from '../../core/muhafiz/geceSessizligi';
import { geceCapasiGovdesi } from '../../core/utils/muhafizMetinYardimcisi';
import { LocalSaatAyarlariServisi } from '../../data/local/LocalSaatAyarlariServisi';
import { telefonAnonsuKonusurMu, type SaatAyarlari } from '../../core/saat/saatAyarlari';
import { ozelGunAktifMi, type OzelGunKapisiGirdisi } from '../../core/seri/ozelGunKapisi';
import type { VakitAdi } from '../../core/types';
import type { MuhafizMatrisi, MuhafizVakti, SeviyeAyari } from '../../core/muhafiz/matrisTipleri';
import { aktifSeviyeyiBul } from '../../core/muhafiz/aktifSeviye';
import { alarmAniMi, etkinSeviyeNo, seviyeTetiklenirMi, sesliAnonsGerekliMi, titresimGerekliMi, type SeviyeNo } from '../../core/muhafiz/motorAdaptoru';
import { titresimDeseniAl } from '../../core/muhafiz/titresimDeseni';
import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';
import { anonsMetniniCoz } from '../../core/muhafiz/anonsMetni';
import { muhafizBildirimIdOlustur, muhafizVaktiTarihiniSec } from '../../core/muhafiz/anonsKimligi';
import { VARSAYILAN_PENCERE_YONU, olcuDkHesapla, type PencereYonu } from '../../core/muhafiz/pencereTipleri';
import { pencereUzunluguDkHesapla } from '../../core/muhafiz/pencereUzunlugu';
import { GIRIS_ICERIK_HAVUZU, sonDakikaDiliMi } from '../../core/utils/muhafizMetinYardimcisi';
import { planlaAnons } from '../../../modules/expo-countdown-notification/src';
import { Platform, Vibration } from 'react-native';

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
 *
 * `sistemAlarmi` = bu dakikada adimin GERCEK ALARMI calar (issue #74, `alarmAniMi`).
 * Ekran o zaman SES CALMAZ ve TITRETMEZ: alarm (Android `setAlarmClock`, iOS zamana
 * duyarli bildirim) uygulama acikken de tetiklenir ve kendi sesini calar — ikinci bir
 * ses cift ses olurdu. Banner yine cizilir.
 */
type BildirimCallback = (
    mesaj: string,
    seviye: 0 | 1 | 2 | 3 | 4,
    bildirimSesi?: string,
    sistemAlarmi?: boolean
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

    /**
     * Özel gün kapısının girdisi (issue #272). BELLEK-İÇİ önbellek: `kontrolEt`
     * dakikada bir SENKRON koşar, her turda diski okuyamaz. Doldurulan iki yol:
     * açılış hidrasyonu (`acilistaKilinanlariYukle`) ve özel gün değişince
     * `ozelGunDurumunuYukle` (bkz. `OzelGunDegisikligiServisi`).
     */
    private ozelGun: OzelGunKapisiGirdisi | null = null;

    /**
     * Saat iş bölümü (saat W3): kullanıcı anonsu "yalnız saatte" seçtiyse telefon ön
     * planda da KONUŞMAZ (çift konuşma yok). BELLEK-İÇİ önbellek (`kontrolEt` senkron);
     * açılışta ve ayar değişince (`saatAyarlariniYukle`) doldurulur. Bilinmiyorken
     * (null) varsayılan = telefon konuşur (bugünkü davranış).
     */
    private saatAyarlari: SaatAyarlari | null = null;

    /**
     * Gece sessizliği (arka planla AYNI kural, `geceSessizligiSusturuyorMu`). BELLEK-İÇİ
     * önbellek: açılışta hydrate edilir, her tick arka planda tazelenir (ateşle-unut —
     * ekranda değişen ayar en geç bir dakikada ön plana da yansır).
     */
    private geceSessizligi: GeceSessizligi | undefined;

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
        this.ozelGun = null;
        this.saatAyarlari = null;
        this.geceSessizligi = undefined;
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
        // Özel gün kapısı da açılışta diskten hydrate edilmeli — aksi halde ilk
        // `kontrolEt` boş önbellekle koşar ve özel gündeki kullanıcıya tam
        // açılışta banner/ses/anons çıkardı (kılınmışlık #92 dersinin ikizi).
        // Okuyucu asla fırlatmaz.
        this.ozelGun = await ozelGunKapisiniOku();
        await this.saatAyarlariniYukle();
        // Gece sessizliği de: ilk `kontrolEt` gece yarısı açılışta konuşmasın.
        await this.geceSessizliginiYukle();
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

    /**
     * Özel gün ayarlarını diskten yeniden okur ve kapıyı HEMEN uygular
     * (özel gün başlatılınca açık bir banner bir dakika daha beklemesin).
     * Asla fırlatmaz.
     */
    /** Saat iş bölümü ayarını diskten tazeler (okuyucu asla fırlatmaz). */
    public async saatAyarlariniYukle(): Promise<void> {
        this.saatAyarlari = await LocalSaatAyarlariServisi.oku();
    }

    /** Gece sessizliği ayarını diskten tazeler (okuyucu asla fırlatmaz). */
    public async geceSessizliginiYukle(): Promise<void> {
        this.geceSessizligi = await geceSessizliginiOku();
    }

    public async ozelGunDurumunuYukle(): Promise<void> {
        this.ozelGun = await ozelGunKapisiniOku();
        if (this.intervalId) this.kontrolEt();
    }

    private kontrolEt() {
        // Gece sessizliği bir sonraki tick için arka planda tazelenir (ateşle-unut).
        void this.geceSessizliginiYukle();

        const vakitBilgisi = this.hesaplayici.getSuankiVakitBilgisi();
        if (!vakitBilgisi) return;

        const { vakit, giris } = vakitBilgisi;

        // Eğer bu vakit zaten kılındıysa banner'ı temizle (sadece bir kez) ve rahatsız etme
        const bugun = new Date().toDateString();
        const vakitAnahtari = `${bugun}_${vakit}`;

        // ÖZEL GÜN (issue #272): banner, ses, titreşim ve sesli anons YOK.
        // Kapı vaktin GÜNÜNE bakar — gece yarısından sonraki yatsı DÜNE aittir
        // (arka planla aynı tarih kuralı: `muhafizVaktiTarihiniSec`).
        const simdi = new Date();
        const cikisAni = vakitBilgisi.saat ?? new Date(simdi.getTime() + vakitBilgisi.kalanSureMs);
        const vakitGunu = muhafizVaktiTarihiniSec(vakit, simdi, cikisAni, bugunuAl(), dunuAl());
        // YATSI ÇAPASI (gece sessizliği): etkin çıkış = min(çıkış, sessizlik başlangıcı); yatsı
        // sessizlikten sonra giriyorsa o gece uyarı yok. Arka planla AYNI saf fonksiyon →
        // kalanDk (ve dolayısıyla bildirim/anons kimliği) iki tarafta aynı.
        const etkin = geceSessizliginePencereyiUyarla(this.geceSessizligi, { vakit, tarih: vakitGunu, giris, cikis: cikisAni });
        if (!etkin) return;
        const kalanSureMs = etkin.cikis.getTime() - simdi.getTime();
        const kalanDk = Math.floor(kalanSureMs / (1000 * 60));
        if (ozelGunAktifMi(vakitGunu, this.ozelGun)) {
            const ozelAnahtar = `ozel_${vakitAnahtari}`;
            if (!this.temizlenenVakitler[ozelAnahtar] && this.onBildirim) {
                this.onBildirim('', 0);
                this.temizlenenVakitler[ozelAnahtar] = true;
            }
            return;
        }
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
        const cikis = etkin.cikis;
        const pencereUzunluguDk = giris ? pencereUzunluguDkHesapla(giris, cikis) : undefined;
        const olcuDk =
            yon === 'girisindenItibaren' && giris
                ? olcuDkHesapla({ kaynak: `vakit:${vakit}`, baslangic: giris, bitis: cikis, yon }, new Date())
                : kalanDk;

        // Planın bu dakikaya kurduğu uyarının ANI (arka planla aynı): çıkışta
        // `çıkış − kalanDk`, girişte `giriş + olcuDk`. Gece sessizliği kapısı buna bakar.
        const tetikMs =
            yon === 'girisindenItibaren' && giris
                ? giris.getTime() + olcuDk * 60 * 1000
                : cikis.getTime() - kalanDk * 60 * 1000;

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

        // TON: acil kısıtı (son 15 dk, yalnız çıkış yönü) plan ile AYNI kapıdan.
        // Gece sessizliği çapası: ton en fazla "uyarı", acil yok, anons çapa şablonu — arka
        // planla AYNI saf uyarlama (`geceCapasiUyarisi`) → kimlik ve metin aynı.
        const capa = etkin.geceCapasi
            ? geceCapasiUyarisi({ seviye: etkinSeviyeNo(kazanan, yon), acilKanal: false, anonsMetni: kazanan.anonsMetni ?? '' })
            : null;
        const aktifSeviye = (capa ? capa.seviye : etkinSeviyeNo(kazanan, yon)) as SeviyeNo;
        const anonsSeviyesi: SeviyeAyari = capa ? { ...kazanan, anonsMetni: capa.anonsMetni } : kazanan;

        // GERCEK ALARM (issue #74) — CIFT SES KURALI: adimin ilk tetiginde sistem alarmi
        // uygulama acikken de calar (kendi sesi + titresimi). On plan o dakikada ne anons
        // planlar ne titretir; ekran da ses calmaz (`sistemAlarmi`). Anonsu planlamamak
        // ayrica SART: arka plan o tetige anons KURMADI (alarm onun yerine gecti), on plan
        // ayni kimlikle kursaydi alarmin ustune TTS konusurdu.
        const sistemAlarmi = alarmAniMi(kazanan, olcuDk);

        // GECE SESSİZLİĞİ: arka plan bu tetiği hiç kurmadı (`vakitTeslimAdaylari`, aynı
        // kural, aynı tetik anı ve namaz günü) → ön plan da banner/ses/anons vermez.
        // Gerçek alarm muaf (kullanıcının bilerek kurduğu uyandırma).
        if (geceSessizligiSusturuyorMu(this.geceSessizligi, vakitGunu, tetikMs, sistemAlarmi)) return;

        if (!sistemAlarmi) {
            // Faz 5: uygulama ACIKKEN de sesli anons konussun.
            this.onPlanAnonsuPlanla(vakit as MuhafizVakti, anonsSeviyesi, aktifSeviye, kalanDk, kalanSureMs, yon, vakitGunu);

            // Faz 6: uygulama ACIKKEN bildirim golgeligine bir sey dusmez (banner
            // ekranda cizilir) → KANAL titresimi de islemez. On planda titresimi
            // servisin kendisi calistirmak zorunda; aksi halde ayni adim uygulama
            // kapaliyken titrer, acikken titremezdi.
            this.titresimVer(kazanan);
        }

        if (this.onBildirim) {
            const mesaj = capa ? geceCapasiGovdesi(kalanDk) : this.seviyeMesajiOlustur(vakit, aktifSeviye, olcuDk, yon);
            // Dördüncü argüman YALNIZ alarm anında: alarm kanalı kapalı akış birebir eski çağrı.
            if (sistemAlarmi) this.onBildirim(mesaj, aktifSeviye, kazanan.bildirimSesi, true);
            else this.onBildirim(mesaj, aktifSeviye, kazanan.bildirimSesi);
        }
    }

    /**
     * ON PLAN TITRESIMI (Faz 6).
     *
     * Desen bildirim kanalindakiyle AYNI kaynaktan gelmez — gelemez de: kanal
     * deseni native tarafta yasar (kanal olusturulduktan sonra degistirilemez).
     * Buradaki desen `core/muhafiz/titresimDeseni` tek kaynagindan okunur ve
     * ikisi bilincli olarak ayni ritmi tasir.
     *
     * Titresim ASLA banner'i dusurmemeli: cihazin titresim motoru yoksa/izin
     * kisitliysa `vibrate` firlatabilir → hata yutulur.
     */
    private titresimVer(seviye: SeviyeAyari): void {
        if (!titresimGerekliMi(seviye.kanallar)) return;
        try {
            Vibration.vibrate(titresimDeseniAl());
        } catch (error) {
            Logger.debug('Muhafiz', 'On plan titresimi verilemedi:', error);
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
        yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
        /** Vaktin namaz günü — yatsı çapasında etkin çıkış "bugün" olduğu için tahmin EDİLMEZ. */
        vakitGunu?: string
    ): void {
        if (yon === 'girisindenItibaren') return;
        // iOS: ON PLANDA ANONS PLANLANMAZ — CIFT SES KURALI.
        //
        // iOS'ta zamanlanmis bildirim uygulama ON PLANDAYKEN DE teslim edilir ve
        // kendi sesini calar. Ayrica burada bir ses daha calsaydi ayni uyari iki
        // kez duyulurdu. Ayrica native TTS koprusu iOS'ta zaten yok (no-op);
        // kapiyi burada acikca kurmak, davranisin NEDEN boyle oldugunu koda
        // yaziyor — sessiz bir no-op'a guvenmiyoruz.
        if (Platform.OS === 'ios') return;
        if (!sesliAnonsGerekliMi(seviye.kanallar)) return;
        if (!seviye.anonsMetni || seviye.anonsMetni.trim().length === 0) return;
        // Saat W3: "yalnız saatte" → telefon konuşmaz (arka plan üreticisiyle AYNI kapı).
        if (!telefonAnonsuKonusurMu(this.saatAyarlari ?? undefined)) return;

        try {
            const simdi = new Date();
            const cikis = new Date(simdi.getTime() + kalanSureMs);
            const tarih = vakitGunu ?? muhafizVaktiTarihiniSec(vakit, simdi, cikis, bugunuAl(), dunuAl());
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
        // Issue #274 — metin = (ton, ölçü): erken sert/acil adım "VAKİT ÇIKIYOR"
        // demez, vakte özgü nass da taşımaz (arka plan başlığıyla aynı kural).
        if (!sonDakikaDiliMi(seviye, olcuDk)) {
            return seviye === 4
                ? `Namazı geciktirme, hemen namaza dur! (${olcuDk} dk kaldı)`
                : this.girisIcerigiSec(3);
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
        if (uygunIcerikler.length === 0) return 'Vakit bitmek üzere; şimdi kılabilirsin.';

        const random = Math.floor(Math.random() * uygunIcerikler.length);
        return icerikMetniOlustur(uygunIcerikler[random]);
    }
}
