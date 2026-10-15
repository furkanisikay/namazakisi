/**
 * Cihazlar arası eşitleme (issue #288) — Google Drive `appDataFolder` sağlayıcısı.
 *
 * Veri kullanıcının KENDİ Drive'ındaki gizli uygulama klasöründe tek bir dosyadır
 * (`drive.appdata` kapsamı: uygulama yalnız KENDİ klasörünü görür, kullanıcının
 * dosyalarına erişemez; klasör Drive arayüzünde görünmez). Geliştiricinin sunucusu YOK.
 *
 * Giriş: native Google Sign-In kütüphanesi EKLENMEDİ (Play Services auth + ayrı
 * yapılandırma). Yerine OAuth 2.0 yetkilendirme kodu + PKCE (RFC 7636, istemci sırrı
 * YOK — kurulu uygulama istemcisi) `expo-web-browser.openAuthSessionAsync` ile yürür;
 * belirteç değişimi/yenilemesi düz `fetch`. Yenileme belirteci güvenli depoda, erişim
 * belirteci yalnız bellekte.
 *
 * Hata eşlemesi (`EsitlemeHatasi`): ağ hatası / zaman aşımı / 429 / 5xx → `agYok`
 * (geçici, sessiz); yenileme reddedildi (`invalid_grant`) ya da ikinci 401 → `yetkiYok`
 * (kullanıcı yeniden bağlanmalı). 401 bir kez belirteç yenilenip YENİDEN denenir.
 */

import naclUtil from 'tweetnacl-util';
import { sha256 } from '@noble/hashes/sha2';
import {
  EsitlemeHatasi,
  EsitlemeSaglayicisi,
  UzakKayit,
  UzakMeta,
} from '../../core/esitleme/esitlemeTipleri';
import { GuvenliDepo } from '../../data/local/GuvenliDepo';
/**
 * CSPRNG (expo-crypto) TEMBEL yüklenir: sağlayıcı kaydı Yedekleme ekranından da
 * okunur ("sağlayıcı var mı?") ve native köprüyü modül yükünde çekmek o ekranın
 * testlerini düşürürdü.
 */
const rastgeleBaytlar = (uzunluk: number): Uint8Array =>
  (require('../../core/utils/yedekSifreleme') as typeof import('../../core/utils/yedekSifreleme')).rastgeleBaytlar(uzunluk);

export const DRIVE_DOSYA_ADI = 'namaz-akisi-esitleme.json';
export const DRIVE_KAPSAMI = 'https://www.googleapis.com/auth/drive.appdata';
const YETKI_ADRESI = 'https://accounts.google.com/o/oauth2/v2/auth';
const BELIRTEC_ADRESI = 'https://oauth2.googleapis.com/token';
const IPTAL_ADRESI = 'https://oauth2.googleapis.com/revoke';
const DOSYA_API = 'https://www.googleapis.com/drive/v3/files';
const YUKLEME_API = 'https://www.googleapis.com/upload/drive/v3/files';
export const YENILEME_BELIRTECI_ANAHTARI = 'namaz_esitleme_drive_yenileme';
const ISTEK_ZAMAN_ASIMI_MS = 20_000;
/** Erişim belirteci bitimine bu kadar kala yenilenir (saat kayması payı). */
const BITIS_PAYI_MS = 60_000;

/** Tarayıcı oturumu (test için enjekte edilebilir). */
export type YetkiOturumu = (
  url: string,
  yonlendirme: string
) => Promise<{ type: string; url?: string }>;

export interface GoogleDriveBagimliliklari {
  istek?: typeof fetch;
  yetkiOturumu?: YetkiOturumu;
  simdi?: () => number;
}

/** Base64url (dolgu yok) — PKCE ve state için. */
const base64Url = (baytlar: Uint8Array): string =>
  naclUtil.encodeBase64(baytlar).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** `a=b&c=d` gövdesi (form-urlencoded). */
const formGovdesi = (alanlar: Record<string, string>): string =>
  Object.entries(alanlar)
    .map(([a, d]) => `${encodeURIComponent(a)}=${encodeURIComponent(d)}`)
    .join('&');

/**
 * Yönlendirme adresinin sorgu parametreleri. RN'in `URLSearchParams`'ı eksik
 * uygulandığı için elle ayrıştırılır (`?` ile `#` arası).
 */
export const sorguParametreleri = (adres: string): Record<string, string> => {
  const sonuc: Record<string, string> = {};
  const soru = adres.indexOf('?');
  if (soru < 0) return sonuc;
  const kare = adres.indexOf('#', soru);
  const sorgu = adres.slice(soru + 1, kare < 0 ? undefined : kare);
  for (const parca of sorgu.split('&')) {
    if (!parca) continue;
    const esit = parca.indexOf('=');
    const coz = (x: string) => {
      try {
        return decodeURIComponent(x.replace(/\+/g, ' '));
      } catch {
        return x;
      }
    };
    const ad = coz(esit < 0 ? parca : parca.slice(0, esit));
    sonuc[ad] = esit < 0 ? '' : coz(parca.slice(esit + 1));
  }
  return sonuc;
};

const varsayilanYetkiOturumu: YetkiOturumu = async (url, yonlendirme) => {
  const tarayici = require('expo-web-browser') as typeof import('expo-web-browser');
  return tarayici.openAuthSessionAsync(url, yonlendirme);
};

export class GoogleDriveSaglayicisi implements EsitlemeSaglayicisi {
  readonly kimlik = 'googleDrive' as const;
  readonly ad = 'Google Drive';

