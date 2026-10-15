import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NamazAdi, BILDIRIM_SABITLERI, DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import * as LocalNamazServisi from '../../data/local/LocalNamazServisi';
import { ArkaplanMuhafizServisi } from './ArkaplanMuhafizServisi';
import type { VakitAdi } from '../../core/types';
import { VakitSayacBildirimServisi } from './VakitSayacBildirimServisi';
import { gunEkle } from '../../core/utils/TarihYardimcisi';
import { Logger } from '../../core/utils/Logger';
import { eylemSuresiDk } from '../../core/muhafiz/erteleme';
import { bildirimKategorileriniKaydet } from './bildirimKategorileri';
import type { KazaNamazAdi } from '../../core/types/KazaTipleri';
import { localKazayaBorcEkle } from '../../data/local/LocalKazaServisi';
import { muhafizErtelemesiniIsle } from './MuhafizErtelemeServisi';

/**
 * Vakit adi donusturme - ArkaplanMuhafizServisi'nin kullandigi format ile NamazAdi enum arasinda
 * Export edildi: notifee background handler tarafindan kullaniliyor
 */
export const vakitAdiToNamazAdi: Record<string, NamazAdi> = {
  'imsak': NamazAdi.Sabah,
  'gunes': NamazAdi.Gunes,
  'ogle': NamazAdi.Ogle,
  'ikindi': NamazAdi.Ikindi,
  'aksam': NamazAdi.Aksam,
  'yatsi': NamazAdi.Yatsi,
};

/**
 * String'in gecerli bir VakitAdi olup olmadigini kontrol et
 */
function isVakitAdi(vakit: string): vakit is VakitAdi {
  return ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'].includes(vakit);
}

/**
 * Onceki muhafiz bildirimlerini bildirim merkezinden temizle
 * Yeni bildirim geldiginde sadece AYNI VAKTin eski bildirimlerini temizler
 * Farkli vakitlerin bildirimleri korunur
 */
async function oncekiMuhafizBildirimleriniTemizle(yeniBildirimId: string): Promise<void> {
  try {
    const mevcutBildirimler = await Notifications.getPresentedNotificationsAsync();

    // Yeni bildirimin vakit onekini cikar (ornegin: "muhafiz_2025-02-13_vakit_iksam")
    // ID format: muhafiz_YYYY-MM-DD_vakit_VAKITADI_seviye_X_dk_Y
    const vakitOnekMatch = yeniBildirimId.match(
      new RegExp(`^(${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}\\d{4}-\\d{2}-\\d{2}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}[a-z]+)`)
    );
    const yeniVakitOneki = vakitOnekMatch ? vakitOnekMatch[1] : null;

    for (const bildirim of mevcutBildirimler) {
      // Ayni vaktin eski muhafiz bildirimi mi ve yeni gelen bildirim degil mi?
      if (
        bildirim.request.identifier !== yeniBildirimId &&
        yeniVakitOneki &&
        bildirim.request.identifier.startsWith(yeniVakitOneki)
      ) {
        await Notifications.dismissNotificationAsync(bildirim.request.identifier);
      }
    }
  } catch (error) {
    Logger.error('BildirimServisi', 'Onceki muhafiz bildirimleri temizlenirken hata:', error);
  }
}

/**
 * Vakit onekini bildirim ID'sinden cikar
 * Ornek: "muhafiz_2026-03-10_vakit_ikindi_seviye_2_dk_15" → "muhafiz_2026-03-10_vakit_ikindi"
 */
function vakitOnekiniCikar(bildirimId: string): string | null {
  const eslesme = bildirimId.match(
    new RegExp(`^(${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}\\d{4}-\\d{2}-\\d{2}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}[a-z]+)`)
  );
  return eslesme ? eslesme[1] : null;
}

/**
 * Bildirim ayarlarini yapilandir
 */
try {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Eger bu bir muhafiz bildirimiyse, onceki muhafiz bildirimlerini temizle
      if (notification.request.identifier.startsWith(BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ)) {
        await oncekiMuhafizBildirimleriniTemizle(notification.request.identifier);
      }

      return {
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };
    },
  });
} catch (_) {}

