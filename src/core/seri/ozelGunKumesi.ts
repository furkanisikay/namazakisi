/**
 * Ozel gun (mazeret) araliklarini tek bir ISO-tarih kumesine genisletir.
 *
 * `OzelGunKaydi` bir ARALIKTIR (baslangicTarihi-bitisTarihi), tek tarih
 * degil. Bu modul o araliklari gok takimyildizi haritasinin (aylikIzgara)
 * dogrudan `kume.has(tarih)` ile sorgulayabilecegi bir Set'e genisletir.
 */
import { gunEkle, ISOTarihiDateNesnesiNeCevir } from '../utils/TarihYardimcisi';

/** Bozuk/asiri genis bir kayit sonsuz dongu veya asiri bellek uretmesin diye
 * tek bir araligin genisletilebilecegi azami gun sayisi. */
const ARALIK_UST_SINIRI_GUN = 400;

export interface OzelGunAraligi {
  baslangicTarihi: string; // ISO (yyyy-MM-dd)
  bitisTarihi: string; // ISO (yyyy-MM-dd)
}

export interface OzelGunGirdisi {
  ozelGunModuAktif: boolean;
  aktifOzelGun: OzelGunAraligi | null;
  gecmisKayitlar: OzelGunAraligi[];
}

/** Tek bir araligi kumeye ekler. Ters aralik (bitis < baslangic) sessizce
 * bos kalir (cokme yok); aralik ARALIK_UST_SINIRI_GUN gunde kesilir. */
function araligiKumeyeEkle(kume: Set<string>, aralik: OzelGunAraligi): void {
  const baslangic = ISOTarihiDateNesnesiNeCevir(aralik.baslangicTarihi);
  const bitis = ISOTarihiDateNesnesiNeCevir(aralik.bitisTarihi);
  if (bitis.getTime() < baslangic.getTime()) {
    return;
  }

  let mevcutTarih = aralik.baslangicTarihi;
  let sayac = 0;
  while (mevcutTarih <= aralik.bitisTarihi && sayac < ARALIK_UST_SINIRI_GUN) {
    kume.add(mevcutTarih);
    mevcutTarih = gunEkle(mevcutTarih, 1);
    sayac += 1;
  }
}

/**
 * Tum ozel gun araliklarini (gecmis + varsa aktif) tek bir ISO-tarih
 * kumesine genisletir.
 *
 * - `gecmisKayitlar` KOSULSUZ katilir (gecmiste dondurulmus donemlerdir).
 * - `aktifOzelGun` YALNIZ `ozelGunModuAktif === true` iken katilir — motorun
 *   kapisi budur. Kapiyi atlamak, modu kapatmis kullaniciya dondurulmus
 *   gun gosterir.
 */
export function ozelGunKumesi(g: OzelGunGirdisi): Set<string> {
  const kume = new Set<string>();

  for (const kayit of g.gecmisKayitlar) {
    araligiKumeyeEkle(kume, kayit);
  }

  if (g.ozelGunModuAktif && g.aktifOzelGun) {
    araligiKumeyeEkle(kume, g.aktifOzelGun);
  }

  return kume;
}
