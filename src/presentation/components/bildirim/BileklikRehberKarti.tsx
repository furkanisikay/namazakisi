/**
 * "Bilekliğinize yalnız namaz hatırlatmalarını gönderin" rehberi (issue #287) —
 * yalnız Android.
 *
 * Galaxy Fit, Mi Band, Huawei Band üçüncü taraf uygulama çalıştırmaz; telefon
 * bildirimlerini AYNALAR. Galaxy Wearable / Mi Fitness / Huawei Health bildirim
 * seçimini UYGULAMA bazında yapar, kanal (kategori) bazında süzme genelde yoktur →
 * rehber dürüst: uygulamayı açın + istemediğiniz kategorileri Android ayarlarında
 * "Sessiz" yapın (sessiz bildirimlerin ÇOĞU banda aynalanmaz — her model için
 * doğrulanmadı, metin bunu söyler).
 *
 * Kategori ekranı `Linking.sendIntent` ile açılır (RN çekirdeği, ek native köprü
 * yok); açılamazsa uygulama ayrıntılarına (`Linking.openSettings`) düşülür.
 * Akordiyon kapalı başlar: sayfa sakin kalsın, ilgilenen açsın.
 */
import * as React from 'react';
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useCihazDurumu } from '../../hooks/useCihazDurumu';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { vakitGirdiEki } from '../../../core/otomasyon/anahtarKelimeler';

/** Uygulama kimliği (shortcuts.xml `targetPackage` gibi sabittir). */
const ANDROID_PAKET_ADI = 'com.furkanisikay.namazakisi';

/**
 * Uygulamanın bildirim kategorileri ekranını açar. API 26+ `APP_PACKAGE` ekini,
 * 24–25 eski `app_package` ekini okur; ikisi birlikte verilir. Başarısızsa
 * uygulama ayrıntıları açılır (oradan "Bildirimler"e bir dokunuş).
 */
export async function bildirimKategorileriniAc(): Promise<void> {
  try {
    await Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
      { key: 'android.provider.extra.APP_PACKAGE', value: ANDROID_PAKET_ADI },
      { key: 'app_package', value: ANDROID_PAKET_ADI },
    ]);
  } catch {
    await Linking.openSettings().catch(() => undefined);
  }
}


const CIHAZ_ALANLARI = ['samsung'] as const;

export const BileklikRehberKarti: React.FC = () => {
  const renkler = useRenkler();
  const sozluk = useMetin();
  const mb = sozluk.hatirlatma.bileklik;
  const [acik, setAcik] = React.useState(false);
  // Samsung DEĞİL ise Rutinler maddesi çıkar; bilinmiyorsa (null) kalır.
  const { durum: cihaz } = useCihazDurumu(CIHAZ_ALANLARI, Platform.OS === 'android' && acik);
  // Kategori adları bildirim kanallarının GÖRÜNEN adlarıdır (etkin dilde).
  const k = sozluk.bildirim.kanal;
  const adimlar = mb.adimlar.map((a) => bicim(a, { vakit: k.vakit, muhafiz: k.muhafiz, acil: k.acil }));
  // Samsung yalnız Rutinler'de anlamlı; anahtar kelime dile göre değişir.
  const samsungNotu = bicim(mb.samsungNotu, { kelime: vakitGirdiEki() });
  const notlar: string[] = cihaz.samsung === false ? [...mb.notlar] : [...mb.notlar, samsungNotu];

  if (Platform.OS !== 'android') return null;

  return (
    <View
      testID="bileklik-rehberi"
      className="mb-6 overflow-hidden"
      style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: renkler.sinir }}
    >
      <TouchableOpacity
        testID="bileklik-rehberi-baslik"
        accessibilityRole="button"
        accessibilityState={{ expanded: acik }}
        accessibilityLabel={mb.baslik}
        accessibilityHint={acik ? mb.kapatir : mb.acar}
        onPress={() => setAcik((a) => !a)}
        className="flex-row items-center p-4"
        style={{ minHeight: 44 }}
      >
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: renkler.birincil + '20' }}
        >
          <FontAwesome5 name="clock" size={17} color={renkler.birincil} solid />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold" style={{ color: renkler.metin }}>
            {mb.baslik}
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
            {mb.altBaslik}
          </Text>
        </View>
        <FontAwesome5 name={acik ? 'chevron-up' : 'chevron-down'} size={13} color={renkler.metinIkincil} />
      </TouchableOpacity>

      {acik && (
        <View className="px-4 pb-4" style={{ gap: 12 }}>
          <View style={{ gap: 10 }}>
            {adimlar.map((a, i) => (
              <View key={a} className="flex-row">
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                  style={{ backgroundColor: renkler.birincil }}
                  importantForAccessibility="no-hide-descendants"
                >
                  <Text className="text-xs font-bold" style={{ color: renkler.birincilMetin }}>
                    {i + 1}
                  </Text>
                </View>
                <Text
                  className="flex-1 text-sm"
                  style={{ color: renkler.metin }}
                  accessibilityLabel={bicim(mb.adimEtiketi, { n: i + 1, metin: a })}
                >
                  {a}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            testID="bileklik-rehberi-kategoriler"
            accessibilityRole="button"
            accessibilityLabel={mb.kategoriler}
            onPress={() => {
              void bildirimKategorileriniAc();
            }}
            className="flex-row items-center justify-center px-4 rounded-2xl"
            style={{ minHeight: 48, backgroundColor: renkler.birincil }}
          >
            <FontAwesome5 name="sliders-h" size={14} color={renkler.birincilMetin} />
            <Text className="ml-2 text-sm font-semibold" style={{ color: renkler.birincilMetin }}>
              {mb.kategoriler}
            </Text>
          </TouchableOpacity>

          <View style={{ gap: 6 }}>
            {notlar.map((n) => (
              <Text key={n} className="text-xs" style={{ color: renkler.metinIkincil }}>
                {'• '}
                {n}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
