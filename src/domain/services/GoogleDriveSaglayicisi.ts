/**
 * Cihazlar arası eşitleme (issue #288) — Google Drive `appDataFolder` sağlayıcısı.
 *
 * Veri kullanıcının KENDİ Drive'ındaki gizli uygulama klasöründe tek bir dosyadır
 * (`drive.appdata` kapsamı: uygulama yalnız KENDİ klasörünü görür, kullanıcının
 * dosyalarına erişemez; klasör Drive arayüzünde görünmez). Geliştiricinin sunucusu YOK.
 *
 * Yetki: YALNIZ ANDROID, Google Identity Services **Authorization API** (yerel modül
 * `modules/expo-google-yetki`). İstemci kimliği ve yönlendirme adresi GEREKMEZ: Google,
 * uygulamanın paket adı + imza SHA-1'ini Cloud projesindeki Android OAuth istemcileriyle
 * eşler. Eski tarayıcı + özel URI şemalı PKCE akışı KALDIRILDI — Google yeni Android
 * istemcilerinde "Özel URI şeması"nı artık sunmuyor, o akış bu istemcilerle çalışmaz.
 * iOS'ta eşitleme iCloud iledir; Drive iOS'ta sunulmaz (`yapilandirildiMi() === false`).
 *
 * Belirteç yalnız ERİŞİM belirtecidir ve yalnız bellekte tutulur; yenileme belirteci
 * YOK — Play hizmetleri belirteci önbellekler ve `authorize()` kullanıcıya sormadan
 * tazesini verir. Cihazda yalnız "bağlandı" işareti saklanır (`oturumVarMi` ağa çıkmaz).
 *
 * Hata eşlemesi (`EsitlemeHatasi`): ağ hatası / zaman aşımı / 429 / 5xx → `agYok`
 * (geçici, sessiz); izin geri alındı (sessiz yetki onay istiyor) ya da ikinci 401 →
 * `yetkiYok` (kullanıcı yeniden bağlanmalı). 401'de bayat belirteç Play hizmetlerinin
 * önbelleğinden SİLİNİR, sessizce yenisi alınıp BİR KEZ yeniden denenir (silinmeden
 * `authorize()` aynı bayat belirteci döndürürdü).
 */

import naclUtil from 'tweetnacl-util';
import {
  EsitlemeHatasi,
  EsitlemeSaglayicisi,
  UzakKayit,
  UzakMeta,
} from '../../core/esitleme/esitlemeTipleri';
import { GuvenliDepo } from '../../data/local/GuvenliDepo';
import { Logger } from '../../core/utils/Logger';
import {
  GoogleYetkiSonucu,
  googleBelirteciTemizle,
  googleErisimiGeriAl,
  googleYetkiAl,
  googleYetkisiKullanilabilirMi,
} from '../../../modules/expo-google-yetki/src';
/**
 * CSPRNG (expo-crypto) TEMBEL yüklenir: sağlayıcı kaydı Yedekleme ekranından da
 * okunur ("sağlayıcı var mı?") ve native köprüyü modül yükünde çekmek o ekranın
 * testlerini düşürürdü.
 */
const rastgeleBaytlar = (uzunluk: number): Uint8Array =>
  (require('../../core/utils/yedekSifreleme') as typeof import('../../core/utils/yedekSifreleme')).rastgeleBaytlar(uzunluk);

export const DRIVE_DOSYA_ADI = 'namaz-akisi-esitleme.json';
export const DRIVE_KAPSAMI = 'https://www.googleapis.com/auth/drive.appdata';
const IPTAL_ADRESI = 'https://oauth2.googleapis.com/revoke';
const DOSYA_API = 'https://www.googleapis.com/drive/v3/files';
const YUKLEME_API = 'https://www.googleapis.com/upload/drive/v3/files';
/** "Hesap bağlandı" işareti (belirteç DEĞİL; ağa çıkmadan `oturumVarMi` cevabı). */
export const BAGLANTI_ANAHTARI = 'namaz_esitleme_drive_bagli';
/** Eski PKCE akışının yenileme belirteci — bağlan/bağlantıyı kes sırasında temizlenir. */
export const ESKI_YENILEME_BELIRTECI_ANAHTARI = 'namaz_esitleme_drive_yenileme';
const ISTEK_ZAMAN_ASIMI_MS = 20_000;
/**
 * Bellekteki erişim belirteci bu kadar süre kullanılır, sonra Play hizmetlerinden
 * yeniden istenir (Google erişim belirteçleri ~60 dk yaşar; önbellekten almak ucuzdur).
 */
