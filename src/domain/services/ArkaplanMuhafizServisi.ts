/**
 * Arka Plan Muhafiz Servisi
 * Uygulama kapali/arkaplanda olsa bile calisacak zamanlanmis bildirimler olusturur
 * 
 * Bu servis setInterval yerine Expo Notifications'in zamanlanmis bildirim
 * ozelligini kullanarak sistem seviyesinde bildirim gonderir.
 */

import * as Notifications from 'expo-notifications';
import { bugunuAl, dunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../../core/vakit/hesapParametreleri';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI, BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { VakitAdi } from '../../core/types';
import { kilinanVakitleriAl } from '../../data/local/LocalNamazServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { basligiOlustur, type MuhafizSeviye } from '../../core/utils/muhafizMetinYardimcisi';
import { muhafizGovdesiSec } from '../../core/muhafiz/muhafizGovdesi';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { VARSAYILAN_PENCERE_YONU, type PencereYonu } from '../../core/muhafiz/pencereTipleri';
import {
    muhafizVakitleriniHesapla,
    yarininImsagiPlanlanirMi,
    butceArtigiMi,
    planlanacakMuhafizVakitleri,
    vakitTeslimAdaylari,
} from '../../core/muhafiz/muhafizTeslimPlani';
import { muhafizTeslimcisiniAl, type VakitZamani } from './MuhafizTeslimcisi';
import { eskiErtelemeKimligiMi, muhafizPlanKimligiMi } from '../../core/muhafiz/planKimligi';
import { muhafizPlaniDegistiBildir } from './muhafizPlaniGozlemcisi';
import { bildirimKategorileriniKaydet } from './bildirimKategorileri';
import { LocalSaatAyarlariServisi } from '../../data/local/LocalSaatAyarlariServisi';
import type { SaatTeslimBaglami } from '../../core/saat/saatAyarlari';

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
    /** Bildirim kategorileri bu süreçte kaydedildi mi (L7 — düğmesiz bildirim olmasın). */
    private kategorilerKayitli = false;
    /** Bu turun saat iş bölümü ayarı (saat W3) — üreticiye geçer (defterle parite). */
    private saatAyarlari: SaatTeslimBaglami | undefined;

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
        try {
            await this.planla(ayarlar);
        } finally {
            // Saat (Wear OS) hazir plani tasir → plan degisince o da tazelenir.
            // `hazirla` ile DOGRULANMIS matris gecer (kimlik paritesi).
            const son = this.ayarlar ?? ayarlar;
            const dinleyiciHatasi = muhafizPlaniDegistiBildir({ aktif: son.aktif, matris: son.matris });
            if (dinleyiciHatasi) {
                Logger.warn('ArkaplanMuhafiz', 'Plan dinleyicisi hata verdi', dinleyiciHatasi);
            }
            // Tur sonu isi (iOS: anons klibi GC). HER cikis yolunda calismali —
            // muhafiz kapaliyken ya da hic vakit kalmamisken de; aksi halde
            // kapatilan muhafizin klipleri cihazda sonsuza kadar kalirdi.
            try {
                await muhafizTeslimcisiniAl().tamamla?.();
            } catch (error) {
                Logger.error('ArkaplanMuhafiz', 'Teslimci tur sonu isi basarisiz', error);
            }
        }
    }

    /**
     * Son ayarlarla yeniden planlar (ayar degismeden TESLIM yetenegi degistiginde —
     * ör. iOS'ta AlarmKit izni verildi, issue #74). Hic yapilandirilmadiysa no-op:
     * acilis zinciri zaten planlayacak.
     */
    public async yenidenPlanla(): Promise<void> {
        if (this.ayarlar) await this.yapilandirVePlanla(this.ayarlar);
    }

    private async planla(ayarlar: ArkaplanMuhafizAyarlari): Promise<void> {
        this.ayarlar = ayarlar;

        Logger.info('ArkaplanMuhafiz', `Muhafiz yapilandiriliyor (aktif: ${ayarlar.aktif})`);

        // Once tum eski muhafiz bildirimlerini temizle.
        await this.tumMuhafizBildirimleriniTemizle();

        // Ayarlar aktif degilse sadece temizle ve cik. Kanal COP TOPLAMA burada da
        // calisir (matris verilmeden): muhafiz kapatildiginda kullanicinin ozel sesli
        // kanallari aksi halde bildirim ayarlarinda sonsuza kadar oksuz kalirdi.
        if (!ayarlar.aktif) {
            await muhafizTeslimcisiniAl().hazirla();
            Logger.info('ArkaplanMuhafiz', 'Muhafiz devre disi, bildirimler temizlendi');
            return;
        }

        // Kategoriler (eylem dugmeleri) PLANLAMADAN ONCE garanti: guncelleme sonrasi
        // yeni/degisen kategori ancak kayit kosunca vardir ve dinleyici
        // kurulumu (index.ts dinamik import) bu turla YARISIR. Kayitsiz kategoriyle
        // gosterilen bildirim dugmesiz cikar. Surec basina bir kez; basarisizsa
        // sonraki turda yeniden denenir. Planlamayi ASLA dusurmez.
        await this.kategorileriGarantile();

        // Kanal id'leri artik SESIN fonksiyonu (bkz. core/muhafiz/sesKimligi.ts) →
        // planlamadan ONCE gerekli kanallar olusturulmali; var olmayan bir kanala
        // gonderilen bildirim Android 8+'ta hic gosterilmez. Ayni cagri oksuz
        // kalmis eski kanallari da toplar.
        //
        // DONEN MATRIS KULLANILIR: `hazirla` cozulemeyen `content://` seslerini
        // (baska cihazdan gelen yedek, silinmis dosya) varsayilana dusurur. Planlama
        // ham matrisle yapilirsa kanal id'si olusturulan kanalla ayrisir ve bildirim
        // VAR OLMAYAN kanala gider = hic gosterilmez.
        this.ayarlar = {
            ...ayarlar,
            matris:
                (await muhafizTeslimcisiniAl().hazirla(ayarlar.matris)) ?? ayarlar.matris,
        };

        // Vakitler + eleme + uyari uretimi SAF plan ureticisinde
        // (`core/muhafiz/muhafizTeslimPlani.ts`). Bildirim defteri (issue #298)
        // AYNI fonksiyonu kuru calistirir; burada ayri bir mantik YAZILMAZ,
        // yoksa rehber ekrani ile cihazdaki plan ayrisir.
        const simdi = new Date();
        // Yarının imsağı da (issue #74 M2): akşam kurulan plan sabahı da kapsasın — OEM
        // 15 dk görevini öldürse (Android) ya da background fetch hiç koşmasa (iOS) da
        // sabah uyarısı kurulu olsun. iOS'ta BÜTÇE ARTIĞI olarak (bkz. `yarininImsagiKipi`).
        const vakitler = muhafizVakitleriniHesapla(this.ayarlar.koordinatlar, simdi, {
            yarininImsagi: yarininImsagiPlanlanirMi(muhafizTeslimcisiniAl().ad),
        });

        // Kilinmis vakitleri al (bugun VE dun icin - gece yarisi gecisleri)
        const kilinanVakitlerMap: Record<string, VakitAdi[]> = {
            [bugunuAl()]: await kilinanVakitleriAl(bugunuAl()),
            [dunuAl()]: await kilinanVakitleriAl(dunuAl()),
        };

        // OZEL GUN (issue #272): aralik aktifken o gunun vakitleri icin ne
        // bildirim ne TTS anons alarmi kurulur. Eski plan yukarida zaten
        // temizlendi; aralik bitince ilk tur (acilis / 15 dk gorevi) planlamayi
        // kendiliginden geri getirir. Kapi VAKTIN GUNUNE bakar (gece yarisindan
        // sonraki yatsi DUNE aittir). Bes tuketici de bu fonksiyondan gectigi
        // icin kapi burada TEK yerde durur.
        const ozelGundeMi = await ozelGunSuzgeciniOku();
        // Saat iş bölümü (saat W3): sabah uyandırması saatteyse telefonda yedek, anons
        // "yalnız saatte" ise telefon TTS planlamaz. Okuyucu asla fırlatmaz.
        this.saatAyarlari = await LocalSaatAyarlariServisi.teslimBaglaminiOku();

        const planGirdisi = {
            matris: this.ayarlar.matris,
            vakitler,
            simdi,
            kilindiMi: (tarih: string, vakit: VakitAdi) => (kilinanVakitlerMap[tarih] || []).includes(vakit),
            ozelGundeMi,
        };
        const gelecekVakitler = planlanacakMuhafizVakitleri(planGirdisi);

        if (gelecekVakitler.length === 0) {
            Logger.info('ArkaplanMuhafiz', 'Gelecek veya kilinmamis vakit bulunamadi');
            return;
        }

        for (const vakit of gelecekVakitler) {
            await this.vakitIcinBildirimPlanla(vakit);
        }

        Logger.info('ArkaplanMuhafiz', `Toplam ${gelecekVakitler.length} vakit icin bildirimler planlandi`);
    }

    private async kategorileriGarantile(): Promise<void> {
        if (this.kategorilerKayitli) return;
        try {
            await bildirimKategorileriniKaydet();
            this.kategorilerKayitli = true;
        } catch (error) {
            Logger.warn('ArkaplanMuhafiz', 'Bildirim kategorileri kaydedilemedi', error);
        }
    }

    /**
     * Belirli bir vakit icin uyarilari teslimciye aktar.
     *
     * Hangi dakikada hangi adimin konusacagi SAF `vakitTeslimAdaylari`'ndan gelir
     * (motor: `vakitUyariPlaniOlustur`); burada yalniz METIN uretilir (rastgele
     * govde secimi) ve teslimci cagrilir.
     */
    private async vakitIcinBildirimPlanla(vakit: VakitZamani): Promise<void> {
        if (!this.ayarlar) return;

        const adaylar = vakitTeslimAdaylari(this.ayarlar.matris, vakit, new Date(), this.saatAyarlari);
        for (const aday of adaylar) {
            const { uyari, yon } = aday;
            const seviye = uyari.seviye as MuhafizSeviye;
            // METIN `olcuDk` ile uretilir (`kalanDk` ZAMANLAMA alanidir): giris
            // yonunde ikisi farklidir ve kalanDk verilirse basligi "YATSI ·
            // 655 dk · VAKİT ÇIKIYOR" gibi ters bir cumle olur.
            const baslik = basligiOlustur(vakit.vakit, seviye, uyari.olcuDk, yon);
            const mesaj = this.bildirimMesajiOlustur(vakit.vakit, seviye, yon, uyari.olcuDk);

            // TESLIM platforma gore ayrisir (Android: kanal + TTS alarmi,
            // iOS: kesinti seviyesi + paket sesi). Id paylasilan yardimcidan gelir
            // (`muhafizBildirimIdOlustur`) — on plan ayni anonsu ayni id ile
            // yeniden planlar; format sapmasi cift konusma uretir.
            await muhafizTeslimcisiniAl().uyariPlanla({
                id: aday.id,
                baslik,
                mesaj,
                zaman: aday.zaman,
                uyari,
                vakit: vakit.vakit,
                muhafizVakti: aday.muhafizVakti,
                tarih: vakit.tarih,
                yon,
                cikis: vakit.cikis,
                ...(butceArtigiMi(vakit, muhafizTeslimcisiniAl().ad) ? { butceArtigi: true as const } : {}),
            });
        }

        Logger.info('ArkaplanMuhafiz', `${vakit.vakit} (${vakit.tarih}) icin ${adaylar.length} bildirim planlandi`);
    }

    /**
     * Bildirim govdesi.
     * Vakit adi ve kalan sure ALMAZ -> ikisi de baslikta (bkz. basligiOlustur).
     *
     * Govde mucadele havuzundan gelir; havuz VAKTE gore filtrelenir (vakte ozgu
     * nass yanlis vakitte cikmasin). Havuzda o (vakit, seviye) icin hicbir sey
     * yoksa yedek metne duser -> govde asla bos kalmaz.
     * Nass ise kunye de eklenir (icerikMetniOlustur).
     *
     * GIRIS YONUNDE MUCADELE HAVUZU KULLANILMAZ: o havuz vaktin SONUNA kuruludur
     * ("Vakit daralmaya basladi", "Son dakikalar") ve vakte ozgu nass tasir —
     * vakit yeni girmisken yanlis hedeftir (AGENTS.md: terk etme ≠ geciktirme).
     * Yerine notr `GIRIS_ICERIK_HAVUZU` kullanilir.
     */
    private bildirimMesajiOlustur(
        vakit: VakitAdi,
        seviye: MuhafizSeviye,
        yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
        olcuDk?: number
    ): string {
        // Secim `core/muhafiz/muhafizGovdesi.ts`'te (saat yuku ayni secimi
        // deterministik oranla tekrarlar). Telefonda rastgelelik Math.random.
        // `olcuDk`: metin = (ton, olcu) kurali (issue #274).
        return muhafizGovdesiSec(vakit, seviye, yon, Math.random, olcuDk);
    }

    /**
     * Belirli bir vakit icin tum bildirimleri iptal et
     * (Namaz kilindigi zaman cagirilir)
     *
     * @param tarih Isaretlenen NAMAZ GUNU (YYYY-MM-DD; ana ekranda gosterilen gun,
     *   bildirim yolunda kimlikteki gun). VERILMELI: verilmezse tarih `new Date()`'ten
     *   tahmin edilir ve gecmis bir gunu isaretlemek BUGUNUN kilinmisligini yazar —
     *   bugunun muhafizi, saat plani ve gun sonu hatirlatmasi o vakti "kilinmis" sanir
     *   (yasanmis hata). Gece yarisindan sonra yatsi icin cagiran zaten DUNU verir.
     *   Iptal kumesi `[tarih, tarih-1]`: tarih bugunse eskisiyle birebir; gecmis bir
     *   gunde bugunun planli uyarilarina DOKUNMAZ.
     */
    public async vakitBildirimleriniIptalEt(vakit: VakitAdi, tarih?: string): Promise<void> {
        // Tarih yoksa hem bugun hem de dun icin iptal et (gece yarisi gecisleri icin)
        const tarihler = tarih ? [tarih, gunEkle(tarih, -1)] : [bugunuAl(), dunuAl()];

        // Gerçek alarmlar (issue #74) expo listesinde yoktur (alarm o tetiğin bildiriminin
        // YERİNE geçer) → önekle native kayıttan iptal edilir.
        for (const tarih of tarihler) {
            muhafizTeslimcisiniAl().vakitYanKanallariniIptalEt?.(
                `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${tarih}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}`
            );
        }

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
                    muhafizTeslimcisiniAl().yanKanaliIptalEt(bildirim.identifier);
                }
            }
        }

        // Iptal edilen vakti dogru tarihe kaydet: verilen namaz gunu, yoksa tahmin.
        const kayitTarihi = tarih ?? this.vakitIcinDogruTarihiAl(vakit, new Date());
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
        muhafizTeslimcisiniAl().tumYanKanallariIptalEt();

        try {
            const tumBildirimler = await Notifications.getAllScheduledNotificationsAsync();
            for (const bildirim of tumBildirimler) {
                const id = bildirim.identifier;
                // Yalniz muhafiz PLANI temizlenir. Ayni `muhafiz_` uzayindaki
                // yatis/muhasebe hatirlatmalari (issue #290) baska bir servisindir.
                // GOC: kaldirilan "Ertele"nin (#289, sahip karari 2026-10-19) guncelleme
                // oncesi kurulmus `_ertele` kopyalari da her turda silinir.
                if (muhafizPlanKimligiMi(id) || eskiErtelemeKimligiMi(id)) {
                    await Notifications.cancelScheduledNotificationAsync(id);
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
            const params = turkiyeHesapParametreleri();
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
     * @param gunTarihi Geri alinan NAMAZ GUNU (bkz. `vakitBildirimleriniIptalEt`):
     *   verilmezse tahmin edilir ve gecmis gunu geri almak BUGUNUN kilinmisligini silerdi.
     */
    public async vakitKilindisiniGeriAl(vakit: VakitAdi, gunTarihi?: string): Promise<void> {
        // Dogru tarihi bul
        const tarih = gunTarihi ?? this.vakitIcinDogruTarihiAl(vakit, new Date());

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
