import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform as PlatformRN } from 'react-native';
import * as Location from 'expo-location';
import { Coordinates, Qibla } from 'adhan';
import { Logger } from '../../core/utils/Logger';
import { aciFarki, aciNormalize, hizalandiMi } from '../../core/kible/acilar';
import { DunyaTabani, EksenDenetimi, Vektor3, VektorSuzgeci, dikOrani, egimDerece } from '../../core/kible/cihazYonelimi';
import {
  OneEuroAcisal,
  Platform,
  YonCiktisi,
  YonFiltresi,
  asagiVektoru,
  donusHiziCihazEkseni,
  yonKalitesi,
} from '../../core/kible/yonFiltresi';

/**
 * Bir sensör karesinin özeti. Saniyede ~50 kez üretilir ve React state'ine YAZILMAZ:
 * çizim katmanı (`abone`) bunu doğrudan Reanimated shared value'lara aktarır. Eskiden her
 * yön okuması `setState` ile tüm ekranı yeniden çiziyordu (60 Hz React render → takılma).
 */
export interface KibleKaresi {
  /** Süzülmüş gerçek-kuzey yönü [0,360) — telefonun baktığı yön. */
  baslik: number;
  /** Sarmasız birikimli yön (döndürme animasyonu tur atmasın). */
  surekliBaslik: number;
  /** Kıble − yön, (−180,180]. Kıble açısı henüz bilinmiyorsa null. */
  fark: number | null;
  /** 0 = düz, 1 = dik (yumuşak geçiş oranı). */
  dikOrani: number;
  /** Ekranın yukarıya göre açısı (derece) ya da bilinmiyor. */
  egim: number | null;
  /** Kamera izdüşümü için manyetik taban; vektör yolu güvenilmezse null. */
  taban: DunyaTabani | null;
  /** Gerçek − manyetik kuzey (derece; doğu pozitif). */
  manyetikSapma: number;
  /** Yön kalitesi 0..1 (`yonKalitesi`) — kalibrasyon rehberinin canlı göstergesi. */
  kalite: number;
}

/** Yön süzgecinin teşhisi (kalibrasyon rehberi) — yalnız DEĞİŞİNCE yazılır. */
export interface KibleTeshisi {
  /** Manyetik alan büyüklüğü beklenen aralığın dışında (metal/mıknatıs yakın). */
  alanBozuk: boolean;
  /** Telefon dururken yön tutarsız sıçrıyor. */
  tutarsiz: boolean;
}

/** Ekranda metin olarak görünenler — yalnız DEĞİŞİNCE ve en çok ~4/sn yazılır. */
export interface KibleOzeti {
  /** İlk yön okuması geldi mi? Gelmeden kadran "hazırlanıyor" çizilir. */
  hazir: boolean;
  baslik: number;
  fark: number | null;
  hizali: boolean;
  dik: boolean;
}

interface UseKibleSonuc {
  /** Kıble açısı (gerçek kuzeye göre). Konum henüz okunmadıysa null. */
  kibleAcisi: number | null;
  /** Kıble açısının hesaplandığı konum (mesafe için). */
  konum: { lat: number; lng: number } | null;
  ozet: KibleOzeti;
  /** Kare aboneliği (çizim katmanı). Dönen fonksiyon aboneliği kaldırır. */
  abone: (dinleyici: (kare: KibleKaresi) => void) => () => void;
  /**
   * Kamera görünümü bu cihazda güvenle açılabilir mi? `false` = eksen denetimi düz tutuşta
   * platform pusulasıyla sürekli uyuşmazlık buldu (yön konum servisine düştü); `null` = henüz
   * yeterli kanıt yok ya da manyetometre yok.
   */
  vektorGuvenilir: boolean | null;
  izinVerildi: boolean;
  yukleniyor: boolean;
  hata: string | null;
  izinTekrarSorulabilir: boolean | null;
  pusulaDogrulugu: number | null;
  pusulaVar: boolean | null;
  teshis: KibleTeshisi;
  izinIste: () => Promise<void>;
}

