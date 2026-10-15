/**
 * Ozel gun degisikliginin hatirlatmalara yayilmasi (issue #272).
 *
 * Ozel gun baslatilinca/bitirilince/iptal edilince ya da mod anahtari
 * degisince, KURULU planlar hemen yeniden kurulmalidir: aksi halde ozel gunu
 * yeni baslatan kullaniciya o gun icin onceden planlanmis muhafiz bildirimi ve
 * TTS anonsu yine de calardi (planlar 15 dk gorevine ya da bir sonraki acilisa
 * kadar eski kalirdi).
 *
 * Kapinin KENDISI burada degildir — her hatirlatma servisi planlarken ozel gunu
 * diskten okur (`LocalOzelGunOkuyucu`). Bu servis yalnizca "simdi yeniden
 * planla" der:
 *   1) on plan muhafizinin bellek-ici kapisini tazeler (acik banner hemen kalkar);
 *   2) konuma bagli tuketicilerin TEK yayma noktasini (`konumDegistiUygula`)
 *      mevcut koordinatla cagirir — muhafiz + TTS, vakit bildirimi, vakit
 *      sayaci, nafile, seri sayaci, gun sonu hatirlatmasi, iftar/sahur, cuma ayni listeden yeniden kurulur. Liste ikinci
 *      kez yazilmaz (AGENTS.md "ikiz liste" dersi).
 *
 * STORE'A BAGLI DEGILDIR: koordinat ham depolamadan okunur. Asla firlatmaz.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { konumDegistiUygula, type Koordinatlar } from './KonumDegisikligiServisi';
import { NamazMuhafiziServisi } from './NamazMuhafiziServisi';

/** Konum slice'inin diskteki koordinati; yoksa/bozuksa null. */
async function koordinatiOku(): Promise<Koordinatlar | null> {
  try {
    const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
    if (!ham) return null;
    const k = JSON.parse(ham)?.koordinatlar;
    return k && typeof k.lat === 'number' && typeof k.lng === 'number'
      ? { lat: k.lat, lng: k.lng }
      : null;
  } catch (error) {
    Logger.warn('OzelGunDegisikligi', 'Koordinat okunamadi', error);
    return null;
  }
}

/**
 * @returns Yayma (`konumDegistiUygula`) GERCEKTEN kostu mu? Konum yoksa `false` —
 *   cagiran (ör. yedekten geri yukleme) konumsuz calisabilen tuketicileri
 *   kendisi tazelemeli.
 */
export async function ozelGunDegistiUygula(): Promise<boolean> {
  try {
    await NamazMuhafiziServisi.getInstance().ozelGunDurumunuYukle();
  } catch (error) {
    Logger.error('OzelGunDegisikligi', 'On plan muhafiz kapisi tazelenemedi', error);
  }

  const koordinatlar = await koordinatiOku();
  if (!koordinatlar) {
    // Konum yoksa planlanmis bir sey de yoktur; ilk konum yaymasi kapiyi zaten uygular.
    Logger.info('OzelGunDegisikligi', 'Konum yok, yeniden planlama atlandi');
    return false;
  }

  try {
    await konumDegistiUygula(koordinatlar);
    Logger.info('OzelGunDegisikligi', 'Ozel gun degisti, hatirlatmalar yeniden planlandi');
    return true;
  } catch (error) {
    Logger.error('OzelGunDegisikligi', 'Hatirlatmalar yeniden planlanamadi', error);
    return false;
  }
}
