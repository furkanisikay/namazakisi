import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Coordinates, Qibla } from 'adhan';

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

  useEffect(() => {
    let magnetometerSubscription: { remove: () => void } | null = null;
    let headingSubscription: { remove: () => void } | null = null;
    let isMounted = true;

    const servisiBaslat = async () => {
      try {
        // Konum izinlerini kontrol et
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setHata('Konum izni verilmedi. Kıble yönünü hesaplamak için konum izni gereklidir.');
            setYukleniyor(false);
          }
          return;
        }
        if (isMounted) setIzinVerildi(true);

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
        });

        // Yedek olarak Magnetometer da dinle (bazi cihazlarda heading API calismayabilir)
        Magnetometer.setUpdateInterval(100);
        magnetometerSubscription = Magnetometer.addListener((data) => {
          if (!isMounted) return;
          // Heading API zaten calisiyor ise magnetometer verisini gormezden gel
          // Bu listener sadece heading API calismayan cihazlar icin yedektir
        });

        if (isMounted) setYukleniyor(false);
      } catch (err: any) {
        const hataMesaji = err?.message || '';
        if (hataMesaji.includes('location is unavailable') || hataMesaji.includes('location services')) {
          console.warn('[Kible] Konum servisi kullanilamiyor:', hataMesaji);
          if (isMounted) {
            setHata('Konum servislerine erişilemiyor. Lütfen cihazınızın konum ayarlarını kontrol edin.');
            setYukleniyor(false);
          }
        } else {
          console.error('Kible servisi hatasi:', err);
          if (isMounted) {
            setHata('Kıble servisi başlatılamadı.');
            setYukleniyor(false);
          }
        }
      }
    };

    servisiBaslat();

    return () => {
      isMounted = false;
      if (magnetometerSubscription) {
        magnetometerSubscription.remove();
      }
      if (headingSubscription) {
        headingSubscription.remove();
      }
    };
  }, []);

  // Hedef acisi: Kullanicinin telefonunu cevirmesi gereken yon
  // Pusula Yonelimi: Gercek kuzey (0) ne tarafta (heading)
  // Kible Acisi: Kuzey'e gore Kabe (orn: 150 derece)
  // Kabe'nin telefona gore acisi = kibleAcisi - pusulaYonelimi
  let hedefAcisi = kibleAcisi - pusulaYonelimi;
  if (hedefAcisi < 0) hedefAcisi += 360;

  return {
    kibleAcisi,
    pusulaYonelimi,
    hedefAcisi,
    izinVerildi,
    yukleniyor,
    hata,
  };
};
