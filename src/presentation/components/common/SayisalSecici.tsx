import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { AYARLANABILIR_EYLEMLER, useSayisalAdim } from '../../hooks/useSayisalAdim';
import { useMetin } from '../../hooks/useMetin';
import { bicim } from '../../../core/dil/aktifDil';
import { birimAyiraci } from '../../../core/dil/sure';

/**
 * Numerik artir/azalt (kare buton) bileseni.
 * TakvimAyarlari ve MuhafizAyarlari ekranlarinda paylasilir.
 * Not: SeriHedefAyarlari'ndaki yuvarlak-butonlu varyant gorsel olarak
 * farkli oldugu icin ayri tutulmustur — davranisi (izgaraya oturan adim,
 * hizlanan basili tutma) yine `useSayisalAdim`'dan gelir.
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
  birim: birimProp,
  onChange,
  renk,
  degerGenisligi = 80,
  aciklama,
}) => {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.genel.ortak;
  const birim = birimProp ?? s.sure.kisa.dk;
  // Sayı–birim boşluğu dilin kararı (sözlük `sure.birimli`): Çincede boşluk çizilmez.
  const birimArasi = birimAyiraci();
  const azaltEtiketi = aciklama ? bicim(m.azaltAciklamali, { ad: aciklama }) : m.azalt;
  const artirEtiketi = aciklama ? bicim(m.artirAciklamali, { ad: aciklama }) : m.artir;
  const { gorunenDeger, azaltDugmesi, artirDugmesi, erisilebilirlikEylemi } = useSayisalAdim({
    deger,
    min,
    max,
    adim,
    onChange,
  });
  const altta = gorunenDeger <= min;
  const ustte = gorunenDeger >= max;

  return (
    <View className="flex-row items-center rounded-lg overflow-hidden border" style={{ borderColor: renkler.sinir }}>
      <TouchableOpacity
        className="w-11 h-11 items-center justify-center"
        style={{ backgroundColor: altta ? renkler.sinir : renk }}
        {...azaltDugmesi}
        disabled={altta}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={azaltEtiketi}
        accessibilityHint={m.basiliTut}
      >
        <FontAwesome5 name="minus" size={12} color="#FFF" />
      </TouchableOpacity>
      <View
        className="px-3 h-11 items-center justify-center flex-row"
        style={{ backgroundColor: renkler.kartArkaplan, minWidth: degerGenisligi }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={aciklama ?? m.deger}
        accessibilityValue={{ min, max, now: gorunenDeger, text: bicim(s.sure.birimli, { n: gorunenDeger, birim }).trim() }}
        accessibilityActions={AYARLANABILIR_EYLEMLER}
        onAccessibilityAction={erisilebilirlikEylemi}
      >
        <Text className={birimArasi ? 'text-base font-bold mr-1' : 'text-base font-bold'} style={{ color: renkler.metin }}>{gorunenDeger}</Text>
        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>{birim}</Text>
      </View>
      <TouchableOpacity
        className="w-11 h-11 items-center justify-center"
        style={{ backgroundColor: ustte ? renkler.sinir : renk }}
        {...artirDugmesi}
        disabled={ustte}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={artirEtiketi}
        accessibilityHint={m.basiliTut}
      >
        <FontAwesome5 name="plus" size={12} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};
