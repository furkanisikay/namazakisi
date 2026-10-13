/**
 * Now Bar / canlı sayaç PLANLAYICISI (issue #282 ikinci aşama).
 *
 * Kullanıcının Now Bar seçimine göre hangi öğenin NE ZAMAN öne çıkacağını
 * (`core/sayac/canliSayacPlani.ts`, saf) hesaplar ve native'e (`CanliPlan.kt`)
 * olay listesi olarak verir; native taraf tek alarm zinciriyle uygular (yoklama
 * YOK, uygulama kapalıyken de).
 *
 * KAYNAKLAR:
 *  - Sayaç servisleri (vakit/iftar/sahur/seri) pencerelerini `kaynakBildir` ile
 *    bildirir. Planlayıcı devraldığında (`devralirMi`: Android 16 + izin + öğe açık)
 *    sayaç KENDİ bildirimini kurmaz — tek sahip planlayıcıdır, çift bildirim yok.
 *  - Vakit "girince/son N dk", cuma ve nafileler planlayıcının kendi adaylarıdır.
 *
 * Bildirimler mutlak zaman taşıdığı için kaynaklar diskte saklanır: arka plan
 * görevi yalnız seri sayacını tazeler, diğer kaynakların son bildirimi oradan okunur.
 *
 * STORE'SUZ: arka plan görevinde Redux yoktur; her şey ham AsyncStorage'dan.
 * Saate (Wear OS) giden pay da burada üretilir ve diske yazılır;
 * `WearSenkronServisi` onu okuyup yüke koyar (`canliSaatGozlemcisi` haber verir).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { gunVakitleriniHesapla, koordinatGecerliMi } from '../../core/nafile/gunVakitleri';
import {
  canliPlanJsonuOlustur,
  canliZamanCizelgesiOlustur,
  nowBarAdaylariniOlustur,
  saatPencereleriniOlustur,
  saatVakitSecimi,
  type CanliAday,
  type PlanGunu,
  type SaatCanliPenceresi,
} from '../../core/sayac/canliSayacPlani';
import { nowBarVaktiMi, type NowBarAyarlari, type NowBarOgesi, type NowBarVakti } from '../../core/sayac/nowBar';
import type { VakitAdi } from '../../core/types';
import { LocalNowBarServisi } from '../../data/local/LocalNowBarServisi';
import { kilinanVakitleriAl } from '../../data/local/LocalNamazServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { canliDurumu, canliPlaniKur, type CanliDurum } from '../../../modules/expo-countdown-notification/src';
import { canliSaatPayiDegisti } from './canliSaatGozlemcisi';

export type CanliSayacKaynagi = 'vakitSayac' | 'iftarSayac' | 'sahurSayac' | 'seriSayac';

type KaynakKaydi = Partial<Record<CanliSayacKaynagi, CanliAday[]>>;

/** Saate (Wear OS) giden pay — `src/core/wear/wearYuku.ts > WearCanli`. */
export interface CanliSaatVerisi {
  vakitler: Record<NowBarVakti, boolean>;
  pencereler: SaatCanliPenceresi[];
}

/** Sayaç servisinin tek sorusu: bu öğe için kendi bildirimimi kurayım mı, öne çıkarayım mı? */
export interface CanliOgeKarari {
  /** Planlayıcı devraldı → sayaç kendi bildirimini KURMAZ (yalnız bildirir). */
  devralir: boolean;
  /** Devralmadıysa eski yolda öne çıkarma isteği gönderilsin mi (ilk aşama davranışı). */
  oneCikar: boolean;
}

const adayGecerliMi = (a: unknown): a is CanliAday => {
  const o = a as Partial<CanliAday> | null;
  return (
    !!o &&
    typeof o.id === 'string' &&
    typeof o.oge === 'string' &&
    typeof o.hedefMs === 'number' &&
    typeof o.baslangicMs === 'number' &&
    !!o.canli &&
    typeof o.canli === 'object'
  );
};

