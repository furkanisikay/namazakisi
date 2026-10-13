/**
 * Gun sonu seri hatirlatmasinin PLANI — saf kurallar (issue #272 devami).
 *
 * NEDEN TARIHLI TETIK: hatirlatma eskiden tek bir gunluk tekrarli (DAILY)
 * bildirimdi. DAILY tetik tarih tasimaz → ozel gun kapisi ona UYGULANAMAZ ve
 * seri dondurulmusken bile "namazlarinizi girmeyi unutmayin" diye gelirdi.
 * Ayrica DAILY saat kurulum anindaki imsaktan bir kez turetiliyordu; imsak
 * mevsimle kaydikca bildirim seri gununun gercek sonundan uzaklasiyordu. Artik
 * her seri gunu icin AYRI, o gunun imsagina gore bir tetik kurulur.
 *
 * SAF: store'a, native'e ve `new Date()`'e bagimli DEGIL (`simdi` enjekte).
 */
import { SERI_SOZU } from '../data/SeriSozu';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import type { ImsakSaglayici } from './seriGunSonu';

/** Eski DAILY bildirimin kimligi; yeni tetikler bunu ONEK olarak tasir. */
export const GUN_SONU_ESKI_ID = 'gun_sonu_hatirlatici';
/** Tarihli tetik kimligi: `gun_sonu_hatirlatici_<seriGunu>`. */
export const GUN_SONU_ID_ONEKI = `${GUN_SONU_ESKI_ID}_`;

/**
 * Kac seri gunu ileri planlanir.
 *
 * Android: 7 — kullanici uygulamayi bir hafta acmasa bile hatirlatma surer
 * (15 dk arka plan gorevi zaten tazeler; bu bir guvenlik payidir).
 * iOS: 3 — iOS en yakin 64 bekleyen bildirimi tutar ve muhafiz butcesi muhafiz
 * DISI bekleyenleri sayip kalan slotu kullanir (`IosMuhafizTeslimcisi.hazirla`);
 * her fazladan gun sonu bildirimi bir muhafiz adimini gece yarisindan once
 * dusurur. Uc gun, arka plan getirmesinin seyrek kostugu iOS'ta bile yeter.
 */
export const GUN_SONU_PLAN_GUN_SAYISI = { android: 7, ios: 3 } as const;

/** Konum (imsak) yokken kullanilan tarihsel saat: 05:00 − 60 dk = 04:00. */
const FALLBACK_SAAT = 4;
const FALLBACK_DAKIKA = 0;

/** `SeriAyarlari`nin planin okudugu alt kumesi (yapisal uyum yeter). */
export interface GunSonuPlanAyarlari {
  gunSonuBildirimModu: 'otomatik' | 'sabit';
  bildirimImsakOncesiDk: number;
  bildirimSaati: number;
  bildirimDakikasi: number;
}

export interface GunSonuTetigi {
  /** Bildirimin ait oldugu SERI gunu (YYYY-MM-DD) — ozel gun kapisi buna bakar. */
  seriGunu: string;
  /** Tetik ani. */
  an: Date;
  /** `gun_sonu_hatirlatici_<seriGunu>` */
  kimlik: string;
}

/** Bildirim icerigi — eski DAILY bildirimle BIREBIR ayni (nobetci test). */
export const GUN_SONU_BASLIK = '🚨 Seri Hatırlatıcı';
export const GUN_SONU_GOVDE = `Gün bitmek üzere! Serinizi bozmamak için bugünkü namazlarınızı girmeyi unutmayın.\n\n«${SERI_SOZU.metin}» (${SERI_SOZU.kaynak})`;

const gecerliTarihMi = (t: unknown): t is Date =>
  t instanceof Date && Number.isFinite(t.getTime());

/** Saglayici uretim kodudur (adhan) — patlarsa plan dusmemeli. */
const guvenliImsak = (saglayici: ImsakSaglayici, tarih: Date): Date | null => {
  try {
    const sonuc = saglayici(tarih);
    return gecerliTarihMi(sonuc) ? sonuc : null;
  } catch {
    return null;
  }
};

const sayiVeyaVarsayilan = (deger: unknown, varsayilan: number): number =>
  typeof deger === 'number' && Number.isFinite(deger) ? deger : varsayilan;

/** Takvim gunu + `gun` gun, gun ortasi degil gun BASI (yerel). */
const gunKaydir = (taban: Date, gun: number): Date =>
  new Date(taban.getFullYear(), taban.getMonth(), taban.getDate() + gun);

