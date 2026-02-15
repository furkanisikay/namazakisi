/**
 * Guncelleme Servisi
 *
 * Uygulama guncelleme kontrolu icin provider tabanli mimari.
 * Su an GitHub Releases destekler, ileride Google Play ve App Store
 * kaynaklari kolayca eklenebilir.
 *
 * Ozellikler:
 * - Provider pattern ile genisletilebilir kaynak destegi
 * - Offline-aware: ag baglantisi yoksa sessizce atlar
 * - Akilli onbellekleme: gereksiz API cagrilarindan kacinir
 * - Erteleme destegi: kullanici "Sonra" dedikten sonra belirli sure gostermez
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  UYGULAMA,
  GUNCELLEME_SABITLERI,
  GuncellemeKaynagiTipi,
} from '../../core/constants/UygulamaSabitleri';

// ==================== TIPLER ====================

/**
 * Guncelleme bilgisi
 */
export interface GuncellemeBilgisi {
  /** Yeni versiyon numarasi */
  yeniVersiyon: string;
  /** Mevcut versiyon numarasi */
  mevcutVersiyon: string;
  /** Degisiklik notlari */
  degisiklikNotlari: string;
  /** Indirme/guncelleme baglantisi */
  indirmeBaglantisi: string;
  /** Yayinlanma tarihi */
  yayinTarihi: string;
  /** Guncelleme kaynagi */
  kaynak: GuncellemeKaynagiTipi;
  /** Zorunlu guncelleme mi */
  zorunluMu: boolean;
}

/**
 * Guncelleme kontrol sonucu
 */
export interface GuncellemeKontrolSonucu {
  /** Guncelleme mevcut mu */
  guncellemeMevcut: boolean;
  /** Guncelleme bilgisi (mevcut ise) */
  bilgi: GuncellemeBilgisi | null;
}

/**
 * Onbellek durumu (AsyncStorage'da saklanir)
 */
interface GuncellemeOnbellek {
  /** Son kontrol zamani (timestamp) */
  sonKontrolZamani: number;
  /** Son kontrol sonucu */
  sonSonuc: GuncellemeKontrolSonucu;
  /** Kullanicinin erteledigi versiyon */
  ertelenenVersiyon: string | null;
  /** Erteleme zamani (timestamp) */
  ertelemeZamani: number | null;
}

// ==================== GUNCELLEME KAYNAGI ARAYUZU ====================

/**
 * Guncelleme kaynagi arayuzu
 * Yeni kaynaklar (Play Store, App Store) bu arayuzu uygulayarak eklenir
 */
export interface GuncellemeKaynagi {
  /** Kaynak tipi */
  readonly tip: GuncellemeKaynagiTipi;
  /** Bu platformda destekleniyor mu */
  destekleniyor(): boolean;
  /** En son surumu kontrol et */
  enSonSurumuKontrolEt(): Promise<GuncellemeKontrolSonucu>;
}

// ==================== GITHUB GUNCELLEME KAYNAGI ====================

/**
 * GitHub Releases API uzerinden guncelleme kontrolu
 */
export class GitHubGuncellemeKaynagi implements GuncellemeKaynagi {
  readonly tip: GuncellemeKaynagiTipi = 'github';
  private readonly repoAdresi: string;

  constructor(repoAdresi: string = UYGULAMA.GITHUB_REPO) {
    this.repoAdresi = repoAdresi;
  }

  destekleniyor(): boolean {
    // GitHub releases tum platformlarda calisir
    return true;
  }