/**
 * Bildirim response listener subscription
 */
let responseListenerSubscription: Notifications.EventSubscription | null = null;

interface MuhafizYanitVerisi {
  tip?: string;
  vakit?: string;
  tarih?: string;
  seviye?: number;
  /** Gün sonu muhasebesi (issue #290): vakti çıkmış, kazaya eklenebilecek eksikler. */
  kazayaEklenebilir?: unknown;
  /** Nafile bildirimi (issue #273): 'kusluk' | 'evvabin' | 'teheccud'. */
  tur?: string;
  [anahtar: string]: unknown;
}

/** "Kıldım" düğmesi taşıyan bildirim tipleri (muhafız + yatış/muhasebe, issue #290). */
const KILDIM_TIPLERI = new Set(['muhafiz', 'yatis', 'muhasebe']);

const VAKITTEN_KAZAYA: Record<string, KazaNamazAdi> = {
  imsak: 'Sabah',
  ogle: 'Öğle',
  ikindi: 'İkindi',
  aksam: 'Akşam',
  yatsi: 'Yatsı',
};

const NAFILE_TURLERI = ['kusluk', 'evvabin', 'teheccud'] as const;
type NafileYanitTuru = (typeof NAFILE_TURLERI)[number];
const nafileTuruMu = (t: unknown): t is NafileYanitTuru =>
  typeof t === 'string' && (NAFILE_TURLERI as readonly string[]).includes(t);

/**
 * Kildim aksiyonu callback tipi
 * Domain katmanindan presentation katmanina olay bildirimi icin kullanilir
 */
type KildimCallback = (tarih: string, namazAdi: NamazAdi) => void;
/** Bildirimden "Kazaya ekle" sonrası (UI kaza durumunu tazelesin). */
type KazaEklendiCallback = () => void;

export class BildirimServisi {
  private static instance: BildirimServisi;
  private kategorilerOlusturuldu: boolean = false;
  private islenmisYanitId: string | null = null; // Cold-start tekrar isleme korumasi
  private onKildimCallback: KildimCallback | null = null;
  private onKazaEklendiCallback: KazaEklendiCallback | null = null;

  private constructor() { }

  /** "Kazaya ekle" sonrası presentation katmanını bilgilendir (issue #290). */
  public setOnKazaEklendiCallback(callback: KazaEklendiCallback | null): void {
    this.onKazaEklendiCallback = callback;
  }

  /**
   * Kildim aksiyonu callback'ini ayarla
   * Presentation katmani bu callback uzerinden Redux store'u gunceller
   * Bu sayede domain katmani store'a dogrudan bagimli olmaz
   */
  public setOnKildimCallback(callback: KildimCallback): void {
    this.onKildimCallback = callback;
  }

  public static getInstance(): BildirimServisi {
    if (!BildirimServisi.instance) {
      BildirimServisi.instance = new BildirimServisi();
    }
    return BildirimServisi.instance;
  }

  /**
   * Bildirim dinleyicisini baslat
   * Uygulama basladiginda cagrilmali
   */
  public async baslatBildirimDinleyicisi(): Promise<void> {
    // Kategorileri olustur
    await this.kategorileriOlustur();

    // Eger zaten listener varsa kaldir
    if (responseListenerSubscription) {
      responseListenerSubscription.remove();
    }

    // Yeni listener ekle
    responseListenerSubscription = Notifications.addNotificationResponseReceivedListener(
      this.bildirimYanitiniIsle.bind(this)
    );

    // Cold-start kontrolu: Uygulama bildirim aksiyonuyla baslatildiysa
    // getLastNotificationResponseAsync ile kacirilmis aksiyonu yakala
    try {
      const sonYanit = await Notifications.getLastNotificationResponseAsync();
      if (sonYanit) {
        await this.bildirimYanitiniIsle(sonYanit);
      }
    } catch (error) {
      Logger.error('BildirimServisi', 'Cold-start bildirim kontrolu hatasi:', error);
    }

    Logger.info('BildirimServisi', 'Bildirim dinleyicisi baslatildi');
  }

