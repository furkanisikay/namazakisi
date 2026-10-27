/**
 * Vakit Sayaci Bildirim Servisi
 *
 * Native Kotlin modulu (expo-countdown-notification) kullanarak
 * bildirim body'sinde gercek zamanli geri sayim gosterir.
 * Foreground Service + CountDownTimer ile batarya verimli calisir.
 */

import { hatirlatmaKurulabilirMi } from '../../data/local/LocalCihazRoluServisi';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import { zamanTetigiOlustur } from './notifeeTetik';
import { bugunuAl, dunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../../core/utils/Logger';
import { DEPOLAMA_ANAHTARLARI, BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { startCountdown, stopCountdown } from '../../../modules/expo-countdown-notification/src';
import type { VakitAdi } from '../../core/types';
import type { MuhafizVakti } from '../../core/muhafiz/matrisTipleri';
import { muhafizVakitleriniHesapla } from '../../core/muhafiz/muhafizTeslimPlani';
import { sayacEsigiAl, sayacVakitleriniSec } from '../../core/bildirim/sayacPlani';
import { kilinanVakitleriAl } from '../../data/local/LocalNamazServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { vakitCanliYukuOlustur, type CanliGuncellemeYuku } from '../../core/sayac/canliGuncelleme';
import { CANLI_SAYAC_KANALI, type CanliAday } from '../../core/sayac/canliSayacPlani';
import { bicim, metin } from '../../core/dil/aktifDil';
import { VAKIT_ADLARI } from '../../core/utils/muhafizMetinYardimcisi';
import { CanliSayacPlanlayici, type CanliOgeKarari } from './CanliSayacPlanlayici';


/** Planlayıcıya ulaşılamazsa ilk aşamanın davranışı: devralma yok, öne çıkarma isteği var. */
const ILK_ASAMA_KARARI: CanliOgeKarari = { devralir: false, oneCikar: true };

interface VakitZamani {
  vakit: VakitAdi;
  giris: Date;
  cikis: Date;
  tarih: string; // YYYY-MM-DD formatında vakit günü
}

interface SayacAyarlari {
  aktif: boolean;
  koordinatlar: { lat: number; lng: number };
  /**
   * Vakit BAŞINA sayaç başlangıç eşiği (dk). Faz 3: eşikler artık global değil,
   * muhafız matrisinden vakit bazlı türetilir (`sayacBaslangicEsikleriHesapla`).
   * Bir vakit haritada yoksa/0 ise o vakit için sayaç planlanmaz.
   */
  baslangicEsikleri: Partial<Record<MuhafizVakti, number>>;
  /**
   * Namaz muhafızı aktif mi? Aktifse (ve o vakti muhafız gerçekten kapsıyorsa)
   * vakit sayacı bildirimi planlanmaz: sayaç tam olarak muhafız başlangıç
   * eşiğinde başladığından muhafızın ilk-seviye hatırlatmasıyla EŞ ZAMANLI
   * çakışan gereksiz bir "çıkmak üzere" bildirimi üretir (#90).
   * Muhafız kapalıyken sayaç normal çalışır.
   */
  muhafizAktif?: boolean;
  /**
   * Muhafızın gerçekten uyardığı vakitler (`muhafizUyarilanVakitleriBul`).
   * `muhafizAktif` iken bastırma YALNIZ bu vakitlere uygulanır: kullanıcı tek bir
   * vakti matriste tümden susturduysa (tüm seviyeler 'sessiz') orada çakışacak
   * muhafız bildirimi yoktur → sayaç çalışmalı, aksi halde o vakit için hiçbir
   * hatırlatma kalmazdı. Verilmezse (undefined) geriye uyumlu davranış: TÜM
   * vakitler kapsanmış sayılır (eski global bastırma).
   */
  muhafizUyarilanVakitler?: MuhafizVakti[];
}

export class VakitSayacBildirimServisi {
  private static instance: VakitSayacBildirimServisi;
  private ayarlar: SayacAyarlari | null = null;
  private kanalOlusturuldu: boolean = false;

  private constructor() { }

  public static getInstance(): VakitSayacBildirimServisi {
    if (!VakitSayacBildirimServisi.instance) {
      VakitSayacBildirimServisi.instance = new VakitSayacBildirimServisi();
    }
    return VakitSayacBildirimServisi.instance;
  }

  /**
   * Servisi yapılandır ve bildirimleri planla
   */
  public async yapilandirVePlanla(ayarlar: SayacAyarlari): Promise<void> {
    this.ayarlar = ayarlar;

    // Önce tüm sayaç bildirimlerini temizle
    await this.tumSayacBildirimleriniTemizle();

    // iOS'ta desteklenmiyor
    if (Platform.OS !== 'android') {
      Logger.info('VakitSayac', 'iOS desteklenmiyor, atlanıyor');
      return;
    }

    // Aktif değilse bitir (Now Bar planlayıcısına da "aday yok").
    if (!ayarlar.aktif || !(await hatirlatmaKurulabilirMi())) {
      Logger.info('VakitSayac', 'Sayaç devre dışı');
      await this.canliKaynagiBildir([]);
      return;
    }

    // Eleme kuralı SAF üreticide (`core/bildirim/sayacPlani.ts`): bildirim
    // defteri (issue #298) aynı listeyi sayar.
    //  - Muhafız aktifken, muhafızın UYARDIĞI vakitlerde sayaç planlanmaz (#90):
    //    sayaç muhafız başlangıç eşiğinde başladığından ilk hatırlatmayla
    //    çakışırdı. Tümden susturulan vakit bastırılmaz.
    //  - Özel gün (issue #272): kapı vaktin GÜNÜNE bakar.
    //  - Kılınmış, geçmiş, eşiksiz vakit ve güneş planlanmaz.
    const simdi = new Date();
    const vakitler = muhafizVakitleriniHesapla(ayarlar.koordinatlar, simdi);
    const kilinanMap: Record<string, VakitAdi[]> = {
      [bugunuAl()]: await kilinanVakitleriAl(bugunuAl()),
      [dunuAl()]: await kilinanVakitleriAl(dunuAl()),
    };
    const ozelGundeMi = await ozelGunSuzgeciniOku();

    const secimGirdisi = {
      vakitler,
      simdi,
      baslangicEsikleri: ayarlar.baslangicEsikleri,
      muhafizAktif: ayarlar.muhafizAktif,
      muhafizUyarilanVakitler: ayarlar.muhafizUyarilanVakitler,
      kilindiMi: (tarih: string, vakit: VakitAdi) => (kilinanMap[tarih] || []).includes(vakit),
      ozelGundeMi,
    };
    const gelecekVakitler = sayacVakitleriniSec(secimGirdisi);

    // Now Bar YEDEĞİ (saha raporu: "saatte görünüyor, telefonda görünmüyor"): muhafız
    // bir vakti uyardığında sayaç BİLDİRİMİ kurulmaz (#90 çakışması). Now Bar'ın
    // varsayılanı "Sayaçla" olduğu için muhafızı açık her kullanıcıda o vakitler
    // telefonda HİÇ öne çıkmıyordu; saat ise aynı vakti muhafız planından gösteriyordu.
    // Bastırılan vakitler, sayacın başlayacağı AYNI anda, yalnız Now Bar adayı
    // (kaynak 'nowBar' → yarışı kaybedince GİZLENİR, sıradan sayaç bildirimi olmaz)
    // olarak bildirilir. Sayaç bildirimi yine kurulmaz; #90 korunur.
    const nowBarYedekleri = sayacVakitleriniSec({ ...secimGirdisi, muhafizAktif: false }).filter(
      (v) => !gelecekVakitler.some((g) => g.tarih === v.tarih && g.vakit === v.vakit)
    );

    // Now Bar (issue #282 ikinci aşama): pencereler planlayıcıya bildirilir —
    // kendi bildirimini kurmadan ÖNCE (plan, önceki turdan kalan aynı kimlikli
    // bildirimi kaldırırken bu turun taze sayacını silmesin).
    const kararlar = new Map<VakitAdi, CanliOgeKarari>();
    for (const v of gelecekVakitler) {
      if (!kararlar.has(v.vakit)) kararlar.set(v.vakit, await this.canliKarari(v.vakit));
    }
    await this.canliKaynagiBildir([
      ...gelecekVakitler.map((v) => this.canliAdayi(v)),
      ...nowBarYedekleri.map((v) => this.nowBarYedekAdayi(v)),
    ]);

    if (gelecekVakitler.length === 0) {
      Logger.info('VakitSayac', 'Gelecek veya kılınmamış vakit bulunamadı');
      return;
    }

    // notifee kanalını oluştur (ilk seferinde) — planlanacak vakit YOKSA
    // (ör. muhafız hepsini kapsıyor) kanal açmaya da gerek yok.
    await this.kanalOlustur();

    for (const vakit of gelecekVakitler) {
      await this.vakitIcinSayacPlanla(vakit, kararlar.get(vakit.vakit) ?? ILK_ASAMA_KARARI);
    }

    Logger.info('VakitSayac', `Toplam ${gelecekVakitler.length} vakit için sayaç planlandı`);
  }

  /** Now Bar: bu vakit için planlayıcı devraldı mı? (hata → ilk aşama davranışı) */
  private async canliKarari(vakit: VakitAdi): Promise<CanliOgeKarari> {
    if (vakit === 'gunes') return { devralir: false, oneCikar: false };
    try {
      return await CanliSayacPlanlayici.getInstance().ogeKarari(vakit);
    } catch {
      return ILK_ASAMA_KARARI;
    }
  }

  private async canliKaynagiBildir(adaylar: CanliAday[]): Promise<void> {
    try {
      await CanliSayacPlanlayici.getInstance().kaynakBildir('vakitSayac', adaylar);
    } catch {
      // Plan kurulamazsa sayaç eski yolunda çalışmaya devam eder.
    }
  }

  /** Sayacın başlangıcı: o vaktin muhafız/sayaç eşiği kadar çıkıştan önce. */
  private sayacBaslangiciMs(vakit: VakitZamani): number {
    return vakit.cikis.getTime() - this.vakitEsiginiAl(vakit.vakit) * 60 * 1000;
  }

  private canliYuku(vakit: VakitZamani): CanliGuncellemeYuku {
    return vakitCanliYukuOlustur({
      girisMs: vakit.giris.getTime(),
      cikisMs: vakit.cikis.getTime(),
      sayacBaslangicMs: this.sayacBaslangiciMs(vakit),
      tarih: vakit.tarih,
      vakit: vakit.vakit,
    });
  }

  /** Planlayıcıya giden aday (kimlik/başlık/kanal sayacın kendisiyle AYNI). */
  private canliAdayi(vakit: VakitZamani): CanliAday {
    const ad = VAKIT_ADLARI[vakit.vakit];
    return {
      oge: vakit.vakit as Exclude<VakitAdi, 'gunes'>,
      kaynak: 'sayac',
      id: `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}${vakit.tarih}_${vakit.vakit}`,
      baslangicMs: this.sayacBaslangiciMs(vakit),
      dogalBaslangicMs: vakit.giris.getTime(),
      hedefMs: vakit.cikis.getTime(),
      baslik: bicim(metin().sayac.vakit.baslik, { ad }),
      govdeSablonu: `${bicim(metin().sayac.vakit.govde, { ad })}\n\u23F1\uFE0F {time}`,
      kanalId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_SAYAC,
      tema: 'vakit',
      hedefteKaybol: false,
      canli: this.canliYuku(vakit),
    };
  }

  /**
   * Muhafızın bastırdığı vaktin YALNIZ Now Bar adayı: aynı kimlik (Kıldım iptali aynen
   * çalışır), aynı başlangıç; kanal Now Bar'ın kendi kanalı, hedefte kaybolur.
   */
  private nowBarYedekAdayi(vakit: VakitZamani): CanliAday {
    return {
      ...this.canliAdayi(vakit),
      kaynak: 'nowBar',
      kanalId: CANLI_SAYAC_KANALI,
      hedefteKaybol: true,
      sayacYedegi: true,
    };
  }

  /**
   * O vaktin sayaç başlangıç eşiği (dk). Faz 3: eşik vakit bazlıdır.
   * Geçersiz/eksik/0 değer -> 0 döner (o vakit planlanmaz).
   */
  private vakitEsiginiAl(vakit: VakitAdi): number {
    return sayacEsigiAl(this.ayarlar?.baslangicEsikleri, vakit);
  }

  /**
   * notifee kanalını oluştur
   */
  private async kanalOlustur(): Promise<void> {
    if (this.kanalOlusturuldu) {
      return;
    }

    try {
      // Eski kanali sil (LOW importance, Samsung'da gorunmuyor)
      try { await notifee.deleteChannel('vakit_sayac'); } catch (_) { }

      await notifee.createChannel({
        id: BILDIRIM_SABITLERI.KANALLAR.VAKIT_SAYAC,
        name: metin().sayac.vakit.kanal,
        description: metin().sayac.vakit.kanalAciklama,
        importance: AndroidImportance.DEFAULT,
        vibration: false,
        sound: '', // Sessiz
      });

      this.kanalOlusturuldu = true;
      Logger.info('VakitSayac', 'notifee kanalı oluşturuldu');
    } catch (error) {
      Logger.error('VakitSayac', 'Kanal oluşturulamadı:', error);
    }
  }

  /**
   * Belirli bir vakit için sayaç bildirimi planla
   * Her vakit için 2 trigger notification:
   * 1. Muhafiz ilk bildirimle eş zamanlı başlayan chronometer countdown
   * 2. Vakit çıkışında replace + otomatik kapanma
   */
  private async vakitIcinSayacPlanla(vakit: VakitZamani, karar: CanliOgeKarari): Promise<void> {
    if (!this.ayarlar) return;

    const simdi = new Date();
    const cikisSuresi = vakit.cikis.getTime();
    // Eşik VAKİT BAZLI (Faz 3): sayaç, o vaktin muhafız başlangıç eşiğinde başlar.
    const sayacBaslangic = this.sayacBaslangiciMs(vakit);

    const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}${vakit.tarih}_${vakit.vakit}`;
    const vakitAdlari = VAKIT_ADLARI;

    // A) Geri sayim bildirimi - native modül ile body'de countdown
    const tetikZamani = Math.max(sayacBaslangic, simdi.getTime() + 5000);
    const vakitBasligi = bicim(metin().sayac.vakit.baslik, { ad: vakitAdlari[vakit.vakit] });
    const bodyTemplate = `${bicim(metin().sayac.vakit.govde, { ad: vakitAdlari[vakit.vakit] })}\n\u23F1\uFE0F {time}`;

    // Now Bar (issue #282 ikinci aşama): planlayıcı devraldıysa sayacı o gösterir
    // (tam başlangıçta, exact alarmla). Yalnız A atlanır; B (çıkışta temizleme)
    // zararsızdır ve bildirim defteri (#298) iki tetiği saymaya devam eder —
    // defter bu yolda en fazla vakit başına bir fazla sayar (ihtiyatlı taraf).
    if (karar.devralir) {
      Logger.info('VakitSayac', `${vakit.vakit} sayacı Now Bar planlayıcısında`);
    } else if (tetikZamani <= simdi.getTime() + 5000) {
      // Eger zaten muhafiz baslangic araligindaysak hemen native countdown baslat
      try {
        startCountdown({
          id: bildirimId,
          targetTimeMs: cikisSuresi,
          title: vakitBasligi,
          bodyTemplate: bodyTemplate,
          channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_SAYAC,
          themeType: 'vakit',
          // Live Update (issue #282): API 36+'da durum çubuğu çipi / Now Bar,
          // vakit penceresi ilerlemesi ve "Kıldım" eylemi. Native taraf
          // desteklemiyorsa eski görünüm BİREBİR kalır. Kullanıcı Now Bar'da
          // bu vakti kapattıysa öne çıkarma istenmez.
          canli: karar.oneCikar ? this.canliYuku(vakit) : undefined,
        });
        Logger.info('VakitSayac', `${vakit.vakit} icin native sayac hemen baslatildi`);
      } catch (error) {
        Logger.error('VakitSayac', `Native sayac baslatilamadi (${vakit.vakit}):`, error);
      }
    } else {
      // Gelecekte tetiklenecek - trigger ile placeholder bildirim gonder,
      // arkaplan gorevi (muhafiz) tetiklenince native countdown baslatilacak
      try {
        const trigger = await zamanTetigiOlustur(tetikZamani);
        const bildirimIcerigi = {
          id: bildirimId,
          title: vakitBasligi,
          body: bicim(metin().sayac.vakit.govde, { ad: vakitAdlari[vakit.vakit] }),
          android: {
            channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_SAYAC,
            ongoing: true,
            autoCancel: false,
            pressAction: { id: 'default' },
            actions: [
              {
                title: metin().bildirim.eylem.kildim,
                pressAction: { id: 'kildim' },
              },
            ],
          },
        };
        await notifee.createTriggerNotification(bildirimIcerigi, trigger);
        const tetikTarih = new Date(tetikZamani);
        Logger.info('VakitSayac', `${vakit.vakit} icin sayac planlandi: ${tetikTarih.toLocaleTimeString()}`);
      } catch (error) {
        Logger.error('VakitSayac', `Trigger bildirim planlanamadı (${vakit.vakit}):`, error);
      }
    }

    // B) Vakit sonu temizleme (farkli ID - trigger cakismasini onler)
    const temizlemeId = `${bildirimId}_bitis`;
    try {
      const temizlemeTrigger = await zamanTetigiOlustur(cikisSuresi);

      await notifee.createTriggerNotification(
        {
          id: temizlemeId,
          title: '',
          body: '',
          android: {
            channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_SAYAC,
            ongoing: false,
            autoCancel: true,
            timeoutAfter: 100,
          },
        },
        temizlemeTrigger
      );

      Logger.info('VakitSayac', `${vakit.vakit} için temizleme planlandı`);
    } catch (error) {
      Logger.error('VakitSayac', `Temizleme planlanamadı (${vakit.vakit}):`, error);
    }
  }

  /**
   * Belirli bir vakit için sayaç bildirimini iptal et
   */
  /**
   * Sayac bildiriminin asama gecisinde (notifee DELIVERED) onceki asama
   * bildirimlerini iptal eder. Arka plan ve on plan handler'lari icin ortak.
   */
  public async asamaGecisiniIsle(bildirimId: string): Promise<void> {
    if (bildirimId.endsWith('_vakitgirdi')) {
      await notifee.cancelNotification(bildirimId.replace('_vakitgirdi', ''));
    } else if (bildirimId.endsWith('_bitis')) {
      const baseId = bildirimId.replace('_bitis', '');
      await notifee.cancelNotification(baseId);
      await notifee.cancelNotification(`${baseId}_vakitgirdi`);
    }
  }

  public async vakitSayaciniIptalEt(vakit: VakitAdi, gunTarihi?: string): Promise<void> {
    // `gunTarihi` = isaretlenen namaz gunu: gecmis bir gunu isaretlemek bugunun
    // sayacini kapatmasin. Verilmezse eski davranis (bugun + dun).
    const tarihler = gunTarihi ? [gunTarihi, gunEkle(gunTarihi, -1)] : [bugunuAl(), dunuAl()];

    for (const tarih of tarihler) {
      const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}${tarih}_${vakit}`;
      try {
        stopCountdown(bildirimId); // native foreground countdown'u da durdur (toplu temizlemeyle tutarli)
        await notifee.cancelNotification(bildirimId);
        await notifee.cancelTriggerNotification(bildirimId);
        // Temizleme trigger'ini da iptal et
        await notifee.cancelTriggerNotification(`${bildirimId}_bitis`);
        Logger.info('VakitSayac', `Bildirim iptal edildi: ${bildirimId}`);
      } catch (error) {
        // Hata olsa bile devam et
      }
    }
  }

  /**
   * Tüm sayaç bildirimlerini temizle
   */
  public async tumSayacBildirimleriniTemizle(): Promise<void> {
    try {
      // Goruntulenen vakit sayac bildirimlerinin ID'lerini topla ve native countdown'lari durdur
      const gosterilenler = await notifee.getDisplayedNotifications();
      for (const bildirim of gosterilenler) {
        if (bildirim.id && bildirim.id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.SAYAC)) {
          // Native countdown'i ID bazli durdur (stopAll diger sayaclari da oldurur)
          try { stopCountdown(bildirim.id); } catch (_) { }
          await notifee.cancelNotification(bildirim.id);
        }
      }

      // Trigger bildirimleri iptal et
      const triggerIds = await notifee.getTriggerNotificationIds();
      for (const id of triggerIds) {
        if (id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.SAYAC)) {
          await notifee.cancelTriggerNotification(id);
        }
      }

      Logger.info('VakitSayac', 'Tum sayac bildirimleri temizlendi');
    } catch (error) {
      Logger.error('VakitSayac', 'Bildirimler temizlenirken hata:', error);
    }
  }

  // ============================================================
  // TARİH YARDIMCI METOTLARI
  // ============================================================

}