const BELLEK_OMRU_MS = 45 * 60_000;

/** Yetki köprüsü (test için enjekte edilebilir). */
export interface DriveYetkiKaynagi {
  /** Bu cihazda kullanılabilir mi? (Android + köprü + Play hizmetleri) */
  kullanilabilirMi(): boolean;
  yetkiAl(etkilesimli: boolean): Promise<GoogleYetkiSonucu>;
  belirteciTemizle(belirtec: string): Promise<boolean>;
  erisimiGeriAl(): Promise<boolean>;
}

/** Varsayılan kaynak: `modules/expo-google-yetki` (yalnız Android). */
export const androidYetkiKaynagi: DriveYetkiKaynagi = {
  kullanilabilirMi: googleYetkisiKullanilabilirMi,
  yetkiAl: (etkilesimli) => googleYetkiAl([DRIVE_KAPSAMI], etkilesimli),
  belirteciTemizle: googleBelirteciTemizle,
  erisimiGeriAl: () => googleErisimiGeriAl([DRIVE_KAPSAMI]),
};

export interface GoogleDriveBagimliliklari {
  yetki?: DriveYetkiKaynagi;
  istek?: typeof fetch;
  simdi?: () => number;
}

/** Base64url (dolgu yok) — çok parçalı yükleme sınırı için. */
const base64Url = (baytlar: Uint8Array): string =>
  naclUtil.encodeBase64(baytlar).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Verilen kapsamlar Drive kapsamını içeriyor mu? (Ayrıntılı onayda işaret kaldırılabilir.) */
const driveKapsamiVerildiMi = (kapsamlar: string[]): boolean => kapsamlar.includes(DRIVE_KAPSAMI);

export class GoogleDriveSaglayicisi implements EsitlemeSaglayicisi {
  readonly kimlik = 'googleDrive' as const;
  readonly ad = 'Google Drive';

  private erisimBelirteci: string | null = null;
  private erisimAlinmaMs = 0;
  private dosyaKimligi: string | null = null;
  private readonly yetki: DriveYetkiKaynagi;
  private readonly istek: typeof fetch;
  private readonly simdi: () => number;

  constructor(bagimliliklar: GoogleDriveBagimliliklari = {}) {
    this.yetki = bagimliliklar.yetki ?? androidYetkiKaynagi;
    this.istek = bagimliliklar.istek ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
    this.simdi = bagimliliklar.simdi ?? Date.now;
  }

  yapilandirildiMi(): boolean {
    try {
      return this.yetki.kullanilabilirMi();
    } catch {
      return false;
    }
  }

  async oturumVarMi(): Promise<boolean> {
    return (await GuvenliDepo.oku(BAGLANTI_ANAHTARI)) === '1';
  }

  private yapilandirmaKapisi(): void {
    if (!this.yapilandirildiMi()) throw new EsitlemeHatasi('yapilandirilmamis');
  }

  /** Zaman aşımlı `fetch`; ağ hatası `agYok`'a çevrilir. */
  private async getir(adres: string, secenek: RequestInit = {}): Promise<Response> {
    const iptal = new AbortController();
    const zamanlayici = setTimeout(() => iptal.abort(), ISTEK_ZAMAN_ASIMI_MS);
    try {
      return await this.istek(adres, { ...secenek, signal: iptal.signal });
    } catch {
      throw new EsitlemeHatasi('agYok');
    } finally {
      clearTimeout(zamanlayici);
    }
  }

  private belirteciBellegeAl(belirtec: string): string {
    this.erisimBelirteci = belirtec;
    this.erisimAlinmaMs = this.simdi();
    return belirtec;
  }

  private bellegiTemizle(): void {
    this.erisimBelirteci = null;
    this.erisimAlinmaMs = 0;
  }

  /** Oturum düştü (izin geri alındı): yerel işareti sil, `yetkiYok`. */
  private async oturumuDusur(): Promise<never> {
    await GuvenliDepo.sil(BAGLANTI_ANAHTARI);
    this.bellegiTemizle();
    throw new EsitlemeHatasi('yetkiYok');
  }