  async enSonSurumuKontrolEt(): Promise<GuncellemeKontrolSonucu> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GUNCELLEME_SABITLERI.API_ZAMAN_ASIMI);

    try {
      const yanit = await fetch(
        `https://api.github.com/repos/${this.repoAdresi}/releases/latest`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
          signal: controller.signal,
        }
      );

      if (!yanit.ok) {
        clearTimeout(timeoutId);
        console.warn(`[GuncellemeServisi] GitHub API hatasi: ${yanit.status}`);
        return { guncellemeMevcut: false, bilgi: null };
      }

      const veri = await yanit.json();
      clearTimeout(timeoutId);
      const yeniVersiyon = (veri.tag_name || '').replace(/^v/, '');
      const mevcutVersiyon = UYGULAMA.VERSIYON;

      if (!yeniVersiyon) {
        return { guncellemeMevcut: false, bilgi: null };
      }

      const guncellemeMevcut = versiyonKarsilastir(yeniVersiyon, mevcutVersiyon) > 0;

      if (!guncellemeMevcut) {
        return { guncellemeMevcut: false, bilgi: null };
      }

      // Platform'a uygun indirme baglantisi bul
      const indirmeBaglantisi = this.indirmeBaglantisiBul(veri);

      return {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon,
          mevcutVersiyon,
          degisiklikNotlari: this.degisiklikNotlariniDuzenle(veri.body || ''),
          indirmeBaglantisi,
          yayinTarihi: veri.published_at || '',
          kaynak: 'github',
          zorunluMu: false,
        },
      };
    } catch (hata: any) {
      clearTimeout(timeoutId);

      if (hata?.name === 'AbortError') {
        console.warn('[GuncellemeServisi] GitHub API zaman asimi');
      } else {
        console.warn('[GuncellemeServisi] GitHub API hatasi:', hata?.message);
      }

      return { guncellemeMevcut: false, bilgi: null };
    }
  }

  /**
   * Platform'a uygun APK/IPA indirme baglantisi bul
   * Bulamazsa release sayfasina yonlendir
   */
  private indirmeBaglantisiBul(releaseVeri: any): string {
    const assets = releaseVeri.assets || [];
    const releaseSayfasi = releaseVeri.html_url || `https://github.com/${this.repoAdresi}/releases/latest`;

    if (Platform.OS === 'android') {
      const apk = assets.find(
        (a: any) => a.name?.toLowerCase().endsWith('.apk')
      );
      if (apk?.browser_download_url) {
        return apk.browser_download_url;
      }
    }

    return releaseSayfasi;
  }

  /**
   * GitHub release notlarini temizle ve kisalt
   * Yeni ozellikleri ve bug fixleri anlamli sekilde formatla
   */
  private degisiklikNotlariniDuzenle(ham: string): string {
    if (!ham) return '';

    const satirlar = ham.split('\n');
    const yeniOzellikler: string[] = [];
    const hatalar: string[] = [];
    let aktifBolum: 'added' | 'fixed' | 'changed' | null = null;

    // Gereksiz satirlari filtrelemek icin pattern'ler (satirin basindan kontrol edilir)
    const gereksizPatternler = [
      /^merge pull request/i,
      /^merge pr/i,
      /^pr bot/i,
    ];

    for (const satir of satirlar) {
      const temizSatir = satir.trim();

      // Bolum basliklarini tespit et
      // Hem İngilizce (Added/Fixed/Changed) hem de Türkçe emoji başlıkları desteklenir
      const lowerSatir = temizSatir.toLowerCase();
      if (lowerSatir.includes('### added') || lowerSatir.includes('yeni özellik')) {
        aktifBolum = 'added';
        continue;
      } else if (lowerSatir.includes('### fixed') || lowerSatir.includes('hata düzelt')) {
        aktifBolum = 'fixed';
        continue;
      } else if (lowerSatir.includes('### changed') || lowerSatir.includes('değişiklik')) {
        aktifBolum = 'changed';
        continue;
      }

      // Liste elemanlarini isle (- ile baslayan satirlar)
      if (temizSatir.startsWith('-') || temizSatir.startsWith('*')) {
        const icerik = temizSatir.substring(1).trim();
        if (!icerik) continue;

        // Gereksiz satirlari atla (satirin basindan kontrol et)
        const gereksizMi = gereksizPatternler.some(pattern =>
          pattern.test(icerik)
        );
        if (gereksizMi) continue;

        if (aktifBolum === 'added') {
          yeniOzellikler.push(icerik);
        } else if (aktifBolum === 'fixed') {
          hatalar.push(icerik);
        }
      }
    }

    // Sonuc metnini olustur
    const parcalar: string[] = [];

    if (yeniOzellikler.length > 0) {
      parcalar.push('Yeni Özellikler:');
      yeniOzellikler.forEach(ozellik => {
        parcalar.push(`• ${ozellik}`);
      });
    }

    if (hatalar.length > 0) {
      if (parcalar.length > 0) parcalar.push(''); // Bos satir ekle
      parcalar.push('Hatalar giderildi');
    }

    const sonuc = parcalar.join('\n').trim();

    // Hala bos ise, anlamli bir fallback mesaji dondur
    // Ham metindeki gereksiz bilgileri (commit sayisi, linkler vb.) gostermeyin
    if (!sonuc) {
      return 'Yeni güncelleme mevcut. Detaylar için uygulama mağazasını ziyaret edin.';
    }

    return sonuc.slice(0, 500);
  }
}

// ==================== ANA SERVIS ====================