export class CanliSayacPlanlayici {
  private static instance: CanliSayacPlanlayici;
  /** Planlamalar SIRALI: açılışta dört sayaç peş peşe bildirir, eski plan yenisini ezmesin. */
  private zincir: Promise<void> = Promise.resolve();
  /** Son saate giden pay (değişmediyse saat yeniden gönderilmez). */
  private sonSaatJson: string | null = null;

  private constructor() { }

  public static getInstance(): CanliSayacPlanlayici {
    if (!CanliSayacPlanlayici.instance) {
      CanliSayacPlanlayici.instance = new CanliSayacPlanlayici();
    }
    return CanliSayacPlanlayici.instance;
  }

  /**
   * Sayaç servisinin kararı. Devralma YALNIZ öne çıkarma gerçekten açıkken olur
   * (Android 16 + kullanıcı izni + yeni native ikili); aksi halde sayaç ilk
   * aşamadaki gibi kendi bildirimini kurar.
   */
  public async ogeKarari(oge: NowBarOgesi): Promise<CanliOgeKarari> {
    const [ayarlar, durum] = await Promise.all([LocalNowBarServisi.getAyarlar(), this.durum()]);
    const ayar = ayarlar.ogeler[oge];
    return {
      devralir: durum === 'acik' && ayar.acik,
      oneCikar: ayar.acik && ayar.baslangic === 'sayacla',
    };
  }

