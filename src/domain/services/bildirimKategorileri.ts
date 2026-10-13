/**
 * Bildirim KATEGORİLERİ (eylem düğmeleri) — tek kayıt noktası.
 *
 * `BildirimServisi.baslatBildirimDinleyicisi` (index.ts, her JS bağlamı) ve
 * `ArkaplanMuhafizServisi.planla` (planlamadan ÖNCE, idempotent) çağırır.
 * Neden ikinci çağıran: güncelleme sonrası yeni bir kategori (ör. "Ertele" #289
 * `muhafiz_ertele1/2_category`) ancak bu fonksiyon koşunca vardır; dinleyici
 * kurulumu planlamayla YARIŞIR (dinamik import). Kategorisi kayıtlı olmayan
 * bildirim düğmesiz gösterilir — sessiz kayıp. Kayıt ucuz ve idempotenttir.
 *
 * Sıra SABİT (testler ilk çağrının muhafız kategorisi olduğuna bakar).
 * Hata fırlatır; çağıran yakalar.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { ERTELEME_EYLEMLERI, ERTELEME_KATEGORILERI } from '../../core/muhafiz/erteleme';
import { MUHASEBE_KATEGORILERI } from '../../core/yatis/yatisPlani';

export async function bildirimKategorileriniKaydet(): Promise<void> {
  // Muhafiz kategorisi - "Kildim" aksiyonu ile
  await Notifications.setNotificationCategoryAsync(BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ, [
    {
      identifier: BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM,
      buttonTitle: '✅ Kıldım',
      options: {
        // ANDROID: false → "Kıldım" telefonu açmaz. Bu, saate köprülenen
        // bildirimde özellikle önemli: saatten basınca cepteki telefonda uygulama
        // öne çıkıyordu. Uygulama kapalıyken yanıt arka plan görevine
        // (`index.ts > MUHAFIZ_YANIT_GOREVI` → `arkaplanYanitiniIsle`) düşer.
        // iOS: bildirim yanıtı için arka plan görevi YOKTUR → açık kalır.
        opensAppToForeground: Platform.OS === 'ios',
      },
    },
  ]);

  // "Ertele" (issue #289): düğme kümesi sınıra kalan süreden seçilir
  // (`core/muhafiz/erteleme.ts > ertelemeKategorisi`). Uygulamayı AÇMAZ:
  // Android'de native işlenir (`BildirimErteleIsleyici`); iOS'ta yanıt
  // işleyicisi arka planda çalışırsa kurulur (cihazda doğrulanmadı).
  const kildim = {
    identifier: BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM,
    buttonTitle: '✅ Kıldım',
    options: { opensAppToForeground: Platform.OS === 'ios' },
  };
  const ertele = (dk: 10 | 20) => ({
    identifier: ERTELEME_EYLEMLERI[dk],
    buttonTitle: `${dk} dk ertele`,
    options: { opensAppToForeground: false },
  });
  await Notifications.setNotificationCategoryAsync(ERTELEME_KATEGORILERI.TEK, [kildim, ertele(10)]);
  await Notifications.setNotificationCategoryAsync(ERTELEME_KATEGORILERI.IKI, [kildim, ertele(10), ertele(20)]);

  // Gün sonu muhasebesi (issue #290).
  await Notifications.setNotificationCategoryAsync(MUHASEBE_KATEGORILERI.TEK, [
    kildim,
    {
      identifier: BILDIRIM_SABITLERI.AKSIYONLAR.KAZAYA_EKLE,
      buttonTitle: 'Kazaya ekle',
      // iOS'ta arka planda JS çalışması güvenilir değil → uygulama açılır ki
      // borç sessizce kaybolmasın. Android'de headless görev işler.
      options: { opensAppToForeground: Platform.OS === 'ios' },
    },
  ]);
  await Notifications.setNotificationCategoryAsync(MUHASEBE_KATEGORILERI.COKLU, [
    {
      identifier: BILDIRIM_SABITLERI.AKSIYONLAR.INCELE,
      buttonTitle: 'İnceleyin',
      options: { opensAppToForeground: true },
    },
  ]);
}
