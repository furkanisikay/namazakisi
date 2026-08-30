/**
 * Seri sayacinin girdilerini HAM DEPOLAMADAN hazirlar.
 *
 * NEDEN AYRI: `SeriSayacBildirimServisi` bilincli olarak store'suzdur (tum
 * girdiler parametre). Bu dosya "girdileri nereden okuyoruz" sorusunu tek yerde
 * cevaplar ve UC cagiran da ayni cevabi kullanir:
 *   - `App.tsx` acilis zinciri
 *   - `KonumDegisikligiServisi.konumDegistiUygula`
 *   - `ArkaplanGorevServisi` (15 dk) — burada REDUX YOKTUR
 *
 * Ucuncusu ozelliğin yasayip yasamayacagini belirler: sayac penceresi
 * imsak−2sa ≈ 01:30–04:30'a duser, yani kullanicinin uygulamayi ACMADIGI
 * pencere. Yalniz JS'ten baslatilabilen bir sayac arka plandan tazelenmezse
 * pratikte hic gorunmez.
 *
 * KOORDINAT PARAMETREDIR (cuma servisinin dersi): `NamazVaktiHesaplayiciServisi`
 * singleton'i bellek-icidir ve headless arka plan gorevinde BOSTUR — ona
 * baglansaydik arka plan yolu sessizce hicbir sey yapmazdi.
 */

import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { gunTamMi } from '../../core/seri/gunTamMi';
import { sonrakiImsakVaktiBul, type ImsakSaglayici } from '../../core/seri/seriGunSonu';
import { localNamazlariGetir } from '../../data/local/LocalNamazServisi';
import { localSeriAyarlariniGetir } from '../../data/local/LocalSeriServisi';
import { Logger } from '../../core/utils/Logger';
import { namazGunuHesapla } from './SeriHesaplayiciServisi';
import type { SeriSayacAyarlari } from './SeriSayacBildirimServisi';

/**
 * Koordinattan imsak saglayicisi uretir.
 *
 * `{lat:0,lng:0}` bu projede "henuz yapilandirilmadi" nobetcisidir (AGENTS.md)
 * -> saglayici `null` doner; aksi halde Gine Korfezi'ne gore bir gun siniri
 * hesaplanirdi.
 */
export function koordinattanImsakSaglayici(koordinatlar: {
  lat: number;
  lng: number;
}): ImsakSaglayici {
  if (koordinatlar.lat === 0 && koordinatlar.lng === 0) return () => null;

  const konum = new Coordinates(koordinatlar.lat, koordinatlar.lng);
  const params = CalculationMethod.Turkey();
  // Gun bazinda ayri `PrayerTimes` (AGENTS.md kurali).
  return (tarih: Date) => new PrayerTimes(konum, tarih, params).fajr ?? null;
}

/**
 * Sayacin girdileri. Okuma hatasinda sayac KAPALI dondurulur — bir depolama
 * hatasi yuzunden kullaniciya yanlis bir geri sayim gostermektense hic
 * gostermemek yeglenir.
 */
export async function seriSayacAyarlariniHazirla(
  koordinatlar: { lat: number; lng: number },
  simdi: Date = new Date()
): Promise<SeriSayacAyarlari> {
  const kapali: SeriSayacAyarlari = { aktif: false, hedef: null, seriBugunTamMi: true };

  try {
    const ayarYanit = await localSeriAyarlariniGetir();
    if (!ayarYanit.basarili || !ayarYanit.veri) return kapali;
    const ayarlar = ayarYanit.veri;

    // Sayac, kullanicinin ZATEN acmis oldugu gun sonu hatirlatmasina baglidir —
    // gormedigi yeni bir anahtari sessizce acmaz.
    if (!ayarlar.gunSonuBildirimAktif) return kapali;

    const imsakSaglayici = koordinattanImsakSaglayici(koordinatlar);
    const hedef = sonrakiImsakVaktiBul(simdi, imsakSaglayici);
    if (!hedef) return kapali;

    // Seri gunu takvim gunu DEGIL: ertesi imsakta biter. Hangi gunun tamligina
    // bakacagimizi motorun kendi kuralindan sor.
    const seriGunu = namazGunuHesapla(simdi, ayarlar.gunBitisSaati, imsakSaglayici);
    const namazYanit = await localNamazlariGetir(seriGunu);
    if (!namazYanit.basarili || !namazYanit.veri) return kapali;

    const kilinanSayisi = namazYanit.veri.namazlar.filter((n) => n.tamamlandi).length;

    return {
      aktif: true,
      hedef,
      seriBugunTamMi: gunTamMi(kilinanSayisi, ayarlar.tamGunEsigi),
    };
  } catch (error) {
    Logger.error('SeriSayac', 'Sayac girdileri hazirlanamadi', error);
    return kapali;
  }
}
