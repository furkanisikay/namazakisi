/**
 * "Takvime ekle" fiilinin hareketi — motion-choreography "sana gelen kap" kalıbı
 * (sade tasarım Dalga 4). Tek sahne, ~900 ms, bir OLAYLA (oluşturma başarısı) başlar:
 *
 *   1. Takvim (kap) yayla yerine oturur,
 *   2. vakit işareti yukarıdan düşüp takvime girer,
 *   3. takvim "kabul eder": köşesinde ✓ belirir, sayaç 0'dan N'e sayar.
 *
 * Boşta sıfır hareket (döngü YOK), yalnız transform + opaklık (`useNativeDriver`).
 * "Animasyonları azalt" açıksa sahne son karesinde doğar. Bilgi hareketle verilmez:
 * sayı metin olarak da yazılıdır ve ekran okuyucu tek cümle duyar.
 */
import * as React from 'react';
import { Animated, Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { EGRI, YAY } from '../../components/hareket/sureler';

/** Sahne süreleri (ms) — toplam ≈ 900. */
export const TAKVIME_EKLE_SAHNESI = { dusmeGecikmesi: 160, dusme: 260, sayac: 420 } as const;

interface Props {
  /** Eklenen etkinlik sayısı (sayacın hedefi). */
  sayi: number;
}

export const TakvimeEkleHareketi: React.FC<Props> = ({ sayi }) => {
  const renkler = useRenkler();
  const azalt = useHareketAzalt();
  const kap = React.useRef(new Animated.Value(azalt ? 1 : 0)).current;
  const dusen = React.useRef(new Animated.Value(azalt ? 1 : 0)).current;
  const onay = React.useRef(new Animated.Value(azalt ? 1 : 0)).current;
  const [gorunenSayi, setGorunenSayi] = React.useState(azalt ? sayi : 0);

  React.useEffect(() => {
    if (azalt) {
      kap.setValue(1);
      dusen.setValue(1);
      onay.setValue(1);
      setGorunenSayi(sayi);
      return;
    }
    let iptal = false;
    let cerceve: ReturnType<typeof requestAnimationFrame> | null = null;
    const sayaciBaslat = () => {
      const baslangic = Date.now();
      const adim = () => {
        if (iptal) return;
        const oran = Math.min(1, (Date.now() - baslangic) / TAKVIME_EKLE_SAHNESI.sayac);
        setGorunenSayi(Math.round(sayi * oran));
        if (oran < 1) cerceve = requestAnimationFrame(adim);
      };
      adim();
    };
    Animated.sequence([
      Animated.spring(kap, { toValue: 1, ...YAY }),
      Animated.timing(dusen, {
        toValue: 1,
        duration: TAKVIME_EKLE_SAHNESI.dusme,
        delay: TAKVIME_EKLE_SAHNESI.dusmeGecikmesi,
        easing: EGRI.giris,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished || iptal) return;
      Animated.spring(onay, { toValue: 1, ...YAY }).start();
      sayaciBaslat();
    });
    return () => {
      iptal = true;
      if (cerceve !== null) cancelAnimationFrame(cerceve);
    };
  }, [azalt, sayi, kap, dusen, onay]);

  const renk = renkler.birincil;
  return (
    <View
      testID="takvime-ekle-hareketi"
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${sayi} etkinlik takviminize eklendi`}
      style={{ alignItems: 'center', justifyContent: 'center', width: 112, height: 104, marginBottom: 12 }}
    >
      {/* Düşen vakit işareti */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          opacity: dusen.interpolate({ inputRange: [0, 0.2, 0.85, 1], outputRange: [0, 1, 1, 0] }),
          transform: [{ translateY: dusen.interpolate({ inputRange: [0, 1], outputRange: [-8, 34] }) }],
        }}
      >
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: renk }}>
          <FontAwesome5 name="mosque" size={13} color={renkler.birincilMetin} />
        </View>
      </Animated.View>

      {/* Kap: takvim */}
      <Animated.View
        style={{
          marginTop: 24,
          width: 76,
          height: 72,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: renk + '1A',
          opacity: kap,
          transform: [{ scale: kap.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
        }}
      >
        <FontAwesome5 name="calendar-alt" size={30} color={renk} solid />
        <Text style={{ fontSize: 14, fontWeight: '700', color: renkler.metin, marginTop: 4 }}>{gorunenSayi}</Text>
        {/* Kabul: köşede ✓ */}
        <Animated.View
          style={{
            position: 'absolute',
            right: -8,
            bottom: -8,
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: renkler.basarili,
            opacity: onay,
            transform: [{ scale: onay }],
          }}
        >
          <FontAwesome5 name="check" size={13} color={renkler.birincilMetin} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};
