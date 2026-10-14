/**
 * Cihazlar arası eşitleme (issue #288) — iCloud anahtar-değer deposu sağlayıcısı (iOS).
 *
 * Veri kullanıcının KENDİ iCloud hesabında, uygulamaya ait anahtar-değer alanında
 * durur. Hesap girişi işletim sistemindedir (uygulama giriş istemez). Etiket her
 * yazımda yeni rastgele bir kimliktir (KV deposu sürüm vermez); zarf ile etiket iki
 * ayrı anahtardadır.
 *
 * Yapılandırma: `plugins/withIcloudEsitleme` `{ etkin: true }` (entitlement + App ID
 * capability). Bayrak kapalıyken ya da köprü yokken `yapilandirildiMi() === false` →
 * ekran sağlayıcıyı HİÇ göstermez.
 *
 * Sınır: KV deposu değer başına ve toplamda 1 MB → `ICLOUD_BOYUT_SINIRI` aşılırsa
 * `boyutAsimi` (ekran bunu söyler; veri yerelde kalır).
 */

import naclUtil from 'tweetnacl-util';
import {
  EsitlemeHatasi,
  EsitlemeSaglayicisi,
  UzakKayit,
  UzakMeta,
} from '../../core/esitleme/esitlemeTipleri';
import {
  icloudHesapVarMi,
  icloudModuluVarMi,
  icloudOku,
  icloudSil,
  icloudYaz,
} from '../../../modules/expo-icloud-esitleme/src';

/**
 * CSPRNG (expo-crypto) TEMBEL yüklenir: sağlayıcı kaydı Yedekleme ekranından da
 * okunur ("sağlayıcı var mı?") ve native köprüyü modül yükünde çekmek o ekranın
 * testlerini düşürürdü.
 */
const rastgeleBaytlar = (uzunluk: number): Uint8Array =>
  (require('../../core/utils/yedekSifreleme') as typeof import('../../core/utils/yedekSifreleme')).rastgeleBaytlar(uzunluk);

export const ICLOUD_ZARF_ANAHTARI = 'namaz_akisi_esitleme_zarf';
export const ICLOUD_ETIKET_ANAHTARI = 'namaz_akisi_esitleme_etiket';
/** 1 MB sınırının altında güvenlik payı (etiket + KV meta verisi). */
export const ICLOUD_BOYUT_SINIRI = 900_000;

const utf8Bayt = (metin: string): number => naclUtil.decodeUTF8(metin).length;

export class IcloudSaglayicisi implements EsitlemeSaglayicisi {
  readonly kimlik = 'icloud' as const;
  readonly ad = 'iCloud';

  constructor(private readonly etkin: boolean) {}

  yapilandirildiMi(): boolean {
    return this.etkin && icloudModuluVarMi();
  }

  async oturumVarMi(): Promise<boolean> {
    return this.yapilandirildiMi() && (await icloudHesapVarMi());
  }

  async baglan(): Promise<boolean> {
    // Giriş işletim sistemindedir; uygulama yalnız hesabın açık olduğunu doğrular.
    return this.oturumVarMi();
  }

  async baglantiyiKes(): Promise<void> {
    // Cihazda saklanan iCloud kimlik bilgisi yok.
  }

  private kopruyuDogrula(): void {
    if (!this.yapilandirildiMi()) throw new EsitlemeHatasi('yapilandirilmamis');
  }

  private async cagir<T>(is: () => Promise<T>): Promise<T> {
    this.kopruyuDogrula();
    try {
      return await is();
    } catch (hata) {
      if (hata instanceof EsitlemeHatasi) throw hata;
      throw new EsitlemeHatasi('bilinmiyor');
    }
  }

  async meta(): Promise<UzakMeta | null> {
    return this.cagir(async () => {
      const [zarf, etiket] = await Promise.all([
        icloudOku(ICLOUD_ZARF_ANAHTARI),
        icloudOku(ICLOUD_ETIKET_ANAHTARI),
      ]);
      return zarf ? { etiket: etiket ?? '' } : null;
    });
  }

  async oku(): Promise<UzakKayit | null> {
    return this.cagir(async () => {
      const [zarf, etiket] = await Promise.all([
        icloudOku(ICLOUD_ZARF_ANAHTARI),
        icloudOku(ICLOUD_ETIKET_ANAHTARI),
      ]);
      return zarf ? { icerik: zarf, etiket: etiket ?? '' } : null;
    });
  }

  async yaz(icerik: string): Promise<UzakMeta> {
    if (utf8Bayt(icerik) > ICLOUD_BOYUT_SINIRI) throw new EsitlemeHatasi('boyutAsimi');
    return this.cagir(async () => {
      const etiket = naclUtil.encodeBase64(rastgeleBaytlar(12));
      const zarfYazildi = await icloudYaz(ICLOUD_ZARF_ANAHTARI, icerik);
      if (!zarfYazildi) throw new EsitlemeHatasi('boyutAsimi');
      await icloudYaz(ICLOUD_ETIKET_ANAHTARI, etiket);
      return { etiket };
    });
  }

  async sil(): Promise<void> {
    await this.cagir(async () => {
      await icloudSil(ICLOUD_ZARF_ANAHTARI);
      await icloudSil(ICLOUD_ETIKET_ANAHTARI);
    });
  }
}