  /**
   * Bildirim kategorilerini olustur
   */
  private async kategorileriOlustur(): Promise<void> {
    if (this.kategorilerOlusturuldu) {
      return;
    }

    try {
      await bildirimKategorileriniKaydet();
      this.kategorilerOlusturuldu = true;
      Logger.info('BildirimServisi', 'Bildirim kategorileri olusturuldu');
    } catch (error) {
      Logger.error('BildirimServisi', 'Kategori olusturma hatasi:', error);
    }
  }

  /**
   * Bildirim yanitini isle
   * Kullanici bildirim aksiyonuna tikladiginda cagrilir
   */
  private async bildirimYanitiniIsle(
    response: Notifications.NotificationResponse
  ): Promise<void> {
    const { actionIdentifier, notification } = response;

    await this.yanitiIsle(
      notification.request.identifier,
      actionIdentifier,
      notification.request.content.data as MuhafizYanitVerisi,
      {
        baslik: notification.request.content.title,
        govde: notification.request.content.body,
        tarihMs: notification.date,
      }
    );
  }

  /**
   * Android arka plan görevi (uygulama kapalı/arka plandayken basılan aksiyon).
   * Yük expo-notifications'ın native serileştirmesidir; şekli sürüme göre küçük
   * farklar gösterebildiği için savunmalı okunur: veri nesne ya da `dataString`
   * (JSON) olabilir. Tanınmayan yük sessizce yok sayılır.
   */
  public async arkaplanYanitiniIsle(yuk: unknown): Promise<void> {
    const y = (yuk ?? {}) as {
      actionIdentifier?: string;
      notification?: {
        date?: number;
        request?: {
          identifier?: string;
          content?: { data?: unknown; dataString?: string; title?: string | null; body?: string | null };
        };
      };
    };
    const aksiyon = y.actionIdentifier;
    const istek = y.notification?.request;
    if (!aksiyon || !istek?.identifier) return;
    let veri: unknown = istek.content?.data;
    if ((!veri || typeof veri !== 'object') && typeof istek.content?.dataString === 'string') {
      try {
        veri = JSON.parse(istek.content.dataString);
      } catch {
        veri = null;
      }
    }
    if (!veri || typeof veri !== 'object') return;
    await this.yanitiIsle(istek.identifier, aksiyon, veri as MuhafizYanitVerisi, {
      baslik: istek.content?.title,
      govde: istek.content?.body,
      tarihMs: y.notification?.date,
    });
  }

  private async yanitiIsle(
    bildirimId: string,
    actionIdentifier: string,
    data: MuhafizYanitVerisi,
    icerik: { baslik?: string | null; govde?: string | null; tarihMs?: number } = {}
  ): Promise<void> {
    // Ayni yaniti tekrar isleme: listener + cold-start + (Android) arka plan gorevi
    // ayni yaniti uc kez teslim edebilir. Bellek-ici koruma headless surecte
    // sifirlandigi icin son islenen kimlik DISKTE de tutulur.
    // Ertelenen kopya vakit basina SABIT kimlik tasir (yeniden ertelenebilir) →
    // ertelemede kimlige bildirimin gosterilme ani da katilir; yoksa ikinci
    // erteleme "zaten islendi" sanilirdi.
    const ertelemeMi = eylemSuresiDk(actionIdentifier) !== null;
    const yanitId =
      bildirimId + '_' + actionIdentifier + (ertelemeMi && icerik.tarihMs ? '_' + icerik.tarihMs : '');
    if (this.islenmisYanitId === yanitId || (await this.diskteIslenmisMi(yanitId))) {
      Logger.info('BildirimServisi', 'Yanit zaten islendi, atlaniyor:', yanitId);
      return;
    }

    Logger.info('BildirimServisi', 'Bildirim yaniti alindi:', {
      actionIdentifier,
      data,
    });

    // Nafile bildirimi (issue #273): "Kıldım" yalnız o günün o nafilesinin kalan
    // hatırlatmalarını iptal eder; namaz kaydı/puan/seri YAZILMAZ. Muhafız yoluna
    // (`kildimAksiyonunuIsle`) ASLA düşmemeli — o yol farz vakti kaydeder.
    // Android'de eylem native işlenir (`NafileKildimIsleyici` → nafile kuyruğu →
    // `KildimKuyruguServisi`); buraya yalnız iOS'ta ya da native yol kuyruğa
    // yazamadığında gelinir.
    if (data?.tip === 'nafile') {
      if (actionIdentifier !== BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM) return;
      if (!nafileTuruMu(data.tur) || typeof data.tarih !== 'string') return;
      try {
        const { NafileHatirlatmaServisi } =
          require('./NafileHatirlatmaServisi') as typeof import('./NafileHatirlatmaServisi');
        await NafileHatirlatmaServisi.getInstance().kildimIsle(data.tarih, data.tur);
        this.islenmisYanitId = yanitId;
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.ISLENMIS_BILDIRIM_YANITI, yanitId).catch(() => undefined);
      } catch (error) {
        Logger.error('BildirimServisi', 'Nafile Kildim isleme basarisiz:', error);
      }
      return;
    }

