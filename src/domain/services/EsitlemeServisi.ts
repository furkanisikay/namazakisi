/**
 * Cihazlar arası eşitleme (issue #288) — motor + kurulum.
 *
 * SUNUCUSUZ ve İSTEĞE BAĞLI (varsayılan kapalı). Veri kullanıcının KENDİ bulut
 * alanında (Drive `appDataFolder` / iCloud) tek bir uçtan uca şifreli zarf olarak
 * durur; anahtar kullanıcı parolasından türetilir, geliştirici içeriği göremez.
 *
 * MOTOR (bir tur): uzak meta → (değiştiyse) indir → çöz → yerel ile AKILLI birleştir
 * (mevcut içe aktarma yolu: `birlestirmePlaniOlustur` + `planiDiskeYaz`; ön planda
 * `iceAktarmayiUygula` thunk'ı) → birleşmiş yerel uzaktakinden farklıysa yeniden
 * şifrele → yükle. Son yazan kazanmaz: iki cihaz aynı anda yüklese bile kaybeden
 * cihaz verisini yerelde tutar ve bir sonraki turda union ile geri yükler.
 *
 * "Yalnız değiştiyse yükle": karar `icerikOzeti` ile verilir (birleştirmenin
 * yakınsadığı görünüm; bkz. `core/esitleme/esitlemeIcerigi.ts`). Uzak etiket son
 * eşitlemedekiyle aynıysa içerik hiç İNDİRİLMEZ.
 *
 * HİÇBİR ŞEY FIRLATMAZ: sonuç nesnesi döner. Ağ yoksa `agYok` — arka planda sessiz.
 * Uzaktaki kayıt bozuksa ya da daha yeni bir uygulama sürümündense ÜZERİNE YAZILMAZ.
 */

import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Depolama } from '../../data/local/Depolama';
import { YedekPayload } from '../../core/types';
import {
  EsitlemeDurumu,
  EsitlemeHataKodu,
  EsitlemeSaglayicisi,
  SaglayiciKimligi,
  esitlemeDurumunuNormalizeEt,
  hataKodunaCevir,
} from '../../core/esitleme/esitlemeTipleri';
import { zarfiAc, zarfiAyristir, zarfOlustur } from '../../core/esitleme/esitlemeZarfi';
import {
  esitlemeIcerigineIndir,
  icerikNormalizeEt,
  icerikOzeti,
} from '../../core/esitleme/esitlemeIcerigi';
import {
  KdfParametreleri,
  anahtarTuret,
  yeniKdfParametreleri,
} from '../../core/esitleme/anahtarTuretme';
import { rastgeleBaytlar } from '../../core/utils/yedekSifreleme';
import { Logger } from '../../core/utils/Logger';
import { AnahtarSonucu, EsitlemeAnahtarDeposu } from './EsitlemeAnahtarDeposu';
import { saglayiciAl } from './esitlemeSaglayicilari';

/** Bir eşitleme turunun sonucu. */
export type EsitlemeSonucu =
  | { tur: 'guncel' }
  | { tur: 'indirildi' }
  | { tur: 'yuklendi' }
  | { tur: 'indirildiVeYuklendi' }
  /** Arka planda anahtar türetmesi gerekti; uygulama açılınca yapılır. */
  | { tur: 'ertelendi' }
  | { tur: 'kapali' }
  | { tur: 'hata'; kod: EsitlemeHataKodu };

/** Motorun dış bağımlılıkları (test ve ön/arka plan ayrımı için enjekte edilir). */
export interface EsitlemeOrtami {
  saglayici: EsitlemeSaglayicisi;
  /** Yerel verinin anlık görüntüsü (`YedeklemeServisi.mevcutVeriyiTopla`). */
  yerelTopla: () => Promise<YedekPayload>;
  /** Gelen veriyi AKILLI birleştirip uygular (ön plan: içe aktarma thunk'ı). */
  uygula: (gelen: YedekPayload) => Promise<void>;
  anahtarAl: (kdf: KdfParametreleri | null) => Promise<AnahtarSonucu>;
  simdi: () => Date;
}

