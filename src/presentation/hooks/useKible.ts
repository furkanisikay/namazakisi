import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppState, Linking } from 'react-native';
import * as Location from 'expo-location';
import { Coordinates, Qibla } from 'adhan';
import { Logger } from '../../core/utils/Logger';

/**
 * Qibla direction hook result interface.
 * Contains compass orientation, qibla angle, and device-relative target angle.
 */
interface UseKibleSonuc {
  /** Qibla angle from true north (0-360 degrees). */
  kibleAcisi: number;
  /** Current compass heading - true north relative (0-360 degrees). */
  pusulaYonelimi: number;
  /** Device-relative angle to Kaaba (0 = pointing at Kaaba). */
  hedefAcisi: number;
  /** Whether location permission was granted. */
  izinVerildi: boolean;
  /** Whether the hook is still initializing. */
  yukleniyor: boolean;
  /** Error message if initialization failed. */
  hata: string | null;
  /**
   * İzin reddedildiyse sistem diyaloğu yeniden açılabilir mi (`canAskAgain`)?
   * `false` → yalnız Ayarlar; `null` → bilinmiyor / izin sorunu yok.
   */
  izinTekrarSorulabilir: boolean | null;
  /**
   * Pusula doğruluğu (expo `accuracy`, iki platformda 0–3; 3 en iyi). Okunamadıysa `null`.
   * Kalibrasyon ipucu buna bağlıdır: ≤ 1 → belirgin, ≥ 2 → gizli, null → sönük ipucu.
   */
  pusulaDogrulugu: number | null;
  /** Cihazda manyetometre var mı? `false` → pusula hiç çalışmaz (harita modu önerilir). */
  pusulaVar: boolean | null;
  /** İzni yeniden ister (sorulabiliyorsa diyalog, değilse uygulama ayarları). */
  izinIste: () => Promise<void>;
}

/** Kalibrasyon ipucunun hâli: belirgin (doğruluk düşük), sönük (bilinmiyor), yok. */
export function kalibrasyonIpucu(dogruluk: number | null): 'belirgin' | 'sonuk' | null {
  if (dogruluk === null || !Number.isFinite(dogruluk)) return 'sonuk';
  return dogruluk <= 1 ? 'belirgin' : null;
}

/**
 * Pusula doğruluğu KARARLI hâle gelmeden ekrana yazılmaz (kalibrasyon ipucu titremesin).
 *
 * Başlık izlemesi açılırken ilk okumalar çoğu cihazda `accuracy: 0` (henüz kalibre
 * edilmedi) gelir, birkaç yüz ms sonra gerçek değere oturur → ipucu bir an "belirgin"
 * yanıp söner. Bir değer ancak aynı değer en az `DOGRULUK_KARARLI_OKUMA` kez ve en az
 * `DOGRULUK_KARARLI_MS` boyunca üst üste geldiyse kabul edilir; o zamana kadar önceki
 * kabul edilen değer (ilk açılışta `null` → sönük ipucu) kalır.
 *
 * Manyetometrenin kendi doğruluğu ayrı okunamaz: expo-sensors `MagnetometerMeasurement`
 * yalnız x/y/z/zaman taşır; tek kaynak expo-location başlık okumasının `accuracy`'sidir.
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

/**
 * Custom hook that calculates the Qibla direction using device sensors.
 * Uses expo-location for true heading (accounts for magnetic declination)
 * and adhan library for Qibla angle calculation.
 * @returns {UseKibleSonuc} Qibla direction data including compass heading and target angle.
 */
