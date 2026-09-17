/**
 * iOS ANONS KLIBI — cozulmus metinden KARARLI dosya adi.
 *
 * SAF modul: `react-native`/`expo-*` import ETMEZ, dosya sistemine dokunmaz.
 * Yalniz "bu metnin klibi hangi adi tasir?" sorusunu cevaplar.
 *
 * ---------------------------------------------------------------------------
 * NEDEN DOSYA GEREKIYOR
 *
 * Android'de sesli anons calisma aninda uretilir: exact alarm tetiklenir,
 * `AnonsKonusucu` o anda TTS ile konusur. iOS'ta BELIRLI BIR SAATTE ARKA
 * PLANDA KOD CALISTIRILAMAZ → tetik aninda konusacak bir sey yoktur. Ses
 * cikarmanin tek yolu bildirimin SESIDIR ve o da onceden var olan bir dosya
 * olmak zorundadir.
 *
 * Cozum: metni ONCEDEN, cihazda, `AVSpeechSynthesizer` ile (cevrimdisi, Apple'in
 * kendi sesiyle) sentezleyip `Library/Sounds` altina yazmak. Bildirim o dosyayi
 * adiyla ister.
 *
 * ---------------------------------------------------------------------------
 * NEDEN "HER GUN URETMEK" GEREKMIYOR (olculdu)
 *
 * Cikis yonunde tetiklenecek dakikalar eşik + siklik + komsu segmentlerden
 * belirlenir; pencere uzunlugundan BAGIMSIZDIR. `vakitUyariPlaniOlustur` ile
 * olculen ayri metin sayisi: hafif 20 / normal 30 / yogun 35 — ve bu sayi
 * pencere 120, 400, 720 dk iken AYNI cikti. Yani dosya seti yalnizca KULLANICI
 * AYAR DEGISTIRINCE degisir. Ustelik klip yalniz `sesli` kanali acik hucreler
 * icin gerekir → gercekte ~10-15 dosya.
 *
 * Bu yuzden `{süre}` DUSMEZ: anons Android'deki gibi "…15 dakika kaldi." der.
 *
 * ---------------------------------------------------------------------------
 * AD NEDEN METNIN HASH'I
 *
 * Ayni metin iki farkli hucrede (ornegin iki vakitte ayni sablon) gecebilir;
 * hash'lersek TEK dosya uretilir ve ikisi de onu kullanir. Ayrica ad
 * deterministiktir: ayni metin her zaman ayni dosyaya duser, dolayisiyla
 * "zaten var mi?" sorusu ucuzdur ve gereksiz yeniden sentez olmaz.
 *
 * Metnin kendisini dosya adi yapmak OLMAZ: Turkce karakter, bosluk ve noktalama
 * icerir; ayrica `Library/Sounds` altinda ASCII disi ad tasimak bu projede bir
 * kez build kirdi (macOS NFD/NFC tuzagi, AGENTS.md'de kayitli).
 */
import { sesHashi } from '../sesKimligi';

/** Klip dosyalarinin uzantisi — `AVAudioFile` ile yazilan kap. */
export const ANONS_KLIP_UZANTISI = '.caf';

/** Tum anons kliplerinin ortak oneki (GC bu oneki tarar). */
export const ANONS_KLIP_ONEKI = 'muhafiz_anons_';

/**
 * Bir klibin tasiyabilecegi EN UZUN metin.
 *
 * iOS bildirim sesi <= 30 sn olmali; daha uzugu SISTEM KIRPMAZ, sesi hic
 * calmaz. Turkce konusma hizi kabaca 12-15 karakter/saniye → 30 sn yaklasik
 * 400 karakter eder. 300 ile guvenli tarafta duruyoruz; bu sinir ayni zamanda
 * kullaniciya ekranda gosterilecek pratik bir tavandir.
 */
export const ANONS_METIN_UST_SINIRI = 300;

