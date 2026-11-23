/**
 * Tanı raporu üretimi + log maskeleme (saf, store-bağımsız).
 * Gizlilik: kişisel veri içermez; konum varsayılan gizli, açıksa şehir düzeyi.
 */

import { Platform } from 'react-native';
import { UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { bicim, metin } from '../../core/dil/aktifDil';

const GIZLENDI = '[gizlendi]';
const KONUM_GIZLENDI = '[konum gizlendi]';

// ==================== 1) VERİ ÜZERİNDE MASKELEME (anahtar adına göre) ====================
// Asıl savunma budur: log `data`'sı metne dökülmeden ÖNCE, alan adına bakılarak maskelenir
// (iç içe nesne/dizi dahil). Metin desenleri (aşağıda) yalnız yedek ağdır — biçime bağlıdır
// ve `"lat": 41.0,\n "lng": 28.9` gibi araya alan adı giren yazımı kaçırabilir.
//
// Liste BİLEREK dardır; tanı değeri taşıyan masum alanlar korunur:
// - `key`, `vakitKey`, `cacheKey`, `anahtarlar`: depolama/eşleme anahtar ADLARI → dokunulmaz.
//   `…key` yalnız açıkça sır niteleyen önekle (api/private/secret/gizli/…) maskelenir.
// - `kod`, `hataKodu`, `ulkeKodu`, `versionCode`: durum/hata/ülke/sürüm kodu → dokunulmaz.
//   Tek istisna DEĞERE bakar: 7 haneli `kod`/`…Kodu` TV eşleme kodudur ve konumu 0,1°
//   hassasiyetle taşır (`core/tv/eslemeKodu.ts`) → konum paylaşılmıyorsa gizlenir.
// - `sira`, `sirasi`: sıra numarası → dokunulmaz (`sir` yalnız tam ad ya da `ortakSir` biçimi).
// - `anahtar` tam adı maskelenir: cihaz ağında anahtar MALZEMESİ de bu adı taşır; depolama
//   anahtarı adının rapordan düşmesi kabul edilen bedeldir (mesaj ve `hata` alanı kalır).

/** Adın herhangi bir yerinde geçmesi yeten sır sözcükleri (`accessToken`, `refresh_token`, `erisimBelirteci`). */
const SIR_ICEREN = /token|belirtec|parola|password|passwd|secret|authorization|bearer|credential|cookie/i;
/** Tam ad olarak sır sayılanlar. */
const SIR_TAM_AD = /^(sir|sifre|sifresi|anahtar|anahtari|pin|otp|dogrulamaKodu)$/i;
/** Bileşik adın SON sözcüğü (`ortakSir`, `sahipAnahtari`, `oturum_anahtar`); `sira`/`anahtarlar` tutmaz. */
const SIR_SON_SOZCUK = /[a-z0-9](Sir|Sifre|Sifresi|Anahtar|Anahtari)$|_(sir|sifre|sifresi|anahtar|anahtari)$/;
/** `…key` yalnız sır niteleyen önekle: `apiKey`, `api_key`, `privateKey`, `gizliKey`. `vakitKey` tutmaz. */
const SIR_KEY = /(api|private|secret|gizli|ozel|sifreleme|encryption|signing|imza|oturum|session|access|auth)[_-]?key$/i;

/** Tek koordinat bileşeni taşıyan alan: `lat`, `lng`, `sonLat`, `hedef_lng`, `enlem`… */
const KOORDINAT_TAM_AD = /^(lat|lng|lon|latitude|longitude|enlem|boylam)$/i;
const KOORDINAT_SON_SOZCUK = /[a-z0-9](Lat|Lng|Lon|Latitude|Longitude|Enlem|Boylam)$|_(lat|lng|lon|latitude|longitude|enlem|boylam)$/;
/** Koordinat kabı: değeri sayı dizisi (`[41.0, 28.9]`) ya da tek sayı olabilir. */
const KOORDINAT_KABI = /^(koordinat\w*|coords?|coordinates?)$/i;

/** Yer adı / yeri ele veren kimlik taşıyan alanlar (yalnız `konumDahil: false` iken gizlenir). */
const YER_ADI = /^(secili|aktif|yeni|eski|son)?(il|ilce|sehir|mahalle|semt|bolge|konum|yer|cami|sokak|cadde)(adi|ad|ismi)?$/i;
const YER_DIGER = /^(adres\w*|address\w*|city|district|town|street|province|neighbou?rhood|plakaKodu|postaKodu|postalCode|(secili)?(il|ilce)Id)$/i;

/** TV eşleme kodu taşıyabilecek alan adı ve kodun biçimi (7 hane; gösterimde "168 4892"). */
const KOD_ANAHTARI = /^(kod|code)$|kodu$/i;
const ESLEME_KODU_BICIMI = /^\d{3} ?\d{4}$/;

/** İç içe yapı bu derinliği aşarsa (ya da döngüselse) dal tümden gizlenir. */
const AZAMI_DERINLIK = 12;

function sirAnahtariMi(ad: string): boolean {
  return SIR_ICEREN.test(ad) || SIR_TAM_AD.test(ad) || SIR_SON_SOZCUK.test(ad) || SIR_KEY.test(ad);
}

function koordinatAnahtariMi(ad: string): boolean {
  return KOORDINAT_TAM_AD.test(ad) || KOORDINAT_SON_SOZCUK.test(ad);
}

function yerAnahtariMi(ad: string): boolean {
  return YER_ADI.test(ad) || YER_DIGER.test(ad);
}

function eslemeKoduMu(ad: string, deger: unknown): boolean {
  if (!KOD_ANAHTARI.test(ad)) return false;
  if (typeof deger === 'string') return ESLEME_KODU_BICIMI.test(deger.trim());
  return typeof deger === 'number' && Number.isInteger(deger) && deger >= 1000000 && deger <= 9999999;
}

/** Koordinat değeri: konum paylaşılıyorsa 1 ondalığa (≈ 11 km) indirilir, yoksa gizlenir. */
function koordinatDegeriniMaskele(deger: unknown, konumDahil: boolean, derinlik: number): unknown {
  if (deger === null || deger === undefined || typeof deger === 'boolean') return deger;
  if (typeof deger === 'number') {
    if (!konumDahil) return KONUM_GIZLENDI;
    return Number.isFinite(deger) ? Number(deger.toFixed(1)) : deger;
  }
  if (typeof deger === 'string') {
    const sayi = /^\s*-?\d+(\.\d+)?\s*$/.test(deger) ? parseFloat(deger) : NaN;
    return konumDahil && Number.isFinite(sayi) ? sayi.toFixed(1) : KONUM_GIZLENDI;
  }
  if (Array.isArray(deger)) {
    return derinlik >= AZAMI_DERINLIK
      ? GIZLENDI
      : deger.map((oge) => koordinatDegeriniMaskele(oge, konumDahil, derinlik + 1));
  }
  // Nesne (`{ lat, lng }`): alan adlarına göre süz.
  return maskele(deger, konumDahil, derinlik);
}

function maskele(veri: unknown, konumDahil: boolean, derinlik: number): unknown {
  if (veri === null || typeof veri !== 'object') return veri;
  if (derinlik >= AZAMI_DERINLIK) return GIZLENDI;
  if (Array.isArray(veri)) return veri.map((oge) => maskele(oge, konumDahil, derinlik + 1));
  // Error'ın alanları sayılabilir değildir: olduğu gibi dönerse JSON'a `{}` dökülür (tanı
  // kaybolur) ve başka bir yazıcı onu maskelenmemiş basabilir. Düz nesneye indirilir; ileti
  // ve yığın metin yedek ağından geçer. Date gibi `toJSON`'lu nesneler kendi dizesini verir.
  if (veri instanceof Error) {
    return maskele(
      { name: veri.name, message: veri.message, ...(veri.stack ? { stack: veri.stack } : {}) },
      konumDahil,
      derinlik + 1,
    );
  }
  const jsonaCevir = (veri as { toJSON?: unknown }).toJSON;
  if (typeof jsonaCevir === 'function') {
    return maskele((jsonaCevir as () => unknown).call(veri), konumDahil, derinlik + 1);
  }

  // Prototipsiz hedef: veride `__proto__` adlı alan olsa da sıradan alan olarak kalır.
  const sonuc: Record<string, unknown> = Object.create(null);
  for (const ad of Object.keys(veri)) {
    const deger = (veri as Record<string, unknown>)[ad];
    if (sirAnahtariMi(ad)) {
      // Boş/boolean değer sır değildir ("belirteç var mı" tanı bilgisidir).
      sonuc[ad] = deger === null || deger === undefined || typeof deger === 'boolean' ? deger : GIZLENDI;
    } else if (koordinatAnahtariMi(ad) || KOORDINAT_KABI.test(ad)) {
      sonuc[ad] = koordinatDegeriniMaskele(deger, konumDahil, derinlik + 1);
    } else if (!konumDahil && yerAnahtariMi(ad) && (typeof deger === 'number' || (typeof deger === 'string' && deger !== ''))) {
      sonuc[ad] = KONUM_GIZLENDI;
    } else if (!konumDahil && eslemeKoduMu(ad, deger)) {
      sonuc[ad] = KONUM_GIZLENDI;
    } else {
      sonuc[ad] = maskele(deger, konumDahil, derinlik + 1);
    }
  }
  return sonuc;
}

/**
 * Log `data`'sını alan adına göre maskeler (iç içe nesne/dizi dahil); girdiyi DEĞİŞTİRMEZ.
 * Sır alanları her zaman gizlenir; koordinat `konumDahil` ise 1 ondalığa iner, değilse
 * gizlenir; yer adı alanları yalnız `konumDahil: false` iken gizlenir.
 */
export function veriyiMaskele(veri: unknown, secenek: { konumDahil: boolean }): unknown {
  return maskele(veri, secenek.konumDahil, 0);
}

// ==================== 2) METİN ÜZERİNDE MASKELEME (yedek ağ) ====================
// Log MESAJLARI ve dize `data` için: alan adı bilgisi yoktur, yalnız yazım biçimi yakalanır.

// Ondalıklı koordinat çiftlerini yakalar (en az 1 ondalık): "41.0082, 28.9784"
const KOORDINAT = /(-?\d{1,3}\.\d{1,})\s*,\s*(-?\d{1,3}\.\d{1,})/g;
// Adıyla yazılmış TEK koordinat: `"lat": 41.008237` (JSON; çiftin arasına alan adı girer),
// `lat=41.008237 lng=28.978359`, `enlem: 41.0`. Camel son sözcük (`sonLat=…`) ayrı desendedir
// çünkü büyük/küçük harf orada ayırt edicidir.
const KOORDINAT_ALANI = /((?:\b|_)(?:lat|lng|lon|latitude|longitude|enlem|boylam)["']?\s*[:=]\s*["']?)(-?\d+(?:\.\d+)?)/gi;
const KOORDINAT_ALANI_CAMEL = /([a-z0-9](?:Lat|Lng|Lon|Latitude|Longitude|Enlem|Boylam)["']?\s*[:=]\s*["']?)(-?\d+(?:\.\d+)?)/g;
// token=..., api_key: ..., secret ..., password=..., authorization ... gibi gizli DEĞERLER.
// Değer yakalaması (sırayla): "bearer <jwt>" (Authorization: Bearer ... — tek \S+ JWT'yi
// kaçırmasın), "tırnaklı çok-kelimeli değer" (örn. "password": "my secret password" — ilk
// boşlukten sonrasını sızdırmasın), aksi halde tek token \S+. "bearer" anahtar olarak da
// listede → kendi başına da yakalanır.
const SIR = /\b(token|api[_-]?key|secret|bearer|password|authorization)\b\s*[:=]?\s*(bearer\s+\S+|"[^"]+"|'[^']+'|\S+)/gi;
// Bileşik ve Türkçe sır alanları: `accessToken`, `refresh_token`, `belirtec`, `parola`,
// `anahtar`, `sifre`. Burada AYIRAÇ (`:` ya da `=`) ZORUNLUDUR: "belirteci yenilenemedi",
// "kardeş anahtara yazılıyor" gibi düz cümleler sır değildir ve kelime yutulmamalıdır.
const SIR_DEGERI = '("(?:[^"\\\\]|\\\\.)*"|\'[^\']*\'|[^\\s,}\\]]+)';
const SIR_ALANI = new RegExp(
  `([A-Za-z0-9_-]*(?:token|belirtec[a-z]*|parola|password|secret|sifre|sifresi|anahtar[i\\u0131]?)["']?\\s*[:=]\\s*)${SIR_DEGERI}`,
  'gi',
);
// `sir` kısa bir hecedir ("kesir", "tesir"): yalnız tam sözcük ya da camel son sözcük.
const SIR_ALANI_KISA = new RegExp(`((?:(?:\\b|_)sir|[a-z0-9]Sir)["']?\\s*[:=]\\s*)${SIR_DEGERI}`, 'g');
// JSON log data'sında şehir/ilçe/adres adlarını taşıyan alanlar
// exportLogs() formatı: "alan": "değer"  (JSON.stringify ile 2-boşluk girintili)
// Yeni konum taşıyan log alanı eklenirse buraya VE yukarıdaki YER_ADI/YER_DIGER'e
// kaydedilmeli; isim-bazlı, en iyi-çaba.
// i bayrağı: "Il"/"Sehir" gibi büyük-harfli alan adları da yakalansın.
const SEHIR_ALANI = /"((?:secili)?(?:il|ilce|sehir|mahalle|semt|bolge|konum|yer|cami)(?:adi)?|adres|city|district)"\s*:\s*"((?:[^"\\]|\\.)*)"/gi;

// 7 haneli TV eşleme kodu (konumu taşır): `"kod": "1234567"`, `kod=168 4892`. `kod=404`,
// `kod=E_FOO` gibi durum/hata kodları 7 hane olmadığı için tutmaz.
const ESLEME_KODU_ALANI = /([A-Za-z0-9_]*kodu?["']?\s*[:=]\s*["']?)\d{3} ?\d{4}(?!\d)/gi;

function koordinatAlaniniMaskele(metin: string, desen: RegExp, konumDahil: boolean): string {
  return metin.replace(desen, (_m, onEk: string, sayi: string) =>
    `${onEk}${konumDahil ? parseFloat(sayi).toFixed(1) : KONUM_GIZLENDI}`
  );
}

export function loglariMaskele(metin: string, secenek: { konumDahil: boolean }): string {
  // KOORDINAT'ı SIR'den ÖNCE çalıştır: aksi halde "secret 41.0082, 28.9784" gibi
  // dizilerde SIR koordinatın bir parçasını yutup boylamı sızdırabilir.
  let cikti = metin.replace(KOORDINAT, (_m, lat: string, lng: string) =>
    secenek.konumDahil
      ? `${parseFloat(lat).toFixed(1)}, ${parseFloat(lng).toFixed(1)}`
      : KONUM_GIZLENDI
  );
  cikti = koordinatAlaniniMaskele(cikti, KOORDINAT_ALANI, secenek.konumDahil);
  cikti = koordinatAlaniniMaskele(cikti, KOORDINAT_ALANI_CAMEL, secenek.konumDahil);
  cikti = cikti.replace(SIR, `$1=${GIZLENDI}`);
  cikti = cikti.replace(SIR_ALANI, `$1${GIZLENDI}`);
  cikti = cikti.replace(SIR_ALANI_KISA, `$1${GIZLENDI}`);
  if (!secenek.konumDahil) {
    cikti = cikti.replace(SEHIR_ALANI, `"$1": "${KONUM_GIZLENDI}"`);
    cikti = cikti.replace(ESLEME_KODU_ALANI, `$1${KONUM_GIZLENDI}`);
  }
  return cikti;
}

/**
 * Cihazdan ÇIKACAK log metni (tanı raporu, log paylaşımı): her kaydın `data`'sı önce alan
 * adına göre maskelenir, ardından bütün metin desen yedek ağından geçer. Logu dışarı
 * veren her yer bunu kullanır; `Logger.exportLogs()` çıktısını çıplak paylaşma.
 */
export function maskeliLogMetni(secenek: { konumDahil: boolean }): string {
  return loglariMaskele(Logger.exportLogs((veri) => veriyiMaskele(veri, secenek)), secenek);
}

export function taniRaporuOlustur(opts: {
  baglam?: string;
  konumDahil: boolean;
  neOldu?: string;
}): { konu: string; govde: string; logMetni: string } {
  const c = (Platform.constants ?? {}) as { Model?: string; Release?: string };
  const m = metin().genel.tani.rapor;
  const cihaz = c.Model ?? m.bilinmiyor;
  const os = `${Platform.OS} ${c.Release ?? Platform.Version}`;
  const logMetni = maskeliLogMetni({ konumDahil: opts.konumDahil });

  const govde = [
    m.giris,
    '',
    bicim(m.surum, { surum: UYGULAMA.VERSIYON }),
    bicim(m.cihaz, { cihaz }),
    `Android/OS: ${os}`,
    opts.baglam ? bicim(m.baglam, { baglam: opts.baglam }) : '',
    opts.neOldu ? bicim(m.neOldu, { neOldu: opts.neOldu }) : '',
  ].filter(Boolean).join('\n');

  return {
    konu: bicim(m.konu, { ad: UYGULAMA.ADI, surum: UYGULAMA.VERSIYON }),
    govde,
    logMetni,
  };
}
