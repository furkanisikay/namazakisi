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

const ADIMLAR = [
  'Bilekliğinizin telefon uygulamasında (Galaxy Wearable, Mi Fitness, Huawei Health) bildirimler bölümünü açın ve Namaz Akışı’nı açık hâle getirin.',
  'Bu uygulamalar bildirimleri uygulama bazında seçer; yalnız namaz hatırlatmalarını ayırma imkânı genellikle yoktur.',
  'Bilekliğe yalnız namaz muhafızı hatırlatmaları gitsin istiyorsanız aşağıdaki düğmeyle bildirim kategorilerini açın; “Vakit Bildirimleri” ile adı “Sayacı” diye biten kategorileri “Sessiz” yapın; “Namaz Muhafızı” ve “Acil Namaz Hatırlatıcı” ile başlayan kategorileri olduğu gibi bırakın.',
];

const NOTLAR = [
  'Sessiz bildirimler çoğu bilekliğe aktarılmaz; bu davranış marka ve modele göre değişebilir.',
  'Başlıklar küçük ekranlara göre düzenlendi: vakit adı ve kalan süre en başta görünür (ör. “Yatsı · 25 dk kaldı”).',
  '“Kıldım” düğmesinin bileklikte görünüp görünmediği modele göre değişir.',
  'Samsung Rutinler’de “vakti girdi” ile kurduğunuz bir rutin varsa vakit bildirimlerini sessize almayın; rutin tetiklenmeyebilir.',
];

export const BileklikRehberKarti: React.FC = () => {
  const renkler = useRenkler();
  const [acik, setAcik] = React.useState(false);

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
        accessibilityLabel="Bilekliğinize yalnız namaz hatırlatmalarını gönderin"
        accessibilityHint={acik ? 'Rehberi kapatır' : 'Rehberi açar'}
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
            Bilekliğinize yalnız namaz hatırlatmalarını gönderin
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
            Galaxy Fit, Mi Band, Huawei Band gibi bileklikler için
          </Text>
        </View>
        <FontAwesome5 name={acik ? 'chevron-up' : 'chevron-down'} size={13} color={renkler.metinIkincil} />
      </TouchableOpacity>

      {acik && (
        <View className="px-4 pb-4" style={{ gap: 12 }}>
          <View style={{ gap: 10 }}>
            {ADIMLAR.map((a, i) => (
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
                  accessibilityLabel={`${i + 1}. adım: ${a}`}
                >
                  {a}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            testID="bileklik-rehberi-kategoriler"
            accessibilityRole="button"
            accessibilityLabel="Bildirim kategorilerini açın"
            onPress={() => {
              void bildirimKategorileriniAc();
            }}
            className="flex-row items-center justify-center px-4 rounded-2xl"
            style={{ minHeight: 48, backgroundColor: renkler.birincil }}
          >
            <FontAwesome5 name="sliders-h" size={14} color={renkler.birincilMetin} />
            <Text className="ml-2 text-sm font-semibold" style={{ color: renkler.birincilMetin }}>
              Bildirim kategorilerini açın
            </Text>
          </TouchableOpacity>

          <View style={{ gap: 6 }}>
            {NOTLAR.map((n) => (
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