  async baglan(): Promise<boolean> {
    this.yapilandirmaKapisi();
    const sonuc = await this.yetki.yetkiAl(true);
    switch (sonuc.durum) {
      case 'izin':
        // Kullanıcı ayrıntılı onayda Drive işaretini kaldırdıysa bağlanmış sayılmaz.
        if (!driveKapsamiVerildiMi(sonuc.kapsamlar)) return false;
        this.belirteciBellegeAl(sonuc.belirtec);
        await GuvenliDepo.yaz(BAGLANTI_ANAHTARI, '1');
        await GuvenliDepo.sil(ESKI_YENILEME_BELIRTECI_ANAHTARI);
        return true;
      case 'agYok':
        throw new EsitlemeHatasi('agYok');
      case 'hata':
        // Tipik neden: paket + SHA-1 Cloud projesindeki Android istemcileriyle eşleşmiyor
        // (DEVELOPER_ERROR = 10). Ayrıntı tanı loguna; kullanıcıya genel hata.
        Logger.warn('GoogleDriveSaglayicisi', `Drive yetkisi alınamadı (kod=${sonuc.kod ?? '-'})`);
        throw new EsitlemeHatasi('bilinmiyor');
      default:
        // iptal / mesgul / cozumGerekli (onay ekranı açılamadı)
        return false;
    }
  }