  private erisimBelirteci: string | null = null;
  private erisimBitisMs = 0;
  private dosyaKimligi: string | null = null;
  private readonly istek: typeof fetch;
  private readonly yetkiOturumu: YetkiOturumu;
  private readonly simdi: () => number;

  constructor(
    private readonly istemciKimligi: string | null,
    private readonly yonlendirme: string | null,
    bagimliliklar: GoogleDriveBagimliliklari = {}
  ) {
    this.istek = bagimliliklar.istek ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
    this.yetkiOturumu = bagimliliklar.yetkiOturumu ?? varsayilanYetkiOturumu;
    this.simdi = bagimliliklar.simdi ?? Date.now;
  }

  yapilandirildiMi(): boolean {
    return !!this.istemciKimligi && !!this.yonlendirme;
  }

  async oturumVarMi(): Promise<boolean> {
    return (await GuvenliDepo.oku(YENILEME_BELIRTECI_ANAHTARI)) !== null;
  }

  private istemci(): { kimlik: string; yonlendirme: string } {
    if (!this.istemciKimligi || !this.yonlendirme) {
      throw new EsitlemeHatasi('yapilandirilmamis');
    }
    return { kimlik: this.istemciKimligi, yonlendirme: this.yonlendirme };
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

  /** Belirteç uç noktası yanıtını işler; yenileme belirteci geldiyse saklar. */
  private async belirtecYanitiniIsle(yanit: Response): Promise<string> {
    if (yanit.status >= 500 || yanit.status === 429) throw new EsitlemeHatasi('agYok');
    let govde: { access_token?: unknown; expires_in?: unknown; refresh_token?: unknown } = {};
    try {
      govde = await yanit.json();
    } catch {
      govde = {};
    }
    if (!yanit.ok || typeof govde.access_token !== 'string') {
      throw new EsitlemeHatasi('yetkiYok');
    }
    if (typeof govde.refresh_token === 'string') {
      await GuvenliDepo.yaz(YENILEME_BELIRTECI_ANAHTARI, govde.refresh_token);
    }
    const sureSn = typeof govde.expires_in === 'number' ? govde.expires_in : 3600;
    this.erisimBelirteci = govde.access_token;
    this.erisimBitisMs = this.simdi() + sureSn * 1000 - BITIS_PAYI_MS;
    return govde.access_token;
  }

  async baglan(): Promise<boolean> {
    const { kimlik, yonlendirme } = this.istemci();
    const dogrulayici = base64Url(rastgeleBaytlar(32));
    const meydanOkuma = base64Url(sha256(naclUtil.decodeUTF8(dogrulayici)));
    const durum = base64Url(rastgeleBaytlar(16));
    const adres =
      `${YETKI_ADRESI}?` +
      formGovdesi({
        client_id: kimlik,
        redirect_uri: yonlendirme,
        response_type: 'code',
        scope: DRIVE_KAPSAMI,
        code_challenge: meydanOkuma,
        code_challenge_method: 'S256',
        state: durum,
        access_type: 'offline',
        prompt: 'consent',
      });

    const sonuc = await this.yetkiOturumu(adres, yonlendirme);
    if (sonuc.type !== 'success' || !sonuc.url) return false;
    const parametreler = sorguParametreleri(sonuc.url);
    // CSRF: dönen state bizim ürettiğimiz olmalı.
    if (parametreler.state !== durum || !parametreler.code) return false;

    const yanit = await this.getir(BELIRTEC_ADRESI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formGovdesi({
        client_id: kimlik,
        code: parametreler.code,
        code_verifier: dogrulayici,
        grant_type: 'authorization_code',
        redirect_uri: yonlendirme,
      }),
    });
    await this.belirtecYanitiniIsle(yanit);
    return true;
  }

  async baglantiyiKes(): Promise<void> {
    const yenileme = await GuvenliDepo.oku(YENILEME_BELIRTECI_ANAHTARI);
    if (yenileme) {
      // En iyi çaba: Google tarafında da izni geri al (ağ yoksa yerel silme yeter).
      try {
        await this.getir(IPTAL_ADRESI, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formGovdesi({ token: yenileme }),
        });
      } catch {
        // Yerel kimlik bilgisi yine silinir.
      }
    }
    await GuvenliDepo.sil(YENILEME_BELIRTECI_ANAHTARI);
    this.erisimBelirteci = null;
    this.erisimBitisMs = 0;
    this.dosyaKimligi = null;
  }

  /** Geçerli erişim belirteci; gerekiyorsa yenileme belirteciyle tazeler. */
  private async belirtec(zorla = false): Promise<string> {
    if (!zorla && this.erisimBelirteci && this.simdi() < this.erisimBitisMs) {
      return this.erisimBelirteci;
    }
    const { kimlik } = this.istemci();
    const yenileme = await GuvenliDepo.oku(YENILEME_BELIRTECI_ANAHTARI);
    if (!yenileme) throw new EsitlemeHatasi('yetkiYok');
    const yanit = await this.getir(BELIRTEC_ADRESI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formGovdesi({ client_id: kimlik, refresh_token: yenileme, grant_type: 'refresh_token' }),
    });
    try {
      return await this.belirtecYanitiniIsle(yanit);
    } catch (hata) {
      if (hata instanceof EsitlemeHatasi && hata.kod === 'yetkiYok') {
        // Yenileme reddedildi (izin geri alındı / parola değişti): oturum yok say.
        await GuvenliDepo.sil(YENILEME_BELIRTECI_ANAHTARI);
        this.erisimBelirteci = null;
      }
      throw hata;
    }
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
      yanit = await gonder(await this.belirtec(true));
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
