/**
 * Konum Yenileme Servisi — kullanıcı tetikli "şu anki konumu al" yolu.
 *
 * NEDEN VAR: Otomatik (GPS) modda konum yalnızca bölge (geofence) çıkışında ya da
 * 15 dakikalık arka plan onarımında tazelenir. Bölge kurulamamışsa ya da olay
 * düşmemişse cihaz yeni şehirdeyken bile ESKİ konuma göre hesap yapmayı sürdürür;
 * kullanıcının elindeki tek çözüm konum modunu manuele alıp otomatiğe geri
 * çevirmekti. Bu servis o düzeltmeyi tek dokunuşluk hâle getirir.
 *
 * TASARIM: Kendi yazma yolunu KURMAZ — `KonumTakipServisi.yeniKonumuUygula`
 * üzerinden gider. O fonksiyon diske yazar VE `konumDegistiUygula` ile konuma
 * bağlı tüm tüketicileri (hesaplayıcı, muhafız, vakit/iftar/sahur sayaçları,
 * widget…) besler. Ekrandan yapılan güncelleme de aynı kapıdan geçsin ki tüketici
 * listesi ikinci bir yerde yaşayıp ayrışmasın.
 */

import * as Location from 'expo-location';
import { Logger } from '../../core/utils/Logger';
import { KonumTakipServisi, yeniKonumuUygula } from './KonumTakipServisi';

/**
 * - `basarili`      → konum güncellendi ve tüketicilere yayıldı
 * - `izinYok`       → ön plan konum izni verilmemiş (bu servis izin İSTEMEZ, bkz. aşağıda)
 * - `konumAlinamadi`→ GPS sabitlemesi alınamadı (kapalı konum servisi, zaman aşımı…)
 * - `uygulanamadi`  → konum alındı ama yazılamadı (ör. mod otomatik değil)
 */
export type KonumYenilemeDurumu =
  | 'basarili'
  | 'izinYok'
  | 'konumAlinamadi'
  | 'uygulanamadi';

export interface KonumYenilemeSonucu {
  durum: KonumYenilemeDurumu;
  koordinatlar?: { lat: number; lng: number };
}

/**
 * Elle yenilemede mesafe eşiği YOKTUR (0).
 *
 * `yeniKonumuUygula` normalde "eşik altındaysa yalnız nabız yaz" der — otomatik
 * yolda pil/gürültü koruması budur. Ama kullanıcı butona bastıysa niyeti açıktır:
 * konum birkaç yüz metre bile oynasa güncel değeri görmek ister. `mesafe < 0`
 * hiçbir zaman doğru olmadığı için 0 eşik "her zaman uygula" demektir.
 */
const ELLE_YENILEME_ESIK_MESAFESI = 0;

/**
 * Bu servis izin İSTEMEZ, yalnız SORAR.
 *
 * Play "Prominent Disclosure" gereği konum izni diyaloğundan önce verinin neden
 * istendiği açıkça anlatılmalı; o metin Konum Ayarları sayfasındaki akışta duruyor.
 * Ana ekrandaki küçük bir yenile düğmesi o bağlamı veremez → izin yoksa kullanıcı
 * `izinYok` sonucuyla oraya yönlendirilir.
 */
async function onPlanIzniVarMi(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (hata) {
    Logger.warn('KonumYenileme', 'Izin durumu okunamadi', hata);
    return false;
  }
}

/**
 * Şu anki konumu alır, diske yazar ve konuma bağlı tüm tüketicilere yayar.
 *
 * Takip (geofence) açıksa bölge de taze konuma taşınır: kullanıcının şikâyeti tam
 * olarak bölgenin bayat noktada asılı kalmasıydı; yalnız koordinatı güncelleyip
 * bölgeyi bırakmak sorunun yarısını çözerdi. Bölge yenilenemezse konum yine de
 * güncel kalır (yutulan hata), çünkü kullanıcı için asıl sonuç vakitlerin düzelmesidir.
 */
export async function konumuYenile(): Promise<KonumYenilemeSonucu> {
  if (!(await onPlanIzniVarMi())) {
    return { durum: 'izinYok' };
  }

  let lat: number;
  let lng: number;
  try {
    const konum = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    lat = konum.coords.latitude;
    lng = konum.coords.longitude;
  } catch (hata) {
    Logger.error('KonumYenileme', 'Guncel konum alinamadi', hata);
    return { durum: 'konumAlinamadi' };
  }

  const uygulandi = await yeniKonumuUygula(lat, lng, ELLE_YENILEME_ESIK_MESAFESI);
  if (!uygulandi) {
    Logger.warn('KonumYenileme', 'Konum yazilamadi (otomatik mod degil olabilir)');
    return { durum: 'uygulanamadi' };
  }

  try {
    const takip = KonumTakipServisi.getInstance();
    if (await takip.aktifMi()) {
      await takip.yenidenBaslat();
    }
  } catch (hata) {
    Logger.warn('KonumYenileme', 'Bolge yeniden merkezlenemedi', hata);
  }

  return { durum: 'basarili', koordinatlar: { lat, lng } };
}
