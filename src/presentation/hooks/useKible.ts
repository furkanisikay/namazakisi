import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Coordinates, Qibla } from 'adhan';

interface UseKibleSonuc {
  kibleAcisi: number;
  pusulaYonelimi: number; // Manyetik Kuzey (0-360)
  hedefAcisi: number; // Cihazın tepesine göre Kabe'nin açısı
  izinVerildi: boolean;
  yukleniyor: boolean;
  hata: string | null;
}

export const useKible = (): UseKibleSonuc => {
  const [izinVerildi, setIzinVerildi] = useState(false);
  const [pusulaYonelimi, setPusulaYonelimi] = useState(0);
  const [kibleAcisi, setKibleAcisi] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const servisiBaslat = async () => {
      try {
        // İzinleri kontrol et
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setHata('Konum izni verilmedi. Kıble yönünü hesaplamak için konum izni gereklidir.');
          setYukleniyor(false);
          return;
        }
        setIzinVerildi(true);

        // Mevcut konumu al
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Adhan kütüphanesi ile Kıble açısını hesapla (Gerçek Kuzey'e göre)
        const coords = new Coordinates(location.coords.latitude, location.coords.longitude);
        const qiblaAngle = Qibla(coords);
        setKibleAcisi(qiblaAngle);

        // Manyetometre sensörünü dinle
        Magnetometer.setUpdateInterval(100); // 100ms
        subscription = Magnetometer.addListener((data) => {
          const { x, y } = data;
          // Magnetometer verisinden açı hesaplama (radyan -> derece)
          // Cihazın üst kısmının manyetik kuzeye göre açısı
          let angle = Math.atan2(y, x) * (180 / Math.PI);

          // Açıyı 0-360 aralığına normalize et
          // Not: Sensör koordinatları cihaza göre değişebilir, genellikle:
          // angle = angle - 90;
          angle = angle - 90;

          if (angle < 0) {
            angle = angle + 360;
          }

          setPusulaYonelimi(angle);
        });

        setYukleniyor(false);
      } catch (err) {
        console.error('Kıble servisi hatası:', err);
        setHata('Kıble servisi başlatılamadı.');
        setYukleniyor(false);
      }
    };

    servisiBaslat();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Hedef açısı: Kullanıcının telefonunu çevirmesi gereken yön
  // Eğer telefon tam kıbleye bakıyorsa bu değer 0 (veya 360) olmalı.
  // Pusula Yönelimi: Kuzey (0) ne tarafta?
  // Kıble Açısı: Kuzey'e göre Kabe (örneğin 150 derece) ne tarafta?
  // Telefonun baktığı yön (Heading) = pusulaYonelimi
  // Kabe'nin telefona göre açısı = kibleAcisi - pusulaYonelimi
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