/** Kalibrasyon ipucunun hâli: belirgin (doğruluk düşük), sönük (bilinmiyor), yok. */
export function kalibrasyonIpucu(dogruluk: number | null): 'belirgin' | 'sonuk' | null {
  if (dogruluk === null || !Number.isFinite(dogruluk)) return 'sonuk';
  return dogruluk <= 1 ? 'belirgin' : null;
}

/**
 * Pusula doğruluğu KARARLI hâle gelmeden ekrana yazılmaz (kalibrasyon ipucu titremesin).
 * Başlık izlemesi açılırken ilk okumalar çoğu cihazda `accuracy: 0` gelir, birkaç yüz ms
 * sonra gerçek değere oturur. Bir değer ancak en az `DOGRULUK_KARARLI_OKUMA` kez ve en az
 * `DOGRULUK_KARARLI_MS` boyunca üst üste geldiyse kabul edilir.
 */
export const DOGRULUK_KARARLI_OKUMA = 3;
export const DOGRULUK_KARARLI_MS = 1000;

export interface DogrulukIzi {
  aday: number | null;
  ilkMs: number;
  sayi: number;
}

export const BOS_DOGRULUK_IZI: DogrulukIzi = { aday: null, ilkMs: 0, sayi: 0 };

/** Saf adım: yeni okuma → güncel iz + (kararlıysa) kabul edilecek değer, değilse `null`. */
export function dogrulukAdimi(iz: DogrulukIzi, okuma: number, simdiMs: number): { iz: DogrulukIzi; kararli: number | null } {
  const yeni: DogrulukIzi = iz.aday === okuma ? { ...iz, sayi: iz.sayi + 1 } : { aday: okuma, ilkMs: simdiMs, sayi: 1 };
  const kararli = yeni.sayi >= DOGRULUK_KARARLI_OKUMA && simdiMs - yeni.ilkMs >= DOGRULUK_KARARLI_MS ? okuma : null;
  return { iz: yeni, kararli };
}

/** Sensör örnekleme aralığı (ms). Ekran odaktayken; ~50 Hz akıcı ama pil dostu. */
export const SENSOR_ARALIGI_MS = 20;
/** Eğim (düz ↔ dik geçişi) için yerçekimi süzgeci. Yön süzgeci `YonFiltresi`'nde. */
export const VEKTOR_SUZGECI_TAU_MS = 70;
/** Özet (metin) yazım aralığı — ekran okuyucu ve derece yazısı için yeter. */
export const OZET_ARALIGI_MS = 250;
/** Manyetometre bu kadar susarsa vektör yolu bayat sayılır, yön konum servisine düşer. */
const MANYETIK_BAYAT_MS = 600;

const BOS_OZET: KibleOzeti = { hazir: false, baslik: 0, fark: null, hizali: false, dik: false };

type Abonelik = { remove: () => void } | null | undefined;

function sensorleriYukle(): typeof import('expo-sensors') | null {
  try {
    return require('expo-sensors') as typeof import('expo-sensors');
  } catch {
    return null;
  }
}

/**
 * Kıble yönü: kıble açısı (adhan) + cihazın gerçek-kuzey yönü.
 *
 * GECİKME KÖK NEDENİ (düzeltildi): yön aboneliği önceden `getCurrentPositionAsync` (GPS
 * sabitlemesi, kapalı alanda 5–20 sn) BİTTİKTEN SONRA açılıyordu ve ekran o süre boyunca
 * "başlatılıyor" yazıyordu. Şimdi izin okunur okunmaz sensörler açılır; kıble açısı önce
 * son bilinen konumdan (anında) hesaplanır, taze konum gelince sessizce inceltilir.
 *
 * YÖN KAYNAĞI: `DeviceMotion` yerçekimi + `Magnetometer` vektörlerinden kendi tabanımız
 * (telefon dikken de doğru — kamera görünümü buna dayanır); manyetik sapma ve doğruluk
 * expo-location başlık okumasından. Manyetometre yoksa ya da eksen denetimi bozuksa yön
 * doğrudan expo-location'a düşer (düz tutuşta doğru, kamera görünümü kapanır).
 *
 * SÜZME (Kâbe işareti titriyordu — düzeltildi): "aşağı" füzyonlu yerçekimidir (el ivmesi
 * ayıklanmış), yön `YonFiltresi` ile süzülür (jiroskop doğrulanınca tamamlayıcı süzgeç +
 * One Euro + ölü bölge) ve kamera tabanı da süzülmüş yönden kurulur — pusula ve kamera
 * AYNI süzgeçten beslenir. Ölçümler `core/kible/__tests__/yonFiltresi.test.ts`.
 *
 * `aktif` false iken (sekme odakta değil) hiçbir sensör çalışmaz; uygulama arka plana
 * gidince de durur (pil).
 */