/** Turun durum güncellemesi (başarılı turda). */
export interface TurSonucu {
  sonuc: EsitlemeSonucu;
  etiket?: string;
  ozet?: string;
}

const hata = (kod: EsitlemeHataKodu): TurSonucu => ({ sonuc: { tur: 'hata', kod } });

const yukle = async (
  o: EsitlemeOrtami,
  yerel: YedekPayload,
  anahtar: Uint8Array,
  kdf: KdfParametreleri
): Promise<string> => {
  const duzMetin = JSON.stringify(esitlemeIcerigineIndir(yerel));
  const meta = await o.saglayici.yaz(zarfOlustur(duzMetin, anahtar, kdf, o.simdi()));
  return meta.etiket;
};

/**
 * Tek eşitleme turu (saf orkestrasyon; durum diske YAZILMAZ — çağıran yazar).
 * `durum` son başarılı turun etiket/özetini taşır.
 */
export async function esitlemeTuru(
  o: EsitlemeOrtami,
  durum: Pick<EsitlemeDurumu, 'sonEtiket' | 'sonOzet'>
): Promise<TurSonucu> {
  try {
    const meta = await o.saglayici.meta();
    let yerel = await o.yerelTopla();
    let yerelOzet = icerikOzeti(yerel);

    // Uzakta kayıt yok (ilk cihaz ya da silinmiş): önbellekteki anahtarla yükle.
    if (!meta) {
      const a = await o.anahtarAl(null);
      if (a.tur !== 'hazir') return a.tur === 'ertelendi' ? { sonuc: { tur: 'ertelendi' } } : hata('parolaGerekli');
      const etiket = await yukle(o, yerel, a.anahtar, a.kdf);
      return { sonuc: { tur: 'yuklendi' }, etiket, ozet: yerelOzet };
    }

    // Uzak, son eşitlemeden beri DEĞİŞMEDİ: indirmeye gerek yok.
    if (durum.sonEtiket !== null && meta.etiket === durum.sonEtiket && durum.sonOzet) {
      if (yerelOzet === durum.sonOzet) return { sonuc: { tur: 'guncel' } };
      const a = await o.anahtarAl(null);
      if (a.tur !== 'hazir') return a.tur === 'ertelendi' ? { sonuc: { tur: 'ertelendi' } } : hata('parolaGerekli');
      const etiket = await yukle(o, yerel, a.anahtar, a.kdf);
      return { sonuc: { tur: 'yuklendi' }, etiket, ozet: yerelOzet };
    }

    const kayit = await o.saglayici.oku();
    if (!kayit) {
      // meta ile oku arasında silindi: uzak yok gibi davran.
      const a = await o.anahtarAl(null);
      if (a.tur !== 'hazir') return a.tur === 'ertelendi' ? { sonuc: { tur: 'ertelendi' } } : hata('parolaGerekli');
      const etiket = await yukle(o, yerel, a.anahtar, a.kdf);
      return { sonuc: { tur: 'yuklendi' }, etiket, ozet: yerelOzet };
    }

    const ayr = zarfiAyristir(kayit.icerik);
    if (ayr.tur === 'bozuk') return hata('bozukVeri');
    if (ayr.tur === 'surumYeni') return hata('surumYeni');

    const a = await o.anahtarAl(ayr.zarf.kdf);
    if (a.tur === 'ertelendi') return { sonuc: { tur: 'ertelendi' } };
    if (a.tur !== 'hazir') return hata('parolaGerekli');

    const duzMetin = zarfiAc(ayr.zarf, a.anahtar);
    if (duzMetin === null) return hata('parolaYanlis');
    let ham: unknown;
    try {
      ham = JSON.parse(duzMetin);
    } catch {
      return hata('bozukVeri');
    }
    const gelen = icerikNormalizeEt(ham);
    if (!gelen) return hata('bozukVeri');
    const gelenOzet = icerikOzeti(gelen);

    let indirildi = false;
    if (gelenOzet !== yerelOzet) {
      await o.uygula(gelen);
      indirildi = true;
      yerel = await o.yerelTopla();
      yerelOzet = icerikOzeti(yerel);
    }

    if (yerelOzet === gelenOzet) {
      return { sonuc: { tur: indirildi ? 'indirildi' : 'guncel' }, etiket: kayit.etiket, ozet: gelenOzet };
    }
    // Yerelde uzakta olmayan veri var: birleşmiş hâli yükle (aynı tuz/parametre).
    const etiket = await yukle(o, yerel, a.anahtar, ayr.zarf.kdf);
    return {
      sonuc: { tur: indirildi ? 'indirildiVeYuklendi' : 'yuklendi' },
      etiket,
      ozet: yerelOzet,
    };
  } catch (e) {
    return hata(hataKodunaCevir(e));
  }
}

