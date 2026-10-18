import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { useAppSelector } from '../../store/hooks';
import { useSeferilik } from '../../hooks/useSeferilik';
import { seferilikDurumunuHesapla } from '../../../core/seferilik/seferilikKarari';
import { seferilikKartMetniOlustur } from '../../../core/seferilik/seferilikMetni';
import { kisaBildirimGoster } from '../common/KisaBildirim';

/**
 * Konum store'da değişince diskteki konumun yazılmasını bekleme payı (ms):
 * konum thunk'ları önce store'u, sonra diski günceller; kart diski okur.
 */
const KONUM_ISLEME_GECIKMESI_MS = 1500;

/**
 * Seferîlik bilgi kartı (issue #296) — ana ekran.
 *
 * HÜKÜM VERMEZ: ikamet yerinden ≈90 km uzaklaşınca Diyanet fetvalarını mezhebe
 * göre özetler ve kaynağa yönlendirir. Yolculuk başına bir kez görünür (kapatma
 * hafızası ikamete dönülünce sıfırlanır). Bildirim göndermez.
 *
 * Prop almaz ve `React.memo`'ludur: ana ekran saniyede bir çizilir, kart yalnız
 * kendi dilimi ya da konum değişince yeniden çizilir. Seferîlik dilimi store'da
 * yoksa (eski test mock'ları) hiçbir şey çizmez.
 */
function useSeferilikSonucu(durum: ReturnType<typeof useSeferilik>['durum']) {
  const ayarlar = durum?.ayarlar;
  const hafiza = durum?.hafiza;
  const sonKonum = durum?.sonKonum;
  return useMemo(
    () => (ayarlar && hafiza ? seferilikDurumunuHesapla({ ayarlar, hafiza, konum: sonKonum }) : null),
    [ayarlar, hafiza, sonKonum],
  );
}

/**
 * Kart bu an gösterilmeli mi? + DİSKTEKİ KONUMU İŞLER (açılış + konum değişimi:
 * ilk ikamet, eve dönüşte kapatma hafızasının sıfırlanması).
 *
 * Ana ekranın tek durum alanı (Dalga 2) kartı yalnız "kazanan" uyarıyken çizer; bu
 * yüzden işleme kartın İÇİNDE değil, AnaSayfa'da koşulsuz çalışan bu kancadadır —
 * kart çizilmezken de ikamet/eve dönüş işlenmeye devam eder.
 */
export function useSeferilikKartiGorunur(): boolean {
  const { durum, konumuIsle } = useSeferilik();
  const lat = useAppSelector((s) => (s as { konum?: { koordinatlar?: { lat?: number } } }).konum?.koordinatlar?.lat);
  const lng = useAppSelector((s) => (s as { konum?: { koordinatlar?: { lng?: number } } }).konum?.koordinatlar?.lng);
  const dilimVar = durum !== null;

  useEffect(() => {
    if (!dilimVar) return undefined;
    const zamanlayici = setTimeout(konumuIsle, KONUM_ISLEME_GECIKMESI_MS);
    return () => clearTimeout(zamanlayici);
  }, [dilimVar, konumuIsle, lat, lng]);

  const sonuc = useSeferilikSonucu(durum);
  return !!durum?.ayarlar && !!sonuc?.kartGoster && sonuc.mesafeKm !== null;
}

function SeferilikBilgiKartiIc() {
  const renkler = useRenkler();
  const { durum, kartiKapat, buradaIkametEt } = useSeferilik();
  const ayarlar = durum?.ayarlar;
  const sonuc = useSeferilikSonucu(durum);

  if (!ayarlar || !sonuc?.kartGoster || sonuc.mesafeKm === null) return null;
  const metin = seferilikKartMetniOlustur(ayarlar.mezhep, sonuc.mesafeKm);

  const kaynagiAc = () => {
    Linking.openURL(metin.kaynak.url).catch(() => {
      kisaBildirimGoster('Bağlantı açılamadı. İnternet bağlantınızı kontrol edin.');
    });
  };
  const evimYap = async () => {
    const tamam = await buradaIkametEt();
    kisaBildirimGoster(tamam ? 'İkamet yeriniz güncellendi' : 'İkamet yeriniz kaydedilemedi');
  };

  return (
    <View
      className="mb-4 p-4 rounded-2xl border"
      style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
      testID="seferilik-bilgi-karti"
    >
      <View className="flex-row items-start">
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: `${renkler.birincil}20` }}
          importantForAccessibility="no-hide-descendants"
        >
          <FontAwesome5 name="route" size={18} color={renkler.birincil} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold" style={{ color: renkler.metin }} accessibilityRole="header">
            {metin.baslik}
          </Text>
          <Text className="text-xs mt-1 leading-5" style={{ color: renkler.metin }}>
            {metin.mesafeSatiri}
          </Text>
        </View>
        <TouchableOpacity
          onPress={kartiKapat}
          accessibilityRole="button"
          accessibilityLabel="Yolculuk bilgi kartını kapatın"
          className="w-11 h-11 items-center justify-center"
          style={{ marginRight: -10, marginTop: -10 }}
        >
          <FontAwesome5 name="times" size={14} color={renkler.metinIkincil} />
        </TouchableOpacity>
      </View>

      <View className="mt-3">
        {metin.maddeler.map((madde) => (
          <View key={madde} className="flex-row mb-2">
            <Text className="text-xs leading-5 mr-2" style={{ color: renkler.birincil }}>•</Text>
            <Text className="flex-1 text-xs leading-5" style={{ color: renkler.metin }}>
              {madde}
            </Text>
          </View>
        ))}
      </View>

      <Text className="text-xs leading-5 italic" style={{ color: renkler.metinIkincil }}>
        {metin.not}
      </Text>

      <View className="flex-row mt-3" style={{ gap: 8 }}>
        <TouchableOpacity
          onPress={evimYap}
          accessibilityRole="button"
          accessibilityLabel="Burası evim, ikamet yerim olarak kaydedin"
          className="flex-1 flex-row items-center justify-center rounded-xl border"
          style={{ minHeight: 44, backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
        >
          <FontAwesome5 name="home" size={13} color={renkler.metin} style={{ marginRight: 6 }} />
          <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>Burası evim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={kaynagiAc}
          accessibilityRole="link"
          accessibilityLabel="Diyanet fetvasını tarayıcıda okuyun"
          className="flex-row items-center justify-center rounded-xl px-4"
          style={{ minHeight: 44, flexGrow: 1.3, flexBasis: 0, backgroundColor: renkler.birincil }}
        >
          <FontAwesome5 name="external-link-alt" size={12} color={renkler.birincilMetin} style={{ marginRight: 6 }} />
          <Text className="text-sm font-semibold" style={{ color: renkler.birincilMetin }}>Diyanet'te okuyun</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const SeferilikBilgiKarti = React.memo(SeferilikBilgiKartiIc);