/**
 * Klip uretim SEMASININ surumu.
 *
 * Sentez bicimi degisirse (ornegin kap, ornekleme hizi ya da konusma hizi)
 * ESKI dosyalar gecersizlesir ama adlari ayni kalirdi → kullanici sonsuza kadar
 * eski klipleri duyardi. Surumu hash girdisine katmak, bir sonraki planlamada
 * yeni adlarin dogmasini ve eskilerin GC ile silinmesini saglar.
 */
export const ANONS_SEMA_SURUMU = 1;

/** Klip adini belirleyen HER SEY. */
export interface KlipKimligi {
    /** `anonsMetniniCoz` ile COZULMUS metin. */
    cozulmusMetin: string;
    /**
     * Sentezi yapan sesin tanimlayicisi (`AVSpeechSynthesisVoice.identifier`).
     *
     * ADIN PARCASI OLMAK ZORUNDA: kullanici Ayarlar'dan "gelismis" Turkce sesi
     * indirdiginde tanimlayici degisir. Hash'e girmezse dosya adlari ayni kalir,
     * `varMi` true doner ve kullanici yeni sesi INDIRMIS OLMASINA RAGMEN
     * sonsuza kadar eski robotik klipleri duyar.
     */
    sesTanimlayici: string;
}

/**
 * Klip dosya adi uret.
 *
 * GIRDI COZULMUS OLMALI: `{vakit}`/`{süre}`/`{yön}` yer tutuculari
 * `anonsMetniniCoz` ile degistirildikten SONRA verilmeli. Ham sablon
 * verilirse tum tetikler ayni dosyaya duser ve anons YANLIS dakikayi soyler.
 */
export function anonsKlipAdi(kimlik: KlipKimligi): string {
    const girdi = `${ANONS_SEMA_SURUMU}|${kimlik.sesTanimlayici}|${kimlik.cozulmusMetin}`;
    return `${ANONS_KLIP_ONEKI}${sesHashi(girdi)}${ANONS_KLIP_UZANTISI}`;
}

/** Sentezlenecek tek bir klip. */
export interface KlipIhtiyaci {
    ad: string;
    metin: string;
}

/**
 * Teslim edilecek metinlerden TEKILLESTIRILMIS klip listesi cikar.
 *
 * Ayni metin birden cok hucrede/tetikte gecebilir (ornegin iki vakitte ayni
 * sablon, ya da ayni dakikaya denk gelen iki adim) — icerik-adresli ad sayesinde
 * TEK dosya uretilir. Sentezlenemeyecek metinler (bos ya da 30 sn'yi asacak
 * kadar uzun) burada ELENIR; cagiran onlar icin varsayilan bildirim sesine duser.
 */
export function klipIhtiyaciCikar(
    metinler: readonly string[],
    sesTanimlayici: string
): KlipIhtiyaci[] {
    const goruldu = new Set<string>();
    const ihtiyac: KlipIhtiyaci[] = [];

    for (const metin of metinler) {
        if (!anonsSentezlenebilirMi(metin)) continue;
        const ad = anonsKlipAdi({ cozulmusMetin: metin, sesTanimlayici });
        if (goruldu.has(ad)) continue;
        goruldu.add(ad);
        ihtiyac.push({ ad, metin });
    }

    return ihtiyac;
}

/** Bu dosya adi bize mi ait? (GC yalniz kendi dosyalarimizi silsin.) */
export function anonsKlibiMi(dosyaAdi: string): boolean {
    return dosyaAdi.startsWith(ANONS_KLIP_ONEKI) && dosyaAdi.endsWith(ANONS_KLIP_UZANTISI);
}

/**
 * Metin klip olarak sentezlenebilir mi?
 *
 * Bos metin sentezlenmez (Android'de de bos anons konusulmaz — ayni sozlesme).
 * Cok uzun metin sessizce 30 sn sinirina takilip HIC calmayacagi icin burada
 * elenir; cagiran varsayilan bildirim sesine duser.
 */
export function anonsSentezlenebilirMi(cozulmusMetin: string | undefined): boolean {
    if (!cozulmusMetin) return false;
    const kirpik = cozulmusMetin.trim();
    return kirpik.length > 0 && kirpik.length <= ANONS_METIN_UST_SINIRI;
}
