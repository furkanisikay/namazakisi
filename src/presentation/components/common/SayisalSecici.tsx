import * as React from 'react';
import { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';

const THROTTLE_SURESI = 100;

/**
 * Numerik artir/azalt (kare buton) bileseni.
 * TakvimAyarlari ve MuhafizAyarlari ekranlarinda paylasilir.
 * Not: SeriHedefAyarlari'ndaki yuvarlak-butonlu varyant gorsel olarak
 * farkli oldugu icin ayri tutulmustur.
 */
export interface SayisalSeciciProps {
  deger: number;
  min: number;
  max: number;
  adim?: number;
  birim?: string;
  onChange: (yeniDeger: number) => void;
  renk: string;
  /** Deger kutusunun minimum genisligi (px). Varsayilan 80. */
  degerGenisligi?: number;
  /**
   * Neyin ayarlandigi (ornegin "Kac dk kala"). Verilirse erisilebilirlik
   * etiketleri "<aciklama> artir/azalt" olur — ayni ekranda birden fazla
   * secici varsa ekran okuyucu (ve testler) ayirt edebilsin diye.
   */
  aciklama?: string;
}

export const SayisalSecici: React.FC<SayisalSeciciProps> = ({
  deger,
  min,
  max,
  adim = 1,
  birim = 'dk',
  onChange,
  renk,
  degerGenisligi = 80,
  aciklama,
}) => {
  const renkler = useRenkler();
  const azaltEtiketi = aciklama ? `${aciklama} azalt` : 'Azalt';
  const artirEtiketi = aciklama ? `${aciklama} artır` : 'Artır';
  const sonTiklamaRef = useRef<number>(0);

  const throttleKontrol = useCallback((): boolean => {
    const simdi = Date.now();
    if (simdi - sonTiklamaRef.current < THROTTLE_SURESI) {
      return false;
    }
    sonTiklamaRef.current = simdi;
    return true;
  }, []);

  const azalt = useCallback(() => {
    if (!throttleKontrol()) return;
    onChange(Math.max(min, deger - adim));
  }, [deger, min, adim, onChange, throttleKontrol]);

  const artir = useCallback(() => {
    if (!throttleKontrol()) return;
    onChange(Math.min(max, deger + adim));
  }, [deger, max, adim, onChange, throttleKontrol]);

  return (
    <View className="flex-row items-center rounded-lg overflow-hidden border" style={{ borderColor: renkler.sinir }}>
      <TouchableOpacity
        className="w-11 h-11 items-center justify-center"
        style={{ backgroundColor: deger <= min ? renkler.sinir : renk }}
        onPress={azalt}
        disabled={deger <= min}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={azaltEtiketi}
      >
        <FontAwesome5 name="minus" size={12} color="#FFF" />
      </TouchableOpacity>
      <View
        className="px-3 h-11 items-center justify-center flex-row"
        style={{ backgroundColor: renkler.kartArkaplan, minWidth: degerGenisligi }}
      >
        <Text className="text-base font-bold mr-1" style={{ color: renkler.metin }}>{deger}</Text>
        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>{birim}</Text>
      </View>
      <TouchableOpacity
        className="w-11 h-11 items-center justify-center"
        style={{ backgroundColor: deger >= max ? renkler.sinir : renk }}
        onPress={artir}
        disabled={deger >= max}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={artirEtiketi}
      >
        <FontAwesome5 name="plus" size={12} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};
