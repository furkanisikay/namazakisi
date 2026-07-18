/**
 * Ses kimligi <-> bildirim kanali id'si (SAF; TEK COZUM NOKTASI).
 *
 * ANDROID GERCEGI: bildirim sesi KANAL ozelligidir ve kanal olusturulduktan
 * sonra DEGISTIRILEMEZ (`Notification.Builder.setSound` API 26+ yok sayilir).
 * `deleteNotificationChannel` + ayni id ile yeniden olusturma da ise yaramaz:
 * Android silinen kanalin ayarlarini "tombstone" olarak saklar ve ayni id yeniden
 * olusturulunca ESKI ayarlari diriltir.
 *
 * COZUM: kanal id'sini SESIN FONKSIYONU yap. Ses degisirse id de degisir, yani
 * ayni id'nin sesini degistirmeye hic kalkismayiz; tombstone da ZARARSIZLASIR
 * (dirilen ayarlar zaten o ses icin istenen ayarlardir).
 *
 * KANAL ENFLASYONU YOK: id sesin hash'i oldugu icin kanal sayisi = kullanicinin
 * sectigi BENZERSIZ ses sayisi, hucre sayisi degil. 20 hucre ayni sesi
 * kullaniyorsa tek kanal olusur.
 *
 * Varsayilan ses TABAN kanallara (`muhafiz` / `muhafiz_acil`) esitlenir: bu iki
 * kanal mevcut kurulumlarda ZATEN vardir ve sesi zaten `bildirim.mp3`'tur →
 * gecis maliyeti sifir, mevcut kullanicinin kanal tercihleri (titresim, onem)
 * korunur.
 */
import { BILDIRIM_SABITLERI } from '../constants/UygulamaSabitleri';
import { VARSAYILAN_SES } from './matrisTipleri';

/** Kullanicinin sectigi sistem sesleri bu semayla gelir (RingtoneManager). */
const OZEL_SES_ONEKI = 'content://';

const TABAN_NORMAL = BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ;
const TABAN_ACIL = BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ_ACIL;

/** Kullanicinin cihazdan sectigi bir ses mi (paketlenmis varsayilan degil)? */
export function ozelSesMi(sesKimligi: string | undefined | null): boolean {
  return typeof sesKimligi === 'string' && sesKimligi.startsWith(OZEL_SES_ONEKI);
}

/**
 * Diskten/eski kayittan gelen ham degeri gecerli bir ses kimligine cevirir.
 *
 * ESKI PALET GOCU BEDAVA: eski `SES_PALETI` uc isim ('can'/'melodi'/'alarm')
 * vaat ediyordu ama ucu de AYNI dosyaya (`bildirim.mp3`) cozuluyordu. Bu yuzden
 * hepsini varsayilana esitlemek SIFIR algilanabilir regresyondur — ayri bir goc
 * gecisi gerekmez, bu toleransli cozumleyici yeter.
 *
 * DIKKAT: 'alarm' id'si eskiden ACIL KANAL sinyali de tasiyordu; o anlam burada
 * DEGIL, `muhafizAcilKanalMi` icinde korunur (bkz. motorAdaptoru).
 */
export function sesKimliginiNormalize(ham: string | undefined | null): string {
  if (typeof ham !== 'string') return VARSAYILAN_SES;
  const kirpilmis = ham.trim();
  if (kirpilmis.length === 0) return VARSAYILAN_SES;
  return ozelSesMi(kirpilmis) ? kirpilmis : VARSAYILAN_SES;
}

/**
 * Ses kimliginin 8 haneli kararli hash'i (FNV-1a 32-bit).
 *
 * Kriptografik DEGIL; amaci uzun `content://` URI'sini kanal id'sinde
 * kullanilabilir, kararli ve kisa bir ize indirmektir. `Math.imul` 32-bit
 * tasmayi Hermes'te de dogru yapar.
 */
export function sesHashi(sesKimligi: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < sesKimligi.length; i++) {
    h ^= sesKimligi.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * (ses, aciliyet) -> kanal id.
 *
 * Varsayilan ses TABAN kanal id'sini dondurur (mevcut kurulumlarla birebir uyum);
 * ozel ses `<taban>_<hash8>` uretir.
 */
export function muhafizKanalIdOlustur(sesKimligi: string, acilMi: boolean): string {
  const taban = acilMi ? TABAN_ACIL : TABAN_NORMAL;
  const kimlik = sesKimliginiNormalize(sesKimligi);
  return kimlik === VARSAYILAN_SES ? taban : `${taban}_${sesHashi(kimlik)}`;
}

/** Bu id muhafiz kanal uzayina ait mi? (taban VEYA hash'li tureviler) */
export function muhafizKanaliMi(kanalId: string): boolean {
  return (
    kanalId === TABAN_NORMAL ||
    kanalId === TABAN_ACIL ||
    kanalId.startsWith(`${TABAN_NORMAL}_`) ||
    kanalId.startsWith(`${TABAN_ACIL}_`)
  );
}

/**
 * Cop toplama (GC) icin: bu kanal artik referans verilmiyorsa SILINEBILIR mi?
 *
 * TABAN kanallar asla silinmez — varsayilan ses her zaman gecerli bir secimdir
 * ve bu kanallarda kullanicinin kendi sistem tercihleri (titresim, onem, DND)
 * birikmistir; silmek onlari sifirlar.
 */
export function silinebilirMuhafizKanaliMi(kanalId: string): boolean {
  if (kanalId === TABAN_NORMAL || kanalId === TABAN_ACIL) return false;
  return muhafizKanaliMi(kanalId);
}