  async baglantiyiKes(): Promise<void> {
    // En iyi çaba: Google tarafında da izni geri al (ağ yoksa yerel silme yeter).
    try {
      if (this.yapilandirildiMi()) {
        const geriAlindi = await this.yetki.erisimiGeriAl();
        let belirtec = this.erisimBelirteci;
        if (!belirtec) {
          const sessiz = await this.yetki.yetkiAl(false);
          belirtec = sessiz.durum === 'izin' ? sessiz.belirtec : null;
        }
        if (belirtec) {
          if (!geriAlindi) {
            // Native geri alma başaramadıysa: erişim belirtecini iptal etmek ona bağlı
            // izni de geri alır.
            await this.getir(IPTAL_ADRESI, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `token=${encodeURIComponent(belirtec)}`,
            });
          }
          await this.yetki.belirteciTemizle(belirtec);
        }
      }
    } catch {
      // Yerel işaret yine silinir.
    }
    await GuvenliDepo.sil(BAGLANTI_ANAHTARI);
    await GuvenliDepo.sil(ESKI_YENILEME_BELIRTECI_ANAHTARI);
    this.bellegiTemizle();
    this.dosyaKimligi = null;
  }

  /**
   * Geçerli erişim belirteci. Bellekte taze değilse Play hizmetlerinden SESSİZCE
   * (onay ekranı açmadan) istenir — arka plan turunda da güvenlidir.
   */
  private async belirtec(): Promise<string> {
    if (this.erisimBelirteci && this.simdi() - this.erisimAlinmaMs < BELLEK_OMRU_MS) {
      return this.erisimBelirteci;
    }
    this.yapilandirmaKapisi();
    if (!(await this.oturumVarMi())) throw new EsitlemeHatasi('yetkiYok');
    const sonuc = await this.yetki.yetkiAl(false);
    switch (sonuc.durum) {
      case 'izin':
        if (!driveKapsamiVerildiMi(sonuc.kapsamlar)) return this.oturumuDusur();
        return this.belirteciBellegeAl(sonuc.belirtec);
      case 'cozumGerekli':
        // Sessiz yetki onay istiyor = kullanıcı izni Google hesabından geri aldı.
        return this.oturumuDusur();
      case 'agYok':
      case 'mesgul':
        throw new EsitlemeHatasi('agYok');
      case 'iptal':
        // Sessiz kipte ekran açılmadığı için kullanıcı iptali olamaz; geçici sayılır,
        // bağlantı işareti SİLİNMEZ (yanlışlıkla "yeniden bağlanın" dedirtmesin).
        throw new EsitlemeHatasi('bilinmiyor');
      default:
        Logger.warn('GoogleDriveSaglayicisi', `Drive belirteci yenilenemedi (kod=${sonuc.kod ?? '-'})`);
        throw new EsitlemeHatasi('bilinmiyor');
    }
  }

  /** 401: bayat belirteci Play hizmetlerinin önbelleğinden siler, yenisini ister. */
  private async belirteciYenile(): Promise<string> {
    const eski = this.erisimBelirteci;
    this.bellegiTemizle();
    if (eski) await this.yetki.belirteciTemizle(eski);
    return this.belirtec();
  }

  /** Yetkili istek: 401'de belirteci bir kez yenileyip yeniden dener. */
  private async yetkili(adres: string, secenek: RequestInit = {}): Promise<Response> {
    const gonder = async (belirtec: string) =>
      this.getir(adres, {
        ...secenek,
        headers: { ...(secenek.headers as Record<string, string> | undefined), Authorization: `Bearer ${belirtec}` },
      });
    let yanit = await gonder(await this.belirtec());
    if (yanit.status === 401) {
      yanit = await gonder(await this.belirteciYenile());
      if (yanit.status === 401) throw new EsitlemeHatasi('yetkiYok');
    }
    if (yanit.status === 429 || yanit.status >= 500) throw new EsitlemeHatasi('agYok');
    if (yanit.status === 403) {
      // Kota/hız sınırı geçicidir; başka 403'ler kapsam/izin sorunudur.
      const metin = await yanit.text().catch(() => '');
      if (/RateLimit|rateLimitExceeded/i.test(metin)) throw new EsitlemeHatasi('agYok');
      if (/storageQuotaExceeded/i.test(metin)) throw new EsitlemeHatasi('boyutAsimi');
      throw new EsitlemeHatasi('yetkiYok');
    }
    return yanit;
  }

  /** `appDataFolder`'daki eşitleme dosyasını bulur (en son değişen). */
  private async dosyaBul(): Promise<{ id: string; version: string } | null> {
    const sorgu = encodeURIComponent(`name='${DRIVE_DOSYA_ADI}' and trashed=false`);
    const yanit = await this.yetkili(
      `${DOSYA_API}?spaces=appDataFolder&q=${sorgu}&orderBy=modifiedTime%20desc&fields=files(id%2Cversion)&pageSize=10`
    );
    if (!yanit.ok) throw new EsitlemeHatasi('bilinmiyor');
    const govde = (await yanit.json()) as { files?: Array<{ id?: unknown; version?: unknown }> };
    const ilk = govde.files?.find((d) => typeof d.id === 'string');
    if (!ilk) {
      this.dosyaKimligi = null;
      return null;
    }
    this.dosyaKimligi = ilk.id as string;
    return { id: ilk.id as string, version: String(ilk.version ?? '') };
  }

  async meta(): Promise<UzakMeta | null> {
    const dosya = await this.dosyaBul();
    return dosya ? { etiket: dosya.version } : null;
  }

  async oku(): Promise<UzakKayit | null> {
    const dosya = await this.dosyaBul();
    if (!dosya) return null;
    const yanit = await this.yetkili(`${DOSYA_API}/${encodeURIComponent(dosya.id)}?alt=media`);
    if (yanit.status === 404) return null;
    if (!yanit.ok) throw new EsitlemeHatasi('bilinmiyor');
    return { icerik: await yanit.text(), etiket: dosya.version };
  }

  async yaz(icerik: string): Promise<UzakMeta> {
    if (this.dosyaKimligi === null) await this.dosyaBul();
    let yanit: Response;
    if (this.dosyaKimligi) {
      yanit = await this.yetkili(
        `${YUKLEME_API}/${encodeURIComponent(this.dosyaKimligi)}?uploadType=media&fields=id%2Cversion`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: icerik }
      );
      if (yanit.status === 404) {
        // Başka cihaz silmiş: yeniden oluştur.
        this.dosyaKimligi = null;
        return this.yaz(icerik);
      }
    } else {
      const sinir = `namazakisi${base64Url(rastgeleBaytlar(12))}`;
      const govde =
        `--${sinir}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify({ name: DRIVE_DOSYA_ADI, parents: ['appDataFolder'] }) +
        `\r\n--${sinir}\r\nContent-Type: application/json\r\n\r\n${icerik}\r\n--${sinir}--`;
      yanit = await this.yetkili(`${YUKLEME_API}?uploadType=multipart&fields=id%2Cversion`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/related; boundary=${sinir}` },
        body: govde,
      });
    }
    if (!yanit.ok) throw new EsitlemeHatasi('bilinmiyor');
    const sonuc = (await yanit.json()) as { id?: unknown; version?: unknown };
    if (typeof sonuc.id === 'string') this.dosyaKimligi = sonuc.id;
    return { etiket: String(sonuc.version ?? '') };
  }

  async sil(): Promise<void> {
    const dosya = await this.dosyaBul();
    if (!dosya) return;
    const yanit = await this.yetkili(`${DOSYA_API}/${encodeURIComponent(dosya.id)}`, {
      method: 'DELETE',
    });
    if (!yanit.ok && yanit.status !== 404) throw new EsitlemeHatasi('bilinmiyor');
    this.dosyaKimligi = null;
  }
}
