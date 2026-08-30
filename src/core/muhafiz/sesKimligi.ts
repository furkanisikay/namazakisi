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
 * KANAL ENFLASYONU YOK: id girdinin hash'i oldugu icin kanal sayisi = kullanicinin
 * sectigi BENZERSIZ (ses, titresim) kombinasyonu sayisi, hucre sayisi degil.
 * 20 hucre ayni sesi kullaniyorsa tek kanal olusur.
 *
 * FAZ 6: girdi artik yalniz ses degil, (ses + titresim). Gerekce ayni: titresim
 * de kanal ozelligidir ve kanal kurulduktan sonra degistirilemez.
 *
 * Varsayilan ses TABAN kanallara (`muhafiz` / `muhafiz_acil`) esitlenir: bu iki
 * kanal mevcut kurulumlarda ZATEN vardir ve sesi zaten `bildirim.mp3`'tur →
 * gecis maliyeti sifir, mevcut kullanicinin kanal tercihleri (titresim, onem)
 * korunur.
 */
import { BILDIRIM_SABITLERI } from '../constants/UygulamaSabitleri';
import { VARSAYILAN_SES, VARSAYILAN_SES_ADI } from './matrisTipleri';

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
 * DIKKAT: 'alarm' id'si eskiden ACIL KANAL sinyali de tasiyordu. O anlam burada
 * DEGIL, `muhafizGoc.eskiAlarmSesiniGoc` ile gorunur `acilKanal` alanina TASINIR
 * (yedek dal: `muhafizAcilKanalMi`, bkz. motorAdaptoru).
 */
export function sesKimliginiNormalize(ham: string | undefined | null): string {
  if (typeof ham !== 'string') return VARSAYILAN_SES;
  const kirpilmis = ham.trim();
  if (kirpilmis.length === 0) return VARSAYILAN_SES;
  return ozelSesMi(kirpilmis) ? kirpilmis : VARSAYILAN_SES;
}

/**
 * Sesin KULLANICIYA gosterilecek adi (TEK KAYNAK).
 *
 * Ad cozulememisse ham `content://...` GOSTERILMEZ — kullaniciya hicbir sey
 * anlatmaz. Ozel ses icin AYIRT EDICI bir yedek metin doner: "Uygulama sesi"
 * demek yanlis olurdu, cunku o zaman ozel sesli kanal Android bildirim
 * ayarlarinda TABAN kanalla birebir ayni isimde gorunur ve kullanici hangisinin
 * hangisi oldugunu ayirt edemez.
 *
 * Ekran ozeti, ses secim satiri ve bildirim KANAL ADI ayni yerden beslenir.
 */
export function sesGorunenAdi(sesKimligi: string, sesAdi?: string): string {
  const ad = sesAdi?.trim();
  if (ad) return ad;
  return ozelSesMi(sesKimligi) ? 'Seçtiğiniz ses' : VARSAYILAN_SES_ADI;
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
 * Titresim kanali ACIKKEN hash girdisine eklenen iz (Faz 6).
 *
 * Iz KAPALIYKEN EKLENMEZ — bu bir uslup tercihi degil, GERIYE UYUMLULUK sartidir:
 * girdi degisseydi sahadaki her ozel sesli kanalin id'si degisir, eski kanal oksuz
 * kalip GC ile silinir ve kullanicinin o kanalda biriktirdigi tercihler giderdi.
 */
const TITRESIM_IZI = '|titresim';

/**
 * (ses, titresim) -> hash girdisi. Titresim kapaliyken girdi SADECE sestir.
 */
export function kanalHashGirdisi(sesKimligi: string, titresimAcik: boolean): string {
  return titresimAcik ? `${sesKimligi}${TITRESIM_IZI}` : sesKimligi;
}

/**
 * (ses, aciliyet, titresim) -> kanal id.
 *
 * TITRESIM DE KANAL OZELLIGIDIR (Faz 6): `NotificationChannel.setVibrationPattern`
 * de tipki ses gibi kanal olusturulduktan SONRA degistirilemez ve silip yeniden
 * olusturmak tombstone'a takilir. Bu yuzden titresim de id'nin girdisidir; yoksa
 * ayni sesi paylasan iki hucreden biri SESSIZCE otekinin titresim davranisini alir.
 *
 * TABAN KANAL ISTISNASI (B9) KORUNUR: varsayilan ses + VARSAYILAN titresim hala
 * `muhafiz`/`muhafiz_acil` kanallarina duser. O iki kanal mevcut cihazlarda ZATEN
 * kurulu ve kullanicinin tercihleri (titresim/onem/DND) orada birikmis → gecis
 * maliyeti sifir. VARSAYILAN OLMAYAN titresim secilen hucre bu eslemeden CIKAR ve
 * hash'li kanala gecer (taban kanalin titresimini degistirmek zaten mumkun degil).
 */
export function muhafizKanalIdOlustur(
  sesKimligi: string,
  acilMi: boolean,
  titresimAcik: boolean = false
): string {
  const taban = acilMi ? TABAN_ACIL : TABAN_NORMAL;
  const kimlik = sesKimliginiNormalize(sesKimligi);
  if (kimlik === VARSAYILAN_SES && !titresimAcik) return taban;
  return `${taban}_${sesHashi(kanalHashGirdisi(kimlik, titresimAcik))}`;
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