// ---------------------------------------------------------------------------
// Servis: durum kalıcılığı, kilit, kurulum, arka plan
// ---------------------------------------------------------------------------

/** Arka plan turunun üst süresi (15 dk görevinin ~30 sn'lik bütçesi paylaşılır). */
export const ARKA_PLAN_ZAMAN_ASIMI_MS = 20_000;

let devamEden: Promise<EsitlemeSonucu> | null = null;

const durumuOku = async (): Promise<EsitlemeDurumu> =>
  esitlemeDurumunuNormalizeEt(await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.ESITLEME_DURUMU));

const durumuYaz = (durum: EsitlemeDurumu): Promise<void> =>
  Depolama.yaz(DEPOLAMA_ANAHTARLARI.ESITLEME_DURUMU, durum);

/** Yerel anlık görüntü (tembel: YedeklemeServisi paylaşım/dosya köprülerini çeker). */
const yerelTopla = async (): Promise<YedekPayload> => {
  const { mevcutVeriyiTopla } = require('./YedeklemeServisi') as typeof import('./YedeklemeServisi');
  return mevcutVeriyiTopla();
};

/**
 * Store'suz uygulama (arka plan): içe aktarmanın DİSK adımının aynısı. Store açılışta
 * diskten yüklenir; seviye/istatistik reconcile ile türetilir.
 */
export const diskeUygula = async (gelen: YedekPayload): Promise<void> => {
  const { mevcutVeriyiTopla, planiDiskeYaz } = require('./YedeklemeServisi') as typeof import('./YedeklemeServisi');
  const { birlestirmePlaniOlustur, AKILLI_SECIMLER } = require('./YedekBirlestirmeServisi') as typeof import('./YedekBirlestirmeServisi');
  const mevcut = await mevcutVeriyiTopla();
  await planiDiskeYaz(birlestirmePlaniOlustur(mevcut, gelen, AKILLI_SECIMLER));
};

export interface EsitleSecenekleri {
  /** Gelen veriyi uygulama yolu (ön plan: `iceAktarmayiUygula`; arka plan: `diskeUygula`). */
  uygula: (gelen: YedekPayload) => Promise<void>;
  /** Anahtar türetmeye (scrypt, saniyeler) izin var mı? Arka planda `false`. */
  turetebilir: boolean;
}

const turuKos = async (secenek: EsitleSecenekleri): Promise<EsitlemeSonucu> => {
  const durum = await durumuOku();
  if (!durum.aktif) return { tur: 'kapali' };
  const saglayici = saglayiciAl(durum.saglayici);
  let sonuc: TurSonucu;
  if (!saglayici || !saglayici.yapilandirildiMi()) {
    sonuc = hata('yapilandirilmamis');
  } else if (!(await saglayici.oturumVarMi())) {
    sonuc = hata('yetkiYok');
  } else {
    sonuc = await esitlemeTuru(
      {
        saglayici,
        yerelTopla,
        uygula: secenek.uygula,
        anahtarAl: (kdf) => EsitlemeAnahtarDeposu.anahtarAl(kdf, secenek.turetebilir),
        simdi: () => new Date(),
      },
      durum
    );
  }

  // Kurulum/kapatma tur sürerken değişmiş olabilir → güncel durumun üstüne yaz.
  const guncel = await durumuOku();
  if (!guncel.aktif || guncel.saglayici !== durum.saglayici) return sonuc.sonuc;
  if (sonuc.sonuc.tur === 'hata') {
    await durumuYaz({ ...guncel, sonHata: sonuc.sonuc.kod });
    if (sonuc.sonuc.kod !== 'agYok') {
      Logger.warn('EsitlemeServisi', `Eşitleme başarısız: ${sonuc.sonuc.kod}`);
    }
  } else if (sonuc.sonuc.tur !== 'ertelendi') {
    await durumuYaz({
      ...guncel,
      sonEtiket: sonuc.etiket ?? guncel.sonEtiket,
      sonOzet: sonuc.ozet ?? guncel.sonOzet,
      sonEsitleme: new Date().toISOString(),
      sonHata: null,
    });
  }
  return sonuc.sonuc;
};