export const useKible = (): UseKibleSonuc => {
  const [izinVerildi, setIzinVerildi] = useState(false);
  const [pusulaYonelimi, setPusulaYonelimi] = useState(0);
  const [kibleAcisi, setKibleAcisi] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [izinTekrarSorulabilir, setIzinTekrarSorulabilir] = useState<boolean | null>(null);
  const [pusulaDogrulugu, setPusulaDogrulugu] = useState<number | null>(null);
  const [pusulaVar, setPusulaVar] = useState<boolean | null>(null);
  const [deneme, setDeneme] = useState(0);
  const dogrulukIzi = useRef<DogrulukIzi>(BOS_DOGRULUK_IZI);

  // Manyetometre var mı? (expo-sensors tembel: yoksa ya da patlarsa bilinmiyor.)
  useEffect(() => {
    let iptal = false;
    try {
      const { Magnetometer } = require('expo-sensors') as typeof import('expo-sensors');
      void Magnetometer.isAvailableAsync?.()
        .then((v) => {
          if (!iptal && typeof v === 'boolean') setPusulaVar(v);
        })
        .catch(() => undefined);
    } catch {
      // bilinmiyor
    }
    return () => {
      iptal = true;
    };
  }, []);

  useEffect(() => {
    let headingSubscription: { remove: () => void } | null = null;
    let isMounted = true;

    const servisiBaslat = async () => {
      try {
        // Konum izinlerini kontrol et
        const izin = await Location.requestForegroundPermissionsAsync();
        if (izin.status !== 'granted') {
          if (isMounted) {
            setIzinTekrarSorulabilir(typeof izin.canAskAgain === 'boolean' ? izin.canAskAgain : null);
            setHata('Kıble yönünü bulmak için konum izni gerekiyor.');
          }
          return;
        }
        if (isMounted) {
          setIzinVerildi(true);
          setIzinTekrarSorulabilir(null);
          setHata(null);
        }

        // Mevcut konumu al
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Adhan kutuphanesi ile Kible acisini hesapla (Gercek Kuzey'e gore)
        const coords = new Coordinates(location.coords.latitude, location.coords.longitude);
        const qiblaAngle = Qibla(coords);
        if (isMounted) setKibleAcisi(qiblaAngle);

        // Gercek kuzey yonelimini al (manyetik sapmayi otomatik duzeltir)
        // watchHeadingAsync trueHeading degerini dondurur
        headingSubscription = await Location.watchHeadingAsync((headingData) => {
          if (!isMounted) return;

          // trueHeading manyetik sapmayi hesaba katarak gercek kuzeye gore aci verir
          // magHeading ise sadece manyetik kuzeye goredir
          const heading = headingData.trueHeading >= 0
            ? headingData.trueHeading
            : headingData.magHeading;

          setPusulaYonelimi(heading);
          if (typeof headingData.accuracy === 'number' && Number.isFinite(headingData.accuracy)) {
            // İz ref'te tutulur (okumalar saniyede çok kez gelir); yalnız KARARLI değer çizilir.
            const { iz, kararli } = dogrulukAdimi(dogrulukIzi.current, headingData.accuracy, Date.now());
            dogrulukIzi.current = iz;
            if (kararli !== null) setPusulaDogrulugu((o) => (o === kararli ? o : kararli));
          }
        });
      } catch (err: unknown) {
        const hataMesaji = (err as Error)?.message || '';
        if (hataMesaji.includes('location is unavailable') || hataMesaji.includes('location services')) {
          Logger.warn('Kible', 'Konum servisi kullanilamiyor', hataMesaji);
          if (isMounted) {
            setHata('Konum servislerine erişilemiyor. Lütfen cihazınızın konum ayarlarını kontrol edin.');
          }
        } else {
          Logger.error('Kible', 'Kible servisi hatasi', err);
          if (isMounted) {
            setHata('Kıble servisi başlatılamadı.');
          }
        }
      } finally {
        if (isMounted) setYukleniyor(false);
      }
    };

    servisiBaslat();

    return () => {
      isMounted = false;
      if (headingSubscription) {
        headingSubscription.remove();
      }
    };
  }, [deneme]);

  // Ayarlar'dan dönen kullanıcı izni vermiş olabilir: izin hatasındayken yeniden dene.
  useEffect(() => {
    if (izinVerildi || izinTekrarSorulabilir === null) return;
    let abonelik: { remove(): void } | undefined;
    try {
      abonelik = AppState.addEventListener('change', (d) => {
        if (d === 'active') setDeneme((n) => n + 1);
      });
    } catch {
      // AppState'siz ortam
    }
    return () => abonelik?.remove();
  }, [izinVerildi, izinTekrarSorulabilir]);

  const izinIste = useCallback(async () => {
    if (izinTekrarSorulabilir === false) {
      try {
        await Linking.openSettings();
      } catch {
        // açılamadı
      }
      return;
    }
    setYukleniyor(true);
    setHata(null);
    setDeneme((n) => n + 1);
  }, [izinTekrarSorulabilir]);

  // Hedef acisi: Kullanicinin telefonunu cevirmesi gereken yon
  // Pusula Yonelimi: Gercek kuzey (0) ne tarafta (heading)
  // Kible Acisi: Kuzey'e gore Kabe (orn: 150 derece)
  // Kabe'nin telefona gore acisi = kibleAcisi - pusulaYonelimi
  const hedefAcisi = useMemo(() => {
    let aci = kibleAcisi - pusulaYonelimi;
    if (aci < 0) aci += 360;
    return aci;
  }, [kibleAcisi, pusulaYonelimi]);

  return {
    kibleAcisi,
    pusulaYonelimi,
    hedefAcisi,
    izinVerildi,
    yukleniyor,
    hata,
    izinTekrarSorulabilir,
    pusulaDogrulugu,
    pusulaVar,
    izinIste,
  };
};