  /**
   * Bir sayaç servisinin GÜNCEL pencerelerini kaydeder ve planı yeniler. Boş dizi
   * = o kaynakta aday yok (ayar kapandı, gün tamamlandı...). Sayaç, devralınmayan
   * yolda kendi bildirimini kurmadan ÖNCE bunu beklemeli: plan önceki turdan kalan
   * aynı kimlikli bildirimi kaldırırken sayacın taze bildirimini silmesin.
   */
  public kaynakBildir(kaynak: CanliSayacKaynagi, adaylar: CanliAday[]): Promise<void> {
    if (Platform.OS !== 'android') return Promise.resolve();
    return this.sirala(async () => {
      const kayit = await this.kaynaklariOku();
      kayit[kaynak] = adaylar;
      await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.CANLI_SAYAC_KAYNAKLARI, JSON.stringify(kayit));
      await this.planla();
    });
  }

  /** Ayar değişti / konum değişti / arka plan turu: planı baştan kur. */
  public yenidenPlanla(): Promise<void> {
    if (Platform.OS !== 'android') return Promise.resolve();
    return this.sirala(() => this.planla());
  }

  private sirala(is: () => Promise<void>): Promise<void> {
    const tur = this.zincir.then(is).catch((e) => {
      Logger.warn('CanliSayac', 'Plan kurulamadi', e);
    });
    this.zincir = tur;
    return tur;
  }

  /**
   * Köprü fonksiyonu yoksa (eski ikili ya da köprüyü dar mock'layan test) de
   * "desteklenmiyor": sayaçlar ilk aşamadaki yolunda kalır.
   */
  private async durum(): Promise<CanliDurum> {
    if (Platform.OS !== 'android' || typeof canliDurumu !== 'function') return 'desteklenmiyor';
    try {
      return await canliDurumu();
    } catch {
      return 'desteklenmiyor';
    }
  }

  private async planla(): Promise<void> {
    const simdi = Date.now();
    const [ayarlar, kaynaklar, koordinat, ozelGundeMi, durum] = await Promise.all([
      LocalNowBarServisi.getAyarlar(),
      this.kaynaklariOku(),
      this.koordinatOku(),
      ozelGunSuzgeciniOku(),
      this.durum(),
    ]);

    const bugun = bugunuAl();
    const dun = gunEkle(bugun, -1);
    const kilinan: Record<string, VakitAdi[]> = {
      [dun]: await kilinanVakitleriAl(dun).catch(() => [] as VakitAdi[]),
      [bugun]: await kilinanVakitleriAl(bugun).catch(() => [] as VakitAdi[]),
    };
    const kilinmisMi = (tarih: string, vakit: NowBarVakti) => (kilinan[tarih] ?? []).includes(vakit);

    const gunler: PlanGunu[] = koordinat
      ? [-1, 0, 1, 2].map((ofset) => {
          const tarih = gunEkle(bugun, ofset);
          return { tarih, vakitler: gunVakitleriniHesapla(koordinat, tarih) };
        })
      : [];
    const kendi = gunler.length
      ? nowBarAdaylariniOlustur({ ayarlar, simdiMs: simdi, gunler, kilinmisMi, ozelGundeMi })
      : [];
    const sayaclar = Object.values(kaynaklar)
      .flat()
      .filter((a) => a.hedefMs > simdi)
      // Kılınmış vaktin sayaç penceresi (bildirildikten sonra kılındıysa) düşer.
      .filter((a) => !(nowBarVaktiMi(a.oge) && a.canli.kildim && kilinmisMi(a.canli.kildim.tarih, a.oge)));
    const adaylar = [...sayaclar, ...kendi];

    // Telefon: yalnız öne çıkarma AÇIKKEN plan kurulur; değilse eski plan temizlenir
    // (sayaçlar bu durumda devralınmaz, kendi yollarındadır).
    if (durum !== 'desteklenmiyor' && typeof canliPlaniKur === 'function') {
      const olaylar = durum === 'acik' ? canliZamanCizelgesiOlustur(adaylar, ayarlar, simdi) : [];
      await canliPlaniKur(canliPlanJsonuOlustur(olaylar));
      Logger.info('CanliSayac', `Now Bar plani kuruldu: ${olaylar.length} olay`);
    }

    await this.saatPayiniYaz(adaylar, ayarlar, simdi);
  }

  /** Saatin payı telefonun desteğinden BAĞIMSIZDIR (saat kendi yüzeyini çizer). */
  private async saatPayiniYaz(adaylar: CanliAday[], ayarlar: NowBarAyarlari, simdi: number): Promise<void> {
    const veri: CanliSaatVerisi = {
      vakitler: saatVakitSecimi(ayarlar),
      pencereler: saatPencereleriniOlustur(adaylar, ayarlar, simdi),
    };
    const json = JSON.stringify(veri);
    if (json === this.sonSaatJson) return;
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.CANLI_SAAT_VERISI, json);
    this.sonSaatJson = json;
    canliSaatPayiDegisti();
  }

  private async kaynaklariOku(): Promise<KaynakKaydi> {
    try {
      const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.CANLI_SAYAC_KAYNAKLARI);
      if (!ham) return {};
      const o = JSON.parse(ham) as Record<string, unknown> | null;
      if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
      const sonuc: KaynakKaydi = {};
      for (const k of ['vakitSayac', 'iftarSayac', 'sahurSayac', 'seriSayac'] as const) {
        const dizi = o[k];
        if (Array.isArray(dizi)) sonuc[k] = dizi.filter(adayGecerliMi);
      }
      return sonuc;
    } catch {
      return {};
    }
  }

  /** Konum anahtarı birincil, eski kayıtlar için muhafız blob'u yedek (`arkaplandaKoordinatOku` ile aynı). */
  private async koordinatOku(): Promise<{ lat: number; lng: number } | null> {
    for (const anahtar of [DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI, DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI]) {
      try {
        const ham = await AsyncStorage.getItem(anahtar);
        if (!ham) continue;
        const k = (JSON.parse(ham) as { koordinatlar?: { lat: number; lng: number } } | null)?.koordinatlar;
        if (koordinatGecerliMi(k)) return k;
      } catch {
        // bozuk kayıt: sıradaki kaynağa geç
      }
    }
    return null;
  }

  /** Yalnız testler için. */
  public __testIcinSifirla(): void {
    this.zincir = Promise.resolve();
    this.sonSaatJson = null;
  }
}