/** Kurulum modu: `sifirla` uzaktaki kaydı silip yeni parolayla baştan kurar. */
export type KurulumModu = 'baslat' | 'sifirla';

export const EsitlemeServisi = {
  durumuOku,

  /**
   * Bir eşitleme turu. Eşzamanlı çağrılar AYNI turu paylaşır (açılış + ekran düğmesi
   * + arka plan görevi çakışırsa iki yükleme olmaz).
   */
  esitle(secenek: EsitleSecenekleri): Promise<EsitlemeSonucu> {
    if (!devamEden) {
      devamEden = turuKos(secenek)
        .catch((e): EsitlemeSonucu => ({ tur: 'hata', kod: hataKodunaCevir(e) }))
        .finally(() => {
          devamEden = null;
        });
    }
    return devamEden;
  },

  /**
   * 15 dk'lık arka plan görevi: store'suz, türetmesiz, zaman aşımlı. ASLA fırlatmaz;
   * ağ yoksa sessizce geçer.
   */
  async arkaplandaEsitle(): Promise<EsitlemeSonucu> {
    try {
      const durum = await durumuOku();
      if (!durum.aktif) return { tur: 'kapali' };
      let zamanlayici: ReturnType<typeof setTimeout> | undefined;
      const asim = new Promise<EsitlemeSonucu>((coz) => {
        zamanlayici = setTimeout(() => coz({ tur: 'hata', kod: 'agYok' }), ARKA_PLAN_ZAMAN_ASIMI_MS);
      });
      try {
        return await Promise.race([
          EsitlemeServisi.esitle({ uygula: diskeUygula, turetebilir: false }),
          asim,
        ]);
      } finally {
        if (zamanlayici) clearTimeout(zamanlayici);
      }
    } catch (e) {
      return { tur: 'hata', kod: hataKodunaCevir(e) };
    }
  },

  /**
   * Sağlayıcıya etkileşimli bağlanır (Google girişi; iCloud'da hesabın açık olduğunu
   * doğrular). İptal → `iptal`; oturum zaten varsa yeniden sormaz.
   */
  async baglan(
    kimlik: SaglayiciKimligi,
    zorla = false
  ): Promise<{ tur: 'tamam' } | { tur: 'iptal' } | { tur: 'hata'; kod: EsitlemeHataKodu }> {
    const saglayici = saglayiciAl(kimlik);
    if (!saglayici || !saglayici.yapilandirildiMi()) return { tur: 'hata', kod: 'yapilandirilmamis' };
    try {
      if (!zorla && (await saglayici.oturumVarMi())) return { tur: 'tamam' };
      return (await saglayici.baglan()) ? { tur: 'tamam' } : { tur: 'iptal' };
    } catch (e) {
      return { tur: 'hata', kod: hataKodunaCevir(e) };
    }
  },

  /** Seçilen sağlayıcıda eşitleme verisi var mı? (Kurulum ekranı parolayı bir mi iki kez mi soracağını buna göre seçer.) */
  async uzakDurumu(
    kimlik: SaglayiciKimligi
  ): Promise<{ tur: 'var' } | { tur: 'yok' } | { tur: 'hata'; kod: EsitlemeHataKodu }> {
    const saglayici = saglayiciAl(kimlik);
    if (!saglayici || !saglayici.yapilandirildiMi()) return { tur: 'hata', kod: 'yapilandirilmamis' };
    try {
      return (await saglayici.meta()) ? { tur: 'var' } : { tur: 'yok' };
    } catch (e) {
      return { tur: 'hata', kod: hataKodunaCevir(e) };
    }
  },

  /**
   * Eşitlemeyi açar (ya da parolayı yeniler). Uzakta kayıt varsa parola ONUNLA
   * doğrulanır (yanlışsa hiçbir şey kaydedilmez); yoksa yeni tuz üretilir. Ardından
   * ilk tur koşar. `sifirla`: uzaktaki kayıt silinir (parola unutulduysa tek yol).
   */
  async kur(arg: {
    kimlik: SaglayiciKimligi;
    parola: string;
    mod: KurulumModu;
    uygula: (gelen: YedekPayload) => Promise<void>;
  }): Promise<EsitlemeSonucu> {
    if (devamEden) await devamEden.catch(() => undefined);
    const saglayici = saglayiciAl(arg.kimlik);
    if (!saglayici || !saglayici.yapilandirildiMi()) return { tur: 'hata', kod: 'yapilandirilmamis' };
    try {
      if (arg.mod === 'sifirla') await saglayici.sil();
      const kayit = await saglayici.oku();
      let kdf: KdfParametreleri;
      let anahtar: Uint8Array;
      if (kayit) {
        const ayr = zarfiAyristir(kayit.icerik);
        if (ayr.tur === 'bozuk') return { tur: 'hata', kod: 'bozukVeri' };
        if (ayr.tur === 'surumYeni') return { tur: 'hata', kod: 'surumYeni' };
        kdf = ayr.zarf.kdf;
        anahtar = await anahtarTuret(arg.parola, kdf);
        if (zarfiAc(ayr.zarf, anahtar) === null) return { tur: 'hata', kod: 'parolaYanlis' };
      } else {
        kdf = yeniKdfParametreleri(rastgeleBaytlar);
        anahtar = await anahtarTuret(arg.parola, kdf);
      }
      await EsitlemeAnahtarDeposu.kaydet(arg.parola, kdf, anahtar);
      const onceki = await durumuOku();
      await durumuYaz({
        ...onceki,
        aktif: true,
        saglayici: arg.kimlik,
        // Yeni kurulum ya da yeni parola: önceki tur bilgisi geçersiz.
        sonEtiket: null,
        sonOzet: null,
        sonHata: null,
      });
    } catch (e) {
      return { tur: 'hata', kod: hataKodunaCevir(e) };
    }
    return EsitlemeServisi.esitle({ uygula: arg.uygula, turetebilir: true });
  },

  /**
   * Eşitlemeyi kapatır: cihazdaki parola/anahtar ve hesap bağlantısı silinir.
   * `uzaktakiniSil` ise önce buluttaki kayıt silinir; silinemezse HİÇBİR ŞEY
   * değişmez (kullanıcı tekrar deneyebilsin). Yerel veriye dokunulmaz.
   */
  async kapat(arg: { uzaktakiniSil: boolean }): Promise<{ basarili: true } | { basarili: false; kod: EsitlemeHataKodu }> {
    if (devamEden) await devamEden.catch(() => undefined);
    const durum = await durumuOku();
    const saglayici = saglayiciAl(durum.saglayici);
    if (arg.uzaktakiniSil && saglayici) {
      try {
        await saglayici.sil();
      } catch (e) {
        return { basarili: false, kod: hataKodunaCevir(e) };
      }
    }
    if (saglayici) {
      try {
        await saglayici.baglantiyiKes();
      } catch {
        // Yerel kapatma yine yapılır.
      }
    }
    await EsitlemeAnahtarDeposu.temizle();
    await Depolama.sil(DEPOLAMA_ANAHTARLARI.ESITLEME_DURUMU);
    return { basarili: true };
  },
};