/**
 * `seriGunu` (gun basi) icin tetik ani.
 *
 * - otomatik: seri gunu ERTESI IMSAK'ta biter → `imsak(seriGunu + 1) − X dk`.
 *   Imsak yoksa ertesi gun 04:00 (eski fallback).
 * - sabit: kullanicinin saati. Ogleden ONCEKI saat (00:00–11:59) imsak oncesi
 *   pencereye, yani bir ONCEKI seri gununun sonuna aittir → tetik ertesi
 *   takvim gunune kurulur; ogleden sonraki saat (yatsi sonrasi) ayni gunun.
 *   `bildirimGunSecimi` burada OKUNMAZ: ekran saat araligini zaten ona gore
 *   kisitliyor (ayniGun → yatsi..23, ertesiGun → 0..imsak) ve tarihsel olarak
 *   saat hesabina hic karismadi; saatten turetmek tutarsiz bir kayda dayaniklidir.
 */
function tetikAniHesapla(
  seriGunu: Date,
  ayarlar: GunSonuPlanAyarlari,
  imsakSaglayici: ImsakSaglayici
): Date {
  const ertesiGun = gunKaydir(seriGunu, 1);

  if (ayarlar.gunSonuBildirimModu === 'sabit') {
    const saat = sayiVeyaVarsayilan(ayarlar.bildirimSaati, FALLBACK_SAAT);
    const dakika = sayiVeyaVarsayilan(ayarlar.bildirimDakikasi, FALLBACK_DAKIKA);
    const hedefGun = saat < 12 ? ertesiGun : seriGunu;
    return new Date(hedefGun.getFullYear(), hedefGun.getMonth(), hedefGun.getDate(), saat, dakika);
  }

  const imsak = guvenliImsak(imsakSaglayici, ertesiGun);
  if (!imsak) {
    return new Date(
      ertesiGun.getFullYear(),
      ertesiGun.getMonth(),
      ertesiGun.getDate(),
      FALLBACK_SAAT,
      FALLBACK_DAKIKA
    );
  }
  const onceDk = sayiVeyaVarsayilan(ayarlar.bildirimImsakOncesiDk, 30);
  const an = new Date(imsak.getTime());
  an.setMinutes(an.getMinutes() - onceDk);
  return an;
}

/**
 * Onumuzdeki `gunSayisi` gun sonu tetigini uretir (kronolojik).
 *
 * Ufuk ozel gunden BAGIMSIZ sayilir: once gelecekteki ilk `gunSayisi` tetik
 * secilir, SONRA ozel gunler (`gunAtlanirMi`) elenir. Boylece aralik disindaki
 * gunlerin tetikleri ozel gun olmasaydi nasilsa birebir oyle kalir; aralik
 * planin ufkunu ileri itmez.
 */
export function gunSonuPlaniOlustur(girdi: {
  simdi: Date;
  ayarlar: GunSonuPlanAyarlari;
  imsakSaglayici: ImsakSaglayici;
  gunSayisi: number;
  gunAtlanirMi?: (seriGunu: string) => boolean;
}): GunSonuTetigi[] {
  const { simdi, ayarlar, imsakSaglayici, gunSayisi } = girdi;
  const gunAtlanirMi = girdi.gunAtlanirMi ?? (() => false);
  if (!gecerliTarihMi(simdi) || !(gunSayisi > 0)) return [];

  const bugun = gunKaydir(simdi, 0);
  const adaylar: GunSonuTetigi[] = [];
  // k = -1: gece yarisindan sonra (imsak oncesi) hala DUNUN seri gunu suruyor.
  for (let k = -1; k <= gunSayisi; k++) {
    const seriGunuTarih = gunKaydir(bugun, k);
    const an = tetikAniHesapla(seriGunuTarih, ayarlar, imsakSaglayici);
    if (!gecerliTarihMi(an) || an.getTime() <= simdi.getTime()) continue;
    const seriGunu = tarihiISOFormatinaCevir(seriGunuTarih);
    adaylar.push({ seriGunu, an, kimlik: `${GUN_SONU_ID_ONEKI}${seriGunu}` });
  }

  return adaylar
    .sort((a, b) => a.an.getTime() - b.an.getTime())
    .slice(0, gunSayisi)
    .filter((t) => !gunAtlanirMi(t.seriGunu));
}
