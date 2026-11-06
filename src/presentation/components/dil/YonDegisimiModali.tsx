/**
 * Yazı yönü değişimi sorusu (sahip kararı 2026-10-26): dil değişimi yazı yönünü değiştirdiyse
 * "Şimdi yeniden başlatın" → uygulama hemen yeniden başlar; "Sonra" → yönün uygulama yeniden
 * başlatıldığında değişeceği kısa bildirimle söylenir (Dil sayfasında kalıcı satır da durur).
 * Yeniden başlatılamazsa ertelenmiş gibi davranılır.
 *
 * Kökte (`App.tsx`) bir kez çizilir. Kendisi bir `<Modal>` olan kurulum sihirbazı dil penceresi
 * soruyu kendi içinde `YonDegisimiIcerik` olarak çizer (iOS kardeş modal kuralı,
 * `yonSorusuKapisi`).
 */
import * as React from 'react';
import { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useMetin } from '../../hooks/useMetin';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { yonDegisimiAyarla, type YonDegisimi } from '../../store/dilSlice';
import { YonServisi } from '../../../domain/services/YonServisi';
import { kisaBildirimGoster } from '../common/KisaBildirim';
import { useYonSorusuBekletiliyor, useYonSorusuYerelde } from './yonSorusuKapisi';

/** Store'da dil slice'ı olmayan (paylaşılan bileşen testleri) ağaçta da çalışır: 'yok'. */
export function useYonDegisimi(): YonDegisimi {
  return useAppSelector((s) => (s as { dil?: { yonDegisimi?: YonDegisimi } }).dil?.yonDegisimi ?? 'yok');
}

/** İki düğmenin eylemi (kökteki modal ve sihirbazdaki kart aynı yolu kullanır). */
export function useYonDegisimiEylemleri(): { simdi: () => void; ertele: () => void; basliyor: boolean } {
  const dispatch = useAppDispatch();
  const m = useMetin().yon;
  const [basliyor, setBasliyor] = useState(false);

  const ertele = useCallback(() => {
    dispatch(yonDegisimiAyarla('ertelendi'));
    kisaBildirimGoster(m.bekliyor, true);
  }, [dispatch, m]);

  const simdi = useCallback(() => {
    if (basliyor) return;
    setBasliyor(true);
    void YonServisi.yenidenBaslat().then((ok) => {
      // Başarılıysa JS yeniden yüklenir; buraya yalnız başlatılamazsa gelinir.
      if (ok) return;
      setBasliyor(false);
      ertele();
    });
  }, [basliyor, ertele]);

  return { simdi, ertele, basliyor };
}

export interface YonDegisimiIcerikProps {
  simdi: () => void;
  ertele: () => void;
  basliyor: boolean;
}

/** Başlık + açıklama + iki düğme (çerçevesiz; çerçeveyi modal ya da sihirbaz verir). */
export const YonDegisimiIcerik: React.FC<YonDegisimiIcerikProps> = ({ simdi, ertele, basliyor }) => {
  const renkler = useRenkler();
  const m = useMetin().yon;
  return (
    <View testID="yon-degisimi">
      <View className="flex-row items-center mb-3">
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: renkler.birincil + '20' }}
        >
          <FontAwesome5 name="exchange-alt" size={18} color={renkler.birincil} />
        </View>
        <Text className="flex-1 text-base font-bold" style={{ color: renkler.metin }} accessibilityRole="header">
          {m.baslik}
        </Text>
      </View>

      <Text className="text-sm leading-5 mb-5" style={{ color: renkler.metinIkincil }}>
        {m.aciklama}
      </Text>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 items-center justify-center py-3.5 rounded-2xl"
          style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 44 }}
          onPress={ertele}
          disabled={basliyor}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={m.sonra}
          accessibilityState={{ disabled: basliyor }}
          testID="yon-sonra"
        >
          <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
            {m.sonra}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-[1.6] flex-row items-center justify-center py-3.5 px-3 rounded-2xl"
          style={{ backgroundColor: renkler.birincil, minHeight: 44, opacity: basliyor ? 0.6 : 1 }}
          onPress={simdi}
          disabled={basliyor}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={m.simdiBaslat}
          accessibilityState={{ disabled: basliyor, busy: basliyor }}
          testID="yon-simdi"
        >
          <FontAwesome5 name="redo" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
          <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
            {m.simdiBaslat}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/** Kökteki soru modalı (App.tsx). */
export const YonDegisimiModali: React.FC = () => {
  const renkler = useRenkler();
  const durum = useYonDegisimi();
  const bekletiliyor = useYonSorusuBekletiliyor();
  const yerelde = useYonSorusuYerelde();
  const { simdi, ertele, basliyor } = useYonDegisimiEylemleri();
  const gorunur = durum === 'soruluyor' && !bekletiliyor && !yerelde;

  // Geri tuşu ve arka plana dokunma "Sonra" sayılır (yeniden başlatma sürerken yok sayılır).
  const kapat = useCallback(() => {
    if (!basliyor) ertele();
  }, [basliyor, ertele]);
  useDonanimGeriTusu(gorunur, kapat);

  return (
    <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={kapat}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Backdrop — absolute sibling (içeriği sarmaz) */}
        <TouchableWithoutFeedback onPress={kapat}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        </TouchableWithoutFeedback>
        <View
          style={{
            width: '88%',
            maxWidth: 420,
            backgroundColor: renkler.kartArkaplan,
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: renkler.sinir,
          }}
        >
          <YonDegisimiIcerik simdi={simdi} ertele={ertele} basliyor={basliyor} />
        </View>
      </View>
    </Modal>
  );
};