    const tip = typeof data?.tip === 'string' ? data.tip : undefined;
    if (!tip || !KILDIM_TIPLERI.has(tip)) {
      return;
    }

    const islendi = async () => {
      this.islenmisYanitId = yanitId;
      await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.ISLENMIS_BILDIRIM_YANITI, yanitId).catch(() => undefined);
    };

    // "Ertele" (issue #289) — Android'de native islenir; buraya yalniz iOS'ta ya
    // da native yol isleyemediginde gelinir.
    if (ertelemeMi && tip === 'muhafiz') {
      await muhafizErtelemesiniIsle({
        kimlik: bildirimId,
        eylem: actionIdentifier,
        baslik: icerik.baslik,
        govde: icerik.govde,
        data: data as Record<string, unknown>,
      });
      await islendi();
      return;
    }

    // "Kazaya ekle" (issue #290, gun sonu muhasebesi)
    if (actionIdentifier === BILDIRIM_SABITLERI.AKSIYONLAR.KAZAYA_EKLE && tip === 'muhasebe') {
      try {
        await this.kazayaEkleAksiyonunuIsle(bildirimId, data.kazayaEklenebilir);
        await islendi();
      } catch (error) {
        Logger.error('BildirimServisi', 'Kazaya ekleme basarisiz, tekrar denenebilir:', error);
      }
      return;
    }

    // "Kildim" aksiyonuna mi tiklandi?
    if (actionIdentifier === BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM) {
      try {
        await this.kildimAksiyonunuIsle(data.vakit, data.tarih);
        // Basariyla islendikten sonra tekrar islemeyi engelle
        await islendi();
      } catch (error) {
        // Basarisiz oldu - yanitId set edilmez, boylece retry mumkun
        Logger.error('BildirimServisi', 'Kildim isleme basarisiz, tekrar denenebilir:', error);
      }
    }
  }

  /**
   * Gun sonu muhasebesindeki "Kazaya ekle" (issue #290): vakti cikmis eksik
   * vakit(ler) kaza defterine birer borc olarak eklenir. Kaza ekraninin ekleme
   * yolu (`borcEklenmisDurum`) kullanilir; store'suz calisir (headless).
   * Bozuk kaza kaydinin USTUNE YAZILMAZ (`localKazayaBorcEkle` reddeder).
   */
  private async kazayaEkleAksiyonunuIsle(bildirimId: string, ham: unknown): Promise<void> {
    const vakitler = Array.isArray(ham) ? ham.filter((v): v is string => typeof v === 'string') : [];
    const eklenecekler = vakitler
      .map((v) => VAKITTEN_KAZAYA[v])
      .filter((ad): ad is KazaNamazAdi => !!ad)
      .map((namazAdi) => ({ namazAdi, sayi: 1 }));
    if (eklenecekler.length === 0) return;

    const sonuc = await localKazayaBorcEkle(eklenecekler);
    if (!sonuc.basarili) throw new Error(sonuc.hata ?? 'Kaza borcu eklenemedi');
    Logger.info('BildirimServisi', `Kazaya eklendi: ${vakitler.join(', ')}`);

    try {
      await Notifications.dismissNotificationAsync(bildirimId);
    } catch {
      // Bildirim zaten kalkmış olabilir.
    }
    if (this.onKazaEklendiCallback) {
      try {
        this.onKazaEklendiCallback();
      } catch (callbackError) {
        Logger.warn('BildirimServisi', 'Kaza callback hatasi:', callbackError);
      }
    }
  }

  private async diskteIslenmisMi(yanitId: string): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.ISLENMIS_BILDIRIM_YANITI)) === yanitId;
    } catch {
      return false;
    }
  }

  /**
   * notifee sayac bildiriminden ("sayac_<tarih>_<vakit>") gelen "Kildim"
   * aksiyonunu isler. Hem arka plan (index.ts) hem on plan (App.tsx) bu tek
   * giris noktasini kullanir; namaz isaretleme + tam temizlik (muhafiz + sayac)
   * her iki yolda ayni sekilde calisir (drift onlenir).
   */
  public async sayacKildimIsle(bildirimId: string): Promise<void> {
    const onek = BILDIRIM_SABITLERI.ONEKLEME.SAYAC;
    if (!bildirimId.startsWith(onek)) {
      return;
    }
    const kalan = bildirimId.slice(onek.length); // "<tarih>_<vakit>"
    const ayrac = kalan.indexOf('_');
    if (ayrac < 0) {
      return;
    }
    const tarih = kalan.slice(0, ayrac);
    const vakit = kalan.slice(ayrac + 1);
    await this.kildimAksiyonunuIsle(vakit, tarih);
  }

  /**
   * Wear OS saatinden gelen "Kildim" (issue #269).
   *
   * Bildirimdeki "Kildim" dugmesiyle BIREBIR ayni govdeyi calistirir (kayit +
   * o vaktin muhafiz/sayac bildirimlerinin iptali) — iki yol ayrisamaz. Headless
   * baglamda (Redux yok) guvenlidir: `onKildimCallback` yoksa atlanir. Hata
   * YUKARI iletilir; kuyruk ogeyi birakip deneme sayacini artirir.
   */
  public async saattenKildimIsle(vakit: string, tarih: string): Promise<void> {
    await this.kildimAksiyonunuIsle(vakit, tarih);
  }

  /**
   * Ortak "Kıldım" kuyruğundan gelen istek (issue #275/#276): Wear saati, ana ekran
   * widget'ı, hızlı ayarlar kutusu, kısayol, `namazakisi://kildim` derin bağlantısı.
   * Bildirimdeki "Kıldım" ile BİREBİR aynı gövde; hata YUKARI iletilir (kuyruk
   * öğeyi bırakıp deneme sayacını artırır).
   */
  public async kuyruktanKildimIsle(vakit: string, tarih: string): Promise<void> {
    await this.kildimAksiyonunuIsle(vakit, tarih);
  }

  /**
   * "Kildim" aksiyonunu isle
   * Namaz durumunu guncelle ve kalan bildirimleri iptal et
   */
  private async kildimAksiyonunuIsle(
    vakit: string | undefined,
    tarih: string | undefined
  ): Promise<void> {
    if (!vakit || !tarih) {
      Logger.error('BildirimServisi', 'Vakit veya tarih eksik');
      return;
    }

    try {
      // Vakit adini NamazAdi enum'una donustur
      const namazAdi = vakitAdiToNamazAdi[vakit];
      if (!namazAdi) {
        Logger.error('BildirimServisi', 'Gecersiz vakit:', vakit);
        return;
      }

      // Namaz durumunu guncelle
      await LocalNamazServisi.localNamazDurumunuGuncelle(tarih, namazAdi, true);
      Logger.info('BildirimServisi', `Namaz kilindi: ${namazAdi} (${tarih})`);

      // Presentation katmanini bilgilendir (UI guncellemesi icin)
      if (this.onKildimCallback) {
        try {
          this.onKildimCallback(tarih, namazAdi);
        } catch (callbackError) {
          Logger.warn('BildirimServisi', 'Kildim callback hatasi:', callbackError);
        }
      }

      if (!isVakitAdi(vakit)) {
        Logger.warn('BildirimServisi', 'Vakit adı doğrulanamadı, iptal işlemi atlandı:', vakit);
      }
      // Zamanlanmış/aktif tüm vakit bildirimlerini temizle
      await this.vakitKilindiTemizle(vakit, tarih);

      Logger.info('BildirimServisi', `${vakit} icin kalan bildirimler iptal edildi`);
    } catch (error) {
      Logger.error('BildirimServisi', 'Kildim aksiyonu isleme hatasi:', error);
      throw error; // Hatayi yukari ilet (deduplikasyon retry mekanizmasi icin)
    }
  }

  /**
   * Namaz kılındığında tüm vakit bildirimlerini temizler:
   * zamanlanmış muhafız bildirimleri, vakit sayacı ve bildirim merkezindeki aktif bildirimler.
   * AnaSayfa (uygulama içi toggle) ve kildimAksiyonunuIsle (bildirimden "Kıldım") tarafından kullanılır.
   */
  public async vakitKilindiTemizle(vakit: string, tarih: string): Promise<void> {
    const gorevler: Promise<void>[] = [this.vakitBildirimleriniKapat(vakit, tarih)];
    if (isVakitAdi(vakit)) {
      gorevler.push(ArkaplanMuhafizServisi.getInstance().vakitBildirimleriniIptalEt(vakit));
      gorevler.push(VakitSayacBildirimServisi.getInstance().vakitSayaciniIptalEt(vakit));
    }
    await Promise.allSettled(gorevler);
  }

  /**
   * Sadece belirli bir vakte ait muhafiz bildirimlerini bildirim merkezinden kapat
   * Diger vakitlerin bildirimleri korunur
   */
  private async vakitBildirimleriniKapat(vakit: string, tarih: string): Promise<void> {
    try {
      const mevcutBildirimler = await Notifications.getPresentedNotificationsAsync();
      // Timezone-safe: gunEkle YYYY-MM-DD string uzerinde calisir, new Date() UTC sorununa yol acmaz
      const dunStr = gunEkle(tarih, -1);

      // Prefix'leri dongu disinda hesapla (performans)
      const bugunOneki = `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${tarih}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}`;
      const dunOneki = `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${dunStr}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}`;

      const kapatilacaklar = mevcutBildirimler
        .map(b => b.request.identifier)
        .filter(id => id.startsWith(bugunOneki) || id.startsWith(dunOneki));

      await Promise.all(kapatilacaklar.map(id => Notifications.dismissNotificationAsync(id)));
    } catch (error) {
      Logger.error('BildirimServisi', 'Vakit bildirimleri kapatilirken hata:', error);
    }
  }

  /**
   * Bildirim merkezindeki eski muhafiz bildirimlerini temizle
   * Her vakit icin yalnizca en son gosterilen bildirimi tutar, daha eskileri siler
   * Uygulama on plana geldiginde veya ilk basladiginda cagrilir (arka plan senaryosu icin)
   */
  public async sunulanEskiMuhafizBildirimleriniTemizle(): Promise<void> {
    try {
      const mevcutBildirimler = await Notifications.getPresentedNotificationsAsync();

      // Muhafiz bildirimlerini vakit onekine gore grupla
      const vakitGruplari = new Map<string, Array<{ id: string; date: number }>>();

      for (const bildirim of mevcutBildirimler) {
        const id = bildirim.request.identifier;
        if (!id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ)) continue;

        const vakitOneki = vakitOnekiniCikar(id);
        if (!vakitOneki) continue;

        if (!vakitGruplari.has(vakitOneki)) {
          vakitGruplari.set(vakitOneki, []);
        }
        vakitGruplari.get(vakitOneki)!.push({ id, date: bildirim.date });
      }

      // Her vakit grubu icin en son bildirimi tut, daha eskileri sil
      for (const [, bildirimler] of vakitGruplari) {
        if (bildirimler.length <= 1) continue;

        // Tarihe gore sirala (buyukten kucuge) - en son = en buyuk tarih
        bildirimler.sort((a, b) => b.date - a.date);

        // Ilki (en son) haric diger bildirimleri kaldir
        for (let i = 1; i < bildirimler.length; i++) {
          await Notifications.dismissNotificationAsync(bildirimler[i].id);
        }
      }

      Logger.info('BildirimServisi', 'Eski muhafiz bildirimleri temizlendi');
    } catch (error) {
      Logger.error('BildirimServisi', 'Eski muhafiz bildirimleri temizlenirken hata:', error);
    }
  }

  /**
   * Bildirim izinlerini kontrol et ve iste
   */
  public async izinIste(): Promise<boolean> {
    const { status: mevcutDurum } = await Notifications.getPermissionsAsync();
    let finalDurum = mevcutDurum;

    if (mevcutDurum !== 'granted') {
      // iOS'ta izin SECENEKLERI acikca istenir; Android'de bu alanlar yok sayilir.
      //
      // `allowBadge: false` BILINCLIDIR: muhafiz bir gorev listesi degil, anlik
      // bir uyaridir — uygulama ikonunda kalici bir sayi birakmak kullaniciyi
      // "temizlemesi gereken" bir borc hissine sokar, hatirlatmanin amaci bu
      // degil. `provideAppNotificationSettings` iOS'un bildirim ayarlarindan
      // uygulamaya donmesini saglar.
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowSound: true,
          allowBadge: false,
          provideAppNotificationSettings: true,
        },
      });
      finalDurum = status;
    }

    if (finalDurum !== 'granted') {
      return false;
    }

    // Android icin bildirim kanallarini olustur
    if (Platform.OS === 'android') {
      // Varsayilan kanal
      await Notifications.setNotificationChannelAsync(BILDIRIM_SABITLERI.KANALLAR.VARSAYILAN, {
        name: 'Genel Bildirimler',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Muhafiz kanali (normal)
      await Notifications.setNotificationChannelAsync(BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ, {
        name: 'Namaz Muhafızı',
        description: 'Namaz vakti hatırlatmaları',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#FF9500',
        sound: 'bildirim.mp3',
      });

      // Muhafiz acil kanali (seviye 3-4)
      await Notifications.setNotificationChannelAsync(BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ_ACIL, {
        name: 'Acil Namaz Hatırlatıcı',
        description: 'Vakit çıkmak üzere - acil hatırlatmalar',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 1000, 500, 1000, 500, 1000],
        lightColor: '#FF3B30',
        sound: 'bildirim.mp3',
        enableVibrate: true,
        bypassDnd: true,
      });

      // Vakit Bildirimleri kanali
      await Notifications.setNotificationChannelAsync(BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM, {
        name: 'Vakit Bildirimleri',
        description: 'Vakit girdiğinde gönderilen hatırlatmalar',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }

    return true;
  }

  /**
   * Anlik bildirim gonder (Yerel)
   */
  public async anlikBildirimGonder(baslik: string, mesaj: string, veri: any = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: baslik,
        body: mesaj,
        data: veri,
        sound: true,
      },
      trigger: null, // Hemen gonder
    });
  }

  /**
   * Belirli bir zaman icin bildirim planla
   */
  public async bildirimPlanla(
    id: string,
    baslik: string,
    mesaj: string,
    saat: number,
    dakika: number,
    tekrarla: boolean = true
  ) {
    // Once varsa eski bildirimi iptal et
    await this.bildirimIptalEt(id);

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: baslik,
          body: mesaj,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: saat,
          minute: dakika,
        },
      });
    } catch (error) {
      Logger.error('BildirimServisi', 'Bildirim planlanamadı:', error);
    }
  }


  /**
   * Planli bildirimi iptal et
   */
  public async bildirimIptalEt(id: string) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  /**
   * Tum planli bildirimleri iptal et
   */
  public async tumBildirimleriIptalEt() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