/**
 * Guncelleme Servisi (Singleton)
 *
 * Kullanim:
 * ```typescript
 * const servis = GuncellemeServisi.getInstance();
 * const sonuc = await servis.guncellemeKontrolEt();
 * ```
 */
export class GuncellemeServisi {
  private static instance: GuncellemeServisi | null = null;
  private kaynaklar: GuncellemeKaynagi[] = [];
  private onbellek: GuncellemeOnbellek | null = null;

  private constructor() {
    // Varsayilan olarak GitHub kaynagini ekle
    this.kaynaklar.push(new GitHubGuncellemeKaynagi());
  }

  public static getInstance(): GuncellemeServisi {
    if (GuncellemeServisi.instance === null) {
      GuncellemeServisi.instance = new GuncellemeServisi();
    }
    return GuncellemeServisi.instance;
  }

  /**
   * Test icin instance'i sifirla
   */
  public static resetInstance(): void {
    GuncellemeServisi.instance = null;
  }

  /**
   * Yeni guncelleme kaynagi ekle
   * Ileride Play Store veya App Store kaynagi eklenebilir
   */
  public kaynakEkle(kaynak: GuncellemeKaynagi): void {
    // Ayni tipte kaynak varsa degistir
    this.kaynaklar = this.kaynaklar.filter(k => k.tip !== kaynak.tip);
    this.kaynaklar.push(kaynak);
  }

  /**
   * Guncelleme kontrol et
   * Onbellek, erteleme ve ag durumunu otomatik yonetir
   *
   * @param zorla - Onbellek ve ertelemeyi atlayarak zorla kontrol et
   */
  public async guncellemeKontrolEt(zorla: boolean = false): Promise<GuncellemeKontrolSonucu> {
    try {
      // Onbellegi yukle
      await this.onbellegiYukle();

      if (!zorla) {
        // Erteleme kontrolu
        if (this.ertelemeSurecindeMi()) {
          return this.onbellek?.sonSonuc || { guncellemeMevcut: false, bilgi: null };
        }

        // Onbellek gecerli mi kontrol et
        if (this.onbellekGecerliMi()) {
          return this.onbellek!.sonSonuc;
        }
      }

      // Ag baglantisi kontrolu (NetInfo ile hizli ve guvenilir)
      const agDurumu = await NetInfo.fetch();
      if (!agDurumu.isConnected) {
        console.log('[GuncellemeServisi] Cevrimdisi - kontrol atlaniyor');
        return this.onbellek?.sonSonuc || { guncellemeMevcut: false, bilgi: null };
      }

      // Desteklenen kaynaklardan kontrol et
      const sonuc = await this.kaynaklardanKontrolEt();

      // Onbellege kaydet
      await this.onbellegeKaydet(sonuc);

      return sonuc;
    } catch (hata) {
      console.error('[GuncellemeServisi] Guncelleme kontrol hatasi:', hata);
      return { guncellemeMevcut: false, bilgi: null };
    }
  }

  /**
   * Kullanici guncellemeyi ertelediginde cagrilir
   */
  public async guncellemeErtele(versiyon: string): Promise<void> {
    await this.onbellegiYukle();

    if (this.onbellek) {
      this.onbellek.ertelenenVersiyon = versiyon;
      this.onbellek.ertelemeZamani = Date.now();
    } else {
      this.onbellek = {
        sonKontrolZamani: Date.now(),
        sonSonuc: { guncellemeMevcut: false, bilgi: null },
        ertelenenVersiyon: versiyon,
        ertelemeZamani: Date.now(),
      };
    }

    await this.onbellegiSakla();
  }

  // ==================== YARDIMCI METODLAR ====================

  /**
   * Desteklenen kaynaklardan sirasyla kontrol et
   * Ilk basarili sonucu dondurur
   */
  private async kaynaklardanKontrolEt(): Promise<GuncellemeKontrolSonucu> {
    for (const kaynak of this.kaynaklar) {
      if (!kaynak.destekleniyor()) {
        continue;
      }

      try {
        const sonuc = await kaynak.enSonSurumuKontrolEt();
        if (sonuc.guncellemeMevcut) {
          return sonuc;
        }
      } catch (hata) {
        console.warn(`[GuncellemeServisi] ${kaynak.tip} kaynagi hatasi:`, hata);
      }
    }

    return { guncellemeMevcut: false, bilgi: null };
  }

