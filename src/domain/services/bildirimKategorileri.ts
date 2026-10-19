/**
 * Bildirim KATEGORİLERİ (eylem düğmeleri) — tek kayıt noktası.
 *
 * `BildirimServisi.baslatBildirimDinleyicisi` (index.ts, her JS bağlamı) ve
 * `ArkaplanMuhafizServisi.planla` (planlamadan ÖNCE, idempotent) çağırır.
 * Neden ikinci çağıran: güncelleme sonrası yeni ya da değişen bir kategori ancak bu
 * fonksiyon koşunca vardır; dinleyici kurulumu planlamayla YARIŞIR (dinamik import). Kategorisi kayıtlı olmayan
 * bildirim düğmesiz gösterilir — sessiz kayıp. Kayıt ucuz ve idempotenttir.
 *
 * Sıra SABİT (testler ilk çağrının muhafız kategorisi olduğuna bakar).
 * Hata fırlatır; çağıran yakalar.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { MUHASEBE_KATEGORILERI } from '../../core/yatis/yatisPlani';

/** Kaldırılan "Ertele"nin (#289) kategori kimlikleri — yalnız göç için. */
const ESKI_ERTELE_KATEGORILERI = ['muhafiz_ertele1_category', 'muhafiz_ertele2_category'] as const;

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

  const kildim = {
    identifier: BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM,
    buttonTitle: '✅ Kıldım',
    options: { opensAppToForeground: Platform.OS === 'ios' },
  };

  // ERTELE YOK (sahip kararı 2026-10-19, eski #289): güncelleme ÖNCESİ planlanmış
  // bildirimler hâlâ eski ertele kategorilerini taşıyabilir. Kategori gösterim anında
  // çözüldüğü için o kimlikler YALNIZ "Kıldım" ile yeniden tanımlanır → bir sonraki
  // planlama turuna kadar düşen eski bildirim de ertele düğmesi göstermez.
  for (const eskiKategori of ESKI_ERTELE_KATEGORILERI) {
    await Notifications.setNotificationCategoryAsync(eskiKategori, [kildim]);
  }

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

let kayitli = false;

/**
 * Süreç başına bir kez, idempotent kayıt — planlama yapan servisler bildirimi
 * kurmadan ÖNCE çağırır (kategori kayıtsızsa bildirim düğmesiz çıkar). Hata
 * yutulur ve bir sonraki çağrıda yeniden denenir.
 */
export async function bildirimKategorileriniGarantile(): Promise<void> {
  if (kayitli) return;
  try {
    await bildirimKategorileriniKaydet();
    kayitli = true;
  } catch {
    // Bir sonraki planlamada yeniden denenir.
  }
}
