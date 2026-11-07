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
import { VARSAYILAN_SES } from './matrisTipleri';
import { metin } from '../dil/aktifDil';
import { iosSesiMi, kullaniciSesDosyasi, paketSesiBul } from './ios/paketSesleri';
import type { MuhafizPlatformu } from './ios/platformYetenekleri';

/** Kullanicinin sectigi sistem sesleri bu semayla gelir (RingtoneManager). */
const OZEL_SES_ONEKI = 'content://';

const TABAN_NORMAL = BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ;
const TABAN_ACIL = BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ_ACIL;

/**
 * ANDROID: kullanicinin cihazdan sectigi bir ses mi (`content://`; paketlenmis varsayilan
 * degil)? Android kanal kimliginin TEK girdisi — iPhone kimliklerini (`paket:`/`dosya:`)
 * BILEREK tanimaz: onlari tanisaydi iPhone yedegi Android'e tasininca hash'li kanal
 * dogardi. Platformdan bagimsiz "secilmis ses mi" sorusu `secilmisSesMi`'dir.
 */
export function ozelSesMi(sesKimligi: string | undefined | null): boolean {
  return typeof sesKimligi === 'string' && sesKimligi.startsWith(OZEL_SES_ONEKI);
}

/** Varsayilan olmayan, kullanicinin SECTIGI bir ses mi (Android `content://` ya da iPhone `paket:`/`dosya:`)? */
export function secilmisSesMi(sesKimligi: string | undefined | null): boolean {
  return ozelSesMi(sesKimligi) || iosSesiMi(sesKimligi);
}

/**
 * Bu ses BU PLATFORMDA calinir mi? Ekran "secili ses" durumunu buna gore cizer: Android'de
 * iPhone kimligi (yedekten gelen) varsayilan calar → varsayilan gorunur; iPhone'da da
 * `content://` boyledir (`teslimPlani.iosSesiCoz`). Sessiz sapma yok.
 */
export function platformdaCalinirMi(
  sesKimligi: string | undefined | null,
  platform: MuhafizPlatformu
): boolean {
  return platform === 'ios' ? iosSesiMi(sesKimligi) : ozelSesMi(sesKimligi);
}

/**
 * Uygulamanin CALISTIGI platform (ses adi ureticisi icin). Cekirdek `react-native` okumaz:
 * giris noktasi (`index.ts`) her JS baglaminda bir kez yazar (`aktifDil` deseni).
 * Varsayilan Android → Android davranisi yazilmasa da birebir.
 */
let sesPlatformuDegeri: MuhafizPlatformu = 'android';
export function sesPlatformunuAyarla(platform: MuhafizPlatformu): void {
  sesPlatformuDegeri = platform;
}
export function sesPlatformu(): MuhafizPlatformu {
  return sesPlatformuDegeri;
}

/**
 * iPhone: diskte DURAN eklenmis dosyalar (`Library/Sounds` adlari). `null` = henuz okunmadi
 * → bilinmiyor sayilir ve dosya calinir kabul edilir (teslimci yine diske sorar). Ses
 * listesi (`useIosSesSecimi`) ve acilis (`App.tsx`) native listeden yazar.
 */
let eklenmisSesler: ReadonlySet<string> | null = null;
export function eklenmisSesleriAyarla(dosyalar: Iterable<string> | null): void {
  eklenmisSesler = dosyalar === null ? null : new Set(dosyalar);
}

/**
 * Bu kimlik BU CIHAZDA calinir mi? Platform (`platformdaCalinirMi`) + iPhone'da eklenen
 * dosya hala listede mi. Calinmayan secim ekranda VARSAYILAN gorunur (calan budur).
 */
export function cihazdaCalinirMi(sesKimligi: string | undefined | null): boolean {
  if (!platformdaCalinirMi(sesKimligi, sesPlatformuDegeri)) return false;
  const dosya = kullaniciSesDosyasi(sesKimligi);
  return dosya === null || eklenmisSesler === null || eklenmisSesler.has(dosya);
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
 *
 * ANDROID KANAL KIMLIGIDIR: iPhone kimlikleri (`paket:`/`dosya:`) de varsayilana iner →
 * Android kanal id'si her girdi icin eskisiyle BIREBIR (nobetci `sesKimligi.test.ts`).
 * iPhone'da ses `teslimPlani.iosSesiCoz` ile HAM kimlikten cozulur.
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
 *
 * BU CIHAZDA CALINMAYAN secim (baska platformun kimligi — yedek/esitleme — ya da iPhone'da
 * silinmis eklenen dosya) VARSAYILANIN adini alir: calan odur. `varsayilanAdi` yuzeyin
 * varsayilan sesinin adidir (verilmezse "Uygulama sesi"; iPhone'da ek yuzeyler telefonun
 * sesini calar).
 */
export function sesGorunenAdi(sesKimligi: string, sesAdi?: string, varsayilanAdi?: string): string {
  const k = metin().bildirim.kanal;
  if (secilmisSesMi(sesKimligi) && !cihazdaCalinirMi(sesKimligi)) return varsayilanAdi ?? k.uygulamaSesi;
  if (!secilmisSesMi(sesKimligi) && varsayilanAdi && !sesAdi?.trim()) return varsayilanAdi;
  // iPhone'un paketlenmis sesi: ad SOZLUKTEN (dil degisince ad da degisir; kayitli ad yok sayilir).
  const paket = paketSesiBul(sesKimligi);
  if (paket) return metin().hatirlatma.sesSecim.paket[paket.ad];
  const ad = sesAdi?.trim();
  if (ad) return ad;
  return secilmisSesMi(sesKimligi) ? k.seciliSes : k.uygulamaSesi;
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