export const useKible = (aktif = true): UseKibleSonuc => {
  const [izinVerildi, setIzinVerildi] = useState(false);
  const [kibleAcisi, setKibleAcisi] = useState<number | null>(null);
  const [konum, setKonum] = useState<{ lat: number; lng: number } | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [izinTekrarSorulabilir, setIzinTekrarSorulabilir] = useState<boolean | null>(null);
  const [pusulaDogrulugu, setPusulaDogrulugu] = useState<number | null>(null);
  const [pusulaVar, setPusulaVar] = useState<boolean | null>(null);
  const [vektorGuvenilir, setVektorGuvenilir] = useState<boolean | null>(null);
  const [ozet, setOzet] = useState<KibleOzeti>(BOS_OZET);
  const [teshis, setTeshis] = useState<KibleTeshisi>({ alanBozuk: false, tutarsiz: false });
  const [deneme, setDeneme] = useState(0);
  const [onPlanda, setOnPlanda] = useState(true);

  const dogrulukIzi = useRef<DogrulukIzi>(BOS_DOGRULUK_IZI);
  const dogrulukRef = useRef<number | null>(null);
  dogrulukRef.current = pusulaDogrulugu;
  const dinleyiciler = useRef(new Set<(k: KibleKaresi) => void>());
  const kibleRef = useRef<number | null>(null);
  const sonKare = useRef<KibleKaresi | null>(null);

  const abone = useCallback((dinleyici: (k: KibleKaresi) => void) => {
    dinleyiciler.current.add(dinleyici);
    if (sonKare.current) dinleyici(sonKare.current);
    return () => {
      dinleyiciler.current.delete(dinleyici);
    };
  }, []);

  // Uygulama arka plandayken sensör yok (sekme odakta kalsa bile).
  useEffect(() => {
    let abonelik: Abonelik;
    try {
      abonelik = AppState.addEventListener('change', (d) => setOnPlanda(d === 'active'));
    } catch {
      // AppState'siz ortam
    }
    return () => abonelik?.remove();
  }, []);

  // Manyetometre var mı? (expo-sensors tembel: yoksa ya da patlarsa bilinmiyor.)
  useEffect(() => {
    let iptal = false;
    const s = sensorleriYukle();
    void s?.Magnetometer?.isAvailableAsync?.()
      .then((v) => {
        if (!iptal && typeof v === 'boolean') setPusulaVar(v);
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
  }, []);

  // 1) İzin + kıble açısı. Sensörlerden BAĞIMSIZ: kıble açısı gelmeden de kadran döner.
  useEffect(() => {
    let isMounted = true;
    const kibleYaz = (lat: number, lng: number) => {
      if (!isMounted || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const aci = Qibla(new Coordinates(lat, lng));
      kibleRef.current = aci;
      setKibleAcisi(aci);
      setKonum({ lat, lng });
    };

    const baslat = async () => {
      try {
        // Konum izni yalnız OKUNUR (sade tasarım Dalga 4): ilk odakta açıklamasız sistem
        // diyaloğu Play'in "önce açıklama" kuralına aykırıdır; ekran `DurumSatiri` sunar.
        const izin = await Location.getForegroundPermissionsAsync();
        if (izin.status !== 'granted') {
          if (isMounted) {
            setIzinTekrarSorulabilir(typeof izin.canAskAgain === 'boolean' ? izin.canAskAgain : null);
            setHata('Kıble yönünü bulmak için konum izni gerekiyor.');
            setYukleniyor(false);
          }
          return;
        }
        if (isMounted) {
          setIzinVerildi(true);
          setIzinTekrarSorulabilir(null);
          setHata(null);
          // Sensörler bu noktada açılır (2. effect `izinVerildi`'ye bağlı) — GPS BEKLENMEZ.
          setYukleniyor(false);
        }

        // Son bilinen konum anında gelir; kıble açısı ≈11 km hatada bile ~0,1° değişir.
        let sonBilinenVar = false;
        try {
          const son = await Location.getLastKnownPositionAsync?.();
          if (son?.coords) {
            kibleYaz(son.coords.latitude, son.coords.longitude);
            sonBilinenVar = true;
          }
        } catch {
          // son bilinen konum yok — taze konumu bekle
        }

        try {
          const taze = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          kibleYaz(taze.coords.latitude, taze.coords.longitude);
        } catch (err) {
          if (sonBilinenVar) {
            Logger.warn('Kible', 'Taze konum alinamadi, son bilinen konum kullaniliyor');
            return;
          }
          throw err;
        }
      } catch (err: unknown) {
        const hataMesaji = (err as Error)?.message || '';
        if (hataMesaji.includes('location is unavailable') || hataMesaji.includes('location services')) {
          Logger.warn('Kible', 'Konum servisi kullanilamiyor', hataMesaji);
          if (isMounted) setHata('Konum servislerine erişilemiyor. Lütfen cihazınızın konum ayarlarını kontrol edin.');
        } else {
          Logger.error('Kible', 'Kible servisi hatasi', err);
          if (isMounted) setHata('Kıble servisi başlatılamadı.');
        }
        if (isMounted) setYukleniyor(false);
      }
    };

    void baslat();
    return () => {
      isMounted = false;
    };
  }, [deneme]);

  // 2) Sensörler: yalnız izin varken, ekran etkin ve uygulama ön plandayken.
  const calisiyor = izinVerildi && aktif && onPlanda;
  useEffect(() => {
    if (!calisiyor) return;
    let isMounted = true;
    const abonelikler: Abonelik[] = [];
    // Pusula ve kamera AYNI süzgeçten beslenir (`core/kible/yonFiltresi`).
    const platform: Platform = PlatformRN.OS === 'ios' ? 'ios' : 'android';
    const filtre = new YonFiltresi();
    // Yedek yol (konum servisi yönü) ve eğim için ayrı, hafif süzgeçler.
    const yedekSuzgec = new OneEuroAcisal();
    const yerCekimi = new VektorSuzgeci(VEKTOR_SUZGECI_TAU_MS);
    const denetim = new EksenDenetimi();
    let bekleyenManyetik: Vektor3 | null = null;
    let oncekiBaslik: number | null = null;
    let surekli = 0;
    let sonTeshis: { alanBozuk: boolean; tutarsiz: boolean } = { alanBozuk: false, tutarsiz: false };
    const teshisYaz = () => {
      const t = filtre.teshis;
      kalite = yonKalitesi(t, dogrulukRef.current);
      if (t.alanBozuk !== sonTeshis.alanBozuk || t.tutarsiz !== sonTeshis.tutarsiz) {
        sonTeshis = { alanBozuk: t.alanBozuk, tutarsiz: t.tutarsiz };
        setTeshis(sonTeshis);
      }
    };
    let kalite = 1;
    let sonManyetikMs = -Infinity;
    let konumBasligi: { gercek: number; manyetik: number; ms: number } | null = null;
    let manyetikSapma = 0;
    let eksenBozuk = false;
    let guvenYazildi: boolean | null = null;
    let hizali = false;
    let sonOzetMs = -Infinity;
    let sonOzet: KibleOzeti = BOS_OZET;
    const simdi = () => Date.now();

    const ozetYaz = (o: KibleOzeti, zorla: boolean) => {
      const t = simdi();
      if (!zorla && t - sonOzetMs < OZET_ARALIGI_MS) return;
      if (
        o.hazir === sonOzet.hazir &&
        o.baslik === sonOzet.baslik &&
        o.fark === sonOzet.fark &&
        o.hizali === sonOzet.hizali &&
        o.dik === sonOzet.dik
      ) {
        return;
      }
      sonOzetMs = t;
      sonOzet = o;
      setOzet(o);
    };

    const yay = (baslik: number, egim: number | null, taban: DunyaTabani | null) => {
      surekli = oncekiBaslik === null ? baslik : surekli + aciFarki(baslik, oncekiBaslik);
      oncekiBaslik = baslik;
      const kible = kibleRef.current;
      const fark = kible === null ? null : aciFarki(kible, baslik);
      const yeniHizali = fark === null ? false : hizalandiMi(hizali, fark);
      const oran = dikOrani(egim);
      const kare: KibleKaresi = {
        baslik,
        surekliBaslik: surekli,
        fark,
        dikOrani: oran,
        egim,
        taban,
        manyetikSapma,
        kalite,
      };
      sonKare.current = kare;
      dinleyiciler.current.forEach((d) => {
        try {
          d(kare);
        } catch {
          // bir çizim dinleyicisi patlarsa diğerleri sürsün
        }
      });
      const durumDegisti = yeniHizali !== hizali || (oran >= 0.5) !== sonOzet.dik || !sonOzet.hazir;
      hizali = yeniHizali;
      ozetYaz(
        { hazir: true, baslik: Math.round(baslik) % 360, fark: fark === null ? null : Math.round(fark), hizali, dik: oran >= 0.5 },
        durumDegisti,
      );
    };

    /**
     * Hareket olayında `hareket` gelir (aşağı + jiroskop) ve yön süzgeci ilerletilir;
     * konum servisi başlığından çağrıldığında (yedek yol) gelmez.
     */
    const hesapla = (hareket?: { asagi: Vektor3; donus: Vektor3 | null }) => {
      if (!isMounted) return;
      const t = simdi();
      if (hareket) yerCekimi.ekle(hareket.asagi, t);
      const g = yerCekimi.deger;
      const egim = g ? egimDerece(g) : null;
      const vektorTaze = t - sonManyetikMs < MANYETIK_BAYAT_MS;
      let cikti: YonCiktisi | null = null;
      if (hareket && vektorTaze) {
        cikti = filtre.ekle({ asagi: hareket.asagi, manyetik: bekleyenManyetik, donus: hareket.donus, ms: t });
        bekleyenManyetik = null;
        teshisYaz();
      }
      const taban = cikti?.taban ?? null;
      const manyetikYon = cikti ? cikti.manyetikYon : null;

      // Eksen denetimi: düz tutuşta platform pusulasıyla karşılaştır (yalnız taze okumada).
      if (manyetikYon !== null && egim !== null && egim < 30 && konumBasligi && t - konumBasligi.ms < 500) {
        denetim.ekle(Math.abs(aciFarki(manyetikYon, konumBasligi.manyetik)));
        if (denetim.bozuk && !eksenBozuk) {
          eksenBozuk = true;
          Logger.warn('Kible', 'Vektor yonu platform pusulasiyla uyusmuyor; konum servisi yonune dusuldu');
        }
        const guven = denetim.bozuk ? false : denetim.dogrulandi ? true : null;
        if (guven !== guvenYazildi) {
          guvenYazildi = guven;
          setVektorGuvenilir(guven);
        }
      }

      if (manyetikYon !== null && !eksenBozuk) {
        yay(aciNormalize(manyetikYon + manyetikSapma), cikti?.egim ?? egim, taban);
      } else if (!hareket || !vektorTaze || eksenBozuk) {
        // Yedek yol (konum servisi yönü): yalnız taze başlıkla; hareket olayı vektör yolu
        // açıkken bunu tekrar tekrar beslemesin.
        if (konumBasligi && t - konumBasligi.ms < 1500) {
          yay(yedekSuzgec.ekle(konumBasligi.gercek, t), egim, null);
        }
      }
    };

    const baslat = async () => {
      const s = sensorleriYukle();
      if (s?.DeviceMotion) {
        try {
          s.DeviceMotion.setUpdateInterval?.(SENSOR_ARALIGI_MS);
          abonelikler.push(
            s.DeviceMotion.addListener((e) => {
              // Füzyonlu yerçekimi (el titremesi ayıklanmış) varsa o; jiroskop platform eşlemeli.
              const asagi = asagiVektoru(e?.accelerationIncludingGravity, e?.acceleration);
              if (!asagi) return;
              hesapla({ asagi, donus: donusHiziCihazEkseni(e?.rotationRate, platform) });
            }),
          );
        } catch (err) {
          Logger.warn('Kible', 'Hareket algilayicisi baslatilamadi', err);
        }
      }
      if (s?.Magnetometer) {
        try {
          s.Magnetometer.setUpdateInterval?.(SENSOR_ARALIGI_MS);
          abonelikler.push(
            s.Magnetometer.addListener((e) => {
              if (!e || !Number.isFinite(e.x)) return;
              sonManyetikMs = simdi();
              bekleyenManyetik = { x: e.x, y: e.y, z: e.z };
            }),
          );
        } catch (err) {
          Logger.warn('Kible', 'Manyetometre baslatilamadi', err);
        }
      }
      try {
        const abonelik = await Location.watchHeadingAsync((h) => {
          if (!isMounted) return;
          const mag = typeof h.magHeading === 'number' ? h.magHeading : -1;
          const ger = typeof h.trueHeading === 'number' && h.trueHeading >= 0 ? h.trueHeading : mag;
          if (ger >= 0) {
            if (h.trueHeading >= 0 && mag >= 0) manyetikSapma = aciFarki(h.trueHeading, mag);
            konumBasligi = { gercek: ger, manyetik: mag >= 0 ? mag : ger, ms: simdi() };
            // Vektör yolu yoksa (manyetometre/hareket algılayıcısı açılamadı) yön buradan.
            if (simdi() - sonManyetikMs >= MANYETIK_BAYAT_MS || eksenBozuk) hesapla();
          }
          if (typeof h.accuracy === 'number' && Number.isFinite(h.accuracy)) {
            const { iz, kararli } = dogrulukAdimi(dogrulukIzi.current, h.accuracy, simdi());
            dogrulukIzi.current = iz;
            if (kararli !== null) setPusulaDogrulugu((o) => (o === kararli ? o : kararli));
          }
        });
        if (isMounted) abonelikler.push(abonelik);
        else abonelik?.remove();
      } catch (err) {
        Logger.warn('Kible', 'Yon izlemesi baslatilamadi', err);
      }
    };

    void baslat();
    return () => {
      isMounted = false;
      abonelikler.forEach((a) => a?.remove());
    };
  }, [calisiyor]);

  // Kıble açısı sonradan gelirse (taze konum) son kare yeni farkla yeniden yayılsın.
  useEffect(() => {
    const k = sonKare.current;
    if (!k || kibleAcisi === null) return;
    const kare = { ...k, fark: aciFarki(kibleAcisi, k.baslik) };
    sonKare.current = kare;
    dinleyiciler.current.forEach((d) => d(kare));
  }, [kibleAcisi]);

  // Ayarlar'dan dönen kullanıcı izni vermiş olabilir. Öne gelişte izin yalnız OKUNUR
  // (diyalog açmaz) ve ancak VERİLMİŞSE servis yeniden başlatılır (izin penceresi döngüsü dersi).
  useEffect(() => {
    if (izinVerildi || izinTekrarSorulabilir === null) return;
    let iptal = false;
    let abonelik: Abonelik;
    try {
      abonelik = AppState.addEventListener('change', (d) => {
        if (d !== 'active') return;
        void (async () => {
          try {
            const izin = await Location.getForegroundPermissionsAsync();
            if (!iptal && izin?.status === 'granted') setDeneme((n) => n + 1);
          } catch {
            // Okunamadı → hiçbir şey yapma (diyalog açmak yok).
          }
        })();
      });
    } catch {
      // AppState'siz ortam
    }
    return () => {
      iptal = true;
      abonelik?.remove();
    };
  }, [izinVerildi, izinTekrarSorulabilir]);

  const izinIste = useCallback(async () => {
    setYukleniyor(true);
    setHata(null);
    setDeneme((n) => n + 1);
  }, []);

  return {
    kibleAcisi,
    konum,
    ozet,
    abone,
    vektorGuvenilir,
    izinVerildi,
    yukleniyor,
    hata,
    izinTekrarSorulabilir,
    pusulaDogrulugu,
    pusulaVar,
    teshis,
    izinIste,
  };
};