  /**
   * Erteleme sureci devam ediyor mu?
   */
  private ertelemeSurecindeMi(): boolean {
    if (!this.onbellek?.ertelemeZamani || !this.onbellek?.ertelenenVersiyon) {
      return false;
    }

    const gecenSure = Date.now() - this.onbellek.ertelemeZamani;
    return gecenSure < GUNCELLEME_SABITLERI.ERTELEME_SURESI;
  }

  /**
   * Onbellek hala gecerli mi?
   *
   * Cache gecersiz kabul edilir eger:
   * 1. Zaman asimi gectiyse (6 saat)
   * 2. Cache'deki "yeni versiyon" artik mevcut uygulama versiyonu ise
   *    (kullanici uygulamayi guncelledi)
   */
  private onbellekGecerliMi(): boolean {
    if (!this.onbellek?.sonKontrolZamani) {
      return false;
    }

    const gecenSure = Date.now() - this.onbellek.sonKontrolZamani;
    const zamanGecerli = gecenSure < GUNCELLEME_SABITLERI.KONTROL_ARALIGI;

    // Eger cache'de bir guncelleme bilgisi varsa ve bu guncelleme
    // mevcut uygulama versiyonuna esit veya daha eskiyse, cache'i gecersiz kil.
    const { bilgi } = this.onbellek.sonSonuc;
    if (bilgi && versiyonKarsilastir(bilgi.yeniVersiyon, UYGULAMA.VERSIYON) <= 0) {
      return false;
    }

    return zamanGecerli;
  }

  /**
   * Onbellegi AsyncStorage'dan yukle
   */
  private async onbellegiYukle(): Promise<void> {
    if (this.onbellek) return;

    try {
      const veri = await AsyncStorage.getItem(GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI);
      if (veri) {
        this.onbellek = JSON.parse(veri);
      }
    } catch (hata) {
      console.warn('[GuncellemeServisi] Onbellek yuklenemedi:', hata);
    }
  }

  /**
   * Sonucu onbellege kaydet
   */
  private async onbellegeKaydet(sonuc: GuncellemeKontrolSonucu): Promise<void> {
    this.onbellek = {
      sonKontrolZamani: Date.now(),
      sonSonuc: sonuc,
      ertelenenVersiyon: this.onbellek?.ertelenenVersiyon || null,
      ertelemeZamani: this.onbellek?.ertelemeZamani || null,
    };

    await this.onbellegiSakla();
  }

  /**
   * Onbellegi AsyncStorage'a yaz
   */
  private async onbellegiSakla(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI,
        JSON.stringify(this.onbellek)
      );
    } catch (hata) {
      console.warn('[GuncellemeServisi] Onbellek kaydedilemedi:', hata);
    }
  }
}

// ==================== YARDIMCI FONKSIYONLAR ====================

/**
 * Semantik versiyon karsilastirma
 *
 * @returns pozitif: v1 > v2, negatif: v1 < v2, sifir: esit
 */
export function versiyonKarsilastir(v1: string, v2: string): number {
  const parcala = (v: string): number[] => {
    return v
      .replace(/^v/, '')
      .split('.')
      .map(p => {
        const sayi = parseInt(p, 10);
        return isNaN(sayi) ? 0 : sayi;
      });
  };

  const p1 = parcala(v1);
  const p2 = parcala(v2);
  const uzunluk = Math.max(p1.length, p2.length);

  for (let i = 0; i < uzunluk; i++) {
    const a = p1[i] || 0;
    const b = p2[i] || 0;
    if (a !== b) return a - b;
  }

  return 0;
}

/** Guncelleme indirme baglantilari icin guvenilir domainler */
const GUVENILIR_DOMAINLER = [
  'github.com',
  'objects.githubusercontent.com',
  'play.google.com',
  'apps.apple.com',
];

/**
 * Indirme baglantisinin guvenilir bir domaine ait olup olmadigini kontrol et
 * API'den gelen URL'lerin phishing icin manipule edilmediginden emin olur
 */
export function guvenilirBaglantiMi(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return GUVENILIR_DOMAINLER.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Yayinlanma tarihini okunabilir formata cevir
 */
export function yayinTarihiniFormatla(isoTarih: string): string {
  if (!isoTarih) return '';

  try {
    const tarih = new Date(isoTarih);
    if (isNaN(tarih.getTime())) return '';
    const gun = tarih.getDate().toString().padStart(2, '0');
    const ay = (tarih.getMonth() + 1).toString().padStart(2, '0');
    const yil = tarih.getFullYear();
    return `${gun}.${ay}.${yil}`;
  } catch {
    return '';
  }
}
